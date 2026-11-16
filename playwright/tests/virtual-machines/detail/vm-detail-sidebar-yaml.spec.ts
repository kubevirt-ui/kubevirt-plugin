import { T2_TAG } from '@/data-models/allure-constants';
import { ROUTE_VIRTUAL_MACHINES_DETAIL_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/vm-detail-fixture';
import { CRUD_NAMES, VM_DETAIL_SIDEBAR_YAML_TABS, VmTabTestId } from '@/utils/constants';
import { TestTimeouts } from '@/utils/test-config';

test.describe(`VM detail sidebar YAML editor ${ROUTE_VIRTUAL_MACHINES_DETAIL_TAG} ${T2_TAG}`, () => {
  test('Toggle sidebar YAML on configuration tabs', async ({
    apiClient,
    testNamespace,
    vmDetailPage: vmDetail,
  }) => {
    const name = CRUD_NAMES.vmExample;

    await apiClient.deleteVirtualMachine(name, testNamespace);
    await apiClient.applyVirtualMachineExample(testNamespace, name);

    try {
      await vmDetail.openVm(testNamespace, name);

      let toggledYaml = false;
      for (const tabId of VM_DETAIL_SIDEBAR_YAML_TABS) {
        if (!(await vmDetail.goToTabWithSidebarYamlEditor(tabId))) {
          continue;
        }
        await vmDetail.toggleYamlSidebarEditor();
        toggledYaml = true;
      }
      if (!toggledYaml) {
        await vmDetail.goToTab(VmTabTestId.YAML);
        await expect(vmDetail.tabPanelText('Download')).toBeVisible({
          timeout: TestTimeouts.ELEMENT_WAIT,
        });
      }
    } finally {
      await apiClient.deleteVirtualMachine(name, testNamespace);
    }
  });
});
