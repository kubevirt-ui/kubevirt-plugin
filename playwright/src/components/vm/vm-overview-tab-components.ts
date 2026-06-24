import BaseComponent from '@/components/shared/base-component';
import { TestTimeouts } from '@/utils/test-config';
import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class VmOverviewTabResourceHealthComponent extends BaseComponent {
  private static readonly RESOURCE_ALLOCATION_CARD_TITLES = [
    'Virtual Machines',
    'vCPU usage',
    'Memory usage',
    'Storage allocated',
  ] as const;

  private readonly _clusterStatusWidget = this.locator('[data-test="cluster-status-widget"]');
  private readonly _clusterResourcesCard = this.locator('[data-test="cluster-resources-card"]');
  private readonly _migrationsWidget = this.locator('[data-test="migrations-widget"]');
  private readonly _clusterUtilizationWidget = this.locator(
    '[data-test="cluster-utilization-widget"]',
  );
  private readonly _vmAlertsWidget = this.locator('[data-test="vm-alerts-widget"]');
  private readonly _vmStatusesCard = this.locator('[data-test="vm-statuses-card"]');
  private readonly _guestAgentIssuesWidget = this.locator(
    '[data-test="guest-agent-issues-widget"]',
  );
  private readonly _resourceAllocationWidget = this.locator(
    '[data-test="resource-allocation-widget"]',
  );

  constructor(page: Page) {
    super(page);
  }

  async verifyClusterStatusSectionWidgetsVisible(
    timeout = TestTimeouts.ELEMENT_WAIT,
    dataLoadTimeout = TestTimeouts.DEFAULT,
  ): Promise<{ allVisible: boolean; missing: string[] }> {
    await this._clusterStatusWidget.waitFor({ state: 'visible', timeout });
    const widgets: { name: string; locator: Locator }[] = [
      {
        name: 'openshift-virtualization-widget',
        locator: this.locator('[data-test="openshift-virtualization-widget"]'),
      },
      { name: 'cluster-resources-card', locator: this._clusterResourcesCard },
      { name: 'migrations-widget', locator: this._migrationsWidget },
      {
        name: 'cluster-utilization-widget',
        locator: this._clusterUtilizationWidget,
      },
      {
        name: '.two-column-card .distribution-bar-chart',
        locator: this.locator('.two-column-card .distribution-bar-chart'),
      },
      {
        name: '.two-column-card .status-score-list',
        locator: this.locator('.two-column-card .status-score-list'),
      },
    ];
    const missing: string[] = [];
    for (const { name, locator } of widgets) {
      const visible = await locator
        .waitFor({ state: 'visible', timeout })
        .then(() => true)
        .catch(() => false);
      if (!visible) missing.push(name);
    }
    if (missing.length > 0) return { allVisible: false, missing };

    await this._clusterResourcesCard
      .locator('.cluster-resources-card__tile-count')
      .first()
      .waitFor({ state: 'visible', timeout: dataLoadTimeout })
      .catch(() => undefined);
    const countsVisible = await this._clusterResourcesCard
      .locator('.cluster-resources-card__tile-count')
      .first()
      .isVisible()
      .catch(() => false);
    if (!countsVisible) missing.push('cluster-resources-card (data not loaded)');

    return { allVisible: missing.length === 0, missing };
  }

  async getClusterUtilizationMetrics(
    timeout = TestTimeouts.DEFAULT,
  ): Promise<{ name: string; percentage: string; hasProgressBar: boolean }[]> {
    const widget = this._clusterUtilizationWidget;
    await widget.waitFor({ state: 'visible', timeout });

    const bars = widget.locator('.utilization-bar');
    const count = await bars.count();
    const metrics: { name: string; percentage: string; hasProgressBar: boolean }[] = [];

    for (let i = 0; i < count; i++) {
      const bar = bars.nth(i);
      const name = (await bar.locator('.utilization-bar__title').textContent())?.trim() ?? '';
      const percentage =
        (await bar.locator('.utilization-bar__percentage').textContent())?.trim() ?? '';
      const hasProgressBar = (await bar.locator('[role="progressbar"]').count()) > 0;
      metrics.push({ name, percentage, hasProgressBar });
    }

    return metrics;
  }

  async getHealthSectionWidgetsVisibility(
    timeout = TestTimeouts.DEFAULT,
  ): Promise<{ allVisible: boolean; missing: string[] }> {
    const widgets: { name: string; locator: Locator }[] = [
      { name: 'vm-alerts-widget', locator: this._vmAlertsWidget },
      { name: 'vm-statuses-card', locator: this._vmStatusesCard },
      { name: 'guest-agent-issues-widget', locator: this._guestAgentIssuesWidget },
    ];
    const missing: string[] = [];
    for (const { name, locator } of widgets) {
      const visible = await locator
        .waitFor({ state: 'visible', timeout })
        .then(() => true)
        .catch(() => false);
      if (!visible) missing.push(name);
    }
    return { allVisible: missing.length === 0, missing };
  }

  async verifyVirtualMachinesHealthSectionWidgetsVisible(
    timeout = TestTimeouts.ELEMENT_WAIT,
  ): Promise<{ allVisible: boolean; missing: string[] }> {
    await this.page.waitForLoadState('load');
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);
    const missing: string[] = [];

    const alertsVisible = await this._vmAlertsWidget
      .waitFor({ state: 'visible', timeout })
      .then(() => true)
      .catch(() => false);
    if (!alertsVisible) missing.push('vm-alerts-widget');

    const statusesVisible = await this._vmStatusesCard
      .waitFor({ state: 'visible', timeout })
      .then(() => true)
      .catch(() => false);
    if (!statusesVisible) missing.push('vm-statuses-card');

    const guestVisible = await this._guestAgentIssuesWidget
      .waitFor({ state: 'visible', timeout })
      .then(() => true)
      .catch(() => false);
    if (!guestVisible) missing.push('guest-agent-issues-widget');

    return { allVisible: missing.length === 0, missing };
  }

  async expectResourceAllocationDataKeywordsVisible(
    dataLoadTimeout = TestTimeouts.DEFAULT,
  ): Promise<void> {
    const selector = '[data-test="resource-allocation-widget"] [data-pf-content="true"]';
    const keywords = ['running', 'vCPU', 'MiB', 'GiB'];
    await this.page.waitForFunction(
      ({ sel, kws }: { sel: string; kws: string[] }) => {
        const nodes = document.querySelectorAll(sel);
        const combined = Array.from(nodes)
          .map((el) => el.textContent ?? '')
          .join(' ');
        const lower = combined.toLowerCase();
        return kws.every((k) => lower.includes(k.toLowerCase()));
      },
      { sel: selector, kws: keywords },
      { timeout: dataLoadTimeout },
    );
  }

  async getResourceAllocationChartsVisibility(
    timeout = TestTimeouts.DEFAULT,
  ): Promise<{ count: number; allVisible: boolean }> {
    const charts = this.locator(
      '[data-test="resource-allocation-widget"] .resource-allocation-widget__chart',
    );
    await expect(charts).toHaveCount(4, { timeout });
    let allVisible = true;
    for (let i = 0; i < 4; i++) {
      const visible = await charts.nth(i).isVisible();
      if (!visible) allVisible = false;
    }
    const count = await charts.count();
    return { count, allVisible };
  }

  async waitForResourceAllocationChartsVisible(timeout = TestTimeouts.DEFAULT): Promise<void> {
    const charts = this.locator(
      '[data-test="resource-allocation-widget"] .resource-allocation-widget__chart',
    );
    await expect(charts).toHaveCount(4, { timeout });
    for (let i = 0; i < 4; i++) {
      await charts.nth(i).waitFor({ state: 'visible', timeout });
      await expect(charts.nth(i)).toBeVisible();
    }
  }

  async verifyResourceAllocationWidgetsVisible(
    timeout = TestTimeouts.ELEMENT_WAIT,
    dataLoadTimeout = TestTimeouts.DEFAULT,
  ): Promise<{ allVisible: boolean; missing: string[] }> {
    const missing: string[] = [];
    const dataPatterns: { title: string; pattern: RegExp }[] = [
      { title: 'Virtual Machines', pattern: /\d+\s*running/i },
      { title: 'vCPU usage', pattern: /\d+\s*vCPU/i },
      { title: 'Memory usage', pattern: /\d+(?:\.\d+)?\s*(?:MiB|GiB|TiB)/i },
      { title: 'Storage allocated', pattern: /\d+(?:\.\d+)?\s*(?:MiB|GiB|TiB)/i },
    ];
    for (const { title, pattern } of dataPatterns) {
      const card = this._resourceAllocationWidget.filter({ hasText: title }).first();
      const visible = await card
        .waitFor({ state: 'visible', timeout })
        .then(() => true)
        .catch(() => false);
      if (!visible) {
        missing.push(title);
        continue;
      }
      const dataLoaded = await card
        .getByText(pattern)
        .waitFor({ state: 'visible', timeout: dataLoadTimeout })
        .then(() => true)
        .catch(() => false);
      if (!dataLoaded) missing.push(`${title} (data not loaded)`);
    }
    return { allVisible: missing.length === 0, missing };
  }

  async getResourceAllocationCardDisplayedValues(): Promise<{
    runningCount: number;
    vcpu: number;
    memoryMiB: number;
    storageGiB: number;
  }> {
    const result = { runningCount: 0, vcpu: 0, memoryMiB: 0, storageGiB: 0 };
    const vmCard = this._resourceAllocationWidget.filter({ hasText: 'Virtual Machines' }).first();
    const vcpuCard = this._resourceAllocationWidget.filter({ hasText: 'vCPU usage' }).first();
    const memoryCard = this._resourceAllocationWidget.filter({ hasText: 'Memory usage' }).first();
    const storageCard = this._resourceAllocationWidget
      .filter({ hasText: 'Storage allocated' })
      .first();

    const vmText = (await vmCard.textContent()) ?? '';
    const runningMatch = vmText.match(/(\d+)\s*running/i);
    if (runningMatch) result.runningCount = parseInt(runningMatch[1], 10);

    const vcpuText = (await vcpuCard.textContent()) ?? '';
    const vcpuMatch = vcpuText.match(/(\d+)\s*vCPU/i) || vcpuText.match(/(\d+)vCPU/i);
    if (vcpuMatch) result.vcpu = parseInt(vcpuMatch[1], 10);

    const memoryText = (await memoryCard.textContent()) ?? '';
    const memoryMatch = memoryText.match(/(\d+(?:\.\d+)?)\s*MiB/i);
    if (memoryMatch) result.memoryMiB = parseFloat(memoryMatch[1]);

    const storageText = (await storageCard.textContent()) ?? '';
    const storageMatch = storageText.match(/(\d+(?:\.\d+)?)\s*GiB/i);
    if (storageMatch) result.storageGiB = parseFloat(storageMatch[1]);

    return result;
  }

  async checkResourceAllocationCardTextOverflow(): Promise<{
    hasTruncation: boolean;
    cards: { title: string; truncated: boolean; element?: string }[];
  }> {
    const cards: { title: string; truncated: boolean; element?: string }[] = [];

    for (const title of VmOverviewTabResourceHealthComponent.RESOURCE_ALLOCATION_CARD_TITLES) {
      const card = this._resourceAllocationWidget.filter({ hasText: title }).first();
      await card.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });

      const result = await card.evaluate((el: HTMLElement) => {
        const allElements = Array.from(el.querySelectorAll('*:not(svg):not(svg *)'));
        for (const child of allElements) {
          const he = child as HTMLElement;
          if (he.clientWidth === 0) continue;
          if (he.scrollWidth > he.clientWidth + 2) {
            const style = window.getComputedStyle(he);
            if (style.overflow === 'hidden' || style.overflowX === 'hidden') {
              const hasText = Array.from(he.childNodes).some(
                (n) => n.nodeType === Node.TEXT_NODE && (n.textContent?.trim().length ?? 0) > 0,
              );
              if (hasText) {
                return {
                  truncated: true,
                  element: `<${he.tagName.toLowerCase()} class="${he.className}">`,
                };
              }
            }
          }
        }
        return { truncated: false };
      });

      cards.push({ title, ...result });
    }

    return { hasTruncation: cards.some((c) => c.truncated), cards };
  }

  async verifyRunningVmsCountInHealthSection(
    namespace: string,
    expectedCount: number,
    timeout = TestTimeouts.ELEMENT_WAIT,
  ): Promise<{ matches: boolean; actualText?: string; message?: string }> {
    const link = this.locator(
      `a[href*="/k8s/ns/${namespace}/"][href*="rowFilter-status=Running"][href*="tab=vms"]`,
    );
    try {
      await link.waitFor({ state: 'visible', timeout });
      const text = (await link.textContent())?.trim() ?? '';
      const actualCount = parseInt(text, 10);
      const matches = !Number.isNaN(actualCount) && actualCount === expectedCount;
      return {
        matches,
        actualText: text,
        message: matches
          ? undefined
          : `Running VMs link text "${text}" does not match expected count ${expectedCount}`,
      };
    } catch (error: unknown) {
      return {
        matches: false,
        message:
          error instanceof Error
            ? error.message
            : `Running VMs link not found for namespace ${namespace}`,
      };
    }
  }

  async getStatusScoreItemTooltipInfo(timeout = TestTimeouts.ELEMENT_WAIT): Promise<{
    itemCount: number;
    checkedItem: { text: string; tooltipText: null | string } | null;
  }> {
    try {
      await this._clusterStatusWidget.waitFor({ state: 'visible', timeout });

      const items = this._clusterStatusWidget.locator(
        '.status-score-list__name, [class*="score-list"] [class*="name"]',
      );
      // Wait briefly for the items to render after the widget becomes visible
      await items
        .first()
        .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
        .catch(() => undefined);
      const itemCount = await items.count();
      if (itemCount === 0) return { itemCount: 0, checkedItem: null };

      const firstItem = items.first();
      const text = (await firstItem.textContent())?.trim() ?? '';

      await firstItem.hover();
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

      const tooltip = this.page.locator('[role="tooltip"], .pf-v6-c-tooltip__content');
      const tooltipVisible = await tooltip
        .first()
        .waitFor({ state: 'visible', timeout: 3000 })
        .then(() => true)
        .catch(() => false);

      let tooltipText: null | string = null;
      if (tooltipVisible) {
        tooltipText = (await tooltip.first().textContent())?.trim() ?? null;
      } else {
        tooltipText = await firstItem.getAttribute('title');
      }

      return { itemCount, checkedItem: { text, tooltipText } };
    } catch {
      return { itemCount: 0, checkedItem: null };
    }
  }

  async isResourceAllocationNoDataVisible(): Promise<boolean> {
    try {
      const section = this.locator('[data-test="resource-allocation-section"]');
      await section.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      const noData = section.getByText('No data available');
      return (await noData.count()) > 0;
    } catch {
      return false;
    }
  }

  async clickVmStatusDrillDown(
    namespace: string,
    timeout = TestTimeouts.DEFAULT,
  ): Promise<{ clicked: boolean; url: string }> {
    const nsRunningLink = this.locator(
      `a[href*="rowFilter-status=Running"][href*="tab=vms"][href*="${namespace}"]`,
    ).first();
    const anyStatusLink = this.locator('a[href*="rowFilter-status"][href*="tab=vms"]').first();

    const runningVisible = await nsRunningLink
      .waitFor({ state: 'visible', timeout })
      .then(() => true)
      .catch(() => false);

    if (runningVisible) {
      await nsRunningLink.click();
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      return { clicked: true, url: this.page.url() };
    }

    const anyVisible = await anyStatusLink
      .waitFor({ state: 'visible', timeout })
      .then(() => true)
      .catch(() => false);

    if (anyVisible) {
      await anyStatusLink.click();
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      return { clicked: true, url: this.page.url() };
    }

    return { clicked: false, url: this.page.url() };
  }

  async getOverviewViewAllLinks(
    timeout = TestTimeouts.ELEMENT_WAIT,
  ): Promise<{ section: string; href: string; visible: boolean }[]> {
    const results: { section: string; href: string; visible: boolean }[] = [];

    const sectionConfigs = [
      { label: 'Node load distribution', hrefPattern: 'nodes' },
      { label: 'Virtual machine alerts', hrefPattern: 'monitoring/alerts' },
      { label: 'Compute migrations', hrefPattern: 'migrations' },
      { label: 'Storage migration plans', hrefPattern: 'storagemigrations' },
    ];

    for (const { label, hrefPattern } of sectionConfigs) {
      try {
        const link = this.locator(`a:has-text("View all")[href*="${hrefPattern}"]`).first();
        await link.waitFor({ state: 'visible', timeout });
        const href = (await link.getAttribute('href')) ?? '';
        results.push({ section: label, href, visible: true });
      } catch {
        results.push({ section: label, href: '', visible: false });
      }
    }

    return results;
  }
}
