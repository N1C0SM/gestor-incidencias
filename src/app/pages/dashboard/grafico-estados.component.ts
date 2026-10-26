import {
  type ElementRef,
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  computed,
  effect,
  input,
  viewChild,
} from '@angular/core';
import { Chart, type ChartConfiguration } from 'chart.js/auto';

/** Etiquetas de las tres barras, en el orden del ciclo de vida. */
const ETIQUETAS = ['Abiertas', 'En proceso', 'Cerradas'] as const;

/** Colores de las barras; coinciden con los del estado en el resto de la app. */
const COLORES = ['#b45309', '#1d4ed8', '#15803d'] as const;

/**
 * Gráfico de barras con la distribución de incidencias por estado.
 *
 * Encapsula toda la integración con Chart.js: crea el gráfico cuando el lienzo
 * ya está en el DOM, lo actualiza si cambian los valores y lo destruye al
 * desmontarse. Se importa desde `chart.js/auto` para no registrar elementos a
 * mano.
 */
@Component({
  selector: 'app-grafico-estados',
  template: `
    <canvas #lienzo role="img" [attr.aria-label]="descripcion()">{{ descripcion() }}</canvas>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
    }

    canvas {
      display: block;
      width: 100%;
      height: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraficoEstadosComponent implements OnDestroy {
  private readonly lienzo = viewChild<ElementRef<HTMLCanvasElement>>('lienzo');

  /** Incidencias abiertas, en proceso y cerradas, en ese orden. */
  readonly valores = input.required<readonly number[]>();

  /** Resumen textual del gráfico para lectores de pantalla. */
  readonly descripcion = computed(() => {
    const [abiertas = 0, enProceso = 0, cerradas = 0] = this.valores();
    return `Gráfico de barras: ${abiertas} incidencias abiertas, ${enProceso} en proceso y ${cerradas} cerradas.`;
  });

  private grafico: Chart<'bar', number[], string> | null = null;

  constructor() {
    // Reacciona tanto a los datos como a la aparición del lienzo en la vista.
    effect(() => {
      const canvas = this.lienzo()?.nativeElement;
      const valores = [...this.valores()];

      if (!canvas) {
        return;
      }

      if (this.grafico) {
        this.grafico.data.datasets[0].data = valores;
        this.grafico.update();
        return;
      }

      // Un entorno sin canvas 2D (por ejemplo, unas pruebas sin DOM real) no
      // debe romper la pantalla: simplemente se omite el gráfico.
      const contexto = canvas.getContext('2d');
      if (!contexto) {
        return;
      }

      this.grafico = new Chart(contexto, this.configuracion(valores));
    });
  }

  ngOnDestroy(): void {
    this.grafico?.destroy();
    this.grafico = null;
  }

  /** Configuración del gráfico de barras descrita en el contrato del proyecto. */
  private configuracion(valores: readonly number[]): ChartConfiguration<'bar', number[], string> {
    return {
      type: 'bar',
      data: {
        labels: [...ETIQUETAS],
        datasets: [
          {
            label: 'Incidencias',
            data: [...valores],
            backgroundColor: [...COLORES],
            categoryPercentage: 0.8,
            barPercentage: 0.36,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 450 },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0f172a',
            padding: 10,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              label: (contexto) => `${contexto.parsed.y} incidencias`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: {
              color: '#64748b',
              font: { size: 12 },
            },
          },
          y: {
            beginAtZero: true,
            grid: { color: '#e2e8f0' },
            border: { display: false },
            ticks: {
              color: '#64748b',
              font: { size: 12 },
              stepSize: 1,
              precision: 0,
            },
          },
        },
      },
    };
  }
}
