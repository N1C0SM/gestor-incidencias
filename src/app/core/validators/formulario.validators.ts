import type { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Devuelve `true` si la cadena contiene al menos una letra. */
function tieneLetra(valor: string): boolean {
  return /[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(valor);
}

/** Devuelve `true` si la cadena contiene al menos un dígito. */
function tieneNumero(valor: string): boolean {
  return /\d/.test(valor);
}

/**
 * Contraseña mínimamente robusta: 6 caracteres como mínimo, con al menos una
 * letra y un número. Devuelve errores distintos para poder dar mensajes
 * concretos y accesibles.
 */
export const contrasenaSegura: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const valor = String(control.value ?? '');
  if (valor.length === 0) {
    return null;
  }

  const errores: ValidationErrors = {};
  if (valor.length < 6) {
    errores['minlength'] = { requiredLength: 6, actualLength: valor.length };
  }
  if (!tieneLetra(valor)) {
    errores['sinLetra'] = true;
  }
  if (!tieneNumero(valor)) {
    errores['sinNumero'] = true;
  }

  return Object.keys(errores).length > 0 ? errores : null;
};

/**
 * Valida que dos controles (contraseña y su repetición) coincidan.
 * Se aplica al grupo del formulario, no a un control suelto.
 */
export const contrasenasCoinciden: ValidatorFn = (
  grupo: AbstractControl,
): ValidationErrors | null => {
  const contrasena = grupo.get('password')?.value as string | undefined;
  const repeticion = grupo.get('passwordRepeticion')?.value as string | undefined;

  if (!contrasena || !repeticion) {
    return null;
  }

  return contrasena === repeticion ? null : { contrasenasDistintas: true };
};

/** Longitud mínima y máxima para el título de una incidencia. */
export const tituloIncidencia: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const valor = String(control.value ?? '').trim();
  if (valor.length === 0) {
    return null;
  }
  return valor.length >= 5 ? null : { tituloCorto: true };
};
