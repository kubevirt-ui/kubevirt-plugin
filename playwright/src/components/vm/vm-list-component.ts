import BaseComponent from '@/components/shared/base-component';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

export default class VmListComponent extends BaseComponent {
  private readonly _actionsDropdown = this.locator('[data-test="actions-dropdown"]');
  private readonly _actionsDropdownButton = this.locator('[data-test="actions-dropdown"] button');
  private readonly _buttonColumnManagement = this.locator('button[aria-label="Column management"]');
  private readonly _dataTestSelectVm = this.locator('[data-test^="select-vm-"]');
  private readonly _dialogModal = this.locator('[data-test="dialog-modal"]');
  private readonly _quickCreateVmButton = this.locator('[data-test-id="quick-create-vm-btn"]');
  private readonly _resetButton = this.locator('[data-test="reset-button"]');
  private readonly _selectPage = this.locator('[aria-label="Select page"]');
  private readonly _startAfterCreateCheckbox = this.locator('#start-after-create-checkbox');
  private readonly _statusCells = this.locator('tbody td:nth-child(3)');
  private readonly _templateVmNameInput = this.locator(
    '[data-test-id="template-catalog-vm-name-input"]',
  );
  private readonly _vmListSaveButton = this.locator('[data-test="save-button"]');
  readonly _createButton = this.locator(
    '[data-test-id="details-actions"] [data-test="item-create"]',
  );

  constructor(page: Page) {
    super(page);
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

  async clickBulkSelectCheckbox(): Promise<void> {
    const checkbox = this._selectPage;
    await checkbox.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(checkbox);
    await this.page.waitForTimeout(TestTimeouts.RETRY_DELAY);
  }

  override async clickCreateAndSelectOption(
    option: 'From InstanceType' | 'From template' | 'With YAML',
  ) {
    switch (option) {
      case 'With YAML': {
        await this.robustClick(this._createButton);
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
        await this.robustClick(this.locator('button[role="menuitem"]:has-text("With YAML")'));
        break;
      }
      case 'From template': {
        const ns = new URL(this.page.url()).pathname.match(/\/ns\/([^/]+)/)?.[1] || 'default';
        await this.goTo(`/k8s/ns/${ns}/catalog`);
        await this.page.waitForLoadState('domcontentloaded');
        break;
      }
      case 'From InstanceType': {
        const ns = new URL(this.page.url()).pathname.match(/\/ns\/([^/]+)/)?.[1] || 'default';
        await this.goTo(`/k8s/ns/${ns}/catalog/instancetype`);
        await this.page.waitForLoadState('domcontentloaded');
        break;
      }
    }
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

  async clickQuickCreateVmButton() {
    await this.robustClick(this._quickCreateVmButton);
  }

  async clickStartAfterCreateCheckbox() {
    await this._startAfterCreateCheckbox.click();
  }

  override async clickTemplateByTestId(templateTestId: string) {
    await super.clickTemplateByTestId(templateTestId);
  }

  async clickVmActionsDropdown(): Promise<void> {
    await this._actionsDropdownButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(this._actionsDropdownButton);
  }

  async clickVmByTestId(vmName: string): Promise<void> {
    const vmLocator = this.locator(`[data-test-id="${vmName}"]`).first();
    await vmLocator.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(vmLocator);
  }

  async clickVmName(vmName: string, _namespace: string): Promise<void> {
    const vmElement = this.locator(`[data-test-id="${vmName}"]`).first();
    await vmElement.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(vmElement);
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
    const vmRow = this.locator(
      `tr:has([data-test-id="${vmName}"]), tr:has-text("${vmName}")`,
    ).first();
    await vmRow.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });

    const statusCell = vmRow.locator('td:nth-child(3)');
    const statusButton = statusCell.locator('button').first();
    const buttonVisible = await statusButton
      .waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_MEDIUM })
      .then(() => true)
      .catch(() => false);

    if (buttonVisible) {
      await this.robustClick(statusButton);
      return;
    }

    const fallbackButton = vmRow
      .locator('button:has(.pf-v6-c-icon), button:has(.pf-v5-c-icon)')
      .first();
    await fallbackButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(fallbackButton);
  }

  async fillTemplateVmName(vmName: string) {
    await this._templateVmNameInput.clear();
    await this._templateVmNameInput.fill(vmName);
  }

  getCurrentUrl(): string {
    return this.page.url();
  }

  async getTemplateVmName(): Promise<string> {
    return await this._templateVmNameInput.inputValue();
  }

  async getVmStatus(
    vmName: string,
    timeout: number = TestTimeouts.UI_ELEMENT_VISIBILITY,
  ): Promise<string | null> {
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

  async getVmTableMetricValues(): Promise<
    Array<{ vmName: string; memory: string; cpu: string; network: string }>
  > {
    const table = this.locator(
      '[data-test="VirtualMachines table"], table[aria-label*="VirtualMachines"]',
    );
    await table.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });

    const rows = table.locator('tbody tr[data-ouia-component-type="PF6/TableRow"]');
    const count = await rows.count();
    const results: Array<{ vmName: string; memory: string; cpu: string; network: string }> = [];

    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      const cells = row.locator('td');
      const cellCount = await cells.count();

      const nameCell = row.locator('td:nth-child(2)');
      const vmName = (await nameCell.locator('a').textContent())?.trim() ?? '';

      const memoryCell = cells.nth(cellCount >= 9 ? 5 : 4);
      const cpuCell = cells.nth(cellCount >= 9 ? 6 : 5);
      const networkCell = cells.nth(cellCount >= 9 ? 7 : 6);

      results.push({
        vmName,
        memory: (await memoryCell.textContent())?.trim() ?? '-',
        cpu: (await cpuCell.textContent())?.trim() ?? '-',
        network: (await networkCell.textContent())?.trim() ?? '-',
      });
    }

    return results;
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

  async isQuickCreateVmButtonEnabled(): Promise<boolean> {
    return await this._quickCreateVmButton.isEnabled();
  }

  async isQuickCreateVmButtonVisible(): Promise<boolean> {
    return await this._quickCreateVmButton.isVisible();
  }

  async isStartAfterCreateCheckboxChecked(): Promise<boolean> {
    return await this._startAfterCreateCheckbox.isChecked();
  }

  async isStartAfterCreateCheckboxVisible(): Promise<boolean> {
    return await this._startAfterCreateCheckbox.isVisible();
  }

  async isTemplateVmNameInputVisible(): Promise<boolean> {
    return await this._templateVmNameInput.isVisible();
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

  async isVmNameVisible(
    vmName: string,
    namespace: string,
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

  async openBulkActionsDropdown() {
    await this.robustClick(this.locator('[data-test="actions-dropdown"]'));
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  }

  async reloadVirtualMachinesView(): Promise<void> {
    await this.page.reload({ waitUntil: 'domcontentloaded' });
    await this.waitForVMTableToLoad();
  }

  async resetColumns() {
    await this._buttonColumnManagement.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(this._buttonColumnManagement);
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
    await this._resetButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(this._resetButton);
    await this.robustClick(this._vmListSaveButton);
    await this._dialogModal.waitFor({ state: 'hidden' });
    await this.page.waitForTimeout(TestTimeouts.UI_STABILIZE);
  }

  async resizeDisk(): Promise<void> {
    const rootDiskRow = this.locator('[data-label="name"]:has-text("rootdisk")');
    await rootDiskRow.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });

    const parentRow = rootDiskRow.locator('xpath=..');
    await parentRow.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });

    const kebabButton = parentRow.locator('#toggle-id-6');
    await kebabButton.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(kebabButton);
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
      const fallbackCheckbox = this.locator('[data-test-id="select-page"]');
      await this.robustClick(fallbackCheckbox);
    }
    await this.page.waitForTimeout(TestTimeouts.RETRY_DELAY);
  }

  async selectVmByCheckbox(vmName: string): Promise<void> {
    const checkbox = this.locator(`[data-test="select-vm-${vmName}"]`);
    await checkbox.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    const isChecked = await checkbox.isChecked();
    if (!isChecked) {
      await checkbox.click({ force: true });
    }
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  }

  async toggleColumn(columnName: 'status' | 'node' | 'created') {
    await this._buttonColumnManagement.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(this._buttonColumnManagement);
    let checkbox;
    switch (columnName) {
      case 'status':
        checkbox = this.locator('#data-list-status');
        break;
      case 'node':
        checkbox = this.locator('#data-list-node');
        break;
      case 'created':
        checkbox = this.locator('#data-list-created');
        break;
    }
    await checkbox.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    const stateBefore = await checkbox.isChecked();
    await checkbox.click({ force: true });
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    const stateAfter = await checkbox.isChecked();
    if (stateBefore === stateAfter) {
      await checkbox.evaluate((el: HTMLInputElement) => el.click());
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    }
    await this.robustClick(this._vmListSaveButton);
    await this._dialogModal.waitFor({ state: 'hidden' });
    await this.page.waitForTimeout(TestTimeouts.UI_STABILIZE);
  }

  async tryClearAllFilters(): Promise<boolean> {
    try {
      const clearAllFiltersButton = this.locator('button:has-text("Clear all filters")');
      const isVisible = await clearAllFiltersButton.isVisible();
      if (isVisible) {
        await this.robustClick(clearAllFiltersButton);
        return true;
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

  override async verifyPageLoaded(
    vmNameOrIndicators?: string | string[],
    includeCreateButton?: boolean,
    timeout?: number,
  ): Promise<boolean> {
    if (typeof vmNameOrIndicators === 'string') {
      const vmNameLocator = this.locator(`[data-test-id="${vmNameOrIndicators}"]`);
      try {
        await vmNameLocator.waitFor({ state: 'visible', timeout: timeout || TestTimeouts.DEFAULT });
        return await vmNameLocator.isVisible().catch(() => false);
      } catch {
        return false;
      }
    }

    const indicators = Array.isArray(vmNameOrIndicators)
      ? vmNameOrIndicators
      : ['[data-test-id="virtual-machine-name"]'];
    return await super.verifyPageLoaded(indicators, includeCreateButton, timeout);
  }

  async verifyTableHeaderExists(
    headerLabel: 'Status' | 'Node' | 'Created',
    shouldExist: boolean,
  ): Promise<boolean> {
    const header = this.page.locator(
      'table.kubevirt-table th, table.pf-v6-c-table th, [data-test="vm-list-table"] th',
      { hasText: new RegExp(`^${headerLabel}$`) },
    );
    const waitState = shouldExist ? 'visible' : 'hidden';
    await header
      .first()
      .waitFor({ state: waitState, timeout: TestTimeouts.SHORT_WAIT })
      .catch(() => undefined);
    const exists = await header
      .first()
      .isVisible()
      .catch(() => false);
    return exists === shouldExist;
  }

  async verifyVmNameInTable(vmName: string): Promise<boolean> {
    try {
      const vmLink = this.locator(`[data-test-id="${vmName}"]`).first();
      await vmLink.waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
      return await vmLink.isVisible().catch(() => false);
    } catch {
      return false;
    }
  }

  async verifyVmNameNotInTable(vmName: string): Promise<boolean> {
    try {
      const vmLink = this.locator(`[data-test-id="${vmName}"]`).first();
      await vmLink.waitFor({ state: 'hidden', timeout: TestTimeouts.SHORT_WAIT }).catch(() => {
        return;
      });
      return !(await vmLink.isVisible().catch(() => false));
    } catch {
      return true;
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
      await this.page.waitForSelector(`[data-test-id="${vmName}"]`, {
        state: 'detached',
        timeout,
      });
    }
  }

  override async waitForTemplateForm() {
    await super.waitForTemplateForm();
  }

  async waitForVmListTableVisible(): Promise<void> {
    const table = this.locator('table.kubevirt-table, table.pf-v6-c-table').first();
    await table.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
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

  async waitForVmRowVisible(
    vmName: string,
    timeoutMs: number = TestTimeouts.UI_ELEMENT_VISIBILITY,
  ): Promise<void> {
    const vmRow = this.locator(`[data-test-id="${vmName}"]`).first();
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

  async waitForVMTableToLoad(): Promise<void> {
    const vmGrid = this.locator('table tbody');
    await vmGrid.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  }
}
