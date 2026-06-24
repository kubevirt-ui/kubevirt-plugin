import BaseComponent from '@/components/shared/base-component';
import { VmDetailConfigurationStorageComponent } from '@/components/vm/vm-detail-disks-edit-components';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

export class VirtualMachineDetailConfigurationCdromComponent extends BaseComponent {
  private readonly _configurationTab = this.locator(
    '[data-test-id="horizontal-link-Configuration"]',
  );
  private readonly _configurationStorageSubTab = this.locator(
    '[data-test-id="vm-configuration-storage"]',
  );
  private readonly _addDiskButtonInStorage = this.locator(
    '.kv-configuration-vm-disk-list button:has-text("Add"), [data-test-id="storage-add-button"], button:has-text("Add disk")',
  );
  private readonly _tabModal = this.locator('#tab-modal');
  private readonly _inputIdSimpleFileFilename = this.locator('input[id="simple-file-filename"]');
  private readonly _btnPlaceholderSelectISOFile = this.locator(
    'button[placeholder="Select ISO file"]',
  );
  private readonly _nameInput = this.locator('input[id="name"]');
  private readonly _fileInput = this.locator('[data-test-id="disk-source-upload"] [type="file"]');

  constructor(page: Page) {
    super(page);
  }

  private async navigateToConfigurationTab(): Promise<void> {
    await this.navigateToTab(this._configurationTab, TestTimeouts.UI_ACTION_COMPLETE);
  }

  private async navigateToConfigurationStorage(): Promise<void> {
    await this.navigateToConfigurationTab();
    await this._configurationStorageSubTab.waitFor({
      state: 'visible',
      timeout: TestTimeouts.VM_CREATION,
    });
    await this.robustClick(this._configurationStorageSubTab);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  private async clickCancel(): Promise<void> {
    await this.locator('button:has-text("Cancel")').click();
  }

  async getCDROMModalOptions(): Promise<{
    title: string;
    radioLabels: string[];
    defaultSelected: string;
    submitButtonLabel: string;
  }> {
    await this.navigateToConfigurationStorage();
    await this._addDiskButtonInStorage.waitFor({
      state: 'visible',
      timeout: TestTimeouts.VM_CREATION,
    });
    await this._addDiskButtonInStorage.click({ force: true });

    const cdromMenuOption = this.page
      .locator('.pf-v6-c-menu__item, .pf-c-dropdown__menu-item')
      .filter({ hasText: 'CD-ROM' })
      .first();
    await cdromMenuOption
      .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
      .catch(() => null);
    await cdromMenuOption.click({ force: true });

    const modal = this._tabModal;
    await modal.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });

    const title =
      (
        await modal
          .locator('h1, h2')
          .first()
          .textContent()
          .catch(() => '')
      )?.trim() ?? '';

    const radioInputs = modal.locator('input[type="radio"][name="cdrom-source"]');
    const count = await radioInputs.count();
    const radioLabels: string[] = [];
    let defaultSelected = '';
    for (let i = 0; i < count; i++) {
      const radio = radioInputs.nth(i);
      const id = (await radio.getAttribute('id')) ?? '';
      const label =
        (
          await modal
            .locator(`label[for="${id}"]`)
            .textContent()
            .catch(() => '')
        )?.trim() ?? '';
      radioLabels.push(label);
      if (await radio.isChecked()) {
        defaultSelected = label;
      }
    }

    const submitBtn = modal.locator(
      '[data-test="confirm-action"], button.pf-m-primary:not(:has-text("Cancel"))',
    );
    const submitButtonLabel = (await submitBtn.textContent().catch(() => ''))?.trim() ?? '';

    await modal.locator('button:has-text("Cancel")').click();
    await modal.waitFor({ state: 'hidden', timeout: TestTimeouts.ELEMENT_WAIT }).catch(() => null);

    return { title, radioLabels, defaultSelected, submitButtonLabel };
  }

  async verifyUploadNewISOHasNoUploadModeSelector(): Promise<boolean> {
    try {
      await this._addDiskButtonInStorage.waitFor({
        state: 'visible',
        timeout: TestTimeouts.VM_CREATION,
      });
      await this._addDiskButtonInStorage.click({ force: true });

      const cdromMenuOption = this.page
        .locator('.pf-v6-c-menu__item, .pf-c-dropdown__menu-item')
        .filter({ hasText: 'CD-ROM' })
        .first();
      await cdromMenuOption
        .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
        .catch(() => null);
      await cdromMenuOption.click({ force: true });

      const modal = this._tabModal;
      await modal.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });

      const uploadRadio = modal.locator('#cdrom-source-upload');
      await uploadRadio.waitFor({ state: 'attached', timeout: TestTimeouts.ELEMENT_WAIT });
      await this.robustClick(uploadRadio);
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

      const hasUploadModeSelector = await modal
        .locator(
          '[data-test="upload-mode-selector"], select[id*="upload-mode"], [id*="upload-type"], [data-test-id*="upload-mode"]',
        )
        .isVisible()
        .catch(() => false);

      await modal.locator('button:has-text("Cancel")').click();
      await modal
        .waitFor({ state: 'hidden', timeout: TestTimeouts.ELEMENT_WAIT })
        .catch(() => null);

      return !hasUploadModeSelector;
    } catch {
      return false;
    }
  }

  async addCDROMDisk(
    diskName: string | undefined,
    cdromSource: 'Leave empty drive' | 'Upload new ISO' | 'Use existing ISO' = 'Upload new ISO',
    sourceValue?: string,
  ): Promise<boolean> {
    await this.navigateToConfigurationStorage();

    await this._addDiskButtonInStorage.waitFor({
      state: 'visible',
      timeout: TestTimeouts.VM_CREATION,
    });

    await this._addDiskButtonInStorage.click({ force: true });

    const cdromMenuOption = this.page
      .locator('.pf-v6-c-menu__item, .pf-c-dropdown__menu-item')
      .filter({ hasText: 'CD-ROM' })
      .first();
    await cdromMenuOption
      .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
      .catch(() => null);

    if (await cdromMenuOption.isVisible()) {
      await cdromMenuOption.click({ force: true });
    } else {
      const cdromOption = this.locator('text=CD-ROM, [data-test-id="disk-type-select-cdrom"]');
      await cdromOption
        .first()
        .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      await cdromOption.first().click({ force: true });
    }

    if (diskName) {
      await this._nameInput.waitFor({
        state: 'visible',
        timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
      });
      await this._nameInput.fill(diskName);
    }

    if (cdromSource === 'Upload new ISO' && sourceValue) {
      const uploadRadio = this.page.locator(
        'input[id="cdrom-source-upload"], input#cdrom-source-upload',
      );
      await uploadRadio.waitFor({ state: 'attached', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      await uploadRadio.check({ force: true });

      await this._inputIdSimpleFileFilename.waitFor({
        state: 'attached',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });

      await this._fileInput.setInputFiles(sourceValue);

      await this._tabModal
        .locator('[role="progressbar"], .pf-v6-c-progress, .pf-c-progress')
        .first()
        .waitFor({ state: 'visible', timeout: TestTimeouts.FILE_UPLOAD })
        .catch(() => undefined);

      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
    } else if (cdromSource === 'Use existing ISO' && sourceValue) {
      const mountExistingRadio = this.page.locator(
        'input[id="cdrom-source-existing"], input#cdrom-source-existing',
      );
      await mountExistingRadio.waitFor({
        state: 'attached',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await mountExistingRadio.check({ force: true });

      const selectIsoButton = this._btnPlaceholderSelectISOFile;
      await selectIsoButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
      await selectIsoButton.click();

      const isoOption = this.locator(`button[id="select-inline-filter-${sourceValue}"]`);
      await isoOption.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
      await isoOption.click();
    } else if (cdromSource === 'Leave empty drive') {
      const emptyRadio = this.page.locator(
        'input[id="cdrom-source-empty"], input#cdrom-source-empty, label:has-text("Leave empty drive") input',
      );
      await emptyRadio.waitFor({ state: 'attached', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });

      if (await emptyRadio.isDisabled()) {
        await this.clickCancel();
        return false;
      }

      await emptyRadio.check({ force: true });
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    }

    await this.clickDialogSaveButton();

    await this._tabModal
      .waitFor({ state: 'hidden', timeout: TestTimeouts.ELEMENT_WAIT })
      .catch(async (e) => {
        const errorAlert = this._tabModal.locator(
          '.pf-v6-c-alert.pf-m-danger, .pf-c-alert.pf-m-danger',
        );
        let errorText = 'None';
        if (await errorAlert.isVisible()) {
          errorText = (await errorAlert.textContent().catch(() => 'None')) || 'None';
        }
        const cancelButton = this._tabModal.locator(
          '[data-test="cancel-button"], button:has-text("Cancel")',
        );
        if (await cancelButton.isVisible()) {
          await cancelButton.click({ force: true });
        }
        throw new Error(
          `Modal failed to close after clicking Save. Error: ${errorText}. Original error: ${e.message}`,
        );
      });

    const successAlert = this.page
      .locator('.pf-v6-c-alert.pf-m-success, .pf-c-alert.pf-m-success')
      .first();
    const closeButton = successAlert.locator(
      'button[aria-label="Close success alert"], button.pf-v6-c-button.pf-m-plain, button.pf-c-button.pf-m-plain',
    );

    await successAlert
      .waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_MEDIUM })
      .catch(() => null);
    if (await closeButton.isVisible()) {
      await closeButton.click().catch(() => null);
    }

    return true;
  }
}

export class VirtualMachineDetailConfigurationComponent extends BaseComponent {
  readonly storage: VmDetailConfigurationStorageComponent;

  private readonly _configurationTab = this.locator(
    '[data-test-id="horizontal-link-Configuration"]',
  );
  private readonly _vmConfigurationDetails = this.locator(
    '[data-test-id="vm-configuration-details"]',
  );
  private readonly _cpuMemoryButton = this.locator(
    '[data-test-id="virtual-machine-overview-details-cpu-memory"]',
  );
  private readonly _evictionStrategyElement = this.locator('[data-test-id="eviction-strategy"]');
  private readonly _isTextPendingChangesTextRestartRequired = this.locator(
    ':is(:text("Pending changes"), :text("Restart required"))',
  );
  private readonly _configurationSearchAutocompleteSearchInput = this.locator(
    '#ConfigurationSearch-autocomplete-search input',
  );
  private readonly _restoreTemplateSettingsBtn = this.locator(
    'button:has-text("Restore template settings")',
  );
  private readonly _headlessCheckbox = this.locator('input[id="headless-mode"]');
  private readonly _tabModal = this.locator('#tab-modal');
  private readonly _vmDetailSaveButton = this.locator('[data-test="save-button"]');
  private readonly _bootManagementBtn = this.locator('button:has-text("Boot management")');

  constructor(page: Page) {
    super(page);
    this.storage = new VmDetailConfigurationStorageComponent(page);
  }

  private async navigateToConfigurationTab(): Promise<void> {
    await this.navigateToTab(this._configurationTab, TestTimeouts.UI_ACTION_COMPLETE);
  }

  async navigateToConfigurationDetails(): Promise<void> {
    await this.navigateToConfigurationTab();
    await this._vmConfigurationDetails.waitFor({
      state: 'visible',
      timeout: TestTimeouts.VM_CREATION,
    });
    await this.robustClick(this._vmConfigurationDetails);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async navigateToConfigurationStorage(): Promise<void> {
    return this.storage.navigateToConfigurationStorage();
  }

  async clickConfigurationStorageSubTab(): Promise<void> {
    return this.storage.clickConfigurationStorageSubTab();
  }

  async verifyWorkload(vmName: string, expectedWorkload: string): Promise<boolean> {
    const workloadLocator = this.locator(`button[data-test-id="${vmName}-workload-profile"]`);
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

  async verifyDedicatedResources(expectedText: string): Promise<boolean> {
    const dedicatedResourcesLocator = this.locator('button[data-test-id="dedicated-resources"]');
    try {
      await dedicatedResourcesLocator.waitFor({
        state: 'visible',
        timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
      });
      const text = await dedicatedResourcesLocator.textContent();
      return text?.includes(expectedText) ?? false;
    } catch {
      return false;
    }
  }

  async verifyEvictionStrategyNone(): Promise<boolean> {
    try {
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

      const timeout = Math.min(TestTimeouts.UI_ELEMENT_VISIBILITY, 30000);

      const evictionStrategyElement = this.locator('[data-test-id="eviction-strategy"]');

      const count = await evictionStrategyElement.count();
      if (count === 0) {
        return true;
      }

      try {
        await this._evictionStrategyElement.first().waitFor({ state: 'visible', timeout });
      } catch {
        await this._evictionStrategyElement.first().waitFor({ state: 'attached', timeout });
      }

      const textContent = await this._evictionStrategyElement.first().textContent();
      const innerText = await this._evictionStrategyElement
        .first()
        .innerText()
        .catch(() => '');

      const hasNone =
        (textContent?.toLowerCase().includes('none') ?? false) ||
        (innerText?.toLowerCase().includes('none') ?? false);

      if (hasNone) {
        return true;
      }

      const isEmpty = !textContent?.trim() && !innerText?.trim();
      return isEmpty;
    } catch {
      try {
        const count = await this._evictionStrategyElement.count();
        return count === 0;
      } catch {
        return true;
      }
    }
  }

  async verifyEvictionStrategyLiveMigrate(): Promise<boolean> {
    try {
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

      const timeout = Math.min(TestTimeouts.UI_ELEMENT_VISIBILITY, 30000);

      const count = await this._evictionStrategyElement.count();
      if (count === 0) {
        return false;
      }

      try {
        await this._evictionStrategyElement.first().waitFor({ state: 'visible', timeout });
      } catch {
        await this._evictionStrategyElement.first().waitFor({ state: 'attached', timeout });
      }

      const textContent = await this._evictionStrategyElement.first().textContent();
      const innerText = await this._evictionStrategyElement
        .first()
        .innerText()
        .catch(() => '');

      const hasLiveMigrate =
        (textContent?.toLowerCase().includes('livemigrate') ?? false) ||
        (innerText?.toLowerCase().includes('livemigrate') ?? false);

      return hasLiveMigrate;
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

  async verifyDiskExists(diskName: string): Promise<boolean> {
    return this.storage.verifyDiskExists(diskName);
  }

  async verifyDiskNameExists(diskName: string): Promise<boolean> {
    return this.storage.verifyDiskNameExists(diskName);
  }

  async verifyDiskExistsByDataTestId(diskName: string): Promise<boolean> {
    return this.storage.verifyDiskExistsByDataTestId(diskName);
  }

  async verifyDiskRowVisibleByExactDataTestId(dataTestId: string): Promise<boolean> {
    return this.storage.verifyDiskRowVisibleByExactDataTestId(dataTestId);
  }

  async verifyDiskExistsByDataTest(diskName: string): Promise<boolean> {
    return this.storage.verifyDiskExistsByDataTest(diskName);
  }

  async verifyDiskExistsByDataLabelName(diskName: string): Promise<boolean> {
    return this.storage.verifyDiskExistsByDataLabelName(diskName);
  }

  async verifyDiskExistsByDataTestIdPattern(vmName: string, diskName: string): Promise<boolean> {
    return this.storage.verifyDiskExistsByDataTestIdPattern(vmName, diskName);
  }

  async verifyDiskSourceByDataTestId(vmName: string, diskName: string): Promise<boolean> {
    return this.storage.verifyDiskSourceByDataTestId(vmName, diskName);
  }

  async clickPvcLink(volumeName: string): Promise<boolean> {
    return this.storage.clickPvcLink(volumeName);
  }

  async verifyPvcDetailsPage(): Promise<boolean> {
    return this.storage.verifyPvcDetailsPage();
  }

  async verifyDiskStorageClass(diskName: string, expectedStorageClass: string): Promise<boolean> {
    return this.storage.verifyDiskStorageClass(diskName, expectedStorageClass);
  }

  async verifySysprepInStorage(): Promise<boolean> {
    return this.storage.verifySysprepInStorage();
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
      const descButton = this.locator(`button[data-test-id="${vmName}-description"]`);
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
      await this._bootManagementBtn.waitFor({
        state: 'visible',
        timeout: TestTimeouts.VM_CREATION,
      });
      await this.robustClick(this._bootManagementBtn);
      const bootModeButton = this.locator(`button[data-test-id="${vmName}-boot-method"]`);
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
      await this._bootManagementBtn.waitFor({
        state: 'visible',
        timeout: TestTimeouts.VM_CREATION,
      });
      await this.robustClick(this._bootManagementBtn);
    }

    if (vmData.workload) {
      const workloadButton = this.locator(`button[data-test-id="${vmName}-workload-profile"]`);
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
      const hostnameButton = this.locator(`button[data-test-id="${vmName}-hostname"]`);
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
      await this._bootManagementBtn.waitFor({
        state: 'visible',
        timeout: TestTimeouts.VM_CREATION,
      });
      await this.robustClick(this._bootManagementBtn);
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

  async verifyDescription(vmName: string, expectedDescription: string): Promise<boolean> {
    try {
      const descButton = this.locator(`button[data-test-id="${vmName}-description"]`);
      await descButton.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
      const descText = await descButton.textContent();
      return descText?.includes(expectedDescription) ?? false;
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

      const bootModeButton = this.locator(`button[data-test-id="${vmName}-boot-method"]`);
      await bootModeButton.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
      const bootModeText = await bootModeButton.textContent();
      return bootModeText?.includes(expectedBootMode) ?? false;
    } catch {
      return false;
    }
  }

  async verifyHostname(vmName: string, expectedHostname: string): Promise<boolean> {
    try {
      const hostnameButton = this.locator(`button[data-test-id="${vmName}-hostname"]`);
      await hostnameButton.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
      const hostnameText = await hostnameButton.textContent();
      return hostnameText?.includes(expectedHostname) ?? false;
    } catch {
      return false;
    }
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
}
