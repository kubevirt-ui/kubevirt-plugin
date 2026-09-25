import { ADMIN_ONLY_TAG, T1, T1_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/create-vm-fixture';
import { setupTestNamespace } from '@/utils/test-setup-helpers';

const SUITE = 'VM Creation Wizard';

test.describe(
  'VM Creation Wizard — Draft is reset after the wizard is closed',
  { tag: [T1_TAG, '@catalog-wizard', ADMIN_ONLY_TAG] },
  () => {
    test('Cancelling the wizard discards entered data — reopening starts from a clean draft', async ({
      vmListPage,
      vmWizardNavigationPage,
      utils,
      testConfig,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_SHORT);
      await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG] });

      await vmListPage.switchToVirtualizationPerspective();
      await vmListPage.navigateToProjectVmListViaUI(testConfig.testNamespace);
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

      await vmWizardNavigationPage.cancelWizard();
    });

    test('Successfully creating a VM discards the draft — reopening starts from a clean draft', async ({
      apiClient,
      vmListPage,
      vmWizardNavigationPage,
      vmWizardBootSourcePage,
      vmWizardComputePage,
      utils,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_VM_CREATION);
      await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG] });

      const wizardNs = await setupTestNamespace(apiClient, 'wizard-reset-create');

      await vmListPage.switchToVirtualizationPerspective();
      await vmListPage.navigateToProjectVmListViaUI(wizardNs);
      await vmWizardNavigationPage.openWizardFromCreateDropdown();

      let defaultOs = '';
      let selectedWindowsOs = '';

      await test.step('Complete the wizard and create a VM', async () => {
        await vmWizardNavigationPage.generateVmName();
        await vmWizardNavigationPage.clickNext();

        await expect
          .poll(() => vmWizardNavigationPage.isNextButtonDisabled(), {
            timeout: utils.TestTimeouts.UI_ELEMENT_VISIBILITY,
          })
          .toBe(false);

        defaultOs = await vmWizardNavigationPage.getSelectedOsType();
        expect(defaultOs.length, 'A default guest OS should be selected').toBeGreaterThan(0);

        await vmWizardNavigationPage.selectOperatingSystem('windows');
        await expect
          .poll(() => vmWizardNavigationPage.isNextButtonDisabled(), {
            message: 'Next should enable once the Windows guest OS type list finishes loading',
            timeout: utils.TestTimeouts.UI_ELEMENT_VISIBILITY,
          })
          .toBe(false);
        selectedWindowsOs = await vmWizardNavigationPage.getSelectedOsType();
        expect(
          selectedWindowsOs,
          'Windows selection should differ from the default guest OS',
        ).not.toBe(defaultOs);
        await vmWizardNavigationPage.clickNext();

        await vmWizardBootSourcePage.selectNoBootSource();
        await vmWizardNavigationPage.clickNext();

        const computeVisible = await vmWizardComputePage.verifyComputeResourcesStepVisible();
        expect(computeVisible, 'Compute resources step should be visible').toBe(true);

        // Expected behavior: "No boot source" has no boot-volume-derived default, so no
        // instance type is preselected here. An explicit series/size pick is required
        // before Next enables. The smallest size (u1.nano, 512Mi) is below the memory
        // some guest OS preferences require (e.g. windows.10 needs 2Gi, windows.11 needs
        // 4Gi/2 vCPU), so pick a size with enough headroom for any preference selected —
        // Windows in this test.
        await vmWizardComputePage.selectInstanceTypeSeries('u');
        await vmWizardComputePage.selectComputeSize('large');
        await expect
          .poll(() => vmWizardNavigationPage.isNextButtonDisabled(), {
            message: 'Next should enable once an instance type series/size is selected',
            timeout: utils.TestTimeouts.UI_ELEMENT_VISIBILITY,
          })
          .toBe(false);
        await vmWizardNavigationPage.clickNext();

        const vmName = await vmWizardComputePage.getCustomizationVmName();
        await vmWizardComputePage.openCustomizationDescriptionModal(vmName);
        await vmWizardComputePage.fillCustomizationDescriptionModal('test');
        await vmWizardComputePage.saveCustomizationDescriptionModal();

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
        await vmListPage.navigateToProjectVmListViaUI(wizardNs);
        await vmWizardNavigationPage.openWizardFromCreateDropdown();

        const isCustomSelected =
          await vmWizardNavigationPage.verifyCreationMethodCardSelected('newVm');
        expect(
          isCustomSelected,
          'Creation method should reset to the default (Custom configuration)',
        ).toBe(true);

        const nextDisabled = await vmWizardNavigationPage.isNextButtonDisabled();
        expect(nextDisabled, 'Next should be disabled again — the Name field was reset').toBe(true);

        await vmWizardNavigationPage.generateVmName();
        await vmWizardNavigationPage.clickNext();

        await expect
          .poll(() => vmWizardNavigationPage.getSelectedOsType(), {
            message: 'Guest OS type should reset to its default, not the previous session',
            timeout: utils.TestTimeouts.UI_ELEMENT_VISIBILITY,
          })
          .toBe(defaultOs);

        const reopenedOs = await vmWizardNavigationPage.getSelectedOsType();
        expect(reopenedOs, 'The previous Windows selection should be discarded').not.toBe(
          selectedWindowsOs,
        );
      });

      await vmWizardNavigationPage.cancelWizard();
    });
  },
);
