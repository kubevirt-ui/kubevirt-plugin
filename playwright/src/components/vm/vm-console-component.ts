import BaseComponent from '@/components/shared/base-component';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

export default class VmConsoleComponent extends BaseComponent {
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

  private readonly _vncNoConnectionPlaceholder = this.locator('.vnc-no-connection-placeholder');

  constructor(page: Page) {
    super(page);
  }

  private async copyAndPasteToVncConsole(
    copyButton: ReturnType<typeof this.locator>,
    fieldName: string,
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

  async isVncConsoleActive(): Promise<boolean> {
    const canvasVisible = await this._vncConsoleContainer.isVisible().catch(() => false);
    const placeholderVisible = await this._vncNoConnectionPlaceholder
      .isVisible()
      .catch(() => false);

    return canvasVisible && !placeholderVisible;
  }

  async navigateToConsole() {
    await super.navigateToTab(this.testId('horizontal-link-Console'));
  }

  async navigateToOverview() {
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
      return !exists;
    } catch {
      return false;
    }
  }

  async verifyGuestLogin(): Promise<boolean> {
    return await super.verifyTextVisible('Guest login');
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
      const vncDisconnectUserAndConnectButton = this.locator(
        'button:has-text("Disconnect user and connect")',
      );
      const vncDisconnectUserAndConnectButtonVisible = await vncDisconnectUserAndConnectButton
        .isVisible({ timeout: TestTimeouts.UI_DELAY_LONG })
        .catch(() => false);
      if (vncDisconnectUserAndConnectButtonVisible) {
        await vncDisconnectUserAndConnectButton.waitFor({
          state: 'visible',
          timeout: TestTimeouts.ELEMENT_WAIT,
        });
        await this.robustClick(vncDisconnectUserAndConnectButton);
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
