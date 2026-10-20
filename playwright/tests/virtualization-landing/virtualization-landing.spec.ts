import {
  ADMIN_ONLY_TAG,
  GATING_TAG,
  NON_PRIV_TAG,
  T1_TAG,
  T2_TAG,
} from '@/data-models/allure-constants';
import { ROUTE_VIRTUALIZATION_LANDING_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/virtualization-landing-fixture';
import { OVERVIEW_HORIZONTAL_SUB_NAV_TABS } from '@/page-objects/overview-page';
import { TEMPLATE_RHEL9 } from '@/utils/constants';
import { MINUTE, TestTimeouts } from '@/utils/test-config';

test.describe(`Virtualization navigation smoke ${ROUTE_VIRTUALIZATION_LANDING_TAG} ${GATING_TAG}`, () => {
  test('Overview and virtualization list pages load', async ({ overviewPage, nav }) => {
    await nav.goToOverview();
    await expect(overviewPage.gettingStartedCard()).toBeVisible({ timeout: 2 * MINUTE });
    await expect(overviewPage.statusCard()).toBeVisible({ timeout: 2 * MINUTE });
    await nav.goToCatalog();
    await nav.goToVirtualMachines();
    await nav.goToTemplates();
    await nav.goToDataSources();
    await nav.goToMigrationPolicies();
  });
});

test.describe(`Overview read ${ROUTE_VIRTUALIZATION_LANDING_TAG} ${GATING_TAG} ${NON_PRIV_TAG}`, () => {
  test('ID(CNV-7924) Overview dashboard and sub-nav tabs are visible', async ({
    overviewPage,
    nav,
  }) => {
    await nav.goToOverview();
    await overviewPage.waitForOverviewSubNav(OVERVIEW_HORIZONTAL_SUB_NAV_TABS);
    for (const tabId of OVERVIEW_HORIZONTAL_SUB_NAV_TABS) {
      await expect(overviewPage.subTab(tabId)).toBeVisible({ timeout: TestTimeouts.ELEMENT_WAIT });
    }
  });

  test('Each overview horizontal sub-tab shows readable content', async ({ overviewPage, nav }) => {
    await nav.goToOverview();
    await overviewPage.waitForOverviewSubNav(OVERVIEW_HORIZONTAL_SUB_NAV_TABS);
    for (const tab of OVERVIEW_HORIZONTAL_SUB_NAV_TABS) {
      await overviewPage.expectSubTabReadable(tab);
    }
  });
});

test.describe(`Overview catalog create entry ${ROUTE_VIRTUALIZATION_LANDING_TAG} ${GATING_TAG}`, () => {
  test('From overview, catalog exposes VM create affordance for a template', async ({
    overviewPage,
    catalogPage,
    nav,
    testNamespace,
  }) => {
    await nav.goToOverview();
    await expect(overviewPage.gettingStartedCard()).toBeVisible();

    await nav.goToCatalog(testNamespace);
    await catalogPage.selectTemplateByMetadataName(TEMPLATE_RHEL9.metadataName);
    await expect(catalogPage.customizeButton()).toBeVisible();
  });
});

test.describe(`Overview Top consumers tab ${ROUTE_VIRTUALIZATION_LANDING_TAG} ${GATING_TAG} ${NON_PRIV_TAG}`, () => {
  test('Top consumers sub-tab is visible on overview', async ({ overviewPage, nav }) => {
    await nav.goToOverview();
    await overviewPage.openSubTab('horizontal-link-Top consumers');
    await expect(overviewPage.topConsumersContent()).toBeVisible({
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
  });
});

test.describe(`Virtualization overview cards ${ROUTE_VIRTUALIZATION_LANDING_TAG} ${T1_TAG}`, () => {
  test('ID(CNV-7924) Feature highlights card is displayed', async ({ overviewPage, nav }) => {
    await nav.goToOverview();
    await expect(overviewPage.featureHighlightsText()).toBeVisible();
  });

  test('ID(CNV-7925) Related operators card is displayed', async ({ overviewPage, nav }) => {
    await nav.goToOverview();
    await expect(overviewPage.relatedOperatorsText()).toBeVisible();
  });
});

test.describe(`Virtualization overview — admin ${ROUTE_VIRTUALIZATION_LANDING_TAG} ${T1_TAG} ${ADMIN_ONLY_TAG}`, () => {
  test('ID(CNV-7927) Quick Starts card is displayed', async ({ overviewPage, nav }) => {
    await nav.goToOverview();
    await expect(overviewPage.quickStartsCard()).toBeVisible({
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
  });
});

test.describe(`Overview Migrations tab ${ROUTE_VIRTUALIZATION_LANDING_TAG} ${T2_TAG} ${ADMIN_ONLY_TAG}`, () => {
  test('Virtualization overview Migrations sub-tab loads', async ({ overviewPage, nav }) => {
    await nav.goToOverview();
    await overviewPage.openSubTab('horizontal-link-Migrations');
    await expect(overviewPage.migrationsHeading()).toBeVisible({
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
  });
});
