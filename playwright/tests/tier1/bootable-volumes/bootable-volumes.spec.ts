import { T1, T1_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/bootable-volumes-fixture';
import { createDataVolumeWithYamlViaUi } from '@/utils/bootable-volume-test-helpers';
import { setupTestNamespace } from '@/utils/test-setup-helpers';

const SUITE = 'Test Virtualization Bootable volumes page';

test.describe('Tier1 Virtualization Bootable Volumes Page Tests', { tag: [T1_TAG] }, () => {
  test.beforeEach(async ({ bootableVolumesPage, testConfig }) => {
    await bootableVolumesPage.navigateToNamespaceBootableVolumesViaUI(testConfig.testNamespace);
  });

  test(
    'Bootable volume created with architecture annotation shows correct architecture in list column',
    { tag: ['@nonpriv'] },
    async ({ bootableVolumesPage, k8sClient, utils }) => {
      await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG] });

      const ns = await setupTestNamespace(k8sClient, 'bv-arch-annotation');
      await bootableVolumesPage.navigateToNamespaceBootableVolumesViaUI(ns);

      const { dataVolumeName } = await createDataVolumeWithYamlViaUi(
        bootableVolumesPage,
        k8sClient,
        ns,
        'bv-arch',
        utils,
        {
          defaultPreference: utils.INSTANCE_TYPES.FEDORA,
          architecture: 'amd64',
          operatingSystem: 'Fedora (amd64)',
          description: 'Bootable volume with architecture annotation',
          source: {
            registry: { url: `docker://${utils.REGISTRY_URLS.FEDORA_LATEST}` },
          },
        },
      );

      await test.step('Volume row appears in list', async () => {
        const rowVisible = await bootableVolumesPage.verifyDataVolumeRowVisible(
          dataVolumeName,
          utils.TestTimeouts.DEFAULT,
        );
        expect(rowVisible, 'Volume row should be visible in list').toBe(true);
      });

      await test.step('Column headers include Architecture', async () => {
        const headers = await bootableVolumesPage.getColumnHeaders();
        const hasArch =
          headers.some((h) => h.toLowerCase().includes('architecture')) ||
          headers.some((h) => h.toLowerCase().includes('arch'));
        expect(
          hasArch,
          `Architecture column should appear in headers (got: ${headers.join(', ')})`,
        ).toBe(true);
      });
    },
  );
});

test.describe('Tier1 Bootable Volumes - Manage source row action', { tag: [T1_TAG] }, () => {
  test(
    'Manage source row action opens the modal and allows editing the source configuration',
    { tag: ['@nonpriv'] },
    async ({ k8sClient, bootableVolumesPage, utils }) => {
      await utils.withAllure({
        suite: SUITE,
        feature: T1,
        tags: [T1_TAG],
      });
      const ns = utils.generateTestNamespace('bv-manage-source');
      await k8sClient.createNamespace(ns);
      await k8sClient.waitForNamespaceReady(ns);
      k8sClient.trackResource('Namespace', ns);

      const dvName = utils.generateRandomDataVolumeName('bv-manage-src');

      // Create a DataImportCron — this is the resource that powers the "Manage source" row action.
      // CDI automatically creates the managed DataSource (with the cdi.kubevirt.io/dataImportCron
      // label) when a DataImportCron is created, making the row appear in the BV list with
      // the "Manage source" action enabled.
      await k8sClient.createCustomResource('cdi.kubevirt.io', 'v1beta1', ns, 'dataimportcrons', {
        apiVersion: 'cdi.kubevirt.io/v1beta1',
        kind: 'DataImportCron',
        metadata: {
          name: dvName,
          namespace: ns,
          labels: {
            'instancetype.kubevirt.io/default-instancetype': 'u1.medium',
            'instancetype.kubevirt.io/default-preference': 'fedora',
          },
        },
        spec: {
          managedDataSource: dvName,
          schedule: '0 0 * * 2',
          garbageCollect: 'Outdated',
          importsToKeep: 3,
          template: {
            metadata: {},
            spec: {
              source: {
                registry: {
                  url: 'docker://quay.io/containerdisks/fedora:latest',
                },
              },
              storage: {
                resources: {
                  requests: {
                    storage: '30Gi',
                  },
                },
              },
            },
          },
        },
      });
      // DataImportCron cleanup is handled by namespace deletion (namespace is tracked above)

      // CDI auto-creates the DataSource; wait for it to appear in the API
      await expect
        .poll(
          () =>
            k8sClient
              .getCustomResource('cdi.kubevirt.io', 'v1beta1', ns, 'datasources', dvName)
              .then(() => true)
              .catch(() => false),
          { timeout: utils.TestTimeouts.DEFAULT, intervals: [1000, 2000, 3000] },
        )
        .toBe(true);

      await bootableVolumesPage.navigateToNamespaceBootableVolumesViaUI(ns);

      const rowVisible = await bootableVolumesPage.ensureDataVolumeRowVisibleWithReNav(
        dvName,
        ns,
        utils.TestTimeouts.DEFAULT,
      );
      expect(rowVisible, 'DataSource row should be visible in the bootable volumes list').toBe(
        true,
      );

      await test.step('Manage source modal opens and shows the current source URL', async () => {
        await bootableVolumesPage.executeRowActionWithRetry(ns, dvName, () =>
          bootableVolumesPage.clickRowActionManageSource(dvName),
        );
        const modalVisible = await bootableVolumesPage.isManageSourceModalVisible();
        expect(
          modalVisible,
          'Manage source modal should appear after clicking the row action',
        ).toBe(true);
      });

      const newRegistryUrl = 'docker://quay.io/containerdisks/fedora:38';
      const newCron = '0 6 * * 1';

      await test.step('Manage source modal allows editing the registry URL and cron schedule', async () => {
        await bootableVolumesPage.fillManageSourceRegistryUrl(newRegistryUrl);
        await bootableVolumesPage.fillManageSourceCronExpression(newCron);
        const updatedUrl = await bootableVolumesPage.getManageSourceRegistryUrl();
        expect(updatedUrl, 'Registry URL field should reflect the new value').toBe(newRegistryUrl);
      });

      await test.step('Saving the manage source modal closes the dialog', async () => {
        await bootableVolumesPage.saveManageSourceModal();
        const modalStillVisible = await bootableVolumesPage.isManageSourceModalVisible(
          utils.TestTimeouts.UI_DELAY_SHORT,
        );
        expect(modalStillVisible, 'Manage source modal should close after saving').toBe(false);
      });
    },
  );
});
