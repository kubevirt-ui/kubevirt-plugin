import { expect, Page } from '@playwright/test';

import { MINUTE, SECOND } from '../utils/constants';
import { byTest, byTestId } from '../utils/locators';

const ACTIONS_DROPDOWN = 'actions-dropdown';
const VM_MIGRATION_PENDING_CHANGES_MESSAGE = 'vm-migration-pending-changes-message';
const VM_PENDING_CHANGES_ALERT = 'vm-pending-changes-alert';
const VIRTUAL_MACHINE_OVERVIEW_DETAILS_STATUS = 'virtual-machine-overview-details-status';
const VM_ACTION_PAUSE_BUTTON = 'vm-action-pause-button';
const VM_ACTION_RESTART_BUTTON = 'vm-action-restart-button';
export const VM_ACTION_START_BUTTON = 'vm-action-start-button';
const VM_ACTION_STOP_BUTTON = 'vm-action-stop-button';
const VM_ACTION_UNPAUSE_BUTTON = 'vm-action-unpause-button';

export class VMDetailsPage {
  constructor(private readonly page: Page) {}

  // ── Header assertions ────────────────────────────────────────────────────────

  async clickActionMenuItem(actionId: string) {
    await byTestId(this.page, actionId).click();
  }

  async clickPause() {
    await byTestId(this.page, VM_ACTION_PAUSE_BUTTON).click();
  }

  // ── Icon-bar quick action buttons ────────────────────────────────────────────

  async clickRestart() {
    await byTestId(this.page, VM_ACTION_RESTART_BUTTON).click();
  }

  async clickStart() {
    await byTestId(this.page, VM_ACTION_START_BUTTON).click({ timeout: 30 * SECOND });
  }

  async clickStop() {
    await byTestId(this.page, VM_ACTION_STOP_BUTTON).click();
  }

  /** Hover a flyout sub-menu then click the target item inside it. */
  async clickSubmenuAction(submenuId: string, actionId: string) {
    await byTestId(this.page, submenuId).hover();
    await expect(byTestId(this.page, actionId)).toBeVisible();
    await byTestId(this.page, actionId).click();
  }

  async clickUnpause() {
    await byTestId(this.page, VM_ACTION_UNPAUSE_BUTTON).click();
  }

  async expectMigrationRequiredAlert(expectedMessagePart?: RegExp | string) {
    const alert = byTestId(this.page, VM_PENDING_CHANGES_ALERT);
    await expect(alert).toBeVisible({ timeout: 30 * SECOND });
    await expect(alert.getByText('Migration required')).toBeVisible();
    if (expectedMessagePart) {
      await expect(byTestId(this.page, VM_MIGRATION_PENDING_CHANGES_MESSAGE)).toContainText(
        expectedMessagePart,
      );
    }
  }

  async expectName(vmName: string) {
    await expect(this.page.locator('h1').getByText(vmName)).toBeVisible();
  }

  async expectNoPendingChangesAlert() {
    await expect(byTestId(this.page, VM_PENDING_CHANGES_ALERT)).toHaveCount(0);
  }

  // ── Actions dropdown ─────────────────────────────────────────────────────────

  async expectOverviewStatus(status: string, timeout = 30 * MINUTE) {
    await expect(
      byTestId(this.page, VIRTUAL_MACHINE_OVERVIEW_DETAILS_STATUS).filter({ hasText: status }),
    ).toBeVisible({ timeout });
  }

  /**
   * Wait for the VM status badge in the page header to display the given text.
   * The badge lives inside the h1 heading so we scope the text search there
   * rather than relying on a CSS class selector.
   */
  async expectStatus(status: string, timeout = 2 * MINUTE) {
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
    await expect(link).toBeVisible({ timeout: 30 * SECOND });
    await link.click();
  }

  // ── Tab content assertions ───────────────────────────────────────────────────

  /** Returns true when the Start icon button is visible (VM is stopped). */
  async isStartVisible() {
    return byTestId(this.page, VM_ACTION_START_BUTTON).isEnabled();
  }

  async openActionsMenu() {
    // VM details Actions button uses data-test="actions-dropdown" (from ActionsDropdown component)
    await byTest(this.page, ACTIONS_DROPDOWN).click();
  }
}
