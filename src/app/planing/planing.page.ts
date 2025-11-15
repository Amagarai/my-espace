import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  chevronBack,
  chevronForward,
  flask,
  calculator,
  globe,
  book,
  school,
  time
} from 'ionicons/icons';

interface Course {
  id: string;
  subject: string;
  day: string;
  startTime: string;
  endTime: string;
  duration: string;
  room: string;
  icon: string;
  color: string;
}

interface Day {
  name: string;
  date: Date;
}

@Component({
  selector: 'app-planing',
  templateUrl: './planing.page.html',
  styleUrls: ['./planing.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, CommonModule, FormsModule, DatePipe]
})
export class PlaningPage implements OnInit {
  today: Date = new Date();
  currentWeekStart: Date = new Date();
  currentWeekEnd: Date = new Date();

  weekDays: Day[] = [];

  courses: Course[] = [
    {
      id: '1',
      subject: 'Biologie',
      day: 'Lundi',
      startTime: '09:00',
      endTime: '11:00',
      duration: '2h',
      room: 'Salle A204',
      icon: 'flask',
      color: '#96a896'
    },
    {
      id: '2',
      subject: 'Mathématiques',
      day: 'Lundi',
      startTime: '14:00',
      endTime: '15:30',
      duration: '1h30',
      room: 'Salle B101',
      icon: 'calculator',
      color: '#d4a574'
    },
    {
      id: '3',
      subject: 'Chimie',
      day: 'Mardi',
      startTime: '10:00',
      endTime: '12:00',
      duration: '2h',
      room: 'Salle A205',
      icon: 'flask',
      color: '#96a896'
    },
    {
      id: '4',
      subject: 'Géographie',
      day: 'Mercredi',
      startTime: '09:00',
      endTime: '10:30',
      duration: '1h30',
      room: 'Salle C301',
      icon: 'globe',
      color: '#d4a574'
    },
    {
      id: '5',
      subject: 'Mathématiques',
      day: 'Jeudi',
      startTime: '14:00',
      endTime: '16:00',
      duration: '2h',
      room: 'Salle B101',
      icon: 'calculator',
      color: '#d4a574'
    },
    {
      id: '6',
      subject: 'Biologie',
      day: 'Vendredi',
      startTime: '10:00',
      endTime: '11:30',
      duration: '1h30',
      room: 'Salle A204',
      icon: 'flask',
      color: '#96a896'
    }
  ];

  constructor() {
    addIcons({
      'chevron-back': chevronBack,
      'chevron-forward': chevronForward,
      'flask': flask,
      'calculator': calculator,
      'globe': globe,
      'book': book,
      'school': school,
      'time': time
    });
  }

  ngOnInit() {
    this.initializeWeek();
  }

  initializeWeek() {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Lundi
    this.currentWeekStart = new Date(today.setDate(diff));
    this.currentWeekEnd = new Date(this.currentWeekStart);
    this.currentWeekEnd.setDate(this.currentWeekEnd.getDate() + 6);
    this.updateWeekDays();
  }

  updateWeekDays() {
    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    this.weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(this.currentWeekStart);
      date.setDate(date.getDate() + i);
      this.weekDays.push({
        name: days[i],
        date: date
      });
    }
  }

  previousWeek() {
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() - 7);
    this.currentWeekEnd.setDate(this.currentWeekEnd.getDate() - 7);
    this.updateWeekDays();
  }

  nextWeek() {
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() + 7);
    this.currentWeekEnd.setDate(this.currentWeekEnd.getDate() + 7);
    this.updateWeekDays();
  }

  get todayCourses(): Course[] {
    const todayName = this.getTodayName();
    return this.courses
      .filter(course => course.day === todayName)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  getTodayName(): string {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    return days[this.today.getDay()];
  }

  getCoursesForDay(dayName: string): Course[] {
    return this.courses
      .filter(course => course.day === dayName)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }
}
