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
    return this.networkSelectRoot(dialog).locator('#network-attachment-definition button').first();
  }

  private networkSelectRoot(dialog: Locator): Locator {
    return dialog.locator('[data-test-id="network-attachment-definition-select"]');
  }

  private typeaheadCombobox(dialog: Locator): Locator {
    return dialog.getByRole('combobox').first();
  }

  private networkAttachmentDefinitionOption(dialog: Locator, nadName: string): Locator {
    return dialog
      .getByRole('option', { name: new RegExp(nadName) })
      .or(this.page.getByRole('option', { name: new RegExp(nadName) }))
      .or(dialog.getByRole('menuitem', { name: new RegExp(nadName) }))
      .or(this.page.getByRole('menuitem', { name: new RegExp(nadName) }));
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

  /** Catalog review (PF Select) vs VM detail (SelectTypeahead / legacy MenuToggle). */
  private async visibleNetworkFieldToggle(dialog: Locator): Promise<Locator> {
    await this.waitForNetworkSelectReady(dialog);
    const combobox = this.typeaheadCombobox(dialog);
    if (await combobox.isVisible().catch(() => false)) {
      return combobox;
    }
    const legacy = this.legacyNetworkSelectToggle(dialog);
    if (await legacy.isVisible().catch(() => false)) {
      return legacy;
    }
    return this.pfNetworkOptionsMenuToggle(dialog);
  }

  private async waitForNetworkSelectReady(dialog: Locator): Promise<void> {
    await dialog
      .locator('.pf-c-spinner, .pf-v6-c-spinner, .loading-skeleton')
      .first()
      .waitFor({ state: 'hidden', timeout: TestTimeouts.ELEMENT_WAIT })
      .catch(() => undefined);
    await this.typeaheadCombobox(dialog).waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
  }

  private async readNetworkFieldValue(field: Locator): Promise<string> {
    if (await field.evaluate((el) => el.tagName === 'INPUT').catch(() => false)) {
      return field.inputValue();
    }
    return (await field.textContent()) ?? '';
  }

  private async waitForModalNetworkFieldReady(dialog: Locator): Promise<void> {
    await this.waitForNetworkSelectReady(dialog);
    const toggle = await this.visibleNetworkFieldToggle(dialog);
    await toggle.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);
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
    const current = await this.readNetworkFieldValue(toggle);
    if (typeof option === 'string' && current.includes(option)) {
      return;
    }
    await toggle.click();
    const choice = this.networkChoiceLocator(dialog, option);
    await choice.first().waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await choice.first().click();
    if (typeof option === 'string') {
      await pollUntil(
        async () => {
          const field = await this.visibleNetworkFieldToggle(dialog);
          return (await this.readNetworkFieldValue(field)).includes(option);
        },
        {
          message: `Network field should show ${option}`,
          timeout: TestTimeouts.ELEMENT_WAIT,
        },
      );
    }
  }

  /** Main-style name: NAD watch / auto-select settled in the add modal. */
  async waitForNetworkAutoSelection(nadName: string): Promise<void> {
    const dialog = this.addNetworkInterfaceDialog();
    await dialog.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.waitForNetworkSelectReady(dialog);

    await pollUntil(
      async () => {
        const toggle = await this.visibleNetworkFieldToggle(dialog);
        const selected = await this.readNetworkFieldValue(toggle);
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
          const after = await this.readNetworkFieldValue(
            await this.visibleNetworkFieldToggle(dialog),
          );
          return after.includes(nadName);
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
