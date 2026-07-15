import { execFileSync } from 'child_process';
import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import * as path from 'path';

import KubernetesClient from '@/clients/kubernetes-client';
import { ClusterJanitor } from '@/utils/cluster-janitor';
import { EnvVariables } from '@/utils/env-variables';
import { logger } from '@/utils/logger';
import { waitForOAuthRollout } from '@/utils/nonpriv-utils';
import { type SharedTestConfig, MINUTE, SECOND, TestConfigManager } from '@/utils/test-config';
import { type Browser, type BrowserContext, type Page, chromium } from '@playwright/test';

import type { SetupRule } from './types';
import { SetupPhase } from './types';

/**
 * Candidate kubeconfig paths, checked in order.
 * KUBECONFIG env var is resolved at runtime so it picks up CI overrides.
 */
function getKubeconfigCandidates(): string[] {
  const candidates: string[] = [];
  const envKc = process.env.KUBECONFIG;
  if (envKc) {
    for (const p of envKc.split(path.delimiter)) {
      if (p) candidates.push(p);
    }
  }
  candidates.push('/tmp/kubeconfig');
  const home = process.env.HOME || process.env.USERPROFILE || '';
  if (home) {
    candidates.push(path.join(home, '.kube', 'config'));
  }
  return candidates;
}

function isValidKubeconfigContent(content: string): boolean {
  const trimmed = content.trim();
  return (
    trimmed.length > 0 &&
    (trimmed.startsWith('{') || trimmed.includes('apiVersion') || trimmed.includes('clusters:'))
  );
}

/**
 * Returns ordered global setup rules (AUTH → CLUSTER → BROWSER → REPORTING).
 * Browser-phase rules share `browserState` created during browser login / console prep.
 */
export function getSetupRules(): SetupRule[] {
  let browserState: { browser: Browser; context: BrowserContext; page: Page } | null = null;

  return [
    {
      id: 'export-oc-kubeconfig',
      name: 'Export admin kubeconfig from active oc session',
      phase: SetupPhase.AUTH,
      guard: (ctx) => !ctx.effectiveKubeConfigPath,
      onError: 'warn',
      run: async (ctx) => {
        try {
          execFileSync('oc', ['whoami'], {
            encoding: 'utf8',
            timeout: 10 * SECOND,
            stdio: 'pipe',
          });
        } catch {
          logger.info('⏭️ No active oc session found — skipping oc kubeconfig export');
          return;
        }

        try {
          const server = execFileSync('oc', ['whoami', '--show-server'], {
            encoding: 'utf8',
            timeout: 10 * SECOND,
            stdio: 'pipe',
          }).trim();
          const token = execFileSync('oc', ['whoami', '--show-token'], {
            encoding: 'utf8',
            timeout: 10 * SECOND,
            stdio: 'pipe',
          }).trim();

          if (!server || !token) {
            logger.warn('⚠️ oc whoami returned empty server or token — skipping');
            return;
          }

          const kubeConfigDir = path.dirname(ctx.kubeConfigPath);
          if (!fs.existsSync(kubeConfigDir)) {
            fs.mkdirSync(kubeConfigDir, { recursive: true });
          }

          const kubeconfig = [
            'apiVersion: v1',
            'kind: Config',
            'clusters:',
            '- cluster:',
            '    insecure-skip-tls-verify: true',
            `    server: ${server}`,
            '  name: oc-session',
            'contexts:',
            '- context:',
            '    cluster: oc-session',
            '    user: oc-session',
            '  name: oc-session',
            'current-context: oc-session',
            'users:',
            '- name: oc-session',
            '  user:',
            `    token: ${token}`,
          ].join('\n');

          fs.writeFileSync(ctx.kubeConfigPath, kubeconfig, 'utf8');
          ctx.effectiveKubeConfigPath = ctx.kubeConfigPath;
          const user = execFileSync('oc', ['whoami'], {
            encoding: 'utf8',
            timeout: 10 * SECOND,
            stdio: 'pipe',
          }).trim();
          logger.success(`✓ Exported admin kubeconfig to ${ctx.kubeConfigPath} (${user})`);
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          logger.warn(`⚠️ Failed to export oc kubeconfig: ${msg}`);
        }
      },
    },
    {
      id: 'detect-existing-kubeconfig',
      name: 'Detect existing kubeconfig (KUBECONFIG / /tmp/kubeconfig / ~/.kube/config)',
      phase: SetupPhase.AUTH,
      guard: (ctx) => !ctx.effectiveKubeConfigPath,
      onError: 'warn',
      run: async (ctx) => {
        const candidates = getKubeconfigCandidates();
        for (const candidate of candidates) {
          if (!fs.existsSync(candidate)) continue;

          const content = fs.readFileSync(candidate, 'utf8');
          if (!isValidKubeconfigContent(content)) {
            logger.info(`⏭️ ${candidate} exists but does not look like a valid kubeconfig`);
            continue;
          }

          logger.info(`📋 Found kubeconfig at ${candidate}, validating with oc whoami...`);
          try {
            const user = execFileSync('oc', ['whoami', `--kubeconfig=${candidate}`], {
              encoding: 'utf8',
              timeout: 30 * SECOND,
              stdio: 'pipe',
            }).trim();
            logger.info(`   Authenticated as: ${user}`);
          } catch {
            logger.info(`⏭️ ${candidate} exists but oc whoami failed — skipping`);
            continue;
          }

          const kubeConfigDir = path.dirname(ctx.kubeConfigPath);
          if (!fs.existsSync(kubeConfigDir)) {
            fs.mkdirSync(kubeConfigDir, { recursive: true });
          }
          if (candidate !== ctx.kubeConfigPath) {
            fs.copyFileSync(candidate, ctx.kubeConfigPath);
          }
          ctx.effectiveKubeConfigPath = ctx.kubeConfigPath;
          logger.success(`✓ Kubeconfig validated and copied from ${candidate}`);
          return;
        }
        const saTokenPath = '/var/run/secrets/kubernetes.io/serviceaccount/token';
        const saCaPath = '/var/run/secrets/kubernetes.io/serviceaccount/ca.crt';
        if (fs.existsSync(saTokenPath)) {
          logger.info('📋 In-cluster ServiceAccount token found, building kubeconfig...');
          try {
            const token = fs.readFileSync(saTokenPath, 'utf8').trim();
            const k8sHost = process.env.KUBERNETES_SERVICE_HOST || '';
            const k8sPort =
              process.env.KUBERNETES_SERVICE_PORT_HTTPS ||
              process.env.KUBERNETES_SERVICE_PORT ||
              '443';
            const server =
              k8sHost.includes(':') && !k8sHost.startsWith('[')
                ? `https://[${k8sHost}]:${k8sPort}`
                : `https://${k8sHost}:${k8sPort}`;

            const kubeconfig = [
              'apiVersion: v1',
              'kind: Config',
              'clusters:',
              '- cluster:',
              `    certificate-authority: ${saCaPath}`,
              `    server: ${server}`,
              '  name: in-cluster',
              'contexts:',
              '- context:',
              '    cluster: in-cluster',
              '    user: sa-token',
              '  name: in-cluster',
              'current-context: in-cluster',
              'users:',
              '- name: sa-token',
              '  user:',
              `    token: ${token}`,
            ].join('\n');

            const kubeConfigDir = path.dirname(ctx.kubeConfigPath);
            if (!fs.existsSync(kubeConfigDir)) {
              fs.mkdirSync(kubeConfigDir, { recursive: true });
            }
            fs.writeFileSync(ctx.kubeConfigPath, kubeconfig, 'utf8');
            ctx.effectiveKubeConfigPath = ctx.kubeConfigPath;
            logger.success(`✓ Kubeconfig built from in-cluster SA token (server: ${server})`);
            return;
          } catch (err) {
            logger.info(`⏭️ Failed to build kubeconfig from SA token: ${err}`);
          }
        }
      },
    },
    {
      id: 'oc-login',
      name: 'Generate kubeconfig via oc login',
      phase: SetupPhase.AUTH,
      guard: (ctx) => !ctx.effectiveKubeConfigPath,
      onError: 'warn',
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
          { encoding: 'utf8', timeout: MINUTE, stdio: 'pipe' },
        );
        ctx.effectiveKubeConfigPath = ctx.kubeConfigPath;
        logger.success('✓ Kubeconfig generated via oc login');
      },
    },
    {
      id: 'oauth-login',
      name: 'Generate kubeconfig via OAuth',
      phase: SetupPhase.AUTH,
      guard: (ctx) => !ctx.effectiveKubeConfigPath,
      onError: 'throw',
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
      phase: SetupPhase.AUTH,
      onError: 'throw',
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
            username: EnvVariables.username,
            password: EnvVariables.password,
          },
          ctx.effectiveKubeConfigPath,
        );
        logger.info('🔐 Verifying cluster authentication...');
        await k8sClient.verifyAuthentication();
        logger.success('✓ Cluster authentication verified');
        let token = k8sClient.getCurrentUserToken();
        if (!token) {
          logger.info('⚠️ Token not found in kubeconfig user object, trying oc whoami...');
          try {
            token = execFileSync(
              'oc',
              ['whoami', '--show-token', `--kubeconfig=${ctx.effectiveKubeConfigPath}`],
              { encoding: 'utf8', timeout: 30 * SECOND, stdio: 'pipe' },
            ).trim();
          } catch {
            logger.warn('⚠️ oc whoami --show-token failed');
          }
        }
        if (!token) {
          logger.info('⚠️ Falling back to OAuth token request...');
          try {
            token = await KubernetesClient.getOAuthToken(
              EnvVariables.clusterUrl,
              EnvVariables.username,
              EnvVariables.password,
            );
          } catch {
            logger.warn('⚠️ OAuth token request failed');
          }
        }
        if (token) {
          ctx.authToken = token;
          logger.success('✓ Authentication token extracted');
        } else {
          logger.warn('⚠️ Could not extract authentication token from any source');
        }
        ctx.k8sClient = k8sClient;
      },
    },
    {
      id: 'verify-k8s-client-health',
      name: 'Verify K8s client can perform admin operations',
      phase: SetupPhase.AUTH,
      onError: 'throw',
      run: async (ctx) => {
        const k8sClient = ctx.k8sClient;
        if (!k8sClient) {
          throw new Error('Kubernetes client not initialized');
        }

        const defaultVmStorageClass = EnvVariables.storageClass;

        const checks: Array<{ label: string; fn: () => Promise<unknown> }> = [
          {
            label: 'List namespaces',
            fn: () => k8sClient.getNamespaceCount(),
          },
          {
            label: `Read CNV namespace (${ctx.cnvNamespace})`,
            fn: () => k8sClient.namespaceExists(ctx.cnvNamespace),
          },
          {
            label: 'Read ConfigMap (kubevirt-ui-features)',
            fn: () => k8sClient.getConfigMap('kubevirt-ui-features', ctx.cnvNamespace),
          },
          {
            label: 'List VirtualMachines CRD',
            fn: () =>
              k8sClient.listCustomResources('kubevirt.io', 'v1', 'default', 'virtualmachines'),
          },
          {
            label: 'Read HyperConverged CR',
            fn: () => k8sClient.isNativeVmTemplateFeatureGateEnabled(),
          },
        ];

        const failures: string[] = [];
        for (const check of checks) {
          try {
            await check.fn();
            logger.info(`   ✓ ${check.label}`);
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            failures.push(`${check.label}: ${msg}`);
            logger.warn(`   ✗ ${check.label}: ${msg}`);
          }
        }

        if (failures.length > 0) {
          throw new Error(
            `K8s client health check failed (${failures.length}/${checks.length}):\n` +
              failures.map((f) => `  - ${f}`).join('\n') +
              '\nThe kubeconfig may lack admin-level RBAC.',
          );
        }

        try {
          logger.info(
            `📦 Setting default StorageClass for VirtualMachines: ${defaultVmStorageClass}...`,
          );
          await k8sClient.setDefaultStorageClassForVirtualMachines(defaultVmStorageClass);
          logger.success(`✓ Default StorageClass for VirtualMachines set to ${defaultVmStorageClass}`);
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          logger.warn(`⚠️ Failed to set default StorageClass: ${msg}`);
        }

        logger.success('✓ K8s client health check passed');
      },
    },
    {
      id: 'start-cluster-janitor',
      name: 'Start native ClusterJanitor background sweep',
      phase: SetupPhase.CLUSTER,
      guard: () => EnvVariables.isClusterJanitorEnabled,
      onError: 'warn',
      run: async (ctx) => {
        if (!ctx.k8sClient) {
          throw new Error('Kubernetes client not initialized for ClusterJanitor');
        }
        const janitor = new ClusterJanitor(ctx.k8sClient, {
          staleAgeMs: EnvVariables.clusterJanitorStaleAgeMs,
          excludeNamespaces: [ctx.testNamespace],
        });
        janitor.startInterval(EnvVariables.clusterJanitorIntervalMs);
        ctx.clusterJanitor = janitor;
        logger.success('✓ ClusterJanitor background sweep started');
      },
    },
    {
      id: 'ensure-nonpriv-user',
      name: 'Ensure non-priv test user exists in htpasswd IDP',
      phase: SetupPhase.CLUSTER,
      guard: () => EnvVariables.isNonPrivUser,
      onError: 'warn',
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
      phase: SetupPhase.CLUSTER,
      onError: 'throw',
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
      phase: SetupPhase.CLUSTER,
      onError: 'warn',
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
      id: 'enable-native-vm-templates',
      name: 'Enable native VM template feature gate on HCO',
      phase: SetupPhase.CLUSTER,
      guard: () => !EnvVariables.isNonPrivUser,
      onError: 'warn',
      run: async (ctx) => {
        const k8sClient = ctx.k8sClient;
        if (!k8sClient) {
          throw new Error('Kubernetes client not initialized');
        }
        const alreadyEnabled = await k8sClient.isNativeVmTemplateFeatureGateEnabled();
        if (alreadyEnabled) {
          logger.success('✓ Native VM template feature gate already enabled');
          return;
        }
        await k8sClient.enableNativeVmTemplateFeatureGate();
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
      phase: SetupPhase.CLUSTER,
      onError: 'throw',
      run: async (ctx) => {
        const setupConfig = {
          authToken: ctx.authToken,
          cnvNamespace: ctx.cnvNamespace,
          kubeConfigPath: ctx.kubeConfigPath,
          projectName: ctx.testNamespace,
          secretName: EnvVariables.secretName,
          testNamespace: ctx.testNamespace,
          nncpNic: ctx.nncpNic,
          arch: EnvVariables.isS390x ? 's390x' : undefined,
          webConsoleUrl: EnvVariables.webConsoleUrl,
          clusterUrl: EnvVariables.clusterUrl,
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
      id: 'disable-sidebar-autohide',
      name: 'Disable sidebar auto-hide and welcome modals in console user settings',
      phase: SetupPhase.CLUSTER,
      onError: 'warn',
      run: async (ctx) => {
        const k8sClient = ctx.k8sClient;
        if (!k8sClient) {
          throw new Error('Kubernetes client not initialized');
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
          await k8sClient.patchConfigMap(configMapName, namespace, {
            [settingsKey]: userPreferences,
          });
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
        const k8sClient = ctx.k8sClient;
        if (!k8sClient) {
          throw new Error('Kubernetes client not initialized');
        }

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
        const coreResult = await k8sClient.setupConsoleUserSettings(
          consoleUsername,
          undefined,
          EnvVariables.isNonPrivUser ? 1 : 5,
        );
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
      id: 'wait-for-console-ready',
      name: 'Wait for console web endpoint to become reachable',
      phase: SetupPhase.CLUSTER,
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
          await context.storageState({ path: ctx.storageStatePath });
          logger.success(`✓ Saved empty storage state to ${ctx.storageStatePath}`);
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
    {
      id: 'grant-kubevirt-access',
      name: 'Grant test user KubeVirt access in test namespace',
      phase: SetupPhase.BROWSER,
      guard: () => EnvVariables.isNonPrivUser,
      onError: 'warn',
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
      id: 'patch-nonpriv-config',
      name: 'Persist discovered non-priv username to test config',
      phase: SetupPhase.BROWSER,
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
      phase: SetupPhase.BROWSER,
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
    // allure-environment removed — Allure reporting is disabled in CI for now.
  ];
}
