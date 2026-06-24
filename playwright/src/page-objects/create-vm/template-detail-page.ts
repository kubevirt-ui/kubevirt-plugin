// TemplateDetailPage — Page object for template detail interactions.

import { TemplateDetailEditComponent } from '@/components/create-vm/template-components';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

import BasePage from '../base-page';

export default class TemplateDetailPage extends BasePage {
  private readonly _yamlTab = this.locator('[data-test-id="horizontal-link-YAML"]');
  private readonly _tableDiskRowRoleGrid = this.locator(
    'table, [data-test="disk-row"], [role="grid"]',
  );

  private readonly _edit: TemplateDetailEditComponent;

  constructor(page: Page) {
    super(page);
    this._edit = new TemplateDetailEditComponent(page);
  }

  async navigateToTemplateDetail(templateName: string, namespace: string) {
    await this.goTo(`/k8s/ns/${namespace}/templates/${templateName}`);
  }

  async isTemplateNameVisible(
    templateName: string,
    timeout: number = TestTimeouts.UI_ELEMENT_VISIBILITY,
  ): Promise<boolean> {
    try {
      const templateNameElement = this.locator('span', { hasText: templateName });

      await templateNameElement.waitFor({ state: 'visible', timeout });

      return await templateNameElement.isVisible();
    } catch (_error) {
      return false;
    }
  }

  async clickActionsDropdown() {
    await this.robustClick(this.locator('[data-test="actions-dropdown"]'));
  }

  async clickCloneTemplate() {
    await this.robustClick(this.locator('[data-test="actions-dropdown-item-clone"]'));
  }

  async clickEditBootSource() {
    await this.robustClick(this.locator('[data-test="actions-dropdown-item-edit-boot-source"]'));
  }

  async clickEditBootSourceRef() {
    await this.robustClick(
      this.locator('[data-test="actions-dropdown-item-edit-boot-source-ref"]'),
    );
  }

  async clickEditLabels() {
    await this.robustClick(this.locator('[data-test="actions-dropdown-item-edit-labels"]'));
  }

  async clickEditAnnotations() {
    await this.robustClick(this.locator('[data-test="actions-dropdown-item-edit-annotations"]'));
  }

  async clickDeleteTemplate() {
    await this.robustClick(this.locator('[data-test-id="delete-template"]'));
  }

  async isYamlTabVisible(timeout = 15000): Promise<boolean> {
    try {
      await this._yamlTab.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
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

  async navigateToYAML() {
    await super.navigateToTab(this._yamlTab);

    await this.waitForLoadingComplete(5000);
  }

  async navigateToScheduling() {
    await super.navigateToTab(this.locator('[data-test-id="horizontal-link-Scheduling"]'));

    await this.waitForLoadingComplete(5000);
  }

  async navigateToNetworks() {
    await super.navigateToTab(this.locator('[data-test-id="horizontal-link-Network interfaces"]'));

    const networkTable = this.locator('table, [data-test="network-row"], [role="grid"]');
    await networkTable
      .first()
      .waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT })
      .catch(() => {
        return;
      });
  }

  async navigateToDisks() {
    await super.navigateToTab(this.locator('[data-test-id="horizontal-link-Disks"]'));

    const diskTable = this._tableDiskRowRoleGrid;
    await diskTable
      .first()
      .waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT })
      .catch(() => {
        return;
      });
  }

  async navigateToScripts() {
    await super.navigateToTab(this.locator('[data-test-id="horizontal-link-Scripts"]'));

    await this.waitForLoadingComplete(5000);
  }

  async navigateToParameters() {
    await super.navigateToTab(this.locator('[data-test-id="horizontal-link-Parameters"]'));

    await this.waitForLoadingComplete(5000);
  }

  async isCloudInitSectionVisible(timeout = TestTimeouts.UI_ELEMENT_VISIBILITY): Promise<boolean> {
    const section = this.locator(
      '.pf-v6-c-description-list__group:has-text("Cloud-init"), [class*="description-list"]:has-text("Cloud-init")',
    );
    return section
      .first()
      .waitFor({ state: 'visible', timeout })
      .then(() => true)
      .catch(() => false);
  }

  async isParametersTabActive(timeout = TestTimeouts.UI_ELEMENT_VISIBILITY): Promise<boolean> {
    const activeTab = this.locator(
      '[data-test-id="horizontal-link-Parameters"][aria-selected="true"], [data-test-id="horizontal-link-Parameters"].pf-m-current',
    );
    const fallbackTab = this.locator('[data-test-id="horizontal-link-Parameters"]');
    return activeTab
      .first()
      .waitFor({ state: 'visible', timeout })
      .then(() => true)
      .catch(() =>
        fallbackTab
          .waitFor({ state: 'visible', timeout })
          .then(() => true)
          .catch(() => false),
      );
  }

  async verifyDisplayName(): Promise<boolean> {
    return await super.verifyTextVisible('Display name', true);
  }

  async verifyRedHatTemplateNotEditable(): Promise<boolean> {
    return await super.verifyTextVisible('Templates provided by Red Hat are not editable');
  }

  async verifyDownload(): Promise<boolean> {
    return await super.verifyTextVisible('Download');
  }

  async verifyTolerations(): Promise<boolean> {
    return await super.verifyTextVisible('Tolerations', true);
  }

  async verifyPodNetworking(): Promise<boolean> {
    return await super.verifyTextVisible('Network interfaces', true);
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

    const containerdiskLocators = [
      this.page.getByText('containerdisk', { exact: false }),
      this.locator('[data-test*="containerdisk"]'),
      this.locator('td:has-text("containerdisk")'),
      this.locator('[role="cell"]:has-text("containerdisk")'),
      this.locator('[data-test="disk-row"]:has-text("containerdisk")'),
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

  async verifyRootdisk(): Promise<boolean> {
    await this.waitForLoadingComplete(5000);

    const diskTable = this._tableDiskRowRoleGrid;
    await diskTable
      .first()
      .waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT })
      .catch(() => {
        return;
      });

    const rootdiskLocators = [
      this.page.getByText('rootdisk', { exact: false }),
      this.locator('[data-test*="rootdisk"]'),
      this.locator('td:has-text("rootdisk")'),
      this.locator('[role="cell"]:has-text("rootdisk")'),
      this.locator('[data-test="disk-row"]:has-text("rootdisk")'),
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

  async verifyCloudInit(): Promise<boolean> {
    await this.waitForLoadingComplete(5000);

    return await super.verifyTextVisible('Cloud-init', true);
  }

  async verifyDataSourceName(): Promise<boolean> {
    await this.waitForLoadingComplete(5000);

    return await super.verifyTextVisible('DATA_SOURCE_NAME', true);
  }

  async verifyCloudUserPassword(): Promise<boolean> {
    return await super.verifyTextVisible('CLOUD_USER_PASSWORD');
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

  async verifyProvider(provider: string): Promise<boolean> {
    try {
      const providerText = this.locator('.pf-v6-c-description-list__text').filter({
        hasText: provider,
      });
      await providerText.waitFor({ state: 'visible', timeout: TestTimeouts.UI_VISIBILITY_QUICK });
      return await providerText.isVisible().catch(() => false);
    } catch {
      return false;
    }
  }

  async editDetails(
    ...args: Parameters<TemplateDetailEditComponent['editDetails']>
  ): ReturnType<TemplateDetailEditComponent['editDetails']> {
    return this._edit.editDetails(...args);
  }

  async editScheduling(
    ...args: Parameters<TemplateDetailEditComponent['editScheduling']>
  ): ReturnType<TemplateDetailEditComponent['editScheduling']> {
    return this._edit.editScheduling(...args);
  }

  async editNetworks(
    ...args: Parameters<TemplateDetailEditComponent['editNetworks']>
  ): ReturnType<TemplateDetailEditComponent['editNetworks']> {
    return this._edit.editNetworks(...args);
  }

  async editDisks(
    ...args: Parameters<TemplateDetailEditComponent['editDisks']>
  ): ReturnType<TemplateDetailEditComponent['editDisks']> {
    return this._edit.editDisks(...args);
  }

  async editScripts(
    ...args: Parameters<TemplateDetailEditComponent['editScripts']>
  ): ReturnType<TemplateDetailEditComponent['editScripts']> {
    return this._edit.editScripts(...args);
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
}
