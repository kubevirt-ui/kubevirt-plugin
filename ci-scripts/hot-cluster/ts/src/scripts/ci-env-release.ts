/**
 * Signal ci-env-controller to tear down a test environment by patching
 * the trigger ConfigMap to desired-state=absent, wait for cleanup,
 * then delete the ConfigMap.
 *
 * Required env: CM_NAME, CM_NS, TIMEOUT
 */

import { execSync } from 'node:child_process';

import { waitForCleanup } from '../ci-env-poll';
import { requireEnv } from '../kube-client';

const cmName = requireEnv('CM_NAME');
const cmNs = requireEnv('CM_NS');
const timeout = Number(requireEnv('TIMEOUT'));

const main = async (): Promise<void> => {
  try {
    execSync(`oc get configmap "${cmName}" -n "${cmNs}"`, { stdio: 'pipe' });
  } catch {
    console.log(`ConfigMap ${cmNs}/${cmName} not found, nothing to clean up.`);
    return;
  }

  execSync(
    `oc patch configmap "${cmName}" -n "${cmNs}" --type merge -p '{"data":{"desired-state":"absent"}}'`,
    { stdio: 'inherit' },
  );

  await waitForCleanup({ name: cmName, namespace: cmNs, timeoutSeconds: timeout });

  try {
    execSync(`oc delete configmap "${cmName}" -n "${cmNs}"`, { stdio: 'inherit' });
  } catch {
    // best effort
  }
};

void main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
