import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { type ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IonIcon } from '@ionic/angular';

/** Opción de un campo de tipo `select`. */
export interface OpcionCampo {
  readonly valor: string;
  readonly etiqueta: string;
}

/** Tipo de control que se pinta. */
export type TipoCampo =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'date'
  | 'search'
  | 'textarea'
  | 'select';

let contadorCampos = 0;

/**
 * Campo de formulario con etiqueta flotante, ayuda y mensaje de error.
 *
 * Implementa `ControlValueAccessor`, así que se integra con los formularios
 * reactivos igual que un `input` nativo: `formControlName`, `formControl` o
 * `ngModel`. La etiqueta queda siempre sobre el borde (patrón Material) y el
 * error se anuncia con `role="alert"` para los lectores de pantalla.
 */
@Component({
  selector: 'app-campo',
  imports: [IonIcon],
  templateUrl: './campo.component.html',
  styleUrl: './campo.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CampoComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampoComponent implements ControlValueAccessor {
  /** Identificador único del control (más sus descendientes de ayuda/error). */
  readonly id = `campo-${++contadorCampos}`;
  readonly idAyuda = `${this.id}-ayuda`;
  readonly idError = `${this.id}-error`;

  /** Etiqueta visible del campo. */
  readonly etiqueta = input.required<string>();

  /** Tipo de control. */
  readonly tipo = input<TipoCampo>('text');

  /** Texto de ejemplo dentro del control. */
  readonly placeholder = input('');

  /** Texto de ayuda bajo el control. */
  readonly ayuda = input('');

  /** Mensaje de error a mostrar (o `null`). */
  readonly error = input<string | null>(null);

  /** Opciones para `tipo = 'select'`. */
  readonly opciones = input<readonly OpcionCampo[]>([]);

  /** Valor de `autocomplete` del navegador. */
  readonly autocomplete = input('off');

  /** Marca el control como obligatorio para la validación nativa y ARIA. */
  readonly requerido = input(false, { transform: booleanAttribute });

  /** Longitud máxima admitida. */
  readonly maxlength = input<number | null>(null);

  /** Teclado que sugiere el dispositivo (`inputmode`). */
  readonly inputmode = input<string | null>(null);

  /** Filas visibles cuando `tipo = 'textarea'`. */
  readonly filas = input(3);

  /** Muestra el botón para ver u ocultar la contraseña. */
  readonly revelable = input(false, { transform: booleanAttribute });

  /** Valor actual del control. */
  private readonly valor = signal('');

  /** Estado deshabilitado gestionado por Angular Forms. */
  private readonly deshabilitado = signal(false);

  /** Estado del botón «ver contraseña». */
  private readonly claveVisible = signal(false);

  private alCambiar: (valor: string) => void = () => undefined;
  private alTocar: () => void = () => undefined;

  /** `true` cuando hay un mensaje de error que pintar. */
  readonly mostrarError = computed(() => (this.error() ?? '').length > 0);

  /** `true` para pintar un textarea. */
  readonly esTextarea = computed(() => this.tipo() === 'textarea');

  /** `true` para pintar un select. */
  readonly esSelect = computed(() => this.tipo() === 'select');

  /** `true` para pintar el botón de visibilidad de contraseña. */
  readonly esPassword = computed(() => this.tipo() === 'password' && this.revelable());

  /** Tipo efectivo del input (cambia al revelar la contraseña). */
  readonly tipoEfectivo = computed(() => {
    if (this.tipo() === 'password' && this.claveVisible()) {
      return 'text';
    }
    return this.tipo() === 'textarea' || this.tipo() === 'select' ? 'text' : this.tipo();
  });

  /** Texto para `aria-label` del botón de contraseña. */
  readonly etiquetaBotonClave = computed(() =>
    this.claveVisible() ? 'Ocultar la contraseña' : 'Mostrar la contraseña',
  );

  /** Ids de los textos asociados al control (`aria-describedby`). */
  readonly descritoPor = computed(() => {
    const ids: string[] = [];
    if ((this.ayuda().length > 0 && !this.mostrarError()) === true) {
      ids.push(this.idAyuda);
    }
    if (this.mostrarError()) {
      ids.push(this.idError);
    }
    return ids.length > 0 ? ids.join(' ') : null;
  });

  /** Valor actual, para el enlace con la plantilla. */
  readonly valorActual = this.valor.asReadonly();

  /** Estado deshabilitado, para la plantilla. */
  readonly estaDeshabilitado = this.deshabilitado.asReadonly();

  /** Estado del botón de contraseña. */
  readonly claveALaVista = this.claveVisible.asReadonly();

  /** Escritura desde Angular Forms. */
  writeValue(valor: string | null): void {
    this.valor.set(valor ?? '');
  }

  /** Registro del callback de cambio. */
  registerOnChange(fn: (valor: string) => void): void {
    this.alCambiar = fn;
  }

  /** Registro del callback de «tocado». */
  registerOnTouched(fn: () => void): void {
    this.alTocar = fn;
  }

  /** Angular Forms deshabilita o habilita el control. */
  setDisabledState(deshabilitado: boolean): void {
    this.deshabilitado.set(deshabilitado);
  }

  /** Propaga el valor al formulario en cada pulsación. */
  alEscribir(evento: Event): void {
    const control = evento.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    this.valor.set(control.value);
    this.alCambiar(control.value);
  }

  /** Marca el control como tocado al salir. */
  alSalir(): void {
    this.alTocar();
  }

  /** Alterna la visibilidad de la contraseña. */
  alternarClave(): void {
    this.claveVisible.update((visible) => !visible);
  }
}
