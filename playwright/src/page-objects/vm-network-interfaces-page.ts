import { VmNetworkInterfaceModalComponent } from '@/components/vm/vm-network-interface-modal-component';
import BasePage from '@/page-objects/base-page';
import { TestTimeouts } from '@/utils/test-config';
import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

/** VM detail → Network interfaces tab; modals via {@link VmNetworkInterfaceModalComponent}. */
export class VmNetworkInterfacesPage extends BasePage {
  private readonly modal: VmNetworkInterfaceModalComponent;

  constructor(page: Page) {
    super(page);
    this.modal = new VmNetworkInterfaceModalComponent(page);
  }

  private addNetworkInterfaceButton(): Locator {
    return this.page.getByRole('button', { name: /Add network interface/i });
  }

  private networkDialog(title = /network interface/i): Locator {
    return this.page.getByRole('dialog', { name: title });
  }

  private nicNameGridCell(nicName: string): Locator {
    return this.page.locator('[role="gridcell"]').filter({ hasText: new RegExp(`^${nicName}$`) });
  }

  private nicRow(nicName: string): Locator {
    return this.page
      .getByRole('grid')
      .filter({ has: this.nicNameGridCell(nicName) })
      .getByRole('row')
      .filter({ has: this.nicNameGridCell(nicName) })
      .first();
  }

  private nicGridRows(): Locator {
    return this.page.locator('[role="grid"]').last().locator('[role="row"]');
  }

  async expectNicVisible(nicName: string): Promise<void> {
    await expect(this.nicNameGridCell(nicName).first()).toBeVisible({
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
  }

  async expectNicAbsent(nicName: string): Promise<void> {
    await expect(this.nicRow(nicName)).toHaveCount(0);
  }

  async expectPodNetworkingCellVisible(): Promise<void> {
    await expect(this.page.getByRole('gridcell', { name: 'Pod networking' })).toBeVisible({
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
  }

  async expectNetworkAttachmentCellVisible(nadName: string): Promise<void> {
    await expect(this.page.getByRole('gridcell', { name: nadName })).toBeVisible({
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
  }

  async expectAddNetworkInterfaceButtonVisible(): Promise<void> {
    await expect(this.addNetworkInterfaceButton()).toBeVisible({
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
  }

  async expectDefaultPodNetworkInterfaceVisible(): Promise<void> {
    await this.expectNicVisible('default');
    await this.expectPodNetworkingCellVisible();
  }

  async expectWizardModelSelectVisible(): Promise<void> {
    return this.modal.expectWizardModelSelectVisible();
  }

  async openNicActionsMenu(nicName: string): Promise<void> {
    const rows = this.nicGridRows();
    const rowCount = await rows.count();
    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i);
      const text = (await row.textContent()) ?? '';
      if (!text.includes(nicName)) {
        continue;
      }
      await row.locator('button').first().click({ force: true });
      return;
    }
    throw new Error(`Network interface row not found for ${nicName}`);
  }

  async editNicName(currentName: string, newName: string): Promise<void> {
    await this.openNicActionsMenu(currentName);
    await this.page.getByRole('menuitem', { name: /^Edit$/ }).click();
    const dialog = this.networkDialog(/Edit network interface/i);
    await dialog.locator('input#name').fill(newName);
    const save = dialog.getByRole('button', { name: /^Save$/ });
    await expect(save).toBeEnabled({ timeout: TestTimeouts.ELEMENT_WAIT });
    await save.click();
    await expect(this.page.getByRole('gridcell', { name: newName, exact: true })).toBeVisible({
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
  }

  async editNicModel(currentNicName: string, modelLabel: string): Promise<void> {
    await this.openNicActionsMenu(currentNicName);
    await this.page.getByRole('menuitem', { name: /^Edit$/ }).click();
    const dialog = this.networkDialog(/Edit network interface/i);
    await dialog.locator('#model').getByRole('button').click();
    const modelOption = this.page
      .getByRole('option', { name: modelLabel, exact: true })
      .or(this.page.getByRole('menuitem', { name: modelLabel, exact: true }));
    await modelOption.first().click();
    const save = dialog.getByRole('button', { name: /^Save$/ });
    await expect(save).toBeEnabled({ timeout: TestTimeouts.ELEMENT_WAIT });
    await save.click();
    await expect(
      this.nicRow(currentNicName).getByRole('gridcell', { name: modelLabel, exact: true }),
    ).toBeVisible({ timeout: TestTimeouts.ELEMENT_WAIT });
  }

  async deleteNic(nicName: string): Promise<void> {
    await this.openNicActionsMenu(nicName);
    await this.page
      .locator('[role="menuitem"]')
      .filter({ hasText: /^Delete$/ })
      .click();
    const dialog = this.networkDialog(/Delete NIC/i);
    await dialog.getByRole('button', { name: /^Delete$/ }).click();
    await expect(dialog).toBeHidden({ timeout: TestTimeouts.ELEMENT_WAIT });
  }

  async openAddNetworkInterfaceModal(): Promise<void> {
    await this.modal.openAddNetworkInterfaceModal(this.addNetworkInterfaceButton());
  }

  async fillAddNetworkInterfaceForm(nicName: string): Promise<void> {
    await this.modal.fillNicName(nicName);
  }

  async waitForNetworkAttachmentDefinitionInAddModal(nadName: string): Promise<void> {
    await this.modal.waitForNetworkAutoSelection(nadName);
  }

  async waitForAddModalNetworkSelected(nadName: string): Promise<void> {
    await this.waitForNetworkAttachmentDefinitionInAddModal(nadName);
  }

  async selectNetworkInModal(option: string | RegExp): Promise<void> {
    await this.modal.selectNetwork(option);
  }

  async saveNetworkInterfaceModal(): Promise<void> {
    await this.modal.save();
  }

  async cancelNetworkInterfaceModal(): Promise<void> {
    await this.modal.cancel();
  }

  async addNetworkInterface(nicName: string, nadName: string): Promise<void> {
    await this.openAddNetworkInterfaceModal();
    await this.waitForAddModalNetworkSelected(nadName);
    await this.fillAddNetworkInterfaceForm(nicName);
    await this.saveNetworkInterfaceModal();
    await this.expectNicVisible(nicName);
  }

  async addAndDeleteNetworkInterface(nicName: string, nadName: string): Promise<void> {
    await this.addNetworkInterface(nicName, nadName);
    await this.deleteNic(nicName);
    await this.expectNicAbsent(nicName);
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
    await this.expectNicVisible(nicName);
  }

  async waitForNetworkTabReady(): Promise<void> {
    await expect(this.addNetworkInterfaceButton()).toBeVisible({
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);
  }
}
