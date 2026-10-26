import { Injectable, inject } from '@angular/core';

import { INCIDENCIAS_SEED, USUARIOS_SEED } from '../data/seed';
import type {
  Estado,
  Estadisticas,
  Incidencia,
  NuevaIncidencia,
  NuevoUsuario,
  Usuario,
} from '../models';
import { NosqlService } from './nosql.service';

/** Retardo simulado de la base de datos, en milisegundos. */
const RETARDO = 160;

/**
 * Servicio SQL simulado.
 *
 * Emula una base de datos relacional con dos tablas (`usuarios` e
 * `incidencias`). Todas las operaciones devuelven `Promise` y esperan un
 * pequeño retardo para que la interfaz tenga que gestionar estados de carga,
 * igual que haría con un backend real. Los datos viven en memoria.
 */
@Injectable({ providedIn: 'root' })
export class SqlService {
  private readonly nosql = inject(NosqlService);

  private readonly usuarios: Usuario[] = USUARIOS_SEED.map((usuario) => ({ ...usuario }));
  private readonly incidencias: Incidencia[] = INCIDENCIAS_SEED.map((incidencia) => ({
    ...incidencia,
  }));

  private siguienteUsuarioId = USUARIOS_SEED.length + 1;
  private siguienteIncidenciaId = 1013;

  /** Resuelve la promesa tras un pequeño retardo, como haría una consulta real. */
  private simular<T>(consulta: () => T, ms = RETARDO): Promise<T> {
    return new Promise<T>((resolver) => {
      setTimeout(() => resolver(consulta()), ms);
    });
  }

  /** Copia defensiva: ninguna capa externa puede mutar la «base de datos». */
  private copiarIncidencia(incidencia: Incidencia): Incidencia {
    return { ...incidencia };
  }

  /** Comprueba las credenciales de un usuario. */
  login(email: string, password: string): Promise<Usuario | null> {
    const correo = email.trim().toLowerCase();

    return this.simular(() => {
      const encontrado = this.usuarios.find(
        (usuario) => usuario.email.toLowerCase() === correo && usuario.password === password,
      );
      return encontrado ? { ...encontrado } : null;
    });
  }

  /** Validador asíncrono del registro: ¿existe ya ese correo? */
  emailExists(email: string): Promise<boolean> {
    const correo = email.trim().toLowerCase();

    return this.simular(
      () => this.usuarios.some((usuario) => usuario.email.toLowerCase() === correo),
      RETARDO + 140,
    );
  }

  /** Inserta un usuario nuevo y lo devuelve. */
  crearUsuario(datos: NuevoUsuario): Promise<Usuario> {
    const usuario: Usuario = {
      id: this.siguienteUsuarioId++,
      nombre: datos.nombre.trim(),
      email: datos.email.trim().toLowerCase(),
      password: datos.password,
      rol: datos.rol ?? 'usuario',
      creadoEn: new Date().toISOString(),
    };

    return this.simular(() => {
      this.usuarios.push(usuario);
      return { ...usuario };
    });
  }

  /** Lista de usuarios registrados. */
  getUsuarios(): Promise<Usuario[]> {
    return this.simular(() => this.usuarios.map((usuario) => ({ ...usuario })));
  }

  /** Todas las incidencias, ordenadas por código ascendente. */
  getIncidencias(): Promise<Incidencia[]> {
    return this.simular(() =>
      [...this.incidencias].sort((a, b) => a.id - b.id).map((incidencia) => this.copiarIncidencia(incidencia)),
    );
  }

  /** Incidencias de un solicitante concreto (vista del rol `usuario`). */
  getIncidenciasDe(usuarioId: number): Promise<Incidencia[]> {
    return this.simular(() =>
      this.incidencias
        .filter((incidencia) => incidencia.solicitanteId === usuarioId)
        .sort((a, b) => a.id - b.id)
        .map((incidencia) => this.copiarIncidencia(incidencia)),
    );
  }

  /** Busca una incidencia por id numérico o por código (`INC-1001`). */
  buscarIncidencia(idOCodigo: string | number): Promise<Incidencia | null> {
    const busqueda = String(idOCodigo).trim().toUpperCase();

    return this.simular(() => {
      const encontrada = this.incidencias.find(
        (incidencia) =>
          incidencia.codigo.toUpperCase() === busqueda ||
          String(incidencia.id) === String(idOCodigo).trim(),
      );
      return encontrada ? this.copiarIncidencia(encontrada) : null;
    });
  }

  /** Inserta una incidencia y publica el evento en el feed de actividad. */
  crearIncidencia(datos: NuevaIncidencia): Promise<Incidencia> {
    const solicitante = this.usuarios.find((usuario) => usuario.id === datos.solicitanteId);
    const ahora = new Date().toISOString();

    const id = this.siguienteIncidenciaId++;

    const incidencia: Incidencia = {
      id,
      codigo: `INC-${id}`,
      titulo: datos.titulo.trim(),
      descripcion: datos.descripcion.trim(),
      estado: 'abierta',
      prioridad: datos.prioridad,
      categoria: datos.categoria,
      fecha: ahora,
      solicitanteId: datos.solicitanteId,
      solicitante: solicitante?.nombre ?? 'Usuario del centro',
      actualizadoEn: ahora,
    };

    return this.simular(() => {
      this.incidencias.push(incidencia);
      this.nosql.registrar({
        texto: `${incidencia.solicitante} creó la incidencia ${incidencia.codigo}.`,
        tipo: 'creacion',
        incidenciaCodigo: incidencia.codigo,
      });
      return this.copiarIncidencia(incidencia);
    });
  }

  /** Cambia el estado de una incidencia y registra el cambio en el feed. */
  actualizarEstado(
    idOCodigo: string | number,
    estado: Estado,
    actor: string,
  ): Promise<Incidencia | null> {
    const busqueda = String(idOCodigo).trim().toUpperCase();

    return this.simular(() => {
      const indice = this.incidencias.findIndex(
        (incidencia) =>
          incidencia.codigo.toUpperCase() === busqueda || String(incidencia.id) === String(idOCodigo),
      );
      if (indice === -1) {
        return null;
      }

      const anterior = this.incidencias[indice];
      if (!anterior) {
        return null;
      }

      const actualizada: Incidencia = {
        ...anterior,
        estado,
        actualizadoEn: new Date().toISOString(),
      };
      this.incidencias[indice] = actualizada;

      this.nosql.registrar({
        texto:
          estado === 'cerrada'
            ? `${actor} cerró la incidencia ${actualizada.codigo}.`
            : `${actor} cambió ${actualizada.codigo} a «${estado === 'en_proceso' ? 'En proceso' : 'Abierta'}».`,
        tipo: estado === 'cerrada' ? 'cierre' : 'cambio_estado',
        incidenciaCodigo: actualizada.codigo,
      });

      return this.copiarIncidencia(actualizada);
    });
  }

  /** Indicadores del panel de administración. */
  getEstadisticas(): Promise<Estadisticas> {
    return this.simular(() => {
      const abiertas = this.incidencias.filter((i) => i.estado === 'abierta').length;
      const enProceso = this.incidencias.filter((i) => i.estado === 'en_proceso').length;
      const cerradas = this.incidencias.filter((i) => i.estado === 'cerrada').length;

      return {
        total: this.incidencias.length,
        abiertas,
        enProceso,
        cerradas,
        usuarios: this.usuarios.length,
      };
    });
  }
}
