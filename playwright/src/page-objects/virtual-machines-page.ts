import type { Locator, Page } from '@playwright/test';

/**
 * Page object for the VirtualMachines list view.
 * Injected via the scenarioTest fixture.
 *
 * Assumes the Virtualization perspective is already active.
 * The VM navigator uses a tabbed layout: Overview (default) and Virtual machines.
 */
export class VirtualMachinesPage {
  readonly createBtn: Locator;
  readonly heading: Locator;
  readonly nameFilter: Locator;
  readonly vmListTab: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.locator('h1').filter({ hasText: 'VirtualMachines' }).first();
    this.createBtn = page.locator('[data-test="item-create"]');
    this.nameFilter = page.getByTestId('name-filter-input');
    this.vmListTab = page.getByTestId('vm-list-tab');
  }

  async filterByName(name: string): Promise<void> {
    await this.nameFilter.fill(name);
    await this.nameFilter.press('Enter');
  }

  getVmRow(vmName: string): Locator {
    return this.page.locator(`[data-test-rows="resource-row"]`, { hasText: vmName });
  }

  async selectVmListTab(): Promise<void> {
    await this.vmListTab.click();
    await this.page.waitForLoadState('load');
  }

  async waitForLoaded(timeout = 30_000): Promise<void> {
    await this.heading.waitFor({ state: 'visible', timeout });
  }
}
