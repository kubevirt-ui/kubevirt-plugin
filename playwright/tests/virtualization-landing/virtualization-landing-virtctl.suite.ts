import { ROUTE_VIRTUALIZATION_LANDING_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/virtualization-landing-fixture';
import type { NavigationPage } from '@/page-objects/navigation-page';
import type { OverviewPage } from '@/page-objects/overview-page';
import { registerForGatingAndNonPrivTiers } from '@/test-scenarios/tier-registration';
import { TestTimeouts } from '@/utils/test-config';

async function virtctlDownloadPopoverTest({
  nav,
  overviewPage,
}: {
  nav: NavigationPage;
  overviewPage: OverviewPage;
}): Promise<void> {
  await nav.goToOverview();
  await overviewPage.waitForOverviewDashboard();
  await expect(overviewPage.virtualizationHeading()).toHaveText('Virtualization');
  test.skip(
    !(await overviewPage.isVirtctlDownloadButtonVisible()),
    'Console CLI download is disabled (FLAG_CONSOLE_CLI_DOWNLOAD)',
  );
  await overviewPage.openVirtctlDownloadPopover();
  await expect(overviewPage.virtctlDownloadPopover()).toBeVisible({
    timeout: TestTimeouts.ELEMENT_WAIT,
  });
  await expect(overviewPage.virtctlDownloadPopoverDescription()).toBeVisible({
    timeout: TestTimeouts.ELEMENT_WAIT,
  });
  if ((await overviewPage.virtctlDownloadPopoverLinks().count()) > 0) {
    await expect(overviewPage.virtctlDownloadPopoverFirstLink()).toBeVisible({
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
  }
}

registerForGatingAndNonPrivTiers((tags) => {
  test.describe(`Virtctl download on overview ${ROUTE_VIRTUALIZATION_LANDING_TAG} ${tags}`, () => {
    test('Download virtctl link opens the CLI utility popover', virtctlDownloadPopoverTest);
  });
});
