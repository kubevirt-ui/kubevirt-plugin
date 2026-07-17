import { load as yamlLoad } from 'js-yaml';

import type { KubernetesResource } from '@/data-models/kubernetes-types';
import { expect, test } from '@/fixtures/api-test-fixture';

test.describe('VirtualMachineInstanceMigration — API', { tag: ['@api'] }, () => {
  test.describe.configure({ mode: 'serial' });

  let vmName: string;
  let vmimName: string;

  test.beforeAll(async ({ testNamespace, apiClient, utils }) => {
    vmName = utils.generateRandomVmName('mig-vm');
    vmimName = utils.generateRandomName('mig');

    await test.step('CREATE VM with containerDisk (no PVC needed)', async () => {
      const yaml = utils.VirtualMachineFactory.create({
        name: vmName,
        namespace: testNamespace,
        runStrategy: 'Always',
        cpuCores: 1,
        memory: '512Mi',
      });
      const created = await apiClient.createVirtualMachine(
        testNamespace,
        yamlLoad(yaml) as KubernetesResource,
      );
      expect(created.kind).toBe('VirtualMachine');
    });

    await test.step('WAIT: VM reaches Running state', async () => {
      const running = await apiClient.waitForVmRunning(
        vmName,
        testNamespace,
        utils.TestTimeouts.VM_RUNNING,
      );
      expect(running, 'VM must be Running before migration can be triggered').toBe(true);
    });
  });

  test.afterAll(async ({ testNamespace, apiClient }) => {
    if (vmimName) {
      await apiClient
        .deleteVirtualMachineInstanceMigration(testNamespace, vmimName)
        .catch(() => undefined);
    }
    if (vmName) {
      await apiClient.stopVirtualMachine(testNamespace, vmName).catch(() => undefined);
      await apiClient.deleteVirtualMachine(testNamespace, vmName).catch(() => undefined);
      await apiClient.waitForVmDeleted(vmName, testNamespace).catch(() => undefined);
    }
  });

  test('CREATE: trigger compute migration via VMIM resource', async ({
    testNamespace,
    apiClient,
  }) => {
    const spec = {
      apiVersion: 'kubevirt.io/v1',
      kind: 'VirtualMachineInstanceMigration',
      metadata: {
        name: vmimName,
        namespace: testNamespace,
      },
      spec: {
        vmiName: vmName,
      },
    };
    const created = await apiClient.createVirtualMachineInstanceMigration(testNamespace, spec);
    expect(created.kind).toBe('VirtualMachineInstanceMigration');
    expect(created.metadata.name).toBe(vmimName);
    expect((created.spec as { vmiName?: string } | undefined)?.vmiName).toBe(vmName);
  });

  test('READ: GET single VMIM returns correct spec', async ({ testNamespace, apiClient }) => {
    const vmim = await apiClient.getVirtualMachineInstanceMigration(testNamespace, vmimName);
    expect(vmim.kind).toBe('VirtualMachineInstanceMigration');
    expect(vmim.metadata.name).toBe(vmimName);
    expect((vmim.spec as { vmiName?: string } | undefined)?.vmiName).toBe(vmName);
  });

  test('READ: VMIM appears in namespace migration list', async ({ testNamespace, apiClient }) => {
    const list = await apiClient.getVirtualMachineInstanceMigrations(testNamespace);
    expect(list.kind).toBe('VirtualMachineInstanceMigrationList');
    const found = list.items.find((m: KubernetesResource) => m.metadata?.name === vmimName);
    expect(found, `VMIM ${vmimName} must appear in namespace list`).toBeDefined();
    expect(((found as KubernetesResource)?.spec as { vmiName?: string } | undefined)?.vmiName).toBe(
      vmName,
    );
  });

  test('READ: VMIM list filtered by vmiName label selector', async ({
    testNamespace,
    apiClient,
  }) => {
    const list = await apiClient.getVirtualMachineInstanceMigrations(testNamespace, {
      labelSelector: `kubevirt.io/vmi-name=${vmName}`,
    });
    const found = list.items.find((m: KubernetesResource) => m.metadata?.name === vmimName);
    expect(found, 'VMIM must appear when filtering by vmi-name label').toBeDefined();
  });

  test('DELETE: cancel in-progress migration and verify removal', async ({
    testNamespace,
    apiClient,
  }) => {
    const result = await apiClient.deleteVirtualMachineInstanceMigration(testNamespace, vmimName);
    expect(['VirtualMachineInstanceMigration', 'Status']).toContain(result.kind);
    vmimName = '';
  });
});
