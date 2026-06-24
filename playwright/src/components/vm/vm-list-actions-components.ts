import BaseComponent from '@/components/shared/base-component';
import KebabMenuComponent from '@/components/shared/kebab-menu-component';
import VmActionsComponent from '@/components/shared/vm-actions-component';
import type { VmBulkActionsComponent } from '@/components/vm/vm-list-filters-components';
import { applyBulkActionsDelegations } from '@/components/vm/vm-list-filters-components';
import { TestTimeouts } from '@/utils/test-config';
import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class VmListActionsComponent extends BaseComponent {
  readonly vmActions = new VmActionsComponent(this.page);
  readonly kebab: KebabMenuComponent;
  private readonly _migrationMenuItem = this.locator('[data-test-id="migration-menu"]');
  private readonly _migrateStorageAction = this.locator(
    '[data-test-id="vm-action-migrate-storage"]',
  );
  private readonly _vmActionOpenConsole = this.locator('[data-test-id="vm-action-open-console"]');
  private readonly _vmListSaveButton = this.locator('[data-test="save-button"]');
  private readonly _selectPage = this.locator('[aria-label="Select page"]');
  private readonly _actionsDropdownButton = this.locator('[data-test="actions-dropdown"] button');
  private readonly _controlMenu = this.locator('[data-test-id="control-menu"]');
  private readonly _inputIdName = this.locator('input[id="name"]');
  private readonly _startClone = this.locator('#start-clone');
  private readonly _dataTestSelectVm = this.locator('[data-test^="select-vm-"]');
  private readonly _vmActionsDropdown = this.locator('[data-test="actions-dropdown"]');
  private readonly _actionsDropdown = this.locator('[data-test="actions-dropdown"] button');
  private readonly _vmActionMigrateCompute = this.locator(
    '[data-test-id="vm-action-migrate-compute"]',
  );
  private readonly _vmActionSnapshot = this.locator('[data-test-id="vm-action-snapshot"]');
  private readonly _vmActionClone = this.locator('[data-test-id="vm-action-clone"]');
  private readonly _statusCells = this.locator('tbody td:nth-child(3)');
  private readonly _dialogModal = this.locator('[data-test="dialog-modal"]');
  private readonly _tagItemContent = this.locator('.tag-item-content');

  constructor(page: Page) {
    super(page);
    this.kebab = new KebabMenuComponent(page);
  }

  async waitForMultipleVMsToDisappear(vmNames: string[], timeout = 60000): Promise<void> {
    for (const vmName of vmNames) {
      await this.page.waitForSelector(`[data-test-id="${vmName}"]`, {
        state: 'detached',
        timeout,
      });
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

  async isFolderSelectorVisible(folderName: string, namespace: string): Promise<boolean> {
    const folderElement = this.locator(
      `[id="folderSelector/#single-cluster#/${namespace}/${folderName}"]`,
    );
    return await folderElement.isVisible();
  }

  async clickFolderSelector(folderName: string, namespace: string): Promise<void> {
    const folderElement = this.locator(
      `[id="folderSelector/#single-cluster#/${namespace}/${folderName}"] button svg`,
    );
    await folderElement.click();
  }

  async isVmNameVisible(
    vmName: string,
    _namespace: string,
    timeout: number = TestTimeouts.ELEMENT_WAIT,
  ): Promise<boolean> {
    const vmElement = this.locator(`[data-test-id="${vmName}"]`).first();
    try {
      await vmElement.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  async isVmNameHidden(
    vmName: string,
    timeout: number = TestTimeouts.ELEMENT_WAIT,
  ): Promise<boolean> {
    const vmElement = this.locator(`[data-test-id="${vmName}"]`).first();
    try {
      await vmElement.waitFor({ state: 'detached', timeout });
      return true;
    } catch {
      return false;
    }
  }

  async waitForVmRowDetached(
    vmName: string,
    timeout: number = TestTimeouts.DEFAULT,
  ): Promise<void> {
    await this.locator(`[data-test-id="${vmName}"]`).first().waitFor({
      state: 'detached',
      timeout,
    });
  }

  async isVmVisibleByDataTest(
    vmName: string,
    timeout: number = TestTimeouts.ELEMENT_WAIT,
  ): Promise<boolean> {
    const vmElement = this.locator(`[data-test="${vmName}"]`);
    try {
      await vmElement.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
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

  async getVmStatus(
    vmName: string,
    timeout: number = TestTimeouts.UI_ELEMENT_VISIBILITY,
  ): Promise<null | string> {
    try {
      const vmRow = this.locator(
        `tr:has([data-test-id="${vmName}"]), tr:has-text("${vmName}")`,
      ).first();
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

  async waitForVmRowVisible(
    vmName: string,
    timeoutMs: number = TestTimeouts.UI_ELEMENT_VISIBILITY,
  ): Promise<void> {
    const vmRow = this.locator(`[data-test-id="${vmName}"]`).first();
    await vmRow.waitFor({ state: 'visible', timeout: timeoutMs });
  }

  async clickVmStatusButton(vmName: string): Promise<void> {
    const vmRow = this.locator(
      `tr:has([data-test-id="${vmName}"]), tr:has-text("${vmName}")`,
    ).first();
    await vmRow.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    const statusCell = vmRow.locator('td:nth-child(3)');
    const statusButton = statusCell.locator('button');
    await statusButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(statusButton);
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

  async isStatusPopoverActionLinkVisible(vmName: string): Promise<boolean> {
    await this.clickVmStatusButton(vmName);
    const popover = this.locator('.pf-v6-c-popover__content, .pf-v5-c-popover__content');
    await popover
      .first()
      .waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_MEDIUM })
      .catch(() => {});
    const hasLink = await popover
      .first()
      .getByText('View diagnostic', { exact: false })
      .or(popover.first().getByText('Learn more', { exact: false }))
      .first()
      .isVisible()
      .catch(() => false);
    await this.page.keyboard.press('Escape');
    return hasLink;
  }

  async isLightspeedIconVisibleForVm(vmName: string): Promise<boolean> {
    const vmRow = this.locator(
      `tr:has([data-test-id="${vmName}"]), tr:has-text("${vmName}")`,
    ).first();
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

  async clickVmName(vmName: string, _namespace: string): Promise<void> {
    const vmElement = this.locator(`[data-test-id="${vmName}"]`).first();
    await vmElement.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(vmElement);
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

  async clickVmByTestId(vmName: string): Promise<void> {
    const vmLocator = this.locator(`[data-test-id="${vmName}"]`).first();
    await vmLocator.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(vmLocator);
  }

  async reloadVirtualMachinesView(): Promise<void> {
    await this.page.reload({ waitUntil: 'domcontentloaded' });
    const vmGrid = this.locator('table tbody');
    await vmGrid.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  }

  async isDeleteModalShareableDiskChecked(): Promise<boolean> {
    const dialog = this._dialogModal;
    const shareableCheck = dialog.locator('.pf-v6-c-check').filter({ hasText: 'Shareable' });
    const checkbox = shareableCheck.locator('input[type="checkbox"]');
    await checkbox.waitFor({ state: 'attached', timeout: TestTimeouts.ELEMENT_WAIT });
    return await checkbox.isChecked();
  }

  async toggleDeleteModalShareableDiskCheckbox(): Promise<void> {
    const dialog = this._dialogModal;
    const shareableCheck = dialog.locator('.pf-v6-c-check').filter({ hasText: 'Shareable' });
    const checkbox = shareableCheck.locator('input[type="checkbox"]');
    await checkbox.waitFor({ state: 'attached', timeout: TestTimeouts.ELEMENT_WAIT });
    await checkbox.click({ force: true });
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

  async getDeleteModalDescriptionText(): Promise<string> {
    const dialog = this._dialogModal;
    const body = dialog.locator('.pf-v6-c-modal-box__body, .pf-c-modal-box__body');
    await body.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    return (await body.textContent()) ?? '';
  }

  async clickPauseConfirmationButton(): Promise<void> {
    await this.robustClick(this.locator('button.pf-v6-c-button.pf-m-primary:has-text("Pause")'));
  }

  async clickMigrateConfirmationButton(): Promise<void> {
    await this.robustClick(this.locator('button.pf-v6-c-button.pf-m-primary:has-text("Migrate")'));
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
}

// Declaration merging — component methods implemented via prototype augmentation
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging, @typescript-eslint/no-empty-object-type
export interface VmListActionsComponent extends VmBulkActionsComponent, VmRowActionsComponent {}

applyBulkActionsDelegations(VmListActionsComponent.prototype);
applyRowActionsDelegations(VmListActionsComponent.prototype);

export interface VmRowActionsComponent {
  clickKebabButton(): Promise<void>;
  clickKebabButtonForVm(vmName: string): Promise<void>;
  hoverOverControlMenu(): Promise<void>;
  isKebabMenuActionVisible(actionTestId: string, timeout?: number): Promise<boolean>;
  isKebabMenuActionEnabled(actionTestId: string, timeout?: number): Promise<boolean>;
  clickVmActionOpenConsole(): Promise<void>;
  clickVmActionOpenConsoleAndCaptureNewTab(closeTab?: boolean): Promise<string>;
  takeSnapshotFromList(vmName: string, snapshotName: string): Promise<boolean>;
  getVmRow(vmName: string): Locator;
  openVmRowActions(vmName: string): Promise<void>;
  clickVmRowAction(
    vmName: string,
    action:
      | 'clone'
      | 'delete'
      | 'migrate'
      | 'pause'
      | 'reset'
      | 'restart'
      | 'snapshot'
      | 'start'
      | 'stop'
      | 'unpause',
  ): Promise<void>;
  isVmRowActionVisible(
    vmName: string,
    action:
      | 'clone'
      | 'delete'
      | 'migrate'
      | 'pause'
      | 'restart'
      | 'snapshot'
      | 'start'
      | 'stop'
      | 'unpause',
  ): Promise<boolean>;
  isVmRowActionEnabled(
    vmName: string,
    action:
      | 'clone'
      | 'delete'
      | 'migrate'
      | 'pause'
      | 'restart'
      | 'snapshot'
      | 'start'
      | 'stop'
      | 'unpause',
  ): Promise<boolean>;
  isMigrateComputeActionEnabled(vmName: string): Promise<boolean>;
  isMigrateStorageActionEnabled(vmName: string): Promise<boolean>;
  cloneVm(vmName: string, newVmName: string, startOnClone?: boolean): Promise<void>;
  verifyNoVolumePolicyInCloneModal(vmName: string): Promise<boolean>;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function applyRowActionsDelegations(proto: any): void {
  proto.clickKebabInVmRow = async function (this: any, vmRow: Locator): Promise<void> {
    await this.kebab.openKebabForRow(vmRow);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  };

  proto.clickKebabButton = async function (this: any): Promise<void> {
    await this.kebab.openKebab();
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  };

  proto.clickKebabButtonForVm = async function (this: any, vmName: string): Promise<void> {
    const vmRow = this.getVmRow(vmName);
    await vmRow.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.clickKebabInVmRow(vmRow);
  };

  proto.hoverOverControlMenu = async function (this: any): Promise<void> {
    const controlMenuButton = this._controlMenu;
    await controlMenuButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
    await controlMenuButton.hover();
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  };

  proto.isKebabMenuActionVisible = async function (
    this: any,
    actionTestId: string,
    timeout: number = TestTimeouts.ELEMENT_WAIT,
  ): Promise<boolean> {
    try {
      const actionLocator = this.locator(`[data-test-id="${actionTestId}"] button`);
      return await actionLocator.isVisible({ timeout });
    } catch {
      return false;
    }
  };

  proto.isKebabMenuActionEnabled = async function (
    this: any,
    actionTestId: string,
    timeout: number = TestTimeouts.ELEMENT_WAIT,
  ): Promise<boolean> {
    try {
      const actionLocator = this.locator(`[data-test-id="${actionTestId}"] button`);
      const isVisible = await actionLocator.isVisible({ timeout });
      if (!isVisible) {
        return false;
      }
      const isDisabled = await actionLocator.isDisabled();
      return !isDisabled;
    } catch {
      return false;
    }
  };

  proto.clickVmActionOpenConsole = async function (this: any): Promise<void> {
    await this._vmActionOpenConsole.waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await this.robustClick(this._vmActionOpenConsole);
  };

  proto.clickVmActionOpenConsoleAndCaptureNewTab = async function (
    this: any,
    closeTab = true,
  ): Promise<string> {
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
  };

  proto.getVmRow = function (this: any, vmName: string) {
    return this.locator('tr[data-ouia-component-type="PF6/TableRow"]').filter({
      has: this.locator(`[data-test-id="${vmName}"]`),
    });
  };

  proto.openVmRowActions = async function (this: any, vmName: string): Promise<void> {
    const vmRow = this.getVmRow(vmName);
    await vmRow.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.clickKebabInVmRow(vmRow);
  };

  proto.clickVmRowAction = async function (
    this: any,
    vmName: string,
    action:
      | 'clone'
      | 'delete'
      | 'migrate'
      | 'pause'
      | 'reset'
      | 'restart'
      | 'snapshot'
      | 'start'
      | 'stop'
      | 'unpause',
  ): Promise<void> {
    await this.openVmRowActions(vmName);

    const controlMenuActions = ['start', 'stop', 'restart', 'reset', 'pause', 'unpause'];
    if (controlMenuActions.includes(action)) {
      await this.vmActions.hoverOverControlMenu();
    }

    const actionLocator = this.vmActions.getActionLocator(action, 'row');
    await this.robustClick(actionLocator);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  };

  proto.isVmRowActionVisible = async function (
    this: any,
    vmName: string,
    action:
      | 'clone'
      | 'delete'
      | 'migrate'
      | 'pause'
      | 'restart'
      | 'snapshot'
      | 'start'
      | 'stop'
      | 'unpause',
  ): Promise<boolean> {
    try {
      await this.openVmRowActions(vmName);
      const actionLocator = this.vmActions.getActionLocator(action, 'row');
      return await actionLocator.isVisible({ timeout: TestTimeouts.UI_DELAY_LONG });
    } catch {
      return false;
    }
  };

  proto.isVmRowActionEnabled = async function (
    this: any,
    vmName: string,
    action:
      | 'clone'
      | 'delete'
      | 'migrate'
      | 'pause'
      | 'restart'
      | 'snapshot'
      | 'start'
      | 'stop'
      | 'unpause',
  ): Promise<boolean> {
    try {
      await this.openVmRowActions(vmName);
      const actionLocator = this.vmActions.getActionLocator(action, 'row');
      const isVisible = await actionLocator.isVisible({ timeout: TestTimeouts.UI_DELAY_LONG });
      if (!isVisible) {
        return false;
      }
      const isDisabled = await actionLocator.isDisabled();
      return !isDisabled;
    } catch {
      return false;
    }
  };

  proto.isMigrateComputeActionEnabled = async function (
    this: any,
    vmName: string,
  ): Promise<boolean> {
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
  };

  proto.isMigrateStorageActionEnabled = async function (
    this: any,
    vmName: string,
  ): Promise<boolean> {
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
  };

  proto.takeSnapshotFromList = async function (
    this: any,
    vmName: string,
    snapshotName: string,
  ): Promise<boolean> {
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
  };

  proto.cloneVm = async function (
    this: any,
    vmName: string,
    newVmName: string,
    startOnClone = false,
  ): Promise<void> {
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
    const cloneBtn = this.locator('[data-test="save-button"]', { hasText: 'Clone' });
    await cloneBtn.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await expect(cloneBtn).toBeEnabled({ timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(cloneBtn);
    await this.page.waitForTimeout(TestTimeouts.UI_STABILIZE);
  };

  proto.verifyNoVolumePolicyInCloneModal = async function (
    this: any,
    vmName: string,
  ): Promise<boolean> {
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

    await this.robustClick(this.locator('[data-test="cancel-button"]'));
    return absent;
  };
}
