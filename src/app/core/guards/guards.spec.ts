import { TestBed } from '@angular/core/testing';
import { UrlTree, provideRouter } from '@angular/router';
import type { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { adminGuard, authGuard } from './guards';

/** Ruta activa de mentira: los guards de este proyecto no leen sus datos. */
const RUTA_FALSA = {} as ActivatedRouteSnapshot;

/** Estado del router de mentira con la URL que se está intentando abrir. */
function estadoConUrl(url: string): RouterStateSnapshot {
  return { url } as RouterStateSnapshot;
}

/**
 * Pruebas de los guards funcionales.
 *
 * Se ejecutan dentro de un contexto de inyección (`runInInjectionContext`),
 * que es como los invoca el router, con el `Router` real para obtener `UrlTree`.
 */
describe('guards', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('authGuard manda a /login sin sesión y deja pasar cuando hay sesión', async () => {
    const auth = TestBed.inject(AuthService);
    expect(auth.autenticado()).toBe(false);

    const denegado = TestBed.runInInjectionContext(() =>
      authGuard(RUTA_FALSA, estadoConUrl('/app/panel')),
    );
    expect(denegado).toBeInstanceOf(UrlTree);
    const destino = denegado as UrlTree;
    expect(destino.toString()).toContain('/login');
    expect(destino.queryParams['volver']).toBe('/app/panel');

    await auth.iniciarSesion('usuario@centro.es', 'Usuario123');

    const permitido = TestBed.runInInjectionContext(() =>
      authGuard(RUTA_FALSA, estadoConUrl('/app/panel')),
    );
    expect(permitido).toBe(true);
  });

  it('adminGuard devuelve al listado a un usuario con rol estándar', async () => {
    const auth = TestBed.inject(AuthService);
    await auth.iniciarSesion('usuario@centro.es', 'Usuario123');
    expect(auth.esAdmin()).toBe(false);

    const resultado = TestBed.runInInjectionContext(() =>
      adminGuard(RUTA_FALSA, estadoConUrl('/app/panel')),
    );

    expect(resultado).toBeInstanceOf(UrlTree);
    expect((resultado as UrlTree).toString()).toBe('/app/incidencias');
  });
});
