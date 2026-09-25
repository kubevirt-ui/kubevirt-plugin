import { ADMIN_ONLY_TAG, T2, T2_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/create-vm-fixture';
import { TEMPLATE_METADATA_NAMES } from '@/utils/template-constants';
import { setupTestNamespace } from '@/utils/test-setup-helpers';

const SUITE = 'VM Creation Wizard';

test.describe(
  'VM Creation Wizard — Clone existing VirtualMachine: Review step values',
  { tag: [T2_TAG, '@catalog-wizard', ADMIN_ONLY_TAG] },
  () => {
    test('Clone wizard selects the first available source VM and the Review step displays it', async ({
      apiClient,
      vmListPage,
      vmWizardNavigationPage,
      vmWizardComputePage,
      utils,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_EXTENDED);
      await utils.withAllure({
        suite: SUITE,
        feature: T2,
        tags: [T2_TAG],
      });

      const cloneNs = await setupTestNamespace(apiClient, 'wizard-clone-review');
      const sourceVmName = utils.generateRandomVmName('clone-src');

      await test.step('Precondition: Create source VM via K8s API', async () => {
        await apiClient.createVmFromTemplate(
          TEMPLATE_METADATA_NAMES.RHEL9,
          sourceVmName,
          cloneNs,
          'openshift',
          true,
        );
        apiClient.trackResource('VirtualMachine', sourceVmName, cloneNs);
        await utils.waitForVirtualMachineReady(
          apiClient,
          sourceVmName,
          cloneNs,
          utils.TestTimeouts.VM_BOOTUP,
        );
      });

      await vmListPage.switchToVirtualizationPerspective();
      await vmListPage.navigateToProjectVmListViaUI(cloneNs);
      await vmWizardNavigationPage.openWizardFromCreateDropdown();

      const wizardVisible = await vmWizardNavigationPage.verifyWizardVisible();
      expect(wizardVisible, 'Wizard should open').toBe(true);

      await test.step('Step 1: Deployment details — select Clone existing VirtualMachine', async () => {
        await vmWizardNavigationPage.selectCreationMethod('cloneVm');

        const isCloneSelected =
          await vmWizardNavigationPage.verifyCreationMethodCardSelected('cloneVm');
        expect.soft(isCloneSelected, 'Clone existing VirtualMachine should be selected').toBe(true);

        const nextDisabled = await vmWizardNavigationPage.isNextButtonDisabled();
        expect(
          nextDisabled,
          'Next should already be enabled for Clone — Name is not required at this step',
        ).toBe(false);

        await vmWizardNavigationPage.clickNext();
      });

      await test.step('Step 2: Source — select the first available VirtualMachine', async () => {
        const sourceStepVisible = await vmWizardNavigationPage.verifyCloneSourceStepVisible();
        expect(sourceStepVisible, 'Source step heading should be visible').toBe(true);

        const vmListVisible = await vmWizardNavigationPage.verifyCloneVmListVisible();
        expect(vmListVisible, 'VM list should be visible in Source step').toBe(true);

        await vmWizardNavigationPage.selectFirstAvailableCloneSourceVm();

        const nextDisabled = await vmWizardNavigationPage.isNextButtonDisabled();
        expect(nextDisabled, 'Next should be enabled after selecting a source VM').toBe(false);

        await vmWizardNavigationPage.clickNext();
      });

      let cloneVmName = '';

      await test.step('Step 3: Review and create — verify Name and Description are displayed', async () => {
        const reviewVisible = await vmWizardComputePage.verifyReviewStepVisible();
        expect(reviewVisible, 'Review step should be visible').toBe(true);

        const sectionsVisible = await vmWizardComputePage.verifyReviewSectionsVisible();
        expect
          .soft(
            sectionsVisible,
            'Review sections (Details, Storage, Network, Hardware devices) should be visible',
          )
          .toBe(true);

        cloneVmName = await vmWizardComputePage.getReviewVmName();
        expect(cloneVmName.length, 'Clone VM name should be auto-generated').toBeGreaterThan(0);
        expect.soft(cloneVmName, 'Clone name should contain "clone"').toContain('clone');

        const nameEditable = await vmWizardComputePage.verifyReviewNameEditable();
        expect.soft(nameEditable, 'Clone VM name should be editable in review').toBe(true);

        const reviewDescription = await vmWizardComputePage.getReviewDescription();
        expect(reviewDescription, 'Description should initially be empty').toBe('');

        const descriptionEditable = await vmWizardComputePage.verifyReviewDescriptionEditable();
        expect(descriptionEditable, 'Description should be editable in Review').toBe(true);

        const createButtonText = await vmWizardComputePage.getCreateButtonText();
        expect
          .soft(createButtonText, 'Create button should say "Clone VirtualMachine"')
          .toContain('Clone');

        apiClient.trackResource('VirtualMachine', cloneVmName, cloneNs);
        // Clone flow: the footer button reads "Clone VirtualMachine", not "Create VirtualMachine".
        await vmWizardNavigationPage.clickCloneVm();
        const redirected = await vmWizardNavigationPage.verifyRedirectedToVmDetails();
        expect(redirected, 'Should redirect to VM details after cloning').toBe(true);
      });

      await test.step('Verify clone VM exists', async () => {
        const urlCloneName = await vmWizardNavigationPage.getCreatedVmNameFromUrl();
        if (urlCloneName) cloneVmName = urlCloneName;
        apiClient.trackResource('VirtualMachine', cloneVmName, cloneNs);

        const result = await apiClient.verifyVmCreated(cloneVmName, cloneNs);
        expect.soft(result.exists, `Clone VM '${cloneVmName}' should exist`).toBe(true);
      });
    });
  },
);
