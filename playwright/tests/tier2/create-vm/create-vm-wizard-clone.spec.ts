import { ADMIN_ONLY_TAG, T2, T2_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/create-vm-fixture';
import { TEMPLATE_METADATA_NAMES } from '@/utils/template-constants';
import { setupTestNamespace } from '@/utils/test-setup-helpers';

const SUITE = 'VM Creation Wizard';

test.describe(
  'VM Creation Wizard — Clone existing VirtualMachine',
  { tag: [T2_TAG, '@catalog-wizard', ADMIN_ONLY_TAG] },
  () => {
    test('Clone wizard selects a source VM, creates a clone, and the clone reaches Running state', async ({
      k8sClient,
      vmTreePage,
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

      const cloneNs = await setupTestNamespace(k8sClient, 'wizard-clone');
      const sourceVmName = utils.generateRandomVmName('clone-src');

      await test.step('Precondition: Create source VM via K8s API', async () => {
        await k8sClient.createVmFromTemplate(
          TEMPLATE_METADATA_NAMES.RHEL9,
          sourceVmName,
          cloneNs,
          'openshift',
          true,
        );
        k8sClient.trackResource('VirtualMachine', sourceVmName, cloneNs);
        await utils.waitForVirtualMachineReady(
          k8sClient,
          sourceVmName,
          cloneNs,
          utils.TestTimeouts.VM_BOOTUP,
        );
      });

      await vmTreePage.switchToVirtualizationPerspective();

      await test.step('Step 1: Deployment details — select Clone existing VirtualMachine', async () => {
        await vmTreePage.navigateToProjectVmListViaUI(cloneNs);
        await vmWizardNavigationPage.openWizardFromCreateDropdown();

        const wizardVisible = await vmWizardNavigationPage.verifyWizardVisible();
        expect(wizardVisible, 'Wizard should open').toBe(true);

        await vmWizardNavigationPage.selectCreationMethod('cloneVm');

        const isCloneSelected =
          await vmWizardNavigationPage.verifyCreationMethodCardSelected('cloneVm');
        expect.soft(isCloneSelected, 'Clone existing VirtualMachine should be selected').toBe(true);

        await vmWizardNavigationPage.clickNext();
      });

      await test.step('Step 2: Source — verify VM list and select source VM', async () => {
        const sourceStepVisible = await vmWizardNavigationPage.verifyCloneSourceStepVisible();
        expect(sourceStepVisible, 'Source step heading should be visible').toBe(true);

        const descVisible = await vmWizardNavigationPage.verifyCloneSourceDescription();
        expect.soft(descVisible, 'Source description should be visible').toBe(true);

        const vmListVisible = await vmWizardNavigationPage.verifyCloneVmListVisible();
        expect(vmListVisible, 'VM list should be visible in Source step').toBe(true);

        await vmWizardNavigationPage.searchCloneSourceByName(sourceVmName);
        await vmWizardNavigationPage.selectCloneSourceVm(sourceVmName);

        const nextDisabled = await vmWizardNavigationPage.isNextButtonDisabled();
        expect(nextDisabled, 'Next should be enabled after selecting a source VM').toBe(false);

        await vmWizardNavigationPage.clickNext();
      });

      let cloneVmName = '';

      await test.step('Step 3: Review and create — verify clone summary and create', async () => {
        const reviewVisible = await vmWizardComputePage.verifyReviewStepVisible();
        expect(reviewVisible, 'Review step should be visible').toBe(true);

        cloneVmName = await vmWizardComputePage.getReviewVmName();
        expect(cloneVmName.length, 'Clone VM name should be auto-generated').toBeGreaterThan(0);
        expect.soft(cloneVmName, 'Clone name should contain "clone"').toContain('clone');

        const nameEditable = await vmWizardComputePage.verifyReviewNameEditable();
        expect.soft(nameEditable, 'Clone VM name should be editable in review').toBe(true);

        const checkboxVisible = await vmWizardComputePage.verifyStartAfterCreationCheckbox();
        expect.soft(checkboxVisible, 'Start after creation checkbox should be visible').toBe(true);

        const createButtonText = await vmWizardComputePage.getCreateButtonText();
        expect
          .soft(createButtonText, 'Create button should say "Clone VirtualMachine"')
          .toContain('Clone');

        k8sClient.trackResource('VirtualMachine', cloneVmName, cloneNs);
        await vmWizardNavigationPage.clickCreateVm();
        const redirected = await vmWizardNavigationPage.verifyRedirectedToVmDetails();
        expect(redirected, 'Should redirect to VM details after cloning').toBe(true);
      });

      await test.step('Verify clone VM exists and reaches Running state', async () => {
        const urlCloneName = await vmWizardNavigationPage.getCreatedVmNameFromUrl();
        if (urlCloneName) cloneVmName = urlCloneName;
        k8sClient.trackResource('VirtualMachine', cloneVmName, cloneNs);

        const result = await k8sClient.verifyVmCreated(
          cloneVmName,
          cloneNs,
          utils.TestTimeouts.VM_BOOTUP,
        );
        expect.soft(result.exists, `Clone VM '${cloneVmName}' should exist`).toBe(true);
      });
    });
  },
);
