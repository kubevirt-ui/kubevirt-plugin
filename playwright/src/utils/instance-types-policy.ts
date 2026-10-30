import { ConsoleRoutes } from '@/utils/console-routes';
import { TestTimeouts } from '@/utils/test-config';
import type { Locator, Page } from '@playwright/test';

/**
 * InstanceTypes developer preview must stay enabled for Playwright runs.
 * Do not use `test.skip` for missing InstanceTypes UI — fix cluster setup or the test.
 */

export async function waitForConsoleRouteReady(
  page: Page,
  path: string,
  readyLocator: Locator,
  context: string,
): Promise<void> {
  await page.goto(path, { waitUntil: 'domcontentloaded' });

  const notFoundHeading = page.getByRole('heading', { name: /404: Page Not Found/i });
  const missingResource = page.getByText(/doesn't have a resource type/i);

  const deadline = Date.now() + TestTimeouts.LONG_OPERATION;
  while (Date.now() < deadline) {
    if (
      (await notFoundHeading.isVisible().catch(() => false)) ||
      (await missingResource.isVisible().catch(() => false))
    ) {
      throw new Error(
        `${context}: console route unavailable at ${path}. Ensure InstanceTypes developer preview is enabled (kubevirt-ui-features instanceTypesEnabled=true) and the console plugin exposes this route.`,
      );
    }
    if (await readyLocator.isVisible().catch(() => false)) {
      return;
    }
    await page.waitForTimeout(500);
  }

  await readyLocator.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT }).catch(() => {
    throw new Error(`${context}: ready UI did not appear at ${path}`);
  });
}

/** Legacy catalog InstanceTypes tab (`/templatescatalog/instanceTypes`). */
/** @deprecated Use {@link CatalogPage.waitForInstanceTypesCatalogRouteReady} */
export async function assertInstanceTypesCatalogRouteReady(
  page: Page,
  namespace: string,
  context = 'InstanceTypes catalog',
): Promise<void> {
  await waitForConsoleRouteReady(
    page,
    ConsoleRoutes.legacyInstanceTypesCatalog(namespace),
    page.getByRole('tabpanel', { name: /InstanceTypes/i }),
    context,
  );
}

/** @deprecated Use {@link waitForConsoleRouteReady} */
export const assertConsoleRouteReady = waitForConsoleRouteReady;
