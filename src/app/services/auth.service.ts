import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  localId: string;
  nom: string;
  prenom: string;
  email: string;
  username: string;
  type: string;
  roles: string[];
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl || 'http://localhost:8080/api';
  private readonly TOKEN_KEY = 'jwt_token';
  private readonly USER_KEY = 'studentDetail';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    console.log('🔐 Tentative de connexion:', {
      url: `${this.apiUrl}/auth/login`,
      email: credentials.email,
      passwordLength: credentials.password?.length || 0
    });

    return this.http.post<LoginResponse>(
      `${this.apiUrl}/auth/login`,
      credentials,
      { headers }
    ).pipe(
      tap(response => {
        console.log('✅ Connexion réussie:', response);
        // Stocker le token dans localStorage
        if (response.token) {
          localStorage.setItem(this.TOKEN_KEY, response.token);
        }
      }),
      catchError(error => {
        console.error('❌ Erreur de connexion:', {
          status: error.status,
          statusText: error.statusText,
          error: error.error,
          message: error.error?.message || error.message
        });
        return throwError(() => error);
      })
    );
  }

  logout(): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.post(
      `${this.apiUrl}/auth/logout`,
      {},
      { headers }
    ).pipe(
      tap(() => {
        this.clearAuthData();
        this.router.navigate(['/login']);
      })
    );
  }

  getToken(): string | null {
    // Essayer de récupérer depuis le token dédié
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (token) {
      return token;
    }

    // Sinon, récupérer depuis les détails utilisateur (rétrocompatibilité)
    const userDetailStr = localStorage.getItem(this.USER_KEY);
    if (userDetailStr) {
      try {
        const userDetail = JSON.parse(userDetailStr);
        return userDetail.token || null;
      } catch (error) {
        console.error('Erreur lors de la lecture du token:', error);
        return null;
      }
    }

    return null;
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }
}

