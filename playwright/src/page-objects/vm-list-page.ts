import { CatalogPage } from '@/page-objects/catalog-page';
import type { VmDetailPage } from '@/page-objects/vm-detail-page';
import { dismissConsoleObstructions } from '@/utils/console-modals';
import { pollUntil } from '@/utils/poll-until';
import { TestTimeouts } from '@/utils/test-config';
import type { Locator } from '@playwright/test';

import { ResourceListPage } from './resource-list-page';

export class VmListPage extends ResourceListPage {
  private fromTemplateCatalogMenuItem(): Locator {
    return this.page
      .getByTestId('item-create')
      .getByRole('menuitem', { name: /^From template$/i })
      .or(this.page.locator('main').getByRole('menuitem', { name: /^From template$/i }))
      .first();
  }

  private async quickStartRouteUnavailable(): Promise<boolean> {
    return (
      (await this.consoleNotFoundHeading()
        .isVisible()
        .catch(() => false)) ||
      (await this.consoleResourceTypeMissingText()
        .isVisible()
        .catch(() => false))
    );
  }

  private async waitForCreatingVmQuickStartContent(
    timeout = TestTimeouts.LONG_OPERATION,
  ): Promise<boolean> {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      if (await this.quickStartRouteUnavailable()) {
        return false;
      }
      if (
        await this.creatingVmQuickStartContent()
          .isVisible()
          .catch(() => false)
      ) {
        return true;
      }
      await this.page.waitForTimeout(500);
    }
    return await this.creatingVmQuickStartContent()
      .isVisible()
      .catch(() => false);
  }

  catalogEntryUrlPattern(namespace: string): RegExp {
    return new RegExp(`/ns/${namespace}/(catalog|vm-wizard|templatescatalog)`);
  }

  columnCheckbox(ariaLabelledBy: string): Locator {
    return this.page.locator(`input[aria-labelledby="${ariaLabelledBy}"]`);
  }

  columnHeader(ariaLabel: string): Locator {
    const grid = this.vmListGrid();
    return grid
      .getByRole('button', { name: ariaLabel, exact: true })
      .or(grid.locator(`th[data-label="${ariaLabel}"]`))
      .or(grid.getByRole('columnheader', { name: ariaLabel, exact: true }))
      .first();
  }

  columnManagementPanel(): Locator {
    return this.page.getByRole('dialog').filter({
      has: this.page.getByRole('heading', { name: /Manage columns/i }),
    });
  }

  vmListGrid(): Locator {
    return this.page.getByRole('grid').first();
  }

  columnManagementButton(): Locator {
    return this.page.locator('button[aria-label="Column management"]');
  }

  consoleNotFoundHeading(): Locator {
    return this.page.getByRole('heading', { name: /404: Page Not Found/i });
  }

  consoleResourceTypeMissingText(): Locator {
    return this.page.getByText(/doesn't have a resource type/i);
  }

  /** VM list → Create opens template catalog (wizard or legacy “From template”). */
  async createFromCatalog(namespace?: string): Promise<void> {
    const catalog = new CatalogPage(this.page);
    const ns = namespace ?? this.page.url().match(/\/ns\/([^/]+)\//)?.[1] ?? 'default';

    const finishCatalogEntry = async (): Promise<void> => {
      if (await catalog.shouldUseLegacyCatalogRoute()) {
        await catalog.openLegacyCatalogInNamespace(ns);
        return;
      }
      await catalog.prepareTemplateCatalogGrid();
    };

    const enteredCatalog = await pollUntil(
      async () => {
        if (
          await this.emptyStateCatalogTabLink()
            .isVisible()
            .catch(() => false)
        ) {
          await this.robustClick(this.emptyStateCatalogTabLink());
          await this.page
            .waitForURL(/\/catalog/, { timeout: TestTimeouts.ELEMENT_WAIT })
            .catch(() => undefined);
          return /\/catalog/.test(this.page.url());
        }

        await dismissConsoleObstructions(this.page);
        await this.openCreateDropdown();
        const fromTemplate = this.fromTemplateCatalogMenuItem();
        if (await fromTemplate.isVisible().catch(() => false)) {
          await fromTemplate.click();
          await this.page
            .waitForURL(/\/catalog/, { timeout: TestTimeouts.ELEMENT_WAIT })
            .catch(() => undefined);
          return /\/catalog/.test(this.page.url());
        }

        await this.page.keyboard.press('Escape').catch(() => undefined);
        return false;
      },
      {
        message: 'Reach template catalog from VM list Create menu or empty-state catalog link',
        timeout: TestTimeouts.LONG_OPERATION,
      },
    ).catch(() => false);

    if (!enteredCatalog) {
      await catalog.openCatalogInNamespace(ns);
    }

    await finishCatalogEntry();
  }

  async createFromYaml(manifestYaml?: string): Promise<void> {
    const namespace = this.page.url().match(/\/ns\/([^/]+)\//)?.[1];
    const onYamlEditor =
      /VirtualMachine\/~new/i.test(this.page.url()) ||
      (await this.page
        .locator('.monaco-editor')
        .first()
        .isVisible()
        .catch(() => false));

    if (!onYamlEditor) {
      await dismissConsoleObstructions(this.page);
      if (namespace) {
        await this.page.goto(`/k8s/ns/${namespace}/kubevirt.io~v1~VirtualMachine/~new`, {
          waitUntil: 'domcontentloaded',
        });
      } else {
        await pollUntil(
          async () =>
            (await this.emptyStateCreateVirtualMachineButton()
              .isVisible()
              .catch(() => false)) ||
            (await this.page
              .getByTestId('item-create')
              .isVisible()
              .catch(() => false)),
          {
            message: 'VirtualMachine create affordance should be visible',
            timeout: TestTimeouts.LONG_OPERATION,
          },
        );
        try {
          await this.openCreateDropdown();
        } catch {
          throw new Error('VirtualMachine YAML create: no namespace in URL and create menu failed');
        }
      }
    }
    await this.createFromYamlAndSubmit(manifestYaml);
    await this.waitForResourceDetailUrl(/kubevirt\.io~v1~VirtualMachine\/(?!~new)[^/?#]+(?:\/|$)/);
    await this.page
      .getByRole('heading', { level: 1 })
      .first()
      .waitFor({ state: 'visible', timeout: TestTimeouts.RESOURCE_CREATION });
  }

  /** Drawer, full-page, or catalog card — Quick Start content for Creating a VM. */
  creatingVmQuickStartContent(): Locator {
    return this.creatingVmQuickStartPanelHeading()
      .or(this.page.getByRole('heading', { name: /Creating a virtual machine/i }))
      .or(
        this.page
          .locator(
            '.ocs-quick-start-content, .pfext-quick-start-panel-content, [data-test="quick-start-content"]',
          )
          .filter({ hasText: /Creating a virtual machine/i }),
      )
      .first();
  }

  creatingVmQuickStartPanelHeading(): Locator {
    return this.page
      .locator('[data-test-id="quickstart drawer"] h1, .pfext-quick-start-panel-content__name')
      .filter({ hasText: /Creating a virtual machine/i })
      .first();
  }

  creatingVmQuickStartTile(): Locator {
    return this.page
      .getByTestId('tile creating-virtual-machine')
      .or(this.quickStartTile(/Creating a virtual machine/i));
  }

  /** Delete from VM detail Actions (preferred after YAML/catalog create lands on detail). */
  async deleteFromDetail(vmDetail: VmDetailPage, name: string): Promise<void> {
    await vmDetail.openDeleteDialogFromActions();
    await this.confirmDelete(name);
  }

  emptyState(): Locator {
    return this.page
      .locator(
        '.VirtualMachineEmptyState, .pf-v5-c-empty-state, .pf-v6-c-empty-state, .pf-c-empty-state',
      )
      .first();
  }

  emptyStateCatalogTabLink(): Locator {
    return this.page.getByRole('button', { name: /^catalog$/i });
  }

  emptyStateCreateVirtualMachineButton(): Locator {
    return this.page.getByRole('button', { name: /^Create VirtualMachine$/i });
  }

  emptyStateHeading(): Locator {
    return this.page.getByText(/No VirtualMachines found/i).first();
  }

  fromCatalogMenuItem(): Locator {
    return this.page.getByTestId('item-create').getByRole('button', { name: /^Create$/i });
  }

  async goToCreateFromCatalog(namespace: string): Promise<void> {
    await this.goToNamespaceList(namespace);
    await this.createFromCatalog(namespace);
  }

  async goToNamespaceList(namespace: string): Promise<void> {
    await dismissConsoleObstructions(this.page);
    await this.gotoList(`/k8s/ns/${namespace}/kubevirt.io~v1~VirtualMachine`);
    await dismissConsoleObstructions(this.page);
    await this.waitForVmListLoaded();
  }

  /** VM watch + column metadata finished (full empty state or standard list header). */
  async waitForVmListLoaded(): Promise<void> {
    await pollUntil(
      async () => {
        const empty = await this.page
          .locator('.VirtualMachineEmptyState')
          .isVisible()
          .catch(() => false);
        if (empty) {
          return await this.emptyStateCreateVirtualMachineButton()
            .isVisible()
            .catch(() => false);
        }
        return await this.page
          .getByRole('heading', { level: 1, name: /^VirtualMachines$/i })
          .or(
            this.page
              .locator('[data-test-id="resource-title"]')
              .filter({ hasText: /VirtualMachines/i }),
          )
          .first()
          .isVisible()
          .catch(() => false);
      },
      {
        message: 'VirtualMachines list should finish loading',
        timeout: TestTimeouts.LONG_OPERATION,
      },
    );
  }

  isOnVirtualMachineDetail(namespace: string, name: string): boolean {
    const url = this.resourceConsolePath(this.currentUrl());
    return this.virtualMachineDetailUrlPattern(name).test(url) && url.includes(`/ns/${namespace}/`);
  }

  learnHowToUseVirtualMachinesButton(): Locator {
    return this.page.getByRole('link', { name: /Learn how to use VirtualMachines/i });
  }

  async openColumnManagement(): Promise<void> {
    await dismissConsoleObstructions(this.page);
    const manageColumns = this.testId('manage-columns');
    if (await manageColumns.isVisible().catch(() => false)) {
      await this.filterToolbar.clickManageColumns();
    } else {
      await this.robustClick(this.columnManagementButton());
    }
    await this.columnManagementPanel().waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
  }

  async openCreateDropdown(): Promise<void> {
    const emptyCreate = this.emptyStateCreateVirtualMachineButton();
    if (await emptyCreate.isVisible().catch(() => false)) {
      await this.robustClick(emptyCreate);
    } else {
      await super.openCreateDropdown(/Create VirtualMachine|^Create$/i);
    }
    await this.page
      .getByTestId('item-create')
      .getByRole('menu')
      .or(this.page.locator('main').getByRole('menu').filter({ visible: true }))
      .first()
      .waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT })
      .catch(() => undefined);
  }

  /** @deprecated Use {@link openCreatingVirtualMachineQuickStartGuide} */
  async openCreatingVirtualMachineQuickStartFromRoute(): Promise<void> {
    const outcome = await this.openCreatingVirtualMachineQuickStartGuide();
    if (outcome === 'unavailable') {
      return;
    }
    await this.creatingVmQuickStartContent().waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
  }

  /**
   * From Quick Starts (virtual filter), open the Creating a VM guide.
   * @returns `'panel'` when content is visible; `'unavailable'` when the cluster has no such quick start.
   */
  async openCreatingVirtualMachineQuickStartGuide(): Promise<'panel' | 'unavailable'> {
    await this.dismissConsoleObstructions();

    const tile = this.creatingVmQuickStartTile();
    if (await tile.isVisible({ timeout: TestTimeouts.ELEMENT_WAIT }).catch(() => false)) {
      await tile.scrollIntoViewIfNeeded();
      await this.robustClick(tile);
      if (await this.waitForCreatingVmQuickStartContent(TestTimeouts.ELEMENT_WAIT)) {
        return 'panel';
      }
      const title = tile.getByTestId('title');
      if (await title.isVisible().catch(() => false)) {
        await this.robustClick(title);
        if (await this.waitForCreatingVmQuickStartContent(TestTimeouts.ELEMENT_WAIT)) {
          return 'panel';
        }
      }
    }

    try {
      await this.openCreatingVmQuickStartFromList();
      if (await this.waitForCreatingVmQuickStartContent(TestTimeouts.ELEMENT_WAIT)) {
        return 'panel';
      }
    } catch {
      // Fall through to direct route (some consoles only expose the deep link).
    }

    await this.page.goto('/quickstart/creating-virtual-machine', { waitUntil: 'domcontentloaded' });
    if (await this.quickStartRouteUnavailable()) {
      return 'unavailable';
    }
    if (await this.waitForCreatingVmQuickStartContent()) {
      return 'panel';
    }
    return 'unavailable';
  }

  async openCreatingVmQuickStartFromList(): Promise<void> {
    const tile = this.creatingVmQuickStartTile();
    await tile.scrollIntoViewIfNeeded();
    await tile.waitFor({ state: 'visible' });
    await tile.click();

    const heading = this.creatingVmQuickStartPanelHeading();
    if (!(await heading.isVisible().catch(() => false))) {
      const title = tile.getByTestId('title');
      if (await title.isVisible().catch(() => false)) {
        await title.click();
      }
    }
    if (!(await heading.isVisible().catch(() => false))) {
      await this.page.goto('/quickstart/creating-virtual-machine', {
        waitUntil: 'domcontentloaded',
      });
    }
    await heading.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
  }

  /** Ensure the namespace VM list is showing before row kebab → Delete. */
  async openDeleteDialog(name: string, namespace?: string): Promise<void> {
    if (namespace) {
      await this.goToNamespaceList(namespace);
      await this.waitForVmRowInList(name, namespace);
    } else {
      await this.filterByName(name);
      await pollUntil(
        async () =>
          (await this.vmRow(name)
            .isVisible()
            .catch(() => false)) ||
          (await this.row(name)
            .first()
            .isVisible()
            .catch(() => false)),
        {
          intervalMs: 1500,
          message: `VM list row for delete should show ${name}`,
          timeout: TestTimeouts.LONG_OPERATION,
        },
      );
    }
    return super.openDeleteDialog(name);
  }

  async openLearnHowToUseVirtualMachinesQuickStart(): Promise<void> {
    await this.learnHowToUseVirtualMachinesButton().click();
  }

  quickStartTile(title: RegExp | string): Locator {
    return this.page
      .locator('[data-test="quick-start-card"], .ocs-quick-start-card, .pf-v6-c-card, .pf-c-card')
      .filter({ hasText: title })
      .first();
  }

  quickStartsCatalogUrlPattern(): RegExp {
    return /\/quickstart(\?|$)/;
  }

  quickStartsHeading(): Locator {
    return this.page.getByRole('heading', { name: /Quick Starts/i });
  }

  /** Matches `history.push({ pathname: '/quickstart', search: '?keyword=virtual+machine' })`. */
  quickStartsVirtualKeywordUrlPattern(): RegExp {
    return /\/quickstart\?.*keyword=virtual(\+machine|%2Bmachine)/i;
  }

  async resetColumnManagement(): Promise<void> {
    const resetAction = this.locator('button#reset-action');
    if (await resetAction.isVisible().catch(() => false)) {
      await this.filterToolbar.clickReset();
      return;
    }
    await this.robustClick(this.resetColumnManagementButton());
  }

  resetColumnManagementButton(): Locator {
    return this.page
      .getByRole('button', { name: /Restore default columns/i })
      .or(this.page.getByRole('link', { name: /Restore default columns/i }))
      .or(this.page.getByRole('button', { name: 'Reset' }));
  }

  resolvedVirtualMachineName(namespace: string, fallbackName: string): string {
    const url = this.resourceConsolePath(this.currentUrl());
    if (!url.includes(`/ns/${namespace}/`)) {
      return fallbackName;
    }
    const fromUrl = url.match(/kubevirt\.io~v1~VirtualMachine\/([^/?#]+)/)?.[1];
    if (!fromUrl || fromUrl === '~new') {
      return fallbackName;
    }
    return fromUrl;
  }

  async saveColumnManagement(): Promise<void> {
    const panel = this.columnManagementPanel();
    const save = panel
      .locator('[data-test="save-button"]')
      .or(panel.getByRole('button', { name: 'Save' }));
    await this.robustClick(save.first());
    await pollUntil(async () => !(await panel.isVisible().catch(() => false)), {
      message: 'Column management should close after save',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await dismissConsoleObstructions(this.page);
    await this.page.waitForTimeout(TestTimeouts.NETWORK_DELAY);
  }

  saveColumnManagementButton(): Locator {
    return this.page.getByRole('button', { name: 'Save' });
  }

  async setColumnChecked(ariaLabelledBy: string, checked: boolean): Promise<void> {
    const columnId = ariaLabelledBy.replace('table-column-management-item-', '');
    const inputId = `data-list-${columnId}`;
    const panel = this.columnManagementPanel();
    const input = panel.locator(`#${inputId}`);
    if ((await input.isChecked().catch(() => false)) === checked) {
      return;
    }
    await panel
      .locator(`#additional-column-management #${inputId}, #defalt-column-management #${inputId}`)
      .first()
      .click({ force: true });
    await pollUntil(async () => (await input.isChecked().catch(() => !checked)) === checked, {
      message: `Column ${columnId} should be ${checked ? 'checked' : 'unchecked'}`,
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
  }

  virtualMachineDetailUrlPattern(name: string): RegExp {
    return this.resourceDetailUrlPattern('VirtualMachine', name);
  }

  vmListRowLocator(name: string, namespace: string): Locator {
    return this.vmRow(name, namespace).or(this.row(name).first());
  }

  vmRow(name: string, namespace?: string): Locator {
    if (namespace) {
      return this.page
        .locator(`a[href*="/ns/${namespace}/kubevirt.io~v1~VirtualMachine/${name}"]`)
        .or(this.nameLink(name))
        .or(this.page.getByTestId(name))
        .first();
    }
    return this.nameLink(name).or(this.page.getByTestId(name)).first();
  }

  /** Column prefs are stored in console user-settings — wait for table header after save (no reload). */
  async waitForColumnHeaderHidden(
    label: string,
    options?: { namespace?: string; timeout?: number },
  ): Promise<void> {
    const timeout = options?.timeout ?? TestTimeouts.RESOURCE_CREATION;
    const namespace = options?.namespace;
    let reloads = 0;
    await pollUntil(
      async () => {
        await dismissConsoleObstructions(this.page);
        if (
          !(await this.columnHeader(label)
            .isVisible()
            .catch(() => false))
        ) {
          return true;
        }
        reloads += 1;
        if (namespace && reloads % 4 === 0) {
          await this.goToNamespaceList(namespace);
        }
        return false;
      },
      {
        message: `Column header ${label} should be hidden`,
        timeout,
        intervalMs: 1500,
      },
    );
  }

  /** Column prefs are stored in console user-settings — wait for table header after save (no reload). */
  async waitForColumnHeader(
    label: string,
    options?: { namespace?: string; timeout?: number },
  ): Promise<void> {
    const timeout = options?.timeout ?? TestTimeouts.RESOURCE_CREATION;
    const namespace = options?.namespace;
    let reloads = 0;
    await pollUntil(
      async () => {
        if (namespace) {
          const url = this.currentUrl();
          if (!url.includes(`/ns/${namespace}/`) || !url.includes('VirtualMachine')) {
            await this.goToNamespaceList(namespace);
          }
        }
        await dismissConsoleObstructions(this.page);
        if (
          await this.columnHeader(label)
            .isVisible()
            .catch(() => false)
        ) {
          return true;
        }
        reloads += 1;
        if (namespace && reloads % 4 === 0) {
          await this.goToNamespaceList(namespace);
        }
        return false;
      },
      {
        message: `Column header ${label} should be visible`,
        timeout,
        intervalMs: 1500,
      },
    );
  }

  /** Re-navigate while the list still shows a deleted VM (console watch lag). */
  async waitForVmAbsentFromList(
    name: string,
    namespace: string,
    timeout = TestTimeouts.LONG_OPERATION,
  ): Promise<void> {
    let reloads = 0;
    await pollUntil(
      async () => {
        if (!(await this.isListNameVisible(name, namespace))) {
          return true;
        }
        reloads += 1;
        if (reloads % 3 === 0) {
          await dismissConsoleObstructions(this.page);
          await this.page.reload({ waitUntil: 'domcontentloaded' });
          await this.goToNamespaceList(namespace);
        }
        return false;
      },
      {
        intervalMs: 1500,
        message: `VM list should hide ${namespace}/${name}`,
        timeout,
      },
    );
  }

  /** Name filter + row visibility; re-applies filter while the console list catches up. */
  async waitForVmRowInList(
    name: string,
    namespace: string,
    timeout = TestTimeouts.LONG_OPERATION,
  ): Promise<void> {
    let reloads = 0;
    await pollUntil(
      async () => {
        await this.filterByName(name);
        if (await this.isListNameVisible(name, namespace)) {
          return true;
        }
        reloads += 1;
        if (reloads % 5 === 0) {
          await dismissConsoleObstructions(this.page);
          await this.page.reload({ waitUntil: 'domcontentloaded' });
          await this.goToNamespaceList(namespace);
        }
        return false;
      },
      {
        intervalMs: 1500,
        message: `VM list should show ${namespace}/${name}`,
        timeout,
      },
    );
  }

  vmTreeViewPanel(): Locator {
    return this.page.locator('#vms-tree-view-panel');
  }

  treeViewSearchInput(): Locator {
    return this.page.locator('#vms-tree-view-search-input');
  }

  createProjectFromTreeButton(): Locator {
    return this.vmTreeViewPanel().getByRole('button', { name: /^Create Project$/i });
  }

  projectTreeItemId(namespace: string): string {
    return `projectSelector/${namespace}`;
  }

  vmTreeItemId(namespace: string, vmName: string): string {
    return `${namespace}/${vmName}`;
  }

  treeItemById(treeItemId: string): Locator {
    return this.vmTreeViewPanel().locator(`[id="${treeItemId}"]`);
  }

  /** VM action menus use `data-test-id`; Playwright `getByTestId` is wired to `data-test`. */
  private treeContextAction(actionTestId: string): Locator {
    return this.page.locator(`.right-click-action-menu [data-test-id="${actionTestId}"]`);
  }

  async goToAllNamespacesList(): Promise<void> {
    await dismissConsoleObstructions(this.page);
    await this.page.addInitScript(() => {
      localStorage.setItem('showTreeView', 'show');
      localStorage.setItem('treeViewLastWidth', '400px');
      localStorage.setItem('showEmptyProjects', 'show');
    });
    await this.gotoList('/k8s/all-namespaces/kubevirt.io~v1~VirtualMachine');
    await this.listPageHeading(/^VirtualMachines$/i).waitFor({
      timeout: TestTimeouts.LONG_OPERATION,
    });
    await this.ensureTreeViewOpen();
    await this.showProjectsWithoutVmsInTree();
    await this.vmTreeViewPanel()
      .getByRole('tree')
      .waitFor({ state: 'visible', timeout: TestTimeouts.LONG_OPERATION });
  }

  async ensureTreeViewOpen(): Promise<void> {
    await this.vmTreeViewPanel().waitFor({ state: 'attached', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.page.evaluate(() => {
      localStorage.setItem('showTreeView', 'show');
      localStorage.setItem('treeViewLastWidth', '400px');
      const panel = document.getElementById('vms-tree-view-panel');
      panel?.style.setProperty('--pf-v6-c-drawer__panel--md--FlexBasis', '400px');
    });
    if (
      (await this.createProjectFromTreeButton()
        .isVisible()
        .catch(() => false)) ||
      (await this.vmTreeViewPanel()
        .getByRole('tree')
        .isVisible()
        .catch(() => false))
    ) {
      return;
    }
    const toggle = this.page.locator('.vms-tree-view__panel-toggle-button').first();
    if (await toggle.isVisible().catch(() => false)) {
      await this.robustClick(toggle);
    }
    await pollUntil(
      async () =>
        (await this.createProjectFromTreeButton()
          .isVisible()
          .catch(() => false)) ||
        (await this.vmTreeViewPanel()
          .getByRole('tree')
          .isVisible()
          .catch(() => false)),
      {
        message: 'VM tree view panel should open',
        timeout: TestTimeouts.LONG_OPERATION,
      },
    );
  }

  /** Tree toolbar switch hides projects with no VMs when enabled (default on many clusters). */
  async showProjectsWithoutVmsInTree(): Promise<void> {
    await this.page.evaluate(() => localStorage.setItem('showEmptyProjects', 'show'));
    const switchRoot = this.page.locator('.vms-tree-view__toolbar-switch');
    if (!(await switchRoot.isVisible().catch(() => false))) {
      return;
    }
    const input = switchRoot.locator('input[type="checkbox"]');
    if (await input.isChecked().catch(() => false)) {
      await switchRoot.click();
    }
  }

  async searchTreeView(query: string): Promise<void> {
    if (
      await this.treeViewSearchInput()
        .isVisible()
        .catch(() => false)
    ) {
      await this.treeViewSearchInput().fill(query);
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      return;
    }
    const allProjects = this.page.getByRole('treeitem', { name: /^All projects/i }).first();
    if (await allProjects.isVisible().catch(() => false)) {
      await allProjects.click();
    }
    await this.page
      .getByRole('treeitem', {
        name: new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'),
      })
      .first()
      .scrollIntoViewIfNeeded()
      .catch(() => undefined);
  }

  async createProjectFromTree(projectName: string): Promise<void> {
    await this.ensureTreeViewOpen();
    await this.robustClick(this.createProjectFromTreeButton());
    const modal = this.page
      .getByRole('dialog')
      .filter({ has: this.page.getByRole('heading', { name: /^Create project$/i }) })
      .last();
    await modal.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await modal.locator('#project-name').fill(projectName);
    await this.robustClick(modal.getByRole('button', { name: /^Create$/i, exact: true }));
    await modal.waitFor({ state: 'hidden', timeout: TestTimeouts.RESOURCE_CREATION });
  }

  async rightClickTreeItem(
    treeItemId: string,
    options?: { selectItem?: boolean; waitForActionId?: string },
  ): Promise<void> {
    await this.waitForTreeItemVisible(treeItemId);
    const target = this.treeItemById(treeItemId);
    if (options?.selectItem) {
      await target.click().catch(() => undefined);
      await this.page.waitForTimeout(300);
    }
    await target.scrollIntoViewIfNeeded().catch(() => undefined);
    const dispatchContextMenu = async (): Promise<void> => {
      if (treeItemId.startsWith('projectSelector/')) {
        const namespace = treeItemId.replace(/^projectSelector\//, '');
        const escaped = namespace.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const projectItem = this.vmTreeViewPanel().getByRole('treeitem', {
          name: new RegExp(`^${escaped}(\\s|$)`),
        });
        await projectItem.click({ button: 'right', force: true }).catch(() => undefined);
      } else {
        await this.treeItemById(treeItemId)
          .click({ button: 'right', force: true })
          .catch(() => undefined);
      }
      const menu = this.page.locator('.right-click-action-menu');
      if (await menu.isVisible().catch(() => false)) {
        return;
      }
      await target.evaluate((_, id) => {
        document.getElementById(id)?.dispatchEvent(
          new MouseEvent('contextmenu', {
            bubbles: true,
            button: 2,
            buttons: 2,
            cancelable: true,
            view: window,
          }),
        );
      }, treeItemId);
    };
    await pollUntil(
      async () => {
        await this.page.keyboard.press('Escape').catch(() => undefined);
        await dispatchContextMenu();
        const menu = this.page.locator('.right-click-action-menu');
        if (!(await menu.isVisible().catch(() => false))) {
          return false;
        }
        if (
          options?.waitForActionId === 'vm-action-delete' &&
          (await this.treeContextAction('create-vm')
            .isVisible()
            .catch(() => false))
        ) {
          return false;
        }
        if (options?.waitForActionId) {
          const action = this.treeContextAction(options.waitForActionId);
          if (
            (await action.isVisible().catch(() => false)) &&
            (await action.isEnabled().catch(() => false))
          ) {
            return true;
          }
          if (options.waitForActionId === 'create-vm') {
            const createItem = menu.getByRole('menuitem', { name: /^Create VirtualMachine$/i });
            return (
              (await createItem.isVisible().catch(() => false)) &&
              (await createItem.isEnabled().catch(() => false))
            );
          }
          return false;
        }
        return true;
      },
      {
        message: `Right-click menu for tree item ${treeItemId}`,
        timeout: TestTimeouts.ELEMENT_WAIT,
      },
    );
  }

  async deleteVirtualMachineFromTreeContext(namespace: string, vmName: string): Promise<void> {
    await this.goToAllNamespacesList();
    const vmTreeId = this.vmTreeItemId(namespace, vmName);
    const projectTreeId = this.projectTreeItemId(namespace);
    await pollUntil(
      async () => {
        await this.searchTreeView(vmName);
        if (
          await this.treeItemById(projectTreeId)
            .isVisible()
            .catch(() => false)
        ) {
          await this.treeItemById(projectTreeId)
            .click()
            .catch(() => undefined);
        }
        return this.treeItemById(vmTreeId)
          .isVisible()
          .catch(() => false);
      },
      {
        message: `VM ${namespace}/${vmName} should appear in tree`,
        timeout: TestTimeouts.LONG_OPERATION,
      },
    );
    await this.rightClickTreeItem(vmTreeId, {
      waitForActionId: 'vm-action-delete',
    });
    await this.clickTreeContextMenuAction('vm-action-delete');
    const bulkDeleteModal = this.page
      .getByRole('dialog')
      .filter({ hasText: /Delete.*VirtualMachine/i })
      .first();
    await bulkDeleteModal.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(bulkDeleteModal.getByRole('button', { name: /^Delete$/i }).first());
    await bulkDeleteModal.waitFor({ state: 'hidden', timeout: TestTimeouts.LONG_OPERATION });
  }

  async clickTreeContextMenuAction(actionTestId: string): Promise<void> {
    const menu = this.page.locator('.right-click-action-menu');
    await menu.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    const actionItem = this.treeContextAction(actionTestId);
    await pollUntil(
      async () => {
        if (await actionItem.isVisible().catch(() => false)) {
          await this.robustClick(actionItem);
          return true;
        }
        const menuitem = this.page.getByRole('menuitem').filter({ has: actionItem });
        if (await menuitem.isVisible().catch(() => false)) {
          await this.robustClick(menuitem);
          return true;
        }
        return false;
      },
      {
        message: `Tree context menu action ${actionTestId} should be clickable`,
        timeout: TestTimeouts.ELEMENT_WAIT,
      },
    );
    await menu
      .waitFor({ state: 'hidden', timeout: TestTimeouts.ELEMENT_WAIT })
      .catch(() => undefined);
  }

  async waitForTreeItemVisible(
    treeItemId: string,
    timeout = TestTimeouts.LONG_OPERATION,
  ): Promise<void> {
    await pollUntil(
      async () =>
        this.treeItemById(treeItemId)
          .isVisible()
          .catch(() => false),
      {
        message: `Tree item ${treeItemId} should be visible`,
        timeout,
      },
    );
  }
}
