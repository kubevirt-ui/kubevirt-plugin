import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildCiTestStack, type CiTestStackConfig } from './ci-test-stack';

const testConfig: CiTestStackConfig = {
  releaseName: 'test-release',
  namespace: 'test-ns',
  plugin: { image: 'plugin:latest', port: 9080, replicas: 1 },
  console: {
    image: 'console:latest',
    port: 9000,
    replicas: 1,
    apiServer: 'https://api.cluster.example.com:6443',
    route: { enabled: true, host: 'console.apps.cluster.example.com' },
    pluginProxy: { endpoint: '' },
    monitoring: { thanosUrl: '', alertmanagerUrl: '' },
    auth: { mode: 'disabled', redirectPath: '/auth/callback', caCert: '' },
    userSettingsLocation: 'localstorage',
  },
  rbac: { consoleClusterRole: 'cluster-admin', testRunnerClusterRole: 'ci-env-test-runner' },
  runner: { saName: 'runner-sa', saNamespace: 'arc-runners' },
};

describe('buildCiTestStack', () => {
  it('produces the expected number of resources', () => {
    const resources = buildCiTestStack(testConfig);
    assert.ok(resources.length >= 9, `Expected at least 9 resources, got ${resources.length}`);
  });

  it('includes a console Deployment', () => {
    const resources = buildCiTestStack(testConfig);
    const consoleDeployment = resources.find(
      (r) => r.kind === 'Deployment' && r.metadata?.name === 'test-release-console',
    );
    assert.ok(consoleDeployment, 'Console Deployment not found');
  });

  it('includes a plugin Deployment', () => {
    const resources = buildCiTestStack(testConfig);
    const pluginDeployment = resources.find(
      (r) => r.kind === 'Deployment' && r.metadata?.name === 'test-release-plugin',
    );
    assert.ok(pluginDeployment, 'Plugin Deployment not found');
  });

  it('includes a Route when enabled', () => {
    const resources = buildCiTestStack(testConfig);
    const route = resources.find((r) => r.kind === 'Route');
    assert.ok(route, 'Route not found');
  });

  it('omits Route when disabled', () => {
    const config = {
      ...testConfig,
      console: { ...testConfig.console, route: { enabled: false, host: '' } },
    };
    const resources = buildCiTestStack(config);
    assert.ok(!resources.find((r) => r.kind === 'Route'), 'Route should not be present');
  });

  it('labels all resources with managed-by', () => {
    const resources = buildCiTestStack(testConfig);
    for (const r of resources) {
      const managedBy = (r.metadata as Record<string, unknown>)?.labels as
        | Record<string, string>
        | undefined;
      if (managedBy) {
        assert.equal(managedBy['app.kubernetes.io/managed-by'], 'ci-env-controller');
      }
    }
  });
});
