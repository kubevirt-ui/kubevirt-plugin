/**
 * Template catalog and template detail components.
 */

import BaseComponent from '@/components/shared/base-component';
import { TestTimeouts } from '@/utils/test-config';
import { waitForElementStable } from '@/utils/wait-helpers';
import type { Page } from '@playwright/test';

export class TemplateDetailComponent extends BaseComponent {
  private readonly _pfV6CDescriptionListGroupHasTextSSHKey = this.locator(
    '.pf-v6-c-description-list__group:has-text("SSH key")',
  );
  private readonly _pfV6CModalBoxBody = this.locator('.pf-v6-c-modal-box__body');
  private readonly _tableDiskRowRoleGrid = this.locator('table')
    .or(this.testId('disk-row'))
    .or(this.locator('[role="grid"]'));
  private readonly _yamlTab = this.testId('horizontal-link-YAML');

  constructor(page: Page) {
    super(page);
  }

  async clickActionsDropdown() {
    await this.robustClick(this.testId('actions-dropdown'));
  }

  async clickCloneTemplate() {
    await this.robustClick(this.testId('actions-dropdown-item-clone'));
  }

  async clickDeleteTemplate() {
    await this.robustClick(this.testId('delete-template'));
  }

  async clickEditAnnotations() {
    await this.robustClick(this.testId('actions-dropdown-item-edit-annotations'));
  }

  async clickEditBootSource() {
    await this.robustClick(this.testId('actions-dropdown-item-edit-boot-source'));
  }

  async clickEditBootSourceRef() {
    await this.robustClick(this.testId('actions-dropdown-item-edit-boot-source-ref'));
  }

  async clickEditLabels() {
    await this.robustClick(this.testId('actions-dropdown-item-edit-labels'));
  }

  async editDetails(templateData: {
    cpu?: string;
    mem?: string;
    bootMode?: string;
    workload?: string;
    headless?: boolean;
  }): Promise<void> {
    // Edit CPU/Memory
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
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA); // wait for backend update
    }

    // Edit boot mode
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
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA); // wait for backend update
    }

    // Edit workload profile
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
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA); // wait for backend update
    }

    // Enable headless mode
    if (templateData.headless) {
      const headlessCheckbox = this.locator('#headless-mode');
      await headlessCheckbox.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_VISIBILITY_QUICK,
      });
      await headlessCheckbox.check({ force: true });
      // Note: Cypress doesn't click save for headless, it just checks the checkbox
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
          const diskSourceSelect = this.testId('disk-source-select');
          await diskSourceSelect.waitFor({
            state: 'visible',
            timeout: TestTimeouts.UI_DELAY_MEDIUM,
          });
          await this.robustClick(diskSourceSelect);
          const sourceOption = this.locator(disk.diskSource.selector);
          await sourceOption.waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_MEDIUM });
          await this.robustClick(sourceOption);
        }

        // Note: Additional disk configuration (size, storage class, etc.) would be added here
        // This is a simplified version matching the Cypress pattern

        await this.clickSave();
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);
      }
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
          const nicModelSelect = this.testId('model-select');
          await nicModelSelect.waitFor({
            state: 'visible',
            timeout: TestTimeouts.UI_DELAY_MEDIUM,
          });
          await this.robustClick(nicModelSelect);
          const modelOption = this.testId(`model-select-${nic.model}`);
          await modelOption.waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_MEDIUM });
          await this.robustClick(modelOption);
        }

        if (nic.network) {
          const nicNetworkSelect = this.testId('network-attachment-definition-select');
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
          const nicTypeSelect = this.testId('network-interface-type-select');
          await nicTypeSelect.waitFor({
            state: 'visible',
            timeout: TestTimeouts.UI_DELAY_MEDIUM,
          });
          await this.robustClick(nicTypeSelect);
          const typeOption = this.testId(`network-interface-type-select-${nic.type}`);
          await typeOption.waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_MEDIUM });
          await this.robustClick(typeOption);
        }

        await this.clickSave();
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);
      }
    }
  }

  async editScheduling(templateData: {
    dedicatedResources?: boolean;
    evictionStrategy?: boolean;
  }): Promise<void> {
    await this.navigateToScheduling();

    // Edit dedicated resources
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
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA); // wait for backend update
    }

    // Edit eviction strategy
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
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA); // wait for backend update
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

    // Edit cloud-init
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

    // Edit SSH keys - new secret
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
      // Note: File upload would be handled here (cy.dropFile)
      // For now, we'll just fill the secret name
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

    // Edit SSH keys - existing secret
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

  async editTemplate(templateData: {
    cpu?: string;
    mem?: string;
    bootMode?: string;
    workload?: string;
    headless?: boolean;
    dedicatedResources?: boolean;
    evictionStrategy?: boolean;
    nics?: Array<{
      name?: string;
      model?: string;
      network?: string;
      type?: string;
    }>;
    disks?: Array<{
      name?: string;
      diskSource?: {
        selector?: string;
        value?: string;
      };
      size?: string;
      storageClass?: string;
    }>;
    username?: string;
    password?: string;
    ethName?: string;
    ipAddr?: string;
    gateway?: string;
    newSecret?: string;
    existSecret?: string;
  }): Promise<void> {
    await this.editDetails(templateData);
    await this.editScheduling(templateData);
    await this.editNetworks(templateData);
    await this.editDisks(templateData);
    await this.editScripts(templateData);
  }

  async getDetailFieldValue(
    fieldLabel: string,
    timeout: number = TestTimeouts.UI_ELEMENT_VISIBILITY,
  ): Promise<string> {
    const group = this.locator('.pf-v6-c-description-list__group').filter({
      has: this.page.locator(`.pf-v6-c-description-list__term`, { hasText: fieldLabel }),
    });
    const dd = group.locator('.pf-v6-c-description-list__description, dd');
    try {
      await dd.first().waitFor({ state: 'visible', timeout });
      return (await dd.first().textContent())?.trim() ?? '';
    } catch {
      return '';
    }
  }

  async isCloudInitSectionVisible(): Promise<boolean> {
    const section = this.locator(
      '.pf-v6-c-description-list__group:has-text("Cloud-init"), [class*="description-list"]:has-text("Cloud-init")',
    );
    return section
      .first()
      .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
      .then(() => true)
      .catch(() => false);
  }

  async isParametersTabActive(): Promise<boolean> {
    const activeTab = this.testId('horizontal-link-Parameters').and(
      this.locator('[aria-selected="true"]').or(this.locator('.pf-m-current')),
    );
    return activeTab
      .first()
      .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
      .then(() => true)
      .catch(async () => {
        const tab = this.testId('horizontal-link-Parameters');
        return tab
          .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
          .then(() => true)
          .catch(() => false);
      });
  }

  async isTemplateNameVisible(
    templateName: string,
    timeout: number = TestTimeouts.UI_ELEMENT_VISIBILITY,
  ): Promise<boolean> {
    try {
      const templateNameElement = this.locator('span', { hasText: templateName });

      await templateNameElement.waitFor({ state: 'visible', timeout });

      return await templateNameElement.isVisible();
    } catch (error) {
      return false;
    }
  }

  async isYamlTabHidden(timeout = 15000): Promise<boolean> {
    try {
      await this._yamlTab.waitFor({ state: 'hidden', timeout });
      return true;
    } catch {
      return false;
    }
  }

  async isYamlTabVisible(timeout = 15000): Promise<boolean> {
    try {
      await this._yamlTab.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  async navigateToDisks() {
    await super.navigateToTab(this.testId('horizontal-link-Disks'));

    const diskTable = this._tableDiskRowRoleGrid;
    await diskTable
      .first()
      .waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT })
      .catch(() => {
        return;
      });
  }

  async navigateToNetworks() {
    await super.navigateToTab(this.testId('horizontal-link-Network interfaces'));

    const networkTable = this.locator('table')
      .or(this.testId('network-row'))
      .or(this.locator('[role="grid"]'));
    await networkTable
      .first()
      .waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT })
      .catch(() => {
        return;
      });
  }

  async navigateToParameters() {
    await super.navigateToTab(this.testId('horizontal-link-Parameters'));

    await this.waitForLoadingComplete(5000);
  }

  async navigateToScheduling() {
    await super.navigateToTab(this.testId('horizontal-link-Scheduling'));

    await this.waitForLoadingComplete(5000);
  }

  async navigateToScripts() {
    await super.navigateToTab(this.testId('horizontal-link-Scripts'));

    await this.waitForLoadingComplete(5000);
  }

  async navigateToTemplateDetail(templateName: string, namespace: string) {
    await this.goTo(`/k8s/ns/${namespace}/templates/${templateName}`);
  }

  async navigateToYAML() {
    await super.navigateToTab(this._yamlTab);

    await this.waitForLoadingComplete(5000);
  }

  async verifyAllDetailFields(expected: Record<string, string>): Promise<{
    passed: string[];
    failed: Array<{ field: string; expected: string; actual: string }>;
  }> {
    const passed: string[] = [];
    const failed: Array<{ field: string; expected: string; actual: string }> = [];
    for (const [field, expectedValue] of Object.entries(expected)) {
      const actual = await this.getDetailFieldValue(field);
      if (actual.includes(expectedValue)) {
        passed.push(field);
      } else {
        failed.push({ field, expected: expectedValue, actual });
      }
    }
    return { passed, failed };
  }

  async verifyCloudInit(): Promise<boolean> {
    await this.waitForLoadingComplete(5000);

    return await super.verifyTextVisible('Cloud-init', true);
  }

  async verifyCloudUserPassword(): Promise<boolean> {
    return await super.verifyTextVisible('CLOUD_USER_PASSWORD');
  }

  async verifyContainerDisk(): Promise<boolean> {
    await this.waitForLoadingComplete(5000);

    const diskTable = this._tableDiskRowRoleGrid;
    await diskTable
      .first()
      .waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT })
      .catch(() => {
        return;
      });

    // Check multiple possible selectors for containerdisk
    const containerdiskLocators = [
      this.page.getByText('containerdisk', { exact: false }),
      this.locator('[data-test*="containerdisk"]'),
      this.locator('td:has-text("containerdisk")'),
      this.locator('[role="cell"]:has-text("containerdisk")'),
      this.testId('disk-row').filter({ hasText: 'containerdisk' }),
    ];

    for (const locator of containerdiskLocators) {
      const isVisible = await locator
        .first()
        .isVisible({ timeout: TestTimeouts.RETRY_DELAY })
        .catch(() => false);
      if (isVisible) {
        return true;
      }
    }

    return await super.verifyTextVisible('containerdisk', true);
  }

  async verifyCpuMemory(expectedCpu: string, expectedMemGi: string): Promise<boolean> {
    const expectedText = `${expectedCpu} CPU | ${expectedMemGi} GiB Memory`;
    try {
      const cpuMemValue = this.locator(`text=${expectedText}`).first();
      await cpuMemValue.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      return true;
    } catch {
      return false;
    }
  }

  async verifyDataSourceName(): Promise<boolean> {
    await this.waitForLoadingComplete(5000);

    return await super.verifyTextVisible('DATA_SOURCE_NAME', true);
  }

  async verifyDiskNameVisible(diskName: string): Promise<boolean> {
    await this.waitForLoadingComplete(5000);

    const diskTable = this._tableDiskRowRoleGrid;
    await diskTable
      .first()
      .waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT })
      .catch(() => {
        return;
      });

    const diskLocators = [
      this.page.getByText(diskName, { exact: true }),
      this.locator(`td:has-text("${diskName}")`),
      this.locator(`[role="cell"]:has-text("${diskName}")`),
    ];

    for (const locator of diskLocators) {
      const isVisible = await locator
        .first()
        .isVisible({ timeout: TestTimeouts.RETRY_DELAY })
        .catch(() => false);
      if (isVisible) {
        return true;
      }
    }

    return await super.verifyTextVisible(diskName, true);
  }

  async verifyDisplayName(): Promise<boolean> {
    return await super.verifyTextVisible('Display name', true);
  }

  async verifyDownload(): Promise<boolean> {
    return await super.verifyTextVisible('Download');
  }

  async verifyPodNetworking(): Promise<boolean> {
    return await super.verifyTextVisible('Network interfaces', true);
  }

  async verifyProvider(provider: string): Promise<boolean> {
    try {
      // The provider is typically in a description list text element
      // Cypress uses: cy.contains(vmView.descrText, cloneTemplate.provider)
      // where descrText = '.pf-v6-c-description-list__text'
      const providerText = this.locator('.pf-v6-c-description-list__text').filter({
        hasText: provider,
      });
      await providerText.waitFor({ state: 'visible', timeout: TestTimeouts.UI_VISIBILITY_QUICK });
      return await providerText.isVisible().catch(() => false);
    } catch {
      return false;
    }
  }

  async verifyRedHatTemplateNotEditable(): Promise<boolean> {
    return await super.verifyTextVisible('Templates provided by Red Hat are not editable');
  }

  async verifyRootdisk(): Promise<boolean> {
    await this.waitForLoadingComplete(5000);

    const diskTable = this._tableDiskRowRoleGrid;
    await diskTable
      .first()
      .waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT })
      .catch(() => {
        return;
      });

    // Check multiple possible selectors for rootdisk
    const rootdiskLocators = [
      this.page.getByText('rootdisk', { exact: false }),
      this.locator('[data-test*="rootdisk"]'),
      this.locator('td:has-text("rootdisk")'),
      this.locator('[role="cell"]:has-text("rootdisk")'),
      this.testId('disk-row').filter({ hasText: 'rootdisk' }),
    ];

    for (const locator of rootdiskLocators) {
      const isVisible = await locator
        .first()
        .isVisible({ timeout: TestTimeouts.RETRY_DELAY })
        .catch(() => false);
      if (isVisible) {
        return true;
      }
    }

    return await super.verifyTextVisible('rootdisk', true);
  }

  async verifyTolerations(): Promise<boolean> {
    return await super.verifyTextVisible('Tolerations', true);
  }
}

export class CreateVmTemplateCatalogComponent extends BaseComponent {
  /**
   * Maps legacy TEMPLATE_DISPLAY_NAMES to metadata names used as data-test in CNV 4.99+.
   * In CNV 4.99+ the card text no longer contains the display name, so we look up by data-test.
   */
  private static readonly _displayNameToMetadataName: Record<string, string> = {
    'Red Hat Enterprise Linux 8 VM': 'rhel8-server-small',
    'Red Hat Enterprise Linux 9 VM': 'rhel9-server-small',
    'Fedora VM': 'fedora-server-small',
    'CentOS Stream 9 VM': 'centos-stream9-server-small',
    'Microsoft Windows 11 VM': 'windows11-desktop-medium',
    'Microsoft Windows Server 2022 VM': 'windows2k22-server-medium',
    'Microsoft Windows Server 2016 VM': 'windows2k16-server-medium',
    'Microsoft Windows Server 2019 VM': 'windows2k19-server-medium',
  };
  private readonly _architectureFilter = this.testId('filter-category-Architecture');
  private readonly _bootFromCDCheckbox = this.testId('boot-cd');
  private readonly _bootSourceDropdown = this.testId('cd-boot-source');
  private readonly _createFolderButton = this.locator('button:has-text("Create folder")');
  private readonly _createVirtualMachineButton = this.locator('button', {
    hasText: 'Create VirtualMachine',
  });
  private readonly _customizeVirtualMachineButton = this.testId('customize-vm-btn');
  private readonly _customizeVirtualMachineFooterButton = this.locator(
    '.create-vm-instance-type-footer button',
    { hasText: 'Customize VirtualMachine' },
  );
  private readonly _diskSourceDropdown = this.testId('disk-boot-source');
  private readonly _diskSourceRegistryInput = this.testId(
    'disk-boot-source-container-source-input',
  );
  private readonly _diskSourceURLInput = this.testId('disk-boot-source-http-source-input');
  private readonly _filterDropdownButton = this.locator('button:has-text("Filter")');

  private readonly _quickCreateVmButton = this.testId('quick-create-vm-btn');
  private readonly _quickFormVmFolderInput = this.locator(
    '[id="quick-create-form"] [placeholder="Search folder"]',
  );
  private readonly _quickFormVmFolderSelectButton = this.locator('#vm-folder-select button');
  private readonly _searchCatalogInput = this.testId('search-catalog')
    .locator('input')
    .or(this.locator('input[placeholder="Filter by keyword..."]'));

  private readonly _selectInlineFilterInput = this.locator('#select-inline-filter input');
  private readonly _startAfterCreationCheckbox = this.locator(
    '#start-after-create-checkbox',
  ).first();

  private readonly _templateCatalogVmNameInput = this.testId('template-catalog-vm-name-input');
  private readonly _templatesTab = this.testId('templates-tab');
  private readonly _tlsCertRequiredCheckbox = this.locator('#tls-certificate-required');
  private readonly _tlsCertSelectDropdown = this.locator(
    'button[placeholder="Select TLS certificate"]',
  );
  private readonly _tlsCertTextArea = this.locator('[aria-label="TLS certificate"]');

  private readonly _tlsProjectDropdown = this.locator('button[placeholder="Select project..."]');

  private readonly _userProvidedTab = this.locator('#filter-templateScope-user, #user-templates');
  private readonly _vmCatalogGrid = this.locator('#vm-catalog-grid');

  private readonly _windowsDriversCheckbox = this.testId('cdrom-drivers');

  constructor(page: Page) {
    super(page);
  }

  /**
   * Opens the Filter dropdown, toggles a filter item by its data-test-row-filter key,
   * then closes the dropdown. Used for wizard-based template catalog filtering.
   */
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
      // Re-open in case a previous check action caused a re-render/close
      await openDropdown();
      await checkbox.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      await checkbox.dispatchEvent('click');
    }
    // Close the dropdown
    const expanded = await this._filterDropdownButton
      .getAttribute('aria-expanded')
      .catch(() => null);
    if (expanded === 'true') {
      await this._filterDropdownButton.click();
    }
    await this.page.waitForTimeout(TestTimeouts.UI_FILTER_APPLY / 3);
  }
  /**
   * Clicks the "All" button to show all templates.
   */
  async clickAllTemplatesButton() {
    const allTemplatesButton = this.testId('catalog-template-filter-all-items');
    const exists = await allTemplatesButton.isVisible({ timeout: 2000 }).catch(() => false);
    if (exists) {
      await this.robustClick(allTemplatesButton);
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
    }
  }

  /**
   * Clicks the Customize VirtualMachine button (text-based locator).
   * This is different from clickCustomizeVmButton which uses a data-test.
   */
  async clickCustomizeVirtualMachineButton() {
    await this._customizeVirtualMachineButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(this._customizeVirtualMachineButton);
  }

  /**
   * Clicks the "Customize VirtualMachine" button in the instance type footer.
   * Uses .create-vm-instance-type-footer button selector.
   */
  async clickCustomizeVirtualMachineFooterButton() {
    await this._customizeVirtualMachineFooterButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(this._customizeVirtualMachineFooterButton);
  }

  /**
   * Clicks the Customize VirtualMachine button.
   */
  async clickCustomizeVmButton() {
    await this._customizeVirtualMachineFooterButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(this._customizeVirtualMachineFooterButton);
  }

  /**
   * Clicks the quick create VM button in the template catalog form.
   */
  async clickQuickCreateVmButton() {
    await this._quickCreateVmButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(this._quickCreateVmButton);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_LONG);
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
  /**
   * Clicks on a template card by its metadataName (data-test).
   *
   * @param templateMetadataName - The template metadataName (data-test attribute)
   */
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

  /**
   * Clicks the User provided tab to show user templates.
   */
  async clickUserProvidedTab() {
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
  /**
   * Clicks the "User provided" tab to show user templates.
   */
  async clickUserTemplatesTab() {
    const userTemplatesTab = this.locator('#filter-templateScope-user, #user-templates');
    await userTemplatesTab.first().waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(userTemplatesTab.first());
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }
  /**
   * Clicks the "View all projects" button in the empty namespace state.
   * This button calls clearAll internally, which was the trigger for CNV-85594.
   */
  async clickViewAllProjectsButton(): Promise<void> {
    const viewAllButton = this.locator('button', { hasText: 'View all projects' });
    await viewAllButton.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(viewAllButton);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  /**
   * Enables TLS certificate requirement and configures TLS source.
   * Must be called after selectDiskSource('URL', ...) when the URL fields are visible.
   *
   * @param config - TLS certificate configuration
   */
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

  /**
   * Verifies that a template card exists in the catalog grid.
   *
   * @param templateName - The template display name to look for
   * @returns The count of matching template cards
   */
  async countTemplateCards(templateName: string): Promise<number> {
    // CNV 4.99+: try metadata name lookup first
    const metadataName = CreateVmTemplateCatalogComponent._displayNameToMetadataName[templateName];
    if (metadataName) {
      const byId = this._vmCatalogGrid.getByTestId(metadataName);
      const countById = await byId.count();
      if (countById > 0) return countById;
    }
    const wizardCards = this._vmCatalogGrid.locator('[data-test]', { hasText: templateName });
    const wizardCount = await wizardCards.count();
    if (wizardCount > 0) return wizardCount;
    return this._vmCatalogGrid
      .locator('.vm-catalog-grid-tile .catalog-tile-pf-title', { hasText: templateName })
      .count();
  }

  /**
   * Fills the VM name in the Review and Create form.
   * Uses the template catalog VM name input which is used in both quick create and customize flows.
   *
   * @param vmName - The VM name
   */
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

  /**
   * Fills the VM name input field in the template catalog form.
   *
   * @param vmName - The name to set for the VM
   */
  async fillTemplateCatalogVmName(vmName: string) {
    await this._templateCatalogVmNameInput.waitFor({
      state: 'visible',
      timeout: TestTimeouts.RESOURCE_CREATION,
    });
    await this._templateCatalogVmNameInput.clear();
    await this._templateCatalogVmNameInput.fill(vmName);
    await this._templateCatalogVmNameInput.press('Tab');
  }

  /**
   * Filters catalog templates by boot source availability.
   *
   * @param check - Whether to check or uncheck the filter (default: true)
   */
  async filterByBootSourceAvailable(check = true) {
    const isWizardMode = await this._filterDropdownButton
      .isVisible({ timeout: 2000 })
      .catch(() => false);

    if (isWizardMode) {
      await this._toggleWizardFilter('only-available', check);
    } else {
      // CNV 4.99+: boot source filter removed from the catalog UI — skip gracefully
      const bootSourceFilter = this.testId('boot-source-available-Boot source available').locator(
        'input[type="checkbox"]',
      );
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

  /**
   * Filters catalog templates by OS name (RHEL, Windows, Fedora, CentOS).
   *
   * @param osName - The OS name to filter by ('RHEL', 'Windows', 'Fedora', 'CentOS')
   * @param check - Whether to check or uncheck the filter (default: true)
   */
  async filterByOSName(osName: 'RHEL' | 'Windows' | 'Fedora' | 'CentOS', check = true) {
    const wizardFilterKey = osName.toLowerCase();
    const isWizardMode = await this._filterDropdownButton
      .isVisible({ timeout: 2000 })
      .catch(() => false);

    if (isWizardMode) {
      await this._toggleWizardFilter(wizardFilterKey, check);
    } else {
      // CNV 4.99+: filter inputs are directly accessible by ID
      // Older builds: filter inputs are inside [data-test="osName-*"] containers
      const osFilterById = this.locator(`input#filter-osName-${wizardFilterKey}`);
      const osFilterLegacy = this.testId(`osName-${osName}`).locator('input[type="checkbox"]');
      const osFilter = osFilterById.or(osFilterLegacy);
      await osFilter
        .first()
        .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      if (check) {
        await osFilter.first().check({ force: true });
      } else {
        await osFilter.first().uncheck({ force: true });
      }
      await this.page.waitForTimeout(TestTimeouts.UI_FILTER_APPLY / 3);
    }
    await this._vmCatalogGrid
      .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
      .catch(() => {
        return;
      });
  }

  /**
   * Filters catalog templates by provider (Red Hat or Other).
   * Uses input#filter-provider-{provider} checkboxes (CNV 4.99+).
   *
   * @param provider - 'Red Hat' or 'Other'
   * @param check - Whether to check or uncheck the filter (default: true)
   */
  async filterByProvider(provider: 'Red Hat' | 'Other', check = true) {
    // Use attribute selector because "Red Hat" contains a space, making #filter-provider-Red Hat invalid CSS
    const filterInput = this.locator(`input[id="filter-provider-${provider}"]`);
    await filterInput.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    if (check) {
      await filterInput.check({ force: true });
    } else {
      await filterInput.uncheck({ force: true });
    }
    await this._vmCatalogGrid
      .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
      .catch(() => {
        return;
      });
    await this.page.waitForTimeout(TestTimeouts.UI_FILTER_APPLY / 3);
  }

  /**
   * Filters catalog templates by workload (Desktop, Server).
   *
   * @param workload - The workload to filter by ('Desktop' or 'Server')
   * @param check - Whether to check or uncheck the filter (default: true)
   */
  async filterByWorkload(workload: 'Desktop' | 'Server', check = true) {
    const isWizardMode = await this._filterDropdownButton
      .isVisible({ timeout: 2000 })
      .catch(() => false);

    if (isWizardMode) {
      await this._toggleWizardFilter(workload.toLowerCase(), check);
    } else {
      // CNV 4.99+: workload filter removed from the catalog UI — skip gracefully
      const workloadFilter = this.testId(`workload-${workload}`).locator('input[type="checkbox"]');
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

  /**
   * Checks whether the TLS certificate required checkbox is visible.
   * Useful for asserting TLS controls appear only with URL disk source.
   */
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

  /**
   * Returns whether the TLS certificate required checkbox is checked.
   */
  async isTlsCertificateChecked(): Promise<boolean> {
    return await this._tlsCertRequiredCheckbox.isChecked().catch(() => false);
  }

  /**
   * Navigates to the template catalog via the VM list Create dropdown (same as {@link navigateToTemplateCatalogViaVmList}).
   */
  async navigateToCatalogViaUI(): Promise<void> {
    await this.navigateToTemplateCatalogViaVmList();
  }

  /**
   * @deprecated Use {@link navigateToWizardTemplateCatalog} instead.
   * On 4.22+ the catalog is no longer a standalone linked page — VM creation
   * goes through /vm-wizard. This method still navigates directly to the URL
   * (which renders the new wizard) but callers should migrate to the wizard flow.
   */
  async navigateToNamespaceCatalogViaUI(namespace?: string): Promise<void> {
    await this.navigateToTemplateCatalogViaVmList(namespace);
  }

  async navigateToProjectCatalog(projectName: string) {
    await this.goTo(`/k8s/ns/${projectName}/catalog`);
  }

  /**
   * Navigate to the template catalog page.
   * CNV-82506 removed the "From template" dropdown item; navigate directly.
   * @deprecated Use {@link navigateToWizardTemplateCatalog} for the current wizard flow.
   */
  async navigateToTemplateCatalogViaVmList(namespace?: string): Promise<void> {
    const ns = namespace || 'default';
    await this.goTo(`/k8s/ns/${ns}/catalog`);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async searchTemplate(templateName: string) {
    await this._searchCatalogInput.clear();
    await this._searchCatalogInput.fill(templateName);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  /**
   * Selects boot source for CD boot.
   *
   * @param bootSource - The boot source type ('ISO', 'Registry', 'URL', 'PVC', 'Upload')
   * @param value - Optional value for the boot source
   */
  async selectBootSource(
    _bootSource: 'ISO' | 'Registry' | 'URL' | 'PVC' | 'Upload',
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

  /**
   * Selects disk source in the Review and Create form.
   *
   * @param diskSource - The disk source type ('URL', 'Registry', 'PVC', 'Upload')
   * @param value - Optional value for the disk source (e.g., URL string, registry path)
   * @param username - Optional username for registry (if diskSource is 'Registry')
   * @param password - Optional password for registry (if diskSource is 'Registry')
   */
  async selectDiskSource(
    diskSource: 'URL' | 'Registry' | 'PVC' | 'Upload',
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
        await this.robustClick(this.testId('http'));
        if (value) {
          await this._diskSourceURLInput.waitFor({
            state: 'visible',
            timeout: TestTimeouts.UI_ACTION_COMPLETE,
          });
          await this._diskSourceURLInput.fill(value);
        }
        break;
      case 'Registry':
        await this.robustClick(this.testId('registry'));
        if (value) {
          await this._diskSourceRegistryInput.waitFor({
            state: 'visible',
            timeout: TestTimeouts.UI_ACTION_COMPLETE,
          });
          await this._diskSourceRegistryInput.fill(value);
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

  /**
   * Selects a folder for template VM creation (quick create form).
   *
   * @param folderName - The folder name to create/select
   */
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

  /**
   * Selects a namespace from the catalog project dropdown by opening the dropdown,
   * searching in the #select-inline-filter input, and clicking the option with
   * data-test equal to the namespace name.
   *
   * @param namespace - The namespace name to select (e.g. pw-bv-form-catalog-123)
   */
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

    const namespaceOption = this.testId(namespace).first();
    await namespaceOption.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(namespaceOption);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  /**
   * Selects a project from the templates catalog project dropdown.
   *
   * @param projectName - The project name to select
   */
  async selectProjectFromCatalog(projectName: string) {
    // Wizard uses a full-width menu toggle with "All projects" text; old catalog uses .templates-catalog-project-dropdown
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

  /**
   * Sets the Windows drivers checkbox.
   *
   * @param mount - Whether to mount Windows drivers (default: true)
   */
  async setWindowsDrivers(mount = true) {
    const isChecked = await this._windowsDriversCheckbox.isChecked().catch(() => false);
    if (mount && !isChecked) {
      await this._windowsDriversCheckbox.check({ force: true });
    } else if (!mount && isChecked) {
      await this._windowsDriversCheckbox.uncheck({ force: true });
    }
  }

  /**
   * Switches between grid and list view in the catalog.
   *
   * @param view - The view to switch to ('grid' or 'list')
   */
  async switchView(view: 'grid' | 'list') {
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

  /**
   * Filters catalog templates by architecture.
   * This verifies that the architecture filter category exists.
   * Uses retry logic for resilience in CI environments.
   *
   * @returns True if the architecture filter category is visible and has checkboxes
   */
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

        const hasCheckboxes = await this.waitForChildElements(
          this._architectureFilter,
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

  /**
   * Verifies that a template card is visible in the catalog grid.
   *
   * @param templateName - The template display name to look for
   * @returns True if all matching template cards are visible
   */
  async verifyTemplateCardVisible(templateName: string): Promise<boolean> {
    try {
      await this._vmCatalogGrid.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });

      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

      const hasAnyCards = await this._vmCatalogGrid
        .locator('[data-test], .vm-catalog-grid-tile')
        .first()
        .isVisible({ timeout: TestTimeouts.UI_ACTION_COMPLETE })
        .catch(() => false);

      if (!hasAnyCards) {
        await this.page.waitForTimeout(TestTimeouts.UI_FILTER_APPLY / 3);
      }

      // CNV 4.99+: cards use data-test (metadata name), not display name in text.
      // Try metadata name lookup first, then fall back to text-based match.
      const metadataName =
        CreateVmTemplateCatalogComponent._displayNameToMetadataName[templateName];

      let cardLocator;
      if (metadataName) {
        const byMetadataId = this._vmCatalogGrid.getByTestId(metadataName);
        const wizardCard = this._vmCatalogGrid.locator('[data-test]', {
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
        const wizardCard = this._vmCatalogGrid.locator('[data-test]', {
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
      const visibilityChecks = await Promise.all(locators.map((locator) => locator.isVisible()));
      return visibilityChecks.every((isVisible) => isVisible);
    } catch {
      return false;
    }
  }

  /**
   * Verifies that a template is visible in list view by finding a span with the expected name.
   *
   * @param templateName - The template display name to look for
   * @returns True if the template is visible in list view
   */
  async verifyTemplateVisibleInListView(templateName: string): Promise<boolean> {
    try {
      const container = this.locator('.vm-catalog-table-container');
      // In the wizard, the display name is in a <small> element; in old catalog it's in a <span>
      const nameCell = container.locator('small, span', { hasText: templateName });
      const nameVisible = await nameCell
        .first()
        .isVisible({ timeout: 3000 })
        .catch(() => false);
      if (nameVisible) return true;

      // CNV 4.99+: display name is no longer used; try metadata name as data-test
      const metadataName =
        CreateVmTemplateCatalogComponent._displayNameToMetadataName[templateName];
      if (metadataName) {
        const byMetadataId = container.getByTestId(metadataName);
        await byMetadataId.first().waitFor({
          state: 'visible',
          timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
        });
        return true;
      }
      // fall back to waiting for text-based match
      await nameCell.first().waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Verifies the Windows drivers checkbox state.
   * Matches Cypress: cy.get(winDrivers).should('not.be.checked') or cy.get(winDrivers).should('be.checked')
   *
   * @param shouldBeChecked - Whether the checkbox should be checked (true) or unchecked (false)
   * @returns True if the checkbox state matches the expected state, false otherwise
   */
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
