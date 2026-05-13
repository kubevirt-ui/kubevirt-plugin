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
