import * as fs from 'fs';
import * as path from 'path';

import { setTimeout as sleep } from 'node:timers/promises';

import { loginToOpenShiftConsole, saveStorageState } from '@/auth/console-login';
import { AllureEnvironment } from '@/utils/allure';
import { kubeconfigMatchesClusterUrl } from '@/utils/cluster-kubernetes-api';
import {
  ensureKubeconfigAuthenticated,
  isKubeconfigAuthenticated,
  ocLoginToCluster,
  patchConsoleUserSettings,
} from '@/utils/cluster-oc';
import { EnvVariables } from '@/utils/env-variables';
import { logger } from '@/utils/logger';
import {
  ensureNonPrivUserExists,
  NONPRIV_IDP_NAME,
  waitForOAuthRollout,
} from '@/utils/nonpriv-user-setup';
import { storageStateExists } from '@/utils/storage-state';
import { getTestResultsDir } from '@/utils/test-results-dir';
import { type Browser, type BrowserContext, type Page, chromium } from '@playwright/test';

import type { SetupRule } from './types';
import { SetupPhase } from './types';

const TMP_CI_KUBECONFIG = '/tmp/kubeconfig';

function shouldRunBrowserLogin(): boolean {
  if (process.env.REUSE_STORAGE_STATE === '1' && storageStateExists()) {
    return false;
  }
  return true;
}

async function disposeAuthBrowser(
  state: { browser: Browser; context: BrowserContext; page: Page } | null,
): Promise<void> {
  if (!state) {
    return;
  }
  await state.context.close().catch(() => undefined);
  await state.browser.close().catch(() => undefined);
}

/**
 * Global setup rules for release-4.12 (pruned from kubevirt-ui main).
 * AUTH → CLUSTER (optional oc) → BROWSER (login + storage state + console prefs) → REPORTING.
 */
export function getSetupRules(): SetupRule[] {
  let browserState: { browser: Browser; context: BrowserContext; page: Page } | null = null;

  return [
    {
      id: 'ensure-storage-dirs',
      name: 'Ensure storage state and kubeconfig directories exist',
      phase: SetupPhase.AUTH,
      onError: 'throw',
      run: async (ctx) => {
        for (const dir of [path.dirname(ctx.storageStatePath), path.dirname(ctx.kubeConfigPath)]) {
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
        }
      },
    },
    {
      id: 'validate-credentials',
      name: 'Validate console login credentials',
      phase: SetupPhase.AUTH,
      guard: () => shouldRunBrowserLogin() && !EnvVariables.isLocalMode,
      onError: 'throw',
      run: async () => {
        if (EnvVariables.isNonPrivUser) {
          if (!EnvVariables.testUserPassword) {
            throw new Error('TEST_PASSWORD (or TEST_USER_PASSWORD) is required when NON_PRIV=1');
          }
          return;
        }
        if (!EnvVariables.loginPassword) {
          throw new Error(
            'OPENSHIFT_PASSWORD or BRIDGE_KUBEADMIN_PASSWORD is required for global auth setup',
          );
        }
      },
    },
    {
      id: 'adopt-workspace-kubeconfig',
      name: 'Use workspace kubeconfig when it matches CLUSTER_URL',
      phase: SetupPhase.AUTH,
      guard: () => !EnvVariables.skipOcInvocations && Boolean(EnvVariables.clusterUrl),
      onError: 'warn',
      run: async (ctx) => {
        const clusterUrl = EnvVariables.clusterUrl;
        if (!fs.existsSync(ctx.kubeConfigPath)) {
          return;
        }
        if (kubeconfigMatchesClusterUrl(ctx.kubeConfigPath, clusterUrl)) {
          if (isKubeconfigAuthenticated(ctx.kubeConfigPath)) {
            ctx.effectiveKubeConfigPath = ctx.kubeConfigPath;
            logger.success(`Using kubeconfig at ${ctx.kubeConfigPath} for ${clusterUrl}`);
          } else {
            logger.warn(
              `Kubeconfig at ${ctx.kubeConfigPath} matches ${clusterUrl} but is not authenticated; will refresh via oc login`,
            );
          }
        }
      },
    },
    {
      id: 'copy-ci-kubeconfig',
      name: 'Copy CI kubeconfig from /tmp/kubeconfig',
      phase: SetupPhase.AUTH,
      guard: (ctx) => !ctx.effectiveKubeConfigPath && !EnvVariables.skipOcInvocations,
      onError: 'warn',
      run: async (ctx) => {
        if (!fs.existsSync(TMP_CI_KUBECONFIG)) {
          return;
        }
        const clusterUrl = EnvVariables.clusterUrl;
        if (clusterUrl && !kubeconfigMatchesClusterUrl(TMP_CI_KUBECONFIG, clusterUrl)) {
          logger.warn(
            `Skipping ${TMP_CI_KUBECONFIG}: API server does not match CLUSTER_URL (${clusterUrl})`,
          );
          return;
        }
        logger.info(
          `📋 Found kubeconfig at ${TMP_CI_KUBECONFIG} (containerized environment), copying...`,
        );
        const content = fs.readFileSync(TMP_CI_KUBECONFIG, 'utf8').trim();
        if (content.length > 0) {
          fs.copyFileSync(TMP_CI_KUBECONFIG, ctx.kubeConfigPath);
          if (isKubeconfigAuthenticated(ctx.kubeConfigPath)) {
            ctx.effectiveKubeConfigPath = ctx.kubeConfigPath;
            logger.success(`Kubeconfig copied to ${ctx.kubeConfigPath}`);
          } else {
            logger.warn(
              `Copied kubeconfig from ${TMP_CI_KUBECONFIG} is not authenticated; will refresh via oc login`,
            );
          }
        }
      },
    },
    {
      id: 'oc-login',
      name: 'Generate kubeconfig via oc login',
      phase: SetupPhase.AUTH,
      guard: (ctx) => !ctx.effectiveKubeConfigPath && !EnvVariables.skipOcInvocations,
      onError: 'throw',
      run: async (ctx) => {
        logger.info(`🔐 Authenticating to cluster: ${EnvVariables.clusterUrl}`);
        ocLoginToCluster(ctx.kubeConfigPath);
        ctx.effectiveKubeConfigPath = ctx.kubeConfigPath;
        logger.success('Kubeconfig generated via oc login');
      },
    },
    {
      id: 'ensure-kubeconfig-session',
      name: 'Refresh kubeconfig when token expired',
      phase: SetupPhase.AUTH,
      guard: () => !EnvVariables.skipOcInvocations && Boolean(EnvVariables.clusterUrl),
      onError: 'throw',
      run: async (ctx) => {
        const kubePath = ctx.effectiveKubeConfigPath ?? ctx.kubeConfigPath;
        if (!fs.existsSync(kubePath)) {
          throw new Error(
            `No kubeconfig at ${kubePath}. Set OPENSHIFT_PASSWORD and CLUSTER_URL or provide a valid .kubeconfigs/test-config`,
          );
        }
        ensureKubeconfigAuthenticated(kubePath);
        ctx.effectiveKubeConfigPath = kubePath;
      },
    },
    {
      id: 'ensure-nonpriv-idp-user',
      name: 'Ensure test-users htpasswd IDP and test user exist',
      phase: SetupPhase.CLUSTER,
      guard: (ctx) =>
        EnvVariables.isNonPrivUser &&
        !EnvVariables.skipOcInvocations &&
        Boolean(ctx.effectiveKubeConfigPath) &&
        process.env.SKIP_NONPRIV_IDP_SETUP !== '1',
      onError: 'throw',
      run: async (ctx) => {
        const kubeconfig = ctx.effectiveKubeConfigPath;
        if (!kubeconfig) {
          throw new Error('Kubeconfig path missing before non-priv IDP setup');
        }
        const username = EnvVariables.testUsername;
        const password = EnvVariables.testUserPassword;
        logger.info(
          `Ensuring non-priv user "${username}" on htpasswd IDP "${NONPRIV_IDP_NAME}"...`,
        );
        const changed = ensureNonPrivUserExists(username, password, kubeconfig);
        if (changed) {
          await waitForOAuthRollout(kubeconfig);
          await sleep(15_000);
        }
        logger.success(`Non-priv user "${username}" is available via IDP "${NONPRIV_IDP_NAME}"`);
      },
    },
    {
      id: 'browser-login',
      name: 'Launch browser and perform console login',
      phase: SetupPhase.BROWSER,
      guard: () => shouldRunBrowserLogin(),
      onError: 'throw',
      run: async (ctx) => {
        const baseURL = EnvVariables.webConsoleUrl;
        logger.info('🌐 Setting up browser state...');
        if (EnvVariables.isLocalMode) {
          logger.info(`🔄 Local console: opening ${baseURL} (no login — auth disabled)`);
        } else {
          logger.info(
            `🔄 Logging in to ${baseURL} as ${EnvVariables.loginUsername} (${EnvVariables.idp})`,
          );
        }
        const browser = await chromium.launch({
          args: [
            '--ignore-certificate-errors',
            '--disable-dev-shm-usage',
            '--no-sandbox',
            '--disable-setuid-sandbox',
          ],
        });
        const context = await browser.newContext({
          baseURL,
          ignoreHTTPSErrors: true,
          viewport: { width: 1920, height: 1080 },
        });
        const page = await context.newPage();
        browserState = { browser, context, page };
        try {
          await loginToOpenShiftConsole(page, baseURL);
          await saveStorageState(context, ctx.storageStatePath);
          logger.success(`Saved console storage state to ${ctx.storageStatePath}`);
        } finally {
          await disposeAuthBrowser(browserState);
          browserState = null;
        }
      },
    },
    {
      id: 'disable-console-user-settings',
      name: 'Disable console welcome modals and sidebar auto-hide (user-settings ConfigMap)',
      phase: SetupPhase.BROWSER,
      guard: (ctx) => Boolean(ctx.effectiveKubeConfigPath) && !EnvVariables.isLocalMode,
      onError: 'warn',
      run: async (ctx) => {
        const settingsKey = EnvVariables.isNonPrivUser ? EnvVariables.testUsername : 'kube-admin';
        logger.info(`⚙️ Patching console user-settings for '${settingsKey}'...`);
        const kubeconfig = ctx.effectiveKubeConfigPath;
        if (!kubeconfig) {
          return;
        }
        patchConsoleUserSettings(kubeconfig, settingsKey);
        logger.success(`Sidebar auto-hide / welcome modals disabled for '${settingsKey}'`);
      },
    },
    {
      id: 'save-storage-state',
      name: 'Close browser after login',
      phase: SetupPhase.BROWSER,
      guard: () => shouldRunBrowserLogin(),
      onError: 'throw',
      run: async () => {
        await disposeAuthBrowser(browserState);
        browserState = null;
        logger.success('Browser closed');
      },
    },
    {
      id: 'log-setup-summary',
      name: 'Write setup summary',
      phase: SetupPhase.REPORTING,
      onError: 'skip',
      run: async (ctx) => {
        logger.info(`📍 Web console: ${EnvVariables.webConsoleUrl}`);
        logger.info(`📍 Storage state: ${ctx.storageStatePath}`);
        if (ctx.effectiveKubeConfigPath) {
          logger.info(`📍 Kubeconfig: ${ctx.effectiveKubeConfigPath}`);
        }
      },
    },
    {
      id: 'allure-environment',
      name: 'Write Allure environment metadata',
      phase: SetupPhase.REPORTING,
      guard: () => !EnvVariables.isDebugMode,
      onError: 'warn',
      run: async (ctx) => {
        const allureResultsDir = getTestResultsDir(ctx.projectRoot);
        const shardTotal = EnvVariables.shardTotal;
        const shardIndex = EnvVariables.shardIndex;
        let shardingInfo: { totalShards: number; currentShard: number } | undefined;
        if (ctx.useSharding && shardIndex && shardTotal) {
          const totalShards = parseInt(shardTotal, 10);
          const currentShard = parseInt(shardIndex, 10);
          if (!Number.isNaN(totalShards) && !Number.isNaN(currentShard)) {
            shardingInfo = { totalShards, currentShard };
          }
        }
        await AllureEnvironment.setupAllureEnvironment(
          EnvVariables.testNamespace,
          allureResultsDir,
          ctx.effectiveKubeConfigPath,
          shardingInfo,
        );
      },
    },
  ];
}
