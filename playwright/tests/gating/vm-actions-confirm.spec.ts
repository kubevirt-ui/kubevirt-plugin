/**
 * VM actions confirmation dialog.
 * Mirrors: cypress/tests/gating/vm-actions-confirm.cy.ts
 */
import { SettingsPage } from 'pages/SettingsPage';

import { baseURL } from '../../../playwright.config';
import { expect, test } from '../../fixtures';
import { MINUTE } from '../../utils/constants';
import { env } from '../../utils/env';
import { createExampleVM, deleteResource } from '../../utils/oc';

const NS = env.testNamespace;
const VM_NAME = `${NS}-actions-vm`;

test.describe.configure({ mode: 'serial' });

test.describe('VM actions confirmation', () => {
  test.beforeAll(() => {
    if (!NS) return;
    createExampleVM(VM_NAME, NS, 'Always');
  });

  test.afterAll(() => {
    if (!NS) return;
    deleteResource('vm', VM_NAME, NS);
  });

  test('enable actions confirm in Settings', async ({ settingsPage }) => {
    await settingsPage.navigate();
    await settingsPage.enableVMActionsConfirmation();
  });

  test('verify confirm modal appears on restart action', async ({ page, vmDetails, vmList }) => {
    await vmList.navigateToVMList(NS);
    expect(
      await vmList.waitForRow(VM_NAME, MINUTE),
      `VM "${VM_NAME}" not found in namespace "${NS}"`,
    ).toBe(true);
    await vmList.openVM(VM_NAME);

    // The Restart action is only enabled when the VM is Running
    await vmDetails.goToTab('Overview');
    await page.waitForTimeout(MINUTE);

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
    const settingsPage = new SettingsPage(page);
    await settingsPage.navigate();
    await settingsPage.disableVMActionsConfirmation();
    await page.close();
  });
});
