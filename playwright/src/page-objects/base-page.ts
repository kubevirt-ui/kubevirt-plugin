/**
 * Base class for page objects (main-style). Extends BaseComponent with no scenario context on 4.12.
 */

import BaseComponent from '@/components/shared/base-component';
import { dismissConsoleObstructions } from '@/utils/console-modals';
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

  /** Console error boundary ("Out-of-order effect") after rapid tab changes on VM detail. */
  protected async recoverConsoleCrashPage(): Promise<void> {
    await dismissConsoleObstructions(this.page);
    const crashed = this.page.getByRole('heading', { name: /Something wrong happened/i });
    if (!(await crashed.isVisible().catch(() => false))) {
      return;
    }
    await this.page.getByRole('button', { name: /Reload page/i }).click();
    await this.page.waitForLoadState('domcontentloaded');
    await dismissConsoleObstructions(this.page);
    const strayModal = this.page.locator('#tab-modal, [role="dialog"][aria-modal="true"]').first();
    if (await strayModal.isVisible().catch(() => false)) {
      await strayModal
        .getByRole('button', { name: /^Close$|^Cancel$/i })
        .first()
        .click()
        .catch(() => undefined);
    }
  }
}
