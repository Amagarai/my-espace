import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const loginGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  // Vérifier si l'utilisateur est déjà connecté (étudiant)
  const studentDetailStr = localStorage.getItem('studentDetail');

  if (studentDetailStr) {
    try {
      const studentDetail = JSON.parse(studentDetailStr);

      if (studentDetail.isLoggedIn) {
        // Vérifier si l'utilisateur a le rôle étudiant
        const roles = studentDetail.roles || [];
        const hasStudentRole = roles.some((role: string) =>
          role === 'STUDENT' || role === 'ÉTUDIANT' || role === 'ETUDIANT'
        );

        if (hasStudentRole) {
          // Déjà connecté avec le bon rôle, rediriger vers home
          router.navigate(['/tabs/home']);
          return false;
        } else {
          // Si pas le rôle étudiant, supprimer la session et rester sur login
          localStorage.removeItem('studentDetail');
        }
      }
    } catch (error) {
      console.error('Erreur lors de la lecture des données de session:', error);
      localStorage.removeItem('studentDetail');
    }
  }

  // Autoriser l'accès à la page login
  return true;
};

