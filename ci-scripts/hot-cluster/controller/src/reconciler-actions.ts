import * as k8s from '@kubernetes/client-node';

import { discoverCluster, resolveConsoleImage } from './cluster';
import { provisionNamespace } from './reconciler-provision';
import { cleanupResources } from './reconciler-teardown';
import type { ControllerConfig } from './types';

type ProvisionOptions = {
  authMode: 'disabled' | 'openshift';
  consoleImageOverride: string;
  helmRelease: string;
  htpasswdSecretName: string;
  htpasswdUser: string;
  pluginImage: string;
  testNs: string;
  userSettingsLocation: string;
};

const patchCm = async (
  coreApi: k8s.CoreV1Api,
  name: string,
  namespace: string,
  data: Record<string, string>,
): Promise<void> => {
  try {
    await coreApi.patchNamespacedConfigMap({ body: { data }, name, namespace });
  } catch {
    /* best effort */
  }
};

/** Provision a CI test environment: create namespace, deploy console + plugin, update ConfigMap. */
export const provision = async (
  kubeConfig: k8s.KubeConfig,
  config: ControllerConfig,
  cmName: string,
  opts: ProvisionOptions,
): Promise<void> => {
  const coreApi = kubeConfig.makeApiClient(k8s.CoreV1Api);
  const log = (msg: string): void => console.log(`[${new Date().toISOString()}] ${msg}`);

  log(`Provisioning ${cmName} → ns=${opts.testNs}`);
  await patchCm(coreApi, cmName, config.ciEnvNs, { status: 'provisioning' });

  try {
    const cluster = await discoverCluster(kubeConfig);
    const consoleImage = await resolveConsoleImage(
      kubeConfig,
      config.consoleImageRegistry,
      opts.consoleImageOverride || undefined,
    );

    await provisionNamespace(kubeConfig, config, opts.testNs);

    const bridgeBase = `https://${opts.helmRelease}-console.${cluster.appsDomain}`;
    log(`Provisioned: bridge=${bridgeBase}, console=${consoleImage}`);

    await patchCm(coreApi, cmName, config.ciEnvNs, {
      'bridge-base-address': bridgeBase,
      'console-route': `${opts.helmRelease}-console.${cluster.appsDomain}`,
      status: 'ready',
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log(`Provision failed for ${cmName}: ${msg}`);
    await patchCm(coreApi, cmName, config.ciEnvNs, {
      'error-message': msg,
      status: 'error',
    });
  }
};

/** Tear down a CI test environment: delete resources and update ConfigMap. */
export const teardown = async (
  kubeConfig: k8s.KubeConfig,
  config: ControllerConfig,
  cmName: string,
  testNs: string,
  helmRelease: string,
  authMode: string,
  htpasswdUser: string,
): Promise<void> => {
  const coreApi = kubeConfig.makeApiClient(k8s.CoreV1Api);
  const log = (msg: string): void => console.log(`[${new Date().toISOString()}] ${msg}`);

  log(`Tearing down ${cmName} → ns=${testNs}`);
  await patchCm(coreApi, cmName, config.ciEnvNs, { status: 'cleaning' });

  try {
    await cleanupResources(kubeConfig, config, testNs, helmRelease, authMode, htpasswdUser);
    await patchCm(coreApi, cmName, config.ciEnvNs, { status: 'cleaned' });
    log(`Teardown complete for ${cmName}.`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log(`Teardown failed for ${cmName}: ${msg}`);
    await patchCm(coreApi, cmName, config.ciEnvNs, {
      'error-message': msg,
      status: 'error',
    });
  }
};
