import * as fs from 'fs';
import * as path from 'path';

import { EnvVariables } from '@/utils/env-variables';
import { logger } from '@/utils/logger';
import type { FullConfig } from '@playwright/test';

import type { SetupContext } from './rule-engine';
import { getSetupRules, RuleEngine } from './rule-engine';

async function globalSetup(_config: FullConfig) {
  if (process.env.SKIP_GLOBAL_SETUP === 'true') {
    logger.info('⏭️ Skipping global setup (SKIP_GLOBAL_SETUP=true)');
    logger.info(' Assuming setup was done by orchestration layer');
    return;
  }

  // Auto-detect architecture from cluster URL/name and set ARCH so all workers see it.
  if (!process.env.ARCH && EnvVariables.isS390x) {
    process.env.ARCH = 's390x';
    logger.info('🔧 Auto-detected s390x architecture from cluster URL — set ARCH=s390x');
  }

  logger.info('🚀 Setting up test environment...');

  const useSharding = EnvVariables.isSharded;
  const shardIndex = EnvVariables.shardIndex;

  const testNamespace =
    useSharding && shardIndex
      ? `${EnvVariables.testNamespace}-${shardIndex}`
      : EnvVariables.testNamespace;

  if (useSharding && shardIndex) {
    logger.info(
      `🔀 Sharding enabled: Using isolated namespace '${testNamespace}' (shard ${shardIndex}/${EnvVariables.shardTotal})`,
    );
  }

  const projectRoot = path.resolve(__dirname, '..', '..');

  const kubeConfigDir = path.resolve(projectRoot, '.kubeconfigs');
  const kubeConfigFileName =
    useSharding && shardIndex ? `shard-${shardIndex}-config` : 'test-config';
  const kubeConfigPath = path.join(kubeConfigDir, kubeConfigFileName);

  const storageStateDir = path.resolve(projectRoot, '.storage-states');
  let storageStateFileName: string;
  if (useSharding && shardIndex) {
    storageStateFileName = `shard-${shardIndex}-state.json`;
  } else if (EnvVariables.isNonPrivUser) {
    storageStateFileName = 'nonpriv-state.json';
  } else {
    storageStateFileName = 'test-state.json';
  }
  const storageStatePath = path.join(storageStateDir, storageStateFileName);

  for (const dir of [kubeConfigDir, storageStateDir]) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      logger.info(`📁 Created directory: ${dir}`);
    }
  }

  const ctx: SetupContext = {
    kubeConfigPath,
    storageStatePath,
    testNamespace,
    cnvNamespace: EnvVariables.cnvNamespace,
    projectRoot,
    useSharding,
    shardIndex,
    nncpNic: process.env.NNCP_NIC,
  };

  const engine = new RuleEngine();
  const rules = getSetupRules();

  if (EnvVariables.skipBrowserSetup) {
    logger.info(
      '⏭️ SKIP_BROWSER_SETUP=1: browser-login and save-storage-state still run so API tests have session cookies.',
    );
  }

  if (EnvVariables.diagnoseFailures) {
    const hasApiKey = Boolean(process.env.CURSOR_API_KEY);
    const model = process.env.DIAGNOSE_MODEL || 'claude-sonnet-4-6';
    const mode = hasApiKey
      ? `agent mode (model: ${model})`
      : 'heuristic-only mode — no CURSOR_API_KEY set';
    const autofix = EnvVariables.diagnoseAutofix
      ? 'ON — agent may edit spec/page-object files on "pass" verdicts, or add visual-regression masks on "skip"/"fail" verdicts'
      : 'off';
    const timeoutOverride = EnvVariables.diagnoseAgentTimeoutOverrideMs;
    const agentTimeout =
      timeoutOverride !== null
        ? `${timeoutOverride}ms (DIAGNOSE_AGENT_TIMEOUT_MS override)`
        : "auto — matches each failing test's own configured timeout";
    logger.info(
      `🤖 AI-assisted failure diagnosis ENABLED — ${mode}, autofix: ${autofix}, agent timeout: ${agentTimeout}`,
    );
  } else {
    logger.info('🤖 AI-assisted failure diagnosis: disabled (set DIAGNOSE_FAILURES=1 to enable)');
  }

  try {
    await engine.runSetup(rules, ctx);

    logger.success('Test environment setup complete');
    logger.info(`   - Test Namespace: ${ctx.testNamespace}`);
    logger.info(`   - CNV Namespace: ${ctx.cnvNamespace}`);
    logger.info(`   - Auth Token: ${ctx.authToken ? 'Available ✓' : 'Not available'}`);
    logger.info(`   - NNCP NIC: ${ctx.nncpNic ? ctx.nncpNic : 'Not available'}`);
  } catch (error: unknown) {
    logger.error(`❌ Failed to setup test environment: ${error}`);
    throw error;
  }
}

export default globalSetup;
