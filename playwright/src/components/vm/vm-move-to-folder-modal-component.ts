import BaseComponent from '@/components/shared/base-component';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

/** Page object for the Move to group modal (single VM and bulk). */
export default class VmMoveToFolderModalComponent extends BaseComponent {
  private readonly _modal = this.testId('dialog-modal');
  private readonly _modalBody = this._modal.locator('.pf-v6-c-modal-box__body, .pf-c-modal-box__body');
  private readonly _saveButton = this._modal.getByTestId('save-button');
  private readonly _searchInput = this.testId('vm-folder-select-input');
  private readonly _selectList = this._modal.locator('[role="listbox"]');

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

  async openDropdown(): Promise<void> {
    await this._searchInput.click();
    await this._selectList.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
  }

  async getVisibleFolderOptionValues(): Promise<string[]> {
    await this.openDropdown();
    const options = this._selectList.locator('[role="option"]');
    const count = await options.count();
    const values: string[] = [];

    for (let index = 0; index < count; index += 1) {
      const option = options.nth(index);
      const id = (await option.getAttribute('id')) ?? '';
      const match = id.match(/^select-typeahead-(.+)$/);
      if (
        match?.[1] &&
        !match[1].startsWith('create-new-') &&
        !match[1].startsWith('invalid-')
      ) {
        values.push(match[1]);
      }
    }

    return values;
  }

  async getModalBodyText(): Promise<string> {
    await this._modalBody.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    return (await this._modalBody.textContent()) ?? '';
  }

  async isSaveButtonEnabled(): Promise<boolean> {
    await this._saveButton.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    return this._saveButton.isEnabled();
  }

  async clickSave(): Promise<void> {
    await this._saveButton.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(this._saveButton);
  }

  async clickCancel(): Promise<void> {
    await this._modal.getByRole('button', { name: 'Cancel' }).click();
  }

  async getValidationErrorText(): Promise<string | null> {
    const error = this._selectList.locator('.pf-v6-c-helper-text__item-text, .pf-c-helper-text__item-text');
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
