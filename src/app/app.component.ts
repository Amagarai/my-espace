import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { FcmService } from './services/fcm.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  constructor(private fcmService: FcmService) {}

  async ngOnInit() {
    // Initialiser et enregistrer le token FCM au démarrage de l'application
    await this.fcmService.initializeAndRegister();
  }
}
