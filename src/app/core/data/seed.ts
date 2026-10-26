import type { Actividad, Incidencia, Usuario } from '../models';

/**
 * Datos iniciales de la simulación didáctica.
 *
 * Los usuarios y las incidencias viven en memoria: al recargar la página se
 * vuelve a este estado inicial. Las cuentas creadas desde el registro y los
 * cambios de estado tampoco se persisten (solo la sesión se guarda).
 */
export const USUARIOS_SEED: readonly Usuario[] = [
  {
    id: 1,
    nombre: 'Ana Admin',
    email: 'admin@centro.es',
    password: 'Admin123',
    rol: 'admin',
    creadoEn: '2026-09-01T08:00:00',
  },
  {
    id: 2,
    nombre: 'María Técnica',
    email: 'maria@centro.es',
    password: 'Maria123',
    rol: 'admin',
    creadoEn: '2026-09-04T09:30:00',
  },
  {
    id: 3,
    nombre: 'Luis Usuario',
    email: 'usuario@centro.es',
    password: 'Usuario123',
    rol: 'usuario',
    creadoEn: '2026-09-10T10:15:00',
  },
];

export const INCIDENCIAS_SEED: readonly Incidencia[] = [
  {
    id: 1001,
    codigo: 'INC-1001',
    titulo: 'El proyector del aula 12 no enciende',
    descripcion:
      'El proyector del aula 12 no responde al mando ni al botón de encendido. El piloto de corriente está apagado, así que sospechamos del cableado o de la regleta de la pared.',
    estado: 'abierta',
    prioridad: 'alta',
    categoria: 'Equipamiento',
    fecha: '2026-10-26T09:12:00',
    solicitanteId: 3,
    solicitante: 'Luis Usuario',
    actualizadoEn: '2026-10-26T09:12:00',
  },
  {
    id: 1002,
    codigo: 'INC-1002',
    titulo: 'No hay conexión Wi-Fi en la biblioteca',
    descripcion:
      'Desde primera hora de la mañana el punto de acceso de la biblioteca no aparece en la lista de redes. Los equipos de la sala de lectura no pueden conectarse a la intranet.',
    estado: 'abierta',
    prioridad: 'media',
    categoria: 'Redes',
    fecha: '2026-10-26T08:30:00',
    solicitanteId: 2,
    solicitante: 'María Técnica',
    actualizadoEn: '2026-10-26T08:30:00',
  },
  {
    id: 1003,
    codigo: 'INC-1003',
    titulo: 'Alta en el portal del empleado',
    descripcion:
      'Solicitud de alta de la nueva profesora de matemáticas en el portal del empleado, con acceso al aula virtual y al correo corporativo.',
    estado: 'cerrada',
    prioridad: 'media',
    categoria: 'Cuentas',
    fecha: '2026-10-25T11:05:00',
    solicitanteId: 3,
    solicitante: 'Luis Usuario',
    actualizadoEn: '2026-10-25T13:40:00',
  },
  {
    id: 1004,
    codigo: 'INC-1004',
    titulo: 'El teclado del aula 3 no responde',
    descripcion:
      'El teclado del puesto del profesor del aula 3 deja de responder a los pocos minutos de uso. Al reconectar el cable USB vuelve a funcionar unos segundos.',
    estado: 'abierta',
    prioridad: 'baja',
    categoria: 'Equipamiento',
    fecha: '2026-10-24T16:40:00',
    solicitanteId: 1,
    solicitante: 'Ana Admin',
    actualizadoEn: '2026-10-24T16:40:00',
  },
  {
    id: 1005,
    codigo: 'INC-1005',
    titulo: 'Error al subir notas a la plataforma',
    descripcion:
      'La plataforma de gestión devuelve un error 500 al intentar subir el acta de la segunda evaluación. Ocurre en todas las asignaturas del departamento de ciencias.',
    estado: 'en_proceso',
    prioridad: 'alta',
    categoria: 'Software',
    fecha: '2026-10-24T09:15:00',
    solicitanteId: 3,
    solicitante: 'Luis Usuario',
    actualizadoEn: '2026-10-25T10:05:00',
  },
  {
    id: 1006,
    codigo: 'INC-1006',
    titulo: 'La impresora del departamento se atasca',
    descripcion:
      'La impresora del departamento de administración atasca el papel en cada trabajo a doble cara. Ya se ha revisado la bandeja sin resultado.',
    estado: 'cerrada',
    prioridad: 'media',
    categoria: 'Equipamiento',
    fecha: '2026-10-23T12:50:00',
    solicitanteId: 2,
    solicitante: 'María Técnica',
    actualizadoEn: '2026-10-23T17:30:00',
  },
  {
    id: 1007,
    codigo: 'INC-1007',
    titulo: 'Pantalla del pasillo 2 con parpadeo',
    descripcion:
      'La pantalla informativa del pasillo 2 parpadea de forma intermitente desde la actualización del firmware. El contenido se ve, pero pierde la señal cada pocos segundos.',
    estado: 'abierta',
    prioridad: 'media',
    categoria: 'Equipamiento',
    fecha: '2026-10-23T08:05:00',
    solicitanteId: 3,
    solicitante: 'Luis Usuario',
    actualizadoEn: '2026-10-23T08:05:00',
  },
  {
    id: 1008,
    codigo: 'INC-1008',
    titulo: 'Contraseña caducada en el correo corporativo',
    descripcion:
      'El correo corporativo pide cambiar la contraseña cada vez que se inicia sesión. El aviso de caducidad aparece aunque se haya renovado el mismo día.',
    estado: 'cerrada',
    prioridad: 'alta',
    categoria: 'Cuentas',
    fecha: '2026-10-22T15:20:00',
    solicitanteId: 1,
    solicitante: 'Ana Admin',
    actualizadoEn: '2026-10-26T07:47:00',
  },
  {
    id: 1009,
    codigo: 'INC-1009',
    titulo: 'El ventilador del servidor hace ruido',
    descripcion:
      'El servidor del armario de comunicaciones emite un ruido metálico intermitente. La temperatura del armario ha subido tres grados en la última semana.',
    estado: 'en_proceso',
    prioridad: 'alta',
    categoria: 'Equipamiento',
    fecha: '2026-10-26T10:47:00',
    solicitanteId: 3,
    solicitante: 'Luis Usuario',
    actualizadoEn: '2026-10-26T11:10:00',
  },
  {
    id: 1010,
    codigo: 'INC-1010',
    titulo: 'Licencia de Matlab caducada en el aula 5',
    descripcion:
      'Los equipos del aula 5 muestran un aviso de licencia caducada al abrir Matlab. Afecta a las prácticas de la asignatura de análisis numérico.',
    estado: 'en_proceso',
    prioridad: 'media',
    categoria: 'Software',
    fecha: '2026-10-21T10:10:00',
    solicitanteId: 2,
    solicitante: 'María Técnica',
    actualizadoEn: '2026-10-26T12:22:00',
  },
  {
    id: 1011,
    codigo: 'INC-1011',
    titulo: 'Ratón inalámbrico sin batería en secretaría',
    descripcion:
      'El ratón inalámbrico del puesto de secretaría no responde. Probablemente sea la pila, pero no hay repuestos en el almacén.',
    estado: 'abierta',
    prioridad: 'baja',
    categoria: 'Mobiliario',
    fecha: '2026-10-20T09:40:00',
    solicitanteId: 3,
    solicitante: 'Luis Usuario',
    actualizadoEn: '2026-10-20T09:40:00',
  },
  {
    id: 1012,
    codigo: 'INC-1012',
    titulo: 'El proyector del salón de actos no responde al mando',
    descripcion:
      'El mando del proyector del salón de actos no funciona durante los actos del centro. Se ha probado a cambiar las pilas del mando sin éxito.',
    estado: 'cerrada',
    prioridad: 'media',
    categoria: 'Equipamiento',
    fecha: '2026-10-20T13:25:00',
    solicitanteId: 1,
    solicitante: 'Ana Admin',
    actualizadoEn: '2026-10-21T09:15:00',
  },
];

/** Feed inicial del servicio NoSQL (más reciente primero). */
export const ACTIVIDAD_SEED: readonly Actividad[] = [
  {
    id: 3,
    texto: 'María Técnica cambió INC-1010 a «En proceso».',
    tipo: 'cambio_estado',
    fecha: '2026-10-26T12:22:00',
    incidenciaCodigo: 'INC-1010',
  },
  {
    id: 2,
    texto: 'Luis Usuario creó la incidencia INC-1009.',
    tipo: 'creacion',
    fecha: '2026-10-26T10:47:00',
    incidenciaCodigo: 'INC-1009',
  },
  {
    id: 1,
    texto: 'Ana Admin cerró la incidencia INC-1008.',
    tipo: 'cierre',
    fecha: '2026-10-26T07:47:00',
    incidenciaCodigo: 'INC-1008',
  },
];
