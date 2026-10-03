import BaseComponent from '@/components/shared/base-component';
import { TestTimeouts } from '@/utils/test-config';
import { expect, type Page } from '@playwright/test';

/** Page object for the Move to group modal (single VM and bulk). */
export default class VmMoveToFolderModalComponent extends BaseComponent {
  private readonly _modal = this.testId('dialog-modal');
  private readonly _modalBody = this._modal.locator('.pf-v6-c-modal-box__body, .pf-c-modal-box__body');
  private readonly _saveButton = this._modal.getByTestId('save-button');
  private readonly _folderSelect = this.testId('vm-folder-select');
  private readonly _searchInput = this._folderSelect.locator('input[role="combobox"]');

  constructor(page: Page) {
    super(page);
  }

  async waitForModal(): Promise<void> {
    await this._modal.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
  }

  async waitForModalHidden(): Promise<void> {
    await this._modal.waitFor({ state: 'hidden', timeout: TestTimeouts.UI_ACTION_COMPLETE });
  }

  async getSearchInputValue(): Promise<string> {
    await this._searchInput.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    return this._searchInput.inputValue();
  }

  async fillSearchGroup(folderName: string): Promise<void> {
    await this._searchInput.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this._searchInput.fill(folderName);
  }

  async pressEnterInSearchGroup(): Promise<void> {
    await this._searchInput.press('Enter');
  }

  private async getSelectList() {
    const listboxId = await this._searchInput.getAttribute('aria-controls');
    if (!listboxId) {
      throw new Error('Folder select combobox is missing aria-controls for its listbox');
    }

    const selectList = this.page.locator(`#${listboxId}`);
    await selectList.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    return selectList;
  }

  async clearSearchInput(): Promise<void> {
    const clearButton = this._folderSelect.getByRole('button', { name: 'Clear input value' });
    const hasClearButton = await clearButton
      .isVisible({ timeout: TestTimeouts.UI_DELAY_SHORT })
      .catch(() => false);

    if (hasClearButton) {
      await clearButton.click();
      return;
    }

    await this._searchInput.fill('');
  }

  async openDropdown(): Promise<void> {
    const isExpanded = await this._searchInput.getAttribute('aria-expanded');
    if (isExpanded !== 'true') {
      await this._searchInput.click();
      await expect(this._searchInput).toHaveAttribute('aria-expanded', 'true', {
        timeout: TestTimeouts.ELEMENT_WAIT,
      });
    }
    await this.getSelectList();
  }

  private async collectFolderOptionValues(
    selectList: ReturnType<Page['locator']>,
  ): Promise<string[]> {
    const options = selectList.locator('[role="option"][id^="select-typeahead-"]');
    const count = await options.count();
    const values: string[] = [];

    for (let index = 0; index < count; index += 1) {
      const option = options.nth(index);
      const id = (await option.getAttribute('id')) ?? '';
      const match = id.match(/^select-typeahead-(.+)$/);
      const value = match?.[1];
      if (
        value &&
        !value.startsWith('*create*') &&
        !value.startsWith('*invalid*') &&
        !value.startsWith('*notFound*')
      ) {
        values.push(value);
      }
    }

    return values;
  }

  async selectFolderOption(folderName: string): Promise<void> {
    await this.fillSearchGroup(folderName);
    await this.openDropdown();
    const option = this.page.locator(`#select-typeahead-${folderName}`);
    await option.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(option);
  }

  async getVisibleFolderOptionValues(minOptions = 2): Promise<string[]> {
    await this.openDropdown();
    const selectList = await this.getSelectList();

    await expect
      .poll(async () => this.collectFolderOptionValues(selectList).then((values) => values.length), {
        timeout: TestTimeouts.ELEMENT_WAIT,
      })
      .toBeGreaterThanOrEqual(minOptions);

    return this.collectFolderOptionValues(selectList);
  }

  async getModalBodyText(): Promise<string> {
    await this._modalBody.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    return (await this._modalBody.textContent()) ?? '';
  }

  async isSaveButtonEnabled(): Promise<boolean> {
    await this._saveButton.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    return this._saveButton.isEnabled();
  }

  override async clickSave(): Promise<void> {
    await this._saveButton.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(this._saveButton);
  }

  async clickCancel(): Promise<void> {
    await this._modal.getByRole('button', { name: 'Cancel' }).click();
  }

  async getValidationErrorText(): Promise<string | null> {
    const selectList = await this.getSelectList();
    const error = selectList.locator('.pf-v6-c-helper-text__item-text, .pf-c-helper-text__item-text');
    const isVisible = await error
      .first()
      .isVisible({ timeout: TestTimeouts.UI_DELAY_SHORT })
      .catch(() => false);

    if (!isVisible) {
      return null;
    }

    return (await error.first().textContent())?.trim() ?? null;
  }
}
