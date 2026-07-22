/**
 * Delete the short-lived credentials Secret (defense-in-depth).
 * --ignore-not-found makes this a no-op when the controller already
 * consumed it during normal provisioning.
 *
 * Env: SECRET_NAME, CI_ENV_NS
 */

import { execSync } from 'node:child_process';

import { requireEnv } from '../kube-client';

const main = (): void => {
  requireEnv('SECRET_NAME');
  requireEnv('CI_ENV_NS');

  execSync('oc delete secret "${SECRET_NAME}" --namespace="${CI_ENV_NS}" --ignore-not-found', {
    stdio: 'inherit',
  });
};

main();
