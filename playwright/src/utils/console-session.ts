import { dismissConsoleObstructions } from '@/utils/console-modals';
import { logger } from '@/utils/logger';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

/** OAuth / login URLs that mean storage state is missing or expired. */
export function isUnauthenticatedConsoleUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (/oauth-openshift/i.test(parsed.hostname)) {
      return true;
    }
    const path = parsed.pathname;
    return (
      path.includes('/auth/login') ||
      path.includes('/oauth/authorize') ||
      /^\/login(\/|$)/.test(path)
    );
  } catch {
    return /oauth-openshift|\/auth\/login|\/oauth\/authorize|\/login/i.test(url);
  }
}

/**
 * Wait for the OpenShift console shell (perspective switcher). Reloads once if slow.
 */
export async function ensureConsoleShellReady(page: Page, consoleOrigin: string): Promise<void> {
  const origin = consoleOrigin.replace(/\/$/, '');
  await dismissConsoleObstructions(page);

  if (isUnauthenticatedConsoleUrl(page.url())) {
    throw new Error(
      'Console session is not authenticated. Re-run global setup (remove REUSE_STORAGE_STATE or delete .storage-states/*.json).',
    );
  }

  const toggle = page.locator('[data-test-id="perspective-switcher-toggle"]');
  try {
    await toggle.waitFor({ state: 'visible', timeout: TestTimeouts.CONSOLE_LOGIN });
  } catch {
    logger.warn('Console shell not ready — reloading once and retrying');
    await page.goto(origin, {
      timeout: TestTimeouts.CONSOLE_LOGIN,
      waitUntil: 'domcontentloaded',
    });
    await dismissConsoleObstructions(page);
    if (isUnauthenticatedConsoleUrl(page.url())) {
      throw new Error(
        'Console session is not authenticated after reload. Re-run global setup (remove REUSE_STORAGE_STATE or delete .storage-states/*.json).',
      );
    }
    await toggle.waitFor({ state: 'visible', timeout: TestTimeouts.CONSOLE_LOGIN });
  }
  await dismissConsoleObstructions(page);
}
