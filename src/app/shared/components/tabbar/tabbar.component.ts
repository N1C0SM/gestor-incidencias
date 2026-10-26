import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { IonIcon } from '@ionic/angular';

import { AuthService } from '@core/services/auth.service';
import { NotificacionService } from '@core/services/notificacion.service';

interface EnlaceTab {
  readonly ruta: string;
  readonly etiqueta: string;
  readonly icono: string;
}

/**
 * Barra de navegación inferior. La componen los enlaces de la aplicación y la
 * acción «Salir»; el enlace «Panel» solo aparece para el rol administrador.
 */
@Component({
  selector: 'app-tabbar',
  imports: [IonIcon, RouterLink, RouterLinkActive],
  template: `
    <nav class="gi-tabbar" aria-label="Navegación principal">
      @for (enlace of enlaces(); track enlace.ruta) {
        <a
          class="gi-tab"
          [routerLink]="enlace.ruta"
          routerLinkActive="gi-tab--active"
          #enlaceActivo="routerLinkActive"
          [attr.aria-current]="enlaceActivo.isActive ? 'page' : null"
        >
          <ion-icon [name]="enlace.icono" aria-hidden="true" />
          <span>{{ enlace.etiqueta }}</span>
        </a>
      }

      <button class="gi-tab" type="button" (click)="salir()">
        <ion-icon name="log-out-outline" aria-hidden="true" />
        <span>Salir</span>
      </button>
    </nav>
  `,
  styles: `
    :host {
      display: block;
      flex: none;
    }

    .gi-tab--active ion-icon {
      color: var(--gi-primary);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabBarComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notificacion = inject(NotificacionService);

  /** Enlaces visibles según el rol del usuario autenticado. */
  readonly enlaces = computed<readonly EnlaceTab[]>(() => {
    const incidencias: EnlaceTab = {
      ruta: '/app/incidencias',
      etiqueta: 'Incidencias',
      icono: 'list-outline',
    };
    const ayuda: EnlaceTab = { ruta: '/app/ayuda', etiqueta: 'Ayuda', icono: 'help-circle-outline' };

    if (!this.auth.esAdmin()) {
      return [incidencias, ayuda];
    }

    const panel: EnlaceTab = { ruta: '/app/panel', etiqueta: 'Panel', icono: 'bar-chart-outline' };
    return [panel, incidencias, ayuda];
  });

  /** Cierra la sesión, avisa y vuelve a la pantalla de acceso. */
  async salir(): Promise<void> {
    const nombre = this.auth.nombre().split(' ')[0] ?? '';
    this.auth.cerrarSesion();
    await this.router.navigate(['/login']);
    await this.notificacion.info(nombre ? `Sesión cerrada. ¡Hasta pronto, ${nombre}!` : 'Sesión cerrada.');
  }
}
