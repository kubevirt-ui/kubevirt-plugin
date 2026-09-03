import type { Locator, Page } from '@playwright/test';

export const PENDING_STATUS_MESSAGE_PATTERN =
  /Pending changes|Restart required|Migration required/;

export const getPendingStatusMessageLocator = (page: Page): Locator =>
  page.getByText(PENDING_STATUS_MESSAGE_PATTERN);
