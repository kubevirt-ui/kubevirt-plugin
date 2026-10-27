import { CatalogPage } from '@/page-objects/catalog-page';
import type { VmDetailPage } from '@/page-objects/vm-detail-page';
import { dismissConsoleObstructions } from '@/utils/console-modals';
import { pollUntil } from '@/utils/poll-until';
import { TestTimeouts } from '@/utils/test-config';
import type { Locator } from '@playwright/test';

import { ResourceListPage } from './resource-list-page';

export class VmListPage extends ResourceListPage {
  /** Opens VM list Create dropdown when present; empty-state / header links skip the menu. */
  private async openVmCreateMenuForCatalog(): Promise<boolean> {
    if (
      await this.emptyStateCreateVirtualMachineButton()
        .isVisible()
        .catch(() => false)
    ) {
      return false;
    }
    try {
      await super.openCreateDropdown(/Create VirtualMachine|^Create$/i);
    } catch {
      return false;
    }
    return await this.page
      .getByRole('menu')
      .filter({ visible: true })
      .first()
      .isVisible()
      .catch(() => false);
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
    return this.page.locator(`th[data-label="${ariaLabel}"]`).first();
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

    const directCreate = this.page
      .locator('main')
      .getByRole('link', { name: /^Create VirtualMachine$/i })
      .or(this.emptyStateCreateVirtualMachineButton());
    if (
      await directCreate
        .first()
        .isVisible()
        .catch(() => false)
    ) {
      await this.robustClick(directCreate.first());
      await finishCatalogEntry();
      return;
    }

    const wizardCreate = this.fromCatalogMenuItem();
    if (await wizardCreate.isVisible().catch(() => false)) {
      await this.robustClick(wizardCreate);
    } else {
      const openedMenu = await this.openVmCreateMenuForCatalog();
      if (!openedMenu) {
        await catalog.openCatalogInNamespace(ns);
        await finishCatalogEntry();
        return;
      }
      await this.robustClick(
        this.page.getByRole('menuitem', { name: /From template|From catalog/i }).first(),
      );
    }
    await finishCatalogEntry();
  }

  async createFromYaml(manifestYaml?: string): Promise<void> {
    await this.openCreateDropdown();
    await this.createFromYamlAndSubmit(manifestYaml);
    await this.waitForResourceDetailUrl(/kubevirt\.io~v1~VirtualMachine\/[^/]+(?:\/|$)/);
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
    return this.page.locator('.pf-v6-c-empty-state, .pf-c-empty-state').first();
  }

  emptyStateCatalogTabLink(): Locator {
    return this.emptyState().getByRole('button', { name: /catalog tab/i });
  }

  emptyStateCreateVirtualMachineButton(): Locator {
    return this.emptyState().getByRole('button', { name: /^Create VirtualMachine$/i });
  }

  emptyStateHeading(): Locator {
    return this.emptyState().getByRole('heading', { name: /No VirtualMachines found/i });
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
  }

  isOnVirtualMachineDetail(namespace: string, name: string): boolean {
    const url = this.currentUrl();
    return this.virtualMachineDetailUrlPattern(name).test(url) && url.includes(`/ns/${namespace}/`);
  }

  learnHowToUseVirtualMachinesButton(): Locator {
    return this.emptyState().getByRole('button', { name: /Learn how to use VirtualMachines/i });
  }

  async openColumnManagement(): Promise<void> {
    const manageColumns = this.testId('manage-columns');
    if (await manageColumns.isVisible().catch(() => false)) {
      await this.filterToolbar.clickManageColumns();
      return;
    }
    await this.robustClick(this.columnManagementButton());
  }

  async openCreateDropdown(): Promise<void> {
    await super.openCreateDropdown(/Create VirtualMachine|^Create$/i);
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
    const url = this.currentUrl();
    if (!url.includes(`/ns/${namespace}/`)) {
      return fallbackName;
    }
    return url.match(/kubevirt\.io~v1~VirtualMachine\/([^/?#]+)/)?.[1] ?? fallbackName;
  }

  async saveColumnManagement(): Promise<void> {
    const saveByTestId = this.testId('save-button');
    if (await saveByTestId.isVisible().catch(() => false)) {
      await this.filterToolbar.saveColumns();
    } else {
      await this.robustClick(this.saveColumnManagementButton());
    }
    await this.page.getByRole('heading', { name: /Manage columns/i }).waitFor({ state: 'hidden' });
    await this.page.waitForTimeout(TestTimeouts.NETWORK_DELAY);
  }

  saveColumnManagementButton(): Locator {
    return this.page.getByRole('button', { name: 'Save' });
  }

  async setColumnChecked(ariaLabelledBy: string, checked: boolean): Promise<void> {
    const input = this.columnCheckbox(ariaLabelledBy);
    if (checked) {
      await input.check();
    } else {
      await input.uncheck();
    }
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
  async waitForColumnHeader(
    label: string,
    options?: { namespace?: string; timeout?: number },
  ): Promise<void> {
    const timeout = options?.timeout ?? TestTimeouts.RESOURCE_CREATION;
    if (options?.namespace) {
      const url = this.currentUrl();
      if (!url.includes(`/ns/${options.namespace}/`) || !url.includes('VirtualMachine')) {
        await this.goToNamespaceList(options.namespace);
      }
    }
    await dismissConsoleObstructions(this.page);
    await this.columnHeader(label).waitFor({ state: 'visible', timeout });
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
}
