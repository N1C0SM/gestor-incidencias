import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { ACTIVIDAD_SEED } from '../data/seed';
import type { Actividad, TipoActividad } from '../models';

/** Datos mínimos para publicar un evento en el feed. */
export interface NuevoEvento {
  texto: string;
  tipo: TipoActividad;
  incidenciaCodigo?: string;
}

/**
 * Servicio NoSQL simulado.
 *
 * Representa una colección de documentos de solo lectura para la aplicación
 * (el feed de actividad). Se implementa con un `BehaviorSubject` de RxJS: cada
 * evento nuevo se publica al instante y todos los suscriptores reciben el
 * documento más reciente. No hay backend: los documentos viven en memoria.
 */
@Injectable({ providedIn: 'root' })
export class NosqlService {
  private readonly actividad = new BehaviorSubject<readonly Actividad[]>([
    ...ACTIVIDAD_SEED,
  ]);

  private siguienteId = ACTIVIDAD_SEED.length + 1;

  /** Flujo observable con el feed completo (más reciente primero). */
  readonly actividad$: Observable<readonly Actividad[]> = this.actividad.asObservable();

  /** Instantánea del feed sin suscribirse. */
  get instantanea(): readonly Actividad[] {
    return this.actividad.getValue();
  }

  /**
   * Publica un documento nuevo en el feed.
   * @param evento texto, tipo y código de incidencia del evento
   * @param fecha momento del evento (por defecto, ahora)
   */
  registrar(evento: NuevoEvento, fecha: Date = new Date()): Actividad {
    const documento: Actividad = {
      id: this.siguienteId++,
      texto: evento.texto,
      tipo: evento.tipo,
      fecha: fecha.toISOString(),
      incidenciaCodigo: evento.incidenciaCodigo,
    };

    this.actividad.next([documento, ...this.actividad.getValue()]);
    return documento;
  }

  /** Vuelve al feed inicial (útil en las pruebas). */
  reiniciar(): void {
    this.siguienteId = ACTIVIDAD_SEED.length + 1;
    this.actividad.next([...ACTIVIDAD_SEED]);
  }
}
