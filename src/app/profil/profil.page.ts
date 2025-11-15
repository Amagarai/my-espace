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
    firstName: 'Emma',
    lastName: 'Martin',
    studentId: 'ETU-2024-001',
    level: 'L3',
    major: 'Sciences de la Vie',
    academicYear: '2024-2025',
    email: 'emma.martin@university.edu',
    phone: '+33 6 12 34 56 78',
    address: '123 Rue de la République, 75001 Paris',
    birthDate: '15 Juin 2002'
  };

  constructor() {
    addIcons({
      'camera': camera,
      'checkmark-circle': checkmarkCircle,
      'school': school,
      'book': book,
      'calendar': calendar,
      'mail': mail,
      'call': call,
      'location': location,
      'calendar-outline': calendarOutline,
      'star': star,
      'document-text': documentText,
      'notifications-outline': notificationsOutline,
      'lock-closed-outline': lockClosedOutline,
      'language-outline': languageOutline,
      'help-circle-outline': helpCircleOutline,
      'log-out-outline': logOutOutline,
      'create-outline': createOutline,
      'chevron-forward': chevronForward
    });
  }

  ngOnInit() {
  }
}
