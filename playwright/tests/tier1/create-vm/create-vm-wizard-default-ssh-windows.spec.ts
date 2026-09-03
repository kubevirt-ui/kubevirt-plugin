import { ADMIN_ONLY_TAG, T1, T1_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/create-vm-fixture';
import {
  clearDefaultSSHKey,
  getVmAccessCredentials,
  setupDefaultSSHKey,
} from '@/utils/test-setup-helpers';

const SUITE = 'VM Creation Wizard';

test.describe(
  'VM Creation Wizard — default SSH key is not applied to Windows VMs',
  { tag: [T1_TAG, '@catalog-wizard', ADMIN_ONLY_TAG] },
  () => {
    test.afterEach(async ({ apiClient, testConfig }) => {
      try {
        await clearDefaultSSHKey({ client: apiClient, namespace: testConfig.testNamespace });
      } catch {
        // Best-effort: leftover mapping must not fail the spec after the assertion ran.
      }
    });

    test('Windows guest is created without accessCredentials when a default SSH key is set', async ({
      apiClient,
      testConfig,
      vmTreePage,
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

      const wizardNs = testConfig.testNamespace;
      const secretName = utils.generateRandomSecretName('ssh-key');
      await setupDefaultSSHKey({ client: apiClient, namespace: wizardNs, secretName });

      await vmTreePage.switchToVirtualizationPerspective();
      await vmTreePage.navigateToNamespaceVirtualMachines(wizardNs);
      await vmTreePage.clickVmListTab();
      await vmWizardNavigationPage.openWizardFromCreateDropdown();

      const wizardVisible = await vmWizardNavigationPage.verifyWizardVisible();
      expect(wizardVisible, 'Wizard should open').toBe(true);

      await test.step('Step 1: Deployment details — select Custom configuration and generate name', async () => {
        const isCustomSelected =
          await vmWizardNavigationPage.verifyCreationMethodCardSelected('newVm');
        expect
          .soft(isCustomSelected, 'Custom configuration should be selected by default')
          .toBe(true);

        await vmWizardNavigationPage.selectLocationProject(wizardNs);
        await vmWizardNavigationPage.generateVmName();
        const wizardProject = await vmWizardNavigationPage.getLocationProject();
        expect(wizardProject, 'Wizard project should be the test namespace').toContain(wizardNs);
        await vmWizardNavigationPage.clickNext();
      });

      await test.step('Step 2: Guest OS — select Windows', async () => {
        const osTilesVisible = await vmWizardNavigationPage.verifyOsTilesVisible();
        expect.soft(osTilesVisible, 'OS tiles should be visible').toBe(true);

        await vmWizardNavigationPage.selectOperatingSystem('windows');
        await vmWizardNavigationPage.clickNext();
      });

      await test.step('Step 3: Boot source — select a Windows volume or no boot source', async () => {
        const bootStepVisible = await vmWizardBootSourcePage.verifyBootSourceStepVisible();
        expect.soft(bootStepVisible, 'Boot source step should be visible').toBe(true);

        await vmWizardBootSourcePage.selectFirstBootVolumeOrNone();
        await vmWizardNavigationPage.clickNext();
      });

      await test.step('Step 4: Compute resources — select a size that meets Windows preference memory', async () => {
        const computeVisible = await vmWizardComputePage.verifyComputeResourcesStepVisible();
        expect.soft(computeVisible, 'Compute resources step should be visible').toBe(true);

        await vmWizardComputePage.selectInstanceTypeSeries('u');
        await vmWizardComputePage.selectLargestComputeSize();

        const selectedSize = await vmWizardComputePage.getComputeSizeDropdownText();
        expect.soft(selectedSize, 'A compute size should be selected').toContain('CPUs');

        await vmWizardNavigationPage.clickNext();
      });

      await test.step('Step 5: Customization — continue to review', async () => {
        const custVisible = await vmWizardComputePage.verifyCustomizationStepVisible();
        expect.soft(custVisible, 'Customization step should be visible').toBe(true);

        await vmWizardNavigationPage.clickNext();
      });

      await test.step('Step 6: Review and create — create the Windows VM', async () => {
        const reviewVisible = await vmWizardComputePage.verifyReviewStepVisible();
        expect(reviewVisible, 'Review step should be visible').toBe(true);

        await vmWizardNavigationPage.clickCreateVm();
        const redirected = await vmWizardNavigationPage.verifyRedirectedToVmDetails();
        expect(redirected, 'Should redirect to VM details after creation').toBe(true);
      });

      await test.step('Verify the VM has no SSH accessCredentials', async () => {
        const vmName = await vmWizardNavigationPage.getCreatedVmNameFromUrl();
        const vmNs = await vmWizardNavigationPage.getCreatedVmNamespaceFromUrl();
        expect(vmName.length, 'VM name should be in the URL').toBeGreaterThan(0);
        expect(vmNs, 'VM should be created in the test namespace (default SSH key is set there)').toBe(
          wizardNs,
        );
        apiClient.trackResource('VirtualMachine', vmName, vmNs);

        const created = await apiClient.verifyVmCreated(vmName, vmNs);
        expect(created.exists, `VM '${vmName}' should exist in '${vmNs}'`).toBe(true);

        const vm = await apiClient.getVirtualMachine(vmNs, vmName);
        expect(
          getVmAccessCredentials(vm),
          'Windows VM must not get the default SSH key (no cloud-init volume)',
        ).toBeUndefined();
      });
    });
  },
);
