import type { Routes } from '@angular/router';

import { adminGuard, authGuard, guestGuard } from './core/guards/guards';

/**
 * Rutas de la aplicación.
 *
 * Todas las páginas se cargan de forma perezosa con `loadComponent`, y las
 * privadas están protegidas por `authGuard` (sesión) o `adminGuard` (rol). El
 * shell autenticado (`ShellComponent`) mantiene la cabecera y la barra inferior
 * comunes a todas las pantallas internas.
 */
export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'app',
  },
  {
    path: 'login',
    title: 'Acceso · Gestor de Incidencias',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./pages/auth/login/login.page').then((modulo) => modulo.LoginPage),
  },
  {
    path: 'registro',
    title: 'Crear cuenta · Gestor de Incidencias',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./pages/auth/registro/registro.page').then((modulo) => modulo.RegistroPage),
  },
  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/shell/shell.component').then((modulo) => modulo.ShellComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'incidencias',
      },
      {
        path: 'panel',
        title: 'Panel · Gestor de Incidencias',
        canActivate: [adminGuard],
        data: { titulo: 'Panel de administración' },
        loadComponent: () =>
          import('./pages/dashboard/dashboard.page').then((modulo) => modulo.DashboardPage),
      },
      {
        path: 'incidencias',
        title: 'Incidencias · Gestor de Incidencias',
        data: { titulo: 'Incidencias' },
        loadComponent: () =>
          import('./pages/incidencias/listado/listado.page').then((modulo) => modulo.ListadoPage),
      },
      {
        path: 'incidencias/nueva',
        title: 'Nueva incidencia · Gestor de Incidencias',
        data: { titulo: 'Nueva incidencia' },
        loadComponent: () =>
          import('./pages/incidencias/nueva/nueva.page').then((modulo) => modulo.NuevaPage),
      },
      {
        path: 'incidencias/:codigo',
        title: 'Detalle de la incidencia · Gestor de Incidencias',
        data: { titulo: 'Detalle de la incidencia' },
        loadComponent: () =>
          import('./pages/incidencias/detalle/detalle.page').then((modulo) => modulo.DetallePage),
      },
      {
        path: 'ayuda',
        title: 'Ayuda · Gestor de Incidencias',
        data: { titulo: 'Ayuda' },
        loadComponent: () =>
          import('./pages/ayuda/ayuda.page').then((modulo) => modulo.AyudaPage),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'app',
  },
];
