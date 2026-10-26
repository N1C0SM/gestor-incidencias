import {
  ChangeDetectionStrategy,
  Component,
  type OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { IonButton, IonIcon, IonSpinner } from '@ionic/angular';

import type { Estado, Estadisticas, Incidencia } from '@core/models';
import { AuthService } from '@core/services/auth.service';
import { ExportService } from '@core/services/export.service';
import { NosqlService } from '@core/services/nosql.service';
import { NotificacionService } from '@core/services/notificacion.service';
import { SqlService } from '@core/services/sql.service';
import { COLOR_ESTADO, formatearFechaHora } from '@core/utils/etiquetas';
import { DataTableComponent } from '@shared/components/data-table';
import { StatCardComponent } from '@shared/components/stat-card';

import { GraficoEstadosComponent } from './grafico-estados.component';

/** Filtros del panel: los tres estados y la vista sin filtrar. */
type FiltroPanel = 'todas' | Estado;

/** Datos de una tarjeta de indicador del panel. */
interface IndicadorPanel {
  readonly filtro: FiltroPanel;
  readonly etiqueta: string;
  readonly valor: number;
  readonly detalle: string;
  readonly color: string;
}

/** Texto del filtro activo, usado en el título de la tabla y en los informes. */
const TEXTO_FILTRO: Readonly<Record<FiltroPanel, string>> = {
  todas: 'todas las incidencias',
  abierta: 'abiertas',
  en_proceso: 'en proceso',
  cerrada: 'cerradas',
};

/**
 * Panel de administración del centro.
 *
 * Resume el estado de las incidencias con cuatro indicadores, un gráfico de
 * barras (Chart.js), la tabla filtrable y el feed de actividad del servicio
 * NoSQL simulado. Todos los datos se piden en paralelo al servicio SQL al
 * entrar en la pantalla y al pulsar «Actualizar».
 */
@Component({
  selector: 'app-dashboard',
  imports: [
    IonButton,
    IonIcon,
    IonSpinner,
    StatCardComponent,
    DataTableComponent,
    GraficoEstadosComponent,
  ],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage implements OnInit {
  private readonly sql = inject(SqlService);
  private readonly nosql = inject(NosqlService);
  private readonly auth = inject(AuthService);
  private readonly exportacion = inject(ExportService);
  private readonly notificacion = inject(NotificacionService);
  private readonly router = inject(Router);

  /** Nombre del usuario autenticado, para el saludo de la cabecera. */
  readonly nombre = this.auth.nombre;

  /** `true` durante la primera carga de datos. */
  readonly cargando = signal(true);

  /** `true` mientras se refrescan los datos con el botón «Actualizar». */
  readonly actualizando = signal(false);

  /** Filtro activo de las tarjetas y de la tabla. */
  readonly filtro = signal<FiltroPanel>('todas');

  /** Feed de actividad del servicio NoSQL (más reciente primero). */
  readonly actividad = toSignal(this.nosql.actividad$, {
    initialValue: this.nosql.instantanea,
  });

  private readonly estadisticas = signal<Estadisticas | null>(null);
  private readonly incidencias = signal<readonly Incidencia[]>([]);

  /** Total de incidencias registradas. */
  readonly total = computed(() => this.estadisticas()?.total ?? 0);

  /** Incidencias pendientes de revisar. */
  readonly abiertas = computed(() => this.estadisticas()?.abiertas ?? 0);

  /** Incidencias que está revisando el equipo. */
  readonly enProceso = computed(() => this.estadisticas()?.enProceso ?? 0);

  /** Incidencias ya resueltas. */
  readonly cerradas = computed(() => this.estadisticas()?.cerradas ?? 0);

  /** Usuarios registrados en el centro. */
  readonly usuarios = computed(() => this.estadisticas()?.usuarios ?? 0);

  /** Tarjetas de indicadores, con el filtro al que está asociada cada una. */
  readonly indicadores = computed<readonly IndicadorPanel[]>(() => [
    {
      filtro: 'todas',
      etiqueta: 'Total',
      valor: this.total(),
      detalle: `${this.usuarios()} usuarios registrados`,
      color: '#1d4ed8',
    },
    {
      filtro: 'abierta',
      etiqueta: 'Abiertas',
      valor: this.abiertas(),
      detalle: 'Pendientes de revisar',
      color: COLOR_ESTADO.abierta,
    },
    {
      filtro: 'en_proceso',
      etiqueta: 'En proceso',
      valor: this.enProceso(),
      detalle: 'Las está revisando el equipo',
      color: COLOR_ESTADO.en_proceso,
    },
    {
      filtro: 'cerrada',
      etiqueta: 'Cerradas',
      valor: this.cerradas(),
      detalle: 'Ya están resueltas',
      color: COLOR_ESTADO.cerrada,
    },
  ]);

  /** Valores que alimentan el gráfico, en el orden de los tres estados. */
  readonly valoresGrafico = computed<readonly number[]>(() => [
    this.abiertas(),
    this.enProceso(),
    this.cerradas(),
  ]);

  /** Filas de la tabla según el filtro activo. */
  readonly filas = computed<readonly Incidencia[]>(() => {
    const filtro = this.filtro();
    const incidencias = this.incidencias();

    return filtro === 'todas'
      ? incidencias
      : incidencias.filter((incidencia) => incidencia.estado === filtro);
  });

  /** Título del bloque de tabla, p. ej. «Incidencias · en proceso». */
  readonly tituloTabla = computed(() => `Incidencias · ${TEXTO_FILTRO[this.filtro()]}`);

  /** Formatea la fecha de cada documento del feed. */
  protected readonly formatearFechaHora = formatearFechaHora;

  ngOnInit(): void {
    void this.cargar();
  }

  /** Aplica el filtro de una tarjeta y repinta la tabla. */
  filtrar(filtro: FiltroPanel): void {
    this.filtro.set(filtro);
  }

  /** Vuelve a pedir las estadísticas y el listado al servicio SQL. */
  async actualizar(): Promise<void> {
    if (this.actualizando()) {
      return;
    }

    this.actualizando.set(true);
    await this.cargar();
  }

  /** Exporta el listado filtrado en CSV. */
  exportarCsv(): void {
    if (!this.hayFilas()) {
      void this.notificacion.info('No hay incidencias que exportar con el filtro actual.');
      return;
    }

    this.exportacion.exportarCsv(this.filas(), `panel-${this.filtro()}`);
  }

  /** Exporta el listado filtrado en PDF. */
  exportarPdf(): void {
    if (!this.hayFilas()) {
      void this.notificacion.info('No hay incidencias que exportar con el filtro actual.');
      return;
    }

    this.exportacion.exportarPdf(
      this.filas(),
      `Incidencias · ${TEXTO_FILTRO[this.filtro()]}`,
      `panel-${this.filtro()}`,
    );
  }

  /** Abre la ficha de la incidencia seleccionada en la tabla. */
  abrirDetalle(incidencia: Incidencia): void {
    void this.router.navigate(['/app/incidencias', incidencia.codigo]);
  }

  /** `true` cuando hay filas que exportar con el filtro activo. */
  private hayFilas(): boolean {
    return this.filas().length > 0;
  }

  /** Carga estadísticas y listado en paralelo y actualiza el estado de la pantalla. */
  private async cargar(): Promise<void> {
    try {
      const [estadisticas, incidencias] = await Promise.all([
        this.sql.getEstadisticas(),
        this.sql.getIncidencias(),
      ]);

      this.estadisticas.set(estadisticas);
      this.incidencias.set(incidencias);
    } catch {
      void this.notificacion.error('No se han podido cargar los datos del panel.');
    } finally {
      this.cargando.set(false);
      this.actualizando.set(false);
    }
  }
}
