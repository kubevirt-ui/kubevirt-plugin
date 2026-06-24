// CheckupsPage — Page object for checkups interactions.

import { TestTimeouts } from '@/utils/test-config';
import { ToastTestHelper } from '@/utils/toast-test-helper';
import type { Page } from '@playwright/test';

import PageCommons from '../page-commons';

export default class CheckupsPage extends PageCommons {
  private readonly _runCheckupButton = this.locator('#checkups-run-button');
  private readonly _runButton = this.locator('button:has-text("Run")');
  private readonly _installPermissionsBtn = this.locator('button:has-text("Install permissions")');
  private readonly _inputconfirmNonProductionCheckbox = this.locator(
    'input#confirm-non-production-checkbox',
  );
  private readonly _roleDialogH1HasTextHeavyLoadCheckups = this.locator(
    '[role="dialog"] h1:has-text("Heavy load checkups")',
  );

  constructor(page: Page) {
    super(page);
  }

  createToastHelper(): ToastTestHelper {
    return new ToastTestHelper(this.page);
  }

  async navigateToCheckupsViaUI(): Promise<void> {
    await this.navigation.expandVirtualizationNavSection();
    await this.navigation.clickNavCheckups();
  }

  async navigateToCheckupsViaCheckupsNavItem(): Promise<void> {
    const checkupsNavItem = this.locator('[data-test-id="checkups-nav-item"]');
    await checkupsNavItem.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(checkupsNavItem);
    await this.page.waitForLoadState('load', {
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
  }

  async navigateToAllNamespacesNetworkCheckups() {
    await this.goTo('/k8s/all-namespaces/checkups/network');
  }

  async navigateToAllNamespacesStorageCheckups() {
    await this.goTo('/k8s/all-namespaces/checkups/storage');
  }

  async navigateToAllNamespacesSelfValidationCheckups() {
    await this.goTo('/k8s/all-namespaces/checkups/self-validation');
  }

  async navigateToProjectNetworkCheckups(projectName: string) {
    await this.goTo(`/k8s/ns/${projectName}/checkups/network`);
  }

  async navigateToProjectStorageCheckups(projectName: string) {
    await this.goTo(`/k8s/ns/${projectName}/checkups/storage`);
  }

  async navigateToProjectSelfValidationCheckups(projectName: string) {
    await this.goTo(`/k8s/ns/${projectName}/checkups/self-validation`);
  }

  async navigateToProjectNetworkCheckupsViaUI(namespace: string): Promise<void> {
    await this.projectDropdown.switchToNamespace(namespace);
    // Direct route is stable across console versions; horizontal tab data-test-id labels vary.
    await this.navigateToProjectNetworkCheckups(namespace);
  }

  async navigateToProjectStorageCheckupsViaUI(namespace: string): Promise<void> {
    await this.projectDropdown.switchToNamespace(namespace);
    await this.clickStorageTab();
  }

  async navigateToProjectSelfValidationCheckupsViaUI(namespace: string): Promise<void> {
    await this.projectDropdown.switchToNamespace(namespace);
    // Note: Self-validation tab would need to be added if it exists
    // For now, this method switches namespace and assumes we're already on the right tab
    // or the tab will be clicked separately
  }

  async clickRunCheckup() {
    await this._runCheckupButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(this._runCheckupButton);
  }

  async isRunCheckupButtonVisible(): Promise<boolean> {
    try {
      await this._runCheckupButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.ELEMENT_WAIT,
      });
      return true;
    } catch {
      return false;
    }
  }

  async isRunCheckupButtonClickable(): Promise<boolean> {
    try {
      await this._runCheckupButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.ELEMENT_WAIT,
      });
      return await this._runCheckupButton.isEnabled();
    } catch {
      return false;
    }
  }

  async clickInstallPermissions() {
    const installPermissionsButton = this._installPermissionsBtn;
    await installPermissionsButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(installPermissionsButton);
  }

  async isInstallPermissionsVisible(): Promise<boolean> {
    try {
      const installPermissionsButton = this._installPermissionsBtn;
      await installPermissionsButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.ELEMENT_WAIT,
      });
      return true;
    } catch {
      return false;
    }
  }

  async installPermissionsIfNeeded() {
    const isVisible = await this.isInstallPermissionsVisible();
    if (isVisible) {
      await this.clickInstallPermissions();
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
    }
  }

  async clickStorageCheckupOption() {
    const storageCheckupOption = this.locator(
      'button[role="menuitem"]:has-text("Storage")',
    ).first();
    await storageCheckupOption.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
    await this.robustClick(storageCheckupOption);
  }

  async clickStorageTab() {
    const storageTabButton = this.locator('button:has-text("Storage")');
    await storageTabButton.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
    await this.robustClick(storageTabButton);
  }

  async clickSelfValidationTab() {
    const selfValidationTabButton = this.locator(
      '[data-test-id="horizontal-link-Self validation"]',
    );
    await selfValidationTabButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.DEFAULT,
    });
    await this.robustClick(selfValidationTabButton);
  }

  async clickNetworkLatencyTab() {
    const networkLatencyTab = this.locator('[data-test-id="horizontal-link-Network latency"]');
    await networkLatencyTab.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
    await this.robustClick(networkLatencyTab);
  }

  async selectNad(nadName: string) {
    const selectNadDropdown = this.locator('[placeholder="Select NetwrokAttachmentDefinition"]');
    await selectNadDropdown.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
    await this.robustClick(selectNadDropdown);
    const nadOption = this.locator(`[role="listbox"] li button:has-text("${nadName}")`);
    await nadOption.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
    await this.robustClick(nadOption);
  }

  async clickNodesCheckbox() {
    const nodesCheckbox = this.locator('input#nodes');
    await nodesCheckbox.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
    await this.robustClick(nodesCheckbox);
  }

  async clickSelectSourceNode() {
    const selectSourceNodeButton = this.locator('[placeholder="Select source node"]');
    await selectSourceNodeButton.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
    await this.robustClick(selectSourceNodeButton);
  }

  async clickSelectTargetNode() {
    const selectTargetNodeButton = this.locator('[placeholder="Select target node"]');
    await selectTargetNodeButton.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
    await this.robustClick(selectTargetNodeButton);
  }

  async verifyNodeDropdownVisible(): Promise<boolean> {
    try {
      const nodeDropdown = this.locator('#select-inline-filter');
      await nodeDropdown.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
      return await nodeDropdown.isVisible();
    } catch {
      return false;
    }
  }

  async selectNodeFromDropdown(nodeName: string) {
    const nodeOption = this.locator(`[role="listbox"] li button:has-text("${nodeName}")`);
    await nodeOption.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
    await this.robustClick(nodeOption);
  }

  async selectFirstNodeFromDropdown() {
    const firstNodeOption = this.locator('[role="listbox"] li button').first();
    await firstNodeOption.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
    await this.robustClick(firstNodeOption);
  }

  async setCheckupName(name: string) {
    const nameInput = this.locator('input#name');
    await nameInput.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
    await nameInput.clear();
    await nameInput.fill(name);
  }

  async setTimeout(timeout: string) {
    const timeoutInput = this.locator('input#timeout');
    await timeoutInput.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
    await timeoutInput.clear();
    await timeoutInput.fill(timeout);
  }

  async clickRun() {
    await this._runButton.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
    await this.robustClick(this._runButton);
    await this.page.waitForLoadState('networkidle', { timeout: TestTimeouts.DEFAULT });
  }

  async clickCheckup(checkupName: string) {
    const checkupLink = this.locator(`a:has-text("${checkupName}")`).first();
    await checkupLink.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
    await this.robustClick(checkupLink);
  }

  async verifySubtitle(subtitle: string): Promise<boolean> {
    const timeout = TestTimeouts.DEFAULT;
    const selectors = [
      `h2:has-text("${subtitle}")`,
      `h1:has-text("${subtitle}")`,
      `[role="heading"]:has-text("${subtitle}")`,
    ];
    for (const selector of selectors) {
      try {
        const locator = this.locator(selector).first();
        await locator.waitFor({ state: 'visible', timeout });
        if (await locator.isVisible()) {
          return true;
        }
      } catch {
        // try next selector
      }
    }
    return false;
  }

  async verifyLinkExists(linkText: string): Promise<boolean> {
    try {
      const link = this.locator(`a:has-text("${linkText}")`);
      await link.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
      return await link.isVisible();
    } catch {
      return false;
    }
  }

  async clickNetworkLatencyCheckup() {
    const networkLatencyCheckupButton = this.locator('button:has-text("Network latency checkup")');
    await networkLatencyCheckupButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.DEFAULT,
    });
    await this.robustClick(networkLatencyCheckupButton);
  }

  async clickStorageCheckup() {
    const storageCheckupButton = this.locator('button:has-text("Storage checkup")');
    await storageCheckupButton.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
    await this.robustClick(storageCheckupButton);
  }

  async verifyCheckupRunning(checkupName: string): Promise<boolean> {
    try {
      const tableSelector = this.locator(
        '[data-test-rows="resource-row"], table, [role="grid"]',
      ).first();
      await tableSelector.waitFor({ state: 'visible', timeout: TestTimeouts.VM_BOOTUP });

      const checkupRow = this.locator(
        `tr:has-text("${checkupName}"), [role="row"]:has-text("${checkupName}")`,
      ).first();
      await checkupRow.waitFor({ state: 'visible', timeout: TestTimeouts.VM_BOOTUP });

      const hasActiveState = checkupRow.filter({
        hasText: /Running|Succeeded|Failed|Completed/,
      });
      await hasActiveState.waitFor({ state: 'visible', timeout: TestTimeouts.VM_BOOTUP });
      return await hasActiveState.isVisible();
    } catch {
      return false;
    }
  }

  async verifyCheckupNotRunning(checkupName: string): Promise<boolean> {
    try {
      const checkupRow = this.locator(`tr:has-text("${checkupName}")`);
      await checkupRow.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
      const runningStatus = checkupRow.locator('text=Running');

      return !(await runningStatus
        .isVisible({ timeout: TestTimeouts.VM_BOOTUP })
        .catch(() => false));
    } catch {
      return false;
    }
  }

  async getCheckupStatus(): Promise<string> {
    const statusIcon = this.locator('.CheckupsNetworkStatusIcon--main');
    await statusIcon.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
    const statusText = await statusIcon.textContent();
    return statusText || '';
  }

  async clickCheckupActions() {
    const actionsButton = this.locator('#content-scrollable button:has-text("Actions")');
    await actionsButton.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
    await this.robustClick(actionsButton);
  }

  override async clickDeleteButton() {
    const deleteButton = this.locator('button:has-text("Delete")');
    await deleteButton.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
    await this.robustClick(deleteButton);
  }

  async clickFooterDelete() {
    const footerDeleteButton = this.locator('footer').locator('button:has-text("Delete")');
    await footerDeleteButton.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
    await this.robustClick(footerDeleteButton);
  }

  async verifyCheckupDeleted(checkupName: string): Promise<boolean> {
    try {
      const checkupRow = this.locator(`tr:has-text("${checkupName}")`);
      await checkupRow.waitFor({ state: 'hidden', timeout: TestTimeouts.ELEMENT_WAIT });
      return true;
    } catch {
      return false;
    }
  }

  async enableDryRun() {
    await this.clickButtonByText('Advanced settings');
    await this.robustClick(this.locator('input#dry-run'));
  }

  async clickRunAndConfirm() {
    await this._runButton.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
    await this.robustClick(this._runButton);
    await this.robustClick(this._inputconfirmNonProductionCheckbox);
    await this.clickButtonByText('Run checkup');
  }

  async isConfirmationModalVisible(): Promise<boolean> {
    try {
      const modalTitle = this._roleDialogH1HasTextHeavyLoadCheckups;
      await modalTitle.waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
      return await modalTitle.isVisible();
    } catch {
      return false;
    }
  }

  async isConfirmationModalHidden(): Promise<boolean> {
    try {
      const modalTitle = this._roleDialogH1HasTextHeavyLoadCheckups;
      await modalTitle.waitFor({ state: 'hidden', timeout: TestTimeouts.SHORT_WAIT });
      return true;
    } catch {
      return false;
    }
  }

  async isRunCheckupModalButtonDisabled(): Promise<boolean> {
    try {
      const runBtn = this.locator('[role="dialog"] footer button:has-text("Run checkup")');
      await runBtn.waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
      return await runBtn.isDisabled();
    } catch {
      return false;
    }
  }

  async clickConfirmationCheckbox(): Promise<void> {
    await this.robustClick(this._inputconfirmNonProductionCheckbox);
  }

  async clickCancelInModal(): Promise<void> {
    const cancelBtn = this.locator('[role="dialog"] footer button:has-text("Cancel")');
    await cancelBtn.waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
    await this.robustClick(cancelBtn);
  }
}
