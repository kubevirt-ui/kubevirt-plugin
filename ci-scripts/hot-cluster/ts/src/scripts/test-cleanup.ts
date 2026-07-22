/**
 * Delete test-created VM/template/storage resources from the E2E test namespace.
 * Replaces: ci-scripts/hot-cluster/test-cleanup.sh
 *
 * Required env: TEST_NS (default: auto-test-ns), TEST_SECRET_NAME (default: auto-test-secret)
 * Kubeconfig: loaded from default ($KUBECONFIG or ~/.kube/config)
 */

import { KubeClient } from '../kube-client';

const KUBEVIRT_GROUP = 'kubevirt.io';
const CDI_GROUP = 'cdi.kubevirt.io';
const SNAPSHOT_GROUP = 'snapshot.kubevirt.io';
const INSTANCETYPE_GROUP = 'instancetype.kubevirt.io';
const MIGRATION_GROUP = 'migrations.kubevirt.io';
const NET_ATTACH_GROUP = 'k8s.cni.cncf.io';

const main = async (): Promise<void> => {
  const testNs = process.env.TEST_NS || process.env.CYPRESS_TEST_NS || 'auto-test-ns';
  const testSecretName = process.env.TEST_SECRET_NAME || process.env.CYPRESS_TEST_SECRET_NAME || 'auto-test-secret';

  const client = KubeClient.fromKubeconfig();

  console.log(`Cleaning test entities in ${testNs}...`);

  // Namespaced resources -- bulk delete
  await client.bulkDelete({
    namespace: testNs,
    resources: [
      { group: KUBEVIRT_GROUP, version: 'v1', plural: 'virtualmachines' },
      { group: '', version: 'v1', plural: 'pods' }, // templates are core
      { group: SNAPSHOT_GROUP, version: 'v1beta1', plural: 'virtualmachinesnapshots' },
      { group: CDI_GROUP, version: 'v1beta1', plural: 'datavolumes' },
      { group: CDI_GROUP, version: 'v1beta1', plural: 'datasources' },
      { group: '', version: 'v1', plural: 'persistentvolumeclaims' },
      { group: NET_ATTACH_GROUP, version: 'v1', plural: 'network-attachment-definitions' },
    ],
  });

  // Delete specific test secret (not --all, to preserve ci-env-controller secrets)
  try {
    await client.coreV1.deleteNamespacedSecret({ name: testSecretName, namespace: testNs });
    console.log(`Deleted secret ${testSecretName}`);
  } catch (err) {
    if ((err as { statusCode?: number }).statusCode !== 404) {
      console.warn(`Could not delete secret ${testSecretName}: ${err instanceof Error ? err.message : err}`);
    }
  }

  // Delete named instance types/preferences in the test namespace
  const namedDeletes = [
    { group: INSTANCETYPE_GROUP, version: 'v1beta1', plural: 'virtualmachineinstancetypes', name: 'example' },
    { group: INSTANCETYPE_GROUP, version: 'v1beta1', plural: 'virtualmachinepreferences', name: 'example' },
  ];

  for (const { group, version, plural, name } of namedDeletes) {
    try {
      await client.customObjects.deleteNamespacedCustomObject({ group, version, namespace: testNs, plural, name });
    } catch (err) {
      if ((err as { statusCode?: number }).statusCode !== 404) {
        console.warn(`Could not delete ${plural}/${name}: ${err instanceof Error ? err.message : err}`);
      }
    }
  }

  // Cluster-scoped resources created by tests under a fixed "example" name
  const clusterDeletes = [
    { group: INSTANCETYPE_GROUP, version: 'v1beta1', plural: 'virtualmachineclusterinstancetypes', name: 'example' },
    { group: INSTANCETYPE_GROUP, version: 'v1beta1', plural: 'virtualmachineclusterpreferences', name: 'example' },
    { group: MIGRATION_GROUP, version: 'v1alpha1', plural: 'migrationpolicies', name: 'example' },
  ];

  for (const { group, version, plural, name } of clusterDeletes) {
    try {
      await client.customObjects.deleteClusterCustomObject({ group, version, plural, name });
    } catch (err) {
      if ((err as { statusCode?: number }).statusCode !== 404) {
        console.warn(`Could not delete cluster ${plural}/${name}: ${err instanceof Error ? err.message : err}`);
      }
    }
  }

  console.log('Test cleanup complete.');
};

main().catch((err) => {
  console.error(`::error::Test cleanup failed: ${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
