/**
 * Configuration → Network tab: NIC row actions, NAD select, pending-changes alert.
 */

import BaseComponent from '@/components/shared/base-component';
import { TestTimeouts } from '@/utils/test-config';
import type { Locator, Page } from '@playwright/test';

export default class VmConfigurationNetworkComponent extends BaseComponent {
  private readonly _configurationNetworkSubTab = this.testId('vm-configuration-network');
  private readonly _configurationTab = this.testId('horizontal-link-Configuration');
  private readonly _editNicModal = this.testId('dialog-modal');
  private readonly _nadSelectInput = this.testId('select-nad-input').locator('input');
  private readonly _nadSelectToggle = this.testId('select-nad');
  private readonly _pendingChangesAlert = this.testId('pending-changes-alert');
  private readonly _addNetworkInterfaceButton = this.page.getByRole('button', {
    name: 'Add network interface',
  });

  constructor(page: Page) {
    super(page);
  }

  private nicActionsKebab(nicName: string): Locator {
    return this.testId(`nic-actions-${nicName}`);
  }

  private nicNetworkCell(nicName: string): Locator {
    return this.testId(`nic-network-${nicName}`);
  }

  private nicNetworkDisconnectState(nicName: string): Locator {
    return this.nicNetworkCell(nicName).getByTestId('verified-resource-link-disconnect');
  }

  async changeNicNetworkAttachment(nicName: string, nadName: string): Promise<void> {
    await this.openEditNetworkInterfaceModal(nicName);

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

  async openAddNetworkInterfaceModal(): Promise<void> {
    await this.navigateToConfigurationNetwork();
    await this._addNetworkInterfaceButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(this._addNetworkInterfaceButton);
    await this._editNicModal.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
  }

  async openEditNetworkInterfaceModal(nicName: string): Promise<void> {
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
  }

  async waitForNetworkAutoSelection(): Promise<void> {
    await this._nadSelectToggle.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });

    const hasSelection = await this.waitForCondition(
      async () => {
        const value = await this._nadSelectInput.inputValue().catch(() => '');
        return value.trim().length > 0;
      },
      TestTimeouts.UI_ELEMENT_VISIBILITY,
      TestTimeouts.UI_DELAY_SHORT,
    );

    if (!hasSelection) {
      throw new Error('No network was auto-selected in the NIC modal');
    }
  }

  async expandNetworkInterfaceAdvancedSettings(): Promise<void> {
    const advancedSettings = this._editNicModal.getByRole('button', { name: 'Advanced settings' });
    await advancedSettings.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(advancedSettings);
  }

  async getNicNetworkName(nicName: string): Promise<string> {
    const cell = this.nicNetworkCell(nicName);
    await cell.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    return (await cell.textContent())?.trim() ?? '';
  }

  async getNicNetworkBrokenLinkTooltipText(nicName: string): Promise<string> {
    const disconnectState = this.nicNetworkDisconnectState(nicName);
    await disconnectState.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await disconnectState.hover();
    const tooltip = this.page.getByRole('tooltip');
    await tooltip.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    return (await tooltip.textContent())?.trim() ?? '';
  }

  async isNicNetworkResourceLinkVisible(nicName: string): Promise<boolean> {
    const link = this.nicNetworkCell(nicName).getByRole('link');
    try {
      await link.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      return await link.isVisible();
    } catch {
      return false;
    }
  }

  async waitForNicNetworkBrokenLink(
    nicName: string,
    nadName: string,
    timeout: number = TestTimeouts.ELEMENT_WAIT,
  ): Promise<void> {
    const disconnectState = this.nicNetworkDisconnectState(nicName);
    await disconnectState.waitFor({ state: 'visible', timeout });
    const text = (await disconnectState.textContent())?.trim() ?? '';
    if (!text.includes(nadName)) {
      throw new Error(
        `Expected broken NAD link for ${nicName} to show "${nadName}", got "${text}"`,
      );
    }
  }

  async navigateToConfigurationNetwork(): Promise<void> {
    await this.navigateToTab(this._configurationTab);
    await this.navigateToTab(this._configurationNetworkSubTab);
  }

  async verifyNicDisplaysNad(nicName: string, expectedNadName: string): Promise<boolean> {
    try {
      await this.navigateToConfigurationNetwork();
      const text = (await this.getNicNetworkName(nicName)).trim();
      return text === expectedNadName.trim();
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
