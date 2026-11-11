import { GATING_TAG } from '@/data-models/allure-constants';
import { ROUTE_VIRTUALIZATION_LANDING_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/virtualization-landing-fixture';

test.describe(`Virtualization navigation smoke ${ROUTE_VIRTUALIZATION_LANDING_TAG} ${GATING_TAG}`, () => {
  test('Overview and virtualization list pages load', async ({ nav }) => {
    await nav.goToVirtualMachines();
    await expect(nav.page).toHaveURL(nav.virtualMachinesConsoleUrlPattern());
    await nav.goToOverviewSettings();
    await expect(nav.page).toHaveURL(/virtualization-settings/);
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
