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

interface Note {
  id: string;
  title: string;
  date: string;
  score: number;
}

interface Subject {
  name: string;
  icon: string;
  color: string;
  average: number;
  notes: Note[];
}

@Component({
  selector: 'app-note',
  templateUrl: './note.page.html',
  styleUrls: ['./note.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, CommonModule, FormsModule]
})
export class NotePage implements OnInit {
  selectedFilter: string = 'all';

  subjects: Subject[] = [
    {
      name: 'Chimie',
      icon: 'flask',
      color: '#96a896',
      average: 16.5,
      notes: [
        { id: '1', title: 'Contrôle Chimie Organique', date: '15 Mars 2024', score: 18 },
        { id: '2', title: 'Devoir Maison', date: '10 Mars 2024', score: 15 },
        { id: '3', title: 'TP Chimie', date: '5 Mars 2024', score: 16.5 }
      ]
    },
    {
      name: 'Mathématiques',
      icon: 'calculator',
      color: '#d4a574',
      average: 14.2,
      notes: [
        { id: '4', title: 'Devoir Maths', date: '12 Mars 2024', score: 14 },
        { id: '5', title: 'Contrôle Algèbre', date: '8 Mars 2024', score: 15.5 },
        { id: '6', title: 'Interrogation', date: '3 Mars 2024', score: 13 }
      ]
    },
    {
      name: 'Biologie',
      icon: 'flask',
      color: '#96a896',
      average: 16.0,
      notes: [
        { id: '7', title: 'Contrôle Biologie', date: '15 Mars 2024', score: 16 },
        { id: '8', title: 'TP Biologie', date: '11 Mars 2024', score: 17 },
        { id: '9', title: 'Devoir', date: '6 Mars 2024', score: 15 }
      ]
    },
    {
      name: 'Géographie',
      icon: 'globe',
      color: '#d4a574',
      average: 15.8,
      notes: [
        { id: '10', title: 'Exposé Géographie', date: '14 Mars 2024', score: 16 },
        { id: '11', title: 'Contrôle', date: '9 Mars 2024', score: 15.5 }
      ]
    }
  ];

  constructor() {
    addIcons({
      'star': star,
      'document-text': documentText,
      'flask': flask,
      'calculator': calculator,
      'globe': globe,
      'book': book,
      'school': school
    });
  }

  ngOnInit() {
  }

  get filteredSubjects(): Subject[] {
    let filtered = [...this.subjects];
    
    if (this.selectedFilter === 'recent') {
      // Trier par date la plus récente
      filtered = filtered.map(subject => ({
        ...subject,
        notes: [...subject.notes].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )
      }));
    } else if (this.selectedFilter === 'best') {
      // Trier par meilleures notes
      filtered = filtered.map(subject => ({
        ...subject,
        notes: [...subject.notes].sort((a, b) => b.score - a.score)
      }));
    }
    
    return filtered;
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
}
