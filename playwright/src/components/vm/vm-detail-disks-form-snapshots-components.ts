import BaseComponent from '@/components/shared/base-component';
import { DISK_NAMES } from '@/data-models';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

export interface VmStorageDiskVerifyHost {
  verifyDiskNameExists(diskName: string): Promise<boolean>;
  verifyDiskExists(diskName: string): Promise<boolean>;
}

export class VmDiskFormComponent extends BaseComponent {
  private readonly _configurationStorageSubTab = this.locator(
    '[data-test-id="vm-configuration-storage"]',
  );
  private readonly _inputIdSimpleFileFilename = this.locator('input[id="simple-file-filename"]');
  private readonly _btnPlaceholderSelectISOFile = this.locator(
    'button[placeholder="Select ISO file"]',
  );
  private readonly _name = this.locator('#name');
  private readonly _diskTypeSelect = this.locator('[data-test-id="disk-type-select"]');
  private readonly _diskTypeSelectLun = this.locator('[data-test-id="disk-type-select-lun"]');
  private readonly _lunReservation = this.locator('#lun-reservation');
  private readonly _inputInput = this.locator('input[aria-label="Input"]');
  private readonly _storageClassSelect = this.locator('[data-test-id="storage-class-select"]');
  private readonly _blankDiskOption = this.locator('text=Empty disk (blank)');
  private readonly _nameInput = this.locator('input[id="name"]');
  private readonly _fileInput = this.locator('[data-test-id="disk-source-upload"] [type="file"]');
  private readonly _advancedSettingsButton = this.locator('button:has-text("Advanced settings")');
  private readonly _addDiskButtonInStorage = this.locator(
    '.kv-configuration-vm-disk-list button:has-text("Add"), [data-test-id="storage-add-button"], button:has-text("Add disk")',
  );
  private readonly _tabModal = this.locator('#tab-modal');

  constructor(page: Page) {
    super(page);
  }

  private getStorageClassOption(storageClass: string) {
    return this.locator(`button#select-inline-filter-${storageClass}`);
  }

  private async navigateToConfigurationStorage(): Promise<void> {
    await this.navigateToTab(
      this.locator('[data-test-id="horizontal-link-Configuration"]'),
      TestTimeouts.UI_ACTION_COMPLETE,
    );
    await this._configurationStorageSubTab.waitFor({
      state: 'visible',
      timeout: TestTimeouts.VM_CREATION,
    });
    await this.robustClick(this._configurationStorageSubTab);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async isAddDiskButtonEnabled(): Promise<boolean> {
    await this.navigateToConfigurationStorage();
    await this._addDiskButtonInStorage.waitFor({
      state: 'visible',
      timeout: TestTimeouts.VM_CREATION,
    });
    const isDisabled = await this._addDiskButtonInStorage.evaluate((el) => {
      const btn = el instanceof HTMLButtonElement ? el : el.querySelector('button');
      if (!btn) return false;
      return btn.disabled || btn.getAttribute('aria-disabled') === 'true';
    });
    return !isDisabled;
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
    diskName: string,
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

    await this._nameInput.waitFor({
      state: 'visible',
      timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
    });
    await this._nameInput.fill(diskName);

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
        await this.locator('button:has-text("Cancel")').first().click();
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

  async addLUNDisk(diskName: string = DISK_NAMES.LUN_DISK): Promise<string> {
    await this.navigateToConfigurationStorage();

    await this._addDiskButtonInStorage.waitFor({
      state: 'visible',
      timeout: TestTimeouts.VM_CREATION,
    });
    await this._addDiskButtonInStorage.click();

    const blankDiskOption = this.locator('text=Empty disk (blank)');
    await blankDiskOption.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
    await blankDiskOption.click();

    await this._name.waitFor({
      state: 'visible',
      timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
    });
    await this._name.clear();
    await this._name.fill(diskName);

    const actualDiskName = await this._name.inputValue();

    await this._diskTypeSelect.waitFor({
      state: 'visible',
      timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
    });
    await this.robustClick(this._diskTypeSelect);
    await this._diskTypeSelectLun.waitFor({
      state: 'visible',
      timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
    });
    await this.robustClick(this._diskTypeSelectLun);

    await this._advancedSettingsButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
    });
    await this.robustClick(this._advancedSettingsButton);

    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);

    await this._lunReservation.waitFor({
      state: 'visible',
      timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
    });
    await this._lunReservation.check({ force: true });

    await this.clickDialogSaveButton();

    return actualDiskName;
  }

  async addShareableDisk(diskName: string = DISK_NAMES.SHAREABLE_DISK): Promise<string> {
    await this.navigateToConfigurationStorage();

    await this._addDiskButtonInStorage.waitFor({
      state: 'visible',
      timeout: TestTimeouts.VM_CREATION,
    });
    await this._addDiskButtonInStorage.click();

    await this._blankDiskOption.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
    await this._blankDiskOption.click();

    const volumeNameInput = this.locator('input[name="volume.name"]');
    await volumeNameInput.waitFor({
      state: 'visible',
      timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
    });
    await volumeNameInput.clear();
    await volumeNameInput.fill(diskName);

    const actualDiskName = await volumeNameInput
      .inputValue({ timeout: TestTimeouts.SHORT_WAIT })
      .catch(() => diskName);

    await this._advancedSettingsButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
    });
    await this.robustClick(this._advancedSettingsButton);

    const shareableCheckbox = this.locator('input[id="sharable-disk"]');
    await shareableCheckbox.waitFor({
      state: 'visible',
      timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
    });
    const isChecked = await shareableCheckbox.isChecked();
    if (!isChecked) {
      await shareableCheckbox.click({ force: true });
    }

    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);

    await this.clickDialogSaveButton();

    return actualDiskName;
  }

  async addBlankDisk(
    diskName: string,
    verify: VmStorageDiskVerifyHost,
    size = '1',
    storageClass?: string,
  ): Promise<boolean> {
    try {
      await this.navigateToConfigurationStorage();

      await this._addDiskButtonInStorage.waitFor({
        state: 'visible',
        timeout: TestTimeouts.VM_CREATION,
      });
      await this.robustClick(this._addDiskButtonInStorage);

      await this._blankDiskOption.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
      await this.robustClick(this._blankDiskOption);

      const diskNameField = this.page
        .locator('[role="dialog"] #name, #tab-modal #name, input[name="disk.name"]')
        .first();
      await diskNameField.waitFor({
        state: 'visible',
        timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
      });
      await diskNameField.clear();
      await diskNameField.fill(diskName);

      if (size) {
        const sizeInputExists = await this._inputInput
          .isVisible({ timeout: TestTimeouts.UI_DELAY_LONG })
          .catch(() => false);
        if (sizeInputExists) {
          await this._inputInput.clear();
          for (let i = 0; i < parseInt(size); i++) {
            await this.robustClick(this.locator('button[aria-label="Increment"]'));
          }
        }
      }

      if (storageClass) {
        const scOpen = await this._storageClassSelect
          .isVisible({ timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION })
          .catch(() => false);
        if (scOpen) {
          await this.robustClick(this._storageClassSelect);
          const storageClassOption = this.getStorageClassOption(storageClass);
          const optVisible = await storageClassOption
            .isVisible({ timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION })
            .catch(() => false);
          if (optVisible) {
            await this.robustClick(storageClassOption);
          }
        }
      }

      const dialogSaveVisible = await this.page
        .locator('[role="dialog"] [data-test="save-button"]')
        .isVisible({ timeout: TestTimeouts.UI_ACTION_COMPLETE })
        .catch(() => false);
      if (dialogSaveVisible) {
        await this.clickDialogSaveButton();
      } else {
        await this.clickSave();
      }

      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);

      const diskExists =
        (await verify.verifyDiskNameExists(diskName)) || (await verify.verifyDiskExists(diskName));
      return diskExists;
    } catch {
      return false;
    }
  }
}

export class VmDetailSnapshotsComponent extends BaseComponent {
  private readonly _horizontalLinkSnapshots = this.locator(
    '[data-test-id="horizontal-link-Snapshots"]',
  );
  private readonly _snapshotsCard = this.locator(
    '[data-test-id="virtual-machine-overview-snapshots"]',
  );
  private readonly _successIcon = this.locator('[data-test="success-icon"]');
  private readonly _nameInput = this.locator('input[id="name"]');
  private readonly _takeSnapshotBtn = this.locator('button:has-text("Take snapshot")');
  private readonly _restoreVirtualMachineFromSnapshot = this.locator(
    'text=Restore VirtualMachine from snapshot',
  );
  private readonly _vmDetailSaveButton = this.locator('[data-test="save-button"]');
  private readonly _createButton = this.locator('button.pf-v6-c-button.pf-m-primary.pf-m-progress');
  private readonly _vmName = this.locator('[data-test-id="virtual-machine-overview-details-name"]');

  constructor(page: Page) {
    super(page);
  }

  async navigateToSnapshots(): Promise<void> {
    await this._horizontalLinkSnapshots.waitFor({
      state: 'visible',
      timeout: TestTimeouts.VM_CREATION,
    });
    await this.robustClick(this._horizontalLinkSnapshots);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  private async isVmNameVisible(
    expectedName?: string,
    timeout: number = TestTimeouts.DEFAULT,
  ): Promise<boolean> {
    await this._vmName.waitFor({ state: 'visible', timeout });
    if (!expectedName) {
      return true;
    }
    const actualText = await this._vmName.textContent();
    return actualText?.includes(expectedName) ?? false;
  }

  async verifySnapshotsCardVisible(): Promise<boolean> {
    try {
      await this._snapshotsCard.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
      return true;
    } catch {
      return false;
    }
  }

  async verifySnapshotInCard(): Promise<boolean> {
    try {
      await this._snapshotsCard.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });

      const snapshotsLink = this._snapshotsCard.locator('a:has-text("Snapshots (1)")');
      const snapshotsLinkExists = await snapshotsLink
        .isVisible({ timeout: TestTimeouts.STATUS_VALIDATION })
        .catch(() => false);

      if (!snapshotsLinkExists) {
        return false;
      }

      await snapshotsLink.click();

      await this._successIcon
        .waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT })
        .catch(() => {
          return;
        });
      const successExists = await this._successIcon.isVisible().catch(() => false);

      return successExists;
    } catch {
      return false;
    }
  }

  async takeSnapshot(snapshotName: string): Promise<boolean> {
    try {
      await this.navigateToSnapshots();

      await this._takeSnapshotBtn.waitFor({
        state: 'visible',
        timeout: TestTimeouts.VM_CREATION,
      });
      await this._takeSnapshotBtn.click();

      await this._nameInput.waitFor({
        state: 'visible',
        timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
      });
      await this._nameInput.fill(snapshotName);

      await this.clickSaveByTestId();

      const snapshotLink = this.locator(`a:has-text("${snapshotName}")`);
      await snapshotLink.waitFor({ state: 'visible', timeout: TestTimeouts.STATUS_VALIDATION });
      const snapshotExists = await snapshotLink.isVisible().catch(() => false);

      return snapshotExists;
    } catch {
      return false;
    }
  }

  async createVmFromSnapshot(
    snapshotName: string,
    vmName: string,
    startAfterCreation = false,
  ): Promise<boolean> {
    try {
      await this.navigateToSnapshots();

      const snapshotRow = this.locator(`tr:has-text("${snapshotName}")`);
      await snapshotRow.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });

      const actionButton = snapshotRow.locator('td button');
      await actionButton.click();

      await this.locator('text=Create VirtualMachine').click();

      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);

      await this._nameInput.fill(vmName);

      if (startAfterCreation) {
        const cloneCheckbox = this.locator('input[id="start-clone"]');
        const isChecked = await cloneCheckbox.isChecked();
        if (!isChecked) {
          await cloneCheckbox.click({ force: true });
        }
      }

      await this._createButton.click({ force: true });

      const vmNameVisible = await this.isVmNameVisible(vmName, TestTimeouts.DEFAULT);

      return vmNameVisible;
    } catch {
      return false;
    }
  }

  async restoreVmFromSnapshot(
    snapshotName: string,
  ): Promise<{ success: boolean; payload?: unknown }> {
    try {
      const responsePromise = this.page
        .waitForResponse(
          (response) =>
            response.url().includes('virtualmachinerestores') &&
            response.request().method() === 'POST' &&
            response.status() === 201,
          { timeout: TestTimeouts.UI_ACTION_COMPLETE },
        )
        .catch(() => undefined);

      const snapshotRow = this.locator(`tr:has-text("${snapshotName}")`);
      await snapshotRow.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });

      const actionButton = snapshotRow.locator('td button').last();
      await actionButton.click();

      await this._restoreVirtualMachineFromSnapshot.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this._restoreVirtualMachineFromSnapshot.click();

      await this._vmDetailSaveButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this.robustClick(this._vmDetailSaveButton);

      const response = await responsePromise;
      let payload = undefined;

      if (response) {
        try {
          payload = await response.request().postDataJSON();
        } catch {
          // Ignore payload extraction errors
        }
      }

      return { success: true, payload };
    } catch {
      return { success: false };
    }
  }

  async isVolumeRestorePolicyAbsent(): Promise<boolean> {
    try {
      const policyLabel = this.locator('[role="radiogroup"]:has-text("Volume restore policy")');
      return !(await policyLabel
        .isVisible({ timeout: TestTimeouts.SHORT_WAIT })
        .catch(() => false));
    } catch {
      return true;
    }
  }

  async openRestoreModalForSnapshot(snapshotName: string): Promise<void> {
    const snapshotRow = this.locator(`tr:has-text("${snapshotName}")`);
    await snapshotRow.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });

    const actionButton = snapshotRow.locator('td button').last();
    await actionButton.click();

    await this._restoreVirtualMachineFromSnapshot.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this._restoreVirtualMachineFromSnapshot.click();

    await this._vmDetailSaveButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
  }

  async cancelRestoreModal(): Promise<void> {
    const cancelButton = this.locator('[data-test="cancel-button"]');
    await cancelButton.waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
    await this.robustClick(cancelButton);
  }

  async verifyNoSnapshots(): Promise<boolean> {
    return await super.verifyTextVisible('No snapshots found');
  }

  async getFirstSnapshotNameFromSnapshotsTable(
    timeoutMs: number = TestTimeouts.STATUS_VALIDATION,
  ): Promise<string> {
    const nameLink = this.locator('[data-test="vm-snapshot-list"] a').first();
    await nameLink.waitFor({ state: 'visible', timeout: timeoutMs });
    const text = (await nameLink.textContent()) || '';
    return text.trim();
  }

  async verifySnapshotExists(snapshotName: string): Promise<boolean> {
    try {
      await this.navigateToSnapshots();
      const snapshotLocator = this.locator(
        `[data-test="${snapshotName}"], [data-test-id="${snapshotName}"], a:has-text("${snapshotName}")`,
      ).first();
      await snapshotLocator.waitFor({
        state: 'visible',
        timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
      });
      return true;
    } catch {
      return false;
    }
  }

  async clickSnapshot(snapshotName: string): Promise<void> {
    const snapshotLocator = this.locator(
      `[data-test="${snapshotName}"], [data-test-id="${snapshotName}"]`,
    ).first();
    await snapshotLocator.waitFor({
      state: 'visible',
      timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
    });
    await this.robustClick(snapshotLocator);
  }

  async deleteSnapshotFromRow(snapshotName: string): Promise<void> {
    const rowActionButton = this.locator(`[id="snapshot-actions-${snapshotName}"]`);
    await rowActionButton.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
    await this.robustClick(rowActionButton);
    const deleteMenuItem = this.locator('[role="menuitem"]').filter({ hasText: 'Delete snapshot' });
    await deleteMenuItem.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
    await this.robustClick(deleteMenuItem);
    const confirmButton = this.locator('[data-test="save-button"]');
    await confirmButton.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
    await this.robustClick(confirmButton);
  }

  async verifyNoVirtualMachineSnapshotsEmptyState(): Promise<boolean> {
    try {
      await this.navigateToSnapshots();
      const emptyBox = this.locator(
        '[data-test="empty-box-body"], .pf-v6-c-empty-state, .pf-c-empty-state',
      ).first();
      await emptyBox.waitFor({ state: 'visible', timeout: TestTimeouts.STATUS_VALIDATION });
      const text = await emptyBox.textContent();
      return (
        text?.includes('No VirtualMachineSnapshots found') ||
        text?.includes('No snapshots') ||
        text?.includes('not found') ||
        false
      );
    } catch {
      return false;
    }
  }

  async verifyNoSnapshotsFoundInLoadingBox(): Promise<boolean> {
    const emptyHeading = this.locator('[data-test="vm-snapshot-list"] h4');
    await emptyHeading.waitFor({ state: 'visible', timeout: TestTimeouts.STATUS_VALIDATION });
    const text = await emptyHeading.textContent();
    return text?.includes('No snapshots found') ?? false;
  }

  async verifySnapshotWithSuccessIcon(): Promise<boolean> {
    try {
      await this._successIcon.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
      const successIconVisible = await this._successIcon
        .isVisible({ timeout: TestTimeouts.DEFAULT })
        .catch(() => false);

      return successIconVisible;
    } catch {
      return false;
    }
  }
}
