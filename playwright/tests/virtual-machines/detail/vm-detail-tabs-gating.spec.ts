import { GATING_TAG } from '@/data-models/allure-constants';
import { ROUTE_VIRTUAL_MACHINES_DETAIL_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/vm-detail-fixture';
import { CRUD_NAMES, VmTabTestId } from '@/utils/constants';
import { TestTimeouts } from '@/utils/test-config';

test.describe(`VM detail tabs ${ROUTE_VIRTUAL_MACHINES_DETAIL_TAG} ${GATING_TAG}`, () => {
  test('VM example YAML and tabs load', async ({
    apiClient,
    testNamespace,
    vmDetailPage: vmDetail,
  }) => {
    const name = CRUD_NAMES.vmExample;
    await apiClient.deleteVirtualMachine(name, testNamespace);
    await apiClient.deleteOpenshiftTemplate(name, testNamespace);
    await apiClient.applyVirtualMachineExample(testNamespace, name);
    await apiClient.waitForExampleVmStartable(testNamespace, name);

    try {
      await vmDetail.openVmAndWaitForDetail(testNamespace, name);
      await expect(vmDetail.hostnameLabel()).toBeVisible({ timeout: TestTimeouts.ELEMENT_WAIT });

      await vmDetail.startVmFromActions();
      await expect(vmDetail.overviewStatusWithText('Running')).toBeVisible({
        timeout: TestTimeouts.TEST_VM_CREATION,
      });

      await vmDetail.goToTab(VmTabTestId.Details);
      await expect(vmDetail.tabPanelText('VirtualMachine Details')).toBeVisible();
      await vmDetail.goToTab(VmTabTestId.Metrics);
      await expect(vmDetail.tabPanelText('Utilization')).toBeVisible();
      await vmDetail.goToTab(VmTabTestId.YAML);
      await expect(vmDetail.tabPanelText('Download')).toBeVisible();
      await vmDetail.goToTab(VmTabTestId.Scheduling);
      await expect(vmDetail.tabPanelText('Scheduling and resource requirements')).toBeVisible();
      await vmDetail.goToEnvironmentTab();
      await expect(vmDetail.environmentSectionHeading()).toBeVisible();
      await vmDetail.goToTab(VmTabTestId.Events);
      await expect(vmDetail.eventsTabContent()).toBeVisible();
      await vmDetail.goToTab(VmTabTestId.Console);
      await expect(vmDetail.consoleTabContent()).toBeVisible();
      await vmDetail.goToTab(VmTabTestId.Networks);
      await expect(vmDetail.tabPanelText('Pod networking')).toBeVisible();
      await vmDetail.goToTab(VmTabTestId.Disks);
      await expect(vmDetail.tabPanelText('rootdisk')).toBeVisible();
    } finally {
      await apiClient.deleteVirtualMachine(name, testNamespace);
      await apiClient.deleteOpenshiftTemplate(name, testNamespace);
    }
  });
});
