/**
 * Create (or update) a short-lived credentials Secret in the CI namespace.
 * Uses `oc create --dry-run | oc apply` for idempotency.
 * Shared by deploy-manual-console.yml and deploy-plugin.yml.
 *
 * Env: SECRET_NAME, CI_ENV_NS, MANUAL_CONSOLE_PASSWORD
 */

import { execSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';

import { requireEnv } from '../kube-client';

const main = (): void => {
  requireEnv('SECRET_NAME');
  requireEnv('CI_ENV_NS');
  requireEnv('MANUAL_CONSOLE_PASSWORD');

  execSync(
    'oc create secret generic "${SECRET_NAME}" ' +
      '--namespace="${CI_ENV_NS}" ' +
      '--from-literal=password="${MANUAL_CONSOLE_PASSWORD}" ' +
      '--dry-run=client -o yaml | oc apply -f -',
    { stdio: 'inherit' },
  );

  appendFileSync(
    process.env.GITHUB_OUTPUT!,
    `name=${process.env.SECRET_NAME}\n`,
  );
};

main();
