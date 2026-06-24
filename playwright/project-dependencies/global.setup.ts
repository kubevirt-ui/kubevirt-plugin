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
    cnvNamespace: EnvVariables.cnvNamespace,
    kubeConfigPath,
    projectRoot,
    storageStatePath,
    testNamespace,
  };

  const engine = new RuleEngine();
  let rules = getSetupRules();

  if (EnvVariables.skipBrowserSetup) {
    // Keep browser-login + save-storage-state: the session cookies they produce are required
    // by the console proxy for API tests (Bearer token alone is not sufficient).
    // Skip only the UI-navigation steps that E2E tests need but API tests do not.
    const SKIP_NAV_RULE_IDS = [
      'dismiss-welcome-modals',
      'navigate-virtualization',
      'set-default-project',
    ];
    logger.info(
      '⏭️ SKIP_BROWSER_SETUP=1: skipping UI-navigation steps only ' +
        `(${SKIP_NAV_RULE_IDS.join(', ')}). ` +
        'browser-login and save-storage-state still run so API tests have session cookies.',
    );
    rules = rules.filter((r) => !SKIP_NAV_RULE_IDS.includes(r.id));
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
