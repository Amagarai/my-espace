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
  documentText
} from 'ionicons/icons';

interface Document {
  id: string;
  name: string;
  addedDate: string;
  addedDateObj: Date;
  courseId: string;
}

interface Course {
  id: string;
  name: string;
  professor: string;
  icon: string;
  color: string;
  lastUpdate: string;
  lastUpdateDate: Date;
  documentsCount: number;
  progress: number;
  isFavorite: boolean;
}

@Component({
  selector: 'app-document',
  templateUrl: './document.page.html',
  styleUrls: ['./document.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, CommonModule, FormsModule]
})
export class DocumentPage implements OnInit {
  selectedFilter: string = 'all';
  selectedCourseId: string | null = null;

  documents: Document[] = [
    // Documents pour Chimie
    { id: 'd1', name: 'Cours 1 - Introduction à la chimie organique.pdf', addedDate: '15 Mars 2024', addedDateObj: new Date('2024-03-15'), courseId: '1' },
    { id: 'd2', name: 'TP Chimie - Réactions acido-basiques.pdf', addedDate: '12 Mars 2024', addedDateObj: new Date('2024-03-12'), courseId: '1' },
    { id: 'd3', name: 'Devoir Maison - Chimie organique.pdf', addedDate: '10 Mars 2024', addedDateObj: new Date('2024-03-10'), courseId: '1' },
    { id: 'd4', name: 'Cours 2 - Les alcools et éthers.pdf', addedDate: '8 Mars 2024', addedDateObj: new Date('2024-03-08'), courseId: '1' },
    { id: 'd5', name: 'Résumé - Chimie organique.pdf', addedDate: '5 Mars 2024', addedDateObj: new Date('2024-03-05'), courseId: '1' },
    { id: 'd6', name: 'Cours 3 - Les aldéhydes et cétones.pdf', addedDate: '3 Mars 2024', addedDateObj: new Date('2024-03-03'), courseId: '1' },
    { id: 'd7', name: 'Exercices - Chimie organique.pdf', addedDate: '1 Mars 2024', addedDateObj: new Date('2024-03-01'), courseId: '1' },
    { id: 'd8', name: 'Correction TP - Réactions.pdf', addedDate: '28 Février 2024', addedDateObj: new Date('2024-02-28'), courseId: '1' },
    
    // Documents pour Mathématiques
    { id: 'd9', name: 'Cours 1 - Algèbre linéaire.pdf', addedDate: '14 Mars 2024', addedDateObj: new Date('2024-03-14'), courseId: '2' },
    { id: 'd10', name: 'TD Mathématiques - Matrices.pdf', addedDate: '11 Mars 2024', addedDateObj: new Date('2024-03-11'), courseId: '2' },
    { id: 'd11', name: 'Cours 2 - Calcul différentiel.pdf', addedDate: '9 Mars 2024', addedDateObj: new Date('2024-03-09'), courseId: '2' },
    { id: 'd12', name: 'Exercices - Algèbre.pdf', addedDate: '7 Mars 2024', addedDateObj: new Date('2024-03-07'), courseId: '2' },
    { id: 'd13', name: 'Cours 3 - Intégrales.pdf', addedDate: '5 Mars 2024', addedDateObj: new Date('2024-03-05'), courseId: '2' },
    { id: 'd14', name: 'Devoir Maison - Mathématiques.pdf', addedDate: '4 Mars 2024', addedDateObj: new Date('2024-03-04'), courseId: '2' },
    { id: 'd15', name: 'Correction TD - Matrices.pdf', addedDate: '2 Mars 2024', addedDateObj: new Date('2024-03-02'), courseId: '2' },
    { id: 'd16', name: 'Cours 4 - Équations différentielles.pdf', addedDate: '28 Février 2024', addedDateObj: new Date('2024-02-28'), courseId: '2' },
    { id: 'd17', name: 'Résumé - Algèbre linéaire.pdf', addedDate: '26 Février 2024', addedDateObj: new Date('2024-02-26'), courseId: '2' },
    { id: 'd18', name: 'TD Mathématiques - Calcul différentiel.pdf', addedDate: '24 Février 2024', addedDateObj: new Date('2024-02-24'), courseId: '2' },
    { id: 'd19', name: 'Exercices - Intégrales.pdf', addedDate: '22 Février 2024', addedDateObj: new Date('2024-02-22'), courseId: '2' },
    { id: 'd20', name: 'Cours 5 - Probabilités.pdf', addedDate: '20 Février 2024', addedDateObj: new Date('2024-02-20'), courseId: '2' },
    
    // Documents pour Biologie
    { id: 'd21', name: 'Cours 1 - Biologie cellulaire.pdf', addedDate: '13 Mars 2024', addedDateObj: new Date('2024-03-13'), courseId: '3' },
    { id: 'd22', name: 'TP Biologie - Microscope.pdf', addedDate: '10 Mars 2024', addedDateObj: new Date('2024-03-10'), courseId: '3' },
    { id: 'd23', name: 'Cours 2 - Génétique.pdf', addedDate: '7 Mars 2024', addedDateObj: new Date('2024-03-07'), courseId: '3' },
    { id: 'd24', name: 'Devoir - Biologie cellulaire.pdf', addedDate: '5 Mars 2024', addedDateObj: new Date('2024-03-05'), courseId: '3' },
    { id: 'd25', name: 'Cours 3 - Évolution.pdf', addedDate: '2 Mars 2024', addedDateObj: new Date('2024-03-02'), courseId: '3' },
    { id: 'd26', name: 'Résumé - Génétique.pdf', addedDate: '28 Février 2024', addedDateObj: new Date('2024-02-28'), courseId: '3' },
    
    // Documents pour Géographie
    { id: 'd27', name: 'Cours 1 - Géographie physique.pdf', addedDate: '12 Mars 2024', addedDateObj: new Date('2024-03-12'), courseId: '4' },
    { id: 'd28', name: 'TD Géographie - Cartographie.pdf', addedDate: '9 Mars 2024', addedDateObj: new Date('2024-03-09'), courseId: '4' },
    { id: 'd29', name: 'Cours 2 - Climatologie.pdf', addedDate: '6 Mars 2024', addedDateObj: new Date('2024-03-06'), courseId: '4' },
    { id: 'd30', name: 'Exposé - Géographie humaine.pdf', addedDate: '4 Mars 2024', addedDateObj: new Date('2024-03-04'), courseId: '4' },
    { id: 'd31', name: 'Cours 3 - Géomorphologie.pdf', addedDate: '1 Mars 2024', addedDateObj: new Date('2024-03-01'), courseId: '4' },
    { id: 'd32', name: 'TD Géographie - Climat.pdf', addedDate: '27 Février 2024', addedDateObj: new Date('2024-02-27'), courseId: '4' },
    { id: 'd33', name: 'Cours 4 - Hydrologie.pdf', addedDate: '25 Février 2024', addedDateObj: new Date('2024-02-25'), courseId: '4' },
    { id: 'd34', name: 'Exercices - Cartographie.pdf', addedDate: '23 Février 2024', addedDateObj: new Date('2024-02-23'), courseId: '4' },
    { id: 'd35', name: 'Résumé - Géographie physique.pdf', addedDate: '21 Février 2024', addedDateObj: new Date('2024-02-21'), courseId: '4' },
    { id: 'd36', name: 'Cours 5 - Biogéographie.pdf', addedDate: '19 Février 2024', addedDateObj: new Date('2024-02-19'), courseId: '4' },
    
    // Documents pour Physique
    { id: 'd37', name: 'Cours 1 - Mécanique.pdf', addedDate: '11 Mars 2024', addedDateObj: new Date('2024-03-11'), courseId: '5' },
    { id: 'd38', name: 'TP Physique - Mouvement.pdf', addedDate: '8 Mars 2024', addedDateObj: new Date('2024-03-08'), courseId: '5' },
    { id: 'd39', name: 'Cours 2 - Électromagnétisme.pdf', addedDate: '5 Mars 2024', addedDateObj: new Date('2024-03-05'), courseId: '5' },
    { id: 'd40', name: 'TD Physique - Mécanique.pdf', addedDate: '3 Mars 2024', addedDateObj: new Date('2024-03-03'), courseId: '5' },
    { id: 'd41', name: 'Cours 3 - Optique.pdf', addedDate: '1 Mars 2024', addedDateObj: new Date('2024-03-01'), courseId: '5' },
    { id: 'd42', name: 'Exercices - Électromagnétisme.pdf', addedDate: '28 Février 2024', addedDateObj: new Date('2024-02-28'), courseId: '5' },
    { id: 'd43', name: 'Cours 4 - Thermodynamique.pdf', addedDate: '26 Février 2024', addedDateObj: new Date('2024-02-26'), courseId: '5' },
    { id: 'd44', name: 'TP Physique - Optique.pdf', addedDate: '24 Février 2024', addedDateObj: new Date('2024-02-24'), courseId: '5' },
    { id: 'd45', name: 'Résumé - Mécanique.pdf', addedDate: '22 Février 2024', addedDateObj: new Date('2024-02-22'), courseId: '5' },
    
    // Documents pour Histoire
    { id: 'd46', name: 'Cours 1 - Histoire moderne.pdf', addedDate: '10 Mars 2024', addedDateObj: new Date('2024-03-10'), courseId: '6' },
    { id: 'd47', name: 'TD Histoire - Révolution française.pdf', addedDate: '7 Mars 2024', addedDateObj: new Date('2024-03-07'), courseId: '6' },
    { id: 'd48', name: 'Cours 2 - Histoire contemporaine.pdf', addedDate: '4 Mars 2024', addedDateObj: new Date('2024-03-04'), courseId: '6' },
    { id: 'd49', name: 'Exposé - Histoire de France.pdf', addedDate: '2 Mars 2024', addedDateObj: new Date('2024-03-02'), courseId: '6' },
    { id: 'd50', name: 'Cours 3 - Histoire médiévale.pdf', addedDate: '28 Février 2024', addedDateObj: new Date('2024-02-28'), courseId: '6' },
    { id: 'd51', name: 'TD Histoire - Moyen Âge.pdf', addedDate: '26 Février 2024', addedDateObj: new Date('2024-02-26'), courseId: '6' },
    { id: 'd52', name: 'Résumé - Histoire moderne.pdf', addedDate: '24 Février 2024', addedDateObj: new Date('2024-02-24'), courseId: '6' }
  ];

  courses: Course[] = [
    {
      id: '1',
      name: 'Chimie',
      professor: 'Prof. Martin',
      icon: 'flask',
      color: '#96a896',
      lastUpdate: 'Il y a 2 heures',
      lastUpdateDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
      documentsCount: 8,
      progress: 75,
      isFavorite: true
    },
    {
      id: '2',
      name: 'Mathématiques',
      professor: 'Prof. Dubois',
      icon: 'calculator',
      color: '#d4a574',
      lastUpdate: 'Il y a 5 heures',
      lastUpdateDate: new Date(Date.now() - 5 * 60 * 60 * 1000),
      documentsCount: 12,
      progress: 60,
      isFavorite: false
    },
    {
      id: '3',
      name: 'Biologie',
      professor: 'Prof. Laurent',
      icon: 'flask',
      color: '#96a896',
      lastUpdate: 'Hier',
      lastUpdateDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      documentsCount: 6,
      progress: 50,
      isFavorite: true
    },
    {
      id: '4',
      name: 'Géographie',
      professor: 'Prof. Dubois',
      icon: 'globe',
      color: '#d4a574',
      lastUpdate: 'Il y a 2 jours',
      lastUpdateDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      documentsCount: 10,
      progress: 80,
      isFavorite: false
    },
    {
      id: '5',
      name: 'Physique',
      professor: 'Prof. Bernard',
      icon: 'flask',
      color: '#96a896',
      lastUpdate: 'Il y a 3 jours',
      lastUpdateDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      documentsCount: 9,
      progress: 65,
      isFavorite: false
    },
    {
      id: '6',
      name: 'Histoire',
      professor: 'Prof. Moreau',
      icon: 'book',
      color: '#d4a574',
      lastUpdate: 'Il y a 5 jours',
      lastUpdateDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      documentsCount: 7,
      progress: 45,
      isFavorite: true
    }
  ];

  constructor() {
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
      'document-text': documentText
    });
  }

  ngOnInit() {
    // Trier par défaut du plus récent au plus ancien
    this.sortCoursesByDate();
  }

  get filteredCourses(): Course[] {
    let filtered = [...this.courses];

    if (this.selectedFilter === 'recent') {
      // Garder seulement les cours mis à jour dans les 3 derniers jours
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(course => course.lastUpdateDate >= threeDaysAgo);
    } else if (this.selectedFilter === 'favorites') {
      filtered = filtered.filter(course => course.isFavorite);
    }

    // Trier par date (plus récent en premier)
    return filtered.sort((a, b) => b.lastUpdateDate.getTime() - a.lastUpdateDate.getTime());
  }

  sortCoursesByDate() {
    this.courses.sort((a, b) => b.lastUpdateDate.getTime() - a.lastUpdateDate.getTime());
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
    return this.documents
      .filter(doc => doc.courseId === this.selectedCourseId)
      .sort((a, b) => b.addedDateObj.getTime() - a.addedDateObj.getTime());
  }

  downloadDocument(documentId: string) {
    const doc = this.documents.find(d => d.id === documentId);
    if (doc) {
      console.log('Téléchargement:', doc.name);
      // Ici vous pouvez ajouter la logique de téléchargement
    }
  }
}
