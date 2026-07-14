import { T1, T1_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/vm-actions-fixture';

test.describe('Tier1 VM Bulk Actions Tests', { tag: [T1_TAG, '@tier1-bulk-ops'] }, () => {
  test.beforeEach(async ({ vmListPage, testConfig }) => {
    await vmListPage.navigateToNamespaceVirtualMachinesViaUI(testConfig.testNamespace);
    await vmListPage.toggleEmptyProjectsDisplay(true);
  });

  test(
    'Bulk delete selected VMs removes them from the list',
    { tag: ['@nonpriv'] },
    async ({ vmListPage, vmTreePage, k8sClient, utils }) => {
      const SUITE = 'VM Bulk Actions';
      await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG, '@tier1-bulk-ops'] });

      const ns = utils.generateTestNamespace('bulk-del');
      await k8sClient.createNamespace(ns);
      await k8sClient.waitForNamespaceReady(ns);
      k8sClient.trackResource('Namespace', ns);

      const vmName = utils.generateRandomVmName('bulk-del');
      await k8sClient.createVmFromTemplate(
        utils.TEMPLATE_METADATA_NAMES.RHEL9,
        vmName,
        ns,
        'openshift',
        false,
      );
      k8sClient.trackResource('VirtualMachine', vmName, ns);

      const created = await k8sClient.verifyVmCreated(vmName, ns, utils.TestTimeouts.VM_BOOTUP);
      expect(created.exists, 'VM should be created').toBe(true);

      await vmTreePage.searchTreeView(ns);
      await vmTreePage.clickProjectNode(ns);
      await vmListPage.clickVmListTab();
      await vmListPage.waitForVmRowVisible(vmName);

      await test.step('Select VM and bulk delete', async () => {
        await vmListPage.selectVmByCheckbox(vmName);
        await vmListPage.clickVmAction('delete');
        await vmListPage.clickDeleteConfirmationButton();
      });

      await test.step('VM no longer appears in list', async () => {
        await vmListPage.waitForVmRowDetached(vmName, utils.TestTimeouts.VM_CREATION);
        const stillVisible = await vmListPage.isVmVisibleByDataTest(
          vmName,
          utils.TestTimeouts.UI_DELAY_SHORT,
        );
        expect(stillVisible, 'VM row should be gone after bulk delete').toBe(false);
      });
    },
  );
});
