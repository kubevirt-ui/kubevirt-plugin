import { load as yamlLoad } from 'js-yaml';

import type { KubernetesResource } from '@/data-models/kubernetes-types';
import { expect, test } from '@/fixtures/api-test-fixture';
import {
  pollUntilRestoreComplete,
  pollUntilRestoreDeleted,
  pollUntilSnapshotDeleted,
  pollUntilSnapshotReady,
} from '@/utils/api-poll';

interface SnapshotSourceRef {
  apiGroup?: string;
  kind?: string;
  name?: string;
}

test.describe('VirtualMachineSnapshot — full lifecycle API', { tag: ['@api'] }, () => {
  test.describe.configure({ mode: 'serial' });

  let vmName: string;
  let snapshotName: string;
  let restoreName: string;

  test.beforeAll(async ({ testNamespace, apiClient, utils }) => {
    vmName = utils.generateRandomVmName('snap-vm-lc');
    snapshotName = utils.generateRandomSnapshotName('snap-lc');
    restoreName = utils.generateRandomName('restore-lc');

    await test.step('CREATE halted VM (containerDisk, no PVC)', async () => {
      const yaml = utils.VirtualMachineFactory.create({
        name: vmName,
        namespace: testNamespace,
        runStrategy: 'Halted',
        cpuCores: 1,
        memory: '512Mi',
      });
      const created = await apiClient.createVirtualMachine(
        testNamespace,
        yamlLoad(yaml) as KubernetesResource,
      );
      expect(created.kind).toBe('VirtualMachine');
    });

    await test.step('WAIT: VM exists before snapshotting', async () => {
      const ready = await apiClient.waitForVmExists(vmName, testNamespace);
      expect(ready, 'VM must exist before snapshot').toBe(true);
    });

    await test.step('CREATE snapshot via console proxy', async () => {
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
    });

    await test.step('WAIT: snapshot reaches readyToUse=true', async () => {
      await pollUntilSnapshotReady(
        apiClient,
        testNamespace,
        snapshotName,
        utils.TestTimeouts.TEST_MEDIUM,
      );
    });
  });

  test.afterAll(async ({ testNamespace, apiClient }) => {
    if (restoreName) {
      await apiClient
        .deleteVirtualMachineRestore(testNamespace, restoreName)
        .catch(() => undefined);
    }
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

  test('READ: GET single snapshot returns correct spec', async ({ testNamespace, apiClient }) => {
    const snap = await apiClient.getVirtualMachineSnapshot(testNamespace, snapshotName);
    expect(snap.kind).toBe('VirtualMachineSnapshot');
    expect(snap.metadata.name).toBe(snapshotName);
    expect((snap.spec as { source?: { name?: string } } | undefined)?.source?.name).toBe(vmName);
    expect(snap.status?.readyToUse).toBe(true);
  });

  test('READ: snapshot appears in namespace list', async ({ testNamespace, apiClient }) => {
    const list = await apiClient.getVirtualMachineSnapshots(testNamespace);
    expect(list.kind).toBe('VirtualMachineSnapshotList');
    const found = list.items.find((s: KubernetesResource) => s.metadata?.name === snapshotName);
    expect(found, `snapshot ${snapshotName} must appear in list`).toBeDefined();
  });

  test('PATCH: add label to snapshot metadata via merge-patch', async ({
    testNamespace,
    apiClient,
  }) => {
    await apiClient.mergePatchResource(
      'snapshot.kubevirt.io',
      'v1beta1',
      'virtualmachinesnapshots',
      snapshotName,
      { metadata: { labels: { 'api-test': 'snap-lifecycle' } } },
      testNamespace,
    );
    const updated = await apiClient.getVirtualMachineSnapshot(testNamespace, snapshotName);
    expect(updated.metadata.labels?.['api-test']).toBe('snap-lifecycle');
  });

  test('CREATE restore: restore VM from snapshot', async ({ testNamespace, apiClient }) => {
    const spec = {
      apiVersion: 'snapshot.kubevirt.io/v1beta1',
      kind: 'VirtualMachineRestore',
      metadata: {
        name: restoreName,
        namespace: testNamespace,
      },
      spec: {
        target: {
          apiGroup: 'kubevirt.io',
          kind: 'VirtualMachine',
          name: vmName,
        },
        virtualMachineSnapshotName: snapshotName,
      },
    };
    const created = await apiClient.createVirtualMachineRestore(testNamespace, spec);
    expect(created.kind).toBe('VirtualMachineRestore');
    expect(created.metadata.name).toBe(restoreName);
    expect(created.spec.virtualMachineSnapshotName).toBe(snapshotName);
  });

  test('WAIT + READ: restore completes and GET single returns correct state', async ({
    testNamespace,
    apiClient,
    utils,
  }) => {
    await pollUntilRestoreComplete(
      apiClient,
      testNamespace,
      restoreName,
      utils.TestTimeouts.TEST_MEDIUM,
    );

    const restore = await apiClient.getVirtualMachineRestore(testNamespace, restoreName);
    expect(restore.kind).toBe('VirtualMachineRestore');
    expect(restore.status?.complete).toBe(true);
    expect(restore.spec.virtualMachineSnapshotName).toBe(snapshotName);
  });

  test('READ: restore appears in namespace restore list', async ({ testNamespace, apiClient }) => {
    const list = await apiClient.getVirtualMachineRestores(testNamespace);
    expect(list.kind).toBe('VirtualMachineRestoreList');
    const found = list.items.find((r: KubernetesResource) => r.metadata?.name === restoreName);
    expect(found, `restore ${restoreName} must appear in list`).toBeDefined();
  });

  test('DELETE restore: remove restore and confirm it leaves the list', async ({
    testNamespace,
    apiClient,
    utils,
  }) => {
    const result = await apiClient.deleteVirtualMachineRestore(testNamespace, restoreName);
    expect(['VirtualMachineRestore', 'Status']).toContain(result.kind);

    await pollUntilRestoreDeleted(
      apiClient,
      testNamespace,
      restoreName,
      utils.TestTimeouts.TEST_SHORT,
    );

    const list = await apiClient.getVirtualMachineRestores(testNamespace);
    const found = list.items.find((r: KubernetesResource) => r.metadata?.name === restoreName);
    expect(found, 'restore must not appear in list after deletion').toBeUndefined();
    restoreName = '';
  });

  test('DELETE snapshot: remove snapshot and confirm it leaves the list', async ({
    testNamespace,
    apiClient,
    utils,
  }) => {
    const result = await apiClient.deleteVirtualMachineSnapshot(testNamespace, snapshotName);
    expect(['VirtualMachineSnapshot', 'Status']).toContain(result.kind);

    await pollUntilSnapshotDeleted(
      apiClient,
      testNamespace,
      snapshotName,
      utils.TestTimeouts.TEST_SHORT,
    );

    const list = await apiClient.getVirtualMachineSnapshots(testNamespace);
    const found = list.items.find((s: KubernetesResource) => s.metadata?.name === snapshotName);
    expect(found, 'snapshot must not appear in list after deletion').toBeUndefined();
    snapshotName = '';
  });
});

test.describe('VirtualMachineSnapshot — metadata API', { tag: ['@api'] }, () => {
  let vmName: string;
  let snapshotName: string;

  test.beforeAll(async ({ testNamespace, apiClient, utils }) => {
    vmName = utils.generateRandomVmName('snap-vm-md');
    snapshotName = utils.generateRandomSnapshotName('snap-md');

    const yaml = utils.VirtualMachineFactory.create({
      name: vmName,
      namespace: testNamespace,
      runStrategy: 'Halted',
      cpuCores: 1,
      memory: '512Mi',
    });
    await test.step('CREATE VM', async () => {
      const created = await apiClient.createVirtualMachine(
        testNamespace,
        yamlLoad(yaml) as KubernetesResource,
      );
      expect(created.kind).toBe('VirtualMachine');
    });
    await test.step('WAIT: VM exists', async () => {
      await apiClient.waitForVmExists(vmName, testNamespace);
    });
    await test.step('CREATE snapshot', async () => {
      const snapYaml = utils.createMinimalVirtualMachineSnapshotYaml({
        name: snapshotName,
        namespace: testNamespace,
        vmName,
      });
      await apiClient.createVirtualMachineSnapshot(
        testNamespace,
        yamlLoad(snapYaml) as KubernetesResource,
      );
    });
    await test.step('WAIT: snapshot readyToUse', async () => {
      await pollUntilSnapshotReady(
        apiClient,
        testNamespace,
        snapshotName,
        utils.TestTimeouts.TEST_MEDIUM,
      );
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

  test('READ: snapshot spec references correct VM', async ({ testNamespace, apiClient }) => {
    const snap = await apiClient.getVirtualMachineSnapshot(testNamespace, snapshotName);
    const source = (snap.spec as { source?: SnapshotSourceRef } | undefined)?.source;
    expect(source?.apiGroup).toBe('kubevirt.io');
    expect(source?.kind).toBe('VirtualMachine');
    expect(source?.name).toBe(vmName);
  });

  test('READ: snapshot status has readyToUse and creationTime', async ({
    testNamespace,
    apiClient,
  }) => {
    const snap = await apiClient.getVirtualMachineSnapshot(testNamespace, snapshotName);
    expect(snap.status?.readyToUse).toBe(true);
    expect(snap.status?.creationTime, 'snapshot must have a creationTime').toBeTruthy();
  });
});
