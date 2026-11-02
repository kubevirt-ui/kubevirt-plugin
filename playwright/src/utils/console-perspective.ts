import { dismissConsoleObstructions } from '@/utils/console-modals';
import { ConsoleRoutes } from '@/utils/console-routes';
import { EnvVariables } from '@/utils/env-variables';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

function perspectiveToggle(page: Page) {
  return page.locator('[data-test-id="perspective-switcher-toggle"]');
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
  const label = ((await toggle.textContent()) ?? '').trim();
  if (/administrator/i.test(label)) {
    return;
  }

  const origin = new URL(page.url()).origin;
  await page.goto(`${origin}${ConsoleRoutes.clusterProjects()}`, {
    timeout: TestTimeouts.CONSOLE_LOGIN,
    waitUntil: 'domcontentloaded',
  });
  await dismissConsoleObstructions(page);
  const toggleAfter = perspectiveToggle(page);
  const labelAfter = ((await toggleAfter.textContent()) ?? '').trim();
  if (/administrator/i.test(labelAfter)) {
    return;
  }
  await toggleAfter.click({ force: true });
  const adminOption = page
    .locator('[data-test-id="perspective-switcher-menu-option"]')
    .filter({ hasText: /Administrator/i });
  await adminOption.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
  await adminOption.click();
  await toggleAfter
    .filter({ hasText: /Administrator/i })
    .waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
  await page.keyboard.press('Escape').catch(() => undefined);
}
