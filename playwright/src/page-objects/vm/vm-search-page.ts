import PageCommons from '@/page-objects/page-commons';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

export default class VmSearchPage extends PageCommons {
  private readonly _advSearchMemOperatorToggle = this.locator(
    '[data-test="adv-search-mem-operator-toggle"]',
  );
  private readonly _advSearchNetwork = this.locator('[data-test="adv-search-network"]');
  private readonly _advSearchVmProjectToggle = this.locator(
    '[data-test="adv-search-vm-project-toggle"]',
  );
  private readonly _allSearchResultsFoundBtn = this.locator(
    'button:has-text("All search results found")',
  );
  private readonly _backToVirtualMachinesListBtn = this.locator(
    'button:has-text("Back to VirtualMachines list")',
  );
  private readonly _footerSaveButton = this.locator('footer [data-test="save-button"]');
  private readonly _h1H2H3H4H5H6 = this.locator('h1, h2, h3, h4, h5, h6');
  private readonly _savedSearches = this.locator('[data-test="saved-searches"]');
  private readonly _savedSearchesBtn = this.locator('button:has-text("Saved searches")');
  private readonly _saveSearchButton = this.locator('[data-test="save-search"]');
  private readonly _saveSearchDescription = this.locator(
    '[data-test-id="save-search-description"]',
  );
  private readonly _saveSearchName = this.locator('[data-test-id="save-search-name"]');
  private readonly _searchBarResults = this.locator(
    '[data-test="search-results"], .pf-v6-c-panel.pf-m-raised',
  );
  private readonly _searchBarResults1 = this.locator('[data-test="search-bar-results"]');
  private readonly _vmAdvancedSearchButton = this.locator(
    '[data-test="vm-advanced-search-button"]',
  );
  private readonly _vmSearchInputByDataTest = this.locator('[data-test="vm-search-input"] input');

  constructor(page: Page) {
    super(page);
  }

  private async fillAdvSearchField(testId: string, value: string): Promise<void> {
    const field = this.locator(`[data-test="${testId}"]`);
    await field.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await field.clear();
    await field.fill(value);
  }

  async clearVmToolbarSearch(): Promise<void> {
    await this._vmSearchInputByDataTest.waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await this._vmSearchInputByDataTest.clear();
    await this.clickSearchButton();
  }

  async clickAdvancedSearchButton(): Promise<void> {
    await this._vmAdvancedSearchButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await this.robustClick(this._vmAdvancedSearchButton);
  }

  async clickAdvancedSearchClose(): Promise<void> {
    const closeButton = this.locator('button[aria-label="Close"]');
    await closeButton.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(closeButton);
  }

  async clickAdvancedSearchReset(): Promise<void> {
    const resetButton = this.locator('button[aria-label="Clear search"]');
    await resetButton.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(resetButton);
  }

  async clickAllSearchResultsFound(): Promise<void> {
    await this._allSearchResultsFoundBtn.waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await this.robustClick(this._allSearchResultsFoundBtn);
  }

  async clickBackToVirtualMachinesList(): Promise<void> {
    await this._backToVirtualMachinesListBtn.waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await this.robustClick(this._backToVirtualMachinesListBtn);
  }

  override async clickClearAllFilters(): Promise<void> {
    await super.clickClearAllFilters();
  }

  async clickClearSearchButton(): Promise<void> {
    const clearBtn = this.locator(
      'button[aria-label="Clear search"], button[aria-label="Reset"], button:has-text("Clear search")',
    ).first();
    const clearVisible = await clearBtn
      .waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT })
      .then(() => true)
      .catch(() => false);
    if (clearVisible) {
      await this.robustClick(clearBtn);
    } else {
      const searchInput = this.locator(
        '[data-test="vm-adv-search-toolbar"] input, [data-test="vm-search-input"] input',
      ).first();
      await searchInput.clear();
    }
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  }

  async clickDeleteSavedSearch(saveName: string): Promise<void> {
    const savedSearchItem = this.locator(`[data-test="saved-search-item-${saveName}"]`);
    await savedSearchItem.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    const deleteButton = savedSearchItem.locator(`[data-test="delete-search-item-${saveName}"]`);
    await deleteButton.waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
    await this.robustClick(deleteButton);
  }

  async clickFooterSearchButton(): Promise<void> {
    await this.locator('footer button', { hasText: 'Search' }).waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await this.robustClick(this.locator('footer button', { hasText: 'Search' }));
  }

  async clickResultsAdvancedSearch(): Promise<void> {
    const advSearchBtn = this.locator(
      '[data-test="results-advanced-search"], [data-test="advanced-search"], [data-test="try-advanced-search"]',
    ).first();
    await advSearchBtn.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(advSearchBtn);
  }

  async clickSaveButtonInModal(): Promise<void> {
    await this._footerSaveButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await this.robustClick(this._footerSaveButton);
  }

  async clickSavedSearchByName(saveName: string): Promise<void> {
    await this._savedSearches.waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    const savedSearchButton = this._savedSearches.locator(`button:has-text("${saveName}")`);
    await savedSearchButton.waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
    await this.robustClick(savedSearchButton);
  }

  async clickSavedSearches(): Promise<void> {
    await this._savedSearchesBtn.waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await this.robustClick(this._savedSearchesBtn);
  }

  async clickSaveSearch(): Promise<void> {
    await this._saveSearchButton.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(this._saveSearchButton);
  }

  async clickSearchAllButton(): Promise<void> {
    const searchAllBtn = this.locator('button:has-text("Search all")');
    await searchAllBtn.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(searchAllBtn);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async clickSearchBarResultsButton(buttonText: string): Promise<void> {
    await this._searchBarResults1.waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    const button = this._searchBarResults1.locator('button', {
      hasText: buttonText,
    });
    await button.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(button);
  }

  async clickSearchButton(): Promise<void> {
    await this.locator('[data-test="search-results"] button', {
      hasText: 'Search',
    })
      .first()
      .waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(
      this.locator('[data-test="search-results"] button', {
        hasText: 'Search',
      }).first(),
    );
  }

  async fillSaveSearchDescription(saveDescription: string): Promise<void> {
    await this._saveSearchDescription.waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await this._saveSearchDescription.clear();
    await this._saveSearchDescription.fill(saveDescription);
  }

  async fillSaveSearchName(saveName: string): Promise<void> {
    await this._saveSearchName.waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await this._saveSearchName.clear();
    await this._saveSearchName.fill(saveName);
  }

  async fillVmSearchInput(searchText: string): Promise<void> {
    await this._vmSearchInputByDataTest.waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await this._vmSearchInputByDataTest.clear();
    await this._vmSearchInputByDataTest.pressSequentially(searchText, { delay: 250 });
    await this.clickSearchButton();
  }

  async getAdvancedSearchIpValidationWarning(): Promise<string | null> {
    try {
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      const warningText = this.locator(
        '.pf-v6-c-helper-text__item.pf-m-warning .pf-v6-c-helper-text__item-text',
      ).first();
      const isVisible = await warningText.isVisible().catch(() => false);
      if (!isVisible) return null;
      return (await warningText.textContent().catch(() => null))?.trim() ?? null;
    } catch {
      return null;
    }
  }

  async getAdvancedSearchProjectOptions(): Promise<string[]> {
    const toggleInput = this._advSearchVmProjectToggle.locator('input');
    await toggleInput.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await toggleInput.click();
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    const options = this.locator('button[role="option"]');
    let texts: string[] = [];
    try {
      await options.first().waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
      texts = await options.allTextContents();
    } catch {}

    await toggleInput.click();
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    return texts.map((t) => t.trim()).filter(Boolean);
  }

  async isProjectContextInSuggestBox(projectName: string): Promise<boolean> {
    try {
      const projectText = this._searchBarResults.locator(`text=project ${projectName}`).first();
      await projectText.waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
      return true;
    } catch {
      return false;
    }
  }

  async isSaveSearchButtonVisible(timeout: number = TestTimeouts.SHORT_WAIT): Promise<boolean> {
    try {
      await this._saveSearchButton.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  async isSaveSearchNameDuplicateErrorVisible(): Promise<boolean> {
    try {
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      const nameField = this._saveSearchName;
      const ariaInvalid = await nameField.getAttribute('aria-invalid').catch(() => null);
      if (ariaInvalid === 'true') return true;
      const errorItem = this.locator(
        '.pf-v6-c-helper-text__item.pf-m-error, .pf-v6-c-helper-text__item.pf-m-warning',
      ).first();
      return await errorItem.isVisible().catch(() => false);
    } catch {
      return false;
    }
  }

  async pressKeyInVmSearchInput(key: string): Promise<void> {
    await this._vmSearchInputByDataTest.waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await this._vmSearchInputByDataTest.press(key);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  }

  async searchInAdvSearchToolbar(searchText: string): Promise<void> {
    const searchInput = this.locator(
      '[data-test="vm-adv-search-toolbar"] input, [data-test="vm-search-input"] input',
    ).first();
    await searchInput.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await searchInput.clear();
    await searchInput.pressSequentially(searchText, { delay: 100 });
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async searchVmAndVerifyNoResults(vmName: string): Promise<boolean> {
    await this._vmSearchInputByDataTest.waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await this._vmSearchInputByDataTest.clear();
    await this._vmSearchInputByDataTest.fill(vmName);
    try {
      const noResultsMessage = this.locator(`text=No results found for "${vmName}"`);
      await noResultsMessage.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      return true;
    } catch {
      return false;
    }
  }

  async setAdvancedSearchDate(date: string): Promise<void> {
    const dateToggle = this.locator('[data-test-id="adv-search-vm-date-toggle"]');
    await dateToggle.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(dateToggle);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    const dateOption = this.locator(`button:has-text("${date}")`);
    await dateOption.waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
    await this.robustClick(dateOption);
  }

  async setAdvancedSearchDescription(description: string): Promise<void> {
    await this.fillAdvSearchField('adv-search-vm-description', description);
  }

  async setAdvancedSearchIp(ipAddress: string): Promise<void> {
    await this._advSearchNetwork.waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    const networkButton = this._advSearchNetwork.locator('button:has-text("Network")');
    await networkButton.waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
    await this.robustClick(networkButton);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    await this.fillAdvSearchField('adv-search-vm-ip', ipAddress);
  }

  async setAdvancedSearchLabel(labelKey: string, labelValue: string): Promise<void> {
    const labelsInput = this.locator('[data-test="adv-search-vm-labels-toggle"]').locator('input');
    await labelsInput.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await labelsInput.clear();
    await labelsInput.fill(labelKey);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    const labelButton = this.locator(`button:has-text("${labelKey}=${labelValue}")`);
    await labelButton.waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
    await this.robustClick(labelButton);
  }

  async setAdvancedSearchMemory(memValue: string, operator?: string): Promise<void> {
    if (operator) {
      await this._advSearchMemOperatorToggle.waitFor({
        state: 'visible',
        timeout: TestTimeouts.ELEMENT_WAIT,
      });
      await this.robustClick(this._advSearchMemOperatorToggle);
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      const operatorButton = this.locator(`button:has-text("${operator}")`);
      await operatorButton.waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
      await this.robustClick(operatorButton);
    }
    await this.fillAdvSearchField('adv-search-mem-value', memValue);
  }

  async setAdvancedSearchNad(nad: string): Promise<void> {
    const nadToggle = this.locator('[data-test-id="adv-search-vm-nad-toggle"]');
    await nadToggle.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(nadToggle);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    const nadOption = this.locator(`button:has-text("${nad}")`);
    await nadOption.waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
    await this.robustClick(nadOption);
  }

  setAdvancedSearchName(name: string): Promise<void> {
    return this.setAdvancedSearchVmName(name);
  }

  async setAdvancedSearchNodes(node: string): Promise<void> {
    const nodeToggle = this.locator('[data-test-id="adv-search-vm-node-toggle"]');
    await nodeToggle.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(nodeToggle);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    const nodeOption = this.locator(`button:has-text("${node}")`);
    await nodeOption.waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
    await this.robustClick(nodeOption);
  }

  async setAdvancedSearchOs(os: string): Promise<void> {
    const osToggle = this.locator('[data-test-id="adv-search-vm-os-toggle"]');
    await osToggle.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(osToggle);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    const osOption = this.locator(`button:has-text("${os}")`);
    await osOption.waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
    await this.robustClick(osOption);
  }

  async setAdvancedSearchProject(projectName: string): Promise<void> {
    const projectInput = this._advSearchVmProjectToggle.locator('input');
    await projectInput.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await projectInput.clear();
    await projectInput.fill(projectName);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    const option = this.locator(`button[role="option"]:has-text("${projectName}")`).first();
    await option.waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
    await this.robustClick(option);
  }

  async setAdvancedSearchStatus(status: string): Promise<void> {
    const statusToggle = this.locator('[data-test="adv-search-vm-status-toggle"]');
    await statusToggle.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(statusToggle);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    const statusOption = this.locator('button[role="option"]', { hasText: status }).first();
    await statusOption.waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
    await this.robustClick(statusOption);
  }

  async setAdvancedSearchStorageClass(storageClass: string): Promise<void> {
    const scToggle = this.locator('[data-test-id="adv-search-vm-storageclass-toggle"]');
    await scToggle.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(scToggle);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    const scOption = this.locator(`button:has-text("${storageClass}")`);
    await scOption.waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
    await this.robustClick(scOption);
  }

  async setAdvancedSearchVcpu(vcpuValue: string): Promise<void> {
    await this.fillAdvSearchField('adv-search-vcpu-value', vcpuValue);
  }

  async setAdvancedSearchVmName(vmName: string): Promise<void> {
    await this.fillAdvSearchField('adv-search-vm-name', vmName);
  }

  async typeInVmSearchInput(searchText: string): Promise<void> {
    await this._vmSearchInputByDataTest.waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await this._vmSearchInputByDataTest.clear();
    await this._vmSearchInputByDataTest.fill(searchText);
  }

  async verifyAllSearchResultsFoundButton(): Promise<boolean> {
    try {
      const allResultsButton = this._searchBarResults.locator(
        'button:has-text("All search results found")',
      );
      return await allResultsButton.isVisible().catch(() => false);
    } catch {
      return false;
    }
  }

  async verifySavedSearchNotExists(saveName: string): Promise<boolean> {
    try {
      const savedSearchButton = this.locator(`button:has-text("${saveName}")`);
      await savedSearchButton
        .waitFor({ state: 'hidden', timeout: TestTimeouts.SHORT_WAIT })
        .catch(() => {
          return;
        });
      return !(await savedSearchButton.isVisible().catch(() => false));
    } catch {
      return true;
    }
  }

  async verifySaveSearchTitle(): Promise<boolean> {
    try {
      const title = this._h1H2H3H4H5H6.filter({ hasText: 'Save search' });
      await title.waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
      return await title.isVisible().catch(() => false);
    } catch {
      return false;
    }
  }

  async verifySearchBarResultsVisible(): Promise<boolean> {
    try {
      await this._searchBarResults.waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
      return await this._searchBarResults.isVisible().catch(() => false);
    } catch {
      return false;
    }
  }

  async verifySearchResultsSubtitle(): Promise<boolean> {
    try {
      const subtitle = this._h1H2H3H4H5H6.filter({ hasText: 'Search results' });
      await subtitle.waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
      return await subtitle.isVisible().catch(() => false);
    } catch {
      return false;
    }
  }

  async verifySearchSuggestBoxHidden(): Promise<boolean> {
    try {
      await this._searchBarResults.waitFor({
        state: 'hidden',
        timeout: TestTimeouts.SHORT_WAIT,
      });
      return !(await this._searchBarResults.isVisible().catch(() => false));
    } catch {
      return false;
    }
  }

  async verifyVmNameInSearchResults(vmName: string): Promise<boolean> {
    try {
      const vmLink = this._searchBarResults
        .locator(`[data-test-id="${vmName}"], a:has-text("${vmName}")`)
        .first();
      await vmLink.waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
      return await vmLink.isVisible().catch(() => false);
    } catch {
      return false;
    }
  }

  async verifyVmSearchInputEmpty(): Promise<boolean> {
    try {
      const value = await this._vmSearchInputByDataTest.inputValue();
      return value === '';
    } catch {
      return false;
    }
  }
}
