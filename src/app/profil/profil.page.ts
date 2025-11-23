import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  camera,
  checkmarkCircle,
  school,
  book,
  calendar,
  mail,
  call,
  location,
  calendarOutline,
  star,
  documentText,
  notificationsOutline,
  lockClosedOutline,
  languageOutline,
  helpCircleOutline,
  logOutOutline,
  createOutline,
  chevronForward
} from 'ionicons/icons';
import { StudentService, StudentProfileDTO } from '../services/student.service';

interface Student {
  firstName: string;
  lastName: string;
  studentId: string;
  level: string;
  major: string;
  academicYear: string;
  email: string;
  phone: string;
  address: string;
  birthDate: string;
}

@Component({
  selector: 'app-profil',
  templateUrl: './profil.page.html',
  styleUrls: ['./profil.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, CommonModule, FormsModule]
})
export class ProfilPage implements OnInit {
  student: Student = {
    firstName: '',
    lastName: '',
    studentId: '',
    level: '',
    major: '',
    academicYear: '',
    email: '',
    phone: '',
    address: '',
    birthDate: ''
  };

  studentLocalId: string = '';
  studentInitials: string = '';
  isLoadingProfile: boolean = false;
  moyenneGenerale: number = 0;
  nombreCours: number = 0;
  nombreNotes: number = 0;

  constructor(private studentService: StudentService) {
    addIcons({camera,checkmarkCircle,school,book,calendar,createOutline,mail,call,location,calendarOutline,star,documentText,notificationsOutline,chevronForward,lockClosedOutline,languageOutline,helpCircleOutline,logOutOutline});
  }

  ngOnInit() {
    this.loadStudentProfile();
  }

  loadStudentProfile() {
    // Récupérer l'ID de l'étudiant depuis localStorage
    const studentDetailStr = localStorage.getItem('studentDetail');
    if (!studentDetailStr) {
      console.error('Aucune donnée de session trouvée');
      return;
    }

    try {
      const studentDetail = JSON.parse(studentDetailStr);
      if (studentDetail.isLoggedIn && studentDetail.localId) {
        this.studentLocalId = studentDetail.localId;

        // Remplir les informations de base depuis localStorage
        this.student.firstName = studentDetail.prenom || '';
        this.student.lastName = studentDetail.nom || '';
        this.student.email = studentDetail.email || '';
        this.student.studentId = studentDetail.username || studentDetail.localId || '';
        this.studentInitials = this.getInitials(studentDetail.prenom || '', studentDetail.nom || '');

        // Charger les données complètes depuis le backend
        this.loadFullStudentData();
      }
    } catch (error) {
      console.error('Erreur lors de la lecture des données de session:', error);
    }
  }

  loadFullStudentData() {
    if (!this.studentLocalId) return;

    this.isLoadingProfile = true;

    // Charger les informations complètes du profil
    this.studentService.getStudentProfile(this.studentLocalId).subscribe({
      next: (profileData) => {
        // Mettre à jour les informations de l'étudiant
        this.student.firstName = profileData.prenom || '';
        this.student.lastName = profileData.nom || '';
        this.student.email = profileData.email || '';
        this.student.studentId = profileData.idNum || profileData.username || '';
        this.student.phone = profileData.numero || '';
        this.student.level = profileData.niveau || '';
        this.student.major = profileData.filiere || '';
        this.student.academicYear = profileData.anneeAcademique || '';

        // Formater la date de naissance
        if (profileData.dateOfBirth) {
          this.student.birthDate = this.formatDate(profileData.dateOfBirth);
        }

        // Mettre à jour les initiales
        this.studentInitials = this.getInitials(profileData.prenom || '', profileData.nom || '');

        this.isLoadingProfile = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du profil:', error);
        this.isLoadingProfile = false;
      }
    });

    // Charger les données du dashboard pour avoir les statistiques
    this.studentService.getDashboardData(this.studentLocalId).subscribe({
      next: (dashboardData) => {
        this.moyenneGenerale = dashboardData.moyenneGenerale || 0;
        this.nombreCours = dashboardData.nombreCoursAujourdHui || 0;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des données du dashboard:', error);
      }
    });

    // Charger le nombre total de notes
    this.studentService.getRecentNotes(this.studentLocalId).subscribe({
      next: (notes) => {
        this.nombreNotes = notes ? notes.length : 0;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des notes:', error);
      }
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate();
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  }

  getInitials(prenom: string, nom: string): string {
    const firstInitial = prenom && prenom.length > 0 ? prenom.charAt(0).toUpperCase() : '';
    const lastInitial = nom && nom.length > 0 ? nom.charAt(0).toUpperCase() : '';
    return (firstInitial + lastInitial) || 'E';
  }
}
