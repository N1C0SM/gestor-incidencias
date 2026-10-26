import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  ViewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { filter, map, startWith } from 'rxjs';

import { HeaderComponent } from '@shared/components/header';
import { TabBarComponent } from '@shared/components/tabbar';

/**
 * Marco de la zona autenticada: cabecera oscura, contenido desplazable y barra
 * de navegación inferior. Las páginas hijas se cargan con `router-outlet`, así
 * que la cabecera y la barra no se vuelven a montar al navegar.
 */
@Component({
  selector: 'app-shell',
  imports: [IonContent, RouterOutlet, HeaderComponent, TabBarComponent],
  template: `
    <button type="button" class="gi-skip-link" (click)="saltarAlContenido()">
        Saltar al contenido principal
      </button>

      <app-header [titulo]="titulo()" />

      <ion-content>
        <main id="contenido-principal" #principal tabindex="-1">
          <router-outlet />
        </main>
      </ion-content>

      <app-tabbar />
  `,
  styles: `
    #contenido-principal {
      display: block;
      outline: none;
    }
  `,
  host: { class: 'ion-page' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellComponent {
  private readonly router = inject(Router);

  @ViewChild('principal')
  private principal?: ElementRef<HTMLElement>;

  /** Título de la cabecera, tomado de los `data` de la ruta activa. */
  readonly titulo = toSignal(
    this.router.events.pipe(
      filter((evento): evento is NavigationEnd => evento instanceof NavigationEnd),
      map(() => this.tituloRutaActiva()),
      startWith('Incidencias'),
    ),
    { initialValue: 'Incidencias' },
  );

  /** Mueve el foco al contenido al usar el enlace de salto (teclado). */
  saltarAlContenido(): void {
    this.principal?.nativeElement.focus();
  }

  private tituloRutaActiva(): string {
    let ruta = this.router.routerState.snapshot.root;
    while (ruta.firstChild) {
      ruta = ruta.firstChild;
    }
    const titulo = ruta.data['titulo'] as string | undefined;
    return titulo ?? 'Incidencias';
  }
}
