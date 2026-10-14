import { GATING_TAG } from '@/data-models/allure-constants';
import { ROUTE_VIRTUAL_MACHINES_LIST_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/vm-list-fixture';
import { dismissConsoleObstructions } from '@/utils/console-modals';
import { CRUD_NAMES, E2E_LABEL, E2E_LABEL_VALUE } from '@/utils/constants';
import { MINUTE, TestTimeouts } from '@/utils/test-config';

test.describe(`VirtualMachines read ${ROUTE_VIRTUAL_MACHINES_LIST_TAG} ${GATING_TAG}`, () => {
  test('API-seeded VM is visible in project list', async ({
    vmListPage,
    testNamespace,
    apiClient,
  }) => {
    const name = CRUD_NAMES.vmExample;

    await apiClient.deleteVirtualMachine(name, testNamespace);
    await apiClient.applyVirtualMachineExample(testNamespace, name);

    try {
      await vmListPage.goToNamespaceList(testNamespace);
      await expect(vmListPage.vmRow(name)).toBeVisible({ timeout: 2 * MINUTE });
    } finally {
      await apiClient.deleteVirtualMachine(name, testNamespace);
    }
  });
});

test.describe(`VirtualMachines namespace and empty state ${ROUTE_VIRTUAL_MACHINES_LIST_TAG} ${GATING_TAG}`, () => {
  test('Created namespace shows empty VM list, Learn quick start, and follow-up link', async ({
    page,
    vmListPage,
    testNamespace,
    apiClient,
  }) => {
    const namespace = await apiClient.getNamespace(testNamespace);
    expect(namespace?.name).toBe(testNamespace);
    expect(namespace?.labels?.[E2E_LABEL]).toBe(E2E_LABEL_VALUE);

    await vmListPage.goToNamespaceList(testNamespace);
    await expect(vmListPage.emptyStateHeading()).toBeVisible({ timeout: 2 * MINUTE });
    await expect(vmListPage.emptyStateCreateVirtualMachineButton()).toBeVisible();
    await expect(vmListPage.emptyStateCatalogTabLink()).toBeVisible();
    await expect(vmListPage.learnHowToUseVirtualMachinesButton()).toBeVisible();

    await vmListPage.openLearnHowToUseVirtualMachinesQuickStart();
    await expect(page).toHaveURL(/\/quickstart(\?|$)/);
    await expect(page).toHaveURL(/keyword=virtual/i);

    await expect(page.getByRole('heading', { name: /Quick Starts/i })).toBeVisible({
      timeout: TestTimeouts.ELEMENT_WAIT,
    });

    await dismissConsoleObstructions(page);
    await vmListPage.openCreatingVmQuickStartFromList();
    await expect(vmListPage.creatingVmQuickStartPanelHeading()).toBeVisible();
  });
});
