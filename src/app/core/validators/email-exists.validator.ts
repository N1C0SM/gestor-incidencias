import type { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { type Observable, catchError, map, of, switchMap, timer } from 'rxjs';

import type { SqlService } from '../services/sql.service';

/** Tiempo de espera antes de consultar, para no lanzar una petición por tecla. */
const ESPERA = 320;

/**
 * Validador asíncrono de correo duplicado.
 *
 * Consulta `SqlService.emailExists()` (que simula una consulta a la base de
 * datos) y devuelve el error `emailExistente` si la cuenta ya está registrada.
 * Se usa en el formulario de registro y muestra el resultado en vivo.
 */
export function emailExistsValidator(sql: SqlService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const valor = String(control.value ?? '').trim();

    if (valor.length === 0) {
      return of(null);
    }

    return timer(ESPERA).pipe(
      switchMap(() => sql.emailExists(valor)),
      map((existe): ValidationErrors | null => (existe ? { emailExistente: true } : null)),
      catchError(() => of(null)),
    );
  };
}

/** Alias con el nombre que se cita en la documentación del proyecto. */
export const emailExists = emailExistsValidator;
