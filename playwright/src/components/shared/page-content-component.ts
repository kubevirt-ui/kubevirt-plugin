// PageContentComponent — UI component for content interactions.

import BaseComponent from '@/components/shared/base-component';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

export default class PageContentComponent extends BaseComponent {
  private readonly _row = this.locator('[data-test-rows="resource-row"]');
  private readonly _pfV6CAlertpfMDanger = this.locator('.pf-v6-c-alert.pf-m-danger');

  constructor(page: Page) {
    super(page);
  }

  async filterByName(name: string) {
    const f = this.locator('[data-test-id="item-filter"]');
    await f.clear();
    await f.fill(name);
    await f.press('Tab');
    await this.page.waitForTimeout(TestTimeouts.UI_VISIBILITY_QUICK);
  }

  async verifyRowExists(name: string, timeout: number = TestTimeouts.DEFAULT) {
    try {
      const row = this._row.filter({ hasText: name });
      await row.waitFor({ state: 'visible', timeout });
      return await row.isVisible();
    } catch {
      return false;
    }
  }

  async verifyNoRow(name: string, timeout: number = TestTimeouts.DEFAULT): Promise<boolean> {
    try {
      const row = this._row.filter({ hasText: name });
      await row.waitFor({ state: 'hidden', timeout });
      return await row.isHidden();
    } catch {
      return false;
    }
  }

  private pageHeadingLocator(text: string, level: 'subtitle' | 'title') {
    const sel =
      level === 'title'
        ? 'h1, .pf-v5-c-title, .pf-v6-c-title, .pf-c-title'
        : 'h2, .pf-v5-c-title, .pf-v6-c-title, .pf-c-title';
    return this.locator(sel).filter({ hasText: text }).first();
  }

  async verifyTitle(titleText: string): Promise<boolean> {
    try {
      const l = this.pageHeadingLocator(titleText, 'title');
      await l.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      return await l.isVisible();
    } catch {
      return false;
    }
  }

  async verifySubtitle(subtitleText: string): Promise<boolean> {
    try {
      const l = this.pageHeadingLocator(subtitleText, 'subtitle');
      await l.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      return await l.isVisible();
    } catch {
      return false;
    }
  }

  async waitForSubtitle(subtitle: string, timeout: number = TestTimeouts.VM_BOOTUP) {
    await this.pageHeadingLocator(subtitle, 'subtitle').waitFor({ state: 'visible', timeout });
  }

  async waitForTitle(title: string, timeout: number = TestTimeouts.VM_BOOTUP) {
    await this.pageHeadingLocator(title, 'title').waitFor({ state: 'visible', timeout });
  }

  async alreadyExists(name?: string): Promise<boolean> {
    let errorElement;
    try {
      errorElement = name
        ? this._pfV6CAlertpfMDanger.filter({ hasText: `"${name}" already exists` })
        : this._pfV6CAlertpfMDanger.filter({ hasText: 'already exists' });
      await errorElement.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      console.log(`✓ Resource already exists error detected${name ? ` for "${name}"` : ''}`);
      return true;
    } catch {
      console.log(`✗ Resource already exists error NOT detected${name ? ` for "${name}"` : ''}`);
      return false;
    }
  }
}
