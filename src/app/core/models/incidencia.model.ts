/** Estados posibles del ciclo de vida de una incidencia. */
export type Estado = 'abierta' | 'en_proceso' | 'cerrada';

/** Prioridad con la que el equipo prioriza el trabajo. */
export type Prioridad = 'alta' | 'media' | 'baja';

/** Áreas del centro a las que se puede asociar una incidencia. */
export type Categoria =
  | 'Equipamiento'
  | 'Redes'
  | 'Software'
  | 'Mobiliario'
  | 'Cuentas'
  | 'Otros';

/** Registro de la tabla `incidencias` del servicio SQL simulado. */
export interface Incidencia {
  readonly id: number;
  readonly codigo: string;
  readonly titulo: string;
  readonly descripcion: string;
  readonly estado: Estado;
  readonly prioridad: Prioridad;
  readonly categoria: Categoria;
  /** Fecha de alta en formato ISO. */
  readonly fecha: string;
  readonly solicitanteId: number;
  readonly solicitante: string;
  /** Última modificación, en formato ISO. */
  readonly actualizadoEn: string;
}

/** Datos del formulario de alta de incidencia. */
export interface NuevaIncidencia {
  titulo: string;
  descripcion: string;
  prioridad: Prioridad;
  categoria: Categoria;
  solicitanteId: number;
}
