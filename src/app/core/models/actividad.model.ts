/** Tipos de evento que publica el feed NoSQL de actividad. */
export type TipoActividad = 'creacion' | 'cambio_estado' | 'asignacion' | 'cierre';

/** Documento del feed de actividad (servicio NoSQL simulado). */
export interface Actividad {
  readonly id: number;
  readonly texto: string;
  readonly tipo: TipoActividad;
  /** Fecha del evento en formato ISO. */
  readonly fecha: string;
  readonly incidenciaCodigo?: string;
}
