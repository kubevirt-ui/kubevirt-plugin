import { ADMIN_ONLY_TAG, T1, T1_TAG } from '@/data-models/allure-constants';
import { ROUTE_VM_WIZARD_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/create-vm-fixture';

const SUITE = 'VM Creation Wizard';
const RHEL9_TEMPLATE = 'rhel9-server-small';

test.describe(
  'VM Creation Wizard — Draft is reset after the wizard is closed',
  { tag: [ROUTE_VM_WIZARD_TAG, T1_TAG, '@catalog-wizard', ADMIN_ONLY_TAG] },
  () => {
    test('Cancelling the wizard discards entered data — reopening starts from a clean draft', async ({
      vmListPage,
      vmWizardNavigationPage,
      utils,
      testConfig,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_SHORT);
      await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG] });

      await vmListPage.navigateToProjectVirtualMachines(testConfig.testNamespace);
      await vmWizardNavigationPage.openWizardFromCreateDropdown();

      await test.step('Fill in data and select a non-default creation method', async () => {
        await vmWizardNavigationPage.selectCreationMethod('cloneVm');
        const isCloneSelected =
          await vmWizardNavigationPage.verifyCreationMethodCardSelected('cloneVm');
        expect.soft(isCloneSelected, 'Clone should be selected before cancelling').toBe(true);
      });

      await vmWizardNavigationPage.cancelWizard();

      await test.step('Reopen the wizard and verify the draft was reset', async () => {
        await vmWizardNavigationPage.openWizardFromCreateDropdown();

        const isCustomSelected =
          await vmWizardNavigationPage.verifyCreationMethodCardSelected('newVm');
        expect(
          isCustomSelected,
          'Creation method should reset to the default (Custom configuration)',
        ).toBe(true);

        const nextDisabled = await vmWizardNavigationPage.isNextButtonDisabled();
        expect(nextDisabled, 'Next should be disabled again — the Name field was reset').toBe(true);
      });
    });

    test('Successfully creating a VM discards the draft — reopening starts from a clean draft', async ({
      apiClient,
      vmListPage,
      vmWizardNavigationPage,
      utils,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_MEDIUM);
      await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG] });

      const wizardNs = await utils.setupTestNamespace(apiClient, 'wizard-reset-create');

      await vmListPage.navigateToProjectVmListViaUI(wizardNs);
      await vmWizardNavigationPage.openWizardFromCreateDropdown();

      await test.step('Complete the shortest deterministic wizard flow', async () => {
        await vmWizardNavigationPage.selectCreationMethod('fromTemplate');
        await vmWizardNavigationPage.generateVmName();
        await vmWizardNavigationPage.clickNext();

        await vmWizardNavigationPage.selectTemplateByTestId(RHEL9_TEMPLATE);
        await vmWizardNavigationPage.clickNext();
        await vmWizardNavigationPage.clickNext();
        await vmWizardNavigationPage.clickCreateVm();

        const redirected = await vmWizardNavigationPage.verifyRedirectedToVmDetails();
        expect(redirected, 'Should redirect to VM details after creation').toBe(true);

        const createdVmName = await vmWizardNavigationPage.getCreatedVmNameFromUrl();
        apiClient.trackResource('VirtualMachine', createdVmName, wizardNs);
        const result = await apiClient.verifyVmCreated(createdVmName, wizardNs);
        expect.soft(result.exists, `VM '${createdVmName}' should exist`).toBe(true);
      });

      await test.step('Reopen the wizard and verify the draft was reset', async () => {
        await utils.navigateToProjectVmListForNamespace(vmListPage, wizardNs);
        await vmWizardNavigationPage.openWizardFromCreateDropdown();

        const isCustomSelected =
          await vmWizardNavigationPage.verifyCreationMethodCardSelected('newVm');
        expect(
          isCustomSelected,
          'Creation method should reset to the default (Custom configuration)',
        ).toBe(true);

        const nextDisabled = await vmWizardNavigationPage.isNextButtonDisabled();
        expect(nextDisabled, 'Next should be disabled again — the Name field was reset').toBe(true);
      });
    });
  },
);
