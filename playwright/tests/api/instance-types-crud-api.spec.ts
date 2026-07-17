import { load as yamlLoad } from 'js-yaml';

import type { KubernetesResource } from '@/data-models/kubernetes-types';
import { expect, test } from '@/fixtures/api-test-fixture';

test.describe('VirtualMachineInstanceType CRUD — API', { tag: ['@api'] }, () => {
  let instanceTypeName: string;
  let clusterInstanceTypeName: string;

  test.beforeAll(async ({ testNamespace, apiClient, utils }) => {
    instanceTypeName = utils.generateRandomInstanceTypeName('test');
    clusterInstanceTypeName = utils.generateRandomInstanceTypeName('cluster-test');

    await test.step('CREATE VirtualMachineInstanceType (namespaced) via API', async () => {
      const yaml = utils.InstanceTypeFactory.createNamespaced(
        instanceTypeName,
        testNamespace,
        1,
        '512Mi',
      );
      const created = await apiClient.createVirtualMachineInstanceType(
        testNamespace,
        yamlLoad(yaml) as KubernetesResource,
      );
      expect(created.kind).toBe('VirtualMachineInstancetype');
      expect(created.metadata.name).toBe(instanceTypeName);
    });

    await test.step('CREATE VirtualMachineClusterInstancetype via API', async () => {
      const yaml = utils.InstanceTypeFactory.createClusterScoped(
        clusterInstanceTypeName,
        1,
        '512Mi',
      );
      const created = await apiClient.createVirtualMachineClusterInstanceType(
        yamlLoad(yaml) as KubernetesResource,
      );
      expect(created.kind).toBe('VirtualMachineClusterInstancetype');
      expect(created.metadata.name).toBe(clusterInstanceTypeName);
    });
  });

  test.afterAll(async ({ testNamespace, apiClient }) => {
    if (instanceTypeName) {
      await apiClient
        .deleteVirtualMachineInstanceType(testNamespace, instanceTypeName)
        .catch(() => undefined);
    }
    if (clusterInstanceTypeName) {
      await apiClient
        .deleteVirtualMachineClusterInstanceType(clusterInstanceTypeName)
        .catch(() => undefined);
    }
  });

  test('READ: GET instance types in namespace includes created type', async ({
    testNamespace,
    apiClient,
  }) => {
    const list = await apiClient.getVirtualMachineInstanceTypes(testNamespace);
    expect(list.kind).toBe('VirtualMachineInstancetypeList');
    const found = list.items.find(
      (it: KubernetesResource) => it.metadata?.name === instanceTypeName,
    );
    expect(found, `instance type ${instanceTypeName} must appear in list`).toBeDefined();
    const spec = (found as KubernetesResource).spec as {
      cpu?: { guest?: number };
      memory?: { guest?: string };
    };
    expect(spec.cpu?.guest).toBe(1);
    expect(spec.memory?.guest).toBe('512Mi');
  });

  test('READ: GET cluster instance types list is non-empty', async ({ apiClient }) => {
    const list = await apiClient.getVirtualMachineClusterInstanceTypes();
    expect(list.kind).toBe('VirtualMachineClusterInstancetypeList');
    expect(list.items.length, 'built-in cluster instance types must exist').toBeGreaterThan(0);
  });

  test('PATCH: update CPU guest count via JSON Patch', async ({ testNamespace, apiClient }) => {
    await apiClient.patchResource(
      'instancetype.kubevirt.io',
      'v1beta1',
      'virtualmachineinstancetypes',
      instanceTypeName,
      [{ op: 'replace', path: '/spec/cpu/guest', value: 2 }],
      testNamespace,
    );

    const list = await apiClient.getVirtualMachineInstanceTypes(testNamespace);
    const updated = list.items.find(
      (it: KubernetesResource) => it.metadata?.name === instanceTypeName,
    );
    expect((updated?.spec as { cpu?: { guest?: number } })?.cpu?.guest).toBe(2);
  });

  test('DELETE: remove namespaced instance type via API', async ({ testNamespace, apiClient }) => {
    await apiClient.deleteVirtualMachineInstanceType(testNamespace, instanceTypeName);

    const list = await apiClient.getVirtualMachineInstanceTypes(testNamespace);
    const found = list.items.find(
      (it: KubernetesResource) => it.metadata?.name === instanceTypeName,
    );
    expect(
      found,
      'namespaced instance type must no longer appear in list after deletion',
    ).toBeUndefined();

    instanceTypeName = '';
  });

  test('DELETE: remove cluster instance type via API', async ({ apiClient }) => {
    await apiClient.deleteVirtualMachineClusterInstanceType(clusterInstanceTypeName);

    const list = await apiClient.getVirtualMachineClusterInstanceTypes();
    const found = list.items.find(
      (it: KubernetesResource) => it.metadata?.name === clusterInstanceTypeName,
    );
    expect(
      found,
      'cluster instance type must no longer appear in list after deletion',
    ).toBeUndefined();

    clusterInstanceTypeName = '';
  });
});
