import { Locator, Page } from '@playwright/test';

/**
 * Returns a locator for `[data-test="value"]`.
 * Prefer this over bare `page.locator('[data-test="..."]')` for consistency.
 */
export const byTest = (page: Page, value: string): Locator =>
  page.locator(`[data-test="${value}"]`);

/**
 * Returns a locator for `[data-test-id="value"]`.
 * Prefer this over bare `page.locator('[data-test-id="..."]')` for consistency.
 */
export const byTestId = (page: Page, value: string): Locator =>
  page.locator(`[data-test-id="${value}"]`);

/**
 * Returns a locator scoped to a specific `[data-test-id]` container.
 * Useful for finding child elements within a known section.
 *
 * @example
 *   withinTestId(page, 'vm-row-actions').getByText('Start')
 */
export const withinTestId = (page: Page, value: string): Locator =>
  page.locator(`[data-test-id="${value}"]`);
