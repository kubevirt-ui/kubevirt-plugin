import BaseComponent from '@/components/shared/base-component';
import type { VirtualMachineDetailConfigurationComponent } from '@/components/vm/vm-detail-config-components';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

export class VirtualMachineDetailNetworkComponent extends BaseComponent {
  private readonly _networkCard = this.locator(
    '[data-test="overview-network-interfaces-card"], .VirtualMachinesOverviewTabInterfaces--main',
  );

  constructor(page: Page) {
    super(page);
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
}

export class VirtualMachineDetailOverviewTabComponent extends BaseComponent {
  private readonly _operatingSystem = this.locator('text=Operating system');
  private readonly _utilization = this.locator('text=Utilization');

  constructor(
    page: Page,
    private readonly widgets: VirtualMachineDetailOverviewWidgetsComponent,
    private readonly configuration: VirtualMachineDetailConfigurationComponent,
  ) {
    super(page);
  }

  async verifyOS(expectedOS: string): Promise<boolean> {
    const osLocator = this.locator(`text=${expectedOS}`);
    try {
      await osLocator.waitFor({ state: 'visible', timeout: TestTimeouts.VM_BOOTUP });
      return true;
    } catch {
      return false;
    }
  }

  async verifyOperatingSystem(): Promise<boolean> {
    try {
      await this._operatingSystem.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_VISIBILITY_QUICK,
      });
      return await this._operatingSystem.isVisible().catch(() => false);
    } catch {
      return false;
    }
  }

  async verifyUtilization(): Promise<boolean> {
    try {
      await this._utilization.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_VISIBILITY_QUICK,
      });
      return await this._utilization.isVisible().catch(() => false);
    } catch {
      return false;
    }
  }

  async verifyUtilizationCard(): Promise<boolean> {
    return this.widgets.verifyUtilizationCard();
  }

  async getStorageUtilizationText(): Promise<null | string> {
    return this.widgets.getStorageUtilizationText();
  }

  async mockFilesystemListResponse(mockData: {
    items: Array<{
      diskName: string;
      mountPoint: string;
      fileSystemType: string;
      totalBytes: number;
      usedBytes: number;
    }>;
  }): Promise<void> {
    return this.widgets.mockFilesystemListResponse(mockData);
  }

  async clearFilesystemListMock(): Promise<void> {
    return this.widgets.clearFilesystemListMock();
  }

  async verifyHardwareDevicesCard(): Promise<boolean> {
    return this.widgets.verifyHardwareDevicesCard();
  }

  async verifyHostname(vmName: string, expectedHostname: string): Promise<boolean> {
    return this.configuration.verifyHostname(vmName, expectedHostname);
  }

  async verifyAnnotationsInOverview(): Promise<boolean> {
    return await super.verifyTextVisible('Annotations', true);
  }

  getNetworkInterfaceIpLocator() {
    return this.locator('[data-test^="network-interface-ip-"]');
  }

  async isNetworkInterfaceIpVisible(
    timeout = TestTimeouts.UI_ELEMENT_VISIBILITY,
  ): Promise<boolean> {
    return this.getNetworkInterfaceIpLocator()
      .first()
      .waitFor({ state: 'visible', timeout })
      .then(() => true)
      .catch(() => false);
  }
}

export class VirtualMachineDetailOverviewWidgetsComponent extends BaseComponent {
  private readonly _virtualMachinesOverviewTabDisksMain = this.locator(
    '.VirtualMachinesOverviewTabDisks--main',
  );
  private readonly _virtualMachinesOverviewTabUtilizationMain = this.locator(
    '.VirtualMachinesOverviewTabUtilization--main',
  );
  private readonly _utilSummaryCpu = this.locator('[data-test-id="util-summary-cpu"]');
  private readonly _utilSummaryMemory = this.locator('[data-test-id="util-summary-memory"]');
  private readonly _utilSummaryStorage = this.locator('[data-test-id="util-summary-storage"]');
  private readonly _utilSummaryNetworkTransfer = this.locator(
    '[data-test-id="util-summary-network-transfer"]',
  );
  private readonly _utilChart = this.locator('.util-chart');
  private readonly _last5Minutes = this.locator('text=Last 5 minutes');
  private readonly _overviewHardwareDevicesCard = this.locator(
    '[data-test="overview-hardware-devices-card"]',
  );

  constructor(page: Page) {
    super(page);
  }

  async verifyDisksCard(): Promise<boolean> {
    try {
      await this._virtualMachinesOverviewTabDisksMain.scrollIntoViewIfNeeded();
      await this._virtualMachinesOverviewTabDisksMain.waitFor({
        state: 'visible',
        timeout: TestTimeouts.VM_CREATION,
      });

      const rootInCard = this._virtualMachinesOverviewTabDisksMain.locator(
        '[data-test-id="disk-rootdisk"]',
      );
      await rootInCard.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });

      const cloudInitInCard = this._virtualMachinesOverviewTabDisksMain.locator(
        '[data-test-id="disk-cloudinitdisk"], [data-test-id^="disk-cloudinit"]',
      );
      try {
        await cloudInitInCard.first().waitFor({
          state: 'visible',
          timeout: TestTimeouts.VM_CREATION,
        });
      } catch {
        const diskRows =
          this._virtualMachinesOverviewTabDisksMain.locator('[data-test-id^="disk-"]');
        const diskRowCount = await diskRows.count();
        if (diskRowCount < 2) {
          return false;
        }
      }

      const headerGroups = [
        ['Name'],
        ['Drive', 'Disk', 'Type'],
        ['Size', 'Capacity'],
        ['Interface', 'Bus'],
      ];
      let headerGroupsMatched = 0;
      for (const alternatives of headerGroups) {
        let matched = false;
        for (const header of alternatives) {
          const byDataLabel = this._virtualMachinesOverviewTabDisksMain.locator(
            `th[data-label="${header}"], [data-label="${header}"]`,
          );
          if ((await byDataLabel.count()) > 0) {
            matched = true;
            break;
          }
          const byText = this._virtualMachinesOverviewTabDisksMain.locator('th', {
            hasText: header,
          });
          if ((await byText.count()) > 0) {
            matched = true;
            break;
          }
        }
        if (matched) {
          headerGroupsMatched += 1;
        }
      }
      if (headerGroupsMatched < 3) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  async verifyUtilizationCard(): Promise<boolean> {
    try {
      await this._virtualMachinesOverviewTabUtilizationMain.scrollIntoViewIfNeeded();
      await this._virtualMachinesOverviewTabUtilizationMain.waitFor({
        state: 'visible',
        timeout: TestTimeouts.VM_CREATION,
      });

      await this._utilSummaryCpu.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      const cpuExists = await this._utilSummaryCpu.isVisible().catch(() => false);

      await this._utilSummaryMemory.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      const memoryExists = await this._utilSummaryMemory.isVisible().catch(() => false);

      await this._utilSummaryStorage.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      const storageExists = await this._utilSummaryStorage.isVisible().catch(() => false);

      await this._utilSummaryNetworkTransfer.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      const networkExists = await this._utilSummaryNetworkTransfer.isVisible().catch(() => false);

      if (!cpuExists || !memoryExists || !storageExists || !networkExists) {
        return false;
      }

      await this._utilChart
        .first()
        .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      const chartCount = await this._utilChart.count();
      if (chartCount < 3) {
        return false;
      }

      await this.locator(
        '.VirtualMachinesOverviewTabUtilization--main a[href*="/monitoring/query-browser"]',
      )
        .first()
        .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      const linkCount = await this.locator(
        '.VirtualMachinesOverviewTabUtilization--main a[href*="/monitoring/query-browser"]',
      ).count();
      if (linkCount === 0) {
        return false;
      }

      await this._last5Minutes
        .first()
        .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      const last5MinutesCount = await this._last5Minutes.count();
      return last5MinutesCount !== 0;
    } catch {
      return false;
    }
  }

  async getStorageUtilizationText(): Promise<null | string> {
    try {
      const storageSummary = this._utilSummaryStorage;
      await storageSummary.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      return await storageSummary.innerText();
    } catch {
      return null;
    }
  }

  async mockFilesystemListResponse(mockData: {
    items: Array<{
      diskName: string;
      mountPoint: string;
      fileSystemType: string;
      totalBytes: number;
      usedBytes: number;
    }>;
  }): Promise<void> {
    const guestOsInfo = { id: 'ubuntu', name: 'Ubuntu', versionId: '22.04' };

    await this.page.route('**/filesystemlist', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockData),
      });
    });

    await this.page.route(
      '**/kubevirt.io/v1/namespaces/*/virtualmachineinstances*',
      async (route) => {
        const url = route.request().url();
        if (url.includes('/filesystemlist') || url.includes('/guestosinfo')) {
          await route.continue();
          return;
        }
        try {
          const response = await route.fetch();
          const text = await response.text();
          const json = JSON.parse(text);
          const injectGuestOs = (obj: { status?: Record<string, unknown> }) => {
            if (obj?.status) obj.status.guestOSInfo = guestOsInfo;
          };
          if (json?.kind === 'VirtualMachineInstance') injectGuestOs(json);
          if (json?.items) json.items.forEach(injectGuestOs);
          await route.fulfill({
            status: response.status(),
            headers: response.headers(),
            body: JSON.stringify(json),
          });
        } catch {
          await route.continue();
        }
      },
    );

    await this.page.routeWebSocket(
      '**/kubevirt.io/v1/namespaces/*/virtualmachineinstances**',
      (ws) => {
        const server = ws.connectToServer();
        server.onMessage((message) => {
          try {
            const event = JSON.parse(message.toString());
            if (event?.object?.status) {
              event.object.status.guestOSInfo = guestOsInfo;
            }
            ws.send(JSON.stringify(event));
          } catch {
            ws.send(message);
          }
        });
        ws.onMessage((message) => {
          server.send(message);
        });
      },
    );
  }

  async clearFilesystemListMock(): Promise<void> {
    await this.page.unroute('**/filesystemlist');
    await this.page
      .unroute('**/kubevirt.io/v1/namespaces/*/virtualmachineinstances*')
      .catch(() => undefined);
  }

  async verifyHardwareDevicesCard(): Promise<boolean> {
    try {
      await this._overviewHardwareDevicesCard.scrollIntoViewIfNeeded();
      await this._overviewHardwareDevicesCard.waitFor({
        state: 'visible',
        timeout: TestTimeouts.VM_CREATION,
      });
      return true;
    } catch {
      return false;
    }
  }
}

export class VirtualMachineDetailSchedulingComponent extends BaseComponent {
  private readonly _configurationTab = this.locator(
    '[data-test-id="horizontal-link-Configuration"]',
  );
  private readonly _vmConfigurationScheduling = this.locator(
    '[data-test-id="vm-configuration-scheduling"]',
  );
  private readonly _vmConfigurationSsh = this.locator('[data-test-id="vm-configuration-ssh"]');
  private readonly _vmConfigurationDetails = this.locator(
    '[data-test-id="vm-configuration-details"]',
  );
  private readonly _configurationNetworkSubTab = this.locator(
    '[data-test-id="vm-configuration-network"]',
  );
  private readonly _sshAccessButton = this.locator('[data-test-id="ssh-access"] button');
  private readonly _sshCommandCopy = this.locator('[data-test="ssh-command-copy"]');
  private readonly _btnIdNodePort = this.locator('button[id="NodePort"]');
  private readonly _btnIdLoadBalancer = this.locator('button[id="LoadBalancer"]');
  private readonly _inProgress = this.locator('text=In progress');
  private readonly _descheduler = this.locator('[data-test-id="descheduler"]');
  private readonly _deschedulerEdit = this.locator('[data-test-id="descheduler-edit"]');
  private readonly _descheduler1 = this.locator('#descheduler');
  private readonly _copyFQDNBtn = this.locator('button:has-text("Copy FQDN")');
  private readonly _tabModal = this.locator('#tab-modal');
  private readonly _tabModalSaveButton = this.locator('#tab-modal [data-test="save-button"]');
  private readonly _roleDialog = this.locator('[role="dialog"]');
  private readonly _affinityRulesButton = this.locator(
    '[role="tabpanel"] button[data-test-id="affinity-rules"]',
  );
  private readonly _affinityModalCancelButton = this.locator(
    '[role="dialog"] [data-test="cancel-button"]',
  );

  constructor(page: Page) {
    super(page);
  }

  private async navigateToConfigurationTab(): Promise<void> {
    await this.navigateToTab(this._configurationTab, TestTimeouts.UI_ACTION_COMPLETE);
  }

  private async navigateToConfigurationDetails(): Promise<void> {
    await this.navigateToConfigurationTab();
    await this._vmConfigurationDetails.waitFor({
      state: 'visible',
      timeout: TestTimeouts.VM_CREATION,
    });
    await this.robustClick(this._vmConfigurationDetails);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async navigateToConfigurationScheduling(): Promise<void> {
    await this.navigateToConfigurationTab();
    await this._vmConfigurationScheduling.waitFor({
      state: 'visible',
      timeout: TestTimeouts.VM_CREATION,
    });
    await this.robustClick(this._vmConfigurationScheduling);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async navigateToVmSchedulingDirect(vmName: string, namespace: string): Promise<void> {
    await this.goTo(
      `/k8s/ns/${namespace}/kubevirt.io~v1~VirtualMachine/${vmName}/configuration/scheduling`,
    );
    await this._vmConfigurationScheduling.waitFor({
      state: 'visible',
      timeout: TestTimeouts.VM_CREATION,
    });
    await this._affinityRulesButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
  }

  async navigateToConfigurationSSH(): Promise<void> {
    await this.navigateToConfigurationTab();
    await this._vmConfigurationSsh.waitFor({
      state: 'visible',
      timeout: TestTimeouts.VM_CREATION,
    });
    await this.robustClick(this._vmConfigurationSsh);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async navigateToConfigurationNetwork(): Promise<void> {
    await this.navigateToConfigurationTab();
    await this.navigateToTab(this._configurationNetworkSubTab);
  }

  private async openDetailVmActionsMenu(): Promise<void> {
    const dropdown = this.locator('[data-test="actions-dropdown"]');
    const menuButton = this.locator('[data-test="actions-menu-button"]');
    const target = (await dropdown.count()) > 0 ? dropdown.first() : menuButton.first();
    await target.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
    await this.robustClick(target);
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

  async enableSSHOverNodePort(nodeAddress?: string): Promise<boolean> {
    try {
      await this.navigateToConfigurationSSH();

      await this._sshAccessButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await this.robustClick(this._sshAccessButton);

      await this._btnIdNodePort.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await this.robustClick(this._btnIdNodePort);

      await this._sshCommandCopy.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });

      const sshCommandExists = await this._sshCommandCopy
        .isVisible({ timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
        .catch(() => false);

      if (!sshCommandExists) {
        return false;
      }

      if (nodeAddress) {
        const sshCommandInput = this._sshCommandCopy.locator('input[aria-label="Copyable input"]');

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

  async verifyVnumaBadge(): Promise<boolean> {
    try {
      await this.navigateToConfigurationDetails();
      return await this.locator('.pf-v6-c-label__content:has-text("vNUMA")')
        .isVisible({ timeout: TestTimeouts.UI_VISIBILITY_QUICK })
        .catch(() => false);
    } catch {
      return false;
    }
  }

  async verifyDeschedulerIsOn(): Promise<boolean> {
    try {
      await this.navigateToConfigurationScheduling();
      await this._descheduler.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_VISIBILITY_QUICK,
      });
      const deschedulerText = await this._descheduler.textContent();
      const containsOn = deschedulerText?.includes('ON') || false;
      const exists = await this._descheduler.isVisible().catch(() => false);
      return containsOn && exists;
    } catch {
      return false;
    }
  }

  async setDescheduler(enabled: boolean): Promise<boolean> {
    try {
      await this.navigateToConfigurationScheduling();
      await this._deschedulerEdit.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_VISIBILITY_QUICK,
      });
      await this.robustClick(this._deschedulerEdit);

      const isChecked = await this._descheduler1.isChecked().catch(() => false);
      if (enabled && !isChecked) {
        await this._descheduler1.check({ force: true });
      } else if (!enabled && isChecked) {
        await this._descheduler1.uncheck({ force: true });
      }

      await this.clickSave();
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_LONG);
      return true;
    } catch {
      return false;
    }
  }

  async getRunStrategyValue(): Promise<string> {
    try {
      const runStrategyGroup = this.locator('[data-test-id="run-strategy"]').first();
      await runStrategyGroup.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_VISIBILITY_QUICK,
      });
      return (await runStrategyGroup.textContent())?.trim() || '';
    } catch {
      return '';
    }
  }

  async editRunStrategy(strategy: string): Promise<boolean> {
    const strategyLabels: Record<string, string> = {
      Always: 'Always',
      Halted: 'Halted',
      Manual: 'Manual',
      RerunOnFailure: 'Rerun on failure',
    };
    try {
      const editButton = this.locator('button[data-test-id="run-strategy"]');
      await editButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_VISIBILITY_QUICK,
      });
      await this.robustClick(editButton);

      await this._tabModal.waitFor({
        state: 'visible',
        timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
      });

      const selectToggle = this._tabModal.locator('.pf-v6-c-menu-toggle');
      await selectToggle.waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
      await this.robustClick(selectToggle);

      const label = strategyLabels[strategy] || strategy;
      const option = this.page
        .locator('button[role="option"]')
        .filter({ has: this.page.locator('.pf-v6-c-menu__item-text', { hasText: label }) });
      await option.waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
      await option.click();

      await this.robustClick(this._tabModalSaveButton);
      await this._tabModal.waitFor({
        state: 'hidden',
        timeout: TestTimeouts.ELEMENT_WAIT,
      });

      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
      return true;
    } catch {
      return false;
    }
  }

  async editRunStrategyViaActionsMenu(strategy: string): Promise<boolean> {
    const strategyLabels: Record<string, string> = {
      Always: 'Always',
      Halted: 'Halted',
      Manual: 'Manual',
      RerunOnFailure: 'Rerun on failure',
    };
    try {
      await this.openDetailVmActionsMenu();

      const actionItem = this.locator('[data-test-id="vm-action-change-run-strategy"]');
      await actionItem.waitFor({
        state: 'visible',
        timeout: TestTimeouts.SHORT_WAIT,
      });
      await this.robustClick(actionItem);

      const modal = this._roleDialog.filter({ hasText: 'Edit run strategy' });
      await modal.waitFor({
        state: 'visible',
        timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
      });

      const selectToggle = modal.locator('.pf-v6-c-menu-toggle');
      await selectToggle.waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
      await this.robustClick(selectToggle);

      const label = strategyLabels[strategy] || strategy;
      const option = this.page
        .locator('button[role="option"]')
        .filter({ has: this.page.locator('.pf-v6-c-menu__item-text', { hasText: label }) });
      await option.waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
      await this.robustClick(option);

      const saveButton = modal.locator('button').filter({ hasText: 'Save' }).first();
      await this.robustClick(saveButton);
      await modal.waitFor({
        state: 'hidden',
        timeout: TestTimeouts.ELEMENT_WAIT,
      });

      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
      return true;
    } catch {
      return false;
    }
  }

  async openAffinityRulesModal(): Promise<void> {
    await this._affinityRulesButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.page.waitForFunction(
      (selector: string) => {
        const el = document.querySelector(selector);
        return el && (el.textContent?.trim() ?? '').length > 0;
      },
      '[role="tabpanel"] button[data-test-id="affinity-rules"]',
      { timeout: TestTimeouts.SHORT_WAIT },
    );
    await this._affinityRulesButton.click({ force: true });
    await this._roleDialog.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
  }

  async getAffinityRulesButtonText(): Promise<string> {
    try {
      await this._affinityRulesButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await this.page.waitForFunction(
        (selector: string) => {
          const el = document.querySelector(selector);
          return el && (el.textContent?.trim() ?? '').length > 0;
        },
        '[role="tabpanel"] button[data-test-id="affinity-rules"]',
        { timeout: TestTimeouts.SHORT_WAIT },
      );
      return (await this._affinityRulesButton.innerText())?.trim() ?? '';
    } catch {
      return '';
    }
  }

  async cancelAffinityRulesModal(): Promise<void> {
    // Close any nested sub-dialog (e.g. "Add affinity rule") before cancelling the outer modal
    const innerCancelButton = this._roleDialog.getByRole('button', { name: 'Cancel' }).last();
    const innerCancelVisible = await innerCancelButton
      .isVisible({ timeout: TestTimeouts.SHORT_WAIT })
      .catch(() => false);
    if (innerCancelVisible) {
      await this.robustClick(innerCancelButton);
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MICRO);
    }
    await this._affinityModalCancelButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(this._affinityModalCancelButton);
    await this._roleDialog.waitFor({
      state: 'hidden',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
  }

  async openPreferredAffinityRuleForm(): Promise<void> {
    const addRuleButton = this._roleDialog.getByRole('button', { name: 'Add affinity rule' });
    await addRuleButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(addRuleButton);

    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    const conditionButton = this._roleDialog.getByRole('button', {
      name: 'Required during scheduling',
    });
    await conditionButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(conditionButton);

    const preferredOption = this.page
      .getByRole('option', { name: 'Preferred during scheduling' })
      .first();
    await preferredOption.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await preferredOption.click();
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    await this._roleDialog.waitFor({
      state: 'visible',
      timeout: TestTimeouts.SHORT_WAIT,
    });

    const weightInput = this.getWeightInput();
    await weightInput.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
  }

  private getWeightInput() {
    return this._roleDialog.locator('.pf-v6-c-form-control input, input[type="text"]').first();
  }

  async typeInAffinityWeightInput(text: string): Promise<string> {
    try {
      const weightInput = this.getWeightInput();
      await weightInput.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      await weightInput.clear();
      await weightInput.fill(text);
      return (await weightInput.inputValue()) ?? '';
    } catch {
      return '';
    }
  }

  async copyNicFqdn(nicName: string): Promise<null | string> {
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

      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM); // Wait for clipboard to be updated
      const clipboardText = await this.page.evaluate(async () => {
        return await navigator.clipboard.readText();
      });

      return clipboardText;
    } catch {
      return null;
    }
  }
}
