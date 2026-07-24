import BaseComponent from '@/components/shared/base-component';
import {
  VmCreationWizardDeploymentComponent,
  VmCreationWizardReviewComponent,
} from '@/components/vm-wizard/wizard-deploy-review-components';
import {
  VmCreationWizardCloneComponent,
  VmCreationWizardNavigationComponent,
  VmCreationWizardTemplateCatalogComponent,
} from '@/components/vm-wizard/wizard-navigation-components';
import {
  VmCreationWizardBootSourceComponent,
  VmCreationWizardComputeComponent,
  VmCreationWizardLocationComponent,
} from '@/components/vm-wizard/wizard-step-components';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

export default class VmCreationWizardComponent extends BaseComponent {
  private static readonly _strategyLabels: Record<string, string> = {
    Always: 'Always',
    Halted: 'Halted',
    Manual: 'Manual',
    RerunOnFailure: 'Rerun on failure',
  };
  private readonly _button = this.locator('button');
  private readonly _pfV6CWizardInputPlaceholderFindSettings = this.locator(
    '.pf-v6-c-wizard input[placeholder="Find settings"]',
  );
  private readonly _roleTabpanel = this.locator('[role="tabpanel"]');
  readonly bootSource: VmCreationWizardBootSourceComponent;
  readonly clone: VmCreationWizardCloneComponent;
  readonly compute: VmCreationWizardComputeComponent;
  readonly deployment: VmCreationWizardDeploymentComponent;

  readonly location: VmCreationWizardLocationComponent;

  readonly navigation: VmCreationWizardNavigationComponent;
  readonly review: VmCreationWizardReviewComponent;
  readonly templateCatalog: VmCreationWizardTemplateCatalogComponent;

  constructor(page: Page) {
    super(page);
    this.bootSource = new VmCreationWizardBootSourceComponent(page);
    this.clone = new VmCreationWizardCloneComponent(page);
    this.compute = new VmCreationWizardComputeComponent(page);
    this.deployment = new VmCreationWizardDeploymentComponent(page);
    this.location = new VmCreationWizardLocationComponent(page);
    this.navigation = new VmCreationWizardNavigationComponent(page);
    this.review = new VmCreationWizardReviewComponent(page);
    this.templateCatalog = new VmCreationWizardTemplateCatalogComponent(page);
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

  async applyWorkloadFilter(workload: string): Promise<void> {
    return this.templateCatalog.applyWorkloadFilter(workload);
  }

  async cancelAddVolumeModal(): Promise<void> {
    return this.bootSource.cancelAddVolumeModal();
  }

  async cancelWizard(): Promise<void> {
    return this.navigation.cancelWizard();
  }

  async clearCloneSourceFilters(): Promise<void> {
    return this.clone.clearCloneSourceFilters();
  }

  async clearReviewVmName(): Promise<void> {
    return this.review.clearReviewVmName();
  }

  async clickAddVolumeButton(): Promise<void> {
    return this.bootSource.clickAddVolumeButton();
  }

  async clickBack(): Promise<void> {
    return this.navigation.clickBack();
  }

  async clickClearAllFiltersInCatalog(): Promise<void> {
    return this.templateCatalog.clickClearAllFiltersInCatalog();
  }

  async clickCreateVm(): Promise<void> {
    return this.review.clickCreateVm();
  }

  async clickNext(): Promise<void> {
    return this.navigation.clickNext();
  }

  async clickViewAllProjectsInCatalog(): Promise<void> {
    return this.templateCatalog.clickViewAllProjectsInCatalog();
  }

  async closeEditLocationPanel(): Promise<void> {
    return this.location.closeEditLocationPanel();
  }

  async closeTemplateDrawer(): Promise<void> {
    return this.templateCatalog.closeTemplateDrawer();
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

      const label = VmCreationWizardComponent._strategyLabels[strategy] || strategy;
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

  async enableUserTemplatesFilter(): Promise<void> {
    return this.templateCatalog.enableUserTemplatesFilter();
  }

  // ============================================================================
  // Step 1 — Deployment Details: Location section
  // ============================================================================

  /**
   * Ensures the deployment step has a valid VM name before proceeding.
   * If the name field is empty, auto-generates one via the dice button.
   * No-op if the name input is not visible (e.g. on Clone step).
   */
  async ensureVmNameFilled(): Promise<void> {
    if (await this.deployment.isVmNameEmpty()) {
      await this.deployment.generateVmName();
    }
  }

  async fillReviewDescription(text: string): Promise<void> {
    return this.review.fillReviewDescription(text);
  }

  async fillReviewVmName(name: string): Promise<void> {
    return this.review.fillReviewVmName(name);
  }

  async fillVmName(name: string): Promise<void> {
    return this.deployment.fillVmName(name);
  }

  async filterTemplateCatalog(keyword: string): Promise<void> {
    return this.templateCatalog.filterTemplateCatalog(keyword);
  }

  // ============================================================================
  // Step 3 — Boot Source
  // ============================================================================

  /** Click the dice icon to auto-generate a unique VM name (required on 4.99+ before Next). */
  async generateVmName(): Promise<void> {
    return this.deployment.generateVmName();
  }

  async getActiveComputeTab(): Promise<string> {
    return this.compute.getActiveComputeTab();
  }

  async getAddVolumeModalSaveButtonText(): Promise<string> {
    return this.bootSource.getAddVolumeModalSaveButtonText();
  }

  async getAddVolumePreferenceHelperText(): Promise<string> {
    return this.bootSource.getAddVolumePreferenceHelperText();
  }

  async getAddVolumePreferenceValue(): Promise<string> {
    return this.bootSource.getAddVolumePreferenceValue();
  }

  async getBootSourceEmptyStateBodyText(): Promise<string> {
    return this.bootSource.getBootSourceEmptyStateBodyText();
  }

  async getBootSourceEmptyStateHeading(): Promise<string> {
    return this.bootSource.getBootSourceEmptyStateHeading();
  }

  async getBootVolumeCount(): Promise<number> {
    return this.bootSource.getBootVolumeCount();
  }

  async getBootVolumeOsColumnValues(): Promise<string[]> {
    return this.bootSource.getBootVolumeOsColumnValues();
  }

  async getCloneWizardStepIds(): Promise<string[]> {
    return this.clone.getCloneWizardStepIds();
  }

  async getComputeSizeDropdownText(): Promise<string> {
    return this.compute.getComputeSizeDropdownText();
  }

  async getComputeSizeOptions(): Promise<string[]> {
    return this.compute.getComputeSizeOptions();
  }

  async getCreateButtonText(): Promise<string> {
    return this.review.getCreateButtonText();
  }

  async getCreatedVmNameFromUrl(): Promise<string> {
    const url = this.page.url();
    const match = url.match(/kubevirt\.io~v1~VirtualMachine\/([^/?#]+)/);
    return match?.[1] || '';
  }

  async getCreatedVmNamespaceFromUrl(): Promise<string> {
    const url = this.page.url();
    const match = url.match(/\/ns\/([^/]+)\//);
    return match?.[1] || '';
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

  async getDeploymentVmName(): Promise<string> {
    return this.deployment.getVmName();
  }

  async getLocationProject(): Promise<string> {
    return this.location.getLocationProject();
  }

  async getReviewDescription(): Promise<string> {
    return this.review.getReviewDescription();
  }

  async getReviewDescriptionText(): Promise<string> {
    return this.review.getReviewDescriptionText();
  }

  async getReviewNameValidationError(): Promise<string> {
    return this.review.getReviewNameValidationError();
  }

  async getReviewVmName(): Promise<string> {
    return this.review.getReviewVmName();
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
    return this.compute.getSelectedInstanceTypeSeries();
  }

  // ============================================================================
  // Step 4 — Compute Resources
  // ============================================================================

  async getSelectedOsType(): Promise<string> {
    return this.deployment.getSelectedOsType();
  }

  async getSelectedTemplateCardTitle(templateTestId: string): Promise<string> {
    return this.templateCatalog.getSelectedTemplateCardTitle(templateTestId);
  }

  async getStartAfterCreationLabel(): Promise<string> {
    return this.review.getStartAfterCreationLabel();
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

  async getTemplateCardFields(templateTestId: string): Promise<string[]> {
    return this.templateCatalog.getTemplateCardFields(templateTestId);
  }

  async getTemplateCatalogCount(): Promise<number> {
    return this.templateCatalog.getTemplateCatalogCount();
  }

  async getTemplateDrawerFields(): Promise<string[]> {
    return this.templateCatalog.getTemplateDrawerFields();
  }

  async getTemplateDrawerTitle(): Promise<string> {
    return this.templateCatalog.getTemplateDrawerTitle();
  }

  async isAddVolumeModalSaveButtonDisabled(): Promise<boolean> {
    return this.bootSource.isAddVolumeModalSaveButtonDisabled();
  }

  async isAddVolumePreferenceDisabled(): Promise<boolean> {
    return this.bootSource.isAddVolumePreferenceDisabled();
  }

  async isBootVolumeOsFilterVisible(): Promise<boolean> {
    return this.bootSource.isBootVolumeOsFilterVisible();
  }

  async isBootVolumeStarred(volumeName: string): Promise<boolean> {
    return this.bootSource.isBootVolumeStarred(volumeName);
  }

  // ============================================================================
  // Step 6 — Customization
  // ============================================================================

  async isCreateButtonDisabled(): Promise<boolean> {
    return this.review.isCreateButtonDisabled();
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

  async isNextButtonDisabled(): Promise<boolean> {
    return this.navigation.isNextButtonDisabled();
  }

  async isStartAfterCreationChecked(): Promise<boolean> {
    return this.review.isStartAfterCreationChecked();
  }

  async isVmNameEmpty(): Promise<boolean> {
    return this.deployment.isVmNameEmpty();
  }

  async navigateToStepByName(stepName: string): Promise<void> {
    return this.navigation.navigateToStepByName(stepName);
  }

  async navigateToWizardInNamespace(namespace: string): Promise<void> {
    return this.deployment.navigateToWizardInNamespace(namespace);
  }

  async openEditLocationPanel(): Promise<void> {
    return this.location.openEditLocationPanel();
  }

  async openWizardFromCreateDropdown(): Promise<void> {
    return this.deployment.openWizardFromCreateDropdown();
  }

  async searchBootVolumeByName(name: string): Promise<void> {
    return this.bootSource.searchBootVolumeByName(name);
  }

  async searchCloneSourceByName(name: string): Promise<void> {
    return this.clone.searchCloneSourceByName(name);
  }

  async searchCustomizationSettings(query: string): Promise<void> {
    const searchInput = this._pfV6CWizardInputPlaceholderFindSettings;
    await searchInput.clear();
    await searchInput.fill(query);
    await this.page.waitForTimeout(500);
  }

  async selectBootVolumeByName(volumeName: string): Promise<void> {
    return this.bootSource.selectBootVolumeByName(volumeName);
  }

  async selectCloneSourceVm(vmName: string): Promise<void> {
    return this.clone.selectCloneSourceVm(vmName);
  }

  async selectComputeSize(sizeName: string): Promise<void> {
    return this.compute.selectComputeSize(sizeName);
  }

  // ============================================================================
  // Step 8 — Review and Create
  // ============================================================================

  async selectComputeTab(tab: 'redhat' | 'user'): Promise<void> {
    return this.compute.selectComputeTab(tab);
  }

  async selectCreationMethod(method: 'newVm' | 'fromTemplate' | 'cloneVm'): Promise<void> {
    return this.deployment.selectCreationMethod(method);
  }

  async selectCustomizationTab(
    tabName:
      | 'Details'
      | 'Storage'
      | 'Network'
      | 'Scheduling'
      | 'SSH'
      | 'Initial run'
      | 'Labels and annotations',
  ): Promise<void> {
    const tab = this.locator(`button[role="tab"]:has-text("${tabName}")`);
    await this.robustClick(tab.first());
  }

  async selectFirstAvailableBootVolume(): Promise<void> {
    return this.bootSource.selectFirstAvailableBootVolume();
  }

  async selectInstanceTypeSeries(series: 'cx' | 'd' | 'u' | 'm' | 'n' | 'o' | 'rt'): Promise<void> {
    return this.compute.selectInstanceTypeSeries(series);
  }

  async selectNoBootSource(): Promise<void> {
    return this.bootSource.selectNoBootSource();
  }

  async selectOperatingSystem(os: 'rhel' | 'windows' | 'otherLinux'): Promise<void> {
    return this.deployment.selectOperatingSystem(os);
  }

  async selectOsType(osType: string): Promise<void> {
    return this.deployment.selectOsType(osType);
  }

  async selectTemplateByTestId(templateTestId: string): Promise<void> {
    return this.templateCatalog.selectTemplateByTestId(templateTestId);
  }

  async selectTemplateCatalogProject(projectName: string): Promise<void> {
    return this.templateCatalog.selectTemplateCatalogProject(projectName);
  }

  async selectUserProvidedInstanceTypeByName(name: string): Promise<void> {
    return this.compute.selectUserProvidedInstanceTypeByName(name);
  }

  async selectVolumesProject(projectName: string): Promise<void> {
    return this.bootSource.selectVolumesProject(projectName);
  }

  async setCloneSourceProjectFilter(namespace: string): Promise<void> {
    return this.clone.setCloneSourceProjectFilter(namespace);
  }

  async toggleBootVolumeStar(volumeName: string): Promise<void> {
    return this.bootSource.toggleBootVolumeStar(volumeName);
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

  async toggleGuestSystemLogAccess(): Promise<void> {
    await this._toggleSwitch('guest-system-log-access');
  }

  async toggleHeadlessMode(): Promise<void> {
    await this._toggleSwitch('headless-mode');
  }

  // ============================================================================
  // Step 5 — Template catalog (From Template flow)
  // ============================================================================

  async toggleStartAfterCreation(): Promise<void> {
    return this.review.toggleStartAfterCreation();
  }

  async toggleTemplateCatalogView(view: 'grid' | 'list'): Promise<void> {
    return this.templateCatalog.toggleTemplateCatalogView(view);
  }

  async typeReviewVmName(name: string): Promise<void> {
    return this.review.typeReviewVmName(name);
  }

  async verifyAddVolumeButtonVisible(): Promise<boolean> {
    return this.bootSource.verifyAddVolumeButtonVisible();
  }

  async verifyAllInstanceTypeSeriesVisible(): Promise<string[]> {
    return this.compute.verifyAllInstanceTypeSeriesVisible();
  }

  async verifyBootSourceStepVisible(): Promise<boolean> {
    return this.bootSource.verifyBootSourceStepVisible();
  }

  async verifyBootVolumeTableColumnsVisible(): Promise<boolean> {
    return this.bootSource.verifyBootVolumeTableColumnsVisible();
  }

  async verifyBootVolumeTableOrEmptyState(): Promise<boolean> {
    return this.bootSource.verifyBootVolumeTableOrEmptyState();
  }

  async verifyBootVolumeTableVisible(): Promise<boolean> {
    return this.bootSource.verifyBootVolumeTableVisible();
  }

  async verifyCloneSourceDescription(): Promise<boolean> {
    return this.clone.verifyCloneSourceDescription();
  }

  async verifyCloneSourceStepVisible(): Promise<boolean> {
    return this.clone.verifyCloneSourceStepVisible();
  }

  async verifyCloneVmListVisible(): Promise<boolean> {
    return this.clone.verifyCloneVmListVisible();
  }

  async verifyComputeResourcesStepVisible(): Promise<boolean> {
    return this.compute.verifyComputeResourcesStepVisible();
  }

  async verifyComputeTabsVisible(): Promise<boolean> {
    return this.compute.verifyComputeTabsVisible();
  }

  async verifyCreationMethodCardSelected(
    method: 'newVm' | 'fromTemplate' | 'cloneVm',
  ): Promise<boolean> {
    return this.deployment.verifyCreationMethodCardSelected(method);
  }

  async verifyCreationMethodTilesVisible(): Promise<boolean> {
    return this.deployment.verifyCreationMethodTilesVisible();
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
      'Labels and annotations',
    ];
    try {
      const tablist = this.locator('[role="tablist"]');
      await tablist.first().waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
      for (const tabName of expectedTabs) {
        const tab = tablist.getByRole('tab', { name: tabName });
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

  async verifyEditLocationButtonVisible(): Promise<boolean> {
    return this.location.verifyEditLocationButtonVisible();
  }

  async verifyEditLocationPanelFields(): Promise<{
    projectDropdown: boolean;
    folderCombobox: boolean;
  }> {
    return this.location.verifyEditLocationPanelFields();
  }

  // ============================================================================
  // Step 6 — Customization sub-tabs content validation
  // ============================================================================

  async verifyEmptyProjectStateInCatalog(): Promise<boolean> {
    return this.templateCatalog.verifyEmptyProjectStateInCatalog();
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
    return this.compute.verifyInstanceTypeSeriesVisible();
  }

  async verifyLocationSectionVisible(): Promise<boolean> {
    return this.location.verifyLocationSectionVisible();
  }

  async verifyMetadataTabContent(): Promise<{
    labelsEditButton: boolean;
    annotationsButton: boolean;
  }> {
    await this.selectCustomizationTab('Labels and annotations');
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

  async verifyNoBootSourceOptionVisible(): Promise<boolean> {
    return this.bootSource.verifyNoBootSourceOptionVisible();
  }

  async verifyNoErrorBoundary(waitMs = 3000): Promise<boolean> {
    return this.templateCatalog.verifyNoErrorBoundary(waitMs);
  }

  async verifyNoHeaderProjectSelector(): Promise<boolean> {
    return this.location.verifyNoHeaderProjectSelector();
  }

  async verifyOsTilesVisible(): Promise<boolean> {
    return this.deployment.verifyOsTilesVisible();
  }

  async verifyOsTypeDropdownVisible(): Promise<boolean> {
    return this.deployment.verifyOsTypeDropdownVisible();
  }

  // ============================================================================
  // Clone flow — Source step
  // ============================================================================

  async verifyRedirectedToVmDetails(): Promise<boolean> {
    try {
      await this.page.waitForURL(/kubevirt\.io~v1~VirtualMachine\/[a-z0-9][a-z0-9-]*[a-z0-9]$/, {
        timeout: TestTimeouts.VM_OPERATION,
      });
      return true;
    } catch {
      return false;
    }
  }

  async verifyRedirectedToVmList(): Promise<boolean> {
    try {
      await this.page.waitForURL(/kubevirt\.io~v1~VirtualMachine|\/vms/, {
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      return true;
    } catch {
      return false;
    }
  }

  async verifyReviewNameEditable(): Promise<boolean> {
    return this.review.verifyReviewNameEditable();
  }

  async verifyReviewNameLabelRequired(): Promise<boolean> {
    return this.review.verifyReviewNameLabelRequired();
  }

  async verifyReviewSectionsVisible(): Promise<boolean> {
    return this.review.verifyReviewSectionsVisible();
  }

  async verifyReviewStepVisible(): Promise<boolean> {
    return this.review.verifyReviewStepVisible();
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

  // ============================================================================
  // Create action
  // ============================================================================

  async verifyStartAfterCreationCheckbox(): Promise<boolean> {
    return this.review.verifyStartAfterCreationCheckbox();
  }

  async verifyStepActive(stepId: string): Promise<boolean> {
    return this.deployment.verifyStepActive(stepId);
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

  async verifyTemplateCatalogHasCards(): Promise<boolean> {
    return this.templateCatalog.verifyTemplateCatalogHasCards();
  }

  async verifyTemplateCatalogStepVisible(): Promise<boolean> {
    return this.templateCatalog.verifyTemplateCatalogStepVisible();
  }

  // ============================================================================
  // Wizard Navigation
  // ============================================================================

  async verifyTemplateCatalogToolbar(): Promise<{
    filterInput: boolean;
    gridToggle: boolean;
    listToggle: boolean;
    projectDropdown: boolean;
  }> {
    return this.templateCatalog.verifyTemplateCatalogToolbar();
  }

  async verifyTemplateDrawerVisible(): Promise<boolean> {
    return this.templateCatalog.verifyTemplateDrawerVisible();
  }

  async verifyWizardCloseButtonHidden(): Promise<boolean> {
    return this.location.verifyWizardCloseButtonHidden();
  }

  async verifyWizardClosed(): Promise<boolean> {
    return this.deployment.verifyWizardClosed();
  }

  async verifyWizardVisible(): Promise<boolean> {
    return this.deployment.verifyWizardVisible();
  }
}
