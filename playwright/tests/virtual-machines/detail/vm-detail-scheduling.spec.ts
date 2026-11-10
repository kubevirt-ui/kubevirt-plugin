import { T2_TAG } from '@/data-models/allure-constants';
import { ROUTE_VIRTUAL_MACHINES_DETAIL_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/vm-detail-fixture';
import { CRUD_NAMES, VmTabTestId } from '@/utils/constants';
import { TestTimeouts } from '@/utils/test-config';

test.describe(`VM Scheduling tab ${ROUTE_VIRTUAL_MACHINES_DETAIL_TAG} ${T2_TAG}`, () => {
  test('Scheduling tab shows resource requirements', async ({
    apiClient,
    testNamespace,
    vmDetailPage: vmDetail,
  }) => {
    const name = CRUD_NAMES.vmExample;

    await apiClient.deleteVirtualMachine(name, testNamespace);
    await apiClient.applyVirtualMachineExample(testNamespace, name);

    try {
      await vmDetail.openVm(testNamespace, name);
      await vmDetail.goToTab(VmTabTestId.Scheduling);
      await expect(vmDetail.tabPanelText('Scheduling and resource requirements')).toBeVisible({
        timeout: TestTimeouts.ELEMENT_WAIT,
      });
    } finally {
      await apiClient.deleteVirtualMachine(name, testNamespace);
    }
  });
});
