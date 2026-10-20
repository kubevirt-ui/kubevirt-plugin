import * as path from 'path';

import { EnvVariables } from '@/utils/env-variables';
import { logger } from '@/utils/logger';
import { getStorageStatePath, storageStateExists } from '@/utils/storage-state';

import '../load-env';

import { getSetupRules, RuleEngine, type SetupContext } from './rule-engine';

function resolveUseSharding(): { useSharding: boolean; shardIndex?: string } {
  const pwShards = process.env.PW_SHARDS;
  const shardIndex = process.env.PLAYWRIGHT_SHARD_INDEX;
  const useSharding = Boolean(pwShards && pwShards !== '1' && parseInt(pwShards, 10) > 1);
  return { useSharding, shardIndex };
}

function createSetupContext(): SetupContext {
  const projectRoot = path.resolve(__dirname, '..', '..');
  const { useSharding, shardIndex } = resolveUseSharding();
  return {
    cnvNamespace: process.env.CNV_NAMESPACE || 'openshift-cnv',
    kubeConfigPath: path.join(projectRoot, '.kubeconfigs', 'test-config'),
    projectRoot,
    shardIndex,
    storageStatePath: getStorageStatePath(),
    testNamespace: process.env.TEST_NAMESPACE || '',
    useSharding,
  };
}

function applyKubeconfigToProcess(ctx: SetupContext): void {
  if (ctx.effectiveKubeConfigPath) {
    process.env.KUBECONFIG = ctx.effectiveKubeConfigPath;
  }
}

/**
 * Global setup via rule engine (main-style): AUTH → CLUSTER → BROWSER → REPORTING.
 * Tests assume authenticated `page` from config `storageState`.
 */
async function globalSetup(): Promise<void> {
  if (process.env.SKIP_GLOBAL_SETUP === 'true') {
    if (!storageStateExists()) {
      throw new Error(
        'SKIP_GLOBAL_SETUP=true but no storage state file found. Run once without SKIP_GLOBAL_SETUP or copy state into .storage-states/',
      );
    }
    return;
  }

  const ctx = createSetupContext();

  if (process.env.REUSE_STORAGE_STATE === '1' && storageStateExists()) {
    logger.info(`♻️ Reusing existing storage state: ${ctx.storageStatePath}`);
  }

  if (EnvVariables.skipOcInvocations) {
    logger.info('🏠 Browser-only setup: skipping oc login');
    if (EnvVariables.isLocalMode && !storageStateExists()) {
      logger.info(
        '🏠 Local console: global setup will open the UI (auth disabled) and write storage state',
      );
    } else if (!EnvVariables.isLocalMode && !EnvVariables.isNonPrivUser) {
      logger.info('Privileged setup: console login + /api/kubernetes only (no oc)');
    } else if (EnvVariables.isNonPrivUser) {
      logger.info(
        'Non-priv setup: kubeadmin oc (IDP, RBAC, ConfigMaps) then console login as test user',
      );
    }
  }

  const engine = new RuleEngine();
  await engine.runSetup(getSetupRules(), ctx);
  applyKubeconfigToProcess(ctx);
}

export default globalSetup;
