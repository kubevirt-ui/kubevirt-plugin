import { expect, Page } from '@playwright/test';

import { byTestId } from '../utils/locators';

import { ResourceListPage } from './ResourceListPage';

export class TemplatesPage extends ResourceListPage {
  constructor(page: Page) {
    super(page);
  }

  // ── Navigation ──────────────────────────────────────────────────────────────

  async expectNoSourceAvailableLabel() {
    await expect(this.page.getByText('Source available')).toHaveCount(0);
  }

  // ── List interactions ────────────────────────────────────────────────────────

  async expectTemplateNotVisible(metadataName: string) {
    await expect(byTestId(this.page, metadataName)).toHaveCount(0);
  }

  async expectTemplateVisible(metadataName: string) {
    await expect(byTestId(this.page, metadataName)).toBeVisible();
  }

  // ── Assertions ────────────────────────────────────────────────────────────────

  /**
   * Open the filter dropdown and activate a row filter.
   * Clicks the filter item container (label) rather than the hidden PF6 checkbox
   * input directly, which avoids the "did not change its state" error.
   */
  async filterByType(rowFilterKey: string) {
    await byTestId(this.page, 'filter-dropdown-toggle').waitFor({
      state: 'visible',
      timeout: 30_000,
    });
    await byTestId(this.page, 'filter-dropdown-toggle').click();
    // Click the item row itself — the label click propagates to the hidden checkbox
    await this.page.locator(`[data-test-row-filter="${rowFilterKey}"]`).click();
  }

  /** @param ns Specific namespace, or omit / pass 'all-namespaces' for all namespaces view. */
  async navigate(ns?: string) {
    const nsPath = ns && ns !== 'all-namespaces' ? `ns/${ns}` : 'all-namespaces';
    await super.navigate(`/k8s/${nsPath}/templates.openshift.io~v1~Template`);
  }

  async openTemplate(testId: string) {
    await byTestId(this.page, testId).click();
  }
}
