/**
 * Create/update a ci-env-controller trigger ConfigMap for the manual
 * console environment and wait for it to become ready.
 *
 * Required env: CM_NAME, CM_NS, PLUGIN_IMAGE, TEST_NS, TIMEOUT
 * Optional env: HELM_RELEASE, AUTH_MODE (openshift|disabled, default openshift),
 *               HTPASSWD_USER, HTPASSWD_SECRET_NAME (required when AUTH_MODE=openshift)
 *
 * Outputs: bridge-base-address, console-route, auth-mode
 */

import { execSync } from 'node:child_process';

import { waitForConfigMapStatus } from '../ci-env-poll';
import { requireEnv } from '../kube-client';
import { addStepSummary, setOutput } from '../utils';

const cmName = requireEnv('CM_NAME');
const cmNs = requireEnv('CM_NS');
const pluginImage = requireEnv('PLUGIN_IMAGE');
const testNs = requireEnv('TEST_NS');
const helmRelease = process.env.HELM_RELEASE ?? cmName;
const authMode = (process.env.AUTH_MODE ?? 'openshift').trim() || 'openshift';
const htpasswdUser = process.env.HTPASSWD_USER ?? '';
const htpasswdSecretName = process.env.HTPASSWD_SECRET_NAME ?? '';
const timeout = Number(requireEnv('TIMEOUT'));

if (authMode !== 'openshift' && authMode !== 'disabled') {
  throw new Error(`Invalid AUTH_MODE '${authMode}' (must be 'openshift' or 'disabled')`);
}

if (authMode === 'openshift') {
  if (!htpasswdUser || !htpasswdSecretName) {
    throw new Error(
      'AUTH_MODE=openshift requires HTPASSWD_USER and HTPASSWD_SECRET_NAME',
    );
  }
}

const authFields =
  authMode === 'openshift'
    ? `
  auth-mode: "openshift"
  htpasswd-user: "${htpasswdUser}"
  htpasswd-secret-name: "${htpasswdSecretName}"`
    : `
  auth-mode: "disabled"`;

const manifest = `
apiVersion: v1
kind: ConfigMap
metadata:
  name: ${cmName}
  namespace: ${cmNs}
  labels:
    ci.kubevirt-plugin/type: manual-console
data:
  desired-state: "present"
  plugin-image: "${pluginImage}"
  test-namespace: "${testNs}"
  helm-release: "${helmRelease}"${authFields}
`.trim();

execSync('oc apply -f -', { input: manifest, stdio: ['pipe', 'inherit', 'inherit'] });
console.log(`Created/updated trigger ConfigMap ${cmName} in ${cmNs} (auth-mode=${authMode})`);

execSync(
  `oc patch configmap ${cmName} -n ${cmNs} --type merge -p '{"data":{"status":"pending","error-message":null}}'`,
  { stdio: 'inherit' },
);
console.log('Reset status=pending so ci-env-controller re-provisions on this dispatch');

const main = async (): Promise<void> => {
  const result = await waitForConfigMapStatus({
    label: 'manual console environment',
    name: cmName,
    namespace: cmNs,
    targetStatus: 'ready',
    timeoutSeconds: timeout,
  });

  setOutput('bridge-base-address', result.data['bridge-base-address']);
  setOutput('console-route', result.data['console-route']);
  setOutput('auth-mode', authMode);

  const loginRows =
    authMode === 'openshift'
      ? [`| Login username | \`${htpasswdUser}\` |`]
      : ['| Auth | `disabled` (no login; console SA token) |'];

  addStepSummary(
    [
      '<details><summary>Manual Console Environment</summary>',
      '',
      '| Input Parameter | Value |',
      '|------|-------|',
      `| ConfigMap | \`${cmNs}/${cmName}\` |`,
      `| Helm release | \`${helmRelease}\` |`,
      `| Plugin image | \`${pluginImage}\` |`,
      `| Namespace | \`${testNs}\` |`,
      ...loginRows,
      '',
      '| Output Parameter | Value |',
      '|------|-------|',
      `| Console route | \`${result.data['console-route']}\` |`,
      '',
      '</details>',
    ].join('\n'),
  );
};

void main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
