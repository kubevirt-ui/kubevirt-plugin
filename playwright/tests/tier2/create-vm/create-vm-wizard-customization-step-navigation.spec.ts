import { ADMIN_ONLY_TAG, T2, T2_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/create-vm-fixture';
import { setupTestNamespace } from '@/utils/test-setup-helpers';
import {
  completeBootSourceStep,
  completeDeploymentDetailsStep,
  completeGuestOsStep,
  verifyComputeResourcesStep,
} from '@/utils/vm-wizard-test-helpers';

const SUITE = 'VM Creation Wizard';

test.describe(
  'VM Creation Wizard — Customization step navigation',
  { tag: [T2_TAG, '@catalog-wizard', ADMIN_ONLY_TAG] },
  () => {
    test('Customization step stays disabled until compute resources is completed', async ({
      apiClient,
      vmListPage,
      vmWizardNavigationPage,
      vmWizardBootSourcePage,
      vmWizardComputePage,
      utils,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_EXTENDED);
      await utils.withAllure({
        suite: SUITE,
        feature: T2,
        tags: [T2_TAG],
      });

      const wizardNs = await setupTestNamespace(apiClient, 'wizard-custom-nav');

      await vmListPage.switchToVirtualizationPerspective();
      await vmListPage.navigateToProjectVmListViaUI(wizardNs);
      await vmWizardNavigationPage.openWizardFromCreateDropdown();

      const wizardVisible = await vmWizardNavigationPage.verifyWizardVisible();
      expect(wizardVisible, 'Wizard should open').toBe(true);

      await test.step('Navigate to compute resources without advancing past it', async () => {
        await completeDeploymentDetailsStep(vmWizardNavigationPage);
        await completeGuestOsStep(vmWizardNavigationPage);
        await completeBootSourceStep(vmWizardBootSourcePage, vmWizardNavigationPage);
        await verifyComputeResourcesStep(vmWizardComputePage);
      });

      await test.step('Go back to Guest OS and verify Customization is disabled', async () => {
        await vmWizardNavigationPage.clickBack();
        await vmWizardNavigationPage.clickBack();
        const customizationDisabled =
          await vmWizardNavigationPage.isWizardNavStepDisabled('Customization');
        expect(
          customizationDisabled,
          'Customization step should be disabled before compute resources is completed',
        ).toBe(true);

        await vmWizardNavigationPage.clickWizardNavStep('Customization');
      });

      await test.step('Complete compute resources and reach Customization with tabs', async () => {
        await vmWizardNavigationPage.clickNext();
        await vmWizardNavigationPage.clickNext();

        const computeVisible = await vmWizardComputePage.verifyComputeResourcesStepVisible();
        expect(computeVisible, 'Compute resources step should be visible again').toBe(true);

        await vmWizardNavigationPage.clickNext();

        const customizationVisible = await vmWizardComputePage.verifyCustomizationStepVisible();
        expect(customizationVisible, 'Customization step should be visible').toBe(true);

        const tabsVisible = await vmWizardComputePage.verifyCustomizationTabsVisible();
        expect(
          tabsVisible,
          'Customization tabs (Details, Storage, Network, etc.) should be visible',
        ).toBe(true);
      });
    });
  },
);
