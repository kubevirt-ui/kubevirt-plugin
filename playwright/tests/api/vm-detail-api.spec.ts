import { load as yamlLoad } from 'js-yaml';

import type { KubernetesResource } from '@/data-models/kubernetes-types';
import { expect, test } from '@/fixtures/api-test-fixture';
import { assertList } from '@/utils/api-assertions';

test.describe('VM detail page — API endpoints', { tag: ['@api'] }, () => {
  test.describe.configure({ mode: 'serial' });

  let vmName: string;

  test.beforeAll(async ({ testNamespace, apiClient, utils }) => {
    vmName = utils.generateRandomVmName('detail-vm');

    const yaml = utils.VirtualMachineFactory.create({
      name: vmName,
      namespace: testNamespace,
      runStrategy: 'Always',
      cpuCores: 1,
      memory: '512Mi',
      rootDiskImage: utils.REGISTRY_URLS.FEDORA_LATEST,
    });

    await test.step('CREATE: VirtualMachine via console proxy', async () => {
      const created = await apiClient.createVirtualMachine(
        testNamespace,
        yamlLoad(yaml) as KubernetesResource,
      );
      expect(created.kind).toBe('VirtualMachine');
      expect(created.metadata?.name).toBe(vmName);
    });

    await test.step('WAIT: VM reaches Running state', async () => {
      const running = await apiClient.waitForVmRunning(
        vmName,
        testNamespace,
        utils.TestTimeouts.VM_RUNNING,
      );
      expect(running, `VM ${vmName} did not reach Running within timeout`).toBe(true);
    });
  });

  test.afterAll(async ({ testNamespace, apiClient }) => {
    if (vmName) {
      await apiClient.stopVirtualMachine(testNamespace, vmName).catch(() => undefined);
      await apiClient.deleteVirtualMachine(testNamespace, vmName).catch(() => undefined);
    }
  });

  test('GET VirtualMachines (ns-scoped) returns list', async ({ apiClient, testNamespace }) => {
    const body = await apiClient.getVirtualMachines(testNamespace);
    assertList(body, 'VirtualMachineList');
  });

  test('GET single VirtualMachine returns correct object', async ({ apiClient, testNamespace }) => {
    const body = await apiClient.getVirtualMachine(testNamespace, vmName);
    expect(body.kind, 'kind must be VirtualMachine').toBe('VirtualMachine');
    expect(body.metadata?.name, 'name must match').toBe(vmName);
    expect(body.spec, 'spec must be present').toBeDefined();
    expect(body.spec?.runStrategy, 'runStrategy must be Always').toBe('Always');
  });

  test('GET VirtualMachineInstanceMigrations filtered by VM name returns list', async ({
    apiClient,
    testNamespace,
  }) => {
    const body = await apiClient.getVirtualMachineInstanceMigrations(testNamespace, {
      labelSelector: `kubevirt.io/vmi-name=${vmName}`,
    });
    assertList(body, 'VirtualMachineInstanceMigrationList');
  });

  test('GET VirtualMachineSnapshots (ns-scoped) returns list', async ({
    apiClient,
    testNamespace,
  }) => {
    const body = await apiClient.getVirtualMachineSnapshots(testNamespace);
    assertList(body, 'VirtualMachineSnapshotList');
  });

  test('GET VirtualMachineRestores (ns-scoped) returns list', async ({
    apiClient,
    testNamespace,
  }) => {
    const body = await apiClient.getVirtualMachineRestores(testNamespace);
    assertList(body, 'VirtualMachineRestoreList');
  });

  test('GET NetworkAttachmentDefinitions (ns-scoped) returns list', async ({
    apiClient,
    testNamespace,
  }) => {
    const body = await apiClient.getNetworkAttachmentDefinitions(testNamespace);
    assertList(body, 'NetworkAttachmentDefinitionList');
  });

  test('GET CDI config singleton is readable', async ({ apiClient }) => {
    const body = await apiClient.getCdiConfig();
    expect(body.kind, 'kind must be CDIConfig').toBe('CDIConfig');
    expect(body.metadata?.name, 'name must be config').toBe('config');
  });

  test('GET storage migration plans (ns-scoped) returns list', async ({
    apiClient,
    testNamespace,
  }) => {
    const body = await apiClient.getStorageMigrationPlans(testNamespace);
    assertList(body, 'MultiNamespaceVirtualMachineStorageMigrationPlanList');
  });
});
