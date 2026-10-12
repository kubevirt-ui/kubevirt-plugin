import BaseComponent from '@/components/shared/base-component';
import { TestTimeouts } from '@/utils/test-config';
import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

export default class VmActionsStorageMigrationComponent extends BaseComponent {
  private readonly _btnPlaceholderSelectStorageClass = this.locator(
    'button[placeholder="Select StorageClass"]',
  );
  private readonly _migrationModal = this.locator('#virtual-machine-migration-modal');
  private readonly _buttonpfV6CButtonpfMPrimary = this._migrationModal.locator(
    'button.pf-v6-c-button.pf-m-primary',
  );
  private readonly _buttonpfV6CButtonpfMSecondary = this._migrationModal.locator(
    'button.pf-v6-c-button.pf-m-secondary',
  );
  private readonly _inputIdSelectedVolumes = this.locator('input[id="selected-volumes"]');
  private readonly _migrateStorageAction = this.testId('vm-action-migrate-storage');
  private readonly _migrationMenuItem = this.testId('migration-menu');
  private readonly _selectAllRows = this.locator('[aria-label="Select all rows"]');
  private readonly _trDataOuiaComponentTypePF6TableRow = this.locator(
    'tr[data-ouia-component-type="PF6/TableRow"]',
  );

  constructor(page: Page) {
    super(page);
  }

  private async clickKebabInVmRow(vmRow: Locator): Promise<void> {
    const primary = vmRow.getByTestId('kebab-button');
    const fallback = vmRow.locator('[data-test-id="kebab-button"]');
    const primaryVisible = await primary
      .isVisible({ timeout: TestTimeouts.UI_DELAY_SHORT })
      .catch(() => false);
    const target = primaryVisible ? primary : fallback;
    await target.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(target);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async clickBulkMigrateStorage(): Promise<void> {
    await this.robustClick(this.testId('vms-bulk-migrate-storage'));
  }

  async clickSelectedVolumesRadio(): Promise<void> {
    const selectedVolumesOption = this._inputIdSelectedVolumes;
    await selectedVolumesOption.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await selectedVolumesOption.click();
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  }

  async closeMigrationModal(): Promise<void> {
    const closeButton = this._migrationModal.locator('.pf-v6-c-wizard__close');
    await closeButton.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(closeButton);
    await this._migrationModal.waitFor({ state: 'hidden', timeout: TestTimeouts.ELEMENT_WAIT });
  }

  async completeMigrationWizardWithStorageClass(
    destinationStorageClass: string,
    migrationCompletionTimeoutMs: number = TestTimeouts.MIGRATION_COMPLETION,
    keepOriginalVolumes = false,
  ): Promise<boolean> {
    try {
      const migrationModal = this.locator('#virtual-machine-migration-modal');
      const nextButton = this._buttonpfV6CButtonpfMPrimary;

      await nextButton.click();
      await this.page.waitForTimeout(TestTimeouts.UI_STABILIZE);

      const selectSCButton = this._btnPlaceholderSelectStorageClass;
      await selectSCButton.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      await this.robustClick(selectSCButton);
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

      const scOption = this.locator(`button#select-inline-filter-${destinationStorageClass}`);
      await scOption.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      await this.robustClick(scOption);
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

      const keepVolumesCheckbox = migrationModal.locator('#keep-original-volumes');
      const isChecked = await keepVolumesCheckbox.isChecked();
      if (keepOriginalVolumes !== isChecked) {
        await keepVolumesCheckbox.click({ force: true });
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      }

      await nextButton.click();
      await this.page.waitForTimeout(TestTimeouts.UI_STABILIZE);

      await nextButton.click();

      const inProgress = migrationModal.locator('text=In progress').first();
      await inProgress.waitFor({ state: 'visible', timeout: TestTimeouts.BULK_VM_OPERATION });

      const completed = migrationModal.locator('text=Storage migration completed').first();
      await completed.waitFor({ state: 'visible', timeout: migrationCompletionTimeoutMs });

      const closeButton = this.locator('[id="virtual-machine-migration-modal"] button', {
        hasText: 'Close',
      });
      await closeButton.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      await this.robustClick(closeButton);

      return true;
    } catch {
      try {
        const cancelOrClose = this.locator(
          '#virtual-machine-migration-modal button:has-text("Cancel"), #virtual-machine-migration-modal button:has-text("Close"), .pf-v6-c-wizard__close',
        ).first();
        if (
          await cancelOrClose.isVisible({ timeout: TestTimeouts.SHORT_WAIT }).catch(() => false)
        ) {
          await this.robustClick(cancelOrClose);
          await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
        }
      } catch {}
      return false;
    }
  }

  async isMigrateStorageActionEnabled(vmName: string): Promise<boolean> {
    try {
      const vmRow = this._trDataOuiaComponentTypePF6TableRow.filter({
        has: this.testId(vmName),
      });
      await vmRow.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      await this.clickKebabInVmRow(vmRow);
      const isMigrationVisible = await this._migrationMenuItem.isVisible({
        timeout: TestTimeouts.UI_DELAY_LONG,
      });
      if (!isMigrationVisible) {
        return false;
      }
      await this._migrationMenuItem.click();
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

      const migrateStorage = this._migrateStorageAction;
      const isVisible = await migrateStorage.isVisible({ timeout: TestTimeouts.UI_DELAY_LONG });
      if (!isVisible) {
        return false;
      }
      const isDisabled = await migrateStorage.isDisabled();
      return !isDisabled;
    } catch {
      return false;
    } finally {
      await this.page.keyboard.press('Escape');
      await this.page.keyboard.press('Escape');
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    }
  }

  async isWizardNavStepDisabled(stepName: string): Promise<boolean> {
    const navLink = this._migrationModal
      .locator('.pf-v6-c-wizard__nav-link')
      .filter({ hasText: stepName });
    await navLink.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    return await navLink.isDisabled();
  }

  async openStorageMigrationModal(vmName: string, assertNextEnabled = true): Promise<void> {
    const vmRow = this._trDataOuiaComponentTypePF6TableRow.filter({
      has: this.testId(vmName),
    });
    await vmRow.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.clickKebabInVmRow(vmRow);
    const migrationMenu = this.testId('migration-menu');
    await migrationMenu.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(migrationMenu);

    const migrateStorage = this._migrateStorageAction;
    await migrateStorage.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(migrateStorage);

    await this._migrationModal.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });

    const nextButton = this._migrationModal.locator('button.pf-v6-c-button.pf-m-primary');
    await nextButton.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    if (assertNextEnabled) {
      await expect(nextButton).toBeEnabled({ timeout: TestTimeouts.DEFAULT });
    }
  }

  async performBulkStorageClassMigration(destinationStorageClass: string): Promise<boolean> {
    try {
      await this.clickBulkMigrateStorage();

      const migrationModal = this.locator('#virtual-machine-migration-modal');
      await migrationModal.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });

      const nextButton = this._buttonpfV6CButtonpfMPrimary;
      await nextButton.click();
      await this.page.waitForTimeout(TestTimeouts.UI_STABILIZE);

      const backButton = this._buttonpfV6CButtonpfMSecondary;
      await backButton.click();
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

      await nextButton.click();
      await this.page.waitForTimeout(TestTimeouts.UI_STABILIZE);

      const selectSCButton = this._btnPlaceholderSelectStorageClass;
      await selectSCButton.click();
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

      const scOption = this.locator(`button#select-inline-filter-${destinationStorageClass}`);
      await scOption.click();
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

      await nextButton.click();
      await this.page.waitForTimeout(TestTimeouts.UI_STABILIZE);

      await nextButton.click();

      const inProgress = this.locator('text=In progress');
      await inProgress.waitFor({ state: 'visible', timeout: TestTimeouts.BULK_VM_OPERATION });

      const completed = migrationModal.locator('text=Migration completed successfully');
      await completed.waitFor({ state: 'visible', timeout: TestTimeouts.MIGRATION_COMPLETION });

      const closeButton = this.locator('.pf-v6-c-wizard__close');
      await closeButton.click();

      return true;
    } catch {
      return false;
    }
  }

  async performStorageClassMigration(
    vmName: string,
    destinationStorageClass: string,
    selectedVolumes = false,
    migrationCompletionTimeoutMs: number = TestTimeouts.MIGRATION_COMPLETION,
    keepOriginalVolumes = false,
  ): Promise<boolean> {
    try {
      const vmRow = this._trDataOuiaComponentTypePF6TableRow.filter({
        has: this.testId(vmName),
      });
      await vmRow.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      await this.clickKebabInVmRow(vmRow);

      const migrationMenu = this.testId('migration-menu');
      await migrationMenu.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      await this.robustClick(migrationMenu);

      const migrateStorage = this._migrateStorageAction;
      await migrateStorage.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      await this.robustClick(migrateStorage);

      const migrationModal = this.locator('#virtual-machine-migration-modal');
      await migrationModal.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });

      if (selectedVolumes) {
        const selectedVolumesOption = this._inputIdSelectedVolumes;
        await selectedVolumesOption.waitFor({
          state: 'visible',
          timeout: TestTimeouts.ELEMENT_WAIT,
        });
        await selectedVolumesOption.click();
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

        const selectAllRows = this._selectAllRows;
        await selectAllRows.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
        await selectAllRows.click({ force: true });
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      }

      const nextButton = this._buttonpfV6CButtonpfMPrimary;
      await nextButton.click();
      await this.page.waitForTimeout(TestTimeouts.UI_STABILIZE);

      const backButton = this._buttonpfV6CButtonpfMSecondary;

      await backButton.click();
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

      await nextButton.click();
      await this.page.waitForTimeout(TestTimeouts.UI_STABILIZE);

      await backButton.click();
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

      return await this.completeMigrationWizardWithStorageClass(
        destinationStorageClass,
        migrationCompletionTimeoutMs,
        keepOriginalVolumes,
      );
    } catch {
      return false;
    }
  }

  async selectAllVolumesInMigrationModal(): Promise<void> {
    const selectAllRows = this._selectAllRows;
    await selectAllRows.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await selectAllRows.click({ force: true });
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  }

  async startStorageMigrationAndCancelWhileInProgress(vmName: string): Promise<void> {
    const vmRow = this._trDataOuiaComponentTypePF6TableRow.filter({
      has: this.testId(vmName),
    });
    await vmRow.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.clickKebabInVmRow(vmRow);

    const migrationMenu = this.testId('migration-menu');
    await migrationMenu.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(migrationMenu);

    const migrateStorage = this._migrateStorageAction;
    await migrateStorage.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(migrateStorage);

    await this._migrationModal.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });

    const nextButton = this._buttonpfV6CButtonpfMPrimary;

    await nextButton.click();
    await this.page.waitForTimeout(TestTimeouts.UI_STABILIZE);

    const selectSCButton = this._migrationModal.locator(
      'button.pf-v6-c-menu-toggle.pf-m-full-width',
    );
    await selectSCButton.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(selectSCButton);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    const allScOptions = this.locator('button[id^="select-inline-filter-"]');
    await allScOptions.first().waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    const count = await allScOptions.count();

    let validScFound = false;
    for (let i = 0; i < count; i++) {
      await this.robustClick(allScOptions.nth(i));
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

      const enabled = await nextButton
        .isEnabled({ timeout: TestTimeouts.SHORT_WAIT })
        .catch(() => false);
      if (enabled) {
        validScFound = true;
        break;
      }

      await this.robustClick(selectSCButton);
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    }

    if (!validScFound) {
      throw new Error(
        'startStorageMigrationAndCancelWhileInProgress: all available StorageClasses match the source — cannot start migration',
      );
    }

    await nextButton.click();
    await this.page.waitForTimeout(TestTimeouts.UI_STABILIZE);

    await nextButton.click();

    const inProgress = this._migrationModal.locator('text=In progress').first();
    await inProgress.waitFor({ state: 'visible', timeout: TestTimeouts.BULK_VM_OPERATION });

    const cancelButton = this._migrationModal.locator('button:has-text("Cancel")').first();
    await cancelButton.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(cancelButton);

    await this._migrationModal.waitFor({ state: 'hidden', timeout: TestTimeouts.DEFAULT });
  }

  async triggerStorageMigration(
    vmName: string,
    destinationStorageClass: string,
    selectedVolumes = false,
    keepOriginalVolumes = false,
  ): Promise<void> {
    const vmRow = this._trDataOuiaComponentTypePF6TableRow.filter({
      has: this.testId(vmName),
    });
    await vmRow.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.clickKebabInVmRow(vmRow);

    const migrationMenu = this.testId('migration-menu');
    await migrationMenu.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(migrationMenu);

    const migrateStorage = this._migrateStorageAction;
    await migrateStorage.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(migrateStorage);

    const migrationModal = this.locator('#virtual-machine-migration-modal');
    await migrationModal.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });

    if (selectedVolumes) {
      const selectedVolumesOption = this._inputIdSelectedVolumes;
      await selectedVolumesOption.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      await selectedVolumesOption.click();
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

      const selectAllRows = this._selectAllRows;
      await selectAllRows.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      await selectAllRows.click({ force: true });
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    }

    const nextButton = this._buttonpfV6CButtonpfMPrimary;
    await nextButton.click();
    await this.page.waitForTimeout(TestTimeouts.UI_STABILIZE);

    const selectSCButton = migrationModal.locator('button.pf-v6-c-menu-toggle.pf-m-full-width');
    await selectSCButton.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(selectSCButton);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    const scOption = this.locator(`button#select-inline-filter-${destinationStorageClass}`);
    await scOption.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(scOption);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    const keepVolumesCheckbox = migrationModal.locator('#keep-original-volumes');
    const isChecked = await keepVolumesCheckbox.isChecked();
    if (keepOriginalVolumes !== isChecked) {
      await keepVolumesCheckbox.click({ force: true });
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    }

    await nextButton.click();
    await this.page.waitForTimeout(TestTimeouts.UI_STABILIZE);

    await nextButton.click();

    const inProgress = migrationModal.locator('text=In progress').first();
    await inProgress.waitFor({ state: 'visible', timeout: TestTimeouts.BULK_VM_OPERATION });

    const closeButton = this.locator('.pf-v6-c-wizard__close');
    await closeButton.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(closeButton);
    await migrationModal.waitFor({ state: 'hidden', timeout: TestTimeouts.ELEMENT_WAIT });
  }

  async waitForStorageClassMigrationCompletion(): Promise<boolean> {
    try {
      const completed = this._migrationModal.locator('text=Migration completed successfully');
      await completed.waitFor({ state: 'visible', timeout: TestTimeouts.MIGRATION_COMPLETION });

      return true;
    } catch {
      return false;
    }
  }
}
