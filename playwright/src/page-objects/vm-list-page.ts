import { CatalogPage } from '@/page-objects/catalog-page';
import type { VmDetailPage } from '@/page-objects/vm-detail-page';
import { dismissConsoleObstructions } from '@/utils/console-modals';
import { pollUntil } from '@/utils/poll-until';
import { MINUTE, TestTimeouts } from '@/utils/test-config';
import type { Locator } from '@playwright/test';

import { ResourceListPage } from './resource-list-page';

export class VmListPage extends ResourceListPage {
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
    return new RegExp(`/ns/${namespace}/(vm-wizard|templatescatalog)`);
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
  async createFromCatalog(): Promise<void> {
    const wizardCreate = this.fromCatalogMenuItem();
    if (await wizardCreate.isVisible().catch(() => false)) {
      await wizardCreate.click();
    } else {
      await this.openCreateDropdown();
      await this.page.getByRole('menuitem', { name: /From template/i }).click();
    }
    const catalog = new CatalogPage(this.page);
    if (await catalog.shouldUseLegacyCatalogRoute()) {
      const match = this.page.url().match(/\/ns\/([^/]+)\//);
      const namespace = match?.[1] ?? 'openshift';
      await catalog.openLegacyCatalogInNamespace(namespace);
      return;
    }
    await catalog.prepareTemplateCatalogGrid();
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
    await this.createFromCatalog();
  }

  async goToNamespaceList(namespace: string): Promise<void> {
    await dismissConsoleObstructions(this.page);
    await this.gotoList(`/k8s/ns/${namespace}/kubevirt.io~v1~VirtualMachine`);
    await dismissConsoleObstructions(this.page);
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
    const create = this.page.getByTestId('item-create').getByRole('button', { name: /^Create/ });
    if (await create.isVisible().catch(() => false)) {
      await create.click();
      return;
    }
    await this.page.getByTestId('item-create').getByRole('button').first().click();
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

  quickStartsVirtualKeywordUrlPattern(): RegExp {
    return /keyword=virtual/i;
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
        const row = this.vmRow(name, namespace).or(this.row(name));
        if (await row.isVisible().catch(() => false)) {
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

  vmRow(name: string, namespace?: string): Locator {
    if (namespace) {
      return this.page
        .locator(`a[data-test-id="${name}"][href*="/ns/${namespace}/"]`)
        .or(this.page.getByRole('link', { name: new RegExp(name) }))
        .first();
    }
    return this.page.locator(`[data-test-id="${name}"]`).first();
  }

  /** Delete from VM detail Actions (preferred after YAML/catalog create lands on detail). */
  async deleteFromDetail(vmDetail: VmDetailPage, name: string): Promise<void> {
    await vmDetail.openDeleteDialogFromActions();
    await this.confirmDelete(name);
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
}
