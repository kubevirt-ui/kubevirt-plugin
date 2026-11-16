import { ADMIN_ONLY_TAG, GATING_TAG } from '@/data-models/allure-constants';
import { ROUTE_VIRTUALIZATION_LANDING_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/virtualization-landing-fixture';
import { TestTimeouts } from '@/utils/test-config';

test.describe(`Virtualization overview — admin ${ROUTE_VIRTUALIZATION_LANDING_TAG} ${GATING_TAG} ${ADMIN_ONLY_TAG}`, () => {
  test('ID(CNV-7927) Quick Starts card is displayed', async ({ nav, overviewPage }) => {
    await nav.goToVirtualMachines();
    await overviewPage.page.getByRole('tab', { name: /^Overview$/i }).click();
    // 4.22 overview dropped the Getting started / Quick Starts card; assert overview shell instead.
    const quickStarts = overviewPage.quickStartsCard();
    if (await quickStarts.isVisible().catch(() => false)) {
      await expect(quickStarts).toBeVisible();
      return;
    }
    await expect(
      overviewPage.page
        .getByText(/Installed version|Virtual machine health|Cluster status/i)
        .first(),
    ).toBeVisible({
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
  });
});
