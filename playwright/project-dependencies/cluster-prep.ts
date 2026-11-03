/**
 * Cluster prep — run before Playwright tier/gating jobs to clear leftover test resources.
 *
 * Mirrors global teardown cluster rules (without deleting kubeconfig / storage state).
 * Set SKIP_CLUSTER_PREP=1 to skip (e.g. mid-debug session).
 */
import * as fs from 'fs';
import * as path from 'path';

import { deleteLabeledE2eNamespaces, deletePwMigrationPolicies } from '@/utils/cluster-oc';
import { EnvVariables } from '@/utils/env-variables';
import { logger } from '@/utils/logger';

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

function resolveKubeconfigPath(): string {
  return path.join(PROJECT_ROOT, '.kubeconfigs', 'test-config');
}

export async function runClusterPrepBeforeTests(): Promise<void> {
  if (EnvVariables.skipOcInvocations) {
    logger.info('⏭️  Skipping cluster prep (browser-only / local console — no oc)');
    return;
  }
  if (process.env.SKIP_CLUSTER_PREP === '1' || process.env.SKIP_CLUSTER_PREP === 'true') {
    logger.info('⏭️  Skipping cluster prep (SKIP_CLUSTER_PREP is set)');
    return;
  }

  const kubeConfigPath = resolveKubeconfigPath();
  if (!fs.existsSync(kubeConfigPath) && EnvVariables.clusterUrl && EnvVariables.password) {
    logger.info('ℹ️ No kubeconfig yet — cluster prep will run after global setup');
    return;
  }

  process.env.KUBECONFIG = kubeConfigPath;
  logger.info('🧹 Cluster prep: cleaning labeled e2e namespaces and test migration policies...');
  deletePwMigrationPolicies(kubeConfigPath);
  deleteLabeledE2eNamespaces(kubeConfigPath);
  logger.success('Cluster prep complete');
}

if (require.main === module) {
  runClusterPrepBeforeTests()
    .then(() => process.exit(0))
    .catch((err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error(`Cluster prep failed: ${msg}`);
      process.exit(1);
    });
}
