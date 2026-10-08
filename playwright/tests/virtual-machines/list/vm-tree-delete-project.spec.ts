import { ADMIN_ONLY_TAG, GATING, GATING_TAG, VM_LIST_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/vm-search-fixture';
import { generateRandomVmName } from '@/utils/random-data-generator';
import { TestTimeouts } from '@/utils/test-config';
import { createVmWithEmptyDisk, setupTestNamespace } from '@/utils/test-setup-helpers';
import { ROUTE_VIRTUAL_MACHINES_LIST_TAG } from '@/data-models/route-tags';

const SUITE = 'VM tree view delete project';

test.describe(SUITE, { tag: [ROUTE_VIRTUAL_MACHINES_LIST_TAG, GATING_TAG] }, () => {
  test('Delete project action is available only for projects with no VirtualMachines', async ({
    vmListPage,
    apiClient,
    utils,
  }) => {
    await utils.withAllure({
      suite: SUITE,
      feature: GATING,
      tags: [GATING_TAG, VM_LIST_TAG, ADMIN_ONLY_TAG, 'CNV-97320'],
    });

    const emptyNamespace = await setupTestNamespace(apiClient, 'tree-del-empty');
    const vmNamespace = await setupTestNamespace(apiClient, 'tree-del-vm');
    const vmName = generateRandomVmName('tree-del');
    await createVmWithEmptyDisk(apiClient, vmName, vmNamespace, false);

    await test.step('Navigate to VirtualMachines and display empty projects', async () => {
      await vmListPage.navigateToVirtualMachinesViaUI();
      await vmListPage.tryCloseWelcomeModal();
      await vmListPage.waitForTreeViewReady();
      await vmListPage.toggleEmptyProjectsDisplay(true);
    });

    await test.step('Delete project action is present on the empty project', async () => {
      await vmListPage.searchTreeView(emptyNamespace);
      await expect
        .poll(() => vmListPage.isTreeNodeVisible(emptyNamespace), {
          message: `Empty project ${emptyNamespace} should exist in the tree`,
          timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
        })
        .toBe(true);

      await vmListPage.rightClickNamespaceInTreeView(emptyNamespace);
      const menuItems = await vmListPage.getTreeViewContextMenuItems();
      expect(
        menuItems.some((item) => item.testId === 'delete-project'),
        'Delete project action should be visible for a project with 0 VirtualMachines',
      ).toBe(true);
      await vmListPage.dismissContextMenu();
    });

    await test.step('Delete project action is absent on the project with a VirtualMachine', async () => {
      await vmListPage.searchTreeView(vmNamespace);
      await expect
        .poll(() => vmListPage.isTreeNodeVisible(vmNamespace), {
          message: `Project ${vmNamespace} should exist in the tree`,
          timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
        })
        .toBe(true);

      await vmListPage.rightClickNamespaceInTreeView(vmNamespace);
      const menuItems = await vmListPage.getTreeViewContextMenuItems();
      expect(
        menuItems.some((item) => item.testId === 'delete-project'),
        'Delete project action should not be visible for a project that contains VirtualMachines',
      ).toBe(false);
      await vmListPage.dismissContextMenu();
    });
  });

  test('Deleting a project from the tree view removes the namespace', async ({
    vmListPage,
    apiClient,
    utils,
  }) => {
    await utils.withAllure({
      suite: SUITE,
      feature: GATING,
      tags: [GATING_TAG, VM_LIST_TAG, ADMIN_ONLY_TAG, 'CNV-97320'],
    });

    const namespace = await setupTestNamespace(apiClient, 'tree-del-project');

    await test.step('Navigate to VirtualMachines and confirm the project exists', async () => {
      await vmListPage.navigateToVirtualMachinesViaUI();
      await vmListPage.tryCloseWelcomeModal();
      await vmListPage.waitForTreeViewReady();
      await vmListPage.toggleEmptyProjectsDisplay(true);
      await vmListPage.searchTreeView(namespace);
      await expect
        .poll(() => vmListPage.isTreeNodeVisible(namespace), {
          message: `Project ${namespace} should exist in the tree before deletion`,
          timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
        })
        .toBe(true);
    });

    await test.step('Delete the project via the tree view context menu', async () => {
      await vmListPage.deleteProjectViaContextMenu(namespace);
    });

    await test.step('Project is removed from the tree and redirects away', async () => {
      await expect
        .poll(() => vmListPage.page.url(), {
          message: 'Page should redirect away from the deleted namespace',
          timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
        })
        .not.toContain(`/ns/${namespace}/`);

      await expect
        .poll(() => vmListPage.isTreeNodeVisible(namespace), {
          message: `Project ${namespace} should no longer be visible in the tree`,
          timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
        })
        .toBe(false);
    });

    await test.step('Project no longer exists in the cluster', async () => {
      await expect
        .poll(() => apiClient.namespaceExists(namespace), {
          message: `Namespace ${namespace} should no longer exist in the cluster`,
          timeout: TestTimeouts.DEFAULT,
        })
        .toBe(false);
    });
  });
});
