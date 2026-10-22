import BasePage from '@/page-objects/base-page';
import { ConsoleRoutes } from '@/utils/console-routes';
import { TestTimeouts } from '@/utils/test-config';
import type { Locator, Page } from '@playwright/test';

export type VirtualizationSettingsTabId =
  | 'cluster'
  | 'downloads'
  | 'features'
  | 'recommended'
  | 'user';

export class VirtualizationSettingsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goToSettings(): Promise<void> {
    await this.page.goto(ConsoleRoutes.virtualizationSettings(), {
      waitUntil: 'domcontentloaded',
    });
    await this.page
      .locator('[data-test="settings-tab-user"], [data-test="settings-tab-cluster"]')
      .first()
      .waitFor({ state: 'visible', timeout: TestTimeouts.LONG_OPERATION });
  }

  async openTab(tab: VirtualizationSettingsTabId): Promise<void> {
    const link = this.settingsTab(tab);
    await link.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await link.click();
    await this.tabPanel(tab).waitFor({ state: 'visible', timeout: TestTimeouts.LONG_OPERATION });
  }

  previewFeaturesInstanceTypesToggle(): Locator {
    return this.tabPanel('features').getByText(/InstanceTypes catalog developer preview/i);
  }

  settingsTab(tab: VirtualizationSettingsTabId): Locator {
    return this.page.locator(`[data-test="settings-tab-${tab}"]`);
  }

  tabPanel(tab: VirtualizationSettingsTabId): Locator {
    const panelTestId: Record<VirtualizationSettingsTabId, string> = {
      cluster: 'cluster-settings',
      downloads: 'downloads',
      features: 'preview-features',
      recommended: 'recommended-capabilities',
      user: 'user-settings',
    };
    return this.page.locator(`[data-test="${panelTestId[tab]}"]`);
  }
}
