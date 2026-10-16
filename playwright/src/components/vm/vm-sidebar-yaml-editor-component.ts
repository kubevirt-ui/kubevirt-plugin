import BaseComponent from '@/components/shared/base-component';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

/** Sidebar YAML editor on VM detail configuration tabs (and catalog review). */
export class VmSidebarYamlEditorComponent extends BaseComponent {
  constructor(page: Page) {
    super(page);
  }

  private yamlEditorSwitch() {
    return this.locator('#sidebar-editor-switch');
  }

  private yamlEditorPanel() {
    return this.locator('.sidebar-editor__panel');
  }

  private yamlEditorMonaco() {
    return this.locator('.sidebar-editor__panel .monaco-editor').first();
  }

  private yamlEditorSwitchLabel() {
    return this.locator('label.pf-c-switch').filter({ has: this.yamlEditorSwitch() });
  }

  async waitForReady(): Promise<void> {
    await expect(this.yamlEditorSwitch()).toBeVisible({
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
  }

  async expectSwitchVisible(): Promise<void> {
    await this.waitForReady();
  }

  async expectPanelHidden(): Promise<void> {
    await expect(this.yamlEditorPanel()).toBeHidden({
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
  }

  async setVisible(visible: boolean): Promise<void> {
    const switchInput = this.yamlEditorSwitch();
    const checked = await switchInput.isChecked();
    if (checked === visible) {
      return;
    }
    await this.robustClick(this.yamlEditorSwitchLabel());
  }

  async expectPanelVisibleWithVirtualMachineYaml(): Promise<void> {
    await expect(this.yamlEditorPanel()).toBeVisible({
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await expect(this.yamlEditorMonaco()).toBeVisible({
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await expect
      .poll(
        async () => {
          const yaml = await this.getEditorValue();
          return /kind:\s*['"]?VirtualMachine['"]?/i.test(yaml);
        },
        { timeout: TestTimeouts.ELEMENT_WAIT },
      )
      .toBe(true);
  }

  async expectPanelVisibleWithNetworkSpec(): Promise<void> {
    await expect(this.yamlEditorPanel()).toBeVisible({
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await expect(this.yamlEditorMonaco()).toBeVisible({
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await expect
      .poll(
        async () => {
          const yaml = await this.getEditorValue();
          return /networks:/i.test(yaml) && /interfaces:/i.test(yaml);
        },
        { timeout: TestTimeouts.ELEMENT_WAIT },
      )
      .toBe(true);
  }

  async toggle(content: 'virtualMachine' | 'networkSpec' = 'virtualMachine'): Promise<void> {
    await this.expectSwitchVisible();
    await this.expectPanelHidden();
    await this.setVisible(true);
    if (content === 'networkSpec') {
      await this.expectPanelVisibleWithNetworkSpec();
    } else {
      await this.expectPanelVisibleWithVirtualMachineYaml();
    }
    await this.setVisible(false);
    await this.expectPanelHidden();
  }

  private async getEditorValue(): Promise<string> {
    return this.page.evaluate(() => {
      const monaco = (
        window as { monaco?: { editor: { getModels: () => { getValue: () => string }[] } } }
      ).monaco;
      const models = monaco?.editor?.getModels?.() ?? [];
      for (const model of models) {
        const value = model.getValue();
        if (/kind:\s*['"]?VirtualMachine['"]?/i.test(value)) {
          return value;
        }
      }
      return models[0]?.getValue?.() ?? '';
    });
  }
}
