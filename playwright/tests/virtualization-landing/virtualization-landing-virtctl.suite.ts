import { ROUTE_VIRTUALIZATION_LANDING_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/virtualization-landing-fixture';
import type { NavigationPage } from '@/page-objects/navigation-page';
import type { OverviewPage } from '@/page-objects/overview-page';
import { registerForGatingAndNonPrivTiers } from '@/test-scenarios/tier-registration';
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
  await nav.goToOverview();
  await overviewPage.waitForOverviewDashboard();
  await expect(overviewPage.virtualizationHeading()).toHaveText('Virtualization');
  test.skip(
    !(await overviewPage.isVirtctlDownloadLinkVisible()),
    'Console CLI download is disabled (FLAG_CONSOLE_CLI_DOWNLOAD)',
  );
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

registerForGatingAndNonPrivTiers((tags) => {
  test.describe(`Virtctl download on overview ${ROUTE_VIRTUALIZATION_LANDING_TAG} ${tags}`, () => {
    test('Download virtctl link opens the Command Line Tools page', virtctlCommandLineToolsTest);
  });
});
