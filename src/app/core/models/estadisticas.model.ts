/** Indicadores que alimentan las tarjetas del panel. */
export interface Estadisticas {
  readonly total: number;
  readonly abiertas: number;
  readonly enProceso: number;
  readonly cerradas: number;
  readonly usuarios: number;
}
