import { Injectable, computed, inject, signal } from '@angular/core';

import type { NuevoUsuario, Sesion, Usuario } from '../models';
import { CLAVE_SESION, almacenamiento } from '../utils/almacenamiento';
import { SqlService } from './sql.service';

/** Convierte un registro completo de usuario en la sesión que se persiste. */
function aSesion(usuario: Usuario): Sesion {
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol,
  };
}

/**
 * Servicio de autenticación y autorización.
 *
 * Mantiene la sesión en un `signal` para que cualquier componente reaccione al
 * cambio de rol, y la refleja en `localStorage` para sobrevivir a una recarga.
 * El estado «real» de las credenciales vive en `SqlService`.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly sql = inject(SqlService);

  private readonly _usuario = signal<Sesion | null>(almacenamiento.leer<Sesion>(CLAVE_SESION));

  /** Usuario autenticado (o `null`). */
  readonly usuario = this._usuario.asReadonly();

  /** `true` cuando hay una sesión activa. */
  readonly autenticado = computed(() => this._usuario() !== null);

  /** `true` cuando el usuario autenticado es administrador. */
  readonly esAdmin = computed(() => this._usuario()?.rol === 'admin');

  /** Nombre del usuario, para saludos y cabeceras. */
  readonly nombre = computed(() => this._usuario()?.nombre ?? '');

  /** Iniciales del usuario, para el avatar textual. */
  readonly iniciales = computed(() => {
    const nombre = this._usuario()?.nombre ?? '';
    return nombre
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte.charAt(0).toUpperCase())
      .join('');
  });

  /** Ruta de inicio: el panel para administradores, el listado para el resto. */
  readonly rutaInicio = computed(() => (this.esAdmin() ? '/app/panel' : '/app/incidencias'));

  /**
   * Inicia sesión validando las credenciales contra el servicio SQL.
   * @throws Error con un mensaje listo para mostrar si las credenciales fallan.
   */
  async iniciarSesion(email: string, password: string): Promise<Sesion> {
    const usuario = await this.sql.login(email, password);
    if (!usuario) {
      throw new Error('El correo o la contraseña no son correctos.');
    }

    return this.establecerSesion(aSesion(usuario));
  }

  /** Crea una cuenta nueva y deja la sesión iniciada. */
  async registrarse(datos: NuevoUsuario): Promise<Sesion> {
    const usuario = await this.sql.crearUsuario(datos);
    return this.establecerSesion(aSesion(usuario));
  }

  /** Cierra la sesión y limpia la persistencia. */
  cerrarSesion(): void {
    this._usuario.set(null);
    almacenamiento.borrar(CLAVE_SESION);
  }

  private establecerSesion(sesion: Sesion): Sesion {
    this._usuario.set(sesion);
    almacenamiento.guardar(CLAVE_SESION, sesion);
    return sesion;
  }
}
