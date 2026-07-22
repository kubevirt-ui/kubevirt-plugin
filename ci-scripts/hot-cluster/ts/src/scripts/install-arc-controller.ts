/**
 * Install ARC controller: namespace, SCC, Helm gha-runner-scale-set-controller.
 * Replaces: ci-scripts/hot-cluster/arc/install-arc-controller.sh
 *
 * Helm calls stay as subprocess (no Node.js Helm SDK exists).
 */

import { execSync } from 'node:child_process';
import { resolve } from 'node:path';

import { KubeClient, requireEnv } from '../kube-client';

const main = async (): Promise<void> => {
  const controllerNs = process.env.ARC_CONTROLLER_NS ?? 'arc-systems';
  const installName = process.env.ARC_CONTROLLER_INSTALL_NAME ?? 'arc';
  const helmRepo = 'oci://ghcr.io/actions/actions-runner-controller-charts';
  const arcVersion = process.env.ARC_VERSION ?? '0.14.0';
  const arcDir = resolve(__dirname, '../../../../arc');

  console.log('=== ARC controller installation (OpenShift) ===');
  console.log(`  ARC_CONTROLLER_NS:           ${controllerNs}`);
  console.log(`  ARC_CONTROLLER_INSTALL_NAME: ${installName}`);
  console.log(`  ARC_VERSION:                 ${arcVersion}`);

  const client = KubeClient.fromKubeconfig();

  // Create namespace
  console.log(`Creating namespace ${controllerNs}...`);
  try {
    await client.coreV1.createNamespace({ body: { metadata: { name: controllerNs } } });
  } catch (err) {
    if ((err as { statusCode?: number }).statusCode !== 409) throw err;
  }

  // Apply SCC
  console.log('Applying ARC SCC and ClusterRole...');
  execSync(`oc apply -f "${resolve(arcDir, 'arc-openshift-scc.yaml')}"`, { stdio: 'inherit' });

  // Helm install
  const controllerSaName = `${installName}-gha-rs-controller`;
  const helmArgs = [
    'helm', 'upgrade', installName,
    `${helmRepo}/gha-runner-scale-set-controller`,
    '--install',
    '--namespace', controllerNs,
    '--set', `serviceAccount.name=${controllerSaName}`,
    '--wait', '--timeout', '5m',
  ];
  if (arcVersion && arcVersion !== 'latest') {
    helmArgs.push('--version', arcVersion);
  }

  console.log(`Installing ARC controller (Helm release: ${installName})...`);
  execSync(helmArgs.join(' '), { stdio: 'inherit' });

  console.log('\n=== ARC controller installation complete ===\n');
};

main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
