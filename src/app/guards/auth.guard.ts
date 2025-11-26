import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  // Vérifier si l'utilisateur est connecté
  const studentDetailStr = localStorage.getItem('studentDetail');

  if (!studentDetailStr) {
    // Pas de session, rediriger vers login
    router.navigate(['/login']);
    return false;
  }

  try {
    const studentDetail = JSON.parse(studentDetailStr);

    // Vérifier si l'utilisateur est connecté
    if (!studentDetail.isLoggedIn) {
      router.navigate(['/login']);
      return false;
    }

    // Vérifier si l'utilisateur a le rôle étudiant
    const roles = studentDetail.roles || [];
    const hasStudentRole = roles.some((role: string) =>
      role === 'STUDENT' || role === 'ÉTUDIANT' || role === 'ETUDIANT'
    );

    if (!hasStudentRole) {
      // Pas le bon rôle, supprimer la session et rediriger vers login
      localStorage.removeItem('studentDetail');
      router.navigate(['/login']);
      return false;
    }

    // Utilisateur authentifié avec le bon rôle
    return true;
  } catch (error) {
    console.error('Erreur lors de la lecture des données de session:', error);
    localStorage.removeItem('studentDetail');
    router.navigate(['/login']);
    return false;
  }
};

