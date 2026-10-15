import { ADMIN_ONLY_TAG, T1, T1_TAG } from '@/data-models/allure-constants';
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
  },
);
