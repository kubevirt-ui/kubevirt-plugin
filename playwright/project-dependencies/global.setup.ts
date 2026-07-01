import * as path from 'path';

import { EnvVariables } from '@/utils/env-variables';
import { getStorageStatePath, logger } from '@/utils/file-utils';

import { runSetupRules } from './rule-engine';
import { getSetupRules } from './rule-engine/setup-rules';
import type { SetupContext } from './rule-engine/types';

async function globalSetup(): Promise<void> {
  logger.info('--- GLOBAL SETUP: Scenario Infrastructure ---');

  const projectRoot = path.resolve(__dirname, '..', '..');
  const kubeConfigPath = path.join(projectRoot, '.kubeconfigs', 'test-config');
  const storageStateDir = path.join(projectRoot, '.storage-states');
  const testNamespace = `pw-scenario-${Date.now().toString(36)}`;

  const storageStatePath =
    getStorageStatePath(kubeConfigPath) || path.join(storageStateDir, 'test-state.json');

  const ctx: SetupContext = {
    cnvNamespace: EnvVariables.cnvNamespace,
    kubeConfigPath,
    storageStatePath,
    testNamespace,
  };

  const rules = getSetupRules();
  await runSetupRules(rules, ctx);

  logger.info('--- GLOBAL SETUP COMPLETE ---');
}

export default globalSetup;
