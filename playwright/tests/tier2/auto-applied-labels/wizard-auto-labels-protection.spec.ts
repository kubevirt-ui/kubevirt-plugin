import {
  ADMIN_ONLY_TAG,
  AUTO_LABELS_FEATURE,
  AUTO_LABELS_TAG,
  T2_TAG,
} from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/auto-labels-fixture';
import { setupTestNamespace } from '@/utils/test-setup-helpers';

import { CM_FEATURES, navigateToCustomizationStep, patchAutoLabels } from './auto-labels-helpers';

const SUITE = 'Auto-Applied Labels — Wizard Protection';
const ALL_TEST_LABELS = [
  { key: 'env', value: '', required: true },
  { key: 'cost-center', value: '', required: false },
  { key: 'team', value: 'backend', required: false },
];

test.describe(
  'VM creation wizard — label key/value protection',
  { tag: [T2_TAG, ADMIN_ONLY_TAG, AUTO_LABELS_TAG] },
  () => {
    let wizardNs: string;
    let originalAutoLabels: string;

    test.beforeAll(async ({ apiClient, utils }) => {
      wizardNs = await setupTestNamespace(apiClient, 'al-wiz-protect');
      const cm = await apiClient.getConfigMap(CM_FEATURES, utils.EnvVariables.cnvNamespace);
      originalAutoLabels =
        (cm?.data as Record<string, string> | undefined)?.autoAppliedLabels || '[]';
      await patchAutoLabels(apiClient, utils, ALL_TEST_LABELS);
    });

    test.afterAll(async ({ apiClient, utils }) => {
      await patchAutoLabels(apiClient, utils, JSON.parse(originalAutoLabels));
    });

    test('Labels tab shows auto-applied keys as non-deletable', async ({
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
      await vmWizardPage.labels.fillDrawerLabelValue('env', 'test');
      await vmWizardPage.labels.closeRequiredLabelsDrawer();
      await vmWizardPage.selectCustomizationTab('Labels and annotations');
      await vmWizardPage.page.waitForTimeout(1000);

      expect(await vmWizardPage.labels.isLabelKeyDeletable('team'), '"team" not deletable').toBe(
        false,
      );
      expect(await vmWizardPage.labels.isLabelKeyDeletable('env'), '"env" not deletable').toBe(
        false,
      );
      await vmWizardPage.cancelWizard();
    });

    test('Admin-set value labels have edit button hidden in wizard', async ({
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
      await vmWizardPage.labels.fillDrawerLabelValue('env', 'test');
      await vmWizardPage.labels.closeRequiredLabelsDrawer();
      await vmWizardPage.selectCustomizationTab('Labels and annotations');
      await vmWizardPage.page.waitForTimeout(1000);

      expect(await vmWizardPage.labels.isLabelValueEditable('team'), '"team" not editable').toBe(
        false,
      );
      expect(await vmWizardPage.labels.isLabelValueEditable('env'), '"env" editable').toBe(true);
      await vmWizardPage.cancelWizard();
    });
  },
);
