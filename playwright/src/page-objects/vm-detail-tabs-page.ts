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
    return this.cloudInitModal().locator('.yaml-container:has(.cloud-init-editor)');
  }

  private environmentEditorScope(): Locator {
    return this.page
      .getByRole('tabpanel', { name: /^Environment$/i })
      .or(
        this.page.locator(
          '.VirtualMachineConfigurationTab--body, .VirtualMachineConfigurationTab__body',
        ),
      )
      .filter({ has: this.page.getByText(/Include all values|Environment variables/i) })
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
      async () => {
        const toggle = row.getByRole('button', { name: /Select a resource|Options menu/i });
        await this.robustClick(toggle);
        const search = row.getByRole('searchbox');
        if (await search.isVisible().catch(() => false)) {
          await search.fill(resourceName);
        }
        const option = this.environmentResourceOption(row, resourceName).first();
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
        timeout: TestTimeouts.LONG_OPERATION,
      },
    );
  }

  async addContainerEphemeralDisk(diskName: string, image: string): Promise<void> {
    await this.openAddDiskModal('ephemeral');
    const dialog = this.page.getByRole('dialog').filter({
      has: this.addDiskModalHeading(),
    });
    await dialog.locator('[data-test-id="disk-source-container"]').fill(image);
    const nameInput = dialog.locator('#name');
    await nameInput.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await nameInput.fill(diskName);
    const save = dialog.getByRole('button', { name: /^Save$/i });
    await pollUntil(async () => await save.isEnabled(), {
      message: 'Add disk Save should be enabled',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await this.robustClick(save);
    await dialog.waitFor({ state: 'hidden', timeout: TestTimeouts.LONG_OPERATION });
    await pollUntil(
      async () =>
        await this.diskRow(diskName)
          .first()
          .isVisible()
          .catch(() => false),
      {
        message: `Disk row ${diskName} should appear after save`,
        timeout: TestTimeouts.LONG_OPERATION,
      },
    );
  }

  addDiskButton(): Locator {
    return this.page
      .getByRole('button', { name: /Add disk/i })
      .or(this.page.locator('.disk-list-page__list-page-create-button'));
  }

  private addDiskSourceMenuOption(source: 'blank' | 'ephemeral'): Locator {
    if (source === 'ephemeral') {
      return this.page.getByRole('option', {
        name: /Ephemeral disk \(Container image\)/i,
      });
    }
    return this.page.getByRole('option', { name: /Empty disk \(blank\)/i });
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
      await env
        .getByRole('button', { name: /Add Config Map, Secret or Service Account/i })
        .waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      await this.robustClick(
        env.getByRole('button', { name: /Add Config Map, Secret or Service Account/i }),
      );
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
          timeout: TestTimeouts.LONG_OPERATION,
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
    await this.robustClick(row.locator('.dropdown-kebab-pf button, button').last());
    const deleteItem = this.page
      .getByRole('menuitem', { name: /^Delete snapshot$/i })
      .or(this.page.getByRole('menuitem', { name: /^Delete$/i }));
    await this.robustClick(deleteItem.first());
    const dialog = this.page
      .getByRole('dialog')
      .filter({ hasText: /Delete VirtualMachineSnapshot/i });
    await this.robustClick(
      dialog.getByRole('button', { name: /^Delete snapshot$|^Delete$/i }).first(),
    );
    await dialog.waitFor({ state: 'hidden', timeout: TestTimeouts.LONG_OPERATION });
  }

  async detachDisk(diskName: string): Promise<void> {
    const row = this.diskRow(diskName).first();
    await row.waitFor({ state: 'visible', timeout: TestTimeouts.LONG_OPERATION });
    const kebab = row
      .locator(
        'td.pf-v6-c-table__action button, td.pf-c-table__action button, .dropdown-kebab-pf button',
      )
      .last();
    const detachMenuItem = (): Locator =>
      this.page
        .getByRole('menuitem', { name: /^Detach$/i })
        .or(this.page.getByRole('button', { name: /^Detach$/i }))
        .or(
          this.page
            .locator(
              '.pf-v6-c-menu__content, .pf-c-dropdown__menu, .pf-v6-c-menu, .pf-c-dropdown__menu',
            )
            .getByText(/^Detach$/i, { exact: true }),
        );

    await pollUntil(
      async () => {
        if (
          await detachMenuItem()
            .first()
            .isVisible()
            .catch(() => false)
        ) {
          await this.robustClick(detachMenuItem().first());
          return true;
        }
        await dismissConsoleObstructions(this.page);
        await this.robustClick(kebab);
        return false;
      },
      {
        intervalMs: 750,
        message: `Detach action for disk ${diskName} should be available`,
        timeout: TestTimeouts.LONG_OPERATION,
      },
    );

    const dialog = this.page.getByRole('dialog').filter({ hasText: /Detach disk/i });
    await dialog.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(dialog.getByRole('button', { name: /^Detach$/i }).first());
    await dialog.waitFor({ state: 'hidden', timeout: TestTimeouts.LONG_OPERATION });
  }

  diskRow(diskName: string): Locator {
    const storageScope = this.page
      .locator('.VirtualMachineConfigurationTab--body, .VirtualMachineConfigurationTab__body')
      .or(this.page.getByRole('tabpanel').filter({ has: this.addDiskButton() }))
      .first();
    return storageScope.locator('[role="row"]').filter({
      has: this.page.getByText(diskName, { exact: true }),
    });
  }

  environmentConfigMapReference(configMapName: string): Locator {
    return this.environmentEditorScope().getByText(configMapName, { exact: true });
  }

  async openAddDiskModal(source: 'blank' | 'ephemeral' = 'blank'): Promise<void> {
    await dismissConsoleObstructions(this.page);
    await this.robustClick(this.addDiskButton());
    const menuOption = this.addDiskSourceMenuOption(source);
    await menuOption.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(menuOption);
    await this.addDiskModalHeading().waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
  }

  async openCloudInitModalFromInitialRun(): Promise<void> {
    await dismissConsoleObstructions(this.page);
    const panel = this.initialRunPanel();
    await panel.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await panel.getByText('Cloud-init', { exact: true }).waitFor({
      state: 'visible',
      timeout: TestTimeouts.LONG_OPERATION,
    });
    const edit = this.cloudInitEditOnInitialRun();
    await edit.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(edit);
    await this.cloudInitModal().waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
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
        timeout: TestTimeouts.LONG_OPERATION,
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
    await this.robustClick(this.cloudInitConfigureViaScriptRadio());
    await this.cloudInitScriptEditorArea().waitFor({
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
    await this.openCloudInitModalFromInitialRun();
    const dialog = this.cloudInitModal();
    await dialog.locator('#cloudinit-user').fill(username);
    await this.robustClick(dialog.getByRole('button', { name: /^Apply$/i }));
    await dialog.waitFor({ state: 'hidden', timeout: TestTimeouts.LONG_OPERATION });
  }
}
