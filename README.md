# Gestor de Incidencias

Aplicación **Ionic 9 + Angular 22** para registrar, seguir y resolver las incidencias técnicas de
un centro educativo. Proyecto del **módulo DI 0488** del Ciclo Formativo de Grado Superior en
Desarrollo de Aplicaciones Multiplataforma (DAM).

La misma aplicación funciona en navegador, móvil y tableta, y puede empaquetarse como app nativa
con Capacitor. Todos los datos son **ficticios** y viven en memoria: es una simulación didáctica,
sin backend ni datos personales reales.

## Características

- **Acceso con dos roles.** El rol `usuario` crea y consulta sus incidencias; el rol `admin` ve
  todas, cambia estados y accede al panel.
- **Formularios reactivos** con validación en vivo, mensajes de error accesibles y validación
  asíncrona de correo duplicado en el registro.
- **Panel de administración** con indicadores, gráfico de barras (Chart.js) y actividad reciente
  desde un servicio NoSQL simulado.
- **Informes** exportables a CSV compatible con Excel y a PDF maquetado con jsPDF y autoTable.
- **PWA e híbrida**: manifest, service worker y configuración de Capacitor.
- **Responsive y accesible**: HTML semántico, `aria`, foco visible y enlace «saltar al contenido».

## Stack

| Área | Tecnología |
| --- | --- |
| Framework | Angular 22 · componentes standalone · rutas lazy |
| UI | Ionic 9 · modo Material · SCSS |
| Estado y datos | Signals · RxJS · servicios SQL y NoSQL simulados |
| Gráficos e informes | Chart.js · jsPDF · jspdf-autotable |
| PWA e híbrida | Manifest · service worker · Capacitor |
| Calidad | Vitest · ESLint · GitHub Actions |

## Puesta en marcha

```bash
npm install
npm start            # http://localhost:4200
```

Compilación y comprobaciones:

```bash
npm run build        # producción en www/
npm run test:ci      # 11 pruebas unitarias
npm run lint         # ESLint
```

## Credenciales de prueba

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Administrador | `admin@centro.es` | `Admin123` |
| Usuario estándar | `usuario@centro.es` | `Usuario123` |

También se puede crear una cuenta nueva desde el registro.

## Roles y permisos

| Acción | Usuario | Administrador |
| --- | :---: | :---: |
| Iniciar y cerrar sesión | Sí | Sí |
| Crear una incidencia | Sí | Sí |
| Ver todas las incidencias | No, solo las suyas | Sí |
| Cambiar el estado | No | Sí |
| Panel con gráfico | No | Sí |
| Exportar CSV / PDF | Sí | Sí |

## Rutas

| Ruta | Pantalla | Protección |
| --- | --- | --- |
| `/login` | Acceso | `guestGuard` |
| `/registro` | Crear cuenta | `guestGuard` |
| `/app/panel` | Panel de administración | `authGuard` + `adminGuard` |
| `/app/incidencias` | Listado con filtros | `authGuard` |
| `/app/incidencias/nueva` | Alta de incidencia | `authGuard` |
| `/app/incidencias/:codigo` | Detalle | `authGuard` |
| `/app/ayuda` | Manual de uso | `authGuard` |

## Estructura

```
src/app/
├── core/                 # modelos, datos de ejemplo, servicios, guards y validadores
├── shared/components/    # cabecera, barra inferior, tarjeta, tabla y campo de formulario
├── pages/                # acceso, registro, shell, panel, incidencias y ayuda
├── app.config.ts         # Ionic, router y service worker
└── app.routes.ts         # rutas lazy y protegidas
```

Datos simulados: `core/data/seed.ts` (3 usuarios, 12 incidencias) ·
`core/services/sql.service.ts` (relacional) · `core/services/nosql.service.ts` (feed).

## Despliegue

`npm run build` genera el sitio estático en `www/`. Sirve para cualquier hosting estático
(Vercel, Netlify, Nginx…) configurando la reescritura de SPA hacia `index.html`. Para la app
nativa, `capacitor.config.ts` ya está listo: `npx cap add android` o `ios` y `npm run cap:sync`.

## Autor

Nicolás San Marcos · módulo DI 0488 · octubre 2026.
