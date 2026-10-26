import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  type AbstractControl,
  type ValidationErrors,
  type ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonButton, IonIcon, IonSpinner } from '@ionic/angular';

import type { Categoria, Prioridad } from '@core/models';
import { AuthService } from '@core/services/auth.service';
import { NotificacionService } from '@core/services/notificacion.service';
import { SqlService } from '@core/services/sql.service';
import { CATEGORIAS, ETIQUETA_PRIORIDAD, PRIORIDADES } from '@core/utils/etiquetas';
import { tituloIncidencia } from '@core/validators/formulario.validators';
import { CampoComponent, type OpcionCampo } from '@shared/components/campo';

/** Comprueba que el valor del formulario es una categoría válida. */
function esCategoria(valor: string): valor is Categoria {
  return (CATEGORIAS as readonly string[]).includes(valor);
}

/** Comprueba que el valor del formulario es una prioridad válida. */
function esPrioridad(valor: string): valor is Prioridad {
  return (PRIORIDADES as readonly string[]).includes(valor);
}

/**
 * Rechaza los textos formados solo por espacios en blanco.
 * `Validators.required` los acepta y el servicio SQL guardaría un texto vacío.
 */
const textoConContenido: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const valor = String(control.value ?? '');
  return valor.length > 0 && valor.trim().length === 0 ? { soloEspacios: true } : null;
};

/**
 * Pantalla de alta de incidencia.
 *
 * Formulario reactivo con validación en vivo: los mensajes de error se
 * recalculan con `toSignal(formulario.events)` para que se repinten en cada
 * pulsación (OnPush + zoneless). Al guardar, la incidencia se crea en el
 * servicio SQL simulado y se navega a su detalle.
 */
@Component({
  selector: 'app-nueva',
  imports: [IonButton, IonIcon, IonSpinner, ReactiveFormsModule, RouterLink, CampoComponent],
  templateUrl: './nueva.page.html',
  styleUrl: './nueva.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NuevaPage {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly sql = inject(SqlService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notificacion = inject(NotificacionService);

  /** `true` mientras se guarda la incidencia. */
  readonly enviando = signal(false);

  /** Error general del envío (fallo del servicio o sesión no válida). */
  readonly errorGeneral = signal<string | null>(null);

  readonly formulario = this.fb.group({
    titulo: [
      '',
      [Validators.required, tituloIncidencia, textoConContenido, Validators.maxLength(120)],
    ],
    categoria: ['', [Validators.required]],
    prioridad: ['', [Validators.required]],
    descripcion: ['', [Validators.required, textoConContenido, Validators.minLength(20)]],
  });

  /** Cambia con cada evento del formulario para refrescar los mensajes. */
  private readonly cambios = toSignal(this.formulario.events, { initialValue: undefined });

  /** Opciones del desplegable de categorías. */
  protected readonly categorias: readonly OpcionCampo[] = CATEGORIAS.map((categoria) => ({
    valor: categoria,
    etiqueta: categoria,
  }));

  /** Opciones del desplegable de prioridades, con su etiqueta legible. */
  protected readonly prioridades: readonly OpcionCampo[] = PRIORIDADES.map((prioridad) => ({
    valor: prioridad,
    etiqueta: ETIQUETA_PRIORIDAD[prioridad],
  }));

  /** Mensajes de error de todos los campos, recalculados en vivo. */
  readonly errores = computed(() => {
    this.cambios();
    const controles = this.formulario.controls;

    return {
      titulo: this.mensajeTitulo(controles.titulo),
      categoria: this.mensajeRequerido(
        controles.categoria,
        'Selecciona la categoría de la incidencia.',
      ),
      prioridad: this.mensajeRequerido(
        controles.prioridad,
        'Selecciona la prioridad de la incidencia.',
      ),
      descripcion: this.mensajeDescripcion(controles.descripcion),
    };
  });

  /** Valida el formulario y crea la incidencia. */
  async crear(): Promise<void> {
    this.errorGeneral.set(null);

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const solicitanteId = this.auth.usuario()?.id;
    if (solicitanteId === undefined) {
      this.errorGeneral.set('No hay una sesión activa. Vuelve a iniciar sesión.');
      return;
    }

    const valores = this.formulario.getRawValue();
    if (!esCategoria(valores.categoria) || !esPrioridad(valores.prioridad)) {
      return;
    }

    this.enviando.set(true);
    try {
      const incidencia = await this.sql.crearIncidencia({
        titulo: valores.titulo,
        descripcion: valores.descripcion,
        categoria: valores.categoria,
        prioridad: valores.prioridad,
        solicitanteId,
      });

      await this.notificacion.exito('Incidencia creada correctamente.');
      await this.router.navigate(['/app/incidencias', incidencia.codigo]);
    } catch {
      this.errorGeneral.set('No se ha podido crear la incidencia. Inténtalo de nuevo.');
    } finally {
      this.enviando.set(false);
    }
  }

  /** Vuelve al listado sin guardar. */
  cancelar(): void {
    void this.router.navigate(['/app/incidencias']);
  }

  private mensajeTitulo(control: AbstractControl): string | null {
    if (!control.touched || control.valid) {
      return null;
    }
    if (control.hasError('required')) {
      return 'Escribe un título para la incidencia.';
    }
    if (control.hasError('soloEspacios')) {
      return 'El título no puede estar vacío.';
    }
    if (control.hasError('tituloCorto')) {
      return 'El título debe tener al menos 5 caracteres.';
    }
    if (control.hasError('maxlength')) {
      return 'El título no puede superar los 120 caracteres.';
    }
    return null;
  }

  private mensajeDescripcion(control: AbstractControl): string | null {
    if (!control.touched || control.valid) {
      return null;
    }
    if (control.hasError('required')) {
      return 'Describe el problema que has detectado.';
    }
    if (control.hasError('soloEspacios')) {
      return 'La descripción no puede estar vacía.';
    }
    if (control.hasError('minlength')) {
      return 'La descripción debe tener al menos 20 caracteres.';
    }
    return null;
  }

  /** Mensaje común de los desplegables obligatorios. */
  private mensajeRequerido(control: AbstractControl, mensaje: string): string | null {
    return control.touched && control.hasError('required') ? mensaje : null;
  }
}
