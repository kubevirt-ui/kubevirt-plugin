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

const deleteTestSecret = async (
  client: KubeClient,
  testNs: string,
  testSecretName: string,
): Promise<void> => {
  try {
    await client.coreV1.deleteNamespacedSecret({ name: testSecretName, namespace: testNs });
    console.log(`Deleted secret ${testSecretName}`);
  } catch (err) {
    if ((err as { statusCode?: number }).statusCode !== 404) {
      console.warn(
        `Could not delete secret ${testSecretName}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
};

const deleteNamedResources = async (
  client: KubeClient,
  testNs: string,
  resources: Array<{ group: string; name: string; plural: string; version: string }>,
): Promise<void> => {
  for (const { group, name, plural, version } of resources) {
    try {
      await client.customObjects.deleteNamespacedCustomObject({
        group,
        name,
        namespace: testNs,
        plural,
        version,
      });
    } catch (err) {
      if ((err as { statusCode?: number }).statusCode !== 404) {
        console.warn(
          `Could not delete ${plural}/${name}: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }
  }
};

const deleteClusterResources = async (
  client: KubeClient,
  resources: Array<{ group: string; name: string; plural: string; version: string }>,
): Promise<void> => {
  for (const { group, name, plural, version } of resources) {
    try {
      await client.customObjects.deleteClusterCustomObject({ group, name, plural, version });
    } catch (err) {
      if ((err as { statusCode?: number }).statusCode !== 404) {
        console.warn(
          `Could not delete cluster ${plural}/${name}: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }
  }
};

const main = async (): Promise<void> => {
  const testNs = process.env.TEST_NS ?? process.env.CYPRESS_TEST_NS ?? 'auto-test-ns';
  const testSecretName =
    process.env.TEST_SECRET_NAME ?? process.env.CYPRESS_TEST_SECRET_NAME ?? 'auto-test-secret';

  const client = KubeClient.fromKubeconfig();

  console.log(`Cleaning test entities in ${testNs}...`);

  await client.bulkDelete({
    namespace: testNs,
    resources: [
      { group: KUBEVIRT_GROUP, plural: 'virtualmachines', version: 'v1' },
      { group: '', plural: 'pods', version: 'v1' },
      { group: SNAPSHOT_GROUP, plural: 'virtualmachinesnapshots', version: 'v1beta1' },
      { group: CDI_GROUP, plural: 'datavolumes', version: 'v1beta1' },
      { group: CDI_GROUP, plural: 'datasources', version: 'v1beta1' },
      { group: '', plural: 'persistentvolumeclaims', version: 'v1' },
      { group: NET_ATTACH_GROUP, plural: 'network-attachment-definitions', version: 'v1' },
    ],
  });

  await deleteTestSecret(client, testNs, testSecretName);

  await deleteNamedResources(client, testNs, [
    {
      group: INSTANCETYPE_GROUP,
      name: 'example',
      plural: 'virtualmachineinstancetypes',
      version: 'v1beta1',
    },
    {
      group: INSTANCETYPE_GROUP,
      name: 'example',
      plural: 'virtualmachinepreferences',
      version: 'v1beta1',
    },
  ]);

  await deleteClusterResources(client, [
    {
      group: INSTANCETYPE_GROUP,
      name: 'example',
      plural: 'virtualmachineclusterinstancetypes',
      version: 'v1beta1',
    },
    {
      group: INSTANCETYPE_GROUP,
      name: 'example',
      plural: 'virtualmachineclusterpreferences',
      version: 'v1beta1',
    },
    { group: MIGRATION_GROUP, name: 'example', plural: 'migrationpolicies', version: 'v1alpha1' },
  ]);

  console.log('Test cleanup complete.');
};

void main().catch((err) => {
  console.error(
    `::error::Test cleanup failed: ${err instanceof Error ? err.message : String(err)}`,
  );
  process.exit(1);
});
