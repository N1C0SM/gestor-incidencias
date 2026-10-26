import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

/**
 * Protege las rutas privadas: sin sesión se vuelve al acceso, recordando la
 * ruta solicitada para retomarla después del login.
 */
export const authGuard: CanActivateFn = (_ruta, estado) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.autenticado()) {
    return true;
  }

  return router.createUrlTree(['/login'], { queryParams: { volver: estado.url } });
};

/**
 * Protege las rutas exclusivas del administrador. Si un usuario estándar
 * escribe a mano la dirección del panel, se le devuelve a su listado.
 */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.autenticado()) {
    return router.createUrlTree(['/login']);
  }

  return auth.esAdmin() ? true : router.createUrlTree(['/app/incidencias']);
};

/** Impide volver al acceso o al registro con la sesión ya iniciada. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.autenticado() ? router.createUrlTree([auth.rutaInicio()]) : true;
};
