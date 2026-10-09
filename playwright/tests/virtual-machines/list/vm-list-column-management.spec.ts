import { ADMIN_ONLY_TAG, T1, T1_TAG, VM_LIST_TAG } from '@/data-models/allure-constants';
import { ROUTE_VIRTUAL_MACHINES_LIST_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/vm-list-fixture';
import type VirtualMachinesPage from '@/page-objects/vm/virtual-machines-page';
import { TestTimeouts } from '@/utils/test-config';
import { setupTestNamespace } from '@/utils/test-setup-helpers';
import { cleanupVmFixtures, createHaltedVm } from '@/utils/vm-search-test-helpers';
import type { Page } from '@playwright/test';

const SUITE = 'VM List Column Management';

const EXPECTED_VISIBLE_COLUMN_HEADERS = [
  'Name',
  'Namespace',
  'vCPU',
  'Memory',
  'Memory Utilization',
  'CPU Utilization',
] as const;

const COLUMNS_TO_ENABLE = ['namespace', 'vcpu', 'memory', 'memory-usage', 'cpu-usage'] as const;

const NAME_COLUMN_ID = 'name';

const columnManagementModal = (page: Page) => page.getByTestId('dialog-modal');

const columnManagementCheckbox = (page: Page, columnId: string) =>
  columnManagementModal(page).locator(`#data-list-${columnId}`);

const getTableColumnHeaders = async (page: Page): Promise<string[]> => {
  const table = page.locator('table.kubevirt-table, table.pf-v6-c-table').first();
  const headers = table.locator('thead th');
  const count = await headers.count();

  const labels = await Promise.all(
    Array.from({ length: count }, async (_, index) => {
      const text = (await headers.nth(index).innerText()).trim();
      return text ? text.split('\n')[0].trim() : null;
    }),
  );

  return labels.filter((label): label is string => label !== null);
};

const openColumnManagementModal = async (page: Page): Promise<void> => {
  const manageColumnsButton = page.locator('button[aria-label="Column management"]');
  await manageColumnsButton.waitFor({
    state: 'visible',
    timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
  });
  await manageColumnsButton.click();
  await page.getByTestId('dialog-modal').waitFor({
    state: 'visible',
    timeout: TestTimeouts.ELEMENT_WAIT,
  });
};

const setManageColumnsCheckbox = async (
  page: Page,
  columnId: string,
  checked: boolean,
): Promise<void> => {
  const checkbox = columnManagementCheckbox(page, columnId);

  await checkbox.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
  await checkbox.scrollIntoViewIfNeeded();

  const isChecked = await checkbox.isChecked();
  if (isChecked === checked) {
    return;
  }

  if (checked) {
    await expect(
      checkbox,
      `Column "${columnId}" cannot be enabled — uncheck other columns first (max 10 visible)`,
    ).toBeEnabled();
  }

  await checkbox.click({ force: true });
  await page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

  const afterClick = await checkbox.isChecked();
  if (afterClick !== checked) {
    await checkbox.evaluate((el: HTMLInputElement) => el.click());
    await page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  }

  await expect(checkbox).toBeChecked({ checked });
};

const getManageableColumnIdsInModal = async (page: Page): Promise<string[]> => {
  const checkboxes = columnManagementModal(page).locator('[id^="data-list-"]');
  const count = await checkboxes.count();

  const columnIds = await Promise.all(
    Array.from({ length: count }, async (_, index) => {
      const id = await checkboxes.nth(index).getAttribute('id');
      if (!id?.startsWith('data-list-')) {
        return null;
      }
      return id.replace('data-list-', '');
    }),
  );

  return columnIds.filter((columnId): columnId is string => columnId !== null);
};

const waitForColumnManagementModalReady = async (page: Page): Promise<void> => {
  await expect(page.getByTestId('save-button')).toBeEnabled({
    timeout: TestTimeouts.ELEMENT_WAIT,
  });
};

const resetColumnManagementToDefaults = async (page: Page): Promise<void> => {
  await page.getByTestId('reset-button').click();
  await page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
};

const configureResourceColumnSet = async (page: Page): Promise<void> => {
  await waitForColumnManagementModalReady(page);
  await resetColumnManagementToDefaults(page);

  const columnIds = await getManageableColumnIdsInModal(page);

  for (const columnId of columnIds) {
    if (columnId === NAME_COLUMN_ID) {
      continue;
    }
    await setManageColumnsCheckbox(page, columnId, false);
  }

  await expect(columnManagementCheckbox(page, NAME_COLUMN_ID)).toBeChecked();

  for (const columnId of columnIds) {
    if (columnId === NAME_COLUMN_ID) {
      continue;
    }
    await expect(columnManagementCheckbox(page, columnId)).not.toBeChecked();
  }

  for (const columnId of COLUMNS_TO_ENABLE) {
    await setManageColumnsCheckbox(page, columnId, true);
  }

  await expect(columnManagementCheckbox(page, NAME_COLUMN_ID)).toBeChecked();
  await expect(columnManagementCheckbox(page, NAME_COLUMN_ID)).toBeDisabled();

  for (const columnId of COLUMNS_TO_ENABLE) {
    await expect(columnManagementCheckbox(page, columnId)).toBeChecked();
  }
};

const saveColumnManagementModal = async (page: Page): Promise<void> => {
  await waitForColumnManagementModalReady(page);
  await page.getByTestId('save-button').click();
  await page.getByTestId('dialog-modal').waitFor({ state: 'hidden' });
  await page.waitForTimeout(TestTimeouts.UI_STABILIZE);
};

const openAllProjectsVmList = async (
  vmListPage: VirtualMachinesPage,
  vmName: string,
): Promise<void> => {
  await vmListPage.navigateToVirtualMachinesViaUI();
  await vmListPage.tryCloseWelcomeModal();
  await vmListPage.waitForTreeViewReady();
  await vmListPage.clickLocalClusterInTree();
  await vmListPage.clickVmListTab();
  await vmListPage.fillVmSearchInput(vmName);
  await vmListPage.waitForVmRowVisible(vmName);
};

const expectTableHeadersExactly = async (
  page: Page,
  expected: readonly string[],
): Promise<void> => {
  await expect(async () => {
    const headers = await getTableColumnHeaders(page);
    expect(headers, `Table headers should be exactly ${expected.join(', ')}`).toEqual([
      ...expected,
    ]);
  }).toPass({ timeout: TestTimeouts.ELEMENT_WAIT });
};

test.describe(SUITE, { tag: [ROUTE_VIRTUAL_MACHINES_LIST_TAG, T1_TAG, ADMIN_ONLY_TAG] }, () => {
  let namespace: string;
  let vmName: string;

  test.beforeAll(async ({ apiClient, utils }) => {
    namespace = await setupTestNamespace(apiClient, 'vm-columns');
    vmName = utils.generateRandomVmName('col');

    await createHaltedVm(apiClient, {
      cpuCores: 1,
      memory: '256Mi',
      name: vmName,
      namespace,
    });
  });

  test.afterAll(async ({ apiClient }) => {
    if (namespace) {
      await cleanupVmFixtures(apiClient, namespace, [vmName]);
    }
  });

  test.beforeEach(async ({ vmListPage }) => {
    await openAllProjectsVmList(vmListPage, vmName);
  });

  test('shows only selected resource columns after manage columns', async ({ page, utils }) => {
    await utils.withAllure({
      suite: SUITE,
      feature: T1,
      tags: [ROUTE_VIRTUAL_MACHINES_LIST_TAG, T1_TAG, VM_LIST_TAG, ADMIN_ONLY_TAG],
    });

    await test.step('Open Manage columns and select the resource column set', async () => {
      await openColumnManagementModal(page);
      await configureResourceColumnSet(page);
      await saveColumnManagementModal(page);
    });

    await test.step('Table shows only the selected column headers', async () => {
      await expectTableHeadersExactly(page, EXPECTED_VISIBLE_COLUMN_HEADERS);
    });
  });
});
