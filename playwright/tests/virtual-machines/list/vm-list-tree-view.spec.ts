import { ADMIN_ONLY_TAG, T2_TAG } from '@/data-models/allure-constants';
import { ROUTE_VIRTUAL_MACHINES_LIST_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/vm-list-fixture';
import { generateNameWithBase } from '@/utils/random-data-generator';
import { TestTimeouts } from '@/utils/test-config';

test.describe(`VirtualMachines tree view create ${ROUTE_VIRTUAL_MACHINES_LIST_TAG} ${T2_TAG} ${ADMIN_ONLY_TAG}`, () => {
  test('Create project from VM list tree view', async ({ apiClient, vmListPage }) => {
    const projectName = generateNameWithBase('pw-tree-proj', 50);
    await apiClient.deleteNamespace(projectName).catch(() => undefined);

    try {
      await vmListPage.goToAllNamespacesList();
      await vmListPage.showProjectsWithoutVmsInTree();
      await vmListPage.createProjectFromTree(projectName);
      await expect
        .poll(async () => (await apiClient.getNamespace(projectName))?.name, {
          message: `Project ${projectName} should exist after tree create`,
          timeout: TestTimeouts.RESOURCE_CREATION,
        })
        .toBe(projectName);

      await vmListPage.goToAllNamespacesList();
      await vmListPage.searchTreeView(projectName);
      await vmListPage.waitForTreeItemVisible(vmListPage.projectTreeItemId(projectName));
    } finally {
      await apiClient.deleteNamespace(projectName).catch(() => undefined);
    }
  });
});
