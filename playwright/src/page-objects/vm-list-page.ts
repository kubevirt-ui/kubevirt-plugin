import { dismissConsoleObstructions } from '@/utils/console-modals';
import { MINUTE, TestTimeouts } from '@/utils/test-config';
import type { Locator } from '@playwright/test';

import { ResourceListPage } from './resource-list-page';

export class VmListPage extends ResourceListPage {
  vmRow(name: string, namespace?: string): Locator {
    if (namespace) {
      return this.page.locator(`a[data-test-id="${name}"][href*="/ns/${namespace}/"]`).first();
    }
    return this.page.locator(`[data-test-id="${name}"]`).first();
  }

  columnHeader(ariaLabel: string): Locator {
    return this.page
      .locator(`th[aria-label="${ariaLabel}"]`)
      .or(this.page.getByRole('columnheader', { name: ariaLabel }))
      .or(this.page.locator('thead').getByText(ariaLabel, { exact: true }));
  }

  columnManagementButton(): Locator {
    return this.page.locator('button[aria-label="Column management"]');
  }

  columnCheckbox(ariaLabelledBy: string): Locator {
    return this.page.locator(`input[aria-labelledby="${ariaLabelledBy}"]`);
  }

  saveColumnManagementButton(): Locator {
    return this.page.getByRole('button', { name: 'Save' });
  }

  resetColumnManagementButton(): Locator {
    return this.page
      .getByRole('button', { name: /Restore default columns/i })
      .or(this.page.getByRole('link', { name: /Restore default columns/i }))
      .or(this.page.getByRole('button', { name: 'Reset' }));
  }

  emptyState(): Locator {
    return this.page.locator('.pf-v6-c-empty-state, .pf-c-empty-state').first();
  }

  emptyStateHeading(): Locator {
    return this.emptyState().getByRole('heading', { name: /No VirtualMachines found/i });
  }

  learnHowToUseVirtualMachinesButton(): Locator {
    return this.emptyState().getByRole('button', { name: /Learn how to use VirtualMachines/i });
  }

  emptyStateCatalogTabLink(): Locator {
    return this.emptyState().getByRole('button', { name: /catalog tab/i });
  }

  emptyStateCreateVirtualMachineButton(): Locator {
    return this.emptyState().getByRole('button', { name: /^Create VirtualMachine$/i });
  }

  async goToNamespaceList(namespace: string): Promise<void> {
    await dismissConsoleObstructions(this.page);
    await this.gotoList(`/k8s/ns/${namespace}/kubevirt.io~v1~VirtualMachine`);
    await dismissConsoleObstructions(this.page);
  }

  async openLearnHowToUseVirtualMachinesQuickStart(): Promise<void> {
    await this.learnHowToUseVirtualMachinesButton().click();
  }

  quickStartTile(title: string | RegExp): Locator {
    return this.page
      .locator('[data-test="quick-start-card"], .ocs-quick-start-card, .pf-v6-c-card, .pf-c-card')
      .filter({ hasText: title })
      .first();
  }

  creatingVmQuickStartTile(): Locator {
    return this.page
      .getByTestId('tile creating-virtual-machine')
      .or(this.quickStartTile(/Creating a virtual machine/i));
  }

  creatingVmQuickStartPanelHeading(): Locator {
    return this.page
      .locator('[data-test-id="quickstart drawer"] h1, .pfext-quick-start-panel-content__name')
      .filter({ hasText: /Creating a virtual machine/i })
      .first();
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

  fromCatalogMenuItem(): Locator {
    return this.page.getByRole('menuitem', { name: /From catalog/i });
  }

  async openCreateDropdown(): Promise<void> {
    const create = this.page.getByTestId('item-create').getByRole('button', { name: /^Create/ });
    if (await create.isVisible().catch(() => false)) {
      await create.click();
      return;
    }
    await this.page.getByTestId('item-create').getByRole('button').first().click();
  }

  /** VM list → Create → From catalog (navigates to project templatescatalog). */
  async createFromCatalog(): Promise<void> {
    await this.openCreateDropdown();
    await this.fromCatalogMenuItem().click();
  }

  async goToCreateFromCatalog(namespace: string): Promise<void> {
    await this.goToNamespaceList(namespace);
    await this.createFromCatalog();
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

  async openColumnManagement(): Promise<void> {
    const manageColumns = this.testId('manage-columns');
    if (await manageColumns.isVisible().catch(() => false)) {
      await this.filterToolbar.clickManageColumns();
      return;
    }
    await this.robustClick(this.columnManagementButton());
  }

  async setColumnChecked(ariaLabelledBy: string, checked: boolean): Promise<void> {
    const input = this.columnCheckbox(ariaLabelledBy);
    if (checked) {
      await input.check();
    } else {
      await input.uncheck();
    }
  }

  async resetColumnManagement(): Promise<void> {
    const resetAction = this.locator('button#reset-action');
    if (await resetAction.isVisible().catch(() => false)) {
      await this.filterToolbar.clickReset();
      return;
    }
    await this.robustClick(this.resetColumnManagementButton());
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

  /** Column prefs are stored in console user-settings — wait for table header after save. */
  async waitForColumnHeader(label: string, timeout = 2 * MINUTE): Promise<void> {
    const header = this.columnHeader(label);
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      if (await header.isVisible().catch(() => false)) {
        return;
      }
      await this.page.waitForTimeout(TestTimeouts.NETWORK_DELAY);
    }
    await dismissConsoleObstructions(this.page);
    await this.page.reload({ waitUntil: 'domcontentloaded' });
    await dismissConsoleObstructions(this.page);
    await header.waitFor({
      state: 'visible',
      timeout: Math.max(deadline - Date.now(), TestTimeouts.ELEMENT_WAIT),
    });
  }
}
