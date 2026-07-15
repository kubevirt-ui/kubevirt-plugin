import BaseComponent from '@/components/shared/base-component';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

export default class VmWizardNavigationComponent extends BaseComponent {
  private readonly _buttonEditVMCreationLocation = this.locator(
    'button[aria-label="Edit VM creation location"]',
  );
  private readonly _cloneVmRadio = this.locator(
    '.vm-creation-method-tile:has(#clone-radio-button), #clone',
  );
  private readonly _fromTemplateRadio = this.locator(
    '.vm-creation-method-tile:has(#template-radio-button), #template',
  );
  private readonly _generateVmNameButton = this.locator(
    '.vm-creation-wizard [data-test="generate-vm-name-button"]',
  );
  private readonly _newVmRadio = this.locator(
    '.vm-creation-method-tile:has(#instance-type-radio-button), #instance-type',
  );
  private readonly _otherLinuxTile = this.locator('.operating-system-tile:has-text("Other Linux")');

  private readonly _pfV6CMenuToggle = this.locator('.pf-v6-c-menu-toggle');

  private readonly _pfV6CWizardButtonpfV6CButtonpfMPrimary = this.locator(
    '.pf-v6-c-wizard button.pf-v6-c-button.pf-m-primary',
  );
  private readonly _pfV6CWizardMain = this.locator('.pf-v6-c-wizard__main');
  private readonly _pfV6CWizardTemplatesCatalogTile = this.locator(
    '.pf-v6-c-wizard .templates-catalog-tile',
  );

  private readonly _rhelTile = this.locator('.operating-system-tile:has-text("RHEL")');
  private readonly _vmNameInput = this.locator('.vm-creation-wizard #vm-name');

  private readonly _windowsTile = this.locator(
    '.operating-system-tile:has-text("Microsoft Windows")',
  );
  private readonly _wizardContainer = this.locator('.pf-v6-c-wizard.vm-creation-wizard');
  constructor(page: Page) {
    super(page);
  }

  private get _osTypeDropdown() {
    return this.locator('.pf-v6-c-form__group')
      .filter({ has: this.page.locator('label:has-text("Guest operating system type")') })
      .locator('.pf-v6-c-menu-toggle');
  }

  async applyWorkloadFilter(workload: string): Promise<void> {
    const filterBtn = this.page.getByRole('button', { name: 'Filter', exact: true });
    await this.robustClick(filterBtn);
    await this.page.waitForTimeout(300);

    const workloadItem = this.page.locator(
      `.pf-v6-c-menu__list .pf-v6-c-menu__item-text:text-is("${workload}")`,
    );
    await workloadItem.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await workloadItem.click();
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async cancelWizard(): Promise<void> {
    await this.robustClick(
      this.locator('.pf-v6-c-wizard button.pf-v6-c-button.pf-m-link:has-text("Cancel")').first(),
    );
  }

  async clearCloneSourceFilters(): Promise<void> {
    const wizard = this._pfV6CWizardMain;
    const chipCloseButtons = wizard.locator(
      '.pf-v6-c-label .pf-v6-c-label__actions button, .pf-v6-c-chip button',
    );
    const count = await chipCloseButtons.count();
    for (let i = count - 1; i >= 0; i--) {
      await chipCloseButtons.nth(i).click();
      await this.page.waitForTimeout(300);
    }
    if (count > 0) {
      await this.page.waitForTimeout(1000);
    }
  }

  async clickBack(): Promise<void> {
    await this.robustClick(
      this.locator('.pf-v6-c-wizard button.pf-v6-c-button.pf-m-secondary:has-text("Back")').first(),
    );
  }

  async clickClearAllFiltersInCatalog(): Promise<void> {
    const clearLink = this._pfV6CWizardMain.locator('button', {
      hasText: 'Clear all filters',
    });
    await clearLink.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(clearLink);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async clickCreateVm(): Promise<void> {
    await this.collapseSidebarIfExpanded();
    const createBtn = this._pfV6CWizardButtonpfV6CButtonpfMPrimary;
    await createBtn.first().waitFor({
      state: 'visible',
      timeout: TestTimeouts.SHORT_WAIT,
    });

    if (await createBtn.first().isDisabled()) {
      const nameInput = this._vmNameInput.first();
      if ((await nameInput.count()) > 0) {
        await nameInput.press('Tab');
        await this.page.waitForTimeout(300);
      }
    }

    await this.robustClick(createBtn.first());
    await this.page.waitForTimeout(2000);
  }

  async clickNext(): Promise<void> {
    await this.collapseSidebarIfExpanded();
    const nextButton = this._pfV6CWizardButtonpfV6CButtonpfMPrimary;
    await nextButton.first().waitFor({
      state: 'visible',
      timeout: TestTimeouts.SHORT_WAIT,
    });
    await this.robustClick(nextButton.first());
    await this.page.waitForTimeout(1000);
  }

  async clickViewAllProjectsInCatalog(): Promise<void> {
    const viewAllBtn = this._pfV6CWizardMain.locator('button', {
      hasText: 'View all projects',
    });
    await viewAllBtn.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(viewAllBtn);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async closeEditLocationPanel(): Promise<void> {
    const editBtn = this._buttonEditVMCreationLocation;
    await this.robustClick(editBtn);
    await this.page.waitForTimeout(300);
  }

  async closeTemplateDrawer(): Promise<void> {
    const closeBtn = this.locator(
      '.pf-v6-c-modal-box__close button[aria-label="Close"], button[aria-label="Close drawer panel"]',
    ).first();
    if (await closeBtn.isVisible({ timeout: TestTimeouts.SHORT_WAIT }).catch(() => false)) {
      await this.robustClick(closeBtn);
      await this.page.waitForTimeout(500);
    }
  }

  async enableUserTemplatesFilter(): Promise<void> {
    const filterBtn = this.page.getByRole('button', { name: 'Filter', exact: true });
    const userTemplatesCheckbox = this.page.locator(
      '.pf-v6-c-menu__item:has(.pf-v6-c-menu__item-text:text-is("User templates")) input[type="checkbox"]',
    );

    await this.robustClick(filterBtn);
    await filterBtn.and(this.page.locator('[aria-expanded="true"]')).waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await userTemplatesCheckbox.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });

    if (!(await userTemplatesCheckbox.isChecked())) {
      await userTemplatesCheckbox.evaluate((el) => (el as HTMLInputElement).click());
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
    }

    await this.locator('.pf-v6-c-wizard h1, .pf-v6-c-wizard__main').first().click();
    await filterBtn.and(this.page.locator('[aria-expanded="false"]')).waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
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

  async fillVmName(name: string): Promise<void> {
    await this._vmNameInput.first().waitFor({
      state: 'visible',
      timeout: TestTimeouts.SHORT_WAIT,
    });
    await this._vmNameInput.first().fill(name);
  }

  async filterTemplateCatalog(keyword: string): Promise<void> {
    const input = this.locator('.pf-v6-c-wizard__main input[placeholder*="Filter"]');
    await input.clear();
    await input.fill(keyword);
    await this.page.waitForTimeout(500);
  }

  /** Click the dice icon to auto-generate a unique VM name (required on 4.99+ before Next). */
  async generateVmName(): Promise<void> {
    await this._generateVmNameButton.first().waitFor({
      state: 'visible',
      timeout: TestTimeouts.SHORT_WAIT,
    });
    await this.robustClick(this._generateVmNameButton.first());
    await this.page.waitForTimeout(500);
  }

  async getCloneWizardStepIds(): Promise<string[]> {
    return await this.page.evaluate(() => {
      const links = document.querySelectorAll('.pf-v6-c-wizard__nav-link');
      return Array.from(links)
        .map((el) => el.closest('[id]')?.id || '')
        .filter(Boolean);
    });
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

  async getSelectedOsType(): Promise<string> {
    try {
      const text = this._osTypeDropdown.locator('.pf-v6-c-menu-toggle__text');
      return (await text.first().textContent())?.trim() ?? '';
    } catch {
      return '';
    }
  }

  async getSelectedTemplateCardTitle(templateTestId: string): Promise<string> {
    try {
      const card = this.locator(`[data-test-id="${templateTestId}"]`);
      return (await card.textContent({ timeout: TestTimeouts.SHORT_WAIT }))?.trim() || '';
    } catch {
      return '';
    }
  }

  async getTemplateCardFields(templateTestId: string): Promise<string[]> {
    const card = this.locator(`[data-test-id="${templateTestId}"]`);
    const text = (await card.textContent({ timeout: TestTimeouts.SHORT_WAIT }))?.trim() || '';
    const knownFields = ['Architecture', 'Project', 'Boot source', 'Workload', 'CPU', 'Memory'];
    return knownFields.filter((field) => text.includes(field));
  }

  async getTemplateCatalogCount(): Promise<number> {
    const gridCards = this._pfV6CWizardTemplatesCatalogTile;
    const gridCount = await gridCards.count();
    if (gridCount > 0) return gridCount;

    const listRows = this.locator('.pf-v6-c-wizard tr.pf-m-clickable');
    return await listRows.count();
  }

  async getTemplateDrawerFields(): Promise<string[]> {
    await this.page.waitForTimeout(2000);
    const overlay = this.locator(
      '.co-catalog-page__overlay, .pf-v6-c-drawer__panel.template-catalog-drawer',
    ).first();
    await overlay.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    const text = (await overlay.textContent({ timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })) || '';
    const knownFields = [
      'Operating system',
      'Workload type',
      'Description',
      'CPU | Memory',
      'Network interfaces',
      'Disks',
    ];
    return knownFields.filter((field) => text.includes(field));
  }

  async getTemplateDrawerTitle(): Promise<string> {
    try {
      return await this.page.evaluate(() => {
        const h1 =
          document.querySelector('.template-catalog-drawer h1') ||
          document.querySelector('.co-catalog-page__overlay h1');
        return h1?.textContent?.trim() || '';
      });
    } catch {
      return '';
    }
  }

  async isNextButtonDisabled(): Promise<boolean> {
    const nextButton = this._pfV6CWizardButtonpfV6CButtonpfMPrimary;
    await nextButton.first().waitFor({
      state: 'visible',
      timeout: TestTimeouts.SHORT_WAIT,
    });
    return await nextButton.first().isDisabled();
  }

  async navigateToStepByName(stepName: string): Promise<void> {
    const toggle = this.locator('button:has-text("Wizard toggle")');
    await this.robustClick(toggle.first());
    const stepButton = this.locator(
      `nav[aria-label="Wizard steps"] button:has-text("${stepName}")`,
    );
    await this.robustClick(stepButton.first());
  }

  async navigateToWizardInNamespace(_namespace: string): Promise<void> {
    await this.page.goto('/vm-wizard');
    await this._wizardContainer.first().waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
  }

  async openEditLocationPanel(): Promise<void> {
    const editBtn = this._buttonEditVMCreationLocation;
    await this.robustClick(editBtn);
    await this.page.waitForTimeout(500);
  }

  async openWizardFromCreateDropdown(): Promise<void> {
    await this.collapseSidebarIfExpanded();
    const welcomeModal = this.page
      .getByRole('dialog', { name: /Welcome/i })
      .or(this.locator('#guided-tour-modal'));

    const dismissWelcomeModal = async (): Promise<boolean> => {
      try {
        await welcomeModal.first().waitFor({
          state: 'visible',
          timeout: TestTimeouts.UI_DELAY_MEDIUM,
        });
      } catch {
        return false;
      }
      const closeBtn = welcomeModal.first().locator('button[aria-label="Close"]');
      if (await closeBtn.isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM }).catch(() => false)) {
        await this.robustClick(closeBtn);
      } else {
        await this.page.keyboard.press('Escape');
      }
      await welcomeModal
        .first()
        .waitFor({ state: 'hidden', timeout: TestTimeouts.UI_ACTION_COMPLETE })
        .catch(() => undefined);
      await this.page.waitForTimeout(500);
      return true;
    };

    await dismissWelcomeModal();

    const createButton = this.locator(
      '[data-test="item-create"].pf-m-primary, .pf-m-primary > [data-test="item-create"], [data-test="vms-treeview"] [data-test="item-create"], button[aria-label="Create VirtualMachine"]',
    ).first();
    await createButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(createButton);

    for (let attempt = 0; attempt < 5; attempt++) {
      const wizardVisible = await this._wizardContainer
        .first()
        .waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT })
        .then(() => true)
        .catch(() => false);

      if (wizardVisible) return;

      const dismissed = await dismissWelcomeModal();
      if (dismissed) {
        await createButton.waitFor({
          state: 'visible',
          timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
        });
        await this.robustClick(createButton);
      }
    }

    await this._wizardContainer.first().waitFor({
      state: 'visible',
      timeout: TestTimeouts.DEFAULT,
    });
  }

  async searchCloneSourceByName(name: string): Promise<void> {
    const searchInput = this.locator('.pf-v6-c-wizard input[placeholder*="Search by name"]');
    await searchInput.first().clear();
    await searchInput.first().fill(name);
    await this.page.waitForTimeout(1000);
  }

  async selectCloneSourceVm(vmName: string): Promise<void> {
    const row = this.locator('.pf-v6-c-wizard tr, .pf-v6-c-wizard [role="row"]').filter({
      hasText: vmName,
    });
    await row.first().waitFor({ state: 'visible', timeout: TestTimeouts.VM_OPERATION });
    await this.robustClick(row.first());
  }

  async selectCreationMethod(method: 'newVm' | 'fromTemplate' | 'cloneVm'): Promise<void> {
    const radioMap = {
      newVm: this._newVmRadio,
      fromTemplate: this._fromTemplateRadio,
      cloneVm: this._cloneVmRadio,
    };
    await this.robustClick(radioMap[method].first());
  }

  async selectOperatingSystem(os: 'rhel' | 'windows' | 'otherLinux'): Promise<void> {
    const osMap = {
      rhel: this._rhelTile,
      windows: this._windowsTile,
      otherLinux: this._otherLinuxTile,
    };
    await this.robustClick(osMap[os].first());
  }

  async selectOsType(osType: string): Promise<void> {
    await this.robustClick(this._osTypeDropdown.first());
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

  async selectTemplateByTestId(templateTestId: string): Promise<void> {
    const card = this.locator(`[data-test-id="${templateTestId}"]`);
    await card.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(card);

    await card.evaluate(
      (el) =>
        new Promise<void>((resolve) => {
          if (el.classList.contains('pf-m-selected')) {
            resolve();
            return;
          }
          const obs = new MutationObserver(() => {
            if (el.classList.contains('pf-m-selected')) {
              obs.disconnect();
              resolve();
            }
          });
          obs.observe(el, { attributes: true });
          setTimeout(() => {
            obs.disconnect();
            resolve();
          }, 3000);
        }),
    );
  }

  async selectTemplateCatalogProject(projectName: string): Promise<void> {
    const wizMain = this._pfV6CWizardMain;
    const projectToggle = wizMain.locator('.templates-catalog-project-dropdown button').first();
    await projectToggle.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(projectToggle);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    const option = this.page.locator('.pf-v6-c-menu__item-text', { hasText: projectName });
    await option.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(option);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async setCloneSourceProjectFilter(namespace: string): Promise<void> {
    await this.clearCloneSourceFilters();
    await this.page.waitForTimeout(1000);

    const projectBtn = this.locator(
      '.pf-v6-c-wizard [data-ouia-component-type="PF6/MenuToggle"]',
    ).filter({ hasText: 'Project' });
    await this.robustClick(projectBtn.first());
    await this.page.waitForTimeout(500);

    const option = this.page.getByRole('menuitem', { name: namespace, exact: true });
    await option.waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
    await option.click();
    await this.page.waitForTimeout(2000);

    await projectBtn.first().click();
    await this.page.waitForTimeout(500);
  }

  async toggleTemplateCatalogView(view: 'grid' | 'list'): Promise<void> {
    const btn = this.locator(`button[aria-label="template ${view} button"]`);
    await this.robustClick(btn);
    await this.page.waitForTimeout(1000);
  }

  async verifyCloneSourceDescription(): Promise<boolean> {
    try {
      const desc = this.locator('text=/Select a V(irtual)?M(achine)? to clone/');
      await desc.waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
      return true;
    } catch {
      return false;
    }
  }

  async verifyCloneSourceStepVisible(): Promise<boolean> {
    try {
      const heading = this.locator('.pf-v6-c-wizard h1:has-text("Source")');
      await heading.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      return true;
    } catch {
      return false;
    }
  }

  async verifyCloneVmListVisible(): Promise<boolean> {
    try {
      const byClass = this.locator(
        '.pf-v6-c-wizard .vm-listpagebody, .pf-v6-c-wizard [class*="listpage"], .pf-v6-c-wizard table',
      );
      const byRole = this.locator('.pf-v6-c-wizard').locator('[role="grid"], [role="table"]');
      const vmList = byClass.or(byRole).first();
      await vmList.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
      return true;
    } catch {
      return false;
    }
  }

  async verifyCreationMethodCardSelected(
    method: 'newVm' | 'fromTemplate' | 'cloneVm',
  ): Promise<boolean> {
    const idMap = {
      newVm: 'instance-type',
      fromTemplate: 'template',
      cloneVm: 'clone',
    };
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

  async verifyEditLocationButtonVisible(): Promise<boolean> {
    try {
      const editBtn = this._buttonEditVMCreationLocation;
      return await editBtn.isVisible({ timeout: TestTimeouts.SHORT_WAIT }).catch(() => false);
    } catch {
      return false;
    }
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
        '.pf-v6-c-wizard input[role="combobox"][placeholder*="group"]',
      )
        .first()
        .isVisible({ timeout: TestTimeouts.SHORT_WAIT })
        .catch(() => false),
    };
  }

  async verifyEmptyProjectStateInCatalog(): Promise<boolean> {
    try {
      const emptyPatterns = [
        'No templates found',
        'No results found',
        'No results match',
        'No templates available',
      ];
      for (const pattern of emptyPatterns) {
        const emptyTitle = this._pfV6CWizardMain.getByText(pattern, { exact: false });
        if (
          await emptyTitle.isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM }).catch(() => false)
        ) {
          return true;
        }
      }
      const cards = this._pfV6CWizardMain.locator('.templates-catalog-tile');
      const count = await cards.count();
      return count === 0;
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

  async verifyNoErrorBoundary(waitMs = 3000): Promise<boolean> {
    const errorIndicator = this.page.locator('text=Something wrong happened');
    const hasError = await errorIndicator.isVisible({ timeout: waitMs }).catch(() => false);
    return !hasError;
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

  async verifyOsTypeDropdownVisible(): Promise<boolean> {
    try {
      return await this._osTypeDropdown
        .first()
        .isVisible({ timeout: TestTimeouts.SHORT_WAIT })
        .catch(() => false);
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

  async verifyStepActive(stepId: string): Promise<boolean> {
    try {
      const step = this.locator(`#${stepId}`);
      const isCurrent = await step.getAttribute('aria-current');
      return isCurrent === 'step';
    } catch {
      return false;
    }
  }

  async verifyTemplateCatalogHasCards(): Promise<boolean> {
    try {
      const cards = this._pfV6CWizardTemplatesCatalogTile;
      await cards.first().waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      return (await cards.count()) > 0;
    } catch {
      return false;
    }
  }

  async verifyTemplateCatalogStepVisible(): Promise<boolean> {
    try {
      const heading = this.locator('.pf-v6-c-wizard h1:has-text("Templates")');
      await heading.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      return true;
    } catch {
      return false;
    }
  }

  async verifyTemplateCatalogToolbar(): Promise<{
    filterInput: boolean;
    gridToggle: boolean;
    listToggle: boolean;
    projectDropdown: boolean;
  }> {
    const wizMain = this._pfV6CWizardMain;
    const filterInput = wizMain.locator('input[placeholder*="Filter"]');
    await filterInput
      .waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT })
      .catch(() => undefined);
    return {
      filterInput: await filterInput.isVisible().catch(() => false),
      gridToggle: await wizMain
        .locator('button[aria-label="template grid button"]')
        .isVisible({ timeout: TestTimeouts.SHORT_WAIT })
        .catch(() => false),
      listToggle: await wizMain
        .locator('button[aria-label="template list button"]')
        .isVisible({ timeout: TestTimeouts.SHORT_WAIT })
        .catch(() => false),
      projectDropdown: await wizMain
        .locator('.pf-v6-c-menu-toggle')
        .first()
        .isVisible({ timeout: TestTimeouts.SHORT_WAIT })
        .catch(() => false),
    };
  }

  async verifyTemplateDrawerVisible(): Promise<boolean> {
    try {
      const drawer = this.locator(
        '.co-catalog-page__overlay, .pf-v6-c-drawer__panel.template-catalog-drawer',
      );
      await drawer.first().waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      return true;
    } catch {
      return false;
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
}
