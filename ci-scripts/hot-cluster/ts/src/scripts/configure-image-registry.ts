/**
 * Ensure the internal image registry is available for in-cluster builds.
 * Replaces: ci-scripts/hot-cluster/configure-image-registry.sh
 */

import { KubeClient, withRetry } from '../kube-client';

const sleep = (delayMs: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, delayMs));

const main = async (): Promise<void> => {
  const client = KubeClient.fromKubeconfig();
  const api = client.customObjects;

  console.log('Ensuring internal image registry is available for in-cluster builds...');

  const registry = (await api.getClusterCustomObject({
    group: 'imageregistry.operator.openshift.io',
    name: 'cluster',
    plural: 'configs',
    version: 'v1',
  })) as unknown as { spec: { managementState: string; storage?: Record<string, unknown> } };

  const mgmtState = registry.spec.managementState;

  if (mgmtState === 'Removed') {
    console.log('Image registry is Removed — setting to Managed with emptyDir storage...');
    await withRetry(
      () =>
        api.patchClusterCustomObject({
          body: { spec: { managementState: 'Managed', storage: { emptyDir: {} } } },
          group: 'imageregistry.operator.openshift.io',
          name: 'cluster',
          plural: 'configs',
          version: 'v1',
        }),
      'patch image registry',
    );
  } else if (mgmtState === 'Managed') {
    const storage = registry.spec.storage;
    if (!storage || Object.keys(storage).length === 0) {
      console.log('Image registry has no storage — configuring emptyDir...');
      await withRetry(
        () =>
          api.patchClusterCustomObject({
            body: { spec: { storage: { emptyDir: {} } } },
            group: 'imageregistry.operator.openshift.io',
            name: 'cluster',
            plural: 'configs',
            version: 'v1',
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
  for (const i of Array.from({ length: 30 }, (_unused, idx) => idx + 1)) {
    try {
      const clusterOperator = (await api.getClusterCustomObject({
        group: 'config.openshift.io',
        name: 'image-registry',
        plural: 'clusteroperators',
        version: 'v1',
      })) as unknown as { status?: { conditions?: Array<{ status: string; type: string }> } };

      const available = clusterOperator.status?.conditions?.find(
        (condition) => condition.type === 'Available',
      );
      if (available?.status === 'True') {
        console.log('Image registry is Available.');
        return;
      }
    } catch {
      /* retry */
    }

    console.log(`Waiting for image-registry... (${i}/30)`);
    await sleep(20000);
  }

  console.warn('Image registry did not become Available within timeout.');
};

void main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
