import { expect, Locator, Page } from '@playwright/test';

import { byTest, byTestId } from '../utils/locators';

export class VMListPage {
  constructor(private readonly page: Page) {}

  // ── Navigation ──────────────────────────────────────────────────────────────

  async clearNameFilter() {
    await this.page.locator('[data-test="vm-filter-name-input"] input').clear();
  }

  /** Click a named action in the open actions menu. */
  async clickAction(actionId: string) {
    await byTestId(this.page, actionId).click();
  }

  // ── Row helpers ──────────────────────────────────────────────────────────────

  /** Hover a flyout submenu trigger, then click the action inside it. */
  async clickSubmenuAction(submenuId: string, actionId: string) {
    await byTestId(this.page, submenuId).hover();
    await byTestId(this.page, actionId).click();
  }

  /** Assert the Create VM button is visible. */
  async expectCreateButtonVisible() {
    await expect(byTest(this.page, 'item-create')).toBeVisible();
  }

  /** Wait for the status column in a VM row to reach the expected value. */
  async expectRowStatus(vmName: string, status: string, timeout = 120_000) {
    // PatternFly tables set data-label on cells for responsive display
    await expect(
      this.row(vmName).locator('[data-label="Status"]').filter({ hasText: status }),
    ).toBeVisible({ timeout });
  }

  /** Assert the tree-view panel is rendered alongside the list. */
  async expectTreeViewVisible() {
    await expect(byTest(this.page, 'vms-treeview')).toBeVisible();
  }

  async filterByName(name: string) {
    await this.page.locator('[data-test="vm-filter-name-input"] input').fill(name);
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
    const vmListTab = byTest(this.page, 'vm-list-tab');
    await expect(vmListTab).toBeVisible({ timeout: 60_000 });
    await vmListTab.click();

    // Confirm the tab is selected and the list body is shown
    await expect(byTest(this.page, 'item-create')).toBeVisible({ timeout: 60_000 });
  }

  /** Click the row's kebab actions menu toggle. */
  async openRowMenu(vmName: string) {
    // The VM row action cell renders with data-test="kebab-button"
    await this.row(vmName).locator('[data-test="kebab-button"]').click();
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
  async waitForRow(vmName: string, timeout = 30_000): Promise<boolean> {
    try {
      await this.row(vmName).first().waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }
}
