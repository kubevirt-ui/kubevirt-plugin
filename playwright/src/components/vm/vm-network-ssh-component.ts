import BaseComponent from '@/components/shared/base-component';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

export default class VmNetworkSshComponent extends BaseComponent {
  private readonly _btnIdLoadBalancer = this.locator('button[id="LoadBalancer"]');
  private readonly _btnIdNodePort = this.locator('button[id="NodePort"]');
  private readonly _configurationNetworkSubTab = this.locator(
    '[data-test-id="vm-configuration-network"]',
  );
  private readonly _copyFQDNBtn = this.locator('button:has-text("Copy FQDN")');
  private readonly _inProgress = this.locator('text=In progress');
  private readonly _networkCard = this.locator(
    '[data-test="overview-network-interfaces-card"], [data-test="vm-network-interface-list"]',
  );
  private readonly _sshAccessButton = this.locator('[data-test-id="ssh-access"] button');

  private readonly _sshServiceTypeSelect = this.locator('[data-test-id="ssh-service-type"]');

  private readonly _vmConfigurationSsh = this.locator('[data-test-id="vm-configuration-ssh"]');

  constructor(page: Page) {
    super(page);
  }

  private getServiceTypeToggle() {
    return this.page
      .locator(
        [
          'button.pf-v6-c-menu-toggle:has-text("None")',
          'button.pf-v6-c-menu-toggle:has-text("NodePort")',
          'button.pf-v6-c-menu-toggle:has-text("LoadBalancer")',
          'button.pf-v5-c-menu-toggle:has-text("None")',
          'button.pf-v5-c-menu-toggle:has-text("NodePort")',
          'button.pf-v5-c-menu-toggle:has-text("LoadBalancer")',
        ].join(', '),
      )
      .first();
  }

  async copyNicFqdn(nicName: string): Promise<string | null> {
    try {
      await this.navigateToConfigurationNetwork();

      const nicRow = this.locator(`[data-test-rows="resource-row"]:has-text("${nicName}")`);
      await nicRow.waitFor({ state: 'visible', timeout: TestTimeouts.UI_VISIBILITY_QUICK });

      const menuToggle = nicRow.locator('button.pf-v6-c-menu-toggle');
      await menuToggle.waitFor({
        state: 'visible',
        timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
      });
      await this.robustClick(menuToggle);

      await this._copyFQDNBtn.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_DELAY_MEDIUM,
      });
      await this.robustClick(this._copyFQDNBtn);

      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
      const clipboardText = await this.page.evaluate(async () => {
        return await navigator.clipboard.readText();
      });

      return clipboardText;
    } catch {
      return null;
    }
  }

  async enableSSHOverLoadBalancer(): Promise<boolean> {
    try {
      await this.navigateToConfigurationSSH();

      await this._sshAccessButton
        .first()
        .waitFor({ state: 'visible', timeout: TestTimeouts.UI_VISIBILITY_QUICK });
      await this.robustClick(this._sshAccessButton.first());

      await this._btnIdLoadBalancer.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_DELAY_MEDIUM,
      });
      await this.robustClick(this._btnIdLoadBalancer);

      await this._inProgress.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_VISIBILITY_QUICK,
      });
      const inProgressExists = await this._inProgress
        .isVisible({ timeout: TestTimeouts.UI_VISIBILITY_QUICK })
        .catch(() => false);

      return inProgressExists;
    } catch {
      return false;
    }
  }

  async enableSSHOverNodePort(nodeAddress?: string): Promise<boolean> {
    try {
      await this.navigateToConfigurationSSH();
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

      const serviceTypeToggle = this.getServiceTypeToggle();
      await serviceTypeToggle.waitFor({
        state: 'visible',
        timeout: TestTimeouts.DEFAULT,
      });
      await this.robustClick(serviceTypeToggle);

      const nodePortOption = this.page.locator(
        '[role="option"]#NodePort, [role="option"]:has-text("NodePort")',
      );
      await nodePortOption.first().waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });

      const isDisabled = await nodePortOption
        .first()
        .getAttribute('aria-disabled')
        .then((v) => v === 'true')
        .catch(() => false);
      if (isDisabled) {
        await this.page.keyboard.press('Escape');
        return false;
      }

      await this.robustClick(nodePortOption.first());

      const sshCommandCopy = this.locator('[data-test="ssh-command-copy"]');
      await sshCommandCopy.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });

      const sshCommandExists = await sshCommandCopy
        .isVisible({ timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
        .catch(() => false);

      if (!sshCommandExists) {
        return false;
      }

      if (nodeAddress) {
        const sshCommandInput = sshCommandCopy.locator('input[aria-label="Copyable input"]');

        await sshCommandInput.waitFor({
          state: 'visible',
          timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
        });

        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

        const sshCommandValue = await sshCommandInput.getAttribute('value');
        if (!sshCommandValue?.includes(nodeAddress)) {
          return false;
        }
      }

      return true;
    } catch {
      return false;
    }
  }

  async isNodePortAvailable(): Promise<boolean> {
    try {
      await this.navigateToConfigurationSSH();

      const serviceTypeToggle = this.getServiceTypeToggle();
      const toggleVisible = await serviceTypeToggle
        .isVisible({ timeout: TestTimeouts.UI_DELAY_SHORT })
        .catch(() => false);

      if (!toggleVisible) {
        return true;
      }

      await this.robustClick(serviceTypeToggle);
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

      const nodePortOption = this.page.locator(
        '[role="option"]#NodePort, [role="option"]:has-text("NodePort")',
      );
      const optionExists = await nodePortOption
        .first()
        .isVisible({ timeout: TestTimeouts.UI_DELAY_SHORT })
        .catch(() => false);

      if (!optionExists) {
        await this.page.keyboard.press('Escape');
        return false;
      }

      const isDisabled = await nodePortOption
        .first()
        .getAttribute('aria-disabled')
        .then((v) => v === 'true')
        .catch(() => false);

      await this.page.keyboard.press('Escape');
      return !isDisabled;
    } catch {
      return false;
    }
  }

  async navigateToConfigurationNetwork() {
    await this.navigateToConfigurationTab();
    await super.navigateToTab(this._configurationNetworkSubTab);
  }

  async navigateToConfigurationSSH() {
    await this.navigateToConfigurationTab();
    await this._vmConfigurationSsh.waitFor({
      state: 'visible',
      timeout: TestTimeouts.VM_CREATION,
    });
    await this.robustClick(this._vmConfigurationSsh);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async navigateToConfigurationTab() {
    await super.navigateToTab(
      this.locator('[data-test-id="horizontal-link-Configuration"]'),
      TestTimeouts.UI_ACTION_COMPLETE,
    );
  }

  async navigateToNetworks(): Promise<void> {
    await super.navigateToTab(this.locator('[data-test-id="horizontal-link-Network interfaces"]'));
  }

  async navigateToNetworkTabFromOverview(): Promise<void> {
    await this._networkCard.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
    await this.locator(
      '.VirtualMachinesOverviewTabInterfaces--main .pf-v6-c-card__title a',
    ).waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(
      this.locator('.VirtualMachinesOverviewTabInterfaces--main .pf-v6-c-card__title a'),
    );
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async verifyHeadlessServiceFQDN(
    vmName: string,
    namespace: string,
    hostname?: string,
  ): Promise<boolean> {
    try {
      const fqdnGroup = this.locator('.VirtualMachinesOverviewTabNetworkFQDN--main');
      await fqdnGroup.scrollIntoViewIfNeeded();
      await fqdnGroup.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });

      const expectedFQDN = hostname
        ? `${hostname}.headless.${namespace}.svc.cluster.local`
        : `${vmName}.headless.${namespace}.svc.cluster.local`;

      const fqdnText = fqdnGroup.locator(`text=${expectedFQDN}`);
      const fqdnExists = await fqdnText.isVisible().catch(() => false);

      return fqdnExists;
    } catch {
      return false;
    }
  }

  async verifyIpAddress(ipAddress: string, timeout = 60000): Promise<boolean> {
    try {
      await this._networkCard.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });

      const ipLocator = this._networkCard.locator(`text=${ipAddress}`);
      await ipLocator.waitFor({ state: 'visible', timeout });
      return await ipLocator.isVisible().catch(() => false);
    } catch {
      return false;
    }
  }

  async verifyL2BridgeExists(): Promise<boolean> {
    try {
      await this.navigateToConfigurationNetwork();
      const isVisible = await this.locator('text=L2 bridge')
        .isVisible({ timeout: TestTimeouts.VM_CREATION })
        .catch(() => false);
      return isVisible;
    } catch {
      return false;
    }
  }

  async verifyMasqueradeDoesNotExist(): Promise<boolean> {
    try {
      await this.navigateToConfigurationNetwork();
      const isVisible = await this.locator('text=Masquerade')
        .isVisible({ timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION })
        .catch(() => false);
      return !isVisible;
    } catch {
      return true;
    }
  }

  async verifyNetworkInterfacesCard(): Promise<boolean> {
    try {
      const networkInterfacesTable = this.locator(
        '[data-test="overview-network-interfaces-card"], [data-test="overview-network-interfaces-table"], [data-test="vm-network-interface-list"]',
      );
      await networkInterfacesTable.first().waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      return true;
    } catch {
      return false;
    }
  }

  async verifyPodNetworking(): Promise<boolean> {
    return await super.verifyTextVisible('Pod networking');
  }

  async verifySecretOnSSHTab(secretName: string): Promise<boolean> {
    try {
      const secretLocator = this.locator(`[data-test-id="${secretName}"]`);
      await secretLocator.waitFor({
        state: 'visible',
        timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
      });
      return true;
    } catch {
      return false;
    }
  }

  async verifySSHAccess(): Promise<boolean> {
    return await super.verifyTextVisible('SSH access');
  }

  async verifyVmHasNoNics(): Promise<boolean> {
    try {
      await this.navigateToConfigurationTab();
      await this._configurationNetworkSubTab.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_VISIBILITY_QUICK,
      });
      await this.robustClick(this._configurationNetworkSubTab);
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_LONG);

      await this.locator('text=No network interface definitions found').waitFor({
        state: 'visible',
        timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
      });
      return true;
    } catch {
      return false;
    }
  }
}
