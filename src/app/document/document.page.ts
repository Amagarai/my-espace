import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  document,
  calendarOutline,
  documentTextOutline,
  folderOpenOutline,
  downloadOutline,
  star,
  starOutline,
  documentOutline,
  flask,
  calculator,
  globe,
  book,
  close,
  documentText,
  school
} from 'ionicons/icons';
import { StudentService, ProgrammeAvecDocumentsDTO, DocumentEtudiantDTO } from '../services/student.service';
import { FileViewer } from '@capacitor/file-viewer';
import { Capacitor } from '@capacitor/core';
import { ToastController } from '@ionic/angular';

interface Document {
  id: string;
  localId: string;
  name: string;
  addedDate: string;
  addedDateObj: Date;
  courseId: string;
  url?: string;
}

interface Course {
  id: string;
  localId: string;
  name: string;
  professor: string;
  icon: string;
  color: string;
  lastUpdate: string;
  lastUpdateDate: Date;
  documentsCount: number;
  progress: number;
  isFavorite: boolean;
  documents?: Document[];
}

@Component({
  selector: 'app-document',
  templateUrl: './document.page.html',
  styleUrls: ['./document.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, CommonModule, FormsModule],
  providers: [ToastController]
})
export class DocumentPage implements OnInit {
  selectedFilter: string = 'all';
  selectedCourseId: string | null = null;
  courses: Course[] = [];
  isLoadingDocuments: boolean = false;
  studentLocalId: string = '';

  constructor(
    private studentService: StudentService,
    private toastController: ToastController
  ) {
    addIcons({
      'document': document,
      'calendar-outline': calendarOutline,
      'document-text-outline': documentTextOutline,
      'folder-open-outline': folderOpenOutline,
      'download-outline': downloadOutline,
      'star': star,
      'star-outline': starOutline,
      'document-outline': documentOutline,
      'flask': flask,
      'calculator': calculator,
      'globe': globe,
      'book': book,
      'close': close,
      'document-text': documentText,
      'school': school
    });
  }

  ngOnInit() {
    // Récupérer l'ID de l'étudiant depuis localStorage
    const studentDetailStr = localStorage.getItem('studentDetail');
    if (studentDetailStr) {
      try {
        const studentDetail = JSON.parse(studentDetailStr);
        if (studentDetail.isLoggedIn && studentDetail.localId) {
          this.studentLocalId = studentDetail.localId;
          this.loadProgrammesAvecDocuments();
        }
      } catch (error) {
        console.error('Erreur lors de la lecture des données de session:', error);
      }
    }
  }

  loadProgrammesAvecDocuments() {
    if (!this.studentLocalId) return;

    this.isLoadingDocuments = true;
    this.studentService.getProgrammesAvecDocuments(this.studentLocalId).subscribe({
      next: (data) => {
        this.courses = this.convertToCourses(data);
        console.log('🔍 Programmes avec documents:', this.courses);
        this.isLoadingDocuments = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des programmes avec documents:', error);
        this.isLoadingDocuments = false;
      }
    });
  }

  convertToCourses(data: ProgrammeAvecDocumentsDTO[]): Course[] {
    return data.map(programme => {
      // Trier les documents par date (plus récent en premier)
      const documents: Document[] = (programme.documents || []).map(doc => ({
        id: doc.localId,
        localId: doc.localId,
        name: doc.titre,
        addedDate: this.formatDate(doc.createdAt),
        addedDateObj: doc.createdAt ? new Date(doc.createdAt) : new Date(),
        courseId: programme.programmeLocalId,
        url: doc.url
      })).sort((a, b) => b.addedDateObj.getTime() - a.addedDateObj.getTime());

      // Récupérer la date de mise à jour (date du document le plus récent)
      const lastUpdateDate = documents.length > 0 ? documents[0].addedDateObj : new Date();
      const lastUpdate = this.formatRelativeDate(lastUpdateDate);

      return {
        id: programme.programmeLocalId,
        localId: programme.programmeLocalId,
        name: programme.matiereName,
        professor: this.getProfName(programme.profPrenom, programme.profNom),
        icon: this.getSubjectIcon(programme.matiereName),
        color: this.getSubjectColor(programme.matiereName),
        lastUpdate: lastUpdate,
        lastUpdateDate: lastUpdateDate,
        documentsCount: programme.nombreDocuments,
        progress: this.calculateProgress(programme.nombreDocuments), // Placeholder
        isFavorite: false,
        documents: documents
      };
    });
  }

  getProfName(prenom: string, nom: string): string {
    if (prenom && nom) {
      return `Prof. ${prenom} ${nom}`;
    }
    if (nom) {
      return `Prof. ${nom}`;
    }
    return 'Professeur';
  }

  getSubjectIcon(matiereName: string): string {
    const name = matiereName.toLowerCase();
    if (name.includes('math')) return 'calculator';
    if (name.includes('chimie') || name.includes('bio')) return 'flask';
    if (name.includes('geo')) return 'globe';
    if (name.includes('français') || name.includes('francais') || name.includes('littérature')) return 'book';
    return 'school';
  }

  getSubjectColor(matiereName: string): string {
    const name = matiereName.toLowerCase();
    if (name.includes('math')) return '#d4a574';
    if (name.includes('chimie') || name.includes('bio')) return '#96a896';
    if (name.includes('geo')) return '#d4a574';
    return '#96a896';
  }

  formatDate(dateString: string | null | undefined): string {
    if (!dateString) return 'Date inconnue';
    const date = new Date(dateString);
    const day = date.getDate();
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  }

  formatRelativeDate(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return 'Il y a moins d\'une heure';
    } else if (diffHours < 24) {
      return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    } else if (diffDays === 1) {
      return 'Hier';
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else {
      return this.formatDate(date.toISOString());
    }
  }

  calculateProgress(documentsCount: number): number {
    // Placeholder : progress basé sur le nombre de documents
    // Vous pouvez ajuster cette logique selon vos besoins
    return Math.min(100, documentsCount * 10);
  }

  get filteredCourses(): Course[] {
    let filtered = [...this.courses];

    if (this.selectedFilter === 'recent') {
      // Garder seulement les cours mis à jour dans les 7 derniers jours
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(course => course.lastUpdateDate >= sevenDaysAgo);
    } else if (this.selectedFilter === 'favorites') {
      filtered = filtered.filter(course => course.isFavorite);
    }

    // Trier par date (plus récent en premier)
    return filtered.sort((a, b) => b.lastUpdateDate.getTime() - a.lastUpdateDate.getTime());
  }

  toggleFavorite(courseId: string) {
    const course = this.courses.find(c => c.id === courseId);
    if (course) {
      course.isFavorite = !course.isFavorite;
    }
  }

  openCourseDocuments(courseId: string) {
    this.selectedCourseId = courseId;
  }

  closeDocumentsModal() {
    this.selectedCourseId = null;
  }

  getSelectedCourse(): Course | undefined {
    return this.courses.find(c => c.id === this.selectedCourseId);
  }

  getCourseDocuments(): Document[] {
    if (!this.selectedCourseId) return [];
    const course = this.courses.find(c => c.id === this.selectedCourseId);
    return course?.documents || [];
  }

  async downloadDocument(documentId: string) {
    const course = this.getSelectedCourse();
    if (!course) return;

    const doc = course.documents?.find(d => d.localId === documentId || d.id === documentId);
    if (!doc || !doc.url) {
      await this.showToast('Document non trouvé ou URL manquante', 'danger');
      return;
    }

    try {
      // Afficher un message de chargement
      await this.showToast('Ouverture du document...', 'primary');

      // Pour le web, ouvrir directement dans un nouvel onglet
      if (Capacitor.getPlatform() === 'web') {
        window.open(doc.url, '_blank');
        await this.showToast('Document ouvert avec succès', 'success');
        return;
      }

      console.log('📄 Ouverture du document depuis l\'URL:', doc.url);

      // Ouvrir directement depuis l'URL avec FileViewer
      await FileViewer.openDocumentFromUrl({
        url: doc.url
      });

      await this.showToast('Document ouvert avec succès', 'success');
    } catch (error: any) {
      console.error('Erreur lors de l\'ouverture du document:', error);
      await this.showToast(
        error.message || 'Erreur lors de l\'ouverture du document',
        'danger'
      );
    }
  }

  private getFileExtension(fileName: string, url: string): string {
    // Essayer d'obtenir l'extension depuis le nom du fichier
    const nameMatch = fileName.match(/\.([a-zA-Z0-9]+)$/);
    if (nameMatch) {
      return `.${nameMatch[1].toLowerCase()}`;
    }

    // Sinon, essayer depuis l'URL
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const urlMatch = pathname.match(/\.([a-zA-Z0-9]+)(\?|$)/);
      if (urlMatch) {
        return `.${urlMatch[1].toLowerCase()}`;
      }
    } catch (e) {
      // URL invalide, continuer
    }

    // Extension par défaut
    return '.pdf';
  }

  private getMimeType(extension: string): string {
    const mimeTypes: { [key: string]: string } = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.ppt': 'application/vnd.ms-powerpoint',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      '.txt': 'text/plain',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.zip': 'application/zip',
      '.rar': 'application/x-rar-compressed'
    };

    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
  }

  private async showToast(message: string, color: 'success' | 'danger' | 'primary' = 'primary') {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: color,
      position: 'bottom'
    });
    await toast.present();
  }
}
