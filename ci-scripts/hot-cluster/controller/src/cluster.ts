/**
 * Cluster discovery — cached per reconciliation cycle.
 */

import * as k8s from '@kubernetes/client-node';

export type ClusterInfo = {
  alertmanagerUrl: string;
  apiServer: string;
  appsDomain: string;
  thanosUrl: string;
};

export const discoverCluster = async (kubeConfig: k8s.KubeConfig): Promise<ClusterInfo> => {
  const customApi = kubeConfig.makeApiClient(k8s.CustomObjectsApi);
  const coreApi = kubeConfig.makeApiClient(k8s.CoreV1Api);

  const apiServer = process.env.KUBERNETES_SERVICE_HOST
    ? `https://${process.env.KUBERNETES_SERVICE_HOST}:${process.env.KUBERNETES_SERVICE_PORT ?? '443'}`
    : (kubeConfig.getCurrentCluster()?.server ?? '');

  // Get apps domain from Ingress config
  const ingress = (await customApi.getClusterCustomObject({
    group: 'config.openshift.io',
    name: 'cluster',
    plural: 'ingresses',
    version: 'v1',
  })) as unknown as { spec?: { domain?: string } };

  const appsDomain = ingress.spec?.domain ?? '';
  if (!appsDomain) {
    throw new Error('Could not discover APPS_DOMAIN from ingress.config.openshift.io/cluster');
  }

  // Get monitoring URLs
  const { alertmanagerUrl, thanosUrl } = await (async (): Promise<{
    alertmanagerUrl: string;
    thanosUrl: string;
  }> => {
    try {
      const { data } = await coreApi.readNamespacedConfigMap({
        name: 'monitoring-shared-config',
        namespace: 'openshift-config-managed',
      });
      return {
        alertmanagerUrl: data?.['alertmanagerPublicURL'] ?? '',
        thanosUrl: data?.['thanosPublicURL'] ?? '',
      };
    } catch {
      return { alertmanagerUrl: '', thanosUrl: '' };
    }
  })();

  return { alertmanagerUrl, apiServer, appsDomain, thanosUrl };
};

/** Resolve console image from cluster version (same logic as resolve-console-image.sh). */
export const resolveConsoleImage = async (
  kubeConfig: k8s.KubeConfig,
  registry: string,
  override?: string,
): Promise<string> => {
  if (override) {
    return override;
  }

  try {
    const customApi = kubeConfig.makeApiClient(k8s.CustomObjectsApi);
    const clusterVersion = (await customApi.getClusterCustomObject({
      group: 'config.openshift.io',
      name: 'version',
      plural: 'clusterversions',
      version: 'v1',
    })) as unknown as { status?: { desired?: { version?: string } } };

    const version = clusterVersion.status?.desired?.version;
    if (version) {
      const [major, minor] = version.split('.');
      if (major && minor) {
        return `${registry}:${major}.${minor}`;
      }
    }
  } catch {
    /* cluster version not available */
  }

  return `${registry}:latest`;
};
