import { VmWizardPage } from '@/page-objects/vm-wizard-page';
import type { VmDetailPage } from '@/page-objects/vm-detail-page';
import { dismissConsoleObstructions } from '@/utils/console-modals';
import { ConsoleRoutes } from '@/utils/console-routes';
import { SINGLE_CLUSTER_KEY } from '@/utils/constants';
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
    // 4.22+ Create action uses bare `/vm-wizard` (no /ns/… prefix).
    return new RegExp(
      `(?:/ns/${namespace}/(catalog|vm-wizard|templatescatalog)|/vm-wizard(?:\\?|$))`,
    );
  }

  columnCheckbox(ariaLabelledBy: string): Locator {
    return this.page.locator(`input[aria-labelledby="${ariaLabelledBy}"]`);
  }

  columnHeader(ariaLabel: string): Locator {
    const scope = this.page.locator('main');
    return scope
      .getByRole('button', { name: ariaLabel, exact: true })
      .or(scope.locator(`th[data-label="${ariaLabel}"]`))
      .or(scope.getByRole('columnheader', { name: ariaLabel, exact: true }))
      .first();
  }

  columnManagementPanel(): Locator {
    return this.page.getByRole('dialog').filter({
      has: this.page.getByRole('heading', { name: /Manage columns/i }),
    });
  }

  vmListGrid(): Locator {
    return this.page.locator('main').getByRole('grid').first();
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
    const wizard = new VmWizardPage(this.page);
    const ns = namespace ?? this.page.url().match(/\/ns\/([^/]+)\//)?.[1] ?? 'default';

    const finishCatalogEntry = async (): Promise<void> => {
      if (await wizard.shouldUseLegacyCatalogRoute()) {
        await wizard.openLegacyCatalogInNamespace(ns);
        return;
      }
      await wizard.prepareTemplateCatalogGrid();
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
            .waitForURL(/\/(catalog|vm-wizard)/, { timeout: TestTimeouts.ELEMENT_WAIT })
            .catch(() => undefined);
          return /\/(catalog|vm-wizard)/.test(this.page.url());
        }

        await dismissConsoleObstructions(this.page);
        await this.openCreateDropdown();
        const fromTemplate = this.fromTemplateCatalogMenuItem();
        if (await fromTemplate.isVisible().catch(() => false)) {
          await fromTemplate.click();
          await this.page
            .waitForURL(/\/(catalog|vm-wizard)/, { timeout: TestTimeouts.ELEMENT_WAIT })
            .catch(() => undefined);
          return /\/(catalog|vm-wizard)/.test(this.page.url());
        }

        await this.page.keyboard.press('Escape').catch(() => undefined);
        return false;
      },
      {
        message: 'Reach VM wizard from VM list Create menu or empty-state link',
        timeout: TestTimeouts.LONG_OPERATION,
      },
    ).catch(() => false);

    if (!enteredCatalog) {
      await wizard.openVmWizardInNamespace(ns);
    }

    await finishCatalogEntry();
  }

  private vmCreationWizardShell(): Locator {
    return this.page
      .locator('.pf-v6-c-wizard.vm-creation-wizard, .vm-creation-wizard')
      .or(
        this.page.locator('.pf-v6-c-wizard').filter({
          hasText: /Create VirtualMachine|Select a creation method/i,
        }),
      )
      .first();
  }

  /**
   * OpenShift 4.22+ `/vm-wizard`. Cold deep-links 404 until the kubevirt console plugin
   * is loaded, so prime via the namespace VM list, then navigate. Tree Create is the
   * fallback when the route is still unregistered.
   */
  async openVmCreationWizard(namespace: string): Promise<void> {
    await this.goToNamespaceList(namespace);
    await dismissConsoleObstructions(this.page);
    await this.page.goto(ConsoleRoutes.vmWizard(namespace), {
      timeout: TestTimeouts.CONSOLE_PAGE_LOAD,
      waitUntil: 'domcontentloaded',
    });
    await dismissConsoleObstructions(this.page);

    // Under parallel load the console can take minutes to serve the plugin route. Probing for only
    // one minute used to declare the route broken and fall back to the (much slower) tree flow,
    // which then blew the per-test budget in beforeEach. Give the direct route time + one reload.
    let opened = await this.waitForWizardShell(TestTimeouts.RESOURCE_CREATION);
    if (!opened && !(await this.wizardRouteMissing())) {
      await this.page
        .reload({ timeout: TestTimeouts.CONSOLE_PAGE_LOAD, waitUntil: 'domcontentloaded' })
        .catch(() => undefined);
      await dismissConsoleObstructions(this.page);
      opened = await this.waitForWizardShell(TestTimeouts.RESOURCE_CREATION);
    }
    if (!opened && !(await this.wizardRouteMissing())) {
      await this.page
        .goto(ConsoleRoutes.vmWizard(namespace), {
          timeout: TestTimeouts.CONSOLE_PAGE_LOAD,
          waitUntil: 'domcontentloaded',
        })
        .catch(() => undefined);
      await dismissConsoleObstructions(this.page);
      opened = await this.waitForWizardShell(TestTimeouts.RESOURCE_CREATION);
    }

    if (!opened) {
      await this.openVmCreationWizardFromTreeNamespace(namespace);
    }

    await this.page.waitForURL(/\/vm-wizard/, { timeout: TestTimeouts.ELEMENT_WAIT });
    await this.vmCreationWizardShell().waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
  }

  /** Polls for the wizard shell; returns false as soon as the console reports the route missing. */
  private async waitForWizardShell(timeout: number): Promise<boolean> {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      if (
        await this.vmCreationWizardShell()
          .isVisible()
          .catch(() => false)
      ) {
        return true;
      }
      if (await this.wizardRouteMissing()) {
        return false;
      }
      await this.page.waitForTimeout(500);
    }
    return false;
  }

  private async wizardRouteMissing(): Promise<boolean> {
    return (
      (await this.consoleNotFoundHeading()
        .isVisible()
        .catch(() => false)) ||
      (await this.page
        .getByText(/doesn't have a resource type "vm-wizard"/i)
        .isVisible()
        .catch(() => false)) ||
      (await this.consoleResourceTypeMissingText()
        .isVisible()
        .catch(() => false))
    );
  }

  /** All-namespaces tree: right-click project → **Create VirtualMachine** → `/vm-wizard`. */
  async openVmCreationWizardFromTreeNamespace(namespace: string): Promise<void> {
    await this.goToAllNamespacesList();
    await this.showProjectsWithoutVmsInTree();
    const projectTreeId = this.projectTreeItemId(namespace);
    await pollUntil(
      async () => {
        await this.searchTreeView(namespace);
        return this.treeItemById(projectTreeId)
          .isVisible()
          .catch(() => false);
      },
      {
        message: `Project ${namespace} should appear in VM tree`,
        timeout: TestTimeouts.VM_OPERATION,
      },
    );
    await this.rightClickTreeItem(projectTreeId, {
      selectItem: true,
      waitForActionId: 'create-vm',
    });
    await this.clickTreeContextMenuAction('create-vm');
    await this.page.waitForURL(/\/vm-wizard/, { timeout: TestTimeouts.ELEMENT_WAIT });
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
        await this.goToNamespaceList(namespace);
      } else {
        await pollUntil(
          async () =>
            (await this.virtualMachineListCreateControl()
              .isVisible()
              .catch(() => false)) ||
            (await this.tourStepCreateButtonRoot()
              .isVisible()
              .catch(() => false)) ||
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
      }
      await this.openYamlImportFromTourCreateDropdown();
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
    // Prefer empty-state / list create — not the page-heading Create toggle or tree Create.
    return this.page
      .locator(
        '.VirtualMachineEmptyState, .pf-v6-c-empty-state, .pf-v5-c-empty-state, .pf-c-empty-state',
      )
      .getByRole('button', { name: /^Create VirtualMachine$|^Create$/i })
      .or(this.page.locator('.VirtualMachineEmptyState [data-test="item-create"]'))
      .or(this.page.locator('main [data-test="item-create"]').filter({ hasText: /Create/i }))
      .first();
  }

  emptyStateHeading(): Locator {
    return this.page
      .getByText(/No VirtualMachines found/i)
      .or(this.page.getByRole('heading', { name: /No virtual machines yet/i }))
      .or(this.page.getByText(/Create your first virtual machine/i))
      .first();
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
    await this.gotoList(`/k8s/ns/${namespace}/kubevirt.io~v1~VirtualMachine?tab=vms`);
    await dismissConsoleObstructions(this.page);
    await this.ensureVirtualMachinesListTab();
    await this.waitForVmListLoaded();
  }

  /** Namespace VM route can land on Overview tab; list actions live on Virtual machines tab. */
  async ensureVirtualMachinesListTab(): Promise<void> {
    const url = this.page.url();
    if (!url.includes('tab=vms')) {
      const base = url.split('?')[0] ?? url;
      await this.page.goto(`${base}?tab=vms`, { waitUntil: 'domcontentloaded' });
      await dismissConsoleObstructions(this.page);
    }
    const vmsTabHref = this.page.locator('main a[href*="tab=vms"]').first();
    if (await vmsTabHref.isVisible().catch(() => false)) {
      await this.robustClick(vmsTabHref);
      await this.page.waitForTimeout(300);
    }
    const tab = this.page
      .locator('[data-test="vm-list-tab"]')
      .or(this.page.getByRole('tab', { name: /^Virtual machines$/i }));
    if (
      !(await tab
        .first()
        .isVisible()
        .catch(() => false))
    ) {
      return;
    }
    if ((await tab.first().getAttribute('aria-selected')) === 'true') {
      return;
    }
    await this.robustClick(tab.first());
    await this.page.waitForTimeout(500);
  }

  /** VM watch + column metadata finished (full empty state or standard list header). */
  async waitForVmListLoaded(): Promise<void> {
    await pollUntil(
      async () => {
        await dismissConsoleObstructions(this.page);
        const empty = await this.page
          .locator('.VirtualMachineEmptyState')
          .isVisible()
          .catch(() => false);
        if (empty) {
          return await this.emptyStateCreateVirtualMachineButton()
            .isVisible()
            .catch(() => false);
        }
        // Prefer concrete list chrome over brittle h1 `.or()` chains (can hang under load).
        if (
          await this.page
            .getByPlaceholder(/Search virtual machines/i)
            .first()
            .isVisible()
            .catch(() => false)
        ) {
          return true;
        }
        if (
          await this.page
            .locator('[role="grid"] a[href*="VirtualMachine"]')
            .first()
            .isVisible()
            .catch(() => false)
        ) {
          return true;
        }
        return await this.page
          .getByRole('heading', { level: 1, name: /VirtualMachines/i })
          .first()
          .isVisible()
          .catch(() => false);
      },
      {
        message: 'VirtualMachines list should finish loading',
        timeout: TestTimeouts.VM_OPERATION,
      },
    );
  }

  isOnVirtualMachineDetail(namespace: string, name: string): boolean {
    const url = this.resourceConsolePath(this.currentUrl());
    return this.virtualMachineDetailUrlPattern(name).test(url) && url.includes(`/ns/${namespace}/`);
  }

  learnHowToUseVirtualMachinesButton(): Locator {
    return this.page
      .getByRole('link', { name: /Learn how to use VirtualMachines/i })
      .or(this.page.getByRole('button', { name: /Learn how to use VirtualMachines/i }));
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

  override async openCreateDropdown(): Promise<void> {
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
  override async openDeleteDialog(name: string, namespace?: string): Promise<void> {
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
  /** Opens console Quick Starts filtered by virtual machine (4.22 stable route). */
  async openQuickStartsForVirtualMachineKeyword(): Promise<void> {
    await this.page.goto('/quickstart?keyword=virtual+machine', { waitUntil: 'domcontentloaded' });
    await this.page.waitForURL(this.quickStartsCatalogUrlPattern(), {
      timeout: TestTimeouts.LONG_OPERATION,
    });
    await this.quickStartsHeading().waitFor({
      state: 'visible',
      timeout: TestTimeouts.LONG_OPERATION,
    });
  }

  /** Matches `history.push({ pathname: '/quickstart', search: '?keyword=virtual+machine' })`. */
  quickStartsVirtualKeywordUrlPattern(): RegExp {
    return /\/quickstart\?.*keyword=virtual(\+machine|%2Bmachine|%20machine)/i;
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
    const panel = this.columnManagementPanel();
    const labelText = (
      (await panel
        .locator(`#${ariaLabelledBy}`)
        .textContent()
        .catch(() => null)) ?? columnId
    ).trim();
    const checkbox = panel.getByRole('checkbox', { name: labelText, exact: true });
    if ((await checkbox.isChecked().catch(() => false)) === checked) {
      return;
    }
    await checkbox.click({ force: true });
    await pollUntil(async () => (await checkbox.isChecked().catch(() => !checked)) === checked, {
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
    const exactName = this.page
      .getByRole('link', { exact: true, name })
      .or(this.page.getByRole('button', { exact: true, name }));
    if (namespace) {
      return this.page
        .locator(`a[href*="/ns/${namespace}/kubevirt.io~v1~VirtualMachine/${name}"]`)
        .or(this.nameLink(name))
        .or(exactName)
        .or(this.page.getByTestId(name))
        .first();
    }
    return this.nameLink(name).or(exactName).or(this.page.getByTestId(name)).first();
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
    return this.vmTreeViewPanel().getByRole('button', { name: /^Create project$/i });
  }

  projectTreeItemId(namespace: string): string {
    return `projectSelector/${SINGLE_CLUSTER_KEY}/${namespace}`;
  }

  vmTreeItemId(namespace: string, vmName: string): string {
    return `${SINGLE_CLUSTER_KEY}/${namespace}/${vmName}`;
  }

  treeItemById(treeItemId: string): Locator {
    const escaped = treeItemId.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    return this.vmTreeViewPanel().locator(`[id="${escaped}"]`);
  }

  /** VM action menus use `data-test-id`; Playwright `getByTestId` is wired to `data-test`. */
  private treeContextAction(actionTestId: string): Locator {
    // ActionDropdownItem renders `data-test={action.id}` (not data-test-id).
    return this.page
      .locator(
        `.right-click-action-menu [data-test="${actionTestId}"], .right-click-action-menu [data-test-id="${actionTestId}"]`,
      )
      .first();
  }

  async goToAllNamespacesList(): Promise<void> {
    await dismissConsoleObstructions(this.page);
    await this.page.addInitScript(() => {
      localStorage.setItem('showTreeView', 'show');
      localStorage.setItem('treeViewLastWidth', '400px');
      localStorage.setItem('showEmptyProjects', 'show');
    });
    // Default VirtualMachines URL can land on Overview (no tree); force VMs list tab.
    await this.gotoList('/k8s/all-namespaces/kubevirt.io~v1~VirtualMachine?tab=vms');
    await this.listPageHeading(/^VirtualMachines$/i).waitFor({
      timeout: TestTimeouts.LONG_OPERATION,
    });
    await this.ensureVirtualMachinesListTab();
    await this.ensureTreeViewOpen();
    await this.showProjectsWithoutVmsInTree();
    await this.vmTreeViewPanel()
      .getByRole('tree')
      .waitFor({ state: 'visible', timeout: TestTimeouts.LONG_OPERATION });
  }

  async ensureTreeViewOpen(): Promise<void> {
    await this.ensureVirtualMachinesListTab();
    await pollUntil(
      async () => {
        await this.page.evaluate(() => {
          localStorage.setItem('showTreeView', 'show');
          localStorage.setItem('treeViewLastWidth', '400px');
          const panel = document.getElementById('vms-tree-view-panel');
          panel?.style.setProperty('--pf-v6-c-drawer__panel--md--FlexBasis', '400px');
        });
        const panel = this.vmTreeViewPanel();
        if (!(await panel.isVisible().catch(() => false))) {
          // Panel may be attached but collapsed / not mounted until VMs tab is active.
          await this.ensureVirtualMachinesListTab();
        }
        if (
          (await this.createProjectFromTreeButton()
            .isVisible()
            .catch(() => false)) ||
          (await panel
            .getByRole('tree')
            .isVisible()
            .catch(() => false))
        ) {
          return true;
        }
        const toggle = this.page
          .locator('.vms-tree-view__panel-toggle-button, [aria-label*="tree" i]')
          .first();
        if (await toggle.isVisible().catch(() => false)) {
          await this.robustClick(toggle);
        }
        return (
          (await this.createProjectFromTreeButton()
            .isVisible()
            .catch(() => false)) ||
          (await panel
            .getByRole('tree')
            .isVisible()
            .catch(() => false))
        );
      },
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
    await this.dismissConsoleObstructions();
    const search = this.treeViewSearchInput();
    if (await search.isVisible().catch(() => false)) {
      await search.clear();
      // Sequential typing matches console debounce better than fill().
      await search.pressSequentially(query, { delay: 50 });
      await this.page.waitForTimeout(TestTimeouts.UI_STABILIZE);
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
    await pollUntil(
      async () => {
        await this.page.keyboard.press('Escape').catch(() => undefined);
        const target = this.vmTreeViewPanel()
          .getByRole('button', { name: /^Local cluster$/i })
          .first();
        if (!(await target.isVisible().catch(() => false))) {
          return false;
        }
        await target.click({ button: 'right', force: true });
        const action = this.treeContextAction('create-project').or(
          this.page.getByRole('menuitem', { name: /^Create project$/i }),
        );
        return (
          (await action
            .first()
            .isVisible()
            .catch(() => false)) &&
          (await action
            .first()
            .isEnabled()
            .catch(() => false))
        );
      },
      {
        message: 'Create project action should appear in tree context menu',
        timeout: TestTimeouts.ELEMENT_WAIT,
      },
    );
    await this.clickTreeContextMenuAction('create-project');
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
    await this.showProjectsWithoutVmsInTree();
    // Tree search filters projects only — search namespace, then expand to reveal the VM leaf.
    await this.searchTreeView(namespace);
    await this.expandProjectTreeNode(namespace);
    const vmTreeId = this.vmTreeItemId(namespace, vmName);
    await this.waitForTreeItemVisible(vmTreeId);
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
    const createVmByName =
      actionTestId === 'create-vm'
        ? menu.getByRole('menuitem', { name: /^Create VirtualMachine$/i }).first()
        : null;
    await pollUntil(
      async () => {
        if (actionTestId === 'create-vm' && /\/vm-wizard/.test(this.page.url())) {
          return true;
        }
        for (const target of [actionItem, createVmByName].filter(Boolean) as Locator[]) {
          if (!(await target.isVisible().catch(() => false))) {
            continue;
          }
          await target.click({ force: true }).catch(() => undefined);
          if (actionTestId === 'create-vm' && /\/vm-wizard/.test(this.page.url())) {
            return true;
          }
          if (!(await menu.isVisible().catch(() => false))) {
            return true;
          }
          // Menu stayed open — click registered as no-op; try again next poll.
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
    const vmMatch = treeItemId.match(
      new RegExp(`^${SINGLE_CLUSTER_KEY.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/([^/]+)/([^/]+)$`),
    );
    const vmName = vmMatch?.[2];
    const namespace = vmMatch?.[1];

    await pollUntil(
      async () => {
        if (
          await this.treeItemById(treeItemId)
            .isVisible()
            .catch(() => false)
        ) {
          return true;
        }
        if (vmName && namespace) {
          const escapedVm = vmName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const byButton = this.vmTreeViewPanel().getByRole('button', {
            name: vmName,
            exact: true,
          });
          const byTreeitem = this.vmTreeViewPanel().getByRole('treeitem', {
            name: new RegExp(`^${escapedVm}(\\s|$)`, 'i'),
          });
          if (
            (await byButton.isVisible().catch(() => false)) ||
            (await byTreeitem.isVisible().catch(() => false))
          ) {
            return true;
          }
          // Search filters projects only — never search by VM name here.
          await this.searchTreeView(namespace);
          await this.expandProjectTreeNode(namespace);
          const escapedNs = namespace.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const projectItem = this.vmTreeViewPanel().getByRole('treeitem', {
            name: new RegExp(`^${escapedNs}(\\s|$)`, 'i'),
          });
          if (
            (await projectItem.isVisible().catch(() => false)) &&
            (await projectItem.getAttribute('aria-expanded').catch(() => null)) !== 'true'
          ) {
            await projectItem
              .getByRole('button', { name: new RegExp(`^${escapedNs}\\s+\\d+`, 'i') })
              .click()
              .catch(() => projectItem.click().catch(() => undefined));
          }
        }
        return false;
      },
      {
        message: `Tree item ${treeItemId} should be visible`,
        timeout,
      },
    );
  }

  private async expandProjectTreeNode(namespace: string): Promise<boolean> {
    const projectTreeId = this.projectTreeItemId(namespace);
    const escapedNs = namespace.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const projectById = this.treeItemById(projectTreeId);
    const projectByRole = this.vmTreeViewPanel().getByRole('treeitem', {
      name: new RegExp(`^${escapedNs}(\\s|$)`, 'i'),
    });
    const project = (await projectById.isVisible().catch(() => false))
      ? projectById
      : projectByRole.first();
    if (!(await project.isVisible().catch(() => false))) {
      return false;
    }
    if ((await project.getAttribute('aria-expanded').catch(() => null)) === 'true') {
      return true;
    }
    // Chevron / toggle button (kubevirt-ui: `button svg` under project node).
    const chevron = projectById
      .locator('button')
      .filter({ has: this.page.locator('svg') })
      .first();
    if (await chevron.isVisible().catch(() => false)) {
      await chevron.click();
    } else {
      await project
        .getByRole('button', { name: new RegExp(`^${escapedNs}\\s+\\d+`, 'i') })
        .click()
        .catch(() => undefined);
    }
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    return (await project.getAttribute('aria-expanded').catch(() => null)) === 'true';
  }

  /** Tree search matches project names — open VM detail from the side tree after API seed. */
  async openVmFromTree(namespace: string, vmName: string): Promise<void> {
    const vmTreeId = this.vmTreeItemId(namespace, vmName);
    const escapedVm = vmName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    await pollUntil(
      async () => {
        await this.dismissConsoleObstructions();
        await this.showProjectsWithoutVmsInTree();
        // Search box filters projects only — do not replace with the VM name.
        await this.searchTreeView(namespace);

        const emptyTree = this.vmTreeViewPanel().getByRole('heading', {
          name: /No projects with VirtualMachines found/i,
        });
        if (await emptyTree.isVisible().catch(() => false)) {
          await this.page.reload({ waitUntil: 'domcontentloaded' });
          await this.listPageHeading(/^VirtualMachines$/i).waitFor({
            timeout: TestTimeouts.LONG_OPERATION,
          });
          await this.ensureVirtualMachinesListTab();
          await this.ensureTreeViewOpen();
          await this.showProjectsWithoutVmsInTree();
          return false;
        }

        if (!(await this.expandProjectTreeNode(namespace))) {
          return false;
        }

        const vmNode = this.treeItemById(vmTreeId)
          .or(
            this.vmTreeViewPanel().getByRole('treeitem', {
              name: new RegExp(`^${escapedVm}(\\s|$)`, 'i'),
            }),
          )
          .or(this.vmTreeViewPanel().getByRole('button', { name: vmName, exact: true }))
          .first();
        if (!(await vmNode.isVisible().catch(() => false))) {
          return false;
        }
        // Click while still visible — tree can collapse between poll success and a later click.
        await vmNode.click({ force: true });
        return true;
      },
      {
        message: `VM ${namespace}/${vmName} should appear in tree`,
        timeout: TestTimeouts.LONG_OPERATION,
      },
    );
  }
}
