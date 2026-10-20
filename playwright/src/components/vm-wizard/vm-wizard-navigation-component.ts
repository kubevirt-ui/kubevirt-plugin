import BaseComponent from '@/components/shared/base-component';
import { TestTimeouts } from '@/utils/test-config';
import type { Locator, Page } from '@playwright/test';

/** Creation method values used by gallery scene helpers (`selectSceneCreationMethod`). */
export type SceneCreationMethod = 'template' | 'instance-type' | 'clone';

/** Gallery scene fixture defaults (match `component-dependencies/stories/virt-page-fixtures`). */
const SCENE_TEMPLATE_TEST_ID = 'scene-rhel-template';
const SCENE_BOOTABLE_VOLUME_TEST_ID = 'scene-bootable-volume';
const SCENE_CLONE_VM_DISPLAY_NAME = 'story-vm';

/**
 * Page object for the VM creation wizard (PatternFly wizard + deployment / template / clone flows).
 *
 * Used by scenario E2E and **component-scenes** gallery tests. When constructed with a `root` locator
 * (from the scene fixture), all `locator` / `testId` queries are scoped to the mounted story.
 */
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
  private readonly _generateVmNameButton = this.locator('.vm-creation-wizard').locator(
    '[data-test="generate-vm-name-button"]',
  );
  private readonly _newVmRadio = this.locator(
    '.vm-creation-method-tile:has(#instance-type-radio-button), #instance-type',
  );
  private readonly _otherLinuxTile = this.locator('.operating-system-tile:has-text("Other Linux")');

  private readonly _pfV6CMenuToggle = this.locator('.pf-v6-c-menu-toggle');

  private get _wizardFooterCreateButton(): Locator {
    return this.testId('wizard-create-button').filter({ hasText: 'Create VirtualMachine' });
  }

  private get _wizardFooterCloneButton(): Locator {
    return this.testId('wizard-create-button').filter({ hasText: 'Clone VirtualMachine' });
  }

  private get _wizardFooterNextButton(): Locator {
    return this.testId('wizard-next-button').filter({ hasText: 'Next' });
  }
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

  // ── Exit wizard modal ──────────────────────────────────────────────
  private readonly _exitModal = this.page
    .locator('.pf-v6-c-modal-box')
    .filter({ hasText: 'Exit VirtualMachine creation?' });

  private readonly _exitModalExitButton = this._exitModal.getByRole('button', {
    name: 'Exit without saving',
  });

  private readonly _exitModalContinueButton = this._exitModal.getByRole('button', {
    name: 'Continue creating',
  });

  /**
   * @param page - Playwright page (gallery or OpenShift console).
   * @param root - Optional mount root from component-scenes; scopes interactions to the story subtree.
   */
  constructor(page: Page, root?: Locator) {
    super(page, root);
  }

  /** Gallery story mount node (`#root`); used for scene harness assertions. */
  getSceneRoot(): Locator {
    return this.root ?? this.page.locator('#root');
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
    await this._wizardContainer.first().waitFor({
      state: 'hidden',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
  }

  async clickCancelButton(): Promise<void> {
    await this.robustClick(
      this.locator('.pf-v6-c-wizard button.pf-v6-c-button.pf-m-link:has-text("Cancel")').first(),
    );
  }

  async clickContinueCreating(): Promise<void> {
    await this._exitModalContinueButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await this.robustClick(this._exitModalContinueButton);
    await this._exitModal.waitFor({
      state: 'hidden',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
  }

  async clickExitWithoutSaving(): Promise<void> {
    await this._exitModalExitButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await this.robustClick(this._exitModalExitButton);
    await this._exitModal.waitFor({
      state: 'hidden',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
  }

  async getExitModalBody(): Promise<string> {
    const body = this._exitModal.locator('.pf-v6-c-modal-box__body');
    await body.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    return ((await body.textContent()) ?? '').trim();
  }

  async getExitModalTitle(): Promise<string> {
    const title = this._exitModal
      .locator('.pf-v6-c-modal-box__title')
      .getByText('Exit VirtualMachine creation?', { exact: true });
    await title.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    return ((await title.textContent()) ?? '').trim();
  }

  async getVmName(): Promise<string> {
    return await this._vmNameInput.first().inputValue();
  }

  async isExitModalVisible(): Promise<boolean> {
    try {
      await this._exitModal.waitFor({
        state: 'visible',
        timeout: TestTimeouts.SHORT_WAIT,
      });
      return true;
    } catch {
      return false;
    }
  }

  async verifyExitModalNotShown(): Promise<boolean> {
    try {
      await this._exitModal.waitFor({
        state: 'visible',
        timeout: TestTimeouts.SHORT_WAIT,
      });
      return false;
    } catch {
      return true;
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
    const createBtn = this._wizardFooterCreateButton;
    await this.clickCreateVMButton(createBtn);
  }

  async clickCreateVMButton(createBtn: Locator): Promise<void> {
    await createBtn.waitFor({
      state: 'visible',
      timeout: TestTimeouts.SHORT_WAIT,
    });

    if (await createBtn.isDisabled()) {
      const nameInput = this._vmNameInput.first();
      if ((await nameInput.count()) > 0) {
        await nameInput.press('Tab');
        await this.page.waitForTimeout(300);
      }
    }

    await this.robustClick(createBtn);
    await this.page.waitForTimeout(2000);
  }

  async clickCloneVm(): Promise<void> {
    const cloneBtn = this._wizardFooterCloneButton;
    await this.clickCreateVMButton(cloneBtn);
  }

  async getWizardErrorAlertMessage(): Promise<string> {
    try {
      const alert = this._wizardContainer.locator('.pf-v6-c-alert.pf-m-danger');
      await alert.waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
      return (await alert.textContent())?.trim() || '';
    } catch {
      return '';
    }
  }

  async clickWizardNextButton(): Promise<void> {
    await this.interactClick(this._wizardFooterNextButton);
  }

  async clickNext(): Promise<void> {
    await this.page.keyboard.press('Escape');
    await this.page
      .locator('.pf-v6-c-tooltip, [role="tooltip"]')
      .first()
      .waitFor({ state: 'hidden', timeout: TestTimeouts.SHORT_WAIT })
      .catch(() => undefined);

    const nextButton = this._wizardFooterNextButton;
    await nextButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.SHORT_WAIT,
    });
    await nextButton.hover().catch(() => undefined);
    await this.interactClick(nextButton);
    if (!this.root) {
      await this.page.waitForTimeout(1000);
    }
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

  /** Select "User templates" in the catalog Template scope sidebar filter. */
  async selectUserTemplatesScopeFilter(): Promise<void> {
    const userTemplatesRadio = this.testId('catalog-template-filter-user');
    await userTemplatesRadio.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(userTemplatesRadio);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
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
    await this.interactFill(this._vmNameInput.first(), name);
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
    await this.interactClick(this._generateVmNameButton.first());
    if (!this.root) {
      await this.page.waitForTimeout(500);
    }
  }

  async getCloneWizardStepIds(): Promise<string[]> {
    const stepIds = await this._wizardContainer
      .locator('.pf-v6-c-wizard__nav-link:visible')
      .evaluateAll((links) => links.map((link) => link.closest('[id]')?.id ?? '').filter(Boolean));

    // PatternFly can briefly retain duplicate shared steps while switching wizard flows.
    return [...new Set(stepIds)];
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
      const wizard = this.locator('.vm-creation-wizard');
      const projectToggle = wizard.getByTestId('namespace-dropdown-menu-toggle').first();
      if (await projectToggle.isVisible({ timeout: TestTimeouts.SHORT_WAIT }).catch(() => false)) {
        return (await projectToggle.textContent())?.trim() ?? '';
      }

      const displayContent = this.locator('.vm-creation-location-display__content');
      const text = await displayContent.innerText({ timeout: TestTimeouts.SHORT_WAIT });
      const match = text.match(/Project\s+(\S+)/);
      return match?.[1]?.trim() ?? '';
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
      const card = this.testId(templateTestId);
      return (await card.textContent({ timeout: TestTimeouts.SHORT_WAIT }))?.trim() || '';
    } catch {
      return '';
    }
  }

  async getTemplateCardFields(templateTestId: string): Promise<string[]> {
    const card = this.testId(templateTestId);
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
    const nextButton = this._wizardFooterNextButton;
    await nextButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.SHORT_WAIT,
    });
    return await nextButton.isDisabled();
  }

  /**
   * Whether the wizard's left-hand step navigation link for `stepId` is disabled.
   * `stepId` matches the `WizardStep` id rendered by PatternFly as the nav link's DOM id
   * (e.g. `vm-creation-review-and-create-step`).
   */
  async isStepNavDisabled(stepId: string): Promise<boolean> {
    const navLink = this.locator(`#${stepId}`);
    await navLink.first().waitFor({ state: 'attached', timeout: TestTimeouts.SHORT_WAIT });
    const disabled = await navLink.first().getAttribute('disabled');
    const ariaDisabled = await navLink.first().getAttribute('aria-disabled');
    return disabled !== null || ariaDisabled === 'true';
  }

  async navigateToStepByName(stepName: string): Promise<void> {
    const toggle = this.locator('button:has-text("Wizard toggle")');
    await this.robustClick(toggle.first());
    const stepButton = this.locator(
      `nav[aria-label="Wizard steps"] button:has-text("${stepName}")`,
    );
    await this.robustClick(stepButton.first());
  }

  /**
   * Jumps directly to a wizard step via the left-hand step navigation, using the step's DOM id
   * (e.g. `vm-creation-customization-step`). No-op if the nav link is disabled.
   */
  async navigateToStepById(stepId: string): Promise<void> {
    const navLink = this.locator(`#${stepId}`);
    await navLink
      .first()
      .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(navLink.first());
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
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

  async selectLocationProject(namespace: string): Promise<void> {
    const current = await this.getLocationProject();
    if (current.includes(namespace)) {
      return;
    }

    await this.openEditLocationPanel();

    const toggle = this.locator('.vm-creation-wizard').getByTestId(
      'namespace-dropdown-menu-toggle',
    );
    await toggle.first().waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(toggle.first());

    const filter = this.page.getByTestId('dropdown-text-filter');
    await filter.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await filter.clear();
    await filter.fill(namespace);

    const option = this.page.getByRole('menuitem', { name: namespace, exact: true });
    await option.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(option);

    await toggle
      .filter({ hasText: namespace })
      .first()
      .waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
  }

  async openWizardFromCreateDropdown(): Promise<void> {
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

    const createButton = this.testId('item-create')
      .and(this.locator('.pf-m-primary'))
      .or(this.locator('.pf-m-primary').locator('[data-test="item-create"]'))
      .or(this.testId('vms-treeview').locator('[data-test="item-create"]'))
      .or(this.locator('button[aria-label="Create VirtualMachine"]'))
      .first();
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
    const testIdSuffix = {
      newVm: 'instance-type',
      fromTemplate: 'template',
      cloneVm: 'clone',
    } as const;
    const byTestId = this.testId(`creation-method-${testIdSuffix[method]}`);
    if (await byTestId.isVisible({ timeout: TestTimeouts.SHORT_WAIT }).catch(() => false)) {
      await this.interactClick(byTestId);
      return;
    }

    const radioMap = {
      newVm: this._newVmRadio,
      fromTemplate: this._fromTemplateRadio,
      cloneVm: this._cloneVmRadio,
    };
    await this.interactClick(radioMap[method].first());
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
    const card = this.testId(templateTestId);
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

  async isTemplateSelectedByTestId(templateTestId: string): Promise<boolean> {
    const card = this.testId(templateTestId);
    await card.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    return await card.evaluate((element) => element.classList.contains('pf-m-selected'));
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
      projectDropdown: await this.locator('.pf-v6-c-wizard')
        .getByTestId('namespace-dropdown-menu-toggle')
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
    const headerSelector = this.testId('namespace-bar-dropdown');
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

  // ── Boot source (template drawer) ──────────────────────────────────

  private get _changeBootSourceModal() {
    return this.page.locator('[aria-labelledby="change-boot-source-modal-title"]');
  }

  async getTemplateDrawerBootSourceText(): Promise<string> {
    const item = this.testId('template-boot-source');
    await item.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    return ((await item.textContent()) ?? '').trim();
  }

  async isTemplateBootSourceEditable(): Promise<boolean> {
    try {
      await this.testId('template-boot-source').waitFor({
        state: 'visible',
        timeout: TestTimeouts.SHORT_WAIT,
      });
      return true;
    } catch {
      return false;
    }
  }

  async clickEditBootSource(): Promise<void> {
    const editButton = this.testId('template-boot-source');
    await editButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(editButton);
    await this._changeBootSourceModal.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
  }

  async isChangeBootSourceModalOpen(): Promise<boolean> {
    return this._changeBootSourceModal
      .isVisible({ timeout: TestTimeouts.SHORT_WAIT })
      .catch(() => false);
  }

  async selectBootableVolumeInChangeModal(volumeName: string): Promise<void> {
    const modal = this._changeBootSourceModal;
    const row = modal.locator('table.BootableVolumeList-table tbody tr').filter({
      has: this.page.locator('td').getByText(volumeName, { exact: true }),
    });
    await row.first().waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(row.first());
  }

  async confirmChangeBootSource(): Promise<void> {
    await this.robustClick(this.testId('change-boot-source-confirm'));
    await this._changeBootSourceModal.waitFor({
      state: 'hidden',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
  }

  async cancelChangeBootSource(): Promise<void> {
    await this.robustClick(this.testId('change-boot-source-cancel'));
    await this._changeBootSourceModal.waitFor({
      state: 'hidden',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
  }

  /** Left-hand wizard nav link for a step id (`WizardSceneStep` / production `VMWizardStep`). */
  wizardNavLinkByStepId(stepId: string): Locator {
    return this.locator(`.pf-v6-c-wizard__nav-link#${stepId}`);
  }

  /** PatternFly wizard step navigation container. */
  wizardNav(): Locator {
    return this.locator('.pf-v6-c-wizard__nav');
  }

  /** Sidebar step button by visible step label (used in component scene specs). */
  wizardNavItem(stepName: string | RegExp): Locator {
    return this.wizardNav().getByRole('button', { name: stepName });
  }

  /** Footer Next control (`data-test="wizard-next-button"`). */
  wizardFooterNext(): Locator {
    return this.testId('wizard-next-button');
  }

  /** Footer Back control (`data-test="wizard-back-button"`). */
  wizardFooterBack(): Locator {
    return this.testId('wizard-back-button');
  }

  /** Deployment details VM name field. */
  getVmNameInput(): Locator {
    return this._vmNameInput;
  }

  /** Clicks a sidebar step by label (skips disabled steps — use `expect` in specs). */
  async jumpToWizardNavStep(stepName: string | RegExp): Promise<void> {
    await this.interactClick(this.wizardNavItem(stepName));
  }

  /** Guest OS tile on the instance-type flow (`data-test="os-tile-*"`). */
  guestOsTile(os: 'RHEL' | 'OTHER_LINUX' | 'WINDOWS'): Locator {
    return this.testId(`os-tile-${os}`);
  }

  /** Guest OS type preference on the Guest OS step. Assert visibility in specs with `expect`. */
  guestOsPreferenceButton(preferenceName: string | RegExp): Locator {
    return this.page.getByRole('button', { name: preferenceName });
  }

  /** Review step primary action. Assert visibility in specs with `expect`. */
  createVirtualMachineButton(): Locator {
    return this.testId('create-virtual-machine');
  }

  /** Selects a guest OS tile by `data-test`, falling back to legacy text-based tiles in E2E. */
  async selectGuestOsTileByTestId(os: 'RHEL' | 'OTHER_LINUX' | 'WINDOWS'): Promise<void> {
    const tile = this.guestOsTile(os);
    if (await tile.isVisible({ timeout: TestTimeouts.SHORT_WAIT }).catch(() => false)) {
      await this.interactClick(tile);
      return;
    }
    const legacyMap = {
      RHEL: 'rhel',
      OTHER_LINUX: 'otherLinux',
      WINDOWS: 'windows',
    } as const;
    await this.selectOperatingSystem(legacyMap[os]);
  }

  /** Clicks a template catalog card by `data-test` (gallery fixtures use `scene-rhel-template`). */
  async selectTemplateCatalogTileByTestId(templateTestId: string): Promise<void> {
    await this.interactClick(this.testId(templateTestId));
  }

  /** Selects a clone source VM row by display name (gallery clone fixture: `story-vm`). */
  async selectCloneSourceByDisplayName(name: string): Promise<void> {
    await this.interactClick(this.ui.getByText(name, { exact: true }).first());
  }

  /** Add bootable volume control on the boot source step. */
  bootSourceAddVolumeButton(): Locator {
    return this.testId('boot-source-add-volume');
  }

  /** Bootable volume table (only rendered when "Boot volume" is selected). */
  bootSourceVolumeTable(): Locator {
    return this.locator('table.BootableVolumeList-table');
  }

  /** Clickable row for a boot volume by resource name. */
  bootSourceVolumeRow(volumeName: string): Locator {
    return this.bootSourceVolumeTable().locator('tbody tr').filter({ hasText: volumeName });
  }

  /** Selects a boot volume row on the boot source step. */
  async selectBootVolumeByName(volumeName: string): Promise<void> {
    const row = this.bootSourceVolumeRow(volumeName);
    await row.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.interactClick(row);
  }

  /** Chooses the "Boot volume" radio on the boot source step. */
  async selectBootVolumeSourceOption(): Promise<void> {
    await this.interactClick(this.ui.getByLabel('Boot volume'));
  }

  /** Chooses the "No boot source" radio on the boot source step. */
  async selectNoBootSource(): Promise<void> {
    await this.interactClick(this.ui.getByLabel('No boot source'));
  }

  /**
   * Completes the boot source step in gallery scenes: selects the stub volume by test id or "No boot source".
   */
  async completeBootSourceStepForScene(
    volumeTestId: string = SCENE_BOOTABLE_VOLUME_TEST_ID,
  ): Promise<void> {
    const volumeCell = this.testId(volumeTestId);
    if (await volumeCell.isVisible({ timeout: TestTimeouts.SHORT_WAIT }).catch(() => false)) {
      await this.interactClick(volumeCell);
      return;
    }
    await this.selectNoBootSource();
  }

  /** Selects the U1 instance type series tile in gallery compute step fixtures. */
  async selectInstanceTypeSeriesU1(): Promise<void> {
    await this.interactClick(this.testId('instance-type-series-u1'));
  }

  /** Opens size menu and selects Medium (gallery instance type fixtures). */
  async selectInstanceTypeSizeMedium(): Promise<void> {
    const sizeToggle = this.ui.getByRole('button', { name: /small:|Select size/ });
    await this.interactClick(sizeToggle);
    await this.interactClick(this.page.getByTestId('instance-type-size-medium'));
  }

  /** Footer Back when present; otherwise uses legacy wizard Back selector (E2E). */
  async clickWizardBackButton(): Promise<void> {
    const back = this.wizardFooterBack();
    if (await back.isVisible({ timeout: TestTimeouts.SHORT_WAIT }).catch(() => false)) {
      await this.interactClick(back);
      return;
    }
    await this.clickBack();
  }

  // ── Component scene flows (shared PO; used by gallery specs and E2E-capable API) ──

  /** Maps gallery creation method ids to E2E `selectCreationMethod` values. */
  async selectSceneCreationMethod(method: SceneCreationMethod): Promise<void> {
    const e2eMethod = {
      template: 'fromTemplate',
      'instance-type': 'newVm',
      clone: 'cloneVm',
    } as const satisfies Record<SceneCreationMethod, 'newVm' | 'fromTemplate' | 'cloneVm'>;
    await this.selectCreationMethod(e2eMethod[method]);
  }

  /** Fills deployment prerequisites for gallery flows (generated VM name on 4.99+). */
  async completeDeploymentDetailsForScene(): Promise<void> {
    await this.generateVmName();
  }

  /** Selects the default RHEL template tile unless a custom `data-test` is passed. */
  async selectSceneTemplateCatalogTile(
    templateTestId: string = SCENE_TEMPLATE_TEST_ID,
  ): Promise<void> {
    await this.selectTemplateCatalogTileByTestId(templateTestId);
  }

  /** Picks the gallery clone source VM (`story-vm` by default). */
  async selectSceneCloneSource(displayName: string = SCENE_CLONE_VM_DISPLAY_NAME): Promise<void> {
    await this.selectCloneSourceByDisplayName(displayName);
  }

  /** Guest OS step shortcut for instance-type gallery flows (RHEL tile). */
  async completeGuestOsStepForScene(): Promise<void> {
    await this.selectGuestOsTileByTestId('RHEL');
  }

  /** Compute resources step shortcut (U1 series + Medium size). */
  async completeComputeResourcesStepForScene(): Promise<void> {
    await this.selectInstanceTypeSeriesU1();
    await this.selectInstanceTypeSizeMedium();
  }

  /** Clicks Next to surface deployment name validation errors in component specs. */
  async triggerDeploymentNameValidation(): Promise<void> {
    await this.clickWizardNextButton();
  }
}
