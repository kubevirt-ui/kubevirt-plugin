import { load as yamlLoad } from 'js-yaml';

import type { KubernetesResource } from '@/data-models/kubernetes-types';
import { expect, test } from '@/fixtures/api-test-fixture';
import { FOLDER_LABEL, listVmsInFolder } from '@/utils/api-builders';

test.describe('VM folders — single folder CRUD API', { tag: ['@api'] }, () => {
  test.describe.configure({ mode: 'serial' });

  let vm1Name: string;
  let vm2Name: string;
  let folderA: string;
  let folderB: string;

  test.beforeAll(async ({ testNamespace, apiClient, utils }) => {
    folderA = utils.generateRandomFolderName('folder-a');
    folderB = utils.generateRandomFolderName('folder-b');
    vm1Name = utils.generateRandomVmName('folder-f1');
    vm2Name = utils.generateRandomVmName('folder-f2');

    for (const [vmName] of [[vm1Name], [vm2Name]]) {
      const yaml = utils.VirtualMachineFactory.create({
        name: vmName,
        namespace: testNamespace,
        runStrategy: 'Halted',
        cpuCores: 1,
        memory: '256Mi',
      });
      const payload = yamlLoad(yaml) as KubernetesResource;
      payload.metadata = {
        ...(payload.metadata ?? {}),
        labels: {
          ...(payload.metadata?.labels ?? {}),
          [FOLDER_LABEL]: folderA,
        },
      };
      await test.step(`CREATE ${vmName} in folder "${folderA}"`, async () => {
        const created = await apiClient.createVirtualMachine(testNamespace, payload);
        expect(created.kind).toBe('VirtualMachine');
      });
      await apiClient.waitForVmExists(vmName, testNamespace);
    }
  });

  test.afterAll(async ({ testNamespace, apiClient }) => {
    for (const name of [vm1Name, vm2Name]) {
      if (name) {
        await apiClient.deleteVirtualMachine(testNamespace, name).catch(() => undefined);
        await apiClient.waitForVmDeleted(name, testNamespace).catch(() => undefined);
      }
    }
  });

  test('READ: both VMs appear when listing by folder label', async ({
    testNamespace,
    apiClient,
  }) => {
    const vms = await listVmsInFolder(apiClient, testNamespace, folderA);
    const names = vms.map((v) => v.metadata.name);
    expect(names).toContain(vm1Name);
    expect(names).toContain(vm2Name);
  });

  test('PATCH: move VM1 to a new folder (mirrors folder rename/move in UI)', async ({
    testNamespace,
    apiClient,
  }) => {
    await apiClient.patchVirtualMachine(testNamespace, vm1Name, [
      {
        op: 'add',
        path: `/metadata/labels/${FOLDER_LABEL.replace(/\//g, '~1')}`,
        value: folderB,
      },
    ]);
    const updated = await apiClient.getVirtualMachine(testNamespace, vm1Name);
    expect(updated.metadata.labels?.[FOLDER_LABEL]).toBe(folderB);
  });

  test('READ: VM1 no longer in folder A after move', async ({ testNamespace, apiClient }) => {
    const vmsInA = await listVmsInFolder(apiClient, testNamespace, folderA);
    const names = vmsInA.map((v) => v.metadata.name);
    expect(names, `${vm1Name} must not be in folder A after move`).not.toContain(vm1Name);
  });

  test('READ: VM2 still in folder A after VM1 move', async ({ testNamespace, apiClient }) => {
    const vmsInA = await listVmsInFolder(apiClient, testNamespace, folderA);
    const names = vmsInA.map((v) => v.metadata.name);
    expect(names, `${vm2Name} must remain in folder A`).toContain(vm2Name);
  });

  test('READ: VM1 now in folder B', async ({ testNamespace, apiClient }) => {
    const vmsInB = await listVmsInFolder(apiClient, testNamespace, folderB);
    const names = vmsInB.map((v) => v.metadata.name);
    expect(names).toContain(vm1Name);
  });

  test('PATCH: remove folder label from VM2 (mirrors "remove from folder")', async ({
    testNamespace,
    apiClient,
  }) => {
    await apiClient.patchVirtualMachine(testNamespace, vm2Name, [
      { op: 'remove', path: `/metadata/labels/${FOLDER_LABEL.replace(/\//g, '~1')}` },
    ]);
    const updated = await apiClient.getVirtualMachine(testNamespace, vm2Name);
    expect(updated.metadata.labels?.[FOLDER_LABEL]).toBeUndefined();
  });

  test('READ: folder A is now empty (mirrors "delete folder")', async ({
    testNamespace,
    apiClient,
  }) => {
    const vms = await listVmsInFolder(apiClient, testNamespace, folderA);
    expect(vms.length, `folder "${folderA}" must have 0 VMs after removing all members`).toBe(0);
  });
});

test.describe('VM folders — multi-folder bulk operations API', { tag: ['@api'] }, () => {
  test.describe.configure({ mode: 'serial' });

  let vmNames: string[];
  let folderX: string;
  let folderY: string;

  test.beforeAll(async ({ testNamespace, apiClient, utils }) => {
    folderX = utils.generateRandomFolderName('folder-x');
    folderY = utils.generateRandomFolderName('folder-y');
    vmNames = [
      utils.generateRandomVmName('folder-mx0'),
      utils.generateRandomVmName('folder-mx1'),
      utils.generateRandomVmName('folder-my2'),
    ];
    const folderAssignments = [folderX, folderX, folderY];

    for (let i = 0; i < vmNames.length; i++) {
      const yaml = utils.VirtualMachineFactory.create({
        name: vmNames[i],
        namespace: testNamespace,
        runStrategy: 'Halted',
        cpuCores: 1,
        memory: '256Mi',
      });
      const payload = yamlLoad(yaml) as KubernetesResource;
      payload.metadata = {
        ...(payload.metadata ?? {}),
        labels: {
          ...(payload.metadata?.labels ?? {}),
          [FOLDER_LABEL]: folderAssignments[i],
        },
      };
      await test.step(`CREATE ${vmNames[i]} in folder "${folderAssignments[i]}"`, async () => {
        const created = await apiClient.createVirtualMachine(testNamespace, payload);
        expect(created.kind).toBe('VirtualMachine');
      });
      await apiClient.waitForVmExists(vmNames[i], testNamespace);
    }
  });

  test.afterAll(async ({ testNamespace, apiClient }) => {
    for (const name of vmNames ?? []) {
      await apiClient.deleteVirtualMachine(testNamespace, name).catch(() => undefined);
      await apiClient.waitForVmDeleted(name, testNamespace).catch(() => undefined);
    }
  });

  test('READ: folder X has 2 VMs, folder Y has 1 VM', async ({ testNamespace, apiClient }) => {
    const [xVms, yVms] = await Promise.all([
      listVmsInFolder(apiClient, testNamespace, folderX),
      listVmsInFolder(apiClient, testNamespace, folderY),
    ]);
    expect(xVms.length, 'folder X must have 2 VMs').toBe(2);
    expect(yVms.length, 'folder Y must have 1 VM').toBe(1);
  });

  test('PATCH: bulk-move folder-X VMs to folder-Y (mirrors bulk folder action)', async ({
    testNamespace,
    apiClient,
  }) => {
    const xVms = await listVmsInFolder(apiClient, testNamespace, folderX);
    await Promise.all(
      xVms.map((vm) =>
        apiClient.patchVirtualMachine(testNamespace, vm.metadata.name, [
          {
            op: 'add',
            path: `/metadata/labels/${FOLDER_LABEL.replace(/\//g, '~1')}`,
            value: folderY,
          },
        ]),
      ),
    );
  });

  test('READ: folder X is empty after bulk move', async ({ testNamespace, apiClient }) => {
    const vms = await listVmsInFolder(apiClient, testNamespace, folderX);
    expect(vms.length, 'folder X must be empty after bulk move').toBe(0);
  });

  test('READ: folder Y has all 3 VMs after bulk move', async ({ testNamespace, apiClient }) => {
    const vms = await listVmsInFolder(apiClient, testNamespace, folderY);
    expect(vms.length, 'folder Y must have all 3 VMs after bulk move').toBe(3);
    const names = vms.map((v) => v.metadata.name);
    for (const n of vmNames) {
      expect(names).toContain(n);
    }
  });
});
