/**
 * Page object for the VirtualMachineSnapshot detail page (standalone snapshot details view).
 * This page is shown when navigating to a snapshot from the VM detail > Snapshots tab.
 */

import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

import PageCommons from '../page-commons';

export default class VirtualMachineSnapshotDetailPage extends PageCommons {
  private readonly _actionsMenuButton = this.locator('[data-test-id="actions-menu-button"]');
  private readonly _confirmAction = this.locator('[data-test="confirm-action"]');
  constructor(page: Page) {
    super(page);
  }

  /**
   * In the annotations modal: fills key and value in the pairs list and confirms.
   * Call after clickEditAnnotations() when the annotations modal is open.
   */
  async addAnnotation(key: string, value: string): Promise<void> {
    const keyInput = this.locator('[data-test="pairs-list-name"]');
    const valueInput = this.locator('[data-test="pairs-list-value"]');
    await keyInput.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
    await keyInput.fill(key);
    await valueInput.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
    await valueInput.fill(value);
    const confirmButton = this._confirmAction;
    await confirmButton.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
    await this.robustClick(confirmButton);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);
  }

  /**
   * In the labels modal: fills the tag input, saves with confirm-action, then waits for UI to update.
   * Call after clickEditLabels() when the labels modal is open.
   */
  async addLabelTag(tag: string): Promise<void> {
    const tagsInput = this.locator('[data-test="tags-input"]');
    await tagsInput.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
    await tagsInput.fill(tag);
    const confirmButton = this._confirmAction;
    await confirmButton.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
    await this.robustClick(confirmButton);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);
  }

  /**
   * Clicks a menu item in the Actions dropdown by its visible text.
   */
  async clickActionsMenuItem(menuItemText: string): Promise<void> {
    const menuItem = this.locator('[role="menuitem"]').filter({ hasText: menuItemText });
    await menuItem.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
    await this.robustClick(menuItem);
  }

  /**
   * Opens Actions and clicks "Edit annotations".
   */
  async clickEditAnnotations(): Promise<void> {
    await this.openActionsMenu();
    await this.clickActionsMenuItem('Edit annotations');
  }

  /**
   * Opens Actions and clicks "Edit labels".
   */
  async clickEditLabels(): Promise<void> {
    await this.openActionsMenu();
    await this.clickActionsMenuItem('Edit labels');
  }

  /**
   * Opens Actions and clicks "Edit VirtualMachineSnapshot".
   */
  async clickEditVirtualMachineSnapshot(): Promise<void> {
    await this.openActionsMenu();
    await this.clickActionsMenuItem('Edit VirtualMachineSnapshot');
  }

  /**
   * Deletes the VirtualMachineSnapshot via the Actions menu on the snapshot detail page:
   * actions menu button -> Delete VirtualMachineSnapshot -> confirm.
   */
  async deleteSnapshotFromDetail(): Promise<void> {
    const actionsMenuButton = this._actionsMenuButton;
    await actionsMenuButton.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
    await this.robustClick(actionsMenuButton);
    const deleteAction = this.locator('[data-test-action="Delete VirtualMachineSnapshot"]');
    await deleteAction.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
    await this.robustClick(deleteAction);
    const confirmButton = this._confirmAction;
    await confirmButton.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
    await this.robustClick(confirmButton);
  }

  /**
   * Fills the YAML editor with the given content and saves using [data-test="save-changes"].
   * Call after clickEditVirtualMachineSnapshot() when the YAML editor is open.
   */
  async editYamlAndSave(yamlContent: string): Promise<void> {
    await this.fillYamlEditor(yamlContent);
    const saveButton = this.locator('[data-test="save-changes"]');
    await saveButton.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
    await this.robustClick(saveButton);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);
  }

  /**
   * Opens the Actions dropdown menu on the snapshot detail page.
   */
  async openActionsMenu(): Promise<void> {
    const actionsMenuButton = this._actionsMenuButton;
    await actionsMenuButton.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
    await this.robustClick(actionsMenuButton);
  }

  /**
   * Verifies that the edit-annotations element contains the given text (e.g. '1 annotation').
   */
  async verifyEditAnnotationsContainsText(text: string): Promise<boolean> {
    const editAnnotations = this.locator('[data-test="edit-annotations"]');
    await editAnnotations.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
    const content = await editAnnotations.textContent();
    return content?.includes(text) ?? false;
  }

  /**
   * Verifies that [data-test="label-key"] contains the expected text.
   */
  async verifyLabelKeyContainsText(expectedText: string): Promise<boolean> {
    const labelKey = this.locator('[data-test="label-key"]').filter({ hasText: expectedText });
    await labelKey.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
    return labelKey.isVisible().catch(() => false);
  }

  /**
   * Verifies that .yaml-editor__buttons h4 contains the resource name and "has been updated to version"
   * (e.g. "pw-snapshot-xxx has been updated to version 4422691").
   */
  async verifyYamlEditorSuccessH4(resourceName: string): Promise<boolean> {
    const h4 = this.locator('.yaml-editor__buttons h4');
    await h4.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
    const content = await h4.textContent();
    return (
      (content?.includes(resourceName) && content?.includes('has been updated to version')) ?? false
    );
  }
}
