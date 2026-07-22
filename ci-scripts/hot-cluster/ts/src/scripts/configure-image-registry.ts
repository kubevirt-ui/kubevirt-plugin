/**
 * Ensure the internal image registry is available for in-cluster builds.
 * Replaces: ci-scripts/hot-cluster/configure-image-registry.sh
 */

import { KubeClient, withRetry } from '../kube-client';

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

const main = async (): Promise<void> => {
  const client = KubeClient.fromKubeconfig();
  const api = client.customObjects;

  console.log('Ensuring internal image registry is available for in-cluster builds...');

  const registry = (await api.getClusterCustomObject({
    group: 'imageregistry.operator.openshift.io',
    version: 'v1',
    plural: 'configs',
    name: 'cluster',
  })) as unknown as { spec: { managementState: string; storage?: Record<string, unknown> } };

  const mgmtState = registry.spec.managementState;

  if (mgmtState === 'Removed') {
    console.log('Image registry is Removed — setting to Managed with emptyDir storage...');
    await withRetry(() =>
      api.patchClusterCustomObject({
        group: 'imageregistry.operator.openshift.io',
        version: 'v1',
        plural: 'configs',
        name: 'cluster',
        body: { spec: { managementState: 'Managed', storage: { emptyDir: {} } } },
      }),
      'patch image registry',
    );
  } else if (mgmtState === 'Managed') {
    const storage = registry.spec.storage;
    if (!storage || Object.keys(storage).length === 0) {
      console.log('Image registry has no storage — configuring emptyDir...');
      await withRetry(() =>
        api.patchClusterCustomObject({
          group: 'imageregistry.operator.openshift.io',
          version: 'v1',
          plural: 'configs',
          name: 'cluster',
          body: { spec: { storage: { emptyDir: {} } } },
        }),
        'patch registry storage',
      );
    } else {
      console.log('Image registry is Managed with storage configured.');
    }
  } else {
    console.log(`Image registry managementState: ${mgmtState}`);
  }

  console.log('Waiting for image-registry operator to be available...');
  for (let i = 1; i <= 30; i++) {
    try {
      const co = (await api.getClusterCustomObject({
        group: 'config.openshift.io',
        version: 'v1',
        plural: 'clusteroperators',
        name: 'image-registry',
      })) as unknown as { status?: { conditions?: Array<{ type: string; status: string }> } };

      const available = co.status?.conditions?.find((c) => c.type === 'Available');
      if (available?.status === 'True') {
        console.log('Image registry is Available.');
        return;
      }
    } catch { /* retry */ }

    console.log(`Waiting for image-registry... (${i}/30)`);
    await sleep(20000);
  }

  console.warn('Image registry did not become Available within timeout.');
};

main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
