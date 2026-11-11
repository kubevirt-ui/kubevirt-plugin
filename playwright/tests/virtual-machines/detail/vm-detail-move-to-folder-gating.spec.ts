import { GATING_TAG } from '@/data-models/allure-constants';
import { ROUTE_VIRTUAL_MACHINES_DETAIL_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/vm-detail-fixture';
import { withExampleVm } from '@/utils/with-example-vm';

test.describe(`VM move to folder ${ROUTE_VIRTUAL_MACHINES_DETAIL_TAG} ${GATING_TAG}`, () => {
  // Gating: action + modal affordance only (full create/save is flaky under parallel load / 404 detail shells).
  test('Move to folder action opens folder picker modal', async ({
    apiClient,
    testNamespace,
    vmDetailPage: vmDetail,
  }) => {
    await withExampleVm(apiClient, testNamespace, async (name) => {
      await vmDetail.openVm(testNamespace, name);
      await vmDetail.waitForDetailHeadingVmName(name);
      await expect(vmDetail.page.getByRole('heading', { name: /404/i })).toHaveCount(0);

      await vmDetail.openMoveToFolderModal();
      await expect(vmDetail.moveToFolderModal()).toBeVisible();
      await expect(vmDetail.moveToFolderSearchInput()).toBeVisible();
      await vmDetail.cancelMoveToFolderModal();
    });
  });
});
