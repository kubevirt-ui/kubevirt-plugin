import { load as yamlLoad } from 'js-yaml';

import type { KubernetesResource } from '@/data-models/kubernetes-types';
import { expect, test } from '@/fixtures/api-test-fixture';

test.describe('VirtualMachine CRUD — API', { tag: ['@api'] }, () => {
  let vmName: string;

  test.beforeAll(async ({ testNamespace, apiClient, utils }) => {
    vmName = utils.generateRandomVmName('test-vm');

    const yaml = utils.VirtualMachineFactory.create({
      name: vmName,
      namespace: testNamespace,
      runStrategy: 'Halted',
      cpuCores: 1,
      memory: '512Mi',
    });

    await test.step('CREATE VirtualMachine via console proxy', async () => {
      const created = await apiClient.createVirtualMachine(
        testNamespace,
        yamlLoad(yaml) as KubernetesResource,
      );
      expect(created.metadata.name).toBe(vmName);
      expect(created.kind).toBe('VirtualMachine');
    });

    await test.step('WAIT: VM exists in cluster', async () => {
      const ready = await apiClient.waitForVmExists(vmName, testNamespace);
      expect(ready, 'VM must exist in cluster after creation').toBe(true);
    });
  });

  test.afterAll(async ({ testNamespace, apiClient }) => {
    if (vmName) {
      await apiClient.deleteVirtualMachine(testNamespace, vmName).catch(() => undefined);
    }
  });

  test('READ: GET single VirtualMachine returns the created VM', async ({
    testNamespace,
    apiClient,
  }) => {
    const vm = await apiClient.getVirtualMachine(testNamespace, vmName);
    expect(vm.kind).toBe('VirtualMachine');
    expect(vm.metadata.name).toBe(vmName);
    expect(vm.spec.runStrategy).toBe('Halted');
  });

  test('PATCH: update CPU cores via JSON Patch', async ({ testNamespace, apiClient }) => {
    await apiClient.patchVirtualMachine(testNamespace, vmName, [
      { op: 'replace', path: '/spec/template/spec/domain/cpu/cores', value: 2 },
    ]);

    const updated = (await apiClient.getVirtualMachine(
      testNamespace,
      vmName,
    )) as KubernetesResource;
    const updatedSpec = updated.spec as Record<string, unknown>;
    const template = updatedSpec?.template as Record<string, unknown>;
    const templateSpec = template?.spec as Record<string, unknown>;
    const domain = templateSpec?.domain as Record<string, unknown>;
    const cpu = domain?.cpu as Record<string, unknown>;
    expect(cpu?.cores).toBe(2);
  });

  test('PATCH: update memory via JSON Patch', async ({ testNamespace, apiClient }) => {
    await apiClient.patchVirtualMachine(testNamespace, vmName, [
      { op: 'replace', path: '/spec/template/spec/domain/memory/guest', value: '1Gi' },
    ]);

    const updated = (await apiClient.getVirtualMachine(
      testNamespace,
      vmName,
    )) as KubernetesResource;
    const updatedSpec = updated.spec as Record<string, unknown>;
    const template = updatedSpec?.template as Record<string, unknown>;
    const templateSpec = template?.spec as Record<string, unknown>;
    const domain = templateSpec?.domain as Record<string, unknown>;
    const memory = domain?.memory as Record<string, unknown>;
    expect(memory?.guest).toBe('1Gi');
  });

  test('DELETE: remove VirtualMachine and wait for deletion', async ({
    testNamespace,
    apiClient,
  }) => {
    const result = await apiClient.deleteVirtualMachine(testNamespace, vmName);
    expect(['VirtualMachine', 'Status']).toContain(result.kind);

    const deleted = await apiClient.waitForVmDeleted(vmName, testNamespace);
    expect(deleted, 'VM must be fully removed from cluster').toBe(true);

    vmName = '';
  });
});
