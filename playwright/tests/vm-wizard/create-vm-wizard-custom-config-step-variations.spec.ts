import { ADMIN_ONLY_TAG, T1, T1_TAG } from '@/data-models/allure-constants';
import { ROUTE_VM_WIZARD_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/create-vm-fixture';

const SUITE = 'VM Creation Wizard';

test.describe(
  'VM Creation Wizard — Custom configuration step variations',
  { tag: [ROUTE_VM_WIZARD_TAG, T1_TAG, '@catalog-wizard', ADMIN_ONLY_TAG] },
  () => {
    test('Windows guest OS with no boot source reaches Review', async ({
      apiClient,
      vmListPage,
      vmWizardNavigationPage,
      vmWizardBootSourcePage,
      vmWizardComputePage,
      utils,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_MEDIUM);
      await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG] });

      const wizardNs = await utils.setupTestNamespace(apiClient, 'wizard-variant-win');

      await vmListPage.switchToVirtualizationPerspective();
      await vmListPage.navigateToProjectVmListViaUI(wizardNs);
      await vmWizardNavigationPage.openWizardFromCreateDropdown();

      await vmWizardNavigationPage.generateVmName();
      await vmWizardNavigationPage.clickNext();

      await vmWizardNavigationPage.selectOperatingSystem('windows');
      await expect
        .poll(() => vmWizardNavigationPage.isNextButtonDisabled(), {
          message: 'Next should enable once the Windows guest OS type list finishes loading',
          timeout: utils.TestTimeouts.UI_ACTION_COMPLETE,
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
    });

    test('A non-default instance type and size are reflected in the submitted VM', async ({
      apiClient,
      vmListPage,
      vmWizardNavigationPage,
      vmWizardBootSourcePage,
      vmWizardComputePage,
      utils,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_MEDIUM);
      await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG] });

      const wizardNs = await utils.setupTestNamespace(apiClient, 'wizard-variant-size');

      await vmListPage.switchToVirtualizationPerspective();
      await vmListPage.navigateToProjectVmListViaUI(wizardNs);
      await vmWizardNavigationPage.openWizardFromCreateDropdown();

      await vmWizardNavigationPage.generateVmName();
      await vmWizardNavigationPage.clickNext();

      await expect
        .poll(() => vmWizardNavigationPage.isNextButtonDisabled(), {
          timeout: utils.TestTimeouts.UI_ACTION_COMPLETE,
        })
        .toBe(false);
      await vmWizardNavigationPage.clickNext();

      await vmWizardBootSourcePage.selectNoBootSource();
      await vmWizardNavigationPage.clickNext();

      await vmWizardComputePage.selectInstanceTypeSeries('m');
      await vmWizardComputePage.selectComputeSize('large');

      await vmWizardNavigationPage.clickNext();
      const vmName = await vmWizardComputePage.getCustomizationVmName();
      await vmWizardNavigationPage.clickNext();

      await vmWizardNavigationPage.clickCreateVm();
      apiClient.trackResource('VirtualMachine', vmName, wizardNs);

      let createdVm = await apiClient.getVirtualMachine(wizardNs, vmName).catch(() => null);
      await expect
        .poll(
          async () => {
            createdVm = await apiClient.getVirtualMachine(wizardNs, vmName).catch(() => null);
            return createdVm;
          },
          {
            message: `VirtualMachine '${vmName}' should be submitted`,
            timeout: utils.TestTimeouts.RESOURCE_CREATION,
          },
        )
        .toBeTruthy();

      const vmSpec = createdVm?.spec as { instancetype?: { name?: string } } | undefined;
      expect(vmSpec?.instancetype?.name).toBe('m1.large');
    });
  },
);
