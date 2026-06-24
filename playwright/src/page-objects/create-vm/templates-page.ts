// TemplatesPage — Page object for templates interactions.

import { TemplateEditComponent } from '@/components/create-vm/template-components';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

import PageCommons from '../page-commons';

export default class TemplatesPage extends PageCommons {
  private readonly _columnsSaveButton = this.locator('[data-test="save-button"]');

  private readonly _edit: TemplateEditComponent;

  constructor(page: Page) {
    super(page);
    this._edit = new TemplateEditComponent(page);
  }

  async clickCreateTemplate() {
    return this._edit.clickCreateTemplate();
  }

  async setCreateTemplateExampleNameInYamlEditor(templateName: string): Promise<void> {
    return this._edit.setCreateTemplateExampleNameInYamlEditor(templateName);
  }

  override async clickCreateAndSelectOption(option: 'With form' | 'With YAML') {
    const optionSelectors = {
      'With form': 'button[role="menuitem"]:has-text("With form")',
      'With YAML': 'button[role="menuitem"]:has-text("With YAML")',
    };
    await super.clickCreateAndSelectOption('[data-test="item-create"]', optionSelectors[option]);
  }

  async clickCreateButtonInModal() {
    return this._edit.clickCreateButtonInModal();
  }

  async verifyTemplateCreationFromExample(expectedText: string): Promise<boolean> {
    return this._edit.verifyTemplateCreationFromExample(expectedText);
  }

  async verifyRedirectAfterTemplateCreation(): Promise<{ isValid: boolean; url: string }> {
    return this._edit.verifyRedirectAfterTemplateCreation();
  }

  async isCreateTemplateModalShowingClusterAndNamespaceOptions(): Promise<boolean> {
    return this._edit.isCreateTemplateModalShowingClusterAndNamespaceOptions();
  }

  async navigateToProjectTemplates(projectName: string) {
    await this.goTo(`/k8s/ns/${projectName}/template.openshift.io~v1~Template`);
  }

  async navigateToAllNamespacesTemplates() {
    await this.goTo('/k8s/all-namespaces/template.openshift.io~v1~Template');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async navigateToTemplatesViaUI(): Promise<void> {
    try {
      await this.navigation.clickNavTemplates();
    } catch {
      await this.navigateToAllNamespacesTemplates();
    }
  }

  async navigateToTemplatesViaTemplatesNavItem(): Promise<void> {
    await this.navigation.expandVirtualizationNavSection();
    const navItem = this.locator('[data-test-id="templates-nav-item"]');
    await navItem.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(navItem);
    await this.page.waitForLoadState('load', {
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
  }

  async navigateToNamespaceTemplatesViaUI(namespace: string): Promise<void> {
    try {
      await this.navigation.clickNavTemplates();
    } catch {
      await this.goTo(`/k8s/ns/${namespace}/template.openshift.io~v1~Template`);
      await this.page.waitForLoadState('domcontentloaded');
    }
    await this.projectDropdown.switchToNamespace(namespace);
  }

  async verifyClusterAndProjectFilterButtonsVisible(): Promise<boolean> {
    try {
      if (!(await this.filterToolbar.isFilterToolbarVisible())) {
        return false;
      }
      await this.locator('[data-test="filter-toolbar"] button', { hasText: 'Cluster' })
        .first()
        .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      await this.locator('[data-test="filter-toolbar"] button', { hasText: 'Project' })
        .first()
        .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      return true;
    } catch {
      return false;
    }
  }

  async openClusterFilter(): Promise<void> {
    await this.filterToolbar.openFilterButton('Cluster');
  }

  async selectClusterInFilterMenu(clusterName: string): Promise<void> {
    await this.filterToolbar.selectMenuItem(clusterName);
  }

  async openProjectFilter(): Promise<void> {
    await this.filterToolbar.openFilterButton('Project');
  }

  async selectNamespaceInFilterMenu(namespaceName: string): Promise<void> {
    await this.filterToolbar.selectMenuItem(namespaceName);
  }

  async waitForClusterFilterApplied(): Promise<void> {
    await this.filterToolbar.waitForFilterApplied();
  }

  async closeFilterLabelGroup(): Promise<void> {
    await this.filterToolbar.closeFilterChip();
  }

  async filterTemplatesByName(templateName: string) {
    const templateNameFilter = this.locator('[data-test="name-filter-input"]');
    await templateNameFilter.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await templateNameFilter.clear();
    await templateNameFilter.fill(templateName);
    await this.page.waitForTimeout(TestTimeouts.UI_FILTER_APPLY / 3);
    await this.page
      .waitForLoadState('domcontentloaded', { timeout: TestTimeouts.UI_ACTION_COMPLETE })
      .catch(() => {
        return;
      });
  }

  async clickCloneTemplate(templateName: string) {
    return this._edit.clickCloneTemplate(templateName);
  }

  async clickEditBootSourceReference(templateName: string) {
    return this._edit.clickEditBootSourceReference(templateName);
  }

  async editBootSourceForDisk(diskName: string) {
    return this._edit.editBootSourceForDisk(diskName);
  }

  async isDiskBootable(diskName: string): Promise<boolean> {
    return this._edit.isDiskBootable(diskName);
  }

  async cloneTemplate(name?: string, provider?: string, namespace?: string) {
    return this._edit.cloneTemplate(name, provider, namespace);
  }

  async isBaseTemplateVisible(templateName: string): Promise<boolean> {
    return this._edit.isBaseTemplateVisible(templateName);
  }

  async deleteTemplate() {
    return this._edit.deleteTemplate();
  }

  async waitForTemplateRowDetached(
    templateName: string,
    timeout: number = TestTimeouts.DEFAULT,
  ): Promise<void> {
    return this._edit.waitForTemplateRowDetached(templateName, timeout);
  }

  async hasBadgeInTemplateRow(templateName: string, badgeText: string): Promise<boolean> {
    return this._edit.hasBadgeInTemplateRow(templateName, badgeText);
  }

  async verifySourceAvailableTextDoesNotExist(): Promise<boolean> {
    return this._edit.verifySourceAvailableTextDoesNotExist();
  }

  async isEmptyMessageVisible(): Promise<boolean> {
    return this._edit.isEmptyMessageVisible();
  }

  async navigateToTemplateDetail(templateName: string) {
    return this._edit.navigateToTemplateDetail(templateName);
  }

  async verifyTemplateDetailsPage(): Promise<boolean> {
    return this._edit.verifyTemplateDetailsPage();
  }

  async verifyTemplateContains(expectedText: string): Promise<boolean> {
    return this._edit.verifyTemplateContains(expectedText);
  }

  async fillCloneTemplateModal(
    metadataName: string,
    displayName?: string,
    provider?: string,
    namespace?: string,
  ) {
    return this._edit.fillCloneTemplateModal(metadataName, displayName, provider, namespace);
  }

  async clickCloneModalCloneButton() {
    return this._edit.clickCloneModalCloneButton();
  }

  async selectPvcAsBootSource(projectName: string, pvcName: string) {
    return this._edit.selectPvcAsBootSource(projectName, pvcName);
  }

  async openFilterDropdown() {
    const dropdownMenu = this.locator('[data-test-row-filter]').first();
    const isVisible = await dropdownMenu
      .isVisible({ timeout: TestTimeouts.UI_STABILIZE })
      .catch(() => false);

    if (!isVisible) {
      await this.robustClick(
        this.locator('[data-test="filter-toolbar"] [data-test-id="filter-dropdown-toggle"]'),
      );
      await dropdownMenu.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    }
  }

  async filterByDefaultTemplates() {
    await this.openFilterDropdown();
    // CNV 4.99+: 'default' row filter is a radio INPUT directly (not a parent containing a checkbox).
    // Old: [data-test-row-filter="templates"] [type="checkbox"]
    // New: [data-test-row-filter="default"] (is the radio input itself)
    const newRadio = this.locator('input[data-test-row-filter="default"]');
    const oldCheckbox = this.locator('[data-test-row-filter="templates"] [type="checkbox"]');
    const isNewVisible = await newRadio
      .isVisible({ timeout: TestTimeouts.UI_STABILIZE })
      .catch(() => false);
    if (isNewVisible) {
      const isChecked = await newRadio.isChecked().catch(() => false);
      if (!isChecked) {
        await newRadio.click({ force: true });
      }
      return;
    }
    const isOldVisible = await oldCheckbox
      .isVisible({ timeout: TestTimeouts.UI_STABILIZE })
      .catch(() => false);
    if (!isOldVisible) {
      await this.openFilterDropdown();
    }
    await oldCheckbox.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    const isChecked = await oldCheckbox.isChecked();
    if (!isChecked) {
      await oldCheckbox.click({ force: true });
    }
  }

  async filterByOS(os: 'centos' | 'fedora' | 'rhel' | 'windows') {
    await this.openFilterDropdown();
    const filterCheckbox = this.locator(`[data-test-row-filter="${os}"] [type="checkbox"]`).first();
    const isVisible = await filterCheckbox
      .isVisible({ timeout: TestTimeouts.UI_STABILIZE })
      .catch(() => false);
    if (!isVisible) {
      await this.openFilterDropdown();
    }
    await filterCheckbox.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    const isChecked = await filterCheckbox.isChecked();
    if (!isChecked) {
      await filterCheckbox.click({ force: true });
    }
  }

  async filterByProvider(provider: string) {
    await this.openFilterDropdown();
    const filterCheckbox = this.locator(
      `[data-test-row-filter="${provider}"] [type="checkbox"]`,
    ).first();
    const isVisible = await filterCheckbox
      .isVisible({ timeout: TestTimeouts.UI_STABILIZE })
      .catch(() => false);
    if (!isVisible) {
      await this.openFilterDropdown();
    }
    await filterCheckbox.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    const isChecked = await filterCheckbox.isChecked();
    if (!isChecked) {
      await filterCheckbox.click({ force: true });
    }
  }

  async filterByType(type: 'templates' | 'vm-templates') {
    await this.openFilterDropdown();
    const filterCheckbox = this.locator(
      `[data-test-row-filter="${type}"] [type="checkbox"]`,
    ).first();
    const isVisible = await filterCheckbox
      .isVisible({ timeout: TestTimeouts.UI_STABILIZE })
      .catch(() => false);
    if (!isVisible) {
      await this.openFilterDropdown();
    }
    await filterCheckbox.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    const isChecked = await filterCheckbox.isChecked();
    if (!isChecked) {
      await filterCheckbox.click({ force: true });
    }
  }

  async isTemplateVisible(templateMetadataName: string): Promise<boolean> {
    const templateLocator = this.locator(`[data-test-id="${templateMetadataName}"]`);
    try {
      await templateLocator.waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_MEDIUM });
      return true;
    } catch {
      return false;
    }
  }

  async isTemplateHidden(templateMetadataName: string): Promise<boolean> {
    const templateLocator = this.locator(`[data-test-id="${templateMetadataName}"]`);
    try {
      await templateLocator.waitFor({ state: 'hidden', timeout: TestTimeouts.UI_DELAY_MEDIUM });
      return true;
    } catch {
      return false;
    }
  }

  async isSourceAvailableLabelAbsent(): Promise<boolean> {
    const label = this.page.getByText('Source available').first();
    const visible = await label
      .isVisible({ timeout: TestTimeouts.UI_STABILIZE })
      .catch(() => false);
    return !visible;
  }

  async isTemplateNameLinkVisible(templateMetadataName: string): Promise<boolean> {
    const templateLocator = this.locator(`[data-test-id="${templateMetadataName}-name"]`);
    await templateLocator
      .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
      .catch(() => {
        return;
      });
    return await templateLocator.isVisible().catch(() => false);
  }

  async resetColumns() {
    const columnManagementButton = this.locator('[data-test="manage-columns"]');
    await columnManagementButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);
    await this.robustClick(columnManagementButton);
    const resetColumnsButton = this.locator('[data-test="reset-button"]');
    await resetColumnsButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(resetColumnsButton);
    await this.robustClick(this._columnsSaveButton);
  }

  async isColumnEnabled(
    columnName: 'architecture' | 'cpu' | 'namespace' | 'workload',
  ): Promise<boolean> {
    const columnManagementButton = this.locator('[data-test="manage-columns"]');
    await columnManagementButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(columnManagementButton);
    const idMap: Record<string, string> = {
      namespace: '#data-list-namespace',
      workload: '#data-list-workload',
      architecture: '#data-list-architecture',
      cpu: '#data-list-cpu',
    };
    const checkbox = this.locator(idMap[columnName]);
    await checkbox.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    const checked = await checkbox.isChecked();
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    return checked;
  }

  async toggleColumn(columnName: 'architecture' | 'cpu' | 'namespace' | 'workload') {
    await this.toggleColumns([columnName]);
  }

  async toggleColumns(columnNames: Array<'architecture' | 'cpu' | 'namespace' | 'workload'>) {
    const columnManagementButton = this.locator('[data-test="manage-columns"]');
    await columnManagementButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(columnManagementButton);

    const dialogModal = this.locator('[data-test="dialog-modal"]');
    await dialogModal.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });

    const checkboxId: Record<string, string> = {
      namespace: '#data-list-namespace',
      workload: '#data-list-workload',
      architecture: '#data-list-architecture',
      cpu: '#data-list-cpu',
    };

    for (const columnName of columnNames) {
      const checkbox = dialogModal.locator(checkboxId[columnName]);
      await checkbox.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      await checkbox.click({ force: true });
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    }

    await this.robustClick(this._columnsSaveButton);
    await this._columnsSaveButton
      .waitFor({ state: 'hidden', timeout: TestTimeouts.SHORT_WAIT })
      .catch(() => {});
  }

  async waitForTableHeaderState(
    headerLabel: 'Architecture' | 'CPU | Memory' | 'Namespace' | 'Workload profile',
    shouldExist: boolean,
    timeout = TestTimeouts.SHORT_WAIT,
  ): Promise<boolean> {
    const header = this.page.locator('table.kubevirt-table th', { hasText: headerLabel }).first();
    try {
      await header.waitFor({ state: shouldExist ? 'visible' : 'hidden', timeout });
      return true;
    } catch {
      return false;
    }
  }

  async verifyTableHeaderExists(
    headerLabel: 'Architecture' | 'CPU | Memory' | 'Namespace' | 'Workload profile',
    shouldExist: boolean,
  ): Promise<boolean> {
    return this.waitForTableHeaderState(headerLabel, shouldExist);
  }

  override async verifyPageLoaded(
    templateNameOrIndicators?: string | string[],
    includeCreateButton?: boolean,
    timeout?: number,
  ): Promise<boolean> {
    if (typeof templateNameOrIndicators === 'string') {
      const templateName = templateNameOrIndicators;
      await this.page.waitForLoadState('domcontentloaded');
      await this.page.waitForTimeout(TestTimeouts.UI_STABILIZE);

      const templateNameLocator = this.locator(`[data-test-id="${templateName}"]`);
      try {
        await templateNameLocator.waitFor({
          state: 'visible',
          timeout: timeout || TestTimeouts.DEFAULT,
        });
        return await templateNameLocator.isVisible().catch(() => false);
      } catch {
        return false;
      }
    }
    const indicators = Array.isArray(templateNameOrIndicators)
      ? templateNameOrIndicators
      : ['[data-test-id="template-name"]'];
    return await super.verifyPageLoaded(indicators, includeCreateButton, timeout);
  }

  async expectCloneModalVisible(): Promise<void> {
    await this.locator('[data-test="dialog-modal"]').waitFor({
      state: 'visible',
      timeout: TestTimeouts.NAVIGATION,
    });
  }

  async closeCloneModal(): Promise<void> {
    await this.robustClick(this.locator('[data-test="cancel-button"]'));
  }

  async isCloneModalSourceTemplateProjectVisible(): Promise<boolean> {
    return this.page
      .getByText('Source template project')
      .isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM })
      .catch(() => false);
  }

  async getCloneModalSourceTemplateText(): Promise<string> {
    const el = this.locator('[data-test-id="source-template"]');
    await el.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    return (await el.textContent()) ?? '';
  }

  async isCloneModalSourceTemplateDisabled(): Promise<boolean> {
    const el = this.locator('[data-test-id="source-template"]');
    return el.isDisabled();
  }

  async isCloneModalSaveButtonEnabled(): Promise<boolean> {
    const el = this.locator('[data-test="save-button"]');
    await el.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    return el.isEnabled();
  }

  async expectNavigatedToVirtualMachines(): Promise<void> {
    await this.page.waitForURL(/VirtualMachine/, { timeout: TestTimeouts.NAVIGATION });
  }

  async selectCreateOption(optionName: string): Promise<void> {
    await this.clickCreate();
    await this.page.getByRole('menuitem', { name: optionName }).click();
  }

  async openRowMenu(rowText: string): Promise<void> {
    const row = this.page.getByRole('row').filter({ hasText: rowText });
    const kebab = row
      .locator('[data-test="actions-dropdown"]')
      .getByRole('button')
      .or(row.getByRole('button', { name: 'Actions' }))
      .first();
    await kebab.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(kebab);
  }

  async selectKebabAction(actionName: string): Promise<void> {
    await this.page.getByRole('menuitem', { name: actionName }).click();
  }

  async waitForListLoaded(): Promise<void> {
    const dataRow = this.page.getByRole('row').nth(1);
    const emptyState = this.locator('.pf-v6-c-empty-state');
    await Promise.any([
      dataRow.waitFor({ state: 'visible', timeout: TestTimeouts.NAVIGATION }),
      emptyState.waitFor({ state: 'visible', timeout: TestTimeouts.NAVIGATION }),
    ]);
  }

  async expectCreateYAMLPageLoaded(): Promise<void> {
    await this.page.waitForURL(/\/~new$/, { timeout: TestTimeouts.NAVIGATION });
    await this.page
      .getByText('name: example')
      .waitFor({ state: 'visible', timeout: TestTimeouts.NAVIGATION });
  }

  override async clickTemplateByTestId(templateName: string) {
    const templateLink = this.locator(`[data-test-id="${templateName}"]`);

    const loadingSpinner = this.locator('.pf-v6-c-spinner, .pf-c-spinner, [data-test="loading"]');
    await loadingSpinner
      .waitFor({ state: 'hidden', timeout: TestTimeouts.UI_DELAY_MEDIUM })
      .catch(() => {
        return;
      });

    await templateLink.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });

    const urlBefore = this.page.url();
    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      await this.page.waitForTimeout(TestTimeouts.UI_ANIMATION_DELAY);

      try {
        await templateLink.click({ timeout: TestTimeouts.UI_DELAY_MEDIUM });
      } catch {
        await templateLink.dispatchEvent('click');
      }

      try {
        await this.page.waitForURL((url) => url.href !== urlBefore, { timeout: 8000 });
        await this.page.waitForLoadState('domcontentloaded');
        return;
      } catch {
        if (attempt < maxAttempts) {
          await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
        }
      }
    }

    await this.robustClick(templateLink);
  }

  async isActionMenuItemVisible(actionText: string): Promise<boolean> {
    const item = this.locator('[data-test="actions-menu"] li', { hasText: actionText });
    return (
      (await item.count()) > 0 &&
      (await item
        .first()
        .isVisible()
        .catch(() => false))
    );
  }
}
