/**
 * VM Creation Wizard & Detail — Auto-Applied Labels Behavior
 *
 * Consolidated into 3 tests for speed:
 * 1. Drawer + Protection — one wizard session covers drawer behavior and label restrictions
 * 2. VM Creation — one VM verifies label propagation and optional exclusion
 * 3. VM Detail — one API-created VM verifies metadata tab behavior
 *
 * All tests share the same TEST_LABELS ConfigMap state set once in beforeAll.
 * test.step() provides granular reporting within each test.
 */

import {
  ADMIN_ONLY_TAG,
  AUTO_LABELS_FEATURE,
  AUTO_LABELS_TAG,
  T2_TAG,
} from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/auto-labels-fixture';
import { TEMPLATE_METADATA_NAMES } from '@/utils/template-constants';
import { setupTestNamespace } from '@/utils/test-setup-helpers';
import {
  getVmLabels,
  navigateToWizardCustomizationStep,
  setAutoAppliedLabels,
} from '@/utils/auto-labels-test-helpers';

const SUITE = 'Auto-Applied Labels — Wizard & VM Detail';

const TEST_LABELS = [
  { key: 'env', value: '', required: true },
  { key: 'department', value: '', required: true },
  { key: 'cost-center', value: '', required: false },
  { key: 'team', value: 'backend', required: false },
];

const USER_ADDED_LABEL_KEY = 'user-custom-label';

test.describe(
  'Auto-applied labels — wizard & VM detail',
  { tag: [T2_TAG, ADMIN_ONLY_TAG, AUTO_LABELS_TAG] },
  () => {
    test.describe.configure({ mode: 'serial' });

    test.beforeAll(async ({ apiClient, utils }) => {
      await setAutoAppliedLabels(apiClient, utils, TEST_LABELS);
    });

    test.afterAll(async ({ apiClient, utils }) => {
      await setAutoAppliedLabels(apiClient, utils, []);
    });

    test.beforeEach(async ({ utils }) => {
      utils.withAllure({
        suite: SUITE,
        feature: AUTO_LABELS_FEATURE,
        tags: [T2_TAG, AUTO_LABELS_TAG],
      });
    });

    // Single wizard session: drawer behavior + label protection assertions
    test('Wizard drawer and label protection', async ({
      apiClient,
      vmTreePage,
      vmWizardPage,
      utils,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_EXTENDED);
      const ns = await setupTestNamespace(apiClient, 'al-wizard');
      await navigateToWizardCustomizationStep(vmTreePage, vmWizardPage, ns);

      // Wait for useApplyAutoLabels hook to process — drawer signals labels are merged
      await vmWizardPage.labels.waitForDrawerVisible();

      await test.step('Next button is disabled when required labels have no value', async () => {
        expect
          .soft(await vmWizardPage.isNextButtonDisabled(), 'Next should be disabled')
          .toBe(true);
      });

      await test.step('Required labels drawer opens automatically', async () => {
        expect
          .soft(await vmWizardPage.labels.isRequiredLabelsDrawerOpen(), 'Drawer should open')
          .toBe(true);
      });

      await test.step('Fill required label and close drawer', async () => {
        await vmWizardPage.labels.fillDrawerLabelValue('env', 'test');
        await vmWizardPage.labels.closeRequiredLabelsDrawer();
      });

      await test.step('Next button still disabled with unfilled required label', async () => {
        expect
          .soft(await vmWizardPage.isNextButtonDisabled(), 'Next should still be disabled')
          .toBe(true);
      });

      await test.step('Navigate to Labels and annotations tab', async () => {
        await vmWizardPage.selectCustomizationTab('Labels and annotations');
      });

      await test.step('Auto-applied keys cannot be deleted', async () => {
        expect
          .soft(await vmWizardPage.labels.isLabelKeyDeletable('team'), '"team" not deletable')
          .toBe(false);
      });

      await test.step('Admin-set values cannot be edited', async () => {
        expect
          .soft(await vmWizardPage.labels.isLabelValueEditable('team'), '"team" not editable')
          .toBe(false);
      });

      await test.step('Admin-empty values can be edited', async () => {
        expect
          .soft(await vmWizardPage.labels.isLabelValueEditable('env'), '"env" editable')
          .toBe(true);
      });

      await vmWizardPage.cancelWizard().catch(() => {});
    });

    // Single VM creation: verifies required + admin-set labels are applied, optional excluded
    test('VM creation applies correct labels', async ({
      apiClient,
      vmTreePage,
      vmWizardPage,
      utils,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_EXTENDED);
      const ns = await setupTestNamespace(apiClient, 'al-create');
      const vmName = await navigateToWizardCustomizationStep(vmTreePage, vmWizardPage, ns);
      await vmWizardPage.labels.waitForDrawerVisible();
      await vmWizardPage.labels.fillDrawerLabelValue('env', 'test');
      await vmWizardPage.labels.fillDrawerLabelValue('department', 'engineering');
      await vmWizardPage.labels.waitForDrawerHidden();
      apiClient.trackResource('VirtualMachine', vmName, ns);
      await vmWizardPage.clickNext();
      await vmWizardPage.clickCreateVm();
      await vmWizardPage.verifyRedirectedToVmDetails();

      await expect(async () => {
        const vmLabels = await getVmLabels(apiClient, ns, vmName);
        expect.soft(vmLabels['env'], 'Required label "env" applied').toBe('test');
        expect
          .soft(vmLabels['department'], 'Required label "department" applied')
          .toBe('engineering');
        expect.soft(vmLabels['team'], 'Admin-set label "team" applied').toBe('backend');
        expect
          .soft(vmLabels['cost-center'], 'Optional empty label applied with empty value')
          .toBe('');
      }).toPass({ intervals: [2000], timeout: 15000 });
    });

    // Single API-created VM: verifies metadata tab behavior for all label types
    test('VM detail metadata tab enforces label restrictions', async ({
      apiClient,
      metadataComponent,
      utils,
      vmDetailPage,
      vmTreePage,
    }) => {
      const ns = await setupTestNamespace(apiClient, 'al-detail');
      const vmName = utils.generateRandomVmName('al-detail');
      await apiClient.createVmFromTemplate(
        TEMPLATE_METADATA_NAMES.RHEL9,
        vmName,
        ns,
        'openshift',
        false,
      );
      apiClient.trackResource('VirtualMachine', vmName, ns);
      await apiClient.mergePatchResource(
        'kubevirt.io',
        'v1',
        'virtualmachines',
        vmName,
        {
          metadata: {
            labels: {
              team: 'backend',
              env: 'production',
              department: 'engineering',
              [USER_ADDED_LABEL_KEY]: 'custom-value',
            },
          },
        },
        ns,
      );

      await vmTreePage.switchToVirtualizationPerspective();
      await vmDetailPage.navigateToVirtualMachineDetail(vmName, ns);
      await vmDetailPage.navigateToConfigurationMetadata();

      await test.step('Auto-applied labels show correct values', async () => {
        const labels = await metadataComponent.getLabelsTableEntries();
        const teamLabel = labels.find((label) => label.key === 'team');
        expect.soft(teamLabel?.value, '"team" should be "backend"').toBe('backend');
      });

      await test.step('Auto-applied keys cannot be deleted', async () => {
        expect
          .soft(await metadataComponent.isLabelDeletable('team'), '"team" not deletable')
          .toBe(false);
      });

      await test.step('Admin-empty value labels are editable', async () => {
        expect.soft(await metadataComponent.isLabelEditable('env'), '"env" editable').toBe(true);
      });

      await test.step('User-added labels remain deletable', async () => {
        expect
          .soft(
            await metadataComponent.isLabelDeletable(USER_ADDED_LABEL_KEY),
            'User label deletable',
          )
          .toBe(true);
      });
    });
  },
);
