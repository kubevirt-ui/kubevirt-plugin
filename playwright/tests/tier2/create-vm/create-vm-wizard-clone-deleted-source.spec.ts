import { ADMIN_ONLY_TAG, T2, T2_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/create-vm-fixture';
import VmDetailPage from '@/page-objects/vm/vm-detail-page';
import { TEMPLATE_METADATA_NAMES } from '@/utils/template-constants';
import { setupTestNamespace } from '@/utils/test-setup-helpers';

const SUITE = 'VM Creation Wizard';

test.describe(
  'VM Creation Wizard — Clone existing VirtualMachine',
  { tag: [T2_TAG, '@catalog-wizard', ADMIN_ONLY_TAG] },
  () => {
    test('Shows an error when the source VM is deleted before cloning completes', async ({
      apiClient,
      context,
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

      const cloneNs = await setupTestNamespace(apiClient, 'wizard-clone-del');
      const sourceVmName = utils.generateRandomVmName('clone-src');
      await test.step('Precondition: Create a running source VM via K8s API', async () => {
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

      await test.step('Open Create VM wizard and select Clone existing VirtualMachine', async () => {
        await vmListPage.navigateToProjectVmListViaUI(cloneNs);
        await vmWizardNavigationPage.openWizardFromCreateDropdown();

        const wizardVisible = await vmWizardNavigationPage.verifyWizardVisible();
        expect(wizardVisible, 'Wizard should open').toBe(true);

        await vmWizardNavigationPage.selectCreationMethod('cloneVm');
        await vmWizardNavigationPage.clickNext();
      });

      await test.step('Select the source VM and advance to Review and create', async () => {
        const sourceStepVisible = await vmWizardNavigationPage.verifyCloneSourceStepVisible();
        expect(sourceStepVisible, 'Source step should be visible').toBe(true);

        await vmWizardNavigationPage.searchCloneSourceByName(sourceVmName);
        await vmWizardNavigationPage.selectCloneSourceVm(sourceVmName);
        await vmWizardNavigationPage.clickNext();

        const reviewVisible = await vmWizardComputePage.verifyReviewStepVisible();
        expect(reviewVisible, 'Review and create step should be visible').toBe(true);
      });

      await test.step('In a second console tab, stop and delete the source VM', async () => {
        const secondTab = await context.newPage();
        const vmDetailPage = new VmDetailPage(secondTab);

        await vmDetailPage.navigateToVirtualMachineDetail(sourceVmName, cloneNs);
        await vmDetailPage.stopVmFromActionsDropdown();
        await utils.waitForVirtualMachineStopped(
          apiClient,
          sourceVmName,
          cloneNs,
          utils.TestTimeouts.VM_BOOTUP,
        );
        await vmDetailPage.clickVmActionsDropdown();
        await vmDetailPage.deleteVm();
        await apiClient.waitForVmDeleted(sourceVmName, cloneNs);
        await secondTab.close();
      });

      await test.step('Submit clone and verify an error is shown', async () => {
        await vmWizardNavigationPage.clickCloneVm();
        const errorAlert = await vmWizardNavigationPage.getWizardErrorAlertMessage();
        expect
          .soft(errorAlert, 'Wizard should show a danger alert after clone failure')
          .toContain('An error occurred');
        expect(errorAlert, `Error should mention that ${sourceVmName} no longer exists`).toContain(
          `${sourceVmName} VirtualMachine no longer exists`,
        );

        const reviewStillVisible = await vmWizardComputePage.verifyReviewStepVisible();
        expect(reviewStillVisible, 'Wizard should remain on Review and create').toBe(true);
      });
    });
  },
);
