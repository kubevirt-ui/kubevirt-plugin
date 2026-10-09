import { GATING, GATING_TAG } from '@/data-models/allure-constants';
import type RequestContextClient from '@/clients/request-context-client';
import { expect, test } from '@/fixtures/bootable-volumes-fixture';
import type BootableVolumesPage from '@/page-objects/create-vm/bootable-volumes-page';
import { TestTimeouts } from '@/utils/test-config';
import { ROUTE_BOOTABLE_VOLUMES_TAG } from '@/data-models/route-tags';

const GATING_SUITE = 'Virtualization pages';
const RESOURCE_SUITE = 'Resource creation (gating)';

const waitForDataVolumeInApi = async (
  apiClient: RequestContextClient,
  name: string,
  namespace: string,
  timeoutMs: number,
): Promise<void> => {
  await expect
    .poll(
      async () => {
        try {
          const dv = await apiClient.getDataVolume(namespace, name);
          return dv?.metadata?.name === name;
        } catch {
          return false;
        }
      },
      { timeout: timeoutMs },
    )
    .toBe(true);
};

const expectDataVolumeRowInList = async (
  bootableVolumesPage: BootableVolumesPage,
  namespace: string,
  dvName: string,
  timeoutMs: number,
): Promise<void> => {
  await expect
    .poll(
      async () => {
        await bootableVolumesPage.navigateToNamespaceBootableVolumesViaUI(namespace);
        await bootableVolumesPage.filterByName(dvName);
        return bootableVolumesPage.verifyDataVolumeRowVisible(dvName, TestTimeouts.SHORT_WAIT);
      },
      {
        message: `Bootable volume ${dvName} should be visible in the list`,
        timeout: timeoutMs,
        intervals: [2000, 3000, 5000],
      },
    )
    .toBe(true);
};

test.describe(
  'Bootable volumes page load',
  { tag: [ROUTE_BOOTABLE_VOLUMES_TAG, GATING_TAG] },
  () => {
    test('Bootable Volumes page loads with expected columns and content', async ({
      bootableVolumesPage,
      utils,
    }) => {
      await utils.withAllure({ suite: GATING_SUITE, feature: GATING, tags: [GATING_TAG] });

      await bootableVolumesPage.navigateToBootableVolumesViaUI();

      await test.step('Page loads with at least one volume', async () => {
        const ok = await bootableVolumesPage.verifyPageLoaded(
          [utils.INSTANCE_TYPES.FEDORA],
          true,
          utils.TestTimeouts.UI_ELEMENT_VISIBILITY,
        );
        expect.soft(ok, 'Bootable volumes page should load with content').toBe(true);
      });

      await test.step('Expected column headers are present', async () => {
        const headers = await bootableVolumesPage.getColumnHeaders();
        for (const expected of ['Name', 'Architecture', 'Operating system', 'Description']) {
          expect.soft(headers, `Column headers should include '${expected}'`).toContain(expected);
        }
      });
    });
  },
);

test.describe(
  'Bootable volume create via YAML',
  { tag: [ROUTE_BOOTABLE_VOLUMES_TAG, GATING_TAG, '@resource-creation'] },
  () => {
    test('Create a bootable volume via YAML editor', async ({
      bootableVolumesPage,
      apiClient,
      testConfig,
      utils,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_LONG);
      await utils.withAllure({ suite: RESOURCE_SUITE, feature: GATING, tags: [GATING_TAG] });

      const namespace = testConfig.testNamespace;
      const dvName = utils.generateRandomDataVolumeName('gating-bv');
      const rawYaml = utils.DataVolumeFactory.create({
        name: dvName,
        defaultPreference: utils.INSTANCE_TYPES.FEDORA,
        source: {
          registry: { url: `docker://${utils.REGISTRY_URLS.FEDORA_LATEST}` },
        },
      });
      const dataVolumeYaml = rawYaml
        .split('\n')
        .filter((line) => !line.match(/^\s+namespace:\s/))
        .join('\n');

      await test.step('Create DataVolume from YAML in the target namespace', async () => {
        await bootableVolumesPage.navigateToNamespaceBootableVolumesViaUI(namespace);
        await bootableVolumesPage.clickCreateAndSelectOption('With YAML');
        await bootableVolumesPage.fillYamlEditorAndSave(dataVolumeYaml);
        apiClient.trackResource('DataVolume', dvName, namespace);
      });

      await test.step('DataVolume exists in the cluster', async () => {
        await waitForDataVolumeInApi(
          apiClient,
          dvName,
          namespace,
          utils.TestTimeouts.UI_ELEMENT_VISIBILITY,
        );
      });

      await test.step('Volume row appears in the bootable volumes list', async () => {
        await expectDataVolumeRowInList(
          bootableVolumesPage,
          namespace,
          dvName,
          utils.TestTimeouts.UI_ELEMENT_VISIBILITY,
        );
      });
    });
  },
);
