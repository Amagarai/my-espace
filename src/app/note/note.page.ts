import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  star,
  documentText,
  flask,
  calculator,
  globe,
  book,
  school
} from 'ionicons/icons';
import { StudentService, NotesGroupesParMatiereDTO, NoteEtudiantDTO, ReleverEtudiantDTO } from '../services/student.service';

interface Note {
  id: string;
  localId?: string;
  title: string;
  date: string;
  score: number;
  type?: string;
  valider?: boolean;
}

interface Subject {
  name: string;
  icon: string;
  color: string;
  average: number;
  notes: Note[];
}
interface ReleverGroupe {
  ueLocalId?: string;
  ueName?: string;
  items: ReleverEtudiantDTO[]; // Matières individuelles + relevé UE
}

@Component({
  selector: 'app-note',
  templateUrl: './note.page.html',
  styleUrls: ['./note.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, CommonModule, FormsModule]
})


export class NotePage implements OnInit {
  selectedFilter: string = 'notes';
  subjects: Subject[] = [];
  relevers: ReleverEtudiantDTO[] = [];
  releversGroupes: ReleverGroupe[] = []; // Relevés groupés par UE
  isLoadingNotes: boolean = false;
  isLoadingRelevers: boolean = false;
  studentLocalId: string = '';
  moyenneGenerale: number = 0;
  totalNotes: number = 0;

  constructor(private studentService: StudentService) {
    addIcons({star,documentText,flask,calculator,globe,book,school});
  }

  ngOnInit() {
    // Récupérer l'ID de l'étudiant depuis localStorage
    const studentDetailStr = localStorage.getItem('studentDetail');
    if (studentDetailStr) {
      try {
        const studentDetail = JSON.parse(studentDetailStr);
        if (studentDetail.isLoggedIn && studentDetail.localId) {
          this.studentLocalId = studentDetail.localId;
          this.loadNotes();
        }
      } catch (error) {
        console.error('Erreur lors de la lecture des données de session:', error);
      }
    }
  }

  selectFilter(filter: string) {
    this.selectedFilter = filter;
    if (filter === 'relevers' && this.releversGroupes.length === 0) {
      this.loadRelevers();
    }
  }

  loadRelevers() {
    if (!this.studentLocalId) return;

    this.isLoadingRelevers = true;
    this.studentService.getRelevers(this.studentLocalId).subscribe({
      next: (data) => {
        this.relevers = data || [];
        this.releversGroupes = this.groupReleversByUE(data || []);
        this.isLoadingRelevers = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des relevés:', error);
        this.isLoadingRelevers = false;
      }
    });
  }

  groupReleversByUE(relevers: ReleverEtudiantDTO[]): ReleverGroupe[] {
    const groupesMap = new Map<string, ReleverGroupe>();
    const releversSimples: ReleverEtudiantDTO[] = [];

    // Séparer les relevés par UE et les relevés simples
    for (const relever of relevers) {
      if (relever.ueLocalId && relever.ueName) {
        // C'est un relevé lié à une UE (matière ou UE)
        if (!groupesMap.has(relever.ueLocalId)) {
          groupesMap.set(relever.ueLocalId, {
            ueLocalId: relever.ueLocalId,
            ueName: relever.ueName,
            items: []
          });
        }
        groupesMap.get(relever.ueLocalId)!.items.push(relever);
      } else {
        // C'est un relevé simple (matière sans UE)
        releversSimples.push(relever);
      }
    }

    // Trier les items dans chaque groupe : d'abord les matières individuelles, puis le relevé UE
    for (const groupe of groupesMap.values()) {
      groupe.items.sort((a, b) => {
        if (a.ue && !b.ue) return 1; // UE après les matières
        if (!a.ue && b.ue) return -1; // Matières avant l'UE
        return 0;
      });
    }

    // Convertir en tableau et ajouter les relevés simples
    const result: ReleverGroupe[] = Array.from(groupesMap.values());

    // Ajouter les relevés simples comme des groupes individuels
    for (const relever of releversSimples) {
      result.push({
        items: [relever]
      });
    }

    return result;
  }

  loadNotes() {
    if (!this.studentLocalId) return;

    this.isLoadingNotes = true;
    this.studentService.getNotesGroupesParMatiere(this.studentLocalId).subscribe({
      next: (data) => {
        this.subjects = this.convertToSubjects(data);
        this.calculateStatistics();
        this.isLoadingNotes = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des notes:', error);
        this.isLoadingNotes = false;
      }
    });
  }

  convertToSubjects(data: NotesGroupesParMatiereDTO[]): Subject[] {
    return data.map(matiere => {
      const notes: Note[] = matiere.notes.map(note => ({
        id: note.localId,
        localId: note.localId,
        title: this.getNoteTitle(note.type || 'Note'),
        date: this.formatDate(note.date),
        score: note.note ? Number(note.note) : 0,
        type: note.type,
        valider: note.valider
      }));

      return {
        name: matiere.matiereName,
        icon: this.getSubjectIcon(matiere.matiereName),
        color: this.getSubjectColor(matiere.matiereName),
        average: matiere.moyenne ? Number(matiere.moyenne) : 0,
        notes: notes
      };
    });
  }

  getNoteTitle(type: string): string {
    const titles: { [key: string]: string } = {
      'Devoir': 'Devoir',
      'Contrôle': 'Contrôle',
      'Examen': 'Examen',
      'TP': 'Travaux Pratiques',
      'Interrogation': 'Interrogation',
      'Exposé': 'Exposé'
    };
    return titles[type] || type || 'Note';
  }

  getSubjectIcon(matiereName: string | null | undefined): string {
    if (!matiereName) return 'school';
    const name = matiereName.toLowerCase();
    if (name.includes('math')) return 'calculator';
    if (name.includes('chimie') || name.includes('bio')) return 'flask';
    if (name.includes('geo')) return 'globe';
    if (name.includes('français') || name.includes('francais') || name.includes('littérature')) return 'book';
    return 'school';
  }

  getSubjectColor(matiereName: string | null | undefined): string {
    if (!matiereName) return '#96a896';
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

  calculateStatistics() {
    // Calculer la moyenne générale
    if (this.subjects.length === 0) {
      this.moyenneGenerale = 0;
      this.totalNotes = 0;
      return;
    }

    const totalMoyennes = this.subjects.reduce((sum, subject) => sum + subject.average, 0);
    this.moyenneGenerale = totalMoyennes / this.subjects.length;

    // Calculer le total de notes
    this.totalNotes = this.subjects.reduce((sum, subject) => sum + subject.notes.length, 0);
  }


  getGradeLetter(score: number): string {
    if (score >= 18) return 'A+';
    if (score >= 16) return 'A';
    if (score >= 14) return 'B';
    if (score >= 12) return 'C';
    if (score >= 10) return 'D';
    return 'E';
  }

  getGradeClass(score: number): string {
    if (score >= 16) return 'green';
    if (score >= 14) return 'orange';
    if (score >= 12) return 'yellow';
    return 'red';
  }

  getScoreClass(score: number): string {
    if (score >= 16) return 'green-badge';
    if (score >= 14) return 'orange-badge';
    if (score >= 12) return 'yellow-badge';
    return 'red-badge';
  }

  getScoreClassForRelever(moyenne: number | null | undefined): string {
    if (!moyenne) return 'red-badge';
    const score = Number(moyenne);
    return this.getScoreClass(score);
  }
}
