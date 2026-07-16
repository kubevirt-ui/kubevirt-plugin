/**
 * Page object for the Templates list page.
 */

import { TestTimeouts } from '@/utils/test-config';
import type { Locator, Page } from '@playwright/test';

import PageCommons from '../page-commons';

export default class TemplatesPage extends PageCommons {
  private readonly _btnPlaceholderSelectProject = this.locator(
    'button[placeholder="Select project"]',
  );
  private readonly _closeFilterLabelGroup = this.locator(
    '[aria-label="Close label group"]',
  ).first();
  private readonly _columnsSaveButton = this.locator('[data-test="save-button"]');
  private readonly _filterToolbarClusterButton = this.locator(
    '[data-test="filter-toolbar"] button.pf-v6-c-menu-toggle',
  )
    .filter({ hasText: 'Cluster' })
    .first();
  private readonly _filterToolbarProjectButton = this.locator(
    '[data-test="filter-toolbar"] button.pf-v6-c-menu-toggle',
  )
    .filter({ hasText: 'Project' })
    .first();
  private readonly _footerSaveButton = this.locator('footer [data-test="save-button"]');

  private readonly _inputSearchInput = this.locator('input[aria-label="Search input"]');
  private readonly _provider = this.locator('#provider');
  private readonly _roleMenuitem = this.locator('[role="menuitem"]');
  private readonly _templateActionsDropdown = this.locator('[data-test="actions-dropdown"]');
  private readonly _tr = this.locator('tr');

  constructor(page: Page) {
    super(page);
  }

  private getTemplateActionsButton(templateName: string): Locator {
    const row = this.getTemplateRow(templateName);
    return row.locator('[data-test="actions-dropdown"] button').first();
  }

  private getTemplateRow(templateName: string): Locator {
    return this.locator('tbody tr').filter({ hasText: templateName });
  }

  async areAllCreateOptionsVisibleAndEnabled(): Promise<boolean> {
    const createTemplateButton = this.locator('[data-test="item-create"]');
    await createTemplateButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(createTemplateButton);

    const options = ['From an existing template', 'From a virtual machine', 'With YAML'];
    try {
      for (const option of options) {
        const menuItem = this.page.getByRole('menuitem', { name: option });
        const isVisible = await menuItem
          .isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM })
          .catch(() => false);
        if (!isVisible) return false;

        const isDisabled = await menuItem.getAttribute('aria-disabled');
        if (isDisabled === 'true') return false;
      }
      return true;
    } finally {
      await this.page.keyboard.press('Escape');
    }
  }

  async clickCloneModalCloneButton() {
    await this.robustClick(this.locator('button:has-text("Clone")'));
  }

  async clickCloneTemplate(templateName: string) {
    const actionsButton = this.getTemplateActionsButton(templateName);
    await this.robustClick(actionsButton);
    await this.robustClick(this.page.getByRole('menuitem', { name: 'Clone' }));
  }

  async clickCreateButtonInModal() {
    const createButton = this.locator('[data-test="save-changes"], button:has-text("Create")');
    await createButton.first().waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_LONG });
    await this.robustClick(createButton.first());
    await this.page.waitForTimeout(TestTimeouts.RETRY_DELAY);
  }

  async clickCreateTemplate() {
    const createTemplateButton = this.locator('[data-test="item-create"]');
    await createTemplateButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(createTemplateButton);

    const yamlOption = this.page.getByRole('menuitem', { name: 'With YAML' });
    const hasDropdown = await yamlOption
      .isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM })
      .catch(() => false);
    if (hasDropdown) {
      await this.robustClick(yamlOption);
    }
  }

  async clickCreateTemplateOption(
    option: 'From an existing template' | 'From a virtual machine' | 'With YAML',
  ): Promise<void> {
    const createTemplateButton = this.locator('[data-test="item-create"]');
    await createTemplateButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(createTemplateButton);

    const menuItem = this.page.getByRole('menuitem', { name: option });
    await menuItem.waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_MEDIUM });
    await this.robustClick(menuItem);
  }

  async clickEditBootSourceReference(templateName: string) {
    const actionsButton = this.getTemplateActionsButton(templateName);
    await this.robustClick(actionsButton);
    await this.robustClick(this.locator('button:has-text("Edit boot source reference")'));
  }

  async clickFooterSaveButton() {
    await this.robustClick(this._footerSaveButton);
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

  /**
   * Clone a template via "Create → From an existing template" modal.
   * Opens the modal, selects the source template, fills target fields, and submits.
   */
  async cloneTemplateFromExisting(opts: {
    sourceTemplateName: string;
    newTemplateName: string;
    sourceProject?: string;
    targetProject?: string;
    displayName?: string;
    provider?: string;
  }): Promise<void> {
    await this.clickCreateTemplateOption('From an existing template');

    const dialog = this.page.getByRole('dialog');
    await dialog.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });

    if (opts.sourceProject) {
      const sourceProjectBtn = dialog
        .locator('button')
        .filter({ hasText: /Source template project/ });
      if (await sourceProjectBtn.count()) {
        await this.robustClick(
          dialog
            .locator('button')
            .filter({ hasText: /Project/ })
            .first(),
        );
        const searchInput = dialog.locator('[role="listbox"]').locator('input[type="text"]');
        if (
          await searchInput.isVisible({ timeout: TestTimeouts.UI_DELAY_SHORT }).catch(() => false)
        ) {
          await searchInput.fill(opts.sourceProject);
        }
        await this.robustClick(
          dialog.locator(`[role="option"]`).filter({ hasText: opts.sourceProject }),
        );
      }
    }

    const templateDropdown = dialog.locator('button').filter({ hasText: 'Select a template' });
    await this.robustClick(templateDropdown);
    await this.robustClick(
      dialog.locator('[role="option"]').filter({ hasText: opts.sourceTemplateName }),
    );

    const nameInput = dialog.locator('#templateName');
    await nameInput.clear();
    await nameInput.fill(opts.newTemplateName);

    if (opts.targetProject) {
      const projectBtn = dialog.locator('button').filter({ hasText: 'Select project' });
      await this.robustClick(projectBtn);
      const searchInput = dialog.locator('[role="listbox"]').locator('input[type="text"]');
      if (
        await searchInput.isVisible({ timeout: TestTimeouts.UI_DELAY_SHORT }).catch(() => false)
      ) {
        await searchInput.fill(opts.targetProject);
      }
      await this.robustClick(
        dialog.locator('[role="option"]').filter({ hasText: opts.targetProject }),
      );
    }

    if (opts.displayName) {
      const displayInput = dialog.locator('#templateDisplayName');
      await displayInput.clear();
      await displayInput.fill(opts.displayName);
    }

    if (opts.provider) {
      const providerInput = dialog.locator('#templateProvider');
      await providerInput.clear();
      await providerInput.fill(opts.provider);
    }

    const cloneBtn = dialog.locator('footer button').filter({ hasText: 'Clone' });
    await this.robustClick(cloneBtn);
  }

  async closeDialog(): Promise<void> {
    await this.page.keyboard.press('Escape');
  }

  async closeFilterLabelGroup(): Promise<void> {
    await this._closeFilterLabelGroup.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(this._closeFilterLabelGroup);
  }

  async deleteTemplate() {
    await this.robustClick(this._templateActionsDropdown);
    await this.robustClick(this.page.getByRole('menuitem', { name: 'Delete' }));
    await this.robustClick(this._footerSaveButton);
  }

  async deleteTemplateFromList(templateName: string) {
    const actionsButton = this.getTemplateActionsButton(templateName);
    await this.robustClick(actionsButton);
    await this.robustClick(this.page.getByRole('menuitem', { name: 'Delete' }));
    await this.robustClick(this._footerSaveButton);
  }

  async editBootSourceForDisk(diskName: string) {
    await this.robustClick(this._templateActionsDropdown);
    await this.robustClick(this.locator('[data-test-id="edit-boot-source"]'));

    const diskRow = this._tr.filter({ hasText: diskName });
    const diskToggle = diskRow.locator('#toggle-id-disk');
    await this.robustClick(diskToggle);

    await this.robustClick(
      this._roleMenuitem.filter({
        hasText: 'Edit',
      }),
    );
    await this.locator('#enable-bootsource').check({ force: true });
    await this.robustClick(this._footerSaveButton);
  }

  async fillCloneTemplateModal(
    metadataName: string,
    displayName?: string,
    provider?: string,
    namespace?: string,
  ) {
    const dialog = this.page.getByRole('dialog');
    await dialog.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });

    const nameInput = dialog.locator(
      'input[id="name"], input[id="templateName"], input#clone-name',
    );
    await nameInput
      .first()
      .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await nameInput.first().clear();
    await nameInput.first().fill(metadataName);

    if (displayName) {
      const displayInput = dialog.locator(
        'input[id="display-name"], input[id="templateDisplayName"]',
      );
      if (
        await displayInput
          .first()
          .isVisible({ timeout: TestTimeouts.UI_DELAY_SHORT })
          .catch(() => false)
      ) {
        await displayInput.first().clear();
        await displayInput.first().fill(displayName);
      }
    }

    if (namespace) {
      const projectBtn = dialog.locator('button').filter({ hasText: /Select project|Project/ });
      if (
        await projectBtn
          .first()
          .isVisible({ timeout: TestTimeouts.UI_DELAY_SHORT })
          .catch(() => false)
      ) {
        await this.robustClick(projectBtn.first());
        const searchInput = dialog.locator('[role="listbox"]').locator('input[type="text"]');
        if (
          await searchInput.isVisible({ timeout: TestTimeouts.UI_DELAY_SHORT }).catch(() => false)
        ) {
          await searchInput.fill(namespace);
        }
        await this.robustClick(dialog.locator('[role="option"]').filter({ hasText: namespace }));
      }
    }

    if (provider) {
      const providerInput = dialog.locator('input[id="provider"], input[id="templateProvider"]');
      if (
        await providerInput
          .first()
          .isVisible({ timeout: TestTimeouts.UI_DELAY_SHORT })
          .catch(() => false)
      ) {
        await providerInput.first().clear();
        await providerInput.first().fill(provider);
      }
    }
  }

  async filterByDefaultTemplates() {
    await this.openFilterDropdown();
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

  async filterByOS(os: 'rhel' | 'windows' | 'fedora' | 'centos') {
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

  /**
   * Filter by template type (OpenShift-provided vs user VirtualMachine templates).
   */
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

  async hasBadgeInTemplateRow(templateName: string, badgeText: string): Promise<boolean> {
    const row = this.getTemplateRow(templateName);
    const badge = row.locator(`text=${badgeText}`);
    try {
      await badge.waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_MEDIUM });
      return true;
    } catch {
      return false;
    }
  }

  async isBaseTemplateVisible(templateName: string): Promise<boolean> {
    const baseTemplateElement = this.locator(`[data-test="${templateName}"]`);
    await baseTemplateElement
      .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
      .catch(() => {
        return;
      });
    return await baseTemplateElement.isVisible().catch(() => false);
  }

  /**
   * Opens the column manager and returns whether the given column checkbox is currently checked.
   */
  async isColumnEnabled(
    columnName: 'namespace' | 'workload' | 'architecture' | 'cpu',
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

  /**
   * Returns true if the create template modal shows visible cluster and namespace selection (Fleet ACM).
   */
  async isCreateTemplateModalShowingClusterAndNamespaceOptions(): Promise<boolean> {
    try {
      const clusterToggle = this.locator('[data-test="cluster-dropdown-menu-toggle"]').first();
      const namespaceToggle = this.locator('[data-test="namespace-dropdown-menu-toggle"]').first();
      await clusterToggle.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await namespaceToggle.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      return true;
    } catch {
      return false;
    }
  }

  async isDiskBootable(diskName: string): Promise<boolean> {
    const diskRow = this._tr.filter({ hasText: diskName });
    await diskRow.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });

    const bootableText = diskRow.locator('text=bootable');
    await bootableText
      .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
      .catch(() => {
        return;
      });
    const isBootable = await bootableText.isVisible().catch(() => false);

    return isBootable;
  }

  async isEmptyMessageVisible(): Promise<boolean> {
    try {
      const filterEmpty = this.page.getByText('No templates found');
      const namespaceEmpty = this.page.getByText("You don't have any templates yet");
      const combined = filterEmpty.or(namespaceEmpty);
      await combined.first().waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      return true;
    } catch {
      return false;
    }
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

  async isTemplateVisible(templateMetadataName: string): Promise<boolean> {
    const templateLocator = this.locator(`[data-test-id="${templateMetadataName}"]`);
    try {
      await templateLocator.waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_MEDIUM });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Navigates to the all-namespaces Templates list page via URL.
   * @deprecated Use navigateToTemplatesViaUI() for more reliable navigation
   */
  async navigateToAllNamespacesTemplates() {
    await this.goTo('/k8s/all-namespaces/template.openshift.io~v1~Template');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Navigates to Templates page for a specific namespace via sidebar UI click.
   * @param namespace - The namespace to switch to
   */
  async navigateToNamespaceTemplatesViaUI(namespace: string): Promise<void> {
    await this.clickNavTemplates();
    await this.switchToNamespace(namespace);
  }

  async navigateToProjectTemplates(projectName: string) {
    await this.goTo(`/k8s/ns/${projectName}/template.openshift.io~v1~Template`);
  }

  async navigateToTemplateDetail(templateName: string) {
    const row = this.getTemplateRow(templateName);
    const templateLink = row
      .locator(`[data-test-id="${templateName}"], a`)
      .filter({ hasText: templateName })
      .first();
    await this.robustClick(templateLink);
  }

  /**
   * Navigates to Templates page by clicking [data-test-id="templates-nav-item"] (Fleet context).
   * Expands the Virtualization nav section first so the item is visible.
   */
  async navigateToTemplatesViaTemplatesNavItem(): Promise<void> {
    await this.expandVirtualizationNavSection();
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

  /**
   * Navigates to Templates page via sidebar UI click, falling back to URL navigation.
   */
  async navigateToTemplatesViaUI(): Promise<void> {
    await this.clickNavTemplates();
  }

  async openClusterFilter(): Promise<void> {
    await this._filterToolbarClusterButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(this._filterToolbarClusterButton);
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

  async openProjectFilter(): Promise<void> {
    await this._filterToolbarProjectButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(this._filterToolbarProjectButton);
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

  async selectClusterInFilterMenu(clusterName: string): Promise<void> {
    const checkboxOption = this.locator('#checkbox-select li', { hasText: clusterName }).first();
    const menuitemOption = this._roleMenuitem.filter({ hasText: clusterName }).first();
    const option = (await checkboxOption.isVisible().catch(() => false))
      ? checkboxOption
      : menuitemOption;
    await option.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(option);
  }

  async selectNamespaceInFilterMenu(namespaceName: string): Promise<void> {
    const menuitem = this._roleMenuitem.filter({ hasText: namespaceName }).first();
    await menuitem.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(menuitem);
  }

  async selectPvcAsBootSource(projectName: string, pvcName: string) {
    await this.robustClick(this.locator('button:has-text("Select boot source")'));
    await this.robustClick(
      this.locator('[data-test-id="disk-source-select-persistentVolumeClaim"]'),
    );
    await this.robustClick(this.locator('text=--- Select PVC project ---'));
    await this.clickButtonByText(projectName);
    await this.robustClick(this.locator('.pf-c-form-control.pf-c-select__toggle-typeahead'));
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);
    await this.clickButtonByText(pvcName);
  }

  /**
   * Sets the template name in the create-template-from-example YAML editor.
   */
  async setCreateTemplateExampleNameInYamlEditor(templateName: string): Promise<void> {
    await this.page.waitForSelector('.monaco-editor', {
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });

    await this.page.waitForFunction(
      () => {
        const w = window as unknown as {
          monaco?: {
            editor?: {
              getEditors: () => Array<{
                getModel: () => { getValue: () => string } | null | undefined;
              }>;
            };
          };
        };
        const editors = w.monaco?.editor?.getEditors();
        return Boolean(editors && editors.length > 0 && editors[0].getModel());
      },
      { timeout: TestTimeouts.UI_VISIBILITY_QUICK as number },
    );

    const content = await this.page.evaluate(() => {
      try {
        const w = window as unknown as {
          monaco?: {
            editor?: {
              getEditors: () => Array<{
                getModel: () => { getValue: () => string } | null | undefined;
              }>;
            };
          };
        };
        const editors = w.monaco?.editor?.getEditors();
        if (editors && editors.length > 0) {
          const editor = editors[0];
          const model = editor.getModel();
          if (model) return model.getValue();
        }
      } catch {}
      return null;
    });

    if (!content) {
      throw new Error('Could not get create-template YAML editor content');
    }

    const updated = content
      .replace(/\bname: example\b/, `name: ${templateName}`)
      .replace(/vm\.kubevirt\.io\/template: example\b/, `vm.kubevirt.io/template: ${templateName}`);

    await this.fillYamlEditor(updated);
  }

  async toggleColumn(columnName: 'namespace' | 'workload' | 'architecture' | 'cpu') {
    const columnManagementButton = this.locator('[data-test="manage-columns"]');
    await columnManagementButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);
    await this.robustClick(columnManagementButton);
    let checkbox;
    switch (columnName) {
      case 'namespace':
        checkbox = this.locator('#data-list-namespace');
        break;
      case 'workload':
        checkbox = this.locator('#data-list-workload');
        break;
      case 'architecture':
        checkbox = this.locator('#data-list-architecture');
        break;
      case 'cpu':
        checkbox = this.locator('#data-list-cpu');
        break;
    }
    await checkbox.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await checkbox.click({ force: true });
    await this.robustClick(this._columnsSaveButton);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);
  }

  async verifyCloneDialogOpen(): Promise<{
    dialogVisible: boolean;
    cloneEnabled: boolean;
    hasSourceProjectSelector: boolean;
    templateNameValue: string;
  }> {
    const dialog = this.page.getByRole('dialog');
    const dialogVisible = await dialog
      .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
      .then(() => true)
      .catch(() => false);

    const hasSourceProjectSelector = await this.page
      .getByText('Source template project')
      .isVisible()
      .catch(() => false);

    const templateNameInput = dialog.getByRole('textbox', { name: 'Template name' });
    const templateNameValue = await templateNameInput.inputValue().catch(() => '');

    const cloneButton = dialog.locator('footer button').filter({ hasText: 'Clone' });
    const cloneEnabled = await cloneButton.isEnabled().catch(() => false);

    return { dialogVisible, cloneEnabled, hasSourceProjectSelector, templateNameValue };
  }

  /**
   * Verifies the filter toolbar contains Cluster and Project filter buttons (Fleet ACM).
   */
  async verifyClusterAndProjectFilterButtonsVisible(): Promise<boolean> {
    try {
      await this._filterToolbarClusterButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await this._filterToolbarProjectButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      return (
        (await this._filterToolbarClusterButton.isVisible()) &&
        (await this._filterToolbarProjectButton.isVisible())
      );
    } catch {
      return false;
    }
  }

  async verifyNavigatedToVmsPage(): Promise<boolean> {
    try {
      await this.page.waitForURL(/VirtualMachine/, {
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      return this.page.url().includes('tab=vms');
    } catch {
      return false;
    }
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

  /**
   * After submitting the create-template YAML form, waits for navigation away from the `~new`
   * creation URL and verifies that the redirect lands on the correct fleet-virtualization templates
   * detail URL.
   */
  async verifyRedirectAfterTemplateCreation(): Promise<{ isValid: boolean; url: string }> {
    try {
      await this.page.waitForURL(
        (url) => !url.pathname.endsWith('~new') && !url.pathname.includes('~new'),
        { timeout: TestTimeouts.ELEMENT_WAIT },
      );
      const currentUrl = this.page.url();
      const isCorrectPath = currentUrl.includes('/fleet-virtualization/templates/cluster/');
      const hasOldBrokenPath = currentUrl.includes('template.openshift.io~v1~Template');
      return { isValid: isCorrectPath && !hasOldBrokenPath, url: currentUrl };
    } catch {
      return { isValid: false, url: this.page.url() };
    }
  }

  async verifySourceAvailableTextDoesNotExist(): Promise<boolean> {
    try {
      const sourceAvailableLocator = this.locator('text=Source available');
      const exists = await sourceAvailableLocator
        .isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM })
        .catch(() => false);
      return !exists;
    } catch {
      return true;
    }
  }

  async verifyTableHeaderExists(
    headerLabel: 'Namespace' | 'Architecture' | 'Workload profile' | 'CPU | Memory',
    shouldExist: boolean,
  ): Promise<boolean> {
    const header = this.page.locator('table.kubevirt-table th', { hasText: headerLabel });
    await header
      .first()
      .waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT })
      .catch(() => {
        return;
      });
    const exists = await header
      .first()
      .isVisible()
      .catch(() => false);
    return exists === shouldExist;
  }

  async verifyTemplateContains(expectedText: string): Promise<boolean> {
    try {
      const textLocator = this.locator(`text=${expectedText}`);
      await textLocator.waitFor({ state: 'visible', timeout: TestTimeouts.UI_VISIBILITY_QUICK });
      return true;
    } catch {
      return false;
    }
  }

  async verifyTemplateCreationFromExample(expectedText: string): Promise<boolean> {
    try {
      const textLocator = this.locator(`text=${expectedText}`);
      await textLocator.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      return true;
    } catch {
      return false;
    }
  }

  async verifyTemplateDetailsPage(): Promise<boolean> {
    try {
      const templateDetailsLocator = this.locator('text=Template details');
      await templateDetailsLocator.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_VISIBILITY_QUICK,
      });
      return true;
    } catch {
      return false;
    }
  }

  async verifyYamlEditorOpen(): Promise<boolean> {
    return this.page
      .locator('.monaco-editor')
      .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
      .then(() => true)
      .catch(() => false);
  }

  async waitForClusterFilterApplied(): Promise<void> {
    await this._closeFilterLabelGroup.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
  }

  async waitForTemplateRowDetached(
    templateName: string,
    timeout: number = TestTimeouts.DEFAULT,
  ): Promise<void> {
    const row = this.getTemplateRow(templateName);
    await row.waitFor({ state: 'detached', timeout });
  }
}
