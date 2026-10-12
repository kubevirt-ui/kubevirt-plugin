import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

import BaseComponent from './base-component';

export default class VmActionsComponent extends BaseComponent {
  readonly _actionsDropdown = this.testId('actions-dropdown').locator('button');
  readonly _vmActionClone = this.testId('vm-action-clone');
  readonly _vmActionDelete = this.testId('vm-action-delete');
  readonly _vmActionEditLabels = this.testId('vm-action-edit-labels');
  readonly _vmActionMigrateCompute = this.testId('vm-action-migrate-compute');
  readonly _vmActionMigrateStorage = this.testId('vm-action-migrate-storage');
  readonly _vmActionMoveToFolder = this.testId('vm-action-move-to-folder');
  readonly _vmActionPause = this.testId('vm-action-pause');
  readonly _vmActionPauseButton = this.testId('vm-action-pause-button');
  readonly _vmActionReset = this.testId('vm-action-reset');
  readonly _vmActionRestart = this.testId('vm-action-restart');
  readonly _vmActionRestartButton = this.testId('vm-action-restart-button');
  readonly _vmActionSaveAsTemplate = this.page.getByRole('menuitem', {
    name: 'Save as template',
  });
  readonly _vmActionsDropdown = this.testId('actions-dropdown');
  readonly _vmActionSnapshot = this.testId('vm-action-snapshot');
  readonly _vmActionStart = this.testId('vm-action-start');
  readonly _vmActionStop = this.testId('vm-action-stop');
  readonly _vmActionStopButton = this.testId('vm-action-stop-button');
  readonly _vmActionUnpause = this.testId('vm-action-unpause');
  readonly _vmActionUnpauseButton = this.testId('vm-action-unpause-button');
  readonly _vmControlMenu = this.testId('control-menu');
  readonly actionsButton = this.locator('button:has-text("Actions")');

  constructor(page: Page) {
    super(page);
  }

  /**
   * If a ConfirmVMActionModal appeared after clicking the action menu item,
   * click the confirmation button (and check the checkbox for 'reset').
   */
  private async confirmVmActionModalIfPresent(action: string): Promise<void> {
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    const modal = this.page.locator('[role="dialog"]');
    const modalVisible = await modal
      .waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_LONG })
      .then(() => true)
      .catch(() => false);
    if (!modalVisible) return;

    if (action === 'reset') {
      const checkbox = modal.locator('input[type="checkbox"]');
      const isChecked = await checkbox.isChecked().catch(() => true);
      if (!isChecked) {
        await checkbox.check({ force: true });
      }
    }

    const actionLabels: Record<string, string> = {
      stop: 'Stop',
      restart: 'Restart',
      reset: 'Reset',
      pause: 'Pause',
    };
    const label = actionLabels[action] ?? action;
    const confirmBtn = modal.getByRole('button', { name: label, exact: true });
    await confirmBtn.waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_MEDIUM });
    await confirmBtn.click();
    await modal
      .waitFor({ state: 'hidden', timeout: TestTimeouts.UI_ACTION_COMPLETE })
      .catch(() => undefined);
  }

  async checkActionMenu(item: string): Promise<void> {
    await this.robustClick(this.actionsButton);

    const editLabelsButton = this.locator('button:has-text("Edit labels")');
    const editAnnotationsButton = this.locator('button:has-text("Edit annotations")');
    const editItemButton = this.locator(`button:has-text("Edit ${item}")`);
    const deleteItemButton = this.locator(`button:has-text("Delete ${item}")`);

    await editLabelsButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_MEDIUM });
    await editAnnotationsButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_DELAY_MEDIUM,
    });
    await editItemButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_MEDIUM });
    await deleteItemButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_MEDIUM });
  }

  async clickActionButton(): Promise<void> {
    await this.robustClick(this.actionsButton);
  }

  async clickActionsDropdown(): Promise<void> {
    await this.robustClick(this._actionsDropdown);
  }

  async clickKebabButton(): Promise<void> {
    const kebabButton = this.testId('kebab-button');
    await kebabButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(kebabButton);
  }

  getVmActionLocator(action: string) {
    const actionMap: Record<string, ReturnType<typeof this.locator>> = {
      start: this._vmActionStart,
      stop: this._vmActionStopButton,
      restart: this._vmActionRestartButton,
      reset: this._vmActionReset,
      pause: this._vmActionPauseButton,
      unpause: this._vmActionUnpauseButton,
      clone: this._vmActionClone,
      delete: this._vmActionDelete,
      snapshot: this._vmActionSnapshot,
      migrate: this._vmActionMigrateCompute,
      'migrate-storage': this._vmActionMigrateStorage,
      'move-to-folder': this._vmActionMoveToFolder,
      'edit-labels': this._vmActionEditLabels,
      'save-as-template': this._vmActionSaveAsTemplate,
    };
    return actionMap[action] || this.testId(`vm-action-${action}`);
  }

  async hoverOverControlMenu(): Promise<void> {
    await this._vmControlMenu.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this._vmControlMenu.hover();
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  }

  async isVmActionVisible(
    action: string,
    timeout: number = TestTimeouts.ELEMENT_WAIT,
  ): Promise<boolean> {
    try {
      const actionLocator = this.getVmActionLocator(action);
      return await actionLocator.isVisible({ timeout });
    } catch {
      return false;
    }
  }

  async openVmActionsDropdown(): Promise<void> {
    await this._vmActionsDropdown.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(this._vmActionsDropdown);
  }

  async performVmAction(
    action:
      | 'start'
      | 'stop'
      | 'restart'
      | 'reset'
      | 'pause'
      | 'unpause'
      | 'clone'
      | 'delete'
      | 'snapshot'
      | 'migrate'
      | 'migrate-storage'
      | 'move-to-folder'
      | 'edit-labels'
      | 'save-as-template',
  ): Promise<void> {
    await this.openVmActionsDropdown();

    const controlMenuActions = ['start', 'stop', 'restart', 'reset', 'pause', 'unpause'];
    if (controlMenuActions.includes(action)) {
      await this.hoverOverControlMenu();
    }

    const actionLocator = this.getVmActionLocator(action);
    await actionLocator.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
    await this.robustClick(actionLocator);

    // Actions with confirmVMActions enabled show a confirmation modal.
    const actionsWithConfirmation = ['stop', 'restart', 'reset', 'pause'];
    if (actionsWithConfirmation.includes(action)) {
      await this.confirmVmActionModalIfPresent(action);
    }
  }
}
