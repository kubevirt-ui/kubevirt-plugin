/**
 * Template listing and template customization wizard components.
 */

import BaseComponent from '@/components/shared/base-component';
import { TestTimeouts } from '@/utils/test-config';
import { waitForElementStable } from '@/utils/wait-helpers';
import type { Page } from '@playwright/test';

export class CreateVmTemplatesComponent extends BaseComponent {
  private readonly _createVirtualMachineButton = this.locator('button', {
    hasText: 'Create VirtualMachine',
  });
  private readonly _filterCategoryArchitecture = this.testId('filter-category-Architecture');
  private readonly _searchCatalogInput = this.testId('search-catalog').locator('input');
  private readonly _templatesTab = this.testId('templates-tab');
  private readonly _userTemplates = this.locator('#user-templates');
  private readonly _vmCatalogGrid = this.locator('#vm-catalog-grid');

  constructor(page: Page) {
    super(page);
  }

  private getTemplateCardTitleLocator(templateName: string) {
    return this._vmCatalogGrid.locator('.vm-catalog-grid-tile .catalog-tile-pf-title', {
      hasText: templateName,
    });
  }

  async clickAllTemplatesButton() {
    const allTemplatesButton = this.testId('catalog-template-filter-all-items');
    await this.robustClick(allTemplatesButton);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }
  async clickTemplateByMetadataName(templateMetadataName: string) {
    const card = this.testId(templateMetadataName);
    await card.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(card);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_LONG);
  }
  async clickTemplatesTab() {
    await this._templatesTab.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(this._templatesTab);
  }

  async clickUserProvidedTab() {
    await this._userTemplates.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(this._userTemplates);
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

  async clickViewAllProjectsButton(): Promise<void> {
    const viewAllButton = this.locator('button', { hasText: 'View all projects' });
    await viewAllButton.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(viewAllButton);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async countTemplateCards(templateName: string): Promise<number> {
    const templateCards = this._vmCatalogGrid.locator(
      '.vm-catalog-grid-tile .catalog-tile-pf-title',
      { hasText: templateName },
    );
    return await templateCards.count();
  }

  async filterByBootSourceAvailable(check = true) {
    const bootSourceFilter = this.testId('boot-source-available-Boot source available').locator(
      'input[type="checkbox"]',
    );
    if (check) {
      await bootSourceFilter.check({ force: true });
    } else {
      await bootSourceFilter.uncheck({ force: true });
    }
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }
  async filterByOSName(osName: 'RHEL' | 'Windows' | 'Fedora' | 'CentOS', check = true) {
    const osFilter = this.testId(`osName-${osName}`).locator('input[type="checkbox"]');
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
    const workloadFilter = this.testId(`workload-${workload}`).locator('input[type="checkbox"]');
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

  async isCreateVmFromCatalogAvailable(): Promise<boolean> {
    const createBtn = await this._createVirtualMachineButton
      .isVisible({ timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
      .catch(() => false);
    if (createBtn) return true;
    return await this._vmCatalogGrid
      .isVisible({ timeout: TestTimeouts.RETRY_DELAY })
      .catch(() => false);
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

  async searchTemplate(templateName: string) {
    await this._searchCatalogInput.clear();
    await this._searchCatalogInput.fill(templateName);
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

    const namespaceOption = this.testId(namespace).first();
    await namespaceOption.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(namespaceOption);
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
  async verifyNoErrorBoundary(waitMs = 3000): Promise<boolean> {
    const errorIndicator = this.page.locator('text=Something wrong happened');
    const hasError = await errorIndicator.isVisible({ timeout: waitMs }).catch(() => false);
    return !hasError;
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

  override async waitForTemplateForm() {
    await super.waitForTemplateForm();
  }
}

/**
 * Page object for the Template-based VM customization wizard.
 * Uses horizontal tabs (horizontal-link-* pattern) for navigation between wizard sections.
 * Handles VM configuration for name, description, CPU/memory, scheduling, networks, storage, scripts, and metadata.
 */

export class TemplateCustomizeWizardComponent extends BaseComponent {
  private readonly _advancedSettingsBtn = this.locator('button:has-text("Advanced settings")');
  private readonly _cDROMDiskTypeSelectCdrom = this.locator('text=CD-ROM').or(
    this.testId('disk-type-select-cdrom'),
  );
  private readonly _inputKey = this.locator('input[aria-label="Key"]');
  private readonly _inputname = this.locator('input#name');
  private readonly _inputTypeFile = this.locator('input[type="file"]');
  private readonly _inputValue = this.locator('input[aria-label="Value"]');
  private readonly _tabModal = this.locator('#tab-modal');
  private readonly _wizardCpuMemEditBtn = this.testId('wizard-overview-cpu-memory-edit');
  private readonly _wizardCreateButton = this.testId('create-virtual-machine').locator('button', {
    hasText: 'Create VirtualMachine',
  });
  private readonly _wizardHeadlessCheckbox = this.locator('#headless-mode');
  private readonly _wizardNicToggle = this.locator('#toggle-id-network');

  constructor(page: Page) {
    super(page);
  }

  async addCDROMDisk(
    diskName: string,
    cdromSource: 'Upload new ISO' | 'Use existing ISO' | 'Leave empty drive' = 'Upload new ISO',
    sourceValue?: string,
  ): Promise<boolean> {
    await this.navigateToWizardTab('Disks');

    const addButton = this.locator('button:has-text("Add")').or(this.testId('add-disk'));
    await addButton.first().waitFor({ state: 'visible', timeout: TestTimeouts.RESOURCE_CREATION });
    await this.robustClick(addButton.first());
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    // Try multiple ways to find the CD-ROM option in the menu
    const cdromMenuOption = this.page
      .locator('.pf-v6-c-menu__item, .pf-c-dropdown__menu-item')
      .filter({ hasText: 'CD-ROM' })
      .first();
    await cdromMenuOption
      .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
      .catch(() => null);

    if (await cdromMenuOption.isVisible()) {
      await cdromMenuOption.click({ force: true });
    } else {
      const cdromOption = this._cDROMDiskTypeSelectCdrom;
      await cdromOption
        .first()
        .waitFor({ state: 'visible', timeout: TestTimeouts.RESOURCE_CREATION });
      await cdromOption.first().click({ force: true });
    }

    const nameInput = this.locator('input[aria-label="Disk name"], input[id="name"]');
    await nameInput.waitFor({ state: 'visible', timeout: TestTimeouts.RESOURCE_CREATION });
    await nameInput.clear();
    await nameInput.fill(diskName);

    if (cdromSource === 'Upload new ISO' && sourceValue) {
      const uploadRadio = this.page.locator(
        'input[id="cdrom-source-upload"], input#cdrom-source-upload',
      );
      await uploadRadio.waitFor({ state: 'attached', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      await uploadRadio.check({ force: true });

      await this.locator('input[id="simple-file-filename"]').waitFor({
        state: 'attached',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });

      // Use the actual hidden file input for the upload
      const fileInput = this._inputTypeFile;
      await fileInput.setInputFiles(sourceValue);

      // Add a long explicit wait to allow the file upload processing and form validation to complete
      await this.page.waitForTimeout(5000);
    } else if (cdromSource === 'Use existing ISO' && sourceValue) {
      const mountExistingRadio = this.page.locator(
        'input[id="cdrom-source-existing"], input#cdrom-source-existing',
      );
      await mountExistingRadio.waitFor({
        state: 'attached',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await mountExistingRadio.check({ force: true });

      const selectIsoButton = this.locator('button[placeholder="Select ISO file"]');
      await selectIsoButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
      await selectIsoButton.click();

      const isoOption = this.locator(`button[id="select-inline-filter-${sourceValue}"]`);
      await isoOption.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
      await isoOption.click();
    } else if (cdromSource === 'Leave empty drive') {
      const emptyRadio = this.page.locator(
        'input[id="cdrom-source-empty"], input#cdrom-source-empty, label:has-text("Leave empty drive") input',
      );
      await emptyRadio.waitFor({ state: 'attached', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });

      if (await emptyRadio.isDisabled()) {
        await this.clickCancel();
        return false;
      }

      await emptyRadio.check({ force: true });
      // Small delay for UI to enable Save button
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    }

    const saveButton = this.locator('[role="dialog"]')
      .locator('[data-test="save-button"]')
      .or(this.locator('[role="dialog"] button:has-text("Save")'));
    await saveButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });

    await saveButton.click();

    const dialog = this.page.locator('#tab-modal, .pf-v6-c-modal-box').last();
    await dialog.waitFor({ state: 'hidden', timeout: 60000 }).catch(async (e) => {
      const errorAlert = dialog.locator('.pf-v6-c-alert.pf-m-danger, .pf-c-alert.pf-m-danger');
      let errorText = 'None';
      if (await errorAlert.isVisible()) {
        errorText = (await errorAlert.textContent().catch(() => 'None')) || 'None';
      }

      const cancelButton = this.locator('#tab-modal')
        .locator('[data-test="cancel-button"]')
        .or(this.locator('#tab-modal button:has-text("Cancel")'))
        .first();
      if (await cancelButton.isVisible()) {
        await cancelButton.click({ force: true });
      }
      throw new Error(
        `CD-ROM modal failed to close in wizard. Error: ${errorText}. Original error: ${e.message}`,
      );
    });

    return true;
  }

  async addDisk(diskConfig: {
    name: string;
    diskType?: string; // e.g., 'Empty disk (blank)', 'Ephemeral', 'Clone volume'
    diskSource?: {
      name?: string; // e.g., 'Blank', 'EphemeralDisk', 'cloneVolume'
      selector?: string;
      value?: string;
    };
    size?: string;
    storageClass?: string;
    type?: string; // e.g., 'lun'
    shareDisk?: boolean;
    scsiReservation?: boolean;
  }): Promise<void> {
    await this.navigateToWizardTab('Disks');

    const addButton = this.locator('button:has-text("Add")');
    await addButton.waitFor({ state: 'visible', timeout: TestTimeouts.RESOURCE_CREATION });
    await this.robustClick(addButton);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    const diskType = diskConfig.diskType || 'Empty disk (blank)';
    const diskTypeOption = this.locator(`text=${diskType}`);
    await diskTypeOption.waitFor({ state: 'visible', timeout: TestTimeouts.RESOURCE_CREATION });
    await this.robustClick(diskTypeOption);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    const nameInput = this.locator('input[aria-label="Disk name"]');
    await nameInput.waitFor({ state: 'visible', timeout: TestTimeouts.RESOURCE_CREATION });
    await nameInput.clear();
    await nameInput.fill(diskConfig.name);

    if (diskConfig.diskSource) {
      if (diskConfig.diskSource.name === 'cloneVolume') {
        const selectPVCNS = this.locator('button:has-text("Select Project")');
        await selectPVCNS.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
        await this.robustClick(selectPVCNS);
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

        const selectPVCName = this.locator('button:has-text("Select PersistentVolumeClaim")');
        await selectPVCName.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
        await this.robustClick(selectPVCName);
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
      }
    }

    if (diskConfig.size) {
      const sizeInput = this.locator('input[aria-label="Input"]');
      const sizeInputExists = await sizeInput
        .isVisible({ timeout: TestTimeouts.UI_DELAY_LONG })
        .catch(() => false);
      if (sizeInputExists) {
        await sizeInput.clear();
        // Use increment button to set size
        const incrementButton = this.locator('button[aria-label="Increment"]');
        for (let i = 0; i < parseInt(diskConfig.size); i++) {
          await this.robustClick(incrementButton);
        }
      }
    }

    if (diskConfig.type) {
      const diskTypeSelect = this.testId('disk-type-select');
      await diskTypeSelect.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
      await this.robustClick(diskTypeSelect);
      const typeOption = this.testId(`disk-type-select-${diskConfig.type}`);
      await typeOption.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
      await this.robustClick(typeOption);
    }

    if (diskConfig.storageClass) {
      const storageClassSelect = this.testId('storage-class-select');
      await storageClassSelect.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this.robustClick(storageClassSelect);
      const storageClassOption = this.locator(
        `button#select-inline-filter-${diskConfig.storageClass}`,
      );
      await storageClassOption.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this.robustClick(storageClassOption);
    }

    if (diskConfig.shareDisk) {
      const advancedSettingsButton = this._advancedSettingsBtn;
      await advancedSettingsButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this.robustClick(advancedSettingsButton);
      const shareDiskCheckbox = this.locator('input[id="sharable-disk"]');
      await shareDiskCheckbox.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await shareDiskCheckbox.check({ force: true });
    }

    if (diskConfig.scsiReservation) {
      const advancedSettingsButton = this._advancedSettingsBtn;
      await advancedSettingsButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this.robustClick(advancedSettingsButton);
      const scsiReservationCheckbox = this.locator('input[id="scsi-reservation"]');
      await scsiReservationCheckbox.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await scsiReservationCheckbox.check({ force: true });
    }

    await this.clickSave();
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async addGpuDevice(gpuName = 'vgpu_test', gpuResourceName = 'nvidia.com'): Promise<void> {
    const gpuDevicesButton = this.locator('button:has-text("GPU devices")');
    await gpuDevicesButton.waitFor({ state: 'visible', timeout: TestTimeouts.RESOURCE_CREATION });
    await this.robustClick(gpuDevicesButton);

    const addGpuDeviceButton = this.locator('button:has-text("Add GPU device")');
    await addGpuDeviceButton.waitFor({ state: 'visible', timeout: TestTimeouts.RESOURCE_CREATION });
    await this.robustClick(addGpuDeviceButton);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    const optionsMenuButton = this.locator('button[aria-label="Options menu"]');
    await optionsMenuButton.waitFor({ state: 'visible', timeout: TestTimeouts.RESOURCE_CREATION });
    await this.robustClick(optionsMenuButton);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    const gpuResourceOption = this.locator(`button:has-text("${gpuResourceName}")`);
    await gpuResourceOption.waitFor({ state: 'visible', timeout: TestTimeouts.RESOURCE_CREATION });
    await this.robustClick(gpuResourceOption);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    const gpuNameInput = this._inputname;
    await gpuNameInput.waitFor({ state: 'visible', timeout: TestTimeouts.RESOURCE_CREATION });
    await gpuNameInput.clear();
    await gpuNameInput.fill(gpuName);

    // Click save button (button.pf-m-plain>svg[viewBox="0 0 512 512"])
    const saveButton = this.locator('button.pf-m-plain')
      .locator('svg[viewBox="0 0 512 512"]')
      .locator('..');
    await saveButton.waitFor({ state: 'visible', timeout: TestTimeouts.RESOURCE_CREATION });
    await this.robustClick(saveButton);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    const resourceRow = this.locator('[data-test-rows="resource-row"]');
    const gpuRow = resourceRow.locator(`text=${gpuName}`);
    await gpuRow.waitFor({ state: 'visible', timeout: TestTimeouts.RESOURCE_CREATION });

    await this.clickSave();
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    const hardwareDevicesTable = this.locator('.hardware-devices-table');
    await hardwareDevicesTable.waitFor({
      state: 'visible',
      timeout: TestTimeouts.RESOURCE_CREATION,
    });
    const gpuInTable = hardwareDevicesTable.locator(`text=${gpuName}`);
    await gpuInTable.waitFor({ state: 'visible', timeout: TestTimeouts.RESOURCE_CREATION });
  }

  async clickCancel(): Promise<void> {
    await this.robustClick(this.locator('button:has-text("Cancel")'));
  }

  async clickCreateButton(): Promise<void> {
    await this._wizardCreateButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(this._wizardCreateButton, { timeout: TestTimeouts.ELEMENT_WAIT });
  }

  async deleteNic(): Promise<void> {
    await this.navigateToWizardTab('Network interfaces');

    await this._wizardNicToggle.waitFor({
      state: 'visible',
      timeout: TestTimeouts.RESOURCE_CREATION,
    });
    await this.robustClick(this._wizardNicToggle);

    const wizardDeleteNicButton = this.locator('button:has-text("Delete")');
    await wizardDeleteNicButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(wizardDeleteNicButton);

    const tabModal = this._tabModal;
    await tabModal.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });

    await this.locator('text=Delete NIC?').waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });

    const confirmDeleteButton = tabModal.locator('button:has-text("Delete")');
    await confirmDeleteButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(confirmDeleteButton);

    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async fillMetadata(config: {
    labels?: string[]; // Array of strings like "key=value"
    annotations?: Array<{ key: string; value: string }>; // Array of key-value pairs
    nodeSelector?: { key: string; value: string }; // Single key-value pair
  }): Promise<void> {
    await this.navigateToWizardTab('Metadata');
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    if (config.labels && config.labels.length > 0) {
      const wizardLabelsEditButton = this.testId('wizard-metadata-labels-edit');
      await wizardLabelsEditButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this.robustClick(wizardLabelsEditButton);

      const wizardLabelsInput = this.testId('tags-input');
      await wizardLabelsInput.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await wizardLabelsInput.clear();

      for (const label of config.labels) {
        await wizardLabelsInput.fill(label);
        await this.page.keyboard.press('Enter');
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      }

      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      const tabModal = this._tabModal;
      const saveButtonInModal = tabModal.locator('button').filter({ hasText: 'Save' }).first();
      const saveButtonVisible = await saveButtonInModal
        .isVisible({ timeout: TestTimeouts.UI_DELAY_SHORT })
        .catch(() => false);
      if (saveButtonVisible) {
        await this.robustClick(saveButtonInModal);
      } else {
        // Fallback to global Save button selector
        await this.clickSave();
      }
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
    }

    if (config.annotations && config.annotations.length > 0) {
      const wizardAnnotationsEditButton = this.testId('wizard-metadata-annotations-edit');
      // Check if annotations edit button exists (may have different selector pattern)
      const annotationsBtnExists = await wizardAnnotationsEditButton
        .isVisible({ timeout: TestTimeouts.UI_DELAY_SHORT })
        .catch(() => false);
      if (!annotationsBtnExists) {
        // Try alternative selector pattern
        const altAnnotationsBtn = this.locator('button[data-test*="annotation"]').first();
        const altExists = await altAnnotationsBtn
          .isVisible({ timeout: TestTimeouts.UI_DELAY_SHORT })
          .catch(() => false);
        if (altExists) {
          await this.robustClick(altAnnotationsBtn);
        } else {
          // Annotations section may not be available - silently continue
          return;
        }
      } else {
        await this.robustClick(wizardAnnotationsEditButton);
      }

      for (const annotation of config.annotations) {
        const addButton = this.locator('button:has-text("Add annotation")');
        await addButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
        await this.robustClick(addButton);

        const keyInput = this._inputKey.last();
        const valueInput = this._inputValue.last();
        await keyInput.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
        await keyInput.fill(annotation.key);
        await valueInput.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
        await valueInput.fill(annotation.value);
      }

      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      const tabModal = this._tabModal;
      const saveButtonInModal = tabModal.locator('button').filter({ hasText: 'Save' }).first();
      const saveButtonVisible = await saveButtonInModal
        .isVisible({ timeout: TestTimeouts.UI_DELAY_SHORT })
        .catch(() => false);
      if (saveButtonVisible) {
        await this.robustClick(saveButtonInModal);
      } else {
        // Fallback to global Save button selector
        await this.clickSave();
      }
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
    }

    if (config.nodeSelector) {
      const wizardNodeSelectorEditButton = this.testId('node-selector-edit');
      await wizardNodeSelectorEditButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this.robustClick(wizardNodeSelectorEditButton);

      const keyInput = this._inputKey;
      const valueInput = this._inputValue;
      await keyInput.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
      await keyInput.clear();
      await keyInput.fill(config.nodeSelector.key);
      await valueInput.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
      await valueInput.clear();
      await valueInput.fill(config.nodeSelector.value);

      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      const tabModal = this._tabModal;
      const saveButtonInModal = tabModal.locator('button').filter({ hasText: 'Save' }).first();
      const saveButtonVisible = await saveButtonInModal
        .isVisible({ timeout: TestTimeouts.UI_DELAY_SHORT })
        .catch(() => false);
      if (saveButtonVisible) {
        await this.robustClick(saveButtonInModal);
      } else {
        // Fallback to global Save button selector
        await this.clickSave();
      }
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
    }
  }

  async fillNetworks(config: {
    nics?: Array<{
      name?: string;
      model?: string;
      network?: string;
      type?: string;
    }>;
  }) {
    if (config.nics && config.nics.length > 0) {
      await this.navigateToWizardTab('Network interfaces');

      for (const nic of config.nics) {
        const wizardAddNetworkInterfaceButton = this.locator(
          'button:has-text("Add network interface")',
        );
        await wizardAddNetworkInterfaceButton.waitFor({
          state: 'visible',
          timeout: TestTimeouts.RESOURCE_CREATION,
        });
        await this.robustClick(wizardAddNetworkInterfaceButton);
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);

        if (nic.name) {
          const wizardNicNameInput = this._inputname;
          await wizardNicNameInput.waitFor({
            state: 'visible',
            timeout: TestTimeouts.RESOURCE_CREATION,
          });
          await wizardNicNameInput.clear();
          await wizardNicNameInput.fill(nic.name);
        }

        if (nic.model) {
          const wizardNicModelSelect = this.testId('model-select').locator('button');
          await wizardNicModelSelect.waitFor({
            state: 'visible',
            timeout: TestTimeouts.UI_ACTION_COMPLETE,
          });
          await this.robustClick(wizardNicModelSelect);
          const modelOption = this.testId(`model-select-${nic.model}`).locator('button');
          await modelOption.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
          await this.robustClick(modelOption);
        }

        if (nic.network) {
          const wizardNicNetworkSelect = this.locator(
            'input[placeholder="Select a NetworkAttachmentDefinition"]',
          );
          await wizardNicNetworkSelect.waitFor({
            state: 'visible',
            timeout: TestTimeouts.UI_ACTION_COMPLETE,
          });
          const networkToggle = wizardNicNetworkSelect;
          await networkToggle.waitFor({
            state: 'visible',
            timeout: TestTimeouts.UI_ACTION_COMPLETE,
          });
          await networkToggle.fill(nic.network);
          await this.clickButtonByText(nic.network);
        }

        if (nic.type) {
          const wizardNicTypeSelect = this.testId('network-interface-type-select');
          await wizardNicTypeSelect.waitFor({
            state: 'visible',
            timeout: TestTimeouts.UI_ACTION_COMPLETE,
          });
          await this.robustClick(wizardNicTypeSelect);
          const typeOption = this.testId(`network-interface-type-select-${nic.type}`);
          await typeOption.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
          await this.robustClick(typeOption);
        }

        await this.clickSaveByTestId();
      }
    }
  }

  async fillOverview(config: {
    name?: string;
    description?: string;
    cpu?: number;
    memory?: number;
    bootMode?: string;
    workload?: string;
    hostname?: string;
    startInPause?: boolean;
    headless?: boolean;
  }) {
    if (config.name) {
      await this.testId('wizard-overview-name-edit').click();
      const wizardNameInput = this.locator('#vm-name');
      await wizardNameInput.clear();
      await wizardNameInput.fill(config.name);
      await this.clickSave();
    }

    if (config.description) {
      await this.robustClick(this.testId('wizard-overview-description-edit'));
      // Wait for modal to appear and scope textarea to modal
      const tabModal = this._tabModal;
      await tabModal.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
      const descTextarea = tabModal.locator('[aria-label="description text area"]');
      await descTextarea.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
      await descTextarea.clear();
      await descTextarea.fill(config.description);
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      const saveButtonInModal = tabModal.locator('button').filter({ hasText: 'Save' }).first();
      const saveButtonVisible = await saveButtonInModal
        .isVisible({ timeout: TestTimeouts.UI_DELAY_SHORT })
        .catch(() => false);
      if (saveButtonVisible) {
        await this.robustClick(saveButtonInModal);
      } else {
        // Fallback to global Save button selector
        await this.clickSave();
      }
    }

    if (config.cpu || config.memory) {
      await this._wizardCpuMemEditBtn.click();
      const wizardCpuInput = this.locator('input[name="cpu-input"]');
      const wizardMemInput = this.locator('input[name="memory-input"]');
      if (config.cpu) {
        await wizardCpuInput.clear();
        await wizardCpuInput.fill(config.cpu.toString());
      }
      if (config.memory) {
        await wizardMemInput.clear();
        await wizardMemInput.fill(config.memory.toString());
      }
      await this.clickSave();
    }

    if (config.bootMode) {
      await this.testId('wizard-overview-boot-method-edit').click();
      const modalBody = this.locator('.pf-v6-c-modal-box__body');
      await modalBody.locator('button').first().click();
      // Use exact text matching to avoid partial matches (e.g., "UEFI" vs "UEFI(secure)")
      await this.clickElementByExactText('span', config.bootMode);
      await this.clickButtonByText('Save');
    }

    if (config.workload) {
      await this.testId('wizard-overview-workload-profile-edit').click();
      const modalBody = this._tabModal;
      await modalBody.locator('button.pf-v6-c-menu-toggle').click();
      await this.locator('button', { hasText: config.workload }).click();
      await this.clickButtonByText('Save');
    }

    if (config.hostname) {
      const wizardHostnameEditBtn = this.testId('wizard-overview-hostname-edit');
      await wizardHostnameEditBtn.waitFor({
        state: 'visible',
        timeout: TestTimeouts.RESOURCE_CREATION,
      });
      await this.robustClick(wizardHostnameEditBtn);
      const wizardHostnameInput = this.locator('input#hostname');
      await wizardHostnameInput.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await wizardHostnameInput.fill(config.hostname);
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      const tabModal = this._tabModal;
      const saveButtonInModal = tabModal.locator('button').filter({ hasText: 'Save' }).first();
      const saveButtonVisible = await saveButtonInModal
        .isVisible({ timeout: TestTimeouts.UI_DELAY_SHORT })
        .catch(() => false);
      if (saveButtonVisible) {
        await this.robustClick(saveButtonInModal);
      } else {
        // Fallback to global Save button selector
        await this.clickSave();
      }
    }

    if (config.startInPause !== undefined) {
      const wizardStartInPauseCheckbox = this.locator('#start-in-pause-mode');
      // Switch elements may be hidden but still interactable, so wait for attached state
      await wizardStartInPauseCheckbox.waitFor({
        state: 'attached',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      const startInPauseChecked = await wizardStartInPauseCheckbox.isChecked().catch(() => false);
      if (config.startInPause && !startInPauseChecked) {
        // Use evaluate to set checked state directly for hidden switches
        await wizardStartInPauseCheckbox.evaluate((el: HTMLInputElement) => {
          el.checked = true;
          el.dispatchEvent(new Event('change', { bubbles: true }));
        });
      } else if (!config.startInPause && startInPauseChecked) {
        // Use evaluate to set checked state directly for hidden switches
        await wizardStartInPauseCheckbox.evaluate((el: HTMLInputElement) => {
          el.checked = false;
          el.dispatchEvent(new Event('change', { bubbles: true }));
        });
      }
    }

    if (config.headless !== undefined) {
      // Switch elements may be hidden but still interactable, so wait for attached state
      await this._wizardHeadlessCheckbox.waitFor({
        state: 'attached',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      const headlessChecked = await this._wizardHeadlessCheckbox.isChecked().catch(() => false);
      if (config.headless && !headlessChecked) {
        // Use evaluate to set checked state directly for hidden switches
        await this._wizardHeadlessCheckbox.evaluate((el: HTMLInputElement) => {
          el.checked = true;
          el.dispatchEvent(new Event('change', { bubbles: true }));
        });
      } else if (!config.headless && headlessChecked) {
        // Use evaluate to set checked state directly for hidden switches
        await this._wizardHeadlessCheckbox.evaluate((el: HTMLInputElement) => {
          el.checked = false;
          el.dispatchEvent(new Event('change', { bubbles: true }));
        });
      }
    }
  }

  async fillScheduling(config: {
    descheduler?: boolean;
    dedicatedResources?: boolean;
    evictionStrategy?: boolean;
  }) {
    await this.navigateToWizardTab('Scheduling');
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    if (config.descheduler !== undefined) {
      const wizardDeschedulerEditBtn = this.testId('descheduler-edit');
      await wizardDeschedulerEditBtn.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this.robustClick(wizardDeschedulerEditBtn);
      const wizardDeschedulerCheckbox = this.locator('#descheduler');
      const deschedulerChecked = await wizardDeschedulerCheckbox.isChecked().catch(() => false);
      if (config.descheduler && !deschedulerChecked) {
        await wizardDeschedulerCheckbox.click({ force: true });
      } else if (!config.descheduler && deschedulerChecked) {
        await wizardDeschedulerCheckbox.click({ force: true });
      }
      await this.clickSave();
    }

    if (config.dedicatedResources !== undefined) {
      const wizardDedicatedResourcesEditBtn = this.testId('dedicated-resources-edit');
      await wizardDedicatedResourcesEditBtn.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this.robustClick(wizardDedicatedResourcesEditBtn);
      const wizardDedicatedResourcesCheckbox = this.locator('#dedicated-resources');
      const dedicatedResourcesChecked = await wizardDedicatedResourcesCheckbox
        .isChecked()
        .catch(() => false);
      if (config.dedicatedResources && !dedicatedResourcesChecked) {
        await wizardDedicatedResourcesCheckbox.click({ force: true });
      } else if (!config.dedicatedResources && dedicatedResourcesChecked) {
        await wizardDedicatedResourcesCheckbox.click({ force: true });
      }
      await this.clickSave();
    }

    if (config.evictionStrategy !== undefined) {
      const wizardEvictionStrategyEditBtn = this.testId('eviction-strategy-edit');
      // Check if eviction strategy edit button exists (may not be available in all contexts)
      const evictionBtnExists = await wizardEvictionStrategyEditBtn
        .isVisible({ timeout: TestTimeouts.UI_DELAY_SHORT })
        .catch(() => false);
      if (evictionBtnExists) {
        await this.robustClick(wizardEvictionStrategyEditBtn);
        const wizardEvictionStrategyCheckbox = this.locator('#eviction-strategy');
        const evictionStrategyChecked = await wizardEvictionStrategyCheckbox
          .isChecked()
          .catch(() => false);
        if (config.evictionStrategy && !evictionStrategyChecked) {
          await wizardEvictionStrategyCheckbox.click({ force: true });
        } else if (!config.evictionStrategy && evictionStrategyChecked) {
          await wizardEvictionStrategyCheckbox.click({ force: true });
        }
        await this.clickSave();
      } else {
        // Eviction strategy section may not be available - silently continue
      }
    }
  }

  async fillScripts(config: {
    sysprepName?: string; // Name of existing sysprep ConfigMap (e.g., "sysprep-vm-name")
    cloudInitNetwork?: {
      ethernetName: string;
      ipCidr: string;
      gateway?: string;
    };
  }): Promise<void> {
    if (!config.sysprepName && !config.cloudInitNetwork) {
      return;
    }
    await this.navigateToWizardTab('Scripts');

    if (config.sysprepName) {
      const sysprepSection = this.locator('text=Sysprep').locator('..');
      const editButton = sysprepSection.locator('button').first();
      await editButton.waitFor({ state: 'visible', timeout: TestTimeouts.RESOURCE_CREATION });
      await this.robustClick(editButton);

      const attachExistingButton = this.locator('button:has-text("Attach existing sysprep")');
      await attachExistingButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this.robustClick(attachExistingButton);

      const selectButton = this.locator('button:has-text("--- Select sysprep ---")');
      await selectButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
      await this.robustClick(selectButton);
      await this.clickButtonByText(config.sysprepName);
      await this.clickSave();
    }

    if (config.cloudInitNetwork) {
      const cloudInitEdit = this.testId('wizard-cloudinit-edit');
      await cloudInitEdit.waitFor({ state: 'visible', timeout: TestTimeouts.RESOURCE_CREATION });
      await this.robustClick(cloudInitEdit);

      const { ethernetName, ipCidr, gateway } = config.cloudInitNetwork;
      const cloudInitNetworkCheckbox = this.locator('input[id="custom-network-checkbox"]');
      await cloudInitNetworkCheckbox.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_DELAY_MEDIUM,
      });
      await cloudInitNetworkCheckbox.check({ force: true });

      const cloudInitEthNameInput = this.locator('input[id="ethernet-name"]');
      await cloudInitEthNameInput.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_DELAY_MEDIUM,
      });
      await cloudInitEthNameInput.fill(ethernetName);

      const cloudInitIpAddressInput = this.locator('input[id="address"]');
      await cloudInitIpAddressInput.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_DELAY_MEDIUM,
      });
      await cloudInitIpAddressInput.fill(ipCidr);

      if (gateway) {
        const cloudInitGatewayInput = this.locator('input[id="gateway"]');
        await cloudInitGatewayInput.waitFor({
          state: 'visible',
          timeout: TestTimeouts.UI_DELAY_MEDIUM,
        });
        await cloudInitGatewayInput.fill(gateway);
      }

      const cloudInitApplyButton = this.locator('button:has-text("Apply")');
      await cloudInitApplyButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_DELAY_MEDIUM,
      });
      await this.robustClick(cloudInitApplyButton);
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
    }
  }

  async fillSSH(secretName: string, sshKeyFilePath: string): Promise<void> {
    await this.navigateToWizardTab('Scripts');

    const sshEditButton = this.testId('wizard-sshkey-edit');
    await sshEditButton.waitFor({ state: 'visible', timeout: TestTimeouts.RESOURCE_CREATION });
    await this.robustClick(sshEditButton);

    const addNewButton = this.locator('#addNew');
    await this.robustClick(addNewButton);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    // Wait for upload input to be ready (file inputs are often hidden)
    const uploadInput = this._inputTypeFile;
    await uploadInput.waitFor({ state: 'attached', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });

    await uploadInput.setInputFiles(sshKeyFilePath);

    const secretNameInput = this.locator('#new-secret-name');
    await secretNameInput.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    // Enter secret name with delay between keystrokes to allow form validation to react
    // Clear the input first in case there's a pre-filled value
    await secretNameInput.clear();
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    // Type the secret name with a small delay between keystrokes
    // This allows the form validation to process each character and update the Save button state
    await secretNameInput.type(secretName, { delay: 150 });

    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    const saveButton = this.testId('save-button');
    await saveButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(saveButton);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async isSecretCopyWarningVisible(): Promise<boolean> {
    try {
      const warning = this.locator('text=This Secret will be copied to the destination project');
      await warning.waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_MEDIUM });
      return true;
    } catch {
      return false;
    }
  }

  async navigateToWizardTab(
    tabName:
      | 'Overview'
      | 'Scheduling'
      | 'Environment'
      | 'Network interfaces'
      | 'Disks'
      | 'Scripts'
      | 'Metadata',
  ) {
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
    const tabLocator = this.testId(`horizontal-link-${tabName}`);
    await this.robustClick(tabLocator);
  }

  async restoreCpuMemoryToDefaults(): Promise<void> {
    await this.navigateToWizardTab('Overview');

    await this._wizardCpuMemEditBtn.click();

    const restoreButton = this.locator('button:has-text("Restore template settings")');
    await restoreButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
    await this.robustClick(restoreButton);

    await this.clickSave();
  }

  async setHeadless(headless: boolean): Promise<void> {
    // Switch elements may be hidden but still interactable, so wait for attached state
    await this._wizardHeadlessCheckbox.waitFor({
      state: 'attached',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    const headlessChecked = await this._wizardHeadlessCheckbox.isChecked().catch(() => false);
    if (headless && !headlessChecked) {
      // Use evaluate to set checked state directly for hidden switches
      await this._wizardHeadlessCheckbox.evaluate((el: HTMLInputElement) => {
        el.checked = true;
        el.dispatchEvent(new Event('change', { bubbles: true }));
      });
    } else if (!headless && headlessChecked) {
      // Use evaluate to set checked state directly for hidden switches
      await this._wizardHeadlessCheckbox.evaluate((el: HTMLInputElement) => {
        el.checked = false;
        el.dispatchEvent(new Event('change', { bubbles: true }));
      });
    }
  }

  async verifyCdromSizeNotConstrainedByRootDisk(): Promise<boolean> {
    await this.navigateToWizardTab('Disks');

    const addButton = this.locator('button:has-text("Add")').or(this.testId('add-disk'));
    await addButton.first().waitFor({ state: 'visible', timeout: TestTimeouts.RESOURCE_CREATION });
    await this.robustClick(addButton.first());
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    const cdromMenuOption = this.page
      .locator('.pf-v6-c-menu__item, .pf-c-dropdown__menu-item')
      .filter({ hasText: 'CD-ROM' })
      .first();
    await cdromMenuOption
      .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
      .catch(() => null);

    if (await cdromMenuOption.isVisible()) {
      await cdromMenuOption.click({ force: true });
    } else {
      const cdromOption = this._cDROMDiskTypeSelectCdrom;
      await cdromOption
        .first()
        .waitFor({ state: 'visible', timeout: TestTimeouts.RESOURCE_CREATION });
      await cdromOption.first().click({ force: true });
    }

    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    const sizeValidationError = this.page.locator(
      '.pf-v6-c-helper-text__item.pf-m-error, .pf-v6-c-form__helper-text.pf-m-error',
    );
    const hasError = await sizeValidationError
      .filter({ hasText: /Size cannot be less than/ })
      .isVisible({ timeout: TestTimeouts.UI_DELAY_SHORT })
      .catch(() => false);

    const cancelButton = this.locator('#tab-modal')
      .locator('[data-test="cancel-button"]')
      .or(this.locator('#tab-modal button:has-text("Cancel")'))
      .or(this.locator('[role="dialog"] button:has-text("Cancel")'))
      .first();
    if (await cancelButton.isVisible()) {
      await cancelButton.click({ force: true });
    }

    return !hasError;
  }

  async verifyCpuMemory(cpu: string, mem: string): Promise<boolean> {
    try {
      await this.navigateToWizardTab('Overview');
      const cpuMemText = await this._wizardCpuMemEditBtn.textContent();
      const containsCpu = cpuMemText?.includes(cpu) ?? false;
      const containsMem = cpuMemText?.includes(mem) ?? false;
      return containsCpu && containsMem;
    } catch {
      return false;
    }
  }

  async verifyNetworksTabNotFoundMessage(): Promise<boolean> {
    try {
      await this.navigateToWizardTab('Network interfaces');
      // Wait for the tab content to load - give extra time after NIC deletion
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_LONG);

      // First, check if there are any NICs present (toggle elements)
      // If no NICs are found, that's equivalent to "Not found"
      const nicToggleCount = await this._wizardNicToggle.count();
      if (nicToggleCount === 0) {
        // No NICs present, which means "Not found" state
        return true;
      }

      // Try multiple selectors for "Not found" message
      // The message might be in different locations depending on the UI state
      const notFoundLocators = [
        this.locator('text=Not found'),
        this.locator('text=/not found/i'),
        this.testId('empty-state'),
        this.locator('.pf-v6-c-empty-state'),
        this.locator('.pf-v6-c-empty-state__body'),
        this.locator('text=No network interfaces'),
        this.locator('text=No network'),
      ];

      for (const notFoundLocator of notFoundLocators) {
        try {
          const isVisible = await notFoundLocator.first().isVisible({
            timeout: TestTimeouts.UI_DELAY_SHORT,
          });
          if (isVisible) {
            const text = await notFoundLocator
              .first()
              .textContent()
              .catch(() => '');
            if (
              text?.toLowerCase().includes('not found') ||
              text?.toLowerCase().includes('no network')
            ) {
              return true;
            }
          }
        } catch {}
      }

      // If none of the specific selectors worked, try a broader search in the Networks tab content
      const networksTabContent = this.testId('horizontal-link-Networks')
        .locator('..')
        .locator('..');
      const tabText = await networksTabContent.textContent().catch(() => '');
      if (
        tabText?.toLowerCase().includes('not found') ||
        tabText?.toLowerCase().includes('no network')
      ) {
        return true;
      }

      // Final check: if no NIC toggle is visible, consider it as "not found"
      const toggleVisible = await this._wizardNicToggle
        .isVisible({ timeout: TestTimeouts.UI_DELAY_SHORT })
        .catch(() => false);
      return !toggleVisible;
    } catch {
      return false;
    }
  }

  async waitForWizardReady(): Promise<void> {
    await this._wizardCreateButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.RESOURCE_CREATION,
    });
  }
}
