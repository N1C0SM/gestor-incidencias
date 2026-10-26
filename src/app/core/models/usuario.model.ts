/** Rol disponible en la aplicación. `admin` gestiona todo el centro; `usuario` solo lo suyo. */
export type Rol = 'admin' | 'usuario';

/** Usuario de la tabla `usuarios` del servicio SQL simulado. */
export interface Usuario {
  readonly id: number;
  readonly nombre: string;
  readonly email: string;
  readonly password: string;
  readonly rol: Rol;
  readonly creadoEn: string;
}

/** Datos necesarios para dar de alta una cuenta nueva. */
export interface NuevoUsuario {
  nombre: string;
  email: string;
  password: string;
  rol?: Rol;
}

/** Sesión que se persiste en localStorage (nunca incluye la contraseña). */
export interface Sesion {
  readonly id: number;
  readonly nombre: string;
  readonly email: string;
  readonly rol: Rol;
}
