import {
  ChangeDetectionStrategy,
  Component,
  type OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  IonButton,
  IonIcon,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
} from '@ionic/angular';

import type { Estado, Incidencia } from '@core/models';
import { AuthService } from '@core/services/auth.service';
import { ExportService } from '@core/services/export.service';
import { NotificacionService } from '@core/services/notificacion.service';
import { SqlService } from '@core/services/sql.service';
import { DataTableComponent } from '@shared/components/data-table';

/** Filtro activo del segmento: «todas» o uno de los estados del ciclo de vida. */
type FiltroListado = 'todas' | Estado;

/** Opción que pinta cada botón del segmento. */
interface OpcionFiltro {
  readonly valor: FiltroListado;
  readonly etiqueta: string;
}

/** Opciones del segmento, en el orden de la maqueta. */
const OPCIONES_FILTRO: readonly OpcionFiltro[] = [
  { valor: 'todas', etiqueta: 'Todas' },
  { valor: 'abierta', etiqueta: 'Abiertas' },
  { valor: 'en_proceso', etiqueta: 'En proceso' },
  { valor: 'cerrada', etiqueta: 'Cerradas' },
];

/**
 * Comprueba que el valor emitido por el segmento es un filtro conocido.
 * El componente de Ionic emite `string | number | undefined`, así que hay que
 * estrechar el tipo antes de guardarlo en el signal.
 */
function esFiltro(valor: string | number | undefined): valor is FiltroListado {
  return valor === 'todas' || valor === 'abierta' || valor === 'en_proceso' || valor === 'cerrada';
}

/**
 * Pantalla de listado de incidencias.
 *
 * El administrador consulta las incidencias de todo el centro y ve la columna
 * del solicitante; el usuario solo ve las suyas. El segmento filtra por estado
 * y los botones CSV/PDF exportan exactamente el listado que se está viendo.
 */
@Component({
  selector: 'app-listado',
  imports: [
    IonButton,
    IonIcon,
    IonLabel,
    IonSegment,
    IonSegmentButton,
    IonSpinner,
    DataTableComponent,
  ],
  templateUrl: './listado.page.html',
  styleUrl: './listado.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListadoPage implements OnInit {
  private readonly sql = inject(SqlService);
  private readonly auth = inject(AuthService);
  private readonly exportService = inject(ExportService);
  private readonly notificacion = inject(NotificacionService);
  private readonly router = inject(Router);

  /** `true` cuando la sesión pertenece a un administrador. */
  readonly esAdmin = this.auth.esAdmin;

  /** Filtro seleccionado en el segmento. */
  readonly filtro = signal<FiltroListado>('todas');

  /** `true` mientras el servicio SQL simulado devuelve los datos. */
  readonly cargando = signal(true);

  /** Opciones que pinta el segmento. */
  protected readonly opciones = OPCIONES_FILTRO;

  private readonly _incidencias = signal<readonly Incidencia[]>([]);

  /** Incidencias visibles para el rol, antes de filtrar por estado. */
  readonly incidencias = this._incidencias.asReadonly();

  /** Incidencias que se muestran en la tabla, ya filtradas por el segmento. */
  readonly filtradas = computed<readonly Incidencia[]>(() => {
    const filtro = this.filtro();
    const incidencias = this._incidencias();

    return filtro === 'todas'
      ? incidencias
      : incidencias.filter((incidencia) => incidencia.estado === filtro);
  });

  /** Título de la página según el rol de la sesión. */
  readonly titulo = computed(() => (this.esAdmin() ? 'Todas las incidencias' : 'Mis incidencias'));

  /** Subtítulo de la página según el rol de la sesión. */
  readonly subtitulo = computed(() =>
    this.esAdmin()
      ? 'Consulta y gestiona las incidencias de todo el centro.'
      : 'Consulta el estado de las incidencias que has registrado.',
  );

  /** Mensaje del estado vacío: sin datos o sin resultados para el filtro. */
  readonly mensajeVacio = computed(() => {
    if (this._incidencias().length === 0) {
      return this.esAdmin()
        ? 'Todavía no hay incidencias registradas en el centro.'
        : 'Todavía no has registrado ninguna incidencia.';
    }
    return 'No hay incidencias en este estado.';
  });

  /** Nombre de los ficheros exportados, según el rol de la sesión. */
  private readonly nombreInforme = computed(() =>
    this.esAdmin() ? 'incidencias-centro' : 'mis-incidencias',
  );

  ngOnInit(): void {
    void this.cargar();
  }

  /** Filtra la tabla cuando cambia el segmento. */
  cambiarFiltro(evento: Event): void {
    const valor = (evento as CustomEvent<{ value?: string | number }>).detail?.value;
    if (esFiltro(valor)) {
      this.filtro.set(valor);
    }
  }

  /** Abre el detalle de la incidencia pulsada. */
  abrirDetalle(incidencia: Incidencia): void {
    void this.router.navigate(['/app/incidencias', incidencia.codigo]);
  }

  /** Navega al formulario de alta. */
  nueva(): void {
    void this.router.navigate(['/app/incidencias/nueva']);
  }

  /** Exporta en CSV el listado filtrado que se está viendo. */
  exportarCsv(): void {
    this.exportService.exportarCsv(this.filtradas(), this.nombreInforme());
  }

  /** Exporta en PDF el listado filtrado que se está viendo. */
  exportarPdf(): void {
    this.exportService.exportarPdf(this.filtradas(), this.titulo(), this.nombreInforme());
  }

  /** Carga las incidencias que corresponden al rol de la sesión. */
  private async cargar(): Promise<void> {
    this.cargando.set(true);

    try {
      const usuario = this.auth.usuario();
      let incidencias: readonly Incidencia[] = [];

      if (this.esAdmin()) {
        incidencias = await this.sql.getIncidencias();
      } else if (usuario) {
        incidencias = await this.sql.getIncidenciasDe(usuario.id);
      }

      this._incidencias.set(incidencias);
    } catch {
      this._incidencias.set([]);
      await this.notificacion.error('No se han podido cargar las incidencias.');
    } finally {
      this.cargando.set(false);
    }
  }
}
