import * as fs from 'fs';

import { KubernetesClient } from '@/clients/kubernetes-client';
import { EnvVariables } from '@/utils/env-variables';
import { logger } from '@/utils/logger';
import { TestConfigManager } from '@/utils/test-config';
import type { FullConfig } from '@playwright/test';

import type { TeardownContext } from './rule-engine';
import { getTeardownRules, RuleEngine } from './rule-engine';

async function globalTeardown(_config: FullConfig) {
  if (process.env.SKIP_GLOBAL_TEARDOWN === 'true') {
    logger.info('⏭️ Skipping global teardown (SKIP_GLOBAL_TEARDOWN=true)');
    logger.info(' Assuming teardown will be done by orchestration layer');
    return;
  }

  logger.info('🧹 Cleaning up test environment...');

  const testNamespace = EnvVariables.testNamespace;
  const shouldCleanupClusterResources = true;

  logger.info('♻️ Namespace persistence enabled: Namespace will be kept for reuse');

  let k8sClient: KubernetesClient | undefined;
  let kubeConfigPath: string | undefined;

  try {
    TestConfigManager.clearCache();
    const testConfig = TestConfigManager.getConfig();
    kubeConfigPath = testConfig.kubeConfigPath;

    if (kubeConfigPath && fs.existsSync(kubeConfigPath)) {
      logger.info(`🔐 Using kubeconfig from setup: ${kubeConfigPath}`);
      process.env.KUBECONFIG = kubeConfigPath;
    } else {
      logger.warn('⚠️ Kubeconfig from setup is missing — cleanup operations may fail');
    }

    k8sClient = new KubernetesClient(kubeConfigPath!);

    try {
      await k8sClient.verifyAuthentication();
      logger.info(`✓ Kubernetes client authenticated for cleanup in ${testNamespace}`);
    } catch (authError: unknown) {
      const msg = authError instanceof Error ? authError.message : String(authError);
      logger.error(`Failed to verify authentication: ${msg}`);
      logger.warn(' Cleanup operations may fail without authentication');
    }
  } catch (error: unknown) {
    logger.warn(`⚠️ Could not initialize K8s client for teardown: ${error}`);
  }

  const ctx: TeardownContext = {
    testNamespace,
    k8sClient,
    kubeConfigPath,
    shouldCleanupClusterResources,
  };

  const engine = new RuleEngine();
  const rules = getTeardownRules();
  await engine.runTeardown(rules, ctx);

  logger.info('🏁 Global teardown complete');
}

export default globalTeardown;
