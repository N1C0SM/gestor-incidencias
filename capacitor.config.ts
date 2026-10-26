import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Configuración de la app híbrida.
 *
 * El mismo bundle de Angular se empaqueta con Capacitor en iOS y Android.
 * `webDir` apunta a la salida de la compilación de producción (`www`).
 */
const config: CapacitorConfig = {
  appId: 'es.nebrija.gestorincidencias',
  appName: 'Gestor de Incidencias',
  webDir: 'www',
  bundledWebRuntime: false,
  android: {
    allowMixedContent: false,
  },
  ios: {
    contentInset: 'always',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 600,
      backgroundColor: '#0f172a',
      showSpinner: false,
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#0f172a',
    },
  },
};

export default config;
