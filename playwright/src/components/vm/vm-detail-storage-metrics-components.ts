/**
 * VirtualMachine detail — Storage, add-disk, and scheduling/metrics components.
 */

import BaseComponent from '@/components/shared/base-component';
import { DISK_NAMES } from '@/data-models';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class VmSchedulingMetricsComponent extends BaseComponent {
  private readonly _descheduler = this.testId('descheduler');
  private readonly _descheduler1 = this.locator('#descheduler');
  private readonly _deschedulerEdit = this.testId('descheduler-edit');
  private readonly _divnetwork = this.locator('div#network');
  private readonly _divnetworkPfV6CMenuToggle = this.locator('div#network .pf-v6-c-menu-toggle');
  private readonly _evictionStrategyElement = this.testId('eviction-strategy');
  private readonly _horizontalLinkMetrics = this.testId('horizontal-link-Metrics');
  private readonly _roleOption = this.locator('[role="option"]');
  private readonly _utilization = this.locator('text=Utilization');
  private readonly _vmConfigurationDetails = this.testId('vm-configuration-details');
  private readonly _vmConfigurationScheduling = this.testId('vm-configuration-scheduling');

  constructor(page: Page) {
    super(page);
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
      const timeRange = this.testId('time-range-dropdown')
        .or(this.locator('.pf-v6-c-menu-toggle'))
        .filter({
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

  async navigateToConfigurationDetails() {
    await this.navigateToConfigurationTab();
    await this._vmConfigurationDetails.waitFor({
      state: 'visible',
      timeout: TestTimeouts.VM_CREATION,
    });
    await this.robustClick(this._vmConfigurationDetails);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async navigateToConfigurationScheduling() {
    await this.navigateToConfigurationTab();
    await this._vmConfigurationScheduling.waitFor({
      state: 'visible',
      timeout: TestTimeouts.VM_CREATION,
    });
    await this.robustClick(this._vmConfigurationScheduling);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async navigateToConfigurationTab() {
    await super.navigateToTab(
      this.testId('horizontal-link-Configuration'),
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

  async navigateToScheduling(): Promise<void> {
    await super.navigateToTab(this.testId('horizontal-link-Scheduling'));
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

  async setDescheduler(enabled: boolean): Promise<boolean> {
    try {
      await this.navigateToConfigurationScheduling();
      await this._deschedulerEdit.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_VISIBILITY_QUICK,
      });
      await this.robustClick(this._deschedulerEdit);

      const isChecked = await this._descheduler1.isChecked().catch(() => false);
      if (enabled && !isChecked) {
        await this._descheduler1.check({ force: true });
      } else if (!enabled && isChecked) {
        await this._descheduler1.uncheck({ force: true });
      }

      await this.clickSave();
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_LONG);
      return true;
    } catch {
      return false;
    }
  }

  async verifyDedicatedResources(expectedText: string): Promise<boolean> {
    const dedicatedResourcesLocator = this.testId('dedicated-resources');
    try {
      await dedicatedResourcesLocator.waitFor({
        state: 'visible',
        timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
      });
      const text = await dedicatedResourcesLocator.textContent();
      return text?.includes(expectedText) ?? false;
    } catch {
      return false;
    }
  }

  async verifyDeschedulerIsOn(): Promise<boolean> {
    try {
      await this.navigateToConfigurationScheduling();
      await this._descheduler.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_VISIBILITY_QUICK,
      });
      const deschedulerText = await this._descheduler.textContent();
      const containsOn = deschedulerText?.includes('ON') || false;
      const exists = await this._descheduler.isVisible().catch(() => false);
      return containsOn && exists;
    } catch {
      return false;
    }
  }

  async verifyEvictionStrategyLiveMigrate(): Promise<boolean> {
    try {
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

      const timeout = Math.min(TestTimeouts.UI_ELEMENT_VISIBILITY, 30000);

      const count = await this._evictionStrategyElement.count();
      if (count === 0) {
        return false;
      }

      try {
        await this._evictionStrategyElement.first().waitFor({ state: 'visible', timeout });
      } catch {
        await this._evictionStrategyElement.first().waitFor({ state: 'attached', timeout });
      }

      const textContent = await this._evictionStrategyElement.first().textContent();
      const innerText = await this._evictionStrategyElement
        .first()
        .innerText()
        .catch(() => '');

      const hasLiveMigrate =
        (textContent?.toLowerCase().includes('livemigrate') ?? false) ||
        (innerText?.toLowerCase().includes('livemigrate') ?? false);

      return hasLiveMigrate;
    } catch {
      return false;
    }
  }

  async verifyEvictionStrategyNone(): Promise<boolean> {
    try {
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

      const timeout = Math.min(TestTimeouts.UI_ELEMENT_VISIBILITY, 30000);

      const evictionStrategyElement = this.testId('eviction-strategy');

      const count = await evictionStrategyElement.count();
      if (count === 0) {
        return true;
      }

      try {
        await this._evictionStrategyElement.first().waitFor({ state: 'visible', timeout });
      } catch {
        await this._evictionStrategyElement.first().waitFor({ state: 'attached', timeout });
      }

      const textContent = await this._evictionStrategyElement.first().textContent();
      const innerText = await this._evictionStrategyElement
        .first()
        .innerText()
        .catch(() => '');

      const hasNone =
        (textContent?.toLowerCase().includes('none') ?? false) ||
        (innerText?.toLowerCase().includes('none') ?? false);

      if (hasNone) {
        return true;
      }

      const isEmpty = !textContent?.trim() && !innerText?.trim();
      return isEmpty;
    } catch {
      try {
        const count = await this._evictionStrategyElement.count();
        return count === 0;
      } catch {
        return true;
      }
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

  async verifySchedulingAndResourceRequirements(): Promise<boolean> {
    return await super.verifyTextVisible('Scheduling and resource requirements');
  }

  async verifyUtilization(): Promise<boolean> {
    try {
      await this._utilization.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_VISIBILITY_QUICK,
      });
      return await this._utilization.isVisible().catch(() => false);
    } catch {
      return false;
    }
  }

  async verifyVnumaBadge(): Promise<boolean> {
    try {
      await this.navigateToConfigurationDetails();
      return await this.locator('.pf-v6-c-label__content:has-text("vNUMA")')
        .isVisible({ timeout: TestTimeouts.UI_VISIBILITY_QUICK })
        .catch(() => false);
    } catch {
      return false;
    }
  }

  async verifyWorkload(vmName: string, expectedWorkload: string): Promise<boolean> {
    const workloadLocator = this.testId(`${vmName}-workload-profile`);
    try {
      await workloadLocator.waitFor({
        state: 'visible',
        timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
      });
      const workloadText = await workloadLocator.textContent();
      return workloadText?.includes(expectedWorkload) ?? false;
    } catch {
      return false;
    }
  }
}

export interface VmStorageDiskVerifyHost {
  verifyDiskNameExists(diskName: string): Promise<boolean>;
  verifyDiskExists(diskName: string): Promise<boolean>;
}

export class VmStorageAddDiskComponent extends BaseComponent {
  private readonly _addDiskButtonInStorage = this.locator(
    '.kv-configuration-vm-disk-list button:has-text("Add")',
  )
    .or(this.testId('storage-add-button'))
    .or(this.locator('button:has-text("Add disk")'));
  private readonly _advancedSettingsButton = this.locator('button:has-text("Advanced settings")');
  private readonly _blankDiskOption = this.locator('text=Empty disk (blank)');
  private readonly _btnPlaceholderSelectISOFile = this.locator(
    'button[placeholder="Select ISO file"]',
  );
  private readonly _configurationStorageSubTab = this.testId('vm-configuration-storage');
  private readonly _detachDisk = this.locator('text=Detach disk?');
  private readonly _diskRowActionsButton = this.locator('button.pf-v6-c-menu-toggle.pf-m-plain');
  private readonly _diskTypeSelect = this.testId('disk-type-select');
  private readonly _diskTypeSelectLun = this.testId('disk-type-select-lun');
  private readonly _fileInput = this.testId('disk-source-upload').locator('[type="file"]');
  private readonly _inputIdSimpleFileFilename = this.locator('input[id="simple-file-filename"]');
  private readonly _inputInput = this.locator('input[aria-label="Input"]');
  private readonly _lunReservation = this.locator('#lun-reservation');
  private readonly _name = this.locator('#name');
  private readonly _nameInput = this.locator('input[id="name"]');
  private readonly _persistentHotplugLabel = this.locator(
    '.pf-v6-c-label__content:has-text("Persistent Hotplug")',
  );
  private readonly _storageClassSelect = this.testId('storage-class-select');
  private readonly _tabModal = this.locator('#tab-modal');
  private readonly _tabModalSaveButton = this.locator('#tab-modal').locator(
    '[data-test="save-button"]',
  );
  private readonly _windowsDriversCheckbox = this.testId('cdrom-drivers');

  constructor(page: Page) {
    super(page);
  }

  private getDiskRow(diskName: string) {
    return this.locator('tr')
      .filter({ has: this.testId(`disk-${diskName}`) })
      .or(this.locator('tr').filter({ has: this.testId(diskName) }));
  }

  private getStorageClassOption(storageClass: string) {
    return this.locator(`button#select-inline-filter-${storageClass}`);
  }

  private async navigateToConfigurationStorage(): Promise<void> {
    await this.navigateToTab(
      this.testId('horizontal-link-Configuration'),
      TestTimeouts.UI_ACTION_COMPLETE,
    );
    await this._configurationStorageSubTab.waitFor({
      state: 'visible',
      timeout: TestTimeouts.VM_CREATION,
    });
    await this.robustClick(this._configurationStorageSubTab);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async addBlankDisk(
    diskName: string,
    verify: VmStorageDiskVerifyHost,
    size = '1',
    storageClass?: string,
  ): Promise<boolean> {
    try {
      await this.navigateToConfigurationStorage();

      await this._addDiskButtonInStorage.waitFor({
        state: 'visible',
        timeout: TestTimeouts.VM_CREATION,
      });
      await this.robustClick(this._addDiskButtonInStorage);

      await this._blankDiskOption.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
      await this.robustClick(this._blankDiskOption);

      const diskNameField = this.page
        .locator('[role="dialog"] #name, #tab-modal #name, input[name="disk.name"]')
        .first();
      await diskNameField.waitFor({
        state: 'visible',
        timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
      });
      await diskNameField.clear();
      await diskNameField.fill(diskName);

      if (size) {
        const sizeInputExists = await this._inputInput
          .isVisible({ timeout: TestTimeouts.UI_DELAY_LONG })
          .catch(() => false);
        if (sizeInputExists) {
          await this._inputInput.clear();
          for (let i = 0; i < parseInt(size); i++) {
            await this.robustClick(this.locator('button[aria-label="Increment"]'));
          }
        }
      }

      if (storageClass) {
        const scOpen = await this._storageClassSelect
          .isVisible({ timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION })
          .catch(() => false);
        if (scOpen) {
          await this.robustClick(this._storageClassSelect);
          const storageClassOption = this.getStorageClassOption(storageClass);
          const optVisible = await storageClassOption
            .isVisible({ timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION })
            .catch(() => false);
          if (optVisible) {
            await this.robustClick(storageClassOption);
          }
        }
      }

      const dialogSaveVisible = await this.page
        .locator('[role="dialog"]')
        .locator('[data-test="save-button"]')
        .isVisible({ timeout: TestTimeouts.UI_ACTION_COMPLETE })
        .catch(() => false);
      if (dialogSaveVisible) {
        await this.clickDialogSaveButton();
      } else {
        await this.clickSave();
      }

      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);

      const diskExists =
        (await verify.verifyDiskNameExists(diskName)) || (await verify.verifyDiskExists(diskName));
      return diskExists;
    } catch {
      return false;
    }
  }

  async addCDROMDisk(
    diskName: string,
    cdromSource: 'Upload new ISO' | 'Use existing ISO' | 'Leave empty drive' = 'Upload new ISO',
    sourceValue?: string,
  ): Promise<boolean> {
    await this.navigateToConfigurationStorage();

    await this._addDiskButtonInStorage.waitFor({
      state: 'visible',
      timeout: TestTimeouts.VM_CREATION,
    });

    await this._addDiskButtonInStorage.click({ force: true });

    const cdromMenuOption = this.page
      .locator('.pf-v6-c-menu__item, .pf-c-dropdown__menu-item')
      .filter({ hasText: 'CD-ROM' })
      .first();
    await cdromMenuOption
      .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
      .catch(() => null);

    if (await cdromMenuOption.isVisible()) {
      await cdromMenuOption.click({ force: true });
    } else {
      const cdromOption = this.locator('text=CD-ROM').or(this.testId('disk-type-select-cdrom'));
      await cdromOption
        .first()
        .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      await cdromOption.first().click({ force: true });
    }

    await this._nameInput.waitFor({
      state: 'visible',
      timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
    });
    await this._nameInput.fill(diskName);

    if (cdromSource === 'Upload new ISO' && sourceValue) {
      const uploadRadio = this.page.locator(
        'input[id="cdrom-source-upload"], input#cdrom-source-upload',
      );
      await uploadRadio.waitFor({ state: 'attached', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      await uploadRadio.check({ force: true });

      await this._inputIdSimpleFileFilename.waitFor({
        state: 'attached',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });

      await this._fileInput.setInputFiles(sourceValue);

      await this._tabModal
        .locator('[role="progressbar"], .pf-v6-c-progress, .pf-c-progress')
        .first()
        .waitFor({ state: 'visible', timeout: TestTimeouts.FILE_UPLOAD })
        .catch(() => undefined);

      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
    } else if (cdromSource === 'Use existing ISO' && sourceValue) {
      const mountExistingRadio = this.page.locator(
        'input[id="cdrom-source-existing"], input#cdrom-source-existing',
      );
      await mountExistingRadio.waitFor({
        state: 'attached',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await mountExistingRadio.check({ force: true });

      const selectIsoButton = this._btnPlaceholderSelectISOFile;
      await selectIsoButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
      await selectIsoButton.click();

      const isoOption = this.locator(`button[id="select-inline-filter-${sourceValue}"]`);
      await isoOption.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
      await isoOption.click();
    } else if (cdromSource === 'Leave empty drive') {
      const emptyRadio = this.page.locator(
        'input[id="cdrom-source-empty"], input#cdrom-source-empty, label:has-text("Leave empty drive") input',
      );
      await emptyRadio.waitFor({ state: 'attached', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });

      if (await emptyRadio.isDisabled()) {
        await this.locator('button:has-text("Cancel")').first().click();
        return false;
      }

      await emptyRadio.check({ force: true });
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    }

    await this.clickDialogSaveButton();

    await this._tabModal
      .waitFor({ state: 'hidden', timeout: TestTimeouts.ELEMENT_WAIT })
      .catch(async (e) => {
        const errorAlert = this._tabModal.locator(
          '.pf-v6-c-alert.pf-m-danger, .pf-c-alert.pf-m-danger',
        );
        let errorText = 'None';
        if (await errorAlert.isVisible()) {
          errorText = (await errorAlert.textContent().catch(() => 'None')) || 'None';
        }
        const cancelButton = this._tabModal
          .locator('[data-test="cancel-button"]')
          .or(this._tabModal.locator('button:has-text("Cancel")'));
        if (await cancelButton.isVisible()) {
          await cancelButton.click({ force: true });
        }
        throw new Error(
          `Modal failed to close after clicking Save. Error: ${errorText}. Original error: ${e.message}`,
        );
      });

    const successAlert = this.page
      .locator('.pf-v6-c-alert.pf-m-success, .pf-c-alert.pf-m-success')
      .first();
    const closeButton = successAlert.locator(
      'button[aria-label="Close success alert"], button.pf-v6-c-button.pf-m-plain, button.pf-c-button.pf-m-plain',
    );

    await successAlert
      .waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_MEDIUM })
      .catch(() => null);
    if (await closeButton.isVisible()) {
      await closeButton.click().catch(() => null);
    }

    return true;
  }

  async addLUNDisk(diskName: string = DISK_NAMES.LUN_DISK): Promise<string> {
    await this.navigateToConfigurationStorage();

    await this._addDiskButtonInStorage.waitFor({
      state: 'visible',
      timeout: TestTimeouts.VM_CREATION,
    });
    await this._addDiskButtonInStorage.click();

    const blankDiskOption = this.locator('text=Empty disk (blank)');
    await blankDiskOption.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
    await blankDiskOption.click();

    await this._name.waitFor({
      state: 'visible',
      timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
    });
    await this._name.clear();
    await this._name.fill(diskName);

    const actualDiskName = await this._name.inputValue();

    await this._diskTypeSelect.waitFor({
      state: 'visible',
      timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
    });
    await this.robustClick(this._diskTypeSelect);
    await this._diskTypeSelectLun.waitFor({
      state: 'visible',
      timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
    });
    await this.robustClick(this._diskTypeSelectLun);

    await this._advancedSettingsButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
    });
    await this.robustClick(this._advancedSettingsButton);

    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);

    await this._lunReservation.waitFor({
      state: 'visible',
      timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
    });
    await this._lunReservation.check({ force: true });

    await this.clickDialogSaveButton();

    return actualDiskName;
  }

  async addShareableDisk(diskName: string = DISK_NAMES.SHAREABLE_DISK): Promise<string> {
    await this.navigateToConfigurationStorage();

    await this._addDiskButtonInStorage.waitFor({
      state: 'visible',
      timeout: TestTimeouts.VM_CREATION,
    });
    await this._addDiskButtonInStorage.click();

    await this._blankDiskOption.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
    await this._blankDiskOption.click();

    const volumeNameInput = this.locator('input[name="volume.name"]');
    await volumeNameInput.waitFor({
      state: 'visible',
      timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
    });
    await volumeNameInput.clear();
    await volumeNameInput.fill(diskName);

    const actualDiskName = await volumeNameInput
      .inputValue({ timeout: TestTimeouts.SHORT_WAIT })
      .catch(() => diskName);

    await this._advancedSettingsButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
    });
    await this.robustClick(this._advancedSettingsButton);

    const shareableCheckbox = this.locator('input[id="sharable-disk"]');
    await shareableCheckbox.waitFor({
      state: 'visible',
      timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
    });
    const isChecked = await shareableCheckbox.isChecked();
    if (!isChecked) {
      await shareableCheckbox.click({ force: true });
    }

    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);

    await this.clickDialogSaveButton();

    return actualDiskName;
  }

  async createBootableVolumeFromDisk(
    diskName: string,
    bootableVolumeName: string,
  ): Promise<boolean> {
    try {
      await this.navigateToConfigurationStorage();

      const diskRow = this.getDiskRow(diskName);
      await diskRow.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });

      const actionsBtn = diskRow.locator(this._diskRowActionsButton);
      await actionsBtn.waitFor({
        state: 'visible',
        timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
      });
      await this.robustClick(actionsBtn);

      const saveAsBootableVolumeButton = this.locator('button:has-text("Save as bootable volume")');
      await saveAsBootableVolumeButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
      });
      await this.robustClick(saveAsBootableVolumeButton);

      await this.locator('text=Save as bootable volume').waitFor({
        state: 'visible',
        timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
      });

      const bootableVolumeNameInput = this.locator('input#name');
      await bootableVolumeNameInput.waitFor({
        state: 'visible',
        timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
      });
      await bootableVolumeNameInput.clear();
      await bootableVolumeNameInput.fill(bootableVolumeName);

      await this.clickSave();

      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);

      const volumeTitle = this.locator(`text=${bootableVolumeName}`);
      const titleExists = await volumeTitle
        .isVisible({ timeout: TestTimeouts.VM_CREATION })
        .catch(() => false);
      return titleExists;
    } catch {
      return false;
    }
  }

  async detachDisk(diskName: string): Promise<boolean> {
    try {
      await this.navigateToConfigurationStorage();

      const diskRow = this.getDiskRow(diskName);
      await diskRow.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });

      const actionsBtn = diskRow.locator(this._diskRowActionsButton);
      await actionsBtn.waitFor({
        state: 'visible',
        timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
      });
      await this.robustClick(actionsBtn);

      await this.locator('[role="menu"] button', { hasText: 'Detach' }).waitFor({
        state: 'visible',
        timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
      });
      await this.robustClick(this.locator('[role="menu"] button', { hasText: 'Detach' }));

      await this._detachDisk.waitFor({
        state: 'visible',
        timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
      });

      await this.locator('[role="dialog"]')
        .locator('[data-test="save-button"]')
        .filter({ hasText: 'Detach' })
        .waitFor({
          state: 'visible',
          timeout: TestTimeouts.UI_ACTION_COMPLETE,
        });
      await this.robustClick(
        this.locator('[role="dialog"]')
          .locator('[data-test="save-button"]')
          .filter({ hasText: 'Detach' }),
      );

      await this._detachDisk.waitFor({
        state: 'hidden',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });

      return true;
    } catch {
      return false;
    }
  }

  async getCDROMModalOptions(): Promise<{
    title: string;
    radioLabels: string[];
    defaultSelected: string;
    submitButtonLabel: string;
  }> {
    await this.navigateToConfigurationStorage();
    await this._addDiskButtonInStorage.waitFor({
      state: 'visible',
      timeout: TestTimeouts.VM_CREATION,
    });
    await this._addDiskButtonInStorage.click({ force: true });

    const cdromMenuOption = this.page
      .locator('.pf-v6-c-menu__item, .pf-c-dropdown__menu-item')
      .filter({ hasText: 'CD-ROM' })
      .first();
    await cdromMenuOption
      .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
      .catch(() => null);
    await cdromMenuOption.click({ force: true });

    const modal = this._tabModal;
    await modal.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });

    const title =
      (
        await modal
          .locator('h1, h2')
          .first()
          .textContent()
          .catch(() => '')
      )?.trim() ?? '';

    const radioInputs = modal.locator('input[type="radio"][name="cdrom-source"]');
    const count = await radioInputs.count();
    const radioLabels: string[] = [];
    let defaultSelected = '';
    for (let i = 0; i < count; i++) {
      const radio = radioInputs.nth(i);
      const id = (await radio.getAttribute('id')) ?? '';
      const label =
        (
          await modal
            .locator(`label[for="${id}"]`)
            .textContent()
            .catch(() => '')
        )?.trim() ?? '';
      radioLabels.push(label);
      if (await radio.isChecked()) {
        defaultSelected = label;
      }
    }

    const submitBtn = modal
      .locator('[data-test="save-button"]')
      .or(modal.locator('button.pf-m-primary:not(:has-text("Cancel"))'));
    const submitButtonLabel = (await submitBtn.textContent().catch(() => ''))?.trim() ?? '';

    await modal.locator('button:has-text("Cancel")').click();
    await modal.waitFor({ state: 'hidden', timeout: TestTimeouts.ELEMENT_WAIT }).catch(() => null);

    return { title, radioLabels, defaultSelected, submitButtonLabel };
  }

  async getMountCDROMModalOptions(diskName: string): Promise<{
    title: string;
    radioLabels: string[];
    defaultSelected: string;
    hasUploadModeSelector: boolean;
  }> {
    try {
      const diskRow = this.locator('tr', { hasText: diskName }).first();
      await diskRow.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });

      const kebabMenu = diskRow
        .locator('button.pf-v6-c-menu-toggle.pf-m-plain')
        .or(diskRow.getByTestId('kebab-button'))
        .or(diskRow.locator('button[aria-label="Actions"]'))
        .or(diskRow.locator('button[aria-label="Kebab toggle"]'));
      await kebabMenu.first().waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      await this.robustClick(kebabMenu.first());
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

      const mountBtn = this.page
        .locator(
          '[role="menuitem"]:has-text("Mount"), [role="option"]:has-text("Mount"), button:has-text("Mount")',
        )
        .first();
      await mountBtn.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      await this.robustClick(mountBtn);

      const modal = this._tabModal;
      await modal.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });

      const title =
        (
          await modal
            .locator('h1, h2')
            .first()
            .textContent()
            .catch(() => '')
        )?.trim() ?? '';

      const radioInputs = modal.locator('input[type="radio"][name="cdrom-source"]');
      const count = await radioInputs.count();
      const radioLabels: string[] = [];
      let defaultSelected = '';
      for (let i = 0; i < count; i++) {
        const radio = radioInputs.nth(i);
        const id = (await radio.getAttribute('id')) ?? '';
        const label =
          (
            await modal
              .locator(`label[for="${id}"]`)
              .textContent()
              .catch(() => '')
          )?.trim() ?? '';
        radioLabels.push(label);
        if (await radio.isChecked()) {
          defaultSelected = label;
        }
      }

      const hasUploadModeSelector = await modal
        .getByTestId('upload-mode-selector')
        .or(modal.locator('select[id*="upload-mode"]'))
        .or(modal.locator('[id*="upload-type"]'))
        .isVisible()
        .catch(() => false);

      await modal.locator('button:has-text("Cancel")').click();
      await modal
        .waitFor({ state: 'hidden', timeout: TestTimeouts.ELEMENT_WAIT })
        .catch(() => null);

      return { title, radioLabels, defaultSelected, hasUploadModeSelector };
    } catch {
      return { title: '', radioLabels: [], defaultSelected: '', hasUploadModeSelector: false };
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

  async makeDiskPersistent(diskName: string): Promise<boolean> {
    try {
      await this.navigateToConfigurationStorage();

      const diskRow = this.getDiskRow(diskName);
      await diskRow.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });

      const actionsBtn = diskRow.locator(this._diskRowActionsButton);
      await actionsBtn.waitFor({
        state: 'visible',
        timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
      });
      await this.robustClick(actionsBtn);

      const makePersistentItem = this.locator('[role="menu"] button', {
        hasText: 'Make persistent',
      });
      await makePersistentItem.waitFor({
        state: 'visible',
        timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
      });
      await this.robustClick(makePersistentItem);

      const dialog = this.locator('[role="dialog"]:has-text("Make persistent?")');
      await dialog.waitFor({
        state: 'visible',
        timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
      });

      const dialogText = await dialog.textContent();
      if (!dialogText?.includes(diskName)) {
        return false;
      }

      await this.robustClick(dialog.locator('button', { hasText: 'Save' }));

      await dialog.waitFor({ state: 'hidden', timeout: TestTimeouts.UI_ACTION_COMPLETE });

      return true;
    } catch {
      return false;
    }
  }

  async mountCdrom(
    diskName: string,
    source: string,
    sourceType: 'pvc' | 'upload' = 'pvc',
  ): Promise<boolean> {
    try {
      const diskRow = this.locator('tr', { hasText: diskName }).first();
      await diskRow.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });

      const kebabMenu = diskRow
        .locator('button.pf-v6-c-menu-toggle.pf-m-plain')
        .or(diskRow.getByTestId('kebab-button'))
        .or(diskRow.locator('button[aria-label="Actions"]'))
        .or(diskRow.locator('button[aria-label="Kebab toggle"]'));
      await kebabMenu.first().waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      await this.robustClick(kebabMenu.first());
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

      const mountBtn = this.page
        .locator(
          '[role="menuitem"]:has-text("Mount"), [role="option"]:has-text("Mount"), button:has-text("Mount")',
        )
        .first();
      await mountBtn.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      await this.robustClick(mountBtn);

      if (sourceType === 'upload') {
        const fileInput = this._inputIdSimpleFileFilename;
        await fileInput.waitFor({
          state: 'attached',
          timeout: TestTimeouts.UI_ACTION_COMPLETE,
        });

        await this._fileInput.setInputFiles(source);

        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
      } else {
        const selectIsoButton = this._btnPlaceholderSelectISOFile;
        await selectIsoButton.waitFor({
          state: 'visible',
          timeout: TestTimeouts.UI_ACTION_COMPLETE,
        });
        await selectIsoButton.click();

        const isoOption = this.locator(`button[id="select-inline-filter-${source}"]`);
        await isoOption.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
        await isoOption.click();
      }

      await this.robustClick(this._tabModalSaveButton);

      await this._tabModal
        .waitFor({ state: 'hidden', timeout: TestTimeouts.ELEMENT_WAIT })
        .catch(async () => {
          throw new Error('Mount CD-ROM modal failed to close');
        });

      return true;
    } catch {
      return false;
    }
  }

  async setWindowsDriversOnDiskTab(mount: boolean): Promise<boolean> {
    try {
      await this.navigateToConfigurationStorage();

      await this._windowsDriversCheckbox.waitFor({
        state: 'visible',
        timeout: TestTimeouts.VM_BOOTUP,
      });

      if (mount) {
        await this._windowsDriversCheckbox.check({ force: true });
      } else {
        await this._windowsDriversCheckbox.uncheck({ force: true });
      }

      await this.page.waitForTimeout(TestTimeouts.INSTANCE_TYPE_VERIFICATION);
      return true;
    } catch {
      return false;
    }
  }

  async verifyDiskDoesNotHavePersistentHotplugLabel(diskName: string): Promise<boolean> {
    try {
      await this.navigateToConfigurationStorage();

      const diskRow = this.getDiskRow(diskName);
      await diskRow.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });

      const persistentLabel = diskRow.locator(this._persistentHotplugLabel);
      return !(await persistentLabel
        .isVisible({ timeout: TestTimeouts.UI_DELAY_LONG })
        .catch(() => false));
    } catch {
      return true;
    }
  }

  async verifyDiskHasPersistentHotplugLabel(diskName: string): Promise<boolean> {
    try {
      await this.navigateToConfigurationStorage();

      const diskRow = this.getDiskRow(diskName);
      await diskRow.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });

      const persistentLabel = diskRow.locator(this._persistentHotplugLabel);
      return await persistentLabel
        .isVisible({ timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION })
        .catch(() => false);
    } catch {
      return false;
    }
  }

  async verifyUploadNewISOHasNoUploadModeSelector(): Promise<boolean> {
    try {
      await this._addDiskButtonInStorage.waitFor({
        state: 'visible',
        timeout: TestTimeouts.VM_CREATION,
      });
      await this._addDiskButtonInStorage.click({ force: true });

      const cdromMenuOption = this.page
        .locator('.pf-v6-c-menu__item, .pf-c-dropdown__menu-item')
        .filter({ hasText: 'CD-ROM' })
        .first();
      await cdromMenuOption
        .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
        .catch(() => null);
      await cdromMenuOption.click({ force: true });

      const modal = this._tabModal;
      await modal.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });

      const uploadRadio = modal.locator('#cdrom-source-upload');
      await uploadRadio.waitFor({ state: 'attached', timeout: TestTimeouts.ELEMENT_WAIT });
      await this.robustClick(uploadRadio);
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

      const hasUploadModeSelector = await modal
        .getByTestId('upload-mode-selector')
        .or(modal.locator('select[id*="upload-mode"]'))
        .or(modal.locator('[id*="upload-type"]'))
        .isVisible()
        .catch(() => false);

      await modal.locator('button:has-text("Cancel")').click();
      await modal
        .waitFor({ state: 'hidden', timeout: TestTimeouts.ELEMENT_WAIT })
        .catch(() => null);

      return !hasUploadModeSelector;
    } catch {
      return false;
    }
  }

  async verifyWindowsDriversCheckbox(shouldBeChecked: boolean): Promise<boolean> {
    try {
      await this.navigateToConfigurationStorage();
      await this._windowsDriversCheckbox.waitFor({
        state: 'visible',
        timeout: TestTimeouts.VM_BOOTUP,
      });
      const isChecked = await this._windowsDriversCheckbox.isChecked().catch(() => false);
      return isChecked === shouldBeChecked;
    } catch {
      return false;
    }
  }

  async verifyWindowsDriversDisk(shouldExist: boolean): Promise<boolean> {
    try {
      await this.navigateToConfigurationStorage();

      const exists = await this.locator('tr:has-text("windows-drivers-disk")')
        .isVisible({ timeout: TestTimeouts.VM_CREATION })
        .catch(() => false);
      return exists === shouldExist;
    } catch {
      return !shouldExist;
    }
  }
}

export class VmStorageComponent extends BaseComponent {
  private readonly _advancedSettingsButton = this.locator('button:has-text("Advanced settings")');

  private readonly _configurationStorageSubTab = this.testId('vm-configuration-storage');
  private readonly _dataVolumeDetails = this.locator('text=DataVolume details');
  private readonly _diskRootdisk = this.testId('disk-rootdisk');
  private readonly _diskRowActionsButton = this.locator('button.pf-v6-c-menu-toggle.pf-m-plain');

  private readonly _h1HasTextEditDisk = this.locator('h1:has-text("Edit Disk")');

  private readonly _tabModalSaveButton = this.locator('#tab-modal').locator(
    '[data-test="save-button"]',
  );

  readonly addDisk: VmStorageAddDiskComponent;

  constructor(page: Page) {
    super(page);
    this.addDisk = new VmStorageAddDiskComponent(page);
  }

  private getDiskRow(diskName: string) {
    return this.locator('tr')
      .filter({ has: this.testId(`disk-${diskName}`) })
      .or(this.locator('tr').filter({ has: this.testId(diskName) }));
  }

  async addBlankDisk(diskName: string, size = '1', storageClass?: string): Promise<boolean> {
    return this.addDisk.addBlankDisk(diskName, this, size, storageClass);
  }

  async addCDROMDisk(
    diskName: string,
    cdromSource: 'Upload new ISO' | 'Use existing ISO' | 'Leave empty drive' = 'Upload new ISO',
    sourceValue?: string,
  ): Promise<boolean> {
    return this.addDisk.addCDROMDisk(diskName, cdromSource, sourceValue);
  }

  async addLUNDisk(diskName?: string): Promise<string> {
    return this.addDisk.addLUNDisk(diskName);
  }

  async addShareableDisk(diskName?: string): Promise<string> {
    return this.addDisk.addShareableDisk(diskName);
  }

  async clickConfigurationStorageSubTab() {
    await this._configurationStorageSubTab.waitFor({
      state: 'visible',
      timeout: TestTimeouts.VM_CREATION,
    });
    await this.robustClick(this._configurationStorageSubTab);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async clickPvcLink(volumeName: string): Promise<boolean> {
    try {
      await this.navigateToConfigurationStorage();
      const pvcLink = this.testId(volumeName);
      await pvcLink.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
      await this.robustClick(pvcLink);
      return true;
    } catch {
      return false;
    }
  }

  async createBootableVolumeFromDisk(
    diskName: string,
    bootableVolumeName: string,
  ): Promise<boolean> {
    return this.addDisk.createBootableVolumeFromDisk(diskName, bootableVolumeName);
  }

  async detachDisk(diskName: string): Promise<boolean> {
    return this.addDisk.detachDisk(diskName);
  }

  async ejectCdrom(diskName: string): Promise<boolean> {
    try {
      const diskRow = this.page.locator('tr').filter({ hasText: diskName }).first();
      await diskRow.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });

      const kebabMenu = diskRow
        .locator('button.pf-v6-c-menu-toggle.pf-m-plain')
        .or(diskRow.getByTestId('kebab-button'))
        .or(diskRow.locator('button[aria-label="Actions"]'))
        .or(diskRow.locator('button[aria-label="Kebab toggle"]'));
      await kebabMenu.first().waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      await this.robustClick(kebabMenu.first());
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

      const ejectBtn = this.page
        .locator(
          '[role="menuitem"]:has-text("Eject"), [role="option"]:has-text("Eject"), button:has-text("Eject")',
        )
        .first();
      await ejectBtn.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      await this.robustClick(ejectBtn);

      try {
        await this._tabModalSaveButton.waitFor({
          state: 'visible',
          timeout: TestTimeouts.UI_DELAY_LONG,
        });
        await this.robustClick(this._tabModalSaveButton);
      } catch {}

      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
      return true;
    } catch {
      return false;
    }
  }

  async ejectCdromByVolumeName(volumeName: string): Promise<boolean> {
    try {
      const kebab = this.page.locator(`#disk-actions-${volumeName}`);
      await kebab.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
      await kebab.click({ force: true });
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

      const ejectItem = this.page.getByRole('menuitem', { name: 'Eject' });
      await ejectItem.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      await ejectItem.click({ force: true });

      const dialogEjectButton = this.page
        .locator('[data-test="dialog-modal"]')
        .locator('[data-test="save-button"]');
      await dialogEjectButton.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
      await this.robustClick(dialogEjectButton);

      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
      return true;
    } catch {
      return false;
    }
  }

  async getCDROMModalOptions(): Promise<{
    title: string;
    radioLabels: string[];
    defaultSelected: string;
    submitButtonLabel: string;
  }> {
    return this.addDisk.getCDROMModalOptions();
  }

  async getDiskDriveValue(diskName: string): Promise<string | null> {
    try {
      const cell = this.testId(`disk-drive-${diskName}`).first();
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

  async getDiskInterfaceValue(diskName: string): Promise<string | null> {
    try {
      const cell = this.testId(`disk-interface-${diskName}`).first();
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

  async getMountCDROMModalOptions(diskName: string): Promise<{
    title: string;
    radioLabels: string[];
    defaultSelected: string;
    hasUploadModeSelector: boolean;
  }> {
    return this.addDisk.getMountCDROMModalOptions(diskName);
  }

  async getVmiDiskColumnValue(
    diskName: string,
    column: 'drive' | 'interface' | 'name' | 'source' | 'size',
  ): Promise<string | null> {
    try {
      const cell = this.testId(`disk-${column}-${diskName}`).first();
      const visible = await cell
        .isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM })
        .catch(() => false);
      if (visible) {
        return (await cell.textContent())?.trim() || null;
      }
      const columnIndex: Record<string, number> = {
        name: 1,
        source: 2,
        drive: 3,
        size: 4,
        interface: 5,
      };
      const idx = columnIndex[column];
      if (idx) {
        const row = this.locator('tr').filter({ hasText: diskName }).first();
        const td = row.locator(`td:nth-child(${idx})`).first();
        const tdVisible = await td
          .isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM })
          .catch(() => false);
        if (tdVisible) {
          return (await td.textContent())?.trim() || null;
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  async isAddDiskButtonEnabled(): Promise<boolean> {
    return this.addDisk.isAddDiskButtonEnabled();
  }

  async makeDiskPersistent(diskName: string): Promise<boolean> {
    return this.addDisk.makeDiskPersistent(diskName);
  }

  async mountCdrom(
    diskName: string,
    source: string,
    sourceType: 'pvc' | 'upload' = 'pvc',
  ): Promise<boolean> {
    return this.addDisk.mountCdrom(diskName, source, sourceType);
  }

  async navigateToConfigurationStorage() {
    await this.navigateToConfigurationTab();
    await this._configurationStorageSubTab.waitFor({
      state: 'visible',
      timeout: TestTimeouts.VM_CREATION,
    });
    await this.robustClick(this._configurationStorageSubTab);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async navigateToConfigurationTab() {
    await super.navigateToTab(
      this.testId('horizontal-link-Configuration'),
      TestTimeouts.UI_ACTION_COMPLETE,
    );
  }

  async navigateToDisks(): Promise<void> {
    await super.navigateToTab(this.testId('horizontal-link-Disks'));
  }

  async navigateToVmiDisksTab(vmName: string, namespace: string): Promise<void> {
    await this.goTo(`/k8s/ns/${namespace}/kubevirt.io~v1~VirtualMachineInstance/${vmName}/disks`);
    await this.locator('[aria-label="Disks table"]')
      .first()
      .waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
  }

  async resizeDisk(diskName: string, newSize: string): Promise<boolean> {
    try {
      await this.navigateToConfigurationStorage();

      const diskRow = this.getDiskRow(diskName);
      await diskRow.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });

      const actionsBtn = diskRow.locator(this._diskRowActionsButton);
      await actionsBtn.waitFor({
        state: 'visible',
        timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
      });
      await this.robustClick(actionsBtn);

      await this.locator('[role="menu"] button', { hasText: 'Edit' }).waitFor({
        state: 'visible',
        timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
      });
      await this.robustClick(this.locator('[role="menu"] button', { hasText: 'Edit' }));

      await this._h1HasTextEditDisk.waitFor({
        state: 'visible',
        timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
      });

      const editDiskModal = this.locator('[role="dialog"]').filter({ hasText: 'Edit Disk' });
      const sizeInput = editDiskModal
        .locator('input[aria-label="Input"], input[type="number"]')
        .first();
      await sizeInput.waitFor({
        state: 'visible',
        timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
      });
      await sizeInput.dblclick();
      await sizeInput.fill(newSize);

      const advancedVisible = await this._advancedSettingsButton
        .isVisible({ timeout: TestTimeouts.SHORT_WAIT })
        .catch(() => false);
      if (advancedVisible) {
        await this.robustClick(this._advancedSettingsButton);
      }

      await this.clickSaveByTestId();
      await this._h1HasTextEditDisk.waitFor({
        state: 'hidden',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      return true;
    } catch {
      return false;
    }
  }

  async setWindowsDriversOnDiskTab(mount: boolean): Promise<boolean> {
    return this.addDisk.setWindowsDriversOnDiskTab(mount);
  }

  async verifyDiskDoesNotExist(diskName: string): Promise<boolean> {
    try {
      await this.navigateToConfigurationStorage();

      const diskRow = this.getDiskRow(diskName);
      const exists = await diskRow
        .isVisible({ timeout: TestTimeouts.VM_CREATION })
        .catch(() => false);
      return !exists;
    } catch {
      return true;
    }
  }

  async verifyDiskDoesNotHavePersistentHotplugLabel(diskName: string): Promise<boolean> {
    return this.addDisk.verifyDiskDoesNotHavePersistentHotplugLabel(diskName);
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

  async verifyDiskExistsByAttribute(
    name: string,
    attribute: 'data-test' | 'data-test' = 'data-test',
  ): Promise<boolean> {
    try {
      const diskLocator = this.locator(`[${attribute}*="${name}"]`);
      await diskLocator.waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_EXTRA });
      return true;
    } catch {
      return false;
    }
  }

  async verifyDiskExistsByDataLabelName(diskName: string): Promise<boolean> {
    try {
      await this.navigateToConfigurationStorage();
      const diskNameLocator = this.locator(`[data-label="name"]:has-text("${diskName}")`);
      await diskNameLocator.waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_EXTRA });
      return true;
    } catch {
      return false;
    }
  }

  async verifyDiskExistsByDataTestIdPattern(vmName: string, diskName: string): Promise<boolean> {
    try {
      await this.navigateToConfigurationStorage();
      const expectedDataTestId = `dv-${vmName}-${diskName}-k8ntab`;
      const diskLocator = this.testId(expectedDataTestId);
      await diskLocator.waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_EXTRA });
      return true;
    } catch {
      return false;
    }
  }

  async verifyDiskHasAutoDetachHotplugLabel(diskName: string): Promise<boolean> {
    try {
      await this.navigateToConfigurationStorage();

      const diskRow = this.getDiskRow(diskName);
      await diskRow.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });

      const autoDetachLabel = diskRow.locator(
        this.locator('.pf-v6-c-label__content:has-text("AutoDetach Hotplug")'),
      );
      return await autoDetachLabel
        .isVisible({ timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION })
        .catch(() => false);
    } catch {
      return false;
    }
  }

  async verifyDiskHasPersistentHotplugLabel(diskName: string): Promise<boolean> {
    return this.addDisk.verifyDiskHasPersistentHotplugLabel(diskName);
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

  async verifyDiskRowVisibleByExactDataTestId(dataTestId: string): Promise<boolean> {
    try {
      await this.navigateToConfigurationStorage();
      const diskLocator = this.testId(dataTestId);
      await diskLocator.waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_EXTRA });
      return true;
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

  async verifyDiskSourceByDataTestId(vmName: string, diskName: string): Promise<boolean> {
    try {
      await this.navigateToConfigurationStorage();
      const row = this.testId(`dv-${vmName}-${diskName}-k8ntab`);
      const cell = row.getByTestId(`disk-source-${diskName}`).first();
      await cell.waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_EXTRA });
      return true;
    } catch {
      return false;
    }
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
                  .locator('[data-test]')
                  .first()
                  .getAttribute('data-test')
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
                  .locator('[data-test]')
                  .first()
                  .getAttribute('data-test')
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

  async verifyDiskStorageClass(diskName: string, expectedStorageClass: string): Promise<boolean> {
    try {
      await this.navigateToConfigurationStorage();

      const diskRow = this.locator(`tr:has-text("${diskName}")`);

      const storageClassExists = await diskRow
        .locator(`text=${expectedStorageClass}`)
        .isVisible({ timeout: TestTimeouts.VM_BOOTUP })
        .catch(() => false);

      return storageClassExists;
    } catch {
      return false;
    }
  }

  async verifyPvcDetailsPage(): Promise<boolean> {
    try {
      await this._dataVolumeDetails
        .first()
        .waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
      return await this._dataVolumeDetails
        .first()
        .isVisible()
        .catch(() => false);
    } catch {
      return false;
    }
  }

  async verifyRootdisk(): Promise<boolean> {
    try {
      await this._diskRootdisk.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      return await this._diskRootdisk.isVisible().catch(() => false);
    } catch {
      return false;
    }
  }

  async verifySysprepInStorage(): Promise<boolean> {
    try {
      await this.navigateToConfigurationStorage();

      const sysprepRow = this.locator('tr:has-text("CD-ROM"):has-text("Other")');
      await sysprepRow.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
      return await sysprepRow.isVisible().catch(() => false);
    } catch {
      return false;
    }
  }

  async verifyUploadNewISOHasNoUploadModeSelector(): Promise<boolean> {
    return this.addDisk.verifyUploadNewISOHasNoUploadModeSelector();
  }

  async verifyWindowsDriversCheckbox(shouldBeChecked: boolean): Promise<boolean> {
    return this.addDisk.verifyWindowsDriversCheckbox(shouldBeChecked);
  }

  async verifyWindowsDriversDisk(shouldExist: boolean): Promise<boolean> {
    return this.addDisk.verifyWindowsDriversDisk(shouldExist);
  }

  async waitForPendingChangesToDisappear(timeout = 60000): Promise<boolean> {
    const pendingLocator = this.locator(':is(:text("Pending changes"), :text("Restart required"))');
    try {
      await pendingLocator
        .first()
        .waitFor({ state: 'hidden', timeout })
        .catch(() => false);
      const isVisible = await pendingLocator
        .first()
        .isVisible()
        .catch(() => false);
      return !isVisible;
    } catch {
      return true;
    }
  }
}
