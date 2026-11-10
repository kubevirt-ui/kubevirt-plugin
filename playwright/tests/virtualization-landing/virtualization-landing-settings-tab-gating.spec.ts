import { GATING_TAG } from '@/data-models/allure-constants';
import { ROUTE_VIRTUALIZATION_LANDING_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/virtualization-landing-fixture';
import { TestTimeouts } from '@/utils/test-config';

test.describe(`Overview Settings sub-tab ${ROUTE_VIRTUALIZATION_LANDING_TAG} ${GATING_TAG}`, () => {
  test('Settings sub-tab shows Cluster and User configuration', async ({ nav, overviewPage }) => {
    await nav.goToOverviewSettings();
    await overviewPage.openSettingsClusterTab();
    await expect(overviewPage.clusterSettingsContent()).toBeVisible({
      timeout: TestTimeouts.LONG_OPERATION,
    });
    await overviewPage.openSettingsUserTab();
    await expect(overviewPage.userSettingsContent()).toBeVisible({
      timeout: TestTimeouts.LONG_OPERATION,
    });
  });
});
