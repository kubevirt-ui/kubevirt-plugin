import * as path from 'path';

import { KubernetesClient } from '@/clients/kubernetes-client';
import { EnvVariables } from '@/utils/env-variables';
import { logger } from '@/utils/file-utils';
import { TestConfigManager } from '@/utils/test-config';

import { runTeardownRules } from './rule-engine';
import { getTeardownRules } from './rule-engine/teardown-rules';
import type { TeardownContext } from './rule-engine/types';

async function globalTeardown(): Promise<void> {
  logger.info('--- GLOBAL TEARDOWN ---');

  const projectRoot = path.resolve(__dirname, '..', '..');
  const config = TestConfigManager.getConfig();
  const kubeConfigPath =
    config.kubeConfigPath || path.join(projectRoot, '.kubeconfigs', 'test-config');

  let k8sClient: KubernetesClient | undefined;
  try {
    k8sClient = new KubernetesClient(kubeConfigPath);
  } catch {
    logger.warn('⚠️ Could not create Kubernetes client for teardown');
  }

  const ctx: TeardownContext = {
    cnvNamespace: EnvVariables.cnvNamespace,
    k8sClient,
    kubeConfigPath,
    shouldCleanupClusterResources: false,
    testNamespace: config.testNamespace || 'pw-unknown',
  };

  const rules = getTeardownRules();
  await runTeardownRules(rules, ctx);

  logger.info('--- GLOBAL TEARDOWN COMPLETE ---');
}

export default globalTeardown;
