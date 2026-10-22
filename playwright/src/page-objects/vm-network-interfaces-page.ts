import { VmNetworkInterfaceModalComponent } from '@/components/vm/vm-network-interface-modal-component';
import BasePage from '@/page-objects/base-page';
import { pollUntil } from '@/utils/poll-until';
import { TestTimeouts } from '@/utils/test-config';
import type { Locator, Page } from '@playwright/test';

/** VM detail → Network interfaces tab; modals via {@link VmNetworkInterfaceModalComponent}. */
export class VmNetworkInterfacesPage extends BasePage {
  private readonly modal: VmNetworkInterfaceModalComponent;

  constructor(page: Page) {
    super(page);
    this.modal = new VmNetworkInterfaceModalComponent(page);
  }

  private networkDialog(title = /network interface/i): Locator {
    return this.page.getByRole('dialog', { name: title });
  }

  private nicGridRows(): Locator {
    return this.page.locator('[role="grid"]').last().locator('[role="row"]');
  }

  async addAndDeleteNetworkInterface(nicName: string, nadName: string): Promise<void> {
    await this.addNetworkInterface(nicName, nadName);
    await this.deleteNic(nicName);
    await pollUntil(async () => (await this.nicRow(nicName).count()) === 0, {
      message: `NIC ${nicName} should be removed from the grid`,
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
  }

  async addNetworkInterface(nicName: string, nadName: string): Promise<void> {
    await this.openAddNetworkInterfaceModal();
    await this.waitForAddModalNetworkSelected(nadName);
    await this.fillAddNetworkInterfaceForm(nicName);
    if (nadName) {
      await this.selectNetworkInModal(nadName).catch(() => undefined);
    }
    await this.saveNetworkInterfaceModal();
    await pollUntil(
      async () =>
        await this.nicNameCell(nicName)
          .isVisible()
          .catch(() => false),
      {
        message: `NIC ${nicName} should appear in the grid`,
        timeout: TestTimeouts.LONG_OPERATION,
      },
    );
  }

  addNetworkInterfaceButton(): Locator {
    return this.page
      .getByRole('tabpanel', { name: /Network interfaces/i })
      .getByRole('button', { name: /Add network interface/i })
      .or(this.page.locator('.add-network-interface-button'))
      .or(
        this.page
          .getByTestId('item-create')
          .filter({ hasText: /Add network interface/i })
          .first(),
      )
      .first();
  }

  /** @deprecated Use {@link addNetworkInterface} */
  async addSecondaryNetworkInterface(nicName: string, nadName?: string): Promise<void> {
    await this.addNetworkInterface(nicName, nadName ?? '');
  }

  async addSecondaryNetworkInterfaceInWizard(nicName: string, nadName: string): Promise<void> {
    await this.openAddNetworkInterfaceModal();
    await this.waitForNetworkAttachmentDefinitionInAddModal(nadName);
    await this.fillAddNetworkInterfaceForm(nicName);
    await this.selectNetworkInModal(nadName);
    await this.saveNetworkInterfaceModal();
    await this.nicNameCell(nicName).waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
  }

  async cancelNetworkInterfaceModal(): Promise<void> {
    await this.modal.cancel();
  }

  async deleteNic(nicName: string): Promise<void> {
    await this.openNicActionsMenu(nicName);
    await this.page
      .locator('[role="menuitem"]')
      .filter({ hasText: /^Delete$/ })
      .click();
    const dialog = this.networkDialog(/Delete NIC/i);
    await dialog.getByRole('button', { name: /^Delete$/ }).click();
    await dialog.waitFor({ state: 'hidden', timeout: TestTimeouts.ELEMENT_WAIT });
  }

  async editNicModel(currentNicName: string, modelLabel: string): Promise<void> {
    await this.openNicActionsMenu(currentNicName);
    await this.page.getByRole('menuitem', { name: /^Edit$/ }).click();
    const dialog = this.networkDialog(/Edit network interface/i);
    await dialog.locator('#model').getByRole('button').click();
    const modelOption = this.page
      .getByRole('option', { exact: true, name: modelLabel })
      .or(this.page.getByRole('menuitem', { exact: true, name: modelLabel }));
    await modelOption.first().click();
    const save = dialog.getByRole('button', { name: /^Save$/ });
    await pollUntil(async () => await save.isEnabled(), {
      message: 'Save edited NIC model should be enabled',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await save.click();
    await this.nicRow(currentNicName)
      .getByRole('gridcell', { exact: true, name: modelLabel })
      .waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
  }

  async editNicName(currentName: string, newName: string): Promise<void> {
    await this.openNicActionsMenu(currentName);
    await this.page.getByRole('menuitem', { name: /^Edit$/ }).click();
    const dialog = this.networkDialog(/Edit network interface/i);
    await dialog.locator('input#name').fill(newName);
    const save = dialog.getByRole('button', { name: /^Save$/ });
    await pollUntil(async () => await save.isEnabled(), {
      message: 'Save edited NIC name should be enabled',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await save.click();
    await this.page
      .getByRole('gridcell', { exact: true, name: newName })
      .waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
  }

  async fillAddNetworkInterfaceForm(nicName: string): Promise<void> {
    await this.modal.fillNicName(nicName);
  }

  networkAttachmentCell(nadName: string): Locator {
    return this.page.getByRole('gridcell', { name: nadName });
  }

  nicNameCell(nicName: string): Locator {
    return this.page
      .locator('[role="gridcell"]')
      .filter({ hasText: new RegExp(nicName, 'i') })
      .first();
  }

  nicRow(nicName: string): Locator {
    return this.page
      .getByRole('grid')
      .filter({ has: this.nicNameCell(nicName) })
      .getByRole('row')
      .filter({ has: this.nicNameCell(nicName) })
      .first();
  }

  async openAddNetworkInterfaceModal(): Promise<void> {
    await this.modal.openAddNetworkInterfaceModal(this.addNetworkInterfaceButton());
  }

  async openNicActionsMenu(nicName: string): Promise<void> {
    const row = this.page.locator('[role="row"]').filter({
      has: this.page.locator('[role="gridcell"]').filter({ hasText: new RegExp(nicName, 'i') }),
    });
    if (
      await row
        .first()
        .isVisible()
        .catch(() => false)
    ) {
      await row.first().locator('button').last().click({ force: true });
      return;
    }
    const rows = this.nicGridRows();
    const rowCount = await rows.count();
    for (let i = 0; i < rowCount; i++) {
      const candidate = rows.nth(i);
      const text = (await candidate.textContent()) ?? '';
      if (!text.includes(nicName)) {
        continue;
      }
      await candidate.locator('button').first().click({ force: true });
      return;
    }
    throw new Error(`Network interface row not found for ${nicName}`);
  }

  podNetworkingCell(): Locator {
    return this.page.getByRole('gridcell', { name: 'Pod networking' });
  }

  async saveNetworkInterfaceModal(): Promise<void> {
    await this.modal.save();
  }

  async selectNetworkInModal(option: RegExp | string): Promise<void> {
    await this.modal.selectNetwork(option);
  }

  async waitForAddModalNetworkSelected(nadName: string): Promise<void> {
    await this.waitForNetworkAttachmentDefinitionInAddModal(nadName);
  }

  async waitForNetworkAttachmentDefinitionInAddModal(nadName: string): Promise<void> {
    await this.modal.waitForNetworkAutoSelection(nadName);
  }

  async waitForNetworkTabReady(): Promise<void> {
    await this.addNetworkInterfaceButton()
      .or(this.podNetworkingCell())
      .first()
      .waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);
  }

  wizardModelSelect(): Locator {
    return this.modal.modelSelect();
  }
}
