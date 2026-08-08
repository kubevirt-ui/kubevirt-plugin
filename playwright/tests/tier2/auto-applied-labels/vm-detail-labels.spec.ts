import {
  ADMIN_ONLY_TAG,
  AUTO_LABELS_FEATURE,
  AUTO_LABELS_TAG,
  T2_TAG,
} from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/auto-labels-fixture';
import { TEMPLATE_METADATA_NAMES } from '@/utils/template-constants';
import { setupTestNamespace } from '@/utils/test-setup-helpers';

import { CM_FEATURES, patchAutoLabels } from './auto-labels-helpers';

const SUITE = 'Auto-Applied Labels — VM Detail';
const REGULAR_LABEL_KEY = 'user-custom-label';

test.describe(
  'VM detail metadata tab — auto-applied labels',
  { tag: [T2_TAG, ADMIN_ONLY_TAG, AUTO_LABELS_TAG] },
  () => {
    let ns: string;
    let vmName: string;
    let originalAutoLabels: string;

    test.beforeAll(async ({ apiClient, utils }) => {
      ns = await setupTestNamespace(apiClient, 'auto-labels-detail');
      const cm = await apiClient.getConfigMap(CM_FEATURES, utils.EnvVariables.cnvNamespace);
      const cmData = cm?.data as Record<string, string> | undefined;
      originalAutoLabels = cmData?.autoAppliedLabels || '[]';

      await patchAutoLabels(apiClient, utils, [
        { key: 'team', value: 'backend', required: false },
        { key: 'env', value: '', required: true },
      ]);

      vmName = utils.generateRandomVmName('al-detail');
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
            labels: { team: 'backend', env: 'production', [REGULAR_LABEL_KEY]: 'custom-value' },
          },
        },
        ns,
      );
    });

    test.afterAll(async ({ apiClient, utils }) => {
      await apiClient.mergePatchResource(
        '',
        'v1',
        'configmaps',
        CM_FEATURES,
        {
          data: { autoAppliedLabels: originalAutoLabels },
        },
        utils.EnvVariables.cnvNamespace,
      );
    });

    test.beforeEach(async ({ vmDetailPage, vmTreePage }) => {
      await vmTreePage.switchToVirtualizationPerspective();
      await vmDetailPage.navigateToVirtualMachineDetail(vmName, ns);
      await vmDetailPage.navigateToConfigurationMetadata();
      await vmDetailPage.page.waitForTimeout(1000);
    });

    test('VM shows auto-applied labels in metadata tab', async ({ metadataComponent, utils }) => {
      utils.withAllure({
        suite: SUITE,
        feature: AUTO_LABELS_FEATURE,
        tags: [T2_TAG, AUTO_LABELS_TAG],
      });

      const labels = await metadataComponent.getLabelsTableEntries();
      const teamLabel = labels.find((label) => label.key === 'team');
      const envLabel = labels.find((label) => label.key === 'env');

      expect(teamLabel, '"team" should be present').toBeDefined();
      expect(teamLabel?.value).toBe('backend');
      expect(envLabel, '"env" should be present').toBeDefined();
      expect(envLabel?.value).toBe('production');
    });

    test('Auto-applied label keys have delete button disabled', async ({
      metadataComponent,
      utils,
    }) => {
      utils.withAllure({
        suite: SUITE,
        feature: AUTO_LABELS_FEATURE,
        tags: [T2_TAG, AUTO_LABELS_TAG],
      });

      expect(await metadataComponent.isLabelDeletable('team'), '"team" not deletable').toBe(false);
      expect(await metadataComponent.isLabelDeletable('env'), '"env" not deletable').toBe(false);
    });

    test('Admin-empty values show edit; admin-set values do not', async ({
      metadataComponent,
      utils,
    }) => {
      utils.withAllure({
        suite: SUITE,
        feature: AUTO_LABELS_FEATURE,
        tags: [T2_TAG, AUTO_LABELS_TAG],
      });

      expect(await metadataComponent.isLabelEditable('env'), '"env" should show edit').toBe(true);
      expect(await metadataComponent.isLabelEditable('team'), '"team" should NOT show edit').toBe(
        false,
      );
    });

    test('Regular user-added labels can be edited and deleted', async ({
      metadataComponent,
      utils,
    }) => {
      utils.withAllure({
        suite: SUITE,
        feature: AUTO_LABELS_FEATURE,
        tags: [T2_TAG, AUTO_LABELS_TAG],
      });

      expect(
        await metadataComponent.isLabelDeletable(REGULAR_LABEL_KEY),
        'Should be deletable',
      ).toBe(true);
      expect(await metadataComponent.isLabelEditable(REGULAR_LABEL_KEY), 'Should be editable').toBe(
        true,
      );
    });
  },
);
