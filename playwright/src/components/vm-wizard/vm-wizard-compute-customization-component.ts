import BaseComponent from '@/components/shared/base-component';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

export default class VmWizardComputeCustomizationComponent extends BaseComponent {
  private static readonly strategyLabels: Record<string, string> = {
    Always: 'Always',
    Halted: 'Halted',
    Manual: 'Manual',
    RerunOnFailure: 'Rerun on failure',
  };
  private readonly _inputTypeText = this.locator('input[type="text"]');
  private readonly _pfV6CMenuToggle = this.locator('.pf-v6-c-menu-toggle');
  private readonly _pfV6CWizardButtonpfV6CButtonpfMPrimary = this.locator(
    '.pf-v6-c-wizard button.pf-v6-c-button.pf-m-primary',
  );
  private readonly _pfV6CWizardInputPlaceholderFindSettings = this.locator(
    '.pf-v6-c-wizard input[placeholder="Find settings"]',
  );
  private readonly _pfV6CWizardInputTypeText = this.locator('.pf-v6-c-wizard input[type="text"]');
  private readonly _roleTabpanel = this.locator('[role="tabpanel"]');
  private readonly _startAfterCreateCheckbox = this.locator('#start-after-create-checkbox');
  private readonly _startThisVirtualMachineAfterCreation = this.locator(
    'text=Start this VirtualMachine after creation',
  );

  constructor(page: Page) {
    super(page);
  }

  private async dismissOverlayIfPresent(): Promise<void> {
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

  private async toggleSwitch(switchId: string): Promise<void> {
    await this.dismissOverlayIfPresent();
    const label = this.page.locator(`label:has(#${switchId})`);
    await label.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await label.click();
    await this.page.waitForTimeout(300);
  }

  async clearReviewVmName(): Promise<void> {
    const nameInput = this._pfV6CWizardInputTypeText.first();
    await nameInput.clear();
    await this.page.waitForTimeout(300);
  }

  async editSchedulingRunStrategy(strategy: string): Promise<boolean> {
    try {
      const editButton = this.testId('run-strategy');
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

      const label = VmWizardComputeCustomizationComponent.strategyLabels[strategy] || strategy;
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

  async fillReviewDescription(text: string): Promise<void> {
    const descInput = this._pfV6CWizardInputTypeText.nth(1);
    await descInput.clear();
    await descInput.fill(text);
  }

  async fillReviewVmName(name: string): Promise<void> {
    const nameInput = this._inputTypeText.first();
    await nameInput.clear();
    await nameInput.fill(name);
    await nameInput.press('Tab');
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

  async getCreateButtonText(): Promise<string> {
    try {
      const createBtn = this._pfV6CWizardButtonpfV6CButtonpfMPrimary;
      return (
        (await createBtn.first().textContent({ timeout: TestTimeouts.SHORT_WAIT }))?.trim() || ''
      );
    } catch {
      return '';
    }
  }

  async getCustomizationVmName(): Promise<string> {
    try {
      const hostname = this.locator('button').filter({ hasText: /^[a-z0-9-]+$/ });
      const detailsRegion = this._roleTabpanel;
      const hostnameValue = detailsRegion.locator('dt:has-text("Hostname") + dd button');
      const text = await hostnameValue.first().textContent({ timeout: TestTimeouts.SHORT_WAIT });
      return text?.trim() || (await hostname.first().textContent()) || '';
    } catch {
      return '';
    }
  }

  async getReviewDescription(): Promise<string> {
    try {
      const descInput = this._pfV6CWizardInputTypeText.nth(1);
      return (await descInput.inputValue()) || '';
    } catch {
      return '';
    }
  }

  async getReviewDescriptionText(): Promise<string> {
    try {
      const region = this.locator(
        '.pf-v6-c-wizard [class*="review"] strong:has-text("Create VirtualMachine")',
      )
        .locator('..')
        .first();
      return (await region.textContent({ timeout: TestTimeouts.SHORT_WAIT }))?.trim() || '';
    } catch {
      return '';
    }
  }

  async getReviewNameValidationError(): Promise<string> {
    try {
      const error = this.locator('.pf-v6-c-helper-text__item.pf-m-error');
      await error.first().waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
      return (await error.first().textContent())?.trim() || '';
    } catch {
      return '';
    }
  }

  async getReviewVmName(): Promise<string> {
    try {
      const nameInput = this._inputTypeText.first();
      return (await nameInput.inputValue()) || '';
    } catch {
      return '';
    }
  }

  async getSchedulingRunStrategy(): Promise<string> {
    try {
      const panel = this._roleTabpanel;
      const dd = panel.getByTestId('run-strategy').first();
      return (await dd.textContent({ timeout: TestTimeouts.SHORT_WAIT }))?.trim() || '';
    } catch {
      return '';
    }
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

  async getStartAfterCreationLabel(): Promise<string> {
    try {
      const checkbox = this._startAfterCreateCheckbox;
      const label = checkbox.locator('..').locator('label, .pf-v6-c-check__label').first();
      return (await label.textContent({ timeout: TestTimeouts.SHORT_WAIT }))?.trim() || '';
    } catch {
      return '';
    }
  }

  async getStorageTabDisks(): Promise<string[]> {
    const panel = this._roleTabpanel;
    const diskList = panel.getByTestId('vm-disk-list');
    await diskList.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    const firstDisk = diskList.locator('[data-test^="disk-"]').first();
    await firstDisk.waitFor({ state: 'attached', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });

    const allDiskEls = diskList.locator('[data-test]');
    const count = await allDiskEls.count();
    const disks: string[] = [];
    for (let i = 0; i < count; i++) {
      const testId = await allDiskEls.nth(i).getAttribute('data-test');
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

  async isCreateButtonDisabled(): Promise<boolean> {
    try {
      const createBtn = this._pfV6CWizardButtonpfV6CButtonpfMPrimary.first();
      await createBtn.waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
      return createBtn.isDisabled();
    } catch {
      return true;
    }
  }

  async isDeletionProtectionEnabled(): Promise<boolean> {
    return await this.locator('#deletion-protection').isChecked();
  }

  async isGuestSystemLogAccessEnabled(): Promise<boolean> {
    return await this.locator('#guest-system-log-access').isChecked();
  }

  async isHeadlessModeEnabled(): Promise<boolean> {
    return await this.locator('#headless-mode').isChecked();
  }

  async isStartAfterCreationChecked(): Promise<boolean> {
    try {
      const checkbox = this._startAfterCreateCheckbox;
      await checkbox.waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
      return checkbox.isChecked();
    } catch {
      return false;
    }
  }

  async searchCustomizationSettings(query: string): Promise<void> {
    const searchInput = this._pfV6CWizardInputPlaceholderFindSettings;
    await searchInput.clear();
    await searchInput.fill(query);
    await this.page.waitForTimeout(500);
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

  async selectCustomizationTab(
    tabName: 'Details' | 'Storage' | 'Network' | 'Scheduling' | 'SSH' | 'Initial run' | 'Metadata',
  ): Promise<void> {
    const tab = this.locator(`button[role="tab"]:has-text("${tabName}")`);
    await this.robustClick(tab.first());
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

  async selectUserProvidedInstanceTypeByName(name: string): Promise<void> {
    const row = this.locator('tbody tr.pf-m-clickable').filter({
      has: this.testId(name),
    });
    await row.first().waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(row.first());
  }

  async toggleDeletionProtection(): Promise<void> {
    await this.toggleSwitch('deletion-protection');
    const modal = this.page.locator('.deletion-protection-modal');
    if (await modal.isVisible({ timeout: 2000 }).catch(() => false)) {
      const confirmBtn = modal.locator('button:has-text("Enable"), button:has-text("Disable")');
      await confirmBtn.first().click();
      await modal
        .waitFor({ state: 'hidden', timeout: TestTimeouts.SHORT_WAIT })
        .catch(() => undefined);
    }
  }

  async toggleGuestSystemLogAccess(): Promise<void> {
    await this.toggleSwitch('guest-system-log-access');
  }

  async toggleHeadlessMode(): Promise<void> {
    await this.toggleSwitch('headless-mode');
  }

  async toggleStartAfterCreation(): Promise<void> {
    const checkbox = this.locator('input[type="checkbox"]').or(
      this._startThisVirtualMachineAfterCreation,
    );
    await this.robustClick(checkbox.first());
  }

  async typeReviewVmName(name: string): Promise<void> {
    const nameInput = this._pfV6CWizardInputTypeText.first();
    await nameInput.clear();
    await nameInput.fill(name);
    await this.page.waitForTimeout(200);
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

  async verifyCustomizationDetailsFields(): Promise<string[]> {
    const expectedFields = [
      'Description',
      'Group',
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

  async verifyCustomizationSearchInputVisible(): Promise<boolean> {
    try {
      const input = this._pfV6CWizardInputPlaceholderFindSettings;
      return await input.isVisible({ timeout: TestTimeouts.SHORT_WAIT }).catch(() => false);
    } catch {
      return false;
    }
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
        .getByTestId('sysprep-button')
        .isVisible({ timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
        .catch(() => false),
    };
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
        .locator('[data-test$="-labels-edit"]')
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
        .getByTestId('wizard-network-interfaces-table')
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

  async verifyReviewNameEditable(): Promise<boolean> {
    try {
      const nameInput = this._pfV6CWizardInputTypeText.first();
      const isEditable = await nameInput.isEditable({ timeout: TestTimeouts.SHORT_WAIT });
      return isEditable;
    } catch {
      return false;
    }
  }

  async verifyReviewNameLabelRequired(): Promise<boolean> {
    try {
      const nameFormGroup = this.locator('.pf-v6-c-wizard .pf-v6-c-form__group').first();
      const requiredIndicator = nameFormGroup.locator('.pf-v6-c-form__label-required');
      await requiredIndicator.waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
      return true;
    } catch {
      return false;
    }
  }

  async verifyReviewSectionsVisible(): Promise<boolean> {
    const sections = ['Details', 'Storage', 'Network', 'Hardware devices'];
    try {
      for (const section of sections) {
        const btn = this.locator(`.pf-v6-c-wizard button:has-text("${section}")`);
        await btn.first().waitFor({
          state: 'visible',
          timeout: TestTimeouts.SHORT_WAIT,
        });
      }
      return true;
    } catch {
      return false;
    }
  }

  async verifyReviewStepVisible(): Promise<boolean> {
    try {
      const heading = this.locator('.pf-v6-c-wizard h1:has-text("Review and create")');
      await heading.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      return true;
    } catch {
      return false;
    }
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
        .getByTestId('ssh-access')
        .isVisible({ timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
        .catch(() => false),
      publicKeyEditButton: await panel
        .getByTestId('public-ssh-key-edit')
        .isVisible({ timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
        .catch(() => false),
    };
  }

  async verifyStartAfterCreationCheckbox(): Promise<boolean> {
    try {
      const checkbox = this._startThisVirtualMachineAfterCreation;
      await checkbox.waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
      return true;
    } catch {
      return false;
    }
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
        .getByTestId('vm-disk-list')
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
        .locator('[data-test="cdrom-drivers"]')
        .isVisible({ timeout: TestTimeouts.SHORT_WAIT })
        .catch(() => false),
    };
  }
}
