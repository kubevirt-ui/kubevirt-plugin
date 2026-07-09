import BaseComponent from '@/components/shared/base-component';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

export default class VmWizardBootSourceComponent extends BaseComponent {
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
      await this.waitForLoadingComplete(TestTimeouts.ELEMENT_WAIT);

      const byEmptyState = this.locator(
        '.pf-v6-c-empty-state h3, .pf-v6-c-empty-state h4, .pf-v6-c-empty-state__title',
      ).filter({ hasText: /no.*volumes|don.*t have any volumes/i });

      const byText = this.page.getByText(/you don.t have any volumes/i);

      const match = byEmptyState.or(byText);
      await match.first().waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      return true;
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
      return await row
        .locator('button[aria-label="Starred"]')
        .isVisible({ timeout: TestTimeouts.SHORT_WAIT })
        .catch(() => false);
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
    // Wait for aria-label to flip before returning
    await this.page.waitForTimeout(500);
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

  /**
   * Verifies the boot source step description hint is visible.
   * The hint reads "Select a boot source (volume or ISO) now or configure it later."
   * CNV-84916: this hint was missing from the Boot source step before the fix.
   */
  async verifyBootSourceDescriptionVisible(): Promise<boolean> {
    try {
      const description = this.page.getByText('Select a boot source (volume or ISO)', {
        exact: false,
      });
      await description.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      return true;
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
