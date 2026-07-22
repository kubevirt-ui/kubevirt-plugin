/**
 * Cluster discovery — cached per reconciliation cycle.
 */

import * as k8s from '@kubernetes/client-node';

export type ClusterInfo = {
  apiServer: string;
  appsDomain: string;
  thanosUrl: string;
  alertmanagerUrl: string;
};

export const discoverCluster = async (kc: k8s.KubeConfig): Promise<ClusterInfo> => {
  const customApi = kc.makeApiClient(k8s.CustomObjectsApi);
  const coreApi = kc.makeApiClient(k8s.CoreV1Api);

  const apiServer =
    process.env.KUBERNETES_SERVICE_HOST
      ? `https://${process.env.KUBERNETES_SERVICE_HOST}:${process.env.KUBERNETES_SERVICE_PORT ?? '443'}`
      : kc.getCurrentCluster()?.server ?? '';

  // Get apps domain from Ingress config
  const ingress = (await customApi.getClusterCustomObject({
    group: 'config.openshift.io',
    version: 'v1',
    plural: 'ingresses',
    name: 'cluster',
  })) as unknown as { spec?: { domain?: string } };

  const appsDomain = ingress.spec?.domain ?? '';
  if (!appsDomain) {
    throw new Error('Could not discover APPS_DOMAIN from ingress.config.openshift.io/cluster');
  }

  // Get monitoring URLs
  let thanosUrl = '';
  let alertmanagerUrl = '';
  try {
    const { data } = await coreApi.readNamespacedConfigMap({
      name: 'monitoring-shared-config',
      namespace: 'openshift-config-managed',
    });
    thanosUrl = data?.['thanosPublicURL'] ?? '';
    alertmanagerUrl = data?.['alertmanagerPublicURL'] ?? '';
  } catch {
    /* monitoring config may not exist */
  }

  return { apiServer, appsDomain, thanosUrl, alertmanagerUrl };
};

/** Resolve console image from cluster version (same logic as resolve-console-image.sh). */
export const resolveConsoleImage = async (
  kc: k8s.KubeConfig,
  registry: string,
  override?: string,
): Promise<string> => {
  if (override) return override;

  try {
    const customApi = kc.makeApiClient(k8s.CustomObjectsApi);
    const cv = (await customApi.getClusterCustomObject({
      group: 'config.openshift.io',
      version: 'v1',
      plural: 'clusterversions',
      name: 'version',
    })) as unknown as { status?: { desired?: { version?: string } } };

    const version = cv.status?.desired?.version;
    if (version) {
      const [major, minor] = version.split('.');
      if (major && minor) return `${registry}:${major}.${minor}`;
    }
  } catch {
    /* cluster version not available */
  }

  return `${registry}:latest`;
};
