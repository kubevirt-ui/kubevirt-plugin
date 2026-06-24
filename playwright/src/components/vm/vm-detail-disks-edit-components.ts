import BaseComponent from '@/components/shared/base-component';
import KebabMenuComponent from '@/components/shared/kebab-menu-component';
import { VmDiskFormComponent } from '@/components/vm/vm-detail-disks-form-snapshots-components';
import { DISK_NAMES } from '@/data-models';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

export class VmDetailDisksEditComponent extends BaseComponent {
  readonly kebab: KebabMenuComponent;
  private readonly _h1HasTextEditDisk = this.locator('h1:has-text("Edit Disk")');
  private readonly _roleDialog = this.locator('[role="dialog"]');

  constructor(page: Page) {
    super(page);
    this.kebab = new KebabMenuComponent(page);
  }

  async getEditDiskModalSizeInfo(
    diskName: string,
    navigateToStorage: () => Promise<void>,
  ): Promise<{
    value: null | string;
    unit: null | string;
    decrementDisabled: boolean;
  }> {
    await navigateToStorage();

    const diskRow = this.locator(
      `tr:has([data-test-id="disk-${diskName}"]), tr:has([data-test-id="${diskName}"])`,
    );
    await diskRow.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });

    await this.kebab.openKebabForRow(diskRow);
    await this.kebab.clickMenuItemByText('Edit');

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

    let unit: null | string = null;
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
}

export class VmDetailDisksOperationsComponent extends BaseComponent {
  private readonly _edit: VmDetailDisksEditComponent;
  private readonly _diskForm: VmDiskFormComponent;
  readonly kebab: KebabMenuComponent;
  private readonly _configurationTab = this.locator(
    '[data-test-id="horizontal-link-Configuration"]',
  );
  private readonly _configurationStorageSubTab = this.locator(
    '[data-test-id="vm-configuration-storage"]',
  );
  private readonly _windowsDriversCheckbox = this.locator('[data-test-id="cdrom-drivers"]');
  private readonly _persistentHotplugLabel = this.locator(
    '.pf-v6-c-label__content:has-text("Persistent Hotplug")',
  );
  private readonly _advancedSettingsButton = this.locator('button:has-text("Advanced settings")');
  private readonly _detachDisk = this.locator('text=Detach disk?');
  private readonly _h1HasTextEditDisk = this.locator('h1:has-text("Edit Disk")');
  private readonly _roleDialog = this.locator('[role="dialog"]');

  constructor(page: Page) {
    super(page);
    this._edit = new VmDetailDisksEditComponent(page);
    this._diskForm = new VmDiskFormComponent(page);
    this.kebab = new KebabMenuComponent(page);
  }

  private async navigateToConfigurationTab(): Promise<void> {
    await this.navigateToTab(this._configurationTab, TestTimeouts.UI_ACTION_COMPLETE);
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

  private getDiskRow(diskName: string) {
    return this.locator(
      `tr:has([data-test-id="disk-${diskName}"]), tr:has([data-test-id="${diskName}"])`,
    );
  }

  async addLUNDisk(diskName: string = DISK_NAMES.LUN_DISK): Promise<string> {
    return this._diskForm.addLUNDisk(diskName);
  }

  async addShareableDisk(diskName: string = DISK_NAMES.SHAREABLE_DISK): Promise<string> {
    return this._diskForm.addShareableDisk(diskName);
  }

  async addBlankDisk(
    diskName: string,
    size = '1',
    storageClass?: string,
    verifyDiskNameExists?: (diskName: string) => Promise<boolean>,
    verifyDiskExists?: (diskName: string) => Promise<boolean>,
  ): Promise<boolean> {
    const verify = {
      verifyDiskNameExists: verifyDiskNameExists ?? (() => Promise.resolve(false)),
      verifyDiskExists: verifyDiskExists ?? (() => Promise.resolve(false)),
    };
    return this._diskForm.addBlankDisk(diskName, verify, size, storageClass);
  }

  async makeDiskPersistent(diskName: string): Promise<boolean> {
    try {
      await this.navigateToConfigurationStorage();

      const diskRow = this.getDiskRow(diskName);
      await diskRow.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });

      await this.kebab.openKebabForRow(diskRow);
      await this.kebab.clickMenuItemByText('Make persistent');

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
      return true;
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
      return !shouldExist;
    }
  }

  async createBootableVolumeFromDisk(
    diskName: string,
    bootableVolumeName: string,
  ): Promise<boolean> {
    try {
      await this.navigateToConfigurationStorage();

      const diskRow = this.getDiskRow(diskName);
      await diskRow.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });

      await this.kebab.openKebabForRow(diskRow);
      await this.kebab.clickMenuItemByText('Save as bootable volume');

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

      await this.kebab.openKebabForRow(diskRow);
      await this.kebab.clickMenuItemByText('Detach');

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

  async verifyDiskDoesNotExist(diskName: string): Promise<boolean> {
    try {
      await this.navigateToConfigurationStorage();

      const diskRow = this.getDiskRow(diskName);
      const exists = await diskRow
        .isVisible({ timeout: TestTimeouts.VM_CREATION })
        .catch(() => false);
      return !exists;
    } catch {
      return true;
    }
  }

  async resizeDisk(diskName: string, newSize: string): Promise<boolean> {
    try {
      await this.navigateToConfigurationStorage();

      const diskRow = this.getDiskRow(diskName);
      await diskRow.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });

      await this.kebab.openKebabForRow(diskRow);
      await this.kebab.clickMenuItemByText('Edit');

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

  async getEditDiskModalSizeInfo(diskName: string): Promise<{
    value: null | string;
    unit: null | string;
    decrementDisabled: boolean;
  }> {
    return this._edit.getEditDiskModalSizeInfo(diskName, () =>
      this.navigateToConfigurationStorage(),
    );
  }
}

export class VmDetailConfigurationStorageComponent extends BaseComponent {
  private readonly _configurationTab = this.locator(
    '[data-test-id="horizontal-link-Configuration"]',
  );
  private readonly _configurationStorageSubTab = this.locator(
    '[data-test-id="vm-configuration-storage"]',
  );
  private readonly _dataVolumeDetails = this.locator('text=DataVolume details');

  constructor(page: Page) {
    super(page);
  }

  private async navigateToConfigurationTab(): Promise<void> {
    await this.navigateToTab(this._configurationTab, TestTimeouts.UI_ACTION_COMPLETE);
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

  async clickConfigurationStorageSubTab(): Promise<void> {
    await this._configurationStorageSubTab.waitFor({
      state: 'visible',
      timeout: TestTimeouts.VM_CREATION,
    });
    await this.robustClick(this._configurationStorageSubTab);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
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

  async verifyDiskExistsByDataTestId(diskName: string): Promise<boolean> {
    try {
      const diskLocator = this.locator(`[data-test-id*="${diskName}"]`);
      await diskLocator.waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_EXTRA });
      return true;
    } catch {
      return false;
    }
  }

  async verifyDiskRowVisibleByExactDataTestId(dataTestId: string): Promise<boolean> {
    try {
      await this.navigateToConfigurationStorage();
      const diskLocator = this.locator(`[data-test-id="${dataTestId}"]`);
      await diskLocator.waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_EXTRA });
      return true;
    } catch {
      return false;
    }
  }

  async verifyDiskExistsByDataTest(diskName: string): Promise<boolean> {
    try {
      const diskLocator = this.locator(`[data-test*="${diskName}"]`);
      await diskLocator.waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_EXTRA });
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

  async verifyDiskExistsByDataTestIdPattern(vmName: string, diskName: string): Promise<boolean> {
    try {
      await this.navigateToConfigurationStorage();
      const expectedDataTestId = `dv-${vmName}-${diskName}-k8ntab`;
      const diskLocator = this.locator(`[data-test-id="${expectedDataTestId}"]`);
      await diskLocator.waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_EXTRA });
      return true;
    } catch {
      return false;
    }
  }

  async verifyDiskSourceByDataTestId(vmName: string, diskName: string): Promise<boolean> {
    try {
      await this.navigateToConfigurationStorage();
      const expectedDataTestId = `dv-${vmName}-${diskName}-k8ntab`;
      const diskLocator = this.locator(`[data-test-id="${expectedDataTestId}"]`);
      await diskLocator.waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_EXTRA });
      return true;
    } catch {
      return false;
    }
  }

  async clickPvcLink(volumeName: string): Promise<boolean> {
    try {
      await this.navigateToConfigurationStorage();
      const pvcLink = this.locator(`a[data-test-id="${volumeName}"]`);
      await pvcLink.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
      await this.robustClick(pvcLink);
      return true;
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
}
