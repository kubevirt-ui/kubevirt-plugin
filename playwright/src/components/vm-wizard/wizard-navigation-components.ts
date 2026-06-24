import BaseComponent from '@/components/shared/base-component';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

export class VmCreationWizardNavigationComponent extends BaseComponent {
  constructor(page: Page) {
    super(page);
  }

  private readonly _pfV6CWizardButtonpfV6CButtonpfMPrimary = this.locator(
    '.pf-v6-c-wizard button.pf-v6-c-button.pf-m-primary',
  );

  async isNextButtonDisabled(): Promise<boolean> {
    const nextButton = this._pfV6CWizardButtonpfV6CButtonpfMPrimary;
    await nextButton.first().waitFor({
      state: 'visible',
      timeout: TestTimeouts.SHORT_WAIT,
    });
    return await nextButton.first().isDisabled();
  }

  async clickNext(): Promise<void> {
    const nextButton = this._pfV6CWizardButtonpfV6CButtonpfMPrimary;
    await nextButton.first().waitFor({
      state: 'visible',
      timeout: TestTimeouts.SHORT_WAIT,
    });
    await this.robustClick(nextButton.first());
    await this.page.waitForTimeout(1000);
  }

  async isBackButtonDisabled(): Promise<boolean> {
    const backButton = this.locator(
      '.pf-v6-c-wizard button.pf-v6-c-button.pf-m-secondary:has-text("Back")',
    ).first();
    const visible = await backButton
      .isVisible({ timeout: TestTimeouts.SHORT_WAIT })
      .catch(() => false);
    if (!visible) return true;
    return await backButton.isDisabled();
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

export class VmCreationWizardTemplateCatalogComponent extends BaseComponent {
  constructor(page: Page) {
    super(page);
  }

  private readonly _pfV6CWizardTemplatesCatalogTile = this.locator(
    '.pf-v6-c-wizard .templates-catalog-tile',
  );
  private readonly _pfV6CWizardMain = this.locator('.pf-v6-c-wizard__main');

  async verifyTemplateCatalogStepVisible(): Promise<boolean> {
    try {
      const heading = this.locator('.pf-v6-c-wizard h1:has-text("Templates")');
      await heading.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      return true;
    } catch {
      return false;
    }
  }

  async getTemplateCatalogCount(): Promise<number> {
    const gridCards = this._pfV6CWizardTemplatesCatalogTile;
    const gridCount = await gridCards.count();
    if (gridCount > 0) return gridCount;

    const listRows = this.locator('.pf-v6-c-wizard tr.pf-m-clickable');
    return await listRows.count();
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

  async closeTemplateDrawer(): Promise<void> {
    const closeBtn = this.locator(
      '.pf-v6-c-modal-box__close button[aria-label="Close"], button[aria-label="Close drawer panel"]',
    ).first();
    if (await closeBtn.isVisible({ timeout: TestTimeouts.SHORT_WAIT }).catch(() => false)) {
      await this.robustClick(closeBtn);
      await this.page.waitForTimeout(500);
    }
  }

  async filterTemplateCatalog(keyword: string): Promise<void> {
    const input = this.locator(
      '.pf-v6-c-wizard__main input[placeholder*="Filter"], .pf-v6-c-wizard__main input[placeholder*="keyword"]',
    );
    await input.first().waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
    await input.first().clear();
    await input.first().fill(keyword);
    await this.page.waitForTimeout(500);
  }

  async enableUserTemplatesFilter(): Promise<void> {
    const userTemplatesRadio = this._pfV6CWizardMain.getByText('User templates', { exact: true });
    await userTemplatesRadio.waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
    await this.robustClick(userTemplatesRadio);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  }

  async toggleTemplateCatalogView(view: 'grid' | 'list'): Promise<void> {
    const btn = this.locator(`button[aria-label="template ${view} button"]`);
    await this.robustClick(btn);
    await this.page.waitForTimeout(1000);
  }

  async selectTemplateCatalogProject(projectName: string): Promise<void> {
    const wizMain = this._pfV6CWizardMain;
    const projectToggle = wizMain
      .locator(
        '.templates-catalog-project-dropdown button, .pf-v6-c-menu-toggle:has-text("projects")',
      )
      .first();
    await projectToggle.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(projectToggle);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    const searchInput = this.page.locator(
      '[role="listbox"] input[type="search"], .pf-v6-c-menu input[type="search"]',
    );
    if (await searchInput.isVisible({ timeout: TestTimeouts.UI_DELAY_SHORT }).catch(() => false)) {
      await searchInput.fill(projectName);
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    }

    const option = this.page.locator(
      `.pf-v6-c-menu__item-text:text-is("${projectName}"), [role="option"]:has-text("${projectName}")`,
    );
    await option.first().waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(option.first());
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async clickViewAllProjectsInCatalog(): Promise<void> {
    const projectToggle = this._pfV6CWizardMain
      .locator(
        '.templates-catalog-project-dropdown button, .pf-v6-c-menu-toggle:has-text("projects")',
      )
      .first();
    if (
      await projectToggle.isVisible({ timeout: TestTimeouts.UI_DELAY_SHORT }).catch(() => false)
    ) {
      await this.robustClick(projectToggle);
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      const allOption = this.page
        .locator(
          '.pf-v6-c-menu__item-text:text-is("All projects"), [role="option"]:has-text("All projects")',
        )
        .first();
      if (await allOption.isVisible({ timeout: TestTimeouts.SHORT_WAIT }).catch(() => false)) {
        await this.robustClick(allOption);
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
        return;
      }
    }
    const viewAllBtn = this._pfV6CWizardMain.locator('button', {
      hasText: 'View all projects',
    });
    await viewAllBtn.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(viewAllBtn);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async verifyEmptyProjectStateInCatalog(): Promise<boolean> {
    try {
      const emptyPatterns = ['No templates found', 'No results found', 'No templates available'];
      for (const pattern of emptyPatterns) {
        const emptyTitle = this._pfV6CWizardMain.getByText(pattern, { exact: false });
        if (
          await emptyTitle.isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM }).catch(() => false)
        ) {
          return true;
        }
      }
      const cards = this._pfV6CWizardTemplatesCatalogTile;
      const count = await cards.count();
      return count === 0;
    } catch {
      return false;
    }
  }

  async applyWorkloadFilter(workload: string): Promise<void> {
    const workloadCheckbox = this._pfV6CWizardMain.getByText(workload, { exact: true });
    await workloadCheckbox.waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
    await this.robustClick(workloadCheckbox);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  }

  async clickClearAllFiltersInCatalog(): Promise<void> {
    const allTemplatesRadio = this._pfV6CWizardMain.getByText('All templates', { exact: true });
    if (
      await allTemplatesRadio.isVisible({ timeout: TestTimeouts.UI_DELAY_SHORT }).catch(() => false)
    ) {
      await this.robustClick(allTemplatesRadio);
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      return;
    }
    const clearLink = this._pfV6CWizardMain.locator('button', {
      hasText: 'Clear all filters',
    });
    await clearLink.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(clearLink);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async verifyNoErrorBoundary(waitMs = 3000): Promise<boolean> {
    const errorIndicator = this.page.locator('text=Something wrong happened');
    const hasError = await errorIndicator.isVisible({ timeout: waitMs }).catch(() => false);
    return !hasError;
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
}

export class VmCreationWizardCloneComponent extends BaseComponent {
  constructor(page: Page) {
    super(page);
  }

  private readonly _pfV6CWizardMain = this.locator('.pf-v6-c-wizard__main');

  async verifyCloneSourceStepVisible(): Promise<boolean> {
    try {
      const heading = this.locator('.pf-v6-c-wizard h1:has-text("Source")');
      await heading.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      return true;
    } catch {
      return false;
    }
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

  async verifyCloneVmListVisible(): Promise<boolean> {
    try {
      const vmList = this.locator(
        '.pf-v6-c-wizard .vm-listpagebody, .pf-v6-c-wizard table, .pf-v6-c-wizard [role="grid"]',
      );
      await vmList
        .first()
        .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      return true;
    } catch {
      return false;
    }
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

  async getCloneWizardStepIds(): Promise<string[]> {
    return await this.page.evaluate(() => {
      const links = document.querySelectorAll('.pf-v6-c-wizard__nav-link');
      return Array.from(links)
        .map((el) => el.closest('[id]')?.id || '')
        .filter(Boolean);
    });
  }
}
