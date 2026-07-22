/**
 * VirtualMachine detail — Configuration tab components:
 * CD-ROM flows and details/storage/scheduling edits.
 */

import BaseComponent from '@/components/shared/base-component';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

/**
 * VirtualMachine detail — Add CD-ROM flows from Configuration → Storage (not VMI disks tab).
 */
export class VirtualMachineDetailConfigurationCdromComponent extends BaseComponent {
  private readonly _addDiskButtonInStorage = this.locator(
    '.kv-configuration-vm-disk-list button:has-text("Add")',
  )
    .or(this.testId('storage-add-button'))
    .or(this.locator('button:has-text("Add disk")'));
  private readonly _btnPlaceholderSelectISOFile = this.locator(
    'button[placeholder="Select ISO file"]',
  );
  private readonly _configurationStorageSubTab = this.testId('vm-configuration-storage');
  private readonly _configurationTab = this.testId('horizontal-link-Configuration');
  private readonly _fileInput = this.testId('disk-source-upload').locator('[type="file"]');
  private readonly _inputIdSimpleFileFilename = this.locator('input[id="simple-file-filename"]');
  private readonly _nameInput = this.locator('input[id="name"]');
  private readonly _tabModal = this.locator('#tab-modal');

  constructor(page: Page) {
    super(page);
  }

  private async clickCancel(): Promise<void> {
    await this.locator('button:has-text("Cancel")').click();
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

  private async navigateToConfigurationTab(): Promise<void> {
    await this.navigateToTab(this._configurationTab, TestTimeouts.UI_ACTION_COMPLETE);
  }

  async addCDROMDisk(
    diskName: string | undefined,
    cdromSource: 'Upload new ISO' | 'Use existing ISO' | 'Leave empty drive' = 'Upload new ISO',
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
      const cdromOption = this.locator('text=CD-ROM').or(this.testId('disk-type-select-cdrom'));
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
        const cancelButton = this._tabModal
          .locator('[data-test="cancel-button"]')
          .or(this._tabModal.locator('button:has-text("Cancel")'));
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

    const submitBtn = modal
      .locator('[data-test="save-button"]')
      .or(modal.locator('button.pf-m-primary:not(:has-text("Cancel"))'));
    const submitButtonLabel = (await submitBtn.textContent().catch(() => ''))?.trim() ?? '';

    await modal.locator('button:has-text("Cancel")').click();
    await modal.waitFor({ state: 'hidden', timeout: TestTimeouts.ELEMENT_WAIT }).catch(() => null);

    return { title, radioLabels, defaultSelected, submitButtonLabel };
  }

  /**
   * Opens the Add CD-ROM modal, selects "Upload new ISO", and checks whether
   * a separate Upload Mode selector (DataVolume vs PVC) is present.
   *
   * CNV-81927 fix removed the Upload Mode selector — uploads now always create
   * DataVolumes. Returns true if the selector is absent (fix is working).
   */
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
        .getByTestId('upload-mode-selector')
        .or(modal.locator('select[id*="upload-mode"]'))
        .or(modal.locator('[id*="upload-type"]'))
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
}

/**
 * VirtualMachine detail — Configuration tab: details, storage verifications, and edits.
 */
export class VirtualMachineDetailConfigurationComponent extends BaseComponent {
  private readonly _bootManagementBtn = this.locator('button:has-text("Boot management")');
  private readonly _configurationSearchAutocompleteSearchInput = this.locator(
    '#ConfigurationSearch-autocomplete-search input',
  );
  private readonly _configurationStorageSubTab = this.testId('vm-configuration-storage');
  private readonly _configurationTab = this.testId('horizontal-link-Configuration');
  private readonly _cpuMemoryButton = this.testId('virtual-machine-overview-details-cpu-memory');
  private readonly _dataVolumeDetails = this.locator('text=DataVolume details');
  private readonly _evictionStrategyElement = this.testId('eviction-strategy');
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

  private async navigateToConfigurationTab(): Promise<void> {
    await this.navigateToTab(this._configurationTab, TestTimeouts.UI_ACTION_COMPLETE);
  }

  async clickConfigurationStorageSubTab(): Promise<void> {
    await this._configurationStorageSubTab.waitFor({
      state: 'visible',
      timeout: TestTimeouts.VM_CREATION,
    });
    await this.robustClick(this._configurationStorageSubTab);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async clickPvcLink(volumeName: string): Promise<boolean> {
    try {
      await this.navigateToConfigurationStorage();
      const pvcLink = this.testId(volumeName);
      await pvcLink.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
      await this.robustClick(pvcLink);
      return true;
    } catch {
      return false;
    }
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
      const descButton = this.testId(`${vmName}-description`).first();
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
      const bootModeButton = this.testId(`${vmName}-boot-method`).first();
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
      const workloadButton = this.testId(`${vmName}-workload-profile`).first();
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
      const hostnameButton = this.testId(`${vmName}-hostname`).first();
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
    await this.navigateToConfigurationTab();
    await this._configurationStorageSubTab.waitFor({
      state: 'visible',
      timeout: TestTimeouts.VM_CREATION,
    });
    await this.robustClick(this._configurationStorageSubTab);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
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

  /** Search within Configuration (sub-tab omnibar). */
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

      const bootModeButton = this.testId(`${vmName}-boot-method`).first();
      await bootModeButton.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
      const bootModeText = await bootModeButton.textContent();
      return bootModeText?.includes(expectedBootMode) ?? false;
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

  async verifyDedicatedResources(expectedText: string): Promise<boolean> {
    const dedicatedResourcesLocator = this.testId('dedicated-resources').first();
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

  async verifyDescription(vmName: string, expectedDescription: string): Promise<boolean> {
    try {
      const descButton = this.testId(`${vmName}-description`).first();
      await descButton.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
      const descText = await descButton.textContent();
      return descText?.includes(expectedDescription) ?? false;
    } catch {
      return false;
    }
  }

  async verifyDiskExists(diskName: string): Promise<boolean> {
    try {
      const labeled = this.locator(
        `[data-label="source"]:has-text("${diskName}"), [data-label="Source"]:has-text("${diskName}")`,
      );
      const hasLabeled = await labeled
        .first()
        .isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM })
        .catch(() => false);

      if (hasLabeled) {
        return true;
      }

      const cellWithText = this.locator(`td:has-text("${diskName}")`).first();
      await cellWithText.waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_LONG });
      return true;
    } catch {
      return false;
    }
  }

  async verifyDiskExistsByDataLabelName(diskName: string): Promise<boolean> {
    try {
      await this.navigateToConfigurationStorage();
      const diskNameLocator = this.locator(`[data-label="name"]:has-text("${diskName}")`);
      await diskNameLocator.waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_EXTRA });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Verify disk exists by checking for data-test attribute containing the disk name.
   * Uses pattern: [data-test*="diskName"] to match elements like
   * data-test="pw-vm-detach-disk-xxx-cdrom-iso-upload-diskname"
   */
  async verifyDiskExistsByDataTest(diskName: string): Promise<boolean> {
    try {
      const diskLocator = this.locator(`[data-test*="${diskName}"]`);
      await diskLocator.waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_EXTRA });
      return true;
    } catch {
      return false;
    }
  }

  async verifyDiskExistsByDataTestId(diskName: string): Promise<boolean> {
    try {
      const diskLocator = this.locator(`[data-test*="${diskName}"]`);
      await diskLocator.waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_EXTRA });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Verify disk exists by data-test pattern: dv-{vmName}-{diskName}-k8ntab
   * @param vmName - The VM name
   * @param diskName - The disk name
   * @returns true if the disk with the expected data-test exists
   */
  async verifyDiskExistsByDataTestIdPattern(vmName: string, diskName: string): Promise<boolean> {
    try {
      await this.navigateToConfigurationStorage();
      const expectedDataTestId = `dv-${vmName}-${diskName}-k8ntab`;
      const diskLocator = this.testId(expectedDataTestId);
      await diskLocator.waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_EXTRA });
      return true;
    } catch {
      return false;
    }
  }

  async verifyDiskNameExists(diskName: string): Promise<boolean> {
    try {
      const diskLocator = this.locator(
        `td:has-text("${diskName}"), [data-label="name"]:has-text("${diskName}"), [data-label="Name"]:has-text("${diskName}")`,
      ).first();
      await diskLocator.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Verifies a disk row is visible by exact `data-test` (e.g. `disk-rootdisk`, uploaded ISO DV name).
   */
  async verifyDiskRowVisibleByExactDataTestId(dataTestId: string): Promise<boolean> {
    try {
      await this.navigateToConfigurationStorage();
      const diskLocator = this.testId(dataTestId);
      await diskLocator.waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_EXTRA });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Verify disk exists by data-test pattern: dv-{vmName}-{diskName}-k8ntab
   * @param vmName - The VM name
   * @param diskName - The disk name
   * @returns true if the disk with the expected data-test exists
   */
  async verifyDiskSourceByDataTestId(vmName: string, diskName: string): Promise<boolean> {
    try {
      await this.navigateToConfigurationStorage();
      const expectedDataTestId = `dv-${vmName}-${diskName}-k8ntab`;
      const diskLocator = this.testId(expectedDataTestId);
      await diskLocator.waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_EXTRA });
      return true;
    } catch {
      return false;
    }
  }

  async verifyDiskStorageClass(diskName: string, expectedStorageClass: string): Promise<boolean> {
    try {
      await this.navigateToConfigurationStorage();

      const diskRow = this.locator(`tr:has-text("${diskName}")`);

      const storageClassExists = await diskRow
        .locator(`text=${expectedStorageClass}`)
        .isVisible({ timeout: TestTimeouts.VM_BOOTUP })
        .catch(() => false);

      return storageClassExists;
    } catch {
      return false;
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

  async verifyEvictionStrategyNone(): Promise<boolean> {
    try {
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

      const timeout = Math.min(TestTimeouts.UI_ELEMENT_VISIBILITY, 30000);

      const evictionStrategyElement = this.testId('eviction-strategy');

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

  async verifyHostname(vmName: string, expectedHostname: string): Promise<boolean> {
    try {
      const hostnameButton = this.testId(`${vmName}-hostname`).first();
      await hostnameButton.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
      const hostnameText = await hostnameButton.textContent();
      return hostnameText?.includes(expectedHostname) ?? false;
    } catch {
      return false;
    }
  }

  async verifyPvcDetailsPage(): Promise<boolean> {
    try {
      await this._dataVolumeDetails
        .first()
        .waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
      return await this._dataVolumeDetails
        .first()
        .isVisible()
        .catch(() => false);
    } catch {
      return false;
    }
  }

  async verifySysprepInStorage(): Promise<boolean> {
    try {
      await this.navigateToConfigurationStorage();

      const sysprepRow = this.locator('tr:has-text("CD-ROM"):has-text("Other")');
      await sysprepRow.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
      return await sysprepRow.isVisible().catch(() => false);
    } catch {
      return false;
    }
  }

  async verifyWorkload(vmName: string, expectedWorkload: string): Promise<boolean> {
    const workloadLocator = this.testId(`${vmName}-workload-profile`).first();
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
