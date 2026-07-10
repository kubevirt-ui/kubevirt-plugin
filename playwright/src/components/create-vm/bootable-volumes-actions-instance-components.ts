/**
 * Bootable volume detail page and instance type catalog components.
 */

import BaseComponent from '@/components/shared/base-component';
import { STEP_INSTANCE_TYPE_CONFIG } from '@/data-models/step-defaults';
import { MOCK_ENDPOINTS } from '@/utils/mock-responses';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

/**
 * Page object for BootableVolume detail page.
 * Handles viewing, verifying status, detail field inspection, and deleting bootable volumes.
 */
export class BootableVolumeDetailComponent extends BaseComponent {
  private readonly _deleteBtn = this.locator('button:has-text("Delete")');
  private readonly _resourceTitle = this.locator('[data-test-id="resource-title"]');
  private readonly _roleTab = this.locator('[role="tab"]');

  constructor(page: Page) {
    super(page);
  }

  async deleteBootableVolume(volumeName: string, deletePvc = false): Promise<boolean> {
    try {
      const actionsButton = this.locator('button:has-text("Actions")');
      await actionsButton.waitFor({ state: 'visible', timeout: 10000 });
      await this.robustClick(actionsButton);

      const deleteButton = this._deleteBtn;
      await deleteButton.waitFor({ state: 'visible', timeout: 5000 });
      await this.robustClick(deleteButton);

      await this.locator('text=Delete DataSource?').waitFor({ state: 'visible', timeout: 5000 });

      const volumeNameInModal = this.locator(`strong:has-text("${volumeName}")`);
      const volumeNameExists = await volumeNameInModal
        .isVisible({ timeout: 5000 })
        .catch(() => false);
      if (!volumeNameExists) {
        return false;
      }

      if (deletePvc) {
        const pvcCheckbox = this.locator('input[id="pvc-checkbox"]');
        const pvcCheckboxExists = await pvcCheckbox
          .isVisible({ timeout: 60000 })
          .catch(() => false);
        if (pvcCheckboxExists) {
          await pvcCheckbox.check({ force: true });
        }
      }

      const confirmDeleteButton = this._deleteBtn;
      await confirmDeleteButton.waitFor({ state: 'visible', timeout: 5000 });
      await this.robustClick(confirmDeleteButton);

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Returns the breadcrumb link text (first breadcrumb).
   */
  async getBreadcrumbText(): Promise<string | null> {
    try {
      const breadcrumb = this.locator('nav[aria-label="Breadcrumb"] a').first();
      await breadcrumb.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      return await breadcrumb.innerText();
    } catch {
      return null;
    }
  }

  /**
   * Returns all detail field labels visible on the page.
   * Polls briefly so that async-rendered fields (InstanceType, Preference) have time to appear.
   */
  async getDetailFieldLabels(minExpected = 6, timeoutMs = 30_000): Promise<string[]> {
    const deadline = Date.now() + timeoutMs;
    let labels: string[] = [];
    while (Date.now() < deadline) {
      try {
        labels = await this.page.evaluate(() => {
          const dts = document.querySelectorAll('main dt');
          return Array.from(dts)
            .map((dt) => dt.textContent?.trim() || '')
            .filter(Boolean);
        });
        if (labels.length >= minExpected) return labels;
      } catch {
        /* retry */
      }
      await this.page.waitForTimeout(500);
    }
    return labels;
  }

  /**
   * Returns the text content of a detail field (dd) by its label (dt).
   * Uses the dt/dd sibling pattern on the detail page.
   */
  async getDetailFieldValue(label: string): Promise<string | null> {
    try {
      const value = await this.page.evaluate((lbl: string) => {
        const dts = Array.from(document.querySelectorAll('main dt'));
        for (const dt of dts) {
          if (dt.textContent?.trim().startsWith(lbl)) {
            const dd = dt.nextElementSibling;
            if (dd?.tagName === 'DD') {
              return dd.textContent?.trim() || null;
            }
          }
        }
        return null;
      }, label);
      return value;
    } catch {
      return null;
    }
  }

  async getResourceTitle(): Promise<string> {
    await this._resourceTitle.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    return await this._resourceTitle.innerText();
  }

  async getStatusText(): Promise<string> {
    const statusText = this.locator('[data-test="status-text"]');
    await statusText.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    return await statusText.innerText();
  }

  async isResourceTitleEqualTo(
    expectedName: string,
    timeout: number = TestTimeouts.UI_ELEMENT_VISIBILITY,
  ): Promise<boolean> {
    try {
      const startTime = Date.now();
      const pollInterval = 500;

      while (Date.now() - startTime < timeout) {
        try {
          await this._resourceTitle.waitFor({ state: 'visible', timeout: pollInterval });
          const actualTitle = await this._resourceTitle.innerText();
          if (actualTitle?.trim() === expectedName.trim()) {
            return true;
          }
        } catch {}
        await this.page.waitForTimeout(pollInterval);
      }

      return false;
    } catch {
      return false;
    }
  }

  async isStatusEqualTo(
    expectedStatus: string,
    timeout: number = TestTimeouts.DATA_VOLUME_STATUS,
  ): Promise<boolean> {
    try {
      await this.page.waitForFunction(
        ({ selector, expected }) => {
          const element = document.querySelector(selector);
          return element?.textContent?.trim() === expected;
        },
        { selector: '[data-test="status-text"]', expected: expectedStatus.trim() },
        { timeout },
      );
      return true;
    } catch {
      return false;
    }
  }

  async navigateToBootableVolumeDetail(volumeName: string, namespace: string) {
    await this.goTo(`/k8s/ns/${namespace}/cdi.kubevirt.io~v1beta1~DataSource/${volumeName}`);
    await this.page
      .waitForLoadState('networkidle', { timeout: TestTimeouts.UI_VISIBILITY_QUICK })
      .catch(() => undefined);
    await this._resourceTitle.waitFor({
      state: 'visible',
      timeout: TestTimeouts.RESOURCE_CREATION,
    });
  }

  /**
   * Verifies that a detail field contains expected text (partial match).
   */
  async verifyDetailFieldContains(label: string, expectedText: string): Promise<boolean> {
    const value = await this.getDetailFieldValue(label);
    if (!value) return false;
    return value.includes(expectedText);
  }

  /**
   * Verifies that both "Details" and "YAML" tabs are visible on the detail page.
   */
  async verifyDetailTabsVisible(): Promise<boolean> {
    try {
      const detailsTab = this._roleTab.filter({ hasText: 'Details' });
      const yamlTab = this._roleTab.filter({ hasText: 'YAML' });
      await detailsTab.first().waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await yamlTab.first().waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      return true;
    } catch {
      return false;
    }
  }
}

export class CreateVmInstanceTypesComponent extends BaseComponent {
  private readonly _addVolumeButton = this.locator('#tour-step-add-volume');
  private readonly _bootableVolumeTableBody = this.locator('table.BootableVolumeList-table tbody');
  private readonly _buttonSortFavorites = this.locator('button[aria-label="Sort favorites"]');
  private readonly _createFolderButton = this.locator('button:has-text("Create folder")');
  private readonly _createVirtualMachineButton = this.locator('button', {
    hasText: 'Create VirtualMachine',
  });
  private readonly _createVmInstanceTypeSectionHeaderSvg = this.locator(
    '.create-vm-instance-type-section__header svg',
  );
  private readonly _customizeVirtualMachineFooterButton = this.locator(
    '.create-vm-instance-type-footer button',
    { hasText: 'Customize VirtualMachine' },
  );
  private readonly _dialogModalDescription = this.locator(
    '[data-test="dialog-modal"] #description',
  );
  private readonly _filterDropdownToggle = this.locator('[data-test-id="filter-dropdown-toggle"]');
  private readonly _instanceTypeHelpText = this.locator(
    '.create-vm-instance-type-section__HelpTextIcon:has-text("From the Volume table, select a bootable volume to boot your VirtualMachine")',
  );
  private readonly _instancetypesTab = this.locator('[data-test="instancetypes-tab"]');
  private readonly _instanceTypesVmDetailsSection = this.locator(
    '.instancetypes-vm-details-section',
  );
  private readonly _instancetypesVmDetailsSectionPlaceholderSearchFolder = this.locator(
    '.instancetypes-vm-details-section [placeholder="Search folder"]',
  );
  private readonly _nameFilterInput = this.locator('[data-test="name-filter-input"]');
  private readonly _nameVmname = this.locator('[name="vmname"]');
  private readonly _rootRedHatProvidedBtn = this.locator(
    '#root button:has-text("Red Hat provided")',
  );
  private readonly _rootUSeriesBtn = this.locator('#root button:has-text("U series")');
  private readonly _selectVolumeToBootFrom = this.locator('text=Select volume to boot from');
  private readonly _startAfterCreationCheckbox = this.locator(
    '#start-after-create-checkbox',
  ).first();
  private readonly _tabModal = this.locator('#tab-modal');

  private readonly _tdIdNameHasTextRhel9 = this.locator('td[id="name"]:has-text("rhel9")');

  constructor(page: Page) {
    super(page);
  }

  async addVolumeViaRegistry(
    volumeName: string,
    registryUrl: string,
    username: string,
    password: string,
    instanceType: string = STEP_INSTANCE_TYPE_CONFIG.SMALL,
    preference: string = STEP_INSTANCE_TYPE_CONFIG.FEDORA,
    cronExpression = '0 0 * * 2',
  ): Promise<boolean> {
    try {
      await this._addVolumeButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.RESOURCE_CREATION,
      });
      await this.robustClick(this._addVolumeButton);

      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

      const sourceTypeSelect = this.locator(
        '[data-test="dialog-modal"] [data-test-id="source-type-select"]',
      );
      await sourceTypeSelect.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this.robustClick(sourceTypeSelect);

      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      const registryOption = this.locator('[data-test-id="use-registry"]');
      await this.robustClick(registryOption);

      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

      const containerImageInput = this.locator(
        '[data-test="dialog-modal"] [data-test-id="volume-registry-container-source-input"]',
      );
      await containerImageInput.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await containerImageInput.fill(registryUrl);

      const usernameInput = this.locator(
        '[data-test="dialog-modal"] [data-test-id="volume-registry-container-source-username"]',
      );
      await usernameInput.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await usernameInput.fill(username);

      const passwordInput = this.locator(
        '[data-test="dialog-modal"] [data-test-id="volume-registry-container-source-password"]',
      );
      await passwordInput.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await passwordInput.fill(password);

      const cronExpInput = this.locator(
        '[data-test="dialog-modal"] input[data-test-id="volume-registry-retain-cron-expression"]',
      );
      await cronExpInput.scrollIntoViewIfNeeded();
      await cronExpInput.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await cronExpInput.clear();
      await cronExpInput.fill(cronExpression);

      const volumeNameInput = this.locator(
        '[data-test="dialog-modal"] #volume-name, [data-test="dialog-modal"] #name',
      ).first();
      await volumeNameInput.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
      await volumeNameInput.fill(volumeName);

      const selectPreferenceButton = this.locator(
        '[data-test="dialog-modal"] button:has-text("Select preference")',
      );
      await selectPreferenceButton.scrollIntoViewIfNeeded();
      await selectPreferenceButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this.robustClick(selectPreferenceButton);

      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      const searchPreferenceInput = this.locator('input[placeholder="Select preference"]');
      await searchPreferenceInput.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await searchPreferenceInput.fill(preference);

      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      const preferenceOption = this.locator(
        `button#select-inline-filter-VirtualMachineClusterPreference-${preference}`,
      );
      await preferenceOption.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this.robustClick(preferenceOption);

      const selectInstanceButton = this.locator(
        '[data-test="dialog-modal"] button:has-text("Select InstanceType")',
      );
      await selectInstanceButton.scrollIntoViewIfNeeded();
      await selectInstanceButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this.robustClick(selectInstanceButton);

      const redHatProvidedIT = this._rootRedHatProvidedBtn.first();
      await redHatProvidedIT.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this.robustClick(redHatProvidedIT);

      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      const uSeries = this._rootUSeriesBtn.first();
      await uSeries.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this.robustClick(uSeries);

      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      const instanceTypeOption = this.locator(`#u1 button:has-text("${instanceType}")`).first();
      await instanceTypeOption.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this.robustClick(instanceTypeOption);

      const descriptionInput = this._dialogModalDescription;
      await descriptionInput.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await descriptionInput.fill(`Test volume from Registry`);

      await this.clickSave();

      const addVolModal = this._tabModal;
      await addVolModal.waitFor({
        state: 'hidden',
        timeout: TestTimeouts.TEST_EXTENDED,
      });

      return true;
    } catch {
      return false;
    }
  }

  async addVolumeViaUpload(
    volumeName: string,
    isoFilePath: string,
    instanceType = 'nano',
    preference = 'alpine',
  ): Promise<boolean> {
    try {
      await this._addVolumeButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.RESOURCE_CREATION,
      });
      await this.robustClick(this._addVolumeButton);

      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

      const uploadInput = this.locator('[data-test="dialog-modal"] input[type="file"]');

      await uploadInput.setInputFiles(isoFilePath);

      const isoCheckbox = this.locator('[data-test="dialog-modal"] input[id="iso-checkbox"]');
      const isChecked = await isoCheckbox.isChecked().catch(() => false);
      if (!isChecked) {
        await isoCheckbox.check({ force: true });
      }

      const volumeNameInput = this.locator(
        '[data-test="dialog-modal"] #volume-name, [data-test="dialog-modal"] #name',
      ).first();
      await volumeNameInput.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
      await volumeNameInput.fill(volumeName);

      const selectPreferenceButton = this.locator(
        '[data-test="dialog-modal"] button:has-text("Select preference")',
      );
      await selectPreferenceButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this.robustClick(selectPreferenceButton);

      const searchPreferenceInput = this.locator('#select-inline-filter input');
      await searchPreferenceInput.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await searchPreferenceInput.fill(preference);

      const preferenceOption = this.locator(
        `#select-inline-filter-VirtualMachineClusterPreference-${preference}`,
      );
      await this.robustClick(preferenceOption);

      const selectInstanceButton = this.locator(
        '[data-test="dialog-modal"] button:has-text("Select InstanceType")',
      );
      await selectInstanceButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this.robustClick(selectInstanceButton);

      const redHatProvided = this._rootRedHatProvidedBtn.first();
      await this.robustClick(redHatProvided);

      const uSeries = this._rootUSeriesBtn.first();
      await this.robustClick(uSeries);

      const instanceTypeOption = this.locator(`#u1 button:has-text("${instanceType}:")`).first();
      await this.robustClick(instanceTypeOption);

      const descriptionInput = this._dialogModalDescription;
      await descriptionInput.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await descriptionInput.fill(`Test volume from Upload`);

      await this.clickSave();

      const addVolModal = this._tabModal;
      await addVolModal.waitFor({
        state: 'hidden',
        timeout: TestTimeouts.TEST_EXTENDED,
      });

      return true;
    } catch {
      return false;
    }
  }

  async clearSecretsApiMock(namespace?: string): Promise<void> {
    await this.page.unroute(MOCK_ENDPOINTS.NAMESPACE_SECRETS(namespace));
  }

  async clickAddConfigMapSecretOrServiceAccount(): Promise<void> {
    const addButton = this.locator('button', {
      hasText: 'Add Config Map, Secret, or Service Account',
    });
    await addButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(addButton);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    const resourceToggle = this.locator('button.pf-v6-c-menu-toggle:has-text("Select a resource")');
    await resourceToggle.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(resourceToggle);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  }

  async clickAddVolumeButton() {
    await this._addVolumeButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.RESOURCE_CREATION,
    });
    await this.robustClick(this._addVolumeButton);
  }

  async clickCliTab(): Promise<void> {
    const cliTab = this.locator('.pf-v6-c-modal-box__body button:has-text("CLI")');
    await cliTab.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(cliTab);
  }
  async clickCreateVirtualMachine() {
    await this.robustClick(this._createVirtualMachineButton);
  }

  async clickCustomizeVirtualMachineFooterButton() {
    await this._customizeVirtualMachineFooterButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(this._customizeVirtualMachineFooterButton);
  }

  async clickHugepages() {
    await this.locator(`button:has-text("Hugepages")`).click();
  }

  async clickInstanceSize(sizeOption: string) {
    await this.locator(`button:has-text("${sizeOption}")`).click();
  }
  async clickInstanceTypesTab() {
    await this._instancetypesTab.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this._instancetypesTab.click();
  }
  async clickInstanceTypesVmDetailsSection() {
    await this._instanceTypesVmDetailsSection.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(this._instanceTypesVmDetailsSection);
  }

  async clickOperatingSystem(osName: string) {
    const osLocator = this.locator('#name small').filter({ hasText: osName }).first();
    await osLocator.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
    await osLocator.click();
  }

  async clickSeriesDropdown(seriesName: string) {
    await this.locator(`button:has-text("${seriesName} series")`).click();
  }

  async clickStartAfterCreationCheckbox() {
    await this._startAfterCreationCheckbox.waitFor({
      state: 'attached',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    const isChecked = await this._startAfterCreationCheckbox.isChecked().catch(() => false);
    if (!isChecked) {
      await this._startAfterCreationCheckbox.evaluate((el: HTMLInputElement) => {
        el.checked = true;
        el.dispatchEvent(new Event('change', { bubbles: true }));
      });
    }
  }

  async clickViewYamlAndCli(): Promise<void> {
    const yamlCliButton = this.locator('button:has-text("View YAML & CLI")');
    await yamlCliButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(yamlCliButton);
  }

  async fillVmName(vmName: string) {
    await this._nameVmname.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this._nameVmname.fill(vmName);
    await this._nameVmname.press('Tab');
  }

  async filterVolumeByName(volumeName = 'fedora'): Promise<boolean> {
    try {
      await this.locator(
        '.create-vm-instance-type-section input[data-test-id="item-filter"]',
      ).waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });

      await this.locator('.create-vm-instance-type-section input[data-test-id="item-filter"]').fill(
        volumeName,
      );

      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);

      const volumeCell = this.locator(`td[id="name"]:has-text("${volumeName}")`).first();
      await volumeCell.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });

      const volumeExists = await volumeCell.isVisible().catch(() => false);
      const rhel9Cell = this._tdIdNameHasTextRhel9;
      const rhel9NotExists = !(await rhel9Cell.isVisible().catch(() => false));

      return volumeExists && rhel9NotExists;
    } catch {
      return false;
    }
  }

  async filterVolumeByOS(osName = 'Fedora'): Promise<boolean> {
    try {
      await this._filterDropdownToggle.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await this._filterDropdownToggle.click();

      const osFilterOption = this.locator(`.co-filter-dropdown-item__name:has-text("${osName}")`);
      await osFilterOption.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await osFilterOption.click();

      const volumeNameButton = this.locator('button:has-text("Volume name")');
      await volumeNameButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await volumeNameButton.click();

      const selectVolumeText = this._selectVolumeToBootFrom;
      await selectVolumeText.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await selectVolumeText.scrollIntoViewIfNeeded();

      const fedoraCell = this.locator('td[id="name"]:has-text("fedora")').first();
      const rhel9Cell = this._tdIdNameHasTextRhel9;

      const fedoraExists = await fedoraCell.isVisible().catch(() => false);
      const rhel9NotExists = !(await rhel9Cell.isVisible().catch(() => false));

      return fedoraExists && rhel9NotExists;
    } catch {
      return false;
    }
  }

  async getEnvironmentResourceGroupTitles(): Promise<string[]> {
    const listbox = this.locator('#select-inline-filter-listbox');
    await listbox.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    const headings = listbox.locator('h1');
    const count = await headings.count();
    const titles: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await headings.nth(i).textContent();
      if (text) titles.push(text.trim());
    }
    return titles;
  }

  async getInstanceTypeText(): Promise<string> {
    const instanceTypeLocator = this.locator(
      '.pf-v6-c-description-list__group:has-text("InstanceType")',
    );
    await instanceTypeLocator.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    return (await instanceTypeLocator.textContent()) || '';
  }

  async getOperatingSystemText(): Promise<string> {
    const osLocator = this.locator('.pf-v6-c-description-list__group:has-text("Operating system")');
    await osLocator.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    return (await osLocator.textContent()) || '';
  }

  /**
   * Returns the text labels of all visible instance-type series buttons in the order they
   * appear in the DOM. Use this to verify alphabetical/expected sort order (CNV-75583).
   */
  async getSeriesButtonTexts(): Promise<string[]> {
    const buttons = this.locator('button[class*="series"], button:has-text(" series")');
    const count = await buttons.count().catch(() => 0);
    const texts: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = (await buttons.nth(i).textContent())?.trim() ?? '';
      if (text) texts.push(text);
    }
    return texts;
  }

  isAddConfigMapButtonVisible(): Promise<boolean> {
    return this.locator('button', { hasText: 'Add Config Map, Secret, or Service Account' })
      .isVisible({ timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
      .catch(() => false);
  }

  async isBootableVolumesSectionVisible(): Promise<boolean> {
    const tableVisible = await this._bootableVolumeTableBody
      .isVisible({ timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
      .catch(() => false);
    if (tableVisible) return true;
    const selectVolumeText = this._selectVolumeToBootFrom;
    return await selectVolumeText
      .isVisible({ timeout: TestTimeouts.RETRY_DELAY })
      .catch(() => false);
  }

  async isEnvironmentEditorVisible(): Promise<boolean> {
    try {
      await this.locator(
        '.wizard-environment-tab, .environment-form__form, [data-test="save-button"]',
      )
        .first()
        .waitFor({ state: 'attached', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      return true;
    } catch {
      return false;
    }
  }

  isEnvironmentErrorAlertVisible(waitMs = 3000): Promise<boolean> {
    return this.locator('[aria-label*="Danger"], [aria-label*="danger"], .pf-m-danger')
      .first()
      .isVisible({ timeout: waitMs })
      .catch(() => false);
  }

  async isInstanceTypesSectionVisible(): Promise<boolean> {
    const sectionVisible = await this._instanceTypesVmDetailsSection
      .isVisible({ timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
      .catch(() => false);
    if (sectionVisible) return true;
    return await this._instanceTypeHelpText
      .isVisible({ timeout: TestTimeouts.RETRY_DELAY })
      .catch(() => false);
  }

  async markVolumeFavorite(): Promise<boolean> {
    try {
      await this._bootableVolumeTableBody.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      const tableBody = this._bootableVolumeTableBody;

      const rows = tableBody.locator('tr');
      const rowCount = await rows.count();

      if (rowCount === 0) {
        return false;
      }

      const lastRow = rows.nth(rowCount - 1);
      const favoritesButton = lastRow.locator('td[id="favorites"] button');
      await favoritesButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await favoritesButton.click();

      const firstRow = rows.first();
      const firstRowText = await firstRow.textContent();
      if (!firstRowText?.includes('rhel9')) {
        return false;
      }

      await favoritesButton.click();

      const firstRowText2 = await firstRow.textContent();
      if (!firstRowText2?.includes('rhel8')) {
        return false;
      }

      await this._buttonSortFavorites.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await this._buttonSortFavorites.click();

      const lastRowText = await lastRow.textContent();
      if (!lastRowText?.includes('rhel')) {
        return false;
      }

      await favoritesButton.click();
      await favoritesButton.click();

      return true;
    } catch {
      return false;
    }
  }

  async markVolumeFavoriteWithUnfavorite(_volumeName: string): Promise<boolean> {
    try {
      await this._bootableVolumeTableBody.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });

      const favoritesButton = this.page.locator('td[id="favorites"] button').first();
      await favoritesButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });

      const isFavorited = await favoritesButton
        .evaluate((button) => {
          const ariaPressed = button.getAttribute('aria-pressed');
          if (ariaPressed === 'true') {
            return true;
          }

          const svg = button.querySelector('svg');
          if (svg) {
            const path = svg.querySelector('path');
            if (path) {
              const fill = path.getAttribute('fill');

              if (fill && fill !== 'none' && fill !== 'transparent' && fill !== 'currentColor') {
                return true;
              }
            }
          }

          const classList = Array.from(button.classList);
          return classList.some(
            (cls) => cls.includes('filled') || cls.includes('active') || cls.includes('pressed'),
          );
        })
        .catch(() => false);

      if (isFavorited) {
        await favoritesButton.click();

        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      }

      await favoritesButton.click();

      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

      return true;
    } catch {
      return false;
    }
  }

  async mockSecretsApiWith403(namespace?: string): Promise<void> {
    const pattern = MOCK_ENDPOINTS.NAMESPACE_SECRETS(namespace);
    await this.page.route(pattern, async (route) => {
      const ns = namespace ?? 'the requested namespace';
      await route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({
          kind: 'Status',
          apiVersion: 'v1',
          status: 'Failure',
          message: `secrets is forbidden: User cannot list resource "secrets" in API group "" in the namespace "${ns}"`,
          reason: 'Forbidden',
          code: 403,
        }),
      });
    });
  }

  /**
   * @deprecated Use {@link navigateToWizardInstanceTypes} on 4.22+.
   */
  async navigateToInstanceTypeCatalogViaVmList(namespace?: string): Promise<void> {
    const ns = namespace || 'default';
    await this.goTo(`/k8s/ns/${ns}/catalog/instancetype`);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async selectBootableVolume(volumeName: string): Promise<boolean> {
    try {
      await this._bootableVolumeTableBody.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });

      const nameFilterInput = this._nameFilterInput;
      await nameFilterInput.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await nameFilterInput.clear();
      await nameFilterInput.fill(volumeName);

      const volumeElement = this.locator('small', { hasText: volumeName }).first();
      await volumeElement.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await this.robustClick(volumeElement);

      return true;
    } catch {
      return false;
    }
  }

  async selectFolderForInstanceType(folderName: string) {
    try {
      await this._instanceTypesVmDetailsSection.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });

      await this._instancetypesVmDetailsSectionPlaceholderSearchFolder.focus();
      await this._instancetypesVmDetailsSectionPlaceholderSearchFolder.fill(folderName);
      await this._instancetypesVmDetailsSectionPlaceholderSearchFolder.press('Enter');

      await this.robustClick(this._createFolderButton);

      return true;
    } catch {
      return false;
    }
  }

  async setStartAfterCreationInstanceType(enabled: boolean): Promise<void> {
    const startAfterCheckbox = this.locator('#start-after-create-checkbox').first();
    await startAfterCheckbox.scrollIntoViewIfNeeded().catch(() => undefined);
    await startAfterCheckbox.waitFor({
      state: 'attached',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    if (enabled) {
      await startAfterCheckbox.check({ force: true });
    } else {
      await startAfterCheckbox.uncheck({ force: true });
    }
  }

  async uncheckStartAfterCreationCheckbox() {
    await this._startAfterCreationCheckbox.waitFor({
      state: 'attached',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    const isChecked = await this._startAfterCreationCheckbox.isChecked().catch(() => false);
    if (isChecked) {
      await this._startAfterCreationCheckbox.evaluate((el: HTMLInputElement) => {
        el.checked = false;
        el.dispatchEvent(new Event('change', { bubbles: true }));
      });
    }
  }

  async verifyCliCommandComponents(components: string[]): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    for (const component of components) {
      results[component] = await this.verifyCliCommandContains(component);
    }
    return results;
  }

  async verifyCliCommandContains(expectedText: string): Promise<boolean> {
    const modalBody = this.locator('.pf-v6-c-modal-box__body');
    const textLocator = modalBody.locator(`text=${expectedText}`);
    try {
      await textLocator.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      return await textLocator.isVisible();
    } catch {
      return false;
    }
  }

  async verifyInstanceTypeHelpText(): Promise<boolean> {
    try {
      await this.page.waitForLoadState('domcontentloaded', {
        timeout: TestTimeouts.RESOURCE_CREATION,
      });
      await this.page.waitForLoadState('load', {
        timeout: TestTimeouts.RESOURCE_CREATION,
      });

      await this._createVmInstanceTypeSectionHeaderSvg.waitFor({
        state: 'attached',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await this._createVmInstanceTypeSectionHeaderSvg.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });

      await this.robustClick(this._createVmInstanceTypeSectionHeaderSvg);

      await this._instanceTypeHelpText.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      return await this._instanceTypeHelpText.isVisible();
    } catch {
      return false;
    }
  }

  async verifyInstanceTypeSeries(): Promise<boolean> {
    try {
      const series = ['CX series', 'U series', 'O series', 'N series', 'M series', 'RT series'];
      const results = await Promise.all(
        series.map(async (seriesName) => {
          const seriesLocator = this.locator('button', { hasText: seriesName });
          await seriesLocator.waitFor({
            state: 'visible',
            timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
          });
          await seriesLocator.scrollIntoViewIfNeeded();
          return await seriesLocator.isVisible().catch(() => false);
        }),
      );

      return results.every((result) => result === true);
    } catch {
      return false;
    }
  }

  async verifyInstanceTypeText(expectedText: string): Promise<boolean> {
    const instanceTypeText = await this.getInstanceTypeText();
    return instanceTypeText.includes(expectedText);
  }

  async verifyOperatingSystemText(expectedText: string): Promise<boolean> {
    const osText = await this.getOperatingSystemText();
    return osText.includes(expectedText);
  }

  async verifyVolumeExistsInList(volumeName: string): Promise<boolean> {
    try {
      const nameFilterInput = this._nameFilterInput;
      await nameFilterInput.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await nameFilterInput.clear();
      await nameFilterInput.fill(volumeName);

      return await this.locator('small', { hasText: volumeName })
        .isVisible({ timeout: TestTimeouts.RESOURCE_CREATION })
        .catch(() => false);
    } catch {
      return false;
    }
  }

  async verifyVolumeNameInNameField(volumeName: string): Promise<boolean> {
    try {
      const nameField = this.locator('#name', { hasText: volumeName });
      await nameField.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      return await nameField.isVisible();
    } catch {
      return false;
    }
  }
}
