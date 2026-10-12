import type { CiTestStackConfig, K8sResource } from './ci-test-stack';

const labels = (config: CiTestStackConfig, component: string): Record<string, string> => ({
  'app.kubernetes.io/instance': config.releaseName,
  'app.kubernetes.io/managed-by': 'ci-env-controller',
  'app.kubernetes.io/name': component,
});

/** Build the kubevirt-plugin (plugin server) Deployment + Service resources. */
export const buildPluginResources = (config: CiTestStackConfig): K8sResource[] => {
  const { namespace, plugin, releaseName } = config;
  return [
    {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      metadata: { labels: labels(config, 'plugin'), name: `${releaseName}-plugin`, namespace },
      spec: {
        replicas: plugin.replicas,
        selector: { matchLabels: { 'app.kubernetes.io/name': 'plugin' } },
        template: {
          metadata: { labels: labels(config, 'plugin') },
          spec: {
            containers: [
              {
                image: plugin.image,
                name: 'plugin',
                ports: [{ containerPort: plugin.port, name: 'http' }],
              },
            ],
          },
        },
      },
    },
    {
      apiVersion: 'v1',
      kind: 'Service',
      metadata: { labels: labels(config, 'plugin'), name: `${releaseName}-plugin`, namespace },
      spec: {
        ports: [{ port: plugin.port, targetPort: plugin.port }],
        selector: { 'app.kubernetes.io/name': 'plugin' },
      },
    },
  ];
};

/** Build the OpenShift Console Deployment + Service + (optional Route) resources. */
export const buildConsoleResources = (config: CiTestStackConfig): K8sResource[] => {
  const { console: consoleCfg, namespace, releaseName } = config;
  const resources: K8sResource[] = [
    {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      metadata: { labels: labels(config, 'console'), name: `${releaseName}-console`, namespace },
      spec: {
        replicas: consoleCfg.replicas,
        selector: { matchLabels: { 'app.kubernetes.io/name': 'console' } },
        template: {
          metadata: { labels: labels(config, 'console') },
          spec: {
            containers: [
              {
                env: [
                  { name: 'BRIDGE_K8S_MODE', value: 'off-cluster' },
                  { name: 'BRIDGE_K8S_MODE_OFF_CLUSTER_ENDPOINT', value: consoleCfg.apiServer },
                  { name: 'BRIDGE_USER_SETTINGS_LOCATION', value: consoleCfg.userSettingsLocation },
                  {
                    name: 'BRIDGE_PLUGIN_PROXY',
                    value: JSON.stringify({
                      services: [{ endpoint: consoleCfg.pluginProxy.endpoint }],
                    }),
                  },
                  {
                    name: 'BRIDGE_PLUGINS',
                    value: `kubevirt-plugin=http://${releaseName}-plugin.${namespace}.svc:${config.plugin.port}`,
                  },
                ],
                image: consoleCfg.image,
                name: 'console',
                ports: [{ containerPort: consoleCfg.port, name: 'http' }],
              },
            ],
            serviceAccountName: `${releaseName}-console`,
          },
        },
      },
    },
    {
      apiVersion: 'v1',
      kind: 'Service',
      metadata: { labels: labels(config, 'console'), name: `${releaseName}-console`, namespace },
      spec: {
        ports: [{ port: consoleCfg.port, targetPort: consoleCfg.port }],
        selector: { 'app.kubernetes.io/name': 'console' },
      },
    },
  ];

  if (consoleCfg.route.enabled) {
    resources.push({
      apiVersion: 'route.openshift.io/v1',
      kind: 'Route',
      metadata: { labels: labels(config, 'console'), name: `${releaseName}-console`, namespace },
      spec: {
        host: consoleCfg.route.host,
        port: { targetPort: consoleCfg.port },
        tls: { termination: 'edge' },
        to: { kind: 'Service', name: `${releaseName}-console` },
      },
    });
  }

  return resources;
};
