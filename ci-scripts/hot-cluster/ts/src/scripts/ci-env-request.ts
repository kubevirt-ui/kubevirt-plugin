/**
 * Create a ci-env-controller trigger ConfigMap and wait for the test
 * environment to become ready.
 *
 * Required env: CM_NAME, CM_NS, PLUGIN_IMAGE, TEST_NS, TIMEOUT
 * Optional env: USER_SETTINGS_LOCATION
 *
 * Outputs: bridge-base-address, console-route
 */

import { execSync } from 'node:child_process';

import { waitForConfigMapStatus } from '../ci-env-poll';
import { requireEnv } from '../kube-client';
import { addStepSummary, setOutput } from '../utils';

const cmName = requireEnv('CM_NAME');
const cmNs = requireEnv('CM_NS');
const pluginImage = requireEnv('PLUGIN_IMAGE');
const testNs = requireEnv('TEST_NS');
const timeout = Number(requireEnv('TIMEOUT'));
const userSettingsLocation = process.env.USER_SETTINGS_LOCATION ?? '';

const manifest = `
apiVersion: v1
kind: ConfigMap
metadata:
  name: ${cmName}
  namespace: ${cmNs}
  labels:
    ci.kubevirt-plugin/type: test-environment
data:
  desired-state: "present"
  plugin-image: "${pluginImage}"
  test-namespace: "${testNs}"
  user-settings-location: "${userSettingsLocation}"
`.trim();

execSync('oc create -f -', { input: manifest, stdio: ['pipe', 'inherit', 'inherit'] });
console.log(`Created trigger ConfigMap ${cmName} in ${cmNs}`);

const main = async (): Promise<void> => {
  const result = await waitForConfigMapStatus({
    label: 'test environment',
    name: cmName,
    namespace: cmNs,
    targetStatus: 'ready',
    timeoutSeconds: timeout,
  });

  setOutput('bridge-base-address', result.data['bridge-base-address']);
  setOutput('console-route', result.data['console-route']);

  addStepSummary(
    [
      '<details><summary>CI Test Environment</summary>',
      '',
      '| Input Parameter | Value |',
      '|------|-------|',
      `| ConfigMap | \`${cmNs}/${cmName}\` |`,
      `| Plugin image | \`${pluginImage}\` |`,
      `| Test namespace | \`${testNs}\` |`,
      '',
      '| Output Parameter | Value |',
      '|------|-------|',
      `| Bridge base address | \`${result.data['bridge-base-address']}\` |`,
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
