import { execFileSync, execSync } from 'child_process';
import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import * as path from 'path';

import { KubernetesClient } from '@/clients/kubernetes-client';
import { EnvVariables } from '@/utils/env-variables';
import { logger } from '@/utils/logger';
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
        execFileSync(
          'oc',
          [
            'login',
            clusterUrl,
            '-u',
            EnvVariables.username,
            '-p',
            EnvVariables.password,
            '--insecure-skip-tls-verify',
            `--kubeconfig=${ctx.kubeConfigPath}`,
          ],
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
          secretName: EnvVariables.secretName,
          testNamespace: ctx.testNamespace,
          webConsoleUrl: EnvVariables.webConsoleUrl,
        } as SharedTestConfig;
        TestConfigManager.saveConfig(setupConfig);
        logger.info(`✓ Saved test configuration`);
      },
    },
    {
      id: 'wait-for-console-ready',
      name: 'Wait for console web endpoint to become reachable',
      phase: SetupPhase.CLUSTER,
      guard: () => !EnvVariables.isLocalhost,
      onError: 'throw',
      run: async () => {
        const baseUrl = EnvVariables.webConsoleUrl;
        const timeoutMs = 2 * MINUTE;
        const pollIntervalMs = 5 * SECOND;
        logger.info(`⏳ Waiting for console to become reachable at ${baseUrl}...`);

        // Plain http/https.get instead of fetch(): fetch performs strict TLS
        // validation and rejects the self-signed/cluster-CA certs OpenShift
        // console routes commonly use, which would time this probe out even
        // when browser-login (Chromium with --ignore-certificate-errors)
        // would connect just fine. rejectUnauthorized: false mirrors that
        // same TLS-relaxed behavior here.
        const probe = (): Promise<number> =>
          new Promise<number>((resolve, reject) => {
            const client = baseUrl.startsWith('https:') ? https : http;
            const req = client.get(
              baseUrl,
              { rejectUnauthorized: false, timeout: 10 * SECOND },
              (res) => {
                res.resume(); // drain the response body to free the socket
                resolve(res.statusCode ?? 0);
              },
            );
            req.on('timeout', () => req.destroy(new Error('Probe request timed out')));
            req.on('error', reject);
          });

        const start = Date.now();
        let lastError: unknown;
        while (Date.now() - start < timeoutMs) {
          try {
            // Any HTTP response (even a redirect/4xx) means the service is
            // accepting connections — that's all browser-login needs. A
            // connection error means the connection itself was refused/reset,
            // typically because the per-run console Helm release is still
            // rolling out.
            const status = await probe();
            logger.success(
              `✓ Console responded with HTTP ${status} after ${Math.round((Date.now() - start) / 1000)}s`,
            );
            return;
          } catch (err) {
            lastError = err;
            await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
          }
        }

        const msg = lastError instanceof Error ? lastError.message : String(lastError);
        throw new Error(
          `Console at ${baseUrl} did not become reachable within ${timeoutMs / 1000}s: ${msg}`,
        );
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
