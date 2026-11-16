import { ROUTE_VIRTUAL_MACHINES_DETAIL_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/vm-detail-fixture';
import { CRUD_NAMES, VmTabTestId } from '@/utils/constants';
import { TestTimeouts } from '@/utils/test-config';

test.describe(`VM Scripts tab ${ROUTE_VIRTUAL_MACHINES_DETAIL_TAG}`, () => {
  test('ID(CNV-8956) Scripts tab shows cloud-init section', async ({
    apiClient,
    testNamespace,
    vmDetailPage: vmDetail,
  }) => {
    const name = CRUD_NAMES.vmExample;

    await apiClient.deleteVirtualMachine(name, testNamespace);
    await apiClient.applyVirtualMachineExample(testNamespace, name);

    try {
      await vmDetail.openVm(testNamespace, name);
      await expect
        .poll(() => vmDetail.currentUrl())
        .toMatch(vmDetail.vmDetailUrlPattern(testNamespace, name));
      await expect(vmDetail.detailHeading()).toContainText(name);
      await vmDetail.goToTab(VmTabTestId.Scripts);
      await expect(vmDetail.scriptsTabHeading()).toBeVisible({
        timeout: TestTimeouts.ELEMENT_WAIT,
      });
      await expect(vmDetail.scriptsCloudInitText()).toBeVisible({
        timeout: TestTimeouts.ELEMENT_WAIT,
      });
    } finally {
      await apiClient.deleteVirtualMachine(name, testNamespace);
    }
  });
});
