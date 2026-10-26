import { booleanAttribute, ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * Tarjeta de indicador del panel.
 *
 * Usa `@Input` / `@Output` clásicos porque es un componente de presentación
 * puro y se reutiliza desde varias pantallas. Al pulsarla emite `seleccionar`,
 * que el panel usa para filtrar la tabla por estado.
 */
@Component({
  selector: 'app-stat-card',
  template: `
    <button
      type="button"
      class="gi-stat"
      [class.gi-stat--activo]="activo"
      [style.--gi-stat-color]="color"
      [attr.aria-pressed]="activo"
      (click)="seleccionar.emit()"
    >
      <span class="gi-stat__etiqueta">{{ etiqueta }}</span>
      <span class="gi-stat__valor">{{ valor }}</span>
      <span class="gi-stat__detalle">{{ detalle }}</span>
    </button>
  `,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }

    .gi-stat {
      display: grid;
      gap: 2px;
      width: 100%;
      padding: 13px 16px 14px 13px;
      border: 1px solid var(--gi-border-soft);
      border-left: 4px solid var(--gi-stat-color, var(--gi-primary));
      border-radius: 12px;
      background: var(--gi-surface);
      box-shadow: var(--gi-shadow-card);
      font-family: inherit;
      text-align: left;
      cursor: pointer;
      transition:
        box-shadow 140ms ease-in-out,
        transform 140ms ease-in-out;
    }

    .gi-stat:hover {
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
    }

    .gi-stat:active {
      transform: translateY(1px);
    }

    .gi-stat--activo {
      background: var(--gi-soft-2, #f8fafc);
      box-shadow: 0 2px 10px rgba(15, 23, 42, 0.08);
    }

    .gi-stat__etiqueta {
      color: var(--gi-ink-soft);
      font-size: 14px;
      font-weight: 500;
      line-height: 1.3;
    }

    .gi-stat__valor {
      color: var(--gi-ink);
      font-size: 30px;
      font-weight: 800;
      line-height: 1.15;
      letter-spacing: -0.02em;
      font-variant-numeric: tabular-nums;
    }

    .gi-stat__detalle {
      color: var(--gi-ink-muted);
      font-size: 13px;
      line-height: 1.35;
    }

    @media (max-width: 640px) {
      .gi-stat {
        padding: 11px 13px 12px 11px;
      }

      .gi-stat__valor {
        font-size: 26px;
      }

      .gi-stat__detalle {
        font-size: 12.5px;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatCardComponent {
  /** Nombre del indicador, p. ej. «Abiertas». */
  @Input({ required: true }) etiqueta = '';

  /** Valor numérico destacado. */
  @Input({ required: true }) valor = 0;

  /** Texto de apoyo bajo el valor. */
  @Input() detalle = '';

  /** Color del acento lateral izquierdo. */
  @Input() color = '#1d4ed8';

  /** Indica si el filtro asociado está activo. */
  @Input({ transform: booleanAttribute }) activo = false;

  /** Se emite al pulsar la tarjeta. */
  @Output() readonly seleccionar = new EventEmitter<void>();
}
