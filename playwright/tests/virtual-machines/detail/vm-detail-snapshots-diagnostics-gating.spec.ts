import { GATING_TAG } from '@/data-models/allure-constants';
import { ROUTE_VIRTUAL_MACHINES_DETAIL_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/vm-detail-fixture';
import { CRUD_NAMES, VmTabTestId } from '@/utils/constants';
import { TestTimeouts } from '@/utils/test-config';

test.describe(`VM Snapshots and Diagnostics tabs ${ROUTE_VIRTUAL_MACHINES_DETAIL_TAG} ${GATING_TAG}`, () => {
  test('Snapshots and Diagnostics tabs load', async ({
    apiClient,
    testNamespace,
    vmDetailPage: vmDetail,
  }) => {
    const name = CRUD_NAMES.vmExample;

    await apiClient.deleteVirtualMachine(name, testNamespace);
    await apiClient.applyVirtualMachineExample(testNamespace, name);

    try {
      await vmDetail.openVm(testNamespace, name);
      await vmDetail.goToTab(VmTabTestId.Snapshots);
      await expect(vmDetail.snapshotsTabContent()).toBeVisible({
        timeout: TestTimeouts.ELEMENT_WAIT,
      });
      await vmDetail.goToTab(VmTabTestId.Diagnostics);
      await expect(vmDetail.diagnosticsTabContent()).toBeVisible({
        timeout: TestTimeouts.ELEMENT_WAIT,
      });
    } finally {
      await apiClient.deleteVirtualMachine(name, testNamespace);
    }
  });
});
