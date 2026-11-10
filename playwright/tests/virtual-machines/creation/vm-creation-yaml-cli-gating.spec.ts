import { readFileSync } from 'node:fs';

import { GATING_TAG, NON_PRIV_TAG } from '@/data-models/allure-constants';
import { ROUTE_CATALOG_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/catalog-fixture';
import {
  CATALOG_INSTANCE_TYPES_BOOT_VOLUME,
  DEFAULT_RED_HAT_INSTANCE_TYPE_SERIES,
} from '@/utils/constants';
import { generateRandomVmName } from '@/utils/random-data-generator';
import { TestTimeouts } from '@/utils/test-config';

test.describe(`VM gating instance type YAML and CLI ${ROUTE_CATALOG_TAG} ${GATING_TAG} ${NON_PRIV_TAG}`, () => {
  test.use({ acceptDownloads: true });

  test('View YAML and CLI modal supports copy and download', async ({
    catalogPage,
    testNamespace,
  }) => {
    const vmName = generateRandomVmName('yaml-cli').slice(0, 50);

    await catalogPage.openCatalogInNamespace(testNamespace);
    await catalogPage.prepareInstanceTypesCatalogTab();
    await catalogPage.prepareInstanceTypeVmCreationForm({
      bootVolumeName: CATALOG_INSTANCE_TYPES_BOOT_VOLUME,
      series: DEFAULT_RED_HAT_INSTANCE_TYPE_SERIES,
      vmName,
    });

    await catalogPage.openViewYamlAndCliModal(vmName);
    await catalogPage.waitForYamlAndCliModalManifest(vmName);

    const yamlBody = await catalogPage.readYamlAndCliModalEditorText();
    expect(yamlBody).toMatch(/kind:\s*VirtualMachine/i);
    expect(yamlBody).toContain(vmName);

    await catalogPage.clickYamlAndCliModalCopy();
    await catalogPage.waitForYamlAndCliModalManifest(vmName);

    const download = await catalogPage.clickYamlAndCliModalDownloadAndWait();
    expect(download.suggestedFilename()).toBe('code.txt');
    const downloadPath = await download.path();
    expect(downloadPath).toBeTruthy();
    const fileBody = readFileSync(downloadPath!, 'utf8');
    expect(fileBody).toContain(vmName);
    expect(fileBody).toMatch(/kind:\s*VirtualMachine/i);

    await catalogPage.selectYamlAndCliModalTab('CLI');
    await expect
      .poll(() => catalogPage.readYamlAndCliModalEditorText(), {
        message: 'CLI tab should show virtctl create command',
        timeout: TestTimeouts.LONG_OPERATION,
      })
      .toMatch(/virtctl create vm/i);

    await catalogPage.clickYamlAndCliModalCopy();
    await expect
      .poll(() => catalogPage.readYamlAndCliModalEditorText(), {
        message: 'CLI tab content should remain after copy',
        timeout: TestTimeouts.ELEMENT_WAIT,
      })
      .toMatch(/virtctl create vm/i);
  });
});
