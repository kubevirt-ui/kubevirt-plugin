import BaseComponent from '@/components/shared/base-component';
import FilterToolbarComponent from '@/components/shared/filter-toolbar-component';
import { STEP_INSTANCE_TYPE_CONFIG } from '@/data-models/step-defaults';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

export interface CreateBootableVolumeFormOptions {
  preference?: string;
  instanceType?: string;
}

// ---------------------------------------------------------------------------
// BootableVolumeSnapshotSourceComponent
// ---------------------------------------------------------------------------

export class BootableVolumeSnapshotSourceComponent extends BaseComponent {
  private readonly _addVolumeDialog = this.locator('#tab-modal');
  private readonly _createFormNameInput = this._addVolumeDialog.locator('#volume-name, #name');
  private readonly _createFormSaveButton = this._addVolumeDialog.locator(
    '[data-test="save-button"]',
  );
  private readonly _selectInlineFilterInput = this.locator('#select-inline-filter input');
  private readonly _roleOption = this.locator('[role="option"]');

  constructor(page: Page) {
    super(page);
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

    const sourceTypeSelect = this._addVolumeDialog.locator('[data-test-id="source-type-select"]');
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

  async fillCreateBootableVolumeFormFromFirstSnapshotInNamespaceAndSave(
    volumeName: string,
    projectNamespace: string,
    options: CreateBootableVolumeFormOptions = {},
  ): Promise<void> {
    await this._addVolumeDialog.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });

    const sourceTypeSelect = this._addVolumeDialog.locator('[data-test-id="source-type-select"]');
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
}

// ---------------------------------------------------------------------------
// BootableVolumesCreateFormsComponent
// ---------------------------------------------------------------------------

export class BootableVolumesCreateFormsComponent extends BaseComponent {
  private readonly _addVolumeDialog = this.locator('#tab-modal');

  private readonly _createFormNameInput = this._addVolumeDialog.locator('#volume-name, #name');

  private readonly _createFormSaveButton = this._addVolumeDialog.locator(
    '[data-test="save-button"]',
  );

  private readonly _selectInlineFilterInput = this.locator('#select-inline-filter input');

  private readonly _snapshotSource: BootableVolumeSnapshotSourceComponent;

  constructor(page: Page) {
    super(page);
    this._snapshotSource = new BootableVolumeSnapshotSourceComponent(page);
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

    const sourceTypeSelect = this._addVolumeDialog.locator('[data-test-id="source-type-select"]');
    await sourceTypeSelect.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(sourceTypeSelect);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    const useExistingVolume = this.locator('[data-test-id="use-existing-volume"] button');
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

    const projectOption = this.locator(`[data-test-id="select-option-${projectNamespace}"]`);
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

    const existingVolumeOption = this.locator(
      `[role="listbox"] [data-test-id="${existingVolumeName}"]`,
    );
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

  async fillCreateBootableVolumeFormFromSnapshotAndSave(
    ...args: Parameters<
      BootableVolumeSnapshotSourceComponent['fillCreateBootableVolumeFormFromSnapshotAndSave']
    >
  ): ReturnType<
    BootableVolumeSnapshotSourceComponent['fillCreateBootableVolumeFormFromSnapshotAndSave']
  > {
    return this._snapshotSource.fillCreateBootableVolumeFormFromSnapshotAndSave(...args);
  }

  async fillCreateBootableVolumeFormFromFirstSnapshotInNamespaceAndSave(
    ...args: Parameters<
      BootableVolumeSnapshotSourceComponent['fillCreateBootableVolumeFormFromFirstSnapshotInNamespaceAndSave']
    >
  ): ReturnType<
    BootableVolumeSnapshotSourceComponent['fillCreateBootableVolumeFormFromFirstSnapshotInNamespaceAndSave']
  > {
    return this._snapshotSource.fillCreateBootableVolumeFormFromFirstSnapshotInNamespaceAndSave(
      ...args,
    );
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

    const sourceTypeSelect = this._addVolumeDialog.locator('[data-test-id="source-type-select"]');
    await sourceTypeSelect.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(sourceTypeSelect);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    const useRegistry = this.locator('[data-test-id="use-registry"]');
    await useRegistry.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(useRegistry);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    const containerImageInput = this._addVolumeDialog.locator(
      '[data-test-id="volume-registry-container-source-input"]',
    );
    await containerImageInput.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await containerImageInput.fill(registryUrl);

    const cronExpInput = this._addVolumeDialog.locator(
      'input[data-test-id="volume-registry-retain-cron-expression"], #volume-registry-retain-cron-expression',
    );
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

    const sourceTypeSelect = this._addVolumeDialog.locator('[data-test-id="source-type-select"]');
    await sourceTypeSelect.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(sourceTypeSelect);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    const useHttp = this.locator('[data-test-id="use-http"]');
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
}

// ---------------------------------------------------------------------------
// BootableVolumesFilterComponent
// ---------------------------------------------------------------------------

export class BootableVolumesFilterComponent extends BaseComponent {
  readonly filterToolbar: FilterToolbarComponent;

  private readonly _dataLabelCluster = this.locator('[data-label="Cluster"]');
  private readonly _dataLabelNamespace = this.locator('[data-label="Namespace"]');

  constructor(page: Page) {
    super(page);
    this.filterToolbar = new FilterToolbarComponent(page);
  }

  async isClusterFilterButtonVisible(
    timeout: number = TestTimeouts.UI_VISIBILITY_QUICK,
  ): Promise<boolean> {
    try {
      await this.locator('#filter-toolbar button', { hasText: 'Cluster' }).waitFor({
        state: 'visible',
        timeout,
      });
      return true;
    } catch {
      return false;
    }
  }

  async isProjectFilterButtonVisible(timeout: number = TestTimeouts.DEFAULT): Promise<boolean> {
    try {
      await this.locator('#filter-toolbar button', { hasText: 'Project' }).waitFor({
        state: 'visible',
        timeout,
      });
      return true;
    } catch {
      return false;
    }
  }

  async verifyClusterAndProjectFilterButtonsVisible(): Promise<boolean> {
    try {
      if (!(await this.filterToolbar.isFilterToolbarVisible(TestTimeouts.DEFAULT))) {
        return false;
      }
      await this.locator('#filter-toolbar button', { hasText: 'Project' }).waitFor({
        state: 'visible',
        timeout: TestTimeouts.DEFAULT,
      });
      await this.locator('#filter-toolbar button', { hasText: 'Cluster' }).waitFor({
        state: 'visible',
        timeout: TestTimeouts.DEFAULT,
      });
      return true;
    } catch {
      return false;
    }
  }

  async verifyClusterColumnHeaderVisible(): Promise<boolean> {
    try {
      const clusterColumnHeader = this._dataLabelCluster;
      await clusterColumnHeader.waitFor({
        state: 'visible',
        timeout: TestTimeouts.DEFAULT,
      });
      return true;
    } catch {
      return false;
    }
  }

  async verifyAtLeastOneClusterIdentifierVisible(clusterNames: string[]): Promise<boolean> {
    if (clusterNames.length === 0) {
      return true;
    }
    const visibilityTimeout = TestTimeouts.UI_DELAY_MEDIUM;
    try {
      const localClusterIdentifier = this.locator('[data-test-id="local-cluster"]');
      const localVisible = await localClusterIdentifier
        .isVisible({ timeout: visibilityTimeout })
        .catch(() => false);
      if (localVisible) {
        return true;
      }
      for (const name of clusterNames) {
        const cell = this._dataLabelCluster.filter({ hasText: name }).first();
        const visible = await cell.isVisible({ timeout: visibilityTimeout }).catch(() => false);
        if (visible) {
          return true;
        }
        const byTestId = this.locator(`[data-test-id="${name}"]`);
        const byTestIdCount = await byTestId.count();
        if (byTestIdCount > 0) {
          const testIdVisible = await byTestId
            .first()
            .isVisible({ timeout: visibilityTimeout })
            .catch(() => false);
          if (testIdVisible) {
            return true;
          }
        }
      }
      return false;
    } catch {
      return false;
    }
  }

  async verifyNamespaceColumnHeaderVisible(): Promise<boolean> {
    try {
      const namespaceColumnHeader = this._dataLabelNamespace;
      await namespaceColumnHeader.waitFor({
        state: 'visible',
        timeout: TestTimeouts.DEFAULT,
      });
      return true;
    } catch {
      return false;
    }
  }

  async verifyAtLeastOneNamespaceIdentifierVisible(namespaceNames: string[]): Promise<boolean> {
    if (namespaceNames.length === 0) {
      return true;
    }
    const visibilityTimeout = TestTimeouts.UI_DELAY_MEDIUM;
    try {
      const namespaceOsImagesIndicator = this.locator(
        '[data-test="openshift-virtualization-os-images"]',
      );
      const osImagesVisible = await namespaceOsImagesIndicator
        .isVisible({ timeout: visibilityTimeout })
        .catch(() => false);
      if (osImagesVisible) {
        return true;
      }
      for (const name of namespaceNames) {
        const cell = this._dataLabelNamespace.filter({ hasText: name }).first();
        const visible = await cell.isVisible({ timeout: visibilityTimeout }).catch(() => false);
        if (visible) {
          return true;
        }
        const byTestId = this.locator(`[data-test-id="${name}"]`);
        const byTestIdCount = await byTestId.count();
        if (byTestIdCount > 0) {
          const testIdVisible = await byTestId
            .first()
            .isVisible({ timeout: visibilityTimeout })
            .catch(() => false);
          if (testIdVisible) {
            return true;
          }
        }
      }
      return false;
    } catch {
      return false;
    }
  }

  async clickManageColumnsAndVerifyNamespaceAndClusterInModal(): Promise<boolean> {
    try {
      const manageColumnsBtn = this.locator('[data-test="manage-columns"]');
      await manageColumnsBtn.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await manageColumnsBtn.click();
      const columnManagementItemNamespace = this.locator('#table-column-management-item-namespace');
      const columnManagementItemCluster = this.locator('#table-column-management-item-cluster');
      const namespaceVisible = await columnManagementItemNamespace
        .isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM })
        .catch(() => false);
      const clusterVisible = await columnManagementItemCluster
        .isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM })
        .catch(() => false);
      return namespaceVisible && clusterVisible;
    } catch {
      return false;
    }
  }

  async openClusterFilter(): Promise<void> {
    await this.filterToolbar.openFilterButton('Cluster');
  }

  async selectClusterInFilterMenu(clusterName: string): Promise<void> {
    await this.filterToolbar.selectMenuItem(clusterName);
  }

  async openProjectFilter(): Promise<void> {
    await this.filterToolbar.openFilterButton('Project');
  }

  async selectNamespaceInFilterMenu(
    namespaceName: string,
    options?: { force?: boolean },
  ): Promise<void> {
    await this.filterToolbar.selectMenuItem(namespaceName, options);
  }

  async waitForClusterFilterApplied(): Promise<void> {
    await this.filterToolbar.waitForFilterApplied();
    await this.page.waitForTimeout(3000);
  }

  async closeFilterLabelGroup(): Promise<void> {
    await this.filterToolbar.closeFilterChip();
  }

  async getColumnHeaders(): Promise<string[]> {
    const tableLocator = this.page.locator('.kubevirt-table, [class*="c-table"]').first();
    await tableLocator
      .waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT })
      .catch((_e) => undefined);
    const headerLocator = tableLocator.locator('th');
    const fallbackHeaderLocator = this.page.locator('th');
    const locator = (await tableLocator.isVisible().catch(() => false))
      ? headerLocator
      : fallbackHeaderLocator;
    await locator.first().waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
    const count = await locator.count();
    const texts: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = (await locator.nth(i).textContent())?.trim();
      if (text) texts.push(text);
    }
    return texts;
  }

  async verifySearchFilterVisible(): Promise<boolean> {
    try {
      const filter = this.locator('[data-test-id="item-filter"]');
      await filter.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      return true;
    } catch {
      return false;
    }
  }
}

// ---------------------------------------------------------------------------
// BootableVolumesRowActionsComponent
// ---------------------------------------------------------------------------
