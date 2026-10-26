import { Injectable, inject } from '@angular/core';
import { ToastController } from '@ionic/angular';

type Tono = 'primary' | 'success' | 'danger' | 'dark';

/**
 * Avisos breves y accesibles (toast de Ionic) con una única API para toda la
 * aplicación. Los toasts se anuncian con `aria-live`, así que son visibles
 * también para lectores de pantalla.
 */
@Injectable({ providedIn: 'root' })
export class NotificacionService {
  private readonly toastCtrl = inject(ToastController);

  async mostrar(mensaje: string, tono: Tono = 'dark', duracion = 2400): Promise<void> {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: duracion,
      color: tono,
      position: 'bottom',
      buttons: [{ text: 'Cerrar', role: 'cancel' }],
    });

    await toast.present();
  }

  exito(mensaje: string): Promise<void> {
    return this.mostrar(mensaje, 'success');
  }

  error(mensaje: string): Promise<void> {
    return this.mostrar(mensaje, 'danger', 3200);
  }

  info(mensaje: string): Promise<void> {
    return this.mostrar(mensaje, 'dark');
  }
}
