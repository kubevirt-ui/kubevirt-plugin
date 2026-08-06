import type { PathValidationConfig } from '../pr-path-validation/types';

/** Labels, status context, and sensitive path rules for translation catalog validation. */
export const I18N_CONFIG = {
  commandName: '/i18n-approved',
  displayName: 'Translations validation',
  exactPaths: [],
  labelMeta: {
    alert: {
      color: 'f59e0b',
      description: 'PR modifies translation catalog files under locales/',
    },
    block: { color: 'b60205', description: 'Blocked until i18n-reviewed label is added' },
  },
  labels: {
    alert: 'i18n-changed',
    block: 'do-not-merge/i18n-review',
    reviewed: 'i18n-reviewed',
    skip: 'skip-i18n-check',
  },
  pathPrefixes: ['locales/'],
} as const satisfies PathValidationConfig;
