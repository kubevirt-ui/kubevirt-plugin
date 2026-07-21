import BaseComponent from '@/components/shared/base-component';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

export class VmCreationWizardLocationComponent extends BaseComponent {
  private readonly _buttonEditVMCreationLocation = this.locator(
    'button[aria-label="Edit VM creation location"]',
  );

  constructor(page: Page) {
    super(page);
  }

  async closeEditLocationPanel(): Promise<void> {
    const editBtn = this._buttonEditVMCreationLocation;
    await this.robustClick(editBtn);
    await this.page.waitForTimeout(300);
  }

  async getLocationProject(): Promise<string> {
    try {
      const projectText = this.locator('.pf-v6-c-wizard').getByText('Project').first();
      const container = projectText.locator('..');
      const text = await container.textContent({ timeout: TestTimeouts.SHORT_WAIT });
      const match = text?.match(/Project\s*(.+?)(?:>|$)/);
      return match?.[1]?.trim() || '';
    } catch {
      return '';
    }
  }

  async openEditLocationPanel(): Promise<void> {
    const editBtn = this._buttonEditVMCreationLocation;
    await this.robustClick(editBtn);
    await this.page.waitForTimeout(500);
  }

  async verifyEditLocationButtonVisible(): Promise<boolean> {
    try {
      const editBtn = this._buttonEditVMCreationLocation;
      return await editBtn.isVisible({ timeout: TestTimeouts.SHORT_WAIT }).catch(() => false);
    } catch {
      return false;
    }
  }

  async verifyEditLocationPanelFields(): Promise<{
    projectDropdown: boolean;
    folderCombobox: boolean;
  }> {
    return {
      projectDropdown: await this.locator(
        '.pf-v6-c-wizard [data-test="namespace-dropdown-menu-toggle"]',
      )
        .first()
        .isVisible({ timeout: TestTimeouts.SHORT_WAIT })
        .catch(() => false),
      folderCombobox: await this.locator(
        '.pf-v6-c-wizard input[role="combobox"][placeholder*="group"]',
      )
        .first()
        .isVisible({ timeout: TestTimeouts.SHORT_WAIT })
        .catch(() => false),
    };
  }

  async verifyLocationSectionVisible(): Promise<boolean> {
    try {
      const heading = this.locator('.pf-v6-c-wizard h1:has-text("Location")');
      await heading.waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
      return true;
    } catch {
      return false;
    }
  }

  async verifyNoHeaderProjectSelector(): Promise<boolean> {
    const headerSelector = this.locator('[data-test-id="namespace-bar-dropdown"]');
    try {
      await headerSelector.waitFor({ state: 'visible', timeout: 3000 });
      return false;
    } catch {
      return true;
    }
  }

  async verifyWizardCloseButtonHidden(): Promise<boolean> {
    const closeBtn = this.locator('.pf-v6-c-wizard__close');
    try {
      await closeBtn.waitFor({ state: 'visible', timeout: 3000 });
      return false;
    } catch {
      return true;
    }
  }
}

export class VmCreationWizardComputeComponent extends BaseComponent {
  private readonly _pfV6CMenuToggle = this.locator('.pf-v6-c-menu-toggle');

  constructor(page: Page) {
    super(page);
  }

  /**
   * Returns the text of the currently active (selected) compute resources tab.
   * Used to verify the "User provided" tab was not reverted after row selection (CNV-85868).
   */
  async getActiveComputeTab(): Promise<string> {
    try {
      const activeTab = this.locator('button[role="tab"][aria-selected="true"]');
      const text = await activeTab.first().textContent({ timeout: TestTimeouts.SHORT_WAIT });
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

  async selectComputeSize(sizeName: string): Promise<void> {
    const sizeToggle = this.locator('button.pf-v6-c-menu-toggle').filter({
      hasText: /Select size|CPUs.*Memory/,
    });
    await this.robustClick(sizeToggle.first());
    await this.page.waitForTimeout(500);

    const sizeOption = this.page.getByRole('menuitem').filter({ hasText: sizeName });
    await this.robustClick(sizeOption.first());
  }

  async selectComputeTab(tab: 'redhat' | 'user'): Promise<void> {
    const tabText = tab === 'redhat' ? 'Red Hat provided' : 'User provided';
    const tabButton = this.locator(`button[role="tab"]:has-text("${tabText}")`);
    await this.robustClick(tabButton.first());
  }

  async selectInstanceTypeSeries(series: 'cx' | 'd' | 'u' | 'm' | 'n' | 'o' | 'rt'): Promise<void> {
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

  /**
   * Clicks a row in the User provided instance type table matching the given name.
   * The row is a clickable <tr> containing a resource name cell with data-test-id="${name}".
   */
  async selectUserProvidedInstanceTypeByName(name: string): Promise<void> {
    const row = this.locator('tbody tr.pf-m-clickable').filter({
      has: this.locator(`[data-test-id="${name}"]`),
    });
    await row.first().waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(row.first());
  }

  async verifyAllInstanceTypeSeriesVisible(): Promise<string[]> {
    const expectedSeries = [
      'Compute Exclusive',
      'Dedicated vCPU',
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

  async verifyComputeResourcesStepVisible(): Promise<boolean> {
    try {
      const heading = this.locator('.pf-v6-c-wizard h1:has-text("Compute resources")');
      await heading.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      return true;
    } catch {
      return false;
    }
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

  async verifyInstanceTypeSeriesVisible(): Promise<boolean> {
    try {
      const uSeries = this.locator('.instance-type-series-menu-card__toggle-card');
      await uSeries.first().waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
      return true;
    } catch {
      return false;
    }
  }
}

export class VmCreationWizardBootSourceComponent extends BaseComponent {
  private readonly _dialogModalTabModal = this.locator('[data-test="dialog-modal"], #tab-modal');

  private readonly _noBootSource = this.locator('text=No boot source');
  private readonly _pfV6CWizardAddVolumeBtn = this.locator(
    '.pf-v6-c-wizard button:has-text("Add volume")',
  );
  private readonly _pfV6CWizardInputnameFilterInput = this.locator(
    '.pf-v6-c-wizard input[data-test="name-filter-input"]',
  );
  private readonly _pfV6CWizardTableTbodyTr = this.locator('.pf-v6-c-wizard table tbody tr');
  constructor(page: Page) {
    super(page);
  }

  async cancelAddVolumeModal(): Promise<void> {
    const dialog = this._dialogModalTabModal;
    const cancelButton = dialog.locator('[data-test="cancel-button"]');
    await cancelButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(cancelButton);
  }

  async clickAddVolumeButton(): Promise<void> {
    const addBtn = this._pfV6CWizardAddVolumeBtn;
    await addBtn.first().waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(addBtn.first());
    const dialog = this._dialogModalTabModal;
    await dialog.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
  }

  /**
   * Returns the text of the Save button in the Add Volume modal (CNV-82477).
   */
  async getAddVolumeModalSaveButtonText(): Promise<string> {
    const dialog = this._dialogModalTabModal;
    const saveButton = dialog.locator('[data-test="save-button"]');
    await saveButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    return (await saveButton.textContent())?.trim() ?? '';
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

  async getBootSourceEmptyStateBodyText(): Promise<string> {
    try {
      const emptyState = this.locator('.bootable-volume-empty-state').or(
        this.locator('.pf-v6-c-empty-state__body'),
      );
      await emptyState.first().waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
      return (await emptyState.first().textContent())?.trim() ?? '';
    } catch {
      const bodyByText = this.page.getByText(/to get started.*add volume/i);
      return (await bodyByText.first().textContent())?.trim() ?? '';
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

  /**
   * Returns whether the Save button is disabled in the Add Volume modal (CNV-82477).
   */
  async isAddVolumeModalSaveButtonDisabled(): Promise<boolean> {
    const dialog = this._dialogModalTabModal;
    const saveButton = dialog.locator('[data-test="save-button"]');
    await saveButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    return await saveButton.isDisabled();
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

  async isBootVolumeEmptyStateVisible(): Promise<boolean> {
    try {
      const heading = this.locator('h3:has-text("No volumes found")');
      return await heading.isVisible({ timeout: TestTimeouts.SHORT_WAIT }).catch(() => false);
    } catch {
      return false;
    }
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

  async isBootVolumeStarred(volumeName: string): Promise<boolean> {
    try {
      const row = this.page.getByRole('row').filter({ hasText: volumeName });
      const starred = row.locator('button[aria-label="Starred"]');
      return await starred.isVisible({ timeout: TestTimeouts.SHORT_WAIT }).catch(() => false);
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

  async selectFirstAvailableBootVolume(): Promise<void> {
    const bootVolumeRadio = this.page.getByRole('radio', { name: /boot volume/i });
    if (
      (await bootVolumeRadio.isVisible().catch(() => false)) &&
      !(await bootVolumeRadio.isChecked().catch(() => true))
    ) {
      await bootVolumeRadio.click();
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    }

    const table = this.locator('.pf-v6-c-wizard table, .pf-v6-c-wizard [role="grid"]');
    await table.first().waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });

    const nameCell = this._pfV6CWizardTableTbodyTr.first().locator('td[id="name"]');
    await nameCell.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(nameCell);
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

  async selectVolumesProject(projectName: string): Promise<void> {
    const projectToggle = this.locator(
      '.pf-v6-c-wizard button:has-text("All projects"), .pf-v6-c-wizard button:has-text("Project"), .pf-v6-c-wizard .pf-v6-c-menu-toggle:has-text("project")',
    ).first();
    await projectToggle.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(projectToggle);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    const vmFilterCheckbox = this.page.locator(
      'input[type="checkbox"] + label:has-text("Show only projects with VirtualMachines"), label:has-text("Show only projects with") input[type="checkbox"]',
    );
    const filterVisible = await vmFilterCheckbox
      .isVisible({ timeout: TestTimeouts.UI_DELAY_SHORT })
      .catch(() => false);
    if (filterVisible) {
      const isChecked = await vmFilterCheckbox.isChecked().catch(() => false);
      if (isChecked) {
        await vmFilterCheckbox.uncheck({ force: true });
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      }
    }

    const searchInput = this.page.locator(
      '[role="listbox"] input[type="search"], .pf-v6-c-menu input[type="search"], input[placeholder*="project"], input[placeholder*="Project"]',
    );
    if (await searchInput.isVisible({ timeout: TestTimeouts.UI_DELAY_SHORT }).catch(() => false)) {
      await searchInput.fill(projectName);
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    }

    const option = this.page.locator(
      `[role="option"]:has-text("${projectName}"), .pf-v6-c-menu__item-text:text-is("${projectName}")`,
    );
    await option.first().waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(option.first());
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async toggleBootVolumeStar(volumeName: string): Promise<void> {
    const row = this.page.getByRole('row').filter({ hasText: volumeName });
    const starBtn = row.locator('button[aria-label="Not starred"], button[aria-label="Starred"]');
    await this.robustClick(starBtn.first());
    await this.page.waitForTimeout(300);
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

  async verifyBootSourceStepVisible(): Promise<boolean> {
    try {
      const heading = this.locator('.pf-v6-c-wizard h1:has-text("Boot source")');
      await heading.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      return true;
    } catch {
      return false;
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

  async verifyBootVolumeTableVisible(): Promise<boolean> {
    try {
      const table = this.locator('table.BootableVolumeList-table, .pf-v6-c-wizard table');
      await table.first().waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
      return true;
    } catch {
      return false;
    }
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
}
