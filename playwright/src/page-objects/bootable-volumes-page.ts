import type { NavigationPage } from '@/page-objects/navigation-page';
import { dismissConsoleObstructions } from '@/utils/console-modals';
import { ConsoleRoutes } from '@/utils/console-routes';
import { DATASOURCE_FORM } from '@/utils/constants';
import { pollUntil } from '@/utils/poll-until';
import { MINUTE, TestTimeouts } from '@/utils/test-config';
import { expect, type Locator } from '@playwright/test';

import { ResourceListPage } from './resource-list-page';

export class BootableVolumesPage extends ResourceListPage {
  private async closeOpenSelectMenus(modal: Locator): Promise<void> {
    if (
      await modal
        .locator('button[aria-expanded="true"]')
        .isVisible()
        .catch(() => false)
    ) {
      await this.page.keyboard.press('Escape');
    }
  }

  private preferenceSelectToggle(modal: Locator): Locator {
    return modal
      .getByRole('button', { name: /^Select preference$/i })
      .or(
        modal
          .getByRole('button', { name: 'Options menu' })
          .filter({ hasText: /Select preference/i }),
      )
      .first();
  }

  private async visiblePreferenceListbox(): Promise<Locator | null> {
    for (const root of this.listSearchRoots()) {
      const listbox = root
        .locator('#select-inline-filter-listbox')
        .or(root.getByRole('listbox'))
        .last();
      if (await listbox.isVisible().catch(() => false)) {
        return listbox;
      }
    }
    return null;
  }

  private clusterPreferenceOptionValue(preferenceName: string): string {
    return `VirtualMachineClusterPreference-${preferenceName}`;
  }

  private async selectPreferenceWithKeyboard(preferenceName: string): Promise<boolean> {
    const filterInput = this.page.getByPlaceholder('Select preference').last();
    if (!(await filterInput.isVisible().catch(() => false))) {
      return false;
    }
    await filterInput.fill('');
    await filterInput.fill(preferenceName);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    const namePattern = new RegExp(preferenceName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    for (let step = 0; step < 50; step += 1) {
      await filterInput.press('ArrowDown');
      await this.page.waitForTimeout(50);
      for (const root of this.listSearchRoots()) {
        const focused = root
          .locator('[role="option"].pf-m-focus, [role="option"][data-focus="true"]')
          .first();
        if (!(await focused.isVisible().catch(() => false))) {
          continue;
        }
        const label = ((await focused.textContent()) ?? '').replace(/\s+/g, ' ').trim();
        if (namePattern.test(label)) {
          await filterInput.press('Enter');
          return true;
        }
      }
    }
    return false;
  }

  private async clickPreferenceOption(preferenceName: string): Promise<boolean> {
    const optionValue = this.clusterPreferenceOptionValue(preferenceName);
    const optionDomId = `select-inline-filter-${optionValue.replace(/ /g, '-')}`;
    const namePattern = new RegExp(preferenceName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    for (const root of this.listSearchRoots()) {
      const targets = [
        root.locator(`#${optionDomId}`),
        root.locator(`[data-test-id="select-option-${optionValue}"]`),
        root.getByRole('option', { name: namePattern }),
      ];
      for (const target of targets) {
        const option = target.first();
        if (!(await option.count())) {
          continue;
        }
        await option.scrollIntoViewIfNeeded().catch(() => undefined);
        try {
          await option.click({ force: true, timeout: TestTimeouts.UI_ACTION_COMPLETE });
          return true;
        } catch {
          // try next locator strategy / frame
        }
      }
    }
    return false;
  }

  private async selectPreferenceInModal(preferenceName: string): Promise<void> {
    const modal = this.addVolumeModal();

    await this.closeOpenSelectMenus(modal);
    await this.robustClick(this.preferenceSelectToggle(modal));

    await pollUntil(async () => (await this.visiblePreferenceListbox()) !== null, {
      message: 'Select preference listbox should open',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });

    await pollUntil(
      async () => {
        if (
          (await this.selectPreferenceWithKeyboard(preferenceName)) ||
          (await this.clickPreferenceOption(preferenceName))
        ) {
          await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
          const saveBtn = this.addVolumeModal()
            .getByRole('button', { name: /^Save$/i })
            .first();
          return await saveBtn.isEnabled().catch(() => false);
        }
        return false;
      },
      {
        message: `Preference option ${preferenceName} should be visible in Select preference menu`,
        timeout: TestTimeouts.LONG_OPERATION,
      },
    );
    await this.closeOpenSelectMenus(modal);
  }

  /** PF Select menu is portaled outside the Add volume dialog. */
  private registrySourceOption(): Locator {
    return this.page
      .locator('[data-test-id="use-registry"]')
      .or(this.page.getByRole('option', { name: /^Registry$/i }))
      .or(this.page.getByRole('menuitem', { name: /^Registry$/i }))
      .first();
  }

  private registryUrlInput(modal: Locator): Locator {
    return modal
      .locator('[data-test-id="volume-registry-container-source-input"]')
      .or(modal.locator('[data-test-id="volume-registry-url"]'));
  }

  private async selectSourceTypeDownloadFromRegistry(): Promise<void> {
    await pollUntil(
      async () => {
        const modal = this.addVolumeModal();
        const registryUrl = this.registryUrlInput(modal);
        if (await registryUrl.isVisible().catch(() => false)) {
          return true;
        }
        const sourceToggle = this.sourceTypeSelectToggle(modal);
        if (!(await sourceToggle.isVisible().catch(() => false))) {
          return false;
        }
        const sourceLabel = (await sourceToggle.textContent()) ?? '';
        if (/Registry|Download from registry/i.test(sourceLabel)) {
          return registryUrl.isVisible().catch(() => false);
        }
        await this.robustClick(sourceToggle);
        const registryOption = this.registrySourceOption();
        if (!(await registryOption.isVisible().catch(() => false))) {
          return false;
        }
        await this.robustClick(registryOption);
        return registryUrl.isVisible().catch(() => false);
      },
      {
        message: 'Registry source fields should be visible in Add volume form',
        timeout: TestTimeouts.LONG_OPERATION,
      },
    );
    await this.closeOpenSelectMenus(this.addVolumeModal());
  }

  private sourceTypeSelectToggle(modal: Locator): Locator {
    return modal
      .getByTestId('source-type-select')
      .or(modal.locator('[data-test-id="source-type-select"]'))
      .or(modal.getByRole('button', { name: /^Volume$|^Registry$|^HTTP$/i }).first());
  }

  private async isAddVolumeModalReady(): Promise<boolean> {
    if (
      !(await this.addVolumeModalHeading()
        .isVisible()
        .catch(() => false))
    ) {
      return false;
    }
    const modal = this.addVolumeModal();
    return (
      (await modal
        .getByTestId('source-type-select')
        .isVisible()
        .catch(() => false)) ||
      (await this.registryUrlInput(modal)
        .isVisible()
        .catch(() => false)) ||
      (await modal
        .locator('#name')
        .isVisible()
        .catch(() => false))
    );
  }

  addVolumeButton(): Locator {
    return this.page
      .getByTestId('item-create')
      .getByRole('button', { name: /Add (bootable )?volume/i })
      .or(this.page.getByRole('button', { name: /Add (bootable )?volume/i }))
      .first();
  }

  addVolumeModal(): Locator {
    return this.page
      .locator('#tab-modal')
      .filter({ visible: true })
      .or(
        this.page.getByRole('dialog').filter({
          has: this.page.getByRole('heading', { name: /^Add volume$/i }),
        }),
      )
      .first();
  }

  addVolumeModalHeading(): Locator {
    return this.addVolumeModal().getByRole('heading', { name: /^Add volume$/i });
  }

  /** Registry import flow in Add volume modal (creates a DataSource + DataImportCron). */
  async createFromRegistryForm(options: {
    cronExpression: string;
    preferenceName: string;
    registryUrl: string;
    volumeName: string;
  }): Promise<void> {
    await this.openCreateWithForm();
    const modal = this.addVolumeModal();
    await this.selectSourceTypeDownloadFromRegistry();
    await this.registryUrlInput(modal).fill(options.registryUrl);
    await modal
      .locator('[data-test-id="volume-registry-retain-cron-expression"]')
      .fill(options.cronExpression);
    await modal.locator('#name').fill(options.volumeName);
    await this.selectPreferenceInModal(options.preferenceName);
    const saveBtn = modal.getByRole('button', { name: /^Save$/i });
    await expect(saveBtn).toBeEnabled({ timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(saveBtn);
    await this.addVolumeModal().waitFor({ state: 'hidden', timeout: 2 * MINUTE });
    await this.waitForLoadingComplete(TestTimeouts.ELEMENT_WAIT);
  }

  async createRegistryBootVolumeFromForm(
    nav: NavigationPage,
    namespace: string,
    volumeName: string,
  ): Promise<void> {
    await this.openNamespaceListReady(nav, namespace);
    await this.createFromRegistryForm({
      cronExpression: DATASOURCE_FORM.cron,
      preferenceName: 'fedora',
      registryUrl: DATASOURCE_FORM.imageUrl,
      volumeName,
    });
  }

  dataVolumeYamlCreateHeading(): Locator {
    return this.page.getByRole('heading', { name: /Create DataVolume/i });
  }

  async goToNamespaceList(namespace: string): Promise<void> {
    await this.gotoList(ConsoleRoutes.bootableVolumesInNamespace(namespace));
    await this.listTitle().waitFor({ timeout: TestTimeouts.LONG_OPERATION });
  }

  listTitle(): Locator {
    return this.listPageHeading(/Bootable volumes/i);
  }

  async openCreateWithForm(): Promise<void> {
    await dismissConsoleObstructions(this.page);
    await pollUntil(
      async () => {
        await this.page.keyboard.press('Escape').catch(() => undefined);
        await this.robustClick(this.addVolumeButton());
        const withForm = this.page.getByRole('menuitem', { name: /With form/i });
        if (!(await withForm.isVisible().catch(() => false))) {
          return false;
        }
        await withForm.click();
        return this.isAddVolumeModalReady();
      },
      {
        intervalMs: 1500,
        message: 'Add volume With form modal should finish loading',
        timeout: TestTimeouts.LONG_OPERATION,
      },
    );
  }

  async openCreateWithYaml(namespace: string): Promise<void> {
    await dismissConsoleObstructions(this.page);
    const add = this.addVolumeButton();
    if (await add.isVisible().catch(() => false)) {
      await this.robustClick(add);
      await this.page.getByRole('menuitem', { name: /With YAML/i }).click();
    } else {
      await this.page.goto(`/k8s/ns/${namespace}/cdi.kubevirt.io~v1beta1~DataVolume/~new`, {
        waitUntil: 'domcontentloaded',
      });
    }
    await this.page.waitForURL(new RegExp(`/ns/${namespace}/.*DataVolume.*~new`), {
      timeout: TestTimeouts.LONG_OPERATION,
    });
  }

  async openNamespaceListReady(nav: NavigationPage, namespace: string): Promise<void> {
    await nav.goToBootableVolumes(namespace);
    await this.goToNamespaceList(namespace);
  }
}
