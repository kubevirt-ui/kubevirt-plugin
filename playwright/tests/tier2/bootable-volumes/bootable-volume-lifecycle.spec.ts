import { ADMIN_ONLY_TAG, T2, T2_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/bv-lifecycle-fixture';
import { setupTestNamespace } from '@/utils/test-setup-helpers';

const SUITE = 'Bootable Volume Cross-Module Lifecycle';

test.describe(
  'Bootable Volume Cross-Module Lifecycle — create BV via API, verify in UI list, delete and verify removal',
  { tag: [T2_TAG, '@tier2-bv-lifecycle', ADMIN_ONLY_TAG] },
  () => {
    test('Create bootable volume via API, verify it appears in the BV list, delete and confirm removal', async ({
      apiClient,
      bootableVolumesPage,
      utils,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_EXTENDED);
      await utils.withAllure({
        suite: SUITE,
        feature: T2,
        tags: [T2_TAG, '@tier2-bv-lifecycle'],
      });

      const ns = await setupTestNamespace(apiClient, 'bv-lifecycle');
      const bvName = utils.generateRandomDataVolumeName('bv-lifecycle');

      await test.step('Create a bootable volume (blank DV + DataSource) via API', async () => {
        await apiClient.createDataVolume(ns, {
          apiVersion: 'cdi.kubevirt.io/v1beta1',
          kind: 'DataVolume',
          metadata: {
            name: bvName,
            namespace: ns,
            labels: {
              'instancetype.kubevirt.io/default-instancetype': 'u1.medium',
              'instancetype.kubevirt.io/default-preference': 'fedora',
            },
          },
          spec: {
            source: { blank: {} },
            storage: {
              resources: { requests: { storage: '1Gi' } },
            },
          },
        });
        apiClient.trackResource('DataVolume', bvName, ns);

        await apiClient.waitForDataVolumeSucceeded(bvName, ns, utils.TestTimeouts.DEFAULT);

        await apiClient.createDataSource(ns, {
          apiVersion: 'cdi.kubevirt.io/v1beta1',
          kind: 'DataSource',
          metadata: {
            name: bvName,
            namespace: ns,
            labels: {
              'instancetype.kubevirt.io/default-instancetype': 'u1.medium',
              'instancetype.kubevirt.io/default-preference': 'fedora',
            },
          },
          spec: {
            source: {
              pvc: { name: bvName, namespace: ns },
            },
          },
        });
        apiClient.trackResource('DataSource', bvName, ns);
      });

      await test.step('Verify the bootable volume appears in the BV list', async () => {
        await bootableVolumesPage.navigateToNamespaceBootableVolumesViaUI(ns);
        const rowVisible = await bootableVolumesPage.ensureDataVolumeRowVisibleWithReNav(
          bvName,
          ns,
          utils.TestTimeouts.DEFAULT,
        );
        expect(rowVisible, `Bootable volume '${bvName}' should be visible in the list`).toBe(true);
      });

      await test.step('Delete the bootable volume via API', async () => {
        await apiClient.deleteDataSource(ns, bvName);
        await apiClient.deleteDataVolume(ns, bvName);
      });

      await test.step('Verify bootable volume is removed from the list', async () => {
        await bootableVolumesPage.navigateToNamespaceBootableVolumesViaUI(ns);
        const volumeGone = await bootableVolumesPage.verifyBootableVolumeDoesNotExist(
          bvName,
          utils.TestTimeouts.DEFAULT,
        );
        expect(volumeGone, `Bootable volume '${bvName}' should no longer appear in the list`).toBe(
          true,
        );
      });
    });
  },
);
