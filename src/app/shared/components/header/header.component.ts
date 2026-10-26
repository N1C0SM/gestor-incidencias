import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IonHeader, IonTitle, IonToolbar } from '@ionic/angular';

/**
 * Barra superior oscura común a todas las pantallas internas.
 * El título cambia según la ruta activa.
 */
@Component({
  selector: 'app-header',
  imports: [IonHeader, IonToolbar, IonTitle],
  template: `
    <ion-header class="gi-header">
      <ion-toolbar class="gi-toolbar">
        <ion-title class="gi-toolbar__title">{{ titulo() }}</ion-title>
      </ion-toolbar>
    </ion-header>
  `,
  styles: `
    :host {
      display: block;
      flex: none;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  /** Título que se muestra en la barra (viene de los `data` de la ruta). */
  readonly titulo = input<string>('Incidencias');
}
