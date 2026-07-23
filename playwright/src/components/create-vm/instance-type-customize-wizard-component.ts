/**
 * Page object for the Instance Type-based VM customization wizard.
 * Uses vertical tabs (vm-configuration-* pattern) for navigation between wizard sections.
 * Handles VM configuration for name, description, CPU/memory, scheduling, networks, storage, scripts, and metadata.
 */

import BaseComponent from '@/components/shared/base-component';
import { SSH_KEY_PATHS } from '@/data-models';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

export default class InstanceTypeCustomizeWizardComponent extends BaseComponent {
  private readonly _advancedSettingsBtn = this.locator('button:has-text("Advanced settings")');
  private readonly _inputKey = this.locator('input[aria-label="Key"]');
  private readonly _inputValue = this.locator('input[aria-label="Value"]');
  private readonly _tabModal = this.locator('#tab-modal');
  private readonly _wizardHeadlessCheckbox = this.locator('#headless-mode');
  private readonly _wizardNicToggle = this.locator('#toggle-id-network');

  constructor(page: Page) {
    super(page);
  }

  async addDisk(diskConfig: {
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
    await this.navigateToWizardTab('Storage');

    const addButton = this.locator('button:has-text("Add")');
    await addButton.waitFor({ state: 'visible', timeout: TestTimeouts.RESOURCE_CREATION });
    await this.robustClick(addButton);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    const diskType = diskConfig.diskType || 'Empty disk (blank)';
    const diskTypeOption = this.locator(`text=${diskType}`);
    await diskTypeOption.waitFor({ state: 'visible', timeout: TestTimeouts.RESOURCE_CREATION });
    await this.robustClick(diskTypeOption);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    const nameInput = this.locator('input[aria-label="Disk name"]');
    await nameInput.waitFor({ state: 'visible', timeout: TestTimeouts.RESOURCE_CREATION });
    await nameInput.clear();
    await nameInput.fill(diskConfig.name);

    if (diskConfig.diskSource) {
      if (diskConfig.diskSource.name === 'cloneVolume') {
        const selectPVCNS = this.locator('button:has-text("Select Project")');
        await selectPVCNS.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
        await this.robustClick(selectPVCNS);
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

        const selectPVCName = this.locator('button:has-text("Select PersistentVolumeClaim")');
        await selectPVCName.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
        await this.robustClick(selectPVCName);
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
      }
    }

    if (diskConfig.size) {
      const sizeInput = this.locator('input[aria-label="Input"]');
      const sizeInputExists = await sizeInput
        .isVisible({ timeout: TestTimeouts.UI_DELAY_LONG })
        .catch(() => false);
      if (sizeInputExists) {
        await sizeInput.clear();
        const incrementButton = this.locator('button[aria-label="Increment"]');
        for (let i = 0; i < parseInt(diskConfig.size); i++) {
          await this.robustClick(incrementButton);
        }
      }
    }

    if (diskConfig.type) {
      const diskTypeSelect = this.testId('disk-type-select');
      await diskTypeSelect.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
      await this.robustClick(diskTypeSelect);
      const typeOption = this.testId(`disk-type-select-${diskConfig.type}`);
      await typeOption.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
      await this.robustClick(typeOption);
    }

    if (diskConfig.storageClass) {
      const storageClassSelect = this.testId('storage-class-select');
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
      const scsiReservationCheckbox = this.locator('input[id="scsi-reservation"]');
      await scsiReservationCheckbox.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await scsiReservationCheckbox.check({ force: true });
    }

    await this.clickSave();
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async addGpuDevice(gpuName = 'vgpu_test', gpuResourceName = 'nvidia.com'): Promise<void> {
    const gpuDevicesButton = this.locator('button:has-text("GPU devices")');
    await gpuDevicesButton.waitFor({ state: 'visible', timeout: TestTimeouts.RESOURCE_CREATION });
    await this.robustClick(gpuDevicesButton);

    const addGpuDeviceButton = this.locator('button:has-text("Add GPU device")');
    await addGpuDeviceButton.waitFor({ state: 'visible', timeout: TestTimeouts.RESOURCE_CREATION });
    await this.robustClick(addGpuDeviceButton);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    const optionsMenuButton = this.locator('button[aria-label="Options menu"]');
    await optionsMenuButton.waitFor({ state: 'visible', timeout: TestTimeouts.RESOURCE_CREATION });
    await this.robustClick(optionsMenuButton);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    const gpuResourceOption = this.locator(`button:has-text("${gpuResourceName}")`);
    await gpuResourceOption.waitFor({ state: 'visible', timeout: TestTimeouts.RESOURCE_CREATION });
    await this.robustClick(gpuResourceOption);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    const gpuNameInput = this.locator('input#name');
    await gpuNameInput.waitFor({ state: 'visible', timeout: TestTimeouts.RESOURCE_CREATION });
    await gpuNameInput.clear();
    await gpuNameInput.fill(gpuName);

    const saveButton = this.locator('button.pf-m-plain')
      .locator('svg[viewBox="0 0 512 512"]')
      .locator('..');
    await saveButton.waitFor({ state: 'visible', timeout: TestTimeouts.RESOURCE_CREATION });
    await this.robustClick(saveButton);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    const resourceRow = this.locator('[data-test-rows="resource-row"]');
    const gpuRow = resourceRow.locator(`text=${gpuName}`);
    await gpuRow.waitFor({ state: 'visible', timeout: TestTimeouts.RESOURCE_CREATION });

    await this.clickSave();
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    const hardwareDevicesTable = this.locator('.hardware-devices-table');
    await hardwareDevicesTable.waitFor({
      state: 'visible',
      timeout: TestTimeouts.RESOURCE_CREATION,
    });
    const gpuInTable = hardwareDevicesTable.locator(`text=${gpuName}`);
    await gpuInTable.waitFor({ state: 'visible', timeout: TestTimeouts.RESOURCE_CREATION });
  }

  async clickCreateButton(): Promise<void> {
    const wizardCreateButton = this.testId('create-virtual-machine').locator('button', {
      hasText: 'Create VirtualMachine',
    });
    await wizardCreateButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(wizardCreateButton);
  }

  async deleteNic(): Promise<void> {
    await this.navigateToWizardTab('Network');

    await this._wizardNicToggle.waitFor({
      state: 'visible',
      timeout: TestTimeouts.RESOURCE_CREATION,
    });
    await this.robustClick(this._wizardNicToggle);

    const wizardDeleteNicButton = this.locator('button:has-text("Delete")');
    await wizardDeleteNicButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(wizardDeleteNicButton);

    const tabModal = this._tabModal;
    await tabModal.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });

    await this.locator('text=Delete NIC?').waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });

    const confirmDeleteButton = tabModal.locator('button:has-text("Delete")');
    await confirmDeleteButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(confirmDeleteButton);

    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async fillMetadata(config: {
    labels?: string[];
    annotations?: Array<{ key: string; value: string }>;
    nodeSelector?: { key: string; value: string };
  }): Promise<void> {
    await this.navigateToWizardTab('Metadata');
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    if (config.labels && config.labels.length > 0) {
      const wizardLabelsEditButton = this.locator(
        'button[data-test^="pw-vm-customize-it-"][data-test*="labels"]',
      );
      await wizardLabelsEditButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this.robustClick(wizardLabelsEditButton);

      const wizardLabelsInput = this.testId('tags-input');
      await wizardLabelsInput.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await wizardLabelsInput.clear();

      for (const label of config.labels) {
        await wizardLabelsInput.fill(label);
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
      const wizardAnnotationsEditButton = this.locator(
        'button[data-test^="pw-vm-customize-it-"][data-test*="annotations"]',
      );
      const annotationsBtnExists = await wizardAnnotationsEditButton
        .isVisible({ timeout: TestTimeouts.UI_DELAY_SHORT })
        .catch(() => false);
      if (!annotationsBtnExists) {
        const altAnnotationsBtn = this.locator('button[data-test*="annotation"]').first();
        const altExists = await altAnnotationsBtn
          .isVisible({ timeout: TestTimeouts.UI_DELAY_SHORT })
          .catch(() => false);
        if (altExists) {
          await this.robustClick(altAnnotationsBtn);
        } else {
          return;
        }
      } else {
        await this.robustClick(wizardAnnotationsEditButton);
      }

      for (const annotation of config.annotations) {
        const addButton = this.locator('button:has-text("Add annotation")');
        await addButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
        await this.robustClick(addButton);

        const keyInput = this._inputKey.last();
        const valueInput = this._inputValue.last();
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

    if (config.nodeSelector) {
      const wizardNodeSelectorEditButton = this.locator(
        'button[data-test^="pw-vm-customize-it-"][data-test*="node-selector"]',
      );
      await wizardNodeSelectorEditButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this.robustClick(wizardNodeSelectorEditButton);

      const keyInput = this._inputKey;
      const valueInput = this._inputValue;
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

  async fillNetworks(config: {
    nics?: Array<{
      name?: string;
      model?: string;
      network?: string;
      type?: string;
    }>;
  }) {
    if (config.nics && config.nics.length > 0) {
      await this.navigateToWizardTab('Network');

      for (const nic of config.nics) {
        const wizardAddNetworkInterfaceButton = this.locator(
          'button:has-text("Add network interface")',
        );
        await wizardAddNetworkInterfaceButton.waitFor({
          state: 'visible',
          timeout: TestTimeouts.RESOURCE_CREATION,
        });
        await this.robustClick(wizardAddNetworkInterfaceButton);
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);

        if (nic.name) {
          const wizardNicNameInput = this.locator('input[aria-label="Network interface name"]');
          await wizardNicNameInput.waitFor({
            state: 'visible',
            timeout: TestTimeouts.RESOURCE_CREATION,
          });
          await wizardNicNameInput.clear();
          await wizardNicNameInput.fill(nic.name);
        }

        if (nic.model) {
          const wizardNicModelSelect = this.testId('model-select');
          await wizardNicModelSelect.waitFor({
            state: 'visible',
            timeout: TestTimeouts.UI_ACTION_COMPLETE,
          });
          await this.robustClick(wizardNicModelSelect);
          const modelOption = this.testId(`model-select-${nic.model}`);
          await modelOption.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
          await this.robustClick(modelOption);
        }

        if (nic.network) {
          const wizardNicNetworkSelect = this.testId('network-attachment-definition-select');
          await wizardNicNetworkSelect.waitFor({
            state: 'visible',
            timeout: TestTimeouts.UI_ACTION_COMPLETE,
          });
          const networkToggle = wizardNicNetworkSelect.locator(
            'button.pf-v6-c-menu-toggle__button',
          );
          await networkToggle.waitFor({
            state: 'visible',
            timeout: TestTimeouts.UI_ACTION_COMPLETE,
          });
          await this.robustClick(networkToggle);
          await this.clickButtonByText(nic.network);
        }

        if (nic.type) {
          const wizardNicTypeSelect = this.testId('network-interface-type-select');
          await wizardNicTypeSelect.waitFor({
            state: 'visible',
            timeout: TestTimeouts.UI_ACTION_COMPLETE,
          });
          await this.robustClick(wizardNicTypeSelect);
          const typeOption = this.testId(`network-interface-type-select-${nic.type}`);
          await typeOption.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
          await this.robustClick(typeOption);
        }

        await this.clickSave();
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);
      }
    }
  }

  async fillOverview(config: {
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
      await this.testId('wizard-overview-name-edit').click();
      const wizardNameInput = this.locator('#vm-name');
      await wizardNameInput.clear();
      await wizardNameInput.fill(config.name);
      await this.clickSave();
    }

    if (config.description) {
      await this.robustClick(
        this.locator('button[data-test^="pw-vm-customize-it-"][data-test*="description"]'),
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
        // Fallback to global Save button selector
        await this.clickSave();
      }
    }

    if (config.cpu || config.memory) {
      await this.testId('wizard-overview-cpu-memory-edit').click();
      const wizardCpuInput = this.locator('input[name="cpu-input"]');
      const wizardMemInput = this.locator('input[name="memory-input"]');
      if (config.cpu) {
        await wizardCpuInput.clear();
        await wizardCpuInput.fill(config.cpu.toString());
      }
      if (config.memory) {
        await wizardMemInput.clear();
        await wizardMemInput.fill(config.memory.toString());
      }
      await this.clickSave();
    }

    if (config.bootMode) {
      await this.testId('wizard-overview-boot-method-edit').click();
      const modalBody = this.locator('.pf-v6-c-modal-box__body');
      await modalBody.locator('button').first().click();
      // Use exact text matching to avoid partial matches (e.g., "UEFI" vs "UEFI(secure)")
      await this.clickElementByExactText('span', config.bootMode);
      await this.clickButtonByText('Save');
    }

    if (config.workload) {
      await this.testId('wizard-overview-workload-profile-edit').click();
      const modalBody = this._tabModal;
      await modalBody.locator('button.pf-v6-c-menu-toggle').click();
      await this.locator('button', { hasText: config.workload }).click();
      await this.clickButtonByText('Save');
    }

    if (config.hostname) {
      const wizardHostnameEditBtn = this.locator(
        'button[data-test^="pw-vm-customize-it-"][data-test*="hostname"]',
      );
      await wizardHostnameEditBtn.waitFor({
        state: 'visible',
        timeout: TestTimeouts.RESOURCE_CREATION,
      });
      await this.robustClick(wizardHostnameEditBtn);
      const wizardHostnameInput = this.locator('input#hostname');
      await wizardHostnameInput.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await wizardHostnameInput.fill(config.hostname);
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      const tabModal = this._tabModal;
      const saveButtonInModal = tabModal.locator('button').filter({ hasText: 'Save' }).first();
      const saveButtonVisible = await saveButtonInModal
        .isVisible({ timeout: TestTimeouts.UI_DELAY_SHORT })
        .catch(() => false);
      if (saveButtonVisible) {
        await this.robustClick(saveButtonInModal);
      } else {
        // Fallback to global Save button selector
        await this.clickSave();
      }
    }

    if (config.startInPause !== undefined) {
      const wizardStartInPauseCheckbox = this.locator('#start-in-pause-mode');
      // Switch elements may be hidden but still interactable, so wait for attached state
      await wizardStartInPauseCheckbox.waitFor({
        state: 'attached',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      const startInPauseChecked = await wizardStartInPauseCheckbox.isChecked().catch(() => false);
      if (config.startInPause && !startInPauseChecked) {
        // Use evaluate to set checked state directly for hidden switches
        await wizardStartInPauseCheckbox.evaluate((el: HTMLInputElement) => {
          el.checked = true;
          el.dispatchEvent(new Event('change', { bubbles: true }));
        });
      } else if (!config.startInPause && startInPauseChecked) {
        // Use evaluate to set checked state directly for hidden switches
        await wizardStartInPauseCheckbox.evaluate((el: HTMLInputElement) => {
          el.checked = false;
          el.dispatchEvent(new Event('change', { bubbles: true }));
        });
      }
    }

    if (config.headless !== undefined) {
      // Switch elements may be hidden but still interactable, so wait for attached state
      await this._wizardHeadlessCheckbox.waitFor({
        state: 'attached',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      const headlessChecked = await this._wizardHeadlessCheckbox.isChecked().catch(() => false);
      if (config.headless && !headlessChecked) {
        // Use evaluate to set checked state directly for hidden switches
        await this._wizardHeadlessCheckbox.evaluate((el: HTMLInputElement) => {
          el.checked = true;
          el.dispatchEvent(new Event('change', { bubbles: true }));
        });
      } else if (!config.headless && headlessChecked) {
        // Use evaluate to set checked state directly for hidden switches
        await this._wizardHeadlessCheckbox.evaluate((el: HTMLInputElement) => {
          el.checked = false;
          el.dispatchEvent(new Event('change', { bubbles: true }));
        });
      }
    }
  }

  async fillScheduling(config: {
    descheduler?: boolean;
    dedicatedResources?: boolean;
    evictionStrategy?: boolean;
  }) {
    await this.navigateToWizardTab('Scheduling');
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    if (config.descheduler !== undefined) {
      const wizardDeschedulerEditBtn = this.testId('descheduler-edit');
      await wizardDeschedulerEditBtn.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this.robustClick(wizardDeschedulerEditBtn);
      const wizardDeschedulerCheckbox = this.locator('#descheduler');
      const deschedulerChecked = await wizardDeschedulerCheckbox.isChecked().catch(() => false);
      if (config.descheduler && !deschedulerChecked) {
        await wizardDeschedulerCheckbox.click({ force: true });
      } else if (!config.descheduler && deschedulerChecked) {
        await wizardDeschedulerCheckbox.click({ force: true });
      }
      await this.clickSave();
    }

    if (config.dedicatedResources !== undefined) {
      const wizardDedicatedResourcesEditBtn = this.testId('dedicated-resources-edit');
      await wizardDedicatedResourcesEditBtn.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this.robustClick(wizardDedicatedResourcesEditBtn);
      const wizardDedicatedResourcesCheckbox = this.locator('#dedicated-resources');
      const dedicatedResourcesChecked = await wizardDedicatedResourcesCheckbox
        .isChecked()
        .catch(() => false);
      if (config.dedicatedResources && !dedicatedResourcesChecked) {
        await wizardDedicatedResourcesCheckbox.click({ force: true });
      } else if (!config.dedicatedResources && dedicatedResourcesChecked) {
        await wizardDedicatedResourcesCheckbox.click({ force: true });
      }
      await this.clickSave();
    }

    if (config.evictionStrategy !== undefined) {
      const wizardEvictionStrategyEditBtn = this.testId('eviction-strategy').locator('button');
      // Check if eviction strategy edit button exists (may not be available in all contexts)
      const evictionBtnExists = await wizardEvictionStrategyEditBtn
        .isVisible({ timeout: TestTimeouts.UI_DELAY_SHORT })
        .catch(() => false);
      if (evictionBtnExists) {
        await this.robustClick(wizardEvictionStrategyEditBtn);
        const wizardEvictionStrategyCheckbox = this.locator('#eviction-strategy');
        const evictionStrategyChecked = await wizardEvictionStrategyCheckbox
          .isChecked()
          .catch(() => false);
        if (config.evictionStrategy && !evictionStrategyChecked) {
          await wizardEvictionStrategyCheckbox.click({ force: true });
        } else if (!config.evictionStrategy && evictionStrategyChecked) {
          await wizardEvictionStrategyCheckbox.click({ force: true });
        }
        await this.clickSave();
      }
    }
  }

  async fillScripts(config: { sysprepName?: string }): Promise<void> {
    await this.navigateToWizardTab('Initial run');

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
      await this.clickButtonByText(config.sysprepName);
      await this.clickSave();
    }
  }

  async fillSSH(
    secretName: string,
    sshKeyFilePath: string = SSH_KEY_PATHS.PUBLIC_KEY,
  ): Promise<void> {
    await this.navigateToWizardTab('SSH');

    const sshEditButton = this.testId('wizard-sshkey-edit');
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

    const saveButton = this.testId('save-button');
    await saveButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(saveButton);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async navigateToWizardTab(
    tabName: 'Details' | 'Storage' | 'Network' | 'Scheduling' | 'SSH' | 'Initial run' | 'Metadata',
  ) {
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    const tabMapping: Record<typeof tabName, string> = {
      Details: 'vm-configuration-details',
      Scheduling: 'vm-configuration-scheduling',
      SSH: 'vm-configuration-ssh',
      Network: 'vm-configuration-network',
      Storage: 'vm-configuration-storage',
      'Initial run': 'vm-configuration-initial',
      Metadata: 'vm-configuration-metadata',
    };

    const verticalTabId = tabMapping[tabName];
    if (!verticalTabId) {
      throw new Error(`Unknown tab name: ${tabName}`);
    }

    const tabLocator = this.testId(verticalTabId);
    await this.robustClick(tabLocator);
  }

  async setHeadless(headless: boolean): Promise<void> {
    await this._wizardHeadlessCheckbox.waitFor({
      state: 'attached',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    const headlessChecked = await this._wizardHeadlessCheckbox.isChecked().catch(() => false);
    if (headless && !headlessChecked) {
      await this._wizardHeadlessCheckbox.evaluate((el: HTMLInputElement) => {
        el.checked = true;
        el.dispatchEvent(new Event('change', { bubbles: true }));
      });
    } else if (!headless && headlessChecked) {
      await this._wizardHeadlessCheckbox.evaluate((el: HTMLInputElement) => {
        el.checked = false;
        el.dispatchEvent(new Event('change', { bubbles: true }));
      });
    }
  }

  async verifyNetworksTabNotFoundMessage(): Promise<boolean> {
    try {
      await this.navigateToWizardTab('Network');
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_LONG);

      const nicToggleCount = await this._wizardNicToggle.count();
      if (nicToggleCount === 0) {
        return true;
      }

      const notFoundLocators = [
        this.locator('text=Not found'),
        this.locator('text=/not found/i'),
        this.testId('empty-state'),
        this.locator('.pf-v6-c-empty-state'),
        this.locator('.pf-v6-c-empty-state__body'),
        this.locator('text=No network interfaces'),
        this.locator('text=No network'),
      ];

      for (const notFoundLocator of notFoundLocators) {
        try {
          const isVisible = await notFoundLocator.first().isVisible({
            timeout: TestTimeouts.UI_DELAY_SHORT,
          });
          if (isVisible) {
            const text = await notFoundLocator
              .first()
              .textContent()
              .catch(() => '');
            if (
              text?.toLowerCase().includes('not found') ||
              text?.toLowerCase().includes('no network')
            ) {
              return true;
            }
          }
        } catch {
          continue;
        }
      }

      const networksTabContent = this.testId('vm-configuration-network')
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
}
