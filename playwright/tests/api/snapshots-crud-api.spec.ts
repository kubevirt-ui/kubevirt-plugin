import { load as yamlLoad } from 'js-yaml';

import type { KubernetesResource } from '@/data-models/kubernetes-types';
import { expect, test } from '@/fixtures/api-test-fixture';

test.describe('VirtualMachineSnapshot CRUD — API', { tag: ['@api'] }, () => {
  let vmName: string;
  let snapshotName: string;

  test.beforeAll(async ({ testNamespace, apiClient, utils }) => {
    vmName = utils.generateRandomVmName('test-snap-vm');
    snapshotName = utils.generateRandomSnapshotName('test-snap');

    await test.step('CREATE backing VirtualMachine', async () => {
      const vmYaml = utils.VirtualMachineFactory.create({
        name: vmName,
        namespace: testNamespace,
        runStrategy: 'Halted',
        cpuCores: 1,
        memory: '512Mi',
      });
      const created = await apiClient.createVirtualMachine(
        testNamespace,
        yamlLoad(vmYaml) as KubernetesResource,
      );
      expect(created.kind).toBe('VirtualMachine');
    });

    await test.step('WAIT: VM exists before snapshotting', async () => {
      const ready = await apiClient.waitForVmExists(vmName, testNamespace);
      expect(ready, 'VM must exist before snapshot can be taken').toBe(true);
    });

    await test.step('CREATE VirtualMachineSnapshot via console proxy', async () => {
      const snapYaml = utils.createMinimalVirtualMachineSnapshotYaml({
        name: snapshotName,
        namespace: testNamespace,
        vmName,
      });
      const created = await apiClient.createVirtualMachineSnapshot(
        testNamespace,
        yamlLoad(snapYaml) as KubernetesResource,
      );
      expect(created.kind).toBe('VirtualMachineSnapshot');
      expect(created.metadata.name).toBe(snapshotName);
    });

    await test.step('WAIT: snapshot reaches Ready state', async () => {
      const ready = await apiClient.waitForSnapshotReady(snapshotName, testNamespace);
      expect(ready, 'snapshot must reach Ready=true before assertions').toBe(true);
    });
  });

  test.afterAll(async ({ testNamespace, apiClient }) => {
    if (snapshotName) {
      await apiClient
        .deleteVirtualMachineSnapshot(testNamespace, snapshotName)
        .catch(() => undefined);
    }
    if (vmName) {
      await apiClient.deleteVirtualMachine(testNamespace, vmName).catch(() => undefined);
      await apiClient.waitForVmDeleted(vmName, testNamespace).catch(() => undefined);
    }
  });

  test('READ: snapshot appears in namespace snapshot list', async ({
    testNamespace,
    apiClient,
  }) => {
    const list = await apiClient.getVirtualMachineSnapshots(testNamespace);
    expect(list.kind).toBe('VirtualMachineSnapshotList');
    const found = list.items.find((s: KubernetesResource) => s.metadata?.name === snapshotName);
    expect(found, `snapshot ${snapshotName} must appear in list`).toBeDefined();
    expect(
      ((found as KubernetesResource)?.spec as { source?: { name?: string } } | undefined)?.source
        ?.name,
    ).toBe(vmName);
  });

  test('DELETE: remove snapshot via API', async ({ testNamespace, apiClient }) => {
    await apiClient.deleteVirtualMachineSnapshot(testNamespace, snapshotName);

    const list = await apiClient.getVirtualMachineSnapshots(testNamespace);
    const found = list.items.find((s: KubernetesResource) => s.metadata?.name === snapshotName);
    expect(found, 'snapshot must no longer appear in list after deletion').toBeUndefined();

    snapshotName = '';
  });
});
