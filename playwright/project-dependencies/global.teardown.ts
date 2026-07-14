import { execFileSync } from 'child_process';
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
      username: EnvVariables.username,
      password: EnvVariables.password,
      token: testConfig.authToken,
    },
    kubeConfigPath,
  );
}

/**
 * Re-authenticate for teardown when the kubeconfig from setup is missing.
 * Checks standard kubeconfig locations first, falls back to `oc login`.
 */
function regenKubeconfig(): string | undefined {
  const kubeConfigDir = path.resolve(process.cwd(), '.kubeconfigs');
  if (!fs.existsSync(kubeConfigDir)) {
    fs.mkdirSync(kubeConfigDir, { recursive: true });
  }
  const kcPath = path.join(kubeConfigDir, 'teardown-config');

  const candidates: string[] = [];
  const envKc = process.env.KUBECONFIG;
  if (envKc) {
    for (const p of envKc.split(path.delimiter)) {
      if (p) candidates.push(p);
    }
  }
  candidates.push('/tmp/kubeconfig');
  const home = process.env.HOME || process.env.USERPROFILE || '';
  if (home) candidates.push(path.join(home, '.kube', 'config'));

  for (const candidate of candidates) {
    if (!fs.existsSync(candidate)) continue;
    try {
      execFileSync('oc', ['whoami', `--kubeconfig=${candidate}`], {
        encoding: 'utf8',
        timeout: 30_000,
        stdio: 'pipe',
      });
      fs.copyFileSync(candidate, kcPath);
      logger.info(`✓ Re-authenticated for teardown from existing kubeconfig: ${candidate}`);
      return kcPath;
    } catch {
      continue;
    }
  }

  const saTokenPath = '/var/run/secrets/kubernetes.io/serviceaccount/token';
  const saCaPath = '/var/run/secrets/kubernetes.io/serviceaccount/ca.crt';
  if (fs.existsSync(saTokenPath)) {
    try {
      const token = fs.readFileSync(saTokenPath, 'utf8').trim();
      const k8sHost = process.env.KUBERNETES_SERVICE_HOST || '';
      const k8sPort =
        process.env.KUBERNETES_SERVICE_PORT_HTTPS || process.env.KUBERNETES_SERVICE_PORT || '443';
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
      fs.writeFileSync(kcPath, kubeconfig, 'utf8');
      logger.info(`✓ Re-authenticated for teardown from in-cluster SA token`);
      return kcPath;
    } catch {
      // fall through to oc login
    }
  }

  const clusterUrl = EnvVariables.clusterUrl;
  if (!clusterUrl || clusterUrl === 'undefined') return undefined;

  try {
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
        `--kubeconfig=${kcPath}`,
      ],
      { encoding: 'utf8', timeout: MINUTE, stdio: 'pipe' },
    );
    logger.info(`✓ Re-authenticated for teardown via oc login: ${kcPath}`);
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
    testNamespace,
    k8sClient,
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
