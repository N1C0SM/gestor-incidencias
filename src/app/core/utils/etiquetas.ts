import type { Categoria, Estado, Prioridad } from '../models';

/** Nombre legible de cada estado. */
export const ETIQUETA_ESTADO: Readonly<Record<Estado, string>> = {
  abierta: 'Abierta',
  en_proceso: 'En proceso',
  cerrada: 'Cerrada',
};

/** Nombre legible de cada prioridad. */
export const ETIQUETA_PRIORIDAD: Readonly<Record<Prioridad, string>> = {
  alta: 'Alta',
  media: 'Media',
  baja: 'Baja',
};

/** Color de marca de cada estado (coincide con la maqueta de la entrega). */
export const COLOR_ESTADO: Readonly<Record<Estado, string>> = {
  abierta: '#b45309',
  en_proceso: '#1d4ed8',
  cerrada: '#15803d',
};

/** Color de cada prioridad. */
export const COLOR_PRIORIDAD: Readonly<Record<Prioridad, string>> = {
  alta: '#b91c1c',
  media: '#b45309',
  baja: '#64748b',
};

/** Estados en el orden del ciclo de vida. */
export const ESTADOS: readonly Estado[] = ['abierta', 'en_proceso', 'cerrada'];

/** Prioridades de mayor a menor urgencia. */
export const PRIORIDADES: readonly Prioridad[] = ['alta', 'media', 'baja'];

/** Categorías del centro. */
export const CATEGORIAS: readonly Categoria[] = [
  'Equipamiento',
  'Redes',
  'Software',
  'Mobiliario',
  'Cuentas',
  'Otros',
];

const MESES: readonly string[] = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
];

/** Formatea una fecha ISO como `26 oct 2026`. */
export function formatearFecha(iso: string | null | undefined): string {
  if (!iso) {
    return '—';
  }
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) {
    return '—';
  }
  const mes = MESES[fecha.getMonth()] ?? '';
  return `${fecha.getDate()} ${mes} ${fecha.getFullYear()}`;
}

/** Formatea una fecha ISO como `26 oct, 12:22`. */
export function formatearFechaHora(iso: string | null | undefined): string {
  if (!iso) {
    return '—';
  }
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) {
    return '—';
  }
  const mes = MESES[fecha.getMonth()] ?? '';
  const horas = String(fecha.getHours()).padStart(2, '0');
  const minutos = String(fecha.getMinutes()).padStart(2, '0');
  return `${fecha.getDate()} ${mes}, ${horas}:${minutos}`;
}

/**
 * Fecha pensada para celdas de tabla: mantiene unida la parte «26 oct» con un
 * espacio duro y deja el año como único punto de salto, de modo que la columna
 * puede partir en dos líneas sin desbordar la tarjeta.
 */
export function formatearFechaTabla(iso: string | null | undefined): string {
  const partes = formatearFecha(iso).split(' ');
  if (partes.length !== 3) {
    return formatearFecha(iso);
  }
  return `${partes[0]}\u00A0${partes[1]} ${partes[2]}`;
}

/** Clase CSS del color de un estado. */
export function claseEstado(estado: Estado): string {
  return `gi-table__estado--${estado}`;
}
