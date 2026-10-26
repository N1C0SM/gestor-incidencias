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
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IonButton, IonContent, IonIcon, IonSpinner } from '@ionic/angular';

import { AuthService } from '@core/services/auth.service';
import { BrandPanelComponent } from '@shared/components/brand-panel';
import { CampoComponent } from '@shared/components/campo';

/** Credencial de demostración que se puede rellenar con un clic. */
interface CredencialDemo {
  readonly rol: string;
  readonly email: string;
  readonly password: string;
}

/**
 * Pantalla de acceso.
 *
 * Formulario reactivo con validación en vivo y mensajes accesibles; ofrece
 * dos credenciales de prueba para entrar sin escribir y respeta la ruta
 * solicitada (`?volver=`) cuando el guard ha interceptado una navegación.
 */
@Component({
  selector: 'app-login',
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
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly ruta = inject(ActivatedRoute);

  /** `true` mientras se comprueban las credenciales. */
  readonly enviando = signal(false);

  /** Mensaje de error general (credenciales incorrectas). */
  readonly errorGeneral = signal<string | null>(null);

  readonly formulario = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  /** Cambia con cada evento del formulario para refrescar los mensajes. */
  private readonly cambios = toSignal(this.formulario.events, { initialValue: undefined });

  /** Credenciales de prueba que se muestran bajo el formulario. */
  readonly credenciales: readonly CredencialDemo[] = [
    { rol: 'Administrador', email: 'admin@centro.es', password: 'Admin123' },
    { rol: 'Usuario estándar', email: 'usuario@centro.es', password: 'Usuario123' },
  ];

  /** Mensajes de error de los dos campos, recalculados en vivo. */
  readonly errores = computed<{ email: string | null; password: string | null }>(() => {
    this.cambios();
    return {
      email: this.mensajeDe(this.formulario.controls.email, 'email'),
      password: this.mensajeDe(this.formulario.controls.password, 'password'),
    };
  });

  /** Rellena el formulario con una credencial de prueba. */
  usar(credencial: CredencialDemo): void {
    this.formulario.setValue({ email: credencial.email, password: credencial.password });
    this.formulario.markAllAsTouched();
    this.errorGeneral.set(null);
  }

  /** Valida y envía el formulario. */
  async entrar(): Promise<void> {
    this.errorGeneral.set(null);

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    try {
      const sesion = await this.auth.iniciarSesion(
        this.formulario.controls.email.value,
        this.formulario.controls.password.value,
      );

      const volver = this.ruta.snapshot.queryParamMap.get('volver');
      const destino =
        volver && volver.startsWith('/')
          ? volver
          : sesion.rol === 'admin'
            ? '/app/panel'
            : '/app/incidencias';

      await this.router.navigateByUrl(destino);
    } catch (error) {
      this.errorGeneral.set(
        error instanceof Error ? error.message : 'No se ha podido iniciar sesión.',
      );
    } finally {
      this.enviando.set(false);
    }
  }

  private mensajeDe(control: AbstractControl, campo: 'email' | 'password'): string | null {
    if (!control.touched || control.valid) {
      return null;
    }
    if (control.hasError('required')) {
      return campo === 'email' ? 'Escribe tu correo electrónico.' : 'Escribe tu contraseña.';
    }
    if (control.hasError('email')) {
      return 'El correo no tiene un formato válido.';
    }
    if (control.hasError('minlength')) {
      return 'La contraseña debe tener al menos 6 caracteres.';
    }
    return null;
  }
}
