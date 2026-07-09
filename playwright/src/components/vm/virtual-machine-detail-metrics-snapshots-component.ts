/**
 * VirtualMachine detail — Metrics tab + Snapshots (composed sub-page).
 */

import BaseComponent from '@/components/shared/base-component';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

export default class VirtualMachineDetailMetricsSnapshotsComponent extends BaseComponent {
  private readonly _createButton = this.locator(
    'button.pf-v6-c-button.pf-m-primary.pf-m-progress, [data-test="create-button"], button.pf-m-primary:has-text("Create")',
  );
  private readonly _divnetwork = this.locator('div#network');
  private readonly _divnetworkPfV6CMenuToggle = this.locator('div#network .pf-v6-c-menu-toggle');
  private readonly _horizontalLinkMetrics = this.locator(
    '[data-test-id="horizontal-link-Metrics"]',
  );
  private readonly _horizontalLinkSnapshots = this.locator(
    '[data-test-id="horizontal-link-Snapshots"]',
  );
  private readonly _nameInput = this.locator('input[id="name"]');
  private readonly _restoreVirtualMachineFromSnapshot = this.locator(
    'text=Restore VirtualMachine from snapshot',
  );
  private readonly _roleOption = this.locator('[role="option"]');
  private readonly _snapshotsCard = this.locator(
    '[data-test-id="virtual-machine-overview-snapshots"]',
  );
  private readonly _successIcon = this.locator('[data-test="success-icon"]');
  private readonly _takeSnapshotBtn = this.locator('button:has-text("Take snapshot")');
  private readonly _vmDetailSaveButton = this.locator('[data-test="save-button"]');
  private readonly _vmName = this.locator('[data-test-id="virtual-machine-overview-details-name"]');

  constructor(page: Page) {
    super(page);
  }

  private async isVmNameVisible(
    expectedName?: string,
    timeout: number = TestTimeouts.DEFAULT,
  ): Promise<boolean> {
    await this._vmName.waitFor({ state: 'visible', timeout });
    if (!expectedName) {
      return true;
    }
    const actualText = await this._vmName.textContent();
    return actualText?.includes(expectedName) ?? false;
  }

  async cancelRestoreModal(): Promise<void> {
    const cancelButton = this.locator('[data-test="cancel-button"]');
    await cancelButton.waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
    await this.robustClick(cancelButton);
  }

  async changeMetricsTimeRange() {
    const last5Min = this.locator('button:has-text("Last 5 minutes")');
    await last5Min.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(last5Min);
    const last1Hour = this.locator('button:has-text("Last 1 hour")');
    await last1Hour.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(last1Hour);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  }

  async clearMetricsMocks(): Promise<void> {
    await this.page.unrouteAll();
  }
  /**
   * Clicks the snapshot row/link to select it (e.g. to open detail and show actions menu).
   * Uses data-test or data-test-id matching the snapshot name.
   */
  async clickSnapshot(snapshotName: string): Promise<void> {
    const snapshotLocator = this.locator(
      `[data-test="${snapshotName}"], [data-test-id="${snapshotName}"]`,
    ).first();
    await snapshotLocator.waitFor({
      state: 'visible',
      timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
    });
    await this.robustClick(snapshotLocator);
  }

  async createVmFromSnapshot(
    snapshotName: string,
    vmName: string,
    startAfterCreation = false,
  ): Promise<boolean> {
    try {
      await this.navigateToSnapshots();

      const snapshotRow = this.locator(`tr:has-text("${snapshotName}")`);
      await snapshotRow.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });

      const actionButton = snapshotRow.locator(
        'button.pf-v6-c-menu-toggle.pf-m-plain, [data-test="kebab-button"], button[aria-label="Actions"], button[aria-label="Kebab toggle"], td:last-child button',
      );
      await actionButton.first().click();

      const createVmItem = this.locator(
        'text=Create VirtualMachine, [role="menuitem"]:has-text("Create"), button:has-text("Create VirtualMachine")',
      );
      await createVmItem.first().waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      await createVmItem.first().click();

      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);

      await this._nameInput.waitFor({
        state: 'visible',
        timeout: TestTimeouts.ELEMENT_WAIT,
      });
      await this._nameInput.fill(vmName);

      if (startAfterCreation) {
        const cloneCheckbox = this.locator('input[id="start-clone"]');
        const isChecked = await cloneCheckbox.isChecked();
        if (!isChecked) {
          await cloneCheckbox.click({ force: true });
        }
      }

      await this._createButton.first().click({ force: true });

      const vmNameVisible = await this.isVmNameVisible(vmName, TestTimeouts.DEFAULT);

      return vmNameVisible;
    } catch {
      return false;
    }
  }
  /**
   * Deletes a VirtualMachineSnapshot via the row action menu: open kebab (`id="snapshot-actions-<name>"`) -> "Delete snapshot" -> confirm.
   * Call when already on the Snapshots tab with the snapshot visible.
   */
  async deleteSnapshotFromRow(snapshotName: string): Promise<void> {
    const rowActionButton = this.locator(`[id="snapshot-actions-${snapshotName}"]`);
    await rowActionButton.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
    await this.robustClick(rowActionButton);
    const deleteMenuItem = this.locator('[role="menuitem"]').filter({ hasText: 'Delete snapshot' });
    await deleteMenuItem.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
    await this.robustClick(deleteMenuItem);
    const confirmButton = this.locator('[data-test="save-button"]');
    await confirmButton.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
    await this.robustClick(confirmButton);
  }

  getCurrentUrl(): string {
    return this.page.url();
  }

  async getFirstSnapshotNameFromSnapshotsTable(
    timeoutMs: number = TestTimeouts.STATUS_VALIDATION,
  ): Promise<string> {
    const nameLink = this.locator('[data-test="vm-snapshot-list"] a').first();
    await nameLink.waitFor({ state: 'visible', timeout: timeoutMs });
    const text = (await nameLink.textContent()) || '';
    return text.trim();
  }

  async getLiveMigrationProgressText(): Promise<string> {
    try {
      const migrationRegion = this.page.getByRole('region', { name: 'Migration' });
      const completeTimeEl = migrationRegion.locator(':has-text("Complete time")').first();
      return (
        (await completeTimeEl.textContent({ timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })) ?? ''
      );
    } catch {
      return '';
    }
  }

  async getMetricsNetworkInterfaceOptions(): Promise<string[]> {
    const dropdown = this._divnetworkPfV6CMenuToggle;
    await dropdown.click();
    const options = this._roleOption;
    const count = await options.count();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await options.nth(i).textContent();
      if (text) names.push(text.trim());
    }
    await dropdown.click();
    return names;
  }

  async getMetricsNotAvailableCardTitles(
    timeout: number = TestTimeouts.DEFAULT,
  ): Promise<string[]> {
    try {
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
      const cards = this.locator('.pf-v6-c-card').filter({ hasText: 'Not available' });
      await cards
        .first()
        .waitFor({ state: 'visible', timeout })
        .catch(() => undefined);
      const count = await cards.count();
      const titles: string[] = [];
      for (let i = 0; i < count; i++) {
        const title = await cards.nth(i).locator('.pf-v6-c-card__title').textContent();
        if (title) titles.push(title.trim());
      }
      return titles;
    } catch {
      return [];
    }
  }
  async getMigrationChartQueryHrefs(): Promise<{ dataChart: string; transferRateChart: string }> {
    const migrationRegion = this.page.getByRole('region', { name: 'Migration' });
    await migrationRegion.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    const links = migrationRegion.locator('a[href*="query-browser"]');
    const dataChartRaw = (await links.first().getAttribute('href')) ?? '';
    const transferRateRaw = (await links.last().getAttribute('href')) ?? '';
    return {
      dataChart: decodeURIComponent(dataChartRaw),
      transferRateChart: decodeURIComponent(transferRateRaw),
    };
  }

  async isMetricsNetworkDropdownVisible(
    timeout: number = TestTimeouts.UI_VISIBILITY_QUICK,
  ): Promise<boolean> {
    try {
      const dropdown = this._divnetworkPfV6CMenuToggle;
      return await dropdown.isVisible({ timeout });
    } catch {
      return false;
    }
  }

  async isMetricsPrometheusWarningAlertVisible(
    timeout: number = TestTimeouts.DEFAULT,
  ): Promise<boolean> {
    try {
      const alert = this.locator('.pf-v6-c-alert.pf-m-warning').filter({
        hasText: 'observability is not available',
      });
      return await alert.isVisible({ timeout }).catch(() => false);
    } catch {
      return false;
    }
  }

  async isMetricsTimeRangeVisible(
    timeout: number = TestTimeouts.UI_VISIBILITY_QUICK,
  ): Promise<boolean> {
    try {
      const timeRange = this.locator(
        '[data-test="time-range-dropdown"], .pf-v6-c-menu-toggle',
      ).filter({
        hasText: /time range|Last \d/i,
      });
      return await timeRange
        .first()
        .isVisible({ timeout })
        .catch(() => false);
    } catch {
      return false;
    }
  }

  async isMigrationSectionVisible(): Promise<boolean> {
    try {
      return await this.page
        .getByRole('region', { name: 'Migration' })
        .isVisible({ timeout: TestTimeouts.ELEMENT_WAIT });
    } catch {
      return false;
    }
  }

  async isVolumeRestorePolicyAbsent(): Promise<boolean> {
    try {
      const policyLabel = this.locator('[role="radiogroup"]:has-text("Volume restore policy")');
      return !(await policyLabel
        .isVisible({ timeout: TestTimeouts.SHORT_WAIT })
        .catch(() => false));
    } catch {
      return true;
    }
  }

  /**
   * Mocks the MCO availability check and Prometheus query_range responses so the
   * Metrics tab renders charts and the network interface dropdown even on clusters
   * without real MCO/Prometheus. Call BEFORE navigating to the Metrics tab.
   */
  async mockMetricsPrometheusResponses(): Promise<void> {
    await this.page.route(
      '**/observability.open-cluster-management.io/**multiclusterobservabilities**',
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            apiVersion: 'observability.open-cluster-management.io/v1beta2',
            kind: 'MultiClusterObservabilityList',
            items: [
              {
                apiVersion: 'observability.open-cluster-management.io/v1beta2',
                kind: 'MultiClusterObservability',
                metadata: { name: 'observability' },
                status: { conditions: [{ type: 'Ready', status: 'True' }] },
              },
            ],
          }),
        });
      },
    );

    await this.page.route('**/api/prometheus/api/v1/query_range**', async (route) => {
      const url = route.request().url();
      const query = decodeURIComponent(url);
      const isNetwork = query.includes('network');
      const now = Math.floor(Date.now() / 1000);
      const step = url.includes('step=5') ? 5 : 60;
      const count = step === 5 ? 60 : 10;

      const makeValues = (base: number, variance: number): [number, string][] =>
        Array.from({ length: count }, (_, i) => [
          now - (count - i) * step,
          String((base + Math.random() * variance).toFixed(6)),
        ]);

      const result = isNetwork
        ? [
            {
              metric: { interface: 'eth0', name: 'mock-vm', namespace: 'default' },
              values: makeValues(50000, 30000),
            },
            {
              metric: { interface: 'default', name: 'mock-vm', namespace: 'default' },
              values: makeValues(20000, 10000),
            },
          ]
        : [
            {
              metric: { name: 'mock-vm', namespace: 'default' },
              values: makeValues(0.25, 0.5),
            },
          ];

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'success', data: { resultType: 'matrix', result } }),
      });
    });
  }

  async navigateToMetrics(): Promise<void> {
    await this._horizontalLinkMetrics.waitFor({
      state: 'visible',
      timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
    });
    await this.robustClick(this._horizontalLinkMetrics);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async navigateToSnapshots(): Promise<void> {
    await this._horizontalLinkSnapshots.waitFor({
      state: 'visible',
      timeout: TestTimeouts.VM_CREATION,
    });
    await this.robustClick(this._horizontalLinkSnapshots);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }
  async openRestoreModalForSnapshot(snapshotName: string): Promise<void> {
    const snapshotRow = this.locator(`tr:has-text("${snapshotName}")`);
    await snapshotRow.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });

    const actionButton = snapshotRow.locator('td button').last();
    await actionButton.click();

    await this._restoreVirtualMachineFromSnapshot.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this._restoreVirtualMachineFromSnapshot.click();

    await this._vmDetailSaveButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
  }
  async restoreVmFromSnapshot(
    snapshotName: string,
  ): Promise<{ success: boolean; payload?: unknown }> {
    try {
      const responsePromise = this.page
        .waitForResponse(
          (response) =>
            response.url().includes('virtualmachinerestores') &&
            response.request().method() === 'POST' &&
            response.status() === 201,
          { timeout: TestTimeouts.UI_ACTION_COMPLETE },
        )
        .catch(() => undefined);

      const snapshotRow = this.locator(`tr:has-text("${snapshotName}")`);
      await snapshotRow.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });

      const actionButton = snapshotRow.locator('td button').last();
      await actionButton.click();

      await this._restoreVirtualMachineFromSnapshot.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this._restoreVirtualMachineFromSnapshot.click();

      await this._vmDetailSaveButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this.robustClick(this._vmDetailSaveButton);

      const response = await responsePromise;
      let payload = undefined;

      if (response) {
        try {
          payload = await response.request().postDataJSON();
        } catch {
          // Ignore payload extraction errors
        }
      }

      return { success: true, payload };
    } catch {
      return { success: false };
    }
  }

  async selectMetricsNetworkInterface(nicName: string): Promise<{
    urlBefore: string;
    urlAfter: string;
  }> {
    const urlBefore = this.page.url();
    const dropdown = this._divnetworkPfV6CMenuToggle;
    await dropdown.click();
    const option = this._roleOption.filter({ hasText: nicName });
    await option.click();
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    return { urlBefore, urlAfter: this.page.url() };
  }

  async takeSnapshot(snapshotName: string): Promise<boolean> {
    try {
      await this.navigateToSnapshots();

      await this._takeSnapshotBtn.waitFor({
        state: 'visible',
        timeout: TestTimeouts.VM_CREATION,
      });
      await this._takeSnapshotBtn.click();

      await this._nameInput.waitFor({
        state: 'visible',
        timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
      });
      await this._nameInput.fill(snapshotName);

      await this.clickSaveByTestId();

      const snapshotLink = this.locator(`a:has-text("${snapshotName}")`);
      await snapshotLink.waitFor({ state: 'visible', timeout: TestTimeouts.STATUS_VALIDATION });
      const snapshotExists = await snapshotLink.isVisible().catch(() => false);

      return snapshotExists;
    } catch {
      return false;
    }
  }

  async verifyMetricsNetworkHasData(): Promise<boolean> {
    try {
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_LONG);

      const networkSectionExists = await this._divnetwork
        .isVisible({ timeout: TestTimeouts.VM_CREATION })
        .catch(() => false);

      if (!networkSectionExists) {
        return false;
      }

      const noDataText = this._divnetwork.locator('text=No data available');
      const hasNoData = await noDataText
        .isVisible({ timeout: TestTimeouts.UI_DELAY_LONG })
        .catch(() => false);

      return !hasNoData;
    } catch {
      return false;
    }
  }

  async verifyMetricsTimeRangeIs(expectedTimeRange: string): Promise<boolean> {
    const dropdown = this.locator(`button:has-text("${expectedTimeRange}")`);
    try {
      await dropdown.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      return true;
    } catch {
      return false;
    }
  }

  async verifyNoSnapshots(): Promise<boolean> {
    return await super.verifyTextVisible('No snapshots found');
  }

  /**
   * Verifies the Snapshots tab shows "No snapshots found" in the snapshot list empty state heading.
   */
  async verifyNoSnapshotsFoundInLoadingBox(): Promise<boolean> {
    const emptyHeading = this.locator('[data-test="vm-snapshot-list"] h4');
    await emptyHeading.waitFor({ state: 'visible', timeout: TestTimeouts.STATUS_VALIDATION });
    const text = await emptyHeading.textContent();
    return text?.includes('No snapshots found') ?? false;
  }
  /**
   * Verifies the empty state is shown: empty-box-body contains "No VirtualMachineSnapshots found".
   */
  async verifyNoVirtualMachineSnapshotsEmptyState(): Promise<boolean> {
    try {
      await this.navigateToSnapshots();
      const emptyBox = this.locator(
        '[data-test="empty-box-body"], .pf-v6-c-empty-state, .pf-c-empty-state',
      ).first();
      await emptyBox.waitFor({ state: 'visible', timeout: TestTimeouts.STATUS_VALIDATION });
      const text = await emptyBox.textContent();
      return (
        text?.includes('No VirtualMachineSnapshots found') ||
        text?.includes('No snapshots') ||
        text?.includes('not found') ||
        false
      );
    } catch {
      return false;
    }
  }

  async verifySnapshotExists(snapshotName: string): Promise<boolean> {
    try {
      await this.navigateToSnapshots();
      const snapshotLocator = this.locator(
        `[data-test="${snapshotName}"], [data-test-id="${snapshotName}"], a:has-text("${snapshotName}")`,
      ).first();
      await snapshotLocator.waitFor({
        state: 'visible',
        timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
      });
      return true;
    } catch {
      return false;
    }
  }

  async verifySnapshotInCard(): Promise<boolean> {
    try {
      await this._snapshotsCard.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });

      const snapshotsLink = this._snapshotsCard.locator('a:has-text("Snapshots (1)")');
      const snapshotsLinkExists = await snapshotsLink
        .isVisible({ timeout: TestTimeouts.STATUS_VALIDATION })
        .catch(() => false);

      if (!snapshotsLinkExists) {
        return false;
      }

      await snapshotsLink.click();

      await this._successIcon
        .waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT })
        .catch(() => {
          return;
        });
      const successExists = await this._successIcon.isVisible().catch(() => false);

      return successExists;
    } catch {
      return false;
    }
  }

  async verifySnapshotsCardVisible(): Promise<boolean> {
    try {
      await this._snapshotsCard.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
      return true;
    } catch {
      return false;
    }
  }

  async verifySnapshotWithSuccessIcon(): Promise<boolean> {
    try {
      await this._successIcon.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
      const successIconVisible = await this._successIcon
        .isVisible({ timeout: TestTimeouts.DEFAULT })
        .catch(() => false);

      return successIconVisible;
    } catch {
      return false;
    }
  }
}
