import { GATING_TAG } from '@/data-models/allure-constants';
import { ROUTE_VIRTUAL_MACHINES_LIST_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/vm-list-fixture';
import { CRUD_NAMES, E2E_LABEL, E2E_LABEL_VALUE } from '@/utils/constants';
import { TestTimeouts } from '@/utils/test-config';

test.describe(`VirtualMachines read ${ROUTE_VIRTUAL_MACHINES_LIST_TAG} ${GATING_TAG}`, () => {
  test('API-seeded VM is visible in project list', async ({
    apiClient,
    testNamespace,
    vmListPage,
  }) => {
    const name = CRUD_NAMES.vmExample;

    await apiClient.deleteVirtualMachine(name, testNamespace);
    await apiClient.applyVirtualMachineExample(testNamespace, name);

    try {
      await vmListPage.goToNamespaceList(testNamespace);
      await expect(vmListPage.vmRow(name)).toBeVisible({ timeout: TestTimeouts.TEST_SHORT });
    } finally {
      await apiClient.deleteVirtualMachine(name, testNamespace);
    }
  });
});

test.describe(`VirtualMachines namespace and empty state ${ROUTE_VIRTUAL_MACHINES_LIST_TAG} ${GATING_TAG}`, () => {
  test('Learn how to use VirtualMachines opens quickstart with virtual machine keyword', async ({
    testNamespace,
    vmListPage,
  }) => {
    await vmListPage.goToNamespaceList(testNamespace);
    await expect(vmListPage.emptyStateHeading()).toBeVisible({
      timeout: TestTimeouts.TEST_SHORT,
    });
    await expect(vmListPage.learnHowToUseVirtualMachinesButton()).toBeVisible();

    await vmListPage.openLearnHowToUseVirtualMachinesQuickStart();
    await expect
      .poll(() => vmListPage.currentUrl(), { timeout: TestTimeouts.ELEMENT_WAIT })
      .toMatch(vmListPage.quickStartsCatalogUrlPattern());
    await expect
      .poll(() => vmListPage.currentUrl())
      .toMatch(vmListPage.quickStartsVirtualKeywordUrlPattern());
  });

  test('Created namespace shows empty VM list, Learn quick start, and follow-up link', async ({
    apiClient,
    testNamespace,
    vmListPage,
  }) => {
    const namespace = await apiClient.getNamespace(testNamespace);
    expect(namespace?.name).toBe(testNamespace);
    expect(namespace?.labels?.[E2E_LABEL]).toBe(E2E_LABEL_VALUE);

    await vmListPage.goToNamespaceList(testNamespace);
    await expect(vmListPage.emptyStateHeading()).toBeVisible({
      timeout: TestTimeouts.TEST_SHORT,
    });
    await expect(vmListPage.emptyStateCreateVirtualMachineButton()).toBeVisible();
    await expect(vmListPage.emptyStateCatalogTabLink()).toBeVisible();
    await expect(vmListPage.learnHowToUseVirtualMachinesButton()).toBeVisible();

    await vmListPage.openLearnHowToUseVirtualMachinesQuickStart();
    await expect(vmListPage.quickStartsHeading()).toBeVisible({
      timeout: TestTimeouts.ELEMENT_WAIT,
    });

    const quickStartOutcome = await vmListPage.openCreatingVirtualMachineQuickStartGuide();
    if (quickStartOutcome === 'unavailable') {
      // Fresh/minimal clusters may not ship the Creating a VM quick start CR.
      return;
    }
    await expect(vmListPage.creatingVmQuickStartContent()).toBeVisible({
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
  });
});
