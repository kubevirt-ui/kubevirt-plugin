/**
 * VM creation wizard components — disks, tabs, and main wizard.
 */

import BaseComponent from '@/components/shared/base-component';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

/**
 * Disk / storage form interactions in the VM customize wizard (horizontal + sidebar flows).
 */
export class CreateVmWizardDisksComponent extends BaseComponent {
  private readonly _advancedSettingsBtn = this.locator('button:has-text("Advanced settings")');
  private readonly _buttonIncrement = this.locator('button[aria-label="Increment"]');
  private readonly _inputInput = this.locator('input[aria-label="Input"]');
  private readonly _inputNameVolumename = this.locator('input[name="volume.name"]');
  private readonly _selectPersistentVolumeClaimBtn = this.locator(
    'button:has-text("Select PersistentVolumeClaim")',
  );
  private readonly _selectProjectBtn = this.locator('button:has-text("Select Project")');
  private readonly _storageClassSelect = this.locator('[data-test-id="storage-class-select"]');

  constructor(page: Page) {
    super(page);
  }

  /**
   * Adds a disk in the sidebar editor wizard (template VM customize flow).
   * Uses the .sidebar-editor button instead of .kv-configuration-vm-disk-list.
   */
  async addDiskInSidebarWizard(diskConfig: {
    name: string;
    diskType?: string;
    diskSource?: {
      sourceNs?: string;
      sourcePvc?: string;
      value?: string;
    };
    size?: string;
    storageClass?: string;
  }): Promise<void> {
    const addButton = this.locator('.sidebar-editor button', { hasText: 'Add' });
    await addButton.waitFor({ state: 'visible', timeout: TestTimeouts.RESOURCE_CREATION });
    await this.robustClick(addButton);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    if (diskConfig.diskType) {
      const diskTypeOption = this.locator(`text=${diskConfig.diskType}`);
      await diskTypeOption.waitFor({ state: 'visible', timeout: TestTimeouts.RESOURCE_CREATION });
      await this.robustClick(diskTypeOption);
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
    }

    const nameInput = this._inputNameVolumename;
    await nameInput.waitFor({ state: 'visible', timeout: TestTimeouts.RESOURCE_CREATION });
    await nameInput.clear();
    await nameInput.fill(diskConfig.name);

    if (diskConfig.diskType === 'Clone volume' && diskConfig.diskSource) {
      if (diskConfig.diskSource.sourceNs) {
        const selectPVCNS = this._selectProjectBtn;
        await selectPVCNS.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
        await this.robustClick(selectPVCNS);
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

        const nsOption = this.locator(
          `[role="listbox"] button:has-text("${diskConfig.diskSource.sourceNs}")`,
        );
        await nsOption.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
        await this.robustClick(nsOption);
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
      }

      if (diskConfig.diskSource.sourcePvc) {
        const selectPVCName = this._selectPersistentVolumeClaimBtn;
        await selectPVCName.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
        await this.robustClick(selectPVCName);
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

        const pvcOption = this.locator(
          `[role="listbox"] button:has-text("${diskConfig.diskSource.sourcePvc}")`,
        );
        await pvcOption.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
        await this.robustClick(pvcOption);
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
      }
    }

    if (diskConfig.size) {
      const sizeInput = this._inputInput;
      const sizeInputExists = await sizeInput
        .isVisible({ timeout: TestTimeouts.UI_DELAY_LONG })
        .catch(() => false);
      if (sizeInputExists) {
        await sizeInput.clear();
        const incrementButton = this._buttonIncrement;
        for (let i = 0; i < parseInt(diskConfig.size); i++) {
          await this.robustClick(incrementButton);
        }
      }
    }

    if (diskConfig.storageClass) {
      const storageClassSelect = this._storageClassSelect;
      await storageClassSelect.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this.robustClick(storageClassSelect);
      const storageClassOption = this.locator(
        `button#select-inline-filter-${diskConfig.storageClass}`,
      );
      await storageClassOption.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this.robustClick(storageClassOption);
    }

    await this.clickDialogSaveButton();
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_LONG);
  }

  /**
   * Adds a disk in the wizard Storage tab.
   * Matches Cypress: catalog.addDisks(vmData) -> addDisk(disk)
   *
   * @param diskConfig - Disk configuration
   */
  async addDiskInWizard(diskConfig: {
    name: string;
    diskType?: string; // e.g., 'Empty disk (blank)', 'Ephemeral', 'Clone volume'
    diskSource?: {
      name?: string; // e.g., 'Blank', 'EphemeralDisk', 'cloneVolume'
      selector?: string;
      value?: string;
    };
    size?: string;
    storageClass?: string;
    type?: string; // e.g., 'lun'
    shareDisk?: boolean;
    scsiReservation?: boolean;
  }): Promise<void> {
    const addButton = this.locator('.kv-configuration-vm-disk-list button', { hasText: 'Add' });
    await addButton.waitFor({ state: 'visible', timeout: TestTimeouts.RESOURCE_CREATION });
    await this.robustClick(addButton);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    const diskType = diskConfig.diskType || 'Empty disk (blank)';
    const diskTypeOption = this.locator(`text=${diskType}`);
    await diskTypeOption.waitFor({ state: 'visible', timeout: TestTimeouts.RESOURCE_CREATION });
    await this.robustClick(diskTypeOption);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    const nameInput = this._inputNameVolumename;
    await nameInput.waitFor({ state: 'visible', timeout: TestTimeouts.RESOURCE_CREATION });
    await nameInput.clear();
    await nameInput.fill(diskConfig.name);

    if (diskConfig.diskSource) {
      if (diskConfig.diskType === 'Clone volume') {
        const selectPVCNS = this._selectProjectBtn;
        await selectPVCNS.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
        await this.robustClick(selectPVCNS);
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

        const selectPVCName = this._selectPersistentVolumeClaimBtn;
        await selectPVCName.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
        await this.robustClick(selectPVCName);
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
      }

      if (diskConfig.diskSource.value && diskConfig.diskType) {
        const containerSourceInput = this.locator('[data-test-id="disk-source-container"]');
        await containerSourceInput.waitFor({
          state: 'visible',
          timeout: TestTimeouts.UI_ACTION_COMPLETE,
        });
        await containerSourceInput.clear();
        await containerSourceInput.fill(diskConfig.diskSource.value);
      }
    }

    if (diskConfig.size) {
      const sizeInput = this._inputInput;
      const sizeInputExists = await sizeInput
        .isVisible({ timeout: TestTimeouts.UI_DELAY_LONG })
        .catch(() => false);
      if (sizeInputExists) {
        await sizeInput.clear();
        const incrementButton = this._buttonIncrement;
        for (let i = 0; i < parseInt(diskConfig.size); i++) {
          await this.robustClick(incrementButton);
        }
      }
    }

    if (diskConfig.type) {
      const diskTypeSelect = this.locator('[data-test-id="disk-type-select"]');
      await diskTypeSelect.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
      await this.robustClick(diskTypeSelect);
      const typeOption = this.locator(`[data-test-id="disk-type-select-${diskConfig.type}"]`);
      await typeOption.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
      await this.robustClick(typeOption);
    }

    if (diskConfig.storageClass) {
      const storageClassSelect = this._storageClassSelect;
      await storageClassSelect.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this.robustClick(storageClassSelect);
      const storageClassOption = this.locator(
        `button#select-inline-filter-${diskConfig.storageClass}`,
      );
      await storageClassOption.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this.robustClick(storageClassOption);
    }

    if (diskConfig.shareDisk) {
      const advancedSettingsButton = this._advancedSettingsBtn;
      await advancedSettingsButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this.robustClick(advancedSettingsButton);
      const shareDiskCheckbox = this.locator('input[id="sharable-disk"]');
      await shareDiskCheckbox.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await shareDiskCheckbox.check({ force: true });
    }

    if (diskConfig.scsiReservation) {
      const advancedSettingsButton = this._advancedSettingsBtn;
      await advancedSettingsButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this.robustClick(advancedSettingsButton);
      const scsiReservationCheckbox = this.locator('input[id="lun-reservation"]');
      await scsiReservationCheckbox.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await scsiReservationCheckbox.check({ force: true });
    }

    await this.clickDialogSaveButton();
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_LONG);
  }
}

export class CreateVmWizardTabsComponent extends BaseComponent {
  private readonly _pfV6CModalBoxBody = this.locator('.pf-v6-c-modal-box__body');
  private readonly _tabModal = this.locator('#tab-modal');

  private readonly _wizardAnnotationsEditButton = this.locator(
    '[data-test-id="wizard-metadata-annotations-edit"], button[data-test-id^="pw-vm-customize-it-"][data-test-id*="annotations"]',
  );
  private readonly _wizardCpuInput = this.locator('input[name="cpu-input"]');
  private readonly _wizardCpuMemEditBtn = this.locator(
    '[data-test-id="wizard-overview-cpu-memory-edit"]',
  );
  private readonly _wizardDedicatedResourcesCheckbox = this.locator('#dedicated-resources');
  private readonly _wizardDedicatedResourcesEditBtn = this.locator(
    '[data-test-id="dedicated-resources-edit"]',
  );
  private readonly _wizardDeschedulerCheckbox = this.locator('#descheduler');
  private readonly _wizardDeschedulerEditBtn = this.locator('[data-test-id="descheduler-edit"]');

  private readonly _wizardEvictionStrategyCheckbox = this.locator('#eviction-strategy');
  private readonly _wizardEvictionStrategyEditBtn = this.locator(
    '[data-test-id="eviction-strategy"] button',
  );
  private readonly _wizardHeadlessCheckbox = this.locator('#headless-mode');
  private readonly _wizardHostnameEditBtn = this.locator(
    '[data-test-id="wizard-overview-hostname-edit"], button[data-test-id^="pw-vm-customize-it-"][data-test-id*="hostname"]',
  );
  private readonly _wizardHostnameInput = this.locator('input#hostname');
  private readonly _wizardLabelsEditButton = this.locator(
    '[data-test-id="wizard-metadata-labels-edit"], button[data-test-id^="pw-vm-customize-it-"][data-test-id*="labels"]',
  );

  private readonly _wizardLabelsInput = this.locator('[data-test="tags-input"]');

  private readonly _wizardMemInput = this.locator('input[name="memory-input"]');
  private readonly _wizardNameInput = this.locator('#vm-name');
  private readonly _wizardNicToggle = this.locator('#toggle-id-network');
  private readonly _wizardNodeSelectorEditButton = this.locator(
    '[data-test-id="node-selector-edit"], button[data-test-id^="pw-vm-customize-it-"][data-test-id*="node-selector"]',
  );

  private readonly _wizardSSHKeyEditButton = this.locator('[data-test-id="wizard-sshkey-edit"]');
  private readonly _wizardStartInPauseCheckbox = this.locator('#start-in-pause-mode');
  private readonly _wizardSysprepEditButton = this.locator('[data-test-id="wizard-sysprep-edit"]');
  readonly disks: CreateVmWizardDisksComponent;
  constructor(page: Page) {
    super(page);
    this.disks = new CreateVmWizardDisksComponent(page);
  }

  async addDiskInSidebarWizard(
    ...args: Parameters<CreateVmWizardDisksComponent['addDiskInSidebarWizard']>
  ): ReturnType<CreateVmWizardDisksComponent['addDiskInSidebarWizard']> {
    return this.disks.addDiskInSidebarWizard(...args);
  }

  async addDiskInWizard(
    ...args: Parameters<CreateVmWizardDisksComponent['addDiskInWizard']>
  ): ReturnType<CreateVmWizardDisksComponent['addDiskInWizard']> {
    return this.disks.addDiskInWizard(...args);
  }

  /**
   * Clicks the Cancel button in the wizard.
   * Matches Cypress: cy.clickCancelBtn()
   */
  async clickCancelButton(): Promise<void> {
    const wizardCancelButton = this.locator('button:has-text("Cancel")');
    await wizardCancelButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.RESOURCE_CREATION,
    });
    // Accept confirmation dialog that may appear when saving (e.g. after restore)
    this.page.once('dialog', (dialog) => dialog.accept());
    await this.robustClick(wizardCancelButton);
  }

  /**
   * Clicks the final Create VirtualMachine button in the customize wizard.
   */
  async clickWizardCreateButton() {
    const wizardCreateButton = this.locator('[data-test-id="create-virtual-machine"] button', {
      hasText: 'Create VirtualMachine',
    });
    await wizardCreateButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(wizardCreateButton);
  }

  /**
   * Fills the Metadata tab in the customize wizard with labels, annotations, and nodeSelector.
   * Matches Cypress: fillMetadata(vmData) function
   *
   * @param config - Metadata configuration with labels, annotations, and nodeSelector
   */
  async fillWizardMetadata(config: {
    labels?: string[]; // Array of strings like "key=value"
    annotations?: Array<{ key: string; value: string }>; // Array of key-value pairs
    expectedAnnotationsCount?: number; // Expected number of annotations shown on button (default: 1)
  }): Promise<void> {
    await this.navigateToWizardVerticalTab('Metadata');
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    if (config.labels && config.labels.length > 0) {
      await this._wizardLabelsEditButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this.robustClick(this._wizardLabelsEditButton);

      await this._wizardLabelsInput.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this._wizardLabelsInput.clear();

      for (const label of config.labels) {
        await this._wizardLabelsInput.fill(label);
        await this.page.keyboard.press('Enter');
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      }

      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      const tabModal = this._tabModal;
      const saveButtonInModal = tabModal.locator('button').filter({ hasText: 'Save' }).first();
      const saveButtonVisible = await saveButtonInModal
        .isVisible({ timeout: TestTimeouts.UI_DELAY_SHORT })
        .catch(() => false);
      if (saveButtonVisible) {
        await this.robustClick(saveButtonInModal);
      } else {
        await this.clickSave();
      }
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
    }

    if (config.annotations && config.annotations.length > 0) {
      const annotationsCount = config.expectedAnnotationsCount ?? 1;
      const annotationsText =
        annotationsCount === 1 ? '1 Annotation' : `${annotationsCount} Annotations`;
      const annotationsBtn = this.locator(`button:has-text("${annotationsText}")`);

      const annotationsBtnExists = await annotationsBtn
        .isVisible({ timeout: TestTimeouts.UI_DELAY_SHORT })
        .catch(() => false);
      if (!annotationsBtnExists) {
        const altAnnotationsBtn = this.locator('button[data-test-id*="annotation"]').first();
        const altExists = await altAnnotationsBtn
          .isVisible({ timeout: TestTimeouts.UI_DELAY_SHORT })
          .catch(() => false);
        if (altExists) {
          await this.robustClick(altAnnotationsBtn);
        } else {
          // Annotations section may not be available - silently continue
          return;
        }
      } else {
        await this.robustClick(annotationsBtn);
      }

      for (const annotation of config.annotations) {
        const addButton = this.locator('button:has-text("Add more")');
        await addButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
        await this.robustClick(addButton);

        const keyInput = this.locator('input[aria-label="annotation key"]').last();
        const valueInput = this.locator('input[aria-label="annotation value"]').last();
        await keyInput.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
        await keyInput.fill(annotation.key);
        await valueInput.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
        await valueInput.fill(annotation.value);
      }

      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      const tabModal = this._tabModal;
      const saveButtonInModal = tabModal.locator('button').filter({ hasText: 'Save' }).first();
      const saveButtonVisible = await saveButtonInModal
        .isVisible({ timeout: TestTimeouts.UI_DELAY_SHORT })
        .catch(() => false);
      if (saveButtonVisible) {
        await this.robustClick(saveButtonInModal);
      } else {
        await this.clickSave();
      }
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
    }
  }

  /**
   * Fills the Overview tab in the customize wizard.
   *
   * @param config - Overview configuration
   */
  async fillWizardOverview(config: {
    name?: string;
    description?: string;
    cpu?: number;
    memory?: number;
    bootMode?: string;
    workload?: string;
    hostname?: string;
    startInPause?: boolean;
    headless?: boolean;
  }) {
    if (config.name) {
      await this.locator('[data-test-id="wizard-overview-name-edit"]').click();
      await this._wizardNameInput.clear();
      await this._wizardNameInput.fill(config.name);
      await this.clickSave();
    }

    if (config.description) {
      await this.robustClick(
        this.locator(
          '[data-test-id="wizard-overview-description-edit"], button[data-test-id^="pw-vm-customize-it-"][data-test-id*="description"]',
        ),
      );
      const tabModal = this._tabModal;
      await tabModal.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
      const descTextarea = tabModal.locator('[aria-label="description text area"]');
      await descTextarea.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
      await descTextarea.clear();
      await descTextarea.fill(config.description);
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      const saveButtonInModal = tabModal.locator('button').filter({ hasText: 'Save' }).first();
      const saveButtonVisible = await saveButtonInModal
        .isVisible({ timeout: TestTimeouts.UI_DELAY_SHORT })
        .catch(() => false);
      if (saveButtonVisible) {
        await this.robustClick(saveButtonInModal);
      } else {
        await this.clickSave();
      }
    }

    if (config.cpu || config.memory) {
      await this._wizardCpuMemEditBtn.click();
      if (config.cpu) {
        await this._wizardCpuInput.clear();
        await this._wizardCpuInput.fill(config.cpu.toString());
      }
      if (config.memory) {
        await this._wizardMemInput.clear();
        await this._wizardMemInput.fill(config.memory.toString());
      }
      await this.clickSave();
    }

    if (config.bootMode) {
      await this.locator('[data-test-id="wizard-overview-boot-method-edit"]').click();
      const modalBody = this._pfV6CModalBoxBody;
      await modalBody.locator('button').first().click();
      // Use exact text matching to avoid partial matches (e.g., "UEFI" vs "UEFI(secure)")
      await this.clickElementByExactText('span', config.bootMode);
      await this.clickButtonByText('Save');
    }

    if (config.workload) {
      await this.locator('[data-test-id="wizard-overview-workload-profile-edit"]').click();
      const modalBody = this._tabModal;
      await modalBody.locator('button.pf-v6-c-menu-toggle').click();
      await this.locator('button', { hasText: config.workload }).click();
      await this.clickButtonByText('Save');
    }

    if (config.hostname) {
      await this._wizardHostnameEditBtn.waitFor({
        state: 'visible',
        timeout: TestTimeouts.RESOURCE_CREATION,
      });
      await this.robustClick(this._wizardHostnameEditBtn);
      await this._wizardHostnameInput.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this._wizardHostnameInput.fill(config.hostname);
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      const tabModal = this._tabModal;
      const saveButtonInModal = tabModal.locator('button').filter({ hasText: 'Save' }).first();
      const saveButtonVisible = await saveButtonInModal
        .isVisible({ timeout: TestTimeouts.UI_DELAY_SHORT })
        .catch(() => false);
      if (saveButtonVisible) {
        await this.robustClick(saveButtonInModal);
      } else {
        await this.clickSave();
      }
    }

    if (config.startInPause !== undefined) {
      await this._wizardStartInPauseCheckbox.waitFor({
        state: 'attached',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      const startInPauseChecked = await this._wizardStartInPauseCheckbox
        .isChecked()
        .catch(() => false);
      // Hidden PF switches: set `checked` and dispatch `change` (click may not reach the input).
      if (config.startInPause && !startInPauseChecked) {
        await this._wizardStartInPauseCheckbox.evaluate((el: HTMLInputElement) => {
          el.checked = true;
          el.dispatchEvent(new Event('change', { bubbles: true }));
        });
      } else if (!config.startInPause && startInPauseChecked) {
        await this._wizardStartInPauseCheckbox.evaluate((el: HTMLInputElement) => {
          el.checked = false;
          el.dispatchEvent(new Event('change', { bubbles: true }));
        });
      }
    }

    if (config.headless) {
      await this._wizardHeadlessCheckbox.waitFor({
        state: 'attached',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      const headlessChecked = await this._wizardHeadlessCheckbox.isChecked().catch(() => false);
      if (config.headless && !headlessChecked) {
        await this._wizardHeadlessCheckbox.evaluate((el: HTMLInputElement) => {
          el.checked = true;
          el.dispatchEvent(new Event('change', { bubbles: true }));
        });
      } else if (!config.headless && headlessChecked) {
        await this._wizardHeadlessCheckbox.evaluate((el: HTMLInputElement) => {
          el.checked = false;
          el.dispatchEvent(new Event('change', { bubbles: true }));
        });
      }
    }
  }
  /**
   * Fills the Scheduling tab in the customize wizard.
   *
   * @param config - Scheduling configuration
   */
  async fillWizardScheduling(config: {
    descheduler?: boolean;
    dedicatedResources?: boolean;
    evictionStrategy?: boolean;
    nodeSelector?: { key: string; value: string }; // Node selector key-value pair
  }) {
    await this.navigateToWizardVerticalTab('Scheduling');
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    if (config.descheduler !== undefined) {
      await this._wizardDeschedulerEditBtn.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this.robustClick(this._wizardDeschedulerEditBtn);
      const deschedulerChecked = await this._wizardDeschedulerCheckbox
        .isChecked()
        .catch(() => false);
      if (config.descheduler && !deschedulerChecked) {
        await this._wizardDeschedulerCheckbox.click({ force: true });
      } else if (!config.descheduler && deschedulerChecked) {
        await this._wizardDeschedulerCheckbox.click({ force: true });
      }
      await this.clickSave();
    }

    if (config.dedicatedResources !== undefined) {
      await this._wizardDedicatedResourcesEditBtn.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this.robustClick(this._wizardDedicatedResourcesEditBtn);
      const dedicatedResourcesChecked = await this._wizardDedicatedResourcesCheckbox
        .isChecked()
        .catch(() => false);
      if (config.dedicatedResources && !dedicatedResourcesChecked) {
        await this._wizardDedicatedResourcesCheckbox.click({ force: true });
      } else if (!config.dedicatedResources && dedicatedResourcesChecked) {
        await this._wizardDedicatedResourcesCheckbox.click({ force: true });
      }
      await this.clickSave();
    }

    if (config.evictionStrategy !== undefined) {
      // Eviction controls may be absent depending on wizard context / cluster capabilities.
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      const evictionBtnExists = await this._wizardEvictionStrategyEditBtn
        .isVisible({ timeout: TestTimeouts.UI_DELAY_SHORT })
        .catch(() => false);
      if (evictionBtnExists) {
        await this.robustClick(this._wizardEvictionStrategyEditBtn);
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
        const evictionStrategyChecked = await this._wizardEvictionStrategyCheckbox
          .isChecked()
          .catch(() => false);
        if (config.evictionStrategy && !evictionStrategyChecked) {
          await this._wizardEvictionStrategyCheckbox.click({ force: true });
        } else if (!config.evictionStrategy && evictionStrategyChecked) {
          await this._wizardEvictionStrategyCheckbox.click({ force: true });
        }
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
        await this.clickSave();
      } else {
        // Eviction strategy section may not be available - silently continue
      }
    }

    if (config.nodeSelector) {
      const noSelectorBtn = this.locator('button:has-text("No selector")');
      await noSelectorBtn.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
      await this.robustClick(noSelectorBtn);

      const addSelectorBtn = this.locator('#vm-labels-list-add-btn');
      await addSelectorBtn.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
      await this.robustClick(addSelectorBtn);

      const keyInput = this.locator('input[aria-label="selector key"]');
      const valueInput = this.locator('input[aria-label="selector value"]');
      await keyInput.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
      await keyInput.clear();
      await keyInput.fill(config.nodeSelector.key);
      await valueInput.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
      await valueInput.clear();
      await valueInput.fill(config.nodeSelector.value);

      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      const tabModal = this._tabModal;
      const saveButtonInModal = tabModal.locator('button').filter({ hasText: 'Save' }).first();
      const saveButtonVisible = await saveButtonInModal
        .isVisible({ timeout: TestTimeouts.UI_DELAY_SHORT })
        .catch(() => false);
      if (saveButtonVisible) {
        await this.robustClick(saveButtonInModal);
      } else {
        await this.clickSave();
      }
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
    }
  }

  /**
   * Fills the Scripts tab in the customize wizard with sysprep configuration.
   * Matches Cypress: fillScripts(vmData) function for sysprep
   *
   * @param config - Scripts configuration with sysprep
   */
  async fillWizardScripts(config: {
    sysprepName?: string; // Name of existing sysprep ConfigMap (e.g., "sysprep-vm-name")
    // Note: sysprepFile upload would require file handling and is not implemented yet
  }): Promise<void> {
    await this.navigateToWizardHorizontalTab('Scripts');

    if (config.sysprepName) {
      const sysprepSection = this.locator('text=Sysprep').locator('..');
      const editButton = sysprepSection.locator('button').first();
      await editButton.waitFor({ state: 'visible', timeout: TestTimeouts.RESOURCE_CREATION });
      await this.robustClick(editButton);

      const attachExistingButton = this.locator('button:has-text("Attach existing sysprep")');
      await attachExistingButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this.robustClick(attachExistingButton);

      const selectButton = this.locator('button:has-text("--- Select sysprep ---")');
      await selectButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
      await this.robustClick(selectButton);

      const sysprepOption = this.locator(`button:has-text("sysprep-${config.sysprepName}")`);
      await sysprepOption.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
      await this.robustClick(sysprepOption);

      await this.clickSave();
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
    }
  }

  /**
   * Fills the SSH section in the Scripts tab of the customize wizard with a new secret.
   * Matches Cypress: fillSSH(vmData) function for newSecret
   * Note: SSH is part of the Scripts tab, not a separate tab
   *
   * @param secretName - The name for the new secret
   * @param sshKeyFilePath - Path to the SSH key file to upload (default: './fixtures/rsa.pub')
   */
  async fillWizardSSH(secretName: string, sshKeyFilePath: string): Promise<void> {
    await this.navigateToWizardHorizontalTab('Scripts');

    const sshEditButton = this.locator('[data-test-id="wizard-sshkey-edit"]');
    await sshEditButton.waitFor({ state: 'visible', timeout: TestTimeouts.RESOURCE_CREATION });
    await this.robustClick(sshEditButton);

    const addNewButton = this.locator('#addNew');
    await this.robustClick(addNewButton);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    // File inputs stay hidden in PF; wait for attachment, not visibility.
    const uploadInput = this.locator('input[type="file"]');
    await uploadInput.waitFor({ state: 'attached', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });

    await uploadInput.setInputFiles(sshKeyFilePath);

    const secretNameInput = this.locator('#new-secret-name');
    await secretNameInput.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    await secretNameInput.clear();
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    // Slow typing so reactive validation can enable Save.
    await secretNameInput.type(secretName, { delay: 150 });

    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    const saveButton = this.locator('[data-test="save-button"]');
    await saveButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(saveButton);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async navigateToWizardHorizontalTab(
    tabName:
      | 'Overview'
      | 'Scheduling'
      | 'Environment'
      | 'Network interfaces'
      | 'Disks'
      | 'Scripts'
      | 'Metadata',
  ) {
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    const tabLocator = this.locator(`[data-test-id="horizontal-link-${tabName}"]`);
    await this.robustClick(tabLocator);
  }

  /**
   * Navigates to the Scripts tab in the customize wizard.
   */
  async navigateToWizardScriptsTab(): Promise<void> {
    await this.navigateToWizardHorizontalTab('Scripts');
  }

  /**
   * Navigates to a specific tab in the customize wizard using vertical tabs.
   * Use this method when you explicitly need vertical tabs (instance type-based wizard).
   *
   * @param tabName - The tab name ('Details', 'Storage', 'Network', 'Scheduling', 'SSH', 'Initial run', 'Metadata')
   */
  async navigateToWizardVerticalTab(
    tabName: 'Details' | 'Storage' | 'Network' | 'Scheduling' | 'SSH' | 'Initial run' | 'Metadata',
  ) {
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    const tabMapping: Record<typeof tabName, string> = {
      Details: 'vm-configuration-details',
      Storage: 'vm-configuration-storage',
      Network: 'vm-configuration-network',
      Scheduling: 'vm-configuration-scheduling',
      SSH: 'vm-configuration-ssh',
      'Initial run': 'vm-configuration-initial',
      Metadata: 'vm-configuration-metadata',
    };

    const verticalTabId = tabMapping[tabName];
    if (!verticalTabId) {
      throw new Error(`Unknown tab name: ${tabName}`);
    }

    const tabLocator = this.locator(`[data-test-id="${verticalTabId}"]`);
    await tabLocator.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(tabLocator);
  }

  /**
   * Verifies that "Not found" message appears in the Networks tab (indicating no NICs).
   * Matches Cypress: cy.contains('Not found').should('exist');
   *
   * @returns True if "Not found" message is visible or no NICs are present, false otherwise
   */
  async verifyNetworksTabNotFoundMessage(): Promise<boolean> {
    try {
      await this.navigateToWizardHorizontalTab('Network interfaces');
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_LONG);

      const nicToggleCount = await this._wizardNicToggle.count();
      if (nicToggleCount === 0) {
        return true;
      }

      const notFoundSelectors = [
        'text=Not found',
        'text=/not found/i',
        '[data-test="empty-state"]',
        '.pf-v6-c-empty-state',
        '.pf-v6-c-empty-state__body',
        'text=No network interfaces',
        'text=No network',
      ];

      for (const selector of notFoundSelectors) {
        try {
          const notFoundLocator = this.locator(selector).first();
          const isVisible = await notFoundLocator.isVisible({
            timeout: TestTimeouts.UI_DELAY_SHORT,
          });
          if (isVisible) {
            const text = await notFoundLocator.textContent().catch(() => '');
            if (
              text?.toLowerCase().includes('not found') ||
              text?.toLowerCase().includes('no network')
            ) {
              return true;
            }
          }
        } catch {}
      }

      const networksTabContent = this.locator('[data-test-id="wizard-tab-Networks"]')
        .locator('..')
        .locator('..');
      const tabText = await networksTabContent.textContent().catch(() => '');
      if (
        tabText?.toLowerCase().includes('not found') ||
        tabText?.toLowerCase().includes('no network')
      ) {
        return true;
      }

      const toggleVisible = await this._wizardNicToggle
        .isVisible({ timeout: TestTimeouts.UI_DELAY_SHORT })
        .catch(() => false);
      return !toggleVisible;
    } catch {
      return false;
    }
  }

  /**
   * Verifies if the SSH key edit button is disabled in the Scripts tab.
   * This button should be disabled for Windows templates.
   * @returns true if disabled, false otherwise
   */
  async verifySSHKeyEditButtonDisabled(): Promise<boolean> {
    try {
      await this._wizardSSHKeyEditButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      return await this._wizardSSHKeyEditButton.isDisabled();
    } catch {
      return false;
    }
  }

  /**
   * Verifies if the SSH key edit button is visible in the Scripts tab.
   * This button should be visible for Linux templates.
   * @returns true if visible, false otherwise
   */
  async verifySSHKeyEditButtonVisible(): Promise<boolean> {
    try {
      await this._wizardSSHKeyEditButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      return await this._wizardSSHKeyEditButton.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Verifies if the Sysprep edit button is enabled in the Scripts tab.
   * @returns true if enabled, false otherwise
   */
  async verifySysprepEditButtonEnabled(): Promise<boolean> {
    try {
      await this._wizardSysprepEditButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      return await this._wizardSysprepEditButton.isEnabled();
    } catch {
      return false;
    }
  }

  /**
   * Verifies if the Sysprep edit button is visible in the Scripts tab.
   * This button should be visible for Windows templates.
   * @returns true if visible, false otherwise
   */
  async verifySysprepEditButtonVisible(): Promise<boolean> {
    try {
      await this._wizardSysprepEditButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      return await this._wizardSysprepEditButton.isVisible();
    } catch {
      return false;
    }
  }
}

export class CreateVmWizardComponent extends BaseComponent {
  private readonly _advancedSettingsBtn = this.locator('button:has-text("Advanced settings")');
  private readonly _buttonIncrement = this.locator('button[aria-label="Increment"]');
  private readonly _dedicatedResources = this.locator('#dedicated-resources');
  private readonly _dedicatedResourcesEdit = this.locator(
    '[data-test-id="dedicated-resources-edit"]',
  );
  private readonly _descheduler = this.locator('#descheduler');
  private readonly _deschedulerEdit = this.locator('[data-test-id="descheduler-edit"]');
  private readonly _evictionStrategy = this.locator('#eviction-strategy');
  private readonly _evictionStrategyButton = this.locator(
    '[data-test-id="eviction-strategy"] button',
  );
  private readonly _headlessMode = this.locator('#headless-mode');
  private readonly _inputhostname = this.locator('input#hostname');
  private readonly _inputInput = this.locator('input[aria-label="Input"]');
  private readonly _inputNameCpuInput = this.locator('input[name="cpu-input"]');
  private readonly _inputNameMemoryInput = this.locator('input[name="memory-input"]');
  private readonly _inputNameVolumename = this.locator('input[name="volume.name"]');
  private readonly _selectPersistentVolumeClaimBtn = this.locator(
    'button:has-text("Select PersistentVolumeClaim")',
  );
  private readonly _selectProjectBtn = this.locator('button:has-text("Select Project")');
  private readonly _startInPauseMode = this.locator('#start-in-pause-mode');
  private readonly _storageClassSelect = this.locator('[data-test-id="storage-class-select"]');
  private readonly _tabModal = this.locator('#tab-modal');
  private readonly _tagsInput = this.locator('[data-test="tags-input"]');
  private readonly _toggleIdNetwork = this.locator('#toggle-id-network');
  private readonly _vmName = this.locator('#vm-name');
  private readonly _wizardSSHKeyEditButton = this.locator('[data-test-id="wizard-sshkey-edit"]');
  private readonly _wizardSysprepEditButton = this.locator('[data-test-id="wizard-sysprep-edit"]');

  constructor(page: Page) {
    super(page);
  }

  async addDiskInSidebarWizard(diskConfig: {
    name: string;
    diskType?: string;
    diskSource?: {
      sourceNs?: string;
      sourcePvc?: string;
      value?: string;
    };
    size?: string;
    storageClass?: string;
  }): Promise<void> {
    const addButton = this.locator('.sidebar-editor button', { hasText: 'Add' });
    await addButton.waitFor({ state: 'visible', timeout: TestTimeouts.RESOURCE_CREATION });
    await this.robustClick(addButton);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    if (diskConfig.diskType) {
      const diskTypeOption = this.locator(`text=${diskConfig.diskType}`);
      await diskTypeOption.waitFor({ state: 'visible', timeout: TestTimeouts.RESOURCE_CREATION });
      await this.robustClick(diskTypeOption);
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
    }

    const nameInput = this._inputNameVolumename;
    await nameInput.waitFor({ state: 'visible', timeout: TestTimeouts.RESOURCE_CREATION });
    await nameInput.clear();
    await nameInput.fill(diskConfig.name);

    if (diskConfig.diskType === 'Clone volume' && diskConfig.diskSource) {
      if (diskConfig.diskSource.sourceNs) {
        const selectPVCNS = this._selectProjectBtn;
        await selectPVCNS.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
        await this.robustClick(selectPVCNS);
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

        const nsOption = this.locator(
          `[role="listbox"] button:has-text("${diskConfig.diskSource.sourceNs}")`,
        );
        await nsOption.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
        await this.robustClick(nsOption);
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
      }

      if (diskConfig.diskSource.sourcePvc) {
        const selectPVCName = this._selectPersistentVolumeClaimBtn;
        await selectPVCName.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
        await this.robustClick(selectPVCName);
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

        const pvcOption = this.locator(
          `[role="listbox"] button:has-text("${diskConfig.diskSource.sourcePvc}")`,
        );
        await pvcOption.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
        await this.robustClick(pvcOption);
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
      }
    }

    if (diskConfig.size) {
      const sizeInput = this._inputInput;
      const sizeInputExists = await sizeInput
        .isVisible({ timeout: TestTimeouts.UI_DELAY_LONG })
        .catch(() => false);
      if (sizeInputExists) {
        await sizeInput.clear();
        const incrementButton = this._buttonIncrement;
        for (let i = 0; i < parseInt(diskConfig.size); i++) {
          await this.robustClick(incrementButton);
        }
      }
    }

    if (diskConfig.storageClass) {
      const storageClassSelect = this._storageClassSelect;
      await storageClassSelect.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this.robustClick(storageClassSelect);
      const storageClassOption = this.locator(
        `button#select-inline-filter-${diskConfig.storageClass}`,
      );
      await storageClassOption.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this.robustClick(storageClassOption);
    }

    await this.clickDialogSaveButton();
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_LONG);
  }

  async addDiskInWizard(diskConfig: {
    name: string;
    diskType?: string;
    diskSource?: {
      name?: string;
      selector?: string;
      value?: string;
    };
    size?: string;
    storageClass?: string;
    type?: string;
    shareDisk?: boolean;
    scsiReservation?: boolean;
  }): Promise<void> {
    const addButton = this.locator('.kv-configuration-vm-disk-list button', { hasText: 'Add' });
    await addButton.waitFor({ state: 'visible', timeout: TestTimeouts.RESOURCE_CREATION });
    await this.robustClick(addButton);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    const diskType = diskConfig.diskType || 'Empty disk (blank)';
    const diskTypeOption = this.locator(`text=${diskType}`);
    await diskTypeOption.waitFor({ state: 'visible', timeout: TestTimeouts.RESOURCE_CREATION });
    await this.robustClick(diskTypeOption);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    const nameInput = this._inputNameVolumename;
    await nameInput.waitFor({ state: 'visible', timeout: TestTimeouts.RESOURCE_CREATION });
    await nameInput.clear();
    await nameInput.fill(diskConfig.name);

    if (diskConfig.diskSource) {
      if (diskConfig.diskType === 'Clone volume') {
        const selectPVCNS = this._selectProjectBtn;
        await selectPVCNS.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
        await this.robustClick(selectPVCNS);
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

        const selectPVCName = this._selectPersistentVolumeClaimBtn;
        await selectPVCName.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
        await this.robustClick(selectPVCName);
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
      }

      if (diskConfig.diskSource.value && diskConfig.diskType) {
        const containerSourceInput = this.locator('[data-test-id="disk-source-container"]');
        await containerSourceInput.waitFor({
          state: 'visible',
          timeout: TestTimeouts.UI_ACTION_COMPLETE,
        });
        await containerSourceInput.clear();
        await containerSourceInput.fill(diskConfig.diskSource.value);
      }
    }

    if (diskConfig.size) {
      const sizeInput = this._inputInput;
      const sizeInputExists = await sizeInput
        .isVisible({ timeout: TestTimeouts.UI_DELAY_LONG })
        .catch(() => false);
      if (sizeInputExists) {
        await sizeInput.clear();
        const incrementButton = this._buttonIncrement;
        for (let i = 0; i < parseInt(diskConfig.size); i++) {
          await this.robustClick(incrementButton);
        }
      }
    }

    if (diskConfig.type) {
      const diskTypeSelect = this.locator('[data-test-id="disk-type-select"]');
      await diskTypeSelect.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
      await this.robustClick(diskTypeSelect);
      const typeOption = this.locator(`[data-test-id="disk-type-select-${diskConfig.type}"]`);
      await typeOption.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
      await this.robustClick(typeOption);
    }

    if (diskConfig.storageClass) {
      const storageClassSelect = this._storageClassSelect;
      await storageClassSelect.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this.robustClick(storageClassSelect);
      const storageClassOption = this.locator(
        `button#select-inline-filter-${diskConfig.storageClass}`,
      );
      await storageClassOption.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this.robustClick(storageClassOption);
    }

    if (diskConfig.shareDisk) {
      const advancedSettingsButton = this._advancedSettingsBtn;
      await advancedSettingsButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this.robustClick(advancedSettingsButton);
      const shareDiskCheckbox = this.locator('input[id="sharable-disk"]');
      await shareDiskCheckbox.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await shareDiskCheckbox.check({ force: true });
    }

    if (diskConfig.scsiReservation) {
      const advancedSettingsButton = this._advancedSettingsBtn;
      await advancedSettingsButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this.robustClick(advancedSettingsButton);
      const scsiReservationCheckbox = this.locator('input[id="lun-reservation"]');
      await scsiReservationCheckbox.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await scsiReservationCheckbox.check({ force: true });
    }

    await this.clickDialogSaveButton();
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_LONG);
  }

  async clickCancelButton(): Promise<void> {
    const wizardCancelButton = this.locator('button:has-text("Cancel")');
    await wizardCancelButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.RESOURCE_CREATION,
    });

    this.page.once('dialog', (dialog) => dialog.accept());
    await this.robustClick(wizardCancelButton);
  }

  async fillWizardMetadata(config: {
    labels?: string[];
    annotations?: Array<{ key: string; value: string }>;
    expectedAnnotationsCount?: number;
  }): Promise<void> {
    await this.navigateToWizardVerticalTab('Metadata');
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    if (config.labels && config.labels.length > 0) {
      await this.locator(
        '[data-test-id="wizard-metadata-labels-edit"], button[data-test-id^="pw-vm-customize-it-"][data-test-id*="labels"]',
      ).waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this.robustClick(
        this.locator(
          '[data-test-id="wizard-metadata-labels-edit"], button[data-test-id^="pw-vm-customize-it-"][data-test-id*="labels"]',
        ),
      );

      await this._tagsInput.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this._tagsInput.clear();

      for (const label of config.labels) {
        await this._tagsInput.fill(label);
        await this.page.keyboard.press('Enter');
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      }

      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      const tabModal = this._tabModal;
      const saveButtonInModal = tabModal.locator('button').filter({ hasText: 'Save' }).first();
      const saveButtonVisible = await saveButtonInModal
        .isVisible({ timeout: TestTimeouts.UI_DELAY_SHORT })
        .catch(() => false);
      if (saveButtonVisible) {
        await this.robustClick(saveButtonInModal);
      } else {
        await this.clickSave();
      }
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
    }

    if (config.annotations && config.annotations.length > 0) {
      const annotationsCount = config.expectedAnnotationsCount ?? 1;
      const annotationsText =
        annotationsCount === 1 ? '1 Annotation' : `${annotationsCount} Annotations`;
      const annotationsBtn = this.locator(`button:has-text("${annotationsText}")`);

      const annotationsBtnExists = await annotationsBtn
        .isVisible({ timeout: TestTimeouts.UI_DELAY_SHORT })
        .catch(() => false);
      if (!annotationsBtnExists) {
        const altAnnotationsBtn = this.locator('button[data-test-id*="annotation"]').first();
        const altExists = await altAnnotationsBtn
          .isVisible({ timeout: TestTimeouts.UI_DELAY_SHORT })
          .catch(() => false);
        if (altExists) {
          await this.robustClick(altAnnotationsBtn);
        } else {
          return;
        }
      } else {
        await this.robustClick(annotationsBtn);
      }

      for (const annotation of config.annotations) {
        const addButton = this.locator('button:has-text("Add more")');
        await addButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
        await this.robustClick(addButton);

        const keyInput = this.locator('input[aria-label="annotation key"]').last();
        const valueInput = this.locator('input[aria-label="annotation value"]').last();
        await keyInput.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
        await keyInput.fill(annotation.key);
        await valueInput.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
        await valueInput.fill(annotation.value);
      }

      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      const tabModal = this._tabModal;
      const saveButtonInModal = tabModal.locator('button').filter({ hasText: 'Save' }).first();
      const saveButtonVisible = await saveButtonInModal
        .isVisible({ timeout: TestTimeouts.UI_DELAY_SHORT })
        .catch(() => false);
      if (saveButtonVisible) {
        await this.robustClick(saveButtonInModal);
      } else {
        await this.clickSave();
      }
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
    }
  }

  async fillWizardOverview(config: {
    name?: string;
    description?: string;
    cpu?: number;
    memory?: number;
    bootMode?: string;
    workload?: string;
    hostname?: string;
    startInPause?: boolean;
    headless?: boolean;
  }) {
    if (config.name) {
      await this.locator('[data-test-id="wizard-overview-name-edit"]').click();
      await this._vmName.clear();
      await this._vmName.fill(config.name);
      await this.clickSave();
    }

    if (config.description) {
      await this.robustClick(
        this.locator(
          '[data-test-id="wizard-overview-description-edit"], button[data-test-id^="pw-vm-customize-it-"][data-test-id*="description"]',
        ),
      );
      const tabModal = this._tabModal;
      await tabModal.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
      const descTextarea = tabModal.locator('[aria-label="description text area"]');
      await descTextarea.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
      await descTextarea.clear();
      await descTextarea.fill(config.description);
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      const saveButtonInModal = tabModal.locator('button').filter({ hasText: 'Save' }).first();
      const saveButtonVisible = await saveButtonInModal
        .isVisible({ timeout: TestTimeouts.UI_DELAY_SHORT })
        .catch(() => false);
      if (saveButtonVisible) {
        await this.robustClick(saveButtonInModal);
      } else {
        await this.clickSave();
      }
    }

    if (config.cpu || config.memory) {
      await this.locator('[data-test-id="wizard-overview-cpu-memory-edit"]').click();
      if (config.cpu) {
        await this._inputNameCpuInput.clear();
        await this._inputNameCpuInput.fill(config.cpu.toString());
      }
      if (config.memory) {
        await this._inputNameMemoryInput.clear();
        await this._inputNameMemoryInput.fill(config.memory.toString());
      }
      await this.clickSave();
    }

    if (config.bootMode) {
      await this.locator('[data-test-id="wizard-overview-boot-method-edit"]').click();
      const modalBody = this.locator('.pf-v6-c-modal-box__body');
      await modalBody.locator('button').first().click();

      await this.clickElementByExactText('span', config.bootMode);
      await this.clickButtonByText('Save');
    }

    if (config.workload) {
      await this.locator('[data-test-id="wizard-overview-workload-profile-edit"]').click();
      const modalBody = this._tabModal;
      await modalBody.locator('button.pf-v6-c-menu-toggle').click();
      await this.locator('button', { hasText: config.workload }).click();
      await this.clickButtonByText('Save');
    }

    if (config.hostname) {
      await this.locator(
        '[data-test-id="wizard-overview-hostname-edit"], button[data-test-id^="pw-vm-customize-it-"][data-test-id*="hostname"]',
      ).waitFor({
        state: 'visible',
        timeout: TestTimeouts.RESOURCE_CREATION,
      });
      await this.robustClick(
        this.locator(
          '[data-test-id="wizard-overview-hostname-edit"], button[data-test-id^="pw-vm-customize-it-"][data-test-id*="hostname"]',
        ),
      );
      await this._inputhostname.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this._inputhostname.fill(config.hostname);
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      const tabModal = this._tabModal;
      const saveButtonInModal = tabModal.locator('button').filter({ hasText: 'Save' }).first();
      const saveButtonVisible = await saveButtonInModal
        .isVisible({ timeout: TestTimeouts.UI_DELAY_SHORT })
        .catch(() => false);
      if (saveButtonVisible) {
        await this.robustClick(saveButtonInModal);
      } else {
        await this.clickSave();
      }
    }

    if (config.startInPause !== undefined) {
      await this._startInPauseMode.waitFor({
        state: 'attached',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      const startInPauseChecked = await this._startInPauseMode.isChecked().catch(() => false);
      if (config.startInPause && !startInPauseChecked) {
        await this._startInPauseMode.evaluate((el: HTMLInputElement) => {
          el.checked = true;
          el.dispatchEvent(new Event('change', { bubbles: true }));
        });
      } else if (!config.startInPause && startInPauseChecked) {
        await this._startInPauseMode.evaluate((el: HTMLInputElement) => {
          el.checked = false;
          el.dispatchEvent(new Event('change', { bubbles: true }));
        });
      }
    }

    if (config.headless) {
      await this._headlessMode.waitFor({
        state: 'attached',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      const headlessChecked = await this._headlessMode.isChecked().catch(() => false);
      if (config.headless && !headlessChecked) {
        await this._headlessMode.evaluate((el: HTMLInputElement) => {
          el.checked = true;
          el.dispatchEvent(new Event('change', { bubbles: true }));
        });
      } else if (!config.headless && headlessChecked) {
        await this._headlessMode.evaluate((el: HTMLInputElement) => {
          el.checked = false;
          el.dispatchEvent(new Event('change', { bubbles: true }));
        });
      }
    }
  }

  async fillWizardScheduling(config: {
    descheduler?: boolean;
    dedicatedResources?: boolean;
    evictionStrategy?: boolean;
    nodeSelector?: { key: string; value: string };
  }) {
    await this.navigateToWizardVerticalTab('Scheduling');
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    if (config.descheduler !== undefined) {
      await this._deschedulerEdit.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this.robustClick(this._deschedulerEdit);
      const deschedulerChecked = await this._descheduler.isChecked().catch(() => false);
      if (config.descheduler && !deschedulerChecked) {
        await this._descheduler.click({ force: true });
      } else if (!config.descheduler && deschedulerChecked) {
        await this._descheduler.click({ force: true });
      }
      await this.clickSave();
    }

    if (config.dedicatedResources !== undefined) {
      await this._dedicatedResourcesEdit.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this.robustClick(this._dedicatedResourcesEdit);
      const dedicatedResourcesChecked = await this._dedicatedResources
        .isChecked()
        .catch(() => false);
      if (config.dedicatedResources && !dedicatedResourcesChecked) {
        await this._dedicatedResources.click({ force: true });
      } else if (!config.dedicatedResources && dedicatedResourcesChecked) {
        await this._dedicatedResources.click({ force: true });
      }
      await this.clickSave();
    }

    if (config.evictionStrategy !== undefined) {
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      const evictionBtnExists = await this._evictionStrategyButton
        .isVisible({ timeout: TestTimeouts.UI_DELAY_SHORT })
        .catch(() => false);
      if (evictionBtnExists) {
        await this.robustClick(this._evictionStrategyButton);
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
        const evictionStrategyChecked = await this._evictionStrategy.isChecked().catch(() => false);
        if (config.evictionStrategy && !evictionStrategyChecked) {
          await this._evictionStrategy.click({ force: true });
        } else if (!config.evictionStrategy && evictionStrategyChecked) {
          await this._evictionStrategy.click({ force: true });
        }
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
        await this.clickSave();
      }
    }

    if (config.nodeSelector) {
      const noSelectorBtn = this.locator('button:has-text("No selector")');
      await noSelectorBtn.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
      await this.robustClick(noSelectorBtn);

      const addSelectorBtn = this.locator('#vm-labels-list-add-btn');
      await addSelectorBtn.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
      await this.robustClick(addSelectorBtn);

      const keyInput = this.locator('input[aria-label="selector key"]');
      const valueInput = this.locator('input[aria-label="selector value"]');
      await keyInput.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
      await keyInput.clear();
      await keyInput.fill(config.nodeSelector.key);
      await valueInput.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
      await valueInput.clear();
      await valueInput.fill(config.nodeSelector.value);

      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      const tabModal = this._tabModal;
      const saveButtonInModal = tabModal.locator('button').filter({ hasText: 'Save' }).first();
      const saveButtonVisible = await saveButtonInModal
        .isVisible({ timeout: TestTimeouts.UI_DELAY_SHORT })
        .catch(() => false);
      if (saveButtonVisible) {
        await this.robustClick(saveButtonInModal);
      } else {
        await this.clickSave();
      }
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
    }
  }

  async fillWizardScripts(config: { sysprepName?: string }): Promise<void> {
    await this.navigateToWizardHorizontalTab('Scripts');

    if (config.sysprepName) {
      const sysprepSection = this.locator('text=Sysprep').locator('..');
      const editButton = sysprepSection.locator('button').first();
      await editButton.waitFor({ state: 'visible', timeout: TestTimeouts.RESOURCE_CREATION });
      await this.robustClick(editButton);

      const attachExistingButton = this.locator('button:has-text("Attach existing sysprep")');
      await attachExistingButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this.robustClick(attachExistingButton);

      const selectButton = this.locator('button:has-text("--- Select sysprep ---")');
      await selectButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
      await this.robustClick(selectButton);

      const sysprepOption = this.locator(`button:has-text("sysprep-${config.sysprepName}")`);
      await sysprepOption.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
      await this.robustClick(sysprepOption);

      await this.clickSave();
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
    }
  }

  async fillWizardSSH(secretName: string, sshKeyFilePath: string): Promise<void> {
    await this.navigateToWizardHorizontalTab('Scripts');

    const sshEditButton = this.locator('[data-test-id="wizard-sshkey-edit"]');
    await sshEditButton.waitFor({ state: 'visible', timeout: TestTimeouts.RESOURCE_CREATION });
    await this.robustClick(sshEditButton);

    const addNewButton = this.locator('#addNew');
    await this.robustClick(addNewButton);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    const uploadInput = this.locator('input[type="file"]');
    await uploadInput.waitFor({ state: 'attached', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });

    await uploadInput.setInputFiles(sshKeyFilePath);

    const secretNameInput = this.locator('#new-secret-name');
    await secretNameInput.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    await secretNameInput.clear();
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    await secretNameInput.type(secretName, { delay: 150 });

    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    const saveButton = this.locator('[data-test="save-button"]');
    await saveButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(saveButton);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async navigateToWizardHorizontalTab(
    tabName:
      | 'Overview'
      | 'Scheduling'
      | 'Environment'
      | 'Network interfaces'
      | 'Disks'
      | 'Scripts'
      | 'Metadata',
  ) {
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    const tabLocator = this.locator(`[data-test-id="horizontal-link-${tabName}"]`);
    await this.robustClick(tabLocator);
  }

  async navigateToWizardScriptsTab(): Promise<void> {
    await this.navigateToWizardHorizontalTab('Scripts');
  }

  async navigateToWizardVerticalTab(
    tabName: 'Details' | 'Storage' | 'Network' | 'Scheduling' | 'SSH' | 'Initial run' | 'Metadata',
  ) {
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    const tabMapping: Record<typeof tabName, string> = {
      Details: 'vm-configuration-details',
      Storage: 'vm-configuration-storage',
      Network: 'vm-configuration-network',
      Scheduling: 'vm-configuration-scheduling',
      SSH: 'vm-configuration-ssh',
      'Initial run': 'vm-configuration-initial',
      Metadata: 'vm-configuration-metadata',
    };

    const verticalTabId = tabMapping[tabName];
    if (!verticalTabId) {
      throw new Error(`Unknown tab name: ${tabName}`);
    }

    const tabLocator = this.locator(`[data-test-id="${verticalTabId}"]`);
    await tabLocator.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(tabLocator);
  }

  async verifyNetworksTabNotFoundMessage(): Promise<boolean> {
    try {
      await this.navigateToWizardHorizontalTab('Network interfaces');
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_LONG);

      const nicToggleCount = await this._toggleIdNetwork.count();
      if (nicToggleCount === 0) {
        return true;
      }

      const notFoundSelectors = [
        'text=Not found',
        'text=/not found/i',
        '[data-test="empty-state"]',
        '.pf-v6-c-empty-state',
        '.pf-v6-c-empty-state__body',
        'text=No network interfaces',
        'text=No network',
      ];

      for (const selector of notFoundSelectors) {
        try {
          const notFoundLocator = this.locator(selector).first();
          const isVisible = await notFoundLocator.isVisible({
            timeout: TestTimeouts.UI_DELAY_SHORT,
          });
          if (isVisible) {
            const text = await notFoundLocator.textContent().catch(() => '');
            if (
              text?.toLowerCase().includes('not found') ||
              text?.toLowerCase().includes('no network')
            ) {
              return true;
            }
          }
        } catch {}
      }

      const networksTabContent = this.locator('[data-test-id="wizard-tab-Networks"]')
        .locator('..')
        .locator('..');
      const tabText = await networksTabContent.textContent().catch(() => '');
      if (
        tabText?.toLowerCase().includes('not found') ||
        tabText?.toLowerCase().includes('no network')
      ) {
        return true;
      }

      const toggleVisible = await this._toggleIdNetwork
        .isVisible({ timeout: TestTimeouts.UI_DELAY_SHORT })
        .catch(() => false);
      return !toggleVisible;
    } catch {
      return false;
    }
  }

  async verifySSHKeyEditButtonDisabled(): Promise<boolean> {
    try {
      await this._wizardSSHKeyEditButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      return await this._wizardSSHKeyEditButton.isDisabled();
    } catch {
      return false;
    }
  }

  async verifySSHKeyEditButtonVisible(): Promise<boolean> {
    try {
      await this._wizardSSHKeyEditButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      return await this._wizardSSHKeyEditButton.isVisible();
    } catch {
      return false;
    }
  }

  async verifySysprepEditButtonEnabled(): Promise<boolean> {
    try {
      await this._wizardSysprepEditButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      return await this._wizardSysprepEditButton.isEnabled();
    } catch {
      return false;
    }
  }

  async verifySysprepEditButtonVisible(): Promise<boolean> {
    try {
      await this._wizardSysprepEditButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      return await this._wizardSysprepEditButton.isVisible();
    } catch {
      return false;
    }
  }
}
