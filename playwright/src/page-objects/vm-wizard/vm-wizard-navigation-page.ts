// VmWizardNavigationPage — Page object for vm wizard navigation interactions.

import {
  VmCreationWizardCloneComponent,
  VmCreationWizardTemplateCatalogComponent,
} from '@/components/vm-wizard/wizard-navigation-components';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

import PageCommons from '../page-commons';

export default class VmWizardNavigationPage extends PageCommons {
  readonly cloneSource: VmCreationWizardCloneComponent;
  readonly templateCatalog: VmCreationWizardTemplateCatalogComponent;

  private readonly _buttonEditVMCreationLocation = this.locator(
    'button[aria-label="Edit VM creation location"]',
  );
  private readonly _pfV6CWizardButtonpfV6CButtonpfMPrimary = this.locator(
    '.pf-v6-c-wizard button.pf-v6-c-button.pf-m-primary',
  );

  private readonly _wizardContainer = this.locator('.pf-v6-c-wizard.vm-creation-wizard');

  private readonly _newVmRadio = this.locator(
    '.vm-creation-method-tile:has(#instance-type-radio-button), #instance-type',
  );
  private readonly _fromTemplateRadio = this.locator(
    '.vm-creation-method-tile:has(#template-radio-button), #template',
  );
  private readonly _cloneVmRadio = this.locator(
    '.vm-creation-method-tile:has(#clone-radio-button), #clone',
  );

  private readonly _vmNameInput = this.locator('.vm-creation-wizard #vm-name');
  private readonly _generateVmNameButton = this.locator(
    '.vm-creation-wizard [data-test="generate-vm-name-button"]',
  );

  private readonly _rhelTile = this.locator('.operating-system-tile:has-text("RHEL")');
  private readonly _windowsTile = this.locator(
    '.operating-system-tile:has-text("Microsoft Windows")',
  );
  private readonly _otherLinuxTile = this.locator('.operating-system-tile:has-text("Other Linux")');

  constructor(page: Page) {
    super(page);
    this.cloneSource = new VmCreationWizardCloneComponent(page);
    this.templateCatalog = new VmCreationWizardTemplateCatalogComponent(page);
  }

  async navigateToWizardInNamespace(_namespace: string): Promise<void> {
    await this.page.goto('/vm-wizard');
    await this._wizardContainer.first().waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
  }

  async openWizardFromCreateDropdown(): Promise<void> {
    const createButton = this.locator(
      'button[aria-label="Create VirtualMachine"], [data-test="item-create"].pf-m-primary, .pf-m-primary > [data-test="item-create"], [data-test="vms-treeview"] [data-test="item-create"]',
    ).first();
    await createButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(createButton);
    await this._wizardContainer.first().waitFor({
      state: 'visible',
      timeout: TestTimeouts.DEFAULT,
    });
    await this.collapsePageSidebarIfExpanded();
  }

  private async collapsePageSidebarIfExpanded(): Promise<void> {
    const sidebar = this.page.locator('#page-sidebar.pf-m-expanded');
    const isExpanded = await sidebar.isVisible({ timeout: 2000 }).catch(() => false);
    if (isExpanded) {
      const toggle = this.page.locator('button[aria-label="Side navigation toggle"]');
      await toggle.click({ timeout: 3000 }).catch(() => {
        // fallback: hide via DOM
        sidebar.evaluate((el) => (el.style.display = 'none')).catch(() => {});
      });
      await this.page.waitForTimeout(500);
    }
  }

  async verifyWizardVisible(): Promise<boolean> {
    try {
      await this._wizardContainer.first().waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      return true;
    } catch {
      return false;
    }
  }

  async verifyWizardClosed(): Promise<boolean> {
    try {
      await this._wizardContainer.first().waitFor({
        state: 'hidden',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      return true;
    } catch {
      return false;
    }
  }

  async verifyCreationMethodTilesVisible(): Promise<boolean> {
    try {
      const newVmVisible = await this._newVmRadio
        .first()
        .isVisible({ timeout: TestTimeouts.SHORT_WAIT })
        .catch(() => false);
      const templateVisible = await this._fromTemplateRadio
        .first()
        .isVisible({ timeout: TestTimeouts.SHORT_WAIT })
        .catch(() => false);
      const cloneVisible = await this._cloneVmRadio
        .first()
        .isVisible({ timeout: TestTimeouts.SHORT_WAIT })
        .catch(() => false);
      return newVmVisible && templateVisible && cloneVisible;
    } catch {
      return false;
    }
  }

  async selectCreationMethod(method: 'cloneVm' | 'fromTemplate' | 'newVm'): Promise<void> {
    const radioMap = {
      newVm: this._newVmRadio,
      fromTemplate: this._fromTemplateRadio,
      cloneVm: this._cloneVmRadio,
    };
    await this.robustClick(radioMap[method].first());
  }

  async generateVmName(): Promise<void> {
    await this._generateVmNameButton.first().waitFor({
      state: 'visible',
      timeout: TestTimeouts.SHORT_WAIT,
    });
    await this.robustClick(this._generateVmNameButton.first());
    await this.page.waitForTimeout(500);
  }

  async fillVmName(name: string): Promise<void> {
    await this._vmNameInput.first().waitFor({
      state: 'visible',
      timeout: TestTimeouts.SHORT_WAIT,
    });
    await this._vmNameInput.first().fill(name);
  }

  async ensureVmNameFilled(): Promise<void> {
    const isVisible = await this._vmNameInput
      .first()
      .isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM })
      .catch(() => false);
    if (!isVisible) return;
    const value = await this._vmNameInput
      .first()
      .inputValue()
      .catch(() => '');
    if (value.trim().length === 0) {
      await this.generateVmName();
    }
  }

  async verifyCreationMethodCardSelected(
    method: 'cloneVm' | 'fromTemplate' | 'newVm',
  ): Promise<boolean> {
    const idMap = {
      newVm: 'instance-type',
      fromTemplate: 'template',
      cloneVm: 'clone',
    };
    // 4.22: cards use .vm-creation-method-tile with pf-m-selected; older builds use #id.pf-m-selectable
    const card = this.locator(
      `.vm-creation-method-tile:has(#${idMap[method]}-radio-button), #${idMap[method]}.pf-m-selectable`,
    );
    try {
      await card.first().waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
      return await card
        .first()
        .evaluate(
          (el) => el.classList.contains('pf-m-current') || el.classList.contains('pf-m-selected'),
        );
    } catch {
      return false;
    }
  }

  async verifyOsTilesVisible(): Promise<boolean> {
    try {
      const rhelVisible = await this._rhelTile
        .first()
        .isVisible({ timeout: TestTimeouts.SHORT_WAIT })
        .catch(() => false);
      const windowsVisible = await this._windowsTile
        .first()
        .isVisible({ timeout: TestTimeouts.SHORT_WAIT })
        .catch(() => false);
      const otherLinuxVisible = await this._otherLinuxTile
        .first()
        .isVisible({ timeout: TestTimeouts.SHORT_WAIT })
        .catch(() => false);
      return rhelVisible && windowsVisible && otherLinuxVisible;
    } catch {
      return false;
    }
  }

  async selectOperatingSystem(os: 'otherLinux' | 'rhel' | 'windows'): Promise<void> {
    const osMap = {
      rhel: this._rhelTile,
      windows: this._windowsTile,
      otherLinux: this._otherLinuxTile,
    };
    await this.robustClick(osMap[os].first());
  }

  async selectOsType(osType: string): Promise<void> {
    const formGroup = this.locator('.pf-v6-c-form__group').filter({
      hasText: /guest operating system type/i,
    });
    const dropdown = formGroup.locator('.pf-v6-c-menu-toggle');
    await this.robustClick(dropdown.first());
    await this.page.waitForTimeout(500);

    const preferredOption = this.locator(`[role="option"]:has-text("${osType}")`).first();
    if (
      await preferredOption.isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM }).catch(() => false)
    ) {
      await this.robustClick(preferredOption);
    } else {
      const firstOption = this.locator('[role="option"]').first();
      await this.robustClick(firstOption);
    }
  }

  async verifyOsTypeDropdownVisible(): Promise<boolean> {
    try {
      const formGroup = this.locator('.pf-v6-c-form__group').filter({
        hasText: /guest operating system type/i,
      });
      return await formGroup
        .locator('.pf-v6-c-menu-toggle')
        .first()
        .isVisible({ timeout: TestTimeouts.SHORT_WAIT })
        .catch(() => false);
    } catch {
      return false;
    }
  }

  async verifyStepActive(stepId: string): Promise<boolean> {
    try {
      const step = this.locator(`#${stepId}`);
      const isCurrent = await step.getAttribute('aria-current');
      return isCurrent === 'step';
    } catch {
      return false;
    }
  }

  async verifyLocationSectionVisible(): Promise<boolean> {
    try {
      const heading = this.locator('.pf-v6-c-wizard h1:has-text("Location")');
      await heading.waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
      return true;
    } catch {
      return false;
    }
  }

  async getLocationProject(): Promise<string> {
    try {
      const projectText = this.locator('.pf-v6-c-wizard').getByText('Project').first();
      const container = projectText.locator('..');
      const text = await container.textContent({ timeout: TestTimeouts.SHORT_WAIT });
      const match = text?.match(/Project\s*(.+?)(?:>|$)/);
      return match?.[1]?.trim() || '';
    } catch {
      return '';
    }
  }

  async verifyNoHeaderProjectSelector(): Promise<boolean> {
    const headerSelector = this.locator('[data-test-id="namespace-bar-dropdown"]');
    try {
      await headerSelector.waitFor({ state: 'visible', timeout: 3000 });
      return false;
    } catch {
      return true;
    }
  }

  async verifyWizardCloseButtonHidden(): Promise<boolean> {
    const closeBtn = this.locator('.pf-v6-c-wizard__close');
    try {
      await closeBtn.waitFor({ state: 'visible', timeout: 3000 });
      return false;
    } catch {
      return true;
    }
  }

  async verifyEditLocationButtonVisible(): Promise<boolean> {
    try {
      const editBtn = this._buttonEditVMCreationLocation;
      return await editBtn.isVisible({ timeout: TestTimeouts.SHORT_WAIT }).catch(() => false);
    } catch {
      return false;
    }
  }

  async verifyTemplateCatalogStepVisible(): Promise<boolean> {
    return this.templateCatalog.verifyTemplateCatalogStepVisible();
  }

  async getTemplateCatalogCount(): Promise<number> {
    return this.templateCatalog.getTemplateCatalogCount();
  }

  async verifyTemplateCatalogToolbar(): Promise<{
    filterInput: boolean;
    gridToggle: boolean;
    listToggle: boolean;
    projectDropdown: boolean;
  }> {
    return this.templateCatalog.verifyTemplateCatalogToolbar();
  }

  async selectTemplateByTestId(templateTestId: string): Promise<void> {
    return this.templateCatalog.selectTemplateByTestId(templateTestId);
  }

  async getSelectedTemplateCardTitle(templateTestId: string): Promise<string> {
    return this.templateCatalog.getSelectedTemplateCardTitle(templateTestId);
  }

  async getTemplateCardFields(templateTestId: string): Promise<string[]> {
    return this.templateCatalog.getTemplateCardFields(templateTestId);
  }

  async verifyTemplateDrawerVisible(): Promise<boolean> {
    return this.templateCatalog.verifyTemplateDrawerVisible();
  }

  async getTemplateDrawerTitle(): Promise<string> {
    return this.templateCatalog.getTemplateDrawerTitle();
  }

  async getTemplateDrawerFields(): Promise<string[]> {
    return this.templateCatalog.getTemplateDrawerFields();
  }

  async closeTemplateDrawer(): Promise<void> {
    return this.templateCatalog.closeTemplateDrawer();
  }

  async filterTemplateCatalog(keyword: string): Promise<void> {
    return this.templateCatalog.filterTemplateCatalog(keyword);
  }

  async enableUserTemplatesFilter(): Promise<void> {
    return this.templateCatalog.enableUserTemplatesFilter();
  }

  async toggleTemplateCatalogView(view: 'grid' | 'list'): Promise<void> {
    return this.templateCatalog.toggleTemplateCatalogView(view);
  }

  async selectTemplateCatalogProject(projectName: string): Promise<void> {
    return this.templateCatalog.selectTemplateCatalogProject(projectName);
  }

  async clickViewAllProjectsInCatalog(): Promise<void> {
    return this.templateCatalog.clickViewAllProjectsInCatalog();
  }

  async verifyEmptyProjectStateInCatalog(): Promise<boolean> {
    return this.templateCatalog.verifyEmptyProjectStateInCatalog();
  }

  async applyWorkloadFilter(workload: string): Promise<void> {
    return this.templateCatalog.applyWorkloadFilter(workload);
  }

  async clickClearAllFiltersInCatalog(): Promise<void> {
    return this.templateCatalog.clickClearAllFiltersInCatalog();
  }

  async verifyNoErrorBoundary(waitMs = 3000): Promise<boolean> {
    return this.templateCatalog.verifyNoErrorBoundary(waitMs);
  }

  async verifyTemplateCatalogHasCards(): Promise<boolean> {
    return this.templateCatalog.verifyTemplateCatalogHasCards();
  }

  async openEditLocationPanel(): Promise<void> {
    const editBtn = this._buttonEditVMCreationLocation;
    await this.robustClick(editBtn);
    await this.page.waitForTimeout(500);
  }

  async verifyEditLocationPanelFields(): Promise<{
    projectDropdown: boolean;
    folderCombobox: boolean;
  }> {
    return {
      projectDropdown: await this.locator(
        '.pf-v6-c-wizard [data-test="namespace-dropdown-menu-toggle"]',
      )
        .first()
        .isVisible({ timeout: TestTimeouts.SHORT_WAIT })
        .catch(() => false),
      folderCombobox: await this.locator(
        '.pf-v6-c-wizard input[role="combobox"][placeholder*="folder"]',
      )
        .first()
        .isVisible({ timeout: TestTimeouts.SHORT_WAIT })
        .catch(() => false),
    };
  }

  async closeEditLocationPanel(): Promise<void> {
    const editBtn = this._buttonEditVMCreationLocation;
    await this.robustClick(editBtn);
    await this.page.waitForTimeout(300);
  }

  async verifyCloneSourceStepVisible(): Promise<boolean> {
    return this.cloneSource.verifyCloneSourceStepVisible();
  }

  async verifyCloneSourceDescription(): Promise<boolean> {
    return this.cloneSource.verifyCloneSourceDescription();
  }

  async verifyCloneVmListVisible(): Promise<boolean> {
    return this.cloneSource.verifyCloneVmListVisible();
  }

  async clearCloneSourceFilters(): Promise<void> {
    return this.cloneSource.clearCloneSourceFilters();
  }

  async setCloneSourceProjectFilter(namespace: string): Promise<void> {
    return this.cloneSource.setCloneSourceProjectFilter(namespace);
  }

  async searchCloneSourceByName(name: string): Promise<void> {
    return this.cloneSource.searchCloneSourceByName(name);
  }

  async selectCloneSourceVm(vmName: string): Promise<void> {
    return this.cloneSource.selectCloneSourceVm(vmName);
  }

  async getCloneWizardStepIds(): Promise<string[]> {
    return this.cloneSource.getCloneWizardStepIds();
  }

  async clickCreateVm(): Promise<void> {
    const createBtn = this._pfV6CWizardButtonpfV6CButtonpfMPrimary;
    await createBtn.first().waitFor({
      state: 'visible',
      timeout: TestTimeouts.SHORT_WAIT,
    });

    if (await createBtn.first().isDisabled()) {
      const nameInput = this.locator('#vm\\ name');
      if ((await nameInput.count()) > 0) {
        await nameInput.press('Tab');
        await this.page.waitForTimeout(300);
      }
    }

    await this.robustClick(createBtn.first());
    await this.page.waitForTimeout(2000);
  }

  async verifyRedirectedToVmList(): Promise<boolean> {
    try {
      await this.page.waitForURL(/kubevirt\.io~v1~VirtualMachine|\/vms/, {
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      return true;
    } catch {
      return false;
    }
  }

  async verifyRedirectedToVmDetails(): Promise<boolean> {
    try {
      await this.page.waitForURL(/kubevirt\.io~v1~VirtualMachine\/[a-z0-9][a-z0-9-]*[a-z0-9]$/, {
        timeout: TestTimeouts.VM_OPERATION,
      });
      return true;
    } catch {
      return false;
    }
  }

  async acceptSuggestedVmName(): Promise<void> {
    const nameInput = this.page.locator('.pf-v6-c-wizard input[type="text"]').first();
    await nameInput.waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
    await nameInput.press('Tab');
    await new Promise((r) => setTimeout(r, 500));
  }

  async waitForVmResourceRedirect(timeout = TestTimeouts.VM_RUNNING): Promise<void> {
    await this.page.waitForURL(/kubevirt\.io~v1~VirtualMachine/, { timeout });
  }

  async getCreatedVmNameFromUrl(): Promise<string> {
    const url = this.page.url();
    const match = url.match(/kubevirt\.io~v1~VirtualMachine\/([^/?#]+)/);
    return match?.[1] || '';
  }

  async getCreatedVmNamespaceFromUrl(): Promise<string> {
    const url = this.page.url();
    const match = url.match(/\/ns\/([^/]+)\//);
    return match?.[1] || '';
  }

  async isNextButtonDisabled(): Promise<boolean> {
    const nextButton = this._pfV6CWizardButtonpfV6CButtonpfMPrimary;
    await nextButton.first().waitFor({
      state: 'visible',
      timeout: TestTimeouts.SHORT_WAIT,
    });
    return await nextButton.first().isDisabled();
  }

  override async clickNext(): Promise<void> {
    const nextButton = this._pfV6CWizardButtonpfV6CButtonpfMPrimary;
    await nextButton.first().waitFor({
      state: 'visible',
      timeout: TestTimeouts.SHORT_WAIT,
    });
    await this.robustClick(nextButton.first());
    await this.page.waitForTimeout(1000);
  }

  async clickBack(): Promise<void> {
    await this.robustClick(
      this.locator('.pf-v6-c-wizard button.pf-v6-c-button.pf-m-secondary:has-text("Back")').first(),
    );
  }

  async cancelWizard(): Promise<void> {
    await this.robustClick(
      this.locator('.pf-v6-c-wizard button.pf-v6-c-button.pf-m-link:has-text("Cancel")').first(),
    );
    await this._wizardContainer
      .first()
      .waitFor({ state: 'hidden', timeout: TestTimeouts.DEFAULT })
      .catch(() => {});
    await this.page.waitForLoadState('domcontentloaded');
  }

  async navigateToStepByName(stepName: string): Promise<void> {
    const toggle = this.locator('button:has-text("Wizard toggle")');
    await this.robustClick(toggle.first());
    const stepButton = this.locator(
      `nav[aria-label="Wizard steps"] button:has-text("${stepName}")`,
    );
    await this.robustClick(stepButton.first());
  }
}
