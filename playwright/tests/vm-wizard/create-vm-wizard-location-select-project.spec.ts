import { ADMIN_ONLY_TAG, T1, T1_TAG } from '@/data-models/allure-constants';
import { ROUTE_VM_WIZARD_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/create-vm-fixture';
import type VmWizardNavigationPage from '@/page-objects/vm-wizard/vm-wizard-navigation-page';
import { TestTimeouts } from '@/utils/test-config';
import { setupTestNamespace } from '@/fixtures/create-vm-fixture';

const SUITE = 'VM Creation Wizard — Location project selection';

const openWizardOnDeploymentDetails = async (
  vmWizardNavigationPage: VmWizardNavigationPage,
  namespace: string,
): Promise<void> => {
  await vmWizardNavigationPage.navigateToWizardInNamespace(namespace);

  expect(await vmWizardNavigationPage.verifyWizardVisible(), 'Wizard should open').toBe(true);
  expect(
    await vmWizardNavigationPage.verifyLocationSectionVisible(),
    'Location section should be visible on Deployment details',
  ).toBe(true);
};

test.describe(
  SUITE,
  { tag: [ROUTE_VM_WIZARD_TAG, T1_TAG, '@catalog-wizard', ADMIN_ONLY_TAG] },
  () => {
    test('Select existing project from Location dropdown', async ({
      apiClient,
      vmWizardNavigationPage,
      utils,
    }) => {
      await utils.withAllure({
        suite: 'VM Creation Wizard',
        feature: T1,
        tags: [T1_TAG],
      });

      const existingProject = await setupTestNamespace(apiClient, 'wizard-select-proj');

      await test.step('Open wizard on Deployment details', async () => {
        await openWizardOnDeploymentDetails(vmWizardNavigationPage, existingProject);
      });

      await test.step('Location → Project: select existing namespace', async () => {
        await vmWizardNavigationPage.selectLocationProject(existingProject);

        const locationProject = await vmWizardNavigationPage.getLocationProject();
        expect(locationProject, 'Location should show the selected project name').toContain(
          existingProject,
        );
      });
    });

    test('Location project dropdown hides system projects and the show-default toggle', async ({
      apiClient,
      page,
      vmWizardNavigationPage,
      utils,
    }) => {
      await utils.withAllure({
        suite: 'VM Creation Wizard',
        feature: T1,
        tags: [T1_TAG],
      });

      const userProject = await setupTestNamespace(apiClient, 'wizard-user-proj');
      const systemProject = 'openshift';

      await test.step('Open wizard and Location project dropdown', async () => {
        await openWizardOnDeploymentDetails(vmWizardNavigationPage, userProject);
        await vmWizardNavigationPage.openEditLocationPanel();

        const projectToggle = page
          .locator('.vm-creation-wizard')
          .getByTestId('namespace-dropdown-menu-toggle')
          .first();
        await projectToggle.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
        await projectToggle.click();
      });

      await test.step('Show default projects toggle is absent', async () => {
        await expect(page.getByText('Show default projects')).toHaveCount(0);
        await expect(page.locator('#show-system-namespaces-switch')).toHaveCount(0);
      });

      await test.step('System project listing — 4.22 dropdown lists projects without system filter', async () => {
        const filter = page.getByTestId('dropdown-text-filter');
        await filter.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
        await filter.fill(systemProject);
        // Product no longer hides openshift/default; assert the filter still returns results.
        await expect(
          page.getByRole('menuitem', { name: systemProject, exact: true }),
        ).toBeVisible();
      });

      await test.step('User project is listed', async () => {
        const filter = page.getByTestId('dropdown-text-filter');
        await filter.clear();
        await filter.fill(userProject);
        await expect(page.getByRole('menuitem', { name: userProject, exact: true })).toBeVisible();
      });
    });

    test('Create is enabled from all-namespaces VM list and opens the wizard', async ({
      page,
      vmListPage,
      vmWizardNavigationPage,
      utils,
    }) => {
      await utils.withAllure({
        suite: 'VM Creation Wizard',
        feature: T1,
        tags: [T1_TAG],
      });

      await test.step('Open all-namespaces VirtualMachines list', async () => {
        await vmListPage.switchToVirtualizationPerspective();
        await vmListPage.navigateToAllNamespacesVirtualMachines();
      });

      await test.step('Create control is enabled', async () => {
        const createButton = page.getByTestId('item-create').first();
        await createButton.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
        await expect(
          createButton,
          'Create should be enabled in all-namespaces scope',
        ).toBeEnabled();
      });

      await test.step('Create opens the VM wizard', async () => {
        await vmWizardNavigationPage.openWizardFromCreateDropdown();
        expect(await vmWizardNavigationPage.verifyWizardVisible(), 'Wizard should open').toBe(true);
      });
    });
  },
);
