import BaseComponent from '@/components/shared/base-component';
import NavigationComponent from '@/components/shared/navigation-component';
import { VirtualMachineDetailCdromComponent } from '@/components/vm/vm-detail-actions-components';
import { VirtualMachineDetailConfigurationCdromComponent } from '@/components/vm/vm-detail-config-components';
import { VmDetailDisksOperationsComponent } from '@/components/vm/vm-detail-disks-edit-components';
import { VmDetailSnapshotsComponent } from '@/components/vm/vm-detail-disks-form-snapshots-components';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class VirtualMachineDetailDisksComponent extends BaseComponent {
  private readonly _addDiskButtonInStorage = this.locator(
    '.kv-configuration-vm-disk-list button:has-text("Add"), [data-test-id="storage-add-button"], button:has-text("Add disk")',
  );

  readonly cdrom: VirtualMachineDetailCdromComponent;
  readonly configurationCdrom: VirtualMachineDetailConfigurationCdromComponent;
  private readonly _operations: VmDetailDisksOperationsComponent;

  constructor(page: Page) {
    super(page);
    this.cdrom = new VirtualMachineDetailCdromComponent(page);
    this.configurationCdrom = new VirtualMachineDetailConfigurationCdromComponent(page);
    this._operations = new VmDetailDisksOperationsComponent(page);
  }

  async navigateToConfigurationStorage(): Promise<void> {
    return this._operations.navigateToConfigurationStorage();
  }

  async verifyDiskExists(diskName: string): Promise<boolean> {
    try {
      const labeled = this.locator(
        `[data-label="source"]:has-text("${diskName}"), [data-label="Source"]:has-text("${diskName}")`,
      );
      const hasLabeled = await labeled
        .first()
        .isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM })
        .catch(() => false);

      if (hasLabeled) {
        return true;
      }

      const cellWithText = this.locator(`td:has-text("${diskName}")`).first();
      await cellWithText.waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_LONG });
      return true;
    } catch {
      return false;
    }
  }

  async verifyDiskNameExists(diskName: string): Promise<boolean> {
    try {
      const diskLocator = this.locator(
        `td:has-text("${diskName}"), [data-label="name"]:has-text("${diskName}"), [data-label="Name"]:has-text("${diskName}")`,
      ).first();
      await diskLocator.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
      return true;
    } catch {
      return false;
    }
  }

  async isAddDiskButtonEnabled(): Promise<boolean> {
    await this.navigateToConfigurationStorage();
    await this._addDiskButtonInStorage.waitFor({
      state: 'visible',
      timeout: TestTimeouts.VM_CREATION,
    });
    const isDisabled = await this._addDiskButtonInStorage.evaluate((el) => {
      const btn = el instanceof HTMLButtonElement ? el : el.querySelector('button');
      if (!btn) return false;
      return btn.disabled || btn.getAttribute('aria-disabled') === 'true';
    });
    return !isDisabled;
  }

  async getCDROMModalOptions(): Promise<{
    title: string;
    radioLabels: string[];
    defaultSelected: string;
    submitButtonLabel: string;
  }> {
    return this.configurationCdrom.getCDROMModalOptions();
  }

  async verifyUploadNewISOHasNoUploadModeSelector(): Promise<boolean> {
    return this.configurationCdrom.verifyUploadNewISOHasNoUploadModeSelector();
  }

  async addCDROMDisk(
    diskName: string,
    cdromSource: 'Leave empty drive' | 'Upload new ISO' | 'Use existing ISO' = 'Upload new ISO',
    sourceValue?: string,
  ): Promise<boolean> {
    return this.configurationCdrom.addCDROMDisk(diskName, cdromSource, sourceValue);
  }

  async addLUNDisk(diskName?: string): Promise<string> {
    return this._operations.addLUNDisk(diskName);
  }

  async addShareableDisk(diskName?: string): Promise<string> {
    return this._operations.addShareableDisk(diskName);
  }

  private getDiskRow(diskName: string) {
    return this.locator(
      `tr:has([data-test-id="disk-${diskName}"]), tr:has([data-test-id="${diskName}"])`,
    );
  }

  async addBlankDisk(diskName: string, size = '1', storageClass?: string): Promise<boolean> {
    return this._operations.addBlankDisk(
      diskName,
      size,
      storageClass,
      (name) => this.verifyDiskNameExists(name),
      (name) => this.verifyDiskExists(name),
    );
  }

  async makeDiskPersistent(diskName: string): Promise<boolean> {
    return this._operations.makeDiskPersistent(diskName);
  }

  async verifyDiskHasPersistentHotplugLabel(diskName: string): Promise<boolean> {
    return this._operations.verifyDiskHasPersistentHotplugLabel(diskName);
  }

  async verifyDiskDoesNotHavePersistentHotplugLabel(diskName: string): Promise<boolean> {
    return this._operations.verifyDiskDoesNotHavePersistentHotplugLabel(diskName);
  }

  async setWindowsDriversOnDiskTab(mount: boolean): Promise<boolean> {
    return this._operations.setWindowsDriversOnDiskTab(mount);
  }

  async verifyWindowsDriversCheckbox(shouldBeChecked: boolean): Promise<boolean> {
    return this._operations.verifyWindowsDriversCheckbox(shouldBeChecked);
  }

  async verifyWindowsDriversDisk(shouldExist: boolean): Promise<boolean> {
    return this._operations.verifyWindowsDriversDisk(shouldExist);
  }

  async createBootableVolumeFromDisk(
    diskName: string,
    bootableVolumeName: string,
  ): Promise<boolean> {
    return this._operations.createBootableVolumeFromDisk(diskName, bootableVolumeName);
  }

  async detachDisk(diskName: string): Promise<boolean> {
    return this._operations.detachDisk(diskName);
  }

  async verifyDiskHasAutoDetachHotplugLabel(diskName: string): Promise<boolean> {
    return this._operations.verifyDiskHasAutoDetachHotplugLabel(diskName);
  }

  async verifyDiskDoesNotExist(diskName: string): Promise<boolean> {
    return this._operations.verifyDiskDoesNotExist(diskName);
  }

  async resizeDisk(diskName: string, newSize: string): Promise<boolean> {
    return this._operations.resizeDisk(diskName, newSize);
  }

  async verifyDiskSourceVisible(sourceValue: string): Promise<boolean> {
    try {
      await this.navigateToConfigurationStorage();
      const sourceLocators = this.locator('[data-label="source"], [data-label="Source"]');
      const count = await sourceLocators.count();

      if (count === 0) {
        const allRows = this.locator('table tbody tr');
        const rowCount = await allRows.count();
        for (let i = 0; i < rowCount; i++) {
          const rowText = await allRows.nth(i).textContent();
          if (rowText?.includes(sourceValue) || rowText?.includes(`DV ${sourceValue}`)) {
            return true;
          }
        }
        return false;
      }

      for (let i = 0; i < count; i++) {
        const sourceText = await sourceLocators.nth(i).textContent();
        if (sourceText) {
          const trimmedSource = sourceText.trim();

          if (sourceValue !== 'Ephemeral') {
            if (
              trimmedSource.includes(sourceValue) ||
              trimmedSource.includes(`DV ${sourceValue}`)
            ) {
              const sourceElement = sourceLocators.nth(i);
              const row = sourceElement.locator('xpath=ancestor::tr');
              const rowExists = await row
                .isVisible({ timeout: TestTimeouts.UI_DELAY_EXTRA })
                .catch(() => false);
              if (rowExists) {
                const dataTestId = await row
                  .locator('[data-test-id]')
                  .first()
                  .getAttribute('data-test-id')
                  .catch(() => null);
                return dataTestId !== null;
              }
            }
          } else {
            if (trimmedSource.includes('Ephemeral') || trimmedSource.includes('Container')) {
              const sourceElement = sourceLocators.nth(i);
              const row = sourceElement.locator('xpath=ancestor::tr');
              const rowExists = await row
                .isVisible({ timeout: TestTimeouts.UI_DELAY_EXTRA })
                .catch(() => false);
              if (rowExists) {
                const dataTestId = await row
                  .locator('[data-test-id]')
                  .first()
                  .getAttribute('data-test-id')
                  .catch(() => null);
                return dataTestId !== null;
              }
            }
          }
        }
      }
      return false;
    } catch {
      return false;
    }
  }

  async verifyDiskSource(diskName: string, expectedSource: string): Promise<boolean> {
    try {
      const diskRow = this.locator('tr', { hasText: diskName }).first();
      const labeled = diskRow.locator('[data-label="source"], [data-label="Source"]');
      const hasLabeled = await labeled
        .first()
        .isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM })
        .catch(() => false);

      if (hasLabeled) {
        await expect(labeled.first()).toContainText(expectedSource, {
          timeout: TestTimeouts.DEFAULT,
        });
        return true;
      }

      const rowText = await diskRow.textContent();
      return rowText?.includes(expectedSource) ?? false;
    } catch (error) {
      console.error(
        `Failed to verify disk source for ${diskName}. Expected: ${expectedSource}`,
        error,
      );
      return false;
    }
  }

  async getDiskSizeValue(diskName: string): Promise<null | string> {
    try {
      const byTestId = this.locator(`[data-test-id="disk-size-${diskName}"]`).first();
      const visible = await byTestId
        .isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM })
        .catch(() => false);
      if (visible) {
        return (await byTestId.textContent())?.trim() || null;
      }
      const diskRow = this.getDiskRow(diskName);
      const sizeCell = diskRow.locator('[data-label="size"], [data-label="Size"]').first();
      const cellVisible = await sizeCell
        .isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM })
        .catch(() => false);
      if (cellVisible) {
        return (await sizeCell.textContent())?.trim() || null;
      }
      return null;
    } catch {
      return null;
    }
  }

  async getEditDiskModalSizeInfo(diskName: string): Promise<{
    value: null | string;
    unit: null | string;
    decrementDisabled: boolean;
  }> {
    return this._operations.getEditDiskModalSizeInfo(diskName);
  }

  async getDiskDriveValue(diskName: string): Promise<null | string> {
    try {
      const cell = this.locator(`[data-test-id="disk-drive-${diskName}"]`).first();
      const visible = await cell
        .isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM })
        .catch(() => false);
      if (visible) {
        return (await cell.textContent())?.trim() || null;
      }
      return null;
    } catch {
      return null;
    }
  }

  async getDiskInterfaceValue(diskName: string): Promise<null | string> {
    try {
      const cell = this.locator(`[data-test-id="disk-interface-${diskName}"]`).first();
      const visible = await cell
        .isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM })
        .catch(() => false);
      if (visible) {
        return (await cell.textContent())?.trim() || null;
      }
      return null;
    } catch {
      return null;
    }
  }

  async navigateToVmiDisksTab(vmName: string, namespace: string): Promise<void> {
    return this.cdrom.navigateToVmiDisksTab(vmName, namespace);
  }

  async getVmiDiskColumnValue(
    diskName: string,
    column: 'drive' | 'interface' | 'name' | 'size' | 'source',
  ): Promise<null | string> {
    return this.cdrom.getVmiDiskColumnValue(diskName, column);
  }

  async ejectCdrom(diskName?: string): Promise<boolean> {
    return this.cdrom.ejectCdrom(diskName);
  }

  async ejectCdromByVolumeName(volumeName: string): Promise<boolean> {
    return this.cdrom.ejectCdromByVolumeName(volumeName);
  }

  async mountCdrom(
    diskName: string,
    source: string,
    sourceType: 'pvc' | 'upload' = 'pvc',
  ): Promise<boolean> {
    return this.cdrom.mountCdrom(diskName, source, sourceType);
  }

  async getMountCDROMModalOptions(diskName: string): Promise<{
    title: string;
    radioLabels: string[];
    defaultSelected: string;
    hasUploadModeSelector: boolean;
  }> {
    return this.cdrom.getMountCDROMModalOptions(diskName);
  }
}

export class VirtualMachineDetailMetricsSnapshotsComponent extends BaseComponent {
  readonly snapshots: VmDetailSnapshotsComponent;

  private readonly _horizontalLinkMetrics = this.locator(
    '[data-test-id="horizontal-link-Metrics"]',
  );
  private readonly _divnetwork = this.locator('div#network');
  private readonly _divnetworkPfV6CMenuToggle = this.locator('div#network .pf-v6-c-menu-toggle');
  private readonly _roleOption = this.locator('[role="option"]');

  constructor(page: Page) {
    super(page);
    this.snapshots = new VmDetailSnapshotsComponent(page);
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
    return this.snapshots.navigateToSnapshots();
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

  async verifySnapshotsCardVisible(): Promise<boolean> {
    return this.snapshots.verifySnapshotsCardVisible();
  }

  async verifySnapshotInCard(): Promise<boolean> {
    return this.snapshots.verifySnapshotInCard();
  }

  async takeSnapshot(snapshotName: string): Promise<boolean> {
    return this.snapshots.takeSnapshot(snapshotName);
  }

  async createVmFromSnapshot(
    snapshotName: string,
    vmName: string,
    startAfterCreation = false,
  ): Promise<boolean> {
    return this.snapshots.createVmFromSnapshot(snapshotName, vmName, startAfterCreation);
  }

  async restoreVmFromSnapshot(
    snapshotName: string,
  ): Promise<{ success: boolean; payload?: unknown }> {
    return this.snapshots.restoreVmFromSnapshot(snapshotName);
  }

  async isVolumeRestorePolicyAbsent(): Promise<boolean> {
    return this.snapshots.isVolumeRestorePolicyAbsent();
  }

  async openRestoreModalForSnapshot(snapshotName: string): Promise<void> {
    return this.snapshots.openRestoreModalForSnapshot(snapshotName);
  }

  async cancelRestoreModal(): Promise<void> {
    return this.snapshots.cancelRestoreModal();
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

  async mockMetricsPrometheusResponses(): Promise<void> {
    await this.page.route(
      '**/observability.open-cluster-management.ioapi/prometheus/api/v1/query_range**',
      async (route) => {
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
      },
    );
  }

  async clearMetricsMocks(): Promise<void> {
    await this.page.unrouteAll();
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

  getCurrentUrl(): string {
    return this.page.url();
  }

  async verifyNoSnapshots(): Promise<boolean> {
    return this.snapshots.verifyNoSnapshots();
  }

  async getFirstSnapshotNameFromSnapshotsTable(
    timeoutMs: number = TestTimeouts.STATUS_VALIDATION,
  ): Promise<string> {
    return this.snapshots.getFirstSnapshotNameFromSnapshotsTable(timeoutMs);
  }

  async verifySnapshotExists(snapshotName: string): Promise<boolean> {
    return this.snapshots.verifySnapshotExists(snapshotName);
  }

  async clickSnapshot(snapshotName: string): Promise<void> {
    return this.snapshots.clickSnapshot(snapshotName);
  }

  async deleteSnapshotFromRow(snapshotName: string): Promise<void> {
    return this.snapshots.deleteSnapshotFromRow(snapshotName);
  }

  async verifyNoVirtualMachineSnapshotsEmptyState(): Promise<boolean> {
    return this.snapshots.verifyNoVirtualMachineSnapshotsEmptyState();
  }

  async verifyNoSnapshotsFoundInLoadingBox(): Promise<boolean> {
    return this.snapshots.verifyNoSnapshotsFoundInLoadingBox();
  }

  async verifySnapshotWithSuccessIcon(): Promise<boolean> {
    return this.snapshots.verifySnapshotWithSuccessIcon();
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

  async verifyMetricsTimeRangeIs(expectedTimeRange: string): Promise<boolean> {
    const dropdown = this.locator(`button:has-text("${expectedTimeRange}")`);
    try {
      await dropdown.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      return true;
    } catch {
      return false;
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

  async isMigrationSectionVisible(): Promise<boolean> {
    try {
      return await this.page
        .getByRole('region', { name: 'Migration' })
        .isVisible({ timeout: TestTimeouts.ELEMENT_WAIT });
    } catch {
      return false;
    }
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
}

export class VirtualMachineDetailNavigationComponent extends BaseComponent {
  private readonly _nav: NavigationComponent;
  private readonly _configurationNetworkSubTab = this.locator(
    '[data-test-id="vm-configuration-network"]',
  );
  private readonly _horizontalLinkMetrics = this.locator(
    '[data-test-id="horizontal-link-Metrics"]',
  );
  private readonly _horizontalLinkSnapshots = this.locator(
    '[data-test-id="horizontal-link-Snapshots"]',
  );
  private readonly _horizontalLinkOverview = this.locator(
    '[data-test-id="horizontal-link-Overview"]',
  );

  constructor(page: Page) {
    super(page);
    this._nav = new NavigationComponent(page);
  }

  /**
   * Navigate to a VM detail page through the UI (sidebar + tree view).
   * Avoids full page reloads by using client-side SPA navigation.
   */
  async navigateToVmDetailViaUI(vmName: string, namespace: string): Promise<void> {
    await this._nav.clickNavVirtualMachines();
    await this.page.waitForLoadState('domcontentloaded');

    const searchInput = this.locator('[id="vms-tree-view-search-input"]');
    await searchInput.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await searchInput.clear();
    await searchInput.pressSequentially(namespace, { delay: 250 });
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);

    const nsNode = this.locator(`[id="projectSelector/#single-cluster#/${namespace}"]`);
    await nsNode.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await nsNode.click();
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    const vmId = this.locator(`[id="#single-cluster#/${namespace}/${vmName}"]`);
    try {
      await vmId.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    } catch {
      const expandButton = this.locator(
        `[id="projectSelector/#single-cluster#/${namespace}"] button svg`,
      );
      if (await expandButton.isVisible({ timeout: TestTimeouts.SHORT_WAIT }).catch(() => false)) {
        await expandButton.click();
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      }
      await vmId.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    }
    await this.robustClick(vmId);

    await this._horizontalLinkOverview.waitFor({
      state: 'visible',
      timeout: TestTimeouts.VM_CREATION,
    });
  }

  async navigateToScheduling(): Promise<void> {
    await this.navigateToTab(this.locator('[data-test-id="horizontal-link-Scheduling"]'));
  }

  async navigateToNetworks(): Promise<void> {
    await this.navigateToTab(this.locator('[data-test-id="horizontal-link-Network interfaces"]'));
  }

  async navigateToDisks(): Promise<void> {
    await this.navigateToTab(this.locator('[data-test-id="horizontal-link-Disks"]'));
  }

  async navigateToConfigurationTab() {
    await this.navigateToTab(
      this.locator('[data-test-id="horizontal-link-Configuration"]'),
      TestTimeouts.UI_ACTION_COMPLETE,
    );
  }

  async navigateToMetrics() {
    await this._horizontalLinkMetrics.waitFor({
      state: 'visible',
      timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
    });
    await this.robustClick(this._horizontalLinkMetrics);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async navigateToSnapshots() {
    await this._horizontalLinkSnapshots.waitFor({
      state: 'visible',
      timeout: TestTimeouts.VM_CREATION,
    });
    await this.robustClick(this._horizontalLinkSnapshots);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async navigateToOverview() {
    await this._horizontalLinkOverview.waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await this.robustClick(this._horizontalLinkOverview);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async navigateToYAML() {
    await this.navigateToTab(this.locator('[data-test-id="horizontal-link-YAML"]'));
  }

  async navigateToEvents() {
    await this.navigateToTab(this.locator('[data-test-id="horizontal-link-Events"]'));
  }

  async navigateToConsole() {
    await this.navigateToTab(this.locator('[data-test-id="horizontal-link-Console"]'));
  }

  async navigateToDiagnostics() {
    await this.navigateToTab(this.locator('[data-test-id="horizontal-link-Diagnostics"]'));
  }

  async isDiagnosticsTabVisible(): Promise<boolean> {
    return await this.locator('[data-test-id="horizontal-link-Diagnostics"]')
      .isVisible({ timeout: 5000 })
      .catch(() => false);
  }

  async navigateToConfigurationNetwork() {
    await this.navigateToConfigurationTab();
    await this.navigateToTab(this._configurationNetworkSubTab);
  }

  async navigateToConfigurationInitialRun() {
    await this.navigateToConfigurationTab();
    await this.navigateToTab(this.locator('[data-test-id="vm-configuration-initial"]'));
  }

  async navigateToConfigurationMetadata() {
    await this.navigateToConfigurationTab();
    await this.navigateToTab(this.locator('[data-test-id="vm-configuration-metadata"]'));
  }

  async isTabBarVisibleAfterScroll(): Promise<boolean> {
    try {
      await this._horizontalLinkOverview.waitFor({
        state: 'visible',
        timeout: TestTimeouts.ELEMENT_WAIT,
      });
    } catch {
      return false;
    }

    await this.page.evaluate(() => {
      const scrollable =
        document.querySelector('.pf-v6-c-drawer__content') ??
        document.querySelector('[class*="drawer"] [class*="content"]') ??
        document.documentElement;
      scrollable.scrollTop = scrollable.scrollHeight;
    });
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    return await this.page.evaluate(() => {
      const tab = document.querySelector('[data-test-id="horizontal-link-Overview"]');
      if (!tab) return false;
      const rect = tab.getBoundingClientRect();
      return rect.top >= 0 && rect.bottom <= window.innerHeight;
    });
  }

  async verifyPageTabsVisible(): Promise<boolean> {
    const tab = this.page.locator('[role="tab"]').first();
    return await tab.isVisible({ timeout: TestTimeouts.UI_ELEMENT_VISIBILITY }).catch(() => false);
  }

  async isHorizontalNavbarRoutesPresent(): Promise<boolean> {
    try {
      return await this.locator('#horizontal-navbar-routes').isVisible({
        timeout: TestTimeouts.UI_VISIBILITY_QUICK,
      });
    } catch {
      return false;
    }
  }
}
