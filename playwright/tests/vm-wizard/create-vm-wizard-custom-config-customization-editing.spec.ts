import { ADMIN_ONLY_TAG, T1, T1_TAG } from '@/data-models/allure-constants';
import { ROUTE_VM_WIZARD_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/create-vm-fixture';

const SUITE = 'VM Creation Wizard';

test.describe(
  'VM Creation Wizard — Custom configuration: Customization editing and persistence',
  { tag: [ROUTE_VM_WIZARD_TAG, T1_TAG, '@catalog-wizard', ADMIN_ONLY_TAG] },
  () => {
    test('Description edit persists across Back/Next navigation', async ({
      apiClient,
      vmListPage,
      vmWizardNavigationPage,
      vmWizardBootSourcePage,
      vmWizardComputePage,
      utils,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_MEDIUM);
      await utils.withAllure({
        suite: SUITE,
        feature: T1,
        tags: [T1_TAG],
      });

      const wizardNs = await utils.setupTestNamespace(apiClient, 'wizard-custom-edit');

      await vmListPage.switchToVirtualizationPerspective();
      await vmListPage.navigateToProjectVmListViaUI(wizardNs);
      await vmWizardNavigationPage.openWizardFromCreateDropdown();

      const wizardVisible = await vmWizardNavigationPage.verifyWizardVisible();
      expect(wizardVisible, 'Wizard should open').toBe(true);

      await test.step('Step 1: Deployment details — Custom configuration, generate name', async () => {
        const isCustomSelected =
          await vmWizardNavigationPage.verifyCreationMethodCardSelected('newVm');
        expect
          .soft(isCustomSelected, 'Custom configuration should be selected by default')
          .toBe(true);

        await vmWizardNavigationPage.generateVmName();
        await vmWizardNavigationPage.clickNext();
      });

      await test.step('Step 2: Guest OS — wait for async OS type load, then Next', async () => {
        await expect
          .poll(() => vmWizardNavigationPage.isNextButtonDisabled(), {
            message: 'Next should enable once the guest OS type list finishes loading',
            timeout: utils.TestTimeouts.UI_ACTION_COMPLETE,
          })
          .toBe(false);

        const selectedOs = await vmWizardNavigationPage.getSelectedOsType();
        expect.soft(selectedOs.length, 'A guest OS type should be pre-selected').toBeGreaterThan(0);

        await vmWizardNavigationPage.clickNext();
      });

      await test.step('Step 3: Boot source — select no boot source', async () => {
        const bootStepVisible = await vmWizardBootSourcePage.verifyBootSourceStepVisible();
        expect.soft(bootStepVisible, 'Boot source step should be visible').toBe(true);

        await vmWizardBootSourcePage.selectNoBootSource();
        await vmWizardNavigationPage.clickNext();
      });

      await test.step('Step 4: Compute resources — select a stable instance type and size', async () => {
        const computeVisible = await vmWizardComputePage.verifyComputeResourcesStepVisible();
        expect.soft(computeVisible, 'Compute resources step should be visible').toBe(true);

        await vmWizardComputePage.selectInstanceTypeSeries('u');
        await vmWizardComputePage.selectComputeSize('medium');
        await vmWizardNavigationPage.clickNext();
      });

      let vmName = '';

      await test.step('Step 5: Customization — edit Description', async () => {
        const custVisible = await vmWizardComputePage.verifyCustomizationStepVisible();
        expect(custVisible, 'Customization step should be visible').toBe(true);

        vmName = await vmWizardComputePage.getCustomizationVmName();
        expect(vmName.length, 'VM name should be available on the Details tab').toBeGreaterThan(0);

        await vmWizardComputePage.openCustomizationDescriptionModal(vmName);
        await vmWizardComputePage.fillCustomizationDescriptionModal('persisted description');
        await vmWizardComputePage.saveCustomizationDescriptionModal();

        await expect
          .poll(() => vmWizardComputePage.getCustomizationDescription(vmName), {
            message: 'The edited description should render immediately',
            timeout: utils.TestTimeouts.UI_ACTION_COMPLETE,
          })
          .toContain('persisted description');
      });

      await test.step('Back to Compute resources, then Next — edits should persist', async () => {
        await vmWizardNavigationPage.clickBack();
        const computeVisible = await vmWizardComputePage.verifyComputeResourcesStepVisible();
        expect(computeVisible, 'Back should return to Compute resources step').toBe(true);

        await vmWizardNavigationPage.clickNext();
        const custVisible = await vmWizardComputePage.verifyCustomizationStepVisible();
        expect(custVisible, 'Next should return to Customization step').toBe(true);

        const description = await vmWizardComputePage.getCustomizationDescription(vmName);
        expect(description, 'Description edit should persist after Back/Next').toContain(
          'persisted description',
        );
      });
    });
  },
);
