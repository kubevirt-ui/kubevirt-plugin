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

import './virtualization-landing-virtctl.suite';

test.describe(`Virtualization navigation smoke ${ROUTE_VIRTUALIZATION_LANDING_TAG} ${GATING_TAG}`, () => {
  test('Overview and virtualization list pages load', async ({ nav, overviewPage }) => {
    await nav.goToOverview();
    await expect(overviewPage.gettingStartedCard()).toBeVisible({ timeout: 2 * MINUTE });
    await expect(overviewPage.statusCard()).toBeVisible({ timeout: 2 * MINUTE });
    await nav.goToCatalog();
    await expect(nav.page).toHaveURL(nav.catalogConsoleUrlPattern());
    await nav.goToVirtualMachines();
    await expect(nav.page).toHaveURL(nav.virtualMachinesConsoleUrlPattern());
    await nav.goToTemplates();
    await expect(nav.page).toHaveURL(nav.templatesConsoleUrlPattern());
    await nav.goToDataSources();
    await expect(nav.page).toHaveURL(nav.dataSourcesConsoleUrlPattern());
    await nav.goToMigrationPolicies();
    await expect(nav.page).toHaveURL(nav.migrationPoliciesConsoleUrlPattern());
    await nav.goToInstanceTypes();
    await expect(nav.page).toHaveURL(nav.instanceTypesConsoleUrlPattern());
    await nav.goToClusterPreferences();
    await expect(nav.page).toHaveURL(nav.clusterPreferencesConsoleUrlPattern());
    await nav.goToBootableVolumes('openshift');
    await expect(nav.page).toHaveURL(nav.bootableVolumesConsoleUrlPattern());
    await nav.goToCheckups('openshift');
    await expect(nav.page).toHaveURL(nav.checkupsConsoleUrlPattern());
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
      const contentCount = overviewPage.readableContentCount(tab);
      for (let index = 0; index < contentCount; index += 1) {
        await overviewPage.prepareReadableContent(tab, index);
        await expect(overviewPage.readableContentLocator(tab, index)).toBeVisible({
          timeout: TestTimeouts.LONG_OPERATION,
        });
      }
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
    await overviewPage.openSubTab('horizontal-link-Overview');
    await expect(overviewPage.gettingStartedCard()).toBeVisible({
      timeout: TestTimeouts.LONG_OPERATION,
    });
    await overviewPage.openSubTab('horizontal-link-Top consumers');
    await expect(overviewPage.topConsumersContent()).toBeVisible({
      timeout: TestTimeouts.LONG_OPERATION,
    });
    await overviewPage.openSubTab('horizontal-link-Migrations');
    await expect(overviewPage.migrationsHeading()).toBeVisible({
      timeout: TestTimeouts.LONG_OPERATION,
    });
  });

  test('Settings sub-tab shows Cluster and User configuration', async ({ nav, overviewPage }) => {
    await nav.goToOverview();
    await overviewPage.prepareReadableContent('horizontal-link-Settings', 0);
    await expect(overviewPage.readableContentLocator('horizontal-link-Settings', 0)).toBeVisible({
      timeout: TestTimeouts.LONG_OPERATION,
    });
    await overviewPage.prepareReadableContent('horizontal-link-Settings', 1);
    await expect(overviewPage.readableContentLocator('horizontal-link-Settings', 1)).toBeVisible({
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
