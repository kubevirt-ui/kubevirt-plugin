import PageCommons from '@/page-objects/page-commons';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

export default class VmConfigurationComponent extends PageCommons {
  private readonly _bootManagementBtn = this.locator('button:has-text("Boot management")');
  private readonly _cloudInitEditButton = this.testId('undefined-edit');
  private readonly _cloudInitPasswordInput = this.locator('#cloudinit-password');
  private readonly _cloudInitUsernameInput = this.locator('#cloudinit-user');
  private readonly _configurationSearchAutocompleteSearchInput = this.locator(
    '#ConfigurationSearch-autocomplete-search input',
  );
  private readonly _cpuMemoryButton = this.testId('virtual-machine-overview-details-cpu-memory');

  private readonly _headlessCheckbox = this.locator('input[id="headless-mode"]');

  private readonly _isTextPendingChangesTextRestartRequired = this.locator(
    ':is(:text("Pending changes"), :text("Restart required"))',
  );

  private readonly _restoreTemplateSettingsBtn = this.locator(
    'button:has-text("Restore template settings")',
  );

  private readonly _tabModal = this.locator('#tab-modal');

  private readonly _tabModalSaveButton = this.locator('#tab-modal').locator(
    '[data-test="save-button"]',
  );

  private readonly _vmConfigurationDetails = this.testId('vm-configuration-details');

  private readonly _vmDetailSaveButton = this.testId('save-button');

  constructor(page: Page) {
    super(page);
  }

  async editDetails(
    vmName: string,
    vmData: {
      description?: string;
      bootMode?: string;
      hostname?: string;
      workload?: string;
      headless?: boolean;
      startInPause?: boolean;
    },
  ): Promise<void> {
    if (vmData.description) {
      const descButton = this.testId(`${vmName}-description`);
      await descButton.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
      await this.robustClick(descButton);
      const descTextarea = this._tabModal.locator('textarea[aria-label="description text area"]');
      await descTextarea.waitFor({
        state: 'visible',
        timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
      });
      await descTextarea.clear();
      await descTextarea.fill(vmData.description);
      await this.clickSaveByTestId();
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);
    }

    if (vmData.bootMode) {
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
      const bootManagementButton = this._bootManagementBtn;
      await bootManagementButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.VM_CREATION,
      });
      await this.robustClick(bootManagementButton);
      const bootModeButton = this.testId(`${vmName}-boot-method`);
      await bootModeButton.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
      await this.robustClick(bootModeButton);
      await this._tabModal.waitFor({
        state: 'visible',
        timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
      });
      const menuToggle = this._tabModal.locator('.pf-v6-c-menu-toggle');
      await menuToggle.waitFor({
        state: 'visible',
        timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
      });
      await this.robustClick(menuToggle);
      await this.clickListboxButtonByText(vmData.bootMode);
      await this.clickSaveByTestId();
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);
      await bootManagementButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.VM_CREATION,
      });
      await this.robustClick(bootManagementButton);
    }

    if (vmData.workload) {
      const workloadButton = this.testId(`${vmName}-workload-profile`);
      await workloadButton.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
      await this.robustClick(workloadButton);
      await this._tabModal.waitFor({
        state: 'visible',
        timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
      });
      const menuToggle = this._tabModal.locator('.pf-v6-c-menu-toggle');
      await menuToggle.waitFor({
        state: 'visible',
        timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
      });
      await this.robustClick(menuToggle);
      await this.clickButtonByText(vmData.workload);
      await this.clickSaveByTestId();
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);
    }

    if (vmData.hostname) {
      const hostnameButton = this.testId(`${vmName}-hostname`);
      await hostnameButton.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
      await this.robustClick(hostnameButton);
      const hostnameInput = this.locator('input[id="hostname"]');
      await hostnameInput.waitFor({
        state: 'visible',
        timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
      });
      await hostnameInput.clear();
      await hostnameInput.fill(vmData.hostname);
      await this.clickSaveByTestId();
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);
    }

    if (vmData.headless !== undefined) {
      await this._headlessCheckbox.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
      if (vmData.headless) {
        await this._headlessCheckbox.check({ force: true });
      } else {
        await this._headlessCheckbox.uncheck({ force: true });
      }
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);
    }

    if (vmData.startInPause !== undefined) {
      const bootManagementButtonPause = this._bootManagementBtn;
      await bootManagementButtonPause.waitFor({
        state: 'visible',
        timeout: TestTimeouts.VM_CREATION,
      });
      await this.robustClick(bootManagementButtonPause);
      const startInPauseCheckbox = this.locator('input[id="start-in-pause-mode"]');
      await startInPauseCheckbox.waitFor({
        state: 'visible',
        timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
      });
      if (vmData.startInPause) {
        await startInPauseCheckbox.check({ force: true });
      } else {
        await startInPauseCheckbox.uncheck({ force: true });
      }
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);
    }
  }

  async editRunStrategy(strategy: string): Promise<boolean> {
    const strategyLabels: Record<string, string> = {
      Always: 'Always',
      Halted: 'Halted',
      Manual: 'Manual',
      RerunOnFailure: 'Rerun on failure',
    };
    try {
      const editButton = this.testId('run-strategy');
      await editButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_VISIBILITY_QUICK,
      });
      await this.robustClick(editButton);

      await this._tabModal.waitFor({
        state: 'visible',
        timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
      });

      const selectToggle = this._tabModal.locator('.pf-v6-c-menu-toggle');
      await selectToggle.waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
      await this.robustClick(selectToggle);

      const label = strategyLabels[strategy] || strategy;
      const option = this.page
        .locator('button[role="option"]')
        .filter({ has: this.page.locator('.pf-v6-c-menu__item-text', { hasText: label }) });
      await option.waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
      await option.click();

      await this.robustClick(this._tabModalSaveButton);
      await this._tabModal.waitFor({
        state: 'hidden',
        timeout: TestTimeouts.ELEMENT_WAIT,
      });

      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
      return true;
    } catch {
      return false;
    }
  }

  async editRunStrategyViaActionsMenu(strategy: string): Promise<boolean> {
    const strategyLabels: Record<string, string> = {
      Always: 'Always',
      Halted: 'Halted',
      Manual: 'Manual',
      RerunOnFailure: 'Rerun on failure',
    };
    try {
      await this.openVmActionsDropdown();

      const actionItem = this.testId('vm-action-change-run-strategy');
      await actionItem.waitFor({
        state: 'visible',
        timeout: TestTimeouts.SHORT_WAIT,
      });
      await this.robustClick(actionItem);

      const modal = this.page.locator('[role="dialog"]').filter({ hasText: 'Edit run strategy' });
      await modal.waitFor({
        state: 'visible',
        timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
      });

      const selectToggle = modal.locator('.pf-v6-c-menu-toggle');
      await selectToggle.waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
      await this.robustClick(selectToggle);

      const label = strategyLabels[strategy] || strategy;
      const option = this.page
        .locator('button[role="option"]')
        .filter({ has: this.page.locator('.pf-v6-c-menu__item-text', { hasText: label }) });
      await option.waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
      await this.robustClick(option);

      const saveButton = modal.locator('button').filter({ hasText: 'Save' }).first();
      await this.robustClick(saveButton);
      await modal.waitFor({
        state: 'hidden',
        timeout: TestTimeouts.ELEMENT_WAIT,
      });

      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
      return true;
    } catch {
      return false;
    }
  }

  async getCloudInitValues(): Promise<{ username: string; password: string } | null> {
    try {
      await this.navigateToConfigurationInitialRun();

      await this._cloudInitEditButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await this.robustClick(this._cloudInitEditButton);

      await this._cloudInitUsernameInput.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      const username = await this._cloudInitUsernameInput.inputValue();

      await this._cloudInitPasswordInput.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      const password = await this._cloudInitPasswordInput.inputValue();

      return { username, password };
    } catch {
      return null;
    }
  }

  async getRunStrategyValue(): Promise<string> {
    try {
      const runStrategyGroup = this.testId('run-strategy').first();
      await runStrategyGroup.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_VISIBILITY_QUICK,
      });
      return (await runStrategyGroup.textContent())?.trim() || '';
    } catch {
      return '';
    }
  }

  async increaseCpuAndMemory(): Promise<void> {
    await this.navigateToConfigurationDetails();

    await this._cpuMemoryButton.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
    await this._cpuMemoryButton.click();

    await this.locator('label[for="editVCPU"] button[aria-label="Plus"]').click();

    await this.locator('div.input-memory button[aria-label="Plus"]').click();

    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    await this._vmDetailSaveButton.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
    await this.robustClick(this._vmDetailSaveButton);
  }

  async navigateToConfigurationDetails() {
    await this.navigateToConfigurationTab();
    await this._vmConfigurationDetails.waitFor({
      state: 'visible',
      timeout: TestTimeouts.VM_CREATION,
    });
    await this.robustClick(this._vmConfigurationDetails);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async navigateToConfigurationInitialRun() {
    await this.navigateToConfigurationTab();
    await super.navigateToTab(this.testId('vm-configuration-initial'));
  }

  async navigateToConfigurationMetadata() {
    await this.navigateToConfigurationTab();
    await super.navigateToTab(this.testId('vm-configuration-metadata'));
  }

  async navigateToConfigurationTab() {
    await super.navigateToTab(
      this.testId('horizontal-link-Configuration'),
      TestTimeouts.UI_ACTION_COMPLETE,
    );
  }

  async navigateToConsole() {
    await super.navigateToTab(this.testId('horizontal-link-Console'));
  }

  async navigateToYAML() {
    await super.navigateToTab(this.testId('horizontal-link-YAML'));
  }

  async restoreTemplateDefaults(): Promise<void> {
    await this.navigateToConfigurationDetails();

    await this._cpuMemoryButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_VISIBILITY_QUICK,
    });
    await this._cpuMemoryButton.click();

    await this._restoreTemplateSettingsBtn.waitFor({
      state: 'visible',
      timeout: TestTimeouts.VM_CREATION,
    });
    await this._restoreTemplateSettingsBtn.click();

    await this.clickSave();
  }

  async searchConfiguration(searchTerm: string, expectedResult?: string): Promise<boolean> {
    try {
      await this.navigateToConfigurationTab();

      await this._configurationSearchAutocompleteSearchInput.waitFor({
        state: 'visible',
        timeout: TestTimeouts.VM_CREATION,
      });
      await this._configurationSearchAutocompleteSearchInput.fill(searchTerm);
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

      if (expectedResult) {
        const menuItems = this.locator(`[role="menuitem"]:has-text("${expectedResult}")`);
        const count = await menuItems.count();
        return count >= 1;
      }

      return true;
    } catch {
      return false;
    }
  }

  async updateCloudInit(username: string, password: string): Promise<boolean> {
    try {
      await this.navigateToConfigurationInitialRun();

      await this._cloudInitEditButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await this.robustClick(this._cloudInitEditButton);

      await this._cloudInitUsernameInput.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this._cloudInitUsernameInput.clear();
      await this._cloudInitUsernameInput.fill(username);

      await this._cloudInitPasswordInput.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this._cloudInitPasswordInput.clear();
      await this._cloudInitPasswordInput.fill(password);

      await this._vmDetailSaveButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this.robustClick(this._vmDetailSaveButton);

      await this.locator('text=Restart required')
        .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE })
        .catch(() => false);

      return true;
    } catch {
      return false;
    }
  }

  async verifyAnnotations(): Promise<boolean> {
    try {
      await this.locator('button', { hasText: /Annotations/ }).waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      return await this.locator('button', { hasText: /Annotations/ })
        .isVisible()
        .catch(() => false);
    } catch {
      return false;
    }
  }

  async verifyBootMode(vmName: string, expectedBootMode: string): Promise<boolean> {
    try {
      const bootManagementButton = this.locator('button', { hasText: 'Boot management' });
      await bootManagementButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      if ((await bootManagementButton.getAttribute('aria-expanded')) == 'false') {
        await this.robustClick(bootManagementButton);
      }

      const bootModeButton = this.testId(`${vmName}-boot-method`);
      await bootModeButton.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
      const bootModeText = await bootModeButton.textContent();
      return bootModeText?.includes(expectedBootMode) ?? false;
    } catch {
      return false;
    }
  }

  async verifyCloudInit(): Promise<boolean> {
    try {
      await this.locator('.pf-v6-c-description-list__term span', {
        hasText: 'Cloud-init',
      })
        .first()
        .waitFor({ state: 'visible', timeout: TestTimeouts.RESOURCE_CREATION });
      await this.locator('.pf-v6-c-description-list__term span', {
        hasText: 'Cloud-init',
      })
        .first()
        .isVisible()
        .catch();
      return true;
    } catch {
      return false;
    }
  }

  async verifyCloudInitCredentialsInConsole(): Promise<boolean> {
    try {
      await this.navigateToConsole();

      await this.locator('text=Guest login').waitFor({
        state: 'visible',
        timeout: TestTimeouts.DEFAULT,
      });

      const guestLoginVisible = await this.verifyGuestLogin();
      return guestLoginVisible;
    } catch {
      return false;
    }
  }

  async verifyCloudInitInYAML(
    expectedUsername?: string,
    expectedPassword?: string,
  ): Promise<boolean> {
    try {
      await this.navigateToYAML();

      await this.page.waitForSelector('.monaco-editor', {
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });

      const yamlContent = await this.page.evaluate(() => {
        try {
          const w = window as unknown as {
            monaco?: {
              editor?: {
                getEditors: () => Array<{
                  getModel: () => { getValue: () => string } | null | undefined;
                }>;
              };
            };
          };
          const editors = w.monaco?.editor?.getEditors();
          if (editors && editors.length > 0) {
            const editor = editors[0];
            const model = editor.getModel();
            if (model) {
              return model.getValue();
            }
          }
        } catch {}
        return null;
      });
      if (!yamlContent) {
        return false;
      }

      const hasCloudInit =
        yamlContent.includes('cloudInitNoCloud') || yamlContent.includes('userData');
      if (!hasCloudInit) {
        return false;
      }

      if (expectedUsername) {
        const usernamePattern = new RegExp(
          `user:\\s*${expectedUsername.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
        );
        if (!usernamePattern.test(yamlContent)) {
          return false;
        }
      }

      if (expectedPassword) {
        const passwordPattern = new RegExp(
          `password:\\s*${expectedPassword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
        );
        if (!passwordPattern.test(yamlContent)) {
          return false;
        }
      }

      return true;
    } catch {
      return false;
    }
  }

  async verifyConfigurationDetails(vmName: string, expectedWorkload?: string): Promise<boolean> {
    try {
      await this.navigateToConfigurationDetails();

      const descriptionVisible = await this.locator('text=Description')
        .isVisible()
        .catch(() => false);
      if (!descriptionVisible) {
        return false;
      }

      if (expectedWorkload) {
        const workloadExists = await this.verifyWorkload(vmName, expectedWorkload);
        if (!workloadExists) {
          return false;
        }
      }

      const bootModeExists = await this.locator('text=pc-q35')
        .isVisible()
        .catch(() => false);

      return bootModeExists;
    } catch {
      return false;
    }
  }

  async verifyCpuMemory(cpu: string, mem: string): Promise<boolean> {
    try {
      await this.navigateToConfigurationDetails();
      await this._cpuMemoryButton.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
      const cpuMemText = await this._cpuMemoryButton.textContent();
      const containsCpu = cpuMemText?.includes(cpu) ?? false;
      const containsMem = cpuMemText?.includes(mem) ?? false;
      return containsCpu && containsMem;
    } catch {
      return false;
    }
  }

  async verifyDescription(vmName: string, expectedDescription: string): Promise<boolean> {
    try {
      const descButton = this.testId(`${vmName}-description`);
      await descButton.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
      const descText = await descButton.textContent();
      return descText?.includes(expectedDescription) ?? false;
    } catch {
      return false;
    }
  }

  async verifyFolderVisible(folderName: string, _namespace?: string): Promise<boolean> {
    try {
      const folderElement = this.testId('virtual-machine-overview-details-folder').filter({
        hasText: folderName,
      });
      await folderElement.waitFor({ state: 'visible', timeout: TestTimeouts.UI_VISIBILITY_QUICK });
      return await folderElement.isVisible().catch(() => false);
    } catch {
      return false;
    }
  }

  async verifyGuestLogin(): Promise<boolean> {
    return await super.verifyTextVisible('Guest login');
  }

  async verifyHeadlessChecked(expectedChecked: boolean): Promise<boolean> {
    try {
      await this._headlessCheckbox.waitFor({
        state: 'attached',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });

      try {
        await this._headlessCheckbox.scrollIntoViewIfNeeded();
      } catch {}

      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

      const isChecked = await this._headlessCheckbox.isChecked().catch(() => false);
      return isChecked === expectedChecked;
    } catch {
      return false;
    }
  }

  async verifyHeadlessMode(): Promise<boolean> {
    return await super.verifyTextVisible('Headless mode');
  }

  async verifyHostname(vmName: string, expectedHostname: string): Promise<boolean> {
    try {
      const hostnameButton = this.testId(`${vmName}-hostname`);
      await hostnameButton.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
      const hostnameText = await hostnameButton.textContent();
      return hostnameText?.includes(expectedHostname) ?? false;
    } catch {
      return false;
    }
  }

  async verifyWorkload(vmName: string, expectedWorkload: string): Promise<boolean> {
    const workloadLocator = this.testId(`${vmName}-workload-profile`);
    try {
      await workloadLocator.waitFor({
        state: 'visible',
        timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
      });
      const workloadText = await workloadLocator.textContent();
      return workloadText?.includes(expectedWorkload) ?? false;
    } catch {
      return false;
    }
  }

  async waitForPendingChanges(timeout = 60000): Promise<boolean> {
    const pendingLocator = this._isTextPendingChangesTextRestartRequired;
    try {
      await pendingLocator
        .first()
        .waitFor({ state: 'visible', timeout })
        .catch(() => false);
      return await pendingLocator
        .first()
        .isVisible()
        .catch(() => false);
    } catch {
      return false;
    }
  }

  async waitForPendingChangesToDisappear(timeout = 60000): Promise<boolean> {
    const pendingLocator = this._isTextPendingChangesTextRestartRequired;
    try {
      await pendingLocator
        .first()
        .waitFor({ state: 'hidden', timeout })
        .catch(() => false);
      const isVisible = await pendingLocator
        .first()
        .isVisible()
        .catch(() => false);
      return !isVisible;
    } catch {
      return true;
    }
  }
}
