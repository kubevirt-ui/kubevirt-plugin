import BaseComponent from '@/components/shared/base-component';
import BasePage from '@/page-objects/base-page';
import { TestTimeouts } from '@/utils/test-config';
import { waitForElementStable } from '@/utils/wait-helpers';
import type { Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// Catalog card delegation types & helpers (inlined from catalog-card-component)
// ---------------------------------------------------------------------------

const DISPLAY_NAME_TO_METADATA_NAME: Record<string, string> = {
  'Red Hat Enterprise Linux 8 VM': 'rhel8-server-small',
  'Red Hat Enterprise Linux 9 VM': 'rhel9-server-small',
  'Fedora VM': 'fedora-server-small',
  'CentOS Stream 9 VM': 'centos-stream9-server-small',
  'Microsoft Windows 11 VM': 'windows11-desktop-medium',
  'Microsoft Windows Server 2022 VM': 'windows2k22-server-medium',
  'Microsoft Windows Server 2016 VM': 'windows2k16-server-medium',
  'Microsoft Windows Server 2019 VM': 'windows2k19-server-medium',
};

// ---------------------------------------------------------------------------
// CreateVmTemplateCatalogComponent
// ---------------------------------------------------------------------------

export class CreateVmTemplateCatalogComponent extends BaseComponent {
  private readonly _createVirtualMachineButton = this.locator('button', {
    hasText: 'Create VirtualMachine',
  });
  private readonly _customizeVirtualMachineButton = this.locator(
    '[data-test-id="customize-vm-btn"]',
  );
  private readonly _customizeVirtualMachineFooterButton = this.locator(
    '.create-vm-instance-type-footer button',
    { hasText: 'Customize VirtualMachine' },
  );
  private readonly _startAfterCreationCheckbox = this.locator(
    '#start-after-create-checkbox',
  ).first();
  private readonly _templatesTab = this.locator('[data-test="templates-tab"]');
  private readonly _userProvidedTab = this.locator('#filter-templateScope-user, #user-templates');
  private readonly _quickFormVmFolderInput = this.locator(
    '[id="quick-create-form"] [placeholder="Search folder"]',
  );
  private readonly _quickFormVmFolderSelectButton = this.locator('#vm-folder-select button');
  private readonly _createFolderButton = this.locator('button:has-text("Create folder")');
  private readonly _templateCatalogVmNameInput = this.locator(
    '[data-test-id="template-catalog-vm-name-input"]',
  );
  private readonly _quickCreateVmButton = this.locator('[data-test-id="quick-create-vm-btn"]');
  private readonly _searchCatalogInput = this.locator(
    '[data-test="search-catalog"] input, input[placeholder="Filter by keyword..."]',
  );

  private readonly _diskSourceDropdown = this.locator('[data-test-id="disk-boot-source"]');
  private readonly _bootSourceDropdown = this.locator('[data-test-id="cd-boot-source"]');
  private readonly _bootFromCDCheckbox = this.locator('[data-test-id="boot-cd"]');
  private readonly _windowsDriversCheckbox = this.locator('[data-test-id="cdrom-drivers"]');

  private readonly _diskSourceRegistryInput = this.locator(
    '[data-test-id="disk-boot-source-container-source-input"]',
  );
  private readonly _diskSourceURLInput = this.locator(
    '[data-test-id="disk-boot-source-http-source-input"]',
  );

  private readonly _tlsCertRequiredCheckbox = this.locator('#tls-certificate-required');
  private readonly _tlsCertTextArea = this.locator('[aria-label="TLS certificate"]');
  private readonly _tlsProjectDropdown = this.locator('button[placeholder="Select project..."]');
  private readonly _tlsCertSelectDropdown = this.locator(
    'button[placeholder="Select TLS certificate"]',
  );
  private readonly _architectureFilter = this.locator(
    '[data-test-id="filter-category-Architecture"]',
  );

  private readonly _filterDropdownButton = this.locator('button:has-text("Filter")');

  private readonly _vmCatalogGrid = this.locator('#vm-catalog-grid');
  private readonly _selectInlineFilterInput = this.locator('#select-inline-filter input');

  constructor(page: Page) {
    super(page);
  }

  // PF6 hides native checkbox inputs; interact via `attached` + programmatic toggle.
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
  async navigateToProjectCatalog(projectName: string) {
    await this.goTo(`/k8s/ns/${projectName}/catalog`);
  }

  async navigateToCatalogViaUI(): Promise<void> {
    await this.navigateToTemplateCatalogViaVmList();
  }

  async navigateToNamespaceCatalogViaUI(namespace?: string): Promise<void> {
    await this.navigateToTemplateCatalogViaVmList(namespace);
  }

  async navigateToTemplateCatalogViaVmList(namespace?: string): Promise<void> {
    const ns = namespace || 'default';
    await this.goTo(`/k8s/ns/${ns}/catalog`);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async selectFolderForTemplate(folderName: string, createNew = true) {
    try {
      await this.locator('[id="quick-create-form"]').waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });

      await this._quickFormVmFolderInput.focus();
      await this._quickFormVmFolderInput.fill(folderName);

      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

      if (createNew) {
        await this._quickFormVmFolderInput.press('Enter');
        await this.robustClick(this._createFolderButton);
      } else {
        const folderOption = this.locator(`#select-typeahead-${folderName}`);
        await this.robustClick(folderOption);
      }

      return true;
    } catch {
      return false;
    }
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

  override async waitForTemplateForm() {
    await super.waitForTemplateForm();
  }

  async fillTemplateCatalogVmName(vmName: string) {
    await this._templateCatalogVmNameInput.waitFor({
      state: 'visible',
      timeout: TestTimeouts.RESOURCE_CREATION,
    });
    await this._templateCatalogVmNameInput.clear();
    await this._templateCatalogVmNameInput.fill(vmName);
    await this._templateCatalogVmNameInput.press('Tab');
  }

  async clickQuickCreateVmButton() {
    await this._quickCreateVmButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(this._quickCreateVmButton);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_LONG);
  }

  async clickCustomizeVmButton() {
    await this._customizeVirtualMachineFooterButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(this._customizeVirtualMachineFooterButton);
  }

  async clickCustomizeVirtualMachineButton() {
    await this._customizeVirtualMachineButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(this._customizeVirtualMachineButton);
  }

  async clickCustomizeVirtualMachineFooterButton() {
    await this._customizeVirtualMachineFooterButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(this._customizeVirtualMachineFooterButton);
  }

  async fillReviewAndCreateVmName(vmName: string) {
    await this._templateCatalogVmNameInput.waitFor({
      state: 'visible',
      timeout: TestTimeouts.RESOURCE_CREATION,
    });

    await this.page.waitForFunction(
      (selector) => {
        const el = document.querySelector(selector) as HTMLInputElement | null;
        return el && !el.disabled && !el.readOnly;
      },
      '[data-test-id="template-catalog-vm-name-input"]',
      { timeout: TestTimeouts.RESOURCE_CREATION },
    );

    await this._templateCatalogVmNameInput.clear();
    await this._templateCatalogVmNameInput.fill(vmName);
    await this._templateCatalogVmNameInput.press('Tab');
  }

  async selectDiskSource(
    diskSource: 'PVC' | 'Registry' | 'Upload' | 'URL',
    value?: string,
    username?: string,
    password?: string,
  ) {
    await this._diskSourceDropdown.waitFor({
      state: 'visible',
      timeout: TestTimeouts.RESOURCE_CREATION,
    });
    await this.robustClick(this._diskSourceDropdown);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    switch (diskSource) {
      case 'URL':
        await this.robustClick(this.locator('[data-test-id="http"]'));
        if (value) {
          await this._diskSourceURLInput.waitFor({
            state: 'visible',
            timeout: TestTimeouts.UI_ACTION_COMPLETE,
          });
          await this._diskSourceURLInput.fill(value);
        }
        break;
      case 'Registry':
        await this.robustClick(this.locator('[data-test-id="registry"]'));
        if (value) {
          await this._diskSourceRegistryInput.waitFor({
            state: 'visible',
            timeout: TestTimeouts.UI_ACTION_COMPLETE,
          });
          await this._diskSourceRegistryInput.fill(value);
        }
        if (username) {
          await this.locator('[data-test-id="disk-boot-source-container-source-username"]').fill(
            username,
          );
        }
        if (password) {
          await this.locator('[data-test-id="disk-boot-source-container-source-password"]').fill(
            password,
          );
        }
        break;
      case 'PVC':
        await this.robustClick(this.locator('[data-test-id="pvc-clone"]'));
        break;
      case 'Upload':
        const uploadMenuItem = this.locator('.pf-v6-c-menu__item-main', {
          hasText: 'Upload (Upload a new file to a PVC)',
        });
        await uploadMenuItem.scrollIntoViewIfNeeded();
        await this.robustClick(uploadMenuItem, { force: true });
        if (value) {
          await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
          const fileUploadInput = this.locator('.pf-v6-c-file-upload input[type="file"]');
          const fileUploadArea = this.locator('.pf-v6-c-file-upload');
          await fileUploadArea.waitFor({
            state: 'visible',
            timeout: TestTimeouts.UI_ACTION_COMPLETE,
          });
          await fileUploadInput.setInputFiles(value);
          await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
        }
        break;
    }
  }

  async configureTlsCertificate(config: {
    source: 'existing' | 'new';
    certProject?: string;
    configMapName?: string;
    certificate?: string;
  }) {
    await this._tlsCertRequiredCheckbox.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });

    const isChecked = await this._tlsCertRequiredCheckbox.isChecked().catch(() => false);
    if (!isChecked) {
      await this.robustClick(this._tlsCertRequiredCheckbox);
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
    }

    if (config.source === 'existing') {
      await this.robustClick(this.locator('#tls-use-existing'));
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

      if (config.certProject) {
        await this._tlsProjectDropdown.waitFor({
          state: 'visible',
          timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
        });
        await this.robustClick(this._tlsProjectDropdown);
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

        const searchInput = this.page.locator('[role="listbox"]').locator('input');
        const hasSearch = await searchInput.isVisible().catch(() => false);
        if (hasSearch) {
          await searchInput.fill(config.certProject);
          await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
        }

        const projectOption = this.page.locator('[role="option"]', {
          hasText: config.certProject,
        });
        await projectOption.first().waitFor({
          state: 'visible',
          timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
        });
        await this.robustClick(projectOption.first());
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
      }

      if (config.configMapName) {
        await this._tlsCertSelectDropdown.waitFor({
          state: 'visible',
          timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
        });
        await this.robustClick(this._tlsCertSelectDropdown);
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

        const certOption = this.page.locator('[role="option"]', {
          hasText: config.configMapName,
        });
        await certOption.first().waitFor({
          state: 'visible',
          timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
        });
        await this.robustClick(certOption.first());
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
      }
    } else {
      await this.robustClick(this.locator('#tls-add-new'));
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

      if (config.certificate) {
        await this._tlsCertTextArea.waitFor({
          state: 'visible',
          timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
        });
        await this._tlsCertTextArea.fill(config.certificate);
      }
    }
  }

  async isTlsCertificateCheckboxVisible(timeout?: number): Promise<boolean> {
    try {
      await this._tlsCertRequiredCheckbox.waitFor({
        state: 'visible',
        timeout: timeout || TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      return true;
    } catch {
      return false;
    }
  }

  async isTlsCertificateChecked(): Promise<boolean> {
    return await this._tlsCertRequiredCheckbox.isChecked().catch(() => false);
  }

  async selectBootSource(
    _bootSource: 'ISO' | 'PVC' | 'Registry' | 'Upload' | 'URL',
    _value?: string,
  ) {
    const isChecked = await this._bootFromCDCheckbox.isChecked().catch(() => false);
    if (!isChecked) {
      await this._bootFromCDCheckbox.check({ force: true });
    }
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    await this._bootSourceDropdown.waitFor({
      state: 'visible',
      timeout: TestTimeouts.RESOURCE_CREATION,
    });
    await this.robustClick(this._bootSourceDropdown);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async setWindowsDrivers(mount = true) {
    const isChecked = await this._windowsDriversCheckbox.isChecked().catch(() => false);
    if (mount && !isChecked) {
      await this._windowsDriversCheckbox.check({ force: true });
    } else if (!mount && isChecked) {
      await this._windowsDriversCheckbox.uncheck({ force: true });
    }
  }

  async verifyWindowsDriversCheckbox(shouldBeChecked: boolean): Promise<boolean> {
    try {
      await this._windowsDriversCheckbox.waitFor({
        state: 'visible',
        timeout: TestTimeouts.RESOURCE_CREATION,
      });
      const isChecked = await this._windowsDriversCheckbox.isChecked().catch(() => false);
      return isChecked === shouldBeChecked;
    } catch {
      return false;
    }
  }

  // --- Inlined filter delegations ---

  async clickUserProvidedTab(): Promise<void> {
    const isWizardMode = await this._filterDropdownButton
      .isVisible({ timeout: 2000 })
      .catch(() => false);

    if (isWizardMode) {
      await this._toggleWizardFilter('user-templates', true);
    } else {
      await this._userProvidedTab.first().waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await this.robustClick(this._userProvidedTab.first());
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
    }
  }

  async searchTemplate(templateName: string): Promise<void> {
    await this._searchCatalogInput.clear();
    await this._searchCatalogInput.fill(templateName);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  private async _toggleWizardFilter(filterKey: string, enable: boolean): Promise<void> {
    await this._filterDropdownButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });

    const openDropdown = async () => {
      const expanded = await this._filterDropdownButton
        .getAttribute('aria-expanded')
        .catch(() => null);
      if (expanded !== 'true') {
        await this._filterDropdownButton.click();
        await this.page.waitForTimeout(200);
      }
    };

    await openDropdown();
    const checkbox = this.locator(`[data-test-row-filter="${filterKey}"] input[type="checkbox"]`);
    await checkbox.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    const isChecked = await checkbox.isChecked();
    if (enable && !isChecked) {
      await checkbox.dispatchEvent('click');
    } else if (!enable && isChecked) {
      await openDropdown();
      await checkbox.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      await checkbox.dispatchEvent('click');
    }
    const expanded = await this._filterDropdownButton
      .getAttribute('aria-expanded')
      .catch(() => null);
    if (expanded === 'true') {
      await this._filterDropdownButton.click();
    }
    await this.page.waitForTimeout(TestTimeouts.UI_FILTER_APPLY / 3);
  }

  async filterByOSName(
    osName: 'CentOS' | 'Fedora' | 'RHEL' | 'Windows',
    check = true,
  ): Promise<void> {
    const wizardFilterKey = osName.toLowerCase();
    const isWizardMode = await this._filterDropdownButton
      .isVisible({ timeout: 2000 })
      .catch(() => false);

    if (isWizardMode) {
      await this._toggleWizardFilter(wizardFilterKey, check);
    } else {
      const osFilterById = this.locator(`input#filter-osName-${wizardFilterKey}`);
      const osFilterLegacy = this.locator(
        `[data-test-id="osName-${osName}"] input[type="checkbox"]`,
      );
      const osFilter = osFilterById.or(osFilterLegacy);
      await osFilter
        .first()
        .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      const isChecked = await osFilter.first().isChecked();
      if (check && !isChecked) {
        const label = this.locator(`label[for="filter-osName-${wizardFilterKey}"]`);
        if (await label.isVisible({ timeout: 2000 }).catch(() => false)) {
          await label.click({ force: true });
        } else {
          await osFilter.first().click({ force: true });
        }
      } else if (!check && isChecked) {
        const label = this.locator(`label[for="filter-osName-${wizardFilterKey}"]`);
        if (await label.isVisible({ timeout: 2000 }).catch(() => false)) {
          await label.click({ force: true });
        } else {
          await osFilter.first().click({ force: true });
        }
      }
      await this.page.waitForTimeout(TestTimeouts.UI_FILTER_APPLY / 3);
    }
    await this._vmCatalogGrid
      .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
      .catch(() => {
        return;
      });
  }

  async filterByProvider(provider: 'Other' | 'Red Hat', check = true): Promise<void> {
    const filterInput = this.locator(`input[id="filter-provider-${provider}"]`);
    await filterInput.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    if (check) {
      await filterInput.click({ force: true });
    } else {
      await filterInput.click({ force: true });
    }
    await this._vmCatalogGrid
      .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
      .catch(() => {
        return;
      });
    await this.page.waitForTimeout(TestTimeouts.UI_FILTER_APPLY / 3);
  }

  async filterByWorkload(workload: 'Desktop' | 'Server', check = true): Promise<void> {
    const isWizardMode = await this._filterDropdownButton
      .isVisible({ timeout: 2000 })
      .catch(() => false);

    if (isWizardMode) {
      await this._toggleWizardFilter(workload.toLowerCase(), check);
    } else {
      const workloadFilter = this.locator(`[data-test-id="workload-${workload}"]`).locator(
        'input[type="checkbox"]',
      );
      const exists = await workloadFilter.isVisible({ timeout: 2000 }).catch(() => false);
      if (!exists) {
        return;
      }
      if (check) {
        await workloadFilter.check({ force: true });
      } else {
        await workloadFilter.uncheck({ force: true });
      }
      await this.page.waitForTimeout(TestTimeouts.UI_FILTER_APPLY / 3);
    }
    await this._vmCatalogGrid
      .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
      .catch(() => {
        return;
      });
  }

  async filterByBootSourceAvailable(check = true): Promise<void> {
    const isWizardMode = await this._filterDropdownButton
      .isVisible({ timeout: 2000 })
      .catch(() => false);

    if (isWizardMode) {
      await this._toggleWizardFilter('only-available', check);
    } else {
      const bootSourceFilter = this.locator(
        '[data-test-id="boot-source-available-Boot source available"]',
      ).locator('input[type="checkbox"]');
      const exists = await bootSourceFilter.isVisible({ timeout: 2000 }).catch(() => false);
      if (!exists) {
        return;
      }
      if (check) {
        await bootSourceFilter.check({ force: true });
      } else {
        await bootSourceFilter.uncheck({ force: true });
      }
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
    }
  }

  async verifyArchitectureFilterExists(): Promise<boolean> {
    const isWizardMode = await this._filterDropdownButton
      .isVisible({ timeout: 2000 })
      .catch(() => false);

    if (isWizardMode) {
      try {
        await this._filterDropdownButton.click();
        const archCheckbox = this.locator('[data-test-row-filter="amd64"]');
        await archCheckbox.waitFor({
          state: 'visible',
          timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
        });
        const visible = await archCheckbox.isVisible();
        await this._filterDropdownButton.click();
        return visible;
      } catch {
        return false;
      }
    }

    const maxRetries = 3;
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.page.waitForLoadState('networkidle', {
          timeout: TestTimeouts.UI_ACTION_COMPLETE,
        });

        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

        await waitForElementStable(this._architectureFilter, TestTimeouts.UI_ELEMENT_VISIBILITY);

        const childLocator = this._architectureFilter.locator('input[type="checkbox"]');
        const hasCheckboxes = await childLocator
          .first()
          .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
          .then(() => true)
          .catch(() => false);

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

  async switchView(view: 'grid' | 'list'): Promise<void> {
    if (view === 'list') {
      const listButton = this.locator(
        'button[aria-label="template list button"], #template-list-btn',
      );
      await this.robustClick(listButton);
    } else {
      const gridButton = this.locator(
        'button[aria-label="template grid button"], #template-grid-btn',
      );
      await this.robustClick(gridButton);
    }
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async clickUserTemplatesTab(): Promise<void> {
    const userTemplatesTab = this.locator('#filter-templateScope-user, #user-templates');
    await userTemplatesTab.first().waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(userTemplatesTab.first());
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async clickAllTemplatesButton(): Promise<void> {
    const allTemplatesButton = this.locator('[data-test-id="catalog-template-filter-all-items"]');
    const exists = await allTemplatesButton.isVisible({ timeout: 2000 }).catch(() => false);
    if (exists) {
      await this.robustClick(allTemplatesButton);
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
    }
  }

  async selectProjectFromCatalog(projectName: string): Promise<void> {
    const projectDropdown = this.locator(
      '.templates-catalog-project-dropdown button, button.pf-v6-c-menu-toggle.pf-m-full-width:has-text("project")',
    ).last();
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

    const filterInput = this._selectInlineFilterInput;
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

  // --- Inlined card delegations ---

  async clickTemplateByMetadataName(templateMetadataName: string): Promise<void> {
    await BasePage.prototype.clickTemplateByTestId.call(
      this,
      templateMetadataName,
      `div[data-test-id="${templateMetadataName}"]`,
    );
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_LONG);
  }

  async verifyTemplateCardVisible(templateName: string): Promise<boolean> {
    try {
      await this._vmCatalogGrid.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });

      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

      const hasAnyCards = await this._vmCatalogGrid
        .locator('[data-test-id], .vm-catalog-grid-tile')
        .first()
        .isVisible({ timeout: TestTimeouts.UI_ACTION_COMPLETE })
        .catch(() => false);

      if (!hasAnyCards) {
        await this.page.waitForTimeout(TestTimeouts.UI_FILTER_APPLY / 3);
      }

      const metadataName = DISPLAY_NAME_TO_METADATA_NAME[templateName];

      let cardLocator;
      if (metadataName) {
        const byMetadataId = this._vmCatalogGrid.locator(`[data-test-id="${metadataName}"]`);
        const wizardCard = this._vmCatalogGrid.locator('[data-test-id]', {
          hasText: templateName,
        });
        const oldCard = this._vmCatalogGrid.locator(
          '.vm-catalog-grid-tile .catalog-tile-pf-title',
          {
            hasText: templateName,
          },
        );
        cardLocator = byMetadataId.or(wizardCard).or(oldCard);
      } else {
        const wizardCard = this._vmCatalogGrid.locator('[data-test-id]', {
          hasText: templateName,
        });
        const oldCard = this._vmCatalogGrid.locator(
          '.vm-catalog-grid-tile .catalog-tile-pf-title',
          { hasText: templateName },
        );
        cardLocator = wizardCard.or(oldCard);
      }

      await cardLocator
        .first()
        .waitFor({ state: 'visible', timeout: TestTimeouts.TEMPLATE_CREATION });

      await this.page.waitForTimeout(TestTimeouts.POLLING_INTERVAL / 2);

      const locators = await cardLocator.all();
      if (locators.length === 0) {
        return false;
      }
      const visibilityChecks = await Promise.all(
        locators.map((locator: { isVisible: () => Promise<boolean> }) => locator.isVisible()),
      );
      return visibilityChecks.every((isVisible) => isVisible);
    } catch {
      return false;
    }
  }

  async countTemplateCards(templateName: string): Promise<number> {
    const metadataName = DISPLAY_NAME_TO_METADATA_NAME[templateName];
    if (metadataName) {
      const byId = this._vmCatalogGrid.locator(`[data-test-id="${metadataName}"]`);
      const countById = await byId.count();
      if (countById > 0) return countById;
    }
    const wizardCards = this._vmCatalogGrid.locator('[data-test-id]', { hasText: templateName });
    const wizardCount = await wizardCards.count();
    if (wizardCount > 0) return wizardCount;
    return this._vmCatalogGrid
      .locator('.vm-catalog-grid-tile .catalog-tile-pf-title', { hasText: templateName })
      .count();
  }

  async verifyTemplateVisibleInListView(templateName: string): Promise<boolean> {
    try {
      const container = this.locator('.vm-catalog-table-container');
      const nameCell = container.locator('small, span', { hasText: templateName });
      const nameVisible = await nameCell
        .first()
        .isVisible({ timeout: 3000 })
        .catch(() => false);
      if (nameVisible) return true;

      const metadataName = DISPLAY_NAME_TO_METADATA_NAME[templateName];
      if (metadataName) {
        const byMetadataId = container.locator(`[data-test-id="${metadataName}"]`);
        await byMetadataId.first().waitFor({
          state: 'visible',
          timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
        });
        return true;
      }
      await nameCell.first().waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      return true;
    } catch {
      return false;
    }
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
