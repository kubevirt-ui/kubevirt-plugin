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

async function isVirtualizationWelcomeDialog(page: Page, dialogIndex: number): Promise<boolean> {
  const dialog = page.locator('[role="dialog"]').filter({ visible: true }).nth(dialogIndex);
  const label = ((await dialog.getAttribute('aria-label').catch(() => '')) ?? '').trim();
  if (/welcome modal/i.test(label)) {
    return true;
  }
  return (
    (await dialog
      .locator('#welcome-modal-checkbox')
      .count()
      .catch(() => 0)) > 0
  );
}

/** TabModal / form dialogs — do not Escape-close these. Welcome is handled separately. */
async function hasBlockingTabModal(page: Page): Promise<boolean> {
  if (
    await page
      .locator('#tab-modal')
      .filter({ visible: true })
      .first()
      .isVisible()
      .catch(() => false)
  ) {
    return true;
  }
  const dialogs = page.locator('[role="dialog"]').filter({ visible: true });
  const count = await dialogs.count().catch(() => 0);
  for (let i = 0; i < count; i += 1) {
    if (await isVirtualizationWelcomeDialog(page, i)) {
      continue;
    }
    if (
      await dialogs
        .nth(i)
        .isVisible()
        .catch(() => false)
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Virtualization Welcome modal (kubevirt-user-settings). May appear after settings load —
 * wait briefly so non-priv races (ConfigMap 403 → empty settings) still get dismissed.
 */
async function dismissVirtualizationWelcomeModal(
  page: Page,
  waitMs = 2 * SECOND,
): Promise<boolean> {
  const checkbox = page.locator('#welcome-modal-checkbox');
  const dialog = page.getByRole('dialog', { name: /Welcome modal/i });
  const appeared = await checkbox
    .or(dialog)
    .first()
    .waitFor({ state: 'visible', timeout: waitMs })
    .then(() => true)
    .catch(() => false);
  if (!appeared) {
    return false;
  }

  await checkbox.check({ force: true }).catch(() => undefined);

  const closeInDialog = dialog.getByRole('button', { name: /^Close$/i });
  if (await closeInDialog.isVisible().catch(() => false)) {
    await closeInDialog.click({ force: true }).catch(() => undefined);
  } else {
    await page
      .locator(
        '.pf-v6-c-modal-box__close button, .pf-v5-c-modal-box__close button, .pf-c-modal-box__close button',
      )
      .first()
      .click({ force: true })
      .catch(() => undefined);
  }

  await dialog
    .or(checkbox)
    .first()
    .waitFor({ state: 'hidden', timeout: 5 * SECOND })
    .catch(() => undefined);
  return true;
}

/** Dismiss quick starts / welcome overlays that block the console header and nav. */
export async function dismissConsoleObstructions(page: Page): Promise<void> {
  const tourSkip = page.locator('[data-test="tour-step-footer-secondary"]');
  if (await tourSkip.isVisible().catch(() => false)) {
    await tourSkip.click({ force: true }).catch(() => undefined);
  }

  await dismissVirtualizationWelcomeModal(page);

  await dismissAlertToasts(page);

  // Open TabModal/dialog (Cloud-init, labels, etc.): only clear toasts — never Close/Escape.
  if (await hasBlockingTabModal(page)) {
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
    if (await hasBlockingTabModal(page)) {
      await dismissAlertToasts(page);
      return;
    }
    // Late-arriving welcome after settings resolve
    await dismissVirtualizationWelcomeModal(page, SECOND);
    let dismissed = await dismissAlertToasts(page);
    for (const target of closeTargets) {
      const el = target.first();
      if (await el.isVisible().catch(() => false)) {
        await el.click({ timeout: 3 * SECOND }).catch(() => undefined);
        dismissed = true;
      }
    }
    if (!(await hasBlockingTabModal(page))) {
      await page.keyboard.press('Escape');
    }
    if (!dismissed) {
      break;
    }
    await page.waitForTimeout(400);
  }
}
