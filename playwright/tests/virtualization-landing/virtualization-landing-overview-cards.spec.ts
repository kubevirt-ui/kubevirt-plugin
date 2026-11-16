import { GATING_TAG } from '@/data-models/allure-constants';
import { ROUTE_VIRTUALIZATION_LANDING_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/virtualization-landing-fixture';
import { TestTimeouts } from '@/utils/test-config';

test.describe(`Virtualization overview cards ${ROUTE_VIRTUALIZATION_LANDING_TAG} ${GATING_TAG}`, () => {
  test('ID(CNV-7924) Feature highlights card is displayed', async ({ nav, overviewPage }) => {
    await nav.goToVirtualMachines();
    await overviewPage.page.getByRole('tab', { name: /^Overview$/i }).click();
    await expect(
      overviewPage.page.getByText(/Virtual machine statuses|No virtual machines yet/i).first(),
    ).toBeVisible({
      timeout: TestTimeouts.LONG_OPERATION,
    });
  });

  test('ID(CNV-7925) Related operators card is displayed', async ({ nav, overviewPage }) => {
    await nav.goToOverviewSettings();
    await expect(
      overviewPage.page.getByText(/Related operators|Installed version/i).first(),
    ).toBeVisible({
      timeout: TestTimeouts.LONG_OPERATION,
    });
  });
});
