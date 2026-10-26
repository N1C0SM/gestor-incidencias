import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IonIcon } from '@ionic/angular';

/**
 * Tarjeta oscura de presentación que acompaña a los formularios de acceso y
 * registro. Repite la identidad del módulo y las tres capacidades clave.
 */
@Component({
  selector: 'app-brand-panel',
  imports: [IonIcon],
  template: `
    <aside class="gi-brand" aria-label="Presentación de la aplicación">
      <span class="gi-brand__logo" aria-hidden="true">GI</span>

      <p class="gi-brand__eyebrow">Ciclo DAM · Módulo DI 0488</p>
      <p class="gi-brand__title">Gestor de Incidencias</p>
      <p class="gi-brand__text">
        Una única aplicación para registrar, seguir y resolver las incidencias del centro.
      </p>

      <ul class="gi-brand__list">
        <li>
          <ion-icon name="checkmark-circle-outline" aria-hidden="true" />
          Acceso con dos roles
        </li>
        <li>
          <ion-icon name="checkmark-circle-outline" aria-hidden="true" />
          Panel con gráficos
        </li>
        <li>
          <ion-icon name="checkmark-circle-outline" aria-hidden="true" />
          Informes en PDF y CSV
        </li>
      </ul>
    </aside>
  `,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrandPanelComponent {}
