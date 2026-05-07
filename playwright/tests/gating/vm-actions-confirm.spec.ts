/**
 * VM actions confirmation dialog.
 * Mirrors: cypress/tests/gating/vm-actions-confirm.cy.ts
 */
import { expect, test } from '../../fixtures';
import { env } from '../../utils/env';

const NS = env.testNamespace;
const DEFAULT_VM_NAME = `${NS}-example`;
const MINUTE = 60_000;

test.describe.configure({ mode: 'serial' });

test.describe('VM actions confirmation', () => {
  test.beforeEach(async ({ loginPage }) => {
    if (!NS) test.skip();
  });

  test('enable actions confirm in Settings', async ({ settingsPage }) => {
    await settingsPage.navigate();
    await settingsPage.enableVMActionsConfirmation();
  });

  test('verify confirm modal appears on restart action', async ({ page, vmDetails, vmList }) => {
    test.setTimeout(7 * MINUTE); // allow time for VM to reach Running state

    await vmList.navigateToVMList(NS);
    expect(
      await vmList.waitForRow(DEFAULT_VM_NAME, 30_000),
      `VM "${DEFAULT_VM_NAME}" not found in namespace "${NS}"`,
    ).toBe(true);
    await vmList.openVM(DEFAULT_VM_NAME);

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

  // Restore: disable VM actions confirmation so subsequent test runs are not affected
  test.afterAll(async ({ browser }) => {
    if (!NS) return;
    const page = await browser.newPage();
    const { LoginPage } = await import('../../pages/LoginPage');
    const { SettingsPage } = await import('../../pages/SettingsPage');
    const lp = new LoginPage(page);
    await lp.seedGuidedTourState();
    await lp.login();
    const sp = new SettingsPage(page);
    await sp.navigate();
    await sp.openSection('General settings');
    await sp.openSection('VirtualMachine actions confirmation');
    const switchInput = page.locator('[data-test-id="confirm-vm-actions"]');
    const isOn = await switchInput.evaluate((el) => (el as HTMLInputElement).checked);
    if (isOn) {
      await switchInput.locator('..').click();
    }
    await page.close();
  });
});
