/**
 * VirtualMachine detail — details card, status control, Actions menu, and lifecycle controls.
 */

import PageCommons from '@/page-objects/page-commons';
import { pollUntil } from '@/utils/poll-until';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export default class VirtualMachineDetailActionsComponent extends PageCommons {
  private readonly _actionsMenuButton = this.testId('actions-menu-button');

  private readonly _connectingText = this.locator('text=Connecting');

  private readonly _deletionProtectionCheckbox = this.locator('input#deletion-protection');

  private readonly _deletionProtectionLabel = this.locator('label[for="deletion-protection"]');
  private readonly _enableBtn = this.locator('button:has-text("Enable")');

  private readonly _inputSearchInput = this.locator('input[aria-label="Search input"]');

  private readonly _migrationMenu = this.testId('migration-menu');

  private readonly _roleDialog = this.locator('[role="dialog"]');
  private readonly _vmActionDeleteButton = this.testId('vm-action-delete').locator('button');
  private readonly _vmName = this.testId('virtual-machine-overview-details-name');
  private readonly _vmOverviewDetailsStatus = this.testId(
    'virtual-machine-overview-details-status',
  ).locator('button');
  private readonly _vncContainer = this.locator('.vnc-container');

  constructor(page: Page) {
    super(page);
  }

  override async clickActionsDropdown() {
    await this._actionsMenuButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(this._actionsMenuButton);
  }

  async clickDeleteActionInDropdown() {
    await this._vmActionDeleteButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(this._vmActionDeleteButton);
    await this.testId('dialog-modal').waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
  }

  async clickPauseActionIcon() {
    await this.hoverOverControlMenu();
    await this._vmActionPauseButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(this._vmActionPauseButton);
  }

  async clickResetActionIcon() {
    await this.hoverOverControlMenu();
    await this._vmActionReset.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await expect(
      this._vmActionReset,
      'Reset action in VM control menu should be enabled before clicking',
    ).toBeEnabled({ timeout: TestTimeouts.UI_ACTION_COMPLETE });
    await this.robustClick(this._vmActionReset);
  }

  async clickRestartActionIcon() {
    await this.hoverOverControlMenu();
    await this._vmActionRestartButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(this._vmActionRestartButton);
  }

  async clickRestartButton() {
    await this._vmActionRestartButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(this._vmActionRestartButton);
  }

  // Legacy methods - kept for backward compatibility with existing tests
  async clickStartActionIcon() {
    await this.hoverOverControlMenu();
    await this._vmActionStart.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await expect(
      this._vmActionStart,
      'Start action in VM control menu should be enabled before clicking',
    ).toBeEnabled({ timeout: TestTimeouts.UI_ACTION_COMPLETE });
    await this.robustClick(this._vmActionStart);
  }

  /**
   * Clicks the VM overview status control and verifies "Learn more" (Lightspeed) is visible
   * in the opened dialog. If found, clicks "Learn more" and validates the modal closes.
   */
  async clickStatusAndVerifyLearnMoreInDialog(): Promise<boolean> {
    await this._vmOverviewDetailsStatus.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(this._vmOverviewDetailsStatus);
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
        const learnMore = dialog.getByText('Learn more', { exact: false });
        const learnMoreFirst = learnMore.first();
        const visible = await learnMoreFirst.isVisible().catch(() => false);
        if (visible) {
          await learnMoreFirst.click();
          await dialog.waitFor({ state: 'hidden', timeout: TestTimeouts.UI_DELAY_MEDIUM });
          return true;
        }
      } catch {
        continue;
      }
    }

    const learnMorePage = this.page.getByText('Learn more', { exact: false }).first();
    const visible = await learnMorePage.isVisible().catch(() => false);
    if (visible) {
      await learnMorePage.click();
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

  async clickStopActionButton() {
    await this._vmActionStopButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(this._vmActionStopButton);
  }

  async clickStopActionIcon() {
    await this.hoverOverControlMenu();
    await this._vmActionStopButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(this._vmActionStopButton);
  }

  async clickUnpauseActionIcon() {
    await this.hoverOverControlMenu();
    await this._vmActionUnpauseButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(this._vmActionUnpauseButton);
  }

  async clickVmActionsDropdown() {
    await this.openVmActionsDropdown();
  }

  async deleteVm() {
    await this._vmActionDeleteButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(this._vmActionDeleteButton);
    await this.clickDeleteConfirmationButton();
    await this.page.waitForTimeout(TestTimeouts.UI_STABILIZE);
  }

  async isDeleteActionDisabled(): Promise<boolean> {
    try {
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      const isDisabled = await this._vmActionDeleteButton.isDisabled();
      return isDisabled;
    } catch {
      return false;
    }
  }

  async isDeleteProtectionSet(): Promise<boolean> {
    try {
      await this._deletionProtectionCheckbox.waitFor({
        state: 'visible',
        timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
      });
      return await this._deletionProtectionCheckbox.isChecked();
    } catch {
      return false;
    }
  }

  /**
   * Checks whether a running-VM warning alert is shown inside the "Save as template" modal.
   */
  async isSaveAsTemplateRunningAlertVisible(): Promise<boolean> {
    try {
      const alert = this.locator('.pf-v6-c-alert.pf-m-info');
      await alert.waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_MEDIUM });
      const text = await alert.textContent();
      return text?.includes('running VirtualMachine') ?? false;
    } catch {
      return false;
    }
  }

  async isVmNameSpanVisible(
    vmName: string,
    timeout: number = TestTimeouts.DEFAULT,
  ): Promise<boolean> {
    try {
      const vmNameSpan = this.testId('vms-treeview').locator('span', { hasText: vmName }).first();

      await vmNameSpan.waitFor({ state: 'visible', timeout });

      return await vmNameSpan.isVisible();
    } catch (error) {
      return false;
    }
  }

  async isVmNameVisible(
    expectedName?: string,
    timeout: number = TestTimeouts.DEFAULT,
  ): Promise<boolean> {
    // Wait for the VM name element directly as it's more reliable than the page title
    // which might change or be missing in different UI versions
    await this._vmName.waitFor({ state: 'visible', timeout });

    if (!expectedName) {
      return true;
    }

    const actualText = await this._vmName.textContent();
    return actualText?.includes(expectedName) ?? false;
  }

  /**
   * Opens the Actions dropdown and clicks "Migrate compute" to open the migration modal.
   */
  async openActionsDropdownAndClickMigrateCompute(): Promise<void> {
    await this.robustClick(this._vmActionsDropdown);

    await this._migrationMenu.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(this._migrationMenu);

    await this._vmActionMigrateCompute.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(this._vmActionMigrateCompute);
  }

  async pauseVmFromActionsDropdown() {
    await this.performVmAction('pause');
  }

  async resetVmFromActionsDropdown() {
    await this.performVmAction('reset');
  }

  async restartVmFromActionsDropdown() {
    await this.performVmAction('restart');
  }

  /**
   * Opens the "Save as template" modal from the VM actions dropdown,
   * fills in the template name, project, and optional category, then submits.
   */
  async saveAsTemplate(
    templateName: string,
    project: string,
    options?: { category?: string },
  ): Promise<void> {
    // ActionDropdownItem sets data-test on the menuitem itself (not a parent wrapper).
    const saveAsTemplateItem = this.page
      .locator('[data-test="vm-action-save-as-template"]')
      .or(this.page.getByRole('menuitem', { name: /^Save as template$/i }))
      .first();
    const modal = this.page
      .getByRole('dialog')
      .filter({ has: this.page.getByRole('heading', { name: /save as template/i }) })
      .first();
    const nameInput = modal
      .locator('#template-name')
      .or(modal.getByRole('textbox', { name: /^Name$/i }))
      .first();

    // VM detail uses data-test=actions-menu-button; list pages use actions-dropdown.
    const openDetailActions = async (): Promise<void> => {
      const toggle = this._actionsMenuButton
        .or(this.page.getByTestId('actions-dropdown'))
        .or(this.page.getByRole('button', { name: /^Actions$/i }))
        .first();
      await toggle.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      await toggle.hover().catch(() => undefined);
      await toggle.focus().catch(() => undefined);
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      if ((await toggle.getAttribute('aria-expanded').catch(() => null)) !== 'true') {
        await toggle.click({ timeout: TestTimeouts.ELEMENT_WAIT });
      }
      await this.page
        .getByRole('menuitem')
        .first()
        .waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT })
        .catch(() => undefined);
    };

    // Open Actions → Save as template; retry if the menu closes before the modal mounts.
    await pollUntil(
      async () => {
        if (
          (await modal.isVisible().catch(() => false)) &&
          (await nameInput.isVisible().catch(() => false))
        ) {
          return true;
        }
        try {
          await openDetailActions();
          await saveAsTemplateItem.waitFor({
            state: 'visible',
            timeout: TestTimeouts.ELEMENT_WAIT,
          });
          await saveAsTemplateItem.click({ timeout: TestTimeouts.ELEMENT_WAIT });
          await modal.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
          await nameInput.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
          return true;
        } catch {
          await this.page.keyboard.press('Escape').catch(() => undefined);
          return false;
        }
      },
      {
        message: 'Save as template modal should open from Actions menu',
        timeout: TestTimeouts.LONG_OPERATION,
      },
    );

    await nameInput.fill(templateName);

    // Project defaults to the source VM namespace — only change it when needed.
    const projectEscaped = project.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const projectAlreadySet = modal
      .getByRole('button')
      .filter({ hasText: new RegExp(projectEscaped) })
      .first();
    const projectSet = await projectAlreadySet.isVisible().catch(() => false);

    if (!projectSet) {
      const projectToggle = modal.locator('button.pf-v6-c-menu-toggle').first();
      await projectToggle.click({ timeout: TestTimeouts.UI_DELAY_MEDIUM });
      const searchInput = this.page.getByPlaceholder(/Select project/i);
      await searchInput.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      await searchInput.fill(project);
      await this.page
        .getByRole('option', { name: new RegExp(projectEscaped, 'i') })
        .first()
        .click({ timeout: TestTimeouts.ELEMENT_WAIT });
    }

    if (options?.category) {
      // Typed text alone does NOT set selectedValue — closing without onSelect resets input.
      const categoryLabel = options.category.trim().replace(/\s+/g, '-');
      const categorySelect = modal.locator('[data-test="template-category-select"]').first();
      const categoryInput = categorySelect.locator('input[role="combobox"]').first();
      await categoryInput.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });

      await pollUntil(
        async () => {
          await categoryInput.click({ force: true });
          await categoryInput.fill('');
          await categoryInput.pressSequentially(categoryLabel, { delay: 20 });
          // Prefer the stable option id over role name (Create stub can collide).
          const byId = this.page.locator(`#select-typeahead-${categoryLabel}`);
          const existingOption = this.page
            .getByRole('option', { name: categoryLabel, exact: true })
            .first();
          const createOption = this.page
            .getByRole('option', {
              name: new RegExp(`Create category ['"]${categoryLabel}['"]`),
            })
            .first();
          if (await byId.isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM }).catch(() => false)) {
            await byId.click({ force: true });
          } else if (
            await existingOption.isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM }).catch(() => false)
          ) {
            await existingOption.click({ force: true });
          } else if (await createOption.isVisible().catch(() => false)) {
            await createOption.click({ force: true });
          } else {
            await categoryInput.press('ArrowDown');
            await categoryInput.press('ArrowDown');
            await categoryInput.press('Enter');
          }
          const listbox = this.page.locator('[role="listbox"]').filter({ visible: true }).first();
          await listbox
            .waitFor({ state: 'hidden', timeout: TestTimeouts.UI_DELAY_MEDIUM })
            .catch(() => undefined);
          if (await listbox.isVisible().catch(() => false)) {
            await this.page.keyboard.press('Escape').catch(() => undefined);
          }
          // Closing syncs input from selectedValue — typed-only text is cleared.
          await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
          const value = ((await categoryInput.inputValue().catch(() => '')) || '').trim();
          return value === categoryLabel;
        },
        {
          message: `Template category "${categoryLabel}" should be selected from typeahead`,
          timeout: TestTimeouts.LONG_OPERATION,
        },
      );
    }

    // PatternFly progress buttons remount on submit (`pf-m-progress`); a normal
    // click retries on detach for ELEMENT_WAIT and loses the race. Force-click
    // and treat modal close as success.
    const submitBtn = modal
      .getByRole('button', { name: /^(Save as template|Create)$/i })
      .or(modal.getByTestId('save-button'))
      .first();
    await submitBtn.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await Promise.race([
      submitBtn.click({ force: true, timeout: TestTimeouts.UI_ACTION_COMPLETE }),
      modal.waitFor({ state: 'hidden', timeout: TestTimeouts.UI_ACTION_COMPLETE }),
    ]).catch(() => undefined);
    await modal
      .waitFor({ state: 'hidden', timeout: TestTimeouts.NAVIGATION })
      .catch(() => undefined);
    await this.page
      .waitForURL(/\/templates/, { timeout: TestTimeouts.NAVIGATION })
      .catch(() => undefined);
    await this.waitForLoadingComplete(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async setDeleteProtection() {
    await this._deletionProtectionCheckbox.waitFor({
      state: 'visible',
      timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
    });
    const isChecked = await this._deletionProtectionCheckbox.isChecked();
    if (!isChecked) {
      await this.robustClick(this._deletionProtectionLabel);
      await this._enableBtn.waitFor({
        state: 'visible',
        timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
      });
      await this.robustClick(this._enableBtn);
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
    }
  }

  async startVmFromActionsDropdown() {
    await this.performVmAction('start');
  }

  async stopVmFromActionsDropdown() {
    await this.performVmAction('stop');
  }

  async unpauseVmFromActionsDropdown() {
    await this.performVmAction('unpause');
  }

  async unsetDeleteProtection() {
    await this._deletionProtectionCheckbox.waitFor({
      state: 'visible',
      timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
    });
    const isChecked = await this._deletionProtectionCheckbox.isChecked();
    if (isChecked) {
      await this.robustClick(this._deletionProtectionLabel);

      const dialog = this._roleDialog;
      const dialogDisableButton = dialog.locator('footer button', {
        hasText: 'Disable',
      });
      await dialogDisableButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });

      const patchDone = this.page.waitForResponse(
        (resp) =>
          resp.url().includes('virtualmachines') &&
          resp.request().method() === 'PATCH' &&
          resp.status() >= 200 &&
          resp.status() < 300,
        { timeout: TestTimeouts.UI_ACTION_COMPLETE },
      );
      await this.robustClick(dialogDisableButton);
      await patchDone;
      await dialog.waitFor({ state: 'hidden', timeout: TestTimeouts.UI_ACTION_COMPLETE });
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
    }
  }

  async verifyDetailsCard(
    vmName: string,
    templateName?: string,
    options?: { requireVncPreview?: boolean },
  ): Promise<boolean> {
    const requireVncPreview = options?.requireVncPreview !== false;
    try {
      await this.locator('.VirtualMachinesOverviewTabDetails--details').waitFor({
        state: 'visible',
        timeout: TestTimeouts.VM_CREATION,
      });

      const nameText = await this._vmName.textContent();
      const arch = process.env.ARCH || 'amd64';
      if (!nameText?.includes(vmName) && !nameText?.includes(arch)) {
        return false;
      }

      const createdExists = await this.testId('virtual-machine-overview-details-created')
        .isVisible()
        .catch(() => false);
      if (!createdExists) {
        return false;
      }

      const osExists = await this.testId('virtual-machine-overview-details-os')
        .isVisible()
        .catch(() => false);
      if (!osExists) {
        return false;
      }

      const cpuMemExists = await this.testId('cpu-memory-value')
        .isVisible()
        .catch(() => false);
      if (!cpuMemExists) {
        return false;
      }

      const hostnameExists = await this.testId('virtual-machine-overview-details-host')
        .isVisible()
        .catch(() => false);
      if (!hostnameExists) {
        return false;
      }

      let vncExists = true;
      let connectingNotExists = true;
      if (requireVncPreview) {
        await this._vncContainer.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
        vncExists = await this._vncContainer.isVisible().catch(() => false);
        connectingNotExists = !(await this._connectingText.isVisible().catch(() => false));
      }

      if (templateName) {
        const byTestId = this.testId(templateName);
        let templateExists = await byTestId.isVisible().catch(() => false);
        if (!templateExists) {
          const byDataTest = this.locator(`[data-test-id="${templateName}"]`);
          templateExists = await byDataTest.isVisible().catch(() => false);
        }
        if (!templateExists) {
          return false;
        }
      }

      return (
        createdExists &&
        osExists &&
        cpuMemExists &&
        hostnameExists &&
        vncExists &&
        connectingNotExists
      );
    } catch {
      return false;
    }
  }

  async verifyInstanceType(expectedInstanceType: string): Promise<boolean> {
    try {
      await this.testId('virtual-machine-overview-details-instance-type').waitFor({
        state: 'visible',
        timeout: TestTimeouts.VM_CREATION,
      });
      const instanceTypeText = await this.testId(
        'virtual-machine-overview-details-instance-type',
      ).textContent();
      return instanceTypeText?.includes(expectedInstanceType) ?? false;
    } catch {
      return false;
    }
  }

  async verifyVmOverviewStatus(expectedStatus: string): Promise<boolean> {
    try {
      await this._vmOverviewDetailsStatus.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      const statusText = await this._vmOverviewDetailsStatus.textContent();
      return statusText?.trim().includes(expectedStatus) ?? false;
    } catch {
      return false;
    }
  }

  /**
   * Polls until the overview VM status control contains the given substring (e.g. after reset → "Running").
   */
  async waitForVmOverviewStatusContains(
    expectedSubstring: string,
    timeout: number = TestTimeouts.DEFAULT,
  ): Promise<void> {
    // Status may be on the link-button or the DescriptionListDescription wrapper.
    const status = this.testId('virtual-machine-overview-details-status')
      .locator('button')
      .or(this.testId('virtual-machine-overview-details-status'));
    await pollUntil(
      async () => {
        const visible = await status
          .first()
          .isVisible()
          .catch(() => false);
        if (!visible) {
          return false;
        }
        const text = (await status.first().textContent())?.trim() ?? '';
        return text.includes(expectedSubstring);
      },
      {
        intervalMs: TestTimeouts.RETRY_DELAY,
        message: `VM overview status should contain "${expectedSubstring}"`,
        timeout,
      },
    );
  }
}
