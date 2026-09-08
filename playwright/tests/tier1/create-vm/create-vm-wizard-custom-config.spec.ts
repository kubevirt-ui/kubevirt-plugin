import { ADMIN_ONLY_TAG, T1, T1_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/create-vm-fixture';
import { setupTestNamespace } from '@/utils/test-setup-helpers';
import {
  completeBootSourceStep,
  completeComputeResourcesStep,
  completeDeploymentDetailsStep,
  completeGuestOsStep,
} from '@/utils/vm-wizard-test-helpers';

const SUITE = 'VM Creation Wizard';

test.describe(
  'VM Creation Wizard — Custom configuration happy path',
  { tag: [T1_TAG, '@catalog-wizard', ADMIN_ONLY_TAG] },
  () => {
    test('Custom configuration wizard creates a RHEL VM through all steps and reaches Running state', async ({
      apiClient,
      vmListPage,
      vmWizardNavigationPage,
      vmWizardBootSourcePage,
      vmWizardComputePage,
      utils,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_VM_CREATION);
      await utils.withAllure({
        suite: SUITE,
        feature: T1,
        tags: [T1_TAG],
      });

      const wizardNs = await setupTestNamespace(apiClient, 'wizard-custom');

      await vmListPage.switchToVirtualizationPerspective();
      await vmListPage.navigateToProjectVmListViaUI(wizardNs);
      await vmWizardNavigationPage.openWizardFromCreateDropdown();

      const wizardVisible = await vmWizardNavigationPage.verifyWizardVisible();
      expect(wizardVisible, 'Wizard should open').toBe(true);

      await test.step('Step 1: Deployment details — select Custom configuration and generate name', async () => {
        await completeDeploymentDetailsStep(vmWizardNavigationPage);
      });

      await test.step('Step 2: Guest OS — verify OS tiles and default selection', async () => {
        await completeGuestOsStep(vmWizardNavigationPage);
      });

      await test.step('Step 3: Boot source — select a boot volume', async () => {
        await completeBootSourceStep(vmWizardBootSourcePage, vmWizardNavigationPage);
      });

      await test.step('Step 4: Compute resources — verify series and size', async () => {
        await completeComputeResourcesStep(vmWizardComputePage, vmWizardNavigationPage);
      });

      await test.step('Step 5: Customization — verify tabs and settings', async () => {
        const custVisible = await vmWizardComputePage.verifyCustomizationStepVisible();
        expect.soft(custVisible, 'Customization step should be visible').toBe(true);

        const tabsVisible = await vmWizardComputePage.verifyCustomizationTabsVisible();
        expect
          .soft(
            tabsVisible,
            'Customization tabs (Details, Storage, Network, etc.) should be visible',
          )
          .toBe(true);

        const searchVisible = await vmWizardComputePage.verifyCustomizationSearchInputVisible();
        expect.soft(searchVisible, 'Find settings search input should be visible').toBe(true);

        await test.step('Empty annotation rows cannot be saved', async () => {
          await vmWizardComputePage.selectCustomizationTab('Labels and annotations');
          await vmWizardComputePage.openAnnotationsModal();
          await vmWizardComputePage.clickAddMoreInAnnotationsModal();

          const saveDisabled = await vmWizardComputePage.isAnnotationsModalSaveDisabled();
          expect(saveDisabled, 'Save should be disabled for empty annotation fields').toBe(true);

          await vmWizardComputePage.closeAnnotationsModal();
        });

        await vmWizardNavigationPage.clickNext();
      });

      await test.step('Step 6: Review and create — verify summary and create VM', async () => {
        const reviewVisible = await vmWizardComputePage.verifyReviewStepVisible();
        expect(reviewVisible, 'Review step should be visible').toBe(true);

        const sectionsVisible = await vmWizardComputePage.verifyReviewSectionsVisible();
        expect
          .soft(
            sectionsVisible,
            'Review sections (Details, Storage, Network, Hardware devices) should be visible',
          )
          .toBe(true);

        const checkboxVisible = await vmWizardComputePage.verifyStartAfterCreationCheckbox();
        expect.soft(checkboxVisible, 'Start after creation checkbox should be visible').toBe(true);

        await vmWizardNavigationPage.clickCreateVm();
        const redirected = await vmWizardNavigationPage.verifyRedirectedToVmDetails();
        expect(redirected, 'Should redirect to VM details after creation').toBe(true);
      });

      await test.step('Verify VM resource was created', async () => {
        const vmName = await vmWizardNavigationPage.getCreatedVmNameFromUrl();
        expect(vmName.length, 'VM name should be in the URL').toBeGreaterThan(0);
        apiClient.trackResource('VirtualMachine', vmName, wizardNs);

        const result = await apiClient.verifyVmCreated(vmName, wizardNs);
        expect.soft(result.exists, `VM '${vmName}' should exist`).toBe(true);
      });
    });
  },
);
