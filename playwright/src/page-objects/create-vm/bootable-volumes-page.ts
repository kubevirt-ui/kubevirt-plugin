/**
 * Page object for the Bootable Volumes page.
 */

import type { CreateBootableVolumeFormOptions } from '@/components/create-vm/bootable-volumes-create-components';
import {
  BootableVolumesCreateFormsComponent,
  BootableVolumesRowActionsComponent,
} from '@/components/create-vm/bootable-volumes-create-components';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

import PageCommons from '../page-commons';

export type { CreateBootableVolumeFormOptions } from '@/components/create-vm/bootable-volumes-create-components';

export default class BootableVolumesPage extends PageCommons {
  private readonly _addVolumeDialog = this.locator('#tab-modal');
  private readonly _closeFilterLabelGroup = this.locator(
    '[aria-label="Close label group"]',
  ).first();

  private readonly _clusterFilterButton = this.locator('#filter-toolbar').locator('button', {
    hasText: 'Cluster',
  });

  private readonly _dataLabelCluster = this.locator('[data-label="Cluster"]');
  private readonly _dataLabelNamespace = this.locator('[data-label="Namespace"]');
  private readonly _projectFilterButton = this.locator('#filter-toolbar').locator('button', {
    hasText: 'Project',
  });
  private readonly _roleMenuitem = this.locator('[role="menuitem"]');
  protected override readonly _row = this.locator(
    '[data-test-rows="resource-row"], .kubevirt-table tbody tr, [class*="c-table__tr"]:not([class*="control-row"])',
  );
  readonly createForms: BootableVolumesCreateFormsComponent;
  readonly rowActions: BootableVolumesRowActionsComponent;

  constructor(page: Page) {
    super(page);
    this.createForms = new BootableVolumesCreateFormsComponent(page);
    this.rowActions = new BootableVolumesRowActionsComponent(page);
  }

  private async navigateToNamespaceClientSide(namespace: string): Promise<void> {
    const path = `/k8s/ns/${namespace}/bootablevolumes`;
    await this.page.evaluate((p) => {
      window.history.pushState({}, '', p);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }, path);
    await this.page.waitForFunction((p: string) => window.location.pathname === p, path, {
      timeout: TestTimeouts.NAVIGATION,
    });
    await this.page.waitForLoadState('domcontentloaded');
  }

  async addAnnotationInEditAnnotationsModalAndSave(
    annotationKey: string,
    annotationValue: string,
  ): Promise<void> {
    return this.rowActions.addAnnotationInEditAnnotationsModalAndSave(
      annotationKey,
      annotationValue,
    );
  }

  async addLabelInEditLabelsModalAndSave(labelTag: string): Promise<void> {
    return this.rowActions.addLabelInEditLabelsModalAndSave(labelTag);
  }

  async applyRowFilter(filterValue: string): Promise<void> {
    await this.openRowFilterDropdown();
    await this.filterToolbar.toggleRowFilter(filterValue, true);
    await this.closeRowFilterDropdown();
    await this.filterToolbar.waitForFilterApplied();
  }

  async cancelManageSourceModal(): Promise<void> {
    return this.rowActions.cancelManageSourceModal();
  }

  async checkDeletePvcCheckbox(): Promise<void> {
    return this.rowActions.checkDeletePvcCheckbox();
  }

  async clearAllFilters(): Promise<void> {
    await this.filterToolbar.clearAllFilters();
  }

  override async clickCreateAndSelectOption(option: 'With form' | 'With YAML') {
    const optionSelectors = {
      'With form': 'button[role="menuitem"]:has-text("With form")',
      'With YAML': 'button[role="menuitem"]:has-text("With YAML")',
    };
    await super.clickCreateAndSelectOption(this.testId('item-create'), optionSelectors[option]);
  }

  async clickManageColumnsAndVerifyNamespaceAndClusterInModal(): Promise<boolean> {
    try {
      const btn = this.testId('manage-columns');
      await btn.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      await btn.click();
      const nsVis = await this.locator('#table-column-management-item-namespace')
        .isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM })
        .catch(() => false);
      const clVis = await this.locator('#table-column-management-item-cluster')
        .isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM })
        .catch(() => false);
      return nsVis && clVis;
    } catch {
      return false;
    }
  }

  async clickRowActionDelete(volumeName: string): Promise<void> {
    return this.rowActions.clickRowActionDelete(volumeName);
  }

  async clickRowActionEditAnnotations(volumeName: string): Promise<void> {
    return this.rowActions.clickRowActionEditAnnotations(volumeName);
  }

  async clickRowActionEditLabels(volumeName: string): Promise<void> {
    return this.rowActions.clickRowActionEditLabels(volumeName);
  }

  async clickRowActionManageSource(volumeName: string): Promise<void> {
    return this.rowActions.clickRowActionManageSource(volumeName);
  }

  async clickRowActionUploadToRegistry(volumeName: string): Promise<void> {
    return this.rowActions.clickRowActionUploadToRegistry(volumeName);
  }

  async clickSaveInDeleteModal(): Promise<void> {
    return this.rowActions.clickSaveInDeleteModal();
  }

  async clickSaveInUploadToRegistryModal(): Promise<void> {
    return this.rowActions.clickSaveInUploadToRegistryModal();
  }

  async clickVolumeNameToGoToDetail(volumeName: string): Promise<void> {
    return this.rowActions.clickVolumeNameToGoToDetail(volumeName);
  }

  async clickVolumeNameToGoToDetailWithRetry(volumeName: string, namespace: string): Promise<void> {
    try {
      await this.clickVolumeNameToGoToDetail(volumeName);
    } catch {
      await this.navigateToBootableVolumesForNamespaceWithRetry(namespace);
      await this.ensureDataVolumeRowVisibleWithReNav(volumeName, namespace);
      await this.clickVolumeNameToGoToDetail(volumeName);
    }
  }

  async closeFilterLabelGroup(): Promise<void> {
    await this._closeFilterLabelGroup.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this._closeFilterLabelGroup.click();
  }

  async closeRowFilterDropdown(): Promise<void> {
    const toggle = this.testId('filter-dropdown-toggle');
    await toggle.click();
  }

  async ensureDataVolumeRowVisibleWithReNav(
    volumeName: string,
    namespace: string,
    rowTimeout: number = TestTimeouts.DEFAULT,
  ): Promise<boolean> {
    let visible = await this.verifyDataVolumeRowVisible(volumeName, rowTimeout);
    if (!visible) {
      await this.navigateToBootableVolumesForNamespaceWithRetry(namespace);
      visible = await this.verifyDataVolumeRowVisible(volumeName, rowTimeout);
    }
    return visible;
  }

  async executeRowActionWithRetry(
    namespace: string,
    volumeName: string,
    action: () => Promise<void>,
  ): Promise<void> {
    try {
      await action();
    } catch {
      await this.navigateToBootableVolumesForNamespaceWithRetry(namespace);
      await this.ensureDataVolumeRowVisibleWithReNav(volumeName, namespace);
      await action();
    }
  }

  async fillCreateBootableVolumeFormAndSave(
    volumeName: string,
    imageFilePath: string,
    options: CreateBootableVolumeFormOptions = {},
  ): Promise<void> {
    return this.createForms.fillCreateBootableVolumeFormAndSave(volumeName, imageFilePath, options);
  }

  async fillCreateBootableVolumeFormFromExistingAndSave(
    volumeName: string,
    existingVolumeName: string,
    projectNamespace: string,
    options: CreateBootableVolumeFormOptions = {},
  ): Promise<void> {
    return this.createForms.fillCreateBootableVolumeFormFromExistingAndSave(
      volumeName,
      existingVolumeName,
      projectNamespace,
      options,
    );
  }

  async fillCreateBootableVolumeFormFromFirstSnapshotInNamespaceAndSave(
    volumeName: string,
    projectNamespace: string,
    options: CreateBootableVolumeFormOptions = {},
  ): Promise<void> {
    return this.createForms.fillCreateBootableVolumeFormFromFirstSnapshotInNamespaceAndSave(
      volumeName,
      projectNamespace,
      options,
    );
  }

  async fillCreateBootableVolumeFormFromHttpAndSave(
    volumeName: string,
    imageUrl: string,
    options: CreateBootableVolumeFormOptions = {},
  ): Promise<void> {
    return this.createForms.fillCreateBootableVolumeFormFromHttpAndSave(
      volumeName,
      imageUrl,
      options,
    );
  }

  async fillCreateBootableVolumeFormFromRegistryAndSave(
    volumeName: string,
    registryUrl: string,
    cronExpression: string,
    options: CreateBootableVolumeFormOptions = {},
  ): Promise<void> {
    return this.createForms.fillCreateBootableVolumeFormFromRegistryAndSave(
      volumeName,
      registryUrl,
      cronExpression,
      options,
    );
  }

  async fillCreateBootableVolumeFormFromSnapshotAndSave(
    volumeName: string,
    snapshotName: string,
    projectNamespace: string,
    options: CreateBootableVolumeFormOptions = {},
  ): Promise<void> {
    return this.createForms.fillCreateBootableVolumeFormFromSnapshotAndSave(
      volumeName,
      snapshotName,
      projectNamespace,
      options,
    );
  }

  async fillManageSourceCronExpression(cron: string): Promise<void> {
    return this.rowActions.fillManageSourceCronExpression(cron);
  }

  async fillManageSourceRegistryUrl(url: string): Promise<void> {
    return this.rowActions.fillManageSourceRegistryUrl(url);
  }

  async fillUploadToRegistryForm(
    registryName: string,
    destination: string,
    username: string,
    password: string,
  ): Promise<void> {
    return this.rowActions.fillUploadToRegistryForm(registryName, destination, username, password);
  }

  async getColumnHeaders(): Promise<string[]> {
    const tableLocator = this.page.locator('.kubevirt-table, [class*="c-table"]').first();
    await tableLocator
      .waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT })
      .catch(() => undefined);
    const headerLocator = (await tableLocator.isVisible().catch(() => false))
      ? tableLocator.locator('th')
      : this.page.locator('th');
    await headerLocator.first().waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
    const count = await headerLocator.count();
    const texts: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = (await headerLocator.nth(i).textContent())?.trim();
      if (text) texts.push(text);
    }
    return texts;
  }

  async getManageSourceRegistryUrl(): Promise<string> {
    return this.rowActions.getManageSourceRegistryUrl();
  }

  async getRowCountByText(text: RegExp | string): Promise<number> {
    const pattern = text instanceof RegExp ? text : new RegExp(text, 'i');
    return this._row.filter({ hasText: pattern }).count();
  }

  async getUploadToRegistryModalButtonText(): Promise<string> {
    return this.rowActions.getUploadToRegistryModalButtonText();
  }
  async getVisibleRowCount(): Promise<number> {
    return this._row.count();
  }
  async isClusterFilterButtonVisible(
    timeout: number = TestTimeouts.UI_VISIBILITY_QUICK,
  ): Promise<boolean> {
    try {
      await this._clusterFilterButton.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }
  async isManageSourceModalVisible(timeout?: number): Promise<boolean> {
    return this.rowActions.isManageSourceModalVisible(timeout);
  }
  async isProjectFilterButtonVisible(timeout: number = TestTimeouts.DEFAULT): Promise<boolean> {
    try {
      await this._projectFilterButton.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }
  async isUploadToRegistryModalButtonDisabled(): Promise<boolean> {
    return this.rowActions.isUploadToRegistryModalButtonDisabled();
  }
  async navigateToBootableVolumesForNamespaceWithRetry(
    namespace: string,
    maxAttempts = 3,
  ): Promise<boolean> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        await this.navigateToNamespaceBootableVolumesViaUI(namespace);
        if (await this.verifyPageLoaded()) return true;
      } catch {
        /* retry */
      }
    }
    return false;
  }
  async navigateToBootableVolumesViaUI(): Promise<void> {
    await this.switchToVirtualizationPerspective();
    await this.clickNavBootableVolumes();
    await this.page.waitForLoadState('domcontentloaded');
  }
  async navigateToBootableVolumesWithParams(params: string): Promise<void> {
    const basePath = '/k8s/all-namespaces/bootablevolumes';
    await this.goTo(`${basePath}?${params}`);
    await this.waitForTableData();
  }
  /** @deprecated Use navigateToBootableVolumesViaUI() */
  async navigateToGeneralBootableVolumes() {
    await this.goTo('/k8s/all-namespaces/bootablevolumes');
  }
  async navigateToNamespaceBootableVolumesViaUI(namespace: string): Promise<void> {
    await this.switchToVirtualizationPerspective();
    await this.clickNavBootableVolumes();
    await this.page.waitForLoadState('domcontentloaded');
    if (!this.page.url().includes(`/ns/${namespace}/`)) {
      await this.navigateToNamespaceClientSide(namespace);
    }
    await this.verifyPageLoaded([], true, TestTimeouts.UI_ELEMENT_VISIBILITY);
  }
  /** @deprecated Use navigateToNamespaceBootableVolumesViaUI() */
  async navigateToProjectBootableVolumes(projectName: string) {
    await this.goTo(`/k8s/ns/${projectName}/bootablevolumes`);
  }
  async openClusterFilter(): Promise<void> {
    await this._clusterFilterButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this._clusterFilterButton.click();
  }
  async openProjectFilter(): Promise<void> {
    await this._projectFilterButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this._projectFilterButton.click();
  }
  async openRowFilterDropdown(): Promise<void> {
    const toggle = this.testId('filter-dropdown-toggle');
    await toggle.waitFor({ state: 'visible', timeout: TestTimeouts.NAVIGATION });
    await this.robustClick(toggle);
    await this.locator('[data-test-row-filter]').first().waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
  }
  async reloadAndWaitForTable(timeout = TestTimeouts.NAVIGATION): Promise<boolean> {
    await this.reloadPage();
    return this.waitForTableData(timeout);
  }
  async saveManageSourceModal(): Promise<void> {
    return this.rowActions.saveManageSourceModal();
  }
  async selectClusterInFilterMenu(clusterName: string): Promise<void> {
    const menuitem = this._roleMenuitem.filter({ hasText: clusterName }).first();
    await menuitem.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await menuitem.click();
  }
  async selectNamespaceInFilterMenu(
    namespaceName: string,
    options?: { force?: boolean },
  ): Promise<void> {
    const menuitem = this._roleMenuitem.filter({ hasText: namespaceName }).first();
    if (options?.force) {
      await menuitem.click({ force: true });
    } else {
      await menuitem.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      await menuitem.click();
    }
  }
  async selectRowFilter(filterValue: string): Promise<void> {
    const option = this.locator(`[data-test-row-filter="${filterValue}"]`);
    await option.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await option.click();
  }
  async selectSourceTypeInAddVolumeModal(
    sourceType: 'URL' | 'Registry' | 'Volume' | 'Volume snapshot',
  ): Promise<void> {
    await this._addVolumeDialog.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    const sourceTypeSelect = this._addVolumeDialog.getByTestId('source-type-select');
    await sourceTypeSelect.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(sourceTypeSelect);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
    const sourceTypeLocatorMap: Record<string, ReturnType<typeof this.locator>> = {
      URL: this.testId('use-http'),
      Registry: this.testId('use-registry'),
      Volume: this.locator('button[role="option"]:has-text("Volume"):not(:has-text("snapshot"))'),
      'Volume snapshot': this.locator('button[role="option"]:has-text("Volume snapshot")'),
    };
    const opt = sourceTypeLocatorMap[sourceType];
    await opt.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
    await this.robustClick(opt);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }
  async setManageSourceAllowAutoUpdate(enable: boolean): Promise<void> {
    return this.rowActions.setManageSourceAllowAutoUpdate(enable);
  }
  async verifyAnnotationsCountTextOnDetailPage(expectedText: string): Promise<boolean> {
    return this.rowActions.verifyAnnotationsCountTextOnDetailPage(expectedText);
  }
  async verifyAtLeastOneClusterIdentifierVisible(clusterNames: string[]): Promise<boolean> {
    if (clusterNames.length === 0) return true;
    const t = TestTimeouts.UI_DELAY_MEDIUM;
    try {
      if (
        await this.testId('local-cluster')
          .isVisible({ timeout: t })
          .catch(() => false)
      )
        return true;
      for (const name of clusterNames) {
        if (
          await this._dataLabelCluster
            .filter({ hasText: name })
            .first()
            .isVisible({ timeout: t })
            .catch(() => false)
        )
          return true;
        const byId = this.testId(name);
        if (
          (await byId.count()) > 0 &&
          (await byId
            .first()
            .isVisible({ timeout: t })
            .catch(() => false))
        )
          return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async verifyAtLeastOneNamespaceIdentifierVisible(namespaceNames: string[]): Promise<boolean> {
    if (namespaceNames.length === 0) return true;
    const t = TestTimeouts.UI_DELAY_MEDIUM;
    try {
      if (
        await this.testId('openshift-virtualization-os-images')
          .isVisible({ timeout: t })
          .catch(() => false)
      )
        return true;
      for (const name of namespaceNames) {
        if (
          await this._dataLabelNamespace
            .filter({ hasText: name })
            .first()
            .isVisible({ timeout: t })
            .catch(() => false)
        )
          return true;
        const byId = this.testId(name);
        if (
          (await byId.count()) > 0 &&
          (await byId
            .first()
            .isVisible({ timeout: t })
            .catch(() => false))
        )
          return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async verifyBootableVolumeDoesNotExist(volumeName: string, timeout = 60000): Promise<boolean> {
    try {
      await this.page.waitForLoadState('load', { timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);
      return !(await this.locator(`tr:has-text("${volumeName}")`)
        .isVisible({ timeout })
        .catch(() => false));
    } catch {
      return true;
    }
  }

  async verifyBootableVolumeExistsInList(volumeName: string, timeout = 10000): Promise<boolean> {
    try {
      const row = this.locator(`tr:has-text("${volumeName}")`);
      await row.waitFor({ state: 'visible', timeout });
      return await row.isVisible();
    } catch {
      return false;
    }
  }

  async verifyClusterAndProjectFilterButtonsVisible(): Promise<boolean> {
    try {
      await this.locator('#filter-toolbar').waitFor({
        state: 'visible',
        timeout: TestTimeouts.DEFAULT,
      });
      await this._projectFilterButton.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
      await this._clusterFilterButton.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
      return true;
    } catch {
      return false;
    }
  }

  async verifyClusterColumnHeaderVisible(): Promise<boolean> {
    try {
      await this._dataLabelCluster.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
      return true;
    } catch {
      return false;
    }
  }

  async verifyDataVolumeRowVisible(
    volumeName: string,
    timeout = TestTimeouts.DEFAULT,
  ): Promise<boolean> {
    try {
      const byTestId = this.testId(volumeName);
      const byLink = this.locator(`table tbody tr`).filter({
        has: this.page.locator(`a:has-text("${volumeName}")`),
      });
      const row = byTestId.or(byLink).first();
      await row.waitFor({ state: 'visible', timeout });
      return await row.isVisible();
    } catch {
      return false;
    }
  }

  async verifyFormCreatedVolumeRowVisible(timeout = 10000): Promise<boolean> {
    try {
      const row = this.locator(
        '[data-test^="pw-bv-form-"], [data-test^="pw-bv-registry-"], [data-test^="pw-bv-http-"]',
      );
      await row.first().waitFor({ state: 'visible', timeout });
      return await row.first().isVisible();
    } catch {
      return false;
    }
  }

  async verifyLabelVisibleOnDetailPage(expectedLabelText: string): Promise<boolean> {
    return this.rowActions.verifyLabelVisibleOnDetailPage(expectedLabelText);
  }

  async verifyNamespaceColumnHeaderVisible(): Promise<boolean> {
    try {
      await this._dataLabelNamespace.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
      return true;
    } catch {
      return false;
    }
  }

  override async verifyPageLoaded(
    indicatorSelectors: string[] = [],
    _includeCreateButton = true,
    timeout = 10000,
  ): Promise<boolean> {
    try {
      await this.waitForLoadingComplete(Math.min(timeout / 2, TestTimeouts.UI_DELAY_MEDIUM));
      const tableLocator = this.locator('.kubevirt-table, [class*="c-table"]').first();
      const createButton = this.testId('item-create');
      let pageIndicator = tableLocator.or(createButton);
      if (indicatorSelectors.length > 0) {
        for (const name of indicatorSelectors) {
          pageIndicator = pageIndicator.or(this.locator(`td, tr`, { hasText: name }));
        }
      }
      await pageIndicator.first().waitFor({ state: 'visible', timeout });
      return await pageIndicator
        .first()
        .isVisible()
        .catch(() => false);
    } catch {
      return false;
    }
  }

  async verifySearchFilterVisible(): Promise<boolean> {
    try {
      await this.testId('item-filter').waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      return true;
    } catch {
      return false;
    }
  }

  async verifyUploadStepsVisibleInUploadToRegistryModal(): Promise<boolean> {
    return this.rowActions.verifyUploadStepsVisibleInUploadToRegistryModal();
  }

  async waitForClusterFilterApplied(): Promise<void> {
    await this._closeFilterLabelGroup.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.page.waitForTimeout(3000);
  }

  async waitForTableData(timeout = TestTimeouts.NAVIGATION): Promise<boolean> {
    return this._row
      .first()
      .waitFor({ state: 'visible', timeout })
      .then(() => true)
      .catch(() => false);
  }
}
