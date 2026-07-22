/**
 * Deregister ARC runners by uninstalling Helm releases for the runner scale set
 * and ARC controller.
 *
 * Required env: CLUSTER_NAME
 */

import { execSync } from 'node:child_process';

import { requireEnv } from '../kube-client';

const helmAvailable = (): boolean => {
  try {
    execSync('command -v helm', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
};

const installHelm = (): boolean => {
  try {
    execSync('curl -fsSL https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash', {
      stdio: 'inherit',
    });
    return true;
  } catch {
    return false;
  }
};

const main = async (): Promise<void> => {
  const clusterName = requireEnv('CLUSTER_NAME');

  if (!helmAvailable() && !installHelm()) {
    console.log('WARNING: Helm not available, skipping Helm uninstall');
    return;
  }

  console.log(`Uninstalling ARC runner scale set '${clusterName}'...`);
  try {
    execSync(`helm uninstall "${clusterName}" --namespace arc-runners --wait --timeout 5m`, {
      stdio: 'inherit',
    });
  } catch {
    console.log('Runner scale set not found or already removed');
  }

  console.log('Uninstalling ARC controller...');
  try {
    execSync('helm uninstall arc --namespace arc-systems --wait --timeout 5m', { stdio: 'inherit' });
  } catch {
    console.log('ARC controller not found or already removed');
  }
};

main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
