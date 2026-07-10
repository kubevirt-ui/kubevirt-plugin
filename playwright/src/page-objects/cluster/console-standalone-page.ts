/**
 * Page object for the standalone VNC console page.
 * Handles VNC console navigation, connection, and session management.
 */

import { EnvVariables } from '@/utils/env-variables';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

import BasePage from '../base-page';

export default class ConsoleStandalonePage extends BasePage {
  private readonly _dialog = this.locator('[role="dialog"]');
  private readonly _vncCanvas = this.locator('.console-container canvas');
  private readonly _vncNoConnectionPlaceholder = this.locator('.vnc-no-connection-placeholder');

  constructor(page: Page) {
    super(page);
  }

  async clickConnectButton(): Promise<void> {
    const connectButton = this.locator('button.pf-m-primary:has-text("Connect")');
    await connectButton.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(connectButton);
  }

  async clickDisconnectButton(): Promise<void> {
    const disconnectButton = this.locator('button.vnc-actions-disconnect-button');
    await disconnectButton.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(disconnectButton);
  }

  async clickDisconnectUserAndConnectButton(): Promise<void> {
    const disconnectUserAndConnectButton = this.locator(
      'button:has-text("Disconnect user and connect")',
    );
    await disconnectUserAndConnectButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await this.robustClick(disconnectUserAndConnectButton);
  }

  async clickTryLaterButton(): Promise<void> {
    const tryLaterButton = this.locator('button:has-text("Try later")');
    await tryLaterButton.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(tryLaterButton);
  }

  async dialogContainsText(
    text: string,
    timeout: number = TestTimeouts.ELEMENT_WAIT,
  ): Promise<boolean> {
    try {
      await this._dialog.waitFor({ state: 'visible', timeout });
      const dialogText = await this._dialog.textContent();
      return dialogText?.includes(text) ?? false;
    } catch {
      return false;
    }
  }

  async isDialogVisible(timeout: number = TestTimeouts.ELEMENT_WAIT): Promise<boolean> {
    try {
      await this._dialog.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  async isStandaloneConsolePageLoaded(
    stabilizationMs = TestTimeouts.UI_VISIBILITY_QUICK,
  ): Promise<boolean> {
    try {
      await this.page.waitForTimeout(stabilizationMs);
      const url = this.page.url();
      if (!url.includes('/console/standalone')) return false;

      const detailTabsVisible = await this.locator('[data-test-id="horizontal-link-Overview"]')
        .isVisible()
        .catch(() => false);

      return !detailTabsVisible;
    } catch {
      return false;
    }
  }

  async isVncConsoleActive(): Promise<boolean> {
    const canvasVisible = await this._vncCanvas.isVisible().catch(() => false);
    const placeholderVisible = await this._vncNoConnectionPlaceholder
      .isVisible()
      .catch(() => false);
    return canvasVisible && !placeholderVisible;
  }

  async navigateToStandaloneConsole(vmName: string, namespace: string): Promise<void> {
    const baseUrl = EnvVariables.webConsoleUrl.replace(/\/$/, '');
    const url = `${baseUrl}/k8s/ns/${namespace}/kubevirt.io~v1~VirtualMachine/${vmName}/console/standalone`;
    await this.page.goto(url);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async waitForVncConsoleActive(
    timeout: number = TestTimeouts.VNC_CONSOLE_READY,
  ): Promise<boolean> {
    try {
      await this._vncCanvas.waitFor({ state: 'visible', timeout });
      await this._vncNoConnectionPlaceholder.waitFor({
        state: 'hidden',
        timeout: TestTimeouts.UI_DELAY_LONG,
      });
      return true;
    } catch {
      return false;
    }
  }
}
