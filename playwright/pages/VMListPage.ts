import { expect, Locator, Page } from '@playwright/test';

import { ITEM_CREATE, KEBAB_BUTTON, MINUTE, SECOND } from '../utils/constants';
import { byTest, byTestId } from '../utils/locators';

const VM_FILTER_NAME_INPUT = 'vm-filter-name-input';
const VM_LIST_TAB = 'vm-list-tab';
const VMS_TREEVIEW = 'vms-treeview';

export class VMListPage {
  constructor(private readonly page: Page) {}

  // ── Navigation ──────────────────────────────────────────────────────────────

  async clearNameFilter() {
    await this.page.locator(`[data-test="${VM_FILTER_NAME_INPUT}"] input`).clear();
  }

  /** Click a named action in the open actions menu. */
  async clickAction(actionId: string) {
    await byTestId(this.page, actionId).click();
  }

  // ── Row helpers ──────────────────────────────────────────────────────────────

  /** Hover a flyout submenu trigger, then click the action inside it. */
  async clickSubmenuAction(submenuId: string, actionId: string) {
    await byTestId(this.page, submenuId).hover();
    await expect(byTestId(this.page, actionId)).toBeVisible();
    await byTestId(this.page, actionId).click();
  }

  /** Assert the Create VM button is visible. */
  async expectCreateButtonVisible() {
    await expect(byTest(this.page, ITEM_CREATE)).toBeVisible();
  }

  /** Wait for the status column in a VM row to reach the expected value. */
  async expectRowStatus(vmName: string, status: string, timeout = 2 * MINUTE) {
    // PatternFly tables set data-label on cells for responsive display
    await expect(
      this.row(vmName).locator('[data-label="Status"]').filter({ hasText: status }),
    ).toBeVisible({ timeout });
  }

  /** Assert the tree-view panel is rendered alongside the list. */
  async expectTreeViewVisible() {
    await expect(byTest(this.page, VMS_TREEVIEW)).toBeVisible();
  }

  async filterByName(name: string) {
    await this.page.locator(`[data-test="${VM_FILTER_NAME_INPUT}"] input`).fill(name);
  }

  // ── Filters ──────────────────────────────────────────────────────────────────

  /**
   * Navigate directly to the VM list for the given namespace (or all-namespaces).
   * The page loads with the Overview tab selected by default, so we explicitly
   * click the "VirtualMachines" tab (`data-test="vm-list-tab"`) to show the list.
   */
  async navigateToVMList(ns?: string) {
    const nsPath = ns ? `ns/${ns}` : 'all-namespaces';
    await this.page.goto(`/k8s/${nsPath}/kubevirt.io~v1~VirtualMachine`);
    await this.page.waitForLoadState('domcontentloaded');

    // Click the VirtualMachines tab to switch from the default Overview tab
    const vmListTab = byTest(this.page, VM_LIST_TAB);
    await expect(vmListTab).toBeVisible({ timeout: MINUTE });
    await vmListTab.click();

    // Confirm the tab is selected and the list body is shown
    await expect(byTest(this.page, ITEM_CREATE)).toBeVisible({ timeout: MINUTE });
  }

  /** Click the row's kebab actions menu toggle. */
  async openRowMenu(vmName: string) {
    // The VM row action cell renders with data-test="kebab-button"
    await this.row(vmName).locator(`[data-test="${KEBAB_BUTTON}"]`).click();
  }

  /** Click a VM name link to navigate to its details page. */
  async openVM(vmName: string) {
    await byTestId(this.page, vmName).click();
  }

  // ── Assertions ────────────────────────────────────────────────────────────────

  /**
   * Returns the table row containing the given resource name.
   * Uses the accessible `row` role so it works across different list implementations
   * without relying on SDK-specific data attributes.
   */
  row(vmName: string): Locator {
    return this.page.getByRole('row').filter({ hasText: vmName });
  }

  async switchNamespace(ns: string) {
    await this.navigateToVMList(ns);
  }

  /**
   * Wait for a VM row to appear in the list.
   * Returns `true` when found within the timeout, `false` if not found.
   */
  async waitForRow(vmName: string, timeout = 30 * SECOND): Promise<boolean> {
    try {
      await this.row(vmName).first().waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }
}
