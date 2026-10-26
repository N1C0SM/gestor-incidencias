import { TestBed } from '@angular/core/testing';

import { CLAVE_SESION } from '../utils/almacenamiento';
import { AuthService } from './auth.service';

/**
 * Pruebas del servicio de sesión.
 *
 * La sesión vive en un `signal` y se refleja en `localStorage` bajo la clave
 * `gi.sesion`; las pruebas comprueban las dos caras y la limpieza al salir.
 */
describe('AuthService', () => {
  let auth: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    auth = TestBed.inject(AuthService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('iniciarSesion guarda la sesión en el signal y en localStorage', async () => {
    expect(auth.autenticado()).toBe(false);
    expect(auth.usuario()).toBeNull();

    const sesion = await auth.iniciarSesion('admin@centro.es', 'Admin123');

    // Signal: el resto de la aplicación reacciona al cambio de rol.
    expect(sesion).toEqual({
      id: 1,
      nombre: 'Ana Admin',
      email: 'admin@centro.es',
      rol: 'admin',
    });
    expect(auth.usuario()).toEqual(sesion);
    expect(auth.autenticado()).toBe(true);
    expect(auth.esAdmin()).toBe(true);
    expect(auth.nombre()).toBe('Ana Admin');
    expect(auth.iniciales()).toBe('AA');
    expect(auth.rutaInicio()).toBe('/app/panel');

    // Persistencia: la sesión sobrevive a una recarga, sin la contraseña.
    const persistida = localStorage.getItem(CLAVE_SESION);
    expect(persistida).not.toBeNull();
    expect(JSON.parse(persistida ?? 'null')).toEqual(sesion);
    expect(persistida).not.toContain('Admin123');
  });

  it('cerrarSesion limpia el signal y localStorage', async () => {
    await auth.iniciarSesion('usuario@centro.es', 'Usuario123');
    expect(auth.autenticado()).toBe(true);
    expect(localStorage.getItem(CLAVE_SESION)).not.toBeNull();

    auth.cerrarSesion();

    expect(auth.usuario()).toBeNull();
    expect(auth.autenticado()).toBe(false);
    expect(auth.esAdmin()).toBe(false);
    expect(auth.rutaInicio()).toBe('/app/incidencias');
    expect(localStorage.getItem(CLAVE_SESION)).toBeNull();
  });
});
