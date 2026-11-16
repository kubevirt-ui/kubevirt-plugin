import { T2_TAG } from '@/data-models/allure-constants';
import { ROUTE_VIRTUAL_MACHINES_DETAIL_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/vm-detail-fixture';
import { withExampleVm } from '@/utils/with-example-vm';

test.describe(`VM move to folder ${ROUTE_VIRTUAL_MACHINES_DETAIL_TAG} ${T2_TAG}`, () => {
  // Gating: action + modal affordance only (full create/save is flaky under parallel load / 404 detail shells).
  // Product copy is "Move to group" (tree folders); older builds may still say "Move to folder".
  test('Move to folder action opens folder picker modal', async ({
    apiClient,
    testNamespace,
    vmDetailPage: vmDetail,
  }) => {
    await withExampleVm(apiClient, testNamespace, async (name) => {
      await vmDetail.openVmAndWaitForDetail(testNamespace, name);
      await expect(vmDetail.page.getByRole('heading', { name: /404/i })).toHaveCount(0);

      // Overview Group row is gated by the same treeViewFolders flag as the Actions item.
      await expect(vmDetail.overviewFolderValue()).toBeVisible({
        timeout: 60_000,
      });

      await vmDetail.openMoveToFolderModal();
      await expect(vmDetail.moveToFolderModal()).toBeVisible();
      await expect(vmDetail.moveToFolderSearchInput()).toBeVisible();
      await vmDetail.cancelMoveToFolderModal();
    });
  });
});
