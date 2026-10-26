import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import type { ValidationErrors } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import type { Observable } from 'rxjs';

import { SqlService } from '../services/sql.service';
import { emailExistsValidator } from './email-exists.validator';
import { contrasenasCoinciden } from './formulario.validators';

/**
 * Pruebas de los validadores de los formularios.
 *
 * El validador de correo es asíncrono (espera 320 ms y consulta el servicio
 * SQL), así que se resuelve con `firstValueFrom` y `await`, sin `fakeAsync`.
 */
describe('Validadores de formularios', () => {
  let sql: SqlService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    sql = TestBed.inject(SqlService);
  });

  /** Ejecuta el validador de correo para un valor y espera su resultado. */
  function validarEmail(valor: string): Promise<ValidationErrors | null> {
    const validador = emailExistsValidator(sql);
    const control = new FormControl(valor);
    // El validador de esta aplicación siempre devuelve un Observable.
    return firstValueFrom(validador(control) as Observable<ValidationErrors | null>);
  }

  it('emailExistsValidator marca `emailExistente` con un correo registrado y deja libre uno nuevo', async () => {
    await expect(validarEmail('admin@centro.es')).resolves.toEqual({ emailExistente: true });
    await expect(validarEmail('nuevo@centro.es')).resolves.toBeNull();
  });

  it('contrasenasCoinciden detecta que la contraseña y su repetición son distintas', () => {
    const formulario = new FormGroup(
      {
        password: new FormControl('Admin123'),
        passwordRepeticion: new FormControl('Admin124'),
      },
      { validators: contrasenasCoinciden },
    );

    expect(formulario.hasError('contrasenasDistintas')).toBe(true);

    formulario.patchValue({ passwordRepeticion: 'Admin123' });
    expect(formulario.hasError('contrasenasDistintas')).toBe(false);
  });
});
