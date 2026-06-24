// CreateVmTemplatesPage — Page object for create vm templates interactions.

import PageCommons from '@/page-objects/page-commons';
import { TestTimeouts } from '@/utils/test-config';
import { waitForElementStable } from '@/utils/wait-helpers';
import type { Page } from '@playwright/test';

export default class CreateVmTemplatesPage extends PageCommons {
  private readonly _userTemplates = this.locator('#user-templates');
  private readonly _filterCategoryArchitecture = this.locator(
    '[data-test-id="filter-category-Architecture"]',
  );
  private readonly _searchCatalogInput = this.locator('[data-test="search-catalog"] input');
  private readonly _createVirtualMachineButton = this.locator('button', {
    hasText: 'Create VirtualMachine',
  });
  private readonly _templatesTab = this.locator('[data-test="templates-tab"]');
  private readonly _vmCatalogGrid = this.locator('#vm-catalog-grid');

  constructor(page: Page) {
    super(page);
  }

  private getTemplateCardTitleLocator(templateName: string) {
    return this._vmCatalogGrid.locator('.vm-catalog-grid-tile .catalog-tile-pf-title', {
      hasText: templateName,
    });
  }

  async clickTemplatesTab() {
    await this._templatesTab.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(this._templatesTab);
  }
  async isTemplateCatalogSectionVisible(): Promise<boolean> {
    const tabVisible = await this._templatesTab
      .isVisible({ timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
      .catch(() => false);
    if (!tabVisible) return false;
    const gridVisible = await this._vmCatalogGrid
      .isVisible({ timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
      .catch(() => false);
    return gridVisible;
  }
  async isCreateVmFromCatalogAvailable(): Promise<boolean> {
    const createBtn = await this._createVirtualMachineButton
      .isVisible({ timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
      .catch(() => false);
    if (createBtn) return true;
    return await this._vmCatalogGrid
      .isVisible({ timeout: TestTimeouts.RETRY_DELAY })
      .catch(() => false);
  }

  async clickUserProvidedTab() {
    await this._userTemplates.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(this._userTemplates);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }
  async filterByOSName(osName: 'CentOS' | 'Fedora' | 'RHEL' | 'Windows', check = true) {
    const osFilter = this.locator(`[data-test-id="osName-${osName}"]`).locator(
      'input[type="checkbox"]',
    );
    await osFilter.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    if (check) {
      await osFilter.check({ force: true });
    } else {
      await osFilter.uncheck({ force: true });
    }
    await this.page.waitForTimeout(TestTimeouts.UI_FILTER_APPLY / 3);
    await this._vmCatalogGrid
      .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
      .catch(() => {
        return;
      });
  }

  async filterByWorkload(workload: 'Desktop' | 'Server', check = true) {
    const workloadFilter = this.locator(`[data-test-id="workload-${workload}"]`).locator(
      'input[type="checkbox"]',
    );
    await workloadFilter.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    if (check) {
      await workloadFilter.check({ force: true });
    } else {
      await workloadFilter.uncheck({ force: true });
    }
    await this.page.waitForTimeout(TestTimeouts.UI_FILTER_APPLY / 3);
    await this._vmCatalogGrid
      .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
      .catch(() => {
        return;
      });
  }

  async filterByBootSourceAvailable(check = true) {
    const bootSourceFilter = this.locator(
      '[data-test-id="boot-source-available-Boot source available"]',
    ).locator('input[type="checkbox"]');
    if (check) {
      await bootSourceFilter.check({ force: true });
    } else {
      await bootSourceFilter.uncheck({ force: true });
    }
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async verifyArchitectureFilterExists(): Promise<boolean> {
    const maxRetries = 3;
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.page.waitForLoadState('networkidle', {
          timeout: TestTimeouts.UI_ACTION_COMPLETE,
        });

        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

        await waitForElementStable(
          this._filterCategoryArchitecture,
          TestTimeouts.UI_ELEMENT_VISIBILITY,
        );

        const hasCheckboxes = await this.waitForChildElements(
          this._filterCategoryArchitecture,
          'input[type="checkbox"]',
          { timeout: TestTimeouts.UI_ELEMENT_VISIBILITY },
        );

        if (hasCheckboxes) {
          return true;
        }

        throw new Error('No checkboxes found in architecture filter');
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < maxRetries) {
          console.warn(`Architecture filter verification attempt ${attempt} failed, retrying...`);
          await this.page.waitForTimeout(TestTimeouts.RETRY_DELAY);
        }
      }
    }

    console.warn(
      `Architecture filter verification failed after ${maxRetries} attempts: ${lastError?.message}`,
    );
    return false;
  }
  async switchView(view: 'grid' | 'list') {
    if (view === 'list') {
      const listButton = this.locator('#template-list-btn');
      await this.robustClick(listButton);
    } else {
      const gridButton = this.locator('#template-grid-btn');
      await this.robustClick(gridButton);
    }
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async clickUserTemplatesTab() {
    const userTemplatesTab = this._userTemplates;
    await userTemplatesTab.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(userTemplatesTab);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async clickAllTemplatesButton() {
    const allTemplatesButton = this.locator('[data-test-id="catalog-template-filter-all-items"]');
    await this.robustClick(allTemplatesButton);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async selectProjectFromCatalog(projectName: string) {
    const projectDropdown = this.locator('.templates-catalog-project-dropdown').locator('button');
    await projectDropdown.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(projectDropdown);

    const projectItem = this.locator('.pf-v6-c-menu__item-text', { hasText: projectName });
    await projectItem.waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_LONG });
    await this.robustClick(projectItem);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async selectNamespaceInProjectDropdown(namespace: string): Promise<void> {
    const projectDropdown = this.locator('.project-dropdown').locator('button').first();
    await projectDropdown.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(projectDropdown);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    const filterInput = this.locator('#select-inline-filter input');
    await filterInput.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await filterInput.clear();
    await filterInput.pressSequentially(namespace, { delay: 100 });
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    const namespaceOption = this.locator(`[data-test-id="${namespace}"]`).first();
    await namespaceOption.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(namespaceOption);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }
  async verifyTemplateCardVisible(templateName: string): Promise<boolean> {
    try {
      await this._vmCatalogGrid.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });

      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

      const anyCardTile = this._vmCatalogGrid.locator('.vm-catalog-grid-tile').first();
      const hasAnyCards = await anyCardTile
        .isVisible({ timeout: TestTimeouts.UI_ACTION_COMPLETE })
        .catch(() => false);

      if (!hasAnyCards) {
        await this.page.waitForTimeout(TestTimeouts.UI_FILTER_APPLY / 3);
      }

      const templateCardTitleLocator = this.getTemplateCardTitleLocator(templateName);

      await templateCardTitleLocator
        .first()
        .waitFor({ state: 'visible', timeout: TestTimeouts.TEMPLATE_CREATION });

      await this.page.waitForTimeout(TestTimeouts.POLLING_INTERVAL / 2);

      const locators = await templateCardTitleLocator.all();
      if (locators.length === 0) {
        return false;
      }
      const visibilityChecks = await Promise.all(locators.map((locator) => locator.isVisible()));
      return visibilityChecks.every((isVisible) => isVisible);
    } catch {
      return false;
    }
  }

  async countTemplateCards(templateName: string): Promise<number> {
    const templateCards = this._vmCatalogGrid.locator(
      '.vm-catalog-grid-tile .catalog-tile-pf-title',
      { hasText: templateName },
    );
    return await templateCards.count();
  }

  async verifyTemplateVisibleInListView(templateName: string): Promise<boolean> {
    try {
      const templateSpan = this.locator('.vm-catalog-table-container').locator('button span', {
        hasText: templateName,
      });
      await templateSpan.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      return true;
    } catch {
      return false;
    }
  }
  async searchTemplate(templateName: string) {
    await this._searchCatalogInput.clear();
    await this._searchCatalogInput.fill(templateName);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async clickTemplateByMetadataName(templateMetadataName: string) {
    await super.clickTemplateByTestId(
      templateMetadataName,
      `div[data-test-id="${templateMetadataName}"]`,
    );
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_LONG);
  }
  async verifyEmptyProjectState(): Promise<boolean> {
    try {
      const emptyStateTitle = this.locator('text=No templates found in this project');
      await emptyStateTitle.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      return await emptyStateTitle.isVisible();
    } catch {
      return false;
    }
  }

  async clickViewAllProjectsButton(): Promise<void> {
    const viewAllButton = this.locator('button', { hasText: 'View all projects' });
    await viewAllButton.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(viewAllButton);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async verifyNoErrorBoundary(waitMs = 3000): Promise<boolean> {
    const errorIndicator = this.page.locator('text=Something wrong happened');
    const hasError = await errorIndicator.isVisible({ timeout: waitMs }).catch(() => false);
    return !hasError;
  }
}
