import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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

export interface NotesGroupesParMatiereDTO {
  matiereName: string;
  matiereLocalId: string;
  moyenne: number;
  notes: NoteEtudiantDTO[];
}

export interface ReleverEtudiantDTO {
  localId: string;
  matiereName: string;
  devoir: number;
  examen: number;
  moyenne: number;
  valider: boolean;
}

export interface DocumentEtudiantDTO {
  localId: string;
  titre: string;
  url: string;
  createdAt: string;
}

export interface ProgrammeAvecDocumentsDTO {
  programmeLocalId: string;
  matiereName: string;
  profNom: string;
  profPrenom: string;
  jour: string;
  heureDebut: string;
  heureFin: string;
  salleName: string;
  nombreDocuments: number;
  dernierDocumentDate: string;
  documents: DocumentEtudiantDTO[];
}

export interface StudentProfileDTO {
  localId: string;
  nom: string;
  prenom: string;
  email: string;
  username: string;
  numero: string;
  sexe: string;
  idNum: string;
  dateOfBirth: string;
  niveau?: string;
  filiere?: string;
  anneeAcademique?: string;
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

  getProgrammes(studentLocalId: string): Observable<ProgrammeJourDTO[]> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.get<ProgrammeJourDTO[]>(
      `${this.apiUrl}/student/${studentLocalId}/programmes`,
      { headers }
    );
  }

  getNotesGroupesParMatiere(studentLocalId: string): Observable<NotesGroupesParMatiereDTO[]> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.get<NotesGroupesParMatiereDTO[]>(
      `${this.apiUrl}/student/${studentLocalId}/notes/groupes`,
      { headers }
    );
  }

  getRelevers(studentLocalId: string): Observable<ReleverEtudiantDTO[]> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.get<ReleverEtudiantDTO[]>(
      `${this.apiUrl}/student/${studentLocalId}/relevers`,
      { headers }
    );
  }

  getProgrammesAvecDocuments(studentLocalId: string): Observable<ProgrammeAvecDocumentsDTO[]> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.get<ProgrammeAvecDocumentsDTO[]>(
      `${this.apiUrl}/student/${studentLocalId}/programmes/documents`,
      { headers }
    );
  }

  getStudentProfile(studentLocalId: string): Observable<StudentProfileDTO> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.get<any>(
      `${this.apiUrl}/student/${studentLocalId}`,
      { headers }
    ).pipe(
      map((student: any) => {
        // Mapper les données de l'entité Student vers StudentProfileDTO
        // Structure: Student -> anneeEnCours (StudentAnnee) -> classe (AnneeClasse) -> classe (Classe) -> filiere (Filiere)
        const anneeClasse = student.anneeEnCours?.classe;
        const classe = anneeClasse?.classe;
        const filiere = classe?.filiere;

        const profile: StudentProfileDTO = {
          localId: student.localId || '',
          nom: student.nom || '',
          prenom: student.prenom || '',
          email: student.email || '',
          username: student.username || '',
          numero: student.numero || '',
          sexe: student.sexe || '',
          idNum: student.idNum || '',
          dateOfBirth: student.dateOfBirth || '',
          niveau: classe?.name || '', // Le nom de la classe peut servir de niveau
          filiere: filiere?.name || '',
          anneeAcademique: student.anneeEnCours?.anneeScolaire || ''
        };
        return profile;
      })
    );
  }
}

