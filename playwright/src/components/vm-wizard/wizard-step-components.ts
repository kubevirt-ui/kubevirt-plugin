import BaseComponent from '@/components/shared/base-component';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

export class VmCreationWizardBootSourceComponent extends BaseComponent {
  constructor(page: Page) {
    super(page);
  }

  private readonly _noBootSource = this.locator('text=No boot source');
  private readonly _pfV6CWizardAddVolumeBtn = this.locator(
    '.pf-v6-c-wizard button:has-text("Add volume")',
  );
  private readonly _dialogModalTabModal = this.locator('[data-test="dialog-modal"], #tab-modal');
  private readonly _pfV6CWizardInputnameFilterInput = this.locator(
    '.pf-v6-c-wizard input[data-test="name-filter-input"]',
  );
  private readonly _pfV6CWizardTableTbodyTr = this.locator('.pf-v6-c-wizard table tbody tr');

  async verifyBootSourceStepVisible(): Promise<boolean> {
    try {
      const heading = this.locator('.pf-v6-c-wizard h1:has-text("Boot source")');
      await heading.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      return true;
    } catch {
      return false;
    }
  }

  async verifyBootVolumeTableVisible(): Promise<boolean> {
    try {
      const table = this.locator('table.BootableVolumeList-table, .pf-v6-c-wizard table');
      await table.first().waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
      return true;
    } catch {
      return false;
    }
  }

  async isBootVolumeEmptyStateVisible(): Promise<boolean> {
    try {
      const heading = this.locator('h3:has-text("No volumes found")');
      return await heading.isVisible({ timeout: TestTimeouts.SHORT_WAIT }).catch(() => false);
    } catch {
      return false;
    }
  }

  async verifyBootVolumeTableOrEmptyState(): Promise<boolean> {
    if (await this.verifyBootVolumeTableVisible()) return true;
    if (await this.isBootVolumeEmptyStateVisible()) return true;

    const noBootSourceForOs = this.locator(
      'h3:has-text("No volumes found for the chosen OS"), .pf-v6-c-empty-state',
    );
    return await noBootSourceForOs
      .first()
      .isVisible()
      .catch(() => false);
  }

  async selectBootVolumeByName(volumeName: string): Promise<void> {
    const table = this.locator('.pf-v6-c-wizard table, .pf-v6-c-wizard [role="grid"]');
    await table.first().waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });

    const searchInput = this._pfV6CWizardInputnameFilterInput;
    if (await searchInput.isVisible({ timeout: TestTimeouts.SHORT_WAIT }).catch(() => false)) {
      await searchInput.clear();
      await searchInput.fill(volumeName);
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    }

    const row = this._pfV6CWizardTableTbodyTr.filter({ hasText: volumeName });
    await row.first().waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(row.first());

    if (await searchInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await searchInput.clear();
      await this.page.waitForTimeout(300);
    }
  }

  async selectNoBootSource(): Promise<void> {
    const radio = this.locator('input[type="radio"][value="no-boot-source"]').or(
      this._noBootSource.locator('..').locator('input[type="radio"]'),
    );
    if (
      await radio
        .first()
        .isVisible()
        .catch(() => false)
    ) {
      await this.robustClick(radio.first());
    } else {
      await this.robustClick(this._noBootSource);
    }
  }

  async getBootVolumeCount(): Promise<number> {
    const paginationText = this.locator('button').filter({ hasText: /of \d+/ });
    try {
      const text = await paginationText.first().textContent({ timeout: TestTimeouts.SHORT_WAIT });
      const match = text?.match(/of (\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    } catch {
      return 0;
    }
  }

  async verifyBootVolumeTableColumnsVisible(): Promise<boolean> {
    const expectedColumns = [
      'Volume name',
      'Architecture',
      'Operating system',
      'Storage class',
      'Size',
      'Description',
    ];
    try {
      for (const col of expectedColumns) {
        const header = this.page.getByRole('columnheader', { name: col });
        await header.waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
      }
      return true;
    } catch {
      return false;
    }
  }

  async verifyAddVolumeButtonVisible(): Promise<boolean> {
    try {
      const addBtn = this._pfV6CWizardAddVolumeBtn;
      return await addBtn
        .first()
        .isVisible({ timeout: TestTimeouts.SHORT_WAIT })
        .catch(() => false);
    } catch {
      return false;
    }
  }

  async clickAddVolumeButton(): Promise<void> {
    const addBtn = this._pfV6CWizardAddVolumeBtn;
    await addBtn.first().waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(addBtn.first());
    const dialog = this._dialogModalTabModal;
    await dialog.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
  }

  async getAddVolumeModalSaveButtonText(): Promise<string> {
    const dialog = this._dialogModalTabModal;
    const saveButton = dialog.locator('[data-test="save-button"]');
    await saveButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    return (await saveButton.textContent())?.trim() ?? '';
  }

  async isAddVolumeModalSaveButtonDisabled(): Promise<boolean> {
    const dialog = this._dialogModalTabModal;
    const saveButton = dialog.locator('[data-test="save-button"]');
    await saveButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    return await saveButton.isDisabled();
  }

  async cancelAddVolumeModal(): Promise<void> {
    const dialog = this._dialogModalTabModal;
    const cancelButton = dialog.locator('[data-test="cancel-button"]');
    await cancelButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(cancelButton);
  }

  async verifyNoBootSourceOptionVisible(): Promise<boolean> {
    try {
      await this.verifyBootVolumeTableOrEmptyState();
      const noBootRadio = this._noBootSource;
      await noBootRadio.first().scrollIntoViewIfNeeded({ timeout: TestTimeouts.SHORT_WAIT });
      return await noBootRadio.first().isVisible({ timeout: TestTimeouts.SHORT_WAIT });
    } catch {
      return false;
    }
  }

  async searchBootVolumeByName(name: string): Promise<void> {
    const searchInput = this._pfV6CWizardInputnameFilterInput;
    await searchInput.first().waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
    await searchInput.first().clear();
    await searchInput.first().fill(name);
    await this.page.waitForTimeout(500);
  }

  async toggleBootVolumeStar(volumeName: string): Promise<void> {
    const row = this.page.getByRole('row').filter({ hasText: volumeName });
    const starBtn = row.locator('button[aria-label="Not starred"], button[aria-label="Starred"]');
    await this.robustClick(starBtn.first());
    await this.page.waitForTimeout(300);
  }

  async isBootVolumeStarred(volumeName: string): Promise<boolean> {
    try {
      const row = this.page.getByRole('row').filter({ hasText: volumeName });
      const starred = row.locator('button[aria-label="Starred"]');
      return await starred.isVisible({ timeout: TestTimeouts.SHORT_WAIT }).catch(() => false);
    } catch {
      return false;
    }
  }

  async getBootVolumeOsColumnValues(): Promise<string[]> {
    const rows = this._pfV6CWizardTableTbodyTr;
    await rows.first().waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    const count = await rows.count();
    const osValues: string[] = [];
    for (let i = 0; i < count; i++) {
      const osCell = rows.nth(i).locator('td:nth-child(4)');
      const text = (await osCell.textContent())?.trim() ?? '';
      if (text) osValues.push(text);
    }
    return osValues;
  }

  async isBootVolumeOsFilterVisible(): Promise<boolean> {
    try {
      const osFilter = this.locator(
        '.pf-v6-c-wizard [data-test="os-filter"], .pf-v6-c-wizard [data-test-row-filter="operating-system"]',
      );
      return await osFilter
        .first()
        .isVisible({ timeout: TestTimeouts.SHORT_WAIT })
        .catch(() => false);
    } catch {
      return false;
    }
  }

  async getBootSourceEmptyStateHeading(): Promise<string> {
    try {
      const heading = this.locator(
        '.bootable-volume-empty-state__title, .bootable-volume-empty-state h3',
      );
      await heading.first().waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
      return (await heading.first().textContent())?.trim() ?? '';
    } catch {
      return '';
    }
  }

  async getBootSourceEmptyStateBodyText(): Promise<string> {
    try {
      const emptyState = this.locator('.bootable-volume-empty-state');
      await emptyState.first().waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
      return (await emptyState.first().textContent())?.trim() ?? '';
    } catch {
      return '';
    }
  }

  async isAddVolumePreferenceDisabled(): Promise<boolean> {
    const dialog = this._dialogModalTabModal;
    const labels = dialog.locator('.pf-v6-c-form__label');
    const prefLabel = labels.filter({ hasText: 'Preference' });
    const group = prefLabel.locator('..').locator('..');
    const toggle = group.locator('.pf-v6-c-menu-toggle');
    try {
      await toggle.first().waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
      const isDisabled = await toggle.first().getAttribute('class');
      return isDisabled?.includes('pf-m-disabled') ?? false;
    } catch {
      return false;
    }
  }

  async getAddVolumePreferenceValue(): Promise<string> {
    const dialog = this._dialogModalTabModal;
    const labels = dialog.locator('.pf-v6-c-form__label');
    const prefLabel = labels.filter({ hasText: 'Preference' });
    const group = prefLabel.locator('..').locator('..');
    const toggle = group.locator('.pf-v6-c-menu-toggle');
    try {
      await toggle.first().waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
      return (await toggle.first().textContent())?.trim() ?? '';
    } catch {
      return '';
    }
  }

  async getAddVolumePreferenceHelperText(): Promise<string> {
    const dialog = this._dialogModalTabModal;
    const labels = dialog.locator('.pf-v6-c-form__label');
    const prefLabel = labels.filter({ hasText: 'Preference' });
    const group = prefLabel.locator('..').locator('..');
    const helperText = group.locator('.pf-v6-c-helper-text');
    try {
      await helperText.first().waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
      return (await helperText.first().textContent())?.trim() ?? '';
    } catch {
      return '';
    }
  }
}

export class VmCreationWizardComputeComponent extends BaseComponent {
  constructor(page: Page) {
    super(page);
  }

  private readonly _pfV6CMenuToggle = this.locator('.pf-v6-c-menu-toggle');

  async verifyComputeResourcesStepVisible(): Promise<boolean> {
    try {
      const heading = this.locator('.pf-v6-c-wizard h1:has-text("Compute resources")');
      await heading.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      return true;
    } catch {
      return false;
    }
  }

  async verifyInstanceTypeSeriesVisible(): Promise<boolean> {
    try {
      const uSeries = this.locator('.instance-type-series-menu-card__toggle-card');
      await uSeries.first().waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
      return true;
    } catch {
      return false;
    }
  }

  async selectInstanceTypeSeries(series: 'cx' | 'd' | 'm' | 'n' | 'o' | 'rt' | 'u'): Promise<void> {
    const seriesMap: Record<string, string> = {
      cx: 'Compute Exclusive',
      d: 'Dedicated vCPU',
      u: 'General Purpose',
      m: 'Memory Intensive',
      n: 'Network',
      o: 'Overcommitted',
      rt: 'Realtime',
    };
    const card = this.locator(
      `.instance-type-series-menu-card__toggle-card:has-text("${seriesMap[series]}")`,
    );
    await this.robustClick(card.first());
  }

  async verifyComputeTabsVisible(): Promise<boolean> {
    try {
      const rhProvided = this.locator('button[role="tab"]:has-text("Red Hat provided")');
      const userProvided = this.locator('button[role="tab"]:has-text("User provided")');
      await rhProvided.first().waitFor({
        state: 'visible',
        timeout: TestTimeouts.SHORT_WAIT,
      });
      await userProvided.first().waitFor({
        state: 'visible',
        timeout: TestTimeouts.SHORT_WAIT,
      });
      return true;
    } catch {
      return false;
    }
  }

  async selectComputeTab(tab: 'redhat' | 'user'): Promise<void> {
    const tabText = tab === 'redhat' ? 'Red Hat provided' : 'User provided';
    const tabButton = this.locator(`button[role="tab"]:has-text("${tabText}")`);
    await this.robustClick(tabButton.first());
  }

  async verifyAllInstanceTypeSeriesVisible(): Promise<string[]> {
    const expectedSeries = [
      'Compute Exclusive',
      'General Purpose',
      'Memory Intensive',
      'Network',
      'Overcommitted',
      'Realtime',
    ];
    const found: string[] = [];
    for (const series of expectedSeries) {
      const card = this.locator(
        `.instance-type-series-menu-card__toggle-card:has-text("${series}")`,
      );
      if (
        await card
          .first()
          .isVisible({ timeout: TestTimeouts.SHORT_WAIT })
          .catch(() => false)
      ) {
        found.push(series);
      }
    }
    return found;
  }

  async getSelectedInstanceTypeSeries(): Promise<string> {
    try {
      const pressed = this.locator(
        '.instance-type-series-menu-card__toggle-card[aria-pressed="true"]',
      );
      const text = await pressed.first().textContent({ timeout: TestTimeouts.SHORT_WAIT });
      return text?.trim() || '';
    } catch {
      return '';
    }
  }

  async getComputeSizeDropdownText(): Promise<string> {
    try {
      const sizeBtn = this._pfV6CMenuToggle.filter({
        hasText: /CPUs.*Memory/,
      });
      return (
        (await sizeBtn.first().textContent({ timeout: TestTimeouts.SHORT_WAIT }))?.trim() || ''
      );
    } catch {
      return '';
    }
  }

  async getComputeSizeOptions(): Promise<string[]> {
    const sizeBtn = this._pfV6CMenuToggle.filter({
      hasText: /CPUs.*Memory/,
    });
    await this.robustClick(sizeBtn.first());
    await this.page.waitForTimeout(500);

    const options: string[] = [];
    const menuItems = this.page.getByRole('menuitem');
    const count = await menuItems.count();
    for (let i = 0; i < count; i++) {
      const text = await menuItems.nth(i).textContent();
      if (text?.trim()) options.push(text.trim());
    }

    await this.page.keyboard.press('Escape');
    return options;
  }

  async selectComputeSize(sizeName: string): Promise<void> {
    const sizeToggle = this.locator('button.pf-v6-c-menu-toggle').filter({
      hasText: /Select size|CPUs.*Memory/,
    });
    await this.robustClick(sizeToggle.first());
    await this.page.waitForTimeout(500);

    const sizeOption = this.page.getByRole('menuitem').filter({ hasText: sizeName });
    await this.robustClick(sizeOption.first());
  }

  async getActiveComputeTab(): Promise<string> {
    try {
      const activeTab = this.locator('button[role="tab"][aria-selected="true"]');
      const text = await activeTab.first().textContent({ timeout: TestTimeouts.SHORT_WAIT });
      return text?.trim() || '';
    } catch {
      return '';
    }
  }

  async selectUserProvidedInstanceTypeByName(name: string): Promise<void> {
    const row = this.locator('tbody tr.pf-m-clickable').filter({
      has: this.locator(`[data-test-id="${name}"]`),
    });
    await row.first().waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(row.first());
  }
}

export class VmCreationWizardCustomizationComponent extends BaseComponent {
  private readonly _button = this.locator('button');
  private readonly _roleTabpanel = this.locator('[role="tabpanel"]');
  private readonly _pfV6CWizardInputPlaceholderFindSettings = this.locator(
    '.pf-v6-c-wizard input[placeholder="Find settings"]',
  );

  private static readonly _strategyLabels: Record<string, string> = {
    Always: 'Always',
    Halted: 'Halted',
    Manual: 'Manual',
    RerunOnFailure: 'Rerun on failure',
  };

  constructor(page: Page) {
    super(page);
  }

  async verifyCustomizationStepVisible(): Promise<boolean> {
    try {
      const heading = this.locator('.pf-v6-c-wizard h1:has-text("Customization")');
      await heading.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      return true;
    } catch {
      return false;
    }
  }

  async verifyCustomizationTabsVisible(): Promise<boolean> {
    const expectedTabs = [
      'Details',
      'Storage',
      'Network',
      'Scheduling',
      'SSH',
      'Initial run',
      'Metadata',
    ];
    try {
      for (const tabName of expectedTabs) {
        const tab = this.locator(`button[role="tab"]:has-text("${tabName}")`);
        await tab.first().waitFor({
          state: 'visible',
          timeout: TestTimeouts.SHORT_WAIT,
        });
      }
      return true;
    } catch {
      return false;
    }
  }

  async selectCustomizationTab(
    tabName: 'Details' | 'Initial run' | 'Metadata' | 'Network' | 'Scheduling' | 'SSH' | 'Storage',
  ): Promise<void> {
    const tab = this.locator(`button[role="tab"]:has-text("${tabName}")`);
    await this.robustClick(tab.first());
  }

  async getCustomizationVmName(): Promise<string> {
    try {
      const hostname = this._button.filter({ hasText: /^[a-z0-9-]+$/ });
      const detailsRegion = this._roleTabpanel;
      const hostnameValue = detailsRegion.locator('dt:has-text("Hostname") + dd button');
      const text = await hostnameValue.first().textContent({ timeout: TestTimeouts.SHORT_WAIT });
      return text?.trim() || (await hostname.first().textContent()) || '';
    } catch {
      return '';
    }
  }

  async verifyCustomizationSearchInputVisible(): Promise<boolean> {
    try {
      const input = this._pfV6CWizardInputPlaceholderFindSettings;
      return await input.isVisible({ timeout: TestTimeouts.SHORT_WAIT }).catch(() => false);
    } catch {
      return false;
    }
  }

  async verifyCustomizationDetailsFields(): Promise<string[]> {
    const expectedFields = [
      'Description',
      'Folder',
      'Hostname',
      'Headless mode',
      'Guest system log access',
      'Deletion protection',
    ];
    const found: string[] = [];
    const panel = this._roleTabpanel;
    for (const field of expectedFields) {
      const term = panel.locator(`text=${field}`).first();
      if (await term.isVisible({ timeout: TestTimeouts.SHORT_WAIT }).catch(() => false)) {
        found.push(field);
      }
    }
    return found;
  }

  async searchCustomizationSettings(query: string): Promise<void> {
    const searchInput = this._pfV6CWizardInputPlaceholderFindSettings;
    await searchInput.clear();
    await searchInput.fill(query);
    await this.page.waitForTimeout(500);
  }

  private async _dismissOverlayIfPresent(): Promise<void> {
    const backdrop = this.page.locator('.pf-v6-c-backdrop');
    if (await backdrop.isVisible({ timeout: 1000 }).catch(() => false)) {
      const closeBtn = this.page.locator('.pf-v6-c-backdrop [aria-label="Close"]');
      if (await closeBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await closeBtn.click();
        await this.page.waitForTimeout(500);
      } else {
        await this.page.keyboard.press('Escape');
        await this.page.waitForTimeout(500);
      }
    }
  }

  private async _toggleSwitch(switchId: string): Promise<void> {
    await this._dismissOverlayIfPresent();
    const label = this.page.locator(`label:has(#${switchId})`);
    await label.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await label.click();
    await this.page.waitForTimeout(300);
  }

  async toggleDeletionProtection(): Promise<void> {
    await this._toggleSwitch('deletion-protection');
    const modal = this.page.locator('.deletion-protection-modal');
    if (await modal.isVisible({ timeout: 2000 }).catch(() => false)) {
      const confirmBtn = modal.locator('button:has-text("Enable"), button:has-text("Disable")');
      await confirmBtn.first().click();
      await modal
        .waitFor({ state: 'hidden', timeout: TestTimeouts.SHORT_WAIT })
        .catch(() => undefined);
    }
  }

  async isDeletionProtectionEnabled(): Promise<boolean> {
    return await this.locator('#deletion-protection').isChecked();
  }

  async toggleHeadlessMode(): Promise<void> {
    await this._toggleSwitch('headless-mode');
  }

  async isHeadlessModeEnabled(): Promise<boolean> {
    return await this.locator('#headless-mode').isChecked();
  }

  async toggleGuestSystemLogAccess(): Promise<void> {
    await this._toggleSwitch('guest-system-log-access');
  }

  async isGuestSystemLogAccessEnabled(): Promise<boolean> {
    return await this.locator('#guest-system-log-access').isChecked();
  }

  async verifyCustomizationExpandableSections(): Promise<string[]> {
    const expectedSections = ['Hardware devices', 'Boot management'];
    const found: string[] = [];
    for (const section of expectedSections) {
      const btn = this.locator(`.pf-v6-c-wizard button:has-text("${section}")`);
      if (
        await btn
          .first()
          .isVisible({ timeout: TestTimeouts.SHORT_WAIT })
          .catch(() => false)
      ) {
        found.push(section);
      }
    }
    return found;
  }

  async verifyStorageTabContent(): Promise<{
    diskList: boolean;
    addButton: boolean;
    environmentSection: boolean;
    windowsDriversCheckbox: boolean;
  }> {
    await this.selectCustomizationTab('Storage');
    await this.page.waitForTimeout(500);
    const panel = this._roleTabpanel;
    return {
      diskList: await panel
        .locator('[data-test="vm-disk-list"]')
        .isVisible({ timeout: TestTimeouts.SHORT_WAIT })
        .catch(() => false),
      addButton: await panel
        .locator('button:has-text("Add")')
        .first()
        .isVisible({ timeout: TestTimeouts.SHORT_WAIT })
        .catch(() => false),
      environmentSection: await panel
        .locator('h2:has-text("Environment")')
        .isVisible({ timeout: TestTimeouts.SHORT_WAIT })
        .catch(() => false),
      windowsDriversCheckbox: await panel
        .locator('[data-test-id="cdrom-drivers"]')
        .isVisible({ timeout: TestTimeouts.SHORT_WAIT })
        .catch(() => false),
    };
  }

  async getStorageTabDisks(): Promise<string[]> {
    const panel = this._roleTabpanel;
    const diskList = panel.locator('[data-test="vm-disk-list"]');
    await diskList.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    const firstDisk = diskList.locator('[data-test-id^="disk-"]').first();
    await firstDisk.waitFor({ state: 'attached', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });

    const allDiskEls = diskList.locator('[data-test-id]');
    const count = await allDiskEls.count();
    const disks: string[] = [];
    for (let i = 0; i < count; i++) {
      const testId = await allDiskEls.nth(i).getAttribute('data-test-id');
      if (
        testId &&
        testId.startsWith('disk-') &&
        !testId.includes('-source-') &&
        !testId.includes('-size-') &&
        !testId.includes('-drive-') &&
        !testId.includes('-interface-') &&
        !testId.includes('-storage-class-')
      ) {
        const text = await allDiskEls.nth(i).textContent();
        if (text?.trim()) disks.push(text.trim());
      }
    }
    return disks;
  }

  async verifyNetworkTabContent(): Promise<{
    interfaceTable: boolean;
    addButton: boolean;
    filterToolbar: boolean;
  }> {
    await this.selectCustomizationTab('Network');
    await this.page.waitForTimeout(500);
    const panel = this._roleTabpanel;
    return {
      interfaceTable: await panel
        .locator('[data-test="wizard-network-interfaces-table"]')
        .isVisible({ timeout: TestTimeouts.SHORT_WAIT })
        .catch(() => false),
      addButton: await panel
        .locator('[data-test="item-create"]')
        .isVisible({ timeout: TestTimeouts.SHORT_WAIT })
        .catch(() => false),
      filterToolbar: await panel
        .locator('[data-test="filter-toolbar"]')
        .isVisible({ timeout: TestTimeouts.SHORT_WAIT })
        .catch(() => false),
    };
  }

  async verifySchedulingTabContent(): Promise<string[]> {
    await this.selectCustomizationTab('Scheduling');
    await this.page.waitForTimeout(500);
    const panel = this._roleTabpanel;
    const expectedFields = [
      'Node selector',
      'Tolerations',
      'Affinity rules',
      'Descheduler',
      'Dedicated resources',
      'Eviction strategy',
      'Run strategy',
    ];
    const found: string[] = [];
    for (const field of expectedFields) {
      const el = panel.locator(`text=${field}`).first();
      if (await el.isVisible({ timeout: TestTimeouts.SHORT_WAIT }).catch(() => false)) {
        found.push(field);
      }
    }
    return found;
  }

  async getSchedulingRunStrategy(): Promise<string> {
    try {
      const panel = this._roleTabpanel;
      const dd = panel.locator('[data-test-id="run-strategy"]').first();
      return (await dd.textContent({ timeout: TestTimeouts.SHORT_WAIT }))?.trim() || '';
    } catch {
      return '';
    }
  }

  async editSchedulingRunStrategy(strategy: string): Promise<boolean> {
    try {
      const editButton = this.locator('button[data-test-id="run-strategy"]');
      await editButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_VISIBILITY_QUICK,
      });
      await this.robustClick(editButton);

      const modal = this.page.locator('[role="dialog"]').filter({ hasText: 'Edit run strategy' });
      await modal.waitFor({
        state: 'visible',
        timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
      });

      const selectToggle = modal.locator('.pf-v6-c-menu-toggle');
      await selectToggle.waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
      await this.robustClick(selectToggle);

      const label = VmCreationWizardCustomizationComponent._strategyLabels[strategy] || strategy;
      const option = this.page
        .locator('button[role="option"]')
        .filter({ has: this.page.locator('.pf-v6-c-menu__item-text', { hasText: label }) });
      await option.waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
      await this.robustClick(option);

      const saveButton = modal.locator('button').filter({ hasText: 'Save' }).first();
      await this.robustClick(saveButton);
      await modal.waitFor({
        state: 'hidden',
        timeout: TestTimeouts.ELEMENT_WAIT,
      });

      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
      return true;
    } catch {
      return false;
    }
  }

  async verifySSHTabContent(): Promise<{
    sshAccessField: boolean;
    publicKeyEditButton: boolean;
  }> {
    await this.selectCustomizationTab('SSH');
    await this.page.waitForTimeout(1000);
    const panel = this._roleTabpanel;
    await panel.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    return {
      sshAccessField: await panel
        .locator('[data-test-id="ssh-access"]')
        .isVisible({ timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
        .catch(() => false),
      publicKeyEditButton: await panel
        .locator('[data-test-id="public-ssh-key-edit"]')
        .isVisible({ timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
        .catch(() => false),
    };
  }

  async verifyInitialRunTabContent(): Promise<{
    cloudInitEditButton: boolean;
    sysprepSection: boolean;
  }> {
    await this.selectCustomizationTab('Initial run');
    await this.page.waitForTimeout(1000);
    const panel = this._roleTabpanel;
    await panel.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    return {
      cloudInitEditButton: await panel
        .locator('button:has-text("Edit")')
        .first()
        .isVisible({ timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
        .catch(() => false),
      sysprepSection: await panel
        .locator('[data-test-id="sysprep-button"]')
        .isVisible({ timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
        .catch(() => false),
    };
  }

  async verifyMetadataTabContent(): Promise<{
    labelsEditButton: boolean;
    annotationsButton: boolean;
  }> {
    await this.selectCustomizationTab('Metadata');
    await this.page.waitForTimeout(1000);
    const panel = this._roleTabpanel;
    await panel.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    return {
      labelsEditButton: await panel
        .locator('[data-test-id$="-labels-edit"]')
        .first()
        .isVisible({ timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
        .catch(() => false),
      annotationsButton: await panel
        .locator('button:has-text("Annotations")')
        .first()
        .isVisible({ timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
        .catch(() => false),
    };
  }
}
