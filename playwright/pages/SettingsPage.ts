import { expect, Page } from '@playwright/test';

import { CONFIRM_VM_ACTIONS, SECOND } from '../utils/constants';
import { env } from '../utils/env';
import { byTest, byTestId } from '../utils/locators';

const CLUSTER_SETTINGS = 'cluster-settings';
const GENERAL_INFORMATION_INSTALLED_VERSION = 'general-information-installed-version';
const GENERAL_INFORMATION_UPDATE_STATUS = 'general-information-update-status';
const MEMORY_DENSITY = 'memory-density';
const MEMORY_DENSITY_DISABLE_CONFIRM_BUTTON = 'memory-density-disable-confirm-button';
const MEMORY_DENSITY_MODIFY_BUTTON = 'memory-density-modify-button';
const MEMORY_DENSITY_SAVE_BUTTON = 'memory-density-save-button';
const MEMORY_DENSITY_SLIDER = 'memory-density-slider';
const SAVE_BUTTON = 'save-button';
const SELECT_PROJECT_TOGGLE = 'select-project-toggle';
const SELECT_SECRET = 'select-secret';

export class SettingsPage {
  constructor(private readonly page: Page) {}

  // ── SSH key configuration ─────────────────────────────────────────────────────

  private async toggleVMActionsConfirmation(enable: boolean, retries: number) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await this.openSection('General settings');
        await this.openSection('VirtualMachine actions confirmation');
        const switchInput = byTestId(this.page, CONFIRM_VM_ACTIONS);
        await expect(switchInput).toBeVisible({ timeout: 10 * SECOND });
        const isOn = await switchInput.evaluate((el) => (el as HTMLInputElement).checked);
        if (isOn !== enable) {
          await switchInput.locator('..').click();
          await expect(switchInput).toBeChecked({ checked: enable, timeout: 10 * SECOND });
        }
        return;
      } catch (err) {
        if (attempt === retries) throw err;
        await this.page.waitForLoadState('domcontentloaded');
        await this.page
          .getByText('Configure features')
          .waitFor({ timeout: 30 * SECOND })
          .catch(() => {});
      }
    }
  }

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

  // ── Section clicks ───────────────────────────────────────────────────────────

  async disableMemoryDensity() {
    await this.openSection('General settings');
    await this.openSection('Memory density');
    // Wait for the switch to be rendered inside the expanded section
    const switchInput = byTestId(this.page, MEMORY_DENSITY);
    await expect(switchInput).toBeVisible({ timeout: 10 * SECOND });
    const isOn = await switchInput.evaluate((el) => (el as HTMLInputElement).checked);
    if (isOn) {
      await switchInput.locator('..').click();
    }
    await expect(byTestId(this.page, MEMORY_DENSITY_DISABLE_CONFIRM_BUTTON)).toBeVisible({
      timeout: 30 * SECOND,
    });
    await byTestId(this.page, MEMORY_DENSITY_DISABLE_CONFIRM_BUTTON).click();
    // Wait for the confirm button to disappear (confirms HCO reconciliation started)
    await expect(byTestId(this.page, MEMORY_DENSITY_DISABLE_CONFIRM_BUTTON)).toBeHidden({
      timeout: 30 * SECOND,
    });
  }

  // ── VM Actions confirmation ───────────────────────────────────────────────────

  /** Disable VM actions confirmation, retrying if the page reloads during the click. */
  async disableVMActionsConfirmation(retries = 3) {
    await this.toggleVMActionsConfirmation(false, retries);
  }

  async enableMemoryDensity() {
    await this.openSection('General settings');
    await this.openSection('Memory density');
    const switchInput = byTestId(this.page, MEMORY_DENSITY);
    await expect(switchInput).toBeVisible({ timeout: 10 * SECOND });
    await switchInput.check({ force: true });
    // The slider lives inside "Current memory density" ExpandableSection, which starts
    // collapsed. Waiting for the expandable container is sufficient to confirm the switch
    // took effect; setMemoryDensityValue() will expand it when needed.
    await expect(byTestId(this.page, MEMORY_DENSITY_MODIFY_BUTTON)).toBeVisible({
      timeout: 15 * SECOND,
    });
  }

  /** Enable VM actions confirmation, retrying if the page reloads during the click. */
  async enableVMActionsConfirmation(retries = 3) {
    await this.toggleVMActionsConfirmation(true, retries);
  }

  // ── Assertions ────────────────────────────────────────────────────────────────

  async expectInstalledVersion(versionPrefix: string) {
    await expect(byTestId(this.page, GENERAL_INFORMATION_INSTALLED_VERSION)).toContainText(
      versionPrefix,
    );
  }

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
    await this.page.goto(`/k8s/ns/${env.cnvNamespace}/virtualization-settings`);
    await this.page.waitForLoadState('domcontentloaded');
    await expect(this.page.locator('[data-test-id]').first()).toBeVisible({
      timeout: 30 * SECOND,
    });
    await this.page.waitForTimeout(10 * SECOND);
  }

  async navigateToSSHKeys() {
    await this.navigate();
    await expect(byTestId(this.page, GENERAL_INFORMATION_INSTALLED_VERSION)).toBeVisible({
      timeout: 30 * SECOND,
    });
    await this.page.getByRole('tab', { exact: true, name: 'User' }).click();
    // Wait for the URL hash to reflect the tab change before navigating to #ssh-keys
    await this.page.waitForURL(/user/, { timeout: 10 * SECOND }).catch(() => {});
    const baseUrl = this.page.url().split('#')[0];
    await this.page.goto(`${baseUrl}#ssh-keys`);
    await expect(this.page.getByText('Public SSH key')).toBeVisible({ timeout: 30 * SECOND });
  }

  /**
   * Expand a settings accordion section only if it is currently collapsed.
   * Waits for aria-expanded="true" before returning so that child elements
   * (which are conditionally rendered by ExpandSection) are in the DOM.
   */
  async openSection(sectionName: string) {
    const content = byTest(this.page, CLUSTER_SETTINGS);
    const toggle = content.getByRole('button').filter({ hasText: sectionName }).first();
    await expect(toggle).toBeVisible({ timeout: 10 * SECOND });
    const expanded = await toggle.evaluate((el) => el.getAttribute('aria-expanded') === 'true');
    if (!expanded) {
      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-expanded', 'true', { timeout: 10 * SECOND });
    }
  }

  async setLiveMigrationLimits(parallelPerCluster: string, parallelPerNode: string) {
    await this.openSection('General settings');
    await this.openSection('Live migration');
    // Wait for inputs to be interactive after accordion opens
    const clusterInput = this.page.locator('input[name="parallelMigrationsPerCluster"]');
    await expect(clusterInput).toBeVisible({ timeout: 10 * SECOND });
    await clusterInput.clear();
    await clusterInput.fill(parallelPerCluster);
    await this.page.locator('input[name="parallelOutboundMigrationsPerNode"]').clear();
    await this.page
      .locator('input[name="parallelOutboundMigrationsPerNode"]')
      .fill(parallelPerNode);
    await this.page.getByText('Set live migration network').click();
  }

  async setMemoryDensityValue(value: string) {
    // Wait for "Current memory density" to be clickable after enableMemoryDensity
    await this.page.getByText('Current memory density').click();
    const input = byTestId(this.page, MEMORY_DENSITY_SLIDER).locator('input[type="number"]');
    await expect(input).toBeVisible({ timeout: 10 * SECOND });
    await input.dblclick();
    await input.fill(value);
    await this.page.getByText('Requested memory density').click();
    await byTestId(this.page, MEMORY_DENSITY_SAVE_BUTTON).click({ force: true });
  }

  async sshSectionText(sectionTestId: string): Promise<string> {
    return byTestId(this.page, sectionTestId).innerText();
  }
}
