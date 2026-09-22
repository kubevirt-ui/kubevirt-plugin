import { ADMIN_ONLY_TAG, T1, T1_TAG } from '@/data-models/allure-constants';
import SysprepModalComponent from '@/components/sysprep/sysprep-modal-component';
import { expect, test } from '@/fixtures/create-vm-fixture';
import { getVmSysprepConfigMapName } from '@/utils/sysprep-test-helpers';
import { setupTestNamespace } from '@/utils/test-setup-helpers';

const SUITE = 'VM Creation Wizard — Sysprep';

test.describe(
  SUITE,
  { tag: [T1_TAG, '@catalog-wizard', ADMIN_ONLY_TAG] },
  () => {
    test('Windows wizard with no boot source supports sysprep create, detach, and attach', async ({
      apiClient,
      vmListPage,
      vmWizardNavigationPage,
      vmWizardBootSourcePage,
      vmWizardComputePage,
      page,
      utils,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_VM_CREATION);
      await utils.withAllure({
        suite: SUITE,
        feature: T1,
        tags: [T1_TAG, '@catalog-wizard', ADMIN_ONLY_TAG],
      });

      const wizardNs = await setupTestNamespace(apiClient, 'wizard-sysprep');
      const sysprepModal = new SysprepModalComponent(page);
      let createdSysprepName = '';

      await vmListPage.switchToVirtualizationPerspective();
      await vmListPage.navigateToProjectVmListViaUI(wizardNs);
      await vmWizardNavigationPage.openWizardFromCreateDropdown();

      const wizardVisible = await vmWizardNavigationPage.verifyWizardVisible();
      expect(wizardVisible, 'Wizard should open').toBe(true);

      await test.step('Step 1: Deployment details — custom configuration', async () => {
        await vmWizardNavigationPage.selectLocationProject(wizardNs);
        await vmWizardNavigationPage.generateVmName();
        await vmWizardNavigationPage.clickNext();
      });

      await test.step('Step 2: Guest OS — select Windows', async () => {
        await vmWizardNavigationPage.selectOperatingSystem('windows');
        await vmWizardNavigationPage.clickNext();
      });

      await test.step('Step 3: Boot source — no boot source', async () => {
        const bootStepVisible = await vmWizardBootSourcePage.verifyBootSourceStepVisible();
        expect.soft(bootStepVisible, 'Boot source step should be visible').toBe(true);

        await vmWizardBootSourcePage.selectNoBootSource();
        await vmWizardNavigationPage.clickNext();
      });

      await test.step('Step 4: Compute resources — select instance type', async () => {
        const computeVisible = await vmWizardComputePage.verifyComputeResourcesStepVisible();
        expect.soft(computeVisible, 'Compute resources step should be visible').toBe(true);

        await vmWizardComputePage.selectInstanceTypeSeries('u');
        await vmWizardComputePage.selectLargestComputeSize();
        await vmWizardNavigationPage.clickNext();
      });

      await test.step('Step 5: Customization — sysprep lifecycle on Initial run', async () => {
        const custVisible = await vmWizardComputePage.verifyCustomizationStepVisible();
        expect.soft(custVisible, 'Customization step should be visible').toBe(true);

        await vmWizardComputePage.selectCustomizationTab('Initial run');

        const initialRunContent = await vmWizardComputePage.verifyInitialRunTabContent();
        expect.soft(initialRunContent.sysprepSection, 'Sysprep section should be visible').toBe(true);

        createdSysprepName = await sysprepModal.runCreateDetachAttachFlow();
        expect(createdSysprepName.length, 'Sysprep ConfigMap name should be visible').toBeGreaterThan(
          0,
        );
      });

      await test.step('Step 6: Review and create the Windows VM', async () => {
        await vmWizardNavigationPage.clickNext();

        const reviewVisible = await vmWizardComputePage.verifyReviewStepVisible();
        expect(reviewVisible, 'Review step should be visible').toBe(true);

        await vmWizardNavigationPage.clickCreateVm();
        const redirected = await vmWizardNavigationPage.verifyRedirectedToVmDetails();
        expect(redirected, 'Should redirect to VM details after creation').toBe(true);
      });

      await test.step('Verify created VM references the sysprep ConfigMap', async () => {
        const vmName = await vmWizardNavigationPage.getCreatedVmNameFromUrl();
        const vmNs = await vmWizardNavigationPage.getCreatedVmNamespaceFromUrl();

        expect(vmName.length, 'VM name should be in the URL').toBeGreaterThan(0);
        expect(vmNs, 'VM should be created in the test namespace').toBe(wizardNs);
        apiClient.trackResource('VirtualMachine', vmName, vmNs);

        const vm = await apiClient.getVirtualMachine(vmNs, vmName);
        expect(
          getVmSysprepConfigMapName(vm),
          'Created VM should reference the attached sysprep ConfigMap',
        ).toBe(createdSysprepName);
      });
    });
  },
);
