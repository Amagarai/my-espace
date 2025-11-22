import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ProgrammeJourDTO {
  localId: string;
  jour: string;
  heureDebut: string;
  heureFin: string;
  matiereName: string;
  profNom: string;
  profPrenom: string;
  salleName: string;
}

export interface StudentDashboardDTO {
  nombreCoursAujourdHui: number;
  moyenneGenerale: number;
  coursAujourdHui: ProgrammeJourDTO[];
}

export interface AlerteEtudiantDTO {
  localId: string;
  title: string;
  description: string;
  typeAlerte: string;
  annonceTitre: string;
  annonceContenu: string;
  annonceType: string;
  createdAt: string;
}

export interface NoteEtudiantDTO {
  localId: string;
  matiereName: string;
  type: string;
  note: number;
  date: string;
  valider: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private apiUrl = environment.apiUrl || 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getDashboardData(studentLocalId: string): Observable<StudentDashboardDTO> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.get<StudentDashboardDTO>(
      `${this.apiUrl}/student/${studentLocalId}/dashboard`,
      { headers }
    );
  }

  getRecentAlertes(studentLocalId: string): Observable<AlerteEtudiantDTO[]> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.get<AlerteEtudiantDTO[]>(
      `${this.apiUrl}/student/${studentLocalId}/alertes`,
      { headers }
    );
  }

  getRecentNotes(studentLocalId: string): Observable<NoteEtudiantDTO[]> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.get<NoteEtudiantDTO[]>(
      `${this.apiUrl}/student/${studentLocalId}/notes/recent`,
      { headers }
    );
  }
}

