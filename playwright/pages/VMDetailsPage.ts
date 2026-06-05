import { expect, Locator, Page } from '@playwright/test';

import { MINUTE, SECOND } from '../utils/constants';
import { byTest, byTestId } from '../utils/locators';

type DiagnosticsSeverity = 'all' | 'critical' | 'healthy' | 'warning';

const ACTIONS_DROPDOWN = 'actions-dropdown';
const DIAGNOSTICS_CARD = 'diagnostics-card';
const DIAGNOSTICS_SEARCH = 'diagnostics-search';
const VM_DIAGNOSTICS_SUB_TAB = 'vm-diagnostics';
const VM_MIGRATION_PENDING_CHANGES_MESSAGE = 'vm-migration-pending-changes-message';
const VM_PENDING_CHANGES_ALERT = 'vm-pending-changes-alert';
const VIRTUAL_MACHINE_OVERVIEW_DETAILS_STATUS = 'virtual-machine-overview-details-status';
const VM_ACTION_PAUSE_BUTTON = 'vm-action-pause-button';
const VM_ACTION_RESTART_BUTTON = 'vm-action-restart-button';
export const VM_ACTION_START_BUTTON = 'vm-action-start-button';
const VM_ACTION_STOP_BUTTON = 'vm-action-stop-button';
const VM_ACTION_UNPAUSE_BUTTON = 'vm-action-unpause-button';

export class VMDetailsPage {
  readonly clearAllFiltersButton: Locator;
  readonly diagnosticsOverviewHeading: Locator;
  readonly diagnosticsSearchInput: Locator;
  readonly issuesHeading: Locator;
  readonly statusConditionsHeading: Locator;

  constructor(private readonly page: Page) {
    this.diagnosticsSearchInput = byTest(page, DIAGNOSTICS_SEARCH).locator('input');
    this.issuesHeading = page.getByRole('heading', { name: 'Issues' });
    this.statusConditionsHeading = page.getByRole('heading', { name: 'Status conditions' });
    this.diagnosticsOverviewHeading = page.getByRole('heading', {
      name: 'Diagnostics overview',
    });
    this.clearAllFiltersButton = page.getByRole('button', { name: 'Clear all filters' });
  }

  // ── Header assertions ────────────────────────────────────────────────────────

  async clearDiagnosticsSearch() {
    await this.diagnosticsSearchInput.fill('');
  }

  async clickActionMenuItem(actionId: string) {
    await byTestId(this.page, actionId).click();
  }

  async clickDiagnosticsCard(severity: DiagnosticsSeverity) {
    await this.diagnosticsCard(severity).click();
  }

  // ── Icon-bar quick action buttons ──────────────────────────────────────────

  async clickPause() {
    await byTestId(this.page, VM_ACTION_PAUSE_BUTTON).click();
  }

  async clickRestart() {
    await byTestId(this.page, VM_ACTION_RESTART_BUTTON).click();
  }

  async clickStart() {
    await byTestId(this.page, VM_ACTION_START_BUTTON).click({ timeout: 30 * SECOND });
  }

  async clickStop() {
    await byTestId(this.page, VM_ACTION_STOP_BUTTON).click();
  }

  async clickSubmenuAction(submenuId: string, actionId: string) {
    await byTestId(this.page, submenuId).hover();
    await expect(byTestId(this.page, actionId)).toBeVisible();
    await byTestId(this.page, actionId).click();
  }

  async clickUnpause() {
    await byTestId(this.page, VM_ACTION_UNPAUSE_BUTTON).click();
  }

  // ── Actions dropdown ───────────────────────────────────────────────────────

  diagnosticsCard(severity: DiagnosticsSeverity): Locator {
    return byTest(this.page, `${DIAGNOSTICS_CARD}-${severity}`);
  }

  async expectDiagnosticsCardCount(severity: DiagnosticsSeverity, count: number) {
    await expect(this.diagnosticsCard(severity)).toContainText(String(count));
  }

  async expectDiagnosticsCardNotSelected(severity: DiagnosticsSeverity) {
    await expect(this.diagnosticsCard(severity)).toHaveAttribute('aria-pressed', 'false');
  }

  // ── Pending changes ────────────────────────────────────────────────────────

  async expectDiagnosticsCardSelected(severity: DiagnosticsSeverity) {
    await expect(this.diagnosticsCard(severity)).toHaveAttribute('aria-pressed', 'true');
  }

  async expectDiagnosticsEmptyFilterState() {
    await expect(this.page.getByText('No results found')).toBeVisible();
  }

  // ── Tab navigation ─────────────────────────────────────────────────────────

  async expectDiagnosticsOverviewVisible() {
    await expect(this.diagnosticsOverviewHeading).toBeVisible();
    await expect(this.diagnosticsCard('critical')).toBeVisible();
    await expect(this.diagnosticsCard('warning')).toBeVisible();
    await expect(this.diagnosticsCard('healthy')).toBeVisible();
    await expect(this.diagnosticsCard('all')).toBeVisible();
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

  // ── Diagnostics helpers ────────────────────────────────────────────────────

  async expectNoPendingChangesAlert() {
    await expect(byTestId(this.page, VM_PENDING_CHANGES_ALERT)).toHaveCount(0);
  }

  async expectOverviewStatus(status: string, timeout = 30 * MINUTE) {
    await expect(
      byTestId(this.page, VIRTUAL_MACHINE_OVERVIEW_DETAILS_STATUS).filter({ hasText: status }),
    ).toBeVisible({ timeout });
  }

  async expectStatus(status: string, timeout = 2 * MINUTE) {
    await expect(this.page.locator('h1').getByText(status, { exact: true })).toBeVisible({
      timeout,
    });
  }

  async goToConfigSubTab(subTabId: string) {
    await this.goToTab('Configuration');
    const sub = byTestId(this.page, `vm-configuration-${subTabId}`);
    await expect(sub).toBeVisible();
    await sub.click();
  }

  async goToDiagnosticsSubTab(subTabId: string) {
    await this.goToTab('Diagnostics');
    const sub = byTest(this.page, `${VM_DIAGNOSTICS_SUB_TAB}-${subTabId}`);
    await expect(sub).toBeVisible();
    await sub.click();
  }

  async goToTab(tabName: string) {
    const link = byTestId(this.page, `horizontal-link-${tabName}`);
    await expect(link).toBeVisible({ timeout: 30 * SECOND });
    await link.click();
  }

  async isStartVisible() {
    return byTestId(this.page, VM_ACTION_START_BUTTON).isEnabled();
  }

  async openActionsMenu() {
    await byTest(this.page, ACTIONS_DROPDOWN).click();
  }

  async searchDiagnostics(text: string) {
    await this.diagnosticsSearchInput.fill(text);
  }
}
