import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

import PageCommons from '../page-commons';

export default class BootableVolumesListPage extends PageCommons {
  private readonly _closeFilterLabelGroup = this.locator(
    '[aria-label="Close label group"]',
  ).first();
  private readonly _clusterFilterButton = this.locator('#filter-toolbar').locator('button', {
    hasText: 'Cluster',
  });
  private readonly _dataLabelCluster = this.locator('[data-label="Cluster"]');
  private readonly _dataLabelNamespace = this.locator('[data-label="Namespace"]');
  private readonly _dialogModal = this.locator('[data-test="dialog-modal"]');
  private readonly _projectFilterButton = this.locator('#filter-toolbar').locator('button', {
    hasText: 'Project',
  });

  private readonly _roleMenuitem = this.locator('[role="menuitem"]');

  constructor(page: Page) {
    super(page);
  }

  private async clickMenuItemByText(label: string): Promise<void> {
    const item = this.locator('[role="menuitem"]').filter({
      has: this.locator('.pf-v6-c-menu__item-text', { hasText: label }),
    });
    await item.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(item);
  }

  private async openRowKebabMenu(volumeName: string): Promise<void> {
    const byTestId = this.locator('tbody tr').filter({
      has: this.locator(`[data-test-id="${volumeName}"]`),
    });
    const byLink = this.locator('tbody tr').filter({
      has: this.page.locator(`a:has-text("${volumeName}")`),
    });
    const row = byTestId.or(byLink).first();
    await row.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    const kebabButton = row.locator('button.pf-v6-c-menu-toggle');
    await kebabButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(kebabButton);
    await this.locator('[role="menuitem"]')
      .first()
      .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
  }

  async addAnnotationInEditAnnotationsModalAndSave(
    annotationKey: string,
    annotationValue: string,
  ): Promise<void> {
    const dialog = this._dialogModal;
    await dialog.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    const addMoreButton = dialog.locator('button:has-text("Add more")');
    await addMoreButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(addMoreButton);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    const keyInput = dialog.locator('[placeholder="annotation key"]').last();
    const valueInput = dialog.locator('[placeholder="annotation value"]').last();
    await keyInput.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await keyInput.fill(annotationKey);
    await valueInput.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await valueInput.fill(annotationValue);
    const saveButton = dialog.locator('[data-test="save-button"]');
    await saveButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(saveButton);
  }

  async addLabelInEditLabelsModalAndSave(labelTag: string): Promise<void> {
    const tagsInput = this.locator('[data-test="tags-input"]');
    await tagsInput.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await tagsInput.fill(labelTag);
    await this.page.keyboard.press('Enter');
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    const saveButton = this.locator('[data-test="save-button"]');
    await saveButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(saveButton);
  }

  async checkDeletePvcCheckbox(): Promise<void> {
    const dialog = this._dialogModal;
    await dialog.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    const checkbox = dialog.locator('#delete-pvc-checkbox');
    await checkbox.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    if (!(await checkbox.isChecked())) await checkbox.click({ force: true });
  }

  async clickManageColumnsAndVerifyNamespaceAndClusterInModal(): Promise<boolean> {
    try {
      const manageColumnsBtn = this.locator('[data-test="manage-columns"]');
      await manageColumnsBtn.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await manageColumnsBtn.click();
      const nsVisible = await this.locator('#table-column-management-item-namespace')
        .isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM })
        .catch(() => false);
      const clVisible = await this.locator('#table-column-management-item-cluster')
        .isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM })
        .catch(() => false);
      return nsVisible && clVisible;
    } catch {
      return false;
    }
  }

  async clickRowActionDelete(volumeName: string): Promise<void> {
    await this.openRowKebabMenu(volumeName);
    await this.clickMenuItemByText('Delete');
  }

  async clickRowActionEditAnnotations(volumeName: string): Promise<void> {
    await this.openRowKebabMenu(volumeName);
    await this.clickMenuItemByText('Edit annotations');
  }

  async clickRowActionEditLabels(volumeName: string): Promise<void> {
    await this.openRowKebabMenu(volumeName);
    await this.clickMenuItemByText('Edit labels');
  }

  async clickRowActionUploadToRegistry(volumeName: string): Promise<void> {
    await this.openRowKebabMenu(volumeName);
    await this.clickMenuItemByText('Upload to registry');
  }

  async clickSaveInDeleteModal(): Promise<void> {
    const saveButton = this._dialogModal.locator('[data-test="save-button"]');
    await saveButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(saveButton);
  }

  async clickSaveInUploadToRegistryModal(): Promise<void> {
    const saveButton = this._dialogModal.locator('[data-test="save-button"]');
    await saveButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(saveButton);
  }

  async clickVolumeNameToGoToDetail(volumeName: string): Promise<void> {
    const row = this.locator('tbody tr').filter({
      has: this.locator(`[data-test-id="${volumeName}"]`),
    });
    const nameLink = row.locator('a').filter({ hasText: volumeName }).first();
    await nameLink.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(nameLink);
  }

  async closeFilterLabelGroup(): Promise<void> {
    await this._closeFilterLabelGroup.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this._closeFilterLabelGroup.click();
  }

  async fillUploadToRegistryForm(
    registryName: string,
    destination: string,
    username: string,
    password: string,
  ): Promise<void> {
    const dialog = this._dialogModal;
    await dialog.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await dialog.locator('#registryName').fill(registryName);
    await dialog.locator('#destination').fill(destination);
    await dialog.locator('#username').fill(username);
    await dialog.locator('#password').fill(password);
  }

  async getColumnHeaders(): Promise<string[]> {
    const headerLocator = this.page.locator('th');
    await headerLocator.first().waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
    const count = await headerLocator.count();
    const texts: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = (await headerLocator.nth(i).textContent())?.trim();
      if (text) texts.push(text);
    }
    return texts;
  }

  async getUploadToRegistryModalButtonText(): Promise<string> {
    const saveButton = this._dialogModal.locator('[data-test="save-button"]');
    await saveButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    return (await saveButton.textContent())?.trim() ?? '';
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

  async isProjectFilterButtonVisible(timeout: number = TestTimeouts.DEFAULT): Promise<boolean> {
    try {
      await this._projectFilterButton.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  async isUploadToRegistryModalButtonDisabled(): Promise<boolean> {
    const saveButton = this._dialogModal.locator('[data-test="save-button"]');
    await saveButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    return await saveButton.isDisabled();
  }

  async navigateToBootableVolumesViaUI(): Promise<void> {
    try {
      await this.clickNavBootableVolumes();
    } catch {
      await this.navigateToGeneralBootableVolumes();
    }
  }

  async navigateToGeneralBootableVolumes() {
    await this.goTo('/k8s/all-namespaces/bootablevolumes');
  }

  async navigateToNamespaceBootableVolumesViaUI(namespace: string): Promise<void> {
    try {
      await this.switchToVirtualizationPerspective();
      await this.clickNavBootableVolumes();
      await this.page.waitForLoadState('domcontentloaded');
      if (!this.page.url().includes(`/ns/${namespace}/`)) {
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
    } catch {
      await this.goTo(`/k8s/ns/${namespace}/bootablevolumes`);
    }
    await this.verifyPageLoaded([], true, TestTimeouts.UI_ELEMENT_VISIBILITY);
  }

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

  async verifyAnnotationsCountTextOnDetailPage(expectedText: string): Promise<boolean> {
    await this.page.waitForLoadState('load', { timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);
    return await this.page
      .getByText(expectedText)
      .isVisible({ timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
      .catch(() => false);
  }

  async verifyAtLeastOneClusterIdentifierVisible(clusterNames: string[]): Promise<boolean> {
    if (clusterNames.length === 0) return true;
    const visibilityTimeout = TestTimeouts.UI_DELAY_MEDIUM;
    try {
      const localClusterIdentifier = this.locator('[data-test-id="local-cluster"]');
      if (await localClusterIdentifier.isVisible({ timeout: visibilityTimeout }).catch(() => false))
        return true;
      for (const name of clusterNames) {
        const cell = this._dataLabelCluster.filter({ hasText: name }).first();
        if (await cell.isVisible({ timeout: visibilityTimeout }).catch(() => false)) return true;
        const byTestId = this.locator(`[data-test-id="${name}"]`);
        if ((await byTestId.count()) > 0) {
          if (
            await byTestId
              .first()
              .isVisible({ timeout: visibilityTimeout })
              .catch(() => false)
          )
            return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  }

  async verifyAtLeastOneNamespaceIdentifierVisible(namespaceNames: string[]): Promise<boolean> {
    if (namespaceNames.length === 0) return true;
    const visibilityTimeout = TestTimeouts.UI_DELAY_MEDIUM;
    try {
      const osImagesIndicator = this.locator('[data-test="openshift-virtualization-os-images"]');
      if (await osImagesIndicator.isVisible({ timeout: visibilityTimeout }).catch(() => false))
        return true;
      for (const name of namespaceNames) {
        const cell = this._dataLabelNamespace.filter({ hasText: name }).first();
        if (await cell.isVisible({ timeout: visibilityTimeout }).catch(() => false)) return true;
        const byTestId = this.locator(`[data-test-id="${name}"]`);
        if ((await byTestId.count()) > 0) {
          if (
            await byTestId
              .first()
              .isVisible({ timeout: visibilityTimeout })
              .catch(() => false)
          )
            return true;
        }
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
      const volumeRow = this.locator(`tr:has-text("${volumeName}")`);
      return !(await volumeRow.isVisible({ timeout }).catch(() => false));
    } catch {
      return true;
    }
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

  async verifyClusterAndProjectFilterButtonsVisible(): Promise<boolean> {
    try {
      const filterToolbar = this.locator('#filter-toolbar');
      await filterToolbar.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
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
      const byTestId = this.locator(`[data-test-id="${volumeName}"]`);
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
        '[data-test-id^="pw-bv-form-"], [data-test-id^="pw-bv-registry-"], [data-test-id^="pw-bv-http-"]',
      );
      await row.first().waitFor({ state: 'visible', timeout });
      return await row.first().isVisible();
    } catch {
      return false;
    }
  }

  async verifyLabelVisibleOnDetailPage(expectedLabelText: string): Promise<boolean> {
    const labelsControl = this.locator('[data-test-id^="pw-bv-"][data-test-id$="-labels"]').first();
    await labelsControl.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    const isButton = (await labelsControl.evaluate((el) => el.tagName === 'BUTTON')) ?? false;
    if (isButton) {
      await this.robustClick(labelsControl);
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    }
    return await this.locator(`text=${expectedLabelText}`)
      .isVisible()
      .catch(() => false);
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
    includeCreateButton = true,
    timeout = 10000,
  ): Promise<boolean> {
    return await super.verifyPageLoaded(indicatorSelectors, includeCreateButton, timeout);
  }

  async verifySearchFilterVisible(): Promise<boolean> {
    try {
      const filter = this.locator('[data-test-id="item-filter"]');
      await filter.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      return true;
    } catch {
      return false;
    }
  }

  async verifyUploadStepsVisibleInUploadToRegistryModal(): Promise<boolean> {
    await this.page.waitForLoadState('load', { timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);
    return await this.locator('[aria-label="Upload steps"]')
      .isVisible({ timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
      .catch(() => false);
  }

  async waitForClusterFilterApplied(): Promise<void> {
    await this._closeFilterLabelGroup.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.page.waitForTimeout(3000);
  }
}
