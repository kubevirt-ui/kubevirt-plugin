import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

import KubernetesClient from '@/clients/kubernetes-client';
import { EnvVariables } from '@/utils/env-variables';
import { logger } from '@/utils/logger';
import { TestConfigManager } from '@/utils/test-config';
import type { FullConfig } from '@playwright/test';

import type { TeardownContext } from './rule-engine';
import { getTeardownRules, RuleEngine } from './rule-engine';

const MINUTE = 60_000;

function createK8sClient(): KubernetesClient {
  const testConfig = TestConfigManager.getConfig();
  const kubeConfigPath = testConfig.kubeConfigPath;

  return new KubernetesClient(
    undefined,
    {
      baseUrl: EnvVariables.clusterUrl,
      password: EnvVariables.password,
      token: testConfig.authToken,
      username: EnvVariables.username,
    },
    kubeConfigPath,
  );
}

/**
 * Re-authenticate via `oc login` when the kubeconfig from setup is missing.
 * Returns the path to a freshly generated kubeconfig, or undefined on failure.
 */
function regenKubeconfig(): string | undefined {
  const clusterUrl = EnvVariables.clusterUrl;
  if (!clusterUrl || clusterUrl === 'undefined') return undefined;

  const kubeConfigDir = path.resolve(process.cwd(), '.kubeconfigs');
  if (!fs.existsSync(kubeConfigDir)) {
    fs.mkdirSync(kubeConfigDir, { recursive: true });
  }
  const kcPath = path.join(kubeConfigDir, 'teardown-config');

  try {
    execSync(
      `oc login "${clusterUrl}" -u "${EnvVariables.username}" -p "${EnvVariables.password}" --insecure-skip-tls-verify --kubeconfig="${kcPath}"`,
      { encoding: 'utf8', stdio: 'pipe', timeout: MINUTE },
    );
    logger.info(`✓ Re-authenticated for teardown: ${kcPath}`);
    return kcPath;
  } catch {
    return undefined;
  }
}

async function globalTeardown(_config: FullConfig) {
  if (process.env.SKIP_GLOBAL_TEARDOWN === 'true') {
    logger.info('⏭️ Skipping global teardown (SKIP_GLOBAL_TEARDOWN=true)');
    logger.info(' Assuming teardown will be done by orchestration layer');
    return;
  }

  if (EnvVariables.isDebugMode) {
    logger.info('🐛 Debug mode enabled (DEBUG=1) - skipping cleanup operations');
    try {
      const k8sClient = createK8sClient();
      await k8sClient.verifyAuthentication();
      logger.info('✓ Authentication verified');
    } catch (authError: unknown) {
      const msg = authError instanceof Error ? authError.message : String(authError);
      logger.warn(`⚠️ Authentication check failed: ${msg}`);
    }
    logger.info('🏁 Global teardown complete (debug mode - no cleanup)');
    return;
  }

  logger.info('🧹 Cleaning up test environment...');

  const testNamespace = EnvVariables.testNamespace;

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
      logger.warn('⚠️ Kubeconfig from setup is missing, re-authenticating for teardown…');
      kubeConfigPath = regenKubeconfig();
      if (kubeConfigPath) {
        process.env.KUBECONFIG = kubeConfigPath;
      } else {
        logger.warn('  Could not re-authenticate — cleanup operations may fail');
      }
    }

    k8sClient = createK8sClient();

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
    k8sClient,
    kubeConfigPath,
    shouldCleanupClusterResources: true,
    testNamespace,
  };

  const engine = new RuleEngine();
  const rules = getTeardownRules();
  await engine.runTeardown(rules, ctx);

  logger.info('🏁 Global teardown complete');
}

export default globalTeardown;
