import { ADMIN_ONLY_TAG, T1, T1_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/create-vm-fixture';
import { setupTestNamespace } from '@/utils/test-setup-helpers';
import { buildVmYaml } from '@/utils/vm-yaml-builder';

const SUITE = 'VM Creation — YAML';

test.describe(
  'VM Creation — YAML import happy path',
  { tag: [T1_TAG, '@yaml-creation', ADMIN_ONLY_TAG] },
  () => {
    test('Import YAML creates a VM and it reaches Running state', async ({
      k8sClient,
      vmTreePage,
      vmListPage,
      utils,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_VM_CREATION);
      await utils.withAllure({
        suite: SUITE,
        feature: T1,
        tags: [T1_TAG],
      });

      const yamlNs = await setupTestNamespace(k8sClient, 'yaml-create');
      const vmName = utils.generateRandomVmName('yaml-vm');
      const vmYaml = buildVmYaml(vmName, yamlNs);

      k8sClient.trackResource('VirtualMachine', vmName, yamlNs);

      await vmTreePage.switchToVirtualizationPerspective();

      await test.step('Navigate to Import YAML page', async () => {
        await vmListPage.page.goto(`/k8s/ns/${yamlNs}/import`, { waitUntil: 'domcontentloaded' });
        await vmListPage.page.waitForTimeout(2000);

        const heading = vmListPage.page.getByRole('heading', { name: 'Import YAML', level: 1 });
        await expect(heading, 'Import YAML heading should be visible').toBeVisible({
          timeout: utils.TestTimeouts.UI_ELEMENT_VISIBILITY,
        });
      });

      await test.step('Fill YAML editor with VM manifest and submit', async () => {
        await vmListPage.fillYamlEditor(vmYaml);

        const createButton = vmListPage.page.getByRole('button', { name: 'Create', exact: true });
        await expect(createButton, 'Create button should be visible').toBeVisible();
        await createButton.click();
      });

      await test.step('Verify redirect to VM detail page', async () => {
        await vmListPage.page.waitForURL((url) => url.pathname.includes(vmName), {
          timeout: utils.TestTimeouts.DEFAULT,
        });
        expect(vmListPage.page.url(), 'URL should contain the VM name').toContain(vmName);
      });

      await test.step('Verify VM resource was created', async () => {
        const result = await k8sClient.verifyVmCreated(vmName, yamlNs);
        expect.soft(result.exists, `VM '${vmName}' should exist`).toBe(true);
      });

      await test.step('Verify VM appears in VM list', async () => {
        await vmTreePage.navigateToProjectVmListViaUI(yamlNs);
        const pageLoaded = await vmListPage.verifyPageLoaded(vmName);
        expect.soft(pageLoaded, `VM '${vmName}' should appear in the VM list`).toBe(true);
      });
    });
  },
);
