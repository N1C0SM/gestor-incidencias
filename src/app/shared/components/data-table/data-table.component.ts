import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  computed,
  signal,
} from '@angular/core';
import { IonIcon } from '@ionic/angular';

import type { Incidencia } from '@core/models';
import {
  ETIQUETA_ESTADO,
  ETIQUETA_PRIORIDAD,
  formatearFechaTabla,
} from '@core/utils/etiquetas';

/**
 * Tabla de incidencias reutilizable.
 *
 * Incluye el buscador y el contador de registros. Expone `@Input` para
 * configurar qué columnas se ven y `@Output` para notificar la acción «Ver».
 * Se usa en el panel (todas las incidencias) y en el listado del usuario.
 */
@Component({
  selector: 'app-data-table',
  imports: [IonIcon],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableComponent {
  private readonly _incidencias = signal<readonly Incidencia[]>([]);
  private readonly _busqueda = signal('');

  /** Filas que se muestran en la tabla. */
  @Input({ required: true })
  set incidencias(valor: readonly Incidencia[] | null | undefined) {
    this._incidencias.set(valor ?? []);
  }

  get incidencias(): readonly Incidencia[] {
    return this._incidencias();
  }

  /** Muestra u oculta la columna del solicitante. */
  @Input() mostrarSolicitante = true;

  /** Muestra u oculta la columna de acciones. */
  @Input() mostrarAcciones = true;

  /** Muestra u oculta el buscador. */
  @Input() conBuscador = true;

  /** Muestra u oculta el contador de registros. */
  @Input() conContador = true;

  /** Texto que se muestra cuando no hay filas. */
  @Input() textoVacio = 'No hay incidencias que mostrar.';

  /** Se emite al pulsar «Ver» en una fila. */
  @Output() readonly ver = new EventEmitter<Incidencia>();

  /** Filas tras aplicar el buscador. */
  readonly filtradas = computed<readonly Incidencia[]>(() => {
    const termino = this._busqueda().trim().toLowerCase();
    const incidencias = this._incidencias();

    if (termino.length === 0) {
      return incidencias;
    }

    return incidencias.filter((incidencia) =>
      [
        incidencia.codigo,
        incidencia.titulo,
        incidencia.descripcion,
        incidencia.categoria,
        incidencia.solicitante,
        ETIQUETA_ESTADO[incidencia.estado],
        ETIQUETA_PRIORIDAD[incidencia.prioridad],
      ]
        .join(' ')
        .toLowerCase()
        .includes(termino),
    );
  });

  /** Total de filas recibidas (sin filtrar). */
  readonly total = computed(() => this._incidencias().length);

  /** Número de columnas, para el `colspan` del mensaje vacío. */
  readonly columnas = computed(
    () => 5 + (this.mostrarSolicitante ? 1 : 0) + (this.mostrarAcciones ? 1 : 0),
  );

  /** Texto actual del buscador. */
  readonly busqueda = this._busqueda.asReadonly();

  /** Formatea la fecha de una fila (permite el salto de línea de la maqueta). */
  protected readonly formatearFecha = formatearFechaTabla;

  /** Etiquetas legibles de estado y prioridad. */
  protected readonly ETIQUETA_ESTADO = ETIQUETA_ESTADO;
  protected readonly ETIQUETA_PRIORIDAD = ETIQUETA_PRIORIDAD;

  /** Actualiza el filtro de búsqueda. */
  alBuscar(evento: Event): void {
    const objetivo = evento.target as HTMLInputElement | null;
    this._busqueda.set(objetivo?.value ?? '');
  }

  /** Devuelve la clase del color de un estado. */
  claseEstado(estado: Incidencia['estado']): string {
    return `gi-table__estado--${estado}`;
  }
}
