import { TestTimeouts } from '@/utils/test-config';
import { expect, type Page } from '@playwright/test';

const VSOCK_SWITCH_SELECTOR = '#enable-vsock';

export async function setVsockSwitchEnabled(page: Page, enabled: boolean): Promise<void> {
  const vsockSwitch = page.locator(VSOCK_SWITCH_SELECTOR);
  await vsockSwitch.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });

  const currentlyEnabled = await vsockSwitch.isChecked();
  if (currentlyEnabled === enabled) {
    return;
  }

  await vsockSwitch.click({ force: true });

  await expect(vsockSwitch).toBeChecked({
    checked: enabled,
    timeout: TestTimeouts.VM_CREATION,
  });
}

export async function isVsockSwitchEnabled(page: Page): Promise<boolean> {
  const vsockSwitch = page.locator(VSOCK_SWITCH_SELECTOR);
  await vsockSwitch.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });

  return vsockSwitch.isChecked();
}

export async function isVsockSwitchVisible(page: Page): Promise<boolean> {
  return page.locator(VSOCK_SWITCH_SELECTOR).isVisible().catch(() => false);
}
