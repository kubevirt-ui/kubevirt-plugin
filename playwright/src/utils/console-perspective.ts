import { dismissConsoleObstructions } from '@/utils/console-modals';
import { ConsoleRoutes } from '@/utils/console-routes';
import { EnvVariables } from '@/utils/env-variables';
import { pollUntil } from '@/utils/poll-until';
import { TestTimeouts } from '@/utils/test-config';
import type { Locator, Page } from '@playwright/test';

function perspectiveToggle(page: Page): Locator {
  return page.locator('[data-test-id="perspective-switcher-toggle"]');
}

/** Console 4.21+ uses “Core platform”; older builds use “Administrator”. */
function isNonPrivVirtualizationPerspective(label: string): boolean {
  return /administrator|core platform/i.test(label);
}

function administratorPerspectiveOption(page: Page): Locator {
  return page
    .locator('[data-test-id="perspective-switcher-menu-option"]')
    .filter({ hasText: /Administrator|Core platform/i })
    .or(page.getByRole('menuitem', { name: /^(Administrator|Core platform)$/i }))
    .or(page.getByRole('option', { name: /^(Administrator|Core platform)$/i }))
    .first();
}

async function perspectiveToggleLabel(page: Page): Promise<string> {
  return ((await perspectiveToggle(page).textContent()) ?? '').trim();
}

async function tryLegacyAdministratorMenuSwitch(page: Page): Promise<void> {
  await perspectiveToggle(page).click({ force: true });
  const adminOption = administratorPerspectiveOption(page);
  if (!(await adminOption.isVisible().catch(() => false))) {
    await page.keyboard.press('Escape').catch(() => undefined);
    return;
  }
  await adminOption.click();
  await pollUntil(
    async () => isNonPrivVirtualizationPerspective(await perspectiveToggleLabel(page)),
    {
      message: 'Administrator / Core platform perspective should activate after selection',
      timeout: TestTimeouts.ELEMENT_WAIT,
    },
  );
  await page.keyboard.press('Escape').catch(() => undefined);
}

/**
 * Console 4.16+ opens htpasswd users in Developer perspective; Virtualization/catalog routes need Administrator.
 * Console 4.21+ uses a single “Core platform” perspective (no Administrator menu entry).
 */
export async function ensureNonPrivAdministratorPerspective(page: Page): Promise<void> {
  if (!EnvVariables.isNonPrivUser || EnvVariables.isLocalMode) {
    return;
  }

  await dismissConsoleObstructions(page);
  const toggle = perspectiveToggle(page);
  await toggle.waitFor({ state: 'visible', timeout: TestTimeouts.CONSOLE_LOGIN });

  if (isNonPrivVirtualizationPerspective(await perspectiveToggleLabel(page))) {
    return;
  }

  const origin = new URL(page.url()).origin;
  await page.goto(`${origin}${ConsoleRoutes.clusterProjects()}`, {
    timeout: TestTimeouts.CONSOLE_LOGIN,
    waitUntil: 'domcontentloaded',
  });
  await dismissConsoleObstructions(page);

  if (isNonPrivVirtualizationPerspective(await perspectiveToggleLabel(page))) {
    return;
  }

  await tryLegacyAdministratorMenuSwitch(page);

  if (!isNonPrivVirtualizationPerspective(await perspectiveToggleLabel(page))) {
    throw new Error(
      `Non-priv console needs Administrator or Core platform perspective; toggle shows "${await perspectiveToggleLabel(
        page,
      )}"`,
    );
  }
}
