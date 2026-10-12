/**
 * Programmatic resource builder for the ci-test-stack Helm chart.
 * Returns typed KubernetesObject[] for server-side apply.
 * Replaces: ci-scripts/hot-cluster/helm/ci-test-stack/templates/*.yaml
 */

import { buildConsoleResources, buildPluginResources } from './ci-test-stack-resources';

export type K8sResource = {
  [key: string]: unknown;
  apiVersion: string;
  kind: string;
  metadata: { labels?: Record<string, string>; name: string; namespace?: string };
};

export type CiTestStackConfig = {
  console: {
    apiServer: string;
    auth: { caCert: string; mode: 'disabled' | 'openshift'; redirectPath: string };
    image: string;
    monitoring: { alertmanagerUrl: string; thanosUrl: string };
    pluginProxy: { endpoint: string };
    port: number;
    replicas: number;
    route: { enabled: boolean; host: string };
    userSettingsLocation: string;
  };
  namespace: string;
  plugin: {
    image: string;
    port: number;
    replicas: number;
  };
  rbac: {
    consoleClusterRole: string;
    testRunnerClusterRole: string;
  };
  releaseName: string;
  runner: {
    saName: string;
    saNamespace: string;
  };
};

const labels = (config: CiTestStackConfig, component: string): Record<string, string> => ({
  'app.kubernetes.io/instance': config.releaseName,
  'app.kubernetes.io/managed-by': 'ci-env-controller',
  'app.kubernetes.io/name': component,
});

const buildRbacResources = (config: CiTestStackConfig): K8sResource[] => {
  const { namespace, releaseName } = config;
  return [
    {
      apiVersion: 'v1',
      kind: 'ServiceAccount',
      metadata: { labels: labels(config, 'console'), name: `${releaseName}-console`, namespace },
    },
    {
      apiVersion: 'rbac.authorization.k8s.io/v1',
      kind: 'ClusterRoleBinding',
      metadata: { labels: labels(config, 'console'), name: `${releaseName}-console-admin` },
      roleRef: {
        apiGroup: 'rbac.authorization.k8s.io',
        kind: 'ClusterRole',
        name: config.rbac.consoleClusterRole,
      },
      subjects: [{ kind: 'ServiceAccount', name: `${releaseName}-console`, namespace }],
    },
    {
      apiVersion: 'rbac.authorization.k8s.io/v1',
      kind: 'RoleBinding',
      metadata: {
        labels: labels(config, 'runner'),
        name: `${releaseName}-runner-test`,
        namespace,
      },
      roleRef: {
        apiGroup: 'rbac.authorization.k8s.io',
        kind: 'ClusterRole',
        name: config.rbac.testRunnerClusterRole,
      },
      subjects: [
        {
          kind: 'ServiceAccount',
          name: config.runner.saName,
          namespace: config.runner.saNamespace,
        },
      ],
    },
  ];
};

export const buildCiTestStack = (config: CiTestStackConfig): K8sResource[] => {
  return [
    ...buildRbacResources(config),
    ...buildPluginResources(config),
    ...buildConsoleResources(config),
  ];
};
