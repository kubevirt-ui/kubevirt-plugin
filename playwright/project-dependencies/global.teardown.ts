import * as fs from 'fs';
import * as path from 'path';

import RequestContextClient from '@/clients/request-context-client';
import {
  ensureKubeconfigAuthenticated,
  getDefaultKubeconfigPath,
  pinKubeconfigToProcess,
} from '@/utils/cluster-oc';
import { EnvVariables } from '@/utils/env-variables';
import { logger } from '@/utils/logger';
import { getStorageStatePath } from '@/utils/storage-state';
import { TestConfigManager } from '@/utils/test-config';
import type { FullConfig } from '@playwright/test';
import { request } from '@playwright/test';

import type { TeardownContext } from './rule-engine';
import { getTeardownRules, RuleEngine } from './rule-engine';

async function createApiClientFromBrowserSession(): Promise<RequestContextClient> {
  const testConfig = TestConfigManager.getConfig();
  const token = testConfig.authToken;
  const playwrightDir = path.resolve(__dirname, '..');
  const storageStatePath = getStorageStatePath(playwrightDir);

  const apiContext = await request.newContext({
    baseURL: EnvVariables.webConsoleUrl,
    ignoreHTTPSErrors: true,
    ...(storageStatePath && fs.existsSync(storageStatePath)
      ? { storageState: storageStatePath }
      : {}),
    extraHTTPHeaders: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const client = new RequestContextClient(apiContext, {
    baseUrl: EnvVariables.webConsoleUrl,
    username: EnvVariables.username,
    password: EnvVariables.password,
    token,
  });

  await client.primeCsrfToken();
  return client;
}

/** Non-priv: kubeadmin oc (same as setup). Privileged: browser session /api/kubernetes. */
function prepareNonPrivKubeconfig(): string {
  const kubePath = getDefaultKubeconfigPath();
  fs.mkdirSync(path.dirname(kubePath), { recursive: true });
  if (!EnvVariables.password) {
    throw new Error(
      'OPENSHIFT_PASSWORD (or BRIDGE_KUBEADMIN_PASSWORD) is required for non-priv teardown oc',
    );
  }
  ensureKubeconfigAuthenticated(kubePath);
  pinKubeconfigToProcess(kubePath);
  return kubePath;
}

async function globalTeardown(_config: FullConfig) {
  if (process.env.SKIP_GLOBAL_TEARDOWN === 'true') {
    logger.info('⏭️ Skipping global teardown (SKIP_GLOBAL_TEARDOWN=true)');
    logger.info(' Assuming teardown will be done by orchestration layer');
    return;
  }

  if (EnvVariables.isDebugMode) {
    logger.info('🐛 Debug mode enabled (DEBUG=1) - skipping cleanup operations');
    logger.info('🏁 Global teardown complete (debug mode - no cleanup)');
    return;
  }

  logger.info('🧹 Cleaning up test environment...');

  const useSharding = EnvVariables.isSharded;
  const shardIndex = EnvVariables.shardIndex;

  const testNamespace =
    useSharding && shardIndex
      ? `${EnvVariables.testNamespace}-${shardIndex}`
      : EnvVariables.testNamespace;

  const shouldCleanupClusterResources = !useSharding || shardIndex === '1';

  if (useSharding && shardIndex) {
    logger.info(
      `🔀 Sharding enabled: Cleaning isolated namespace '${testNamespace}' (shard ${shardIndex}/${EnvVariables.shardTotal})`,
    );
    if (shouldCleanupClusterResources) {
      logger.info('🎯 Shard 1: Also cleaning up cluster-scoped resources');
    }
  }

  logger.info('♻️ Namespace persistence enabled: Namespace will be kept for reuse');

  let apiClient: RequestContextClient | undefined;
  let kubeConfigPath: string | undefined;

  const useKubeadminOc = EnvVariables.isNonPrivUser && !EnvVariables.skipOcInvocations;

  try {
    TestConfigManager.clearCache();
    if (useKubeadminOc) {
      kubeConfigPath = prepareNonPrivKubeconfig();
      logger.info(
        `✓ Non-priv teardown: kubeadmin oc ready (${kubeConfigPath}) — not using test-user browser session`,
      );
    } else {
      apiClient = await createApiClientFromBrowserSession();
      const isAuth = await apiClient.verifyAuthentication();
      if (isAuth) {
        logger.info(`✓ RequestContextClient authenticated for cleanup in ${testNamespace}`);
      } else {
        logger.warn('⚠️ Authentication returned false — cleanup operations may fail');
      }
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.warn(`⚠️ Could not initialize teardown auth: ${msg}`);
  }

  const ctx: TeardownContext = {
    testNamespace,
    apiClient,
    kubeConfigPath,
    useSharding,
    shardIndex,
    shouldCleanupClusterResources,
  };

  const engine = new RuleEngine();
  const rules = getTeardownRules();
  await engine.runTeardown(rules, ctx);

  logger.info('🏁 Global teardown complete');
}

export default globalTeardown;
