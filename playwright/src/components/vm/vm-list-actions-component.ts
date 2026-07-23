import BaseComponent from '@/components/shared/base-component';
import { TestTimeouts } from '@/utils/test-config';
import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

/** VM list bulk/kebab actions, table row status and navigation helpers, and delete or confirmation modals from the list. */
export default class VmListActionsComponent extends BaseComponent {
  private readonly _actionsDropdown = this.testId('actions-dropdown').locator('button');
  private readonly _actionsDropdownButton = this.testId('actions-dropdown').locator('button');
  private readonly _controlMenu = this.testId('control-menu');
  private readonly _dataTestSelectVm = this.locator('[data-test^="select-vm-"]');
  private readonly _dialogModal = this.testId('dialog-modal');
  private readonly _inputIdName = this.locator('input[id="name"], input[id="clone-name"]').first();
  private readonly _kebabButton = this.testId('kebab-button');
  private readonly _migrateStorageAction = this.testId('vm-action-migrate-storage');
  private readonly _migrationMenuItem = this.testId('migration-menu');
  private readonly _selectPage = this.locator('[aria-label="Select page"]');
  private readonly _startClone = this.locator('#start-clone');
  private readonly _statusCells = this.locator('tbody td:nth-child(3)');
  private readonly _tagItemContent = this.locator('.tag-item-content');
  private readonly _vmActionBulkMigration = this.testId('bulk-migration-actions');
  private readonly _vmActionClone = this.testId('vm-action-clone');
  private readonly _vmActionDelete = this.testId('vm-action-delete');
  private readonly _vmActionEditLabels = this.testId('vm-action-edit-labels');
  private readonly _vmActionMigrateCompute = this.testId('vm-action-migrate-compute');
  private readonly _vmActionMoveToFolder = this.testId('vm-action-move-to-folder');
  private readonly _vmActionOpenConsole = this.testId('vm-action-open-console');
  private readonly _vmActionPauseButton = this.testId('vm-action-pause-button');
  private readonly _vmActionReset = this.testId('vm-action-reset');
  private readonly _vmActionRestart = this.testId('vm-action-restart');
  private readonly _vmActionsDropdown = this.testId('actions-dropdown');
  private readonly _vmActionSnapshot = this.testId('vm-action-snapshot');
  private readonly _vmActionStart = this.testId('vm-action-start');
  private readonly _vmActionStop = this.testId('vm-action-stop');
  private readonly _vmActionUnpauseButton = this.testId('vm-action-unpause-button');
  private readonly _vmListSaveButton = this.testId('save-button');

  constructor(page: Page) {
    super(page);
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

  async areAllCheckboxesChecked(): Promise<boolean> {
    try {
      const checkboxes = this._dataTestSelectVm;
      const count = await checkboxes.count();
      if (count === 0) {
        return false;
      }

      for (let i = 0; i < count; i++) {
        const checkbox = checkboxes.nth(i);
        const isChecked = await checkbox.isChecked();
        if (!isChecked) {
          return false;
        }
      }
      return true;
    } catch {
      return false;
    }
  }

  async areNoCheckboxesChecked(): Promise<boolean> {
    try {
      const checkboxes = this._dataTestSelectVm;
      const count = await checkboxes.count();
      if (count === 0) {
        return true;
      }

      for (let i = 0; i < count; i++) {
        if (await checkboxes.nth(i).isChecked()) {
          return false;
        }
      }
      return true;
    } catch {
      return false;
    }
  }

  async clickActionsDropdown() {
    await this.robustClick(this._actionsDropdown);
  }

  async clickActionsMenuButton(): Promise<void> {
    await this._vmActionsDropdown.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(this._vmActionsDropdown);
  }

  async clickBulkSelectCheckbox(): Promise<void> {
    const checkbox = this._selectPage;
    await checkbox.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(checkbox);
    await this.page.waitForTimeout(TestTimeouts.RETRY_DELAY);
  }

  async clickFirstVmLinkInTable(): Promise<string> {
    const table = this.locator('[aria-label="VirtualMachines table"]');
    await table.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    const firstVmLink = table.locator('tbody a[href*="VirtualMachine"]').first();
    await firstVmLink.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    const vmName = (await firstVmLink.textContent())?.trim() ?? '';
    await this.robustClick(firstVmLink);
    return vmName;
  }

  async clickFolderSelector(folderName: string, namespace: string): Promise<void> {
    const folderElement = this.locator(
      `[id="folderSelector/#single-cluster#/${namespace}/${folderName}"] button svg`,
    );
    await folderElement.click();
  }

  async clickKebabButton(): Promise<void> {
    await this._kebabButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await this.robustClick(this._kebabButton);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async clickKebabButtonForVm(vmName: string): Promise<void> {
    const vmRow = this.getVmRow(vmName);
    await vmRow.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.clickKebabInVmRow(vmRow);
  }

  async clickMigrateConfirmationButton(): Promise<void> {
    await this.robustClick(this.locator('button.pf-v6-c-button.pf-m-primary:has-text("Migrate")'));
  }

  async clickPauseConfirmationButton(): Promise<void> {
    await this.robustClick(this.locator('button.pf-v6-c-button.pf-m-primary:has-text("Pause")'));
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
    await this.clickActionsMenuButton();

    const controlActions = ['start', 'stop', 'pause', 'unpause', 'restart', 'reset'];
    if (controlActions.includes(action)) {
      await this.hoverOverBulkControlMenu();
    }

    const migrateActions = ['bulk-migration', 'migrate-compute', 'migrate-storage'];
    if (migrateActions.includes(action)) {
      await this.hoverOverMigrateMenu();
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

  async clickVmActionsDropdown(): Promise<void> {
    await this._actionsDropdownButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(this._actionsDropdownButton);
  }

  async clickVmByTestId(vmName: string): Promise<void> {
    const vmLocator = this.testId(vmName).first();
    await vmLocator.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(vmLocator);
  }

  async clickVmName(vmName: string, _namespace: string): Promise<void> {
    const vmElement = this.testId(vmName).first();
    await vmElement.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(vmElement);
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
    await this.openVmRowActions(vmName);

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

  async clickVmStatusAndVerifyLearnMoreInDialog(vmName: string): Promise<boolean> {
    await this.clickVmStatusButton(vmName);
    await new Promise((r) => setTimeout(r, 1500));

    const dialogSelectors = [
      '.pf-v6-c-popover__content',
      '.pf-v5-c-popover__content',
      '[role="dialog"]',
      '.pf-v6-c-popover',
      '[data-ouia-component-type="PF4/Popover"]',
    ];

    for (const selector of dialogSelectors) {
      const dialog = this.locator(selector).first();
      try {
        await dialog.waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_MEDIUM });
        const actionLink = dialog
          .getByText('View diagnostic', { exact: false })
          .first()
          .or(dialog.getByText('Learn more', { exact: false }).first());
        const visible = await actionLink.isVisible().catch(() => false);
        if (visible) {
          await actionLink.click();
          await dialog.waitFor({ state: 'hidden', timeout: TestTimeouts.UI_DELAY_MEDIUM });
          return true;
        }
      } catch {
        continue;
      }
    }

    const fallbackLink = this.page
      .getByText('View diagnostic', { exact: false })
      .first()
      .or(this.page.getByText('Learn more', { exact: false }).first());
    const visible = await fallbackLink.isVisible().catch(() => false);
    if (visible) {
      await fallbackLink.click();
      for (const sel of dialogSelectors) {
        try {
          await this.locator(sel)
            .first()
            .waitFor({ state: 'hidden', timeout: TestTimeouts.UI_DELAY_MEDIUM });
          return true;
        } catch {
          continue;
        }
      }
    }
    return false;
  }

  async clickVmStatusButton(vmName: string): Promise<void> {
    const vmRow = this.locator('tr')
      .filter({ has: this.testId(vmName) })
      .or(this.locator(`tr:has-text("${vmName}")`))
      .first();
    await vmRow.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    const statusCell = vmRow.locator('td:nth-child(3)');
    const statusButton = statusCell.locator('button');
    await statusButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(statusButton);
  }

  async cloneVm(vmName: string, newVmName: string, startOnClone = false) {
    await this.openVmRowActions(vmName);
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

  getVmRow(vmName: string) {
    return this.locator('tr[data-ouia-component-type="PF6/TableRow"]').filter({
      has: this.testId(vmName),
    });
  }

  async getVmStatus(
    vmName: string,
    timeout: number = TestTimeouts.UI_ELEMENT_VISIBILITY,
  ): Promise<string | null> {
    try {
      const vmRow = this.locator('tr')
        .filter({ has: this.testId(vmName) })
        .or(this.locator(`tr:has-text("${vmName}")`))
        .first();
      await vmRow.waitFor({ state: 'visible', timeout });

      const statusCell = vmRow.locator('td:nth-child(3)');
      await statusCell.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });

      const statusButton = statusCell.locator('button');
      const buttonExists = await statusButton
        .isVisible({ timeout: TestTimeouts.SHORT_WAIT })
        .catch(() => false);

      if (buttonExists) {
        const buttonText = await statusButton.textContent();
        return buttonText?.trim() || null;
      }

      const statusText = await statusCell.textContent();
      return statusText?.trim() || null;
    } catch {
      return null;
    }
  }

  async hasStatusButtonWithText(
    statusText: string,
    timeout: number = TestTimeouts.ELEMENT_WAIT,
  ): Promise<boolean> {
    try {
      await this._statusCells.first().waitFor({ state: 'visible', timeout });

      const statusButtons = this._statusCells.locator('button');
      const count = await statusButtons.count();

      for (let i = 0; i < count; i++) {
        const button = statusButtons.nth(i);
        const buttonText = await button.textContent();
        if (buttonText?.trim() === statusText.trim()) {
          return true;
        }
      }

      return false;
    } catch {
      return false;
    }
  }

  async hoverOverBulkControlMenu(): Promise<void> {
    const bulkControlMenuButton = this._controlMenu;
    await bulkControlMenuButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await bulkControlMenuButton.hover();
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  }

  async hoverOverControlMenu(): Promise<void> {
    const controlMenuButton = this._controlMenu;
    await controlMenuButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
    await controlMenuButton.hover();
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  }

  async hoverOverMigrateMenu(): Promise<void> {
    const migrateMenuButton = this.testId('migration-menu');
    await migrateMenuButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
    await migrateMenuButton.hover();
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  }

  async isDeleteModalShareableDiskChecked(): Promise<boolean> {
    const dialog = this._dialogModal;
    const shareableCheck = dialog.locator('.pf-v6-c-check').filter({ hasText: 'Shareable' });
    const checkbox = shareableCheck.locator('input[type="checkbox"]');
    await checkbox.waitFor({ state: 'attached', timeout: TestTimeouts.ELEMENT_WAIT });
    return await checkbox.isChecked();
  }

  async isFolderSelectorVisible(folderName: string, namespace: string): Promise<boolean> {
    const folderElement = this.locator(
      `[id="folderSelector/#single-cluster#/${namespace}/${folderName}"]`,
    );
    return await folderElement.isVisible();
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

  async isLightspeedIconVisibleForVm(vmName: string): Promise<boolean> {
    const vmRow = this.locator('tr')
      .filter({ has: this.testId(vmName) })
      .or(this.locator(`tr:has-text("${vmName}")`))
      .first();
    await vmRow.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await new Promise((r) => setTimeout(r, 500));

    const learnMoreInRow = vmRow.getByText('Learn more', { exact: false });
    if (
      await learnMoreInRow
        .first()
        .isVisible()
        .catch(() => false)
    )
      return true;

    const popoverContent = this.locator('.pf-v6-c-popover__content').first();
    if (await popoverContent.isVisible().catch(() => false)) {
      const learnMoreInPopover = popoverContent.getByText('Learn more', { exact: false });
      return await learnMoreInPopover
        .first()
        .isVisible()
        .catch(() => false);
    }
    return false;
  }

  async isMigrateComputeActionEnabled(vmName: string): Promise<boolean> {
    try {
      await this.openVmRowActions(vmName);
      const isMigrationVisible = await this._migrationMenuItem.isVisible({
        timeout: TestTimeouts.UI_DELAY_LONG,
      });
      if (!isMigrationVisible) {
        return false;
      }
      await this._migrationMenuItem.click();
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

      const migrateCompute = this._vmActionMigrateCompute;
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
    try {
      await this.openVmRowActions(vmName);
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

  async isVmNameHidden(
    vmName: string,
    timeout: number = TestTimeouts.ELEMENT_WAIT,
  ): Promise<boolean> {
    const vmElement = this.testId(vmName).first();
    try {
      await vmElement.waitFor({ state: 'detached', timeout });
      return true;
    } catch {
      return false;
    }
  }

  async isVmNameVisible(
    vmName: string,
    _namespace: string,
    timeout: number = TestTimeouts.ELEMENT_WAIT,
  ): Promise<boolean> {
    const vmElement = this.testId(vmName).first();
    try {
      await vmElement.waitFor({ state: 'visible', timeout });
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
      await this.openVmRowActions(vmName);
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
      await this.openVmRowActions(vmName);
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

  async isVmVisibleByDataTest(
    vmName: string,
    timeout: number = TestTimeouts.ELEMENT_WAIT,
  ): Promise<boolean> {
    const vmElement = this.testId(vmName);
    try {
      await vmElement.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  async openBulkActionsDropdown() {
    await this.robustClick(this.testId('actions-dropdown'));
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  }

  async openVmActionsDropdown(): Promise<void> {
    await this._vmActionsDropdown.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(this._vmActionsDropdown);
  }

  async openVmRowActions(vmName: string) {
    const vmRow = this.getVmRow(vmName);
    await vmRow.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.clickKebabInVmRow(vmRow);
  }

  async reloadVirtualMachinesView(): Promise<void> {
    await this.page.reload({ waitUntil: 'domcontentloaded' });
    const vmGrid = this.locator('table tbody');
    await vmGrid.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  }

  async selectAllVMs(): Promise<void> {
    const selectPageCheckbox = this.page.getByRole('checkbox', { name: 'Select page' });
    await selectPageCheckbox.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
    await selectPageCheckbox.click();
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  }

  async selectAllVmsOnPage() {
    const selectPageCheckbox = this._selectPage;
    const exists = await selectPageCheckbox
      .isVisible({ timeout: TestTimeouts.UI_DELAY_LONG })
      .catch(() => false);
    if (exists) {
      await this.robustClick(selectPageCheckbox);
    } else {
      const fallbackCheckbox = this.testId('select-page');
      await this.robustClick(fallbackCheckbox);
    }
    await this.page.waitForTimeout(TestTimeouts.RETRY_DELAY);
  }

  async takeSnapshotFromList(vmName: string, snapshotName: string): Promise<boolean> {
    try {
      await this.openVmRowActions(vmName);

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

  async verifyAllStatusCellsContain(
    expectedStatus: string,
    timeout: number = TestTimeouts.DEFAULT,
  ): Promise<boolean> {
    try {
      await this._statusCells.first().waitFor({ state: 'visible', timeout });

      const count = await this._statusCells.count();

      if (count === 0) {
        return false;
      }

      for (let i = 0; i < count; i++) {
        const statusCell = this._statusCells.nth(i);
        const cellText = await statusCell.textContent();
        if (!cellText?.includes(expectedStatus)) {
          return false;
        }
      }

      return true;
    } catch {
      return false;
    }
  }

  async verifyNoVolumePolicyInCloneModal(vmName: string): Promise<boolean> {
    await this.openVmRowActions(vmName);
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

  async waitForFolderToDisappear(
    folderName: string,
    namespace: string,
    timeout: number = TestTimeouts.FOLDER_OPERATION,
  ): Promise<void> {
    await this.page.waitForSelector(
      `[id="folderSelector/#single-cluster#/${namespace}/${folderName}"]`,
      {
        state: 'detached',
        timeout,
      },
    );
  }

  async waitForMultipleVMsToDisappear(vmNames: string[], timeout = 60000): Promise<void> {
    for (const vmName of vmNames) {
      await this.testId(vmName).waitFor({
        state: 'detached',
        timeout,
      });
    }
  }

  async waitForVmRowDetached(
    vmName: string,
    timeout: number = TestTimeouts.DEFAULT,
  ): Promise<void> {
    await this.testId(vmName).first().waitFor({
      state: 'detached',
      timeout,
    });
  }

  async waitForVmRowVisible(
    vmName: string,
    timeoutMs: number = TestTimeouts.UI_ELEMENT_VISIBILITY,
  ): Promise<void> {
    const vmRow = this.testId(vmName).first();
    await vmRow.waitFor({ state: 'visible', timeout: timeoutMs });
  }

  async waitForVmStatus(
    vmName: string,
    expectedStatus: string,
    timeoutMs: number = TestTimeouts.UI_ACTION_COMPLETE,
  ): Promise<boolean> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      const currentStatus = await this.getVmStatus(vmName, TestTimeouts.SHORT_WAIT);

      if (currentStatus) {
        const normalized = currentStatus.trim();
        const expected = expectedStatus.trim();
        if (normalized === expected || normalized.startsWith(expected)) {
          return true;
        }
      }

      await new Promise((r) => setTimeout(r, TestTimeouts.POLLING_INTERVAL));
    }

    const finalStatus = await this.getVmStatus(vmName, TestTimeouts.SHORT_WAIT);
    throw new Error(
      `Timeout waiting for VM ${vmName} to reach status "${expectedStatus}" in UI. Current status: "${
        finalStatus || 'unknown'
      }"`,
    );
  }
}
