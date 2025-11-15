import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  notificationsOutline,
  calendar,
  documentText,
  megaphoneOutline,
  informationCircleOutline,
  checkmarkCircleOutline,
  schoolOutline,
  trophyOutline,
  arrowBack
} from 'ionicons/icons';

interface Notification {
  id: string;
  type: 'examen' | 'note' | 'evenement' | 'info' | 'autre';
  title: string;
  message: string;
  time: string;
  date?: string;
  dateObj: Date;
  isRead: boolean;
}

@Component({
  selector: 'app-alerte',
  templateUrl: './alerte.page.html',
  styleUrls: ['./alerte.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, CommonModule, FormsModule]
})
export class AlertePage implements OnInit {
  selectedFilter: string = 'all';

  notifications: Notification[] = [
    {
      id: '1',
      type: 'note',
      title: 'Nouvelle note disponible',
      message: 'Votre note de contrôle Biologie (16/20) est maintenant disponible.',
      time: 'Il y a 2 heures',
      dateObj: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isRead: false
    },
    {
      id: '2',
      type: 'examen',
      title: 'Examen de Mathématiques',
      message: 'L\'examen de Mathématiques est prévu le 25 Mars 2024 à 9h00 en salle B101.',
      time: 'Il y a 5 heures',
      date: '25 Mars 2024',
      dateObj: new Date(Date.now() - 5 * 60 * 60 * 1000),
      isRead: false
    },
    {
      id: '3',
      type: 'info',
      title: 'Reprise des cours',
      message: 'Les cours reprendront le 8 avril. Bonnes vacances de printemps à tous !',
      time: 'Il y a 1 jour',
      dateObj: new Date(Date.now() - 24 * 60 * 60 * 1000),
      isRead: true
    },
    {
      id: '4',
      type: 'evenement',
      title: 'Conférence sur la recherche',
      message: 'Conférence sur les avancées en biologie moléculaire le 20 Mars à 14h00.',
      time: 'Il y a 2 jours',
      dateObj: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      isRead: false
    },
    {
      id: '5',
      type: 'note',
      title: 'Nouvelle note disponible',
      message: 'Votre note de devoir Maths (14/20) est maintenant disponible.',
      time: 'Il y a 3 jours',
      dateObj: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      isRead: true
    },
    {
      id: '6',
      type: 'examen',
      title: 'Examen de Chimie',
      message: 'L\'examen de Chimie est prévu le 28 Mars 2024 à 14h00 en salle A205.',
      time: 'Il y a 4 jours',
      date: '28 Mars 2024',
      dateObj: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      isRead: true
    },
    {
      id: '7',
      type: 'info',
      title: 'Nouveau document disponible',
      message: 'Un nouveau document a été ajouté au cours de Géographie.',
      time: 'Il y a 5 jours',
      dateObj: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      isRead: true
    },
    {
      id: '8',
      type: 'evenement',
      title: 'Journée portes ouvertes',
      message: 'Journée portes ouvertes de l\'université le 15 Avril 2024 de 9h à 17h.',
      time: 'Il y a 6 jours',
      dateObj: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      isRead: true
    },
    {
      id: '9',
      type: 'autre',
      title: 'Mise à jour du système',
      message: 'Le système sera en maintenance le 22 Mars de 2h à 4h du matin.',
      time: 'Il y a 1 semaine',
      dateObj: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      isRead: true
    }
  ];

  constructor(private router: Router) {
    addIcons({
      'notifications-outline': notificationsOutline,
      'calendar': calendar,
      'document-text': documentText,
      'megaphone-outline': megaphoneOutline,
      'information-circle-outline': informationCircleOutline,
      'checkmark-circle-outline': checkmarkCircleOutline,
      'school-outline': schoolOutline,
      'trophy-outline': trophyOutline,
      'arrow-back': arrowBack
    });
  }

  ngOnInit() {
    // Trier par défaut du plus récent au plus ancien
    this.sortNotificationsByDate();
  }

  get filteredNotifications(): Notification[] {
    let filtered = [...this.notifications];

    if (this.selectedFilter !== 'all') {
      filtered = filtered.filter(notif => notif.type === this.selectedFilter);
    }

    // Trier par date (plus récent en premier)
    return filtered.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
  }

  sortNotificationsByDate() {
    this.notifications.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'examen':
        return 'school-outline';
      case 'note':
        return 'trophy-outline';
      case 'evenement':
        return 'calendar';
      case 'info':
        return 'information-circle-outline';
      default:
        return 'notifications-outline';
    }
  }

  markAsRead(notificationId: string) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
    }
  }

  goBack() {
    this.router.navigate(['/tabs/home']);
  }
}
