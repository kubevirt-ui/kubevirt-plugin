import BaseComponent from '@/components/shared/base-component';
import { STEP_INSTANCE_TYPE_CONFIG } from '@/data-models/step-defaults';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class BootableVolumesRowActionsComponent extends BaseComponent {
  private readonly _dialogModal = this.locator('[data-test="dialog-modal"]');

  constructor(page: Page) {
    super(page);
  }

  private async openRowKebabMenu(volumeName: string): Promise<void> {
    const row = this.locator('tbody tr').filter({
      has: this.locator(`[data-test-id="${volumeName}"]`),
    });
    await row.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    const kebabButton = row.locator('button.pf-v6-c-menu-toggle');
    await kebabButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(kebabButton);
    await this.locator('[role="menuitem"]')
      .first()
      .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
  }

  private async clickMenuItemByText(label: string): Promise<void> {
    const item = this.locator('[role="menuitem"]').filter({
      has: this.locator('.pf-v6-c-menu__item-text', { hasText: label }),
    });
    await item.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(item);
  }

  async clickRowActionEditLabels(volumeName: string): Promise<void> {
    await this.openRowKebabMenu(volumeName);
    await this.clickMenuItemByText('Edit labels');
  }

  async clickRowActionEditAnnotations(volumeName: string): Promise<void> {
    await this.openRowKebabMenu(volumeName);
    await this.clickMenuItemByText('Edit annotations');
  }

  async clickRowActionUploadToRegistry(volumeName: string): Promise<void> {
    await this.openRowKebabMenu(volumeName);
    await this.clickMenuItemByText('Upload to registry');
  }

  async fillUploadToRegistryForm(
    registryName: string,
    destination: string,
    username: string,
    password: string,
  ): Promise<void> {
    const dialog = this._dialogModal;
    await dialog.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });

    await dialog.locator('#registryName').fill(registryName);
    await dialog.locator('#destination').fill(destination);
    await dialog.locator('#username').fill(username);
    await dialog.locator('#password').fill(password);
  }

  async getUploadToRegistryModalButtonText(): Promise<string> {
    const dialog = this._dialogModal;
    const saveButton = dialog.locator('[data-test="save-button"]');
    await saveButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    return (await saveButton.textContent())?.trim() ?? '';
  }

  async isUploadToRegistryModalButtonDisabled(): Promise<boolean> {
    const dialog = this._dialogModal;
    const saveButton = dialog.locator('[data-test="save-button"]');
    await saveButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    return await saveButton.isDisabled();
  }

  async clickSaveInUploadToRegistryModal(): Promise<void> {
    const dialog = this._dialogModal;
    const saveButton = dialog.locator('[data-test="save-button"]');
    await saveButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(saveButton);
  }

  async verifyUploadStepsVisibleInUploadToRegistryModal(): Promise<boolean> {
    await this.page.waitForLoadState('load', {
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);

    const uploadSteps = this.locator('[aria-label="Upload steps"]');
    return await uploadSteps
      .isVisible({ timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
      .catch(() => false);
  }

  async clickRowActionDelete(volumeName: string): Promise<void> {
    await this.openRowKebabMenu(volumeName);
    await this.clickMenuItemByText('Delete');
  }

  async clickRowActionManageSource(volumeName: string): Promise<void> {
    await this.openRowKebabMenu(volumeName);
    await this.clickMenuItemByText('Manage source');
  }

  async isManageSourceModalVisible(timeout = TestTimeouts.UI_ELEMENT_VISIBILITY): Promise<boolean> {
    return this._dialogModal
      .waitFor({ state: 'visible', timeout })
      .then(() => true)
      .catch(() => false);
  }

  async fillManageSourceRegistryUrl(url: string): Promise<void> {
    const urlInput = this._dialogModal.locator('#dataimportcron-manage-source-url');
    await urlInput.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await urlInput.clear();
    await urlInput.fill(url);
  }

  async getManageSourceRegistryUrl(): Promise<string> {
    const urlInput = this._dialogModal.locator('#dataimportcron-manage-source-url');
    await urlInput.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    return (await urlInput.inputValue()) ?? '';
  }

  async setManageSourceAllowAutoUpdate(enable: boolean): Promise<void> {
    const checkbox = this._dialogModal.locator('#dataimportcron-manage-allow-checkbox');
    await checkbox.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    const isChecked = await checkbox.isChecked();
    if (isChecked !== enable) {
      await checkbox.click();
    }
  }

  async fillManageSourceCronExpression(cron: string): Promise<void> {
    const cronInput = this._dialogModal.locator('#dataimportcron-manage-source-cron');
    await cronInput.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await cronInput.clear();
    await cronInput.fill(cron);
  }

  async saveManageSourceModal(): Promise<void> {
    const saveButton = this._dialogModal.locator('button[type="submit"]');
    await saveButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(saveButton);
    await this._dialogModal
      .waitFor({ state: 'hidden', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
      .catch(() => undefined);
  }

  async cancelManageSourceModal(): Promise<void> {
    const cancelButton = this._dialogModal.locator('button', { hasText: 'Cancel' });
    await cancelButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(cancelButton);
    await this._dialogModal
      .waitFor({ state: 'hidden', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
      .catch(() => undefined);
  }

  async checkDeletePvcCheckbox(): Promise<void> {
    const dialog = this._dialogModal;
    await dialog.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    const checkbox = dialog.locator('#delete-pvc-checkbox');
    await checkbox.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    const isChecked = await checkbox.isChecked();
    if (!isChecked) {
      await checkbox.click({ force: true });
    }
  }

  async clickSaveInDeleteModal(): Promise<void> {
    const dialog = this._dialogModal;
    const saveButton = dialog.locator('[data-test="save-button"]');
    await saveButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(saveButton);
  }

  async addLabelInEditLabelsModalAndSave(labelTag: string): Promise<void> {
    const tagsInput = this.locator('[data-test="tags-input"]');
    await tagsInput.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await tagsInput.fill(labelTag);
    await this.page.keyboard.press('Enter');
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    const saveButton = this.locator('[data-test="save-button"]');
    await saveButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(saveButton);
  }

  async clickVolumeNameToGoToDetail(volumeName: string): Promise<void> {
    const row = this.locator('tbody tr').filter({
      has: this.locator(`[data-test-id="${volumeName}"]`),
    });
    const nameLink = row.locator('a').filter({ hasText: volumeName }).first();
    await nameLink.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(nameLink);
  }

  async verifyLabelVisibleOnDetailPage(expectedLabelText: string): Promise<boolean> {
    const labelsControl = this.locator('[data-test-id^="pw-bv-"][data-test-id$="-labels"]').first();
    await labelsControl.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    const isButton = (await labelsControl.evaluate((el) => el.tagName === 'BUTTON')) ?? false;
    if (isButton) {
      await this.robustClick(labelsControl);
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    }
    return await this.locator(`text=${expectedLabelText}`)
      .isVisible()
      .catch(() => false);
  }

  async addAnnotationInEditAnnotationsModalAndSave(
    annotationKey: string,
    annotationValue: string,
  ): Promise<void> {
    const dialog = this._dialogModal;
    await dialog.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });

    const addMoreButton = dialog.locator('button:has-text("Add more")');
    await addMoreButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(addMoreButton);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    const keyInput = dialog.locator('[placeholder="annotation key"]').last();
    const valueInput = dialog.locator('[placeholder="annotation value"]').last();
    await keyInput.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await keyInput.fill(annotationKey);
    await valueInput.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await valueInput.fill(annotationValue);

    const saveButton = dialog.locator('[data-test="save-button"]');
    await saveButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(saveButton);
  }

  async verifyAnnotationsCountTextOnDetailPage(expectedText: string): Promise<boolean> {
    await this.page.waitForLoadState('load', {
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);

    return await this.page
      .getByText(expectedText)
      .isVisible({ timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
      .catch(() => false);
  }
}

// ---------------------------------------------------------------------------
// InstanceTypeVolumeComponent
// ---------------------------------------------------------------------------

export class InstanceTypeVolumeComponent extends BaseComponent {
  private readonly _selectVolumeToBootFrom = this.locator('text=Select volume to boot from');
  private readonly _buttonSortFavorites = this.locator('button[aria-label="Sort favorites"]');
  private readonly _filterDropdownToggle = this.locator('[data-test-id="filter-dropdown-toggle"]');
  private readonly _tdIdNameHasTextRhel9 = this.locator('td[id="name"]:has-text("rhel9")');
  private readonly _nameFilterInput = this.locator('[data-test="name-filter-input"]');
  private readonly _rootRedHatProvidedBtn = this.locator(
    '#root button:has-text("Red Hat provided")',
  );
  private readonly _rootUSeriesBtn = this.locator('#root button:has-text("U series")');
  private readonly _dialogModalDescription = this.locator(
    '[data-test="dialog-modal"] #description',
  );
  private readonly _tabModal = this.locator('#tab-modal');
  private readonly _addVolumeButton = this.locator('#tour-step-add-volume');
  private readonly _bootableVolumeTableBody = this.locator('table.BootableVolumeList-table tbody');

  constructor(page: Page) {
    super(page);
  }

  async isBootableVolumesSectionVisible(): Promise<boolean> {
    const tableVisible = await this._bootableVolumeTableBody
      .isVisible({ timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
      .catch(() => false);
    if (tableVisible) return true;
    const selectVolumeText = this._selectVolumeToBootFrom;
    return await selectVolumeText
      .isVisible({ timeout: TestTimeouts.RETRY_DELAY })
      .catch(() => false);
  }

  async clickAddVolumeButton() {
    await this._addVolumeButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.RESOURCE_CREATION,
    });
    await this.robustClick(this._addVolumeButton);
  }

  async verifyVolumeNameInNameField(volumeName: string): Promise<boolean> {
    try {
      const nameField = this.locator('#name', { hasText: volumeName });
      await nameField.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      return await nameField.isVisible();
    } catch {
      return false;
    }
  }

  async markVolumeFavoriteWithUnfavorite(_volumeName: string): Promise<boolean> {
    try {
      await this._bootableVolumeTableBody.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });

      const favoritesButton = this.page.locator('td[id="favorites"] button').first();
      await favoritesButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });

      const isFavorited = await favoritesButton
        .evaluate((button) => {
          const ariaPressed = button.getAttribute('aria-pressed');
          if (ariaPressed === 'true') {
            return true;
          }

          const svg = button.querySelector('svg');
          if (svg) {
            const path = svg.querySelector('path');
            if (path) {
              const fill = path.getAttribute('fill');

              if (fill && fill !== 'none' && fill !== 'transparent' && fill !== 'currentColor') {
                return true;
              }
            }
          }

          const classList = Array.from(button.classList);
          return classList.some(
            (cls) => cls.includes('filled') || cls.includes('active') || cls.includes('pressed'),
          );
        })
        .catch(() => false);

      if (isFavorited) {
        await favoritesButton.click();

        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      }

      await favoritesButton.click();

      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

      return true;
    } catch {
      return false;
    }
  }

  async markVolumeFavorite(): Promise<boolean> {
    try {
      await this._bootableVolumeTableBody.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      const tableBody = this._bootableVolumeTableBody;

      const rows = tableBody.locator('tr');
      const rowCount = await rows.count();

      if (rowCount === 0) {
        return false;
      }

      const lastRow = rows.nth(rowCount - 1);
      const favoritesButton = lastRow.locator('td[id="favorites"] button');
      await favoritesButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await favoritesButton.click();

      const firstRow = rows.first();
      const firstRowText = await firstRow.textContent();
      if (!firstRowText?.includes('rhel9')) {
        return false;
      }

      await favoritesButton.click();

      const firstRowText2 = await firstRow.textContent();
      if (!firstRowText2?.includes('rhel8')) {
        return false;
      }

      await this._buttonSortFavorites.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await this._buttonSortFavorites.click();

      const lastRowText = await lastRow.textContent();
      if (!lastRowText?.includes('rhel')) {
        return false;
      }

      await favoritesButton.click();
      await favoritesButton.click();

      return true;
    } catch {
      return false;
    }
  }

  async filterVolumeByOS(osName = 'Fedora'): Promise<boolean> {
    try {
      await this._filterDropdownToggle.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await this._filterDropdownToggle.click();

      const osFilterOption = this.locator(`.co-filter-dropdown-item__name:has-text("${osName}")`);
      await osFilterOption.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await osFilterOption.click();

      const volumeNameButton = this.locator('button:has-text("Volume name")');
      await volumeNameButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await volumeNameButton.click();

      const selectVolumeText = this._selectVolumeToBootFrom;
      await selectVolumeText.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await selectVolumeText.scrollIntoViewIfNeeded();

      const fedoraCell = this.locator('td[id="name"]:has-text("fedora")').first();
      const rhel9Cell = this._tdIdNameHasTextRhel9;

      const fedoraExists = await fedoraCell.isVisible().catch(() => false);
      const rhel9NotExists = !(await rhel9Cell.isVisible().catch(() => false));

      return fedoraExists && rhel9NotExists;
    } catch {
      return false;
    }
  }

  async filterVolumeByName(volumeName = 'fedora'): Promise<boolean> {
    try {
      await this.locator(
        '.create-vm-instance-type-section input[data-test-id="item-filter"]',
      ).waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });

      await this.locator('.create-vm-instance-type-section input[data-test-id="item-filter"]').fill(
        volumeName,
      );

      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);

      const volumeCell = this.locator(`td[id="name"]:has-text("${volumeName}")`).first();
      await volumeCell.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });

      const volumeExists = await volumeCell.isVisible().catch(() => false);
      const rhel9Cell = this._tdIdNameHasTextRhel9;
      const rhel9NotExists = !(await rhel9Cell.isVisible().catch(() => false));

      return volumeExists && rhel9NotExists;
    } catch {
      return false;
    }
  }

  async selectBootableVolume(volumeName: string): Promise<boolean> {
    try {
      await this._bootableVolumeTableBody.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });

      const nameFilterInput = this._nameFilterInput;
      await nameFilterInput.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await nameFilterInput.clear();
      await nameFilterInput.fill(volumeName);

      const volumeElement = this.locator('small', { hasText: volumeName }).first();
      await volumeElement.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await this.robustClick(volumeElement);

      return true;
    } catch {
      return false;
    }
  }

  async addVolumeViaUpload(
    volumeName: string,
    isoFilePath: string,
    instanceType = 'nano',
    preference = 'alpine',
  ): Promise<boolean> {
    try {
      await this._addVolumeButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.RESOURCE_CREATION,
      });
      await this.robustClick(this._addVolumeButton);

      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

      const uploadInput = this.locator('[data-test="dialog-modal"] input[type="file"]');

      await uploadInput.setInputFiles(isoFilePath);

      const isoCheckbox = this.locator('[data-test="dialog-modal"] input[id="iso-checkbox"]');
      const isChecked = await isoCheckbox.isChecked().catch(() => false);
      if (!isChecked) {
        await isoCheckbox.check({ force: true });
      }

      const volumeNameInput = this.locator(
        '[data-test="dialog-modal"] #volume-name, [data-test="dialog-modal"] #name',
      ).first();
      await volumeNameInput.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
      await volumeNameInput.fill(volumeName);

      const selectPreferenceButton = this.locator(
        '[data-test="dialog-modal"] button:has-text("Select preference")',
      );
      await selectPreferenceButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this.robustClick(selectPreferenceButton);

      const searchPreferenceInput = this.locator('#select-inline-filter input');
      await searchPreferenceInput.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await searchPreferenceInput.fill(preference);

      const preferenceOption = this.locator(
        `#select-inline-filter-VirtualMachineClusterPreference-${preference}`,
      );
      await this.robustClick(preferenceOption);

      const selectInstanceButton = this.locator(
        '[data-test="dialog-modal"] button:has-text("Select InstanceType")',
      );
      await selectInstanceButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this.robustClick(selectInstanceButton);

      const redHatProvided = this._rootRedHatProvidedBtn.first();
      await this.robustClick(redHatProvided);

      const uSeries = this._rootUSeriesBtn.first();
      await this.robustClick(uSeries);

      const instanceTypeOption = this.locator(`#u1 button:has-text("${instanceType}:")`).first();
      await this.robustClick(instanceTypeOption);

      const descriptionInput = this._dialogModalDescription;
      await descriptionInput.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await descriptionInput.fill(`Test volume from Upload`);

      await this.clickSave();

      const addVolModal = this._tabModal;
      await addVolModal.waitFor({
        state: 'hidden',
        timeout: TestTimeouts.TEST_EXTENDED,
      });

      return true;
    } catch {
      return false;
    }
  }

  async addVolumeViaRegistry(
    volumeName: string,
    registryUrl: string,
    username: string,
    password: string,
    instanceType: string = STEP_INSTANCE_TYPE_CONFIG.SMALL,
    preference: string = STEP_INSTANCE_TYPE_CONFIG.FEDORA,
    cronExpression = '0 0 * * 2',
  ): Promise<boolean> {
    try {
      await this._addVolumeButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.RESOURCE_CREATION,
      });
      await this.robustClick(this._addVolumeButton);

      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

      const sourceTypeSelect = this.locator(
        '[data-test="dialog-modal"] [data-test-id="source-type-select"]',
      );
      await sourceTypeSelect.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this.robustClick(sourceTypeSelect);

      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      const registryOption = this.locator('[data-test-id="use-registry"]');
      await this.robustClick(registryOption);

      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

      const containerImageInput = this.locator(
        '[data-test="dialog-modal"] [data-test-id="volume-registry-container-source-input"]',
      );
      await containerImageInput.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await containerImageInput.fill(registryUrl);

      const usernameInput = this.locator(
        '[data-test="dialog-modal"] [data-test-id="volume-registry-container-source-username"]',
      );
      await usernameInput.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await usernameInput.fill(username);

      const passwordInput = this.locator(
        '[data-test="dialog-modal"] [data-test-id="volume-registry-container-source-password"]',
      );
      await passwordInput.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await passwordInput.fill(password);

      const cronExpInput = this.locator(
        '[data-test="dialog-modal"] input[data-test-id="volume-registry-retain-cron-expression"]',
      );
      await cronExpInput.scrollIntoViewIfNeeded();
      await cronExpInput.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await cronExpInput.clear();
      await cronExpInput.fill(cronExpression);

      const volumeNameInput = this.locator(
        '[data-test="dialog-modal"] #volume-name, [data-test="dialog-modal"] #name',
      ).first();
      await volumeNameInput.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
      await volumeNameInput.fill(volumeName);

      const selectPreferenceButton = this.locator(
        '[data-test="dialog-modal"] button:has-text("Select preference")',
      );
      await selectPreferenceButton.scrollIntoViewIfNeeded();
      await selectPreferenceButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this.robustClick(selectPreferenceButton);

      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      const searchPreferenceInput = this.locator('input[placeholder="Select preference"]');
      await searchPreferenceInput.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await searchPreferenceInput.fill(preference);

      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      const preferenceOption = this.locator(
        `button#select-inline-filter-VirtualMachineClusterPreference-${preference}`,
      );
      await preferenceOption.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this.robustClick(preferenceOption);

      const selectInstanceButton = this.locator(
        '[data-test="dialog-modal"] button:has-text("Select InstanceType")',
      );
      await selectInstanceButton.scrollIntoViewIfNeeded();
      await selectInstanceButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this.robustClick(selectInstanceButton);

      const redHatProvidedIT = this._rootRedHatProvidedBtn.first();
      await redHatProvidedIT.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this.robustClick(redHatProvidedIT);

      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      const uSeries = this._rootUSeriesBtn.first();
      await uSeries.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this.robustClick(uSeries);

      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      const instanceTypeOption = this.locator(`#u1 button:has-text("${instanceType}")`).first();
      await instanceTypeOption.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await this.robustClick(instanceTypeOption);

      const descriptionInput = this._dialogModalDescription;
      await descriptionInput.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      await descriptionInput.fill(`Test volume from Registry`);

      await this.clickSave();

      const addVolModal = this._tabModal;
      await addVolModal.waitFor({
        state: 'hidden',
        timeout: TestTimeouts.TEST_EXTENDED,
      });

      return true;
    } catch {
      return false;
    }
  }

  async verifyVolumeExistsInList(volumeName: string): Promise<boolean> {
    try {
      const nameFilterInput = this._nameFilterInput;
      await nameFilterInput.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await nameFilterInput.clear();
      await nameFilterInput.fill(volumeName);

      return await this.locator('small', { hasText: volumeName })
        .isVisible({ timeout: TestTimeouts.RESOURCE_CREATION })
        .catch(() => false);
    } catch {
      return false;
    }
  }
}
