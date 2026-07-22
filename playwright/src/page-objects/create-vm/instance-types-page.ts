/**
 * Page object for the InstanceTypes list and detail pages.
 */

import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

import PageCommons from '../page-commons';

export default class InstanceTypesPage extends PageCommons {
  private readonly _clusterInstanceTypesBtn = this.locator(
    'button:has-text("Cluster InstanceTypes")',
  );
  private readonly _filterToolbarClusterButton = this.testId('filter-toolbar')
    .or(this.locator('#filter-toolbar'))
    .locator('button')
    .filter({ hasText: 'Cluster' })
    .first();
  private readonly _inputnameFilterInput = this.testId('item-filter').or(
    this.testId('name-filter-input'),
  );
  private readonly _noInstanceTypeMessage = this.locator('#no-instancetype-msg');
  private readonly _userInstanceTypesTab = this.locator('button:has-text("User InstanceTypes")');
  constructor(page: Page) {
    super(page);
  }

  private userTabNameFilterInput() {
    return this.page
      .locator('[id^="pf-tab-section-1-"]')
      .locator('[data-test="item-filter"]')
      .or(this.page.locator('[id^="pf-tab-section-1-"]').getByTestId('name-filter-input'));
  }

  async clickClusterInstanceTypesTab() {
    await this._clusterInstanceTypesBtn.click();
  }

  override async clickCreate() {
    await this.page.waitForLoadState('domcontentloaded');
    const createLink = this.locator('a[href*="~new"] button')
      .or(this.testId('item-create'))
      .or(this.locator('button:has-text("Create VirtualMachine")'))
      .first();
    await createLink.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(createLink);
  }

  async clickDetailsActions() {
    const actionsBtn = this.testId('actions-menu-button');
    await actionsBtn.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(actionsBtn);
  }

  async clickInstanceTypeByTestId(name: string): Promise<void> {
    const row = this.testId(name).first();
    await row.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(row);
  }

  override async clickSaveChanges() {
    await this._saveChangesButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(this._saveChangesButton);
  }

  async clickUserInstanceTypesTab() {
    await this._userInstanceTypesTab.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async deleteClusterInstanceTypeFromDetail(): Promise<void> {
    const actionsBtn = this.testId('actions-menu-button');
    await actionsBtn.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(actionsBtn);
    const deleteItem = this.page.locator(
      '[role="menuitem"]:has-text("Delete VirtualMachineClusterInstancetype")',
    );
    await deleteItem.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await deleteItem.click();
    const confirmBtn = this.testId('save-button');
    await confirmBtn.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await confirmBtn.click();
    await this.page.waitForURL(/VirtualMachineClusterInstancetype(?!.*\/[^/]+$)/, {
      timeout: TestTimeouts.DEFAULT,
    });
  }

  async deleteUserInstanceTypeFromDetail(): Promise<void> {
    const actionsBtn = this.testId('actions-menu-button');
    await actionsBtn.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(actionsBtn);
    const deleteItem = this.page.locator(
      '[role="menuitem"]:has-text("Delete VirtualMachineInstancetype")',
    );
    await deleteItem.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await deleteItem.click();
    const confirmBtn = this.testId('save-button');
    await confirmBtn.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await confirmBtn.click();
    await this.page.waitForURL(/VirtualMachineInstancetype(?!.*\/[^/]+$)/, {
      timeout: TestTimeouts.DEFAULT,
    });
  }

  override async filterByName(name: string) {
    const visibleInput = this._inputnameFilterInput.first();
    await visibleInput.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await visibleInput.clear();
    await visibleInput.fill(name);
    await this.page.waitForTimeout(TestTimeouts.UI_FILTER_APPLY / 3);
    await this.page
      .waitForLoadState('domcontentloaded', { timeout: TestTimeouts.UI_ACTION_COMPLETE })
      .catch(() => undefined);
  }

  async filterByNameInUserTab(name: string) {
    const input = await this.userTabNameFilterInput();
    await input.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await input.clear();
    await input.fill(name);
  }

  async getNameDetailsValue(): Promise<string> {
    return (
      (await this.locator('[data-test-selector="details-item-value__Name"]').textContent()) || ''
    );
  }

  async navigateToClusterInstanceTypeDetail(name: string): Promise<void> {
    await this.clickNavInstanceTypes();
    await this.waitForInstanceTypesListReady();
    await this.filterByName(name);
    await this.clickInstanceTypeByTestId(name);
    await this.page.waitForLoadState('domcontentloaded');
  }

  /** @deprecated Use navigateToInstanceTypesViaUI() for more reliable navigation */
  async navigateToClusterInstanceTypes() {
    await this.clickNavInstanceTypes();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async navigateToCrdPage(crdPlural: string): Promise<void> {
    await this.goTo(`/k8s/cluster/customresourcedefinitions/${crdPlural}/instances`);
    await this.page.waitForLoadState('load');
  }

  async navigateToInstanceTypesViaInstancetypeNavItem(): Promise<void> {
    const instancetypeNavItem = this.testId('instancetype-nav-item');
    await instancetypeNavItem.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(instancetypeNavItem);
    await this.page.waitForLoadState('load', { timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
  }

  async navigateToInstanceTypesViaUI(): Promise<void> {
    await this.switchToVirtualizationPerspective();
    await this.clickNavInstanceTypes();
  }

  async navigateToNamespaceInstanceTypesViaUI(namespace: string): Promise<void> {
    await this.clickNavInstanceTypes();
    await this.switchProject(namespace);
  }

  async navigateToProjectInstanceTypes() {
    const vmciNav = this.testId('virtualmachineclusterinstancetypes-nav-item');
    await vmciNav.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(vmciNav);
  }

  async navigateToUserInstanceTypeDetail(namespace: string, name: string): Promise<void> {
    await this.clickNavInstanceTypes();
    await this.clickUserInstanceTypesTab();
    await this.waitForInstanceTypesListReady();
    await this.navigateToUserInstanceTypesProject(namespace);
    await this.filterByNameInUserTab(name);
    await this.clickInstanceTypeByTestId(name);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async navigateToUserInstanceTypesAllNamespaces() {
    await this.clickNavInstanceTypes();
    await this.clickUserInstanceTypesTab();
    await this.switchProject('All Projects');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async navigateToUserInstanceTypesProject(projectName: string) {
    await this.switchProject(projectName);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async openClusterFilter(): Promise<void> {
    await this._filterToolbarClusterButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(this._filterToolbarClusterButton);
  }

  async selectClusterInFilterMenu(clusterName: string): Promise<void> {
    const clusterOption = this.locator('#checkbox-select li', { hasText: clusterName }).first();
    await clusterOption.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(clusterOption);
  }

  async verifyClusterFilterButtonVisible(): Promise<boolean> {
    try {
      await this._filterToolbarClusterButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      return await this._filterToolbarClusterButton.isVisible();
    } catch {
      return false;
    }
  }

  verifyCrdPageNotRedirected(expectedPathFragment: string): boolean {
    const url = this.page.url();
    const notRedirected = !url.includes('/dashboard') || url.includes(expectedPathFragment);
    return notRedirected && url.includes(expectedPathFragment);
  }

  async verifyEmptyMessageVisible(): Promise<boolean> {
    try {
      const emptyIndicator = this._noInstanceTypeMessage.or(
        this.testId('empty-box-body').or(this.locator('.pf-v6-c-empty-state, .pf-c-empty-state')),
      );
      const emptyVisible = await emptyIndicator
        .first()
        .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
        .then(() => true)
        .catch(() => false);
      if (emptyVisible) {
        const text = await emptyIndicator.first().textContent();
        return (
          text?.includes('No VirtualMachineClusterInstanceType found') ||
          text?.includes('No resources found') ||
          text?.includes('No results') ||
          text?.includes('not found') ||
          false
        );
      }
      const tableBody = this.locator('table tbody, [class*="table"] tbody');
      const rows = tableBody.locator('tr');
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      return (await rows.count()) === 0;
    } catch {
      return false;
    }
  }

  async verifyInstanceTypeExists(
    instanceTypeId: string,
    timeout = TestTimeouts.UI_DELAY_LONG,
  ): Promise<boolean> {
    try {
      const instanceType = this.testId(instanceTypeId).or(
        this.locator(`a:has-text("${instanceTypeId}")`),
      );
      await instanceType.first().waitFor({ state: 'visible', timeout });
      return await instanceType.first().isVisible();
    } catch {
      return false;
    }
  }

  async verifyInstanceTypesPageLoaded(expectedInstanceType = 'cx1.2xlarge'): Promise<boolean> {
    try {
      const loc = this.locator(`text=${expectedInstanceType}`).first();
      await loc.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      return await loc.isVisible().catch(() => false);
    } catch {
      return false;
    }
  }

  async verifyUserInstanceTypesTabReady(
    timeout = TestTimeouts.UI_ELEMENT_VISIBILITY,
  ): Promise<{ state: 'populated' | 'empty'; rowCount: number }> {
    await this.waitForInstanceTypesListReady();
    const emptyState = this.locator('.pf-v6-c-empty-state');
    const hasEmpty = await emptyState
      .waitFor({ state: 'visible', timeout })
      .then(() => true)
      .catch(() => false);
    if (!hasEmpty) {
      const rows = this.locator('tbody tr');
      const rowCount = await rows.count().catch(() => 0);
      if (rowCount > 0) return { state: 'populated', rowCount };
    }
    return { state: 'empty', rowCount: 0 };
  }

  async waitForInstanceTypesListReady(timeoutMs = TestTimeouts.UI_FILTER_APPLY): Promise<void> {
    await this.waitForCondition(
      async () => {
        const tabsVisible = await this._clusterInstanceTypesBtn.isVisible().catch(() => false);
        const emptyVisible = await this._noInstanceTypeMessage.isVisible().catch(() => false);
        const nameFilterVisible = await this.testId('item-filter')
          .or(this.testId('name-filter-input'))
          .or(this.locator('input[placeholder*="Search by name"]'))
          .first()
          .isVisible()
          .catch(() => false);
        return tabsVisible || emptyVisible || nameFilterVisible;
      },
      timeoutMs,
      TestTimeouts.POLLING_INTERVAL,
    );
  }
}
