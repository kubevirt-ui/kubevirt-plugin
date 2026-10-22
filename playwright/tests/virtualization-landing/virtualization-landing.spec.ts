import {
  ADMIN_ONLY_TAG,
  GATING_TAG,
  NON_PRIV_TAG,
  T1_TAG,
  T2_TAG,
} from '@/data-models/allure-constants';
import { ROUTE_VIRTUALIZATION_LANDING_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/virtualization-landing-fixture';
import type { NavigationPage } from '@/page-objects/navigation-page';
import { OVERVIEW_HORIZONTAL_SUB_NAV_TABS, type OverviewPage } from '@/page-objects/overview-page';
import { TEMPLATE_RHEL9 } from '@/utils/constants';
import { MINUTE, TestTimeouts } from '@/utils/test-config';

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

  const download = overviewPage.virtctlDownloadButton();
  if (!(await download.isVisible())) {
    test.skip(true, 'Console CLI download is disabled (FLAG_CONSOLE_CLI_DOWNLOAD)');
  }

  await overviewPage.openVirtctlDownloadPopover();
  await expect(overviewPage.virtctlDownloadPopover()).toBeVisible();
  await expect(overviewPage.virtctlDownloadPopoverDescription()).toBeVisible();
  const linkCount = await overviewPage.virtctlDownloadPopoverLinks().count();
  if (linkCount > 0) {
    await expect(overviewPage.virtctlDownloadPopoverLinks().first()).toBeVisible();
  }
}

test.describe(`Virtctl download on overview ${ROUTE_VIRTUALIZATION_LANDING_TAG} ${GATING_TAG}`, () => {
  test('Download virtctl link opens the CLI utility popover', virtctlDownloadPopoverTest);
});

test.describe(`Virtctl download on overview ${ROUTE_VIRTUALIZATION_LANDING_TAG} ${T1_TAG} ${NON_PRIV_TAG}`, () => {
  test('Download virtctl link opens the CLI utility popover', virtctlDownloadPopoverTest);
});

test.describe(`Virtctl download on overview ${ROUTE_VIRTUALIZATION_LANDING_TAG} ${T2_TAG} ${NON_PRIV_TAG}`, () => {
  test('Download virtctl link opens the CLI utility popover', virtctlDownloadPopoverTest);
});

test.describe(`Virtualization navigation smoke ${ROUTE_VIRTUALIZATION_LANDING_TAG} ${GATING_TAG}`, () => {
  test('Overview and virtualization list pages load', async ({ nav, overviewPage }) => {
    await nav.goToOverview();
    await expect(overviewPage.gettingStartedCard()).toBeVisible({ timeout: 2 * MINUTE });
    await expect(overviewPage.statusCard()).toBeVisible({ timeout: 2 * MINUTE });
    await nav.goToCatalog();
    await nav.goToVirtualMachines();
    await nav.goToTemplates();
    await nav.goToDataSources();
    await nav.goToMigrationPolicies();
    await nav.goToInstanceTypes();
    await nav.goToClusterPreferences();
    await nav.goToBootableVolumes('openshift');
  });
});

test.describe(`Overview read ${ROUTE_VIRTUALIZATION_LANDING_TAG} ${GATING_TAG} ${NON_PRIV_TAG}`, () => {
  test('ID(CNV-7924) Overview dashboard and sub-nav tabs are visible', async ({
    nav,
    overviewPage,
  }) => {
    await nav.goToOverview();
    await overviewPage.waitForOverviewSubNav(OVERVIEW_HORIZONTAL_SUB_NAV_TABS);
    for (const tabId of OVERVIEW_HORIZONTAL_SUB_NAV_TABS) {
      await expect(overviewPage.subTab(tabId)).toBeVisible({ timeout: TestTimeouts.ELEMENT_WAIT });
    }
  });

  test('Each overview horizontal sub-tab shows readable content', async ({ nav, overviewPage }) => {
    await nav.goToOverview();
    await overviewPage.waitForOverviewSubNav(OVERVIEW_HORIZONTAL_SUB_NAV_TABS);
    for (const tab of OVERVIEW_HORIZONTAL_SUB_NAV_TABS) {
      await overviewPage.expectSubTabReadable(tab);
    }
  });
});

test.describe(`Overview catalog create entry ${ROUTE_VIRTUALIZATION_LANDING_TAG} ${GATING_TAG}`, () => {
  test('From overview, catalog exposes VM create affordance for a template', async ({
    catalogPage,
    nav,
    overviewPage,
    testNamespace,
  }) => {
    await nav.goToOverview();
    await expect(overviewPage.gettingStartedCard()).toBeVisible();

    await nav.goToCatalog(testNamespace);
    await catalogPage.selectTemplateByMetadataName(TEMPLATE_RHEL9.metadataName);
    await expect(catalogPage.customizeButton()).toBeVisible();
  });
});

test.describe(`Overview horizontal tabs read ${ROUTE_VIRTUALIZATION_LANDING_TAG} ${GATING_TAG}`, () => {
  test('Overview, Top consumers, and Migrations sub-tabs show content', async ({
    nav,
    overviewPage,
  }) => {
    await nav.goToOverview();
    await overviewPage.waitForOverviewSubNav([
      'horizontal-link-Overview',
      'horizontal-link-Top consumers',
      'horizontal-link-Migrations',
    ]);
    await overviewPage.expectSubTabReadable('horizontal-link-Overview');
    await overviewPage.expectSubTabReadable('horizontal-link-Top consumers');
    await overviewPage.expectSubTabReadable('horizontal-link-Migrations');
  });

  test('Settings sub-tab shows Cluster and User configuration', async ({ nav, overviewPage }) => {
    await nav.goToOverview();
    await overviewPage.openSubTab('horizontal-link-Settings');
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

test.describe(`Virtualization overview cards ${ROUTE_VIRTUALIZATION_LANDING_TAG} ${T1_TAG}`, () => {
  test('ID(CNV-7924) Feature highlights card is displayed', async ({ nav, overviewPage }) => {
    await nav.goToOverview();
    await expect(overviewPage.featureHighlightsText()).toBeVisible();
  });

  test('ID(CNV-7925) Related operators card is displayed', async ({ nav, overviewPage }) => {
    await nav.goToOverview();
    await expect(overviewPage.relatedOperatorsText()).toBeVisible();
  });
});

test.describe(`Virtualization overview — admin ${ROUTE_VIRTUALIZATION_LANDING_TAG} ${T1_TAG} ${ADMIN_ONLY_TAG}`, () => {
  test('ID(CNV-7927) Quick Starts card is displayed', async ({ nav, overviewPage }) => {
    await nav.goToOverview();
    await expect(overviewPage.quickStartsCard()).toBeVisible({
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
  });
});

test.describe(`Overview Migrations tab ${ROUTE_VIRTUALIZATION_LANDING_TAG} ${T2_TAG} ${ADMIN_ONLY_TAG}`, () => {
  test('Virtualization overview Migrations sub-tab loads', async ({ nav, overviewPage }) => {
    await nav.goToOverview();
    await overviewPage.openSubTab('horizontal-link-Migrations');
    await expect(overviewPage.migrationsHeading()).toBeVisible({
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
  });
});
