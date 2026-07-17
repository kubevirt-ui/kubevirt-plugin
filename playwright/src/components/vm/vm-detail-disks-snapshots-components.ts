/**
 * VirtualMachine detail — Disks/storage and Snapshots components.
 */

import BaseComponent from '@/components/shared/base-component';
import VirtualMachineDetailCdromComponent from '@/components/vm/virtual-machine-detail-cdrom-component';
import { VirtualMachineDetailConfigurationCdromComponent } from '@/components/vm/vm-detail-config-components';
import { DISK_NAMES } from '@/data-models';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class VmSnapshotsComponent extends BaseComponent {
  private readonly _horizontalLinkSnapshots = this.locator(
    '[data-test-id="horizontal-link-Snapshots"]',
  );
  private readonly _nameInput = this.locator('input[id="name"]');
  private readonly _restoreVirtualMachineFromSnapshot = this.locator(
    'text=Restore VirtualMachine from snapshot',
  );
  private readonly _successIcon = this.locator('[data-test="success-icon"]');

  private readonly _takeSnapshotBtn = this.locator('button:has-text("Take snapshot")');

  private readonly _vmDetailSaveButton = this.locator('[data-test="save-button"]');

  private readonly _vmName = this.locator('[data-test-id="virtual-machine-overview-details-name"]');

  readonly _createButton = this.locator(
    'button.pf-v6-c-button.pf-m-primary.pf-m-progress, [data-test="create-button"], button.pf-m-primary:has-text("Create")',
  );

  constructor(page: Page) {
    super(page);
  }

  async cancelRestoreModal(): Promise<void> {
    const cancelButton = this.locator('[data-test="cancel-button"]');
    await cancelButton.waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
    await this.robustClick(cancelButton);
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

  async createVmFromSnapshot(
    snapshotName: string,
    vmName: string,
    startAfterCreation = false,
  ): Promise<boolean> {
    try {
      await this.navigateToSnapshots();

      const snapshotRow = this.locator(`tr:has-text("${snapshotName}")`);
      await snapshotRow.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });

      const actionButton = snapshotRow.locator(
        'button.pf-v6-c-menu-toggle.pf-m-plain, [data-test="kebab-button"], button[aria-label="Actions"], button[aria-label="Kebab toggle"], td:last-child button',
      );
      await actionButton.first().click();

      const createVmItem = this.locator(
        '[role="menuitem"]:has-text("Create VirtualMachine"), button:has-text("Create VirtualMachine")',
      );
      await createVmItem.first().waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      await createVmItem.first().click();

      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);

      const cloneNameInput = this.locator('input[id="clone-name"]');
      await cloneNameInput.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      await cloneNameInput.fill(vmName);

      if (startAfterCreation) {
        const cloneCheckbox = this.locator('input[id="start-clone"]');
        const isChecked = await cloneCheckbox.isChecked();
        if (!isChecked) {
          await cloneCheckbox.click({ force: true });
        }
      }

      const modalSubmit = this.locator('.pf-v6-c-modal-box button.pf-m-primary');
      await modalSubmit.first().click();

      const successAlert = this.locator('.pf-v6-c-modal-box .pf-v6-c-alert.pf-m-success');
      await successAlert.waitFor({ state: 'visible', timeout: TestTimeouts.VM_BOOTUP });

      await modalSubmit.first().click();
      await this.locator('.pf-v6-c-modal-box').waitFor({
        state: 'hidden',
        timeout: TestTimeouts.ELEMENT_WAIT,
      });

      return true;
    } catch {
      return false;
    }
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

  async getFirstSnapshotNameFromSnapshotsTable(
    timeoutMs: number = TestTimeouts.STATUS_VALIDATION,
  ): Promise<string> {
    const nameLink = this.locator('[data-test="vm-snapshot-list"] a').first();
    await nameLink.waitFor({ state: 'visible', timeout: timeoutMs });
    const text = (await nameLink.textContent()) || '';
    return text.trim();
  }

  async isVmNameVisible(
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

  async navigateToSnapshots() {
    await this._horizontalLinkSnapshots.waitFor({
      state: 'visible',
      timeout: TestTimeouts.VM_CREATION,
    });
    await this.robustClick(this._horizontalLinkSnapshots);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
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
        } catch {}
      }

      return { success: true, payload };
    } catch {
      return { success: false };
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

  async verifyNoSnapshots(): Promise<boolean> {
    return await super.verifyTextVisible('No snapshots found');
  }

  async verifyNoSnapshotsFoundInLoadingBox(): Promise<boolean> {
    const emptyHeading = this.locator('[data-test="vm-snapshot-list"] h4');
    await emptyHeading.waitFor({ state: 'visible', timeout: TestTimeouts.STATUS_VALIDATION });
    const text = await emptyHeading.textContent();
    return text?.includes('No snapshots found') ?? false;
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

export class VirtualMachineDetailDisksComponent extends BaseComponent {
  private readonly _addDiskButtonInStorage = this.locator(
    '.kv-configuration-vm-disk-list button:has-text("Add"), [data-test-id="storage-add-button"], button:has-text("Add disk")',
  );
  private readonly _advancedSettingsButton = this.locator('button:has-text("Advanced settings")');
  private readonly _blankDiskOption = this.locator('text=Empty disk (blank)');
  private readonly _configurationStorageSubTab = this.locator(
    '[data-test-id="vm-configuration-storage"]',
  );
  private readonly _configurationTab = this.locator(
    '[data-test-id="horizontal-link-Configuration"]',
  );
  private readonly _detachDisk = this.locator('text=Detach disk?');
  private readonly _diskRowActionsButton = this.locator('button.pf-v6-c-menu-toggle.pf-m-plain');
  private readonly _diskTypeSelect = this.locator('[data-test-id="disk-type-select"]');
  private readonly _diskTypeSelectLun = this.locator('[data-test-id="disk-type-select-lun"]');
  private readonly _h1HasTextEditDisk = this.locator('h1:has-text("Edit Disk")');
  private readonly _inputInput = this.locator('input[aria-label="Input"]');
  private readonly _lunReservation = this.locator('#lun-reservation');
  private readonly _name = this.locator('#name');
  private readonly _persistentHotplugLabel = this.locator(
    '.pf-v6-c-label__content:has-text("Persistent Hotplug")',
  );
  private readonly _roleDialog = this.locator('[role="dialog"]');
  private readonly _storageClassSelect = this.locator('[data-test-id="storage-class-select"]');
  private readonly _windowsDriversCheckbox = this.locator('[data-test-id="cdrom-drivers"]');

  readonly cdrom: VirtualMachineDetailCdromComponent;
  readonly configurationCdrom: VirtualMachineDetailConfigurationCdromComponent;

  constructor(page: Page) {
    super(page);
    this.cdrom = new VirtualMachineDetailCdromComponent(page);
    this.configurationCdrom = new VirtualMachineDetailConfigurationCdromComponent(page);
  }

  private getDiskNameInModal(diskName: string) {
    return this.locator(`strong:has-text("${diskName}")`);
  }

  private getDiskRow(diskName: string) {
    const byTestId = this.locator(
      `tr:has([data-test-id="disk-${diskName}"]), tr:has([data-test-id="${diskName}"])`,
    );
    const byText = this.locator('tr').filter({ hasText: diskName });
    return byTestId.or(byText).first();
  }

  private getStorageClassOption(storageClass: string) {
    return this.locator(`button#select-inline-filter-${storageClass}`);
  }

  private async navigateToConfigurationTab(): Promise<void> {
    await this.navigateToTab(this._configurationTab, TestTimeouts.UI_ACTION_COMPLETE);
  }

  async addBlankDisk(diskName: string, size = '1', storageClass?: string): Promise<boolean> {
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
        (await this.verifyDiskNameExists(diskName)) || (await this.verifyDiskExists(diskName));
      return diskExists;
    } catch {
      return false;
    }
  }

  async addCDROMDisk(
    diskName: string,
    cdromSource: 'Upload new ISO' | 'Use existing ISO' | 'Leave empty drive' = 'Upload new ISO',
    sourceValue?: string,
  ): Promise<boolean> {
    return this.configurationCdrom.addCDROMDisk(diskName, cdromSource, sourceValue);
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

  async createBootableVolumeFromDisk(
    diskName: string,
    bootableVolumeName: string,
  ): Promise<boolean> {
    try {
      await this.navigateToConfigurationStorage();

      const diskRow = this.getDiskRow(diskName);
      await diskRow.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });

      const actionsBtn = diskRow.locator(this._diskRowActionsButton);
      await actionsBtn.waitFor({
        state: 'visible',
        timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
      });
      await this.robustClick(actionsBtn);

      const saveAsBootableVolumeButton = this.locator('button:has-text("Save as bootable volume")');
      await saveAsBootableVolumeButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
      });
      await this.robustClick(saveAsBootableVolumeButton);

      await this.locator('text=Save as bootable volume').waitFor({
        state: 'visible',
        timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
      });

      const bootableVolumeNameInput = this.locator('input#name');
      await bootableVolumeNameInput.waitFor({
        state: 'visible',
        timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
      });
      await bootableVolumeNameInput.clear();
      await bootableVolumeNameInput.fill(bootableVolumeName);

      await this.clickSave();

      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);

      const volumeTitle = this.locator(`text=${bootableVolumeName}`);
      const titleExists = await volumeTitle
        .isVisible({ timeout: TestTimeouts.VM_CREATION })
        .catch(() => false);
      return titleExists;
    } catch {
      return false;
    }
  }

  async detachDisk(diskName: string): Promise<boolean> {
    try {
      await this.navigateToConfigurationStorage();

      const diskRow = this.getDiskRow(diskName);
      await diskRow.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });

      const actionsBtn = diskRow.locator(this._diskRowActionsButton);
      await actionsBtn.waitFor({
        state: 'visible',
        timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
      });
      await this.robustClick(actionsBtn);

      await this.locator('[role="menu"] button', { hasText: 'Detach' }).waitFor({
        state: 'visible',
        timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
      });
      await this.robustClick(this.locator('[role="menu"] button', { hasText: 'Detach' }));

      await this._detachDisk.waitFor({
        state: 'visible',
        timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
      });

      await this.locator('[role="dialog"] [data-test="save-button"]', {
        hasText: 'Detach',
      }).waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this.robustClick(
        this.locator('[role="dialog"] [data-test="save-button"]', { hasText: 'Detach' }),
      );

      await this._detachDisk.waitFor({
        state: 'hidden',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });

      return true;
    } catch {
      return false;
    }
  }

  async ejectCdrom(diskName: string): Promise<boolean> {
    return this.cdrom.ejectCdrom(diskName);
  }

  async ejectCdromByVolumeName(volumeName: string): Promise<boolean> {
    return this.cdrom.ejectCdromByVolumeName(volumeName);
  }

  async getCDROMModalOptions(): Promise<{
    title: string;
    radioLabels: string[];
    defaultSelected: string;
    submitButtonLabel: string;
  }> {
    return this.configurationCdrom.getCDROMModalOptions();
  }

  /**
   * Returns the Drive column value for a disk on Configuration → Storage.
   * Uses data-test-id="disk-drive-{diskName}" selector.
   */
  async getDiskDriveValue(diskName: string): Promise<string | null> {
    try {
      const cell = this.locator(`[data-test-id="disk-drive-${diskName}"]`).first();
      const visible = await cell
        .isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM })
        .catch(() => false);
      if (visible) {
        return (await cell.textContent())?.trim() || null;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Returns the Interface column value for a disk on Configuration → Storage.
   * Uses data-test-id="disk-interface-{diskName}" selector.
   * Returns null if the Interface column doesn't exist in the current UI version.
   */
  async getDiskInterfaceValue(diskName: string): Promise<string | null> {
    try {
      const cell = this.locator(`[data-test-id="disk-interface-${diskName}"]`).first();
      const visible = await cell
        .isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM })
        .catch(() => false);
      if (visible) {
        return (await cell.textContent())?.trim() || null;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Returns the Size column value for a disk on Configuration → Storage.
   * Uses data-test-id="disk-size-{diskName}" selector, falling back to the
   * Size column data-label.
   */
  async getDiskSizeValue(diskName: string): Promise<string | null> {
    try {
      const byTestId = this.locator(`[data-test-id="disk-size-${diskName}"]`).first();
      const visible = await byTestId
        .isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM })
        .catch(() => false);
      if (visible) {
        return (await byTestId.textContent())?.trim() || null;
      }
      const diskRow = this.getDiskRow(diskName);
      const sizeCell = diskRow
        .locator('[data-label="size"], [data-label="Size"], td:nth-child(4)')
        .first();
      const cellVisible = await sizeCell
        .isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM })
        .catch(() => false);
      if (cellVisible) {
        return (await sizeCell.textContent())?.trim() || null;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Opens the Edit Disk modal for a given disk and reads the current size
   * value and unit, then cancels the dialog without saving.
   */
  async getEditDiskModalSizeInfo(diskName: string): Promise<{
    value: string | null;
    unit: string | null;
    decrementDisabled: boolean;
  }> {
    const diskRow = this.getDiskRow(diskName);
    await diskRow.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });

    const actionsBtn = diskRow.locator(this._diskRowActionsButton);
    await actionsBtn.waitFor({
      state: 'visible',
      timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
    });
    await this.robustClick(actionsBtn);

    await this.locator('[role="menu"] button', { hasText: 'Edit' }).waitFor({
      state: 'visible',
      timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
    });
    await this.robustClick(this.locator('[role="menu"] button', { hasText: 'Edit' }));

    await this._h1HasTextEditDisk.waitFor({
      state: 'visible',
      timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
    });

    const editDiskModal = this._roleDialog.filter({ hasText: 'Edit Disk' });
    const sizeInput = editDiskModal
      .locator('input[aria-label="Input"], input[type="number"]')
      .first();
    await sizeInput.waitFor({
      state: 'visible',
      timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
    });

    const value = await sizeInput.inputValue();

    let unit: string | null = null;
    const unitCandidates = editDiskModal.locator('button.pf-v6-c-menu-toggle');
    const candidateCount = await unitCandidates.count();
    for (let i = 0; i < candidateCount; i++) {
      const text = ((await unitCandidates.nth(i).textContent()) ?? '').trim();
      if (/^[KMGT]iB$/i.test(text)) {
        unit = text;
        break;
      }
    }

    const decrementBtn = editDiskModal.locator('button[aria-label="Minus"]').first();
    let decrementDisabled = true;
    const decrementVisible = await decrementBtn
      .isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM })
      .catch(() => false);
    if (decrementVisible) {
      decrementDisabled =
        (await decrementBtn.isDisabled().catch(() => true)) ||
        (await decrementBtn.getAttribute('aria-disabled')) === 'true';
    }

    await this.page.keyboard.press('Escape');
    await this._h1HasTextEditDisk.waitFor({
      state: 'hidden',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });

    return { value, unit, decrementDisabled };
  }

  async getMountCDROMModalOptions(diskName: string): Promise<{
    title: string;
    radioLabels: string[];
    defaultSelected: string;
    hasUploadModeSelector: boolean;
  }> {
    return this.cdrom.getMountCDROMModalOptions(diskName);
  }

  async getVmiDiskColumnValue(
    diskName: string,
    column: 'drive' | 'interface' | 'name' | 'source' | 'size',
  ): Promise<string | null> {
    return this.cdrom.getVmiDiskColumnValue(diskName, column);
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

  async makeDiskPersistent(diskName: string): Promise<boolean> {
    try {
      await this.navigateToConfigurationStorage();

      const diskRow = this.getDiskRow(diskName);
      await diskRow.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });

      const actionsBtn = diskRow.locator(this._diskRowActionsButton);
      await actionsBtn.waitFor({
        state: 'visible',
        timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
      });
      await this.robustClick(actionsBtn);

      const makePersistentItem = this.locator('[role="menu"] button', {
        hasText: 'Make persistent',
      });
      await makePersistentItem.waitFor({
        state: 'visible',
        timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
      });
      await this.robustClick(makePersistentItem);

      const dialog = this.locator('[role="dialog"]:has-text("Make persistent?")');
      await dialog.waitFor({
        state: 'visible',
        timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
      });

      const dialogText = await dialog.textContent();
      if (!dialogText?.includes(diskName)) {
        return false;
      }

      await this.robustClick(dialog.locator('button', { hasText: 'Save' }));

      await dialog.waitFor({ state: 'hidden', timeout: TestTimeouts.UI_ACTION_COMPLETE });

      return true;
    } catch {
      return false;
    }
  }

  async mountCdrom(
    diskName: string,
    source: string,
    sourceType: 'pvc' | 'upload' = 'pvc',
  ): Promise<boolean> {
    return this.cdrom.mountCdrom(diskName, source, sourceType);
  }

  /** Navigate to Configuration → Storage (same UX as VirtualMachineDetailPage). */
  async navigateToConfigurationStorage(): Promise<void> {
    await this.navigateToConfigurationTab();
    await this._configurationStorageSubTab.waitFor({
      state: 'visible',
      timeout: TestTimeouts.VM_CREATION,
    });
    await this.robustClick(this._configurationStorageSubTab);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async navigateToVmiDisksTab(vmName: string, namespace: string): Promise<void> {
    return this.cdrom.navigateToVmiDisksTab(vmName, namespace);
  }

  async resizeDisk(diskName: string, newSize: string): Promise<boolean> {
    try {
      await this.navigateToConfigurationStorage();

      const diskRow = this.getDiskRow(diskName);
      await diskRow.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });

      const actionsBtn = diskRow.locator(this._diskRowActionsButton);
      await actionsBtn.waitFor({
        state: 'visible',
        timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
      });
      await this.robustClick(actionsBtn);

      await this.locator('[role="menu"] button', { hasText: 'Edit' }).waitFor({
        state: 'visible',
        timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
      });
      await this.robustClick(this.locator('[role="menu"] button', { hasText: 'Edit' }));

      await this._h1HasTextEditDisk.waitFor({
        state: 'visible',
        timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
      });

      const editDiskModal = this._roleDialog.filter({ hasText: 'Edit Disk' });
      const sizeInput = editDiskModal
        .locator('input[aria-label="Input"], input[type="number"]')
        .first();
      await sizeInput.waitFor({
        state: 'visible',
        timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
      });
      await sizeInput.dblclick();
      await sizeInput.fill(newSize);

      const advancedVisible = await this._advancedSettingsButton
        .isVisible({ timeout: TestTimeouts.SHORT_WAIT })
        .catch(() => false);
      if (advancedVisible) {
        await this.robustClick(this._advancedSettingsButton);
      }

      await this.clickSaveByTestId();
      await this._h1HasTextEditDisk.waitFor({
        state: 'hidden',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      return true;
    } catch {
      return false;
    }
  }

  async setWindowsDriversOnDiskTab(mount: boolean): Promise<boolean> {
    try {
      await this.navigateToConfigurationStorage();

      await this._windowsDriversCheckbox.waitFor({
        state: 'visible',
        timeout: TestTimeouts.VM_BOOTUP,
      });

      if (mount) {
        await this._windowsDriversCheckbox.check({ force: true });
      } else {
        await this._windowsDriversCheckbox.uncheck({ force: true });
      }

      await this.page.waitForTimeout(TestTimeouts.INSTANCE_TYPE_VERIFICATION);
      return true;
    } catch {
      return false;
    }
  }
  async verifyDiskDoesNotExist(diskName: string): Promise<boolean> {
    try {
      await this.navigateToConfigurationStorage();

      const diskRow = this.getDiskRow(diskName);
      const exists = await diskRow
        .isVisible({ timeout: TestTimeouts.VM_CREATION })
        .catch(() => false);
      return !exists;
    } catch {
      return true; // If we can't find it, that's what we want
    }
  }

  async verifyDiskDoesNotHavePersistentHotplugLabel(diskName: string): Promise<boolean> {
    try {
      await this.navigateToConfigurationStorage();

      const diskRow = this.getDiskRow(diskName);
      await diskRow.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });

      const persistentLabel = diskRow.locator(this._persistentHotplugLabel);
      return !(await persistentLabel
        .isVisible({ timeout: TestTimeouts.UI_DELAY_LONG })
        .catch(() => false));
    } catch {
      return true; // If label doesn't exist, that's what we want
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

  async verifyDiskHasAutoDetachHotplugLabel(diskName: string): Promise<boolean> {
    try {
      await this.navigateToConfigurationStorage();

      const diskRow = this.getDiskRow(diskName);
      await diskRow.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });

      const autoDetachLabel = diskRow.locator(
        this.locator('.pf-v6-c-label__content:has-text("AutoDetach Hotplug")'),
      );
      return await autoDetachLabel
        .isVisible({ timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION })
        .catch(() => false);
    } catch {
      return false;
    }
  }

  async verifyDiskHasPersistentHotplugLabel(diskName: string): Promise<boolean> {
    try {
      await this.navigateToConfigurationStorage();

      const diskRow = this.getDiskRow(diskName);
      await diskRow.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });

      const persistentLabel = diskRow.locator(this._persistentHotplugLabel);
      return await persistentLabel
        .isVisible({ timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION })
        .catch(() => false);
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

  async verifyDiskSource(diskName: string, expectedSource: string): Promise<boolean> {
    try {
      const diskRow = this.locator('tr', { hasText: diskName }).first();
      const labeled = diskRow.locator('[data-label="source"], [data-label="Source"]');
      const hasLabeled = await labeled
        .first()
        .isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM })
        .catch(() => false);

      if (hasLabeled) {
        await expect(labeled.first()).toContainText(expectedSource, {
          timeout: TestTimeouts.DEFAULT,
        });
        return true;
      }

      const rowText = await diskRow.textContent();
      return rowText?.includes(expectedSource) ?? false;
    } catch (error) {
      console.error(
        `Failed to verify disk source for ${diskName}. Expected: ${expectedSource}`,
        error,
      );
      return false;
    }
  }

  /**
   * Verify that a disk source value appears in the UI Source column.
   * For DataVolumes: matches "DV <dvName>" or just "<dvName>"
   * For Ephemeral: matches "Container (Ephemeral)" or "Ephemeral"
   * @param sourceValue The source value from Kubernetes (DV name or "Ephemeral")
   * @returns true if the source value is found in the UI
   */
  async verifyDiskSourceVisible(sourceValue: string): Promise<boolean> {
    try {
      await this.navigateToConfigurationStorage();
      const sourceLocators = this.locator('[data-label="source"], [data-label="Source"]');
      const count = await sourceLocators.count();

      if (count === 0) {
        const allRows = this.locator('table tbody tr');
        const rowCount = await allRows.count();
        for (let i = 0; i < rowCount; i++) {
          const rowText = await allRows.nth(i).textContent();
          if (rowText?.includes(sourceValue) || rowText?.includes(`DV ${sourceValue}`)) {
            return true;
          }
        }
        return false;
      }

      for (let i = 0; i < count; i++) {
        const sourceText = await sourceLocators.nth(i).textContent();
        if (sourceText) {
          const trimmedSource = sourceText.trim();

          if (sourceValue !== 'Ephemeral') {
            if (
              trimmedSource.includes(sourceValue) ||
              trimmedSource.includes(`DV ${sourceValue}`)
            ) {
              const sourceElement = sourceLocators.nth(i);
              const row = sourceElement.locator('xpath=ancestor::tr');
              const rowExists = await row
                .isVisible({ timeout: TestTimeouts.UI_DELAY_EXTRA })
                .catch(() => false);
              if (rowExists) {
                const dataTestId = await row
                  .locator('[data-test-id]')
                  .first()
                  .getAttribute('data-test-id')
                  .catch(() => null);
                return dataTestId !== null;
              }
            }
          } else {
            if (trimmedSource.includes('Ephemeral') || trimmedSource.includes('Container')) {
              const sourceElement = sourceLocators.nth(i);
              const row = sourceElement.locator('xpath=ancestor::tr');
              const rowExists = await row
                .isVisible({ timeout: TestTimeouts.UI_DELAY_EXTRA })
                .catch(() => false);
              if (rowExists) {
                const dataTestId = await row
                  .locator('[data-test-id]')
                  .first()
                  .getAttribute('data-test-id')
                  .catch(() => null);
                return dataTestId !== null;
              }
            }
          }
        }
      }
      return false;
    } catch {
      return false;
    }
  }

  async verifyUploadNewISOHasNoUploadModeSelector(): Promise<boolean> {
    return this.configurationCdrom.verifyUploadNewISOHasNoUploadModeSelector();
  }

  async verifyWindowsDriversCheckbox(shouldBeChecked: boolean): Promise<boolean> {
    try {
      await this.navigateToConfigurationStorage();
      await this._windowsDriversCheckbox.waitFor({
        state: 'visible',
        timeout: TestTimeouts.VM_BOOTUP,
      });
      const isChecked = await this._windowsDriversCheckbox.isChecked().catch(() => false);
      return isChecked === shouldBeChecked;
    } catch {
      return false;
    }
  }

  async verifyWindowsDriversDisk(shouldExist: boolean): Promise<boolean> {
    try {
      await this.navigateToConfigurationStorage();

      const exists = await this.locator('tr:has-text("windows-drivers-disk")')
        .isVisible({ timeout: TestTimeouts.VM_CREATION })
        .catch(() => false);
      return exists === shouldExist;
    } catch {
      return !shouldExist; // If we can't find it and we expect it not to exist, return true
    }
  }
}
