import { T1, T1_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/bootable-volumes-fixture';
import { setupTestNamespace } from '@/utils/test-setup-helpers';

const SUITE = 'Test Virtualization Bootable volumes page';

test.describe('Tier1 Bootable Volumes - Create and Delete', { tag: [T1_TAG] }, () => {
  test(
    'Create a bootable volume via the UI form using registry source',
    { tag: ['@nonpriv'] },
    async ({ bootableVolumesPage, apiClient, utils }) => {
      await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG] });

      const ns = await setupTestNamespace(apiClient, 'bv-create-form');
      await bootableVolumesPage.navigateToNamespaceBootableVolumesViaUI(ns);

      const volumeName = utils.generateRandomDataVolumeName('bv-registry');
      const registryUrl = utils.REGISTRY_URLS.FEDORA_LATEST;
      const cronExpression = '0 0 * * 2';

      await test.step('Open the "Add volume" form', async () => {
        await bootableVolumesPage.clickCreateAndSelectOption('With form');
      });

      await test.step('Fill registry source form and submit', async () => {
        await bootableVolumesPage.fillCreateBootableVolumeFormFromRegistryAndSave(
          volumeName,
          registryUrl,
          cronExpression,
        );
      });

      apiClient.trackResource('Namespace', ns);

      await test.step('Verify volume row appears in the list', async () => {
        await bootableVolumesPage.navigateToNamespaceBootableVolumesViaUI(ns);
        const rowVisible = await bootableVolumesPage.ensureDataVolumeRowVisibleWithReNav(
          volumeName,
          ns,
          utils.TestTimeouts.DEFAULT,
        );
        expect
          .soft(rowVisible, 'Created bootable volume row should be visible in the list')
          .toBe(true);
      });
    },
  );

  test(
    'Delete a bootable volume via kebab menu row action',
    { tag: ['@nonpriv'] },
    async ({ bootableVolumesPage, apiClient, utils }) => {
      await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG] });

      const ns = await setupTestNamespace(apiClient, 'bv-delete');

      const dvName = utils.generateRandomDataVolumeName('bv-del');

      await test.step('Create a DataSource via API as a bootable volume', async () => {
        await apiClient.createCustomResource('cdi.kubevirt.io', 'v1beta1', ns, 'datasources', {
          apiVersion: 'cdi.kubevirt.io/v1beta1',
          kind: 'DataSource',
          metadata: {
            name: dvName,
            namespace: ns,
            labels: {
              'instancetype.kubevirt.io/default-instancetype': 'u1.medium',
              'instancetype.kubevirt.io/default-preference': 'fedora',
            },
          },
          spec: {
            source: {
              pvc: {
                name: dvName,
                namespace: ns,
              },
            },
          },
        });
        apiClient.trackResource('DataSource', dvName, ns);
      });

      await test.step('Navigate to bootable volumes and verify the row is visible', async () => {
        await bootableVolumesPage.navigateToNamespaceBootableVolumesViaUI(ns);
        const rowVisible = await bootableVolumesPage.ensureDataVolumeRowVisibleWithReNav(
          dvName,
          ns,
          utils.TestTimeouts.DEFAULT,
        );
        expect.soft(rowVisible, 'DataSource row should be visible before deletion').toBe(true);
      });

      await test.step('Delete the bootable volume via kebab menu', async () => {
        await bootableVolumesPage.executeRowActionWithRetry(ns, dvName, () =>
          bootableVolumesPage.clickRowActionDelete(dvName),
        );
        await bootableVolumesPage.clickSaveInDeleteModal();
      });

      await test.step('Verify the volume is removed from the list', async () => {
        await bootableVolumesPage.navigateToNamespaceBootableVolumesViaUI(ns);
        const volumeGone = await bootableVolumesPage.verifyBootableVolumeDoesNotExist(
          dvName,
          utils.TestTimeouts.DEFAULT,
        );
        expect
          .soft(volumeGone, 'Deleted bootable volume should no longer appear in the list')
          .toBe(true);
      });
    },
  );
});
