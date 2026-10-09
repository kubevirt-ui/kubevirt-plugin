import { GATING, GATING_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/bootable-volumes-fixture';
import { ROUTE_BOOTABLE_VOLUMES_TAG } from '@/data-models/route-tags';

const GATING_SUITE = 'Virtualization pages';
const RESOURCE_SUITE = 'Resource creation (gating)';

test.describe('Bootable volumes page load', { tag: [ROUTE_BOOTABLE_VOLUMES_TAG, GATING_TAG] }, () => {
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
});

test.describe('Bootable volume create via YAML', { tag: [ROUTE_BOOTABLE_VOLUMES_TAG, GATING_TAG, '@resource-creation'] }, () => {
  test('Create a bootable volume via YAML editor', async ({
    bootableVolumesPage,
    apiClient,
    testConfig,
    utils,
  }) => {
    await utils.withAllure({ suite: RESOURCE_SUITE, feature: GATING, tags: [GATING_TAG] });

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

    await bootableVolumesPage.navigateToNamespaceBootableVolumesViaUI(testConfig.testNamespace);
    await bootableVolumesPage.clickCreateAndSelectOption('With YAML');
    await bootableVolumesPage.fillYamlEditorAndSave(dataVolumeYaml);
    apiClient.trackResource('DataVolume', dvName, testConfig.testNamespace);

    await bootableVolumesPage.filterByName(dvName);
    const rowVisible = await bootableVolumesPage.verifyDataVolumeRowVisible(
      dvName,
      utils.TestTimeouts.DEFAULT,
    );
    expect(rowVisible, `Bootable volume ${dvName} should be visible in the list`).toBe(true);
  });
});
