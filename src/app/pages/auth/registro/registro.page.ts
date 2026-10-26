import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  type AbstractControl,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonButton, IonContent, IonIcon, IonSpinner } from '@ionic/angular';

import { AuthService } from '@core/services/auth.service';
import { NotificacionService } from '@core/services/notificacion.service';
import { SqlService } from '@core/services/sql.service';
import { emailExistsValidator } from '@core/validators/email-exists.validator';
import {
  contrasenaSegura,
  contrasenasCoinciden,
} from '@core/validators/formulario.validators';
import { BrandPanelComponent } from '@shared/components/brand-panel';
import { CampoComponent } from '@shared/components/campo';

/**
 * Pantalla de registro.
 *
 * El correo se valida en vivo (formato) y de forma asíncrona contra el
 * servicio SQL para impedir cuentas duplicadas. Al crear la cuenta la sesión
 * queda iniciada con el rol `usuario`.
 */
@Component({
  selector: 'app-registro',
  imports: [
    IonContent,
    IonButton,
    IonIcon,
    IonSpinner,
    ReactiveFormsModule,
    RouterLink,
    BrandPanelComponent,
    CampoComponent,
  ],
  host: { class: 'ion-page' },
  templateUrl: './registro.page.html',
  styleUrl: './registro.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegistroPage {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly sql = inject(SqlService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notificacion = inject(NotificacionService);

  readonly enviando = signal(false);
  readonly errorGeneral = signal<string | null>(null);

  readonly formulario = this.fb.group(
    {
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email], [emailExistsValidator(this.sql)]],
      password: ['', [Validators.required, contrasenaSegura]],
      passwordRepeticion: ['', [Validators.required]],
    },
    { validators: [contrasenasCoinciden] },
  );

  private readonly cambios = toSignal(this.formulario.events, { initialValue: undefined });

  /** Mensajes de error de todos los campos, recalculados en vivo. */
  readonly errores = computed(() => {
    this.cambios();
    const controles = this.formulario.controls;
    const repetida = controles.passwordRepeticion;

    return {
      nombre: this.mensajeNombre(controles.nombre),
      email: this.mensajeEmail(controles.email),
      password: this.mensajePassword(controles.password),
      passwordRepeticion:
        repetida.touched && this.formulario.hasError('contrasenasDistintas')
          ? 'Las contraseñas no coinciden.'
          : null,
    };
  });

  /** Texto de ayuda del correo: aviso de comprobación mientras valida. */
  readonly ayudaEmail = computed(() => {
    this.cambios();
    return this.formulario.controls.email.pending ? 'Comprobando disponibilidad…' : '';
  });

  /** `true` mientras el validador asíncrono está trabajando. */
  readonly comprobandoCorreo = computed(() => {
    this.cambios();
    return this.formulario.controls.email.pending;
  });

  /** Valida y crea la cuenta. */
  async crearCuenta(): Promise<void> {
    this.errorGeneral.set(null);

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    try {
      const valores = this.formulario.getRawValue();
      await this.auth.registrarse({
        nombre: valores.nombre,
        email: valores.email,
        password: valores.password,
      });

      await this.notificacion.exito('Cuenta creada. Ya puedes registrar incidencias.');
      await this.router.navigateByUrl('/app/incidencias');
    } catch (error) {
      this.errorGeneral.set(
        error instanceof Error ? error.message : 'No se ha podido crear la cuenta.',
      );
    } finally {
      this.enviando.set(false);
    }
  }

  private mensajeNombre(control: AbstractControl): string | null {
    if (!control.touched || control.valid) {
      return null;
    }
    if (control.hasError('required')) {
      return 'Escribe tu nombre y apellidos.';
    }
    if (control.hasError('minlength')) {
      return 'El nombre debe tener al menos 3 caracteres.';
    }
    return null;
  }

  private mensajeEmail(control: AbstractControl): string | null {
    if (!control.touched || control.valid) {
      return null;
    }
    if (control.hasError('required')) {
      return 'Escribe tu correo electrónico.';
    }
    if (control.hasError('email')) {
      return 'El correo no tiene un formato válido.';
    }
    if (control.hasError('emailExistente')) {
      return 'Ya existe una cuenta con este correo electrónico.';
    }
    return null;
  }

  private mensajePassword(control: AbstractControl): string | null {
    if (!control.touched || control.valid) {
      return null;
    }
    if (control.hasError('required')) {
      return 'Escribe una contraseña.';
    }
    if (control.hasError('minlength')) {
      return 'La contraseña debe tener al menos 6 caracteres.';
    }
    if (control.hasError('sinLetra')) {
      return 'La contraseña debe incluir al menos una letra.';
    }
    if (control.hasError('sinNumero')) {
      return 'La contraseña debe incluir al menos un número.';
    }
    return null;
  }
}
