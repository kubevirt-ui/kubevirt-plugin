import BaseComponent from '@/components/shared/base-component';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

export class VmCreationWizardDeploymentComponent extends BaseComponent {
  constructor(page: Page) {
    super(page);
  }

  private readonly _wizardContainer = this.locator('.pf-v6-c-wizard.vm-creation-wizard');

  private readonly _newVmRadio = this.page.getByRole('radio', {
    name: /Custom configuration/,
  });
  private readonly _fromTemplateRadio = this.page.getByRole('radio', {
    name: /Create from Template/,
  });
  private readonly _cloneVmRadio = this.page.getByRole('radio', {
    name: /Clone existing VirtualMachine/,
  });

  private readonly _vmNameInput = this.locator('.vm-creation-wizard #vm-name');
  private readonly _generateVmNameButton = this.locator(
    '.vm-creation-wizard [data-test="generate-vm-name-button"]',
  );

  private readonly _rhelTile = this.locator('.operating-system-tile:has-text("RHEL")');
  private readonly _windowsTile = this.locator(
    '.operating-system-tile:has-text("Microsoft Windows")',
  );
  private readonly _otherLinuxTile = this.locator('.operating-system-tile:has-text("Other Linux")');
  private readonly _pfV6CMenuToggle = this.locator('.pf-v6-c-menu-toggle');

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
        sidebar.evaluate((el) => (el.style.display = 'none')).catch(() => {});
      });
      await this.page.waitForTimeout(500);
    }
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

  async getVmName(): Promise<string> {
    return (await this._vmNameInput.first().inputValue()) || '';
  }

  async isVmNameEmpty(): Promise<boolean> {
    try {
      const isVisible = await this._vmNameInput
        .first()
        .isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM })
        .catch(() => false);
      if (!isVisible) return false;
      const value = await this.getVmName();
      return value.trim().length === 0;
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

  async verifyCreationMethodCardSelected(
    method: 'cloneVm' | 'fromTemplate' | 'newVm',
  ): Promise<boolean> {
    const idMap = {
      newVm: 'instance-type',
      fromTemplate: 'template',
      cloneVm: 'clone',
    };
    const card = this.locator(`#${idMap[method]}.pf-m-selectable`);
    try {
      await card.waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
      return await card.evaluate(
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

  async isOsTileSelected(os: 'otherLinux' | 'rhel' | 'windows'): Promise<boolean> {
    const osMap = {
      rhel: this._rhelTile,
      windows: this._windowsTile,
      otherLinux: this._otherLinuxTile,
    };
    return osMap[os]
      .first()
      .evaluate((el) => el.classList.contains('pf-m-current'))
      .catch(() => false);
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
}

export class VmCreationWizardLocationComponent extends BaseComponent {
  constructor(page: Page) {
    super(page);
  }

  private readonly _buttonEditVMCreationLocation = this.locator(
    'button[aria-label="Edit VM creation location"]',
  );

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
}

export class VmCreationWizardReviewComponent extends BaseComponent {
  constructor(page: Page) {
    super(page);
  }

  private readonly _inputTypeText = this.locator('input[type="text"]');
  private readonly _startThisVirtualMachineAfterCreation = this.locator(
    'text=Start this VirtualMachine after creation',
  );
  private readonly _startAfterCreateCheckbox = this.locator('#start-after-create-checkbox');
  private readonly _pfV6CWizardButtonpfV6CButtonpfMPrimary = this.locator(
    '.pf-v6-c-wizard button.pf-v6-c-button.pf-m-primary',
  );
  private readonly _pfV6CWizardInputTypeText = this.locator('.pf-v6-c-wizard input[type="text"]');

  async verifyReviewStepVisible(): Promise<boolean> {
    try {
      const heading = this.locator('.pf-v6-c-wizard h1:has-text("Review and create")');
      await heading.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      return true;
    } catch {
      return false;
    }
  }

  async verifyReviewSectionsVisible(): Promise<boolean> {
    const sections = ['Details', 'Storage', 'Network', 'Hardware devices'];
    try {
      for (const section of sections) {
        const btn = this.locator(`.pf-v6-c-wizard button:has-text("${section}")`);
        await btn.first().waitFor({
          state: 'visible',
          timeout: TestTimeouts.SHORT_WAIT,
        });
      }
      return true;
    } catch {
      return false;
    }
  }

  async getReviewVmName(): Promise<string> {
    try {
      const nameInput = this._pfV6CWizardInputTypeText.first();
      if (await nameInput.isVisible({ timeout: TestTimeouts.UI_DELAY_SHORT }).catch(() => false)) {
        return (await nameInput.inputValue()) || '';
      }
      const nameGroup = this.locator(
        '.pf-v6-c-wizard .pf-v6-c-description-list__group:has(.pf-v6-c-description-list__term:has-text("Name"))',
      );
      const nameDescription = nameGroup.locator('.pf-v6-c-description-list__description');
      await nameDescription.first().waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      return (await nameDescription.first().textContent())?.trim() || '';
    } catch {
      return '';
    }
  }

  async fillReviewVmName(name: string): Promise<void> {
    const nameInput = this._pfV6CWizardInputTypeText.first();
    if (
      !(await nameInput.isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM }).catch(() => false))
    ) {
      throw new Error(
        'VM name input not found on Review step — only the Clone flow has an editable name here.',
      );
    }
    await nameInput.clear();
    await nameInput.fill(name);
    await nameInput.press('Tab');
  }

  async verifyStartAfterCreationCheckbox(): Promise<boolean> {
    try {
      const checkbox = this._startThisVirtualMachineAfterCreation;
      await checkbox.waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
      return true;
    } catch {
      return false;
    }
  }

  async isStartAfterCreationChecked(): Promise<boolean> {
    try {
      const checkbox = this._startAfterCreateCheckbox;
      await checkbox.waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
      return checkbox.isChecked();
    } catch {
      return false;
    }
  }

  async toggleStartAfterCreation(): Promise<void> {
    const checkbox = this.locator('input[type="checkbox"]').or(
      this._startThisVirtualMachineAfterCreation,
    );
    await this.robustClick(checkbox.first());
  }

  async getReviewDescriptionText(): Promise<string> {
    try {
      const region = this.locator(
        '.pf-v6-c-wizard [class*="review"] strong:has-text("Create VirtualMachine")',
      )
        .locator('..')
        .first();
      return (await region.textContent({ timeout: TestTimeouts.SHORT_WAIT }))?.trim() || '';
    } catch {
      return '';
    }
  }

  async getCreateButtonText(): Promise<string> {
    try {
      const createBtn = this._pfV6CWizardButtonpfV6CButtonpfMPrimary;
      return (
        (await createBtn.first().textContent({ timeout: TestTimeouts.SHORT_WAIT }))?.trim() || ''
      );
    } catch {
      return '';
    }
  }

  async fillReviewDescription(text: string): Promise<void> {
    const descInput = this._pfV6CWizardInputTypeText.nth(1);
    await descInput.clear();
    await descInput.fill(text);
  }

  async getReviewDescription(): Promise<string> {
    try {
      const descInput = this._pfV6CWizardInputTypeText.nth(1);
      return (await descInput.inputValue()) || '';
    } catch {
      return '';
    }
  }

  async clearReviewVmName(): Promise<void> {
    const nameInput = this._pfV6CWizardInputTypeText.first();
    if (
      !(await nameInput.isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM }).catch(() => false))
    ) {
      throw new Error(
        'VM name input not found on Review step — name is not editable in this version.',
      );
    }
    await nameInput.clear();
    await this.page.waitForTimeout(300);
  }

  async typeReviewVmName(name: string): Promise<void> {
    const nameInput = this._pfV6CWizardInputTypeText.first();
    await nameInput.clear();
    await nameInput.fill(name);
    await this.page.waitForTimeout(200);
  }

  async isCreateButtonDisabled(): Promise<boolean> {
    try {
      const createBtn = this._pfV6CWizardButtonpfV6CButtonpfMPrimary.first();
      await createBtn.waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
      return createBtn.isDisabled();
    } catch {
      return true;
    }
  }

  async getReviewNameValidationError(): Promise<string> {
    try {
      const error = this.locator('.pf-v6-c-helper-text__item.pf-m-error');
      await error.first().waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
      return (await error.first().textContent())?.trim() || '';
    } catch {
      return '';
    }
  }

  async verifyReviewNameLabelRequired(): Promise<boolean> {
    try {
      const nameFormGroup = this.locator('.pf-v6-c-wizard .pf-v6-c-form__group').first();
      const requiredIndicator = nameFormGroup.locator('.pf-v6-c-form__label-required');
      await requiredIndicator.waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
      return true;
    } catch {
      return false;
    }
  }

  async verifyReviewNameEditable(): Promise<boolean> {
    try {
      const nameInput = this._pfV6CWizardInputTypeText.first();
      if (
        !(await nameInput.isVisible({ timeout: TestTimeouts.UI_DELAY_SHORT }).catch(() => false))
      ) {
        return false;
      }
      return await nameInput.isEditable({ timeout: TestTimeouts.SHORT_WAIT });
    } catch {
      return false;
    }
  }

  async getStartAfterCreationLabel(): Promise<string> {
    try {
      const checkbox = this._startAfterCreateCheckbox;
      const label = checkbox.locator('..').locator('label, .pf-v6-c-check__label').first();
      return (await label.textContent({ timeout: TestTimeouts.SHORT_WAIT }))?.trim() || '';
    } catch {
      return '';
    }
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
}
