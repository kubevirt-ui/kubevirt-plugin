import { expect, Page } from '@playwright/test';

import { CONFIRM_VM_ACTIONS, NAV_TIMEOUT, SECOND, SHORT_TIMEOUT } from '../utils/constants';
import { env } from '../utils/env';
import { byTest, byTestId } from '../utils/locators';

const DEFAULT_RETRIES = 3;

const CLUSTER_SETTINGS = 'cluster-settings';
const GENERAL_INFORMATION_INSTALLED_VERSION = 'general-information-installed-version';
const GENERAL_INFORMATION_UPDATE_STATUS = 'general-information-update-status';
const GENERAL_SETTINGS_SECTION = 'General settings';
const MEMORY_REQUEST_RATIO_INPUT = 'memory-request-ratio-input';
const MEMORY_REQUEST_RATIO_SAVE_BUTTON = 'memory-request-ratio-save';
const MEMORY_REQUEST_RATIO_RESTORE_BUTTON = 'memory-request-ratio-restore';
const CLUSTER_TAB = 'Cluster';
const PREVIEW_FEATURES_TAB = 'Preview features';
const SETTINGS_HEADING = 'Settings';
const SAVE_BUTTON = 'save-button';
const SELECT_PROJECT_TOGGLE = 'select-project-toggle';
const SELECT_SECRET = 'select-secret';

export class SettingsPage {
  constructor(private readonly page: Page) {}

  // ── SSH key configuration ─────────────────────────────────────────────────────

  /** Wait for the settings shell — works regardless of which tab is active. */
  private async expectSettingsPageLoaded() {
    await expect(this.page.getByRole('heading', { level: 1, name: SETTINGS_HEADING })).toBeVisible({
      timeout: NAV_TIMEOUT,
    });
    await expect(this.page.getByRole('tab', { exact: true, name: CLUSTER_TAB })).toBeVisible({
      timeout: NAV_TIMEOUT,
    });
  }

  private async toggleVMActionsConfirmation(enable: boolean, retries: number) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await this.openSection(GENERAL_SETTINGS_SECTION);
        await this.openSection('VirtualMachine actions confirmation');
        const switchInput = byTestId(this.page, CONFIRM_VM_ACTIONS);
        await expect(switchInput).toBeVisible({ timeout: SHORT_TIMEOUT });
        const isOn = await switchInput.evaluate((el) => (el as HTMLInputElement).checked);
        if (isOn !== enable) {
          await switchInput.locator('..').click();
          await expect(switchInput).toBeChecked({ checked: enable, timeout: SHORT_TIMEOUT });
        }
        return;
      } catch (err) {
        if (attempt === retries) throw err;
        await this.page.waitForLoadState('domcontentloaded');
        await this.expectSettingsPageLoaded().catch(() => {});
      }
    }
  }

  // ── Section clicks ───────────────────────────────────────────────────────────

  async configureSSHSecret(ns: string, secretName: string) {
    await byTestId(this.page, SELECT_PROJECT_TOGGLE).click();
    await byTestId(this.page, `select-option-${ns}`).locator('button').click();
    await this.page.getByRole('button', { name: 'Not configured' }).click();
    await this.page.locator('#useExisting').click();
    await byTestId(this.page, SELECT_SECRET).click();
    // Wait for and click the option — PatternFly SelectOption renders with role="option"
    await this.page.getByRole('option', { exact: true, name: secretName }).click();
    // TabModal uses data-test="save-button" (not data-test-id)
    await byTest(this.page, SAVE_BUTTON).click();
  }

  // ── VM Actions confirmation ───────────────────────────────────────────────────

  /** Disable VM actions confirmation, retrying if the page reloads during the click. */
  async disableVMActionsConfirmation(retries = DEFAULT_RETRIES) {
    await this.toggleVMActionsConfirmation(false, retries);
  }

  /** Enable a preview feature toggle if it is not already on. */
  async enablePreviewFeature(featureTestId: string) {
    await this.navigate();
    await this.page.getByRole('tab', { exact: true, name: PREVIEW_FEATURES_TAB }).click();

    const switchInput = byTestId(this.page, featureTestId);
    await expect(switchInput).toBeVisible({ timeout: NAV_TIMEOUT });

    const isOn = await switchInput.isChecked();

    if (!isOn) {
      await switchInput.locator('..').click();
      await expect(switchInput).toBeChecked({ timeout: SHORT_TIMEOUT });
    }
  }

  /** Enable VM actions confirmation, retrying if the page reloads during the click. */
  async enableVMActionsConfirmation(retries = DEFAULT_RETRIES) {
    await this.toggleVMActionsConfirmation(true, retries);
  }

  async expectInstalledVersion(versionPrefix: string) {
    await expect(byTestId(this.page, GENERAL_INFORMATION_INSTALLED_VERSION)).toContainText(
      versionPrefix,
    );
  }

  // ── Assertions ────────────────────────────────────────────────────────────────

  async expectSSHSecretConfigured(secretName: string) {
    await expect(this.page.getByRole('button', { name: secretName })).toBeVisible();
  }

  async expectSSHSectionVisible(sectionTestId: string) {
    await expect(byTestId(this.page, sectionTestId)).toBeVisible();
  }

  async expectUpdateStatus(status: string) {
    await expect(byTestId(this.page, GENERAL_INFORMATION_UPDATE_STATUS)).toContainText(status);
  }

  async navigate() {
    await this.page.goto(`/k8s/ns/${env.cnvNamespace}/virtualization-settings`, {
      waitUntil: 'domcontentloaded',
    });
    await this.expectSettingsPageLoaded();
  }

  async navigateToSSHKeys() {
    await this.navigate();
    await this.page.getByRole('tab', { exact: true, name: 'User' }).click();
    // Wait for the URL hash to reflect the tab change before navigating to #ssh-keys
    await this.page.waitForURL(/user/, { timeout: SHORT_TIMEOUT }).catch(() => {});
    const baseUrl = this.page.url().split('#')[0];
    await this.page.goto(`${baseUrl}#ssh-keys`);
    await expect(this.page.getByText('Public SSH key')).toBeVisible({ timeout: NAV_TIMEOUT });
  }

  async openMemoryRequestRatioSection() {
    await this.openSection(GENERAL_SETTINGS_SECTION);
    await this.openSection('Memory request ratio');
    await expect(byTestId(this.page, MEMORY_REQUEST_RATIO_INPUT)).toBeVisible({
      timeout: 15 * SECOND,
    });
  }

  /**
   * Expand a settings accordion section only if it is currently collapsed.
   * Waits for aria-expanded="true" before returning so that child elements
   * (which are conditionally rendered by ExpandSection) are in the DOM.
   */
  async openSection(sectionName: string) {
    const content = byTest(this.page, CLUSTER_SETTINGS);
    const toggle = content.getByRole('button').filter({ hasText: sectionName }).first();
    await expect(toggle).toBeVisible({ timeout: SHORT_TIMEOUT });
    const expanded = await toggle.evaluate((el) => el.getAttribute('aria-expanded') === 'true');
    if (!expanded) {
      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-expanded', 'true', { timeout: SHORT_TIMEOUT });
    }
  }

  async restoreMemoryRequestRatioDefault() {
    await this.openSection(GENERAL_SETTINGS_SECTION);
    await this.openSection('Memory request ratio');
    const restoreButton = byTestId(this.page, MEMORY_REQUEST_RATIO_RESTORE_BUTTON);
    if (await restoreButton.isVisible()) {
      await restoreButton.click();
      await byTestId(this.page, MEMORY_REQUEST_RATIO_SAVE_BUTTON).click({ force: true });
      await expect(byTestId(this.page, MEMORY_REQUEST_RATIO_SAVE_BUTTON)).toBeHidden({
        timeout: NAV_TIMEOUT,
      });
    }
  }

  async setLiveMigrationLimits(parallelPerCluster: string, parallelPerNode: string) {
    await this.openSection(GENERAL_SETTINGS_SECTION);
    await this.openSection('Live migration');
    // Wait for inputs to be interactive after accordion opens
    const clusterInput = this.page.locator('input[name="parallelMigrationsPerCluster"]');
    await expect(clusterInput).toBeVisible({ timeout: SHORT_TIMEOUT });
    await clusterInput.clear();
    await clusterInput.fill(parallelPerCluster);
    await this.page.locator('input[name="parallelOutboundMigrationsPerNode"]').clear();
    await this.page
      .locator('input[name="parallelOutboundMigrationsPerNode"]')
      .fill(parallelPerNode);
    await this.page.getByText('Set live migration network').click();
  }

  async setMemoryRequestRatioValue(value: string) {
    await this.openMemoryRequestRatioSection();
    const input = byTestId(this.page, MEMORY_REQUEST_RATIO_INPUT).locator('input[type="number"]');
    await expect(input).toBeVisible({ timeout: SHORT_TIMEOUT });
    await input.dblclick();
    await input.fill(value);
    await byTestId(this.page, MEMORY_REQUEST_RATIO_SAVE_BUTTON).click({ force: true });
    await expect(byTestId(this.page, MEMORY_REQUEST_RATIO_SAVE_BUTTON)).toBeHidden({
      timeout: NAV_TIMEOUT,
    });
  }

  async sshSectionText(sectionTestId: string): Promise<string> {
    return byTestId(this.page, sectionTestId).innerText();
  }
}
