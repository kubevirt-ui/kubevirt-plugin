import {
  ADMIN_ONLY_TAG,
  AUTO_LABELS_FEATURE,
  AUTO_LABELS_TAG,
  T2_TAG,
} from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/auto-labels-fixture';
import { setupTestNamespace } from '@/utils/test-setup-helpers';

import { CM_FEATURES, navigateToCustomizationStep, patchAutoLabels } from './auto-labels-helpers';

const SUITE = 'Auto-Applied Labels — Wizard VM Creation';
const ALL_TEST_LABELS = [
  { key: 'env', value: '', required: true },
  { key: 'cost-center', value: '', required: false },
  { key: 'team', value: 'backend', required: false },
];

test.describe(
  'VM creation wizard — label application on created VMs',
  { tag: [T2_TAG, ADMIN_ONLY_TAG, AUTO_LABELS_TAG] },
  () => {
    let wizardNs: string;
    let originalAutoLabels: string;

    test.beforeAll(async ({ apiClient, utils }) => {
      wizardNs = await setupTestNamespace(apiClient, 'al-wiz-create');
      const cm = await apiClient.getConfigMap(CM_FEATURES, utils.EnvVariables.cnvNamespace);
      originalAutoLabels =
        (cm?.data as Record<string, string> | undefined)?.autoAppliedLabels || '[]';
      await patchAutoLabels(apiClient, utils, ALL_TEST_LABELS);
    });

    test.afterAll(async ({ apiClient, utils }) => {
      await patchAutoLabels(apiClient, utils, JSON.parse(originalAutoLabels));
    });

    test('Auto-applied labels with values appear on created VM', async ({
      apiClient,
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

      await vmWizardPage.clickNext();
      await vmWizardPage.ensureVmNameFilled();
      const vmName = await vmWizardPage.getReviewVmName();
      apiClient.trackResource('VirtualMachine', vmName, wizardNs);
      await vmWizardPage.clickCreateVm();
      expect(await vmWizardPage.verifyRedirectedToVmDetails(), 'redirected to VM details').toBe(
        true,
      );

      await expect(async () => {
        const vm = await apiClient.getVirtualMachine(wizardNs, vmName);
        const labels = vm?.metadata?.labels || {};
        expect(labels['team']).toBe('backend');
        expect(labels['env']).toBe('test');
      }).toPass({ intervals: [2_000, 3_000], timeout: 15_000 });
    });

    test('Optional labels without value do NOT appear on created VM', async ({
      apiClient,
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
      await vmWizardPage.labels.fillDrawerLabelValue('env', 'prod');
      await vmWizardPage.labels.closeRequiredLabelsDrawer();

      await vmWizardPage.clickNext();
      await vmWizardPage.ensureVmNameFilled();
      const vmName = await vmWizardPage.getReviewVmName();
      apiClient.trackResource('VirtualMachine', vmName, wizardNs);
      await vmWizardPage.clickCreateVm();
      expect(await vmWizardPage.verifyRedirectedToVmDetails(), 'redirected to VM details').toBe(
        true,
      );

      await expect(async () => {
        const vm = await apiClient.getVirtualMachine(wizardNs, vmName);
        const labels = vm?.metadata?.labels || {};
        expect(labels['cost-center']).toBeUndefined();
        expect(labels['team']).toBe('backend');
        expect(labels['env']).toBe('prod');
      }).toPass({ intervals: [2_000, 3_000], timeout: 15_000 });
    });
  },
);
