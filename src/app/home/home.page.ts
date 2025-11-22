import { Component, ViewChild, AfterViewInit, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent, IonIcon, ScrollDetail, ScrollBaseDetail } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  leaf,
  notificationsOutline,
  calendar,
  star,
  flask,
  calculator,
  globe,
  megaphoneOutline,
  book,
  documentText,
  informationCircle
} from 'ionicons/icons';
import { StudentService } from '../services/student.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, CommonModule],
})
export class HomePage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(IonContent) content!: IonContent;
  isScrolledDown: boolean = false;
  isScrollingDown: boolean = false;
  scrollOpacity: number = 1;
  lastScrollTop: number = 0;
  private scrollElement: any;

  // Données du dashboard
  nombreCoursAujourdHui: number = 0;
  moyenneGenerale: number = 0;
  coursAujourdHui: any[] = [];
  studentLocalId: string = '';
  studentName: string = '';
  studentPrenom: string = '';
  studentNom: string = '';
  studentInitials: string = '';
  todayDate: string = '';

  // Données des alertes
  alertes: any[] = [];
  currentAlerteIndex: number = 0;

  // Données des notes
  recentNotes: any[] = [];
  private swipeStartX: number = 0;
  private swipeEndX: number = 0;
  private autoSlideInterval: any;
  private readonly AUTO_SLIDE_DURATION = 5000; // 5 secondes

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private studentService: StudentService
  ) {
    addIcons({leaf,notificationsOutline,calendar,star,flask,calculator,globe,megaphoneOutline, 'logo': '../../assets/logo.svg', book, documentText, informationCircle});
  }

  ngOnInit() {
    // Récupérer l'ID de l'étudiant depuis localStorage
    const studentDetailStr = localStorage.getItem('studentDetail');
    if (studentDetailStr) {
      try {
        const studentDetail = JSON.parse(studentDetailStr);
        if (studentDetail.isLoggedIn && studentDetail.localId) {
          this.studentLocalId = studentDetail.localId;
          this.studentPrenom = studentDetail.prenom || '';
          this.studentNom = studentDetail.nom || '';
          this.studentName = this.studentPrenom || this.studentNom || 'Étudiant';
          this.studentInitials = this.getInitials(this.studentPrenom, this.studentNom);
          this.loadDashboardData();
          this.loadAlertes();
          this.loadRecentNotes();
        }
      } catch (error) {
        console.error('Erreur lors de la lecture des données de session:', error);
      }
    }

    // Mettre à jour la date d'aujourd'hui
    this.updateTodayDate();
  }

  loadAlertes() {
    if (!this.studentLocalId) return;

    this.studentService.getRecentAlertes(this.studentLocalId).subscribe({
      next: (data) => {
        this.alertes = data || [];
        this.currentAlerteIndex = 0;
        // Démarrer le slider automatique si on a plus d'une alerte
        if (this.alertes.length > 1) {
          this.startAutoSlide();
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des alertes:', error);
      }
    });
  }

  loadRecentNotes() {
    if (!this.studentLocalId) return;

    this.studentService.getRecentNotes(this.studentLocalId).subscribe({
      next: (data) => {
        this.recentNotes = data || [];
      },
      error: (error) => {
        console.error('Erreur lors du chargement des notes:', error);
      }
    });
  }

  startAutoSlide() {
    // Arrêter l'intervalle précédent s'il existe
    this.stopAutoSlide();

    // Démarrer un nouvel intervalle
    this.autoSlideInterval = setInterval(() => {
      if (this.alertes.length > 1) {
        this.currentAlerteIndex = (this.currentAlerteIndex + 1) % this.alertes.length;
      }
    }, this.AUTO_SLIDE_DURATION);
  }

  stopAutoSlide() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
      this.autoSlideInterval = null;
    }
  }

  getInitials(prenom: string, nom: string): string {
    let initials = '';

    // Prendre la première lettre du prénom en majuscule
    if (prenom && prenom.trim().length > 0) {
      initials += prenom.trim().charAt(0).toUpperCase();
    }

    // Prendre la première lettre du nom en majuscule
    if (nom && nom.trim().length > 0) {
      initials += nom.trim().charAt(0).toUpperCase();
    }

    // Si pas d'initiales, retourner "?" par défaut
    return initials || '?';
  }

  updateTodayDate() {
    const today = new Date();
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const dayName = days[today.getDay()];
    const day = today.getDate();
    const month = months[today.getMonth()];
    this.todayDate = `${dayName} ${day} ${month}`;
  }

  loadDashboardData() {
    if (!this.studentLocalId) return;

    this.studentService.getDashboardData(this.studentLocalId).subscribe({
      next: (data) => {
        this.nombreCoursAujourdHui = data.nombreCoursAujourdHui;
        this.moyenneGenerale = data.moyenneGenerale || 0;
        this.coursAujourdHui = data.coursAujourdHui || [];
      },
      error: (error) => {
        console.error('Erreur lors du chargement des données du dashboard:', error);
      }
    });
  }

  async ngAfterViewInit() {
    // Attendre un peu pour que l'élément soit complètement initialisé
    setTimeout(async () => {
      if (this.content) {
        try {
          this.scrollElement = await this.content.getScrollElement();
          if (this.scrollElement) {
            this.scrollElement.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
            // Initialiser lastScrollTop
            this.lastScrollTop = this.scrollElement.scrollTop || 0;
          }
        } catch (error) {
          console.error('Error getting scroll element:', error);
        }
      }
    }, 100);
  }

  ngOnDestroy() {
    // Nettoyer l'intervalle lors de la destruction du composant
    this.stopAutoSlide();

    if (this.scrollElement) {
      this.scrollElement.removeEventListener('scroll', this.handleScroll.bind(this));
    }
  }

  handleScroll() {
    if (!this.scrollElement) return;

    const scrollTop = this.scrollElement.scrollTop || 0;
    const wasScrolledDown = this.isScrolledDown;
    const wasScrollingDown = this.isScrollingDown;

    // Détecter la direction du scroll
    const scrollingDown = scrollTop > this.lastScrollTop;
    this.isScrollingDown = scrollingDown;

    // Si on scroll vers le bas (scrollTop augmente) et qu'on a scrollé plus de 50px
    if (scrollingDown && scrollTop > 50) {
      this.isScrolledDown = true;
      // Réduire l'opacité progressivement (max 0.3 à 200px)
      this.scrollOpacity = Math.max(0.3, 1 - (scrollTop / 200));
    }
    // Si on scroll vers le haut (scrollTop diminue) ou on est en haut
    else if (!scrollingDown || scrollTop <= 70) {
      this.isScrolledDown = false;
      this.scrollOpacity = 1;
    }

    // Forcer la détection de changement
    if (wasScrolledDown !== this.isScrolledDown || wasScrollingDown !== this.isScrollingDown) {
      this.cdr.detectChanges();
    }

    this.lastScrollTop = scrollTop;
  }

  onScroll(event: CustomEvent<ScrollDetail>) {
    const scrollTop = event.detail.scrollTop;
    this.updateScrollState(scrollTop);
  }

  onScrollEnd(event: CustomEvent<ScrollBaseDetail>) {
    // Pour ionScrollEnd, on doit récupérer le scrollTop depuis l'élément
    if (this.scrollElement) {
      const scrollTop = this.scrollElement.scrollTop || 0;
      this.updateScrollState(scrollTop);
    }
  }

  private updateScrollState(scrollTop: number) {
    const wasScrolledDown = this.isScrolledDown;
    const wasScrollingDown = this.isScrollingDown;
    const previousOpacity = this.scrollOpacity;

    // Détecter la direction du scroll
    const scrollingDown = scrollTop > this.lastScrollTop;
    this.isScrollingDown = scrollingDown;

    // Si on scroll vers le bas (scrollTop augmente) et qu'on a scrollé plus de 50px
    if (scrollingDown && scrollTop > 50) {
      if (!this.isScrolledDown) {
        this.isScrolledDown = true;
        console.log('Bulle activée - scrollTop:', scrollTop);
      }
      // Réduire l'opacité progressivement (max 0.3 à 200px)
      this.scrollOpacity = Math.max(0.3, 1 - (scrollTop / 200));
    }
    // Si on scroll vers le haut (scrollTop diminue) ou on est en haut
    else if (!scrollingDown || scrollTop <= 50) {
      if (this.isScrolledDown) {
        this.isScrolledDown = false;
        console.log('Bulle désactivée - scrollTop:', scrollTop);
      }
      this.scrollOpacity = 1;
    }

    // Forcer la détection de changement si nécessaire
    if (wasScrolledDown !== this.isScrolledDown || wasScrollingDown !== this.isScrollingDown || Math.abs(previousOpacity - this.scrollOpacity) > 0.01) {
      this.cdr.detectChanges();
    }

    this.lastScrollTop = scrollTop;
  }

  goToNotifications() {
    this.router.navigate(['/alerte']);
  }

  getCoursClass(index: number): string {
    return index % 2 === 0 ? 'biology' : 'mathematics';
  }

  getIconClass(index: number): string {
    return index % 2 === 0 ? 'green' : 'orange';
  }

  getTimeClass(index: number): string {
    return index % 2 === 0 ? 'green' : 'orange';
  }

  getCoursIcon(matiereName: string): string {
    const name = matiereName.toLowerCase();
    if (name.includes('bio') || name.includes('chim')) {
      return 'flask';
    } else if (name.includes('math') || name.includes('calcul')) {
      return 'calculator';
    } else if (name.includes('geo') || name.includes('terre')) {
      return 'globe';
    }
    return 'book';
  }

  calculerDuree(heureDebut: string, heureFin: string): string {
    if (!heureDebut || !heureFin) return '';

    const [h1, m1] = heureDebut.split(':').map(Number);
    const [h2, m2] = heureFin.split(':').map(Number);

    const debutMinutes = h1 * 60 + m1;
    const finMinutes = h2 * 60 + m2;
    const dureeMinutes = finMinutes - debutMinutes;

    const heures = Math.floor(dureeMinutes / 60);
    const minutes = dureeMinutes % 60;

    if (heures > 0 && minutes > 0) {
      return `${heures}h${minutes}`;
    } else if (heures > 0) {
      return `${heures}h`;
    } else {
      return `${minutes}min`;
    }
  }

  getAlerteTypeClass(type: string): string {
    if (!type) return 'info';
    const typeLower = type.toLowerCase();
    if (typeLower.includes('examen') || typeLower.includes('exam')) return 'examen';
    if (typeLower.includes('session')) return 'session';
    return 'info';
  }

  getAlerteIconClass(type: string): string {
    return this.getAlerteTypeClass(type);
  }

  getAlerteIcon(type: string): string {
    const typeClass = this.getAlerteTypeClass(type);
    if (typeClass === 'examen') return 'document-text';
    if (typeClass === 'session') return 'calendar';
    return 'information-circle';
  }

  goToAlerte(index: number) {
    this.currentAlerteIndex = index;
    // Redémarrer le slider automatique après un clic manuel
    if (this.alertes.length > 1) {
      this.startAutoSlide();
    }
  }

  onSwipeStart(event: TouchEvent) {
    this.swipeStartX = event.touches[0].clientX;
    // Arrêter le slider automatique pendant le swipe
    this.stopAutoSlide();
  }

  onSwipeMove(event: TouchEvent) {
    this.swipeEndX = event.touches[0].clientX;
  }

  onSwipeEnd() {
    const diff = this.swipeStartX - this.swipeEndX;
    const threshold = 50; // Minimum distance for swipe

    if (Math.abs(diff) > threshold) {
      if (diff > 0 && this.currentAlerteIndex < this.alertes.length - 1) {
        // Swipe left - next
        this.currentAlerteIndex++;
      } else if (diff < 0 && this.currentAlerteIndex > 0) {
        // Swipe right - previous
        this.currentAlerteIndex--;
      }
    }

    // Redémarrer le slider automatique après le swipe
    if (this.alertes.length > 1) {
      this.startAutoSlide();
    }
  }

  getNoteInitial(matiereName: string): string {
    if (!matiereName || matiereName.trim().length === 0) return '?';
    return matiereName.trim().charAt(0).toUpperCase();
  }

  getNoteIconClass(index: number): string {
    return index % 2 === 0 ? 'green' : 'orange';
  }

  getNoteBadgeClass(note: number): string {
    if (note >= 16) return 'green-badge';
    if (note >= 12) return 'orange-badge';
    return 'red-badge';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate();
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  }
}
