import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

import KubernetesClient from '@/clients/kubernetes-client';
import { OverviewDashboardComponent } from '@/components/overview/overview-dashboard-components';
import LoginPage from '@/page-objects/cluster/login-page';
import { ClusterJanitor } from '@/utils/cluster-janitor';
import { EnvVariables } from '@/utils/env-variables';
import { logger } from '@/utils/logger';
import { NONPRIV_IDP_NAME, waitForOAuthRollout } from '@/utils/nonpriv-utils';
import { type SharedTestConfig, MINUTE, SECOND, TestConfigManager } from '@/utils/test-config';
import { type Browser, type BrowserContext, type Page, chromium } from '@playwright/test';

import type { SetupRule } from './types';
import { SetupPhase } from './types';

const TMP_KUBECONFIG_PATH = '/tmp/kubeconfig';

/**
 * Returns ordered global setup rules (AUTH → CLUSTER → BROWSER).
 * Browser-phase rules share `browserState` created during browser login / console prep.
 */
export function getSetupRules(): SetupRule[] {
  let browserState: { browser: Browser; context: BrowserContext; page: Page } | null = null;

  return [
    {
      guard: (ctx) => !ctx.effectiveKubeConfigPath,
      id: 'copy-ci-kubeconfig',
      name: 'Copy CI kubeconfig from /tmp/kubeconfig',
      onError: 'warn',
      phase: SetupPhase.AUTH,
      run: async (ctx) => {
        if (!fs.existsSync(TMP_KUBECONFIG_PATH)) {
          return;
        }
        logger.info(
          `📋 Found kubeconfig at ${TMP_KUBECONFIG_PATH} (containerized environment), validating...`,
        );
        const kubeConfigDir = path.dirname(ctx.kubeConfigPath);
        if (!fs.existsSync(kubeConfigDir)) {
          fs.mkdirSync(kubeConfigDir, { recursive: true });
        }
        const content = fs.readFileSync(TMP_KUBECONFIG_PATH, 'utf8').trim();
        if (
          content.length > 0 &&
          (content.startsWith('{') ||
            content.includes('apiVersion') ||
            content.includes('clusters:'))
        ) {
          fs.copyFileSync(TMP_KUBECONFIG_PATH, ctx.kubeConfigPath);
          ctx.effectiveKubeConfigPath = ctx.kubeConfigPath;
          logger.success(
            `✓ Kubeconfig copied from ${TMP_KUBECONFIG_PATH} to ${ctx.kubeConfigPath}`,
          );
        }
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
          throw new Error(
            'No cluster URL configured. Please set CLUSTER_URL or OPENSHIFT_CLUSTER_URL environment variable.',
          );
        }
        const kubeConfigDir = path.dirname(ctx.kubeConfigPath);
        if (!fs.existsSync(kubeConfigDir)) {
          fs.mkdirSync(kubeConfigDir, { recursive: true });
        }
        logger.info(`🔐 Authenticating to cluster: ${clusterUrl}`);
        logger.info(` Username: ${EnvVariables.username}`);
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
        try {
          ctx.effectiveKubeConfigPath = await KubernetesClient.generateKubeconfig(
            EnvVariables.clusterUrl,
            EnvVariables.username,
            EnvVariables.password,
            ctx.kubeConfigPath,
          );
          logger.success('✓ Kubeconfig generated via OAuth authentication');
        } catch (authError: unknown) {
          const msg = authError instanceof Error ? authError.message : String(authError);
          throw new Error(
            `Failed to authenticate to cluster ${EnvVariables.clusterUrl}: ${msg}. ` +
              `Please verify CLUSTER_URL, OPENSHIFT_USERNAME, and OPENSHIFT_PASSWORD are correct.`,
          );
        }
      },
    },
    {
      id: 'init-k8s-client',
      name: 'Initialize Kubernetes client and verify authentication',
      onError: 'throw',
      phase: SetupPhase.AUTH,
      run: async (ctx) => {
        if (!ctx.effectiveKubeConfigPath) {
          throw new Error('No authentication method succeeded. Cannot initialize K8s client.');
        }
        process.env.KUBECONFIG = ctx.effectiveKubeConfigPath;
        logger.info(`🔑 Using kubeconfig: ${ctx.effectiveKubeConfigPath}`);
        const k8sClient = new KubernetesClient(
          undefined,
          {
            baseUrl: EnvVariables.clusterUrl,
            password: EnvVariables.password,
            username: EnvVariables.username,
          },
          ctx.effectiveKubeConfigPath,
        );
        logger.info('🔐 Verifying cluster authentication...');
        await k8sClient.verifyAuthentication();
        logger.success('✓ Cluster authentication verified');
        const token = k8sClient.getCurrentUserToken();
        if (token) {
          ctx.authToken = token;
          logger.success('✓ Authentication token extracted');
        } else {
          logger.warn('⚠️ Could not extract authentication token from kubeconfig');
        }
        ctx.k8sClient = k8sClient;
      },
    },
    {
      guard: () => EnvVariables.isClusterJanitorEnabled,
      id: 'start-cluster-janitor',
      name: 'Start native ClusterJanitor background sweep',
      onError: 'warn',
      phase: SetupPhase.CLUSTER,
      run: async (ctx) => {
        if (!ctx.k8sClient) {
          throw new Error('Kubernetes client not initialized for ClusterJanitor');
        }
        const janitor = new ClusterJanitor(ctx.k8sClient, {
          excludeNamespaces: [ctx.testNamespace],
          staleAgeMs: EnvVariables.clusterJanitorStaleAgeMs,
        });
        janitor.startInterval(EnvVariables.clusterJanitorIntervalMs);
        ctx.clusterJanitor = janitor;
        logger.success('✓ ClusterJanitor background sweep started');
      },
    },
    {
      guard: () => EnvVariables.isNonPrivUser,
      id: 'ensure-nonpriv-user',
      name: 'Ensure non-priv test user exists in htpasswd IDP',
      onError: 'warn',
      phase: SetupPhase.CLUSTER,
      run: async (ctx) => {
        const k8sClient = ctx.k8sClient;
        if (!k8sClient) {
          throw new Error('Kubernetes client not initialized');
        }
        const username = EnvVariables.testUsername;
        const password = EnvVariables.testUserPassword;
        logger.info(`👤 Ensuring non-priv test user "${username}" exists in htpasswd IDP...`);
        const wasCreated = await k8sClient.ensureNonPrivUserExists(username, password);
        logger.success(`✓ Non-priv test user "${username}" is available in the cluster IDP`);

        // If the user or IDP entry was newly created the OAuth pods restart.
        // Wait for them to be Ready before the browser login rule runs.
        if (wasCreated) {
          await waitForOAuthRollout(k8sClient);
        }
      },
    },
    {
      id: 'setup-test-namespace',
      name: 'Set up test namespace',
      onError: 'throw',
      phase: SetupPhase.CLUSTER,
      run: async (ctx) => {
        const k8sClient = ctx.k8sClient;
        if (!k8sClient) {
          throw new Error('Kubernetes client not initialized');
        }
        logger.info(`📦 Setting up test namespace: ${ctx.testNamespace}...`);
        await k8sClient.setupTestNamespace(ctx.testNamespace);
        logger.success(`✓ Test namespace setup complete: ${ctx.testNamespace}`);
      },
    },
    {
      id: 'enable-vm-folders',
      name: 'Ensure VM folders (tree view) enabled',
      onError: 'warn',
      phase: SetupPhase.CLUSTER,
      run: async (ctx) => {
        const k8sClient = ctx.k8sClient;
        if (!k8sClient) {
          throw new Error('Kubernetes client not initialized');
        }
        const cm = await k8sClient.ensureVmFoldersEnabled(ctx.cnvNamespace);
        const cmData = cm?.data as Record<string, string> | undefined;
        if (cmData?.treeViewFolders === 'true') {
          logger.success(
            '✓ VM folders (treeViewFolders) enabled in kubevirt-ui-features ConfigMap',
          );
        } else if (cm === null) {
          logger.warn(
            '⚠️ Could not ensure VM folders: kubevirt-ui-features ConfigMap not found or no permissions',
          );
        }
      },
    },
    {
      guard: () => !EnvVariables.isNonPrivUser,
      id: 'set-default-storage-class',
      name: 'Set default StorageClass for VirtualMachines',
      onError: 'warn',
      phase: SetupPhase.CLUSTER,
      run: async (ctx) => {
        const k8sClient = ctx.k8sClient;
        if (!k8sClient) {
          throw new Error('Kubernetes client not initialized');
        }
        const defaultVmStorageClass = EnvVariables.storageClass;
        logger.info(
          `📦 Setting default StorageClass for VirtualMachines: ${defaultVmStorageClass}...`,
        );
        await k8sClient.setDefaultStorageClassForVirtualMachines(defaultVmStorageClass);
        logger.success(`✓ Default for VirtualMachines set to ${defaultVmStorageClass}`);
      },
    },
    {
      id: 'save-config',
      name: 'Persist shared test configuration',
      onError: 'throw',
      phase: SetupPhase.CLUSTER,
      run: async (ctx) => {
        const setupConfig = {
          arch: EnvVariables.isS390x ? 's390x' : undefined,
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
        logger.info(
          `✓ Saved test configuration (including kubeconfig path: ${setupConfig.kubeConfigPath})`,
        );
        logger.info(`   - Web Console URL: ${setupConfig.webConsoleUrl}`);
        logger.info(`   - Cluster API URL: ${setupConfig.clusterUrl}`);
      },
    },
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
          const loginPage = new LoginPage(page);
          logger.info('🔄 Navigating to login page...');
          await loginPage.navigateToLogin(baseUrl);
          await page.waitForLoadState('load');
          logger.info(`Current URL: ${page.url()}`);

          let uiUsername = EnvVariables.uiLoginUsername;
          let uiPassword = EnvVariables.uiLoginPassword;
          if (!EnvVariables.isNonPrivUser) {
            const kubeAdminButtonVisible = await loginPage.isKubeAdminButtonVisible({
              timeout: 10 * SECOND,
            });
            if (kubeAdminButtonVisible) {
              logger.info('Clicking kube:admin login button...');
              await page.waitForTimeout(SECOND);
              await loginPage.clickKubeAdminLogin();
            }
          } else {
            logger.info('Logging in as non-privileged user (NON_PRIV=1)');
            // Poll with page reloads: after a fresh IDP creation the OAuth server may take
            // several seconds to surface the new IDP button even after its pods are Ready.
            logger.info(
              `Waiting for "${NONPRIV_IDP_NAME}" IDP button (retrying with reloads if needed)...`,
            );
            const testButtonVisible = await loginPage.waitForTestButtonWithReload(baseUrl, {
              idpName: NONPRIV_IDP_NAME,
              maxAttempts: 10,
              perAttemptTimeoutMs: 3 * SECOND,
              retryIntervalMs: 5 * SECOND,
            });
            if (testButtonVisible) {
              logger.info(`Clicking "${NONPRIV_IDP_NAME}" IDP button...`);
              ctx.nonPrivUsername = NONPRIV_IDP_NAME;
              await page.waitForTimeout(SECOND);
              await loginPage.clickTestLogin(NONPRIV_IDP_NAME);
            }
            // After clicking the IDP button the htpasswd form appears — use the test credentials.
            uiUsername = EnvVariables.testUsername;
            uiPassword = EnvVariables.testUserPassword;
          }

          const maxLoginAttempts = EnvVariables.isNonPrivUser ? 5 : 1;
          for (let attempt = 1; attempt <= maxLoginAttempts; attempt++) {
            logger.info(
              maxLoginAttempts > 1
                ? `Filling login form (attempt ${attempt}/${maxLoginAttempts})...`
                : 'Filling login form...',
            );
            await loginPage.fillAndSubmitLoginForm(uiUsername, uiPassword);

            logger.info('Waiting for login to complete...');
            await page.waitForURL((url) => !url.pathname.includes('/auth/login'), {
              timeout: 2 * MINUTE,
            });
            await page.waitForLoadState('load');

            const postLoginUrl = new URL(page.url());
            if (postLoginUrl.searchParams.get('reason') !== 'access_denied') {
              logger.success(`✓ Login complete, redirected to: ${page.url()}`);
              break;
            }

            if (attempt === maxLoginAttempts) {
              throw new Error(
                `Login rejected by OAuth server (access_denied) after ${maxLoginAttempts} attempt(s). ` +
                  `The user credentials may be invalid or the htpasswd IDP has not fully propagated. ` +
                  `URL: ${page.url()}`,
              );
            }

            logger.warn(
              `⚠️ Login attempt ${attempt} got access_denied — ` +
                `htpasswd IDP may still be propagating, retrying in 10s...`,
            );
            await page.waitForTimeout(10 * SECOND);
            await loginPage.navigateToLogin(baseUrl);
            await page.waitForLoadState('load');

            if (EnvVariables.isNonPrivUser) {
              const testButtonVisible = await loginPage.isTestButtonVisible({
                idpName: NONPRIV_IDP_NAME,
                timeout: 5 * SECOND,
              });
              if (testButtonVisible) {
                await loginPage.clickTestLogin(NONPRIV_IDP_NAME);
              }
            }
          }

          await context.storageState({ path: ctx.storageStatePath });
          logger.success(`✓ Saved authenticated storage state to ${ctx.storageStatePath}`);
        } else {
          logger.info('🏠 Localhost detected, skipping login...');
        }

        try {
          if (EnvVariables.isLocalhost) {
            await page.goto(baseUrl, { timeout: MINUTE, waitUntil: 'load' });
            await page.waitForLoadState('domcontentloaded');
          } else {
            const consoleChromeTimeout = MINUTE;
            const perspectiveDropdown = page.locator('[data-tour-id="tour-perspective-dropdown"]');
            const tourFooter = page.locator('[data-test="tour-step-footer-secondary"]');
            await Promise.race([
              perspectiveDropdown.waitFor({ state: 'visible', timeout: consoleChromeTimeout }),
              tourFooter.waitFor({ state: 'visible', timeout: consoleChromeTimeout }),
            ]).catch(() => undefined);
            await page.waitForLoadState('domcontentloaded');
          }
        } catch {
          // Continue; downstream rules may still succeed
        }
      },
    },
    {
      guard: () => EnvVariables.isNonPrivUser,
      id: 'grant-kubevirt-access',
      name: 'Grant test user KubeVirt access in test namespace',
      onError: 'warn',
      phase: SetupPhase.BROWSER,
      run: async (ctx) => {
        const k8sClient = ctx.k8sClient;
        if (!k8sClient) {
          throw new Error('Kubernetes client not initialized');
        }
        // Use the actual htpasswd credential username (TEST_USERNAME, default "test").
        // ctx.nonPrivUsername holds the IDP button label (e.g. "test-users") which is the
        // OpenShift identity provider name — not the username the user authenticates with.
        const username = EnvVariables.testUsername;

        // Ensure the test namespace exists and is Active before applying RBAC.
        // It is created in CLUSTER phase, but may not have propagated fully by the time
        // this BROWSER phase rule runs — create/wait idempotently here.
        logger.info(
          `📦 Ensuring test namespace ${ctx.testNamespace} is ready before granting RBAC...`,
        );
        await k8sClient.setupTestNamespace(ctx.testNamespace);

        logger.info(
          `📦 Granting test user "${username}" KubeVirt access in ${ctx.testNamespace}...`,
        );
        await k8sClient.grantUserKubevirtAccessToNamespace(ctx.testNamespace, username);
        logger.success(`✓ Test user can list/manage VirtualMachines in ${ctx.testNamespace}`);

        logger.info(
          `📦 Granting test user view access in ${ctx.cnvNamespace} (HCO + KubeVirt read)...`,
        );
        await k8sClient.grantUserViewAccessToNamespace(ctx.cnvNamespace, username);
        logger.success(`✓ Test user can read HCO/KubeVirt resources in ${ctx.cnvNamespace}`);

        logger.info(
          `📦 Granting test user cluster-level view access (catalog, templates, wizard)...`,
        );
        await k8sClient.grantUserClusterViewAccess(username);
        logger.success(`✓ Test user has cluster-level view access`);

        logger.info(
          `📦 Granting test user cluster-level CDI read access (bootable volumes, datasources)...`,
        );
        await k8sClient.grantUserCdiClusterReadAccess(username);
        logger.success(`✓ Test user can list/read CDI DataSources and DataVolumes cluster-wide`);
      },
    },
    {
      guard: () => EnvVariables.isNonPrivUser,
      id: 'patch-nonpriv-config',
      name: 'Persist discovered non-priv username to test config',
      onError: 'warn',
      phase: SetupPhase.BROWSER,
      run: async (ctx) => {
        if (!ctx.nonPrivUsername) return;
        const existing = TestConfigManager.getConfig();
        TestConfigManager.saveConfig({ ...existing, nonPrivUsername: ctx.nonPrivUsername });
        logger.info(`✓ Persisted nonPrivUsername "${ctx.nonPrivUsername}" to test config`);
      },
    },
    {
      id: 'disable-welcome-modals',
      name: 'Disable welcome modals via K8s API (core + virtualization)',
      onError: 'warn',
      phase: SetupPhase.BROWSER,
      run: async (ctx) => {
        const k8sClient = ctx.k8sClient;
        if (!k8sClient) {
          throw new Error('Kubernetes client not initialized');
        }

        // Use the actual htpasswd credential username for non-priv runs.
        // ctx.nonPrivUsername is the IDP button label, not the authenticated username.
        const virtUsername = EnvVariables.isNonPrivUser ? EnvVariables.testUsername : 'kube-admin';

        let userUid: string | undefined;
        if (EnvVariables.isNonPrivUser) {
          userUid = await k8sClient.getUserUid(virtUsername);
          if (userUid) {
            logger.info(`Resolved '${virtUsername}' UID: ${userUid}`);
          } else {
            logger.warn(`⚠️ Could not resolve UID for '${virtUsername}', patching by name only`);
          }
        }

        const virtResult = await k8sClient.disableVirtualizationWelcomeSettings(
          ctx.cnvNamespace,
          virtUsername,
          userUid,
        );
        if (virtResult) {
          logger.success(
            `✓ Virtualization welcome settings disabled for '${virtUsername}'${
              userUid ? ` (UID: ${userUid})` : ''
            } in ${ctx.cnvNamespace}`,
          );
        } else {
          logger.warn(
            `⚠️ Could not disable virtualization welcome settings (ConfigMap may not exist yet)`,
          );
        }

        const consoleUsername = EnvVariables.isNonPrivUser
          ? EnvVariables.testUsername
          : EnvVariables.username;
        // For a new non-priv user the ConfigMap won't exist until after first login — skip retries.
        const coreResult = await k8sClient.setupConsoleUserSettings(
          consoleUsername,
          undefined,
          EnvVariables.isNonPrivUser ? 1 : 5,
        );
        if (coreResult) {
          logger.success(`✓ Core console guided tours marked completed for '${consoleUsername}'`);
        } else if (EnvVariables.isNonPrivUser) {
          // Expected on first run for a new non-priv user — the console creates
          // user-settings-<username> only after the first login. The
          // dismiss-welcome-modals safety-net rule handles any residual modal.
          logger.info(
            `ℹ️ Console user-settings ConfigMap not yet available for '${consoleUsername}' (first login) — modal dismissed by safety net`,
          );
        } else {
          logger.warn(
            `⚠️ Could not disable core welcome modal (ConfigMap may not exist for '${consoleUsername}')`,
          );
        }
      },
    },
    {
      guard: () => !EnvVariables.ignoreWelcome,
      id: 'dismiss-welcome-modals',
      name: 'Dismiss any residual welcome modals (safety net)',
      onError: 'warn',
      phase: SetupPhase.BROWSER,
      run: async (_ctx) => {
        if (!browserState) {
          throw new Error('Browser state not initialized');
        }
        const { page } = browserState;
        const quickTimeout = 5 * SECOND;

        try {
          const tourFooterSecondary = page.locator('[data-test="tour-step-footer-secondary"]');
          const footerVisible = await tourFooterSecondary
            .waitFor({ state: 'visible', timeout: quickTimeout })
            .then(() => true)
            .catch(() => false);
          if (footerVisible) {
            await tourFooterSecondary.click();
            await page.waitForTimeout(500);
            logger.info('✓ Core welcome modal dismissed via UI (safety net)');
          }
        } catch {
          /* API-based rule should have handled this */
        }

        try {
          const welcomeCheckbox = page.locator('#welcome-modal-checkbox');
          const visible = await welcomeCheckbox
            .isVisible({ timeout: quickTimeout })
            .catch(() => false);
          if (visible) {
            await welcomeCheckbox.check({ force: true }).catch(() => undefined);
            await page.waitForTimeout(500);
            logger.info('✓ Virtualization welcome modal dismissed via UI (safety net)');
          }
        } catch {
          /* API-based rule should have handled this */
        }
      },
    },
    {
      guard: () => !EnvVariables.onAcm,
      id: 'set-default-project',
      name: 'Set default project in console',
      onError: 'warn',
      phase: SetupPhase.BROWSER,
      run: async (ctx) => {
        if (!browserState) {
          throw new Error('Browser state not initialized');
        }
        const { page } = browserState;
        const overviewDashboardPage = new OverviewDashboardComponent(page);
        await overviewDashboardPage.projectDropdown.switchToNamespace(ctx.testNamespace);
        logger.success(`✓ Set default project to ${ctx.testNamespace}`);
      },
    },
    {
      id: 'save-storage-state',
      name: 'Save Playwright storage state and close browser',
      onError: 'warn',
      phase: SetupPhase.BROWSER,
      run: async (ctx) => {
        if (browserState) {
          try {
            await browserState.context.storageState({ path: ctx.storageStatePath });
          } catch {
            // Non-fatal; state may already be saved after login
          }
          await browserState.context.close();
          await browserState.browser.close();
          browserState = null;
          logger.success(`✓ Saved storage state to ${ctx.storageStatePath}`);
        }
      },
    },
  ];
}
