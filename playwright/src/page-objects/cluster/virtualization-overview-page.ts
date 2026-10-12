/**
 * Page object for the Virtualization Overview page (namespace-specific).
 */

import NavigationComponent from '@/components/shared/navigation-component';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

import BasePage from '../base-page';

export const VmChartType = {
  TEMPLATES: 'Show VirtualMachine per Templates',
  INSTANCE_TYPES: 'Show VirtualMachine per InstanceTypes',
  UNCATEGORIZED: 'Show uncategorized VirtualMachines',
} as const;

export type VmChartTypeValue = (typeof VmChartType)[keyof typeof VmChartType];

export default class VirtualizationOverviewPage extends BasePage {
  private readonly nav: NavigationComponent;

  constructor(page: Page) {
    super(page);
    this.nav = new NavigationComponent(page);
  }

  async clickVmListLink(linkText: string): Promise<void> {
    const link = this.locator('#link-to-vm-list').filter({ hasText: linkText });
    await link.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(link);
  }

  async navigateToNamespaceVirtualizationOverview(namespace: string) {
    await this.goTo(`/k8s/ns/${namespace}/virtualization-overview`);
  }

  async navigateToVirtualizationOverviewViaUI(): Promise<void> {
    await this.nav.clickNavVirtualizationOverview();
  }

  async selectChartType(chartType: VmChartTypeValue): Promise<void> {
    const chartTypeSelect = this.locator('button[id="overview-vms-per-resource-card"]');
    await chartTypeSelect.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(chartTypeSelect);
    await this.page.waitForTimeout(1000);
    const chartOption = this.locator(`text=${chartType}`);
    await chartOption.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(chartOption);
  }

  async selectInstanceTypeChart(): Promise<void> {
    await this.selectChartType(VmChartType.INSTANCE_TYPES);
  }

  async selectTemplatesChart(): Promise<void> {
    await this.selectChartType(VmChartType.TEMPLATES);
  }

  async selectUncategorizedChart(): Promise<void> {
    await this.selectChartType(VmChartType.UNCATEGORIZED);
  }

  async verifyInstanceTypeChart(
    expectedCount: string,
    expectedSeries: string,
  ): Promise<{
    success: boolean;
    actualCount: number | null;
    seriesFound: boolean;
  }> {
    try {
      const runningVmsCardLegendLabel = this.locator('.kv-running-vms-card__legend-label--count');
      await runningVmsCardLegendLabel.first().waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });

      const legendLabels = await runningVmsCardLegendLabel.all();
      let actualCount: number | null = null;

      for (const label of legendLabels) {
        const text = await label.textContent();
        if (text) {
          const count = parseInt(text.trim(), 10);
          if (!isNaN(count)) {
            if (actualCount === null || count > actualCount) {
              actualCount = count;
            }
          }
        }
      }

      const seriesLocator = this.locator(`text=${expectedSeries}`);
      const seriesFound = await seriesLocator
        .isVisible({ timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
        .catch(() => false);

      const expectedCountNum = parseInt(expectedCount, 10);
      const countValid = actualCount !== null && actualCount >= expectedCountNum;

      return {
        success: countValid && seriesFound,
        actualCount,
        seriesFound,
      };
    } catch {
      return {
        success: false,
        actualCount: null,
        seriesFound: false,
      };
    }
  }
}
