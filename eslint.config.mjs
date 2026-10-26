// @ts-check
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import { configs as angularConfigs, processInlineTemplates } from 'angular-eslint';

/**
 * Configuración de ESLint (flat config) del Gestor de Incidencias.
 * Reglas de TypeScript + reglas y accesibilidad de las plantillas de Angular.
 */
export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'www/**',
      'docs/**',
      '.angular/**',
      'node_modules/**',
      'android/**',
      'ios/**',
      'coverage/**',
      'src/**/*.spec.ts',
    ],
  },
  {
    files: ['**/*.ts'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      ...angularConfigs.tsRecommended,
    ],
    processor: processInlineTemplates,
    rules: {
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'app', style: 'kebab-case' },
      ],
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'app', style: 'camelCase' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      'no-console': ['error', { allow: ['error', 'warn'] }],
    },
  },
  {
    files: ['**/*.html'],
    extends: [...angularConfigs.templateRecommended, ...angularConfigs.templateAccessibility],
  },
);
