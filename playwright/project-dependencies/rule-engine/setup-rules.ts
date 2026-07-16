import * as http from 'http';
import * as https from 'https';

import type { ClusterAuthConfig } from '@/clients/base-client';
import RequestContextClient from '@/clients/request-context-client';
import { EnvVariables } from '@/utils/env-variables';
import { logger } from '@/utils/logger';
import { type SharedTestConfig, MINUTE, SECOND, TestConfigManager } from '@/utils/test-config';
import { type Browser, type BrowserContext, type Page, chromium } from '@playwright/test';

import type { SetupRule } from './types';
import { SetupPhase } from './types';

/**
 * Returns ordered global setup rules (BROWSER → AUTH → CLUSTER → REPORTING).
 * Browser-phase rules launch the browser and perform login. The AUTH phase
 * creates a RequestContextClient from the live browser session. CLUSTER-phase
 * rules use that client for all K8s API operations. REPORTING-phase rules
 * save storage state and close the browser.
 */
export function getSetupRules(): SetupRule[] {
  let browserState: { browser: Browser; context: BrowserContext; page: Page } | null = null;

  return [
    // =========================================================================
    // BROWSER phase — console readiness check + browser login
    // =========================================================================
    {
      id: 'wait-for-console-ready',
      name: 'Wait for console web endpoint to become reachable',
      phase: SetupPhase.BROWSER,
      guard: () => !EnvVariables.isHcE2e && !EnvVariables.isLocalhost,
      onError: 'throw',
      run: async () => {
        const baseUrl = EnvVariables.webConsoleUrl;
        const timeoutMs = 2 * MINUTE;
        const pollIntervalMs = 5 * SECOND;
        logger.info(`⏳ Waiting for console to become reachable at ${baseUrl}...`);

        const probe = (): Promise<number> =>
          new Promise<number>((resolve, reject) => {
            const client = baseUrl.startsWith('https:') ? https : http;
            const req = client.get(
              baseUrl,
              { rejectUnauthorized: false, timeout: 10 * SECOND },
              (res) => {
                res.resume();
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
    {
      id: 'browser-login',
      name: 'Launch browser and perform console login',
      phase: SetupPhase.BROWSER,
      onError: 'throw',
      run: async (ctx) => {
        const baseUrl = EnvVariables.webConsoleUrl;
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
          viewport: { width: 1920, height: 1080 },
        });
        const page = await context.newPage();
        browserState = { browser, context, page };

        if (EnvVariables.isSkipBrowserLogin) {
          logger.info('🌐 Skipping browser OAuth login (HC_E2E / localhost / HTTP console)...');
          logger.info('   Navigating to console to capture session cookies...');
          await page.goto(baseUrl, { timeout: MINUTE, waitUntil: 'load' });
          await page.waitForLoadState('networkidle').catch(() => {});
          await context.storageState({ path: ctx.storageStatePath });
          logger.success(`✓ Saved storage state to ${ctx.storageStatePath}`);
          return;
        }

        logger.info('🌐 Performing browser OAuth login...');
        await page.goto(`${baseUrl}/auth/login`, { timeout: MINUTE, waitUntil: 'load' });
        await page.waitForLoadState('load');

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

        await page.waitForURL((url) => !url.pathname.includes('/auth/login'), {
          timeout: 2 * MINUTE,
        });
        await page.waitForLoadState('load');
        logger.success(`Login complete, redirected to: ${page.url()}`);

        await context.storageState({ path: ctx.storageStatePath });
        logger.success(`✓ Saved authenticated storage state to ${ctx.storageStatePath}`);
      },
    },

    // =========================================================================
    // AUTH phase — create RequestContextClient from the browser session
    // =========================================================================
    {
      id: 'init-api-client',
      name: 'Initialize RequestContextClient from browser session',
      phase: SetupPhase.AUTH,
      onError: 'throw',
      run: async (ctx) => {
        if (!browserState) {
          throw new Error('Browser not initialized. browser-login must run first.');
        }
        const { page } = browserState;
        const config: ClusterAuthConfig = {
          baseUrl: EnvVariables.webConsoleUrl,
          username: EnvVariables.username,
          password: EnvVariables.password,
        };

        let apiClient: RequestContextClient;
        let authToken: string | undefined;

        if (EnvVariables.isSkipBrowserLogin) {
          const { request } = await import('@playwright/test');
          const apiContext = await request.newContext({
            baseURL: EnvVariables.webConsoleUrl,
            ignoreHTTPSErrors: true,
          });
          apiClient = new RequestContextClient(apiContext, config);
          await apiClient.primeCsrfToken();
        } else {
          apiClient = new RequestContextClient(page, config);
          try {
            const response = await page.request.get(
              `${EnvVariables.webConsoleUrl}/api/request-token`,
              { ignoreHTTPSErrors: true },
            );
            if (response.ok()) {
              const text = await response.text();
              const match = text.match(/token[=:]?\s*([^\s"&<]+)/);
              if (match) authToken = match[1];
            }
          } catch {
            /* token not available */
          }
        }

        ctx.authToken = authToken;
        ctx.apiClient = apiClient;
        logger.success('✓ RequestContextClient initialized from browser session');
      },
    },

    // =========================================================================
    // CLUSTER phase — namespace, feature gates, storage, config, RBAC
    // =========================================================================
    {
      id: 'ensure-nonpriv-user',
      name: 'Ensure non-priv test user exists in htpasswd IDP',
      phase: SetupPhase.CLUSTER,
      guard: () => EnvVariables.isNonPrivUser,
      onError: 'warn',
      run: async (ctx) => {
        const apiClient = ctx.apiClient;
        if (!apiClient) {
          throw new Error('RequestContextClient not initialized');
        }
        const username = EnvVariables.testUsername;
        const password = EnvVariables.testUserPassword;
        logger.info(`👤 Ensuring non-priv test user "${username}" exists in htpasswd IDP...`);

        const { createHash } = await import('crypto');
        const sha1Hash = createHash('sha1').update(password).digest('base64');
        const newEntry = `${username}:{SHA}${sha1Hash}`;
        const SECRET_NAME = 'htpasswd-secret';
        const SECRET_NS = 'openshift-config';

        let wasCreated = false;
        let existingData: string | undefined;
        try {
          const secret = await apiClient.getResourceByKind('secret', SECRET_NAME, SECRET_NS);
          const b64 = (secret?.data as Record<string, string> | undefined)?.htpasswd;
          if (b64) {
            existingData = Buffer.from(b64, 'base64').toString('utf8');
          }
        } catch {
          // Secret doesn't exist
        }

        if (existingData && existingData.includes(`${username}:`)) {
          logger.info(`   User "${username}" already exists in htpasswd secret`);
        } else {
          const updatedData = existingData ? `${existingData.trimEnd()}\n${newEntry}` : newEntry;
          const encodedData = Buffer.from(updatedData).toString('base64');

          if (existingData) {
            await apiClient.patchResourceByKind(
              'secret',
              SECRET_NAME,
              { data: { htpasswd: encodedData } },
              SECRET_NS,
              'merge',
            );
          } else {
            await apiClient.createResourceByKind(
              'Secret',
              {
                apiVersion: 'v1',
                kind: 'Secret',
                metadata: { name: SECRET_NAME, namespace: SECRET_NS },
                data: { htpasswd: encodedData },
              },
              SECRET_NS,
            );
          }
          wasCreated = true;
          logger.info(`   Added user "${username}" to htpasswd secret`);
        }

        logger.success(`✓ Non-priv test user "${username}" is available in the cluster IDP`);

        if (wasCreated) {
          logger.info('⏳ Waiting for OAuth pods to roll out...');
          const deadline = Date.now() + 3 * MINUTE;
          while (Date.now() < deadline) {
            try {
              const podList = await apiClient.core.listPods('openshift-authentication');
              const pods = podList.items ?? [];
              const allReady =
                pods.length > 0 &&
                pods.every((pod) => {
                  const conditions = (pod.status as Record<string, unknown>)?.conditions as
                    | Array<{ type: string; status: string }>
                    | undefined;
                  return (
                    conditions?.some((c) => c.type === 'Ready' && c.status === 'True') ?? false
                  );
                });
              if (allReady) {
                logger.success('✓ OAuth pods are Ready');
                break;
              }
            } catch {
              // transient error, keep polling
            }
            await new Promise((resolve) => setTimeout(resolve, 5 * SECOND));
          }
        }
      },
    },
    {
      id: 'setup-test-namespace',
      name: 'Set up test namespace',
      phase: SetupPhase.CLUSTER,
      onError: 'throw',
      run: async (ctx) => {
        const apiClient = ctx.apiClient;
        if (!apiClient) {
          throw new Error('RequestContextClient not initialized');
        }
        logger.info(`📦 Setting up test namespace: ${ctx.testNamespace}...`);
        await apiClient.setupTestNamespace(ctx.testNamespace);
        logger.success(`✓ Test namespace setup complete: ${ctx.testNamespace}`);
      },
    },
    {
      id: 'enable-vm-folders',
      name: 'Ensure VM folders (tree view) enabled',
      phase: SetupPhase.CLUSTER,
      onError: 'warn',
      run: async (ctx) => {
        const apiClient = ctx.apiClient;
        if (!apiClient) {
          throw new Error('RequestContextClient not initialized');
        }
        await apiClient.setupKubevirtUiConfig(ctx.cnvNamespace);
        logger.success('✓ VM folders (treeViewFolders) enabled in kubevirt-ui-features ConfigMap');
      },
    },
    {
      id: 'enable-native-vm-templates',
      name: 'Enable native VM template feature gate on HCO',
      phase: SetupPhase.CLUSTER,
      guard: () => !EnvVariables.isNonPrivUser,
      onError: 'warn',
      run: async (ctx) => {
        const apiClient = ctx.apiClient;
        if (!apiClient) {
          throw new Error('RequestContextClient not initialized');
        }

        const kubevirt = await apiClient.getResourceByKind(
          'kubevirt',
          'kubevirt-kubevirt-hyperconverged',
          'openshift-cnv',
        );
        const devConfig = (
          (kubevirt?.spec as Record<string, unknown>)?.configuration as Record<string, unknown>
        )?.developerConfiguration as Record<string, unknown> | undefined;
        const featureGates = (devConfig?.featureGates as string[]) ?? [];
        const disabledFeatureGates = (devConfig?.disabledFeatureGates as string[]) ?? [];

        if (featureGates.includes('Template')) {
          logger.success('✓ Native VM template feature gate already enabled');
          return;
        }

        const jsonPatchOps: Array<Record<string, unknown>> = [];

        const disabledIndex = disabledFeatureGates.indexOf('Template');
        if (disabledIndex >= 0) {
          jsonPatchOps.push({
            op: 'remove',
            path: `/spec/configuration/developerConfiguration/disabledFeatureGates/${disabledIndex}`,
          });
        }

        jsonPatchOps.push({
          op: 'add',
          path: '/spec/configuration/developerConfiguration/featureGates/-',
          value: 'Template',
        });

        await apiClient.patchResourceByKind(
          'HyperConverged',
          'kubevirt-hyperconverged',
          {
            metadata: {
              annotations: {
                'kubevirt.kubevirt.io/jsonpatch': JSON.stringify(jsonPatchOps),
              },
            },
          },
          'openshift-cnv',
          'merge',
        );
        logger.success('✓ Native VM template feature gate enabled on HCO');
      },
    },
    {
      id: 'set-default-storage-class',
      name: 'Set default StorageClass for VirtualMachines',
      phase: SetupPhase.CLUSTER,
      guard: () => !EnvVariables.isHcE2e && !EnvVariables.isNonPrivUser,
      onError: 'warn',
      run: async (ctx) => {
        const apiClient = ctx.apiClient;
        if (!apiClient) {
          throw new Error('RequestContextClient not initialized');
        }
        const defaultVmStorageClass = EnvVariables.storageClass;
        logger.info(
          `📦 Setting default StorageClass for VirtualMachines: ${defaultVmStorageClass}...`,
        );

        const scList = await apiClient.getStorageClasses();
        for (const sc of scList.items ?? []) {
          const scName = sc.metadata?.name;
          if (!scName) continue;
          await apiClient.mergePatchResource('storage.k8s.io', 'v1', 'storageclasses', scName, {
            metadata: {
              annotations: { 'storageclass.kubevirt.io/is-default-virt-class': 'false' },
            },
          });
        }
        await apiClient.mergePatchResource(
          'storage.k8s.io',
          'v1',
          'storageclasses',
          defaultVmStorageClass,
          {
            metadata: {
              annotations: { 'storageclass.kubevirt.io/is-default-virt-class': 'true' },
            },
          },
        );
        logger.success(`✓ Default for VirtualMachines set to ${defaultVmStorageClass}`);
      },
    },
    {
      id: 'save-config',
      name: 'Persist shared test configuration',
      phase: SetupPhase.CLUSTER,
      onError: 'throw',
      run: async (ctx) => {
        const setupConfig = {
          authToken: ctx.authToken,
          cnvNamespace: ctx.cnvNamespace,
          projectName: ctx.testNamespace,
          secretName: EnvVariables.secretName,
          testNamespace: ctx.testNamespace,
          arch: EnvVariables.isS390x ? 's390x' : undefined,
          webConsoleUrl: EnvVariables.webConsoleUrl,
          clusterUrl: EnvVariables.clusterUrl,
        } as SharedTestConfig;
        TestConfigManager.saveConfig(setupConfig);
        logger.info('✓ Saved test configuration');
        logger.info(`   - Web Console URL: ${setupConfig.webConsoleUrl}`);
        logger.info(`   - Cluster API URL: ${setupConfig.clusterUrl}`);
      },
    },
    {
      id: 'disable-sidebar-autohide',
      name: 'Disable sidebar auto-hide in console user settings',
      phase: SetupPhase.CLUSTER,
      onError: 'warn',
      run: async (ctx) => {
        const apiClient = ctx.apiClient;
        if (!apiClient) {
          throw new Error('RequestContextClient not initialized');
        }

        const consoleUsername = EnvVariables.isNonPrivUser
          ? EnvVariables.testUsername
          : 'kubeadmin';
        const settingsKey = consoleUsername === 'kubeadmin' ? 'kube-admin' : consoleUsername;
        const configMapName = `user-settings-${settingsKey}`;
        const namespace = 'openshift-console-user-settings';

        const userPreferences = JSON.stringify({
          guidedTour: false,
          navigation: { autoHideNav: false },
          onboardingPopoversHidden: { catalog: true, createProject: true, vmsTab: true },
          quickStart: { activeQuickStartID: '', dontShowWelcomeModal: true },
        });

        try {
          await apiClient.mergePatchResource(
            '',
            'v1',
            'configmaps',
            configMapName,
            {
              data: { [settingsKey]: userPreferences },
            },
            namespace,
          );
          logger.success(`✓ Sidebar auto-hide disabled for '${settingsKey}'`);
        } catch {
          logger.info(
            `ℹ ConfigMap ${configMapName} not found — sidebar settings will be applied on first console login`,
          );
        }
      },
    },
    {
      id: 'disable-welcome-modals',
      name: 'Disable welcome modals via K8s API (core + virtualization)',
      phase: SetupPhase.CLUSTER,
      guard: () => !EnvVariables.isHcE2e,
      onError: 'warn',
      run: async (ctx) => {
        const apiClient = ctx.apiClient;
        if (!apiClient) {
          throw new Error('RequestContextClient not initialized');
        }

        const virtUsername = EnvVariables.isNonPrivUser ? EnvVariables.testUsername : 'kube-admin';

        let userUid: string | undefined;
        if (EnvVariables.isNonPrivUser) {
          try {
            const userObj = await apiClient.getResourceByKind('user', virtUsername);
            userUid = userObj?.metadata?.uid;
          } catch {
            // User may not exist yet
          }
          if (userUid) {
            logger.info(`Resolved '${virtUsername}' UID: ${userUid}`);
          } else {
            logger.warn(`⚠️ Could not resolve UID for '${virtUsername}', patching by name only`);
          }
        }

        let virtResult = false;
        try {
          const keysToUpdate = [virtUsername];
          if (userUid && userUid !== virtUsername) {
            keysToUpdate.push(userUid);
          }

          const patchData: Record<string, string> = {};
          for (const key of keysToUpdate) {
            patchData[key] = JSON.stringify({
              navigation: { autoHideNav: false },
              quickStart: { dontShowWelcomeModal: true, activeQuickStartID: '' },
              guidedTour: false,
              onboardingPopoversHidden: { vmsTab: true, catalog: true, createProject: true },
            });
          }
          await apiClient.mergePatchResource(
            '',
            'v1',
            'configmaps',
            'kubevirt-user-settings',
            { data: patchData },
            ctx.cnvNamespace,
          );
          virtResult = true;
        } catch {
          virtResult = false;
        }

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
        const consoleSettingsNs = 'openshift-console-user-settings';
        const configMapName = `user-settings-${consoleUsername}`;
        const maxAttempts = EnvVariables.isNonPrivUser ? 1 : 5;
        const patchData: Record<string, string> = {
          'console.guidedTour': JSON.stringify({
            admin: { completed: true },
            dev: { completed: true },
            'virtualization-perspective': { completed: true },
          }),
        };

        let coreResult = false;
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          try {
            await apiClient.mergePatchResource(
              '',
              'v1',
              'configmaps',
              configMapName,
              { data: patchData },
              consoleSettingsNs,
            );
            coreResult = true;
            break;
          } catch {
            if (attempt < maxAttempts) {
              await new Promise((resolve) => setTimeout(resolve, 3000));
            }
          }
        }

        if (coreResult) {
          logger.success(`✓ Core console guided tours marked completed for '${consoleUsername}'`);
        } else if (EnvVariables.isNonPrivUser) {
          logger.info(
            `ℹ️ Console user-settings ConfigMap not yet available for '${consoleUsername}' (first login)`,
          );
        } else {
          logger.warn(
            `⚠️ Could not disable core welcome modal (ConfigMap may not exist for '${consoleUsername}')`,
          );
        }
      },
    },
    {
      id: 'grant-kubevirt-access',
      name: 'Grant test user KubeVirt access in test namespace',
      phase: SetupPhase.CLUSTER,
      guard: () => EnvVariables.isNonPrivUser,
      onError: 'warn',
      run: async (ctx) => {
        const apiClient = ctx.apiClient;
        if (!apiClient) {
          throw new Error('RequestContextClient not initialized');
        }
        const username = EnvVariables.testUsername;

        logger.info(
          `📦 Ensuring test namespace ${ctx.testNamespace} is ready before granting RBAC...`,
        );
        await apiClient.setupTestNamespace(ctx.testNamespace);

        logger.info(
          `📦 Granting test user "${username}" KubeVirt access in ${ctx.testNamespace}...`,
        );
        try {
          await apiClient.createResourceByKind(
            'RoleBinding',
            {
              apiVersion: 'rbac.authorization.k8s.io/v1',
              kind: 'RoleBinding',
              metadata: { name: 'test-user-kubevirt-edit', namespace: ctx.testNamespace },
              roleRef: {
                apiGroup: 'rbac.authorization.k8s.io',
                kind: 'ClusterRole',
                name: 'kubevirt.io:edit',
              },
              subjects: [{ apiGroup: 'rbac.authorization.k8s.io', kind: 'User', name: username }],
            },
            ctx.testNamespace,
          );
        } catch {
          // Already exists
        }
        logger.success(`✓ Test user can list/manage VirtualMachines in ${ctx.testNamespace}`);

        logger.info(
          `📦 Granting test user view access in ${ctx.cnvNamespace} (HCO + KubeVirt read)...`,
        );
        try {
          await apiClient.createResourceByKind(
            'RoleBinding',
            {
              apiVersion: 'rbac.authorization.k8s.io/v1',
              kind: 'RoleBinding',
              metadata: { name: 'test-user-view', namespace: ctx.cnvNamespace },
              roleRef: {
                apiGroup: 'rbac.authorization.k8s.io',
                kind: 'ClusterRole',
                name: 'view',
              },
              subjects: [{ apiGroup: 'rbac.authorization.k8s.io', kind: 'User', name: username }],
            },
            ctx.cnvNamespace,
          );
        } catch {
          // Already exists
        }
        logger.success(`✓ Test user can read HCO/KubeVirt resources in ${ctx.cnvNamespace}`);

        logger.info(
          `📦 Granting test user cluster-level view access (catalog, templates, wizard)...`,
        );
        const viewBindingName = `test-user-cluster-view-${username.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`;
        try {
          await apiClient.createResourceByKind('ClusterRoleBinding', {
            apiVersion: 'rbac.authorization.k8s.io/v1',
            kind: 'ClusterRoleBinding',
            metadata: { name: viewBindingName },
            roleRef: {
              apiGroup: 'rbac.authorization.k8s.io',
              kind: 'ClusterRole',
              name: 'view',
            },
            subjects: [{ apiGroup: 'rbac.authorization.k8s.io', kind: 'User', name: username }],
          });
        } catch {
          // Already exists
        }
        logger.success(`✓ Test user has cluster-level view access`);

        logger.info(
          `📦 Granting test user cluster-level CDI read access (bootable volumes, datasources)...`,
        );
        const cdiRoleName = 'test-user-cdi-reader';
        const cdiBindingName = `test-user-cdi-reader-${username.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`;
        try {
          await apiClient.createResourceByKind('ClusterRole', {
            apiVersion: 'rbac.authorization.k8s.io/v1',
            kind: 'ClusterRole',
            metadata: { name: cdiRoleName },
            rules: [
              {
                apiGroups: ['cdi.kubevirt.io'],
                resources: ['datasources', 'datavolumes', 'dataimportcrons', 'cdiconfigs'],
                verbs: ['get', 'list', 'watch'],
              },
            ],
          });
        } catch {
          // Already exists
        }
        try {
          await apiClient.createResourceByKind('ClusterRoleBinding', {
            apiVersion: 'rbac.authorization.k8s.io/v1',
            kind: 'ClusterRoleBinding',
            metadata: { name: cdiBindingName },
            roleRef: {
              apiGroup: 'rbac.authorization.k8s.io',
              kind: 'ClusterRole',
              name: cdiRoleName,
            },
            subjects: [{ apiGroup: 'rbac.authorization.k8s.io', kind: 'User', name: username }],
          });
        } catch {
          // Already exists
        }
        logger.success(`✓ Test user can list/read CDI DataSources and DataVolumes cluster-wide`);
      },
    },

    // =========================================================================
    // REPORTING phase — persist non-priv config, save storage state, close browser
    // =========================================================================
    {
      id: 'patch-nonpriv-config',
      name: 'Persist discovered non-priv username to test config',
      phase: SetupPhase.REPORTING,
      guard: () => EnvVariables.isNonPrivUser,
      onError: 'warn',
      run: async (ctx) => {
        if (!ctx.nonPrivUsername) return;
        const existing = TestConfigManager.getConfig();
        TestConfigManager.saveConfig({ ...existing, nonPrivUsername: ctx.nonPrivUsername });
        logger.info(`✓ Persisted nonPrivUsername "${ctx.nonPrivUsername}" to test config`);
      },
    },
    {
      id: 'save-storage-state',
      name: 'Save Playwright storage state and close browser',
      phase: SetupPhase.REPORTING,
      onError: 'warn',
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
