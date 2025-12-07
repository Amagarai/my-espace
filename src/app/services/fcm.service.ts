import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { FCM } from '@capacitor-community/fcm';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

export interface FcmTokenRequest {
  token: string;
  studentLocalId: string;
}

export interface FcmTokenResponse {
  localId: string;
  token: string;
  etat: string;
}

@Injectable({
  providedIn: 'root'
})
export class FcmService {
  private apiUrl = environment.apiUrl || 'http://localhost:8080/api';

  constructor(
    private http: HttpClient,
  ) {}

  /**
   * Demande les permissions de notification (nécessaire pour iOS)
   */
  async requestPermissions(): Promise<boolean> {
    try {
      if (!Capacitor.isNativePlatform()) {
        console.log('Les notifications ne sont disponibles que sur les plateformes natives');
        return false;
      }

      // Vérifier les permissions actuelles
      const permissionStatus = await PushNotifications.checkPermissions();

      if (permissionStatus.receive === 'granted') {
        console.log('✅ Permissions de notification déjà accordées');
        return true;
      }

      // Demander les permissions
      console.log('📱 Demande des permissions de notification...');
      const permissionResult = await PushNotifications.requestPermissions();

      if (permissionResult.receive === 'granted') {
        console.log('✅ Permissions de notification accordées');
        return true;
      } else {
        console.warn('⚠️ Permissions de notification refusées:', permissionResult);
        return false;
      }
    } catch (error) {
      console.error('❌ Erreur lors de la demande de permissions:', error);
      return false;
    }
  }

  /**
   * Attend que le token APNS soit disponible (nécessaire pour iOS)
   */
  private async waitForAPNSToken(timeoutMs: number = 10000): Promise<boolean> {
    return new Promise((resolve) => {
      let resolved = false;
      let registrationListener: any = null;
      let errorListener: any = null;

      const cleanup = () => {
        if (registrationListener) {
          registrationListener.remove();
        }
        if (errorListener) {
          errorListener.remove();
        }
      };

      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          cleanup();
          console.warn('⏱️ Timeout en attendant le token APNS');
          resolve(false);
        }
      }, timeoutMs);

      // Écouter l'événement de registration
      registrationListener = PushNotifications.addListener('registration', (token) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          cleanup();
          console.log('✅ Token APNS reçu:', token.value);
          resolve(true);
        }
      });

      // Écouter les erreurs
      errorListener = PushNotifications.addListener('registrationError', (error) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          cleanup();
          console.error('❌ Erreur lors de l\'enregistrement APNS:', error);
          resolve(false);
        }
      });
    });
  }

  /**
   * Récupère le token FCM de l'appareil
   */
  async getToken(): Promise<string | null> {
    try {
      if (!Capacitor.isNativePlatform()) {
        console.log('FCM n\'est disponible que sur les plateformes natives');
        return null;
      }

      // Pour iOS, s'assurer que les permissions sont accordées
      if (Capacitor.getPlatform() === 'ios') {
        const hasPermission = await this.requestPermissions();
        if (!hasPermission) {
          console.warn('⚠️ Permissions de notification non accordées, impossible de récupérer le token FCM');
          return null;
        }

        // Enregistrer pour les notifications push (nécessaire pour obtenir le token APNS)
        await PushNotifications.register();

        // Attendre que le token APNS soit disponible
        const apnsReady = await this.waitForAPNSToken(15000);
        if (!apnsReady) {
          console.warn('⚠️ Token APNS non reçu, tentative de récupération du token FCM quand même...');
          // On peut quand même essayer, parfois le token APNS est déjà disponible
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      // Récupérer le token FCM
      console.log('🔑 Récupération du token FCM...');
      const result = await FCM.getToken();

      if (result && result.token) {
        console.log('✅ Token FCM récupéré avec succès');
        return result.token;
      }

      return null;
    } catch (error: any) {
      console.error('❌ Erreur lors de la récupération du token FCM:', error);

      // Si l'erreur indique que le token APNS n'est pas disponible, attendre un peu et réessayer
      if (error.message && error.message.includes('APNS')) {
        console.log('🔄 Token APNS non disponible, attente de 3 secondes et nouvel essai...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        try {
          const retryResult = await FCM.getToken();
          if (retryResult && retryResult.token) {
            console.log('✅ Token FCM récupéré après retry');
            return retryResult.token;
          }
        } catch (retryError) {
          console.error('❌ Échec du retry:', retryError);
        }
      }

      return null;
    }
  }

  /**
   * Enregistre le token FCM pour un étudiant
   */
  registerToken(studentLocalId: string, token: string): Observable<FcmTokenResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const request: FcmTokenRequest = {
      token: token,
      studentLocalId: studentLocalId
    };

    return this.http.post<FcmTokenResponse>(
      `${this.apiUrl}/fcm-token/register`,
      request,
      { headers }
    );
  }

  /**
   * Initialise FCM et enregistre le token pour l'étudiant connecté
   */
  async initializeAndRegister(): Promise<void> {
    try {
      // Vérifier si on est sur une plateforme native
      if (!Capacitor.isNativePlatform()) {
        console.log('FCM n\'est disponible que sur les plateformes natives');
        return;
      }

      // Récupérer l'ID de l'étudiant depuis le localStorage
      const studentDetail = localStorage.getItem('studentDetail');
      if (!studentDetail) {
        console.log('Aucun étudiant connecté');
        return;
      }

      const student = JSON.parse(studentDetail);
      const studentLocalId = student.localId;

      if (!studentLocalId) {
        console.log('ID étudiant non trouvé');
        return;
      }

      // Récupérer le token FCM
      const token = await this.getToken();
      if (!token) {
        console.log('Impossible de récupérer le token FCM');
        return;
      }

      // Enregistrer le token
      this.registerToken(studentLocalId, token).subscribe({
        next: (response) => {
          console.log('Token FCM enregistré avec succès:', response);
        },
        error: (error) => {
          console.error('Erreur lors de l\'enregistrement du token FCM:', error);
        }
      });

      // Écouter les notifications reçues
      // FCM.addListener('notificationReceived', (notification) => {
      //   console.log('Notification reçue:', notification);
      // });

    } catch (error) {
      console.error('Erreur lors de l\'initialisation de FCM:', error);
    }
  }
}

