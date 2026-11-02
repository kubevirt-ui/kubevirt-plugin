import * as fs from 'fs';
import * as path from 'path';

import { logger } from '@/utils/logger';
import { getStorageStatePath } from '@/utils/storage-state';

import {
  getTeardownRules,
  RuleEngine,
  type SetupContext,
  type TeardownContext,
} from './rule-engine';

function resolveUseSharding(): { shardIndex?: string; useSharding: boolean } {
  const pwShards = process.env.PW_SHARDS;
  const shardIndex = process.env.PLAYWRIGHT_SHARD_INDEX;
  const useSharding = Boolean(pwShards && pwShards !== '1' && parseInt(pwShards, 10) > 1);
  return { shardIndex, useSharding };
}

function createSetupContextForTeardown(): SetupContext {
  const projectRoot = path.resolve(__dirname, '..', '..');
  const { shardIndex, useSharding } = resolveUseSharding();
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

function createTeardownContext(setupCtx: SetupContext): TeardownContext {
  const { shardIndex, useSharding } = resolveUseSharding();
  const shouldCleanupClusterResources = !useSharding || shardIndex === '1';
  const kubeConfigPath = fs.existsSync(setupCtx.kubeConfigPath)
    ? setupCtx.kubeConfigPath
    : setupCtx.effectiveKubeConfigPath;

  return {
    kubeConfigPath,
    shardIndex,
    shouldCleanupClusterResources,
    testNamespace: setupCtx.testNamespace,
    useSharding,
  };
}

function applyKubeconfigToProcess(kubeConfigPath?: string): void {
  if (kubeConfigPath) {
    process.env.KUBECONFIG = kubeConfigPath;
  }
}

async function globalTeardown(): Promise<void> {
  if (process.env.SKIP_GLOBAL_TEARDOWN === 'true') {
    return;
  }

  const setupCtx = createSetupContextForTeardown();
  const ctx = createTeardownContext(setupCtx);
  applyKubeconfigToProcess(ctx.kubeConfigPath);

  logger.info('🧹 Running global teardown rules...');
  const engine = new RuleEngine();
  await engine.runTeardown(getTeardownRules(), ctx);
}

export default globalTeardown;
