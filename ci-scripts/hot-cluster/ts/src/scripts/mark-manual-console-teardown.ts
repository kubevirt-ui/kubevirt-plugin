/**
 * Mark a manual console instance for teardown by patching its trigger
 * ConfigMap's desired-state to "absent".  ci-env-controller's existing
 * reconciliation loop handles the actual cleanup from there.
 *
 * Env: CM_NAME, CI_ENV_NS, CLUSTER_NAME (for warning message)
 */

import { execSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';

import { requireEnv } from '../kube-client';

const main = (): void => {
  const cmName = requireEnv('CM_NAME');
  const namespace = requireEnv('CI_ENV_NS');
  const clusterName = process.env.CLUSTER_NAME ?? '';

  const cmRef = execSync(
    'oc get configmap "${CM_NAME}" -n "${CI_ENV_NS}" --ignore-not-found -o name',
    { encoding: 'utf8' },
  ).trim();

  if (!cmRef) {
    console.log(
      `::warning::No manual console ConfigMap ${namespace}/${cmName} found on ${clusterName} -- nothing to tear down.`,
    );
    appendFileSync(process.env.GITHUB_OUTPUT!, 'found=false\n');
    return;
  }

  execSync(
    'oc patch configmap "${CM_NAME}" -n "${CI_ENV_NS}" ' +
      "--type merge -p '{\"data\":{\"desired-state\":\"absent\"}}'",
    { stdio: 'inherit' },
  );

  appendFileSync(process.env.GITHUB_OUTPUT!, 'found=true\n');
  console.log(
    `Marked ${namespace}/${cmName} for teardown (desired-state=absent); ` +
      'ci-env-controller will remove its Helm release, namespace resources, and OAuth user shortly.',
  );
};

main();
