import BaseComponent from '@/components/shared/base-component';
import KebabMenuComponent from '@/components/shared/kebab-menu-component';
import VmActionsComponent from '@/components/shared/vm-actions-component';
import { MOCK_ENDPOINTS, MockResponses } from '@/utils/mock-responses';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class VirtualMachineDetailActionsComponent extends BaseComponent {
  readonly vmActions = new VmActionsComponent(this.page);
  private readonly _vmName = this.locator('[data-test-id="virtual-machine-overview-details-name"]');

  private readonly _vmOverviewDetailsStatus = this.locator(
    '[data-test-id="virtual-machine-overview-details-status"] button',
  );

  private readonly _connectingText = this.locator('text=Connecting');

  private readonly _deletionProtectionCheckbox = this.locator('input#deletion-protection');
  private readonly _deletionProtectionLabel = this.locator('label[for="deletion-protection"]');

  private readonly _vmActionDeleteButton = this.locator('[data-test-id="vm-action-delete"] button');

  private readonly _vncContainer = this.locator('.vnc-container');

  private readonly _actionsMenuButton = this.locator('[data-test="actions-menu-button"]');
  private readonly _migrationMenu = this.locator('[data-test-id="migration-menu"]');
  private readonly _vmActionsDropdown = this.locator('[data-test="actions-dropdown"]');
  private readonly _vmActionMigrateCompute = this.locator(
    '[data-test-id="vm-action-migrate-compute"]',
  );
  private readonly _vmActionStart = this.locator('[data-test-id="vm-action-start"]');
  private readonly _vmActionRestartButton = this.locator(
    '[data-test-id="vm-action-restart-button"]',
  );
  private readonly _vmActionReset = this.locator('[data-test-id="vm-action-reset"]');
  private readonly _vmActionPauseButton = this.locator('[data-test-id="vm-action-pause-button"]');
  private readonly _vmActionUnpauseButton = this.locator(
    '[data-test-id="vm-action-unpause-button"]',
  );
  private readonly _vmActionStopButton = this.locator('[data-test-id="vm-action-stop-button"]');
  private readonly _enableBtn = this.locator('button:has-text("Enable")');
  private readonly _roleDialog = this.locator('[role="dialog"]');
  private readonly _inputSearchInput = this.locator('input[aria-label="Search input"]');

  constructor(page: Page) {
    super(page);
  }

  async isVmNameVisible(
    expectedName?: string,
    timeout: number = TestTimeouts.DEFAULT,
  ): Promise<boolean> {
    try {
      await this._vmName.waitFor({ state: 'visible', timeout });
    } catch {
      return false;
    }

    if (!expectedName) {
      return true;
    }

    const actualText = await this._vmName.textContent();
    return actualText?.includes(expectedName) ?? false;
  }

  async isVmNameSpanVisible(
    vmName: string,
    timeout: number = TestTimeouts.DEFAULT,
  ): Promise<boolean> {
    try {
      const vmNameSpan = this.locator('[data-test="vms-treeview"] span', {
        hasText: vmName,
      }).first();

      await vmNameSpan.waitFor({ state: 'visible', timeout });

      return await vmNameSpan.isVisible();
    } catch (_error) {
      return false;
    }
  }

  async clickActionsDropdown() {
    await this._actionsMenuButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(this._actionsMenuButton);
  }

  async clickVmActionsDropdown() {
    await this.vmActions.openVmActionsDropdown();
  }

  async startVmFromActionsDropdown() {
    await this.vmActions.performVmAction('start');
  }

  async restartVmFromActionsDropdown() {
    await this.vmActions.performVmAction('restart');
  }

  async resetVmFromActionsDropdown() {
    await this.vmActions.performVmAction('reset');
  }

  async pauseVmFromActionsDropdown() {
    await this.vmActions.performVmAction('pause');
  }

  async unpauseVmFromActionsDropdown() {
    await this.vmActions.performVmAction('unpause');
  }

  async stopVmFromActionsDropdown() {
    await this.vmActions.performVmAction('stop');
  }

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

  // Legacy methods - kept for backward compatibility with existing tests
  async clickStartActionIcon() {
    await this.vmActions.hoverOverControlMenu();
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

  async clickRestartButton() {
    await this._vmActionRestartButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(this._vmActionRestartButton);
  }

  async clickRestartActionIcon() {
    await this.vmActions.hoverOverControlMenu();
    await this._vmActionRestartButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(this._vmActionRestartButton);
  }

  async clickResetActionIcon() {
    await this.vmActions.hoverOverControlMenu();
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

  async clickPauseActionIcon() {
    await this.vmActions.hoverOverControlMenu();
    await this._vmActionPauseButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(this._vmActionPauseButton);
  }

  async clickUnpauseActionIcon() {
    await this.vmActions.hoverOverControlMenu();
    await this._vmActionUnpauseButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(this._vmActionUnpauseButton);
  }

  async clickStopActionIcon() {
    await this.vmActions.hoverOverControlMenu();
    await this._vmActionStopButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(this._vmActionStopButton);
  }

  async clickStopActionButton() {
    await this._vmActionStopButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(this._vmActionStopButton);
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

  async isDeleteActionDisabled(): Promise<boolean> {
    try {
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      const isDisabled = await this._vmActionDeleteButton.isDisabled();
      return isDisabled;
    } catch {
      return false;
    }
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

  async clickDeleteActionInDropdown() {
    await this._vmActionDeleteButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(this._vmActionDeleteButton);
    await this.locator('[data-test="dialog-modal"]').waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
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

      const createdExists = await this.locator(
        '[data-test-id="virtual-machine-overview-details-created"]',
      )
        .isVisible()
        .catch(() => false);
      if (!createdExists) {
        return false;
      }

      const osExists = await this.locator('[data-test-id="virtual-machine-overview-details-os"]')
        .isVisible()
        .catch(() => false);
      if (!osExists) {
        return false;
      }

      const cpuMemExists = await this.locator(
        '[data-test-id="virtual-machine-overview-details-cpu-memory"]',
      )
        .isVisible()
        .catch(() => false);
      if (!cpuMemExists) {
        return false;
      }

      const hostnameExists = await this.locator(
        '[data-test-id="virtual-machine-overview-details-host"]',
      )
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
        const byTestId = this.locator(`[data-test-id="${templateName}"]`);
        let templateExists = await byTestId.isVisible().catch(() => false);
        if (!templateExists) {
          const byDataTest = this.locator(`[data-test="${templateName}"]`);
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

  async waitForVmOverviewStatusContains(
    expectedSubstring: string,
    timeout: number = TestTimeouts.DEFAULT,
  ): Promise<void> {
    await this._vmOverviewDetailsStatus.waitFor({ state: 'visible', timeout });
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const text = (await this._vmOverviewDetailsStatus.textContent())?.trim() ?? '';
      if (text.includes(expectedSubstring)) {
        return;
      }
      await this.page.waitForTimeout(TestTimeouts.RETRY_DELAY);
    }
  }

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

  async verifyInstanceType(expectedInstanceType: string): Promise<boolean> {
    try {
      await this.locator('[data-test-id="virtual-machine-overview-details-instance-type"]').waitFor(
        {
          state: 'visible',
          timeout: TestTimeouts.VM_CREATION,
        },
      );
      const instanceTypeText = await this.locator(
        '[data-test-id="virtual-machine-overview-details-instance-type"]',
      ).textContent();
      return instanceTypeText?.includes(expectedInstanceType) ?? false;
    } catch {
      return false;
    }
  }

  async saveAsTemplate(templateName: string, project: string): Promise<void> {
    await this.vmActions.performVmAction('save-as-template');

    const nameInput = this.locator('#template-name');
    await nameInput.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await nameInput.clear();
    await nameInput.fill(templateName);

    // The Project field can appear as a native <select> or a PatternFly typeahead button.
    // Scope all selectors to the modal to avoid matching other elements.
    const modal = this.locator('[role="dialog"]');
    const nativeSelect = modal.locator('select').filter({ has: modal.locator('option') });
    const isNativeSelect = await nativeSelect
      .first()
      .waitFor({ state: 'visible', timeout: 3000 })
      .then(() => true)
      .catch(() => false);

    if (isNativeSelect) {
      await nativeSelect.first().selectOption(project);
    } else {
      // PatternFly typeahead: placeholder button state or pre-filled state.
      const emptyToggle = modal.locator('button[placeholder="Select project"]');
      const isEmptyToggleVisible = await emptyToggle
        .waitFor({ state: 'visible', timeout: 3000 })
        .then(() => true)
        .catch(() => false);

      if (isEmptyToggleVisible) {
        await this.robustClick(emptyToggle);
      } else {
        // Pre-filled typeahead toggle — open it to change the selection.
        const filledToggle = modal.locator('button.pf-v6-c-menu-toggle').filter({
          hasNotText: 'Select project',
        });
        await this.robustClick(filledToggle.first());
      }

      const searchInput = this._inputSearchInput;
      await searchInput.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      await searchInput.clear();
      await searchInput.fill(project);
      const projectOption = this.locator(`[role="option"]:has-text("${project}")`);
      await projectOption.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await this.robustClick(projectOption);
    }

    const submitBtn = this.locator('button:has-text("Save as template")').last();
    await submitBtn.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(submitBtn);
    await this.page
      .waitForURL(/\/templates/, { timeout: TestTimeouts.NAVIGATION })
      .catch(() => undefined);
    await this.waitForLoadingComplete(TestTimeouts.UI_DELAY_MEDIUM);
  }

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
}

export class VirtualMachineDetailAlertsComponent extends BaseComponent {
  private readonly _alertsCard = this.locator('.alerts-card__drawer');

  constructor(page: Page) {
    super(page);
  }

  async verifyAlertsCard(): Promise<boolean> {
    try {
      await this._alertsCard.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
      return true;
    } catch {
      return false;
    }
  }

  async verifyVMCannotBeEvictedWarningVisible(): Promise<boolean> {
    try {
      await this._alertsCard.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
      const alertContent = this._alertsCard.locator('text=VMCannotBeEvicted');
      await alertContent.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      return true;
    } catch {
      return false;
    }
  }

  async verifyVirtualMachineStuckInUnhealthyStateWarningVisible(): Promise<boolean> {
    try {
      await this._alertsCard.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
      const alertContent = this._alertsCard.locator('text=VirtualMachineStuckInUnhealthyState');
      await alertContent.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      return true;
    } catch {
      return false;
    }
  }

  async mockPrometheusRulesWithWarning(vmName: string, namespace: string): Promise<void> {
    const mockBody = MockResponses.createPrometheusAlertsResponse(vmName, namespace);
    await this.page.route(`${MOCK_ENDPOINTS.PROMETHEUS_RULES}*`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockBody),
      });
    });
  }

  async clearPrometheusRulesMock(): Promise<void> {
    await this.page.unroute(`${MOCK_ENDPOINTS.PROMETHEUS_RULES}*`);
  }

  async expandAlertsAccordion(): Promise<void> {
    await this._alertsCard.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
    const mainToggle = this._alertsCard.locator('#toggle-main');
    const isExpanded = (await mainToggle.getAttribute('aria-expanded')) === 'true';
    if (!isExpanded) {
      await this.robustClick(mainToggle);
    }
  }

  async expandWarningSeverityAccordion(): Promise<void> {
    const warningToggle = this._alertsCard.locator('#warning');
    await warningToggle.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    const isExpanded = (await warningToggle.getAttribute('aria-expanded')) === 'true';
    if (!isExpanded) {
      await this.robustClick(warningToggle);
    }
  }

  async assertAlertMoreLinkInsideMessage(): Promise<boolean> {
    const alertItem = this._alertsCard.locator('.alert-item').first();
    await alertItem.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    const moreInsideMessage = await alertItem.evaluate((el) => {
      const message = el.querySelector('.alert-item__message');
      const more = el.querySelector('.alert-item__more');
      return !!message && !!more && message.contains(more);
    });
    return moreInsideMessage;
  }

  async getAlertMoreLinkText(): Promise<string> {
    const moreLink = this._alertsCard.locator('.alert-item__more a').first();
    await moreLink.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    return (await moreLink.textContent())?.trim() || '';
  }
}

export class VirtualMachineDetailCdromComponent extends BaseComponent {
  readonly kebab: KebabMenuComponent;
  private readonly _tabModal = this.locator('#tab-modal');
  private readonly _tabModalSaveButton = this.locator('#tab-modal [data-test="save-button"]');
  private readonly _btnPlaceholderSelectISOFile = this.locator(
    'button[placeholder="Select ISO file"]',
  );
  private readonly _inputIdSimpleFileFilename = this.locator('input[id="simple-file-filename"]');
  private readonly _fileInput = this.locator('[data-test-id="disk-source-upload"] [type="file"]');

  constructor(page: Page) {
    super(page);
    this.kebab = new KebabMenuComponent(page);
  }

  async navigateToVmiDisksTab(vmName: string, namespace: string): Promise<void> {
    await this.goTo(`/k8s/ns/${namespace}/kubevirt.io~v1~VirtualMachineInstance/${vmName}/disks`);
    await this.locator('[aria-label="Disks table"]')
      .first()
      .waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
  }

  async getVmiDiskColumnValue(
    diskName: string,
    column: 'drive' | 'interface' | 'name' | 'size' | 'source',
  ): Promise<null | string> {
    try {
      const cell = this.locator(`[data-test="disk-${column}-${diskName}"]`).first();
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

  async ejectCdrom(diskName?: string): Promise<boolean> {
    try {
      const diskRow = this.page.locator('tr').filter({ hasText: diskName }).first();
      await diskRow.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });

      await this.kebab.openKebabForRow(diskRow);
      await this.kebab.clickMenuItemByText('Eject');

      try {
        await this._tabModalSaveButton.waitFor({
          state: 'visible',
          timeout: TestTimeouts.UI_DELAY_LONG,
        });
        await this.robustClick(this._tabModalSaveButton);
      } catch {
        // eject may not require a confirmation modal
      }

      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
      return true;
    } catch {
      return false;
    }
  }

  async ejectCdromByVolumeName(volumeName: string): Promise<boolean> {
    try {
      const kebab = this.page.locator(`#disk-actions-${volumeName}`);
      await kebab.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
      await kebab.click({ force: true });
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

      const ejectItem = this.page.getByRole('menuitem', { name: 'Eject' });
      await ejectItem.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      await ejectItem.click({ force: true });

      const dialogEjectButton = this.page.locator(
        '[data-test="dialog-modal"] [data-test="save-button"]',
      );
      await dialogEjectButton.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
      await this.robustClick(dialogEjectButton);

      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
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
    try {
      const diskRow = this.locator('tr', { hasText: diskName }).first();
      await diskRow.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });

      await this.kebab.openKebabForRow(diskRow);
      await this.kebab.clickMenuItemByText('Mount');

      if (sourceType === 'upload') {
        const fileInput = this._inputIdSimpleFileFilename;
        await fileInput.waitFor({
          state: 'attached',
          timeout: TestTimeouts.UI_ACTION_COMPLETE,
        });

        await this._fileInput.setInputFiles(source);

        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
      } else {
        const selectIsoButton = this._btnPlaceholderSelectISOFile;
        await selectIsoButton.waitFor({
          state: 'visible',
          timeout: TestTimeouts.UI_ACTION_COMPLETE,
        });
        await selectIsoButton.click();

        const isoOption = this.locator(`button[id="select-inline-filter-${source}"]`);
        await isoOption.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
        await isoOption.click();
      }

      await this.robustClick(this._tabModalSaveButton);

      await this._tabModal
        .waitFor({ state: 'hidden', timeout: TestTimeouts.ELEMENT_WAIT })
        .catch(async () => {
          throw new Error('Mount CD-ROM modal failed to close');
        });

      return true;
    } catch {
      return false;
    }
  }

  async getMountCDROMModalOptions(diskName: string): Promise<{
    title: string;
    radioLabels: string[];
    defaultSelected: string;
    hasUploadModeSelector: boolean;
  }> {
    try {
      const diskRow = this.locator('tr', { hasText: diskName }).first();
      await diskRow.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });

      await this.kebab.openKebabForRow(diskRow);
      await this.kebab.clickMenuItemByText('Mount');

      const modal = this._tabModal;
      await modal.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });

      const title =
        (
          await modal
            .locator('h1, h2')
            .first()
            .textContent()
            .catch(() => '')
        )?.trim() ?? '';

      const radioInputs = modal.locator('input[type="radio"][name="cdrom-source"]');
      const count = await radioInputs.count();
      const radioLabels: string[] = [];
      let defaultSelected = '';
      for (let i = 0; i < count; i++) {
        const radio = radioInputs.nth(i);
        const id = (await radio.getAttribute('id')) ?? '';
        const label =
          (
            await modal
              .locator(`label[for="${id}"]`)
              .textContent()
              .catch(() => '')
          )?.trim() ?? '';
        radioLabels.push(label);
        if (await radio.isChecked()) {
          defaultSelected = label;
        }
      }

      const hasUploadModeSelector = await modal
        .locator(
          '[data-test="upload-mode-selector"], select[id*="upload-mode"], [id*="upload-type"]',
        )
        .isVisible()
        .catch(() => false);

      await modal.locator('button:has-text("Cancel")').click();
      await modal
        .waitFor({ state: 'hidden', timeout: TestTimeouts.ELEMENT_WAIT })
        .catch(() => null);

      return { title, radioLabels, defaultSelected, hasUploadModeSelector };
    } catch {
      return { title: '', radioLabels: [], defaultSelected: '', hasUploadModeSelector: false };
    }
  }
}
