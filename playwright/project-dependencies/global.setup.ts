import * as path from 'path';

import { EnvVariables } from '@/utils/env-variables';
import { logger } from '@/utils/logger';
import { getStorageStatePath, storageStateExists } from '@/utils/storage-state';

import '../load-env';

import { getSetupRules, RuleEngine, type SetupContext } from './rule-engine';

function resolveUseSharding(): { shardIndex?: string; useSharding: boolean } {
  const useSharding = EnvVariables.isSharded;
  const shardIndex = EnvVariables.shardIndex;
  return { shardIndex, useSharding };
}

function createSetupContext(): SetupContext {
  const projectRoot = path.resolve(__dirname, '..', '..');
  const { shardIndex, useSharding } = resolveUseSharding();
  const testNamespace =
    useSharding && shardIndex
      ? `${EnvVariables.testNamespace}-${shardIndex}`
      : EnvVariables.testNamespace;

  return {
    cnvNamespace: EnvVariables.cnvNamespace,
    projectRoot,
    shardIndex,
    storageStatePath: getStorageStatePath(),
    testNamespace,
    useSharding,
  };
}

/**
 * Global setup via rule engine (main-style / CNV-98979): AUTH → CLUSTER → BROWSER → REPORTING.
 * Tests assume authenticated `page` from config `storageState`.
 * Quiet by design — individual setup rules own their log lines.
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

  // Auto-detect architecture from cluster URL/name so workers see ARCH=s390x.
  if (!process.env.ARCH && EnvVariables.isS390x) {
    process.env.ARCH = 's390x';
    logger.info('Auto-detected s390x architecture from cluster URL — set ARCH=s390x');
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
}

export default globalSetup;
