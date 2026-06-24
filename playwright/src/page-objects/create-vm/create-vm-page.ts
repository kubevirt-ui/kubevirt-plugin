// CreateVmPage — Page object for create vm interactions.

import {
  CreateVmTemplateCatalogComponent,
  CreateVmWizardTabsComponent,
} from '@/components/create-vm/catalog-components';
import PageCommons from '@/page-objects/page-commons';
import type { Page } from '@playwright/test';

import CreateVmInstanceTypesPage from './create-vm-instance-types-page';

export default class CreateVmPage extends PageCommons {
  readonly templateCatalog: CreateVmTemplateCatalogComponent;
  readonly instanceType: CreateVmInstanceTypesPage;
  readonly wizardTabs: CreateVmWizardTabsComponent;

  constructor(page: Page) {
    super(page);
    this.templateCatalog = new CreateVmTemplateCatalogComponent(page);
    this.instanceType = new CreateVmInstanceTypesPage(page);
    this.wizardTabs = new CreateVmWizardTabsComponent(page);
  }

  async clickCreateVirtualMachine() {
    return this.instanceType.clickCreateVirtualMachine();
  }

  async clickAddVolumeButton() {
    return this.instanceType.clickAddVolumeButton();
  }

  async clickInstanceSize(sizeOption: string) {
    return this.instanceType.clickInstanceSize(sizeOption);
  }

  async clickHugepages() {
    return this.instanceType.clickHugepages();
  }

  async clickInstanceTypesTab() {
    return this.instanceType.clickInstanceTypesTab();
  }

  async clickInstanceTypesVmDetailsSection() {
    return this.instanceType.clickInstanceTypesVmDetailsSection();
  }

  async clickOperatingSystem(osName: string) {
    return this.instanceType.clickOperatingSystem(osName);
  }

  async clickSeriesDropdown(seriesName: string) {
    return this.instanceType.clickSeriesDropdown(seriesName);
  }

  async clickStartAfterCreationCheckbox() {
    return this.templateCatalog.clickStartAfterCreationCheckbox();
  }

  async uncheckStartAfterCreationCheckbox() {
    return this.templateCatalog.uncheckStartAfterCreationCheckbox();
  }

  async setStartAfterCreationInstanceType(enabled: boolean): Promise<void> {
    return this.instanceType.setStartAfterCreationInstanceType(enabled);
  }

  async fillVmName(vmName: string) {
    return this.instanceType.fillVmName(vmName);
  }

  async selectFolderForInstanceType(folderName: string) {
    return this.instanceType.selectFolderForInstanceType(folderName);
  }

  async selectFolderForTemplate(folderName: string, createNew = true) {
    return this.templateCatalog.selectFolderForTemplate(folderName, createNew);
  }

  async navigateToProjectCatalog(projectName: string) {
    return this.templateCatalog.navigateToProjectCatalog(projectName);
  }

  async navigateToCatalogViaUI(): Promise<void> {
    return this.templateCatalog.navigateToCatalogViaUI();
  }

  async navigateToNamespaceCatalogViaUI(namespace?: string): Promise<void> {
    return this.templateCatalog.navigateToNamespaceCatalogViaUI(namespace);
  }

  async navigateToTemplateCatalogViaVmList(namespace?: string): Promise<void> {
    return this.templateCatalog.navigateToTemplateCatalogViaVmList(namespace);
  }

  async navigateToInstanceTypeCatalogViaVmList(namespace?: string): Promise<void> {
    return this.instanceType.navigateToInstanceTypeCatalogViaVmList(namespace);
  }

  async clickTemplatesTab() {
    return this.templateCatalog.clickTemplatesTab();
  }

  async isBootableVolumesSectionVisible(): Promise<boolean> {
    return this.instanceType.isBootableVolumesSectionVisible();
  }

  async isTemplateCatalogSectionVisible(): Promise<boolean> {
    return this.templateCatalog.isTemplateCatalogSectionVisible();
  }

  async isInstanceTypesSectionVisible(): Promise<boolean> {
    return this.instanceType.isInstanceTypesSectionVisible();
  }

  async isCreateVmFromCatalogAvailable(): Promise<boolean> {
    return this.templateCatalog.isCreateVmFromCatalogAvailable();
  }

  async clickUserProvidedTab() {
    return this.templateCatalog.clickUserProvidedTab();
  }

  override async waitForTemplateForm() {
    return this.templateCatalog.waitForTemplateForm();
  }

  async searchTemplate(templateName: string) {
    return this.templateCatalog.searchTemplate(templateName);
  }

  async clickTemplateByMetadataName(templateMetadataName: string) {
    return this.templateCatalog.clickTemplateByMetadataName(templateMetadataName);
  }

  async fillTemplateCatalogVmName(vmName: string) {
    return this.templateCatalog.fillTemplateCatalogVmName(vmName);
  }

  async clickQuickCreateVmButton() {
    return this.templateCatalog.clickQuickCreateVmButton();
  }

  async clickCustomizeVmButton() {
    return this.templateCatalog.clickCustomizeVmButton();
  }

  async clickCustomizeVirtualMachineButton() {
    return this.templateCatalog.clickCustomizeVirtualMachineButton();
  }

  async clickCustomizeVirtualMachineFooterButton() {
    return this.templateCatalog.clickCustomizeVirtualMachineFooterButton();
  }

  async fillReviewAndCreateVmName(vmName: string) {
    return this.templateCatalog.fillReviewAndCreateVmName(vmName);
  }

  async selectDiskSource(
    ...args: Parameters<CreateVmTemplateCatalogComponent['selectDiskSource']>
  ): ReturnType<CreateVmTemplateCatalogComponent['selectDiskSource']> {
    return this.templateCatalog.selectDiskSource(...args);
  }

  async configureTlsCertificate(
    ...args: Parameters<CreateVmTemplateCatalogComponent['configureTlsCertificate']>
  ): ReturnType<CreateVmTemplateCatalogComponent['configureTlsCertificate']> {
    return this.templateCatalog.configureTlsCertificate(...args);
  }

  async isTlsCertificateCheckboxVisible(timeout?: number): Promise<boolean> {
    return this.templateCatalog.isTlsCertificateCheckboxVisible(timeout);
  }

  async isTlsCertificateChecked(): Promise<boolean> {
    return this.templateCatalog.isTlsCertificateChecked();
  }

  async selectBootSource(
    ...args: Parameters<CreateVmTemplateCatalogComponent['selectBootSource']>
  ): ReturnType<CreateVmTemplateCatalogComponent['selectBootSource']> {
    return this.templateCatalog.selectBootSource(...args);
  }

  async setWindowsDrivers(mount = true) {
    return this.templateCatalog.setWindowsDrivers(mount);
  }

  async verifyWindowsDriversCheckbox(shouldBeChecked: boolean): Promise<boolean> {
    return this.templateCatalog.verifyWindowsDriversCheckbox(shouldBeChecked);
  }

  async filterByOSName(
    osName: 'CentOS' | 'Fedora' | 'RHEL' | 'Windows',
    check = true,
  ): Promise<void> {
    return this.templateCatalog.filterByOSName(osName, check);
  }

  async filterByProvider(provider: 'Other' | 'Red Hat', check = true): Promise<void> {
    return this.templateCatalog.filterByProvider(provider, check);
  }

  async filterByWorkload(workload: 'Desktop' | 'Server', check = true): Promise<void> {
    return this.templateCatalog.filterByWorkload(workload, check);
  }

  async filterByBootSourceAvailable(check = true): Promise<void> {
    return this.templateCatalog.filterByBootSourceAvailable(check);
  }

  async verifyArchitectureFilterExists(): Promise<boolean> {
    return this.templateCatalog.verifyArchitectureFilterExists();
  }

  async switchView(view: 'grid' | 'list') {
    return this.templateCatalog.switchView(view);
  }

  async clickUserTemplatesTab() {
    return this.templateCatalog.clickUserTemplatesTab();
  }

  async clickAllTemplatesButton() {
    return this.templateCatalog.clickAllTemplatesButton();
  }

  async selectProjectFromCatalog(projectName: string) {
    return this.templateCatalog.selectProjectFromCatalog(projectName);
  }

  async selectNamespaceInProjectDropdown(namespace: string): Promise<void> {
    return this.templateCatalog.selectNamespaceInProjectDropdown(namespace);
  }

  async verifyTemplateCardVisible(templateName: string): Promise<boolean> {
    return this.templateCatalog.verifyTemplateCardVisible(templateName);
  }

  async countTemplateCards(templateName: string): Promise<number> {
    return this.templateCatalog.countTemplateCards(templateName);
  }

  async verifyTemplateVisibleInListView(templateName: string): Promise<boolean> {
    return this.templateCatalog.verifyTemplateVisibleInListView(templateName);
  }

  async navigateToWizardHorizontalTab(
    ...args: Parameters<CreateVmWizardTabsComponent['navigateToWizardHorizontalTab']>
  ): ReturnType<CreateVmWizardTabsComponent['navigateToWizardHorizontalTab']> {
    return this.wizardTabs.navigateToWizardHorizontalTab(...args);
  }

  async navigateToWizardVerticalTab(
    ...args: Parameters<CreateVmWizardTabsComponent['navigateToWizardVerticalTab']>
  ): ReturnType<CreateVmWizardTabsComponent['navigateToWizardVerticalTab']> {
    return this.wizardTabs.navigateToWizardVerticalTab(...args);
  }

  async fillWizardOverview(
    ...args: Parameters<CreateVmWizardTabsComponent['fillWizardOverview']>
  ): ReturnType<CreateVmWizardTabsComponent['fillWizardOverview']> {
    return this.wizardTabs.fillWizardOverview(...args);
  }

  async clickCancelButton(): Promise<void> {
    return this.wizardTabs.clickCancelButton();
  }

  async fillWizardScheduling(
    ...args: Parameters<CreateVmWizardTabsComponent['fillWizardScheduling']>
  ): ReturnType<CreateVmWizardTabsComponent['fillWizardScheduling']> {
    return this.wizardTabs.fillWizardScheduling(...args);
  }

  async verifyNetworksTabNotFoundMessage(): Promise<boolean> {
    return this.wizardTabs.verifyNetworksTabNotFoundMessage();
  }

  async navigateToWizardScriptsTab(): Promise<void> {
    return this.wizardTabs.navigateToWizardScriptsTab();
  }

  async verifySSHKeyEditButtonVisible(): Promise<boolean> {
    return this.wizardTabs.verifySSHKeyEditButtonVisible();
  }

  async verifySSHKeyEditButtonDisabled(): Promise<boolean> {
    return this.wizardTabs.verifySSHKeyEditButtonDisabled();
  }

  async verifySysprepEditButtonVisible(): Promise<boolean> {
    return this.wizardTabs.verifySysprepEditButtonVisible();
  }

  async verifySysprepEditButtonEnabled(): Promise<boolean> {
    return this.wizardTabs.verifySysprepEditButtonEnabled();
  }

  async fillWizardMetadata(
    ...args: Parameters<CreateVmWizardTabsComponent['fillWizardMetadata']>
  ): ReturnType<CreateVmWizardTabsComponent['fillWizardMetadata']> {
    return this.wizardTabs.fillWizardMetadata(...args);
  }

  async fillWizardScripts(
    ...args: Parameters<CreateVmWizardTabsComponent['fillWizardScripts']>
  ): ReturnType<CreateVmWizardTabsComponent['fillWizardScripts']> {
    return this.wizardTabs.fillWizardScripts(...args);
  }

  async fillWizardSSH(secretName: string, sshKeyFilePath: string): Promise<void> {
    return this.wizardTabs.fillWizardSSH(secretName, sshKeyFilePath);
  }

  async addDiskInWizard(
    ...args: Parameters<CreateVmWizardTabsComponent['addDiskInWizard']>
  ): ReturnType<CreateVmWizardTabsComponent['addDiskInWizard']> {
    return this.wizardTabs.addDiskInWizard(...args);
  }

  async addDiskInSidebarWizard(
    ...args: Parameters<CreateVmWizardTabsComponent['addDiskInSidebarWizard']>
  ): ReturnType<CreateVmWizardTabsComponent['addDiskInSidebarWizard']> {
    return this.wizardTabs.addDiskInSidebarWizard(...args);
  }

  async clickWizardCreateButton() {
    return this.wizardTabs.clickWizardCreateButton();
  }

  async verifyInstanceTypeHelpText(): Promise<boolean> {
    return this.instanceType.verifyInstanceTypeHelpText();
  }

  async verifyVolumeNameInNameField(volumeName: string): Promise<boolean> {
    return this.instanceType.verifyVolumeNameInNameField(volumeName);
  }

  async markVolumeFavoriteWithUnfavorite(volumeName: string): Promise<boolean> {
    return this.instanceType.markVolumeFavoriteWithUnfavorite(volumeName);
  }

  async markVolumeFavorite(): Promise<boolean> {
    return this.instanceType.markVolumeFavorite();
  }

  async filterVolumeByOS(osName = 'Fedora'): Promise<boolean> {
    return this.instanceType.filterVolumeByOS(osName);
  }

  async filterVolumeByName(volumeName = 'fedora'): Promise<boolean> {
    return this.instanceType.filterVolumeByName(volumeName);
  }

  async selectBootableVolume(volumeName: string): Promise<boolean> {
    return this.instanceType.selectBootableVolume(volumeName);
  }

  async verifyInstanceTypeSeries(): Promise<boolean> {
    return this.instanceType.verifyInstanceTypeSeries();
  }

  async addVolumeViaUpload(
    ...args: Parameters<CreateVmInstanceTypesPage['addVolumeViaUpload']>
  ): ReturnType<CreateVmInstanceTypesPage['addVolumeViaUpload']> {
    return this.instanceType.addVolumeViaUpload(...args);
  }

  async addVolumeViaRegistry(
    ...args: Parameters<CreateVmInstanceTypesPage['addVolumeViaRegistry']>
  ): ReturnType<CreateVmInstanceTypesPage['addVolumeViaRegistry']> {
    return this.instanceType.addVolumeViaRegistry(...args);
  }

  async verifyVolumeExistsInList(volumeName: string): Promise<boolean> {
    return this.instanceType.verifyVolumeExistsInList(volumeName);
  }

  async getOperatingSystemText(): Promise<string> {
    return this.instanceType.getOperatingSystemText();
  }

  async verifyOperatingSystemText(expectedText: string): Promise<boolean> {
    return this.instanceType.verifyOperatingSystemText(expectedText);
  }

  async getInstanceTypeText(): Promise<string> {
    return this.instanceType.getInstanceTypeText();
  }

  async verifyInstanceTypeText(expectedText: string): Promise<boolean> {
    return this.instanceType.verifyInstanceTypeText(expectedText);
  }

  async clickViewYamlAndCli(): Promise<void> {
    return this.instanceType.clickViewYamlAndCli();
  }

  async clickCliTab(): Promise<void> {
    return this.instanceType.clickCliTab();
  }

  async verifyCliCommandContains(expectedText: string): Promise<boolean> {
    return this.instanceType.verifyCliCommandContains(expectedText);
  }

  async verifyCliCommandComponents(components: string[]): Promise<Record<string, boolean>> {
    return this.instanceType.verifyCliCommandComponents(components);
  }

  async verifyEmptyProjectState(): Promise<boolean> {
    return this.templateCatalog.verifyEmptyProjectState();
  }

  async clickViewAllProjectsButton(): Promise<void> {
    return this.templateCatalog.clickViewAllProjectsButton();
  }

  async verifyNoErrorBoundary(waitMs = 3000): Promise<boolean> {
    return this.templateCatalog.verifyNoErrorBoundary(waitMs);
  }

  async mockSecretsApiWith403(namespace?: string): Promise<void> {
    return this.instanceType.mockSecretsApiWith403(namespace);
  }

  async clearSecretsApiMock(namespace?: string): Promise<void> {
    return this.instanceType.clearSecretsApiMock(namespace);
  }

  async clickAddConfigMapSecretOrServiceAccount(): Promise<void> {
    return this.instanceType.clickAddConfigMapSecretOrServiceAccount();
  }

  async getEnvironmentResourceGroupTitles(): Promise<string[]> {
    return this.instanceType.getEnvironmentResourceGroupTitles();
  }

  async isEnvironmentEditorVisible(): Promise<boolean> {
    return this.instanceType.isEnvironmentEditorVisible();
  }

  async isEnvironmentErrorAlertVisible(waitMs = 3000): Promise<boolean> {
    return this.instanceType.isEnvironmentErrorAlertVisible(waitMs);
  }

  async isAddConfigMapButtonVisible(): Promise<boolean> {
    return this.instanceType.isAddConfigMapButtonVisible();
  }
}
