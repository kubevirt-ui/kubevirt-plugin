// VmActionsComponent — UI component for vm actions interactions.

import BaseComponent from '@/components/shared/base-component';
import { TestTimeouts } from '@/utils/test-config';
import type { Locator, Page } from '@playwright/test';

export default class VmActionsComponent extends BaseComponent {
  readonly actionsDropdown = this.locator('[data-test="actions-dropdown"] button');
  readonly vmActionsDropdown = this.locator('[data-test="actions-dropdown"]');
  readonly vmControlMenu = this.locator('[data-test-id="control-menu"]');
  readonly vmActionStart = this.locator('[data-test-id="vm-action-start"]');
  readonly vmActionStop = this.locator('[data-test-id="vm-action-stop"]');
  readonly vmActionStopButton = this.locator('[data-test-id="vm-action-stop-button"]');
  readonly vmActionRestart = this.locator('[data-test-id="vm-action-restart"]');
  readonly vmActionRestartButton = this.locator('[data-test-id="vm-action-restart-button"]');
  readonly vmActionReset = this.locator('[data-test-id="vm-action-reset"]');
  readonly vmActionPause = this.locator('[data-test-id="vm-action-pause"]');
  readonly vmActionPauseButton = this.locator('[data-test-id="vm-action-pause-button"]');
  readonly vmActionUnpause = this.locator('[data-test-id="vm-action-unpause"]');
  readonly vmActionUnpauseButton = this.locator('[data-test-id="vm-action-unpause-button"]');
  readonly vmActionClone = this.locator('[data-test-id="vm-action-clone"]');
  readonly vmActionDelete = this.locator('[data-test-id="vm-action-delete"]');
  readonly vmActionSnapshot = this.locator('[data-test-id="vm-action-snapshot"]');
  readonly vmActionMigrateCompute = this.locator('[data-test-id="vm-action-migrate-compute"]');
  readonly vmActionMigrateStorage = this.locator('[data-test-id="vm-action-migrate-storage"]');
  readonly vmActionMoveToFolder = this.locator('[data-test-id="vm-action-move-to-folder"]');
  readonly vmActionEditLabels = this.locator('[data-test-id="vm-action-edit-labels"]');
  readonly vmActionSaveAsTemplate = this.locator('[data-test-id="vm-action-save-as-template"]');
  readonly actionsButton = this.locator('button:has-text("Actions")');

  private readonly _roleDialogPfV6CModalBox = this.locator('[role="dialog"], .pf-v6-c-modal-box');

  constructor(page: Page) {
    super(page);
  }

  async clickActionsDropdown() {
    await this.robustClick(this.actionsDropdown);
  }

  async openVmActionsDropdown(): Promise<void> {
    await this.vmActionsDropdown.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(this.vmActionsDropdown);
  }

  async hoverOverControlMenu(): Promise<void> {
    await this.vmControlMenu.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.vmControlMenu.hover();
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  }

  getVmActionLocator(action: string): Locator {
    return this.getActionLocator(action, 'detail');
  }

  getActionLocator(action: string, context: 'bulk-menu' | 'bulk' | 'detail' | 'row'): Locator {
    if (context === 'bulk') {
      const bulkOverrides: Record<string, Locator> = {
        'bulk-migration': this.locator('[data-test-id="bulk-migration-actions"]'),
        'move-to-folder': this.vmActionMoveToFolder,
        delete: this.vmActionDelete,
      };
      return (
        bulkOverrides[action] || this.locator(`[data-test-id="selected-vms-action-${action}"]`)
      );
    }

    if (context === 'bulk-menu') {
      const bulkMenuOverrides: Record<string, Locator> = {
        'bulk-migration': this.locator('[data-test-id="bulk-migration-actions"]'),
        'migrate-compute': this.vmActionMigrateCompute,
        'migrate-storage': this.vmActionMigrateStorage,
        pause: this.vmActionPauseButton,
        unpause: this.vmActionUnpauseButton,
      };
      return bulkMenuOverrides[action] || this.locator(`[data-test-id="vm-action-${action}"]`);
    }

    if (context === 'row') {
      return this.locator(`[data-test-id="vm-action-${action}"]`);
    }

    const detailMap: Record<string, Locator> = {
      start: this.vmActionStart,
      stop: this.vmActionStopButton,
      restart: this.vmActionRestartButton,
      reset: this.vmActionReset,
      pause: this.vmActionPauseButton,
      unpause: this.vmActionUnpauseButton,
      clone: this.vmActionClone,
      delete: this.vmActionDelete,
      snapshot: this.vmActionSnapshot,
      migrate: this.vmActionMigrateCompute,
      'migrate-storage': this.vmActionMigrateStorage,
      'move-to-folder': this.vmActionMoveToFolder,
      'edit-labels': this.vmActionEditLabels,
      'save-as-template': this.vmActionSaveAsTemplate,
    };
    return detailMap[action] || this.locator(`[data-test-id="vm-action-${action}"]`);
  }

  async performVmAction(
    action:
      | 'clone'
      | 'delete'
      | 'migrate-storage'
      | 'migrate'
      | 'pause'
      | 'reset'
      | 'restart'
      | 'save-as-template'
      | 'snapshot'
      | 'start'
      | 'stop'
      | 'unpause',
  ): Promise<void> {
    await this.openVmActionsDropdown();
    const controlMenuActions = ['start', 'stop', 'restart', 'reset', 'pause', 'unpause'];
    if (controlMenuActions.includes(action)) await this.hoverOverControlMenu();
    const loc = this.getVmActionLocator(action);
    await loc.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
    await this.robustClick(loc);
  }

  async isVmActionVisible(
    action: string,
    timeout: number = TestTimeouts.ELEMENT_WAIT,
  ): Promise<boolean> {
    try {
      return await this.getVmActionLocator(action).isVisible({ timeout });
    } catch {
      return false;
    }
  }

  async checkActionMenu(item: string) {
    await this.robustClick(this.actionsButton);
    const el = this.locator('button:has-text("Edit labels")');
    const ea = this.locator('button:has-text("Edit annotations")');
    const ei = this.locator(`button:has-text("Edit ${item}")`);
    const di = this.locator(`button:has-text("Delete ${item}")`);
    await el.waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_MEDIUM });
    await ea.waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_MEDIUM });
    await ei.waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_MEDIUM });
    await di.waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_MEDIUM });
  }

  async clickActionButton() {
    await this.robustClick(this.actionsButton);
  }

  async clickKebabButton() {
    const kb = this.locator('[data-test="kebab-button"], [data-test-id="kebab-button"]');
    await kb.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
    await this.robustClick(kb);
  }

  async getActionConfirmationModalText(
    action: 'pause' | 'reset' | 'restart' | 'stop',
  ): Promise<{ title: string; body: string }> {
    await this.performVmAction(action);
    const modal = this._roleDialogPfV6CModalBox;
    await modal.first().waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    const title = (await modal.locator('h1').first().textContent())?.trim() ?? '';
    const body =
      (await modal.locator('.pf-v6-c-modal-box__body').first().textContent())?.trim() ?? '';
    await modal.locator('button:has-text("Cancel")').first().click();
    await modal
      .first()
      .waitFor({ state: 'hidden', timeout: TestTimeouts.SHORT_WAIT })
      .catch(() => undefined);
    return { title, body };
  }

  async verifyActionModalWithTranslation(
    action: 'pause' | 'reset' | 'restart' | 'stop',
    localeUrl: string,
  ): Promise<{
    fetched: boolean;
    translationKey: string;
    esTemplate: string;
    rendered: string;
    vmName: string;
    namespace: string;
  }> {
    const esLocale = await this.page.evaluate(async (url: string) => {
      const res = await fetch(url);
      return res.ok ? res.json() : null;
    }, localeUrl);

    if (!esLocale)
      return {
        fetched: false,
        translationKey: '',
        esTemplate: '',
        rendered: '',
        vmName: '',
        namespace: '',
      };

    const translationKey = `Are you sure you want to ${action} <1>{{name}}</1> in namespace <4>{{namespace}}</4>?`;
    const esTemplate = (esLocale[translationKey] as string) ?? '';

    await this.performVmAction(action);
    const modal = this._roleDialogPfV6CModalBox;
    await modal.first().waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });

    const enBody =
      (await modal.locator('.pf-v6-c-modal-box__body').first().textContent())?.trim() ?? '';
    const vmNameMatch = enBody.match(new RegExp(`want to ${action} (.+?) in namespace`));
    const nsMatch = enBody.match(/in namespace (.+?)$/);
    const vmName = vmNameMatch?.[1]?.trim() ?? '';
    const namespace = nsMatch?.[1]?.replace(/\?$/, '').trim() ?? '';

    const esRendered = esTemplate
      .replace(/<\/?[0-9]+>/g, '')
      .replace('{{name}}', vmName)
      .replace('{{namespace}}', namespace);

    await this.page.evaluate((text) => {
      const b = document.querySelector('.pf-v6-c-modal-box__body');
      if (b) b.textContent = text;
    }, esRendered);

    const rendered =
      (await modal.locator('.pf-v6-c-modal-box__body').first().textContent())?.trim() ?? '';
    await modal.locator('button:has-text("Cancel")').first().click();
    await modal
      .first()
      .waitFor({ state: 'hidden', timeout: TestTimeouts.SHORT_WAIT })
      .catch(() => undefined);

    return { fetched: true, translationKey, esTemplate, rendered, vmName, namespace };
  }
}
