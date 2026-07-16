import type { PathValidationConfig } from '../pr-path-validation/types';

/**
 * Labels, status context, and sensitive path rules for CI configuration
 * validation. .github/ is fully protected (workflows, actions, and
 * scripts, including this module's own files), so unlike AI_CONFIG there's
 * no separate related-automation self-protection list needed.
 */
export const CI_SCRIPTS_CONFIG = {
  exactPaths: ['Dockerfile', 'playwright-runner-hc-e2e.sh'],
  pathPrefixes: ['.github/', 'ci-scripts/'],
  labels: {
    alert: 'ci-scripts-changed',
    block: 'do-not-merge/ci-scripts-review',
    reviewed: 'ci-scripts-reviewed',
    skip: 'skip-ci-scripts-check',
  },
  labelMeta: {
    alert: {
      color: 'f59e0b',
      description: 'PR modifies CI configuration (workflows, actions, scripts, or ci-scripts/)',
    },
    block: { color: 'b60205', description: 'Blocked until ci-scripts-reviewed label is added' },
  },
  statusContext: 'ci-scripts-validation',
  displayName: 'CI configuration validation',
  commandName: '/ci-approved',
} as const satisfies PathValidationConfig;
