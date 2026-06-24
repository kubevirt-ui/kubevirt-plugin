// VmCreationWizardPage — Page object for vm creation wizard interactions.

import {
  VmCreationWizardDeploymentComponent,
  VmCreationWizardLocationComponent,
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
  VmCreationWizardCustomizationComponent,
} from '@/components/vm-wizard/wizard-step-components';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

import BasePage from '../base-page';

export default class VmCreationWizardPage extends BasePage {
  readonly bootSource: VmCreationWizardBootSourceComponent;
  readonly clone: VmCreationWizardCloneComponent;
  readonly compute: VmCreationWizardComputeComponent;
  readonly customization: VmCreationWizardCustomizationComponent;
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
    this.customization = new VmCreationWizardCustomizationComponent(page);
    this.deployment = new VmCreationWizardDeploymentComponent(page);
    this.location = new VmCreationWizardLocationComponent(page);
    this.navigation = new VmCreationWizardNavigationComponent(page);
    this.review = new VmCreationWizardReviewComponent(page);
    this.templateCatalog = new VmCreationWizardTemplateCatalogComponent(page);
  }

  async navigateToWizardInNamespace(namespace: string): Promise<void> {
    return this.deployment.navigateToWizardInNamespace(namespace);
  }

  async openWizardFromCreateDropdown(): Promise<void> {
    return this.deployment.openWizardFromCreateDropdown();
  }

  async verifyWizardVisible(): Promise<boolean> {
    return this.deployment.verifyWizardVisible();
  }

  async verifyWizardClosed(): Promise<boolean> {
    return this.deployment.verifyWizardClosed();
  }

  async verifyCreationMethodTilesVisible(): Promise<boolean> {
    return this.deployment.verifyCreationMethodTilesVisible();
  }

  async selectCreationMethod(method: 'cloneVm' | 'fromTemplate' | 'newVm'): Promise<void> {
    return this.deployment.selectCreationMethod(method);
  }

  async generateVmName(): Promise<void> {
    return this.deployment.generateVmName();
  }

  async fillVmName(name: string): Promise<void> {
    return this.deployment.fillVmName(name);
  }

  async getDeploymentVmName(): Promise<string> {
    return this.deployment.getVmName();
  }

  async isVmNameEmpty(): Promise<boolean> {
    return this.deployment.isVmNameEmpty();
  }

  async ensureVmNameFilled(): Promise<void> {
    if (await this.deployment.isVmNameEmpty()) {
      await this.deployment.generateVmName();
    }
  }

  async verifyCreationMethodCardSelected(
    method: 'cloneVm' | 'fromTemplate' | 'newVm',
  ): Promise<boolean> {
    return this.deployment.verifyCreationMethodCardSelected(method);
  }

  async verifyOsTilesVisible(): Promise<boolean> {
    return this.deployment.verifyOsTilesVisible();
  }

  async selectOperatingSystem(os: 'otherLinux' | 'rhel' | 'windows'): Promise<void> {
    return this.deployment.selectOperatingSystem(os);
  }

  async isOsTileSelected(os: 'otherLinux' | 'rhel' | 'windows'): Promise<boolean> {
    return this.deployment.isOsTileSelected(os);
  }

  async selectOsType(osType: string): Promise<void> {
    return this.deployment.selectOsType(osType);
  }

  async verifyOsTypeDropdownVisible(): Promise<boolean> {
    return this.deployment.verifyOsTypeDropdownVisible();
  }

  async verifyStepActive(stepId: string): Promise<boolean> {
    return this.deployment.verifyStepActive(stepId);
  }

  // ============================================================================
  // Step 1 — Deployment Details: Location section
  // ============================================================================

  async verifyLocationSectionVisible(): Promise<boolean> {
    return this.location.verifyLocationSectionVisible();
  }

  async getLocationProject(): Promise<string> {
    return this.location.getLocationProject();
  }

  async verifyNoHeaderProjectSelector(): Promise<boolean> {
    return this.location.verifyNoHeaderProjectSelector();
  }

  async verifyWizardCloseButtonHidden(): Promise<boolean> {
    return this.location.verifyWizardCloseButtonHidden();
  }

  async verifyEditLocationButtonVisible(): Promise<boolean> {
    return this.location.verifyEditLocationButtonVisible();
  }

  // ============================================================================
  // Step 3 — Boot Source
  // ============================================================================

  async verifyBootSourceStepVisible(): Promise<boolean> {
    return this.bootSource.verifyBootSourceStepVisible();
  }

  async verifyBootVolumeTableVisible(): Promise<boolean> {
    return this.bootSource.verifyBootVolumeTableVisible();
  }

  async verifyBootVolumeTableOrEmptyState(): Promise<boolean> {
    return this.bootSource.verifyBootVolumeTableOrEmptyState();
  }

  async selectBootVolumeByName(volumeName: string): Promise<void> {
    return this.bootSource.selectBootVolumeByName(volumeName);
  }

  async selectNoBootSource(): Promise<void> {
    return this.bootSource.selectNoBootSource();
  }

  async getBootVolumeCount(): Promise<number> {
    return this.bootSource.getBootVolumeCount();
  }

  async verifyBootVolumeTableColumnsVisible(): Promise<boolean> {
    return this.bootSource.verifyBootVolumeTableColumnsVisible();
  }

  async verifyAddVolumeButtonVisible(): Promise<boolean> {
    return this.bootSource.verifyAddVolumeButtonVisible();
  }

  async clickAddVolumeButton(): Promise<void> {
    return this.bootSource.clickAddVolumeButton();
  }

  async getAddVolumeModalSaveButtonText(): Promise<string> {
    return this.bootSource.getAddVolumeModalSaveButtonText();
  }

  async isAddVolumeModalSaveButtonDisabled(): Promise<boolean> {
    return this.bootSource.isAddVolumeModalSaveButtonDisabled();
  }

  async cancelAddVolumeModal(): Promise<void> {
    return this.bootSource.cancelAddVolumeModal();
  }

  async verifyNoBootSourceOptionVisible(): Promise<boolean> {
    return this.bootSource.verifyNoBootSourceOptionVisible();
  }

  async searchBootVolumeByName(name: string): Promise<void> {
    return this.bootSource.searchBootVolumeByName(name);
  }

  async toggleBootVolumeStar(volumeName: string): Promise<void> {
    return this.bootSource.toggleBootVolumeStar(volumeName);
  }

  async isBootVolumeStarred(volumeName: string): Promise<boolean> {
    return this.bootSource.isBootVolumeStarred(volumeName);
  }

  async getBootVolumeOsColumnValues(): Promise<string[]> {
    return this.bootSource.getBootVolumeOsColumnValues();
  }

  async isBootVolumeOsFilterVisible(): Promise<boolean> {
    return this.bootSource.isBootVolumeOsFilterVisible();
  }

  async getBootSourceEmptyStateHeading(): Promise<string> {
    return this.bootSource.getBootSourceEmptyStateHeading();
  }

  async getBootSourceEmptyStateBodyText(): Promise<string> {
    return this.bootSource.getBootSourceEmptyStateBodyText();
  }

  async isAddVolumePreferenceDisabled(): Promise<boolean> {
    return this.bootSource.isAddVolumePreferenceDisabled();
  }

  async getAddVolumePreferenceValue(): Promise<string> {
    return this.bootSource.getAddVolumePreferenceValue();
  }

  async getAddVolumePreferenceHelperText(): Promise<string> {
    return this.bootSource.getAddVolumePreferenceHelperText();
  }

  // ============================================================================
  // Step 4 — Compute Resources
  // ============================================================================

  async verifyComputeResourcesStepVisible(): Promise<boolean> {
    return this.compute.verifyComputeResourcesStepVisible();
  }

  async verifyInstanceTypeSeriesVisible(): Promise<boolean> {
    return this.compute.verifyInstanceTypeSeriesVisible();
  }

  async selectInstanceTypeSeries(series: 'cx' | 'd' | 'm' | 'n' | 'o' | 'rt' | 'u'): Promise<void> {
    return this.compute.selectInstanceTypeSeries(series);
  }

  async verifyComputeTabsVisible(): Promise<boolean> {
    return this.compute.verifyComputeTabsVisible();
  }

  async selectComputeTab(tab: 'redhat' | 'user'): Promise<void> {
    return this.compute.selectComputeTab(tab);
  }

  async verifyAllInstanceTypeSeriesVisible(): Promise<string[]> {
    return this.compute.verifyAllInstanceTypeSeriesVisible();
  }

  async getSelectedInstanceTypeSeries(): Promise<string> {
    return this.compute.getSelectedInstanceTypeSeries();
  }

  async getComputeSizeDropdownText(): Promise<string> {
    return this.compute.getComputeSizeDropdownText();
  }

  async getComputeSizeOptions(): Promise<string[]> {
    return this.compute.getComputeSizeOptions();
  }

  async selectComputeSize(sizeName: string): Promise<void> {
    return this.compute.selectComputeSize(sizeName);
  }

  async getActiveComputeTab(): Promise<string> {
    return this.compute.getActiveComputeTab();
  }

  async selectUserProvidedInstanceTypeByName(name: string): Promise<void> {
    return this.compute.selectUserProvidedInstanceTypeByName(name);
  }

  // ============================================================================
  // Step 8 — Review and Create
  // ============================================================================

  async verifyReviewStepVisible(): Promise<boolean> {
    return this.review.verifyReviewStepVisible();
  }

  async verifyReviewSectionsVisible(): Promise<boolean> {
    return this.review.verifyReviewSectionsVisible();
  }

  async getReviewVmName(): Promise<string> {
    return this.review.getReviewVmName();
  }

  async fillReviewVmName(name: string): Promise<void> {
    return this.review.fillReviewVmName(name);
  }

  async verifyStartAfterCreationCheckbox(): Promise<boolean> {
    return this.review.verifyStartAfterCreationCheckbox();
  }

  async isStartAfterCreationChecked(): Promise<boolean> {
    return this.review.isStartAfterCreationChecked();
  }

  async toggleStartAfterCreation(): Promise<void> {
    return this.review.toggleStartAfterCreation();
  }

  async getReviewDescriptionText(): Promise<string> {
    return this.review.getReviewDescriptionText();
  }

  async getCreateButtonText(): Promise<string> {
    return this.review.getCreateButtonText();
  }

  async fillReviewDescription(text: string): Promise<void> {
    return this.review.fillReviewDescription(text);
  }

  async getReviewDescription(): Promise<string> {
    return this.review.getReviewDescription();
  }

  async clearReviewVmName(): Promise<void> {
    return this.review.clearReviewVmName();
  }

  async typeReviewVmName(name: string): Promise<void> {
    return this.review.typeReviewVmName(name);
  }

  async isCreateButtonDisabled(): Promise<boolean> {
    return this.review.isCreateButtonDisabled();
  }

  async getReviewNameValidationError(): Promise<string> {
    return this.review.getReviewNameValidationError();
  }

  async verifyReviewNameLabelRequired(): Promise<boolean> {
    return this.review.verifyReviewNameLabelRequired();
  }

  async verifyReviewNameEditable(): Promise<boolean> {
    return this.review.verifyReviewNameEditable();
  }

  // ============================================================================
  // Step 5 — Template catalog (From Template flow)
  // ============================================================================

  async verifyTemplateCatalogStepVisible(): Promise<boolean> {
    return this.templateCatalog.verifyTemplateCatalogStepVisible();
  }

  async getTemplateCatalogCount(): Promise<number> {
    return this.templateCatalog.getTemplateCatalogCount();
  }

  async verifyTemplateCatalogToolbar(): Promise<{
    filterInput: boolean;
    gridToggle: boolean;
    listToggle: boolean;
    projectDropdown: boolean;
  }> {
    return this.templateCatalog.verifyTemplateCatalogToolbar();
  }

  async selectTemplateByTestId(templateTestId: string): Promise<void> {
    return this.templateCatalog.selectTemplateByTestId(templateTestId);
  }

  async getSelectedTemplateCardTitle(templateTestId: string): Promise<string> {
    return this.templateCatalog.getSelectedTemplateCardTitle(templateTestId);
  }

  async getTemplateCardFields(templateTestId: string): Promise<string[]> {
    return this.templateCatalog.getTemplateCardFields(templateTestId);
  }

  async verifyTemplateDrawerVisible(): Promise<boolean> {
    return this.templateCatalog.verifyTemplateDrawerVisible();
  }

  async getTemplateDrawerTitle(): Promise<string> {
    return this.templateCatalog.getTemplateDrawerTitle();
  }

  async getTemplateDrawerFields(): Promise<string[]> {
    return this.templateCatalog.getTemplateDrawerFields();
  }

  async closeTemplateDrawer(): Promise<void> {
    return this.templateCatalog.closeTemplateDrawer();
  }

  async filterTemplateCatalog(keyword: string): Promise<void> {
    return this.templateCatalog.filterTemplateCatalog(keyword);
  }

  async enableUserTemplatesFilter(): Promise<void> {
    return this.templateCatalog.enableUserTemplatesFilter();
  }

  async toggleTemplateCatalogView(view: 'grid' | 'list'): Promise<void> {
    return this.templateCatalog.toggleTemplateCatalogView(view);
  }

  async selectTemplateCatalogProject(projectName: string): Promise<void> {
    return this.templateCatalog.selectTemplateCatalogProject(projectName);
  }

  async clickViewAllProjectsInCatalog(): Promise<void> {
    return this.templateCatalog.clickViewAllProjectsInCatalog();
  }

  async verifyEmptyProjectStateInCatalog(): Promise<boolean> {
    return this.templateCatalog.verifyEmptyProjectStateInCatalog();
  }

  async applyWorkloadFilter(workload: string): Promise<void> {
    return this.templateCatalog.applyWorkloadFilter(workload);
  }

  async clickClearAllFiltersInCatalog(): Promise<void> {
    return this.templateCatalog.clickClearAllFiltersInCatalog();
  }

  async verifyNoErrorBoundary(waitMs = 3000): Promise<boolean> {
    return this.templateCatalog.verifyNoErrorBoundary(waitMs);
  }

  async verifyTemplateCatalogHasCards(): Promise<boolean> {
    return this.templateCatalog.verifyTemplateCatalogHasCards();
  }

  async openEditLocationPanel(): Promise<void> {
    return this.location.openEditLocationPanel();
  }

  async verifyEditLocationPanelFields(): Promise<{
    projectDropdown: boolean;
    folderCombobox: boolean;
  }> {
    return this.location.verifyEditLocationPanelFields();
  }

  async closeEditLocationPanel(): Promise<void> {
    return this.location.closeEditLocationPanel();
  }

  async getStartAfterCreationLabel(): Promise<string> {
    return this.review.getStartAfterCreationLabel();
  }

  // ============================================================================
  // Clone flow — Source step
  // ============================================================================

  async verifyCloneSourceStepVisible(): Promise<boolean> {
    return this.clone.verifyCloneSourceStepVisible();
  }

  async verifyCloneSourceDescription(): Promise<boolean> {
    return this.clone.verifyCloneSourceDescription();
  }

  async verifyCloneVmListVisible(): Promise<boolean> {
    return this.clone.verifyCloneVmListVisible();
  }

  async clearCloneSourceFilters(): Promise<void> {
    return this.clone.clearCloneSourceFilters();
  }

  async setCloneSourceProjectFilter(namespace: string): Promise<void> {
    return this.clone.setCloneSourceProjectFilter(namespace);
  }

  async searchCloneSourceByName(name: string): Promise<void> {
    return this.clone.searchCloneSourceByName(name);
  }

  async selectCloneSourceVm(vmName: string): Promise<void> {
    return this.clone.selectCloneSourceVm(vmName);
  }

  async getCloneWizardStepIds(): Promise<string[]> {
    return this.clone.getCloneWizardStepIds();
  }

  // ============================================================================
  // Create action
  // ============================================================================

  async clickCreateVm(): Promise<void> {
    return this.review.clickCreateVm();
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

  // ============================================================================
  // Wizard Navigation
  // ============================================================================

  async isNextButtonDisabled(): Promise<boolean> {
    return this.navigation.isNextButtonDisabled();
  }

  async clickNext(): Promise<void> {
    return this.navigation.clickNext();
  }

  async clickBack(): Promise<void> {
    return this.navigation.clickBack();
  }

  async cancelWizard(): Promise<void> {
    return this.navigation.cancelWizard();
  }

  async navigateToStepByName(stepName: string): Promise<void> {
    return this.navigation.navigateToStepByName(stepName);
  }
}
