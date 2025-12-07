import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonIcon, IonButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  mailOutline,
  lockClosedOutline,
  eyeOutline,
  eyeOffOutline,
  logInOutline,
  alertCircleOutline
} from 'ionicons/icons';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonIcon,
    IonButton,
    CommonModule,
    FormsModule
  ]
})
export class LoginPage implements OnInit {
  showPassword: boolean = false;
  credentials = {
    email: '',
    password: ''
  };
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    addIcons({alertCircleOutline,mailOutline,lockClosedOutline,logInOutline,eyeOutline,eyeOffOutline,logo:'../../assets/logo.svg'});
  }

  ngOnInit() {
    // La logique de vérification est maintenant gérée par le loginGuard
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  async onLogin() {
    this.errorMessage = '';
    this.isLoading = true;

    // Validation des champs
    if (!this.credentials.email || !this.credentials.password) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      this.isLoading = false;
      return;
    }

    try {
      // Appel à l'API backend
      this.authService.login(this.credentials).subscribe({
        next: (response) => {
          // Vérifier si l'utilisateur a le rôle étudiant
          const roles = response.roles || [];
          const hasStudentRole = roles.some((role: string) =>
            role === 'STUDENT' || role === 'ÉTUDIANT' || role === 'ETUDIANT'
          );

          // Vérifier si l'utilisateur a le droit de se connecter (seulement étudiants)
          if (!hasStudentRole) {
            this.errorMessage = 'Vous n\'avez pas les droits nécessaires pour accéder à cette application. Seuls les étudiants peuvent se connecter.';
            this.isLoading = false;
            return;
          }

          // Stocker le token dans localStorage (géré par AuthService)
          // Le token est déjà stocké par AuthService.login() via tap()
          
          // Créer un objet avec toutes les informations utilisateur
          const studentDetail = {
            isLoggedIn: true,
            email: response.email,
            localId: response.localId,
            nom: response.nom,
            prenom: response.prenom,
            type: response.type,
            roles: response.roles,
            token: response.token,
            username: response.username
          };

          // Sauvegarder l'objet dans localStorage avec la clé studentDetail
          localStorage.setItem('studentDetail', JSON.stringify(studentDetail));

          // Rediriger vers tabs (page d'accueil)
          this.router.navigate(['/tabs/home']);

          this.isLoading = false;
        },
        error: (error) => {
          console.error('❌ Erreur de connexion complète:', error);
          console.error('Status:', error.status);
          console.error('Error body:', error.error);
          
          // Extraire le message d'erreur du backend
          let errorMsg = 'Email ou mot de passe incorrect.';
          
          if (error.error) {
            if (typeof error.error === 'string') {
              try {
                const parsedError = JSON.parse(error.error);
                errorMsg = parsedError.message || errorMsg;
              } catch (e) {
                errorMsg = error.error || errorMsg;
              }
            } else if (error.error.message) {
              errorMsg = error.error.message;
            } else if (error.error.error) {
              errorMsg = error.error.error;
            }
          } else if (error.message) {
            errorMsg = error.message;
          }
          
          this.errorMessage = errorMsg;
          this.isLoading = false;
        }
      });
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
      this.isLoading = false;
    }
  }

  onForgotPassword() {
    // TODO: Implémenter la fonctionnalité de réinitialisation de mot de passe
    alert('Fonctionnalité de réinitialisation de mot de passe à venir.');
  }
}
