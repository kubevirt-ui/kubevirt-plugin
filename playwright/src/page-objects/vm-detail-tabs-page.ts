import BasePage from '@/page-objects/base-page';
import type { VmDetailPage } from '@/page-objects/vm-detail-page';
import { dismissConsoleObstructions } from '@/utils/console-modals';
import { pollUntil } from '@/utils/poll-until';
import { TestTimeouts } from '@/utils/test-config';
import type { Locator } from '@playwright/test';

/** VM detail configuration / snapshots tab interactions (CRUD). */
export class VmDetailTabsPage extends BasePage {
  private cloudInitEditOnInitialRun(): Locator {
    const panel = this.initialRunPanel();
    return panel
      .getByTestId('vm-configuration-cloud-init-edit')
      .or(
        panel
          .locator('dt')
          .filter({ hasText: /^Cloud-init$/ })
          .getByRole('button', { name: /^Edit$/i }),
      )
      .or(panel.getByRole('button', { name: /^Edit$/i }).first())
      .first();
  }

  private cloudInitScriptEditorArea(): Locator {
    // 4.22 may render monaco without the legacy `.cloud-init-editor` wrapper class.
    return this.cloudInitModal()
      .locator(
        '.yaml-container:has(.cloud-init-editor), .yaml-container:has(.monaco-editor), .cloud-init-editor',
      )
      .or(
        this.cloudInitModal()
          .locator('.monaco-editor')
          .locator(
            'xpath=ancestor::*[contains(@class,"yaml") or contains(@class,"cloud-init")][1]',
          ),
      )
      .or(this.cloudInitModal().locator('.monaco-editor'))
      .first();
  }

  private environmentAddButton(): Locator {
    return this.page
      .locator('.environment-form__form')
      .getByRole('button', { name: /Add Config Map, Secret,? or Service Account/i })
      .or(this.page.getByRole('button', { name: /Add Config Map, Secret,? or Service Account/i }))
      .first();
  }

  private environmentEditorScope(): Locator {
    return this.page
      .locator('.environment-form__form')
      .or(
        this.page.locator('main').filter({
          has: this.page.getByRole('heading', { name: /^Environment$/i, level: 2 }),
        }),
      )
      .or(
        this.page
          .getByRole('tabpanel', { name: /^Environment$/i })
          .or(
            this.page.locator(
              '.VirtualMachineConfigurationTab--body, .VirtualMachineConfigurationTab__body',
            ),
          )
          .filter({ has: this.page.getByText(/Include all values/i) }),
      )
      .first();
  }

  private environmentResourceOption(row: Locator, resourceName: string): Locator {
    const namePattern = new RegExp(resourceName);
    return row
      .getByRole('option', { name: namePattern })
      .or(
        row
          .locator('[role="listbox"] [role="option"], .pf-v6-c-menu__item, .pf-c-select__menu-item')
          .filter({ hasText: resourceName }),
      )
      .or(this.page.getByRole('option', { name: namePattern }));
  }

  private initialRunPanel(): Locator {
    return this.page.getByRole('tabpanel', { name: /Initial run/i }).filter({ visible: true });
  }

  private async selectEnvironmentResource(row: Locator, resourceName: string): Promise<void> {
    await pollUntil(
      async () =>
        !(await row
          .locator('.co-m-loader, .pf-v6-c-spinner, .pf-c-spinner')
          .first()
          .isVisible()
          .catch(() => false)),
      {
        message: 'Environment resource picker should finish loading',
        timeout: TestTimeouts.LONG_OPERATION,
      },
    );
    await pollUntil(
      async () => {
        const toggle = row.getByRole('button', { name: /Select a resource/i }).first();
        if (!(await toggle.isVisible().catch(() => false))) {
          return false;
        }
        await this.robustClick(toggle);
        const search = this.page.getByRole('searchbox').last();
        if (await search.isVisible().catch(() => false)) {
          await search.fill(resourceName);
        }
        const option = this.page
          .getByRole('option', {
            name: new RegExp(resourceName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
          })
          .or(
            this.page
              .locator('[role="listbox"] [role="option"], .pf-v6-c-menu__item')
              .filter({ hasText: resourceName }),
          )
          .first();
        if (!(await option.isVisible().catch(() => false))) {
          await this.page.keyboard.press('Escape').catch(() => undefined);
          return false;
        }
        await this.robustClick(option);
        return true;
      },
      {
        intervalMs: 750,
        message: `ConfigMap ${resourceName} should appear in the environment resource list`,
        timeout: TestTimeouts.ELEMENT_WAIT,
      },
    );
  }

  /**
   * Adds a container (ephemeral) disk. Keeps the modal's auto-generated name —
   * DiskNameInput's debounced dual disk/volume fields desync when Playwright overwrites `#name`,
   * which produces "disks must not have the same Name" on Save.
   * @returns the disk name that was saved
   */
  async addContainerEphemeralDisk(image: string): Promise<string> {
    const dialog = () =>
      this.page.getByRole('dialog').filter({
        has: this.addDiskModalHeading(),
      });
    const containerInput = () =>
      dialog().locator('[data-test-id="disk-source-container"], #disk-source-container').first();
    const nameInput = () => dialog().locator('#name').first();

    let savedName = '';

    const diskVisible = async (name: string): Promise<boolean> =>
      !!name &&
      (await this.diskRow(name)
        .first()
        .isVisible()
        .catch(() => false));

    const closeAddDiskModal = async (): Promise<void> => {
      const cancel = dialog()
        .getByRole('button', { name: /^Cancel$/i })
        .first();
      if (await cancel.isVisible().catch(() => false)) {
        await cancel.click({ force: true }).catch(() => undefined);
      } else {
        await this.page.keyboard.press('Escape').catch(() => undefined);
      }
      await this.addDiskModalHeading()
        .waitFor({ state: 'hidden', timeout: TestTimeouts.UI_ACTION_COMPLETE })
        .catch(() => undefined);
    };

    await pollUntil(
      async () => {
        if (savedName && (await diskVisible(savedName))) {
          if (
            await this.addDiskModalHeading()
              .isVisible()
              .catch(() => false)
          ) {
            await closeAddDiskModal();
          }
          return true;
        }
        if (
          !(await this.addDiskModalHeading()
            .isVisible()
            .catch(() => false))
        ) {
          await this.openAddDiskModal('ephemeral');
        }
        const imageField = containerInput();
        if (!(await imageField.isVisible().catch(() => false))) {
          await closeAddDiskModal();
          await this.openAddDiskModal('ephemeral');
          return false;
        }
        await imageField.click({ timeout: TestTimeouts.UI_ACTION_COMPLETE }).catch(() => undefined);
        await imageField.fill(image).catch(() => undefined);
        await imageField.blur().catch(() => undefined);
        if ((await imageField.inputValue().catch(() => '')) !== image) {
          return false;
        }

        const nameField = nameInput();
        savedName = ((await nameField.inputValue().catch(() => '')) ?? '').trim();
        if (!savedName) {
          return false;
        }

        const save = dialog()
          .getByRole('button', { name: /^Save$/i })
          .first();
        if (!(await save.isVisible().catch(() => false))) {
          return false;
        }
        if (!(await save.isEnabled().catch(() => false))) {
          return false;
        }
        await save
          .click({ force: true, timeout: TestTimeouts.UI_ACTION_COMPLETE })
          .catch(() => undefined);

        if (await diskVisible(savedName)) {
          await closeAddDiskModal();
          return true;
        }
        const duplicateErr = dialog().getByText(/must not have the same Name/i);
        if (await duplicateErr.isVisible().catch(() => false)) {
          await closeAddDiskModal();
          return diskVisible(savedName);
        }
        return !(await this.addDiskModalHeading()
          .isVisible()
          .catch(() => false));
      },
      {
        message: 'Add container disk Save should submit and close the modal',
        timeout: TestTimeouts.LONG_OPERATION,
      },
    );

    await pollUntil(async () => diskVisible(savedName), {
      message: `Disk row ${savedName || '(unknown)'} should appear after save`,
      timeout: TestTimeouts.LONG_OPERATION,
    });
    return savedName;
  }

  addDiskButton(): Locator {
    return this.page
      .getByRole('tabpanel', { name: /^Storage$/i })
      .getByRole('button', { name: /^Add$/i })
      .or(this.page.getByRole('button', { name: /Add disk/i }))
      .or(this.page.locator('.disk-list-page__list-page-create-button'));
  }

  private addDiskSourceMenuOption(source: 'blank' | 'ephemeral'): Locator {
    if (source === 'ephemeral') {
      // Prefer exact 4.22 label; avoid matching unrelated "Container"/"Registry" items.
      return this.page
        .getByRole('menuitem', { name: /Ephemeral disk \(Container image\)/i })
        .or(this.page.getByRole('option', { name: /Ephemeral disk \(Container image\)/i }))
        .or(this.page.getByRole('menuitem', { name: /Ephemeral disk|Container image/i }))
        .or(this.page.getByRole('option', { name: /Ephemeral disk|Container image/i }));
    }
    return this.page
      .getByRole('menuitem', { name: /Empty disk \(blank\)|Blank/i })
      .or(this.page.getByRole('option', { name: /Empty disk \(blank\)|Blank/i }));
  }

  addDiskModalHeading(): Locator {
    return this.page.getByRole('heading', { name: /Add disk/i });
  }

  async addEnvironmentConfigMap(
    configMapName: string,
    reopen?: () => Promise<void>,
  ): Promise<void> {
    const run = async (): Promise<void> => {
      const env = this.environmentEditorScope();
      const addButton = this.environmentAddButton();
      await addButton.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      await this.robustClick(addButton);
      const row = env.locator('.pairs-list__row').last();
      await row.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      await this.selectEnvironmentResource(row, configMapName);

      const save = env.getByRole('button', { disabled: false, name: /^Save$/i });
      await save.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      await this.robustClick(save.first());
      await pollUntil(
        async () => (await this.environmentConfigMapReference(configMapName).count()) > 0,
        {
          message: `Environment should reference ConfigMap ${configMapName}`,
          timeout: TestTimeouts.ELEMENT_WAIT,
        },
      );
    };

    try {
      await run();
    } catch (error) {
      if (!reopen) {
        throw error;
      }
      await this.page.reload({ waitUntil: 'domcontentloaded' });
      await reopen();
      await run();
    }
  }

  async applyCloudInitModal(): Promise<void> {
    const apply = this.cloudInitModal().getByRole('button', { name: /^Apply$/i });
    await pollUntil(async () => await apply.isEnabled(), {
      message: 'Cloud-init Apply should be enabled after script save',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await this.robustClick(apply);
    await this.cloudInitModal().waitFor({ state: 'hidden', timeout: TestTimeouts.LONG_OPERATION });
  }

  private addCdRomMenuOption(): Locator {
    return this.page
      .locator('.pf-v6-c-menu__item, .pf-c-dropdown__menu-item, [role="menuitem"], [role="option"]')
      .filter({ hasText: /CD-ROM/i })
      .or(this.page.locator('[data-test-id="disk-type-select-cdrom"]'))
      .or(this.page.getByRole('menuitem', { name: /CD-ROM/i }))
      .or(this.page.getByRole('option', { name: /CD-ROM/i }));
  }

  addCdRomModal(): Locator {
    return this.page
      .locator('#tab-modal')
      .filter({ visible: true })
      .filter({ has: this.addCdRomModalHeading() })
      .or(
        this.page.getByRole('dialog').filter({
          has: this.addCdRomModalHeading(),
        }),
      )
      .first();
  }

  addCdRomModalHeading(): Locator {
    return this.page.getByRole('heading', { name: /^Add CD-ROM$/i });
  }

  addCdRomSubmitButton(): Locator {
    return this.addCdRomModal().getByRole('button', { name: /^Add$/i });
  }

  uploadIsoToClusterCheckbox(): Locator {
    return this.addCdRomModal()
      .locator('#upload-iso-checkbox')
      .or(this.addCdRomModal().getByRole('checkbox', { name: /Upload a new ISO/i }));
  }

  cdRomDiskNameInput(): Locator {
    return this.addCdRomModal()
      .getByRole('textbox', { name: /^Name$/i })
      .or(this.addCdRomModal().locator('#name'));
  }

  async selectLeaveEmptyCdRomDrive(): Promise<void> {
    const modal = this.addCdRomModal();
    await modal.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });

    // PF6: `#cdrom-source-empty` + label[for], and a visible role=radio "Leave empty drive".
    // Prefer the radio / label click; force-check the input if the UI lags.
    const emptyDriveInput = modal.locator('#cdrom-source-empty');
    const emptyDriveLabel = modal.locator('label[for="cdrom-source-empty"]');
    const emptyDriveRadio = modal.getByRole('radio', { name: /^Leave empty drive$/i });

    if (await emptyDriveInput.count()) {
      if (await emptyDriveInput.isDisabled().catch(() => false)) {
        throw new Error(
          'Leave empty drive is disabled — enable advanced CD-ROM features (declarativeHotplugVolumes)',
        );
      }
      if (await emptyDriveRadio.isVisible().catch(() => false)) {
        await this.robustClick(emptyDriveRadio);
      } else if (await emptyDriveLabel.isVisible().catch(() => false)) {
        await this.robustClick(emptyDriveLabel);
      } else {
        await emptyDriveInput.check({ force: true });
      }
      await pollUntil(
        async () => {
          const checked = await emptyDriveInput.isChecked().catch(() => false);
          if (!checked) {
            await emptyDriveInput.check({ force: true }).catch(() => undefined);
            return false;
          }
          return this.addCdRomSubmitButton()
            .isEnabled()
            .catch(() => false);
        },
        {
          message: 'Add CD-ROM should enable after Leave empty drive',
          timeout: TestTimeouts.ELEMENT_WAIT,
        },
      );
      return;
    }

    if (await emptyDriveRadio.isVisible().catch(() => false)) {
      await this.robustClick(emptyDriveRadio);
      await pollUntil(
        async () =>
          this.addCdRomSubmitButton()
            .isEnabled()
            .catch(() => false),
        {
          message: 'Add CD-ROM should enable after Leave empty drive',
          timeout: TestTimeouts.ELEMENT_WAIT,
        },
      );
      return;
    }

    await this.ensureUploadIsoToClusterUnchecked();
  }

  cdRomStorageRow(): Locator {
    return this.page
      .getByRole('grid', { name: /Disks table/i })
      .getByRole('row')
      .filter({ has: this.page.getByRole('gridcell') })
      .filter({ hasText: /CD-ROM/i });
  }

  async addEmptyCdRomFromConfigurationStorage(): Promise<string> {
    await this.openAddCdRomModal();
    await this.selectLeaveEmptyCdRomDrive();
    let name = '';
    const nameInput = this.cdRomDiskNameInput();
    if (await nameInput.isVisible().catch(() => false)) {
      name = ((await nameInput.inputValue()) || '').trim();
    }
    await this.confirmAddCdRomModal();
    if (!name) {
      const row = this.cdRomStorageRow().last();
      name = ((await row.locator('[role="gridcell"]').first().textContent()) ?? '').trim();
    }
    return name;
  }

  async openAddCdRomModal(): Promise<void> {
    await dismissConsoleObstructions(this.page);
    const addBtn = this.addDiskButton().first();
    await addBtn.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await pollUntil(
      async () => {
        const option = this.addCdRomMenuOption().first();
        if (await option.isVisible().catch(() => false)) {
          return true;
        }
        await this.robustClick(addBtn);
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
        return option.isVisible().catch(() => false);
      },
      {
        message: 'Add → CD-ROM menu option should appear (advanced CD-ROM preview)',
        timeout: TestTimeouts.ELEMENT_WAIT,
      },
    );
    await this.robustClick(this.addCdRomMenuOption().first());
    await this.addCdRomModalHeading().waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
  }

  async ensureUploadIsoToClusterUnchecked(): Promise<void> {
    const checkbox = this.uploadIsoToClusterCheckbox();
    if (!(await checkbox.isVisible().catch(() => false))) {
      return;
    }
    if (await checkbox.isChecked().catch(() => false)) {
      await checkbox.uncheck();
    }
  }

  /** Empty CD-ROM (no ISO / upload) — requires `declarativeHotplugVolumes` preview enabled in global setup. */
  async confirmAddCdRomModal(): Promise<void> {
    const dialog = this.addCdRomModal();
    const addButton = this.addCdRomSubmitButton();
    await pollUntil(async () => await addButton.isEnabled().catch(() => false), {
      message:
        'Add CD-ROM should be enabled when upload ISO is off and advanced CD-ROM preview is on',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await this.robustClick(addButton);
    await dialog.waitFor({ state: 'hidden', timeout: TestTimeouts.LONG_OPERATION });
    await pollUntil(async () => (await this.cdRomStorageRow().count()) > 0, {
      message: 'Storage table should list a CD-ROM drive after add',
      timeout: TestTimeouts.LONG_OPERATION,
    });
  }

  async addEmptyCdRomFromStorage(diskName?: string): Promise<string> {
    await this.openAddCdRomModal();
    await this.selectLeaveEmptyCdRomDrive();
    const dialog = this.addCdRomModal();
    const nameInput = dialog.locator('#name');
    await nameInput.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    if (diskName) {
      await nameInput.fill(diskName);
    }
    const resolvedName = (await nameInput.inputValue()) || diskName || '';
    await this.confirmAddCdRomModal();
    return resolvedName;
  }

  async cancelAddDiskModal(): Promise<void> {
    const dialog = this.page.getByRole('dialog').filter({ has: this.addDiskModalHeading() });
    await this.robustClick(dialog.getByRole('button', { name: /^Cancel$/i }));
    await dialog.waitFor({ state: 'hidden', timeout: TestTimeouts.ELEMENT_WAIT });
  }

  async closeCloudInitModal(): Promise<void> {
    await this.robustClick(this.cloudInitModal().getByRole('button', { name: /^Cancel$/i }));
    await this.cloudInitModal().waitFor({ state: 'hidden', timeout: TestTimeouts.ELEMENT_WAIT });
  }

  cloudInitConfigureViaFormRadio(): Locator {
    return this.cloudInitModal().getByRole('radio', { name: /^Form view$/i });
  }

  cloudInitConfigureViaScriptRadio(): Locator {
    return this.cloudInitModal().getByRole('radio', { name: /^Script$/i });
  }

  cloudInitModal(): Locator {
    const heading = this.page.getByRole('heading', { name: /^Cloud-init$/i });
    const dialog = this.page.getByRole('dialog').filter({ visible: true }).filter({ has: heading });
    const tabModal = this.page
      .locator('#tab-modal')
      .filter({ visible: true })
      .filter({ has: heading });
    return dialog.or(tabModal).first();
  }

  cloudInitScriptEditorDownloadButton(): Locator {
    return this.cloudInitScriptEditorArea().getByRole('button', { name: /^Download$/i });
  }

  async createSnapshot(snapshotName: string): Promise<boolean> {
    await this.robustClick(this.takeSnapshotButton());
    const dialog = this.page.getByRole('dialog', { name: /Take snapshot/i });
    await dialog.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    const unsupported = dialog.getByText(/No disks included in this snapshot/i);
    if (await unsupported.isVisible().catch(() => false)) {
      await dialog.getByRole('button', { name: /^Cancel$/i }).click();
      return false;
    }
    await dialog.locator('#name').fill(snapshotName);
    const save = dialog.getByRole('button', { name: /^Save$/i });
    await this.robustClick(save);
    await dialog.waitFor({ state: 'hidden', timeout: TestTimeouts.LONG_OPERATION });
    await this.page
      .getByRole('link', { name: snapshotName })
      .or(this.page.getByText(snapshotName))
      .first()
      .waitFor({ state: 'visible', timeout: TestTimeouts.LONG_OPERATION });
    return true;
  }

  async deleteSnapshot(snapshotName: string): Promise<void> {
    const row = this.page
      .getByRole('row')
      .filter({ has: this.page.getByRole('link', { name: snapshotName }) })
      .first();
    await row.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    // PF6 snapshot row actions use plain menu-toggle (no legacy kebab class).
    const kebab = row
      .locator(
        'button.pf-v6-c-menu-toggle, button.pf-v5-c-menu-toggle, [data-test="kebab-button"], [data-test-id="kebab-button"], button[id^="toggle-id"]',
      )
      .last()
      .or(row.locator('[role="gridcell"]').last().getByRole('button').last());

    await pollUntil(
      async () => {
        await dismissConsoleObstructions(this.page);
        if ((await kebab.getAttribute('aria-expanded').catch(() => null)) !== 'true') {
          await kebab.scrollIntoViewIfNeeded().catch(() => undefined);
          await this.robustClick(kebab);
        }
        for (const frame of this.page.frames()) {
          const item = frame
            .getByRole('menuitem', { name: /^Delete snapshot$/i })
            .or(frame.getByRole('menuitem', { name: /^Delete$/i }))
            .first();
          if (
            (await item.isVisible().catch(() => false)) &&
            (await item.isEnabled().catch(() => false))
          ) {
            await item.click();
            return true;
          }
        }
        const menu = this.page
          .locator('.pf-c-dropdown__menu, .pf-v6-c-dropdown__menu, .pf-v6-c-menu, [role="menu"]')
          .filter({ visible: true })
          .last();
        const item = menu
          .getByRole('menuitem', { name: /^Delete snapshot$/i })
          .or(menu.getByRole('menuitem', { name: /^Delete$/i }))
          .or(menu.getByRole('button', { name: /^Delete snapshot$|^Delete$/i }))
          .first();
        if (
          (await item.isVisible().catch(() => false)) &&
          (await item.isEnabled().catch(() => false))
        ) {
          await item.click();
          return true;
        }
        return false;
      },
      {
        message: 'Delete snapshot action should appear in row menu',
        timeout: TestTimeouts.ELEMENT_WAIT,
      },
    );

    const dialog = this.page
      .getByRole('dialog')
      .filter({ hasText: /Delete VirtualMachineSnapshot|Delete snapshot/i });
    await dialog.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(
      dialog.getByRole('button', { name: /^Delete snapshot$|^Delete$/i }).first(),
    );
    await dialog.waitFor({ state: 'hidden', timeout: TestTimeouts.LONG_OPERATION });
  }

  async detachDisk(diskName: string): Promise<void> {
    const row = this.diskRow(diskName).first();
    await row.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    // PF6 disk row actions use plain menu-toggle (no kebab data-test).
    const kebab = row
      .locator(
        'button.pf-v6-c-menu-toggle, button.pf-v5-c-menu-toggle, [data-test="kebab-button"], [data-test-id="kebab-button"], button[id^="toggle-id"]',
      )
      .last()
      .or(row.locator('[role="gridcell"]').last().getByRole('button').last());

    await pollUntil(
      async () => {
        await dismissConsoleObstructions(this.page);
        await this.page.keyboard.press('Escape').catch(() => undefined);
        await kebab.scrollIntoViewIfNeeded().catch(() => undefined);
        if ((await kebab.getAttribute('aria-expanded').catch(() => null)) !== 'true') {
          await this.robustClick(kebab);
        }
        for (const frame of this.page.frames()) {
          const item = frame.getByRole('menuitem', { name: /^Detach$/i }).first();
          if (
            (await item.isVisible().catch(() => false)) &&
            (await item.isEnabled().catch(() => false))
          ) {
            await item.click();
            return true;
          }
        }
        const menu = this.page
          .locator('.pf-c-dropdown__menu, .pf-v6-c-dropdown__menu, .pf-v6-c-menu, [role="menu"]')
          .filter({ visible: true })
          .last();
        const item = menu.getByRole('menuitem', { name: /^Detach$/i }).first();
        if (
          (await item.isVisible().catch(() => false)) &&
          (await item.isEnabled().catch(() => false))
        ) {
          await item.click();
          return true;
        }
        return false;
      },
      {
        message: 'Detach disk action should appear in row menu',
        timeout: TestTimeouts.ELEMENT_WAIT,
      },
    );

    const dialog = this.page
      .getByRole('dialog')
      .filter({ hasText: /Detach disk|disk/i })
      .first();
    await dialog.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(dialog.getByRole('button', { name: /^Detach$|^Delete$/i }).first());
    await dialog.waitFor({ state: 'hidden', timeout: TestTimeouts.LONG_OPERATION });
  }

  diskRow(diskName: string): Locator {
    // 4.22 disk name cell is often "rootdisk bootable" — exact text match misses the badge.
    const escaped = diskName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return this.page.getByRole('row', { name: new RegExp(`^${escaped}\\b`, 'i') }).or(
      this.page.locator('[role="row"]').filter({
        has: this.page.getByRole('gridcell', { name: new RegExp(`^${escaped}\\b`, 'i') }),
      }),
    );
  }

  environmentConfigMapReference(configMapName: string): Locator {
    return this.environmentEditorScope().getByText(configMapName, { exact: true });
  }

  async openAddDiskModal(source: 'blank' | 'ephemeral' = 'blank'): Promise<void> {
    await dismissConsoleObstructions(this.page);
    const menuOption = this.addDiskSourceMenuOption(source);
    await pollUntil(
      async () => {
        if (
          await this.addDiskModalHeading()
            .isVisible()
            .catch(() => false)
        ) {
          // Ephemeral path needs #disk-source-container — Blank modal is a false open.
          if (source === 'ephemeral') {
            const hasContainer = await this.page
              .getByRole('dialog')
              .filter({ has: this.addDiskModalHeading() })
              .locator('[data-test-id="disk-source-container"], #disk-source-container')
              .first()
              .isVisible()
              .catch(() => false);
            if (hasContainer) {
              return true;
            }
            await this.page.keyboard.press('Escape').catch(() => undefined);
          } else {
            return true;
          }
        }
        await this.robustClick(this.addDiskButton());
        if (
          !(await menuOption
            .first()
            .isVisible()
            .catch(() => false))
        ) {
          return false;
        }
        await this.robustClick(menuOption.first());
        return this.addDiskModalHeading()
          .isVisible()
          .catch(() => false);
      },
      {
        message: `Add disk ${source} source menu should open the modal`,
        timeout: TestTimeouts.LONG_OPERATION,
      },
    );
  }

  private async recoverInitialRunPanel(): Promise<boolean> {
    const path =
      (this.page.url().split('?')[0] ?? this.page.url()).split('#')[0] ?? this.page.url();
    const match = path.match(/(.*\/kubevirt\.io~v1~VirtualMachine\/[^/]+)(?:\/|$)/);
    if (!match?.[1]) {
      return false;
    }
    await this.page.goto(`${match[1]}/configuration/initial`, {
      waitUntil: 'domcontentloaded',
    });
    return this.initialRunPanel()
      .getByText('Cloud-init', { exact: true })
      .waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT })
      .then(() => true)
      .catch(() => false);
  }

  async openCloudInitModalFromInitialRun(): Promise<void> {
    await pollUntil(
      async () => {
        if (
          await this.cloudInitModal()
            .isVisible()
            .catch(() => false)
        ) {
          return true;
        }
        await dismissConsoleObstructions(this.page);
        // Recover from Configuration 404 / stale panel after failed Apply retries.
        if (
          (await this.page
            .getByText('404: Not Found')
            .isVisible()
            .catch(() => false)) ||
          !(await this.initialRunPanel()
            .isVisible()
            .catch(() => false)) ||
          !(await this.initialRunPanel()
            .getByText('Cloud-init', { exact: true })
            .isVisible()
            .catch(() => false))
        ) {
          // Recover panel, then continue polling so Edit can open the modal.
          await this.recoverInitialRunPanel();
          return false;
        }
        const edit = this.cloudInitEditOnInitialRun();
        if (!(await edit.isVisible().catch(() => false))) {
          return false;
        }
        await this.robustClick(edit);
        return this.cloudInitModal()
          .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE })
          .then(() => true)
          .catch(() => false);
      },
      {
        message: 'Cloud-init modal should open from Initial run Edit',
        timeout: TestTimeouts.LONG_OPERATION,
      },
    );
  }

  async openDisksTab(vmDetail: VmDetailPage): Promise<void> {
    await vmDetail.navigateToDisksTab();
    await this.addDiskButton().waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
  }

  async openEnvironmentTab(vmDetail: VmDetailPage): Promise<void> {
    await vmDetail.goToEnvironmentTab();
    await vmDetail.environmentSectionHeading().waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
  }

  async openMetadataTab(vmDetail: VmDetailPage): Promise<void> {
    await vmDetail.navigateToMetadataTab();
    await pollUntil(() => Promise.resolve(/\/configuration(s)?\/metadata/.test(this.page.url())), {
      message: 'VM metadata configuration URL should load',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
  }

  async openNodeSelectorModal(): Promise<void> {
    const panel = this.page.getByRole('tabpanel', { name: /^Scheduling$/i });
    await this.robustClick(
      panel.locator('[data-test-id="node-selector"]').getByRole('button').first(),
    );
    await this.page
      .getByRole('dialog')
      .filter({ hasText: /Node selector/i })
      .waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
  }

  async openSchedulingTab(vmDetail: VmDetailPage): Promise<void> {
    await vmDetail.navigateToSchedulingTab();
    await this.page
      .getByText('Scheduling and resource requirements')
      .first()
      .waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
  }

  async openScriptsTab(vmDetail: VmDetailPage): Promise<void> {
    await vmDetail.goToInitialRunTab();
    await vmDetail.initialRunCloudInitLabel().waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
  }

  async openSnapshotsTab(vmDetail: VmDetailPage): Promise<void> {
    await vmDetail.navigateToSnapshotsTab();
    await this.takeSnapshotButton().waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
  }

  async readCloudInitScriptEditorText(): Promise<string> {
    await this.cloudInitScriptEditorArea()
      .locator('.monaco-editor')
      .first()
      .waitFor({ state: 'visible', timeout: TestTimeouts.LONG_OPERATION });
    return this.page.evaluate(() => {
      const monaco = (
        window as { monaco?: { editor: { getModels: () => { getValue: () => string }[] } } }
      ).monaco;
      const models = monaco?.editor?.getModels?.() ?? [];
      for (const model of models) {
        const value = model.getValue();
        if (value.includes('cloud-config') || /^\s*user:/m.test(value)) {
          return value;
        }
      }
      return models.at(-1)?.getValue?.() ?? '';
    });
  }

  async removeEnvironmentConfigMapRow(
    configMapName: string,
    reopen?: () => Promise<void>,
  ): Promise<void> {
    const run = async (): Promise<void> => {
      const env = this.environmentEditorScope();
      await env.scrollIntoViewIfNeeded();
      const row = env.locator('.pairs-list__row').filter({ hasText: configMapName }).first();
      await row.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      await this.robustClick(
        row
          .locator('[data-test-id="pairs-list__delete-from-btn"]')
          .or(row.getByRole('button', { name: /^Delete$/i })),
      );
      await pollUntil(async () => (await row.count()) === 0, {
        message: `Environment row for ConfigMap ${configMapName} should be removed`,
        timeout: TestTimeouts.ELEMENT_WAIT,
      });
      const save = env.getByRole('button', { name: /^Save$/i }).first();
      await pollUntil(async () => await save.isEnabled(), {
        message: 'Environment Save should enable after removing a row',
        timeout: TestTimeouts.LONG_OPERATION,
      });
      await this.robustClick(save);
      await pollUntil(async () => !(await save.isEnabled()), {
        message: 'Environment changes should finish saving',
        timeout: TestTimeouts.ELEMENT_WAIT,
      });
    };

    try {
      await run();
    } catch (error) {
      if (!reopen) {
        throw error;
      }
      await this.page.reload({ waitUntil: 'domcontentloaded' });
      await reopen();
      await run();
    }
  }

  rootDiskRow(): Locator {
    return this.diskRow('rootdisk');
  }

  async saveCloudInitScriptInEditor(): Promise<void> {
    const save = this.cloudInitScriptEditorArea().getByRole('button', { name: /^Save$/i });
    await this.robustClick(save);
    const apply = this.cloudInitModal().getByRole('button', { name: /^Apply$/i });
    await pollUntil(async () => await apply.isEnabled(), {
      message: 'Cloud-init Apply should enable after script save',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
  }

  async saveNodeSelectorModal(): Promise<void> {
    const dialog = this.page.getByRole('dialog').filter({ hasText: /Node selector/i });
    await this.robustClick(dialog.getByRole('button', { name: /^Save$/i }));
    await dialog.waitFor({ state: 'hidden', timeout: TestTimeouts.LONG_OPERATION });
  }

  schedulingRequirementsHeading(): Locator {
    return this.page.getByText('Scheduling and resource requirements').first();
  }

  async selectCloudInitScriptView(): Promise<void> {
    const script = this.cloudInitConfigureViaScriptRadio();
    await this.robustClick(script);
    await pollUntil(
      async () => {
        if (await script.isChecked().catch(() => false)) {
          return true;
        }
        await script.click({ force: true }).catch(() => undefined);
        return script.isChecked().catch(() => false);
      },
      {
        message: 'Cloud-init Script radio should be selected',
        timeout: TestTimeouts.ELEMENT_WAIT,
      },
    );
    await this.cloudInitScriptEditorArea()
      .or(this.cloudInitModal().locator('.monaco-editor'))
      .first()
      .waitFor({
        state: 'visible',
        timeout: TestTimeouts.LONG_OPERATION,
      });
  }

  async setCloudInitScriptEditorText(yaml: string): Promise<void> {
    await this.cloudInitScriptEditorArea()
      .locator('.monaco-editor')
      .first()
      .waitFor({ state: 'visible', timeout: TestTimeouts.LONG_OPERATION });
    await this.page.evaluate((content) => {
      const monaco = (
        window as {
          monaco?: {
            editor: {
              getModels: () => { getValue: () => string; setValue: (v: string) => void }[];
            };
          };
        }
      ).monaco;
      const models = monaco?.editor?.getModels?.() ?? [];
      const model = models.find((m) => m.getValue().includes('userData')) ?? models.at(-1);
      model?.setValue(content);
    }, yaml);
  }

  takeSnapshotButton(): Locator {
    return this.page.getByRole('button', { name: /^Take snapshot$/i });
  }

  async updateCloudInitUser(username: string): Promise<void> {
    const conflict = () =>
      this.cloudInitModal().getByText(/object has been modified|please apply your changes/i);
    const applyBtn = () =>
      this.cloudInitModal()
        .getByTestId('save-button')
        .or(this.cloudInitModal().getByRole('button', { name: /^Apply$/i }))
        .first();

    const fillAndApply = async (): Promise<boolean> => {
      if (
        !(await this.cloudInitModal()
          .isVisible()
          .catch(() => false))
      ) {
        return false;
      }
      const formView = this.cloudInitConfigureViaFormRadio();
      if (await formView.isVisible().catch(() => false)) {
        await formView.click({ force: true }).catch(() => undefined);
      }
      const userInput = this.cloudInitModal().locator('#cloudinit-user');
      if (!(await userInput.isVisible().catch(() => false))) {
        return false;
      }
      await userInput.fill(username);
      await userInput.blur().catch(() => undefined);
      const btn = applyBtn();
      if (!(await btn.isVisible().catch(() => false))) {
        return false;
      }
      if (!(await btn.isEnabled().catch(() => false))) {
        return false;
      }
      await btn
        .click({ force: true, timeout: TestTimeouts.UI_ACTION_COMPLETE })
        .catch(() => undefined);

      // Wait for close or conflict — keep this short so outer poll can reopen/retry.
      const settled = await pollUntil(
        async () => {
          if (
            await conflict()
              .isVisible()
              .catch(() => false)
          ) {
            return true;
          }
          return !(await this.cloudInitModal()
            .isVisible()
            .catch(() => false));
        },
        {
          intervalMs: 250,
          message: 'Cloud-init modal should close or show conflict after Apply',
          timeout: TestTimeouts.UI_DELAY_LONG,
        },
      )
        .then(() => true)
        .catch(() => false);

      if (!settled) {
        return false;
      }

      // Conflict keeps the modal open with an alert — cancel and retry with a fresh open.
      if (
        await conflict()
          .isVisible()
          .catch(() => false)
      ) {
        await this.cloudInitModal()
          .getByTestId('cancel-button')
          .or(this.cloudInitModal().getByRole('button', { name: /^Cancel$/i }))
          .first()
          .click()
          .catch(() => undefined);
        await this.cloudInitModal()
          .waitFor({ state: 'hidden', timeout: TestTimeouts.ELEMENT_WAIT })
          .catch(() => undefined);
        return false;
      }
      return !(await this.cloudInitModal()
        .isVisible()
        .catch(() => false));
    };

    await this.openCloudInitModalFromInitialRun();
    await pollUntil(
      async () => {
        if (
          !(await this.cloudInitModal()
            .isVisible()
            .catch(() => false))
        ) {
          await this.openCloudInitModalFromInitialRun();
        }
        return fillAndApply();
      },
      {
        message: 'Cloud-init Apply should submit and close the modal',
        timeout: TestTimeouts.LONG_OPERATION,
      },
    );
  }
}
