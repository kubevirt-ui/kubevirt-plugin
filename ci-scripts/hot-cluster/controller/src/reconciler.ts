/**
 * Core reconciliation logic — processes a single ConfigMap trigger.
 */

import * as k8s from '@kubernetes/client-node';

import { provision, teardown } from './reconciler-actions';
import type { CiEnvData, ControllerConfig } from './types';

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
      body: { data: data as Record<string, string> },
      name,
      namespace,
    });
  } catch {
    /* best effort */
  }
};

export const reconcileOne = async (
  kubeConfig: k8s.KubeConfig,
  config: ControllerConfig,
  configMap: k8s.V1ConfigMap,
): Promise<void> => {
  const coreApi = kubeConfig.makeApiClient(k8s.CoreV1Api);
  const cmName = configMap.metadata?.name ?? '';
  const data = (configMap.data ?? {}) as unknown as CiEnvData;

  const desired = data['desired-state'] ?? 'unknown';
  const status = data.status ?? '';
  const pluginImage = data['plugin-image'] ?? '';
  const testNs = data['test-namespace'] ?? '';
  const consoleImageOverride = data['console-image'] ?? '';
  const helmRelease = data['helm-release'] ?? cmName;
  const authMode = data['auth-mode'] ?? 'disabled';
  const userSettingsLocation = data['user-settings-location'] ?? '';

  if (desired === 'present' && status !== 'ready' && status !== 'provisioning') {
    if (!pluginImage || !testNs) {
      log(`WARN: ConfigMap ${cmName} missing required fields`);
      await patchCm(coreApi, cmName, config.ciEnvNs, {
        'error-message': 'missing required fields: plugin-image and test-namespace',
        status: 'error',
      });
      return;
    }

    await provision(kubeConfig, config, cmName, {
      authMode: authMode as 'disabled' | 'openshift',
      consoleImageOverride,
      helmRelease,
      htpasswdSecretName: data['htpasswd-secret-name'] ?? '',
      htpasswdUser: data['htpasswd-user'] ?? '',
      pluginImage,
      testNs,
      userSettingsLocation,
    });
  } else if (desired === 'absent' && status !== 'cleaned' && status !== 'cleaning') {
    if (!testNs) {
      await patchCm(coreApi, cmName, config.ciEnvNs, { status: 'cleaned' });
      return;
    }
    await teardown(
      kubeConfig,
      config,
      cmName,
      testNs,
      helmRelease,
      authMode,
      data['htpasswd-user'] ?? '',
    );
  }
};
