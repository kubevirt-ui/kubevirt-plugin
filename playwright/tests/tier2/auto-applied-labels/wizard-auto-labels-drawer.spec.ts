import {
  ADMIN_ONLY_TAG,
  AUTO_LABELS_FEATURE,
  AUTO_LABELS_TAG,
  T2_TAG,
} from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/auto-labels-fixture';
import { setupTestNamespace } from '@/utils/test-setup-helpers';

import { CM_FEATURES, navigateToCustomizationStep, patchAutoLabels } from './auto-labels-helpers';

const SUITE = 'Auto-Applied Labels — Wizard Drawer';
const ALL_TEST_LABELS = [
  { key: 'env', value: '', required: true },
  { key: 'cost-center', value: '', required: false },
  { key: 'team', value: 'backend', required: false },
];

test.describe(
  'VM creation wizard — required labels drawer',
  { tag: [T2_TAG, ADMIN_ONLY_TAG, AUTO_LABELS_TAG] },
  () => {
    let wizardNs: string;
    let originalAutoLabels: string;

    test.beforeAll(async ({ apiClient, utils }) => {
      wizardNs = await setupTestNamespace(apiClient, 'al-wiz-drawer');
      const cm = await apiClient.getConfigMap(CM_FEATURES, utils.EnvVariables.cnvNamespace);
      originalAutoLabels =
        (cm?.data as Record<string, string> | undefined)?.autoAppliedLabels || '[]';
      await patchAutoLabels(apiClient, utils, ALL_TEST_LABELS);
    });

    test.afterAll(async ({ apiClient, utils }) => {
      await patchAutoLabels(apiClient, utils, JSON.parse(originalAutoLabels));
    });

    test('Required labels without value disable the Next button', async ({
      vmTreePage,
      vmWizardPage,
      utils,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_EXTENDED);
      utils.withAllure({
        suite: SUITE,
        feature: AUTO_LABELS_FEATURE,
        tags: [T2_TAG, AUTO_LABELS_TAG],
      });

      await navigateToCustomizationStep(vmTreePage, vmWizardPage, wizardNs);
      const isDisabled = await vmWizardPage.isNextButtonDisabled();
      expect(isDisabled, 'Next button should be disabled when required labels have no value').toBe(
        true,
      );
      await vmWizardPage.cancelWizard();
    });

    test('Required labels drawer opens automatically on Customization step', async ({
      vmTreePage,
      vmWizardPage,
      utils,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_EXTENDED);
      utils.withAllure({
        suite: SUITE,
        feature: AUTO_LABELS_FEATURE,
        tags: [T2_TAG, AUTO_LABELS_TAG],
      });

      await navigateToCustomizationStep(vmTreePage, vmWizardPage, wizardNs);
      const drawerOpen = await vmWizardPage.labels.isRequiredLabelsDrawerOpen();
      expect(drawerOpen, 'Required labels drawer should open automatically').toBe(true);
      await vmWizardPage.cancelWizard();
    });

    test('Filling drawer values and closing enables Next button', async ({
      vmTreePage,
      vmWizardPage,
      utils,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_EXTENDED);
      utils.withAllure({
        suite: SUITE,
        feature: AUTO_LABELS_FEATURE,
        tags: [T2_TAG, AUTO_LABELS_TAG],
      });

      await navigateToCustomizationStep(vmTreePage, vmWizardPage, wizardNs);
      await vmWizardPage.labels.fillDrawerLabelValue('env', 'staging');
      await vmWizardPage.labels.closeRequiredLabelsDrawer();

      const isDisabled = await vmWizardPage.isNextButtonDisabled();
      expect(isDisabled, 'Next button should be enabled after filling required labels').toBe(false);
      await vmWizardPage.cancelWizard();
    });
  },
);
