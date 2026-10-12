import VmActionsStorageMigrationComponent from '@/components/vm/vm-actions-storage-migration-component';
import PageCommons from '@/page-objects/page-commons';
import { TestTimeouts } from '@/utils/test-config';
import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

export default class VmActionsComponent extends PageCommons {
  private readonly _controlMenu = this.testId('control-menu');

  private readonly _dialogModal = this.testId('dialog-modal');
  private readonly _inputIdName = this.locator('input[id="name"]');
  private readonly _inputPlaceholderSearchFolder = this.locator(
    'input[placeholder="Search group"]',
  );
  private readonly _kebabButton = this.testId('kebab-button');
  private readonly _migrateStorageAction = this.testId('vm-action-migrate-storage');
  private readonly _migrateVirtualMachineBtn = this.locator(
    'button:has-text("Migrate VirtualMachine")',
  );
  private readonly _migrationMenuItem = this.testId('migration-menu');
  private readonly _migrationModal = this.locator('#virtual-machine-migration-modal');
  private readonly _nodeSearchInput = this.locator('input[placeholder="Search node"]');
  private readonly _specificNodeCheckbox = this.locator('#manual-migration-option-selection');
  private readonly _startClone = this.locator('#start-clone');
  private readonly _tagItemContent = this.locator('.tag-item-content');
  private readonly _trDataOuiaComponentTypePF6TableRow = this.locator(
    'tr[data-ouia-component-type="PF6/TableRow"]',
  );
  private readonly _vmActionBulkMigration = this.testId('bulk-migration-actions');
  private readonly _vmActionOpenConsole = this.testId('vm-action-open-console');
  private readonly _vmListSaveButton = this.testId('save-button');
  readonly storageMigration: VmActionsStorageMigrationComponent;

  constructor(page: Page) {
    super(page);
    this.storageMigration = new VmActionsStorageMigrationComponent(page);
  }

  private async _clickBulkVmActionItem(
    action:
      | 'start'
      | 'restart'
      | 'reset'
      | 'stop'
      | 'pause'
      | 'unpause'
      | 'snapshot'
      | 'bulk-migration'
      | 'migrate-compute'
      | 'migrate-storage'
      | 'move-to-folder'
      | 'edit-labels'
      | 'delete',
  ): Promise<void> {
    switch (action) {
      case 'stop':
        await this.robustClick(this._vmActionStop);
        break;
      case 'pause':
        await this.robustClick(this._vmActionPauseButton);
        break;
      case 'unpause':
        await this.robustClick(this._vmActionUnpauseButton);
        break;
      case 'restart':
        await this.robustClick(this._vmActionRestart);
        break;
      case 'reset':
        await this.robustClick(this._vmActionReset);
        break;
      case 'move-to-folder':
        await this.robustClick(this._vmActionMoveToFolder);
        break;
      case 'edit-labels':
        await this.robustClick(this._vmActionEditLabels);
        break;
      case 'delete':
        await this.robustClick(this._vmActionDelete);
        break;
      case 'start':
        await this.robustClick(this._vmActionStart);
        break;
      case 'bulk-migration':
        await this.robustClick(this._vmActionBulkMigration);
        break;
      case 'migrate-compute':
        await this.robustClick(this._vmActionMigrateCompute);
        break;
      case 'migrate-storage':
        await this.robustClick(this._migrateStorageAction);
        break;
      case 'snapshot':
        await this.robustClick(this._vmActionSnapshot);
        break;
      default:
        throw new Error(`Unknown bulk VM action: ${action}`);
    }
  }

  private async _clickVmActionItem(
    action:
      | 'start'
      | 'restart'
      | 'stop'
      | 'pause'
      | 'unpause'
      | 'bulk-migration'
      | 'move-to-folder'
      | 'edit-labels'
      | 'delete',
  ): Promise<void> {
    switch (action) {
      case 'start':
        await this.robustClick(this.testId('selected-vms-action-start'));
        break;
      case 'restart':
        await this.robustClick(this.testId('selected-vms-action-restart'));
        break;
      case 'stop':
        await this.robustClick(this.testId('selected-vms-action-stop'));
        break;
      case 'pause':
        await this.robustClick(this.testId('selected-vms-action-pause'));
        break;
      case 'unpause':
        await this.robustClick(this.testId('selected-vms-action-unpause'));
        break;
      case 'bulk-migration':
        await this.robustClick(this._vmActionBulkMigration);
        break;
      case 'move-to-folder':
        await this.robustClick(this._vmActionMoveToFolder);
        break;
      case 'edit-labels':
        await this.robustClick(this.testId('selected-vms-action-edit-labels'));
        break;
      case 'delete':
        await this.robustClick(this._vmActionDelete);
        break;
      default:
        throw new Error(`Unknown VM action: ${action}`);
    }
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
    return this.storageMigration.clickBulkMigrateStorage();
  }

  override async clickDeleteConfirmationButton(): Promise<void> {
    await super.clickDeleteConfirmationButton();
  }

  async clickFolderOption(folderName: string): Promise<void> {
    const existingFolderOption = this.locator(`#select-typeahead-${folderName}`);
    const exists = await existingFolderOption.isVisible().catch(() => false);

    if (exists) {
      await this.robustClick(existingFolderOption);
    } else {
      const createFolderOption = this.page.getByText(`Create group "${folderName}"`);
      await this.robustClick(createFolderOption);
    }
  }

  override async clickKebabButton(): Promise<void> {
    await this._kebabButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await this.robustClick(this._kebabButton);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async clickKebabButtonForVm(vmName: string): Promise<void> {
    const vmRow = this._trDataOuiaComponentTypePF6TableRow.filter({
      has: this.testId(vmName),
    });
    await vmRow.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.clickKebabInVmRow(vmRow);
  }

  async clickMigrateConfirmationButton(): Promise<void> {
    await this.robustClick(this.locator('button.pf-v6-c-button.pf-m-primary:has-text("Migrate")'));
  }

  async clickPauseConfirmationButton(): Promise<void> {
    await this.robustClick(this.locator('button.pf-v6-c-button.pf-m-primary:has-text("Pause")'));
  }

  async clickSelectedVolumesRadio(): Promise<void> {
    return this.storageMigration.clickSelectedVolumesRadio();
  }

  async clickVmAction(
    action:
      | 'start'
      | 'restart'
      | 'stop'
      | 'pause'
      | 'unpause'
      | 'bulk-migration'
      | 'move-to-folder'
      | 'edit-labels'
      | 'delete',
  ): Promise<void> {
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);
    await this.openVmActionsDropdown();
    await this._clickVmActionItem(action);
  }

  async clickVmActionByMenuButton(
    action:
      | 'start'
      | 'restart'
      | 'reset'
      | 'stop'
      | 'pause'
      | 'unpause'
      | 'snapshot'
      | 'bulk-migration'
      | 'migrate-compute'
      | 'migrate-storage'
      | 'move-to-folder'
      | 'edit-labels'
      | 'delete',
  ): Promise<void> {
    await this._vmActionsDropdown.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(this._vmActionsDropdown);

    const controlActions = ['start', 'stop', 'pause', 'unpause', 'restart', 'reset'];
    if (controlActions.includes(action)) {
      const bulkControlMenuButton = this._controlMenu;
      await bulkControlMenuButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await bulkControlMenuButton.hover();
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    }

    const migrateActions = ['bulk-migration', 'migrate-compute', 'migrate-storage'];
    if (migrateActions.includes(action)) {
      const migrateMenuButton = this.testId('migration-menu');
      await migrateMenuButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await migrateMenuButton.hover();
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    }

    await this._clickBulkVmActionItem(action);
  }

  async clickVmActionOpenConsole(): Promise<void> {
    await this._vmActionOpenConsole.waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await this.robustClick(this._vmActionOpenConsole);
  }

  async clickVmActionOpenConsoleAndCaptureNewTab(closeTab = true): Promise<string> {
    const newPagePromise = this.page.context().waitForEvent('page');

    await this._vmActionOpenConsole.waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await this.robustClick(this._vmActionOpenConsole);

    const newPage = await newPagePromise;

    await newPage.waitForLoadState('domcontentloaded');

    await newPage
      .locator('.console-container')
      .waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });

    const newTabUrl = newPage.url();

    if (closeTab) {
      await newPage.close();
    }

    return newTabUrl;
  }

  async clickVmRowAction(
    vmName: string,
    action:
      | 'start'
      | 'stop'
      | 'restart'
      | 'reset'
      | 'pause'
      | 'unpause'
      | 'snapshot'
      | 'migrate'
      | 'delete'
      | 'clone',
  ) {
    const vmRow = this._trDataOuiaComponentTypePF6TableRow.filter({
      has: this.testId(vmName),
    });
    await vmRow.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.clickKebabInVmRow(vmRow);

    const controlMenuActions = ['start', 'stop', 'restart', 'reset', 'pause', 'unpause'];
    if (controlMenuActions.includes(action)) {
      await this.hoverOverControlMenu();
    }

    const actionMap: { [key: string]: string } = {
      start: 'vm-action-start',
      stop: 'vm-action-stop',
      restart: 'vm-action-restart',
      reset: 'vm-action-reset',
      pause: 'vm-action-pause',
      unpause: 'vm-action-unpause',
      snapshot: 'vm-action-snapshot',
      migrate: 'vm-action-migrate',
      delete: 'vm-action-delete',
      clone: 'vm-action-clone',
    };
    const actionLocator = this.testId(actionMap[action]);
    await this.robustClick(actionLocator);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  }

  async cloneVm(vmName: string, newVmName: string, startOnClone = false) {
    const vmRow = this._trDataOuiaComponentTypePF6TableRow.filter({
      has: this.testId(vmName),
    });
    await vmRow.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.clickKebabInVmRow(vmRow);
    await this._vmActionClone.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(this._vmActionClone);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    await this._inputIdName.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this._inputIdName.clear();
    await this._inputIdName.fill(newVmName);
    if (startOnClone) {
      const isChecked = await this._startClone.isChecked();
      if (!isChecked) {
        await this._startClone.click({ force: true });
      }
    } else {
      const isChecked = await this._startClone.isChecked();
      if (isChecked) {
        await this._startClone.click({ force: true });
      }
    }
    const cloneBtn = this.testId('save-button').filter({ hasText: 'Clone' });
    await cloneBtn.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await expect(cloneBtn).toBeEnabled({ timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(cloneBtn);
    await this.page.waitForTimeout(TestTimeouts.UI_STABILIZE);
  }

  async closeMigrationModal(): Promise<void> {
    return this.storageMigration.closeMigrationModal();
  }

  async completeMigrationWizardWithStorageClass(
    destinationStorageClass: string,
    migrationCompletionTimeoutMs: number = TestTimeouts.MIGRATION_COMPLETION,
    keepOriginalVolumes = false,
  ): Promise<boolean> {
    return this.storageMigration.completeMigrationWizardWithStorageClass(
      destinationStorageClass,
      migrationCompletionTimeoutMs,
      keepOriginalVolumes,
    );
  }

  async fillMoveToFolderSearch(folderName: string): Promise<void> {
    await this._inputPlaceholderSearchFolder.clear();
    await this._inputPlaceholderSearchFolder.fill(folderName);
  }

  async getDeleteModalDescriptionText(): Promise<string> {
    const dialog = this._dialogModal;
    const body = dialog.locator('.pf-v6-c-modal-box__body, .pf-c-modal-box__body');
    await body.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    return (await body.textContent()) ?? '';
  }

  async getDeletionCountFromModal(): Promise<number | null> {
    try {
      const modalTitle = this.locator('.pf-v6-c-modal-box__title, .pf-c-modal-box__title');
      await modalTitle.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      const titleText = await modalTitle.textContent();

      if (titleText) {
        const match = titleText.match(/Delete\s+(\d+)\s+VirtualMachines/);
        if (match && match[1]) {
          return parseInt(match[1], 10);
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  async getVisibleMigrationNodeOptions(vmName: string): Promise<string[]> {
    const vmRow = this._trDataOuiaComponentTypePF6TableRow.filter({
      has: this.testId(vmName),
    });
    await vmRow.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.clickKebabInVmRow(vmRow);

    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    await this._migrationMenuItem.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this._migrationMenuItem.hover();

    await this._vmActionMigrateCompute.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(this._vmActionMigrateCompute);

    await this._migrationModal.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });

    await this._specificNodeCheckbox.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this._specificNodeCheckbox.click({ force: true });

    await this._nodeSearchInput.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.page.waitForTimeout(TestTimeouts.UI_STABILIZE);

    const nodeOptionButtons = this.locator('#virtual-machine-migration-modal [id^="select-"]');
    const count = await nodeOptionButtons.count();
    const nodeNames: string[] = [];
    for (let i = 0; i < count; i++) {
      const id = await nodeOptionButtons.nth(i).getAttribute('id');
      if (id?.startsWith('select-')) {
        nodeNames.push(id.replace(/^select-/, ''));
      }
    }

    const closeButton = this.locator('#virtual-machine-migration-modal .pf-v6-c-wizard__close');
    await closeButton.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(closeButton);

    return nodeNames;
  }

  async getVisibleMigrationNodeOptionsFromOpenModal(): Promise<string[]> {
    await this._specificNodeCheckbox.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this._specificNodeCheckbox.click({ force: true });

    const nodeNameCells = this.locator('[aria-label="Nodes table"] [data-test^="node-name-"]');
    await nodeNameCells.first().waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });

    const prefix = 'node-name-';
    const count = await nodeNameCells.count();
    const nodeNames: string[] = [];
    for (let i = 0; i < count; i++) {
      const dataTest = await nodeNameCells.nth(i).getAttribute('data-test');
      if (dataTest?.startsWith(prefix)) {
        nodeNames.push(dataTest.slice(prefix.length));
      }
    }

    return nodeNames;
  }

  override async hoverOverControlMenu(): Promise<void> {
    const controlMenuButton = this._controlMenu;
    await controlMenuButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
    await controlMenuButton.hover();
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  }

  async isDeleteModalShareableDiskChecked(): Promise<boolean> {
    const dialog = this._dialogModal;
    const shareableCheck = dialog.locator('.pf-v6-c-check').filter({ hasText: 'Shareable' });
    const checkbox = shareableCheck.locator('input[type="checkbox"]');
    await checkbox.waitFor({ state: 'attached', timeout: TestTimeouts.ELEMENT_WAIT });
    return await checkbox.isChecked();
  }

  async isKebabMenuActionEnabled(
    actionTestId: string,
    timeout: number = TestTimeouts.ELEMENT_WAIT,
  ): Promise<boolean> {
    try {
      const actionLocator = this.testId(actionTestId).locator('button');
      const isVisible = await actionLocator.isVisible({ timeout });
      if (!isVisible) {
        return false;
      }
      const isDisabled = await actionLocator.isDisabled();
      return !isDisabled;
    } catch {
      return false;
    }
  }

  async isKebabMenuActionVisible(
    actionTestId: string,
    timeout: number = TestTimeouts.ELEMENT_WAIT,
  ): Promise<boolean> {
    try {
      const actionLocator = this.testId(actionTestId).locator('button');
      return await actionLocator.isVisible({ timeout });
    } catch {
      return false;
    }
  }

  async isMigrateComputeActionEnabled(vmName: string): Promise<boolean> {
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

      const migrateCompute = this.testId('vm-action-migrate-compute');
      const isVisible = await migrateCompute.isVisible({ timeout: TestTimeouts.UI_DELAY_LONG });
      if (!isVisible) {
        return false;
      }
      const isDisabled = await migrateCompute.isDisabled();
      return !isDisabled;
    } catch {
      return false;
    } finally {
      await this.page.keyboard.press('Escape');
      await this.page.keyboard.press('Escape');
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    }
  }

  async isMigrateStorageActionEnabled(vmName: string): Promise<boolean> {
    return this.storageMigration.isMigrateStorageActionEnabled(vmName);
  }

  async isShareableLabelVisibleInDeleteModal(): Promise<boolean> {
    try {
      const dialog = this._dialogModal;
      const shareableLabel = dialog.locator('.pf-v6-c-label, .pf-c-label').filter({
        hasText: 'Shareable',
      });
      await shareableLabel.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      return true;
    } catch {
      return false;
    }
  }

  async isVmRowActionEnabled(
    vmName: string,
    action:
      | 'start'
      | 'stop'
      | 'restart'
      | 'pause'
      | 'unpause'
      | 'snapshot'
      | 'migrate'
      | 'delete'
      | 'clone',
  ): Promise<boolean> {
    try {
      const vmRow = this._trDataOuiaComponentTypePF6TableRow.filter({
        has: this.testId(vmName),
      });
      await vmRow.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      await this.clickKebabInVmRow(vmRow);
      const actionMap: { [key: string]: string } = {
        start: 'vm-action-start',
        stop: 'vm-action-stop',
        restart: 'vm-action-restart',
        pause: 'vm-action-pause',
        unpause: 'vm-action-unpause',
        snapshot: 'vm-action-snapshot',
        migrate: 'vm-action-migrate',
        delete: 'vm-action-delete',
        clone: 'vm-action-clone',
      };
      const actionLocator = this.testId(actionMap[action]);
      const isVisible = await actionLocator.isVisible({ timeout: TestTimeouts.UI_DELAY_LONG });
      if (!isVisible) {
        return false;
      }
      const isDisabled = await actionLocator.isDisabled();
      return !isDisabled;
    } catch {
      return false;
    }
  }

  async isVmRowActionVisible(
    vmName: string,
    action:
      | 'start'
      | 'stop'
      | 'restart'
      | 'pause'
      | 'unpause'
      | 'snapshot'
      | 'migrate'
      | 'delete'
      | 'clone',
  ): Promise<boolean> {
    try {
      const vmRow = this._trDataOuiaComponentTypePF6TableRow.filter({
        has: this.testId(vmName),
      });
      await vmRow.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      await this.clickKebabInVmRow(vmRow);
      const actionMap: { [key: string]: string } = {
        start: 'vm-action-start',
        stop: 'vm-action-stop',
        restart: 'vm-action-restart',
        pause: 'vm-action-pause',
        unpause: 'vm-action-unpause',
        snapshot: 'vm-action-snapshot',
        migrate: 'vm-action-migrate',
        delete: 'vm-action-delete',
        clone: 'vm-action-clone',
      };
      const actionLocator = this.testId(actionMap[action]);
      return await actionLocator.isVisible({ timeout: TestTimeouts.UI_DELAY_LONG });
    } catch {
      return false;
    }
  }

  async isWizardNavStepDisabled(stepName: string): Promise<boolean> {
    return this.storageMigration.isWizardNavStepDisabled(stepName);
  }

  async migrateVm(vmName: string): Promise<boolean> {
    try {
      const vmRow = this._trDataOuiaComponentTypePF6TableRow.filter({
        has: this.testId(vmName),
      });
      await vmRow.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      await this.clickKebabInVmRow(vmRow);

      const migrationMenuItem = this.locator('button:has-text("Migration")');
      await migrationMenuItem.click();
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

      const migrateCompute = this.testId('vm-action-migrate');
      await migrateCompute.click();
      await this.page.waitForTimeout(TestTimeouts.UI_STABILIZE);

      const migrateButton = this._migrateVirtualMachineBtn;
      await migrateButton.click();

      await this.page.waitForTimeout(TestTimeouts.RETRY_DELAY);

      return true;
    } catch {
      return false;
    }
  }

  async migrateVmToSpecificNode(vmName: string, nodeName?: string): Promise<boolean> {
    try {
      const vmRow = this._trDataOuiaComponentTypePF6TableRow.filter({
        has: this.testId(vmName),
      });
      await vmRow.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      await this.clickKebabInVmRow(vmRow);

      await this._migrationMenuItem.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await this._migrationMenuItem.hover();

      await this._vmActionMigrateCompute.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await this._vmActionMigrateCompute.click();

      await this._specificNodeCheckbox.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await this._specificNodeCheckbox.click({ force: true });

      await this._nodeSearchInput.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await this._nodeSearchInput.fill(nodeName || '');

      const nodeSelectButton = this.locator(`[id="select-${nodeName}"]`);
      await nodeSelectButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await nodeSelectButton.click({ force: true });

      await this._migrateVirtualMachineBtn.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await this._migrateVirtualMachineBtn.click();

      return true;
    } catch {
      return false;
    }
  }

  async openStorageMigrationModal(vmName: string, assertNextEnabled = true): Promise<void> {
    return this.storageMigration.openStorageMigrationModal(vmName, assertNextEnabled);
  }

  async performBulkStorageClassMigration(destinationStorageClass: string): Promise<boolean> {
    return this.storageMigration.performBulkStorageClassMigration(destinationStorageClass);
  }

  async performStorageClassMigration(
    vmName: string,
    destinationStorageClass: string,
    selectedVolumes = false,
    migrationCompletionTimeoutMs: number = TestTimeouts.MIGRATION_COMPLETION,
    keepOriginalVolumes = false,
  ): Promise<boolean> {
    return this.storageMigration.performStorageClassMigration(
      vmName,
      destinationStorageClass,
      selectedVolumes,
      migrationCompletionTimeoutMs,
      keepOriginalVolumes,
    );
  }

  async selectAllVolumesInMigrationModal(): Promise<void> {
    return this.storageMigration.selectAllVolumesInMigrationModal();
  }

  async startStorageMigrationAndCancelWhileInProgress(vmName: string): Promise<void> {
    return this.storageMigration.startStorageMigrationAndCancelWhileInProgress(vmName);
  }

  async takeSnapshotFromList(vmName: string, snapshotName: string): Promise<boolean> {
    try {
      const vmRow = this._trDataOuiaComponentTypePF6TableRow.filter({
        has: this.testId(vmName),
      });
      await vmRow.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      await this.clickKebabInVmRow(vmRow);

      await this._vmActionSnapshot.click();

      const nameInput = this._inputIdName;
      await nameInput.waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
      await nameInput.fill(snapshotName);

      await this._vmListSaveButton.click();

      return true;
    } catch {
      return false;
    }
  }

  async toggleDeleteModalShareableDiskCheckbox(): Promise<void> {
    const dialog = this._dialogModal;
    const shareableCheck = dialog.locator('.pf-v6-c-check').filter({ hasText: 'Shareable' });
    const checkbox = shareableCheck.locator('input[type="checkbox"]');
    await checkbox.waitFor({ state: 'attached', timeout: TestTimeouts.ELEMENT_WAIT });
    await checkbox.click({ force: true });
  }

  async triggerStorageMigration(
    vmName: string,
    destinationStorageClass: string,
    selectedVolumes = false,
    keepOriginalVolumes = false,
  ): Promise<void> {
    return this.storageMigration.triggerStorageMigration(
      vmName,
      destinationStorageClass,
      selectedVolumes,
      keepOriginalVolumes,
    );
  }

  async verifyCloneInfoAlertVisible(): Promise<boolean> {
    const alertText =
      'The cloning process will continue after you close the modal. The cloned VirtualMachine may take some time to appear.';
    const alert = this.page.getByText(alertText);
    try {
      await alert.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
      return true;
    } catch {
      return false;
    }
  }

  async verifyNoVolumePolicyInCloneModal(vmName: string): Promise<boolean> {
    const vmRow = this._trDataOuiaComponentTypePF6TableRow.filter({
      has: this.testId(vmName),
    });
    await vmRow.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.clickKebabInVmRow(vmRow);
    await this._vmActionClone.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(this._vmActionClone);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    await this._inputIdName.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });

    const policyGroup = this.locator('[role="radiogroup"]:has-text("Volume name policy")');
    const absent = !(await policyGroup
      .isVisible({ timeout: TestTimeouts.SHORT_WAIT })
      .catch(() => false));

    await this.robustClick(this.testId('cancel-button'));
    return absent;
  }

  async verifyTagInTagItemContent(expectedTagValue: string): Promise<boolean> {
    try {
      await this._tagItemContent
        .first()
        .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });

      const matchingTags = this._tagItemContent.filter({
        hasText: expectedTagValue.trim(),
      });
      const count = await matchingTags.count();

      return count === 1;
    } catch (error) {
      console.error('Error verifying tag in tag item content:', error);
      return false;
    }
  }

  async waitForStorageClassMigrationCompletion(): Promise<boolean> {
    return this.storageMigration.waitForStorageClassMigrationCompletion();
  }
}
