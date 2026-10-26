# Registro de cambios

## 1.0.0 — 26 de octubre de 2026

Primera versión de la entrega individual del módulo DI 0488.

### Añadido

- Acceso con dos roles (usuario y administrador), sesión persistida y guards
  de ruta (`authGuard`, `adminGuard`, `guestGuard`).
- Registro de cuentas con validación en vivo y comprobación asíncrona de
  correo duplicado contra el servicio SQL simulado.
- Gestión de incidencias: alta con formulario reactivo, listado con filtros
  por estado y buscador, y detalle con cambio de estado para el administrador.
- Panel de administración con indicadores, gráfico de barras (Chart.js) y feed
  de actividad del servicio NoSQL simulado.
- Informes exportables a CSV compatible con Excel y a PDF maquetado con jsPDF
  y autoTable, con cabecera y numeración de página.
- Interfaz Ionic 9 en modo Material, responsive y accesible (WCAG 2.1 AA).
- Aplicación instalable (PWA) y configuración de Capacitor para iOS y Android.
- 11 pruebas unitarias con Vitest, análisis estático con ESLint, documentación
  con Compodoc y flujo de integración continua en GitHub Actions.

### Documentación y calidad

- Informes de Lighthouse sobre la compilación de producción en
  `docs/lighthouse/`: 100 en accesibilidad, buenas prácticas y SEO.
