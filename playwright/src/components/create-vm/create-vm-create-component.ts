import BaseComponent from '@/components/shared/base-component';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

export default class CreateVmCreateComponent extends BaseComponent {
  private readonly _bootCd = this.testId('boot-cd');
  private readonly _btnPlaceholderSelectProject = this.locator(
    'button[placeholder="Select project..."]',
  );
  private readonly _btnPlaceholderSelectTLSCertificate = this.locator(
    'button[placeholder="Select TLS certificate"]',
  );
  private readonly _cdBootSource = this.testId('cd-boot-source');
  private readonly _createFolderButton = this.locator('button:has-text("Create folder")');
  private readonly _customizeVirtualMachineFooterButton = this.locator(
    '.create-vm-instance-type-footer button',
    { hasText: 'Customize VirtualMachine' },
  );
  private readonly _customizeVmBtn = this.testId('customize-vm-btn');
  private readonly _diskBootSource = this.testId('disk-boot-source');
  private readonly _diskBootSourceContainerSourceInput = this.testId(
    'disk-boot-source-container-source-input',
  );
  private readonly _diskBootSourceHttpSourceInput = this.testId(
    'disk-boot-source-http-source-input',
  );
  private readonly _idQuickCreateFormPlaceholderSearchFolder = this.locator(
    '[id="quick-create-form"] [placeholder="Search folder"]',
  );
  private readonly _quickCreateVmBtn = this.testId('quick-create-vm-btn');
  private readonly _startAfterCreationCheckbox = this.locator(
    '#start-after-create-checkbox',
  ).first();
  private readonly _templateCatalogVmNameInput = this.testId('template-catalog-vm-name-input');
  private readonly _tLSCertificate = this.locator('[aria-label="TLS certificate"]');
  private readonly _tlsCertRequiredCheckbox = this.locator('#tls-certificate-required');

  private readonly _windowsDriversCheckbox = this.testId('cdrom-drivers');

  constructor(page: Page) {
    super(page);
  }

  async clickCustomizeVirtualMachineButton() {
    await this._customizeVmBtn.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(this._customizeVmBtn);
  }

  async clickCustomizeVirtualMachineFooterButton() {
    await this._customizeVirtualMachineFooterButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(this._customizeVirtualMachineFooterButton);
  }
  async clickCustomizeVmButton() {
    await this._customizeVmBtn.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(this._customizeVmBtn);
  }

  async clickQuickCreateVmButton() {
    await this._quickCreateVmBtn.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(this._quickCreateVmBtn);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_LONG);
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
        await this._btnPlaceholderSelectProject.waitFor({
          state: 'visible',
          timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
        });
        await this.robustClick(this._btnPlaceholderSelectProject);
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
        await this._btnPlaceholderSelectTLSCertificate.waitFor({
          state: 'visible',
          timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
        });
        await this.robustClick(this._btnPlaceholderSelectTLSCertificate);
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
        await this._tLSCertificate.waitFor({
          state: 'visible',
          timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
        });
        await this._tLSCertificate.fill(config.certificate);
      }
    }
  }

  async fillReviewAndCreateVmName(vmName: string) {
    await this._templateCatalogVmNameInput.waitFor({
      state: 'visible',
      timeout: TestTimeouts.RESOURCE_CREATION,
    });

    const vmNameEl = await this._templateCatalogVmNameInput.elementHandle();
    await this.page.waitForFunction(
      (el) => {
        const input = el as HTMLInputElement | null;
        return input && !input.disabled && !input.readOnly;
      },
      vmNameEl,
      { timeout: TestTimeouts.RESOURCE_CREATION },
    );

    await this._templateCatalogVmNameInput.clear();
    await this._templateCatalogVmNameInput.fill(vmName);
    await this._templateCatalogVmNameInput.press('Tab');
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

  async navigateToCatalogViaUI(): Promise<void> {
    await this.navigateToTemplateCatalogViaVmList();
  }

  /**
   * @deprecated Use navigateToWizardTemplateCatalog on 4.22+.
   */
  async navigateToNamespaceCatalogViaUI(namespace?: string): Promise<void> {
    await this.navigateToTemplateCatalogViaVmList(namespace);
  }

  async navigateToProjectCatalog(projectName: string) {
    await this.goTo(`/k8s/ns/${projectName}/catalog`);
  }

  /**
   * @deprecated Use navigateToWizardTemplateCatalog on 4.22+.
   */
  async navigateToTemplateCatalogViaVmList(namespace?: string): Promise<void> {
    const ns = namespace || 'default';
    await this.goTo(`/k8s/ns/${ns}/catalog`);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async selectBootSource(
    _bootSource: 'ISO' | 'Registry' | 'URL' | 'PVC' | 'Upload',
    _value?: string,
  ) {
    const isChecked = await this._bootCd.isChecked().catch(() => false);
    if (!isChecked) {
      await this._bootCd.check({ force: true });
    }
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    await this._cdBootSource.waitFor({
      state: 'visible',
      timeout: TestTimeouts.RESOURCE_CREATION,
    });
    await this.robustClick(this._cdBootSource);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async selectDiskSource(
    diskSource: 'URL' | 'Registry' | 'PVC' | 'Upload',
    value?: string,
    username?: string,
    password?: string,
  ) {
    await this._diskBootSource.waitFor({
      state: 'visible',
      timeout: TestTimeouts.RESOURCE_CREATION,
    });
    await this.robustClick(this._diskBootSource);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    switch (diskSource) {
      case 'URL':
        await this.robustClick(this.testId('http'));
        if (value) {
          await this._diskBootSourceHttpSourceInput.waitFor({
            state: 'visible',
            timeout: TestTimeouts.UI_ACTION_COMPLETE,
          });
          await this._diskBootSourceHttpSourceInput.fill(value);
        }
        break;
      case 'Registry':
        await this.robustClick(this.testId('registry'));
        if (value) {
          await this._diskBootSourceContainerSourceInput.waitFor({
            state: 'visible',
            timeout: TestTimeouts.UI_ACTION_COMPLETE,
          });
          await this._diskBootSourceContainerSourceInput.fill(value);
        }
        if (username) {
          await this.testId('disk-boot-source-container-source-username').fill(username);
        }
        if (password) {
          await this.testId('disk-boot-source-container-source-password').fill(password);
        }
        break;
      case 'PVC':
        await this.robustClick(this.testId('pvc-clone'));
        break;
      case 'Upload': {
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
  }

  async selectFolderForTemplate(folderName: string, createNew = true) {
    try {
      await this.locator('[id="quick-create-form"]').waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });

      await this._idQuickCreateFormPlaceholderSearchFolder.focus();
      await this._idQuickCreateFormPlaceholderSearchFolder.fill(folderName);

      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

      if (createNew) {
        await this._idQuickCreateFormPlaceholderSearchFolder.press('Enter');
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

  async setWindowsDrivers(mount = true) {
    const isChecked = await this._windowsDriversCheckbox.isChecked().catch(() => false);
    if (mount && !isChecked) {
      await this._windowsDriversCheckbox.check({ force: true });
    } else if (!mount && isChecked) {
      await this._windowsDriversCheckbox.uncheck({ force: true });
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

  override async waitForTemplateForm() {
    await super.waitForTemplateForm();
  }
}
