// BootableVolumesPage — Page object for bootable volumes interactions.

import {
  type CreateBootableVolumeFormOptions,
  BootableVolumesCreateFormsComponent,
  BootableVolumesFilterComponent,
  BootableVolumesRowActionsComponent,
} from '@/components/create-vm/bootable-volumes-components';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

import PageCommons from '../page-commons';

export type { CreateBootableVolumeFormOptions } from '@/components/create-vm/bootable-volumes-components';

export default class BootableVolumesPage extends PageCommons {
  readonly createForms: BootableVolumesCreateFormsComponent;
  readonly filters: BootableVolumesFilterComponent;
  readonly rowActions: BootableVolumesRowActionsComponent;

  protected readonly _row = this.locator(
    '[data-test-rows="resource-row"], .kubevirt-table tbody tr, [class*="c-table__tr"]:not([class*="control-row"])',
  );

  private readonly _addVolumeDialog = this.locator('#tab-modal');

  constructor(page: Page) {
    super(page);
    this.createForms = new BootableVolumesCreateFormsComponent(page);
    this.filters = new BootableVolumesFilterComponent(page);
    this.rowActions = new BootableVolumesRowActionsComponent(page);
  }

  override async clickCreateAndSelectOption(option: 'With form' | 'With YAML') {
    const optionSelectors = {
      'With form': 'button[role="menuitem"]:has-text("With form")',
      'With YAML': 'button[role="menuitem"]:has-text("With YAML")',
    };
    await super.clickCreateAndSelectOption('[data-test="item-create"]', optionSelectors[option]);
  }

  async selectSourceTypeInAddVolumeModal(
    sourceType: 'Registry' | 'URL' | 'Volume snapshot' | 'Volume',
  ): Promise<void> {
    const sourceTypeMap: Record<string, string> = {
      URL: '[data-test-id="use-http"]',
      Registry: '[data-test-id="use-registry"]',
      Volume: 'button[role="option"]:has-text("Volume"):not(:has-text("snapshot"))',
      'Volume snapshot': 'button[role="option"]:has-text("Volume snapshot")',
    };

    await this._addVolumeDialog.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });

    const sourceTypeSelect = this._addVolumeDialog.locator('[data-test-id="source-type-select"]');
    await sourceTypeSelect.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(sourceTypeSelect);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    const option = this.locator(sourceTypeMap[sourceType]);
    await option.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(option);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async navigateToGeneralBootableVolumes() {
    await this.goTo('/k8s/all-namespaces/bootablevolumes');
  }

  async navigateToProjectBootableVolumes(projectName: string) {
    await this.goTo(`/k8s/ns/${projectName}/bootablevolumes`);
  }

  async navigateToBootableVolumesViaUI(): Promise<void> {
    try {
      await this.navigation.switchToVirtualizationPerspective();
      await this.navigation.clickNavBootableVolumes();
    } catch {
      await this.goTo('/k8s/all-namespaces/bootablevolumes');
    }
  }

  private async navigateToNamespaceClientSide(namespace: string): Promise<void> {
    const path = `/k8s/ns/${namespace}/bootablevolumes`;
    await this.page.evaluate((p) => {
      window.history.pushState({}, '', p);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }, path);
    // waitForURL doesn't fire on pushState — poll the URL directly instead
    await this.page.waitForFunction((p: string) => window.location.pathname === p, path, {
      timeout: TestTimeouts.NAVIGATION,
    });
    await this.page.waitForLoadState('domcontentloaded');
  }

  async navigateToNamespaceBootableVolumesViaUI(namespace: string): Promise<void> {
    await this.navigation.switchToVirtualizationPerspective();
    await this.navigation.clickNavBootableVolumes();
    await this.page.waitForLoadState('domcontentloaded');
    if (!this.page.url().includes(`/ns/${namespace}/`)) {
      await this.navigateToNamespaceClientSide(namespace);
    }
    await this.verifyPageLoaded([], true, TestTimeouts.UI_ELEMENT_VISIBILITY);
  }

  override async verifyPageLoaded(
    indicatorSelectors: string[] = [],
    _includeCreateButton = true,
    timeout = 20000,
  ): Promise<boolean> {
    try {
      await this.waitForLoadingComplete(Math.min(timeout / 2, TestTimeouts.UI_DELAY_MEDIUM));
      // Try the table itself as the primary indicator; also accept item-create button
      const tableLocator = this.locator('.kubevirt-table, [class*="c-table"]').first();
      const createButton = this.locator('[data-test="item-create"]');
      let pageIndicator = tableLocator.or(createButton);

      // If callers pass row-name indicators, add text-based row locators
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

  async isClusterFilterButtonVisible(
    timeout: number = TestTimeouts.UI_VISIBILITY_QUICK,
  ): Promise<boolean> {
    return this.filters.isClusterFilterButtonVisible(timeout);
  }

  async isProjectFilterButtonVisible(timeout: number = TestTimeouts.DEFAULT): Promise<boolean> {
    return this.filters.isProjectFilterButtonVisible(timeout);
  }

  async verifyClusterAndProjectFilterButtonsVisible(): Promise<boolean> {
    return this.filters.verifyClusterAndProjectFilterButtonsVisible();
  }

  async verifyClusterColumnHeaderVisible(): Promise<boolean> {
    return this.filters.verifyClusterColumnHeaderVisible();
  }

  async verifyAtLeastOneClusterIdentifierVisible(clusterNames: string[]): Promise<boolean> {
    return this.filters.verifyAtLeastOneClusterIdentifierVisible(clusterNames);
  }

  async verifyNamespaceColumnHeaderVisible(): Promise<boolean> {
    return this.filters.verifyNamespaceColumnHeaderVisible();
  }

  async verifyAtLeastOneNamespaceIdentifierVisible(namespaceNames: string[]): Promise<boolean> {
    return this.filters.verifyAtLeastOneNamespaceIdentifierVisible(namespaceNames);
  }

  async clickManageColumnsAndVerifyNamespaceAndClusterInModal(): Promise<boolean> {
    return this.filters.clickManageColumnsAndVerifyNamespaceAndClusterInModal();
  }

  async openClusterFilter(): Promise<void> {
    return this.filters.openClusterFilter();
  }

  async selectClusterInFilterMenu(clusterName: string): Promise<void> {
    return this.filters.selectClusterInFilterMenu(clusterName);
  }

  async openProjectFilter(): Promise<void> {
    return this.filters.openProjectFilter();
  }

  async selectNamespaceInFilterMenu(
    namespaceName: string,
    options?: { force?: boolean },
  ): Promise<void> {
    return this.filters.selectNamespaceInFilterMenu(namespaceName, options);
  }

  async waitForClusterFilterApplied(): Promise<void> {
    return this.filters.waitForClusterFilterApplied();
  }

  async closeFilterLabelGroup(): Promise<void> {
    return this.filters.closeFilterLabelGroup();
  }

  async getColumnHeaders(): Promise<string[]> {
    return this.filters.getColumnHeaders();
  }

  async verifySearchFilterVisible(): Promise<boolean> {
    return this.filters.verifySearchFilterVisible();
  }

  async verifyBootableVolumeDoesNotExist(volumeName: string, timeout = 60000): Promise<boolean> {
    try {
      await this.page.waitForLoadState('load', {
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);

      const volumeRow = this.locator(`tr:has-text("${volumeName}")`);
      const volumeExists = await volumeRow.isVisible({ timeout }).catch(() => false);
      return !volumeExists;
    } catch {
      return true; // If we can't find it, that's what we want
    }
  }

  async isCreateButtonVisible(): Promise<boolean> {
    return this.locator('[data-test="item-create"]')
      .isVisible()
      .catch(() => false);
  }

  async verifyBootableVolumeExistsInList(volumeName: string, timeout = 10000): Promise<boolean> {
    try {
      const volumeRow = this.locator(`tr:has-text("${volumeName}")`);
      await volumeRow.waitFor({ state: 'visible', timeout });
      return await volumeRow.isVisible();
    } catch {
      return false;
    }
  }

  async verifyBootableVolumeNotInList(volumeName: string, timeout = 10000): Promise<boolean> {
    try {
      const volumeRow = this.locator(`tr:has-text("${volumeName}")`);
      await volumeRow.waitFor({ state: 'hidden', timeout });
      return true;
    } catch {
      return false;
    }
  }

  async getRowCountByText(text: RegExp | string): Promise<number> {
    const pattern = text instanceof RegExp ? text : new RegExp(text, 'i');
    return this._row.filter({ hasText: pattern }).count();
  }

  async openRowFilterDropdown(): Promise<void> {
    const toggle = this.locator('[data-test-id="filter-dropdown-toggle"]');
    await toggle.waitFor({ state: 'visible', timeout: TestTimeouts.NAVIGATION });
    await this.robustClick(toggle);
    await this.locator('[data-test-row-filter]').first().waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
  }

  async closeRowFilterDropdown(): Promise<void> {
    const toggle = this.locator('[data-test-id="filter-dropdown-toggle"]');
    await toggle.click();
  }

  async selectRowFilter(filterValue: string): Promise<void> {
    const option = this.locator(`[data-test-row-filter="${filterValue}"]`);
    await option.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await option.click();
  }

  async applyRowFilter(filterValue: string): Promise<void> {
    await this.openRowFilterDropdown();
    await this.filterToolbar.toggleRowFilter(filterValue, true);
    await this.closeRowFilterDropdown();
    await this.filterToolbar.waitForFilterApplied();
  }

  async getVisibleRowCount(): Promise<number> {
    return this._row.count();
  }

  async clearAllFilters(): Promise<void> {
    await this.filterToolbar.clearAllFilters();
  }

  async waitForTableData(timeout = TestTimeouts.NAVIGATION): Promise<boolean> {
    return this._row
      .first()
      .waitFor({ state: 'visible', timeout })
      .then(() => true)
      .catch(() => false);
  }

  async reloadAndWaitForTable(timeout = TestTimeouts.NAVIGATION): Promise<boolean> {
    await this.reloadPage();
    return this.waitForTableData(timeout);
  }

  async navigateToBootableVolumesWithParams(params: string): Promise<void> {
    const basePath = '/k8s/all-namespaces/bootablevolumes';
    await this.goTo(`${basePath}?${params}`);
    await this.waitForTableData();
  }

  async verifyFormCreatedVolumeRowVisible(timeout = 10000): Promise<boolean> {
    try {
      const formCreatedRow = this.locator(
        '[data-test-id^="pw-bv-form-"], [data-test-id^="pw-bv-registry-"], [data-test-id^="pw-bv-http-"]',
      );
      await formCreatedRow.first().waitFor({ state: 'visible', timeout });
      return await formCreatedRow.first().isVisible();
    } catch {
      return false;
    }
  }

  async verifyDataVolumeRowVisible(volumeName: string, timeout = 10000): Promise<boolean> {
    try {
      const row = this.locator(`[data-test-id="${volumeName}"]`);
      await row.waitFor({ state: 'visible', timeout });
      return await row.isVisible();
    } catch {
      return false;
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

  async clickRowActionEditLabels(volumeName: string): Promise<void> {
    return this.rowActions.clickRowActionEditLabels(volumeName);
  }

  async clickRowActionEditAnnotations(volumeName: string): Promise<void> {
    return this.rowActions.clickRowActionEditAnnotations(volumeName);
  }

  async clickRowActionUploadToRegistry(volumeName: string): Promise<void> {
    return this.rowActions.clickRowActionUploadToRegistry(volumeName);
  }

  async fillUploadToRegistryForm(
    registryName: string,
    destination: string,
    username: string,
    password: string,
  ): Promise<void> {
    return this.rowActions.fillUploadToRegistryForm(registryName, destination, username, password);
  }

  async getUploadToRegistryModalButtonText(): Promise<string> {
    return this.rowActions.getUploadToRegistryModalButtonText();
  }

  async isUploadToRegistryModalButtonDisabled(): Promise<boolean> {
    return this.rowActions.isUploadToRegistryModalButtonDisabled();
  }

  async clickSaveInUploadToRegistryModal(): Promise<void> {
    return this.rowActions.clickSaveInUploadToRegistryModal();
  }

  async verifyUploadStepsVisibleInUploadToRegistryModal(): Promise<boolean> {
    return this.rowActions.verifyUploadStepsVisibleInUploadToRegistryModal();
  }

  async clickRowActionDelete(volumeName: string): Promise<void> {
    return this.rowActions.clickRowActionDelete(volumeName);
  }

  async clickRowActionManageSource(volumeName: string): Promise<void> {
    return this.rowActions.clickRowActionManageSource(volumeName);
  }

  async isManageSourceModalVisible(timeout?: number): Promise<boolean> {
    return this.rowActions.isManageSourceModalVisible(timeout);
  }

  async fillManageSourceRegistryUrl(url: string): Promise<void> {
    return this.rowActions.fillManageSourceRegistryUrl(url);
  }

  async getManageSourceRegistryUrl(): Promise<string> {
    return this.rowActions.getManageSourceRegistryUrl();
  }

  async setManageSourceAllowAutoUpdate(enable: boolean): Promise<void> {
    return this.rowActions.setManageSourceAllowAutoUpdate(enable);
  }

  async fillManageSourceCronExpression(cron: string): Promise<void> {
    return this.rowActions.fillManageSourceCronExpression(cron);
  }

  async saveManageSourceModal(): Promise<void> {
    return this.rowActions.saveManageSourceModal();
  }

  async cancelManageSourceModal(): Promise<void> {
    return this.rowActions.cancelManageSourceModal();
  }

  async checkDeletePvcCheckbox(): Promise<void> {
    return this.rowActions.checkDeletePvcCheckbox();
  }

  async clickSaveInDeleteModal(): Promise<void> {
    return this.rowActions.clickSaveInDeleteModal();
  }

  async addLabelInEditLabelsModalAndSave(labelTag: string): Promise<void> {
    return this.rowActions.addLabelInEditLabelsModalAndSave(labelTag);
  }

  async clickVolumeNameToGoToDetail(volumeName: string): Promise<void> {
    return this.rowActions.clickVolumeNameToGoToDetail(volumeName);
  }

  async verifyLabelVisibleOnDetailPage(expectedLabelText: string): Promise<boolean> {
    return this.rowActions.verifyLabelVisibleOnDetailPage(expectedLabelText);
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

  async verifyAnnotationsCountTextOnDetailPage(expectedText: string): Promise<boolean> {
    return this.rowActions.verifyAnnotationsCountTextOnDetailPage(expectedText);
  }

  async navigateToBootableVolumesForNamespaceWithRetry(
    namespace: string,
    maxAttempts = 3,
  ): Promise<boolean> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        await this.navigateToNamespaceBootableVolumesViaUI(namespace);
        const loaded = await this.verifyPageLoaded();
        if (loaded) {
          return true;
        }
      } catch {
        // retry navigation
      }
    }
    return false;
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

  async clickVolumeNameToGoToDetailWithRetry(volumeName: string, namespace: string): Promise<void> {
    try {
      await this.clickVolumeNameToGoToDetail(volumeName);
    } catch {
      await this.navigateToBootableVolumesForNamespaceWithRetry(namespace);
      await this.ensureDataVolumeRowVisibleWithReNav(volumeName, namespace);
      await this.clickVolumeNameToGoToDetail(volumeName);
    }
  }
}
