import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Pantalla de ayuda.
 *
 * Manual de uso de la aplicación en español: explica qué es el gestor, cómo
 * acceder con las cuentas de prueba, cómo registrar una incidencia, qué
 * significan sus estados, qué puede hacer cada rol, cómo se generan los
 * informes y qué tecnologías hay detrás. El contenido es estático y está
 * redactado con HTML semántico (`section`, `h2`/`h3`, listas y tablas con
 * `<caption>` y `scope`).
 */
@Component({
  selector: 'app-ayuda',
  imports: [RouterLink],
  templateUrl: './ayuda.page.html',
  styleUrl: './ayuda.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AyudaPage {}
