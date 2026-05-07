/**
 * VM actions confirmation dialog.
 * Mirrors: cypress/tests/gating/vm-actions-confirm.cy.ts
 */
import { LoginPage } from 'pages/LoginPage';
import { SettingsPage } from 'pages/SettingsPage';

import { baseURL } from '../../../playwright.config';
import { expect, test } from '../../fixtures';
import { CONFIRM_VM_ACTIONS, MINUTE } from '../../utils/constants';
import { env } from '../../utils/env';
import { byTestId } from '../../utils/locators';

const NS = env.testNamespace;
const DEFAULT_VM_NAME = `${NS}-example`;

test.describe.configure({ mode: 'serial' });

test.describe('VM actions confirmation', () => {
  test('enable actions confirm in Settings', async ({ settingsPage }) => {
    await settingsPage.navigate();
    await settingsPage.enableVMActionsConfirmation();
  });

  test('verify confirm modal appears on restart action', async ({ page, vmDetails, vmList }) => {
    await vmList.navigateToVMList(NS);
    expect(
      await vmList.waitForRow(DEFAULT_VM_NAME, MINUTE),
      `VM "${DEFAULT_VM_NAME}" not found in namespace "${NS}"`,
    ).toBe(true);
    await vmList.openVM(DEFAULT_VM_NAME);

    if (await vmDetails.isStartVisible()) {
      await vmDetails.clickStart();
    }

    // The Restart action is only enabled when the VM is Running
    await vmDetails.goToTab('Overview');
    await vmDetails.expectOverviewStatus('Running', 5 * MINUTE);

    await vmDetails.openActionsMenu();
    await vmDetails.clickSubmenuAction('control-menu', 'vm-action-restart');

    await expect(
      page.locator('.pf-v6-c-modal-box').getByText('Restart VirtualMachine?'),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Restart' }).click();
  });

  // Restore: disable VM actions confirmation so subsequent test runs are not affected.
  // `page` and `settingsPage` are per-test fixtures — they cannot be used in afterAll.
  // Create a fresh browser context instead (Playwright recommended pattern).
  test.afterAll(async ({ browser }) => {
    const ctx = await browser.newContext({ baseURL, ignoreHTTPSErrors: true });
    const page = await ctx.newPage();
    const loginPage = new LoginPage(page);
    await loginPage.seedGuidedTourState();
    await loginPage.login();
    const settingsPage = new SettingsPage(page);
    await settingsPage.navigate();
    await settingsPage.openSection('General settings');
    await settingsPage.openSection('VirtualMachine actions confirmation');
    const switchInput = byTestId(page, CONFIRM_VM_ACTIONS);
    const isOn = await switchInput.evaluate((el) => (el as HTMLInputElement).checked);
    if (isOn) {
      await switchInput.locator('..').click();
    }
    await page.close();
  });
});
