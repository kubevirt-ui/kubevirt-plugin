/**
 * VirtualMachine detail — Console/VNC and Diagnostics/cloud-init components.
 */

import BaseComponent from '@/components/shared/base-component';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

export class VirtualMachineDetailConsoleComponent extends BaseComponent {
  private readonly _activeUsers = this.locator('text=Active users');
  private readonly _btnRoleTabHasTextScreen2 = this.locator(
    'button[role="tab"]:has-text("Screen 2")',
  );
  private readonly _btnTypeButtonHasTextSendKey = this.locator(
    'button[type="button"]:has-text("Send key")',
  );
  private readonly _canvas = this.locator('canvas');
  private readonly _connectingText = this.locator('text=Connecting');
  private readonly _ctrlAlt1 = this.locator('text=Ctrl + Alt + 1');
  private readonly _ctrlAlt2 = this.locator('text=Ctrl + Alt + 2');
  private readonly _elapsedTimeSinceLogin = this.locator('text=Elapsed time since login');
  private readonly _guestLoginCredentials = this.locator('text=Guest login credentials');
  private readonly _horizontalLinkOverview = this.testId('horizontal-link-Overview');
  private readonly _vncConnectButton = this.locator('.console-vnc svg');
  private readonly _vncConsoleContainer = this.locator('.console-container canvas');
  private readonly _vncContainer = this.locator('.vnc-container');
  private readonly _vncDisconnectUserAndConnectButton = this.locator(
    'button:has-text("Disconnect user and connect")',
  );
  private readonly _vncNoConnectionPlaceholder = this.locator('.vnc-no-connection-placeholder');

  constructor(page: Page) {
    super(page);
  }

  private async copyAndPasteToVncConsole(
    copyButton: ReturnType<typeof this.locator>,
    _fieldName: string,
    _sendEnterAfterPaste = false,
  ): Promise<boolean> {
    try {
      await copyButton.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
      await this.robustClick(copyButton);
      await this.page.waitForTimeout(TestTimeouts.VNC_PASTE_DELAY);

      const pasteButton = this.locator('button:has-text("Paste to console")');
      await pasteButton.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
      await this.robustClick(pasteButton);
      await this.page.waitForTimeout(TestTimeouts.VNC_PASTE_DELAY);

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Clicks the "Open web console" button on the Console tab and captures the new tab URL.
   * The button disconnects the embedded VNC session and opens the standalone console in a new window.
   */
  async clickOpenWebConsoleAndCaptureNewTab(closeTab = true): Promise<string> {
    const button = this.locator('button', { hasText: 'Open web console' });
    await button.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });

    const newPagePromise = this.page.context().waitForEvent('page');
    await this.robustClick(button);

    const newPage = await newPagePromise;
    await newPage.waitForLoadState('domcontentloaded');
    const newTabUrl = newPage.url();

    if (closeTab) {
      await newPage.close();
    }

    return newTabUrl;
  }

  async clickStandaloneConsoleLink(vmName: string, namespace: string): Promise<void> {
    const standaloneConsoleLinkSelector = `a[href*="/k8s/ns/${namespace}/kubevirt.io~v1~VirtualMachine/${vmName}/console/standalone"]`;

    const standaloneLink = this.page.locator(standaloneConsoleLinkSelector);
    await standaloneLink.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(standaloneLink);
  }

  async clickVncConnectButton(): Promise<void> {
    await this._vncConnectButton.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(this._vncConnectButton);
  }

  async clickVncEmptyStateConnectButton(): Promise<void> {
    const emptyStateConnectButton = this.locator('.virtual-machine-console-page button', {
      hasText: 'Connect',
    });
    await emptyStateConnectButton.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(emptyStateConnectButton);
  }

  async getSerialConsoleTerminalWidth(): Promise<number> {
    const xtermContainer = this.locator('.xterm-screen');
    await xtermContainer.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
    const box = await xtermContainer.boundingBox();
    return box?.width ?? 0;
  }

  /**
   * Checks whether the "Open web console" button is visible on the embedded Console tab.
   * Added by CNV-84283 to allow opening the standalone console from the Console tab.
   */
  async isOpenWebConsoleButtonVisible(
    timeout: number = TestTimeouts.ELEMENT_WAIT,
  ): Promise<boolean> {
    try {
      const button = this.locator('button', { hasText: 'Open web console' });
      await button.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
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

  async isVncConsoleActive(): Promise<boolean> {
    const canvasVisible = await this._vncConsoleContainer.isVisible().catch(() => false);
    const placeholderVisible = await this._vncNoConnectionPlaceholder
      .isVisible()
      .catch(() => false);

    return canvasVisible && !placeholderVisible;
  }

  async navigateToConsole(): Promise<void> {
    await this.navigateToTab(this.testId('horizontal-link-Console'));
  }

  async navigateToOverview(): Promise<void> {
    await this._horizontalLinkOverview.waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await this.robustClick(this._horizontalLinkOverview);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async navigateToVncConsoleAndWaitReady(): Promise<boolean> {
    try {
      await this.navigateToConsole();
      await this.page.waitForTimeout(TestTimeouts.UI_VISIBILITY_QUICK);
      return await this.verifyVncConsoleReady();
    } catch {
      return false;
    }
  }

  /**
   * Clicks "Open web console", waits for the standalone console tab to load,
   * and checks whether the RHACM compatibility error is displayed.
   * Returns the new tab URL and whether the error was visible, then closes the tab.
   * Used to verify CNV-86873: standalone console must not show RHACM incompatibility error for spoke VMs.
   */
  async openWebConsoleAndCheckForRhacmError(
    loadWait = 3000,
  ): Promise<{ url: string; rhacmErrorVisible: boolean }> {
    const button = this.locator('button', { hasText: 'Open web console' });
    await button.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });

    const newPagePromise = this.page.context().waitForEvent('page');
    await this.robustClick(button);

    const newPage = await newPagePromise;
    await newPage.waitForLoadState('domcontentloaded');
    await newPage.waitForTimeout(loadWait);

    const url = newPage.url();
    const rhacmErrorVisible = await newPage
      .locator(
        'text="A version of RHACM that is compatible with the multicluster SDK is not available"',
      )
      .isVisible()
      .catch(() => false);

    await newPage.close();
    return { url, rhacmErrorVisible };
  }

  async pastePasswordToVncConsole(): Promise<boolean> {
    return await this.copyAndPasteToVncConsole(
      this.locator('.cloud-init-credentials-user-pass button[aria-label="Copy to clipboard"]').nth(
        1,
      ),
      'password',
      true,
    );
  }

  async pasteUsernameToVncConsole(): Promise<boolean> {
    const result = await this.copyAndPasteToVncConsole(
      this.locator(
        '.cloud-init-credentials-user-pass button[aria-label="Copy to clipboard"]',
      ).first(),
      'username',
      true,
    );
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);
    return result;
  }

  async performVncConsolePaste(): Promise<void> {
    await this.pasteUsernameToVncConsole();
    await this.pastePasswordToVncConsole();
  }

  async switchToSerialConsole(): Promise<void> {
    const typeSelector = this.locator('#pf-v6-c-console__type-selector');
    await typeSelector.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(typeSelector);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    const serialOption = this.page.locator('[role="option"]', { hasText: 'Serial console' });
    await serialOption.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await serialOption.click();
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  /**
   * Try to dismiss the VNC "Try later" dialog if visible.
   * This dialog appears when another VNC session is in use.
   * Clicking "Try later" dismisses the dialog without disconnecting the other session.
   *
   * @param timeout - Timeout to wait for the dialog (default: 3 seconds)
   * @returns true if dialog was dismissed, false if not visible
   */
  async tryDismissVncTryLaterDialog(
    timeout: number = TestTimeouts.UI_DELAY_LONG,
  ): Promise<boolean> {
    try {
      const vncTryLaterButton = this.locator('button:has-text("Try later")');
      await vncTryLaterButton.waitFor({ state: 'visible', timeout });
      await this.robustClick(vncTryLaterButton);
      return true;
    } catch {
      return false;
    }
  }

  async verifyActiveUsers(present: boolean, timeout = 60000): Promise<boolean> {
    try {
      await this.navigateToOverview();

      await this._activeUsers.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_VISIBILITY_QUICK,
      });
      await this._activeUsers.scrollIntoViewIfNeeded();

      if (present) {
        await this._elapsedTimeSinceLogin.waitFor({
          state: 'visible',
          timeout: timeout || TestTimeouts.ACTIVE_USERS,
        });
        return await this._elapsedTimeSinceLogin.isVisible().catch(() => false);
      } else {
        await this._elapsedTimeSinceLogin.waitFor({
          state: 'hidden',
          timeout: timeout || TestTimeouts.ACTIVE_USERS,
        });
        const isVisible = await this._elapsedTimeSinceLogin.isVisible().catch(() => false);
        return !isVisible;
      }
    } catch {
      return false;
    }
  }

  async verifyConsoleNotVisible(): Promise<boolean> {
    try {
      await this.navigateToConsole();
      const exists = await this.locator('.VirtualMachineConsolePage-page-section')
        .isVisible({ timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION })
        .catch(() => false);
      return !exists; // headless: console chrome omitted
    } catch {
      return false;
    }
  }

  async verifyGuestLogin(): Promise<boolean> {
    return await this.verifyTextVisible('Guest login');
  }

  async verifySerialConsoleRenderedProperly(minWidth = 200): Promise<boolean> {
    try {
      await this.navigateToConsole();
      await this.page.waitForTimeout(TestTimeouts.UI_VISIBILITY_QUICK);
      await this.switchToSerialConsole();
      const width = await this.getSerialConsoleTerminalWidth();
      return width >= minWidth;
    } catch {
      return false;
    }
  }

  async verifyVncConsoleReady(timeout: number = TestTimeouts.VNC_CONSOLE_READY): Promise<boolean> {
    try {
      const vncDisconnectUserAndConnectButtonVisible = await this._vncDisconnectUserAndConnectButton
        .isVisible({ timeout: TestTimeouts.UI_DELAY_LONG })
        .catch(() => false);
      if (vncDisconnectUserAndConnectButtonVisible) {
        await this._vncDisconnectUserAndConnectButton.waitFor({
          state: 'visible',
          timeout: TestTimeouts.ELEMENT_WAIT,
        });
        await this.robustClick(this._vncDisconnectUserAndConnectButton);
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      }

      const connectButtonVisible = await this._vncConnectButton
        .isVisible({ timeout: TestTimeouts.RETRY_DELAY })
        .catch(() => false);
      if (connectButtonVisible) {
        await this.robustClick(this._vncConnectButton);
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      }

      const startTime = Date.now();
      while (Date.now() - startTime < timeout) {
        const vncContainerVisible = await this._vncContainer.isVisible().catch(() => false);
        const connectingExists = await this._connectingText
          .isVisible({ timeout: TestTimeouts.UI_STABILIZE })
          .catch(() => false);

        const connectButtonAppeared = await this._vncConnectButton.isVisible().catch(() => false);
        if (connectButtonAppeared) {
          await this.robustClick(this._vncConnectButton);
          await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
        }

        if (vncContainerVisible && !connectingExists) {
          break;
        }

        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      }

      await this._guestLoginCredentials.waitFor({
        state: 'visible',
        timeout: TestTimeouts.VM_CREATION,
      });
      const guestLoginExists = await this._guestLoginCredentials.isVisible().catch(() => false);
      if (!guestLoginExists) {
        return false;
      }

      await this._canvas.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_DELAY_MEDIUM,
      });
      const canvasExists = await this._canvas.isVisible().catch(() => false);

      return canvasExists;
    } catch {
      return false;
    }
  }

  async verifyVncDisplaySwitching(): Promise<boolean> {
    try {
      await this.navigateToConsole();

      await this.locator('button[role="tab"]:has-text("Screen 1")').waitFor({
        state: 'visible',
        timeout: TestTimeouts.VM_CREATION,
      });
      const screen1Selected = await this.locator(
        'button[role="tab"]:has-text("Screen 1")',
      ).getAttribute('aria-selected');
      if (screen1Selected !== 'true') {
        return false;
      }

      await this._btnRoleTabHasTextScreen2.waitFor({
        state: 'visible',
        timeout: TestTimeouts.VM_CREATION,
      });
      await this.robustClick(this._btnRoleTabHasTextScreen2);

      const screen2Selected = await this.locator(
        'button[role="tab"]:has-text("Screen 2")',
      ).getAttribute('aria-selected');
      if (screen2Selected !== 'true') {
        return false;
      }

      await this._btnTypeButtonHasTextSendKey.waitFor({
        state: 'visible',
        timeout: TestTimeouts.VM_CREATION,
      });
      await this.robustClick(this._btnTypeButtonHasTextSendKey);

      await this._ctrlAlt1.waitFor({
        state: 'visible',
        timeout: TestTimeouts.VM_CREATION,
      });
      await this._ctrlAlt2.waitFor({
        state: 'visible',
        timeout: TestTimeouts.VM_CREATION,
      });
      const ctrlAlt1Exists = await this._ctrlAlt1.isVisible().catch(() => false);
      const ctrlAlt2Exists = await this._ctrlAlt2.isVisible().catch(() => false);

      return ctrlAlt1Exists && ctrlAlt2Exists;
    } catch {
      return false;
    }
  }

  async waitForVncConsoleActive(
    timeout: number = TestTimeouts.VNC_CONSOLE_READY,
  ): Promise<boolean> {
    try {
      await this._vncConsoleContainer.waitFor({ state: 'visible', timeout });
      await this._vncNoConnectionPlaceholder.waitFor({
        state: 'hidden',
        timeout: TestTimeouts.UI_DELAY_LONG,
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Waits until the VNC "no connection" placeholder is hidden, optionally clicking the
   * placeholder SVG if the wait times out (recovery path for stale UI state).
   */
  async waitForVncConsoleConnected(timeout?: number): Promise<boolean> {
    const effectiveTimeout = timeout ?? 60000;
    try {
      await this._vncNoConnectionPlaceholder.waitFor({
        state: 'hidden',
        timeout: effectiveTimeout,
      });
      return true;
    } catch {
      const connectionSvg = this._vncNoConnectionPlaceholder.locator('svg');
      const isConnectionSvgVisible = await connectionSvg.isVisible().catch(() => false);
      if (isConnectionSvgVisible) {
        await this.robustClick(connectionSvg);
        try {
          await this._vncNoConnectionPlaceholder.waitFor({
            state: 'hidden',
            timeout: effectiveTimeout,
          });
          return true;
        } catch {
          return false;
        }
      }
      return false;
    }
  }
}

export class VirtualMachineDetailDiagnosticsComponent extends BaseComponent {
  private readonly _actionsMenuButton = this.testId('actions-menu-button');
  private readonly _activeUsers = this.locator('text=Active users');
  private readonly _bootManagementBtn = this.locator('button:has-text("Boot management")');
  private readonly _btnIdLoadBalancer = this.locator('button[id="LoadBalancer"]');

  private readonly _btnIdNodePort = this.locator('button[id="NodePort"]');

  private readonly _btnPlaceholderSelectISOFile = this.locator(
    'button[placeholder="Select ISO file"]',
  );

  private readonly _btnRoleTabHasTextScreen2 = this.locator(
    'button[role="tab"]:has-text("Screen 2")',
  );

  private readonly _btnTypeButtonHasTextSendKey = this.locator(
    'button[type="button"]:has-text("Send key")',
  );

  private readonly _canvas = this.locator('canvas');

  private readonly _cloudInitEditButton = this.testId('undefined-edit');

  private readonly _cloudInitPasswordInput = this.locator('#cloudinit-password');

  private readonly _cloudInitUsernameInput = this.locator('#cloudinit-user');

  private readonly _configurationSearchAutocompleteSearchInput = this.locator(
    '#ConfigurationSearch-autocomplete-search input',
  );

  private readonly _configurationTab = this.testId('horizontal-link-Configuration');

  private readonly _copyFQDNBtn = this.locator('button:has-text("Copy FQDN")');

  private readonly _ctrlAlt1 = this.locator('text=Ctrl + Alt + 1');

  private readonly _ctrlAlt2 = this.locator('text=Ctrl + Alt + 2');

  private readonly _dataVolumeDetails = this.locator('text=DataVolume details');

  private readonly _descheduler = this.testId('descheduler');

  private readonly _descheduler1 = this.locator('#descheduler');

  private readonly _deschedulerEdit = this.testId('descheduler-edit');

  private readonly _detachDisk = this.locator('text=Detach disk?');

  private readonly _diskRootdisk = this.testId('disk-rootdisk');

  private readonly _diskTypeSelect = this.testId('disk-type-select');

  private readonly _diskTypeSelectLun = this.testId('disk-type-select-lun');

  private readonly _divnetwork = this.locator('div#network');
  private readonly _divnetworkPfV6CMenuToggle = this.locator('div#network .pf-v6-c-menu-toggle');
  private readonly _elapsedTimeSinceLogin = this.locator('text=Elapsed time since login');
  private readonly _enableBtn = this.locator('button:has-text("Enable")');
  private readonly _guestLoginCredentials = this.locator('text=Guest login credentials');
  private readonly _guestSystemLogDisabledText = this.locator(
    'text=Guest system logs are disabled at cluster',
  );
  private readonly _guestSystemLogText = this.testId('vm-diagnostics-guest-system-log');
  private readonly _h1HasTextEditDisk = this.locator('h1:has-text("Edit Disk")');
  private readonly _horizontalLinkMetrics = this.testId('horizontal-link-Metrics');
  private readonly _horizontalLinkOverview = this.testId('horizontal-link-Overview');
  private readonly _horizontalLinkSnapshots = this.testId('horizontal-link-Snapshots');
  private readonly _inProgress = this.locator('text=In progress');
  private readonly _inputIdSimpleFileFilename = this.locator('input[id="simple-file-filename"]');
  private readonly _inputInput = this.locator('input[aria-label="Input"]');
  private readonly _inputSearchInput = this.locator('input[aria-label="Search input"]');
  private readonly _isTextPendingChangesTextRestartRequired = this.locator(
    ':is(:text("Pending changes"), :text("Restart required"))',
  );
  private readonly _last5Minutes = this.locator('text=Last 5 minutes');
  private readonly _lunReservation = this.locator('#lun-reservation');
  private readonly _migrationMenu = this.testId('migration-menu');
  private readonly _name = this.locator('#name');
  private readonly _operatingSystem = this.locator('text=Operating system');
  private readonly _overviewHardwareDevicesCard = this.testId('overview-hardware-devices-card');
  private readonly _restoreTemplateSettingsBtn = this.locator(
    'button:has-text("Restore template settings")',
  );
  private readonly _restoreVirtualMachineFromSnapshot = this.locator(
    'text=Restore VirtualMachine from snapshot',
  );
  private readonly _roleDialog = this.locator('[role="dialog"]');
  private readonly _roleOption = this.locator('[role="option"]');
  private readonly _storageClassSelect = this.testId('storage-class-select');
  private readonly _takeSnapshotBtn = this.locator('button:has-text("Take snapshot")');
  private readonly _utilChart = this.locator('.util-chart');
  private readonly _utilization = this.locator('text=Utilization');
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
  private readonly _vmConfigurationDetails = this.testId('vm-configuration-details');
  private readonly _vmConfigurationScheduling = this.testId('vm-configuration-scheduling');
  private readonly _vmConfigurationSsh = this.testId('vm-configuration-ssh');
  private readonly _vmDetailSaveButton = this.testId('save-button');
  constructor(page: Page) {
    super(page);
  }
  private async navigateToConfigurationTab(): Promise<void> {
    await this.navigateToTab(this._configurationTab, TestTimeouts.UI_ACTION_COMPLETE);
  }
  /**
   * Clears the diagnostics search by clicking the clear (X) button.
   */
  async clearDiagnosticsSearch(): Promise<void> {
    const clearButton = this.page.locator('button[aria-label="Reset"], button[aria-label="Clear"]');
    const visible = await clearButton
      .first()
      .isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM })
      .catch(() => false);
    if (visible) {
      await clearButton.first().click();
    } else {
      const searchBox = this.page.getByRole('textbox', {
        name: 'Search diagnostics',
      });
      await searchBox.clear();
    }
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  }
  /**
   * Clicks a severity card to toggle its filter. Re-clicking deselects.
   */
  async clickSeverityCard(severity: 'critical' | 'warning' | 'healthy' | 'all'): Promise<void> {
    const nameMap: Record<string, RegExp> = {
      critical: /Critical/,
      warning: /Warnings/,
      healthy: /Healthy/,
      all: /All statuses/,
    };
    await this.page.getByRole('button', { name: nameMap[severity] }).click();
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  }
  async getCloudInitValues(): Promise<{ username: string; password: string } | null> {
    try {
      await this.navigateToConfigurationInitialRun();

      await this._cloudInitEditButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await this.robustClick(this._cloudInitEditButton);

      await this._cloudInitUsernameInput.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      const username = await this._cloudInitUsernameInput.inputValue();

      await this._cloudInitPasswordInput.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      const password = await this._cloudInitPasswordInput.inputValue();

      return { username, password };
    } catch {
      return null;
    }
  }
  /**
   * Reads the counts from all four severity overview cards.
   * Returns an object with critical, warnings, healthy, and allStatuses counts.
   */
  async getDiagnosticsOverviewCardCounts(): Promise<{
    critical: number;
    warnings: number;
    healthy: number;
    allStatuses: number;
  }> {
    const readCard = async (namePattern: RegExp): Promise<number> => {
      const card = this.page.getByRole('button', { name: namePattern });
      await card.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
      const text = ((await card.textContent()) ?? '').trim();
      const match = text.match(/(\d+)/);
      return match ? parseInt(match[1], 10) : -1;
    };

    return {
      critical: await readCard(/Critical/),
      warnings: await readCard(/Warnings/),
      healthy: await readCard(/Healthy/),
      allStatuses: await readCard(/All statuses/),
    };
  }
  /**
   * Reads the badge count displayed on the Diagnostics tab link.
   * Returns the numeric count, or null if no badge is visible.
   */
  async getDiagnosticsTabBadgeCount(): Promise<number | null> {
    const diagnosticsLink = this.page.locator('a').filter({ hasText: 'Diagnostics' }).first();
    const badge = diagnosticsLink.locator('span, [class*="badge"]').last();
    const visible = await badge
      .isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM })
      .catch(() => false);
    if (!visible) return null;
    const text = ((await badge.textContent()) ?? '').trim();
    const num = parseInt(text, 10);
    return isNaN(num) ? null : num;
  }
  /**
   * Returns the condition rows from the Status Conditions table.
   * Each entry has the condition type name and its status label text.
   */
  async getStatusConditionRows(): Promise<Array<{ conditionType: string; status: string }>> {
    const grid = this.page.getByRole('grid', { name: 'Status conditions' });
    const rows = grid.getByRole('row');
    const count = await rows.count();
    const results: Array<{ conditionType: string; status: string }> = [];

    for (let i = 1; i < count; i++) {
      const cells = rows.nth(i).getByRole('gridcell');
      const conditionType = ((await cells.nth(0).textContent()) ?? '').trim();
      const status = ((await cells.nth(1).textContent()) ?? '').trim();
      if (conditionType) {
        results.push({ conditionType, status });
      }
    }
    return results;
  }
  async navigateToConfigurationInitialRun(): Promise<void> {
    await this.navigateToConfigurationTab();
    await this.navigateToTab(this.testId('vm-configuration-initial'));
  }
  async navigateToConsole(): Promise<void> {
    await this.navigateToTab(this.testId('horizontal-link-Console'));
  }
  async navigateToYAML(): Promise<void> {
    await this.navigateToTab(this.testId('horizontal-link-YAML'));
  }
  /**
   * Types into the diagnostics search box.
   */
  async searchDiagnostics(text: string): Promise<void> {
    const searchBox = this.page.getByRole('textbox', {
      name: 'Search diagnostics',
    });
    await searchBox.fill(text);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  }
  async updateCloudInit(username: string, password: string): Promise<boolean> {
    try {
      await this.navigateToConfigurationInitialRun();

      await this._cloudInitEditButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await this.robustClick(this._cloudInitEditButton);

      await this._cloudInitUsernameInput.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this._cloudInitUsernameInput.clear();
      await this._cloudInitUsernameInput.fill(username);

      await this._cloudInitPasswordInput.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this._cloudInitPasswordInput.clear();
      await this._cloudInitPasswordInput.fill(password);

      await this._vmDetailSaveButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this.robustClick(this._vmDetailSaveButton);

      await this.locator('text=Restart required')
        .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE })
        .catch(() => false);

      return true;
    } catch {
      return false;
    }
  }
  async verifyAnnotations(): Promise<boolean> {
    try {
      await this.locator('button', { hasText: /Annotations/ }).waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      return await this.locator('button', { hasText: /Annotations/ })
        .isVisible()
        .catch(() => false);
    } catch {
      return false;
    }
  }
  async verifyCloudInit(): Promise<boolean> {
    try {
      await this.locator('.pf-v6-c-description-list__term span', {
        hasText: 'Cloud-init',
      })
        .first()
        .waitFor({ state: 'visible', timeout: TestTimeouts.RESOURCE_CREATION });
      await this.locator('.pf-v6-c-description-list__term span', {
        hasText: 'Cloud-init',
      })
        .first()
        .isVisible()
        .catch();
      return true;
    } catch {
      return false;
    }
  }
  async verifyCloudInitCredentialsInConsole(): Promise<boolean> {
    try {
      await this.navigateToConsole();

      await this.locator('text=Guest login').waitFor({
        state: 'visible',
        timeout: TestTimeouts.DEFAULT,
      });

      return await this.verifyTextVisible('Guest login');
    } catch {
      return false;
    }
  }
  async verifyCloudInitInYAML(
    expectedUsername?: string,
    expectedPassword?: string,
  ): Promise<boolean> {
    try {
      await this.navigateToYAML();

      await this.page.waitForSelector('.monaco-editor', {
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });

      const yamlContent = await this.page.evaluate(() => {
        try {
          const w = window as unknown as {
            monaco?: {
              editor?: {
                getEditors: () => Array<{
                  getModel: () => { getValue: () => string } | null | undefined;
                }>;
              };
            };
          };
          const editors = w.monaco?.editor?.getEditors();
          if (editors && editors.length > 0) {
            const editor = editors[0];
            const model = editor.getModel();
            if (model) {
              return model.getValue();
            }
          }
        } catch {}
        return null;
      });
      if (!yamlContent) {
        return false;
      }

      const hasCloudInit =
        yamlContent.includes('cloudInitNoCloud') || yamlContent.includes('userData');
      if (!hasCloudInit) {
        return false;
      }

      if (expectedUsername) {
        const usernamePattern = new RegExp(
          `user:\\s*${expectedUsername.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
        );
        if (!usernamePattern.test(yamlContent)) {
          return false;
        }
      }

      if (expectedPassword) {
        const passwordPattern = new RegExp(
          `password:\\s*${expectedPassword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
        );
        if (!passwordPattern.test(yamlContent)) {
          return false;
        }
      }

      return true;
    } catch {
      return false;
    }
  }
  async verifyFolderVisible(folderName: string, _namespace?: string): Promise<boolean> {
    try {
      // `_namespace` retained for callers; folder label is located by data-test only.
      const folderElement = this.testId('virtual-machine-overview-details-folder').filter({
        hasText: folderName,
      });
      await folderElement.waitFor({ state: 'visible', timeout: TestTimeouts.UI_VISIBILITY_QUICK });
      return await folderElement.isVisible().catch(() => false);
    } catch {
      return false;
    }
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
  async verifyHeadlessMode(): Promise<boolean> {
    return await super.verifyTextVisible('Headless mode');
  }

  async verifyPodNetworking(): Promise<boolean> {
    return await super.verifyTextVisible('Pod networking');
  }

  async verifyRootdisk(): Promise<boolean> {
    try {
      await this._diskRootdisk.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      return await this._diskRootdisk.isVisible().catch(() => false);
    } catch {
      return false;
    }
  }

  async verifySchedulingAndResourceRequirements(): Promise<boolean> {
    return await super.verifyTextVisible('Scheduling and resource requirements');
  }

  async verifySSHAccess(): Promise<boolean> {
    return await super.verifyTextVisible('SSH access');
  }

  async verifyStatusConditions(): Promise<boolean> {
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
    const heading = this.page.locator(
      'h2:has-text("Status conditions"), [role="heading"]:has-text("Status conditions")',
    );
    const headingVisible = await heading
      .first()
      .waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT })
      .then(() => true)
      .catch(() => false);
    if (headingVisible) return true;
    return await super.verifyTextVisible('Status conditions');
  }

  async verifyTolerations(): Promise<boolean> {
    return await super.verifyTextVisible('Tolerations', true);
  }
}
