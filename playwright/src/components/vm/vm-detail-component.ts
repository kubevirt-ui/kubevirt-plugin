import type { KubernetesResource } from '@/data-models/kubernetes-types';
import PageCommons from '@/page-objects/page-commons';
import { MOCK_ENDPOINTS, MockResponses } from '@/utils/mock-responses';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export default class VmDetailComponent extends PageCommons {
  private readonly _actionsMenuButton = this.testId('actions-menu-button');
  private readonly _alertsCard = this.locator('.alerts-card__drawer');
  private readonly _connectingText = this.locator('text=Connecting');
  private readonly _cpuMemoryButton = this.testId('virtual-machine-overview-details-cpu-memory');
  private readonly _deletionProtectionCheckbox = this.locator('input#deletion-protection');
  private readonly _deletionProtectionLabel = this.locator('label[for="deletion-protection"]');
  private readonly _enableBtn = this.locator('button:has-text("Enable")');
  private readonly _guestSystemLogDisabledText = this.locator(
    'text=Guest system logs are disabled at cluster',
  );
  private readonly _guestSystemLogText = this.testId('vm-diagnostics-guest-system-log');
  private readonly _horizontalLinkOverview = this.testId('horizontal-link-Overview');
  private readonly _inputSearchInput = this.locator('input[aria-label="Search input"]');
  private readonly _last5Minutes = this.locator('text=Last 5 minutes');
  private readonly _migrationMenu = this.testId('migration-menu');
  private readonly _operatingSystem = this.locator('text=Operating system');
  private readonly _overviewHardwareDevicesCard = this.testId('overview-hardware-devices-card');
  private readonly _snapshotsCard = this.testId('virtual-machine-overview-snapshots');

  private readonly _successIcon = this.testId('success-icon');

  private readonly _utilChart = this.locator('.util-chart');

  private readonly _utilSummaryCpu = this.testId('util-summary-cpu');

  private readonly _utilSummaryMemory = this.testId('util-summary-memory');

  private readonly _utilSummaryNetworkTransfer = this.testId('util-summary-network-transfer');

  private readonly _utilSummaryStorage = this.testId('util-summary-storage');

  private readonly _virtualMachinesOverviewTabDisksMain = this.locator(
    '.VirtualMachinesOverviewTabDisks--main',
  );

  private readonly _virtualMachinesOverviewTabUtilizationMain = this.locator(
    '.VirtualMachinesOverviewTabUtilization--main',
  );

  private readonly _vmActionDeleteButton = this.testId('vm-action-delete').locator('button');

  private readonly _vmName = this.testId('virtual-machine-overview-details-name');

  private readonly _vmOverviewDetailsStatus = this.testId(
    'virtual-machine-overview-details-status',
  ).locator('button');

  private readonly _vncContainer = this.locator('.vnc-container');

  constructor(page: Page) {
    super(page);
  }

  async assertAlertMoreLinkInsideMessage(): Promise<boolean> {
    const alertItem = this._alertsCard.locator('.alert-item').first();
    await alertItem.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });

    const moreInsideMessage = await alertItem.evaluate((el) => {
      const message = el.querySelector('.alert-item__message');
      const more = el.querySelector('.alert-item__more');
      return !!message && !!more && message.contains(more);
    });
    return moreInsideMessage;
  }

  async clearFilesystemListMock(): Promise<void> {
    await this.page.unroute('**/filesystemlist');
    await this.page
      .unroute('**/kubevirt.io/v1/namespaces/*/virtualmachineinstances*')
      .catch(() => undefined);
  }

  async clearPrometheusRulesMock(): Promise<void> {
    await this.page.unroute(`${MOCK_ENDPOINTS.PROMETHEUS_RULES}*`);
  }

  override async clickActionsDropdown() {
    await this._actionsMenuButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(this._actionsMenuButton);
  }

  async clickDeleteActionInDropdown() {
    await this._vmActionDeleteButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(this._vmActionDeleteButton);
    await this.testId('dialog-modal').waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
  }

  async clickPauseActionIcon() {
    await this.hoverOverControlMenu();
    await this._vmActionPauseButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(this._vmActionPauseButton);
  }

  async clickResetActionIcon() {
    await this.hoverOverControlMenu();
    await this._vmActionReset.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await expect(
      this._vmActionReset,
      'Reset action in VM control menu should be enabled before clicking',
    ).toBeEnabled({ timeout: TestTimeouts.UI_ACTION_COMPLETE });
    await this.robustClick(this._vmActionReset);
  }

  async clickRestartActionIcon() {
    await this.hoverOverControlMenu();
    await this._vmActionRestartButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(this._vmActionRestartButton);
  }

  async clickRestartButton() {
    await this._vmActionRestartButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(this._vmActionRestartButton);
  }

  async clickStartActionIcon() {
    await this.hoverOverControlMenu();
    await this._vmActionStart.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await expect(
      this._vmActionStart,
      'Start action in VM control menu should be enabled before clicking',
    ).toBeEnabled({ timeout: TestTimeouts.UI_ACTION_COMPLETE });
    await this.robustClick(this._vmActionStart);
  }

  async clickStatusAndVerifyLearnMoreInDialog(): Promise<boolean> {
    await this._vmOverviewDetailsStatus.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(this._vmOverviewDetailsStatus);
    await new Promise((r) => setTimeout(r, 1500));

    const dialogSelectors = [
      '.pf-v6-c-popover__content',
      '.pf-v5-c-popover__content',
      '[role="dialog"]',
      '.pf-v6-c-popover',
      '[data-ouia-component-type="PF4/Popover"]',
    ];

    for (const selector of dialogSelectors) {
      const dialog = this.locator(selector).first();
      try {
        await dialog.waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_MEDIUM });
        const learnMore = dialog.getByText('Learn more', { exact: false });
        const learnMoreFirst = learnMore.first();
        const visible = await learnMoreFirst.isVisible().catch(() => false);
        if (visible) {
          await learnMoreFirst.click();
          await dialog.waitFor({ state: 'hidden', timeout: TestTimeouts.UI_DELAY_MEDIUM });
          return true;
        }
      } catch {
        continue;
      }
    }

    const learnMorePage = this.page.getByText('Learn more', { exact: false }).first();
    const visible = await learnMorePage.isVisible().catch(() => false);
    if (visible) {
      await learnMorePage.click();
      for (const sel of dialogSelectors) {
        try {
          await this.locator(sel)
            .first()
            .waitFor({ state: 'hidden', timeout: TestTimeouts.UI_DELAY_MEDIUM });
          return true;
        } catch {
          continue;
        }
      }
    }
    return false;
  }

  async clickStopActionButton() {
    await this._vmActionStopButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(this._vmActionStopButton);
  }

  async clickStopActionIcon() {
    await this.hoverOverControlMenu();
    await this._vmActionStopButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(this._vmActionStopButton);
  }

  async clickUnpauseActionIcon() {
    await this.hoverOverControlMenu();
    await this._vmActionUnpauseButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(this._vmActionUnpauseButton);
  }

  async clickVmActionsDropdown() {
    await this.openVmActionsDropdown();
  }

  async clickVmiByTestId(vmName: string): Promise<void> {
    const vmiLocator = this.testId(vmName).first();
    await vmiLocator.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(vmiLocator);
  }

  async deleteVm() {
    await this._vmActionDeleteButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(this._vmActionDeleteButton);
    await this.clickDeleteConfirmationButton();
    await this.page.waitForTimeout(TestTimeouts.UI_STABILIZE);
  }

  async expandAlertsAccordion(): Promise<void> {
    await this._alertsCard.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
    const mainToggle = this._alertsCard.locator('#toggle-main');
    const isExpanded = (await mainToggle.getAttribute('aria-expanded')) === 'true';
    if (!isExpanded) {
      await this.robustClick(mainToggle);
    }
  }

  async expandWarningSeverityAccordion(): Promise<void> {
    const warningToggle = this._alertsCard.locator('#warning');
    await warningToggle.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    const isExpanded = (await warningToggle.getAttribute('aria-expanded')) === 'true';
    if (!isExpanded) {
      await this.robustClick(warningToggle);
    }
  }

  async getAlertMoreLinkText(): Promise<string> {
    const moreLink = this._alertsCard.locator('.alert-item__more a').first();
    await moreLink.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    return (await moreLink.textContent())?.trim() || '';
  }

  override getCurrentUrl(): string {
    return this.page.url();
  }

  async getStorageUtilizationText(): Promise<string | null> {
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

  async isDeleteActionDisabled(): Promise<boolean> {
    try {
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      const isDisabled = await this._vmActionDeleteButton.isDisabled();
      return isDisabled;
    } catch {
      return false;
    }
  }

  async isDeleteProtectionSet(): Promise<boolean> {
    try {
      await this._deletionProtectionCheckbox.waitFor({
        state: 'visible',
        timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
      });
      return await this._deletionProtectionCheckbox.isChecked();
    } catch {
      return false;
    }
  }

  async isHorizontalNavbarRoutesPresent(): Promise<boolean> {
    try {
      return await this.locator('#horizontal-navbar-routes').isVisible({
        timeout: TestTimeouts.UI_VISIBILITY_QUICK,
      });
    } catch {
      return false;
    }
  }

  async isSaveAsTemplateRunningAlertVisible(): Promise<boolean> {
    try {
      const alert = this.locator('.pf-v6-c-alert.pf-m-info');
      await alert.waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_MEDIUM });
      const text = await alert.textContent();
      return text?.includes('running VirtualMachine') ?? false;
    } catch {
      return false;
    }
  }

  async isTabBarVisibleAfterScroll(): Promise<boolean> {
    const overviewTab = this._horizontalLinkOverview;
    try {
      await overviewTab.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    } catch {
      return false;
    }

    await this.page.evaluate(() => {
      const scrollable =
        document.querySelector('.pf-v6-c-drawer__content') ??
        document.querySelector('[class*="drawer"] [class*="content"]') ??
        document.documentElement;
      scrollable.scrollTop = scrollable.scrollHeight;
    });
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    const box = await this._horizontalLinkOverview.boundingBox();
    if (!box) return false;
    const viewport = this.page.viewportSize();
    if (!viewport) return false;
    return box.y >= 0 && box.y + box.height <= viewport.height;
  }

  async isTextVisible(text: string, timeout: number = TestTimeouts.ELEMENT_WAIT): Promise<boolean> {
    try {
      const textLocator = this.locator(`text=${text}`);
      await textLocator.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  async isVmNameSpanVisible(
    vmName: string,
    timeout: number = TestTimeouts.DEFAULT,
  ): Promise<boolean> {
    try {
      const vmNameSpan = this.testId('vms-treeview').locator('span', { hasText: vmName }).first();

      await vmNameSpan.waitFor({ state: 'visible', timeout });

      return await vmNameSpan.isVisible();
    } catch (error) {
      return false;
    }
  }

  async isVmNameVisible(
    expectedName?: string,
    timeout: number = TestTimeouts.DEFAULT,
  ): Promise<boolean> {
    await this._vmName.waitFor({ state: 'visible', timeout });

    if (!expectedName) {
      return true;
    }

    const actualText = await this._vmName.textContent();
    return actualText?.includes(expectedName) ?? false;
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
          const json = JSON.parse(text) as KubernetesResource & { items?: KubernetesResource[] };
          const injectGuestOs = (obj: KubernetesResource): void => {
            if (obj.status && typeof obj.status === 'object') {
              (obj.status as Record<string, unknown>).guestOSInfo = guestOsInfo;
            }
          };
          if (json.kind === 'VirtualMachineInstance') injectGuestOs(json);
          if (Array.isArray(json.items)) json.items.forEach(injectGuestOs);
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

  async mockPrometheusRulesWithWarning(vmName: string, namespace: string): Promise<void> {
    const mockBody = MockResponses.createPrometheusAlertsResponse(vmName, namespace);
    await this.page.route(`${MOCK_ENDPOINTS.PROMETHEUS_RULES}*`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockBody),
      });
    });
  }

  async navigateToDiagnostics() {
    await super.navigateToTab(this.testId('horizontal-link-Diagnostics'));
  }

  async navigateToEvents() {
    await super.navigateToTab(this.testId('horizontal-link-Events'));
  }

  async navigateToOverview() {
    await this._horizontalLinkOverview.waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await this.robustClick(this._horizontalLinkOverview);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async navigateToVirtualMachineDetail(vmName: string, namespace: string) {
    await this.goTo(`/k8s/ns/${namespace}/kubevirt.io~v1~VirtualMachine/${vmName}`);
  }

  async openActionsDropdownAndClickMigrateCompute(): Promise<void> {
    await this.robustClick(this._vmActionsDropdown);

    await this._migrationMenu.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(this._migrationMenu);

    await this._vmActionMigrateCompute.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(this._vmActionMigrateCompute);
  }

  async pauseVmFromActionsDropdown() {
    await this.performVmAction('pause');
  }

  async resetVmFromActionsDropdown() {
    await this.performVmAction('reset');
  }

  async restartVmFromActionsDropdown() {
    await this.performVmAction('restart');
  }

  async saveAsTemplate(
    templateName: string,
    project: string,
    options?: { category?: string },
  ): Promise<void> {
    await this.performVmAction('save-as-template');

    const nameInput = this.locator('#template-name');
    await nameInput.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await nameInput.clear();
    await nameInput.fill(templateName);

    const projectToggle = this.locator('button[placeholder="Select project"]');
    await projectToggle.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(projectToggle);

    const searchInput = this._inputSearchInput;
    await searchInput.fill(project);
    const projectOption = this.locator(`[role="option"]:has-text("${project}")`);
    await projectOption.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(projectOption);

    if (options?.category) {
      const categorySelect = this.locator('[data-test="template-category-select"]');
      await categorySelect.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      const categoryInput = categorySelect.locator('input[role="combobox"]');
      await this.robustClick(categoryInput);
      await categoryInput.fill(options.category);
      const categoryOption = this.page
        .getByRole('option', { name: options.category, exact: true })
        .first();
      await categoryOption.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await this.robustClick(categoryOption);
    }

    const submitBtn = this.locator('button:has-text("Save as template")').last();
    await submitBtn.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(submitBtn);
    await this.page
      .waitForURL(/\/templates/, { timeout: TestTimeouts.NAVIGATION })
      .catch(() => undefined);
    await this.waitForLoadingComplete(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async setDeleteProtection() {
    await this._deletionProtectionCheckbox.waitFor({
      state: 'visible',
      timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
    });
    const isChecked = await this._deletionProtectionCheckbox.isChecked();
    if (!isChecked) {
      await this.robustClick(this._deletionProtectionLabel);
      await this._enableBtn.waitFor({
        state: 'visible',
        timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
      });
      await this.robustClick(this._enableBtn);
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
    }
  }

  async startVmFromActionsDropdown() {
    await this.performVmAction('start');
  }

  async stopVmFromActionsDropdown() {
    await this.performVmAction('stop');
  }

  async unpauseVmFromActionsDropdown() {
    await this.performVmAction('unpause');
  }

  async unsetDeleteProtection() {
    await this._deletionProtectionCheckbox.waitFor({
      state: 'visible',
      timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
    });
    const isChecked = await this._deletionProtectionCheckbox.isChecked();
    if (isChecked) {
      await this.robustClick(this._deletionProtectionLabel);

      const dialog = this.locator('[role="dialog"]');
      const dialogDisableButton = dialog.locator('footer button', {
        hasText: 'Disable',
      });
      await dialogDisableButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });

      const patchDone = this.page.waitForResponse(
        (resp) =>
          resp.url().includes('virtualmachines') &&
          resp.request().method() === 'PATCH' &&
          resp.status() >= 200 &&
          resp.status() < 300,
        { timeout: TestTimeouts.UI_ACTION_COMPLETE },
      );
      await this.robustClick(dialogDisableButton);
      await patchDone;
      await dialog.waitFor({ state: 'hidden', timeout: TestTimeouts.UI_ACTION_COMPLETE });
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
    }
  }

  async verifyAlertsCard(): Promise<boolean> {
    try {
      await this._alertsCard.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
      return true;
    } catch {
      return false;
    }
  }

  async verifyAnnotationsInOverview(): Promise<boolean> {
    return await super.verifyTextVisible('Annotations', true);
  }

  async verifyDetailsCard(
    vmName: string,
    templateName?: string,
    options?: { requireVncPreview?: boolean },
  ): Promise<boolean> {
    const requireVncPreview = options?.requireVncPreview !== false;
    try {
      await this.locator('.VirtualMachinesOverviewTabDetails--details').waitFor({
        state: 'visible',
        timeout: TestTimeouts.VM_CREATION,
      });

      const nameText = await this._vmName.textContent();
      const arch = process.env.ARCH || 'amd64';
      if (!nameText?.includes(vmName) && !nameText?.includes(arch)) {
        return false;
      }

      const createdExists = await this.testId('virtual-machine-overview-details-created')
        .isVisible()
        .catch(() => false);
      if (!createdExists) {
        return false;
      }

      const osExists = await this.testId('virtual-machine-overview-details-os')
        .isVisible()
        .catch(() => false);
      if (!osExists) {
        return false;
      }

      const cpuMemExists = await this._cpuMemoryButton.isVisible().catch(() => false);
      if (!cpuMemExists) {
        return false;
      }

      const hostnameExists = await this.testId('virtual-machine-overview-details-host')
        .isVisible()
        .catch(() => false);
      if (!hostnameExists) {
        return false;
      }

      let vncExists = true;
      let connectingNotExists = true;
      if (requireVncPreview) {
        await this._vncContainer.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
        vncExists = await this._vncContainer.isVisible().catch(() => false);
        connectingNotExists = !(await this._connectingText.isVisible().catch(() => false));
      }

      if (templateName) {
        const byTestId = this.testId(templateName);
        let templateExists = await byTestId.isVisible().catch(() => false);
        if (!templateExists) {
          const byDataTest = this.locator(`[data-test-id="${templateName}"]`);
          templateExists = await byDataTest.isVisible().catch(() => false);
        }
        if (!templateExists) {
          return false;
        }
      }

      return (
        createdExists &&
        osExists &&
        cpuMemExists &&
        hostnameExists &&
        vncExists &&
        connectingNotExists
      );
    } catch {
      return false;
    }
  }

  async verifyDisksCard(): Promise<boolean> {
    try {
      await this._virtualMachinesOverviewTabDisksMain.scrollIntoViewIfNeeded();
      await this._virtualMachinesOverviewTabDisksMain.waitFor({
        state: 'visible',
        timeout: TestTimeouts.VM_CREATION,
      });

      const rootInCard = this._virtualMachinesOverviewTabDisksMain.getByTestId('disk-rootdisk');
      await rootInCard.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });

      const cloudInitInCard = this._virtualMachinesOverviewTabDisksMain
        .getByTestId('disk-cloudinitdisk')
        .or(this._virtualMachinesOverviewTabDisksMain.locator('[data-test^="disk-cloudinit"]'));
      try {
        await cloudInitInCard.first().waitFor({
          state: 'visible',
          timeout: TestTimeouts.VM_CREATION,
        });
      } catch {
        const diskRows = this._virtualMachinesOverviewTabDisksMain.locator('[data-test^="disk-"]');
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

  async verifyDownload(): Promise<boolean> {
    return await super.verifyTextVisible('Download');
  }

  async verifyGuestSystemLogDisabled(): Promise<boolean> {
    try {
      await this._guestSystemLogText.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await this.robustClick(this._guestSystemLogText);

      const messageVisible = await this._guestSystemLogDisabledText
        .isVisible({ timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
        .catch(() => false);

      return messageVisible;
    } catch {
      return false;
    }
  }

  async verifyGuestSystemLogEnabled(): Promise<boolean> {
    try {
      await this._guestSystemLogText.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await this.robustClick(this._guestSystemLogText);

      const disabledMsg = await this._guestSystemLogDisabledText
        .isVisible({ timeout: TestTimeouts.SHORT_WAIT })
        .catch(() => false);
      if (disabledMsg) return false;

      const searchInputVisible = await this._inputSearchInput
        .isVisible({ timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
        .catch(() => false);
      if (searchInputVisible) return true;

      const logViewer = this.locator('.pf-v6-c-log-viewer, .pf-c-log-viewer, [class*="LogViewer"]');
      return await logViewer
        .first()
        .isVisible({ timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
        .catch(() => false);
    } catch {
      return false;
    }
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

  async verifyInstanceType(expectedInstanceType: string): Promise<boolean> {
    try {
      await this.testId('virtual-machine-overview-details-instance-type').waitFor({
        state: 'visible',
        timeout: TestTimeouts.VM_CREATION,
      });
      const instanceTypeText = await this.testId(
        'virtual-machine-overview-details-instance-type',
      ).textContent();
      return instanceTypeText?.includes(expectedInstanceType) ?? false;
    } catch {
      return false;
    }
  }

  async verifyNoErrorBoundary(waitMs = 3000): Promise<boolean> {
    const errorIndicator = this.page.locator('text=Something wrong happened');
    const hasError = await errorIndicator.isVisible({ timeout: waitMs }).catch(() => false);
    return !hasError;
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

  async verifyOS(expectedOS: string): Promise<boolean> {
    const osLocator = this.locator(`text=${expectedOS}`);
    try {
      await osLocator.waitFor({ state: 'visible', timeout: TestTimeouts.VM_BOOTUP });
      return true;
    } catch {
      return false;
    }
  }

  async verifyPageTabsVisible(): Promise<boolean> {
    const tab = this.page.locator('[role="tab"]').first();
    return await tab.isVisible({ timeout: TestTimeouts.UI_ELEMENT_VISIBILITY }).catch(() => false);
  }

  async verifySnapshotInCard(): Promise<boolean> {
    try {
      await this._snapshotsCard.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });

      const snapshotsLink = this._snapshotsCard.locator('a:has-text("Snapshots (1)")');
      const snapshotsLinkExists = await snapshotsLink
        .isVisible({ timeout: TestTimeouts.STATUS_VALIDATION })
        .catch(() => false);

      if (!snapshotsLinkExists) {
        return false;
      }

      await snapshotsLink.click();

      await this._successIcon
        .waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT })
        .catch(() => {
          return;
        });
      const successExists = await this._successIcon.isVisible().catch(() => false);

      return successExists;
    } catch {
      return false;
    }
  }

  async verifySnapshotsCardVisible(): Promise<boolean> {
    try {
      await this._snapshotsCard.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
      return true;
    } catch {
      return false;
    }
  }

  async verifyStatusConditions(): Promise<boolean> {
    return await super.verifyTextVisible('Status conditions');
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

  async verifyVirtualMachineStuckInUnhealthyStateWarningVisible(): Promise<boolean> {
    try {
      await this._alertsCard.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
      const alertContent = this._alertsCard.locator('text=VirtualMachineStuckInUnhealthyState');
      await alertContent.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      return true;
    } catch {
      return false;
    }
  }

  async verifyVMCannotBeEvictedWarningVisible(): Promise<boolean> {
    try {
      await this._alertsCard.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
      const alertContent = this._alertsCard.locator('text=VMCannotBeEvicted');
      await alertContent.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      return true;
    } catch {
      return false;
    }
  }

  async verifyVmOverviewStatus(expectedStatus: string): Promise<boolean> {
    try {
      await this._vmOverviewDetailsStatus.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      const statusText = await this._vmOverviewDetailsStatus.textContent();
      return statusText?.trim().includes(expectedStatus) ?? false;
    } catch {
      return false;
    }
  }

  async verifyVmStartEvent(timeout: number = TestTimeouts.DEFAULT): Promise<boolean> {
    const eventText = `Streaming events...`;
    return await super.verifyTextVisible(eventText, true, timeout);
  }

  async waitForVmOverviewStatusContains(
    expectedSubstring: string,
    timeout: number = TestTimeouts.DEFAULT,
  ): Promise<void> {
    await this._vmOverviewDetailsStatus.waitFor({ state: 'visible', timeout });
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const text = (await this._vmOverviewDetailsStatus.textContent())?.trim() ?? '';
      if (text.includes(expectedSubstring)) {
        return;
      }
      await this.page.waitForTimeout(TestTimeouts.RETRY_DELAY);
    }
  }
}
