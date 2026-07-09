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

  logger.info('🚀 Setting up test environment...');

  const testNamespace = EnvVariables.testNamespace;
  const projectRoot = path.resolve(__dirname, '..', '..');

  const kubeConfigDir = path.resolve(projectRoot, '.kubeconfigs');
  const kubeConfigPath = path.join(kubeConfigDir, 'test-config');

  const storageStateDir = path.resolve(projectRoot, '.storage-states');
  const storageStateFileName = EnvVariables.isNonPrivUser
    ? 'nonpriv-state.json'
    : 'test-state.json';
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
  };

  const engine = new RuleEngine();
  const rules = getSetupRules();

  if (EnvVariables.skipBrowserSetup) {
    logger.info(
      '⏭️ SKIP_BROWSER_SETUP=1: browser-login and save-storage-state still run so API tests have session cookies.',
    );
  }

  try {
    await engine.runSetup(rules, ctx);

    logger.success('Test environment setup complete');
    logger.info(`   - Test Namespace: ${ctx.testNamespace}`);
    logger.info(`   - CNV Namespace: ${ctx.cnvNamespace}`);
    logger.info(`   - Auth Token: ${ctx.authToken ? 'Available ✓' : 'Not available'}`);
  } catch (error: unknown) {
    logger.error(`❌ Failed to setup test environment: ${error}`);
    throw error;
  }
}

export default globalSetup;
