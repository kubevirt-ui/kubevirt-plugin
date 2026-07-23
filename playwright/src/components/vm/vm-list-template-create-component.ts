import BaseComponent from '@/components/shared/base-component';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

/** VM list split Create control, template quick-create form, and catalog navigation from the list page. */
export default class VmListTemplateCreateComponent extends BaseComponent {
  private readonly _createButton = this.testId('item-create');
  private readonly _quickCreateVmButton = this.testId('quick-create-vm-btn');
  private readonly _roleMenuitem = this.locator('[role="menuitem"]');
  private readonly _startAfterCreateCheckbox = this.locator('#start-after-create-checkbox');
  private readonly _templateVmNameInput = this.testId('template-catalog-vm-name-input');

  constructor(page: Page) {
    super(page);
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

  /**
   * CNV-82506 unified the VM creation flow into a split button:
   * - Left button ("Create") opens the wizard at /vm-wizard
   * - Dropdown toggle (right) only contains "With YAML"
   *
   * "From template" and "From InstanceType" dropdown items were removed;
   * these options now navigate directly to the catalog page URLs.
   */
  async clickVmListCreateSplitOption(
    option: 'From InstanceType' | 'From template' | 'With YAML',
  ): Promise<void> {
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

  async getCreateSplitButtonDropdownOptions(): Promise<string[]> {
    try {
      const toggle = this.testId('item-create');
      await this.robustClick(toggle);
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      const items = this._roleMenuitem;
      const texts = await items.allTextContents();
      await this.page.keyboard.press('Escape');
      return texts.map((t) => t.trim()).filter(Boolean);
    } catch {
      return [];
    }
  }

  async getTemplateVmName(): Promise<string> {
    return await this._templateVmNameInput.inputValue();
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

  override async waitForTemplateForm() {
    await super.waitForTemplateForm();
  }
}
