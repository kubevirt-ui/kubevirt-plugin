/**
 * Core reconciliation logic — processes a single ConfigMap trigger.
 */

import { execSync } from 'node:child_process';

import * as k8s from '@kubernetes/client-node';

import type { CiEnvData, ControllerConfig } from './types';
import { discoverCluster, resolveConsoleImage } from './cluster';

const log = (msg: string): void => {
  console.log(`[${new Date().toISOString()}] ${msg}`);
};

const patchCm = async (
  coreApi: k8s.CoreV1Api,
  name: string,
  namespace: string,
  data: Partial<CiEnvData>,
): Promise<void> => {
  try {
    await coreApi.patchNamespacedConfigMap({
      name,
      namespace,
      body: { data: data as Record<string, string> },
    });
  } catch {
    /* best effort */
  }
};

export const reconcileOne = async (
  kc: k8s.KubeConfig,
  config: ControllerConfig,
  cm: k8s.V1ConfigMap,
): Promise<void> => {
  const coreApi = kc.makeApiClient(k8s.CoreV1Api);
  const cmName = cm.metadata?.name ?? '';
  const data = (cm.data ?? {}) as unknown as CiEnvData;

  const desired = data['desired-state'] ?? 'unknown';
  const status = data.status ?? '';
  const pluginImage = data['plugin-image'] ?? '';
  const testNs = data['test-namespace'] ?? '';
  const consoleImageOverride = data['console-image'] ?? '';
  const helmRelease = data['helm-release'] || cmName;
  const authMode = data['auth-mode'] ?? 'disabled';
  const userSettingsLocation = data['user-settings-location'] ?? '';

  if (desired === 'present' && status !== 'ready' && status !== 'provisioning') {
    if (!pluginImage || !testNs) {
      log(`WARN: ConfigMap ${cmName} missing required fields`);
      await patchCm(coreApi, cmName, config.ciEnvNs, {
        status: 'error',
        'error-message': 'missing required fields: plugin-image and test-namespace',
      });
      return;
    }

    await provision(kc, config, cmName, {
      pluginImage,
      testNs,
      consoleImageOverride,
      helmRelease,
      authMode: authMode as 'disabled' | 'openshift',
      htpasswdUser: data['htpasswd-user'] ?? '',
      htpasswdSecretName: data['htpasswd-secret-name'] ?? '',
      userSettingsLocation,
    });
  } else if (desired === 'absent' && status !== 'cleaned' && status !== 'cleaning') {
    if (!testNs) {
      await patchCm(coreApi, cmName, config.ciEnvNs, { status: 'cleaned' });
      return;
    }
    await teardown(kc, config, cmName, testNs, helmRelease, authMode, data['htpasswd-user'] ?? '');
  }
};

type ProvisionParams = {
  pluginImage: string;
  testNs: string;
  consoleImageOverride: string;
  helmRelease: string;
  authMode: 'disabled' | 'openshift';
  htpasswdUser: string;
  htpasswdSecretName: string;
  userSettingsLocation: string;
};

const provision = async (
  kc: k8s.KubeConfig,
  config: ControllerConfig,
  cmName: string,
  params: ProvisionParams,
): Promise<void> => {
  const coreApi = kc.makeApiClient(k8s.CoreV1Api);
  log(`Provisioning: cm=${cmName} ns=${params.testNs} release=${params.helmRelease}`);
  await patchCm(coreApi, cmName, config.ciEnvNs, { status: 'provisioning' });

  let cluster;
  try {
    cluster = await discoverCluster(kc);
  } catch (err) {
    await patchCm(coreApi, cmName, config.ciEnvNs, {
      status: 'error',
      'error-message': 'cluster discovery failed',
    });
    return;
  }

  const consoleImage = await resolveConsoleImage(kc, config.consoleImageRegistry, params.consoleImageOverride);
  const routeHost = `console-${cmName}.${cluster.appsDomain}`;

  // Create namespace
  try {
    await coreApi.createNamespace({ body: { metadata: { name: params.testNs } } });
  } catch (err) {
    if ((err as { statusCode?: number }).statusCode !== 409) {
      log(`WARN: could not create namespace ${params.testNs}: ${err}`);
    }
  }

  // Helm install (stays as subprocess — no SDK exists)
  const helmArgs = [
    'helm', 'upgrade', '--install', params.helmRelease,
    config.helmChartPath,
    '--namespace', params.testNs,
    '--set', `plugin.image=${params.pluginImage}`,
    '--set', `console.image=${consoleImage}`,
    '--set', `console.apiServer=${cluster.apiServer}`,
    '--set', `console.route.host=${routeHost}`,
    '--set', `console.pluginProxy.endpoint=https://kubevirt-apiserver-proxy.${cluster.appsDomain}`,
    '--set', `console.monitoring.thanosUrl=${cluster.thanosUrl}`,
    '--set', `console.monitoring.alertmanagerUrl=${cluster.alertmanagerUrl}`,
    '--set', 'rbac.consoleClusterRole=cluster-admin',
    '--set', `runner.saName=${config.runnerSaName}`,
    '--set', `runner.saNamespace=${config.runnerSaNs}`,
    '--wait', '--timeout', '5m',
  ];

  if (params.userSettingsLocation) {
    helmArgs.push('--set', `console.userSettingsLocation=${params.userSettingsLocation}`);
  }

  if (params.authMode === 'openshift') {
    helmArgs.push('--set', 'console.auth.mode=openshift');
  }

  try {
    log(`Running ${helmArgs[0]} ${helmArgs[1]} ${helmArgs[2]} ${params.helmRelease}...`);
    execSync(helmArgs.join(' '), { stdio: 'pipe', timeout: 360000 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log(`ERROR: helm install failed: ${msg}`);
    await patchCm(coreApi, cmName, config.ciEnvNs, { status: 'error', 'error-message': 'helm install failed' });
    return;
  }

  // Wait for console readiness
  const bridgeBase = `http://${params.helmRelease}-console.${params.testNs}.svc.cluster.local:9000`;
  log(`Waiting for console at ${bridgeBase}...`);
  let ready = false;
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`${bridgeBase}/`);
      if (res.ok || res.status === 301 || res.status === 302) {
        ready = true;
        break;
      }
    } catch {
      /* not ready yet */
    }
    await new Promise((r) => setTimeout(r, 5000));
  }

  if (!ready) {
    await patchCm(coreApi, cmName, config.ciEnvNs, { status: 'error', 'error-message': 'console did not become ready within 5 minutes' });
    return;
  }

  // Wait for plugin bundle
  const pluginBase = `http://${params.helmRelease}-plugin.${params.testNs}.svc.cluster.local:9080`;
  log(`Waiting for plugin bundle at ${pluginBase}...`);
  let pluginReady = false;
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`${pluginBase}/plugin-manifest.json`);
      if (res.ok) {
        const manifest = (await res.json()) as { name?: string };
        if (manifest.name) {
          pluginReady = true;
          break;
        }
      }
    } catch {
      /* not ready yet */
    }
    await new Promise((r) => setTimeout(r, 5000));
  }

  if (!pluginReady) {
    await patchCm(coreApi, cmName, config.ciEnvNs, { status: 'error', 'error-message': 'plugin bundle did not become ready' });
    return;
  }

  const consoleRoute = `https://${routeHost}`;
  log(`Environment ready: bridge=${bridgeBase} route=${consoleRoute}`);
  await patchCm(coreApi, cmName, config.ciEnvNs, {
    status: 'ready',
    'bridge-base-address': bridgeBase,
    'console-route': consoleRoute,
  });
};

const teardown = async (
  kc: k8s.KubeConfig,
  config: ControllerConfig,
  cmName: string,
  testNs: string,
  helmRelease: string,
  authMode: string,
  htpasswdUser: string,
): Promise<void> => {
  const coreApi = kc.makeApiClient(k8s.CoreV1Api);
  log(`Tearing down: cm=${cmName} ns=${testNs} release=${helmRelease}`);
  await patchCm(coreApi, cmName, config.ciEnvNs, { status: 'cleaning' });

  try {
    execSync(`helm uninstall "${helmRelease}" -n "${testNs}" --wait`, { stdio: 'pipe', timeout: 120000 });
  } catch {
    /* may not exist */
  }

  // Remove htpasswd user if auth-mode=openshift
  if (authMode === 'openshift' && htpasswdUser) {
    try {
      execSync(`bash "${config.ensureUserScript}" --remove "${htpasswdUser}"`, { stdio: 'pipe' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      log(`ERROR: failed to remove htpasswd user: ${msg}`);
      await patchCm(coreApi, cmName, config.ciEnvNs, { status: 'error', 'error-message': `failed to remove htpasswd user ${htpasswdUser}` });
      return;
    }
  }

  // Delete namespace (skip for manual-console)
  if (authMode !== 'openshift') {
    try {
      const helmList = execSync(`helm list -n "${testNs}" -q`, { encoding: 'utf8' }).trim();
      if (!helmList) {
        await coreApi.deleteNamespace({ name: testNs });
      } else {
        log(`${helmList.split('\n').length} other Helm release(s) still in ${testNs}; leaving namespace`);
      }
    } catch {
      /* best effort */
    }
  }

  log(`Teardown complete for ${cmName}`);
  await patchCm(coreApi, cmName, config.ciEnvNs, { status: 'cleaned' });
};
