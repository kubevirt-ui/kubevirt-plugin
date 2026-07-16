import * as fs from 'fs';
import * as path from 'path';

import RequestContextClient from '@/clients/request-context-client';
import { EnvVariables } from '@/utils/env-variables';
import { logger } from '@/utils/logger';
import { getStorageStatePath } from '@/utils/storage-state';
import { TestConfigManager } from '@/utils/test-config';
import type { FullConfig } from '@playwright/test';
import { request } from '@playwright/test';

import type { TeardownContext } from './rule-engine';
import { getTeardownRules, RuleEngine } from './rule-engine';

async function createApiClient(): Promise<RequestContextClient> {
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

async function globalTeardown(_config: FullConfig) {
  if (process.env.SKIP_GLOBAL_TEARDOWN === 'true') {
    logger.info('⏭️ Skipping global teardown (SKIP_GLOBAL_TEARDOWN=true)');
    logger.info(' Assuming teardown will be done by orchestration layer');
    return;
  }

  if (EnvVariables.isDebugMode) {
    logger.info('🐛 Debug mode enabled (DEBUG=1) - skipping cleanup operations');
    try {
      const apiClient = await createApiClient();
      const isAuth = await apiClient.verifyAuthentication();
      if (isAuth) {
        logger.info('✓ Authentication verified');
      } else {
        logger.warn('⚠️ Authentication check returned false');
      }
    } catch (authError: unknown) {
      const msg = authError instanceof Error ? authError.message : String(authError);
      logger.warn(`⚠️ Authentication check failed: ${msg}`);
    }
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

  try {
    TestConfigManager.clearCache();
    apiClient = await createApiClient();

    const isAuth = await apiClient.verifyAuthentication();
    if (isAuth) {
      logger.info(`✓ RequestContextClient authenticated for cleanup in ${testNamespace}`);
    } else {
      logger.warn('⚠️ Authentication returned false — cleanup operations may fail');
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.warn(`⚠️ Could not initialize RequestContextClient for teardown: ${msg}`);
  }

  const ctx: TeardownContext = {
    testNamespace,
    apiClient,
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
