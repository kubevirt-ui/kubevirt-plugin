import { expect, Page } from '@playwright/test';

import { env } from '../utils/env';
import { byTest, byTestId } from '../utils/locators';

const SECOND = 1_000;

export class SettingsPage {
  constructor(private readonly page: Page) {}

  // ── SSH key configuration ─────────────────────────────────────────────────────

  async configureSSHSecret(ns: string, secretName: string) {
    await byTestId(this.page, 'select-project-toggle').click();
    await byTestId(this.page, `select-option-${ns}`).locator('button').click();
    await this.page.getByRole('button', { name: 'Not configured' }).click();
    await this.page.locator('#useExisting').click();
    await byTestId(this.page, 'select-secret').click();
    // Wait for and click the option — PatternFly SelectOption renders with role="option"
    await this.page.getByRole('option', { exact: true, name: secretName }).click();
    // TabModal uses data-test="save-button" (not data-test-id)
    await byTest(this.page, 'save-button').click();
  }

  async disableMemoryDensity() {
    await this.openSection('General settings');
    await this.openSection('Memory density');
    // Wait for the switch to be rendered inside the expanded section
    const switchInput = byTestId(this.page, 'memory-density');
    await expect(switchInput).toBeVisible({ timeout: 10_000 });
    const isOn = await switchInput.evaluate((el) => (el as HTMLInputElement).checked);
    if (isOn) {
      await switchInput.locator('..').click();
    }
    await expect(byTestId(this.page, 'memory-density-disable-confirm-button')).toBeVisible({
      timeout: 30_000,
    });
    await byTestId(this.page, 'memory-density-disable-confirm-button').click();
    // Wait for the confirm button to disappear (confirms HCO reconciliation started)
    await expect(byTestId(this.page, 'memory-density-disable-confirm-button')).toBeHidden({
      timeout: 30_000,
    });
  }

  // ── Section clicks ───────────────────────────────────────────────────────────

  async enableMemoryDensity() {
    await this.openSection('General settings');
    await this.openSection('Memory density');
    const switchInput = byTestId(this.page, 'memory-density');
    await expect(switchInput).toBeVisible({ timeout: 10_000 });
    await switchInput.check({ force: true });
    // The slider lives inside "Current memory density" ExpandableSection, which starts
    // collapsed. Waiting for the expandable container is sufficient to confirm the switch
    // took effect; setMemoryDensityValue() will expand it when needed.
    await expect(byTestId(this.page, 'memory-density-modify-button')).toBeVisible({
      timeout: 15_000,
    });
  }

  // ── VM Actions confirmation ───────────────────────────────────────────────────

  async enableVMActionsConfirmation() {
    await this.openSection('General settings');
    await this.openSection('VirtualMachine actions confirmation');
    const switchInput = byTestId(this.page, 'confirm-vm-actions');
    const isOn = await switchInput.evaluate((el) => (el as HTMLInputElement).checked);
    if (!isOn) {
      await switchInput.locator('..').click();
    }
  }

  // ── Assertions ────────────────────────────────────────────────────────────────

  async expectInstalledVersion(versionPrefix: string) {
    await expect(byTestId(this.page, 'general-information-installed-version')).toContainText(
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
    await expect(byTestId(this.page, 'general-information-update-status')).toContainText(status);
  }

  async navigate() {
    await this.page.goto(`/k8s/ns/${env.cnvNamespace}/virtualization-settings`);
    await this.page.waitForLoadState('domcontentloaded');
    await expect(this.page.locator('[data-test-id]').first()).toBeVisible({ timeout: 30_000 });
  }

  async navigateToSSHKeys() {
    await this.navigate();
    await this.page.getByRole('tab', { exact: true, name: 'User' }).click();
    // Wait for the URL hash to reflect the tab change before navigating to #ssh-keys
    await this.page.waitForURL(/user/, { timeout: 10_000 }).catch(() => {});
    const baseUrl = this.page.url().split('#')[0];
    await this.page.goto(`${baseUrl}#ssh-keys`);
    await expect(this.page.getByText('Public SSH key')).toBeVisible({ timeout: 30_000 });
  }

  /**
   * Expand a settings accordion section only if it is currently collapsed.
   */
  async openSection(sectionName: string) {
    const content = byTest(this.page, 'cluster-settings');
    const toggle = content.getByRole('button').filter({ hasText: sectionName }).first();
    const expanded = await toggle.evaluate((el) => el.getAttribute('aria-expanded') === 'true');
    if (!expanded) {
      await toggle.click();
    }
  }

  async setLiveMigrationLimits(parallelPerCluster: string, parallelPerNode: string) {
    await this.openSection('General settings');
    await this.openSection('Live migration');
    // Wait for inputs to be interactive after accordion opens
    const clusterInput = this.page.locator('input[name="parallelMigrationsPerCluster"]');
    await expect(clusterInput).toBeVisible({ timeout: 10_000 });
    await clusterInput.clear();
    await clusterInput.fill(parallelPerCluster);
    await this.page.locator('input[name="parallelOutboundMigrationsPerNode"]').clear();
    await this.page

      .locator('input[name="parallelOutboundMigrationsPerNode"]')
      .fill(parallelPerNode);
    await this.page.getByText('Set live migration network').click();
    // Wait for the save to be acknowledged (button remains but network call is made)
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async setMemoryDensityValue(value: string) {
    // Wait for "Current memory density" to be clickable after enableMemoryDensity
    await this.page.getByText('Current memory density').click();
    const input = byTestId(this.page, 'memory-density-slider').locator('input[type="number"]');
    await expect(input).toBeVisible({ timeout: 10_000 });
    await input.dblclick();
    await input.fill(value);
    await this.page.getByText('Requested memory density').click();
    await byTestId(this.page, 'memory-density-save-button').click({ force: true });
  }

  async sshSectionText(sectionTestId: string): Promise<string> {
    return byTestId(this.page, sectionTestId).innerText();
  }
}
