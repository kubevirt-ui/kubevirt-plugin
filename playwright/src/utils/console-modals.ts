import { SECOND } from '@/utils/test-config';
import type { Page } from '@playwright/test';

async function dismissAlertToasts(page: Page): Promise<boolean> {
  // Admission webhook warnings (e.g. deprecated spec.running) stack and block clicks.
  const closes = page.locator(
    [
      '.pf-v6-c-alert-group button[aria-label*="Close"]',
      '.pf-v5-c-alert-group button[aria-label*="Close"]',
      '.pf-c-alert-group button[aria-label*="Close"]',
      'ul.pf-v6-c-alert-group button[aria-label^="Close"]',
      '[data-test="notification-drawer"] button[aria-label*="Close"]',
    ].join(', '),
  );
  const count = await closes.count().catch(() => 0);
  let dismissed = false;
  for (let i = 0; i < Math.min(count, 12); i += 1) {
    const btn = closes.nth(i);
    if (await btn.isVisible().catch(() => false)) {
      await btn.click({ force: true, timeout: 2 * SECOND }).catch(() => undefined);
      dismissed = true;
    }
  }
  return dismissed;
}

async function hasVisibleDialog(page: Page): Promise<boolean> {
  return page
    .locator('#tab-modal, [role="dialog"]')
    .filter({ visible: true })
    .first()
    .isVisible()
    .catch(() => false);
}

/** Dismiss quick starts / welcome overlays that block the console header and nav. */
export async function dismissConsoleObstructions(page: Page): Promise<void> {
  // kubeadmin banner link steals clicks during wizard tile selection — neutralize pointer events.
  await page
    .evaluate(() => {
      document
        .querySelectorAll('a[href*="config.openshift.io~v1~OAuth"], a[href*="/OAuth/"]')
        .forEach((el) => {
          (el as HTMLElement).style.pointerEvents = 'none';
        });
    })
    .catch(() => undefined);

  const tourSkip = page.locator('[data-test="tour-step-footer-secondary"]');
  if (await tourSkip.isVisible().catch(() => false)) {
    await tourSkip.click({ force: true }).catch(() => undefined);
  }

  // Core platform "Welcome modal" and Virtualization "Welcome to OpenShift Virtualization".
  const welcomeDialog = page
    .getByRole('dialog', { name: /Welcome(?:\s+modal|\s+to\s+OpenShift)?/i })
    .or(page.locator('#guided-tour-modal'))
    .or(
      page
        .locator('.pf-v6-c-modal-box, .pf-c-modal-box')
        .filter({ hasText: /Welcome to OpenShift Virtualization/i }),
    )
    .filter({ visible: true })
    .first();
  if (await welcomeDialog.isVisible().catch(() => false)) {
    await welcomeDialog
      .locator('#welcome-modal-checkbox, input[type="checkbox"]')
      .first()
      .check({ force: true })
      .catch(() => undefined);
    await page
      .getByLabel(/Do not show this again/i)
      .check({ force: true })
      .catch(() => undefined);
    await welcomeDialog
      .locator('button[aria-label="Close"]')
      .or(welcomeDialog.locator('.pf-v6-c-modal-box__close button, .pf-c-modal-box__close button'))
      .or(welcomeDialog.getByRole('button', { name: /^Close$/i }))
      .first()
      .click({ force: true })
      .catch(() => undefined);
    await welcomeDialog.waitFor({ state: 'hidden', timeout: 5 * SECOND }).catch(() => undefined);
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

  // Fallback: heading-only match when dialog accessible name does not include Welcome.
  const virtWelcomeHeading = page.getByRole('heading', {
    name: /Welcome to OpenShift Virtualization/i,
  });
  if (await virtWelcomeHeading.isVisible().catch(() => false)) {
    const modal = page.locator('.pf-v6-c-modal-box, .pf-c-modal-box').filter({
      has: virtWelcomeHeading,
    });
    await modal
      .locator('input[type="checkbox"]')
      .first()
      .check({ force: true })
      .catch(() => undefined);
    await modal
      .locator('button[aria-label="Close"], .pf-v6-c-modal-box__close button')
      .first()
      .click({ force: true })
      .catch(() => undefined);
    await virtWelcomeHeading
      .waitFor({ state: 'hidden', timeout: 5 * SECOND })
      .catch(() => undefined);
  }

  await dismissAlertToasts(page);

  // Open TabModal/dialog (Cloud-init, labels, etc.): only clear toasts — never Close/Escape.
  // Still allow Escape for leftover welcome/tour overlays that did not match above.
  const blockingWelcome = page
    .getByRole('dialog', { name: /Welcome(?:\s+modal|\s+to\s+OpenShift)?/i })
    .or(page.locator('#guided-tour-modal'))
    .filter({ visible: true })
    .first();
  if (await blockingWelcome.isVisible().catch(() => false)) {
    await blockingWelcome
      .locator('button[aria-label="Close"]')
      .first()
      .click({ force: true })
      .catch(() => page.keyboard.press('Escape').catch(() => undefined));
    await blockingWelcome.waitFor({ state: 'hidden', timeout: 5 * SECOND }).catch(() => undefined);
  } else if (await hasVisibleDialog(page)) {
    return;
  }

  const closeTargets = [
    page.getByRole('button', { name: 'Close drawer panel' }),
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
    if (await hasVisibleDialog(page)) {
      await dismissAlertToasts(page);
      return;
    }
    let dismissed = await dismissAlertToasts(page);
    for (const target of closeTargets) {
      const el = target.first();
      if (await el.isVisible().catch(() => false)) {
        await el.click({ timeout: 3 * SECOND }).catch(() => undefined);
        dismissed = true;
      }
    }
    if (!(await hasVisibleDialog(page))) {
      await page.keyboard.press('Escape');
    }
    if (!dismissed) {
      break;
    }
    await page.waitForTimeout(400);
  }
}
