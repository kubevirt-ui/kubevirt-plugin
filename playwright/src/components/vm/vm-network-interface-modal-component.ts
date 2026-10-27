import BaseComponent from '@/components/shared/base-component';
import { pollUntil } from '@/utils/poll-until';
import { TestTimeouts } from '@/utils/test-config';
import type { Locator, Page } from '@playwright/test';

/**
 * Add / edit network interface modals (VM detail tab + catalog review wizard).
 * Locator layout aligned with main `VmConfigurationNetworkComponent`.
 */
export class VmNetworkInterfaceModalComponent extends BaseComponent {
  constructor(page: Page) {
    super(page);
  }

  private addNetworkInterfaceDialog(): Locator {
    return this.page.getByRole('dialog', { name: /Add network interface/i });
  }

  private cancelButton(dialog: Locator): Locator {
    return dialog.getByRole('button', { name: /^Cancel$/ });
  }

  private legacyNetworkSelectToggle(dialog: Locator): Locator {
    return dialog.locator('#network-attachment-definition button').first();
  }

  private networkAttachmentDefinitionOption(dialog: Locator, nadName: string): Locator {
    return dialog
      .getByRole('option', { exact: true, name: nadName })
      .or(this.page.getByRole('option', { exact: true, name: nadName }))
      .or(dialog.getByRole('menuitem', { exact: true, name: nadName }))
      .or(this.page.getByRole('menuitem', { exact: true, name: nadName }));
  }

  private networkChoiceLocator(dialog: Locator, option: RegExp | string): Locator {
    return dialog
      .getByRole('option', { name: option })
      .or(this.page.getByRole('option', { name: option }))
      .or(dialog.getByRole('menuitem', { name: option }))
      .or(this.page.getByRole('menuitem', { name: option }));
  }

  private networkInterfaceDialog(title = /network interface/i): Locator {
    return this.page.getByRole('dialog', { name: title });
  }

  private nicNameInput(dialog: Locator): Locator {
    return dialog.locator('input#name');
  }

  private pfNetworkOptionsMenuToggle(dialog: Locator): Locator {
    return dialog.getByRole('button', { name: 'Options menu' }).nth(1);
  }

  private saveButton(dialog: Locator): Locator {
    return dialog.getByRole('button', { name: /^Save$/ });
  }

  /** Catalog review (PF Select) vs VM detail (PF MenuToggle). */
  private async visibleNetworkFieldToggle(dialog: Locator): Promise<Locator> {
    const candidates = [
      this.wizardNetworkSelectToggle(),
      this.legacyNetworkSelectToggle(dialog),
      this.pfNetworkOptionsMenuToggle(dialog),
    ];
    for (const candidate of candidates) {
      if (await candidate.isVisible().catch(() => false)) {
        return candidate;
      }
    }
    for (const candidate of candidates) {
      try {
        await candidate.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
        return candidate;
      } catch {
        continue;
      }
    }
    throw new Error('Network field toggle not found in network interface modal');
  }

  private async waitForModalNetworkFieldReady(dialog: Locator): Promise<void> {
    const toggle = await this.visibleNetworkFieldToggle(dialog);
    await toggle.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);
  }

  private wizardNetworkSelectToggle(): Locator {
    return this.consoleTestId('network-attachment-definition-select').locator('button').first();
  }

  async cancel(): Promise<void> {
    const dialog = this.networkInterfaceDialog();
    await this.cancelButton(dialog).click();
    await dialog.waitFor({ state: 'hidden', timeout: TestTimeouts.ELEMENT_WAIT });
  }

  async fillNicName(nicName: string): Promise<void> {
    const dialog = this.addNetworkInterfaceDialog();
    const nameInput = this.nicNameInput(dialog);
    await nameInput.click({ clickCount: 3 });
    await nameInput.fill(nicName);
  }

  modelSelect(): Locator {
    return this.consoleTestId('model-select');
  }

  async openAddNetworkInterfaceModal(addButton: Locator): Promise<void> {
    await this.robustClick(addButton);
    const dialog = this.addNetworkInterfaceDialog();
    await dialog.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.waitForModalNetworkFieldReady(dialog);
  }

  async save(): Promise<void> {
    const dialog = this.networkInterfaceDialog();
    const save = this.saveButton(dialog);
    await pollUntil(async () => await save.isEnabled(), {
      message: 'Save network interface should be enabled',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);
    await this.robustClick(save);
    await dialog.waitFor({ state: 'hidden', timeout: TestTimeouts.ELEMENT_WAIT });
  }

  async selectNetwork(option: RegExp | string): Promise<void> {
    const dialog = this.networkInterfaceDialog();
    const toggle = await this.visibleNetworkFieldToggle(dialog);
    const current = (await toggle.textContent()) ?? '';
    if (typeof option === 'string' && current.includes(option)) {
      return;
    }
    await toggle.click();
    const choice = this.networkChoiceLocator(dialog, option);
    await choice.first().waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await choice.first().click();
    if (typeof option === 'string') {
      await pollUntil(async () => ((await toggle.textContent()) ?? '').includes(option), {
        message: `Network toggle should show ${option}`,
        timeout: TestTimeouts.ELEMENT_WAIT,
      });
    }
  }

  /** Main-style name: NAD watch / auto-select settled in the add modal. */
  async waitForNetworkAutoSelection(nadName: string): Promise<void> {
    const dialog = this.addNetworkInterfaceDialog();
    const toggle = await this.visibleNetworkFieldToggle(dialog);
    await pollUntil(async () => await toggle.isEnabled(), {
      message: 'Network attachment field should be enabled',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });

    await pollUntil(
      async () => {
        const selected = (await toggle.textContent()) ?? '';
        if (selected.includes(nadName)) {
          return true;
        }
        await toggle.click();
        const option = this.networkAttachmentDefinitionOption(dialog, nadName);
        const visible = await option
          .first()
          .isVisible()
          .catch(() => false);
        if (visible) {
          await option.first().click();
          return true;
        }
        await this.page.keyboard.press('Escape').catch(() => undefined);
        return false;
      },
      {
        intervalMs: TestTimeouts.RETRY_DELAY,
        message: `Network attachment ${nadName} should be selected`,
        timeout: TestTimeouts.ELEMENT_WAIT,
      },
    );
  }
}
