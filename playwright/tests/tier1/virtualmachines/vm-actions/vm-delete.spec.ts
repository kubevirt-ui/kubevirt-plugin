import { T1, T1_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/vm-actions-fixture';
import { TestTimeouts } from '@/utils/test-config';

test.describe('Tier1 VM Single Delete', { tag: [T1_TAG, '@tier1-vm-actions'] }, () => {
  test(
    'Delete a single VM via list kebab action removes it from the list and cluster',
    { tag: ['@nonpriv'] },
    async ({ vmListPage, vmTreePage, apiClient, utils }) => {
      const SUITE = 'VM Single Delete';
      await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG, '@tier1-vm-actions'] });

      const ns = utils.generateTestNamespace('del');
      await apiClient.createNamespace(ns);
      await apiClient.waitForNamespaceReady(ns);
      apiClient.trackResource('Namespace', ns);

      const vmName = utils.generateRandomVmName('del');
      await apiClient.createVmFromTemplate(
        utils.TEMPLATE_METADATA_NAMES.RHEL9,
        vmName,
        ns,
        'openshift',
        false,
      );
      apiClient.trackResource('VirtualMachine', vmName, ns);

      await apiClient.waitForVmExists(vmName, ns);

      await test.step('Navigate to VM list via UI and locate the VM', async () => {
        await vmTreePage.navigateToVirtualMachinesViaUI();
        await vmTreePage.toggleEmptyProjectsDisplay(true);
        await vmTreePage.searchTreeView(ns);
        await vmTreePage.clickProjectNode(ns);
        await vmListPage.clickVmListTab();
        await vmListPage.waitForVmRowVisible(vmName);
      });

      await test.step('Delete VM via kebab action', async () => {
        await vmListPage.clickVmRowAction(vmName, 'delete');
        await vmListPage.clickDeleteConfirmationButton();
      });

      await test.step('Verify VM is removed from the list', async () => {
        await vmListPage.waitForVmRowDetached(vmName, TestTimeouts.VM_CREATION);
        const stillVisible = await vmListPage.isVmVisibleByDataTest(
          vmName,
          TestTimeouts.UI_DELAY_SHORT,
        );
        expect.soft(stillVisible, 'VM row should be gone after single delete').toBe(false);
      });

      await test.step('Verify VM no longer exists in the cluster', async () => {
        const exists = await apiClient
          .waitForVmExists(vmName, ns, TestTimeouts.SHORT_WAIT)
          .catch(() => false);
        expect.soft(exists, 'VM should no longer exist in the cluster').toBeFalsy();
      });
    },
  );
});
