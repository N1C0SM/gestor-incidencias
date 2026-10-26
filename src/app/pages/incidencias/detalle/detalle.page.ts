import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonButton, IonIcon, IonSpinner } from '@ionic/angular';

import type { Estado, Incidencia } from '@core/models';
import { AuthService } from '@core/services/auth.service';
import { ExportService } from '@core/services/export.service';
import { NotificacionService } from '@core/services/notificacion.service';
import { SqlService } from '@core/services/sql.service';
import {
  COLOR_ESTADO,
  ESTADOS,
  ETIQUETA_ESTADO,
  ETIQUETA_PRIORIDAD,
  formatearFechaHora,
} from '@core/utils/etiquetas';

/**
 * Pantalla de detalle de una incidencia.
 *
 * El código llega por el parámetro `:codigo` de la ruta y se enlaza solo al
 * `input()` gracias a `withComponentInputBinding`. El administrador puede
 * cambiar el estado; el usuario solo consulta sus propias incidencias. Si la
 * incidencia no existe o no pertenece al usuario, se vuelve al listado.
 */
@Component({
  selector: 'app-detalle',
  imports: [IonButton, IonIcon, IonSpinner, RouterLink],
  templateUrl: './detalle.page.html',
  styleUrl: './detalle.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetallePage {
  private readonly sql = inject(SqlService);
  private readonly auth = inject(AuthService);
  private readonly exportService = inject(ExportService);
  private readonly notificacion = inject(NotificacionService);
  private readonly router = inject(Router);

  /** Código de la incidencia, enlazado desde el parámetro de ruta. */
  readonly codigo = input<string>('');

  /** `true` cuando la sesión pertenece a un administrador. */
  readonly esAdmin = this.auth.esAdmin;

  private readonly _incidencia = signal<Incidencia | null>(null);

  /** Incidencia cargada (o `null` mientras se busca o si no hay acceso). */
  readonly incidencia = this._incidencia.asReadonly();

  /** `true` mientras se carga la incidencia. */
  readonly cargando = signal(true);

  /** `true` mientras se envía un cambio de estado. */
  readonly actualizando = signal(false);

  /** Estados disponibles, en el orden del ciclo de vida. */
  protected readonly ESTADOS = ESTADOS;

  /** Etiquetas legibles de estado y prioridad. */
  protected readonly ETIQUETA_ESTADO = ETIQUETA_ESTADO;
  protected readonly ETIQUETA_PRIORIDAD = ETIQUETA_PRIORIDAD;

  /** Colores de cada estado, para el punto de los botones. */
  protected readonly COLOR_ESTADO = COLOR_ESTADO;

  /** Formatea una fecha ISO como `26 oct, 12:22`. */
  protected readonly formatearFechaHora = formatearFechaHora;

  constructor() {
    // Cada vez que la ruta cambia el código, se vuelve a cargar la incidencia.
    effect(() => {
      const codigo = this.codigo().trim();
      if (codigo.length === 0) {
        return;
      }
      void untracked(() => this.cargar(codigo));
    });
  }

  /** Cambia el estado de la incidencia (solo administrador). */
  async cambiarEstado(estado: Estado): Promise<void> {
    const incidencia = this._incidencia();
    if (!incidencia || incidencia.estado === estado || this.actualizando()) {
      return;
    }

    this.actualizando.set(true);
    try {
      const actualizada = await this.sql.actualizarEstado(
        incidencia.codigo,
        estado,
        this.auth.nombre(),
      );

      if (!actualizada) {
        await this.notificacion.error('No se ha podido actualizar el estado de la incidencia.');
        return;
      }

      // Recarga desde el servicio para reflejar la fecha de actualización.
      const recargada = await this.sql.buscarIncidencia(incidencia.codigo);
      this._incidencia.set(recargada ?? actualizada);

      await this.notificacion.exito(`Estado actualizado a «${ETIQUETA_ESTADO[estado]}».`);
    } finally {
      this.actualizando.set(false);
    }
  }

  /** Descarga el resumen de la incidencia en PDF. */
  exportarPdf(): void {
    const incidencia = this._incidencia();
    if (incidencia) {
      this.exportService.exportarIncidenciaPdf(incidencia);
    }
  }

  /** Busca la incidencia y comprueba que la sesión puede verla. */
  private async cargar(codigo: string): Promise<void> {
    this.cargando.set(true);

    try {
      const incidencia = await this.sql.buscarIncidencia(codigo);
      const usuario = this.auth.usuario();

      if (!incidencia) {
        this._incidencia.set(null);
        await this.notificacion.info('La incidencia solicitada no existe.');
        await this.router.navigate(['/app/incidencias']);
        return;
      }

      if (!this.esAdmin() && incidencia.solicitanteId !== usuario?.id) {
        this._incidencia.set(null);
        await this.notificacion.info('No tienes permiso para ver esa incidencia.');
        await this.router.navigate(['/app/incidencias']);
        return;
      }

      this._incidencia.set(incidencia);
    } catch {
      this._incidencia.set(null);
      await this.notificacion.error('No se ha podido cargar la incidencia.');
    } finally {
      this.cargando.set(false);
    }
  }
}
