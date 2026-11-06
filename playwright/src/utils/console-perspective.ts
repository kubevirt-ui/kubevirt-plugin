import { dismissConsoleObstructions } from '@/utils/console-modals';
import { ConsoleRoutes } from '@/utils/console-routes';
import { EnvVariables } from '@/utils/env-variables';
import { TestTimeouts } from '@/utils/test-config';
import type { Locator, Page } from '@playwright/test';

function perspectiveToggle(page: Page): Locator {
  return page.locator('[data-test-id="perspective-switcher-toggle"]');
}

/** Administrator (pre-4.21) or Core platform (4.21+). */
function isAdminPerspective(label: string): boolean {
  return /administrator|core platform/i.test(label);
}

async function perspectiveToggleLabel(page: Page): Promise<string> {
  return ((await perspectiveToggle(page).textContent()) ?? '').trim();
}

function administratorPerspectiveOption(page: Page): Locator {
  return page
    .locator('[data-test-id="perspective-switcher-menu-option"]')
    .filter({ hasText: /Administrator|Core platform/i })
    .or(page.getByRole('menuitem', { name: /^(Administrator|Core platform)$/i }))
    .or(page.getByRole('option', { name: /^(Administrator|Core platform)$/i }))
    .first();
}

async function tryMenuSwitchToAdministrator(page: Page): Promise<boolean> {
  const toggle = perspectiveToggle(page);
  await toggle.click({ force: true });
  // Menu options can lag behind the toggle under React 18 createRoot.
  await page.waitForTimeout(1000);
  const adminOption = administratorPerspectiveOption(page);
  if (!(await adminOption.isVisible().catch(() => false))) {
    await page.keyboard.press('Escape').catch(() => undefined);
    return false;
  }
  await adminOption.click();
  await page
    .waitForFunction(
      () => {
        const el = document.querySelector('[data-test-id="perspective-switcher-toggle"]');
        const text = (el?.textContent ?? '').trim();
        return /administrator|core platform/i.test(text);
      },
      undefined,
      { timeout: TestTimeouts.ELEMENT_WAIT },
    )
    .catch(() => undefined);
  await page.keyboard.press('Escape').catch(() => undefined);
  return isAdminPerspective(await perspectiveToggleLabel(page));
}

/**
 * Console 4.16+ opens htpasswd users in Developer perspective; Virtualization/catalog routes need Administrator.
 */
export async function ensureNonPrivAdministratorPerspective(page: Page): Promise<void> {
  if (!EnvVariables.isNonPrivUser || EnvVariables.isLocalMode) {
    return;
  }

  await dismissConsoleObstructions(page);
  const toggle = perspectiveToggle(page);
  await toggle.waitFor({ state: 'visible', timeout: TestTimeouts.CONSOLE_LOGIN });
  if (isAdminPerspective(await perspectiveToggleLabel(page))) {
    return;
  }

  const origin = new URL(page.url()).origin;
  // Prefer URL-driven switch — more reliable than the dropdown on some 4.18 builds.
  await page.goto(`${origin}${ConsoleRoutes.clusterProjects()}?perspective=admin`, {
    timeout: TestTimeouts.CONSOLE_LOGIN,
    waitUntil: 'domcontentloaded',
  });
  await dismissConsoleObstructions(page);
  if (isAdminPerspective(await perspectiveToggleLabel(page))) {
    return;
  }

  if (await tryMenuSwitchToAdministrator(page)) {
    return;
  }

  throw new Error(
    `Non-priv console needs Administrator perspective; toggle shows "${await perspectiveToggleLabel(
      page,
    )}"`,
  );
}
