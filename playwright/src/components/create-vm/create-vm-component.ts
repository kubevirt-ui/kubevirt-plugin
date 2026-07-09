import { CreateVmInstanceTypesComponent } from '@/components/create-vm/bootable-volumes-actions-instance-components';
import { CreateVmTemplateCatalogComponent } from '@/components/create-vm/catalog-template-components';
import { CreateVmWizardTabsComponent } from '@/components/create-vm/catalog-wizard-tabs-components';
import BaseComponent from '@/components/shared/base-component';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

export default class CreateVmComponent extends BaseComponent {
  readonly instanceType: CreateVmInstanceTypesComponent;
  readonly templateCatalog: CreateVmTemplateCatalogComponent;
  readonly wizardTabs: CreateVmWizardTabsComponent;

  constructor(page: Page) {
    super(page);
    this.templateCatalog = new CreateVmTemplateCatalogComponent(page);
    this.instanceType = new CreateVmInstanceTypesComponent(page);
    this.wizardTabs = new CreateVmWizardTabsComponent(page);
  }

  private async clickDocumentationLinkAndVerifyUrl(
    expectedUrl: string,
    expectedHashFragment: string,
    closeTab = true,
  ): Promise<string> {
    const newPagePromise = this.page.context().waitForEvent('page');

    const link = this.locator(`a[href="${expectedUrl}"]`);
    await link.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(link);

    const newPage = await newPagePromise;

    await newPage.waitForLoadState('networkidle');

    const mainContent = newPage.locator('main, [role="main"], .main-content, nav, header');
    await mainContent
      .first()
      .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });

    const newTabUrl = newPage.url();

    if (!newTabUrl.includes(expectedHashFragment)) {
      throw new Error(`Expected URL to contain ${expectedHashFragment} but got ${newTabUrl}`);
    }

    if (closeTab) {
      await newPage.close();
    }

    return newTabUrl;
  }

  async addDiskInSidebarWizard(
    ...args: Parameters<CreateVmWizardTabsComponent['addDiskInSidebarWizard']>
  ): ReturnType<CreateVmWizardTabsComponent['addDiskInSidebarWizard']> {
    return this.wizardTabs.addDiskInSidebarWizard(...args);
  }

  async addDiskInWizard(
    ...args: Parameters<CreateVmWizardTabsComponent['addDiskInWizard']>
  ): ReturnType<CreateVmWizardTabsComponent['addDiskInWizard']> {
    return this.wizardTabs.addDiskInWizard(...args);
  }

  async addVolumeViaRegistry(
    ...args: Parameters<CreateVmInstanceTypesComponent['addVolumeViaRegistry']>
  ): ReturnType<CreateVmInstanceTypesComponent['addVolumeViaRegistry']> {
    return this.instanceType.addVolumeViaRegistry(...args);
  }

  async addVolumeViaUpload(
    ...args: Parameters<CreateVmInstanceTypesComponent['addVolumeViaUpload']>
  ): ReturnType<CreateVmInstanceTypesComponent['addVolumeViaUpload']> {
    return this.instanceType.addVolumeViaUpload(...args);
  }

  async clearSecretsApiMock(namespace?: string): Promise<void> {
    return this.instanceType.clearSecretsApiMock(namespace);
  }

  async clickAddConfigMapSecretOrServiceAccount(): Promise<void> {
    return this.instanceType.clickAddConfigMapSecretOrServiceAccount();
  }

  async clickAddVolumeButton() {
    return this.instanceType.clickAddVolumeButton();
  }

  async clickAllTemplatesButton() {
    return this.templateCatalog.clickAllTemplatesButton();
  }

  async clickCancelButton(): Promise<void> {
    return this.wizardTabs.clickCancelButton();
  }

  async clickCliTab(): Promise<void> {
    return this.instanceType.clickCliTab();
  }

  async clickCreateVirtualMachine() {
    return this.instanceType.clickCreateVirtualMachine();
  }

  async clickCustomizeVirtualMachineButton() {
    return this.templateCatalog.clickCustomizeVirtualMachineButton();
  }

  async clickCustomizeVirtualMachineFooterButton() {
    return this.templateCatalog.clickCustomizeVirtualMachineFooterButton();
  }

  async clickCustomizeVmButton() {
    return this.templateCatalog.clickCustomizeVmButton();
  }

  async clickHugepages() {
    return this.instanceType.clickHugepages();
  }

  async clickInstanceSize(sizeOption: string) {
    return this.instanceType.clickInstanceSize(sizeOption);
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

  async clickQuickCreateVmButton() {
    return this.templateCatalog.clickQuickCreateVmButton();
  }

  async clickSeriesDropdown(seriesName: string) {
    return this.instanceType.clickSeriesDropdown(seriesName);
  }

  async clickStartAfterCreationCheckbox() {
    return this.templateCatalog.clickStartAfterCreationCheckbox();
  }

  async clickTemplateByMetadataName(templateMetadataName: string) {
    return this.templateCatalog.clickTemplateByMetadataName(templateMetadataName);
  }

  async clickTemplatesTab() {
    return this.templateCatalog.clickTemplatesTab();
  }

  async clickUserProvidedTab() {
    return this.templateCatalog.clickUserProvidedTab();
  }

  async clickUserTemplatesTab() {
    return this.templateCatalog.clickUserTemplatesTab();
  }

  async clickViewAllProjectsButton(): Promise<void> {
    return this.templateCatalog.clickViewAllProjectsButton();
  }

  async clickViewYamlAndCli(): Promise<void> {
    return this.instanceType.clickViewYamlAndCli();
  }

  async clickWizardCreateButton() {
    return this.wizardTabs.clickWizardCreateButton();
  }

  async configureTlsCertificate(
    ...args: Parameters<CreateVmTemplateCatalogComponent['configureTlsCertificate']>
  ): ReturnType<CreateVmTemplateCatalogComponent['configureTlsCertificate']> {
    return this.templateCatalog.configureTlsCertificate(...args);
  }

  async countTemplateCards(templateName: string): Promise<number> {
    return this.templateCatalog.countTemplateCards(templateName);
  }

  async fillReviewAndCreateVmName(vmName: string) {
    return this.templateCatalog.fillReviewAndCreateVmName(vmName);
  }

  async fillTemplateCatalogVmName(vmName: string) {
    return this.templateCatalog.fillTemplateCatalogVmName(vmName);
  }

  async fillVmName(vmName: string) {
    return this.instanceType.fillVmName(vmName);
  }

  async fillWizardMetadata(
    ...args: Parameters<CreateVmWizardTabsComponent['fillWizardMetadata']>
  ): ReturnType<CreateVmWizardTabsComponent['fillWizardMetadata']> {
    return this.wizardTabs.fillWizardMetadata(...args);
  }

  async fillWizardOverview(
    ...args: Parameters<CreateVmWizardTabsComponent['fillWizardOverview']>
  ): ReturnType<CreateVmWizardTabsComponent['fillWizardOverview']> {
    return this.wizardTabs.fillWizardOverview(...args);
  }

  async fillWizardScheduling(
    ...args: Parameters<CreateVmWizardTabsComponent['fillWizardScheduling']>
  ): ReturnType<CreateVmWizardTabsComponent['fillWizardScheduling']> {
    return this.wizardTabs.fillWizardScheduling(...args);
  }

  async fillWizardScripts(
    ...args: Parameters<CreateVmWizardTabsComponent['fillWizardScripts']>
  ): ReturnType<CreateVmWizardTabsComponent['fillWizardScripts']> {
    return this.wizardTabs.fillWizardScripts(...args);
  }

  async fillWizardSSH(secretName: string, sshKeyFilePath: string): Promise<void> {
    return this.wizardTabs.fillWizardSSH(secretName, sshKeyFilePath);
  }

  async filterByBootSourceAvailable(check = true): Promise<void> {
    return this.templateCatalog.filterByBootSourceAvailable(check);
  }

  async filterByOSName(
    osName: 'RHEL' | 'Windows' | 'Fedora' | 'CentOS',
    check = true,
  ): Promise<void> {
    return this.templateCatalog.filterByOSName(osName, check);
  }

  async filterByProvider(provider: 'Red Hat' | 'Other', check = true): Promise<void> {
    return this.templateCatalog.filterByProvider(provider, check);
  }

  async filterByWorkload(workload: 'Desktop' | 'Server', check = true): Promise<void> {
    return this.templateCatalog.filterByWorkload(workload, check);
  }

  async filterVolumeByName(volumeName = 'fedora'): Promise<boolean> {
    return this.instanceType.filterVolumeByName(volumeName);
  }

  async filterVolumeByOS(osName = 'Fedora'): Promise<boolean> {
    return this.instanceType.filterVolumeByOS(osName);
  }

  async getEnvironmentResourceGroupTitles(): Promise<string[]> {
    return this.instanceType.getEnvironmentResourceGroupTitles();
  }

  async getInstanceTypeText(): Promise<string> {
    return this.instanceType.getInstanceTypeText();
  }

  async getOperatingSystemText(): Promise<string> {
    return this.instanceType.getOperatingSystemText();
  }

  async isAddConfigMapButtonVisible(): Promise<boolean> {
    return this.instanceType.isAddConfigMapButtonVisible();
  }

  async isBootableVolumesSectionVisible(): Promise<boolean> {
    return this.instanceType.isBootableVolumesSectionVisible();
  }

  async isCreateVmFromCatalogAvailable(): Promise<boolean> {
    return this.templateCatalog.isCreateVmFromCatalogAvailable();
  }

  async isEnvironmentEditorVisible(): Promise<boolean> {
    return this.instanceType.isEnvironmentEditorVisible();
  }

  async isEnvironmentErrorAlertVisible(waitMs = 3000): Promise<boolean> {
    return this.instanceType.isEnvironmentErrorAlertVisible(waitMs);
  }

  async isInstanceTypesSectionVisible(): Promise<boolean> {
    return this.instanceType.isInstanceTypesSectionVisible();
  }

  async isTemplateCatalogSectionVisible(): Promise<boolean> {
    return this.templateCatalog.isTemplateCatalogSectionVisible();
  }

  async isTlsCertificateCheckboxVisible(timeout?: number): Promise<boolean> {
    return this.templateCatalog.isTlsCertificateCheckboxVisible(timeout);
  }

  async isTlsCertificateChecked(): Promise<boolean> {
    return this.templateCatalog.isTlsCertificateChecked();
  }

  async markVolumeFavorite(): Promise<boolean> {
    return this.instanceType.markVolumeFavorite();
  }

  async markVolumeFavoriteWithUnfavorite(volumeName: string): Promise<boolean> {
    return this.instanceType.markVolumeFavoriteWithUnfavorite(volumeName);
  }

  async mockSecretsApiWith403(namespace?: string): Promise<void> {
    return this.instanceType.mockSecretsApiWith403(namespace);
  }

  async navigateToCatalogViaUI(): Promise<void> {
    return this.templateCatalog.navigateToCatalogViaUI();
  }

  async navigateToInstanceTypeCatalogViaVmList(namespace?: string): Promise<void> {
    return this.instanceType.navigateToInstanceTypeCatalogViaVmList(namespace);
  }

  /**
   * @deprecated Use {@link navigateToWizardTemplateCatalog} on 4.22+.
   */
  async navigateToNamespaceCatalogViaUI(namespace?: string): Promise<void> {
    return this.templateCatalog.navigateToNamespaceCatalogViaUI(namespace);
  }

  async navigateToProjectCatalog(projectName: string) {
    return this.templateCatalog.navigateToProjectCatalog(projectName);
  }

  /**
   * @deprecated Use {@link navigateToWizardTemplateCatalog} on 4.22+.
   */
  async navigateToTemplateCatalogViaVmList(namespace?: string): Promise<void> {
    return this.templateCatalog.navigateToTemplateCatalogViaVmList(namespace);
  }

  async navigateToWizardHorizontalTab(
    ...args: Parameters<CreateVmWizardTabsComponent['navigateToWizardHorizontalTab']>
  ): ReturnType<CreateVmWizardTabsComponent['navigateToWizardHorizontalTab']> {
    return this.wizardTabs.navigateToWizardHorizontalTab(...args);
  }

  async navigateToWizardScriptsTab(): Promise<void> {
    return this.wizardTabs.navigateToWizardScriptsTab();
  }

  async navigateToWizardVerticalTab(
    ...args: Parameters<CreateVmWizardTabsComponent['navigateToWizardVerticalTab']>
  ): ReturnType<CreateVmWizardTabsComponent['navigateToWizardVerticalTab']> {
    return this.wizardTabs.navigateToWizardVerticalTab(...args);
  }

  async searchTemplate(templateName: string) {
    return this.templateCatalog.searchTemplate(templateName);
  }

  async selectBootableVolume(volumeName: string): Promise<boolean> {
    return this.instanceType.selectBootableVolume(volumeName);
  }

  async selectBootSource(
    ...args: Parameters<CreateVmTemplateCatalogComponent['selectBootSource']>
  ): ReturnType<CreateVmTemplateCatalogComponent['selectBootSource']> {
    return this.templateCatalog.selectBootSource(...args);
  }

  async selectDiskSource(
    ...args: Parameters<CreateVmTemplateCatalogComponent['selectDiskSource']>
  ): ReturnType<CreateVmTemplateCatalogComponent['selectDiskSource']> {
    return this.templateCatalog.selectDiskSource(...args);
  }

  async selectFolderForInstanceType(folderName: string) {
    return this.instanceType.selectFolderForInstanceType(folderName);
  }

  async selectFolderForTemplate(folderName: string, createNew = true) {
    return this.templateCatalog.selectFolderForTemplate(folderName, createNew);
  }

  async selectNamespaceInProjectDropdown(namespace: string): Promise<void> {
    return this.templateCatalog.selectNamespaceInProjectDropdown(namespace);
  }

  async selectProjectFromCatalog(projectName: string) {
    return this.templateCatalog.selectProjectFromCatalog(projectName);
  }

  async setStartAfterCreationInstanceType(enabled: boolean): Promise<void> {
    return this.instanceType.setStartAfterCreationInstanceType(enabled);
  }

  async setWindowsDrivers(mount = true) {
    return this.templateCatalog.setWindowsDrivers(mount);
  }

  async switchView(view: 'grid' | 'list') {
    return this.templateCatalog.switchView(view);
  }

  async uncheckStartAfterCreationCheckbox() {
    return this.templateCatalog.uncheckStartAfterCreationCheckbox();
  }

  async verifyArchitectureFilterExists(): Promise<boolean> {
    return this.templateCatalog.verifyArchitectureFilterExists();
  }

  async verifyCliCommandComponents(components: string[]): Promise<Record<string, boolean>> {
    return this.instanceType.verifyCliCommandComponents(components);
  }

  async verifyCliCommandContains(expectedText: string): Promise<boolean> {
    return this.instanceType.verifyCliCommandContains(expectedText);
  }

  async verifyEmptyProjectState(): Promise<boolean> {
    return this.templateCatalog.verifyEmptyProjectState();
  }

  async verifyInstanceTypeHelpText(): Promise<boolean> {
    return this.instanceType.verifyInstanceTypeHelpText();
  }

  async verifyInstanceTypeSeries(): Promise<boolean> {
    return this.instanceType.verifyInstanceTypeSeries();
  }

  async verifyInstanceTypeText(expectedText: string): Promise<boolean> {
    return this.instanceType.verifyInstanceTypeText(expectedText);
  }

  async verifyNetworksTabNotFoundMessage(): Promise<boolean> {
    return this.wizardTabs.verifyNetworksTabNotFoundMessage();
  }

  async verifyNoErrorBoundary(waitMs = 3000): Promise<boolean> {
    return this.templateCatalog.verifyNoErrorBoundary(waitMs);
  }

  async verifyOperatingSystemText(expectedText: string): Promise<boolean> {
    return this.instanceType.verifyOperatingSystemText(expectedText);
  }

  async verifySSHKeyEditButtonDisabled(): Promise<boolean> {
    return this.wizardTabs.verifySSHKeyEditButtonDisabled();
  }

  async verifySSHKeyEditButtonVisible(): Promise<boolean> {
    return this.wizardTabs.verifySSHKeyEditButtonVisible();
  }

  async verifySysprepEditButtonEnabled(): Promise<boolean> {
    return this.wizardTabs.verifySysprepEditButtonEnabled();
  }

  async verifySysprepEditButtonVisible(): Promise<boolean> {
    return this.wizardTabs.verifySysprepEditButtonVisible();
  }

  async verifyTemplateCardVisible(templateName: string): Promise<boolean> {
    return this.templateCatalog.verifyTemplateCardVisible(templateName);
  }

  async verifyTemplateVisibleInListView(templateName: string): Promise<boolean> {
    return this.templateCatalog.verifyTemplateVisibleInListView(templateName);
  }

  async verifyVolumeExistsInList(volumeName: string): Promise<boolean> {
    return this.instanceType.verifyVolumeExistsInList(volumeName);
  }

  async verifyVolumeNameInNameField(volumeName: string): Promise<boolean> {
    return this.instanceType.verifyVolumeNameInNameField(volumeName);
  }

  async verifyWindowsDriversCheckbox(shouldBeChecked: boolean): Promise<boolean> {
    return this.templateCatalog.verifyWindowsDriversCheckbox(shouldBeChecked);
  }

  override async waitForTemplateForm() {
    return this.templateCatalog.waitForTemplateForm();
  }
}
