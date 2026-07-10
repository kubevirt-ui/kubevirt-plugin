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
  private readonly _filterToolbarClusterButton = this.locator(
    '[data-test="filter-toolbar"], #filter-toolbar',
  )
    .locator('button')
    .filter({ hasText: 'Cluster' })
    .first();
  private readonly _inputnameFilterInput = this.locator('input[data-test="name-filter-input"]');
  private readonly _noInstanceTypeMessage = this.locator('#no-instancetype-msg');
  private readonly _userInstanceTypesTab = this.locator('button:has-text("User InstanceTypes")');
  constructor(page: Page) {
    super(page);
  }

  private userTabNameFilterInput() {
    return this.page
      .locator('[id^="pf-tab-section-1-"]')
      .locator('input[data-test="name-filter-input"]');
  }

  async clickClusterInstanceTypesTab() {
    await this._clusterInstanceTypesBtn.click();
  }

  override async clickCreate() {
    await this.page.waitForLoadState('domcontentloaded');
    const createLink = this.locator(
      'a[href*="~new"] button, [data-test="item-create"], button:has-text("Create VirtualMachine")',
    ).first();
    await createLink.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(createLink);
  }

  async clickDetailsActions() {
    const detailsActions = this.locator('[data-test-id="details-actions"]')
      .locator('button')
      .first();
    await detailsActions.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(detailsActions);
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
    const actionsBtn = this.locator('[data-test-id="actions-menu-button"]');
    await actionsBtn.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(actionsBtn);
    const deleteItem = this.page.locator(
      '[role="menuitem"]:has-text("Delete VirtualMachineClusterInstancetype")',
    );
    await deleteItem.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await deleteItem.click();
    const confirmBtn = this.page.locator('[data-test="confirm-action"]');
    await confirmBtn.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await confirmBtn.click();
    await this.page.waitForURL(/VirtualMachineClusterInstancetype(?!.*\/[^/]+$)/, {
      timeout: TestTimeouts.DEFAULT,
    });
  }

  async deleteUserInstanceTypeFromDetail(): Promise<void> {
    const actionsBtn = this.locator('[data-test-id="actions-menu-button"]');
    await actionsBtn.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(actionsBtn);
    const deleteItem = this.page.locator(
      '[role="menuitem"]:has-text("Delete VirtualMachineInstancetype")',
    );
    await deleteItem.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await deleteItem.click();
    const confirmBtn = this.page.locator('[data-test="confirm-action"]');
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
    await this.goTo(
      `/k8s/cluster/instancetype.kubevirt.io~v1beta1~VirtualMachineClusterInstancetype/${name}`,
    );
    await this.page.waitForLoadState('load', { timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
  }

  /** @deprecated Use navigateToInstanceTypesViaUI() for more reliable navigation */
  async navigateToClusterInstanceTypes() {
    await this.goTo(
      '/k8s/cluster/instancetype.kubevirt.io~v1beta1~VirtualMachineClusterInstancetype',
    );
  }

  async navigateToCrdPage(crdPlural: string): Promise<void> {
    await this.goTo(`/k8s/cluster/customresourcedefinitions/${crdPlural}/instances`);
    await this.page.waitForLoadState('load');
  }

  async navigateToInstanceTypesViaInstancetypeNavItem(): Promise<void> {
    const instancetypeNavItem = this.locator('[data-test-id="instancetype-nav-item"]');
    await instancetypeNavItem.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(instancetypeNavItem);
    await this.page.waitForLoadState('load', { timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
  }

  async navigateToInstanceTypesViaUI(): Promise<void> {
    try {
      await this.clickNavInstanceTypes();
    } catch {
      await this.navigateToClusterInstanceTypes();
    }
  }

  async navigateToProjectInstanceTypes() {
    const vmciNav = this.locator('[data-test-id="virtualmachineclusterinstancetypes-nav-item"]');
    await vmciNav.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(vmciNav);
  }

  async navigateToUserInstanceTypeDetail(namespace: string, name: string): Promise<void> {
    await this.goTo(
      `/k8s/ns/${namespace}/instancetype.kubevirt.io~v1beta1~VirtualMachineInstancetype/${name}`,
    );
    await this.page.waitForLoadState('load', { timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
  }

  async navigateToUserInstanceTypesAllNamespaces() {
    await this.goTo(
      '/k8s/all-namespaces/instancetype.kubevirt.io~v1beta1~VirtualMachineInstancetype',
    );
  }

  async navigateToUserInstanceTypesProject(projectName: string) {
    await this.goTo(
      `/k8s/ns/${projectName}/instancetype.kubevirt.io~v1beta1~VirtualMachineInstancetype`,
    );
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
        this.locator('[data-test="empty-box-body"], .pf-v6-c-empty-state, .pf-c-empty-state'),
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

  async verifyInstanceTypeExists(instanceTypeId: string): Promise<boolean> {
    try {
      const instanceType = this.locator(`[data-test-id="${instanceTypeId}"]`);
      await instanceType.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      return await instanceType.isVisible();
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
        const nameFilterVisible = await this.locator(
          'input[data-test="name-filter-input"], input[placeholder*="Search by name"]',
        )
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
