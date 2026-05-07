import { expect, Page } from '@playwright/test';

import { byTest, byTestId } from '../utils/locators';

export class VMDetailsPage {
  constructor(private readonly page: Page) {}

  // ── Header assertions ────────────────────────────────────────────────────────

  async clickActionMenuItem(actionId: string) {
    await byTestId(this.page, actionId).click();
  }

  async clickPause() {
    await byTestId(this.page, 'vm-action-pause-button').click();
  }

  // ── Icon-bar quick action buttons ────────────────────────────────────────────

  async clickRestart() {
    await byTestId(this.page, 'vm-action-restart-button').click();
  }

  async clickStart() {
    await byTestId(this.page, 'vm-action-start-button').click();
  }

  async clickStop() {
    await byTestId(this.page, 'vm-action-stop-button').click();
  }

  /** Hover a flyout sub-menu then click the target item inside it. */
  async clickSubmenuAction(submenuId: string, actionId: string) {
    await byTestId(this.page, submenuId).hover();
    await byTestId(this.page, actionId).click();
  }

  async clickUnpause() {
    await byTestId(this.page, 'vm-action-unpause-button').click();
  }

  async expectName(vmName: string) {
    await expect(this.page.locator('h1').getByText(vmName)).toBeVisible();
  }

  // ── Actions dropdown ─────────────────────────────────────────────────────────

  async expectNoPendingChanges() {
    await expect(byTest(this.page, 'pending-changes-warning')).toHaveCount(0);
  }

  async expectOverviewStatus(status: string, timeout = 120_000) {
    await expect(
      byTestId(this.page, 'virtual-machine-overview-details-status').filter({ hasText: status }),
    ).toBeVisible({ timeout });
  }

  /**
   * Wait for the VM status badge in the page header to display the given text.
   * The badge lives inside the h1 heading so we scope the text search there
   * rather than relying on a CSS class selector.
   */
  async expectStatus(status: string, timeout = 120_000) {
    await expect(this.page.locator('h1').getByText(status, { exact: true })).toBeVisible({
      timeout,
    });
  }

  // ── Tab navigation ───────────────────────────────────────────────────────────

  async goToConfigSubTab(subTabId: string) {
    await this.goToTab('Configuration');
    const sub = byTestId(this.page, `vm-configuration-${subTabId}`);
    await expect(sub).toBeVisible();
    await sub.click();
  }

  async goToDiagnosticsSubTab(subTabId: string) {
    await this.goToTab('Diagnostics');
    const sub = byTestId(this.page, `vm-diagnostics-${subTabId}`);
    await expect(sub).toBeVisible();
    await sub.click();
  }

  async goToTab(tabName: string) {
    const link = byTestId(this.page, `horizontal-link-${tabName}`);
    await expect(link).toBeVisible({ timeout: 30_000 });
    await link.click();
  }

  // ── Tab content assertions ───────────────────────────────────────────────────

  /** Returns true when the Start icon button is visible (VM is stopped). */
  async isStartVisible() {
    return byTestId(this.page, 'vm-action-start-button').isVisible();
  }

  async openActionsMenu() {
    // VM details Actions button uses data-test="actions-dropdown" (from ActionsDropdown component)
    await byTest(this.page, 'actions-dropdown').click();
  }
}
