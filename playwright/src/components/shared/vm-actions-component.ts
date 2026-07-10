import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

import BaseComponent from './base-component';

export default class VmActionsComponent extends BaseComponent {
  readonly _actionsDropdown = this.locator('[data-test="actions-dropdown"] button');
  readonly _vmActionClone = this.locator('[data-test-id="vm-action-clone"]');
  readonly _vmActionDelete = this.locator('[data-test-id="vm-action-delete"]');
  readonly _vmActionEditLabels = this.locator('[data-test-id="vm-action-edit-labels"]');
  readonly _vmActionMigrateCompute = this.locator('[data-test-id="vm-action-migrate-compute"]');
  readonly _vmActionMigrateStorage = this.locator('[data-test-id="vm-action-migrate-storage"]');
  readonly _vmActionMoveToFolder = this.locator('[data-test-id="vm-action-move-to-folder"]');
  readonly _vmActionPause = this.locator('[data-test-id="vm-action-pause"]');
  readonly _vmActionPauseButton = this.locator('[data-test-id="vm-action-pause-button"]');
  readonly _vmActionReset = this.locator('[data-test-id="vm-action-reset"]');
  readonly _vmActionRestart = this.locator('[data-test-id="vm-action-restart"]');
  readonly _vmActionRestartButton = this.locator('[data-test-id="vm-action-restart-button"]');
  readonly _vmActionSaveAsTemplate = this.page.getByRole('menuitem', {
    name: 'Save as template',
  });
  readonly _vmActionsDropdown = this.locator('[data-test="actions-dropdown"]');
  readonly _vmActionSnapshot = this.locator('[data-test-id="vm-action-snapshot"]');
  readonly _vmActionStart = this.locator('[data-test-id="vm-action-start"]');
  readonly _vmActionStop = this.locator('[data-test-id="vm-action-stop"]');
  readonly _vmActionStopButton = this.locator('[data-test-id="vm-action-stop-button"]');
  readonly _vmActionUnpause = this.locator('[data-test-id="vm-action-unpause"]');
  readonly _vmActionUnpauseButton = this.locator('[data-test-id="vm-action-unpause-button"]');
  readonly _vmControlMenu = this.locator('[data-test-id="control-menu"]');
  readonly actionsButton = this.locator('button:has-text("Actions")');

  constructor(page: Page) {
    super(page);
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
    const kebabButton = this.locator('[data-test="kebab-button"], [data-test-id="kebab-button"]');
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
    return actionMap[action] || this.locator(`[data-test-id="vm-action-${action}"]`);
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
  }
}
