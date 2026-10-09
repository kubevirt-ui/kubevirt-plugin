import { GATING, GATING_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/gating-fixture';
import { buildVmYaml } from '@/utils/vm-yaml-builder';
import { ROUTE_VIRTUAL_MACHINES_LIST_TAG } from '@/data-models/route-tags';

const SUITE = 'Resource creation (gating)';

test.describe(
  'Create VM via YAML',
  { tag: [ROUTE_VIRTUAL_MACHINES_LIST_TAG, GATING_TAG, '@resource-creation'] },
  () => {
    test('Create a VM via YAML import', async ({ vmListPage, apiClient, testConfig, utils }) => {
      await utils.withAllure({ suite: SUITE, feature: GATING, tags: [GATING_TAG, 'yaml-create'] });

      const vmName = utils.generateRandomVmName('yaml-vm');
      const vmYaml = buildVmYaml(vmName, testConfig.testNamespace)
        .split('\n')
        .filter((line) => !line.match(/^\s+namespace:\s/))
        .join('\n');
      apiClient.trackResource('VirtualMachine', vmName, testConfig.testNamespace);

      await vmListPage.navigateToNamespaceVirtualMachinesViaUI(testConfig.testNamespace);

      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          await vmListPage.clickCreateAndSelectOption('With YAML');
          await vmListPage.page
            .getByRole('heading', { name: 'Create VirtualMachine', level: 1 })
            .waitFor({ state: 'visible', timeout: utils.TestTimeouts.UI_ELEMENT_VISIBILITY });
          break;
        } catch {
          if (attempt === 2) throw new Error('YAML editor heading not visible after 2 attempts');
          await vmListPage.navigateToNamespaceVirtualMachinesViaUI(testConfig.testNamespace);
        }
      }

      await vmListPage.fillYamlEditor(vmYaml);
      await vmListPage.page.getByRole('button', { name: 'Create', exact: true }).click();

      await vmListPage.page.waitForURL((url) => url.pathname.includes(vmName), {
        timeout: utils.TestTimeouts.DEFAULT,
      });
      expect(vmListPage.page.url(), 'URL should contain the VM name').toContain(vmName);
    });
  },
);
