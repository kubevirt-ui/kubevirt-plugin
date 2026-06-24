// VirtualMachinesPage — Page object for virtual machines interactions.

import { VmListActionsComponent } from '@/components/vm/vm-list-actions-components';
import {
  VmListFiltersComponent,
  VmListTreeComponent,
} from '@/components/vm/vm-list-filters-components';
import { VmListOverviewWidgetsComponent } from '@/components/vm/vm-list-overview-components';
import { VmListSearchComponent } from '@/components/vm/vm-list-search-components';
import {
  VmListEmptyStateComponent,
  VmListMigrationComponent,
  VmListTemplateCreateComponent,
} from '@/components/vm/vm-list-state-migration-components';
import PageCommons from '@/page-objects/page-commons';
import { TreeContextMenuMixin } from '@/page-objects/vm/tree-context-menu-mixin';
import VmListPage from '@/page-objects/vm/vm-list-page';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

export class VirtualMachinesPage extends TreeContextMenuMixin(PageCommons) {
  readonly search: VmListSearchComponent;
  readonly listActions: VmListActionsComponent;
  readonly listFilters: VmListFiltersComponent;
  readonly listMigration: VmListMigrationComponent;
  readonly overviewWidgets: VmListOverviewWidgetsComponent;
  readonly templateCreate: VmListTemplateCreateComponent;
  readonly tree: VmListTreeComponent;
  readonly listPage: VmListPage;
  readonly emptyState: VmListEmptyStateComponent;

  readonly _inputPlaceholderSearchFolder = this.locator('input[placeholder="Search folder"]');

  constructor(page: Page) {
    super(page);
    this.templateCreate = new VmListTemplateCreateComponent(page);
    this.tree = new VmListTreeComponent(page);
    this.listPage = new VmListPage(page);
    this.emptyState = new VmListEmptyStateComponent(page);
    this.search = new VmListSearchComponent(page);
    this.listActions = new VmListActionsComponent(page);
    this.listFilters = new VmListFiltersComponent(page);
    this.listMigration = new VmListMigrationComponent(page, (vm) =>
      this.listActions.openVmRowActions(vm),
    );
    this.overviewWidgets = new VmListOverviewWidgetsComponent(page, {
      searchTreeView: (t) => this.tree.searchTreeView(t),
    });
  }

  // --- Navigation methods (previously delegated, use this.goTo/this.navigation directly) ---

  async navigateToFolderScopedVirtualMachines(
    namespace: string,
    folderName: string,
  ): Promise<void> {
    const label = encodeURIComponent(`vm.openshift.io/folder=${folderName}`);
    await this.goTo(`/k8s/ns/${namespace}/kubevirt.io~v1~VirtualMachine?labels=${label}`);
  }

  async navigateToVirtualMachinesViaUI(): Promise<void> {
    await this.navigation.clickNavVirtualMachines();
  }

  async navigateToNamespaceVirtualMachinesViaUI(namespace: string): Promise<void> {
    await this.navigation.clickNavVirtualMachines();
    await this.page.waitForLoadState('domcontentloaded');
    if (this.page.url().includes(`/ns/${namespace}/`)) {
      return;
    }
    await this.tree.searchTreeView(namespace);
    await this.tree.clickProjectNode(namespace);
  }

  async verifyCloneInfoAlertVisible(): Promise<boolean> {
    const alertText =
      'The cloning process will continue after you close the modal. The cloned VirtualMachine may take some time to appear.';
    const alert = this.page.getByText(alertText);
    try {
      await alert.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
      return true;
    } catch {
      return false;
    }
  }

  async fillMoveToFolderSearch(folderName: string): Promise<void> {
    await this._inputPlaceholderSearchFolder.clear();
    await this._inputPlaceholderSearchFolder.fill(folderName);
  }

  async clickFolderOption(folderName: string): Promise<void> {
    const existingFolderOption = this.locator(`#select-typeahead-${folderName}`);
    const exists = await existingFolderOption.isVisible().catch(() => false);

    if (exists) {
      await this.robustClick(existingFolderOption);
    } else {
      const createOption = this.page.getByRole('option', { name: `Create "${folderName}"` });
      await this.robustClick(createOption);
    }
  }

  // --- Delegation shortcuts ---

  override async clickCreateAndSelectOption(
    option: 'From InstanceType' | 'From template' | 'With YAML',
  ): Promise<void> {
    return this.templateCreate.clickVmListCreateSplitOption(option);
  }

  override async clickTemplateByTestId(templateTestId: string) {
    return this.templateCreate.clickTemplateByTestId(templateTestId);
  }

  override async waitForTemplateForm() {
    return this.templateCreate.waitForTemplateForm();
  }

  async clickActionsDropdown() {
    return this.listActions.clickActionsDropdown();
  }

  async clickKebabButton(): Promise<void> {
    return this.listActions.clickKebabButton();
  }

  async hoverOverControlMenu(): Promise<void> {
    return this.listActions.hoverOverControlMenu();
  }

  override async verifyPageLoaded(
    vmNameOrIndicators?: string | string[],
    includeCreateButton?: boolean,
    timeout?: number,
  ): Promise<boolean> {
    return this.listFilters.verifyPageLoaded(vmNameOrIndicators, includeCreateButton, timeout);
  }

  async clickClearAllFilters(): Promise<void> {
    return this.listFilters.clickClearAllFilters();
  }

  private readonly _exportButton = this.locator('[data-test="export-table-data"]');

  async isExportButtonVisible(
    timeout: number = TestTimeouts.UI_ELEMENT_VISIBILITY,
  ): Promise<boolean> {
    return this._exportButton
      .waitFor({ state: 'visible', timeout })
      .then(() => true)
      .catch(() => false);
  }

  async getExportButtonAriaLabel(): Promise<null | string> {
    return this._exportButton.getAttribute('aria-label');
  }

  async clickExportButton(): Promise<void> {
    await this.robustClick(this._exportButton);
  }

  async isExportButtonDisabled(): Promise<boolean> {
    return (await this._exportButton.getAttribute('aria-disabled')) === 'true';
  }

  async clickExportAndGetCSVContent(timeout = 5000): Promise<string> {
    return this.page.evaluate(async (ms: number) => {
      return new Promise<string>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('CSV blob not captured')), ms);
        const origCreateObjectURL = URL.createObjectURL;
        URL.createObjectURL = (blob: Blob) => {
          clearTimeout(timer);
          blob.text().then(resolve);
          return origCreateObjectURL(blob);
        };
        const exportBtn = document.querySelector<HTMLButtonElement>(
          '[data-test="export-table-data"]',
        );
        exportBtn?.click();
      });
    }, timeout);
  }

  async isVmListOrEmptyStateVisible(): Promise<boolean> {
    const indicator = this.locator('table tbody, [data-test="empty-state"], .pf-v6-c-empty-state');
    return (await indicator.count()) > 0;
  }

  async isErrorBoundaryVisible(): Promise<boolean> {
    const boundary = this.locator(
      '[data-test="error-boundary"], .pf-v6-c-empty-state--xs h4:has-text("Something went wrong")',
    );
    return (await boundary.count()) > 0;
  }

  async hasTableRows(): Promise<boolean> {
    return (await this.locator('tbody tr').count()) > 0;
  }
}

export default VirtualMachinesPage;
