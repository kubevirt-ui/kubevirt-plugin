import { SECOND } from '@/utils/test-config';
import type { Page } from '@playwright/test';

/** Dismiss quick starts / welcome overlays that block the console header and nav. */
export async function dismissConsoleObstructions(page: Page): Promise<void> {
  const tourSkip = page.locator('[data-test="tour-step-footer-secondary"]');
  if (await tourSkip.isVisible().catch(() => false)) {
    await tourSkip.click({ force: true }).catch(() => undefined);
  }

  const welcomeCheckbox = page.locator('#welcome-modal-checkbox');
  if (await welcomeCheckbox.isVisible().catch(() => false)) {
    await welcomeCheckbox.check({ force: true }).catch(() => undefined);
    await page
      .locator('.pf-v6-c-modal-box__close button, .pf-c-modal-box__close button')
      .first()
      .click({
        force: true,
      })
      .catch(() => undefined);
  }

  const closeTargets = [
    page.locator('[data-test-id="quick-start-close"]'),
    page.locator(
      '.pfext-quick-start-panel button[aria-label="Close"], .ocs-quick-start-content button[aria-label="Close"], [data-test-id="quickstart drawer"] button[aria-label="Close"]',
    ),
    page.locator('.pf-v6-c-drawer__close button, .pf-c-drawer__close button'),
    page.getByRole('button', { name: /^Close$/i }),
    page.getByRole('button', { name: /Skip tour/i }),
    page.getByRole('button', { name: /Ok, got it/i }),
    page.getByRole('button', { name: /Got it/i }),
  ];

  for (let round = 0; round < 4; round += 1) {
    let dismissed = false;
    for (const target of closeTargets) {
      const el = target.first();
      if (await el.isVisible().catch(() => false)) {
        await el.click({ timeout: 3 * SECOND }).catch(() => undefined);
        dismissed = true;
      }
    }
    await page.keyboard.press('Escape');
    if (!dismissed) {
      break;
    }
    await page.waitForTimeout(400);
  }
}
