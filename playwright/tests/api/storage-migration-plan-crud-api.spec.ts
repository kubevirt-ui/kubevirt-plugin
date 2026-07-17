import type { KubernetesResource } from '@/data-models/kubernetes-types';
import { expect, test } from '@/fixtures/api-test-fixture';

function buildMultiNsPlanSpec(
  name: string,
  namespace: string,
  vmName: string,
  volumeName: string,
  sourcePvcName: string,
  destinationStorageClass: string,
  retentionPolicy: 'keepSource' | 'deleteSource' = 'keepSource',
): KubernetesResource {
  return {
    apiVersion: 'migrations.kubevirt.io/v1alpha1',
    kind: 'MultiNamespaceVirtualMachineStorageMigrationPlan',
    metadata: { name, namespace },
    spec: {
      namespaces: [
        {
          name: namespace,
          retentionPolicy,
          virtualMachines: [
            {
              name: vmName,
              targetMigrationPVCs: [
                {
                  volumeName,
                  sourcePVC: { name: sourcePvcName },
                  destinationPVC: {
                    storageClassName: destinationStorageClass,
                    accessModes: ['Auto'],
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  } as unknown as KubernetesResource;
}

test.describe('Storage Migration Plan CRUD — API', { tag: ['@api'] }, () => {
  test.describe.configure({ mode: 'serial' });

  let planName: string;
  let testNs: string;
  let storageClassName: string;
  const dummyVmName = 'pw-smig-api-dummy';
  const dummyPvcName = 'pw-smig-api-dummy';

  test.beforeAll(async ({ apiClient, testNamespace, utils }) => {
    testNs = testNamespace;

    const scList = await apiClient.getStorageClasses();
    const scItems = (scList?.items as Array<{ metadata?: { name?: string } }>) ?? [];
    storageClassName = scItems[0]?.metadata?.name ?? 'ocs-storagecluster-ceph-rbd';

    planName = utils.generateRandomName('migplan');
  });

  test.afterAll(async ({ apiClient }) => {
    if (planName) {
      await apiClient.deleteMultiNsStorageMigrationPlan(planName, testNs).catch(() => undefined);
    }
  });

  test('CREATE: multi-namespace storage migration plan', async ({ apiClient }) => {
    const spec = buildMultiNsPlanSpec(
      planName,
      testNs,
      dummyVmName,
      'rootdisk',
      dummyPvcName,
      storageClassName,
    );

    const created = await apiClient.createMultiNsStorageMigrationPlan(spec, testNs);
    expect(created, 'Plan creation must return a resource').not.toBeNull();
    expect(created?.kind).toBe('MultiNamespaceVirtualMachineStorageMigrationPlan');
    expect(created?.metadata.name).toBe(planName);
  });

  test('READ: GET single multi-ns plan returns correct spec', async ({ apiClient }) => {
    const plan = await apiClient.getMultiNsStorageMigrationPlan(planName, testNs);
    expect(plan, 'Plan must be retrievable by name').not.toBeNull();
    expect(plan?.kind).toBe('MultiNamespaceVirtualMachineStorageMigrationPlan');
    expect(plan?.metadata.name).toBe(planName);

    const spec = plan?.spec as {
      namespaces?: Array<{
        name?: string;
        retentionPolicy?: string;
        virtualMachines?: Array<{ name?: string }>;
      }>;
    };
    expect(spec.namespaces?.[0]?.retentionPolicy).toBe('keepSource');
    expect(spec.namespaces?.[0]?.virtualMachines?.[0]?.name).toBe(dummyVmName);
  });

  test('READ: plan appears in multi-ns listing (UI endpoint)', async ({ apiClient }) => {
    const list = await apiClient.getStorageMigrationPlans(testNs);
    expect(list.kind).toContain('List');

    const found = list.items.find((p: KubernetesResource) => p.metadata?.name === planName);
    expect(found, `Plan ${planName} must appear in multi-ns list`).toBeDefined();
  });

  test('READ: auto-created child plan exists in namespaced list', async ({ apiClient, utils }) => {
    const childName = `${planName}-${testNs}`;

    await expect
      .poll(
        async () => {
          const list = await apiClient.getNamespacedStorageMigrationPlans(testNs);
          return list.items.find((p: KubernetesResource) => p.metadata?.name === childName);
        },
        {
          timeout: utils.TestTimeouts.TEST_SHORT,
          intervals: [3_000],
          message: `Child plan ${childName} must exist`,
        },
      )
      .toBeDefined();

    const list = await apiClient.getNamespacedStorageMigrationPlans(testNs);
    const found = list.items.find((p: KubernetesResource) => p.metadata?.name === childName);
    expect(found?.kind).toBe('VirtualMachineStorageMigrationPlan');
  });

  test('DELETE: remove multi-ns plan and verify absence', async ({ apiClient }) => {
    const result = await apiClient.deleteMultiNsStorageMigrationPlan(planName, testNs);
    expect(result).not.toBeNull();

    const list = await apiClient.getStorageMigrationPlans(testNs);
    const found = list.items.find((p: KubernetesResource) => p.metadata?.name === planName);
    expect(found, 'Plan must not appear after deletion').toBeUndefined();

    planName = '';
  });
});
