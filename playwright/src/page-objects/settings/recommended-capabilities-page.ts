/**
 * Page object for Virtualization Settings → Recommended capabilities.
 */

import RecommendedCapabilitiesComponent from '@/components/settings/recommended-capabilities-component';
import OverviewSettingsPage from '@/page-objects/overview/overview-settings-page';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

import BasePage from '../base-page';

export default class RecommendedCapabilitiesPage extends BasePage {
  private readonly _capabilities: RecommendedCapabilitiesComponent;
  private readonly _settings: OverviewSettingsPage;

  constructor(page: Page) {
    super(page);
    this._capabilities = new RecommendedCapabilitiesComponent(page);
    this._settings = new OverviewSettingsPage(page);
  }

  get capabilities(): RecommendedCapabilitiesComponent {
    return this._capabilities;
  }

  async navigateViaSidebar(): Promise<void> {
    await this._settings.navigateToRecommendedCapabilities();
    await this._capabilities.waitForLoaded();
  }

  async navigateViaSearch(): Promise<void> {
    await this._settings.navigateToSettingsViaSidebar();
    await this._settings.fillConfigurationSearchInput(
      'Recommended capabilities',
      'Recommended capabilities',
    );
    await this._capabilities.waitForLoaded();
  }

  async navigateToSettingsViaSidebar(): Promise<void> {
    await this._settings.navigateToSettingsViaSidebar();
  }

  async navigateBackToTab(): Promise<void> {
    const content = this._capabilities.contentLocator;
    const recommendedPath = '/virtualization-settings/recommended';

    // Software Catalog often appends &version= as a second history entry after selectedId.
    await this.page
      .waitForURL(/\/catalog\/.*[?&]version=/, { timeout: TestTimeouts.SHORT_WAIT })
      .catch(() => undefined);

    for (let attempt = 0; attempt < 5; attempt++) {
      const onTab =
        this.page.url().includes(recommendedPath) && (await content.isVisible().catch(() => false));
      if (onTab) {
        await this._capabilities.waitForLoaded();
        return;
      }

      const urlBefore = this.page.url();
      await this.page.goBack();
      await this.page
        .waitForURL((url) => url.toString() !== urlBefore, { timeout: TestTimeouts.SHORT_WAIT })
        .catch(() => undefined);
    }

    throw new Error(
      `Browser back did not return to Recommended capabilities (url: ${this.page.url()})`,
    );
  }

  async getVisibleSettingsTabTestIds(): Promise<string[]> {
    const tabs = this.page.locator('[data-test^="settings-tab-"]:visible');
    await tabs.first().waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    const ids = await tabs.evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('data-test')),
    );
    return ids.filter((id): id is string => Boolean(id));
  }
}
