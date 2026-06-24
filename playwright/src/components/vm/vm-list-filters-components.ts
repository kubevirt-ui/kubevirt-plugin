import BaseComponent from '@/components/shared/base-component';
import FilterToolbarComponent from '@/components/shared/filter-toolbar-component';
import NavigationComponent from '@/components/shared/navigation-component';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

export interface VmBulkActionsComponent {
  clickBulkSelectCheckbox(): Promise<void>;
  clickActionsDropdown(): Promise<void>;
  clickActionsMenuButton(): Promise<void>;
  clickVmActionsDropdown(): Promise<void>;
  hoverOverBulkControlMenu(): Promise<void>;
  hoverOverMigrateMenu(): Promise<void>;
  clickVmAction(
    action:
      | 'bulk-migration'
      | 'delete'
      | 'edit-labels'
      | 'move-to-folder'
      | 'pause'
      | 'restart'
      | 'start'
      | 'stop'
      | 'unpause',
  ): Promise<void>;
  clickVmActionByMenuButton(
    action:
      | 'bulk-migration'
      | 'delete'
      | 'edit-labels'
      | 'migrate-compute'
      | 'migrate-storage'
      | 'move-to-folder'
      | 'pause'
      | 'reset'
      | 'restart'
      | 'snapshot'
      | 'start'
      | 'stop'
      | 'unpause',
  ): Promise<void>;
  openVmActionsDropdown(): Promise<void>;
  selectAllVmsOnPage(): Promise<void>;
  openBulkActionsDropdown(): Promise<void>;
  selectAllVMs(): Promise<void>;
  areAllCheckboxesChecked(): Promise<boolean>;
  areNoCheckboxesChecked(): Promise<boolean>;
  getDeletionCountFromModal(): Promise<null | number>;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function applyBulkActionsDelegations(proto: any): void {
  proto.clickBulkSelectCheckbox = async function (this: any): Promise<void> {
    const checkbox = this._selectPage;
    await checkbox.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(checkbox);
    await this.page.waitForTimeout(TestTimeouts.RETRY_DELAY);
  };

  proto.clickActionsDropdown = async function (this: any): Promise<void> {
    await this.robustClick(this._actionsDropdown);
  };

  proto.clickActionsMenuButton = async function (this: any): Promise<void> {
    await this._vmActionsDropdown.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(this._vmActionsDropdown);
  };

  proto.clickVmActionsDropdown = async function (this: any): Promise<void> {
    await this._actionsDropdownButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(this._actionsDropdownButton);
  };

  proto.hoverOverBulkControlMenu = async function (this: any): Promise<void> {
    const bulkControlMenuButton = this._controlMenu;
    await bulkControlMenuButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await bulkControlMenuButton.hover();
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  };

  proto.hoverOverMigrateMenu = async function (this: any): Promise<void> {
    const migrateMenuButton = this.locator('[data-test-id="migration-menu"]');
    await migrateMenuButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
    await migrateMenuButton.hover();
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  };

  proto.openVmActionsDropdown = async function (this: any): Promise<void> {
    await this._vmActionsDropdown.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(this._vmActionsDropdown);
  };

  proto._clickVmActionItem = async function (
    this: any,
    action:
      | 'bulk-migration'
      | 'delete'
      | 'edit-labels'
      | 'move-to-folder'
      | 'pause'
      | 'restart'
      | 'start'
      | 'stop'
      | 'unpause',
  ): Promise<void> {
    const actionLocator = this.vmActions.getActionLocator(action, 'bulk');
    await this.robustClick(actionLocator);
  };

  proto._clickBulkVmActionItem = async function (
    this: any,
    action:
      | 'bulk-migration'
      | 'delete'
      | 'edit-labels'
      | 'migrate-compute'
      | 'migrate-storage'
      | 'move-to-folder'
      | 'pause'
      | 'reset'
      | 'restart'
      | 'snapshot'
      | 'start'
      | 'stop'
      | 'unpause',
  ): Promise<void> {
    const actionLocator = this.vmActions.getActionLocator(action, 'bulk-menu');
    await this.robustClick(actionLocator);
  };

  proto.clickVmAction = async function (
    this: any,
    action:
      | 'bulk-migration'
      | 'delete'
      | 'edit-labels'
      | 'move-to-folder'
      | 'pause'
      | 'restart'
      | 'start'
      | 'stop'
      | 'unpause',
  ): Promise<void> {
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);
    await this.vmActions.openVmActionsDropdown();
    await this._clickVmActionItem(action);
  };

  proto.clickVmActionByMenuButton = async function (
    this: any,
    action:
      | 'bulk-migration'
      | 'delete'
      | 'edit-labels'
      | 'migrate-compute'
      | 'migrate-storage'
      | 'move-to-folder'
      | 'pause'
      | 'reset'
      | 'restart'
      | 'snapshot'
      | 'start'
      | 'stop'
      | 'unpause',
  ): Promise<void> {
    await this.clickActionsMenuButton();

    const controlActions = ['start', 'stop', 'pause', 'unpause', 'restart', 'reset'];
    if (controlActions.includes(action)) {
      await this.hoverOverBulkControlMenu();
    }

    const migrateActions = ['bulk-migration', 'migrate-compute', 'migrate-storage'];
    if (migrateActions.includes(action)) {
      await this.hoverOverMigrateMenu();
    }

    await this._clickBulkVmActionItem(action);
  };

  proto.selectAllVmsOnPage = async function (this: any): Promise<void> {
    const selectPageCheckbox = this._selectPage;
    const exists = await selectPageCheckbox
      .isVisible({ timeout: TestTimeouts.UI_DELAY_LONG })
      .catch(() => false);
    if (exists) {
      await this.robustClick(selectPageCheckbox);
    } else {
      const fallbackCheckbox = this.locator('[data-test-id="select-page"]');
      await this.robustClick(fallbackCheckbox);
    }
    await this.page.waitForTimeout(TestTimeouts.RETRY_DELAY);
  };

  proto.openBulkActionsDropdown = async function (this: any): Promise<void> {
    await this.robustClick(this.locator('[data-test="actions-dropdown"]'));
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  };

  proto.selectAllVMs = async function (this: any): Promise<void> {
    const selectPageCheckbox = this.page.getByRole('checkbox', { name: 'Select page' });
    await selectPageCheckbox.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
    await selectPageCheckbox.click();
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  };

  proto.areAllCheckboxesChecked = async function (this: any): Promise<boolean> {
    try {
      const checkboxes = this._dataTestSelectVm;
      const count = await checkboxes.count();
      if (count === 0) {
        return false;
      }

      for (let i = 0; i < count; i++) {
        const checkbox = checkboxes.nth(i);
        const isChecked = await checkbox.isChecked();
        if (!isChecked) {
          return false;
        }
      }
      return true;
    } catch {
      return false;
    }
  };

  proto.areNoCheckboxesChecked = async function (this: any): Promise<boolean> {
    try {
      const checkboxes = this._dataTestSelectVm;
      const count = await checkboxes.count();
      if (count === 0) {
        return true;
      }

      for (let i = 0; i < count; i++) {
        if (await checkboxes.nth(i).isChecked()) {
          return false;
        }
      }
      return true;
    } catch {
      return false;
    }
  };

  proto.getDeletionCountFromModal = async function (this: any): Promise<null | number> {
    try {
      const modalTitle = this.locator('.pf-v6-c-modal-box__title, .pf-c-modal-box__title');
      await modalTitle.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      const titleText = await modalTitle.textContent();

      if (titleText) {
        const match = titleText.match(/Delete\s+(\d+)\s+VirtualMachines/);
        if (match && match[1]) {
          return parseInt(match[1], 10);
        }
      }
      return null;
    } catch {
      return null;
    }
  };
}

export class VmListFiltersComponent extends BaseComponent {
  readonly filterToolbar: FilterToolbarComponent;
  private readonly _buttonColumnManagement = this.locator('button[aria-label="Column management"]');
  private readonly _resetButton = this.locator('[data-test="reset-button"]');
  private readonly _vmListSaveButton = this.locator('[data-test="save-button"]');
  private readonly _dialogModal = this.locator('[data-test="dialog-modal"]');

  constructor(page: Page) {
    super(page);
    this.filterToolbar = new FilterToolbarComponent(page);
  }

  async waitForVmListTableVisible(): Promise<void> {
    const table = this.locator('table.kubevirt-table, table.pf-v6-c-table').first();
    await table.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
  }

  async resetColumns() {
    await this._buttonColumnManagement.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(this._buttonColumnManagement);
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
    await this._resetButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(this._resetButton);
    await this.robustClick(this._vmListSaveButton);
    await this._dialogModal.waitFor({ state: 'hidden' });
    await this.page.waitForTimeout(TestTimeouts.UI_STABILIZE);
  }

  async toggleColumn(columnName: 'created' | 'node' | 'status') {
    await this.toggleColumns([columnName]);
  }

  async toggleColumns(columnNames: Array<'created' | 'node' | 'status'>) {
    await this._buttonColumnManagement.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(this._buttonColumnManagement);
    await this._dialogModal.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });

    for (const columnName of columnNames) {
      const checkbox = this._dialogModal.locator(`#data-list-${columnName}`);
      await checkbox.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      await checkbox.click({ force: true });
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    }

    await this.robustClick(this._vmListSaveButton);
    await this._dialogModal.waitFor({
      state: 'hidden',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.page.waitForTimeout(TestTimeouts.UI_STABILIZE);
  }

  async verifyTableHeaderExists(
    headerLabel: 'Created' | 'Node' | 'Status',
    shouldExist: boolean,
  ): Promise<boolean> {
    const header = this.page.locator(
      'table.kubevirt-table th, table.pf-v6-c-table th, [data-test="vm-list-table"] th',
      { hasText: new RegExp(`^${headerLabel}$`) },
    );
    const waitState = shouldExist ? 'visible' : 'hidden';
    await header
      .first()
      .waitFor({ state: waitState, timeout: TestTimeouts.SHORT_WAIT })
      .catch(() => undefined);
    const exists = await header
      .first()
      .isVisible()
      .catch(() => false);
    return exists === shouldExist;
  }

  async verifyPageLoaded(
    vmNameOrIndicators?: string | string[],
    _includeCreateButton?: boolean,
    timeout?: number,
  ): Promise<boolean> {
    if (typeof vmNameOrIndicators === 'string') {
      const vmNameLocator = this.locator(`[data-test-id="${vmNameOrIndicators}"]`);
      try {
        await vmNameLocator.waitFor({ state: 'visible', timeout: timeout || TestTimeouts.DEFAULT });
        return await vmNameLocator.isVisible().catch(() => false);
      } catch {
        return false;
      }
    }
    const indicators = Array.isArray(vmNameOrIndicators)
      ? vmNameOrIndicators
      : ['[data-test-id="virtual-machine-name"]'];
    const firstIndicator = this.locator(indicators[0]);
    try {
      await firstIndicator.waitFor({
        state: 'visible',
        timeout: timeout || TestTimeouts.DEFAULT,
      });
      return true;
    } catch {
      return false;
    }
  }

  async tryClearAllFilters(): Promise<boolean> {
    return this.filterToolbar.tryClearAllFilters();
  }

  async verifyClusterAndProjectFilterButtonsVisible(): Promise<boolean> {
    try {
      if (!(await this.filterToolbar.isFilterToolbarVisible())) {
        return false;
      }
      await this.locator('#filter-toolbar button', { hasText: 'Cluster' }).waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await this.locator('#filter-toolbar button', { hasText: 'Project' }).waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      return true;
    } catch {
      return false;
    }
  }

  async openProjectFilter(): Promise<void> {
    await this.filterToolbar.openFilterButton('Project');
  }

  async selectProjectInFilterMenu(projectName: string): Promise<void> {
    await this.filterToolbar.selectMenuItem(projectName, { force: true });
  }

  async filterByStatus(status: string) {
    await this.filterToolbar.openFilterButton('Status');
    await this.filterToolbar.selectMenuItem(status);
  }

  async filterByOs(osName: string) {
    await this.filterToolbar.openFilterButton('Operating system');
    await this.filterToolbar.selectMenuItem(osName);
  }

  async filterByInstanceType(instanceType: string, check = true) {
    await this.filterToolbar.openFilterButton('Status');
    await this.filterToolbar.toggleRowFilter(instanceType, check);
    await this.page.waitForTimeout(TestTimeouts.UI_FILTER_APPLY);
  }

  async filterByIpAddress(ipPrefix: string) {
    await this.filterToolbar.openFilterButton('Status');
    await this.locator('button:has-text("Name")').click();
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    await this.locator('button:has-text("IP Address")').click();
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    const filterInput = this.locator('[data-test-id="filter-input"]');
    await this.filterToolbar.fillFilterInput(filterInput, ipPrefix);
    await this.page.waitForTimeout(TestTimeouts.UI_ACTION_COMPLETE);
  }

  async clickClearAllFilters(): Promise<void> {
    await this.filterToolbar.clearAllFilters();
  }
}

export class VmListTreeComponent extends BaseComponent {
  private readonly _nav: NavigationComponent;
  private readonly _treeView = this.locator('.pf-v6-c-tree-view');
  private readonly _treeNode = this.locator('.pf-v6-c-tree-view__node');
  private readonly _vmsTreeview = this.locator('[data-test="vms-treeview"]');
  private readonly _projectName = this.locator('#project-name');
  private readonly _idVmsTreeViewSearchInput = this.locator('[id="vms-tree-view-search-input"]');

  constructor(page: Page) {
    super(page);
    this._nav = new NavigationComponent(page);
  }

  async clickVmInFolderInTreeView(vmName: string, namespace: string): Promise<void> {
    const treeRowId = `#single-cluster#/${namespace}/${vmName}`;
    const locator = this.locator(`[id="${treeRowId}"]`);
    try {
      await locator.waitFor({
        state: 'visible',
        timeout: TestTimeouts.ELEMENT_WAIT,
      });
    } catch {
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
      const nsNode = this.locator(`[id="projectSelector/#single-cluster#/${namespace}"]`);
      if (await nsNode.isVisible()) {
        await nsNode.click();
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      }
      await locator.waitFor({
        state: 'visible',
        timeout: TestTimeouts.ELEMENT_WAIT,
      });
    }
    await this.robustClick(locator);
  }

  async clickVmInTreeView(vmName: string, namespace: string): Promise<void> {
    await this.clickTreeNodeAndEnsureExpanded(namespace, vmName, namespace);
    const vmId = this.locator(`[id="#single-cluster#/${namespace}/${vmName}"]`);
    await vmId.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(vmId);
  }

  async getTreeViewNodeIconViewBoxes(timeout = TestTimeouts.ELEMENT_WAIT): Promise<string[]> {
    try {
      const nodeIcons = this.locator('.pf-v6-c-tree-view__node-icon svg');
      await nodeIcons.first().waitFor({ state: 'visible', timeout });
      const count = await nodeIcons.count();
      const viewBoxes = new Set<string>();
      for (let i = 0; i < count; i++) {
        const viewBox = await nodeIcons.nth(i).getAttribute('viewBox');
        if (viewBox) viewBoxes.add(viewBox);
      }
      return [...viewBoxes];
    } catch {
      return [];
    }
  }

  async doTreeViewNodesHaveDistinguishableIcons(
    timeout = TestTimeouts.ELEMENT_WAIT,
  ): Promise<boolean> {
    const viewBoxes = await this.getTreeViewNodeIconViewBoxes(timeout);
    return viewBoxes.length >= 2;
  }

  async verifyVmsTreeviewExists(): Promise<boolean> {
    try {
      await this._vmsTreeview.waitFor({
        state: 'visible',
        timeout: TestTimeouts.ELEMENT_WAIT,
      });
      return await this._vmsTreeview.isVisible().catch(() => false);
    } catch {
      return false;
    }
  }

  async toggleTreeviewDrawer(): Promise<boolean> {
    await this.locator('#vms-tree-view-panel .vms-tree-view__panel-toggle-button').click();
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    return await this._treeView.isVisible().catch(() => false);
  }

  async isTreeviewVisible(): Promise<boolean> {
    return await this._treeView.isVisible().catch(() => false);
  }

  async isTreeviewNotVisible(): Promise<boolean> {
    return !(await this._treeView.isVisible().catch(() => false));
  }

  async createProject(projectName: string): Promise<void> {
    const allProjectsNode = this._treeNode.filter({ hasText: 'All projects' }).first();
    await allProjectsNode.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await allProjectsNode.click({ button: 'right' });
    await this.page.waitForTimeout(TestTimeouts.UI_ANIMATION_DELAY);

    const createProjectOption = this.locator('button:has-text("Create project")');
    await createProjectOption.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await createProjectOption.click();

    const modal = this.locator('#tab-modal');
    await modal.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });

    await this._projectName.clear();
    await this._projectName.fill(projectName);

    const createButton = this.locator('[data-test="save-button"]');
    await createButton.click();

    await modal.waitFor({ state: 'hidden', timeout: TestTimeouts.ELEMENT_WAIT });
  }

  async clickTreeNode(nodeName: string): Promise<void> {
    const nodeId = `projectSelector/#single-cluster#/${nodeName}`;
    const node = this.locator(`[id="${nodeId}"]`);
    try {
      await node.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    } catch {
      await this.searchTreeView(nodeName);
      await node.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    }
    await node.click();
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  }

  async clickProjectNode(namespace: string): Promise<void> {
    const nodeId = `projectSelector/#single-cluster#/${namespace}`;
    const containerNode = this.locator(`[id="${nodeId}"]`);

    const waitForNode = async (): Promise<void> => {
      await containerNode.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    };

    try {
      await waitForNode();
    } catch {
      await this.searchTreeView(namespace);
      await waitForNode();
    }

    const nodeTextButton = containerNode.locator('button.pf-v6-c-tree-view__node-text');
    const hasNodeText = await nodeTextButton.isVisible().catch(() => false);
    const target = hasNodeText ? nodeTextButton : containerNode;

    try {
      await target.click({ timeout: TestTimeouts.UI_DELAY_MEDIUM });
    } catch {
      await target.dispatchEvent('click');
    }

    if (!this.page.url().includes(`/ns/${namespace}/`)) {
      await this.page
        .waitForURL((url) => url.pathname.includes(`/ns/${namespace}/`), {
          timeout: TestTimeouts.DEFAULT,
        })
        .catch(() => undefined);
    }
  }

  async clickTreeNodeAndEnsureExpanded(
    nodeName: string,
    vmName?: string,
    namespace?: string,
  ): Promise<void> {
    await this.clickTreeNode(nodeName);

    let needsExpansion = false;

    if (vmName && namespace) {
      const vmId = this.locator(`[id="#single-cluster#/${namespace}/${vmName}"]`);
      const isVmVisible = await vmId
        .isVisible({ timeout: TestTimeouts.SHORT_WAIT })
        .catch(() => false);
      needsExpansion = !isVmVisible;
    } else {
      const nodeId = `projectSelector/#single-cluster#/${nodeName}`;
      const expandButton = this.locator(`[id="${nodeId}"] button svg`);
      const expandButtonExists = await expandButton
        .isVisible({ timeout: TestTimeouts.SHORT_WAIT })
        .catch(() => false);

      if (expandButtonExists) {
        const node = this.locator(`[id="${nodeId}"]`);
        const ariaExpanded = await node.getAttribute('aria-expanded').catch(() => null);
        needsExpansion = ariaExpanded === 'false';
      }
    }

    if (needsExpansion) {
      await this.expandTreeNode(nodeName);
    }
  }

  async expandTreeNode(nodeName: string): Promise<void> {
    const nodeId = `projectSelector/#single-cluster#/${nodeName}`;
    const expandButton = this.locator(`[id="${nodeId}"] button svg`);
    await expandButton.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await expandButton.click();
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  }

  async getTreeNodeCount(nodeName: string): Promise<null | string> {
    try {
      const node = this._treeNode.filter({ hasText: nodeName });
      await node.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      const countElement = node.locator('.pf-v6-c-tree-view__node-count');
      const countText = await countElement.textContent();
      return countText?.trim() || null;
    } catch {
      return null;
    }
  }

  async isTreeNodeVisible(nodeName: string): Promise<boolean> {
    try {
      const node = this._treeNode.filter({ hasText: nodeName });
      return await node.isVisible({ timeout: TestTimeouts.SHORT_WAIT }).catch(() => false);
    } catch {
      return false;
    }
  }

  async toggleEmptyProjectsDisplay(show: boolean): Promise<void> {
    const checkbox = this.locator('.vms-tree-view__toolbar-switch input[type="checkbox"]');

    try {
      await checkbox.waitFor({ state: 'attached', timeout: TestTimeouts.ELEMENT_WAIT });
    } catch {
      return;
    }

    const isChecked = await checkbox.isChecked().catch(() => false);
    const desiredState = !show;

    if (isChecked !== desiredState) {
      await checkbox.setChecked(desiredState, { force: true });
    }

    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  }

  async navigateToAllProjects(): Promise<void> {
    const allProjectsNode = this.page.getByRole('treeitem', { name: /All projects/ });
    await allProjectsNode.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(allProjectsNode);
  }

  async searchTreeView(searchText: string): Promise<void> {
    const searchInput = this._idVmsTreeViewSearchInput;
    try {
      await searchInput.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    } catch {
      await this._nav.clickNavVirtualMachines();
      await this.page.waitForLoadState('networkidle');
      await searchInput.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    }
    await searchInput.clear();
    await searchInput.pressSequentially(searchText, { delay: 250 });
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);
  }

  async clearTreeViewSearch(): Promise<void> {
    const searchInput = this._idVmsTreeViewSearchInput;
    await searchInput.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await searchInput.clear();
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  }

  async getTreeViewMatchedCount(): Promise<null | string> {
    try {
      const heading = this.locator(
        'h6:has-text("projects found"), h6:has-text("clusters found"), h6:has-text("project found"), h6:has-text("cluster found")',
      );
      await heading.first().waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      return await heading.first().textContent();
    } catch {
      return null;
    }
  }

  async clickFolderNode(folderName: string, namespace: string): Promise<void> {
    const nodeId = `folderSelector/#single-cluster#/${namespace}/${folderName}`;
    const node = this.locator(`[id="${nodeId}"]`);
    await node.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await node.click();
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  }
}
