import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

import { KubernetesClient } from '@/clients/kubernetes-client';
import { EnvVariables } from '@/utils/env-variables';
import { logger } from '@/utils/file-utils';
import { type SharedTestConfig, MINUTE, SECOND, TestConfigManager } from '@/utils/test-config';
import { type Browser, type BrowserContext, type Page, chromium } from '@playwright/test';

import type { SetupRule } from './types';
import { SetupPhase } from './types';

const TMP_KUBECONFIG_PATH = '/tmp/kubeconfig';

export function getSetupRules(): SetupRule[] {
  let browserState: { browser: Browser; context: BrowserContext; page: Page } | null = null;

  return [
    // ── AUTH phase ─────────────────────────────────────────────────────
    {
      guard: (ctx) => !ctx.effectiveKubeConfigPath,
      id: 'copy-ci-kubeconfig',
      name: 'Copy CI kubeconfig from /tmp/kubeconfig',
      onError: 'warn',
      phase: SetupPhase.AUTH,
      run: async (ctx) => {
        if (!fs.existsSync(TMP_KUBECONFIG_PATH)) return;
        logger.info(`📋 Found kubeconfig at ${TMP_KUBECONFIG_PATH}, validating...`);
        const kubeConfigDir = path.dirname(ctx.kubeConfigPath);
        if (!fs.existsSync(kubeConfigDir)) fs.mkdirSync(kubeConfigDir, { recursive: true });
        const content = fs.readFileSync(TMP_KUBECONFIG_PATH, 'utf8').trim();
        if (
          content.includes('apiVersion') ||
          content.includes('clusters:') ||
          content.startsWith('{')
        ) {
          fs.copyFileSync(TMP_KUBECONFIG_PATH, ctx.kubeConfigPath);
          ctx.effectiveKubeConfigPath = ctx.kubeConfigPath;
          logger.success(`✓ Kubeconfig copied to ${ctx.kubeConfigPath}`);
        }
      },
    },
    {
      guard: (ctx) => !ctx.effectiveKubeConfigPath,
      id: 'in-cluster-service-account',
      name: 'Generate kubeconfig via in-cluster ServiceAccount',
      onError: 'warn',
      phase: SetupPhase.AUTH,
      run: async (ctx) => {
        if (!KubernetesClient.isInClusterEnvironment()) return;
        logger.info('🔐 Authenticating via in-cluster ServiceAccount token...');
        KubernetesClient.generateInClusterKubeconfig(ctx.kubeConfigPath);
        ctx.effectiveKubeConfigPath = ctx.kubeConfigPath;
        logger.success('✓ Kubeconfig generated from in-cluster ServiceAccount');
      },
    },
    {
      guard: (ctx) => !ctx.effectiveKubeConfigPath,
      id: 'oc-login',
      name: 'Generate kubeconfig via oc login',
      onError: 'warn',
      phase: SetupPhase.AUTH,
      run: async (ctx) => {
        const clusterUrl = EnvVariables.clusterUrl;
        if (!clusterUrl || clusterUrl === 'undefined') {
          throw new Error('No cluster URL configured.');
        }
        const kubeConfigDir = path.dirname(ctx.kubeConfigPath);
        if (!fs.existsSync(kubeConfigDir)) fs.mkdirSync(kubeConfigDir, { recursive: true });
        logger.info(`🔐 Authenticating to cluster: ${clusterUrl}`);
        execSync(
          `oc login "${clusterUrl}" -u "${EnvVariables.username}" -p "${EnvVariables.password}" --insecure-skip-tls-verify --kubeconfig="${ctx.kubeConfigPath}"`,
          { encoding: 'utf8', stdio: 'pipe', timeout: MINUTE },
        );
        ctx.effectiveKubeConfigPath = ctx.kubeConfigPath;
        logger.success('✓ Kubeconfig generated via oc login');
      },
    },
    {
      guard: (ctx) => !ctx.effectiveKubeConfigPath,
      id: 'oauth-login',
      name: 'Generate kubeconfig via OAuth',
      onError: 'throw',
      phase: SetupPhase.AUTH,
      run: async (ctx) => {
        ctx.effectiveKubeConfigPath = await KubernetesClient.generateKubeconfig(
          EnvVariables.clusterUrl,
          EnvVariables.username,
          EnvVariables.password,
          ctx.kubeConfigPath,
        );
        logger.success('✓ Kubeconfig generated via OAuth');
      },
    },
    {
      id: 'init-k8s-client',
      name: 'Initialize Kubernetes client',
      onError: 'throw',
      phase: SetupPhase.AUTH,
      run: async (ctx) => {
        if (!ctx.effectiveKubeConfigPath) {
          throw new Error('No authentication method succeeded.');
        }
        process.env.KUBECONFIG = ctx.effectiveKubeConfigPath;
        const client = new KubernetesClient(ctx.effectiveKubeConfigPath);
        await client.verifyAuthentication();
        logger.success('✓ Cluster authentication verified');
        const token = client.getCurrentUserToken();
        if (token) ctx.authToken = token;
        ctx.k8sClient = client;
      },
    },

    // ── CLUSTER phase ─────────────────────────────────────────────────
    {
      id: 'setup-test-namespace',
      name: 'Set up test namespace',
      onError: 'throw',
      phase: SetupPhase.CLUSTER,
      run: async (ctx) => {
        if (!ctx.k8sClient) throw new Error('Kubernetes client not initialized');
        logger.info(`📦 Setting up namespace: ${ctx.testNamespace}...`);
        await ctx.k8sClient.setupTestNamespace(ctx.testNamespace);
        logger.success(`✓ Namespace ready: ${ctx.testNamespace}`);
      },
    },
    {
      id: 'save-config',
      name: 'Persist shared test configuration',
      onError: 'throw',
      phase: SetupPhase.CLUSTER,
      run: async (ctx) => {
        const setupConfig = {
          authToken: ctx.authToken,
          clusterUrl: EnvVariables.clusterUrl,
          cnvNamespace: ctx.cnvNamespace,
          kubeConfigPath: ctx.kubeConfigPath,
          projectName: ctx.testNamespace,
          testNamespace: ctx.testNamespace,
          webConsoleUrl: EnvVariables.webConsoleUrl,
        } as SharedTestConfig;
        TestConfigManager.saveConfig(setupConfig);
        logger.info(`✓ Saved test configuration`);
      },
    },

    // ── BROWSER phase ─────────────────────────────────────────────────
    {
      id: 'browser-login',
      name: 'Launch browser and perform console login',
      onError: 'throw',
      phase: SetupPhase.BROWSER,
      run: async (ctx) => {
        const baseUrl = EnvVariables.webConsoleUrl;
        logger.info('🌐 Setting up browser state...');
        const browser = await chromium.launch({
          args: [
            '--ignore-certificate-errors',
            '--disable-dev-shm-usage',
            '--no-sandbox',
            '--disable-setuid-sandbox',
          ],
        });
        const context = await browser.newContext({
          baseURL: baseUrl,
          ignoreHTTPSErrors: true,
          viewport: { height: 1080, width: 1920 },
        });
        const page = await context.newPage();
        browserState = { browser, context, page };

        if (!EnvVariables.isLocalhost) {
          await page.goto(`${baseUrl}/auth/login`, { timeout: MINUTE, waitUntil: 'load' });
          await page.waitForLoadState('load');

          // Click kube:admin IDP button if visible
          const kubeAdminBtn = page.locator(
            '[title="Log in with kube:admin"], a[href*="idp=kube%3Aadmin"]',
          );
          const kubeAdminVisible = await kubeAdminBtn
            .waitFor({ state: 'visible', timeout: 10 * SECOND })
            .then(() => true)
            .catch(() => false);
          if (kubeAdminVisible) {
            await page.waitForTimeout(SECOND);
            await kubeAdminBtn.click();
          }

          // Fill login form
          await page.locator('#inputUsername').fill(EnvVariables.uiLoginUsername);
          await page.locator('#inputPassword').fill(EnvVariables.uiLoginPassword);
          const coLoginBtn = page.locator('#co-login-button');
          const submitBtn = page.locator('button[type="submit"]');
          const useCoLogin = await coLoginBtn.isVisible({ timeout: 5000 }).catch(() => false);
          if (useCoLogin) {
            await coLoginBtn.click();
          } else {
            await submitBtn.click();
          }

          // Wait for redirect past login
          await page.waitForURL((url) => !url.pathname.includes('/auth/login'), {
            timeout: 2 * MINUTE,
          });
          await page.waitForLoadState('load');
          logger.success(`Login complete, redirected to: ${page.url()}`);

          await context.storageState({ path: ctx.storageStatePath });
          logger.success(`Saved storage state to ${ctx.storageStatePath}`);
        } else {
          logger.info('Localhost detected, skipping login...');
        }
      },
    },
    {
      id: 'save-storage-state',
      name: 'Save storage state and close browser',
      onError: 'warn',
      phase: SetupPhase.BROWSER,
      run: async (ctx) => {
        if (browserState) {
          try {
            await browserState.context.storageState({ path: ctx.storageStatePath });
          } catch {
            // State may already be saved
          }
          await browserState.context.close();
          await browserState.browser.close();
          browserState = null;
          logger.success(`✓ Browser closed`);
        }
      },
    },
  ];
}
