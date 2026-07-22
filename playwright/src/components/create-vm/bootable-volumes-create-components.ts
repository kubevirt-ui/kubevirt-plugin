/**
 * Bootable volumes list row actions, modals, and detail assertions.
 */

import BaseComponent from '@/components/shared/base-component';
import { TestTimeouts } from '@/utils/test-config';
import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

/** Options for the Add volume (create Bootable Volume) form. */
export interface CreateBootableVolumeFormOptions {
  /** Preference name to select (e.g. 'alpine'). Default 'alpine'. */
  preference?: string;
  /** Instance type to select (e.g. 'nano'). Default 'nano'. */
  instanceType?: string;
}

export class BootableVolumesRowActionsComponent extends BaseComponent {
  private readonly _dialogModal = this.testId('dialog-modal');

  constructor(page: Page) {
    super(page);
  }

  /** Clicks a menu item by its exact visible text label. */
  private async clickMenuItemByText(label: string): Promise<void> {
    const item = this.locator('[role="menuitem"]')
      .filter({
        has: this.locator('.pf-v6-c-menu__item-text', { hasText: label }),
      })
      .first();
    await item.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(item);
  }

  /**
   * Opens the kebab menu for a volume row and waits for the dropdown to be visible.
   * The kebab toggle is the only <button> in each row (the name is an <a> link).
   * Menu items have no data-test attributes — they are plain PF6 .pf-v6-c-menu__item buttons.
   */
  private async openRowKebabMenu(volumeName: string): Promise<void> {
    const byTestId = this.locator('tbody tr').filter({
      has: this.testId(volumeName),
    });
    const byLink = this.locator('tbody tr').filter({
      has: this.locator(`a:has-text("${volumeName}")`),
    });
    const byText = this.locator('tbody tr').filter({ hasText: volumeName });
    const row = byTestId.or(byLink).or(byText).first();
    await row.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    const kebabButton = row
      .locator('button.pf-v6-c-menu-toggle.pf-m-plain, button.pf-v6-c-menu-toggle')
      .first();
    await kebabButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(kebabButton);
    await this.locator('[role="menuitem"]')
      .first()
      .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
  }

  /**
   * In the Edit annotations modal ([data-test="dialog-modal"]): clicks "Add more", fills
   * annotation key and value placeholders, and saves with [data-test="save-button"].
   * Call after clickRowActionEditAnnotations(volumeName) when the modal is open.
   */
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

  /**
   * In the Edit labels modal: fills the tags input with the given label (e.g. "key=value")
   * and saves with [data-test="save-button"].
   * Call after clickRowActionEditLabels(volumeName) when the modal is open.
   */
  async addLabelInEditLabelsModalAndSave(labelTag: string): Promise<void> {
    const tagsInput = this.testId('tags-input');
    await tagsInput.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await tagsInput.fill(labelTag);
    await this.page.keyboard.press('Enter');
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    const saveButton = this.testId('save-button');
    await saveButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(saveButton);
  }

  /**
   * Clicks Cancel in the Manage source modal.
   */
  async cancelManageSourceModal(): Promise<void> {
    const cancelButton = this._dialogModal.locator('button', { hasText: 'Cancel' });
    await cancelButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(cancelButton);
    await this._dialogModal
      .waitFor({ state: 'hidden', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
      .catch(() => undefined);
  }

  /**
   * In the Delete confirmation modal: checks the "delete PVC" checkbox (#delete-pvc-checkbox).
   * Call after clickRowActionDelete(volumeName) when the modal is open.
   */
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

  async clickRowActionDelete(volumeName: string): Promise<void> {
    await this.openRowKebabMenu(volumeName);
    await this.clickMenuItemByText('Delete');
  }

  async clickRowActionEditAnnotations(volumeName: string): Promise<void> {
    await this.openRowKebabMenu(volumeName);
    await this.clickMenuItemByText('Edit annotations');
  }

  async clickRowActionEditLabels(volumeName: string): Promise<void> {
    await this.openRowKebabMenu(volumeName);
    await this.clickMenuItemByText('Edit labels');
  }

  /** Opens the kebab menu for the given volume row and clicks the "Manage source" action. */
  async clickRowActionManageSource(volumeName: string): Promise<void> {
    await this.openRowKebabMenu(volumeName);
    await this.clickMenuItemByText('Manage source');
  }

  async clickRowActionUploadToRegistry(volumeName: string): Promise<void> {
    await this.openRowKebabMenu(volumeName);
    await this.clickMenuItemByText('Upload to registry');
  }

  /**
   * In the Delete confirmation modal: clicks [data-test="save-button"] to confirm deletion.
   * Call after checkDeletePvcCheckbox() when the modal is open.
   */
  async clickSaveInDeleteModal(): Promise<void> {
    const dialog = this._dialogModal;
    const saveButton = dialog.locator('[data-test="save-button"]');
    await saveButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(saveButton);
  }

  /**
   * In the Upload to registry modal: clicks [data-test="save-button"].
   * Call after fillUploadToRegistryForm() when the modal is open.
   */
  async clickSaveInUploadToRegistryModal(): Promise<void> {
    const dialog = this._dialogModal;
    const saveButton = dialog.locator('[data-test="save-button"]');
    await saveButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(saveButton);
  }

  /**
   * Clicks the bootable volume name link in the list row to navigate to its detail page.
   */
  async clickVolumeNameToGoToDetail(volumeName: string): Promise<void> {
    const row = this.locator('tbody tr').filter({
      has: this.testId(volumeName),
    });
    const nameLink = row.locator('a').filter({ hasText: volumeName }).first();
    await nameLink.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(nameLink);
  }

  /**
   * Fills the Cron expression field in the Manage source modal.
   */
  async fillManageSourceCronExpression(cron: string): Promise<void> {
    const cronInput = this._dialogModal.locator('#dataimportcron-manage-source-cron');
    await cronInput.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await cronInput.clear();
    await cronInput.fill(cron);
  }

  /**
   * Fills the Registry URL field in the Manage source modal.
   * Call after isManageSourceModalVisible() returns true.
   */
  async fillManageSourceRegistryUrl(url: string): Promise<void> {
    const urlInput = this._dialogModal.locator('#dataimportcron-manage-source-url');
    await urlInput.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await urlInput.clear();
    await urlInput.fill(url);
  }

  /**
   * In the Upload to registry modal ([data-test="dialog-modal"]): fills Registry Name,
   * Destination, Username, and Password. Does not click Save/Upload.
   * Call after clickRowActionUploadToRegistry(volumeName) when the modal is open.
   */
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

  /**
   * Returns the current value of the Registry URL field in the Manage source modal.
   */
  async getManageSourceRegistryUrl(): Promise<string> {
    const urlInput = this._dialogModal.locator('#dataimportcron-manage-source-url');
    await urlInput.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    return (await urlInput.inputValue()) ?? '';
  }

  /**
   * Returns the text label of the submit button in the Upload to registry modal (CNV-82501).
   */
  async getUploadToRegistryModalButtonText(): Promise<string> {
    const dialog = this._dialogModal;
    const saveButton = dialog.locator('[data-test="save-button"]');
    await saveButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    return (await saveButton.textContent())?.trim() ?? '';
  }

  /**
   * Returns true when the Manage source modal is open (dialog with [data-test="dialog-modal"]
   * containing a heading that includes "source" or "Source").
   */
  async isManageSourceModalVisible(timeout = TestTimeouts.UI_ELEMENT_VISIBILITY): Promise<boolean> {
    return this._dialogModal
      .waitFor({ state: 'visible', timeout })
      .then(() => true)
      .catch(() => false);
  }

  /**
   * Returns whether the submit button is disabled in the Upload to registry modal (CNV-82501).
   */
  async isUploadToRegistryModalButtonDisabled(): Promise<boolean> {
    const dialog = this._dialogModal;
    const saveButton = dialog.locator('[data-test="save-button"]');
    await saveButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    return await saveButton.isDisabled();
  }

  /**
   * Clicks Save in the Manage source modal (type="submit" button).
   * Waits for the modal to close.
   */
  async saveManageSourceModal(): Promise<void> {
    const saveButton = this._dialogModal.locator('button[type="submit"]');
    await saveButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(saveButton);
    await this._dialogModal
      .waitFor({ state: 'hidden', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
      .catch(() => undefined);
  }

  /**
   * Sets the "Allow automatic update" checkbox in the Manage source modal.
   * Pass true to enable, false to disable.
   */
  async setManageSourceAllowAutoUpdate(enable: boolean): Promise<void> {
    const checkbox = this._dialogModal.locator('#dataimportcron-manage-allow-checkbox');
    await checkbox.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    const isChecked = await checkbox.isChecked();
    if (isChecked !== enable) {
      await checkbox.click();
    }
  }

  /**
   * On the bootable volume detail page: verifies that the annotations count text is visible
   * (e.g. "1 Annotations").
   */
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

  /**
   * On the bootable volume detail page: verifies the labels section shows the expected label text.
   * Finds the labels control via [data-test^="pw-bv-"][data-test$="-labels"] (clicks it if
   * it is a button to expand), then checks that the expected label text is visible on the page.
   */
  async verifyLabelVisibleOnDetailPage(expectedLabelText: string): Promise<boolean> {
    const labelsControl = this.locator('[data-test^="pw-bv-"][data-test$="-labels"]').first();
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

  /**
   * Verifies that the Upload to registry modal shows the Upload steps section
   * ([aria-label="Upload steps"]). Call after clickRowActionUploadToRegistry(volumeName).
   */
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
}

/**
 * Add-volume (create bootable volume) form interactions — upload, PVC, snapshot, registry, HTTP.
 */
export class BootableVolumesCreateFormsComponent extends BaseComponent {
  /** Add volume modal (data-test="dialog-modal", id="tab-modal") */
  private readonly _addVolumeDialog = this.locator('#tab-modal');

  /** Volume name input (#name) in the Add volume form */
  private readonly _createFormNameInput = this._addVolumeDialog.locator('#volume-name, #name');

  /** Save button in the Add volume form footer */
  private readonly _createFormSaveButton = this._addVolumeDialog.locator(
    '[data-test="save-button"]',
  );

  private readonly _roleOption = this.locator('[role="option"]');
  private readonly _selectInlineFilterInput = this.locator('#select-inline-filter input');

  constructor(page: Page) {
    super(page);
  }

  private async _waitForSnapshotSizeAndContinue(
    volumeName: string,
    options: CreateBootableVolumeFormOptions,
  ): Promise<void> {
    const { preference = 'alpine', instanceType = 'nano' } = options;

    // Wait for snapshot size to populate in the form (disk size is determined by the volume snapshot).
    // The UI shows "Size cannot be zero" until the snapshot size is available.
    const sizeCannotBeZero = this._addVolumeDialog.getByText('Size cannot be zero');
    await sizeCannotBeZero.waitFor({
      state: 'hidden',
      timeout: TestTimeouts.DATA_VOLUME_STATUS,
    });

    await this._createFormNameInput.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this._createFormNameInput.fill(volumeName);

    const selectPreferenceButton = this._addVolumeDialog.locator(
      'button:has-text("Select preference")',
    );
    await selectPreferenceButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(selectPreferenceButton);

    const searchPreferenceInput = this._selectInlineFilterInput;
    await searchPreferenceInput.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await searchPreferenceInput.fill(preference);

    const preferenceOption = this.locator(
      `#select-inline-filter-VirtualMachineClusterPreference-${preference}`,
    );
    await this.robustClick(preferenceOption);

    const selectInstanceButton = this._addVolumeDialog.locator(
      'button:has-text("Select InstanceType")',
    );
    await selectInstanceButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(selectInstanceButton);

    const redHatProvided = this._addVolumeDialog
      .locator('button:has-text("Red Hat provided")')
      .first();
    await this.robustClick(redHatProvided);

    const uSeries = this._addVolumeDialog.locator('button:has-text("U series")').first();
    await this.robustClick(uSeries);

    const instanceTypeOption = this.locator(`#u1 button:has-text("${instanceType}:")`).first();
    await this.robustClick(instanceTypeOption);

    await this._createFormSaveButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await expect(
      this._createFormSaveButton,
      'Create volume form Save button should be enabled after selecting volume snapshot source and instance type',
    ).toBeEnabled({
      timeout: TestTimeouts.FILE_UPLOAD,
    });
    await this.robustClick(this._createFormSaveButton);
  }

  /**
   * Fills and submits the Add volume (create Bootable Volume) form.
   * Call after clickCreateAndSelectOption('With form').
   * Uploads the given image file, fills volume name, selects preference and instance type,
   * then clicks Save once the button is enabled.
   *
   * @param volumeName - Name for the bootable volume
   * @param imageFilePath - Absolute path to the image file to upload (e.g. from TestFileFactory.downloadCirrosImage)
   * @param options - Optional preference and instance type (defaults: alpine, nano)
   */
  async fillCreateBootableVolumeFormAndSave(
    volumeName: string,
    imageFilePath: string,
    options: CreateBootableVolumeFormOptions = {},
  ): Promise<void> {
    const { preference = 'alpine', instanceType = 'nano' } = options;

    await this._addVolumeDialog.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });

    const createFormFileInput = this._addVolumeDialog.locator('input[type="file"]');
    await createFormFileInput.waitFor({
      state: 'attached',
      timeout: TestTimeouts.FILE_UPLOAD,
    });
    await createFormFileInput.setInputFiles(imageFilePath);

    await this._createFormNameInput.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this._createFormNameInput.fill(volumeName);

    const selectPreferenceButton = this._addVolumeDialog.locator(
      'button:has-text("Select preference")',
    );
    await selectPreferenceButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(selectPreferenceButton);

    const searchPreferenceInput = this._selectInlineFilterInput;
    await searchPreferenceInput.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await searchPreferenceInput.fill(preference);

    const preferenceOption = this.locator(
      `#select-inline-filter-VirtualMachineClusterPreference-${preference}`,
    );
    await this.robustClick(preferenceOption);

    const selectInstanceButton = this._addVolumeDialog.locator(
      'button:has-text("Select InstanceType")',
    );
    await selectInstanceButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(selectInstanceButton);

    const redHatProvided = this._addVolumeDialog
      .locator('button:has-text("Red Hat provided")')
      .first();
    await this.robustClick(redHatProvided);

    const uSeries = this._addVolumeDialog.locator('button:has-text("U series")').first();
    await this.robustClick(uSeries);

    const instanceTypeOption = this.locator(`#u1 button:has-text("${instanceType}:")`).first();
    await this.robustClick(instanceTypeOption);

    await this._createFormSaveButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await expect(
      this._createFormSaveButton,
      'Create volume form Save button should be enabled after selecting instance type',
    ).toBeEnabled({
      timeout: TestTimeouts.FILE_UPLOAD,
    });
    await this.robustClick(this._createFormSaveButton);
  }

  /**
   * Fills and submits the Add volume form using an existing volume as source.
   * Call after clickCreateAndSelectOption('With form').
   * Selects source type "Volume", then Volume project and Volume name, fills destination
   * volume name, preference and instance type, then saves.
   *
   * @param volumeName - Name for the new bootable volume
   * @param existingVolumeName - Name of the existing DataVolume to use as source
   * @param projectNamespace - Namespace (project) where the existing volume lives
   * @param options - Optional preference and instance type (defaults: alpine, nano)
   */
  async fillCreateBootableVolumeFormFromExistingAndSave(
    volumeName: string,
    existingVolumeName: string,
    projectNamespace: string,
    options: CreateBootableVolumeFormOptions = {},
  ): Promise<void> {
    const { preference = 'alpine', instanceType = 'nano' } = options;

    await this._addVolumeDialog.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });

    const sourceTypeSelect = this._addVolumeDialog.getByTestId('source-type-select');
    await sourceTypeSelect.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(sourceTypeSelect);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    const useExistingVolume = this.testId('use-existing-volume').locator('button');
    await this.robustClick(useExistingVolume, { force: true });
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    const volumeProjectToggle = this._addVolumeDialog.locator('#pvc-project-select button');
    await volumeProjectToggle.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(volumeProjectToggle);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    const projectFilterInput = this._selectInlineFilterInput;
    const projectFilterVisible = await projectFilterInput
      .isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM })
      .catch(() => false);
    if (projectFilterVisible) {
      await projectFilterInput.fill(projectNamespace);
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    }

    const projectOption = this.testId(`select-option-${projectNamespace}`);
    await projectOption.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
    await this.robustClick(projectOption);

    const volumeNameToggle = this._addVolumeDialog.locator('#pvc-name-select button');
    await volumeNameToggle.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(volumeNameToggle);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    const volumeNameFilterInput = this._selectInlineFilterInput;
    const volumeFilterVisible = await volumeNameFilterInput
      .isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM })
      .catch(() => false);
    if (volumeFilterVisible) {
      await volumeNameFilterInput.fill(existingVolumeName);
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    }

    const existingVolumeOption = this.locator('[role="listbox"]').getByTestId(existingVolumeName);
    await existingVolumeOption.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(existingVolumeOption);

    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    await this._createFormNameInput.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this._createFormNameInput.fill(volumeName);

    const selectPreferenceButton = this._addVolumeDialog.locator(
      'button:has-text("Select preference")',
    );
    await selectPreferenceButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(selectPreferenceButton);

    const searchPreferenceInput = this._selectInlineFilterInput;
    await searchPreferenceInput.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await searchPreferenceInput.fill(preference);

    const preferenceOption = this.locator(
      `#select-inline-filter-VirtualMachineClusterPreference-${preference}`,
    );
    await this.robustClick(preferenceOption);

    const selectInstanceButton = this._addVolumeDialog.locator(
      'button:has-text("Select InstanceType")',
    );
    await selectInstanceButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(selectInstanceButton);

    const redHatProvided = this._addVolumeDialog
      .locator('button:has-text("Red Hat provided")')
      .first();
    await this.robustClick(redHatProvided);

    const uSeries = this._addVolumeDialog.locator('button:has-text("U series")').first();
    await this.robustClick(uSeries);

    const instanceTypeOption = this.locator(`#u1 button:has-text("${instanceType}:")`).first();
    await this.robustClick(instanceTypeOption);

    await this._createFormSaveButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await expect(
      this._createFormSaveButton,
      'Create volume form Save button should be enabled after selecting existing volume source and instance type',
    ).toBeEnabled({
      timeout: TestTimeouts.FILE_UPLOAD,
    });
    await this.robustClick(this._createFormSaveButton);
  }

  /**
   * Fills and submits the Add volume form using "Volume snapshot" and the first snapshot in the namespace.
   * Same as fillCreateBootableVolumeFormFromSnapshotAndSave but selects the first available snapshot
   * in the VolumeSnapshot name dropdown instead of a specific name.
   */
  async fillCreateBootableVolumeFormFromFirstSnapshotInNamespaceAndSave(
    volumeName: string,
    projectNamespace: string,
    options: CreateBootableVolumeFormOptions = {},
  ): Promise<void> {
    await this._addVolumeDialog.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });

    const sourceTypeSelect = this._addVolumeDialog.getByTestId('source-type-select');
    await sourceTypeSelect.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(sourceTypeSelect);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    const useSnapshot = this._roleOption.filter({ hasText: 'Volume snapshot' });
    await useSnapshot.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(useSnapshot);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    const snapshotProjectToggle = this._addVolumeDialog.locator(
      'button.pf-v6-c-menu-toggle:has-text("--- Select VolumeSnapshot project ---")',
    );
    await snapshotProjectToggle.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(snapshotProjectToggle);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    const snapshotProjectFilterInput = this._selectInlineFilterInput;
    const snapshotProjectFilterVisible = await snapshotProjectFilterInput
      .isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM })
      .catch(() => false);
    if (snapshotProjectFilterVisible) {
      await snapshotProjectFilterInput.fill(projectNamespace);
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    }

    const snapshotProjectOption = this.locator(`#select-inline-filter-${projectNamespace}`);
    await snapshotProjectOption.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(snapshotProjectOption);

    const snapshotNameToggle = this._addVolumeDialog.locator(
      'button.pf-v6-c-menu-toggle:has-text("--- Select VolumeSnapshot name ---")',
    );
    await snapshotNameToggle.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(snapshotNameToggle);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    const firstSnapshotOption = this.locator('[id^="select-inline-filter-vmsnapshot-"]').first();
    await firstSnapshotOption.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(firstSnapshotOption);

    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    await this._waitForSnapshotSizeAndContinue(volumeName, options);
  }

  /**
   * Fills and submits the Add volume form using HTTP/URL as source.
   * Call after clickCreateAndSelectOption('With form').
   * Selects source type "HTTP" ([data-test="use-http"]), fills Image URL in .disk-source-form-group,
   * then volume name, preference and instance type, then saves.
   *
   * @param volumeName - Name for the bootable volume
   * @param imageUrl - HTTP(S) URL of the disk image (e.g. https://download.cirros-cloud.net/0.5.2/cirros-0.5.2-x86_64-disk.img)
   * @param options - Optional preference and instance type (defaults: alpine, nano)
   */
  async fillCreateBootableVolumeFormFromHttpAndSave(
    volumeName: string,
    imageUrl: string,
    options: CreateBootableVolumeFormOptions = {},
  ): Promise<void> {
    const { preference = 'alpine', instanceType = 'nano' } = options;

    await this._addVolumeDialog.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });

    const sourceTypeSelect = this._addVolumeDialog.getByTestId('source-type-select');
    await sourceTypeSelect.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(sourceTypeSelect);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    const useHttp = this.testId('use-http');
    await useHttp.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(useHttp);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    const imageUrlInput = this._addVolumeDialog.locator(
      'input[aria-label="Image URL"], .disk-source-form-group input[type="text"]',
    );
    await imageUrlInput.first().waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await imageUrlInput.first().fill(imageUrl);

    await this._createFormNameInput.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this._createFormNameInput.fill(volumeName);

    const selectPreferenceButton = this._addVolumeDialog.locator(
      'button:has-text("Select preference")',
    );
    await selectPreferenceButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(selectPreferenceButton);

    const searchPreferenceInput = this._selectInlineFilterInput;
    await searchPreferenceInput.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await searchPreferenceInput.fill(preference);

    const preferenceOption = this.locator(
      `#select-inline-filter-VirtualMachineClusterPreference-${preference}`,
    );
    await this.robustClick(preferenceOption);

    const selectInstanceButton = this._addVolumeDialog.locator(
      'button:has-text("Select InstanceType")',
    );
    await selectInstanceButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(selectInstanceButton);

    const redHatProvided = this._addVolumeDialog
      .locator('button:has-text("Red Hat provided")')
      .first();
    await this.robustClick(redHatProvided);

    const uSeries = this._addVolumeDialog.locator('button:has-text("U series")').first();
    await this.robustClick(uSeries);

    const instanceTypeOption = this.locator(`#u1 button:has-text("${instanceType}:")`).first();
    await this.robustClick(instanceTypeOption);

    await this._createFormSaveButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await expect(
      this._createFormSaveButton,
      'Create volume form Save button should be enabled after selecting HTTP source and instance type',
    ).toBeEnabled({
      timeout: TestTimeouts.FILE_UPLOAD,
    });
    await this.robustClick(this._createFormSaveButton);
  }

  /**
   * Fills and submits the Add volume form using Registry as source.
   * Call after clickCreateAndSelectOption('With form').
   * Selects source type "Registry" ([data-test="use-registry"]), fills container image URL,
   * optional cron expression for retain, volume name, preference and instance type, then saves.
   *
   * @param volumeName - Name for the bootable volume
   * @param registryUrl - Container image URL (e.g. quay.io/containerdisks/centos:7-2009)
   * @param cronExpression - Cron expression for retain (e.g. '0 0 * * 2')
   * @param options - Optional preference and instance type (defaults: alpine, nano)
   */
  async fillCreateBootableVolumeFormFromRegistryAndSave(
    volumeName: string,
    registryUrl: string,
    cronExpression: string,
    options: CreateBootableVolumeFormOptions = {},
  ): Promise<void> {
    const { preference = 'alpine', instanceType = 'nano' } = options;

    await this._addVolumeDialog.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });

    const sourceTypeSelect = this._addVolumeDialog.getByTestId('source-type-select');
    await sourceTypeSelect.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(sourceTypeSelect);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    const useRegistry = this.testId('use-registry');
    await useRegistry.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(useRegistry);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    const containerImageInput = this._addVolumeDialog.getByTestId(
      'volume-registry-container-source-input',
    );
    await containerImageInput.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await containerImageInput.fill(registryUrl);

    const cronExpInput = this._addVolumeDialog
      .locator('[data-test="volume-registry-retain-cron-expression"]')
      .or(this._addVolumeDialog.locator('#volume-registry-retain-cron-expression'));
    await cronExpInput.scrollIntoViewIfNeeded();
    await cronExpInput.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await cronExpInput.clear();
    await cronExpInput.fill(cronExpression);

    await this._createFormNameInput.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this._createFormNameInput.fill(volumeName);

    const selectPreferenceButton = this._addVolumeDialog.locator(
      'button:has-text("Select preference")',
    );
    await selectPreferenceButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(selectPreferenceButton);

    const searchPreferenceInput = this._selectInlineFilterInput;
    await searchPreferenceInput.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await searchPreferenceInput.fill(preference);

    const preferenceOption = this.locator(
      `#select-inline-filter-VirtualMachineClusterPreference-${preference}`,
    );
    await this.robustClick(preferenceOption);

    const selectInstanceButton = this._addVolumeDialog.locator(
      'button:has-text("Select InstanceType")',
    );
    await selectInstanceButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(selectInstanceButton);

    const redHatProvided = this._addVolumeDialog
      .locator('button:has-text("Red Hat provided")')
      .first();
    await this.robustClick(redHatProvided);

    const uSeries = this._addVolumeDialog.locator('button:has-text("U series")').first();
    await this.robustClick(uSeries);

    const instanceTypeOption = this.locator(`#u1 button:has-text("${instanceType}:")`).first();
    await this.robustClick(instanceTypeOption);

    await this._createFormSaveButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await expect(
      this._createFormSaveButton,
      'Create volume form Save button should be enabled after selecting registry source and instance type',
    ).toBeEnabled({
      timeout: TestTimeouts.FILE_UPLOAD,
    });
    await this.robustClick(this._createFormSaveButton);
  }

  /**
   * Fills and submits the Add volume form using a Volume snapshot as source.
   * Call after clickCreateAndSelectOption('With form').
   * Selects source type "Volume snapshot" from the source type dropdown, then snapshot project and
   * snapshot name, fills destination volume name, preference and instance type, then saves.
   *
   * @param volumeName - Name for the new bootable volume
   * @param snapshotName - Name of the VolumeSnapshot to use as source
   * @param projectNamespace - Namespace (project) where the snapshot lives
   * @param options - Optional preference and instance type (defaults: alpine, nano)
   */
  async fillCreateBootableVolumeFormFromSnapshotAndSave(
    volumeName: string,
    snapshotName: string,
    projectNamespace: string,
    options: CreateBootableVolumeFormOptions = {},
  ): Promise<void> {
    await this._addVolumeDialog.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });

    const sourceTypeSelect = this._addVolumeDialog.getByTestId('source-type-select');
    await sourceTypeSelect.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(sourceTypeSelect);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    const useSnapshot = this._roleOption.filter({ hasText: 'Volume snapshot' });
    await useSnapshot.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(useSnapshot);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    const snapshotProjectToggle = this._addVolumeDialog.locator(
      'button.pf-v6-c-menu-toggle:has-text("--- Select VolumeSnapshot project ---")',
    );
    await snapshotProjectToggle.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(snapshotProjectToggle);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    const snapshotProjectFilterInput = this._selectInlineFilterInput;
    const snapshotProjectFilterVisible = await snapshotProjectFilterInput
      .isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM })
      .catch(() => false);
    if (snapshotProjectFilterVisible) {
      await snapshotProjectFilterInput.fill(projectNamespace);
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    }

    const snapshotProjectOption = this.locator(`#select-inline-filter-${projectNamespace}`);
    await snapshotProjectOption.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(snapshotProjectOption);

    const snapshotNameToggle = this._addVolumeDialog.locator(
      'button.pf-v6-c-menu-toggle:has-text("--- Select VolumeSnapshot name ---")',
    );
    await snapshotNameToggle.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(snapshotNameToggle);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    const snapshotNameFilterInput = this._selectInlineFilterInput;
    const snapshotNameFilterVisible = await snapshotNameFilterInput
      .isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM })
      .catch(() => false);
    if (snapshotNameFilterVisible) {
      await snapshotNameFilterInput.fill(snapshotName);
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    }

    const snapshotOption = this.locator(
      `[id^="select-inline-filter-${snapshotName}"], button:has-text("${snapshotName}")`,
    ).first();
    await snapshotOption.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(snapshotOption);

    await this._waitForSnapshotSizeAndContinue(volumeName, options);
  }
}

export class BootableVolumesCreateComponent extends BaseComponent {
  private readonly _addVolumeDialog = this.locator('#tab-modal');
  private readonly _createFormNameInput = this._addVolumeDialog.locator('#volume-name, #name');
  private readonly _createFormSaveButton = this._addVolumeDialog.locator(
    '[data-test="save-button"]',
  );

  private readonly _roleOption = this.locator('[role="option"]');

  private readonly _selectInlineFilterInput = this.locator('#select-inline-filter input');

  constructor(page: Page) {
    super(page);
  }
  private async _waitForSnapshotSizeAndContinue(
    volumeName: string,
    options: CreateBootableVolumeFormOptions,
  ): Promise<void> {
    const { preference = 'alpine', instanceType = 'nano' } = options;

    const sizeCannotBeZero = this._addVolumeDialog.getByText('Size cannot be zero');
    await sizeCannotBeZero.waitFor({
      state: 'hidden',
      timeout: TestTimeouts.DATA_VOLUME_STATUS,
    });

    await this._createFormNameInput.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this._createFormNameInput.fill(volumeName);

    const selectPreferenceButton = this._addVolumeDialog.locator(
      'button:has-text("Select preference")',
    );
    await selectPreferenceButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(selectPreferenceButton);

    const searchPreferenceInput = this._selectInlineFilterInput;
    await searchPreferenceInput.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await searchPreferenceInput.fill(preference);

    const preferenceOption = this.locator(
      `#select-inline-filter-VirtualMachineClusterPreference-${preference}`,
    );
    await this.robustClick(preferenceOption);

    const selectInstanceButton = this._addVolumeDialog.locator(
      'button:has-text("Select InstanceType")',
    );
    await selectInstanceButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(selectInstanceButton);

    const redHatProvided = this._addVolumeDialog
      .locator('button:has-text("Red Hat provided")')
      .first();
    await this.robustClick(redHatProvided);

    const uSeries = this._addVolumeDialog.locator('button:has-text("U series")').first();
    await this.robustClick(uSeries);

    const instanceTypeOption = this.locator(`#u1 button:has-text("${instanceType}:")`).first();
    await this.robustClick(instanceTypeOption);

    await this._createFormSaveButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await expect(
      this._createFormSaveButton,
      'Create volume form Save button should be enabled after selecting volume snapshot source and instance type',
    ).toBeEnabled({
      timeout: TestTimeouts.FILE_UPLOAD,
    });
    await this.robustClick(this._createFormSaveButton);
  }

  override async clickCreateAndSelectOption(option: 'With form' | 'With YAML') {
    const optionSelectors = {
      'With form': 'button[role="menuitem"]:has-text("With form")',
      'With YAML': 'button[role="menuitem"]:has-text("With YAML")',
    };
    await super.clickCreateAndSelectOption(this.testId('item-create'), optionSelectors[option]);
  }

  async fillCreateBootableVolumeFormAndSave(
    volumeName: string,
    imageFilePath: string,
    options: CreateBootableVolumeFormOptions = {},
  ): Promise<void> {
    const { preference = 'alpine', instanceType = 'nano' } = options;

    await this._addVolumeDialog.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });

    const createFormFileInput = this._addVolumeDialog.locator('input[type="file"]');
    await createFormFileInput.waitFor({
      state: 'attached',
      timeout: TestTimeouts.FILE_UPLOAD,
    });
    await createFormFileInput.setInputFiles(imageFilePath);

    await this._createFormNameInput.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this._createFormNameInput.fill(volumeName);

    const selectPreferenceButton = this._addVolumeDialog.locator(
      'button:has-text("Select preference")',
    );
    await selectPreferenceButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(selectPreferenceButton);

    const searchPreferenceInput = this._selectInlineFilterInput;
    await searchPreferenceInput.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await searchPreferenceInput.fill(preference);

    const preferenceOption = this.locator(
      `#select-inline-filter-VirtualMachineClusterPreference-${preference}`,
    );
    await this.robustClick(preferenceOption);

    const selectInstanceButton = this._addVolumeDialog.locator(
      'button:has-text("Select InstanceType")',
    );
    await selectInstanceButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(selectInstanceButton);

    const redHatProvided = this._addVolumeDialog
      .locator('button:has-text("Red Hat provided")')
      .first();
    await this.robustClick(redHatProvided);

    const uSeries = this._addVolumeDialog.locator('button:has-text("U series")').first();
    await this.robustClick(uSeries);

    const instanceTypeOption = this.locator(`#u1 button:has-text("${instanceType}:")`).first();
    await this.robustClick(instanceTypeOption);

    await this._createFormSaveButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await expect(
      this._createFormSaveButton,
      'Create volume form Save button should be enabled after selecting instance type',
    ).toBeEnabled({
      timeout: TestTimeouts.FILE_UPLOAD,
    });
    await this.robustClick(this._createFormSaveButton);
  }

  async fillCreateBootableVolumeFormFromExistingAndSave(
    volumeName: string,
    existingVolumeName: string,
    projectNamespace: string,
    options: CreateBootableVolumeFormOptions = {},
  ): Promise<void> {
    const { preference = 'alpine', instanceType = 'nano' } = options;

    await this._addVolumeDialog.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });

    const sourceTypeSelect = this._addVolumeDialog.getByTestId('source-type-select');
    await sourceTypeSelect.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(sourceTypeSelect);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    const useExistingVolume = this.testId('use-existing-volume').locator('button');
    await this.robustClick(useExistingVolume, { force: true });
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    const volumeProjectToggle = this._addVolumeDialog.locator('#pvc-project-select button');
    await volumeProjectToggle.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(volumeProjectToggle);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    const projectFilterInput = this._selectInlineFilterInput;
    const projectFilterVisible = await projectFilterInput
      .isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM })
      .catch(() => false);
    if (projectFilterVisible) {
      await projectFilterInput.fill(projectNamespace);
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    }

    const projectOption = this.testId(`select-option-${projectNamespace}`);
    await projectOption.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
    await this.robustClick(projectOption);

    const volumeNameToggle = this._addVolumeDialog.locator('#pvc-name-select button');
    await volumeNameToggle.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(volumeNameToggle);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    const volumeNameFilterInput = this._selectInlineFilterInput;
    const volumeFilterVisible = await volumeNameFilterInput
      .isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM })
      .catch(() => false);
    if (volumeFilterVisible) {
      await volumeNameFilterInput.fill(existingVolumeName);
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    }

    const existingVolumeOption = this.locator('[role="listbox"]').getByTestId(existingVolumeName);
    await existingVolumeOption.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(existingVolumeOption);

    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    await this._createFormNameInput.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this._createFormNameInput.fill(volumeName);

    const selectPreferenceButton = this._addVolumeDialog.locator(
      'button:has-text("Select preference")',
    );
    await selectPreferenceButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(selectPreferenceButton);

    const searchPreferenceInput = this._selectInlineFilterInput;
    await searchPreferenceInput.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await searchPreferenceInput.fill(preference);

    const preferenceOption = this.locator(
      `#select-inline-filter-VirtualMachineClusterPreference-${preference}`,
    );
    await this.robustClick(preferenceOption);

    const selectInstanceButton = this._addVolumeDialog.locator(
      'button:has-text("Select InstanceType")',
    );
    await selectInstanceButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(selectInstanceButton);

    const redHatProvided = this._addVolumeDialog
      .locator('button:has-text("Red Hat provided")')
      .first();
    await this.robustClick(redHatProvided);

    const uSeries = this._addVolumeDialog.locator('button:has-text("U series")').first();
    await this.robustClick(uSeries);

    const instanceTypeOption = this.locator(`#u1 button:has-text("${instanceType}:")`).first();
    await this.robustClick(instanceTypeOption);

    await this._createFormSaveButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await expect(
      this._createFormSaveButton,
      'Create volume form Save button should be enabled after selecting existing volume source and instance type',
    ).toBeEnabled({
      timeout: TestTimeouts.FILE_UPLOAD,
    });
    await this.robustClick(this._createFormSaveButton);
  }

  async fillCreateBootableVolumeFormFromFirstSnapshotInNamespaceAndSave(
    volumeName: string,
    projectNamespace: string,
    options: CreateBootableVolumeFormOptions = {},
  ): Promise<void> {
    await this._addVolumeDialog.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });

    const sourceTypeSelect = this._addVolumeDialog.getByTestId('source-type-select');
    await sourceTypeSelect.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(sourceTypeSelect);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    const useSnapshot = this._roleOption.filter({ hasText: 'Volume snapshot' });
    await useSnapshot.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(useSnapshot);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    const snapshotProjectToggle = this._addVolumeDialog.locator(
      'button.pf-v6-c-menu-toggle:has-text("--- Select VolumeSnapshot project ---")',
    );
    await snapshotProjectToggle.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(snapshotProjectToggle);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    const snapshotProjectFilterInput = this._selectInlineFilterInput;
    const snapshotProjectFilterVisible = await snapshotProjectFilterInput
      .isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM })
      .catch(() => false);
    if (snapshotProjectFilterVisible) {
      await snapshotProjectFilterInput.fill(projectNamespace);
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    }

    const snapshotProjectOption = this.locator(`#select-inline-filter-${projectNamespace}`);
    await snapshotProjectOption.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(snapshotProjectOption);

    const snapshotNameToggle = this._addVolumeDialog.locator(
      'button.pf-v6-c-menu-toggle:has-text("--- Select VolumeSnapshot name ---")',
    );
    await snapshotNameToggle.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(snapshotNameToggle);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    const firstSnapshotOption = this.locator('[id^="select-inline-filter-vmsnapshot-"]').first();
    await firstSnapshotOption.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(firstSnapshotOption);

    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    await this._waitForSnapshotSizeAndContinue(volumeName, options);
  }

  async fillCreateBootableVolumeFormFromHttpAndSave(
    volumeName: string,
    imageUrl: string,
    options: CreateBootableVolumeFormOptions = {},
  ): Promise<void> {
    const { preference = 'alpine', instanceType = 'nano' } = options;

    await this._addVolumeDialog.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });

    const sourceTypeSelect = this._addVolumeDialog.getByTestId('source-type-select');
    await sourceTypeSelect.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(sourceTypeSelect);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    const useHttp = this.testId('use-http');
    await useHttp.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(useHttp);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    const imageUrlInput = this._addVolumeDialog.locator(
      'input[aria-label="Image URL"], .disk-source-form-group input[type="text"]',
    );
    await imageUrlInput.first().waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await imageUrlInput.first().fill(imageUrl);

    await this._createFormNameInput.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this._createFormNameInput.fill(volumeName);

    const selectPreferenceButton = this._addVolumeDialog.locator(
      'button:has-text("Select preference")',
    );
    await selectPreferenceButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(selectPreferenceButton);

    const searchPreferenceInput = this._selectInlineFilterInput;
    await searchPreferenceInput.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await searchPreferenceInput.fill(preference);

    const preferenceOption = this.locator(
      `#select-inline-filter-VirtualMachineClusterPreference-${preference}`,
    );
    await this.robustClick(preferenceOption);

    const selectInstanceButton = this._addVolumeDialog.locator(
      'button:has-text("Select InstanceType")',
    );
    await selectInstanceButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(selectInstanceButton);

    const redHatProvided = this._addVolumeDialog
      .locator('button:has-text("Red Hat provided")')
      .first();
    await this.robustClick(redHatProvided);

    const uSeries = this._addVolumeDialog.locator('button:has-text("U series")').first();
    await this.robustClick(uSeries);

    const instanceTypeOption = this.locator(`#u1 button:has-text("${instanceType}:")`).first();
    await this.robustClick(instanceTypeOption);

    await this._createFormSaveButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await expect(
      this._createFormSaveButton,
      'Create volume form Save button should be enabled after selecting HTTP source and instance type',
    ).toBeEnabled({
      timeout: TestTimeouts.FILE_UPLOAD,
    });
    await this.robustClick(this._createFormSaveButton);
  }

  async fillCreateBootableVolumeFormFromRegistryAndSave(
    volumeName: string,
    registryUrl: string,
    cronExpression: string,
    options: CreateBootableVolumeFormOptions = {},
  ): Promise<void> {
    const { preference = 'alpine', instanceType = 'nano' } = options;

    await this._addVolumeDialog.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });

    const sourceTypeSelect = this._addVolumeDialog.getByTestId('source-type-select');
    await sourceTypeSelect.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(sourceTypeSelect);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    const useRegistry = this.testId('use-registry');
    await useRegistry.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(useRegistry);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    const containerImageInput = this._addVolumeDialog.getByTestId(
      'volume-registry-container-source-input',
    );
    await containerImageInput.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await containerImageInput.fill(registryUrl);

    const cronExpInput = this._addVolumeDialog
      .locator('[data-test="volume-registry-retain-cron-expression"]')
      .or(this._addVolumeDialog.locator('#volume-registry-retain-cron-expression'));
    await cronExpInput.scrollIntoViewIfNeeded();
    await cronExpInput.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await cronExpInput.clear();
    await cronExpInput.fill(cronExpression);

    await this._createFormNameInput.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this._createFormNameInput.fill(volumeName);

    const selectPreferenceButton = this._addVolumeDialog.locator(
      'button:has-text("Select preference")',
    );
    await selectPreferenceButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(selectPreferenceButton);

    const searchPreferenceInput = this._selectInlineFilterInput;
    await searchPreferenceInput.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await searchPreferenceInput.fill(preference);

    const preferenceOption = this.locator(
      `#select-inline-filter-VirtualMachineClusterPreference-${preference}`,
    );
    await this.robustClick(preferenceOption);

    const selectInstanceButton = this._addVolumeDialog.locator(
      'button:has-text("Select InstanceType")',
    );
    await selectInstanceButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(selectInstanceButton);

    const redHatProvided = this._addVolumeDialog
      .locator('button:has-text("Red Hat provided")')
      .first();
    await this.robustClick(redHatProvided);

    const uSeries = this._addVolumeDialog.locator('button:has-text("U series")').first();
    await this.robustClick(uSeries);

    const instanceTypeOption = this.locator(`#u1 button:has-text("${instanceType}:")`).first();
    await this.robustClick(instanceTypeOption);

    await this._createFormSaveButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await expect(
      this._createFormSaveButton,
      'Create volume form Save button should be enabled after selecting registry source and instance type',
    ).toBeEnabled({
      timeout: TestTimeouts.FILE_UPLOAD,
    });
    await this.robustClick(this._createFormSaveButton);
  }

  async fillCreateBootableVolumeFormFromSnapshotAndSave(
    volumeName: string,
    snapshotName: string,
    projectNamespace: string,
    options: CreateBootableVolumeFormOptions = {},
  ): Promise<void> {
    await this._addVolumeDialog.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });

    const sourceTypeSelect = this._addVolumeDialog.getByTestId('source-type-select');
    await sourceTypeSelect.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(sourceTypeSelect);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    const useSnapshot = this._roleOption.filter({ hasText: 'Volume snapshot' });
    await useSnapshot.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(useSnapshot);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    const snapshotProjectToggle = this._addVolumeDialog.locator(
      'button.pf-v6-c-menu-toggle:has-text("--- Select VolumeSnapshot project ---")',
    );
    await snapshotProjectToggle.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(snapshotProjectToggle);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    const snapshotProjectFilterInput = this._selectInlineFilterInput;
    const snapshotProjectFilterVisible = await snapshotProjectFilterInput
      .isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM })
      .catch(() => false);
    if (snapshotProjectFilterVisible) {
      await snapshotProjectFilterInput.fill(projectNamespace);
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    }

    const snapshotProjectOption = this.locator(`#select-inline-filter-${projectNamespace}`);
    await snapshotProjectOption.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(snapshotProjectOption);

    const snapshotNameToggle = this._addVolumeDialog.locator(
      'button.pf-v6-c-menu-toggle:has-text("--- Select VolumeSnapshot name ---")',
    );
    await snapshotNameToggle.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(snapshotNameToggle);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    const snapshotNameFilterInput = this._selectInlineFilterInput;
    const snapshotNameFilterVisible = await snapshotNameFilterInput
      .isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM })
      .catch(() => false);
    if (snapshotNameFilterVisible) {
      await snapshotNameFilterInput.fill(snapshotName);
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    }

    const snapshotOption = this.locator(
      `[id^="select-inline-filter-${snapshotName}"], button:has-text("${snapshotName}")`,
    ).first();
    await snapshotOption.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(snapshotOption);

    await this._waitForSnapshotSizeAndContinue(volumeName, options);
  }

  async selectSourceTypeInAddVolumeModal(
    sourceType: 'URL' | 'Registry' | 'Volume' | 'Volume snapshot',
  ): Promise<void> {
    const sourceTypeLocators: Record<string, Locator> = {
      URL: this.testId('use-http'),
      Registry: this.testId('use-registry'),
      Volume: this.locator('button[role="option"]:has-text("Volume"):not(:has-text("snapshot"))'),
      'Volume snapshot': this.locator('button[role="option"]:has-text("Volume snapshot")'),
    };

    await this._addVolumeDialog.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });

    const sourceTypeSelect = this._addVolumeDialog.getByTestId('source-type-select');
    await sourceTypeSelect.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(sourceTypeSelect);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    const option = sourceTypeLocators[sourceType];
    await option.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(option);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }
}
