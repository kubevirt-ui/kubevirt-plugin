import BaseComponent from '@/components/shared/base-component';
import { TestTimeouts } from '@/utils/test-config';
import type { Locator, Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// TemplateDetailEditComponent
// ---------------------------------------------------------------------------

export class TemplateDetailEditComponent extends BaseComponent {
  private readonly _tableDiskRowRoleGrid = this.locator(
    'table, [data-test="disk-row"], [role="grid"]',
  );
  private readonly _pfV6CModalBoxBody = this.locator('.pf-v6-c-modal-box__body');
  private readonly _pfV6CDescriptionListGroupHasTextSSHKey = this.locator(
    '.pf-v6-c-description-list__group:has-text("SSH key")',
  );

  constructor(page: Page) {
    super(page);
  }

  private async navigateToScheduling() {
    await super.navigateToTab(this.locator('[data-test-id="horizontal-link-Scheduling"]'));
    await this.waitForLoadingComplete(5000);
  }

  private async navigateToNetworks() {
    await super.navigateToTab(this.locator('[data-test-id="horizontal-link-Network interfaces"]'));
    const networkTable = this.locator('table, [data-test="network-row"], [role="grid"]');
    await networkTable
      .first()
      .waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT })
      .catch(() => {
        return;
      });
  }

  private async navigateToDisks() {
    await super.navigateToTab(this.locator('[data-test-id="horizontal-link-Disks"]'));
    const diskTable = this._tableDiskRowRoleGrid;
    await diskTable
      .first()
      .waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT })
      .catch(() => {
        return;
      });
  }

  private async navigateToScripts() {
    await super.navigateToTab(this.locator('[data-test-id="horizontal-link-Scripts"]'));
    await this.waitForLoadingComplete(5000);
  }

  async editDetails(templateData: {
    cpu?: string;
    mem?: string;
    bootMode?: string;
    workload?: string;
    headless?: boolean;
  }): Promise<void> {
    if (templateData.cpu && templateData.mem) {
      const cpuButton = this.locator('.pf-v6-c-description-list__group:has-text("CPU")')
        .locator('button.pf-m-link.pf-m-inline')
        .first();
      await cpuButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_VISIBILITY_QUICK,
      });
      await this.robustClick(cpuButton);
      const cpuInput = this.locator('input[name="cpu-input"]');
      const memoryInput = this.locator('input[name="memory-input"]');
      await cpuInput.waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_MEDIUM });
      await cpuInput.clear();
      await cpuInput.fill(templateData.cpu);
      await memoryInput.waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_MEDIUM });
      await memoryInput.clear();
      await memoryInput.fill(templateData.mem);
      await this.clickSave();
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);
    }

    if (templateData.bootMode) {
      const bootModeButton = this.locator(
        '.pf-v6-c-description-list__group:has-text("Boot mode")',
      ).locator('button');
      await bootModeButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_VISIBILITY_QUICK,
      });
      await this.robustClick(bootModeButton);
      const modalBody = this._pfV6CModalBoxBody;
      await modalBody.waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_MEDIUM });
      const bootModeMenuToggle = this._pfV6CModalBoxBody.locator('button.pf-v6-c-menu-toggle');
      await bootModeMenuToggle.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_DELAY_MEDIUM,
      });
      await this.robustClick(bootModeMenuToggle);
      await this.clickButtonByText(templateData.bootMode);
      await this.clickSave();
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);
    }

    if (templateData.workload) {
      const workloadButton = this.locator(
        '.pf-v6-c-description-list__group:has-text("Workload profile")',
      ).locator('button');
      await workloadButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_VISIBILITY_QUICK,
      });
      await this.robustClick(workloadButton);
      const modalBody = this._pfV6CModalBoxBody;
      await modalBody.waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_MEDIUM });
      const workloadMenuToggle = this._pfV6CModalBoxBody.locator('button.pf-v6-c-menu-toggle');
      await workloadMenuToggle.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_DELAY_MEDIUM,
      });
      await this.robustClick(workloadMenuToggle);
      await this.clickButtonByText(templateData.workload);
      await this.clickSave();
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);
    }

    if (templateData.headless) {
      const headlessCheckbox = this.locator('#headless-mode');
      await headlessCheckbox.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_VISIBILITY_QUICK,
      });
      await headlessCheckbox.check({ force: true });
    }
  }

  async editScheduling(templateData: {
    dedicatedResources?: boolean;
    evictionStrategy?: boolean;
  }): Promise<void> {
    await this.navigateToScheduling();

    if (templateData.dedicatedResources) {
      const dedicatedResourcesButton = this.locator(
        '.pf-v6-c-description-list__group:has-text("Dedicated resources")',
      ).locator('button');
      await dedicatedResourcesButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_VISIBILITY_QUICK,
      });
      await this.robustClick(dedicatedResourcesButton);
      const dedicatedResourcesCheckbox = this.locator('input[id="dedicated-resources"]');
      await dedicatedResourcesCheckbox.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_DELAY_MEDIUM,
      });
      await dedicatedResourcesCheckbox.check({ force: true });
      await this.clickSave();
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);
    }

    if (templateData.evictionStrategy) {
      const evictionStrategyButton = this.locator(
        '.pf-v6-c-description-list__group:has-text("Eviction strategy")',
      ).locator('button');
      await evictionStrategyButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_VISIBILITY_QUICK,
      });
      await this.robustClick(evictionStrategyButton);
      const evictionStrategyCheckbox = this.locator('input[id="eviction-strategy"]');
      await evictionStrategyCheckbox.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_DELAY_MEDIUM,
      });
      await evictionStrategyCheckbox.uncheck({ force: true });
      await this.clickSave();
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);
    }
  }

  async editNetworks(templateData: {
    nics?: Array<{
      name?: string;
      model?: string;
      network?: string;
      type?: string;
    }>;
  }): Promise<void> {
    if (templateData.nics) {
      await this.navigateToNetworks();
      for (const nic of templateData.nics) {
        const addNetworkInterfaceButton = this.locator('button:has-text("Add network interface")');
        await addNetworkInterfaceButton.waitFor({
          state: 'visible',
          timeout: TestTimeouts.UI_VISIBILITY_QUICK,
        });
        await this.robustClick(addNetworkInterfaceButton);
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);

        if (nic.name) {
          const nicNameInput = this.locator('input[aria-label="Network interface name"]');
          await nicNameInput.waitFor({
            state: 'visible',
            timeout: TestTimeouts.UI_VISIBILITY_QUICK,
          });
          await nicNameInput.clear();
          await nicNameInput.fill(nic.name);
        }

        if (nic.model) {
          const nicModelSelect = this.locator('[data-test-id="model-select"]');
          await nicModelSelect.waitFor({
            state: 'visible',
            timeout: TestTimeouts.UI_DELAY_MEDIUM,
          });
          await this.robustClick(nicModelSelect);
          const modelOption = this.locator(`[data-test-id="model-select-${nic.model}"]`);
          await modelOption.waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_MEDIUM });
          await this.robustClick(modelOption);
        }

        if (nic.network) {
          const nicNetworkSelect = this.locator(
            '[data-test-id="network-attachment-definition-select"]',
          );
          await nicNetworkSelect.waitFor({
            state: 'visible',
            timeout: TestTimeouts.UI_DELAY_MEDIUM,
          });
          const networkToggle = nicNetworkSelect.locator('button.pf-v6-c-menu-toggle__button');
          await networkToggle.waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_MEDIUM });
          await this.robustClick(networkToggle);
          await this.clickButtonByText(nic.network);
        }

        if (nic.type) {
          const nicTypeSelect = this.locator('[data-test-id="network-interface-type-select"]');
          await nicTypeSelect.waitFor({
            state: 'visible',
            timeout: TestTimeouts.UI_DELAY_MEDIUM,
          });
          await this.robustClick(nicTypeSelect);
          const typeOption = this.locator(
            `button[data-test-id="network-interface-type-select-${nic.type}"]`,
          );
          await typeOption.waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_MEDIUM });
          await this.robustClick(typeOption);
        }

        await this.clickSave();
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);
      }
    }
  }

  async editDisks(templateData: {
    disks?: Array<{
      name?: string;
      diskSource?: {
        selector?: string;
        value?: string;
      };
      size?: string;
      storageClass?: string;
    }>;
  }): Promise<void> {
    if (templateData.disks) {
      await this.navigateToDisks();
      for (const disk of templateData.disks) {
        const addDiskButton = this.locator('button:has-text("Add disk")');
        await addDiskButton.waitFor({
          state: 'visible',
          timeout: TestTimeouts.UI_VISIBILITY_QUICK,
        });
        await this.robustClick(addDiskButton);
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);

        if (disk.name) {
          const diskNameInput = this.locator('input[aria-label="Disk name"]');
          await diskNameInput.waitFor({
            state: 'visible',
            timeout: TestTimeouts.UI_VISIBILITY_QUICK,
          });
          await diskNameInput.clear();
          await diskNameInput.fill(disk.name);
        }

        if (disk.diskSource?.selector) {
          const diskSourceSelect = this.locator('[data-test-id="disk-source-select"]');
          await diskSourceSelect.waitFor({
            state: 'visible',
            timeout: TestTimeouts.UI_DELAY_MEDIUM,
          });
          await this.robustClick(diskSourceSelect);
          const sourceOption = this.locator(disk.diskSource.selector);
          await sourceOption.waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_MEDIUM });
          await this.robustClick(sourceOption);
        }

        await this.clickSave();
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);
      }
    }
  }

  async editScripts(templateData: {
    username?: string;
    password?: string;
    ethName?: string;
    ipAddr?: string;
    gateway?: string;
    newSecret?: string;
    existSecret?: string;
  }): Promise<void> {
    if (
      templateData.username ||
      templateData.password ||
      templateData.ethName ||
      templateData.ipAddr ||
      templateData.gateway ||
      templateData.newSecret ||
      templateData.existSecret
    ) {
      await this.navigateToScripts();
    }

    if (
      templateData.username ||
      templateData.password ||
      templateData.ethName ||
      templateData.ipAddr ||
      templateData.gateway
    ) {
      const cloudInitButton = this.locator(
        '.pf-v6-c-description-list__group:has-text("Cloud-init")',
      )
        .locator('button')
        .first();
      await cloudInitButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_VISIBILITY_QUICK,
      });
      await this.robustClick(cloudInitButton);

      if (templateData.username) {
        const cloudInitUsernameInput = this.locator('input[id="cloudinit-user"]');
        await cloudInitUsernameInput.waitFor({
          state: 'visible',
          timeout: TestTimeouts.UI_DELAY_MEDIUM,
        });
        await cloudInitUsernameInput.clear();
        await cloudInitUsernameInput.fill(templateData.username);
      }

      if (templateData.password) {
        const cloudInitPasswordInput = this.locator('input[id="cloudinit-password"]');
        await cloudInitPasswordInput.waitFor({
          state: 'visible',
          timeout: TestTimeouts.UI_DELAY_MEDIUM,
        });
        await cloudInitPasswordInput.clear();
        await cloudInitPasswordInput.fill(templateData.password);
      }

      if (templateData.ethName || templateData.ipAddr || templateData.gateway) {
        const cloudInitNetworkCheckbox = this.locator('input[id="custom-network-checkbox"]');
        await cloudInitNetworkCheckbox.waitFor({
          state: 'visible',
          timeout: TestTimeouts.UI_DELAY_MEDIUM,
        });
        await cloudInitNetworkCheckbox.check({ force: true });

        if (templateData.ethName) {
          const cloudInitEthNameInput = this.locator('input[id="ethernet-name"]');
          await cloudInitEthNameInput.waitFor({
            state: 'visible',
            timeout: TestTimeouts.UI_DELAY_MEDIUM,
          });
          await cloudInitEthNameInput.fill(templateData.ethName);
        }

        if (templateData.ipAddr) {
          const cloudInitIpAddressInput = this.locator('input[id="address"]');
          await cloudInitIpAddressInput.waitFor({
            state: 'visible',
            timeout: TestTimeouts.UI_DELAY_MEDIUM,
          });
          await cloudInitIpAddressInput.fill(templateData.ipAddr);
        }

        if (templateData.gateway) {
          const cloudInitGatewayInput = this.locator('input[id="gateway"]');
          await cloudInitGatewayInput.waitFor({
            state: 'visible',
            timeout: TestTimeouts.UI_DELAY_MEDIUM,
          });
          await cloudInitGatewayInput.fill(templateData.gateway);
        }
      }

      const cloudInitApplyButton = this.locator('button:has-text("Apply")');
      await cloudInitApplyButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_DELAY_MEDIUM,
      });
      await this.robustClick(cloudInitApplyButton);
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);
    }

    if (templateData.newSecret) {
      const sshKeyButton = this._pfV6CDescriptionListGroupHasTextSSHKey.locator('button').first();
      await sshKeyButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_VISIBILITY_QUICK,
      });
      await this.robustClick(sshKeyButton);
      const sshKeyAddNewButton = this.locator('#addNew');
      await sshKeyAddNewButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_DELAY_MEDIUM,
      });
      await this.robustClick(sshKeyAddNewButton);
      const sshKeySecretNameInput = this.locator('#new-secret-name');
      await sshKeySecretNameInput.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_DELAY_MEDIUM,
      });
      await sshKeySecretNameInput.clear();
      await sshKeySecretNameInput.fill(templateData.newSecret);
      await this.clickSave();
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);
    }

    if (templateData.existSecret) {
      const sshKeyButton = this._pfV6CDescriptionListGroupHasTextSSHKey.locator('button').first();
      await sshKeyButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_VISIBILITY_QUICK,
      });
      await this.robustClick(sshKeyButton);
      const sshKeyUseExistingButton = this.locator('#useExisting');
      await sshKeyUseExistingButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_DELAY_MEDIUM,
      });
      await this.robustClick(sshKeyUseExistingButton);
      const sshKeySecretSelect = this.locator('text=Select project...');
      await sshKeySecretSelect.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_DELAY_MEDIUM,
      });
      await this.robustClick(sshKeySecretSelect);
      await this.clickButtonByText(templateData.existSecret);
      await this.clickSave();
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);
    }
  }
}

// ---------------------------------------------------------------------------
// TemplateEditComponent
// ---------------------------------------------------------------------------

export class TemplateEditComponent extends BaseComponent {
  private readonly _templateActionsDropdown = this.locator('[data-test="actions-dropdown"]');
  private readonly _footerSaveButton = this.locator('footer [data-test="save-button"]');
  private readonly _tr = this.locator('tr');
  private readonly _btnPlaceholderSelectProject = this.locator(
    'button[placeholder="Select project"]',
  );
  private readonly _inputSearchInput = this.locator('input[aria-label="Search input"]');
  private readonly _provider = this.locator('#provider');
  private readonly _roleMenuitem = this.locator('[role="menuitem"]');

  constructor(page: Page) {
    super(page);
  }

  async clickCreateTemplate() {
    const createTemplateButton = this.locator('[data-test="item-create"]');
    await createTemplateButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(createTemplateButton);

    const yamlOption = this.page.getByRole('menuitem', { name: 'With YAML' });
    const hasDropdown = await yamlOption
      .isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM })
      .catch(() => false);
    if (hasDropdown) {
      await this.robustClick(yamlOption);
    }
  }

  async setCreateTemplateExampleNameInYamlEditor(templateName: string): Promise<void> {
    await this.page.waitForSelector('.monaco-editor', {
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });

    await this.page.waitForFunction(
      () => {
        const w = window as unknown as {
          monaco?: {
            editor?: {
              getEditors: () => Array<{
                getModel: () => { getValue: () => string } | null | undefined;
              }>;
            };
          };
        };
        const editors = w.monaco?.editor?.getEditors();
        return Boolean(editors && editors.length > 0 && editors[0].getModel());
      },
      { timeout: TestTimeouts.UI_VISIBILITY_QUICK as number },
    );

    const content = await this.page.evaluate(() => {
      try {
        const w = window as unknown as {
          monaco?: {
            editor?: {
              getEditors: () => Array<{
                getModel: () => { getValue: () => string } | null | undefined;
              }>;
            };
          };
        };
        const editors = w.monaco?.editor?.getEditors();
        if (editors && editors.length > 0) {
          const editor = editors[0];
          const model = editor.getModel();
          if (model) return model.getValue();
        }
      } catch {}
      return null;
    });

    if (!content) {
      throw new Error('Could not get create-template YAML editor content');
    }

    const updated = content
      .replace(/\bname: example\b/, `name: ${templateName}`)
      .replace(/vm\.kubevirt\.io\/template: example\b/, `vm.kubevirt.io/template: ${templateName}`);

    await this.fillYamlEditor(updated);
  }

  async clickCreateButtonInModal() {
    const createButton = this.locator('[data-test="save-changes"], button:has-text("Create")');
    await createButton.first().waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_LONG });
    await this.robustClick(createButton.first());
    await this.page.waitForTimeout(TestTimeouts.RETRY_DELAY);
  }

  async verifyTemplateCreationFromExample(expectedText: string): Promise<boolean> {
    try {
      const textLocator = this.locator(`text=${expectedText}`);
      await textLocator.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      return true;
    } catch {
      return false;
    }
  }

  async verifyRedirectAfterTemplateCreation(): Promise<{ isValid: boolean; url: string }> {
    try {
      await this.page.waitForURL(
        (url) => !url.pathname.endsWith('~new') && !url.pathname.includes('~new'),
        { timeout: TestTimeouts.ELEMENT_WAIT },
      );
      const currentUrl = this.page.url();
      const isTemplatePath = currentUrl.includes('/templates/') || currentUrl.includes('Template');
      const hasOldBrokenPath = currentUrl.includes('template.openshift.io~v1~Template');
      return { isValid: isTemplatePath && !hasOldBrokenPath, url: currentUrl };
    } catch {
      return { isValid: false, url: this.page.url() };
    }
  }

  async isCreateTemplateModalShowingClusterAndNamespaceOptions(): Promise<boolean> {
    try {
      const clusterToggle = this.locator('[data-test="cluster-dropdown-menu-toggle"]').first();
      const namespaceToggle = this.locator('[data-test="namespace-dropdown-menu-toggle"]').first();
      await clusterToggle.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await namespaceToggle.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      return true;
    } catch {
      return false;
    }
  }

  private getTemplateRow(templateName: string): Locator {
    return this.locator('[data-test-rows="resource-row"]')
      .filter({ hasText: templateName })
      .locator('xpath=ancestor::tr');
  }

  private getTemplateActionsButton(templateName: string): Locator {
    const row = this.getTemplateRow(templateName);
    return row.locator('[data-test="actions-dropdown"] button');
  }

  async clickCloneTemplate(templateName: string) {
    const actionsButton = this.getTemplateActionsButton(templateName);
    await this.robustClick(actionsButton);
    await this.robustClick(this.locator('button:has-text("Clone")'));
  }

  async clickEditBootSourceReference(templateName: string) {
    const actionsButton = this.getTemplateActionsButton(templateName);
    await this.robustClick(actionsButton);
    await this.robustClick(this.locator('button:has-text("Edit boot source reference")'));
  }

  async editBootSourceForDisk(diskName: string) {
    await this.robustClick(this._templateActionsDropdown);
    await this.robustClick(this.locator('[data-test-id="edit-boot-source"]'));

    const diskRow = this._tr.filter({ hasText: diskName });
    const diskToggle = diskRow.locator('#toggle-id-disk');
    await this.robustClick(diskToggle);

    await this.robustClick(
      this._roleMenuitem.filter({
        hasText: 'Edit',
      }),
    );
    await this.locator('#enable-bootsource').check({ force: true });
    await this.robustClick(this._footerSaveButton);
  }

  async isDiskBootable(diskName: string): Promise<boolean> {
    const diskRow = this._tr.filter({ hasText: diskName });
    await diskRow.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });

    const bootableText = diskRow.locator('text=bootable');
    await bootableText
      .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
      .catch(() => {
        return;
      });
    const isBootable = await bootableText.isVisible().catch(() => false);

    return isBootable;
  }

  async cloneTemplate(name?: string, provider?: string, namespace?: string) {
    await this.robustClick(this._templateActionsDropdown);
    await this.robustClick(this.locator('[data-test-id="clone-template"]'));

    if (name) {
      const nameInput = this.locator('#name');
      await nameInput.clear();
      await nameInput.fill(name);
    }

    if (namespace) {
      const projectSelect = this._btnPlaceholderSelectProject;
      await this.robustClick(projectSelect);
      const searchInput = this._inputSearchInput;
      await searchInput.fill(namespace);
      const menuItem = this.locator(`[role="option"]:has-text("${namespace}")`);
      await this.robustClick(menuItem);
    }

    if (provider) {
      const providerInput = this._provider;
      await providerInput.clear();
      await providerInput.fill(provider);
    }

    await this.robustClick(this._footerSaveButton);
  }

  async isBaseTemplateVisible(templateName: string): Promise<boolean> {
    const baseTemplateElement = this.locator(`[data-test="${templateName}"]`);
    await baseTemplateElement
      .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
      .catch(() => {
        return;
      });
    return await baseTemplateElement.isVisible().catch(() => false);
  }

  async deleteTemplate() {
    await this.robustClick(this._templateActionsDropdown);
    await this.robustClick(this.locator('[data-test-id="delete-template"]'));
    await this.robustClick(this._footerSaveButton);
  }

  async waitForTemplateRowDetached(
    templateName: string,
    timeout: number = TestTimeouts.DEFAULT,
  ): Promise<void> {
    const row = this.getTemplateRow(templateName);
    await row.waitFor({ state: 'detached', timeout });
  }

  async hasBadgeInTemplateRow(templateName: string, badgeText: string): Promise<boolean> {
    const row = this.getTemplateRow(templateName);
    const badge = row.locator(`text=${badgeText}`);
    try {
      await badge.waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_MEDIUM });
      return true;
    } catch {
      return false;
    }
  }

  async verifySourceAvailableTextDoesNotExist(): Promise<boolean> {
    try {
      const sourceAvailableLocator = this.locator('text=Source available');
      const exists = await sourceAvailableLocator
        .isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM })
        .catch(() => false);
      return !exists;
    } catch {
      return true;
    }
  }

  async isEmptyMessageVisible(): Promise<boolean> {
    try {
      const noTemplatesMessage = this.locator('#no-templates-msg');
      const idVisible = await noTemplatesMessage
        .waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_MEDIUM })
        .then(() => true)
        .catch(() => false);

      if (idVisible) {
        const text = await noTemplatesMessage.textContent();
        return text?.includes('No templates found') ?? false;
      }

      const textLocator = this.page.getByText('No templates found');
      await textLocator.first().waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_DELAY_MEDIUM,
      });
      return true;
    } catch {
      return false;
    }
  }

  async navigateToTemplateDetail(templateName: string) {
    const row = this.getTemplateRow(templateName);
    const templateLink = row.locator(`[data-test-id="${templateName}"]`).first();
    await this.robustClick(templateLink);
  }

  async verifyTemplateDetailsPage(): Promise<boolean> {
    try {
      const templateDetailsLocator = this.locator('text=Template details');
      await templateDetailsLocator.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_VISIBILITY_QUICK,
      });
      return true;
    } catch {
      return false;
    }
  }

  async verifyTemplateContains(expectedText: string): Promise<boolean> {
    try {
      const textLocator = this.locator(`text=${expectedText}`);
      await textLocator.waitFor({ state: 'visible', timeout: TestTimeouts.UI_VISIBILITY_QUICK });
      return true;
    } catch {
      return false;
    }
  }

  async fillCloneTemplateModal(
    metadataName: string,
    displayName?: string,
    provider?: string,
    namespace?: string,
  ) {
    const cloneModalNameInput = this.locator('input[id="name"]');
    await cloneModalNameInput.clear();
    await cloneModalNameInput.fill(metadataName);

    if (displayName) {
      const cloneModalDisplayNameInput = this.locator('input[id="display-name"]');
      await cloneModalDisplayNameInput.clear();
      await cloneModalDisplayNameInput.fill(displayName);
    }

    if (namespace) {
      await this._btnPlaceholderSelectProject.click();
      const searchInput = this._inputSearchInput;
      await searchInput.fill(namespace);
      const menuItem = this.locator(`[role="option"]:has-text("${namespace}")`);
      await this.robustClick(menuItem);
    }

    if (provider) {
      const cloneModalProviderInput = this._provider;
      await cloneModalProviderInput.clear();
      await cloneModalProviderInput.fill(provider);
    }
  }

  async clickCloneModalCloneButton() {
    await this.robustClick(this.locator('button:has-text("Clone")'));
  }

  async selectPvcAsBootSource(projectName: string, pvcName: string) {
    await this.robustClick(this.locator('button:has-text("Select boot source")'));
    await this.robustClick(
      this.locator('[data-test-id="disk-source-select-persistentVolumeClaim"]'),
    );
    await this.robustClick(this.locator('text=--- Select PVC project ---'));
    await this.clickButtonByText(projectName);
    await this.robustClick(this.locator('.pf-c-form-control.pf-c-select__toggle-typeahead'));
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);
    await this.clickButtonByText(pvcName);
  }

  private async fillYamlEditor(yamlContent: string) {
    await this.page.waitForSelector('.monaco-editor', {
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    const success = await this.page.evaluate((content) => {
      try {
        const w = window as unknown as {
          monaco?: {
            editor?: {
              getEditors: () => Array<{
                executeEdits: (
                  label: string,
                  edits: Array<{ forceMoveMarkers?: boolean; range: unknown; text: string }>,
                ) => void;
                getModel: () =>
                  | { getFullModelRange: () => unknown; getValue: () => string }
                  | null
                  | undefined;
              }>;
            };
          };
        };
        const editors = w.monaco?.editor?.getEditors();
        if (editors && editors.length > 0) {
          const editor = editors[0];
          const model = editor.getModel();
          if (model) {
            editor.executeEdits('', [
              { forceMoveMarkers: true, range: model.getFullModelRange(), text: content },
            ]);
            return true;
          }
        }
      } catch {
        /* Failed to set editor content via Monaco API */
      }
      return false;
    }, yamlContent);

    if (!success) {
      const ta = this.locator('.ocs-yaml-editor textarea');
      await ta.waitFor({ state: 'attached', timeout: TestTimeouts.UI_DELAY_MEDIUM });
      await ta.focus();
      await this.page.evaluate((content) => {
        const textarea = document.querySelector('.ocs-yaml-editor textarea') as HTMLTextAreaElement;
        if (textarea) {
          textarea.value = content;
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }, yamlContent);
    }
  }
}
