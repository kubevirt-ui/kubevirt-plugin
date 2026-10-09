import { GATING, GATING_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/gating-fixture';
import { ROUTE_VM_WIZARD_TAG } from '@/data-models/route-tags';

const SUITE = 'Resource creation (gating)';

test.describe(
  'Create VM via wizard — new VM',
  { tag: [ROUTE_VM_WIZARD_TAG, GATING_TAG, '@resource-creation'] },
  () => {
    test('Create a VM via the creation wizard', async ({
      vmListPage,
      vmCreationWizardPage,
      vmDetailPage,
      apiClient,
      testConfig,
      utils,
    }) => {
      await utils.withAllure({ suite: SUITE, feature: GATING, tags: [GATING_TAG, 'e2e-create'] });

      await vmListPage.navigateToVirtualMachinesViaUI();
      await vmCreationWizardPage.openWizardFromCreateDropdown();
      await vmCreationWizardPage.selectCreationMethod('newVm');
      await vmCreationWizardPage.ensureVmNameFilled();
      await vmCreationWizardPage.clickNext();

      await vmCreationWizardPage.selectOperatingSystem('otherLinux');
      await vmCreationWizardPage.selectOsType('fedora');
      await vmCreationWizardPage.clickNext();

      await vmCreationWizardPage.selectFirstAvailableBootVolume();
      await vmCreationWizardPage.clickNext();

      await vmCreationWizardPage.selectInstanceTypeSeries('u');
      await vmCreationWizardPage.selectComputeSize('small');
      await vmCreationWizardPage.clickNext();

      await vmCreationWizardPage.clickNext();

      const reviewVisible = await vmCreationWizardPage.verifyReviewStepVisible();
      expect(reviewVisible, 'Review step should be visible').toBe(true);

      const isChecked = await vmCreationWizardPage.isStartAfterCreationChecked();
      if (isChecked) {
        await vmCreationWizardPage.toggleStartAfterCreation();
      }

      await vmCreationWizardPage.clickCreateVm();

      await expect
        .poll(() => vmCreationWizardPage.getCreatedVmNameFromUrl(), {
          intervals: [1_000, 2_000, 3_000],
          message: 'Should redirect to VM detail page after creation',
          timeout: utils.TestTimeouts.UI_ACTION_COMPLETE,
        })
        .toBeTruthy();

      const vmName = await vmCreationWizardPage.getCreatedVmNameFromUrl();
      expect(vmName.length, 'VM name should be parsed from redirected URL').toBeGreaterThan(0);
      apiClient.trackResource('VirtualMachine', vmName, testConfig.testNamespace);

      const nameVisible = await vmDetailPage.isVmNameVisible(
        vmName,
        utils.TestTimeouts.UI_ELEMENT_VISIBILITY,
      );
      expect(nameVisible, 'VM name should be visible on the detail page').toBe(true);
    });
  },
);
