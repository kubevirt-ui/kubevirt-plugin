// VmListPage — Page object for vm list interactions.

import { VmListActionsComponent } from '@/components/vm/vm-list-actions-components';
import PageCommons from '@/page-objects/page-commons';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

export default class VmListPage extends PageCommons {
  readonly status: VmListActionsComponent;

  private readonly _selectPage = this.locator('[aria-label="Select page"]');
  private readonly _actionsDropdownButton = this.locator('[data-test="actions-dropdown"] button');
  private readonly _buttonColumnManagement = this.locator('button[aria-label="Column management"]');
  private readonly _resetButton = this.locator('[data-test="reset-button"]');
  private readonly _dialogModal = this.locator('[data-test="dialog-modal"]');
  private readonly _dataTestSelectVm = this.locator('[data-test^="select-vm-"]');
  override readonly _createButton = this.locator(
    '[data-test-id="details-actions"] [data-test="item-create"]',
  );
  private readonly _templateVmNameInput = this.locator(
    '[data-test-id="template-catalog-vm-name-input"]',
  );
  private readonly _quickCreateVmButton = this.locator('[data-test-id="quick-create-vm-btn"]');
  private readonly _startAfterCreateCheckbox = this.locator('#start-after-create-checkbox');
  private readonly _vmListSaveButton = this.locator('[data-test="save-button"]');

  constructor(page: Page) {
    super(page);
    this.status = new VmListActionsComponent(page);
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

  async fillTemplateVmName(vmName: string) {
    await this._templateVmNameInput.clear();
    await this._templateVmNameInput.fill(vmName);
  }

  async getTemplateVmName(): Promise<string> {
    return await this._templateVmNameInput.inputValue();
  }

  async isTemplateVmNameInputVisible(): Promise<boolean> {
    return await this._templateVmNameInput.isVisible();
  }

  async clickQuickCreateVmButton() {
    await this.robustClick(this._quickCreateVmButton);
  }

  async isQuickCreateVmButtonVisible(): Promise<boolean> {
    return await this._quickCreateVmButton.isVisible();
  }

  async isQuickCreateVmButtonEnabled(): Promise<boolean> {
    return await this._quickCreateVmButton.isEnabled();
  }

  async clickStartAfterCreateCheckbox() {
    await this._startAfterCreateCheckbox.click();
  }

  async isStartAfterCreateCheckboxVisible(): Promise<boolean> {
    return await this._startAfterCreateCheckbox.isVisible();
  }

  async isStartAfterCreateCheckboxChecked(): Promise<boolean> {
    return await this._startAfterCreateCheckbox.isChecked();
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
    return this.status.hasStatusButtonWithText(statusText, timeout);
  }

  async verifyAllStatusCellsContain(
    expectedStatus: string,
    timeout: number = TestTimeouts.DEFAULT,
  ): Promise<boolean> {
    return this.status.verifyAllStatusCellsContain(expectedStatus, timeout);
  }

  async getVmStatus(
    vmName: string,
    timeout: number = TestTimeouts.UI_ELEMENT_VISIBILITY,
  ): Promise<null | string> {
    return this.status.getVmStatus(vmName, timeout);
  }

  async waitForVmStatus(
    vmName: string,
    expectedStatus: string,
    timeoutMs: number = TestTimeouts.UI_ACTION_COMPLETE,
  ): Promise<boolean> {
    return this.status.waitForVmStatus(vmName, expectedStatus, timeoutMs);
  }

  async waitForVmRowVisible(
    vmName: string,
    timeoutMs: number = TestTimeouts.UI_ELEMENT_VISIBILITY,
  ): Promise<void> {
    return this.status.waitForVmRowVisible(vmName, timeoutMs);
  }

  async clickVmStatusButton(vmName: string): Promise<void> {
    return this.status.clickVmStatusButton(vmName);
  }

  async clickVmStatusAndVerifyLearnMoreInDialog(vmName: string): Promise<boolean> {
    return this.status.clickVmStatusAndVerifyLearnMoreInDialog(vmName);
  }

  async isLightspeedIconVisibleForVm(vmName: string): Promise<boolean> {
    return this.status.isLightspeedIconVisibleForVm(vmName);
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

  async clickBulkSelectCheckbox(): Promise<void> {
    const checkbox = this._selectPage;
    await checkbox.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(checkbox);
    await this.page.waitForTimeout(TestTimeouts.RETRY_DELAY);
  }

  async clickActionsDropdown() {
    await this.robustClick(this.vmActions.actionsDropdown);
  }

  async clickVmActionsDropdown(): Promise<void> {
    await this._actionsDropdownButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(this._actionsDropdownButton);
  }

  async reloadVirtualMachinesView(): Promise<void> {
    await this.page.reload({ waitUntil: 'domcontentloaded' });
    await this.waitForVMTableToLoad();
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

  async openBulkActionsDropdown() {
    await this.robustClick(this.locator('[data-test="actions-dropdown"]'));
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  }

  async waitForVmListTableVisible(): Promise<void> {
    const table = this.locator('table.kubevirt-table, table.pf-v6-c-table').first();
    await table.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
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

  async toggleColumn(columnName: 'created' | 'node' | 'status') {
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

  async verifyTableHeaderExists(
    headerLabel: 'Created' | 'Node' | 'Status',
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

  async waitForVMTableToLoad(): Promise<void> {
    const vmGrid = this.locator('table tbody');
    await vmGrid.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  }

  async tryClearAllFilters(): Promise<boolean> {
    return this.filterToolbar.tryClearAllFilters();
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
}
