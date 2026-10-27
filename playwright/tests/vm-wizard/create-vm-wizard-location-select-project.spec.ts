import { ADMIN_ONLY_TAG, NONPRIV_TAG, T1, T1_TAG } from '@/data-models/allure-constants';
import { ROUTE_VM_WIZARD_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/create-vm-fixture';
import type VmWizardNavigationPage from '@/page-objects/vm-wizard/vm-wizard-navigation-page';
import type VirtualMachinesPage from '@/page-objects/vm/virtual-machines-page';
import { TestTimeouts } from '@/utils/test-config';
import { setupTestNamespace } from '@/utils/test-setup-helpers';
import type { Page } from '@playwright/test';

const SUITE = 'VM Creation Wizard — Location project selection';

const openWizardOnDeploymentDetails = async (
  vmListPage: VirtualMachinesPage,
  vmWizardNavigationPage: VmWizardNavigationPage,
): Promise<void> => {
  await vmListPage.switchToVirtualizationPerspective();
  await vmListPage.navigateToVirtualMachinesViaUI();
  await vmWizardNavigationPage.openWizardFromCreateDropdown();

  expect(await vmWizardNavigationPage.verifyWizardVisible(), 'Wizard should open').toBe(true);
  expect(
    await vmWizardNavigationPage.verifyLocationSectionVisible(),
    'Location section should be visible on Deployment details',
  ).toBe(true);
};

const createProjectFromLocationProjectDropdown = async (
  page: Page,
  vmWizardNavigationPage: VmWizardNavigationPage,
  projectName: string,
): Promise<void> => {
  await vmWizardNavigationPage.openEditLocationPanel();

  const projectToggle = page
    .locator('.vm-creation-wizard')
    .getByTestId('namespace-dropdown-menu-toggle')
    .first();
  await projectToggle.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
  await projectToggle.click();

  const filter = page.getByTestId('dropdown-text-filter');
  await filter.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
  await filter.fill(projectName);

  await expect(page.getByRole('menuitem', { name: projectName, exact: true })).toHaveCount(0);

  const createProjectButton = page.getByTestId('create-project-from-dropdown');
  await expect(createProjectButton).toBeVisible();
  await createProjectButton.click();

  const modal = page.getByTestId('dialog-modal').or(page.locator('#tab-modal'));
  await modal.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
  const nameInput = modal.locator('#project-name');
  if (!(await nameInput.inputValue()).trim()) {
    await nameInput.fill(projectName);
  }
  await modal.getByTestId('save-button').filter({ hasText: 'Create' }).click();
  await modal.waitFor({ state: 'hidden', timeout: TestTimeouts.ELEMENT_WAIT });

  await projectToggle.filter({ hasText: projectName }).waitFor({
    state: 'visible',
    timeout: TestTimeouts.ELEMENT_WAIT,
  });
};

test.describe(
  SUITE,
  { tag: [ROUTE_VM_WIZARD_TAG, T1_TAG, '@catalog-wizard', ADMIN_ONLY_TAG] },
  () => {
    test('Select existing project from Location dropdown', async ({
      apiClient,
      vmListPage,
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
        await openWizardOnDeploymentDetails(vmListPage, vmWizardNavigationPage);
      });

      await test.step('Location → Project: select existing namespace', async () => {
        await vmWizardNavigationPage.selectLocationProject(existingProject);

        const locationProject = await vmWizardNavigationPage.getLocationProject();
        expect(
          locationProject,
          'Location should show the selected project name',
        ).toContain(existingProject);
      });
    });

    test('Create project from Location dropdown selects the new project in the wizard', async ({
      apiClient,
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

      const newProjectName = utils.generateTestNamespace('wizard-new-proj');

      await test.step('Use a project name that does not exist in the cluster yet', async () => {
        expect(
          await apiClient.namespaceExists(newProjectName),
          `Namespace '${newProjectName}' must not exist before creation`,
        ).toBe(false);
      });

      await test.step('Open wizard on Deployment details', async () => {
        await openWizardOnDeploymentDetails(vmListPage, vmWizardNavigationPage);
      });

      await test.step('Location → Project: create missing project and verify it is selected', async () => {
        await createProjectFromLocationProjectDropdown(page, vmWizardNavigationPage, newProjectName);

        const locationProject = await vmWizardNavigationPage.getLocationProject();
        expect(
          locationProject,
          'Location should show the new project name after create-from-dropdown',
        ).toContain(newProjectName);
      });

      await test.step('Verify the new project exists in the cluster', async () => {
        apiClient.trackResource('Namespace', newProjectName);
        expect(
          await apiClient.namespaceExists(newProjectName),
          `Namespace '${newProjectName}' should exist after creation`,
        ).toBe(true);
      });
    });

    test('Location project dropdown hides system projects and the show-default toggle', async ({
      apiClient,
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

      const userProject = await setupTestNamespace(apiClient, 'wizard-user-proj');
      const systemProject = 'openshift';

      await test.step('Open wizard and Location project dropdown', async () => {
        await openWizardOnDeploymentDetails(vmListPage, vmWizardNavigationPage);
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

      await test.step('System project is not listed', async () => {
        const filter = page.getByTestId('dropdown-text-filter');
        await filter.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
        await filter.fill(systemProject);
        await expect(page.getByRole('menuitem', { name: systemProject, exact: true })).toHaveCount(
          0,
        );
      });

      await test.step('User project is listed', async () => {
        const filter = page.getByTestId('dropdown-text-filter');
        await filter.clear();
        await filter.fill(userProject);
        await expect(
          page.getByRole('menuitem', { name: userProject, exact: true }),
        ).toBeVisible();
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
        await expect(createButton, 'Create should be enabled in all-namespaces scope').toBeEnabled();
      });

      await test.step('Create opens the VM wizard', async () => {
        await vmWizardNavigationPage.openWizardFromCreateDropdown();
        expect(await vmWizardNavigationPage.verifyWizardVisible(), 'Wizard should open').toBe(true);
      });
    });
  },
);

test.describe(
  'VM Creation Wizard — Location project selection (non-privileged)',
  { tag: [ROUTE_VM_WIZARD_TAG, T1_TAG, '@catalog-wizard', NONPRIV_TAG] },
  () => {
    test('Create is enabled from all-namespaces and Location is not forced to default', async ({
      page,
      testConfig,
      vmListPage,
      vmWizardNavigationPage,
      utils,
    }) => {
      test.skip(!utils.EnvVariables.isNonPrivUser, 'Requires NON_PRIV=1');
      await utils.withAllure({
        suite: 'VM Creation Wizard',
        feature: T1,
        tags: [T1_TAG, NONPRIV_TAG],
      });

      const testNamespace = testConfig.testNamespace;

      await test.step('Open all-namespaces VirtualMachines list', async () => {
        await vmListPage.switchToVirtualizationPerspective();
        await vmListPage.navigateToAllNamespacesVirtualMachines();
      });

      await test.step('Create control is enabled for non-privileged user', async () => {
        const createButton = page.getByTestId('item-create').first();
        await createButton.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
        await expect(
          createButton,
          'Create should be enabled in all-namespaces for non-privileged users',
        ).toBeEnabled();
      });

      await test.step('Open wizard; project is not forced to default', async () => {
        await vmWizardNavigationPage.openWizardFromCreateDropdown();
        expect(await vmWizardNavigationPage.verifyWizardVisible(), 'Wizard should open').toBe(
          true,
        );
        expect(
          await vmWizardNavigationPage.verifyLocationSectionVisible(),
          'Location section should be visible',
        ).toBe(true);

        // Without create rights in `default`, resolveWizardNamespace leaves project empty and
        // DeploymentDetailsStep auto-opens Location edit (namespace dropdown visible).
        const projectToggle = page
          .locator('.vm-creation-wizard')
          .getByTestId('namespace-dropdown-menu-toggle')
          .first();
        await expect(
          projectToggle,
          'Location should auto-open edit when project is empty',
        ).toBeVisible({ timeout: TestTimeouts.ELEMENT_WAIT });

        const locationProject = await vmWizardNavigationPage.getLocationProject();
        expect(
          locationProject.trim().toLowerCase(),
          'Location must not preselect default when the user cannot create VMs there',
        ).not.toBe('default');
      });

      await test.step('Select the non-priv test namespace in Location', async () => {
        await vmWizardNavigationPage.selectLocationProject(testNamespace);

        const locationProject = await vmWizardNavigationPage.getLocationProject();
        expect(
          locationProject,
          'Location should show the selected non-priv test namespace',
        ).toContain(testNamespace);
      });
    });
  },
);
