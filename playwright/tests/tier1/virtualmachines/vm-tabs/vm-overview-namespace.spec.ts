import { T1, T1_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/vm-tabs-fixture';

test.describe('VM Overview - namespace level', { tag: [T1_TAG, '@tier1-vm-overview'] }, () => {
  test('Namespace VM overview health and resource charts', async ({
    apiClient,
    vmTreePage,
    vmListPage,
    utils,
  }) => {
    await utils.withAllure({
      suite: 'VM Overview - namespace level',
      feature: T1,
      tags: [T1_TAG, '@tier1-vm-overview'],
    });

    const namespace = utils.generateTestNamespace('vm-overview-ns');
    await apiClient.createNamespace(namespace);
    await apiClient.waitForNamespaceReady(namespace);
    apiClient.trackResource('Namespace', namespace);

    const vmName1 = utils.generateRandomVmName('vm-overview-ns-1');
    await apiClient.createVmFromTemplate(
      'rhel9-server-small',
      vmName1,
      namespace,
      'openshift',
      true,
    );
    apiClient.trackResource('VirtualMachine', vmName1, namespace);
    await apiClient.verifyVmCreated(vmName1, namespace, utils.TestTimeouts.VM_BOOTUP);
    await apiClient.waitForVmRunning(vmName1, namespace, utils.TestTimeouts.VM_BOOTUP);

    const vmName2 = utils.generateRandomVmName('vm-overview-ns-2');
    await apiClient.createVmFromTemplate(
      'rhel9-server-small',
      vmName2,
      namespace,
      'openshift',
      true,
    );
    apiClient.trackResource('VirtualMachine', vmName2, namespace);
    await apiClient.verifyVmCreated(vmName2, namespace, utils.TestTimeouts.VM_BOOTUP);
    await apiClient.waitForVmRunning(vmName2, namespace, utils.TestTimeouts.VM_BOOTUP);

    await vmTreePage.navigateToProjectViaTreeView(namespace);

    const result = await vmListPage.getHealthSectionWidgetsVisibility(utils.TestTimeouts.VM_BOOTUP);
    expect
      .soft(
        result.allVisible,
        result.missing.length
          ? `Missing widgets: ${result.missing.join(', ')}`
          : 'All health widgets visible',
      )
      .toBe(true);

    const runningResult = await vmListPage.verifyRunningVmsCountInHealthSection(namespace, 2);
    expect
      .soft(runningResult.matches, runningResult.message ?? 'Running VMs count should match 2')
      .toBe(true);

    const { count, allVisible } = await vmListPage.getResourceAllocationChartsVisibility(
      utils.TestTimeouts.VM_BOOTUP,
    );
    expect.soft(count, 'Resource allocation should have 4 chart elements').toBe(4);
    expect.soft(allVisible, 'All 4 resource allocation charts should be visible').toBe(true);
  });
});
