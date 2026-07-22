/**
 * Programmatic resource builder for the ci-test-stack Helm chart.
 * Returns typed KubernetesObject[] for server-side apply.
 * Replaces: ci-scripts/hot-cluster/helm/ci-test-stack/templates/*.yaml
 */

/**
 * Loose K8s resource type — KubernetesObject is too narrow for resources
 * with spec/data fields. These are applied via server-side apply.
 */
type K8sResource = {
  apiVersion: string;
  kind: string;
  metadata: { name: string; namespace?: string; labels?: Record<string, string> };
  [key: string]: unknown;
};

export type CiTestStackConfig = {
  releaseName: string;
  namespace: string;
  plugin: {
    image: string;
    port: number;
    replicas: number;
  };
  console: {
    image: string;
    port: number;
    replicas: number;
    apiServer: string;
    route: { enabled: boolean; host: string };
    pluginProxy: { endpoint: string };
    monitoring: { thanosUrl: string; alertmanagerUrl: string };
    auth: { mode: 'disabled' | 'openshift'; redirectPath: string; caCert: string };
    userSettingsLocation: string;
  };
  rbac: {
    consoleClusterRole: string;
    testRunnerClusterRole: string;
  };
  runner: {
    saName: string;
    saNamespace: string;
  };
};

const labels = (config: CiTestStackConfig, component: string): Record<string, string> => ({
  'app.kubernetes.io/name': component,
  'app.kubernetes.io/instance': config.releaseName,
  'app.kubernetes.io/managed-by': 'ci-env-controller',
});

export const buildCiTestStack = (config: CiTestStackConfig): K8sResource[] => {
  const resources: K8sResource[] = [];
  const { releaseName, namespace } = config;

  // Console ServiceAccount
  resources.push({
    apiVersion: 'v1',
    kind: 'ServiceAccount',
    metadata: { name: `${releaseName}-console`, namespace, labels: labels(config, 'console') },
  });

  // Console ClusterRoleBinding
  resources.push({
    apiVersion: 'rbac.authorization.k8s.io/v1',
    kind: 'ClusterRoleBinding',
    metadata: { name: `${releaseName}-console-admin`, labels: labels(config, 'console') },
    roleRef: { apiGroup: 'rbac.authorization.k8s.io', kind: 'ClusterRole', name: config.rbac.consoleClusterRole },
    subjects: [{ kind: 'ServiceAccount', name: `${releaseName}-console`, namespace }],
  });

  // Runner RoleBinding (test namespace permissions)
  resources.push({
    apiVersion: 'rbac.authorization.k8s.io/v1',
    kind: 'RoleBinding',
    metadata: { name: `${releaseName}-runner-test`, namespace, labels: labels(config, 'runner') },
    roleRef: { apiGroup: 'rbac.authorization.k8s.io', kind: 'ClusterRole', name: config.rbac.testRunnerClusterRole },
    subjects: [{ kind: 'ServiceAccount', name: config.runner.saName, namespace: config.runner.saNamespace }],
  });

  // Console ConfigMap
  resources.push({
    apiVersion: 'v1',
    kind: 'ConfigMap',
    metadata: { name: `${releaseName}-console-config`, namespace, labels: labels(config, 'console') },
    data: {
      'console-config.yaml': JSON.stringify({
        kind: 'ConsoleConfig',
        apiVersion: 'console.openshift.io/v1',
        servingInfo: { bindAddress: `https://0.0.0.0:${config.console.port}` },
        clusterInfo: { consoleBaseAddress: `https://${config.console.route.host}` },
        plugins: { kubevirtPlugin: `https://${releaseName}-plugin:${config.plugin.port}` },
      }),
    },
  });

  // Plugin nginx ConfigMap
  resources.push({
    apiVersion: 'v1',
    kind: 'ConfigMap',
    metadata: { name: `${releaseName}-plugin-nginx`, namespace, labels: labels(config, 'plugin') },
    data: {
      'nginx.conf': [
        `server { listen ${config.plugin.port}; location / { root /usr/share/nginx/html; } }`,
      ].join('\n'),
    },
  });

  // Plugin Deployment
  resources.push({
    apiVersion: 'apps/v1',
    kind: 'Deployment',
    metadata: { name: `${releaseName}-plugin`, namespace, labels: labels(config, 'plugin') },
    spec: {
      replicas: config.plugin.replicas,
      selector: { matchLabels: { app: `${releaseName}-plugin` } },
      template: {
        metadata: { labels: { app: `${releaseName}-plugin`, ...labels(config, 'plugin') } },
        spec: {
          containers: [{
            name: 'plugin',
            image: config.plugin.image,
            ports: [{ containerPort: config.plugin.port }],
          }],
        },
      },
    },
  });

  // Plugin Service
  resources.push({
    apiVersion: 'v1',
    kind: 'Service',
    metadata: { name: `${releaseName}-plugin`, namespace, labels: labels(config, 'plugin') },
    spec: {
      selector: { app: `${releaseName}-plugin` },
      ports: [{ port: config.plugin.port, targetPort: config.plugin.port }],
    },
  });

  // Console Deployment
  const consoleEnv: Array<{ name: string; value: string }> = [
    { name: 'BRIDGE_K8S_MODE', value: 'off-cluster' },
    { name: 'BRIDGE_K8S_MODE_OFF_CLUSTER_ENDPOINT', value: config.console.apiServer },
    { name: 'BRIDGE_USER_SETTINGS_LOCATION', value: config.console.userSettingsLocation },
    { name: 'BRIDGE_PLUGINS', value: `kubevirt-plugin=https://${releaseName}-plugin:${config.plugin.port}` },
  ];

  if (config.console.auth.mode === 'disabled') {
    consoleEnv.push({ name: 'BRIDGE_K8S_AUTH', value: 'bearer-token' });
  }

  resources.push({
    apiVersion: 'apps/v1',
    kind: 'Deployment',
    metadata: { name: `${releaseName}-console`, namespace, labels: labels(config, 'console') },
    spec: {
      replicas: config.console.replicas,
      selector: { matchLabels: { app: `${releaseName}-console` } },
      template: {
        metadata: { labels: { app: `${releaseName}-console`, ...labels(config, 'console') } },
        spec: {
          serviceAccountName: `${releaseName}-console`,
          containers: [{
            name: 'console',
            image: config.console.image,
            ports: [{ containerPort: config.console.port }],
            env: consoleEnv,
          }],
        },
      },
    },
  });

  // Console Service
  resources.push({
    apiVersion: 'v1',
    kind: 'Service',
    metadata: { name: `${releaseName}-console`, namespace, labels: labels(config, 'console') },
    spec: {
      selector: { app: `${releaseName}-console` },
      ports: [{ port: config.console.port, targetPort: config.console.port }],
    },
  });

  // Console Route (if enabled)
  if (config.console.route.enabled) {
    resources.push({
      apiVersion: 'route.openshift.io/v1',
      kind: 'Route',
      metadata: { name: `${releaseName}-console`, namespace, labels: labels(config, 'console') },
      spec: {
        host: config.console.route.host || undefined,
        to: { kind: 'Service', name: `${releaseName}-console` },
        port: { targetPort: config.console.port },
        tls: { termination: 'edge' },
      },
    });
  }

  return resources;
};
