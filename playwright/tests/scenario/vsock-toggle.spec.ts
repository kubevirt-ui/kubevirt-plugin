import { expect, scenarioTest as test } from '@/fixtures/scenario-fixture';
import { SECOND } from 'utils/constants';

const VSOCK_SWITCH_ID = '#enable-vsock';
const NS = process.env.TEST_NS || 'default';
const WIZARD_URL = '/vm-wizard';
const WAIT_VSOCK_TOGGLE = SECOND;

async function handleWizardFourFirstSteps(page: import('@playwright/test').Page) {
  await page.goto(WIZARD_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle');

  // Step 1: Deployment details — generate name and click Next
  const generateNameBtn = page.locator('[data-test="generate-vm-name-button"]');
  await generateNameBtn.waitFor({ state: 'visible', timeout: 30_000 });
  await generateNameBtn.click();

  const nameInput = page.locator('#vm-name');
  await nameInput.waitFor({ state: 'visible', timeout: 5_000 });
  const vmName = await nameInput.inputValue();

  await page.getByRole('button', { name: 'Next', exact: true }).click();

  // Step 2: Guest OS — select RHEL
  const rhelTile = page.getByText('RHEL', { exact: true });
  await rhelTile.waitFor({ state: 'visible', timeout: 30_000 });
  await rhelTile.click();
  await page.getByRole('button', { name: 'Next', exact: true }).click();

  // Step 3: Boot source — select first available volume
  const bootSourceRow = page.locator('table tbody tr').first();
  await bootSourceRow.waitFor({ state: 'visible', timeout: 60_000 });
  await bootSourceRow.click();
  await page.getByRole('button', { name: 'Next', exact: true }).click();

  // Step 4: Compute resources — use default
  await page.getByRole('button', { name: 'Next', exact: true }).click();

  // Return generated vm name so we can use it in the next steps
  return vmName;
}

test.skip('VSOCK toggle — full end-to-end flow', async ({
  page,
  previewFeaturesSettingsPage: settingsPage,
}) => {
  let vmName: string;

  // ── Step 0: Enable VSOCK in Settings ──────────────────────────────────
  await test.step('Enable VSOCK in Settings → Preview features', async () => {
    await settingsPage.enableVsock();
    await expect(settingsPage.vsockSwitch).toBeChecked({ timeout: 10_000 });
  });

  // ── Steps 1-6: Create VM through wizard with VSOCK enabled ────────────
  await test.step('Create VM through wizard with VSOCK enabled', async () => {
    // Step 1-4: Create VM through wizard
    vmName = await handleWizardFourFirstSteps(page);

    // Step 5: Customization — enable VSOCK
    const vsockSwitch = page.locator(VSOCK_SWITCH_ID);
    await vsockSwitch.waitFor({ state: 'visible', timeout: 30_000 });
    await expect(vsockSwitch).not.toBeDisabled();

    const isChecked = await vsockSwitch.isChecked();
    if (!isChecked) {
      await vsockSwitch.locator('..').click();
      await page.waitForTimeout(WAIT_VSOCK_TOGGLE);
    }
    await expect(vsockSwitch).toBeChecked({ timeout: 10_000 });
    await page.waitForTimeout(WAIT_VSOCK_TOGGLE);

    // Step 6: Review and create
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    const createVmBtn = page.getByRole('button', { name: /Create VirtualMachine/i });
    await createVmBtn.waitFor({ state: 'visible', timeout: 30_000 });
    await expect(createVmBtn).not.toHaveAttribute('aria-disabled', 'true', { timeout: 10_000 });
    await createVmBtn.click();

    // Wait for redirect to VM details page
    await page.waitForURL(/kubevirt\.io~v1~VirtualMachine\/[^/]+$/, { timeout: 60_000 });
    await page.waitForLoadState('networkidle');
  });

  // ── Step 7: Navigate to created VM — toggle VSOCK off then on ─────────
  await test.step('VM details — Configuration — toggle VSOCK off then on', async () => {
    await page.goto(`/k8s/ns/${NS}/kubevirt.io~v1~VirtualMachine/${vmName}`, {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForLoadState('networkidle');

    await page.locator('[data-test-id="horizontal-link-Configuration"]').click();
    await page.waitForLoadState('networkidle');

    const vsockSwitch = page.locator(VSOCK_SWITCH_ID);
    await vsockSwitch.scrollIntoViewIfNeeded();
    await vsockSwitch.waitFor({ state: 'visible', timeout: 30_000 });
    await expect(vsockSwitch).not.toBeDisabled();

    // Turn off
    if (await vsockSwitch.isChecked()) {
      await vsockSwitch.locator('..').click();
    }
    await expect(vsockSwitch).not.toBeChecked({ timeout: 10_000 });
    await page.waitForTimeout(WAIT_VSOCK_TOGGLE);

    // Turn on
    await vsockSwitch.locator('..').click();
    await expect(vsockSwitch).toBeChecked({ timeout: 10_000 });
    await page.waitForTimeout(WAIT_VSOCK_TOGGLE);
  });

  // ── Step 8: Disable VSOCK in Settings ─────────────────────────────────
  await test.step('Disable VSOCK in Settings → Preview features', async () => {
    await settingsPage.disableVsock();
    await expect(settingsPage.vsockSwitch).not.toBeChecked({ timeout: 10_000 });
  });

  // ── Step 9: Navigate back to created VM — verify VSOCK is disabled ────
  await test.step('VM details — VSOCK toggle is disabled when feature gate is off', async () => {
    await page.goto(`/k8s/ns/${NS}/kubevirt.io~v1~VirtualMachine/${vmName}`, {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForLoadState('networkidle');

    await page.locator('[data-test-id="horizontal-link-Configuration"]').click();
    await page.waitForLoadState('networkidle');

    const vsockSwitch = page.locator(VSOCK_SWITCH_ID);
    await vsockSwitch.scrollIntoViewIfNeeded();
    await vsockSwitch.waitFor({ state: 'visible', timeout: 30_000 });
    await expect(vsockSwitch).toBeDisabled();
    await page.waitForTimeout(WAIT_VSOCK_TOGGLE);
  });

  // ── Step 10: Go through wizard again — verify VSOCK is disabled ───────
  await test.step('Wizard — VSOCK toggle is disabled when feature gate is off', async () => {
    await handleWizardFourFirstSteps(page);

    // Step 5: verify VSOCK is disabled
    const vsockSwitch = page.locator(VSOCK_SWITCH_ID);
    await vsockSwitch.waitFor({ state: 'visible', timeout: 30_000 });
    await expect(vsockSwitch).toBeDisabled();
    await page.waitForTimeout(WAIT_VSOCK_TOGGLE);
  });
});
