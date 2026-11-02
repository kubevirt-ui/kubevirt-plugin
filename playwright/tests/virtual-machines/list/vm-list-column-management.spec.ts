import { ADMIN_ONLY_TAG, T1, T1_TAG, VM_LIST_TAG } from '@/data-models/allure-constants';
import { ROUTE_VIRTUAL_MACHINES_LIST_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/vm-list-fixture';
import type VirtualMachinesPage from '@/page-objects/vm/virtual-machines-page';
import { TestTimeouts } from '@/utils/test-config';
import { setupTestNamespace } from '@/utils/test-setup-helpers';
import { cleanupVmFixtures, createHaltedVm } from '@/utils/vm-search-test-helpers';
import type { Page } from '@playwright/test';

const SUITE = 'VM List Column Management';

/** Table header order after dragging Memory above vCPU in the manage-columns list. */
const EXPECTED_VISIBLE_COLUMN_HEADERS = [
  'Name',
  'Namespace',
  'Memory',
  'vCPU',
  'Memory Utilization',
  'CPU Utilization',
] as const;

const COLUMNS_TO_ENABLE = ['namespace', 'vcpu', 'memory', 'memory-usage', 'cpu-usage'] as const;

const NAME_COLUMN_ID = 'name';

/** PatternFly DataViewTh resize control for the Name column (English UI). */
const RESIZE_NAME_COLUMN_ARIA_LABEL = 'Resize name column';

const RESET_COLUMN_WIDTHS_ARIA_LABEL = 'Reset column widths';

const resetColumnWidthsButton = (page: Page) => page.getByTestId('reset-column-widths');

const MIN_COLUMN_WIDTH_INCREASE_PX = 30;
const COLUMN_WIDTH_RESTORE_TOLERANCE_PX = 30;

const vmListTable = (page: Page) => page.locator('table.kubevirt-table').first();

const columnManagementModal = (page: Page) => page.getByTestId('dialog-modal');

const columnManagementCheckbox = (page: Page, columnId: string) =>
  columnManagementModal(page).locator(`#data-list-${columnId}`);

const columnManagementListItem = (page: Page, columnId: string) =>
  columnManagementModal(page)
    .locator(`[aria-labelledby="table-column-management-item-${columnId}"]`);

const columnManagementReorderHandle = (page: Page, columnId: string) =>
  columnManagementModal(page).getByTestId(`column-reorder-handle-${columnId}`);

const getTableColumnHeaders = async (page: Page): Promise<string[]> => {
  const headers = vmListTable(page).locator('thead th');
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

const getModalColumnIdsInDisplayOrder = async (page: Page): Promise<string[]> => {
  const labels = columnManagementModal(page).locator('[id^="table-column-management-item-"]');
  const count = await labels.count();

  const columnIds = await Promise.all(
    Array.from({ length: count }, async (_, index) => {
      const id = await labels.nth(index).getAttribute('id');
      if (!id?.startsWith('table-column-management-item-')) {
        return null;
      }
      return id.replace('table-column-management-item-', '');
    }),
  );

  return columnIds.filter((columnId): columnId is string => columnId !== null);
};

const dragColumnAbove = async (
  page: Page,
  sourceColumnId: string,
  targetColumnId: string,
): Promise<void> => {
  const sourceHandle = columnManagementReorderHandle(page, sourceColumnId);
  const targetRow = columnManagementListItem(page, targetColumnId);

  await sourceHandle.scrollIntoViewIfNeeded();
  await targetRow.scrollIntoViewIfNeeded();

  const sourceBox = await sourceHandle.boundingBox();
  const targetBox = await targetRow.boundingBox();

  if (!sourceBox || !targetBox) {
    throw new Error(`Could not resolve drag bounds for ${sourceColumnId} -> ${targetColumnId}`);
  }

  await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + 6, { steps: 20 });
  await page.mouse.up();
  await page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
};

const reorderColumnAbove = async (
  page: Page,
  sourceColumnId: string,
  targetColumnId: string,
): Promise<void> => {
  await expect(async () => {
    const order = await getModalColumnIdsInDisplayOrder(page);
    const sourceIndex = order.indexOf(sourceColumnId);
    const targetIndex = order.indexOf(targetColumnId);

    expect(sourceIndex, `Column "${sourceColumnId}" should be in the modal list`).toBeGreaterThan(
      -1,
    );
    expect(targetIndex, `Column "${targetColumnId}" should be in the modal list`).toBeGreaterThan(
      -1,
    );

    if (sourceIndex <= targetIndex) {
      return;
    }

    await dragColumnAbove(page, sourceColumnId, targetColumnId);

    const afterOrder = await getModalColumnIdsInDisplayOrder(page);
    expect(afterOrder.indexOf(sourceColumnId)).toBeLessThan(afterOrder.indexOf(targetColumnId));
  }).toPass({ timeout: TestTimeouts.ELEMENT_WAIT });
};

const reorderResourceColumnsForTest = async (page: Page): Promise<void> => {
  await reorderColumnAbove(page, 'memory', 'vcpu');
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

const columnResizeButton = (page: Page, ariaLabel: string) =>
  vmListTable(page).locator(`thead button[aria-label="${ariaLabel}"]`);

const columnHeaderForResizeButton = (page: Page, ariaLabel: string) =>
  columnResizeButton(page, ariaLabel).locator('xpath=ancestor::th[1]');

const getColumnHeaderWidth = async (page: Page, ariaLabel: string): Promise<number> => {
  const header = columnHeaderForResizeButton(page, ariaLabel);
  await header.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
  const box = await header.boundingBox();
  if (!box) {
    throw new Error(`Could not measure column header for resize control "${ariaLabel}"`);
  }
  return box.width;
};

const waitForColumnResizeControl = async (page: Page, ariaLabel: string): Promise<void> => {
  await columnResizeButton(page, ariaLabel).waitFor({
    state: 'visible',
    timeout: TestTimeouts.ELEMENT_WAIT,
  });
};

const dragResizeColumnWider = async (
  page: Page,
  ariaLabel: string,
  dragDeltaX: number,
): Promise<void> => {
  const resizeControl = columnResizeButton(page, ariaLabel);
  await resizeControl.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
  await resizeControl.scrollIntoViewIfNeeded();

  const box = await resizeControl.boundingBox();
  if (!box) {
    throw new Error(`Could not resolve bounds for resize control "${ariaLabel}"`);
  }

  const startX = box.x + box.width / 2;
  const startY = box.y + box.height / 2;
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX + dragDeltaX, startY, { steps: 15 });
  await page.mouse.up();
  await page.waitForTimeout(TestTimeouts.UI_STABILIZE);
};

const clickRestoreColumnWidths = async (page: Page): Promise<void> => {
  const restoreButton = resetColumnWidthsButton(page);
  await restoreButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
  await restoreButton.click();
  await page.waitForTimeout(TestTimeouts.UI_STABILIZE);
};

test.describe(SUITE, { tag: [T1_TAG, ADMIN_ONLY_TAG] }, () => {
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

    await test.step('Open Manage columns, select columns, and reorder', async () => {
      await openColumnManagementModal(page);
      await configureResourceColumnSet(page);
      await reorderResourceColumnsForTest(page);
      await saveColumnManagementModal(page);
    });

    await test.step('Table shows selected columns in reordered header sequence', async () => {
      await expectTableHeadersExactly(page, EXPECTED_VISIBLE_COLUMN_HEADERS);
    });

    let initialNameColumnWidth = 0;

    await test.step('Table columns are resizable', async () => {
      await expect(resetColumnWidthsButton(page)).toBeVisible();
      await expect(columnResizeButton(page, RESIZE_NAME_COLUMN_ARIA_LABEL)).toBeVisible();
      const resizeButtons = vmListTable(page).locator('thead button[aria-label^="Resize "]');
      await expect(resizeButtons.first()).toBeVisible();
      expect(await resizeButtons.count()).toBeGreaterThan(1);
    });

    await test.step('Drag Name column wider and restore column widths', async () => {
      await waitForColumnResizeControl(page, RESIZE_NAME_COLUMN_ARIA_LABEL);
      initialNameColumnWidth = await getColumnHeaderWidth(page, RESIZE_NAME_COLUMN_ARIA_LABEL);
      await dragResizeColumnWider(page, RESIZE_NAME_COLUMN_ARIA_LABEL, 80);

      await expect(async () => {
        await waitForColumnResizeControl(page, RESIZE_NAME_COLUMN_ARIA_LABEL);
        const widerWidth = await getColumnHeaderWidth(page, RESIZE_NAME_COLUMN_ARIA_LABEL);
        expect(widerWidth).toBeGreaterThan(initialNameColumnWidth + MIN_COLUMN_WIDTH_INCREASE_PX);
      }).toPass({ timeout: TestTimeouts.ELEMENT_WAIT });

      await clickRestoreColumnWidths(page);

      await expect(async () => {
        await waitForColumnResizeControl(page, RESIZE_NAME_COLUMN_ARIA_LABEL);
        const restoredWidth = await getColumnHeaderWidth(page, RESIZE_NAME_COLUMN_ARIA_LABEL);
        expect(Math.abs(restoredWidth - initialNameColumnWidth)).toBeLessThanOrEqual(
          COLUMN_WIDTH_RESTORE_TOLERANCE_PX,
        );
      }).toPass({ timeout: TestTimeouts.ELEMENT_WAIT });
    });
  });
});
