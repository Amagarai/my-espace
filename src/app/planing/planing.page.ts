import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  chevronBack,
  chevronForward,
  calendarOutline,
  bookOutline,
  personOutline
} from 'ionicons/icons';
import { StudentService } from '../services/student.service';

interface Course {
  id?: string;
  localId?: string;
  subject?: string;
  matiereName?: string;
  day?: string;
  jour?: string;
  startTime?: string;
  heureDebut?: string;
  endTime?: string;
  heureFin?: string;
  duration?: string;
  room?: string;
  salleName?: string;
  icon?: string;
  color?: string;
  profNom?: string;
  profPrenom?: string;
}

interface DayShort {
  name: string;
  shortName: string;
  date: Date;
}

@Component({
  selector: 'app-planing',
  templateUrl: './planing.page.html',
  styleUrls: ['./planing.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, CommonModule, FormsModule]
})
export class PlaningPage implements OnInit {
  today: Date = new Date();
  selectedDate: Date = new Date();
  selectedDay: string = 'Lundi';
  weekDaysShort: DayShort[] = [];

  courses: Course[] = [];
  allCourses: Course[] = [];
  isLoadingCourses: boolean = false;
  studentLocalId: string = '';

  constructor(private studentService: StudentService) {
    addIcons({chevronBack,chevronForward,calendarOutline,bookOutline,personOutline});
  }

  ngOnInit() {
    // Récupérer l'ID de l'étudiant depuis localStorage
    const studentDetailStr = localStorage.getItem('studentDetail');
    if (studentDetailStr) {
      try {
        const studentDetail = JSON.parse(studentDetailStr);
        if (studentDetail.isLoggedIn && studentDetail.localId) {
          this.studentLocalId = studentDetail.localId;
          this.loadCourses();
        }
      } catch (error) {
        console.error('Erreur lors de la lecture des données de session:', error);
      }
    }

    this.initializeWeekDays();
    this.selectToday();
  }

  initializeWeekDays() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Lundi = 1, Dimanche = 0
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);

    const daysFull = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    const daysShort = ['Lun', 'Mardi', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

    this.weekDaysShort = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      this.weekDaysShort.push({
        name: daysFull[i],
        shortName: daysShort[i],
        date: date
      });
    }
  }

  selectToday() {
    const todayName = this.getTodayName();
    this.selectedDay = todayName;
    this.selectedDate = new Date();
    this.updateCoursesForSelectedDay();
  }

  getTodayName(): string {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    return days[this.today.getDay()];
  }

  getCurrentDayName(): string {
    return this.selectedDay;
  }

  previousDay() {
    const currentIndex = this.weekDaysShort.findIndex(day => day.name === this.selectedDay);
    if (currentIndex > 0) {
      const previousDay = this.weekDaysShort[currentIndex - 1];
      this.selectedDay = previousDay.name;
      this.selectedDate = previousDay.date;
    } else {
      // Aller à la semaine précédente
      this.shiftWeekDays(-7);
      this.selectedDay = this.weekDaysShort[this.weekDaysShort.length - 1].name;
      this.selectedDate = this.weekDaysShort[this.weekDaysShort.length - 1].date;
    }
    this.updateCoursesForSelectedDay();
  }

  nextDay() {
    const currentIndex = this.weekDaysShort.findIndex(day => day.name === this.selectedDay);
    if (currentIndex < this.weekDaysShort.length - 1) {
      const nextDay = this.weekDaysShort[currentIndex + 1];
      this.selectedDay = nextDay.name;
      this.selectedDate = nextDay.date;
    } else {
      // Aller à la semaine suivante
      this.shiftWeekDays(7);
      this.selectedDay = this.weekDaysShort[0].name;
      this.selectedDate = this.weekDaysShort[0].date;
    }
    this.updateCoursesForSelectedDay();
  }

  shiftWeekDays(days: number) {
    this.weekDaysShort = this.weekDaysShort.map(day => {
      const newDate = new Date(day.date);
      newDate.setDate(newDate.getDate() + days);
      return {
        ...day,
        date: newDate
      };
    });
  }

  goToToday() {
    this.initializeWeekDays();
    this.selectToday();
  }

  selectDay(dayName: string) {
    const day = this.weekDaysShort.find(d => d.name === dayName);
    if (day) {
      this.selectedDay = dayName;
      this.selectedDate = day.date;
      this.updateCoursesForSelectedDay();
    }
  }

  loadCourses() {
    if (!this.studentLocalId) return;

    this.isLoadingCourses = true;
    this.studentService.getProgrammes(this.studentLocalId).subscribe({
      next: (data) => {
        // Convertir les programmes du backend en format Course
        this.allCourses = (data || []).map((programme: any) => ({
          localId: programme.localId,
          matiereName: programme.matiereName,
          jour: programme.jour,
          heureDebut: programme.heureDebut,
          heureFin: programme.heureFin,
          salleName: programme.salleName,
          profNom: programme.profNom,
          profPrenom: programme.profPrenom,
          day: this.convertJourToDayName(programme.jour)
        }));

        this.updateCoursesForSelectedDay();
        this.isLoadingCourses = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des cours:', error);
        this.isLoadingCourses = false;
        // Utiliser les cours de test en cas d'erreur
        this.allCourses = this.getTestCourses();
        this.updateCoursesForSelectedDay();
      }
    });
  }

  updateCoursesForSelectedDay() {
    this.courses = this.getCoursesForSelectedDay();
  }

  getCoursesForSelectedDay(): Course[] {
    return this.allCourses
      .filter(course => {
        const courseDay = course.day || course.jour;
        return courseDay === this.selectedDay;
      })
      .sort((a, b) => {
        const timeA = a.heureDebut || a.startTime || '00:00';
        const timeB = b.heureDebut || b.startTime || '00:00';
        return timeA.localeCompare(timeB);
      });
  }

  convertJourToDayName(jour: string): string {
    const mapping: { [key: string]: string } = {
      'Lundi': 'Lundi',
      'Mardi': 'Mardi',
      'Mercredi': 'Mercredi',
      'Jeudi': 'Jeudi',
      'Vendredi': 'Vendredi',
      'Samedi': 'Samedi',
      'Dimanche': 'Dimanche'
    };
    return mapping[jour] || jour;
  }

  getProfName(course: Course): string {
    if (course.profNom && course.profPrenom) {
      return `${course.profPrenom} ${course.profNom}`;
    }
    if (course.profNom) {
      return course.profNom;
    }
    return 'Professeur';
  }

  getTestCourses(): Course[] {
    return [
      {
        id: '1',
        subject: 'Mathématiques',
        day: 'Lundi',
        startTime: '07:30',
        endTime: '09:30',
        room: 'Salle 3',
        profNom: 'Traore',
        profPrenom: 'Isac'
      },
      {
        id: '2',
        subject: 'Biologie',
        day: 'Lundi',
        startTime: '09:00',
        endTime: '11:00',
        room: 'Salle A204'
      },
      {
        id: '3',
        subject: 'Chimie',
        day: 'Mardi',
        startTime: '10:00',
        endTime: '12:00',
        room: 'Salle A205'
      },
      {
        id: '4',
        subject: 'Géographie',
        day: 'Mercredi',
        startTime: '09:00',
        endTime: '10:30',
        room: 'Salle C301'
      },
      {
        id: '5',
        subject: 'Mathématiques',
        day: 'Jeudi',
        startTime: '14:00',
        endTime: '16:00',
        room: 'Salle B101'
      },
      {
        id: '6',
        subject: 'Biologie',
        day: 'Vendredi',
        startTime: '10:00',
        endTime: '11:30',
        room: 'Salle A204'
      }
    ];
  }
}
