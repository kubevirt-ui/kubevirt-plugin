import * as path from 'path';

import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

import { EnvVariables } from '@/utils/env-variables';
import { logger } from '@/utils/logger';

import { RuleEngine } from './rule-engine';
import { getSetupRules } from './rule-engine/setup-rules';
import type { SetupContext } from './rule-engine/types';

async function globalSetup(): Promise<void> {
  logger.info('--- GLOBAL SETUP: Scenario Infrastructure ---');

  const projectRoot = path.resolve(__dirname, '..', '..');
  const kubeConfigPath = path.join(projectRoot, '.kubeconfigs', 'test-config');
  const testNamespace = `pw-scenario-${Date.now().toString(36)}`;

  const storageStateDir = path.resolve(kubeConfigPath, '..', '.storage-states');
  const storageStatePath = path.join(storageStateDir, 'test-state.json');

  const ctx: SetupContext = {
    cnvNamespace: EnvVariables.cnvNamespace,
    kubeConfigPath,
    projectRoot,
    storageStatePath,
    testNamespace,
  };

  const engine = new RuleEngine();
  const rules = getSetupRules();
  await engine.runSetup(rules, ctx);

  logger.info('--- GLOBAL SETUP COMPLETE ---');
}

export default globalSetup;
