/**
 * Base class for page objects (main-style). Extends BaseComponent with no scenario context on 4.12.
 */

import BaseComponent from '@/components/shared/base-component';
import type { Locator, Page } from '@playwright/test';

export default class BasePage extends BaseComponent {
  constructor(page: Page) {
    super(page);
  }

  /** List index pages: 4.19+ use `h1`; older console builds use `data-test-id="resource-title"`. */
  protected listPageHeading(titlePattern: RegExp): Locator {
    return this.page
      .getByRole('heading', { level: 1, name: titlePattern })
      .or(this.page.locator('[data-test-id="resource-title"]').filter({ hasText: titlePattern }))
      .first();
  }
}
