/**
 * Configuration → Network tab: NIC row actions, NAD select, pending-changes alert.
 */

import BaseComponent from '@/components/shared/base-component';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

export default class VmConfigurationNetworkComponent extends BaseComponent {
  private readonly _configurationNetworkSubTab = this.testId('vm-configuration-network');
  private readonly _configurationTab = this.testId('horizontal-link-Configuration');
  private readonly _editNicModal = this.testId('dialog-modal');
  private readonly _nadSelectInput = this.testId('select-nad-input').locator('input');
  private readonly _nadSelectToggle = this.testId('select-nad');
  private readonly _pendingChangesAlert = this.testId('pending-changes-alert');

  constructor(page: Page) {
    super(page);
  }

  private nicActionsKebab(nicName: string) {
    return this.testId(`nic-actions-${nicName}`);
  }

  private nicNetworkCell(nicName: string) {
    return this.testId(`nic-network-${nicName}`);
  }

  async changeNicNetworkAttachment(nicName: string, nadName: string): Promise<void> {
    await this.navigateToConfigurationNetwork();

    const kebab = this.nicActionsKebab(nicName);
    await kebab.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(kebab);

    const editItem = this.testId('network-interface-edit');
    await editItem.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(editItem);

    await this._editNicModal.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });

    await this._nadSelectToggle.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(this._nadSelectToggle);

    await this._nadSelectInput.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this._nadSelectInput.fill(nadName);

    const nadOption = this.testId(`network-option-${nadName}`);
    await nadOption.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(nadOption);

    await this.robustClick(this._editNicModal.getByTestId('save-button'));
    await this._editNicModal.waitFor({
      state: 'hidden',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
  }

  async getNicNetworkName(nicName: string): Promise<string> {
    const cell = this.nicNetworkCell(nicName);
    await cell.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    return (await cell.textContent())?.trim() ?? '';
  }

  async navigateToConfigurationNetwork(): Promise<void> {
    await this.navigateToTab(this._configurationTab);
    await this.navigateToTab(this._configurationNetworkSubTab);
  }

  async verifyNicDisplaysNad(nicName: string, expectedNadName: string): Promise<boolean> {
    try {
      await this.navigateToConfigurationNetwork();
      const text = await this.getNicNetworkName(nicName);
      return text.includes(expectedNadName);
    } catch {
      return false;
    }
  }

  async waitForPendingChangesAlert(
    timeout: number = TestTimeouts.PENDING_CHANGES,
  ): Promise<boolean> {
    try {
      await this._pendingChangesAlert.first().waitFor({ state: 'visible', timeout });
      return this._pendingChangesAlert.first().isVisible();
    } catch {
      return false;
    }
  }
}
