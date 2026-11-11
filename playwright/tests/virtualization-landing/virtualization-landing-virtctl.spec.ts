import { GATING_TAG, NON_PRIV_TAG } from '@/data-models/allure-constants';
import { ROUTE_VIRTUALIZATION_LANDING_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/virtualization-landing-fixture';
import type { NavigationPage } from '@/page-objects/navigation-page';
import type { OverviewPage } from '@/page-objects/overview-page';
import { registerForTier1AndTier2NonPriv } from '@/test-scenarios/tier-registration';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

async function virtctlCommandLineToolsTest({
  nav,
  overviewPage,
  page,
}: {
  nav: NavigationPage;
  overviewPage: OverviewPage;
  page: Page;
}): Promise<void> {
  await nav.goToOverviewSettings();
  await overviewPage.waitForOverviewDashboard();
  await overviewPage.openVirtctlCommandLineToolsPage();
  await expect(page).toHaveURL(/command-line-tools/);
  await expect(overviewPage.commandLineToolsHeading()).toBeVisible({
    timeout: TestTimeouts.ELEMENT_WAIT,
  });
  await expect(overviewPage.virtctlCliSectionLabel()).toBeVisible({
    timeout: TestTimeouts.ELEMENT_WAIT,
  });
  await expect(overviewPage.virtctlPlatformDownloadLinks().first()).toBeVisible({
    timeout: TestTimeouts.ELEMENT_WAIT,
  });
}

test.describe(`Virtctl download on overview ${ROUTE_VIRTUALIZATION_LANDING_TAG} ${GATING_TAG}`, () => {
  test('Download virtctl link opens the Command Line Tools page', virtctlCommandLineToolsTest);
});

registerForTier1AndTier2NonPriv((tierTag) => {
  test.describe(`Virtctl download on overview ${ROUTE_VIRTUALIZATION_LANDING_TAG} ${tierTag} ${NON_PRIV_TAG}`, () => {
    test('Download virtctl link opens the Command Line Tools page', virtctlCommandLineToolsTest);
  });
});
