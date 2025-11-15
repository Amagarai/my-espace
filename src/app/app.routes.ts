import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'tabs/home',
    pathMatch: 'full',
  },
  {
    path: 'tabs',
    loadComponent: () => import('./tabs/tabs.page').then( m => m.TabsPage),
    children: [
      {
        path: 'home',
        loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'planing',
        loadComponent: () => import('./planing/planing.page').then( m => m.PlaningPage)
      },
      {
        path: 'note',
        loadComponent: () => import('./note/note.page').then( m => m.NotePage)
      },
      {
        path: 'document',
        loadComponent: () => import('./document/document.page').then( m => m.DocumentPage)
      },
      {
        path: 'profil',
        loadComponent: () => import('./profil/profil.page').then( m => m.ProfilPage)
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      }
    ]
  },
  {
    path: 'alerte',
    loadComponent: () => import('./alerte/alerte.page').then( m => m.AlertePage)
  },

];
