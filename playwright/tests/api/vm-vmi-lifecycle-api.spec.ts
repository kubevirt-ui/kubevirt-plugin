import { load as yamlLoad } from 'js-yaml';

import type { KubernetesResource } from '@/data-models/kubernetes-types';
import { expect, test } from '@/fixtures/api-test-fixture';
import { pollUntilVmiGone, pollUntilVmiRunning, pollUntilVmiUidChanged } from '@/utils/api-poll';

interface ProxyVmSpec {
  runStrategy?: string;
  template?: {
    spec?: {
      domain?: {
        cpu?: { cores?: number };
        memory?: { guest?: string };
      };
    };
  };
}

interface VmiGuestSpec {
  domain?: {
    cpu?: { cores?: number };
  };
}

test.describe('VirtualMachine and VMI lifecycle — API', { tag: ['@api'] }, () => {
  test.describe.configure({ mode: 'serial' });

  let vmName: string;

  test.beforeAll(async ({ testNamespace, apiClient, utils }) => {
    vmName = utils.generateRandomVmName('lc-vm');

    const yaml = utils.VirtualMachineFactory.create({
      name: vmName,
      namespace: testNamespace,
      runStrategy: 'Halted',
      cpuCores: 1,
      memory: '512Mi',
      rootDiskImage: utils.REGISTRY_URLS.FEDORA_LATEST,
    });

    await test.step('CREATE: VirtualMachine via console proxy (Halted)', async () => {
      const created = await apiClient.createVirtualMachine(
        testNamespace,
        yamlLoad(yaml) as KubernetesResource,
      );
      expect(created.kind).toBe('VirtualMachine');
      expect(created.metadata.name).toBe(vmName);
    });

    await test.step('WAIT: VM exists in cluster', async () => {
      const exists = await apiClient.waitForVmExists(vmName, testNamespace);
      expect(exists).toBe(true);
    });
  });

  test.afterAll(async ({ testNamespace, apiClient }) => {
    if (vmName) {
      await apiClient.stopVirtualMachine(testNamespace, vmName).catch(() => undefined);
      await apiClient.deleteVirtualMachine(testNamespace, vmName).catch(() => undefined);
    }
  });

  test('READ: GET VM returns correct initial spec', async ({ testNamespace, apiClient }) => {
    const vm = await apiClient.getVirtualMachine(testNamespace, vmName);
    expect(vm.kind).toBe('VirtualMachine');
    expect(vm.metadata.name).toBe(vmName);
    expect((vm.spec as ProxyVmSpec | undefined)?.runStrategy).toBe('Halted');
    expect((vm.spec as ProxyVmSpec | undefined)?.template?.spec?.domain?.cpu?.cores).toBe(1);
    expect((vm.spec as ProxyVmSpec | undefined)?.template?.spec?.domain?.memory?.guest).toBe(
      '512Mi',
    );
  });

  test('PATCH: add label to VM while halted', async ({ testNamespace, apiClient }) => {
    await apiClient.patchVirtualMachine(testNamespace, vmName, [
      { op: 'add', path: '/metadata/labels/api-test', value: 'halted-patch' },
    ]);
    const updated = await apiClient.getVirtualMachine(testNamespace, vmName);
    expect(updated.metadata.labels?.['api-test']).toBe('halted-patch');
  });

  test('PATCH: update CPU cores while halted', async ({ testNamespace, apiClient }) => {
    await apiClient.patchVirtualMachine(testNamespace, vmName, [
      { op: 'replace', path: '/spec/template/spec/domain/cpu/cores', value: 2 },
    ]);
    const updated = await apiClient.getVirtualMachine(testNamespace, vmName);
    expect((updated.spec as ProxyVmSpec | undefined)?.template?.spec?.domain?.cpu?.cores).toBe(2);
  });

  test('START: call start subresource and wait for Running', async ({
    testNamespace,
    apiClient,
    utils,
  }) => {
    await apiClient.startVirtualMachine(testNamespace, vmName);
    const running = await apiClient.waitForVmRunning(
      vmName,
      testNamespace,
      utils.TestTimeouts.VM_BOOTUP,
    );
    expect(running).toBe(true);
    await pollUntilVmiRunning(apiClient, testNamespace, vmName, utils.TestTimeouts.VM_BOOTUP);
  });

  test('READ VMI: exists in namespace after start', async ({ testNamespace, apiClient }) => {
    const list = await apiClient.getVirtualMachineInstances(testNamespace);
    const vmi = list.items.find((v: KubernetesResource) => v.metadata?.name === vmName);
    expect(vmi, `VMI ${vmName} must be present in namespace`).toBeDefined();
    expect(vmi.status?.phase).toBe('Running');
  });

  test('READ VMI: GET single VMI returns Running phase', async ({ testNamespace, apiClient }) => {
    const vmi = await apiClient.getVirtualMachineInstance(testNamespace, vmName);
    expect(vmi.kind).toBe('VirtualMachineInstance');
    expect(vmi.metadata.name).toBe(vmName);
    expect(vmi.status?.phase).toBe('Running');
  });

  test('READ VMI: has owner reference pointing to VM', async ({ testNamespace, apiClient }) => {
    const vmi = await apiClient.getVirtualMachineInstance(testNamespace, vmName);
    const ownerRef = vmi.metadata?.ownerReferences?.find((ref) => ref.kind === 'VirtualMachine');
    expect(ownerRef, 'VMI must have ownerReference to its VM').toBeDefined();
    expect(ownerRef.name).toBe(vmName);
  });

  test('READ VMI: inherits CPU cores patched on VM', async ({ testNamespace, apiClient }) => {
    const vmi = await apiClient.getVirtualMachineInstance(testNamespace, vmName);
    expect((vmi.spec as VmiGuestSpec | undefined)?.domain?.cpu?.cores).toBe(2);
  });

  test('PATCH: update VM annotation while running', async ({ testNamespace, apiClient }) => {
    await apiClient.patchVirtualMachine(testNamespace, vmName, [
      {
        op: 'add',
        path: '/metadata/annotations/api-test-running',
        value: 'patched-while-running',
      },
    ]);
    const updated = await apiClient.getVirtualMachine(testNamespace, vmName);
    expect(updated.metadata.annotations?.['api-test-running']).toBe('patched-while-running');
  });

  test('RESTART: call restart subresource and wait for Running again', async ({
    testNamespace,
    apiClient,
    utils,
  }) => {
    const vmiBefore = await apiClient.getVirtualMachineInstance(testNamespace, vmName);
    const oldUid = vmiBefore.metadata?.uid;

    await apiClient.restartVirtualMachine(testNamespace, vmName);

    await pollUntilVmiUidChanged(
      apiClient,
      testNamespace,
      vmName,
      oldUid,
      utils.TestTimeouts.VM_BOOTUP,
    );
    const running = await apiClient.waitForVmRunning(
      vmName,
      testNamespace,
      utils.TestTimeouts.VM_BOOTUP,
    );
    expect(running).toBe(true);
    await pollUntilVmiRunning(apiClient, testNamespace, vmName, utils.TestTimeouts.VM_BOOTUP);
  });

  test('READ VMI: still Running after restart', async ({ testNamespace, apiClient }) => {
    const vmi = await apiClient.getVirtualMachineInstance(testNamespace, vmName);
    expect(vmi.status?.phase).toBe('Running');
  });

  test('STOP: stop VM and confirm VMI is removed', async ({ testNamespace, apiClient, utils }) => {
    await apiClient.stopVirtualMachine(testNamespace, vmName);
    await pollUntilVmiGone(apiClient, testNamespace, vmName, utils.TestTimeouts.TEST_VM_CREATION);

    const list = await apiClient.getVirtualMachineInstances(testNamespace);
    const vmi = list.items.find((v: KubernetesResource) => v.metadata?.name === vmName);
    expect(vmi, `VMI ${vmName} must be gone after stop`).toBeUndefined();
  });

  test('STOP: VM status shows Halted after stop', async ({ testNamespace, apiClient, utils }) => {
    await expect
      .poll(
        async () => {
          const vm = await apiClient.getVirtualMachine(testNamespace, vmName);
          return (vm?.spec as ProxyVmSpec | undefined)?.runStrategy;
        },
        { timeout: utils.TestTimeouts.TEST_SHORT, intervals: [3_000] },
      )
      .toBe('Halted');
  });

  test('DELETE: remove VM via API and wait for deletion', async ({ testNamespace, apiClient }) => {
    const result = await apiClient.deleteVirtualMachine(testNamespace, vmName);
    expect(['VirtualMachine', 'Status']).toContain(result.kind);

    const deleted = await apiClient.waitForVmDeleted(vmName, testNamespace);
    expect(deleted).toBe(true);

    vmName = '';
  });
});
