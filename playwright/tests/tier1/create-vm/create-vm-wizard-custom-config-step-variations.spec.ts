import { ADMIN_ONLY_TAG, T1, T1_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/create-vm-fixture';
import { setupTestNamespace } from '@/utils/test-setup-helpers';

const SUITE = 'VM Creation Wizard';

test.describe(
  'VM Creation Wizard — Custom configuration step variations',
  { tag: [T1_TAG, '@catalog-wizard', ADMIN_ONLY_TAG] },
  () => {
    test('Windows guest OS with no boot source reaches Review and creates a VM', async ({
      apiClient,
      vmListPage,
      vmWizardNavigationPage,
      vmWizardBootSourcePage,
      vmWizardComputePage,
      utils,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_VM_CREATION);
      await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG] });

      const wizardNs = await setupTestNamespace(apiClient, 'wizard-variant-win');

      await vmListPage.switchToVirtualizationPerspective();
      await vmListPage.navigateToProjectVmListViaUI(wizardNs);
      await vmWizardNavigationPage.openWizardFromCreateDropdown();

      await vmWizardNavigationPage.generateVmName();
      await vmWizardNavigationPage.clickNext();

      await vmWizardNavigationPage.selectOperatingSystem('windows');
      await expect
        .poll(() => vmWizardNavigationPage.isNextButtonDisabled(), {
          message: 'Next should enable once the Windows guest OS type list finishes loading',
          timeout: utils.TestTimeouts.UI_ELEMENT_VISIBILITY,
        })
        .toBe(false);
      await vmWizardNavigationPage.clickNext();

      await vmWizardBootSourcePage.selectNoBootSource();
      await vmWizardNavigationPage.clickNext();

      // Expected behavior: "No boot source" has no boot-volume-derived default, so no
      // instance type is preselected here. An explicit series/size pick is required
      // before Next enables at the Compute resources step. The smallest size (u1.nano,
      // 512Mi) is below what Windows preferences require (windows.10 needs 2Gi,
      // windows.11 needs 4Gi/2 vCPU), so pick a size with enough headroom.
      await vmWizardComputePage.selectInstanceTypeSeries('u');
      await vmWizardComputePage.selectComputeSize('large');
      await vmWizardNavigationPage.clickNext();
      await vmWizardNavigationPage.clickNext();

      const reviewVisible = await vmWizardComputePage.verifyReviewStepVisible();
      expect(reviewVisible, 'Review step should be visible').toBe(true);

      await vmWizardNavigationPage.clickCreateVm();
      const redirected = await vmWizardNavigationPage.verifyRedirectedToVmDetails();
      expect(redirected, 'Should redirect to VM details after creation').toBe(true);

      const vmName = await vmWizardNavigationPage.getCreatedVmNameFromUrl();
      apiClient.trackResource('VirtualMachine', vmName, wizardNs);
      const result = await apiClient.verifyVmCreated(vmName, wizardNs);
      expect.soft(result.exists, `VM '${vmName}' should exist`).toBe(true);
    });

    test('Explicitly selecting "No boot source" does not block progression to Review', async ({
      apiClient,
      vmListPage,
      vmWizardNavigationPage,
      vmWizardBootSourcePage,
      vmWizardComputePage,
      utils,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_VM_CREATION);
      await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG] });

      const wizardNs = await setupTestNamespace(apiClient, 'wizard-variant-noboot');

      await vmListPage.switchToVirtualizationPerspective();
      await vmListPage.navigateToProjectVmListViaUI(wizardNs);
      await vmWizardNavigationPage.openWizardFromCreateDropdown();

      await vmWizardNavigationPage.generateVmName();
      await vmWizardNavigationPage.clickNext();

      await expect
        .poll(() => vmWizardNavigationPage.isNextButtonDisabled(), {
          timeout: utils.TestTimeouts.UI_ELEMENT_VISIBILITY,
        })
        .toBe(false);
      await vmWizardNavigationPage.clickNext();

      const bootStepVisible = await vmWizardBootSourcePage.verifyBootSourceStepVisible();
      expect(bootStepVisible, 'Boot source step should be visible').toBe(true);

      await vmWizardBootSourcePage.selectNoBootSource();

      const nextDisabled = await vmWizardNavigationPage.isNextButtonDisabled();
      expect(nextDisabled, '"No boot source" should not block Next').toBe(false);

      await vmWizardNavigationPage.clickNext();
      const computeVisible = await vmWizardComputePage.verifyComputeResourcesStepVisible();
      expect(computeVisible, 'Compute resources step should be reachable').toBe(true);

      // Expected behavior: "No boot source" has no boot-volume-derived default, so no
      // instance type is preselected here. An explicit series/size pick is required
      // before Next enables. The smallest size (u1.nano, 512Mi) is below what the
      // default RHEL guest OS preference requires (rhel.9 needs 1536Mi), so pick a
      // size with enough headroom.
      await vmWizardComputePage.selectInstanceTypeSeries('u');
      await vmWizardComputePage.selectComputeSize('large');
      await vmWizardNavigationPage.clickNext();
      await vmWizardNavigationPage.clickNext();

      const reviewVisible = await vmWizardComputePage.verifyReviewStepVisible();
      expect(reviewVisible, 'Review step should be reachable without a boot source').toBe(true);

      await vmWizardNavigationPage.clickCreateVm();
      const redirected = await vmWizardNavigationPage.verifyRedirectedToVmDetails();
      expect(redirected, 'Should redirect to VM details after creation').toBe(true);

      const vmName = await vmWizardNavigationPage.getCreatedVmNameFromUrl();
      apiClient.trackResource('VirtualMachine', vmName, wizardNs);
      const result = await apiClient.verifyVmCreated(vmName, wizardNs);
      expect.soft(result.exists, `VM '${vmName}' should exist`).toBe(true);
    });

    test('A non-default instance type series and the largest compute size are reflected in the created VM', async ({
      apiClient,
      vmListPage,
      vmWizardNavigationPage,
      vmWizardBootSourcePage,
      vmWizardComputePage,
      utils,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_VM_CREATION);
      await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG] });

      const wizardNs = await setupTestNamespace(apiClient, 'wizard-variant-size');

      await vmListPage.switchToVirtualizationPerspective();
      await vmListPage.navigateToProjectVmListViaUI(wizardNs);
      await vmWizardNavigationPage.openWizardFromCreateDropdown();

      await vmWizardNavigationPage.generateVmName();
      await vmWizardNavigationPage.clickNext();

      await expect
        .poll(() => vmWizardNavigationPage.isNextButtonDisabled(), {
          timeout: utils.TestTimeouts.UI_ELEMENT_VISIBILITY,
        })
        .toBe(false);
      await vmWizardNavigationPage.clickNext();

      await vmWizardBootSourcePage.selectNoBootSource();
      await vmWizardNavigationPage.clickNext();

      await vmWizardComputePage.selectInstanceTypeSeries('m');
      const computeSizeOptions = await vmWizardComputePage.getComputeSizeOptions();
      expect(
        computeSizeOptions.length,
        'Memory Intensive sizes should be available',
      ).toBeGreaterThan(1);
      const expectedLargestSize = computeSizeOptions.at(-1) ?? '';
      const selectedLargestSize = await vmWizardComputePage.selectLargestComputeSize();
      expect(selectedLargestSize, 'The helper should select the last available compute size').toBe(
        expectedLargestSize,
      );

      const sizeText = await vmWizardComputePage.getComputeSizeDropdownText();
      expect(sizeText, 'The largest Memory Intensive compute size should be displayed').toContain(
        expectedLargestSize,
      );

      await vmWizardNavigationPage.clickNext();
      await vmWizardNavigationPage.clickNext();

      await vmWizardNavigationPage.clickCreateVm();
      const redirected = await vmWizardNavigationPage.verifyRedirectedToVmDetails();
      expect(redirected, 'Should redirect to VM details after creation').toBe(true);

      const vmName = await vmWizardNavigationPage.getCreatedVmNameFromUrl();
      apiClient.trackResource('VirtualMachine', vmName, wizardNs);

      const createdVm = await apiClient.getVirtualMachine(wizardNs, vmName);
      const vmSpec = createdVm?.spec as { instancetype?: { name?: string } } | undefined;
      const instanceTypeName = vmSpec?.instancetype?.name ?? '';
      expect(
        instanceTypeName.length,
        'Created VM should reference an instance type',
      ).toBeGreaterThan(0);
      expect
        .soft(instanceTypeName, 'Instance type should be from the selected Memory Intensive series')
        .toMatch(/^m1\./);
    });
  },
);
