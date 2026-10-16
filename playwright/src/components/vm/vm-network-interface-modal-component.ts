import BaseComponent from '@/components/shared/base-component';
import { TestTimeouts } from '@/utils/test-config';
import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

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

  private networkInterfaceDialog(title = /network interface/i): Locator {
    return this.page.getByRole('dialog', { name: title });
  }

  private nicNameInput(dialog: Locator): Locator {
    return dialog.locator('input#name');
  }

  private saveButton(dialog: Locator): Locator {
    return dialog.getByRole('button', { name: /^Save$/ });
  }

  private cancelButton(dialog: Locator): Locator {
    return dialog.getByRole('button', { name: /^Cancel$/ });
  }

  private wizardNetworkSelectToggle(): Locator {
    return this.consoleTestId('network-attachment-definition-select').locator('button').first();
  }

  private legacyNetworkSelectToggle(dialog: Locator): Locator {
    return dialog.locator('#network-attachment-definition button').first();
  }

  private pfNetworkOptionsMenuToggle(dialog: Locator): Locator {
    return dialog.getByRole('button', { name: 'Options menu' }).nth(1);
  }

  private networkAttachmentDefinitionOption(dialog: Locator, nadName: string): Locator {
    return dialog
      .getByRole('option', { name: nadName, exact: true })
      .or(this.page.getByRole('option', { name: nadName, exact: true }))
      .or(dialog.getByRole('menuitem', { name: nadName, exact: true }))
      .or(this.page.getByRole('menuitem', { name: nadName, exact: true }));
  }

  private networkChoiceLocator(dialog: Locator, option: string | RegExp): Locator {
    return dialog
      .getByRole('option', { name: option })
      .or(this.page.getByRole('option', { name: option }))
      .or(dialog.getByRole('menuitem', { name: option }))
      .or(this.page.getByRole('menuitem', { name: option }));
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
    await expect(candidates[2]).toBeVisible({ timeout: TestTimeouts.ELEMENT_WAIT });
    return candidates[2];
  }

  private async waitForModalNetworkFieldReady(dialog: Locator): Promise<void> {
    const toggle = await this.visibleNetworkFieldToggle(dialog);
    await expect(toggle).toBeVisible({ timeout: TestTimeouts.ELEMENT_WAIT });
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);
  }

  async openAddNetworkInterfaceModal(addButton: Locator): Promise<void> {
    await this.robustClick(addButton);
    const dialog = this.addNetworkInterfaceDialog();
    await expect(dialog).toBeVisible({ timeout: TestTimeouts.ELEMENT_WAIT });
    await this.waitForModalNetworkFieldReady(dialog);
  }

  async fillNicName(nicName: string): Promise<void> {
    const dialog = this.addNetworkInterfaceDialog();
    const nameInput = this.nicNameInput(dialog);
    await nameInput.click({ clickCount: 3 });
    await nameInput.fill(nicName);
  }

  /** Main-style name: NAD watch / auto-select settled in the add modal. */
  async waitForNetworkAutoSelection(nadName: string): Promise<void> {
    const dialog = this.addNetworkInterfaceDialog();
    const toggle = await this.visibleNetworkFieldToggle(dialog);
    await expect(toggle).toBeEnabled({ timeout: TestTimeouts.ELEMENT_WAIT });

    await expect
      .poll(
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
          timeout: TestTimeouts.ELEMENT_WAIT,
          intervals: [
            TestTimeouts.UI_DELAY_SHORT,
            TestTimeouts.RETRY_DELAY,
            2 * TestTimeouts.RETRY_DELAY,
          ],
        },
      )
      .toBe(true);
  }

  async selectNetwork(option: string | RegExp): Promise<void> {
    const dialog = this.networkInterfaceDialog();
    const toggle = await this.visibleNetworkFieldToggle(dialog);
    const current = (await toggle.textContent()) ?? '';
    if (typeof option === 'string' && current.includes(option)) {
      return;
    }
    await toggle.click();
    const choice = this.networkChoiceLocator(dialog, option);
    await expect(choice.first()).toBeVisible({ timeout: TestTimeouts.ELEMENT_WAIT });
    await choice.first().click();
    if (typeof option === 'string') {
      await expect(toggle).toContainText(option, { timeout: TestTimeouts.ELEMENT_WAIT });
    }
  }

  async save(): Promise<void> {
    const dialog = this.networkInterfaceDialog();
    const save = this.saveButton(dialog);
    await expect(save).toBeEnabled({ timeout: TestTimeouts.ELEMENT_WAIT });
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);
    await this.robustClick(save);
    await expect(dialog).toBeHidden({ timeout: TestTimeouts.ELEMENT_WAIT });
  }

  async cancel(): Promise<void> {
    const dialog = this.networkInterfaceDialog();
    await this.cancelButton(dialog).click();
    await expect(dialog).toBeHidden({ timeout: TestTimeouts.ELEMENT_WAIT });
  }

  async expectWizardModelSelectVisible(): Promise<void> {
    await expect(this.consoleTestId('model-select')).toBeVisible({
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
  }
}
