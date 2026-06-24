// CreateVmInstanceTypesPage — Page object for create vm instance types interactions.

import { InstanceTypeVolumeComponent } from '@/components/create-vm/bootable-volumes-components';
import PageCommons from '@/page-objects/page-commons';
import { MOCK_ENDPOINTS } from '@/utils/mock-responses';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

export default class CreateVmInstanceTypesPage extends PageCommons {
  private readonly _volume: InstanceTypeVolumeComponent;

  private readonly _instancetypesTab = this.locator('[data-test="instancetypes-tab"]');
  private readonly _nameVmname = this.locator('[name="vmname"]');
  private readonly _instancetypesVmDetailsSectionPlaceholderSearchFolder = this.locator(
    '.instancetypes-vm-details-section [placeholder="Search folder"]',
  );
  private readonly _createVmInstanceTypeSectionHeaderSvg = this.locator(
    '.create-vm-instance-type-section__header svg',
  );
  private readonly _createVirtualMachineButton = this.locator('button', {
    hasText: 'Create VirtualMachine',
  });
  private readonly _customizeVirtualMachineFooterButton = this.locator(
    '.create-vm-instance-type-footer button',
    { hasText: 'Customize VirtualMachine' },
  );
  private readonly _startAfterCreationCheckbox = this.locator(
    '#start-after-create-checkbox',
  ).first();
  private readonly _instanceTypesVmDetailsSection = this.locator(
    '.instancetypes-vm-details-section',
  );
  private readonly _createFolderButton = this.locator('button:has-text("Create folder")');
  private readonly _instanceTypeHelpText = this.locator(
    '.create-vm-instance-type-section__HelpTextIcon:has-text("From the Volume table, select a bootable volume to boot your VirtualMachine")',
  );

  constructor(page: Page) {
    super(page);
    this._volume = new InstanceTypeVolumeComponent(page);
  }

  async clickInstanceSize(sizeOption: string) {
    await this.locator(`button:has-text("${sizeOption}")`).click();
  }

  async clickHugepages() {
    await this.locator(`button:has-text("Hugepages")`).click();
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

  async fillVmName(vmName: string) {
    await this._nameVmname.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this._nameVmname.fill(vmName);
    await this._nameVmname.press('Tab');
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
  async navigateToInstanceTypeCatalogViaVmList(namespace?: string): Promise<void> {
    const ns = namespace || 'default';
    await this.goTo(`/k8s/ns/${ns}/catalog/instancetype`);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async isBootableVolumesSectionVisible(): Promise<boolean> {
    return this._volume.isBootableVolumesSectionVisible();
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

  async clickCreateVirtualMachine() {
    await this.robustClick(this._createVirtualMachineButton);
  }

  async clickAddVolumeButton() {
    return this._volume.clickAddVolumeButton();
  }

  async clickCustomizeVirtualMachineFooterButton() {
    await this._customizeVirtualMachineFooterButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(this._customizeVirtualMachineFooterButton);
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

  async verifyVolumeNameInNameField(volumeName: string): Promise<boolean> {
    return this._volume.verifyVolumeNameInNameField(volumeName);
  }

  async markVolumeFavoriteWithUnfavorite(volumeName: string): Promise<boolean> {
    return this._volume.markVolumeFavoriteWithUnfavorite(volumeName);
  }

  async markVolumeFavorite(): Promise<boolean> {
    return this._volume.markVolumeFavorite();
  }

  async filterVolumeByOS(osName?: string): Promise<boolean> {
    return this._volume.filterVolumeByOS(osName);
  }

  async filterVolumeByName(volumeName?: string): Promise<boolean> {
    return this._volume.filterVolumeByName(volumeName);
  }

  async selectBootableVolume(volumeName: string): Promise<boolean> {
    return this._volume.selectBootableVolume(volumeName);
  }

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

  async verifyInstanceTypeSeries(): Promise<boolean> {
    try {
      // CNV 4.99+: 'D series' (Dedicated vCPU) removed; 6 series remain
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

  async addVolumeViaUpload(
    volumeName: string,
    isoFilePath: string,
    instanceType?: string,
    preference?: string,
  ): Promise<boolean> {
    return this._volume.addVolumeViaUpload(volumeName, isoFilePath, instanceType, preference);
  }

  async addVolumeViaRegistry(
    volumeName: string,
    registryUrl: string,
    username: string,
    password: string,
    instanceType?: string,
    preference?: string,
    cronExpression?: string,
  ): Promise<boolean> {
    return this._volume.addVolumeViaRegistry(
      volumeName,
      registryUrl,
      username,
      password,
      instanceType,
      preference,
      cronExpression,
    );
  }

  async verifyVolumeExistsInList(volumeName: string): Promise<boolean> {
    return this._volume.verifyVolumeExistsInList(volumeName);
  }

  async getOperatingSystemText(): Promise<string> {
    const osLocator = this.locator('.pf-v6-c-description-list__group:has-text("Operating system")');
    await osLocator.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    return (await osLocator.textContent()) || '';
  }

  async verifyOperatingSystemText(expectedText: string): Promise<boolean> {
    const osText = await this.getOperatingSystemText();
    return osText.includes(expectedText);
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

  async verifyInstanceTypeText(expectedText: string): Promise<boolean> {
    const instanceTypeText = await this.getInstanceTypeText();
    return instanceTypeText.includes(expectedText);
  }

  async clickViewYamlAndCli(): Promise<void> {
    const yamlCliButton = this.locator('button:has-text("View YAML & CLI")');
    await yamlCliButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(yamlCliButton);
  }

  async clickCliTab(): Promise<void> {
    const cliTab = this.locator('.pf-v6-c-modal-box__body button:has-text("CLI")');
    await cliTab.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(cliTab);
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

  async verifyCliCommandComponents(components: string[]): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    for (const component of components) {
      results[component] = await this.verifyCliCommandContains(component);
    }
    return results;
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

  isAddConfigMapButtonVisible(): Promise<boolean> {
    return this.locator('button', { hasText: 'Add Config Map, Secret, or Service Account' })
      .isVisible({ timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
      .catch(() => false);
  }
}
