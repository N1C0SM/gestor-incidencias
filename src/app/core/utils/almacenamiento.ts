/**
 * Envoltorio de `localStorage` tolerante a fallos: en modo privado, con
 * almacenamiento lleno o durante el renderizado en servidor, la aplicación
 * debe seguir funcionando aunque no se pueda persistir la sesión.
 */
export const almacenamiento = {
  leer<T>(clave: string): T | null {
    try {
      const valor = globalThis.localStorage?.getItem(clave);
      return valor ? (JSON.parse(valor) as T) : null;
    } catch {
      return null;
    }
  },

  guardar(clave: string, valor: unknown): void {
    try {
      globalThis.localStorage?.setItem(clave, JSON.stringify(valor));
    } catch {
      /* sin persistencia disponible: la sesión vive solo en memoria */
    }
  },

  borrar(clave: string): void {
    try {
      globalThis.localStorage?.removeItem(clave);
    } catch {
      /* nada que borrar */
    }
  },
};

/** Clave con la que se persiste la sesión del usuario. */
export const CLAVE_SESION = 'gi.sesion';
