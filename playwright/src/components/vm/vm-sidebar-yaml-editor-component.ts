import BaseComponent from '@/components/shared/base-component';
import { pollUntil } from '@/utils/poll-until';
import { TestTimeouts } from '@/utils/test-config';
import type { Locator, Page } from '@playwright/test';

/** Sidebar YAML editor on VM detail configuration tabs (and catalog review). */
export class VmSidebarYamlEditorComponent extends BaseComponent {
  constructor(page: Page) {
    super(page);
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

  private yamlEditorSwitchLabel() {
    return this.page
      .locator('label.pf-c-switch, label.pf-v5-c-switch, label.pf-v6-c-switch')
      .filter({ has: this.yamlEditorSwitch() })
      .first();
  }

  async setVisible(visible: boolean): Promise<void> {
    const roleSwitch = this.page.getByRole('switch', { name: /^YAML$/i }).first();
    const switchInput = (await this.yamlEditorSwitch()
      .isVisible()
      .catch(() => false))
      ? this.yamlEditorSwitch()
      : roleSwitch;
    const checked = await switchInput.isChecked().catch(() => false);
    if (checked === visible) {
      return;
    }
    const label = this.yamlEditorSwitchLabel();
    if (await label.isVisible().catch(() => false)) {
      await this.robustClick(label);
      return;
    }
    if (await roleSwitch.isVisible().catch(() => false)) {
      await this.robustClick(roleSwitch);
    } else {
      await this.robustClick(switchInput);
    }
  }

  async toggle(content: 'networkSpec' | 'virtualMachine' = 'virtualMachine'): Promise<void> {
    await this.waitForReady();
    await this.waitForPanelHidden();
    await this.setVisible(true);
    if (content === 'networkSpec') {
      await this.waitForPanelWithNetworkSpec();
    } else {
      await this.waitForPanelWithVirtualMachineYaml();
    }
    await this.setVisible(false);
    await this.waitForPanelHidden();
  }

  async waitForPanelHidden(): Promise<void> {
    await this.yamlEditorPanel().waitFor({ state: 'hidden', timeout: TestTimeouts.ELEMENT_WAIT });
  }

  async waitForPanelWithNetworkSpec(): Promise<void> {
    await this.yamlEditorPanel().waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.yamlEditorMonaco().waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await pollUntil(
      async () => {
        const yaml = await this.getEditorValue();
        return /networks:/i.test(yaml) && /interfaces:/i.test(yaml);
      },
      {
        message: 'Sidebar YAML should contain networks and interfaces',
        timeout: TestTimeouts.ELEMENT_WAIT,
      },
    );
  }

  async waitForPanelWithVirtualMachineYaml(): Promise<void> {
    await this.yamlEditorPanel().waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.yamlEditorMonaco().waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await pollUntil(
      async () => /kind:\s*['"]?VirtualMachine['"]?/i.test(await this.getEditorValue()),
      {
        message: 'Sidebar YAML should contain a VirtualMachine manifest',
        timeout: TestTimeouts.ELEMENT_WAIT,
      },
    );
  }

  async waitForReady(): Promise<void> {
    await this.yamlEditorSwitch().waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
  }

  yamlEditorMonaco(): Locator {
    return this.yamlEditorPanel().locator('.monaco-editor').first();
  }

  yamlEditorPanel(): Locator {
    return this.page.locator('.sidebar-editor__panel:visible').first();
  }

  /** Several configuration sub-tabs mount a switch; target the visible YAML toggle. */
  yamlEditorSwitch(): Locator {
    return this.page
      .locator('#sidebar-editor-switch >> visible=true')
      .or(this.page.getByRole('switch', { name: /^YAML$/i }))
      .first();
  }
}
