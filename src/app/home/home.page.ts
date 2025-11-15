import { Component, ViewChild, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
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
  megaphoneOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, CommonModule],
})
export class HomePage implements AfterViewInit, OnDestroy {
  @ViewChild(IonContent) content!: IonContent;
  isScrolledDown: boolean = false;
  isScrollingDown: boolean = false;
  scrollOpacity: number = 1;
  lastScrollTop: number = 0;
  private scrollElement: any;

  constructor(private router: Router, private cdr: ChangeDetectorRef) {
    addIcons({leaf,notificationsOutline,calendar,star,flask,calculator,globe,megaphoneOutline, 'logo': '../../assets/logo.svg'});
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
}
