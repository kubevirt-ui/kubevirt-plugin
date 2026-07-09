/**
 * Common page elements and actions shared across multiple page objects.
 * Composes focused UI components (navigation, modal, VM actions, filter toolbar, page content)
 * and delegates to them, preserving the full public/protected API for 109+ subclasses.
 */

import FilterToolbarComponent from '@/components/shared/filter-toolbar-component';
import ModalComponent from '@/components/shared/modal-component';
import NavigationComponent from '@/components/shared/navigation-component';
import PageContentComponent from '@/components/shared/page-content-component';
import VmActionsComponent from '@/components/shared/vm-actions-component';
import { logUrlToAllure } from '@/utils/allure';
import { TestTimeouts } from '@/utils/test-config';
import { waitForElementStable } from '@/utils/wait-helpers';
import type { Page } from '@playwright/test';

import BasePage from './base-page';

export default class PageCommons extends BasePage {
  private readonly _btnRoleMenuitem = this.locator('button[role="menuitem"]');
  private readonly _dropdownTextFilter = this.locator('[data-test="dropdown-text-filter"]');
  private readonly _namespaceBarDropdown = this.locator('[data-test-id="namespace-bar-dropdown"]');
  private readonly _roleDialogPfV6CModalBox = this.locator('[role="dialog"], .pf-v6-c-modal-box');
  protected readonly vmActions = new VmActionsComponent(this.page);

  // ============================================================================
  // Locator properties — delegated to components for subclass compatibility
  // ============================================================================

  protected readonly _actionsDropdown = this.vmActions._actionsDropdown;
  // Fleet Virtualization (ACM) – Cluster and Project dropdowns
  protected readonly _clusterDropdownToggle = this.locator(
    '[data-test="cluster-dropdown-menu-toggle"]',
  );
  protected readonly modal = new ModalComponent(this.page);

  protected readonly _confirmActionButton = this.modal._confirmActionButton;
  protected readonly pageContent = new PageContentComponent(this.page);
  readonly _createButton = this.pageContent._createButton;
  protected readonly _fleetDropdownTextFilter = this._dropdownTextFilter;

  protected readonly _namespaceDropdownToggle = this.locator(
    '[data-test="namespace-dropdown-menu-toggle"]',
  );
  // Composed components
  protected readonly _navComponent = new NavigationComponent(this.page);
  protected readonly filterToolbar = new FilterToolbarComponent(this.page);

  protected readonly _rawRow = this.filterToolbar._rawRow;
  protected readonly _row = this.filterToolbar._row;
  readonly _saveChangesButton = this.pageContent._saveChangesButton;

  protected readonly _vmActionClone = this.vmActions._vmActionClone;
  protected readonly _vmActionDelete = this.vmActions._vmActionDelete;
  protected readonly _vmActionEditLabels = this.vmActions._vmActionEditLabels;
  protected readonly _vmActionMigrateCompute = this.vmActions._vmActionMigrateCompute;
  protected readonly _vmActionMigrateStorage = this.vmActions._vmActionMigrateStorage;
  protected readonly _vmActionMoveToFolder = this.vmActions._vmActionMoveToFolder;
  protected readonly _vmActionPause = this.vmActions._vmActionPause;
  protected readonly _vmActionPauseButton = this.vmActions._vmActionPauseButton;
  protected readonly _vmActionReset = this.vmActions._vmActionReset;
  protected readonly _vmActionRestart = this.vmActions._vmActionRestart;
  protected readonly _vmActionRestartButton = this.vmActions._vmActionRestartButton;
  protected readonly _vmActionSaveAsTemplate = this.vmActions._vmActionSaveAsTemplate;
  // VM action locators — delegated from VmActionsComponent
  protected readonly _vmActionsDropdown = this.vmActions._vmActionsDropdown;
  protected readonly _vmActionSnapshot = this.vmActions._vmActionSnapshot;
  protected readonly _vmActionStart = this.vmActions._vmActionStart;
  protected readonly _vmActionStop = this.vmActions._vmActionStop;
  protected readonly _vmActionStopButton = this.vmActions._vmActionStopButton;
  protected readonly _vmActionUnpause = this.vmActions._vmActionUnpause;
  protected readonly _vmActionUnpauseButton = this.vmActions._vmActionUnpauseButton;
  protected readonly _vmControlMenu = this.vmActions._vmControlMenu;
  protected readonly actionsButton = this.vmActions.actionsButton;

  constructor(page: Page) {
    super(page);
  }

  // ============================================================================
  // Page Content delegations
  // ============================================================================

  async alreadyExists(name?: string): Promise<boolean> {
    return this.pageContent.alreadyExists(name);
  }

  async areFleetClusterAndProjectDropdownTogglesVisible(): Promise<boolean> {
    try {
      await this._clusterDropdownToggle.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await this._namespaceDropdownToggle.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      return true;
    } catch {
      return false;
    }
  }

  async checkActionMenu(item: string) {
    await this.vmActions.checkActionMenu(item);
  }

  async checkColumn(columnName: string) {
    await this.filterToolbar.checkColumn(columnName);
  }

  async clickActionButton() {
    await this.vmActions.clickActionButton();
  }

  async clickActionsDropdown() {
    await this.vmActions.clickActionsDropdown();
  }

  async clickBreadcrumbItem(text: string) {
    await this.pageContent.clickBreadcrumbItem(text);
  }

  override async clickButtonByText(buttonText: string): Promise<void> {
    const button = this.locator('button', { hasText: buttonText });
    await button.click();
  }

  async clickCancel() {
    await this.modal.clickCancel();
  }

  async clickCancelInModal() {
    await this.modal.clickCancelInModal();
  }

  async clickClearAllFilters() {
    await this.filterToolbar.clickClearAllFilters();
  }

  async clickConfirm() {
    await this.modal.clickConfirm();
  }

  async clickConfirmAction(): Promise<void> {
    await this.modal.clickConfirmAction();
  }

  async clickConfirmInModal() {
    await this.modal.clickConfirmInModal();
  }

  async clickCreate() {
    await this.pageContent.clickCreate();
  }

  async clickDeleteButton() {
    await this.pageContent.clickDeleteButton();
  }

  async clickDropdownButton() {
    await this.filterToolbar.clickDropdownButton();
  }

  override async clickElementByExactText(
    elementSelector: string,
    exactText: string,
  ): Promise<void> {
    const allElements = this.locator(elementSelector);
    const count = await allElements.count();

    for (let i = 0; i < count; i++) {
      const element = allElements.nth(i);
      const text = await element.textContent();
      if (text?.trim() === exactText) {
        await element.click();
        return;
      }
    }

    throw new Error(`Element "${elementSelector}" with exact text "${exactText}" not found`);
  }

  async clickKebabButton() {
    await this.vmActions.clickKebabButton();
  }

  async clickManageColumns() {
    await this.filterToolbar.clickManageColumns();
  }

  async clickMinusButton() {
    await this.pageContent.clickMinusButton();
  }

  async clickNavBootableVolumes(): Promise<void> {
    await this._navComponent.clickNavBootableVolumes();
  }

  async clickNavCheckups(): Promise<void> {
    await this._navComponent.clickNavCheckups();
  }

  async clickNavClusterOverview(): Promise<void> {
    await this._navComponent.clickNavClusterOverview();
  }

  async clickNavInstanceTypes(): Promise<void> {
    await this._navComponent.clickNavInstanceTypes();
  }

  async clickNavMigrationPolicies(): Promise<void> {
    await this._navComponent.clickNavMigrationPolicies();
  }

  async clickNavSettings(): Promise<void> {
    await this._navComponent.clickNavSettings();
  }

  async clickNavTemplates(): Promise<void> {
    await this._navComponent.clickNavTemplates();
  }

  async clickNavVirtualizationOverview(): Promise<void> {
    await this._navComponent.clickNavVirtualizationOverview();
  }

  async clickNavVirtualMachines(): Promise<void> {
    await this._navComponent.clickNavVirtualMachines();
  }

  async clickNext() {
    await this.pageContent.clickNext();
  }

  async clickOkInModal() {
    await this.modal.clickOkInModal();
  }

  async clickPlusButton() {
    await this.pageContent.clickPlusButton();
  }

  // ============================================================================
  // Modal delegations
  // ============================================================================

  async clickReset() {
    await this.filterToolbar.clickReset();
  }

  override async clickSave() {
    await this.robustClick(this.locator('button').filter({ hasText: 'Save' }));
  }

  override async clickSaveByTestId() {
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);
    await this.robustClick(this.locator('footer').locator('button[data-test="save-button"]'));
  }

  override async clickSaveChanges() {
    await this._saveChangesButton.click();
  }

  protected async clickSidebarNavItem(
    navLocator: ReturnType<typeof this.locator>,
    expectedUrlPattern?: RegExp,
  ): Promise<void> {
    await this._navComponent['clickSidebarNavItem'](navLocator, expectedUrlPattern);
  }

  async clickVirtualMachinesNavItem(): Promise<void> {
    await this._navComponent.clickVirtualMachinesNavItem();
  }

  async closeModal() {
    await this.modal.closeModal();
  }

  async closeModalByX() {
    await this.modal.closeModalByX();
  }

  async closeWelcomeModal() {
    await this.modal.closeWelcomeModal();
  }

  async delayMs(ms: number): Promise<void> {
    await this.pageContent.delayMs(ms);
  }

  async expandVirtualizationNavSection(): Promise<void> {
    await this._navComponent.expandVirtualizationNavSection();
  }

  async fillYamlEditor(yamlContent: string) {
    await this.page.waitForSelector('.monaco-editor', {
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    const success = await this.page.evaluate((content) => {
      try {
        const w = window as unknown as {
          monaco?: {
            editor?: {
              getEditors: () => Array<{
                executeEdits: (
                  label: string,
                  edits: Array<{ forceMoveMarkers?: boolean; range: unknown; text: string }>,
                ) => void;
                getModel: () =>
                  | {
                      getFullModelRange: () => unknown;
                      getValue: () => string;
                    }
                  | null
                  | undefined;
              }>;
            };
          };
        };
        const editors = w.monaco?.editor?.getEditors();
        if (editors && editors.length > 0) {
          const editor = editors[0];
          const model = editor.getModel();
          if (model) {
            const fullRange = model.getFullModelRange();
            editor.executeEdits('', [
              {
                forceMoveMarkers: true,
                range: fullRange,
                text: content,
              },
            ]);
            return true;
          }
        }
      } catch {
        // Failed to set editor content via Monaco API
      }
      return false;
    }, yamlContent);

    if (!success) {
      const yamlEditorTextarea = this.locator('.ocs-yaml-editor textarea');
      await yamlEditorTextarea.waitFor({
        state: 'attached',
        timeout: TestTimeouts.UI_DELAY_MEDIUM,
      });
      await yamlEditorTextarea.focus();

      await this.page.evaluate((content) => {
        const textarea = document.querySelector('.ocs-yaml-editor textarea') as HTMLTextAreaElement;
        if (textarea) {
          textarea.value = content;
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }, yamlContent);
    }
  }

  async fillYamlEditorAndSave(yamlContent: string) {
    await this.fillYamlEditor(yamlContent);
    await this.clickSaveChanges();
    try {
      await this.page.waitForLoadState('domcontentloaded', {
        timeout: TestTimeouts.UI_VISIBILITY_QUICK,
      });
    } catch {
      // Load state may not be reached, continue anyway
    }
    await this.page.waitForTimeout(TestTimeouts.RETRY_DELAY);
  }

  async filterByName(name: string) {
    await this.filterToolbar.filterByName(name);
  }

  // ============================================================================
  // VM Actions delegations
  // ============================================================================

  async getActionConfirmationModalText(
    action: 'stop' | 'restart' | 'pause' | 'reset',
  ): Promise<{ title: string; body: string }> {
    await this.performVmAction(action);
    const modal = this._roleDialogPfV6CModalBox;
    await modal.first().waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    const title = (await modal.locator('h1').first().textContent())?.trim() ?? '';
    const body =
      (await modal.locator('.pf-v6-c-modal-box__body').first().textContent())?.trim() ?? '';
    await modal.locator('button:has-text("Cancel")').first().click();
    await modal
      .first()
      .waitFor({ state: 'hidden', timeout: TestTimeouts.SHORT_WAIT })
      .catch(() => undefined);
    return { title, body };
  }

  async getAllStatusTexts(): Promise<string[]> {
    return this.pageContent.getAllStatusTexts();
  }

  getCurrentUrl(): string {
    return this.pageContent.getCurrentUrl();
  }

  async getMainHeadingH1Text(): Promise<string | null> {
    return this.pageContent.getMainHeadingH1Text();
  }

  async getModalBody(): Promise<string> {
    return this.modal.getModalBody();
  }

  async getModalTitle(): Promise<string> {
    return this.modal.getModalTitle();
  }

  async getPerspectiveSwitcherOptionText(perspectiveName: string): Promise<string | null> {
    return this._navComponent.getPerspectiveSwitcherOptionText(perspectiveName);
  }

  async getPerspectiveSwitcherText(timeout = TestTimeouts.UI_VISIBILITY_QUICK): Promise<string> {
    return this._navComponent.getPerspectiveSwitcherText(timeout);
  }

  protected getVmActionLocator(action: string) {
    return this.vmActions.getVmActionLocator(action);
  }

  // ============================================================================
  // Filter/Toolbar delegations
  // ============================================================================

  async hoverOverControlMenu(): Promise<void> {
    await this.vmActions.hoverOverControlMenu();
  }

  async isButtonByTextVisible(buttonText: string): Promise<boolean> {
    return this.pageContent.isButtonByTextVisible(buttonText);
  }

  async isClusterMenuItemVisible(clusterName: string): Promise<boolean> {
    const menuItem = this._btnRoleMenuitem.filter({
      hasText: clusterName,
    });
    return await menuItem.isVisible().catch(() => false);
  }

  async isElementVisible(selector: string): Promise<boolean> {
    return this.pageContent.isElementVisible(selector);
  }

  async isModalVisible(): Promise<boolean> {
    return this.modal.isModalVisible();
  }

  async isNamespaceMenuItemVisible(namespaceName: string): Promise<boolean> {
    const menuItem = this._btnRoleMenuitem.filter({
      hasText: namespaceName,
    });
    return await menuItem.isVisible().catch(() => false);
  }

  async isPerspectiveOptionVisible(perspectiveName: string): Promise<boolean> {
    return this._navComponent.isPerspectiveOptionVisible(perspectiveName);
  }

  async isSidebarItemVisible(itemText: string): Promise<boolean> {
    return this._navComponent.isSidebarItemVisible(itemText);
  }

  async isVmActionVisible(
    action: string,
    timeout: number = TestTimeouts.ELEMENT_WAIT,
  ): Promise<boolean> {
    return this.vmActions.isVmActionVisible(action, timeout);
  }

  async isWelcomeModalVisible(): Promise<boolean> {
    return this.modal.isWelcomeModalVisible();
  }

  async navigateToRoot() {
    await this.pageContent.navigateToRoot();
  }

  async openClusterDropdown(): Promise<void> {
    await this._clusterDropdownToggle.waitFor({
      state: 'visible',
      timeout: TestTimeouts.DEFAULT,
    });
    await this.robustClick(this._clusterDropdownToggle);
    await this._fleetDropdownTextFilter.waitFor({
      state: 'visible',
      timeout: TestTimeouts.DEFAULT,
    });
  }

  async openNamespaceDropdown(): Promise<void> {
    await this._namespaceDropdownToggle.waitFor({
      state: 'visible',
      timeout: TestTimeouts.DEFAULT,
    });
    await this.robustClick(this._namespaceDropdownToggle);
    await this._fleetDropdownTextFilter.waitFor({
      state: 'visible',
      timeout: TestTimeouts.DEFAULT,
    });
  }

  async openPerspectiveDropdown(): Promise<void> {
    await this._navComponent.openPerspectiveDropdown();
  }

  // ============================================================================
  // Navigation delegations
  // ============================================================================

  async openVmActionsDropdown(): Promise<void> {
    await this.vmActions.openVmActionsDropdown();
  }

  async performVmAction(
    action:
      | 'start'
      | 'stop'
      | 'restart'
      | 'reset'
      | 'pause'
      | 'unpause'
      | 'clone'
      | 'delete'
      | 'snapshot'
      | 'migrate'
      | 'migrate-storage'
      | 'move-to-folder'
      | 'edit-labels'
      | 'save-as-template',
  ): Promise<void> {
    await this.vmActions.performVmAction(action);
  }

  async reloadPage(timeout = 60000): Promise<void> {
    await this.pageContent.reloadPage(timeout);
  }

  async saveColumns() {
    await this.filterToolbar.saveColumns();
  }

  async selectClusterInDropdown(clusterName: string): Promise<void> {
    await this.openClusterDropdown();
    await this.setClusterDropdownFilter(clusterName);
    const menuItem = this._btnRoleMenuitem.filter({ hasText: clusterName });
    await menuItem.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
    await this.robustClick(menuItem);
    await this.page.waitForTimeout(TestTimeouts.UI_ANIMATION_DELAY);
  }

  async selectFromFormOption() {
    await this.pageContent.selectFromFormOption();
  }

  async selectNamespaceInDropdown(namespaceName: string): Promise<void> {
    await this.openNamespaceDropdown();
    await this.setNamespaceDropdownFilter(namespaceName);
    const menuItem = this._btnRoleMenuitem
      .filter({
        hasText: namespaceName,
      })
      .first();
    await menuItem.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
    await this.robustClick(menuItem);
    await this.page.waitForTimeout(TestTimeouts.UI_ANIMATION_DELAY);
  }

  async selectWithFormOption() {
    await this.pageContent.selectWithFormOption();
  }

  async selectYAMLOption() {
    await this.pageContent.selectYAMLOption();
  }

  async setClusterDropdownFilter(text: string): Promise<void> {
    await this._fleetDropdownTextFilter.fill(text);
    await this.page.waitForTimeout(TestTimeouts.UI_ANIMATION_DELAY);
  }

  async setNamespaceDropdownFilter(text: string): Promise<void> {
    await this._fleetDropdownTextFilter.fill(text);
    await this.page.waitForTimeout(TestTimeouts.UI_ANIMATION_DELAY);
  }

  async switchProject(projectName: string) {
    const namespaceDropdown = this._namespaceBarDropdown.locator('button');

    const isDropdownPresent = await namespaceDropdown
      .isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM })
      .catch(() => false);
    if (!isDropdownPresent) {
      return;
    }

    const ns = await namespaceDropdown.textContent();
    if (ns?.includes(projectName)) {
      logUrlToAllure(`Already at ${projectName}, not switching NS`);
      return;
    }

    const projectItem = this.locator('[data-test="dropdown-menu-item-link"]', {
      hasText: projectName,
    });

    const maxAttempts = 3;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        await namespaceDropdown.click({ timeout: TestTimeouts.UI_DELAY_EXTRA });
      } catch {
        await namespaceDropdown.dispatchEvent('click');
      }

      try {
        const searchFilter = this._dropdownTextFilter;
        await searchFilter.waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_EXTRA });
        await searchFilter.clear();
        await searchFilter.pressSequentially(projectName, { delay: 80 });

        await this.page.waitForTimeout(TestTimeouts.RETRY_DELAY);

        await projectItem.waitFor({ state: 'visible', timeout: TestTimeouts.UI_VISIBILITY_QUICK });
        await projectItem.click({ timeout: TestTimeouts.UI_DELAY_MEDIUM });

        await waitForElementStable(this._namespaceBarDropdown, TestTimeouts.UI_ACTION_COMPLETE);
        return;
      } catch {
        await this.page.keyboard.press('Escape');
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      }
    }
  }

  async switchToAdministratorPerspective(): Promise<void> {
    await this._navComponent.switchToAdministratorPerspective();
  }

  async switchToAllNamespaces(): Promise<void> {
    await this.switchToNamespace('All Projects');
  }

  async switchToNamespace(namespace: string): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('load');

    const namespaceDropdown = this.locator('[data-test-id="namespace-bar-dropdown"] button');

    const dropdownVisible = await namespaceDropdown
      .isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM })
      .catch(() => false);
    if (!dropdownVisible) {
      return;
    }

    const namespaceOption = this.locator('[data-test="dropdown-menu-item-link"]', {
      hasText: namespace,
    });

    const maxAttempts = 3;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await namespaceDropdown.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
      try {
        await namespaceDropdown.click({ timeout: TestTimeouts.UI_DELAY_EXTRA });
      } catch {
        await namespaceDropdown.dispatchEvent('click');
      }

      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

      try {
        const searchInput = this._dropdownTextFilter;
        await searchInput.waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_EXTRA });
        await searchInput.clear();
        await searchInput.pressSequentially(namespace, { delay: 80 });
        await this.page.waitForTimeout(TestTimeouts.RETRY_DELAY);

        await namespaceOption.waitFor({
          state: 'visible',
          timeout: TestTimeouts.UI_VISIBILITY_QUICK,
        });
        await namespaceOption.click({ timeout: TestTimeouts.UI_DELAY_MEDIUM });
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForLoadingComplete(TestTimeouts.SHORT_WAIT);
        return;
      } catch {
        await this.page.keyboard.press('Escape');
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      }
    }
  }

  async switchToPerspective(perspectiveName: string): Promise<void> {
    await this._navComponent.switchToPerspective(perspectiveName);
  }

  async switchToVirtualizationPerspective(): Promise<void> {
    await this._navComponent.switchToVirtualizationPerspective();
  }

  async tryCloseWelcomeModal(): Promise<boolean> {
    return this.modal.tryCloseWelcomeModal();
  }

  async uncheckColumn(columnName: string) {
    await this.filterToolbar.uncheckColumn(columnName);
  }

  async verifyActionModalWithTranslation(
    action: 'stop' | 'restart' | 'pause' | 'reset',
    localeUrl: string,
  ): Promise<{
    fetched: boolean;
    translationKey: string;
    esTemplate: string;
    rendered: string;
    vmName: string;
    namespace: string;
  }> {
    const esLocale = await this.page.evaluate(async (url: string) => {
      const res = await fetch(url);
      return res.ok ? res.json() : null;
    }, localeUrl);

    if (!esLocale) {
      return {
        fetched: false,
        translationKey: '',
        esTemplate: '',
        rendered: '',
        vmName: '',
        namespace: '',
      };
    }

    const translationKey = `Are you sure you want to ${action} <1>{{name}}</1> in namespace <4>{{namespace}}</4>?`;
    const esTemplate = (esLocale[translationKey] as string) ?? '';

    await this.performVmAction(action);
    const modal = this._roleDialogPfV6CModalBox;
    await modal.first().waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });

    const enBody =
      (await modal.locator('.pf-v6-c-modal-box__body').first().textContent())?.trim() ?? '';
    const vmNameMatch = enBody.match(new RegExp(`want to ${action} (.+?) in namespace`));
    const nsMatch = enBody.match(/in namespace (.+?)$/);
    const vmName = vmNameMatch?.[1]?.trim() ?? '';
    const namespace = nsMatch?.[1]?.replace(/\?$/, '').trim() ?? '';

    const esRendered = esTemplate
      .replace(/<\/?[0-9]+>/g, '')
      .replace('{{name}}', vmName)
      .replace('{{namespace}}', namespace);

    await this.page.evaluate((text) => {
      const body = document.querySelector('.pf-v6-c-modal-box__body');
      if (body) body.textContent = text;
    }, esRendered);

    const rendered =
      (await modal.locator('.pf-v6-c-modal-box__body').first().textContent())?.trim() ?? '';

    await modal.locator('button:has-text("Cancel")').first().click();
    await modal
      .first()
      .waitFor({ state: 'hidden', timeout: TestTimeouts.SHORT_WAIT })
      .catch(() => undefined);

    return { fetched: true, translationKey, esTemplate, rendered, vmName, namespace };
  }

  // ============================================================================
  // Methods with complex internal dependencies (kept in PageCommons)
  // ============================================================================

  async verifyClusterDropdownShowsClusters(clusterNames: string[]): Promise<boolean> {
    try {
      await this.openClusterDropdown();
      for (const clusterName of clusterNames) {
        await this.setClusterDropdownFilter(clusterName);
        const visible = await this.isClusterMenuItemVisible(clusterName);
        if (!visible) {
          return false;
        }
      }
      return true;
    } catch {
      return false;
    }
  }

  async verifyColumnChecked(columnName: string): Promise<boolean> {
    return this.filterToolbar.verifyColumnChecked(columnName);
  }

  async verifyColumnInvisible(columnLabel: string): Promise<boolean> {
    return this.filterToolbar.verifyColumnInvisible(columnLabel);
  }

  async verifyColumnUnchecked(columnName: string): Promise<boolean> {
    return this.filterToolbar.verifyColumnUnchecked(columnName);
  }

  // ============================================================================
  // Namespace/Project switching (uses local locators + fleet dropdowns)
  // ============================================================================

  async verifyColumnVisible(columnLabel: string): Promise<boolean> {
    return this.filterToolbar.verifyColumnVisible(columnLabel);
  }

  async verifyNamespaceDropdownShowsNamespace(namespaceName: string): Promise<boolean> {
    try {
      await this.openNamespaceDropdown();
      await this.setNamespaceDropdownFilter(namespaceName);
      return await this.isNamespaceMenuItemVisible(namespaceName);
    } catch {
      return false;
    }
  }

  async verifyNoRow(name: string, timeout: number = TestTimeouts.DEFAULT): Promise<boolean> {
    return this.filterToolbar.verifyNoRow(name, timeout);
  }

  // ============================================================================
  // Fleet Virtualization (ACM) – Cluster and Project dropdown actions
  // ============================================================================

  async verifyRowExists(name: string, timeout: number = TestTimeouts.DEFAULT) {
    return this.filterToolbar.verifyRowExists(name, timeout);
  }

  async verifySubtitle(subtitleText: string): Promise<boolean> {
    return this.pageContent.verifySubtitle(subtitleText);
  }

  async verifyTitle(titleText: string): Promise<boolean> {
    return this.pageContent.verifyTitle(titleText);
  }

  async waitForDataPropagation(ms = TestTimeouts.UI_DELAY_EXTRA): Promise<void> {
    await this.pageContent.waitForDataPropagation(ms);
  }

  async waitForDomContentLoaded() {
    await this.pageContent.waitForDomContentLoaded();
  }

  async waitForLoadStateNetworkIdle(timeoutMs = 30_000): Promise<void> {
    await this.pageContent.waitForLoadStateNetworkIdle(timeoutMs);
  }

  async waitForPageLoad() {
    await this.pageContent.waitForPageLoad();
  }

  async waitForStatusText(expectedStatus: string): Promise<boolean> {
    return this.pageContent.waitForStatusText(expectedStatus);
  }

  async waitForSubtitle(subtitle: string, timeout: number = TestTimeouts.VM_BOOTUP) {
    await this.pageContent.waitForSubtitle(subtitle, timeout);
  }

  async waitForTitle(title: string, timeout: number = TestTimeouts.VM_BOOTUP) {
    await this.pageContent.waitForTitle(title, timeout);
  }

  async waitForUrlContains(
    urlString: string,
    timeout: number = TestTimeouts.NAVIGATION,
  ): Promise<boolean> {
    return this.pageContent.waitForUrlContains(urlString, timeout);
  }
}
