// YamlEditorComponent — UI component for yaml editor interactions.

import BaseComponent from '@/components/shared/base-component';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

export default class YamlEditorComponent extends BaseComponent {
  private readonly _saveChangesButton = this.locator('[data-test="save-changes"]');

  constructor(page: Page) {
    super(page);
  }

  async isYamlEditorVisible(timeout = TestTimeouts.UI_ELEMENT_VISIBILITY): Promise<boolean> {
    return this.locator('.monaco-editor, .react-monaco-editor-container')
      .first()
      .waitFor({ state: 'visible', timeout })
      .then(() => true)
      .catch(() => false);
  }

  async fillYamlEditor(yamlContent: string) {
    const editorArea = this.locator('.monaco-editor .view-lines').first();
    await editorArea.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT }).catch(() => {});

    const setViaApi = await this.page.evaluate((content) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const editors = (window as any).monaco?.editor?.getEditors?.();
      if (editors?.length) {
        editors[0].setValue(content);
        return true;
      }
      return false;
    }, yamlContent);

    if (!setViaApi) {
      await editorArea.click();
      await this.page.keyboard.press('ControlOrMeta+a');
      await this.page.keyboard.press('Backspace');
      await this.page.evaluate(async (text) => {
        await navigator.clipboard.writeText(text);
      }, yamlContent);
      await this.page.keyboard.press('ControlOrMeta+v');
    }
  }

  async fillYamlEditorAndSave(yamlContent: string) {
    await this.fillYamlEditor(yamlContent);
    await this._saveChangesButton
      .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
      .catch(() => {
        /* Button may already be visible */
      });
    await this._saveChangesButton.click();
    try {
      await this.page.waitForLoadState('domcontentloaded', {
        timeout: TestTimeouts.UI_VISIBILITY_QUICK,
      });
    } catch {
      /* Load state may not be reached */
    }
    await this.page.waitForTimeout(TestTimeouts.RETRY_DELAY);
  }
}
