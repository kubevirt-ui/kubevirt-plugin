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
    // Never press Escape here — on PF6 it dismisses the entire Add volume dialog, not just the menu.
    // Collapse by clicking expanded MenuToggle(s) inside the dialog (and re-query while open).
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const expanded = modal.locator('button[aria-expanded="true"]').first();
      if (!(await expanded.isVisible().catch(() => false))) {
        break;
      }
      await expanded.click({ timeout: TestTimeouts.UI_ACTION_COMPLETE }).catch(() => undefined);
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MICRO);
    }
    const openMenu = this.page
      .locator('[role="listbox"], [role="menu"].pf-v6-c-menu, .pf-v6-c-menu.pf-m-scrollable')
      .filter({ visible: true })
      .first();
    if (await openMenu.isVisible().catch(() => false)) {
      const pageExpanded = this.page
        .locator(
          '#tab-modal button[aria-expanded="true"], [role="dialog"] button[aria-expanded="true"]',
        )
        .first();
      if (await pageExpanded.isVisible().catch(() => false)) {
        await pageExpanded
          .click({ timeout: TestTimeouts.UI_ACTION_COMPLETE })
          .catch(() => undefined);
      }
      await openMenu
        .waitFor({ state: 'hidden', timeout: TestTimeouts.UI_ACTION_COMPLETE })
        .catch(() => undefined);
    }
  }

  private preferenceSelectToggle(modal: Locator): Locator {
    return modal
      .getByRole('button', { name: /^Select preference$/i })
      .or(modal.locator('button.pf-v6-c-menu-toggle', { hasText: /^Select preference$/i }))
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

  private preferenceFilterInput(): Locator {
    // PF5/6 typeahead: placeholder or listbox filter input (portaled outside the dialog).
    return this.page
      .getByPlaceholder(/Select preference/i)
      .or(
        this.page.locator(
          '#select-inline-filter-listbox input, [role="listbox"] input[type="text"]',
        ),
      )
      .last();
  }

  private async selectPreferenceWithKeyboard(preferenceName: string): Promise<boolean> {
    const filterInput = this.preferenceFilterInput();
    if (!(await filterInput.isVisible().catch(() => false))) {
      return false;
    }
    await filterInput.fill('');
    await filterInput.fill(preferenceName);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    // Prefer clicking a filtered option when the typeahead narrows the list.
    if (await this.clickPreferenceOption(preferenceName)) {
      return true;
    }

    const namePattern = new RegExp(preferenceName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    for (let step = 0; step < 50; step += 1) {
      if (!(await filterInput.isVisible().catch(() => false))) {
        return false;
      }
      try {
        await filterInput.press('ArrowDown', { timeout: TestTimeouts.UI_ACTION_COMPLETE });
      } catch {
        return false;
      }
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
          await filterInput
            .press('Enter', { timeout: TestTimeouts.UI_ACTION_COMPLETE })
            .catch(() => undefined);
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
    await pollUntil(
      async () => {
        if (
          !(await this.addVolumeModalHeading()
            .isVisible()
            .catch(() => false))
        ) {
          return false;
        }
        const modal = this.addVolumeModal();
        await this.closeOpenSelectMenus(modal);
        const toggle = this.preferenceSelectToggle(modal);
        if (!(await toggle.isVisible().catch(() => false))) {
          await toggle.scrollIntoViewIfNeeded().catch(() => undefined);
        }
        if (!(await toggle.isVisible().catch(() => false))) {
          return false;
        }
        await this.robustClick(toggle);
        if ((await this.visiblePreferenceListbox()) === null) {
          return false;
        }
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
        // Selection missed — collapse without Escape and retry.
        await this.closeOpenSelectMenus(this.addVolumeModal());
        return false;
      },
      {
        message: `Preference option ${preferenceName} should be selected in Add volume form`,
        timeout: TestTimeouts.LONG_OPERATION,
      },
    );
    await this.closeOpenSelectMenus(this.addVolumeModal());
  }

  /** PF Select menu is portaled outside the Add volume dialog. */
  private registrySourceOption(): Locator {
    // 4.22 option accessible name is "RegistryContent from container registry" (no $).
    return this.page
      .locator('[data-test-id="use-registry"]')
      .or(this.page.getByRole('option', { name: /^Registry\b/i }))
      .or(this.page.getByRole('menuitem', { name: /^Registry\b/i }))
      .first();
  }

  private registryUrlInput(modal: Locator): Locator {
    // Strict: only the Registry ContainerSource input (avoid false matches on Volume upload).
    return modal.locator('[data-test-id="volume-registry-container-source-input"]');
  }

  private async selectSourceTypeDownloadFromRegistry(): Promise<void> {
    await pollUntil(
      async () => {
        if (
          !(await this.addVolumeModalHeading()
            .isVisible()
            .catch(() => false))
        ) {
          await this.openCreateWithForm().catch(() => undefined);
        }
        if (
          !(await this.addVolumeModalHeading()
            .isVisible()
            .catch(() => false))
        ) {
          return false;
        }
        const modal = this.addVolumeModal();
        const registryUrl = this.registryUrlInput(modal);
        // Registry URL field is the durable success signal (toggle remounts after source switch).
        if (await registryUrl.isVisible().catch(() => false)) {
          return true;
        }
        const sourceToggle = this.sourceTypeSelectToggle(modal);
        if (!(await sourceToggle.isVisible().catch(() => false))) {
          return false;
        }
        const sourceLabel = (
          (await sourceToggle
            .textContent({ timeout: TestTimeouts.UI_ACTION_COMPLETE })
            .catch(() => '')) ?? ''
        ).replace(/\s+/g, ' ');
        // Always force Registry via data-test-id — toggle label "Volume" is shared by upload + PVC.
        if (!/Registry/i.test(sourceLabel)) {
          await this.closeOpenSelectMenus(modal);
          if (
            !(await this.addVolumeModalHeading()
              .isVisible()
              .catch(() => false))
          ) {
            return false;
          }
          await sourceToggle.click({ timeout: TestTimeouts.ELEMENT_WAIT }).catch(() => undefined);
          const registryOption = this.registrySourceOption();
          await registryOption
            .waitFor({
              state: 'visible',
              timeout: TestTimeouts.UI_ACTION_COMPLETE,
            })
            .catch(() => undefined);
          if (!(await registryOption.isVisible().catch(() => false))) {
            await this.closeOpenSelectMenus(modal);
            return false;
          }
          // Option may be disabled without DS create permission — still try; fail poll if no input.
          await registryOption
            .click({ force: true, timeout: TestTimeouts.ELEMENT_WAIT })
            .catch(() => undefined);
          await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
        }
        const fresh = this.addVolumeModal();
        if (
          !(await this.addVolumeModalHeading()
            .isVisible()
            .catch(() => false))
        ) {
          return false;
        }
        return this.registryUrlInput(fresh)
          .isVisible()
          .catch(() => false);
      },
      {
        message: 'Registry source fields should be visible in Add volume form',
        timeout: TestTimeouts.LONG_OPERATION,
      },
    );
    // Collapse only the source-type toggle if it stayed expanded — do not Escape (closes dialog).
    const sourceToggle = this.sourceTypeSelectToggle(this.addVolumeModal());
    if ((await sourceToggle.getAttribute('aria-expanded').catch(() => 'false')) === 'true') {
      await sourceToggle.click({ timeout: TestTimeouts.UI_ACTION_COMPLETE }).catch(() => undefined);
    }
  }

  private sourceTypeSelectToggle(modal: Locator): Locator {
    // Attribute is data-test-id (not data-testid); PF6 MenuToggle label is Volume/Registry/URL.
    return modal
      .locator('[data-test-id="source-type-select"]')
      .or(modal.getByRole('button', { name: /^(Volume|Registry|URL|HTTP)\b/i }))
      .first();
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
      (await this.sourceTypeSelectToggle(modal)
        .isVisible()
        .catch(() => false)) ||
      (await modal
        .getByRole('textbox', { name: /^Volume name$/i })
        .isVisible()
        .catch(() => false)) ||
      (await modal
        .locator('#name')
        .isVisible()
        .catch(() => false)) ||
      (await this.registryUrlInput(modal)
        .isVisible()
        .catch(() => false)) ||
      (await modal
        .getByRole('textbox', { name: /Drag and drop an image/i })
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
    // Prefer the headed dialog — `#tab-modal` alone can match a stale shell during remounts.
    return this.page
      .getByRole('dialog')
      .filter({ has: this.page.getByRole('heading', { name: /^Add volume$/i }) })
      .or(this.page.locator('#tab-modal').filter({ visible: true }))
      .first();
  }

  addVolumeModalHeading(): Locator {
    return this.page.getByRole('heading', { name: /^Add volume$/i }).first();
  }

  private volumeNameInput(modal: Locator): Locator {
    // 4.22 uses #volume-name; older builds used #name.
    return modal
      .locator('#volume-name, #name')
      .or(modal.getByRole('textbox', { name: /^Volume name$/i }))
      .first();
  }

  private cronExpressionInput(modal: Locator): Locator {
    return modal
      .locator('[data-test-id="volume-registry-retain-cron-expression"]')
      .or(modal.getByRole('textbox', { name: /^Cron expression$/i }))
      .first();
  }

  /** Registry import flow in Add volume modal (creates a DataSource + DataImportCron). */
  async createFromRegistryForm(options: {
    cronExpression: string;
    preferenceName: string;
    registryUrl: string;
    volumeName: string;
  }): Promise<void> {
    await this.openCreateWithForm();
    await this.selectSourceTypeDownloadFromRegistry();

    // Re-resolve fields after every remount — Registry switch rebuilds the dialog body.
    await pollUntil(
      async () => {
        if (
          !(await this.addVolumeModalHeading()
            .isVisible()
            .catch(() => false))
        ) {
          await this.openCreateWithForm().catch(() => undefined);
          await this.selectSourceTypeDownloadFromRegistry().catch(() => undefined);
        }
        const modal = this.addVolumeModal();
        const registryUrl = this.registryUrlInput(modal);
        if (!(await registryUrl.isVisible().catch(() => false))) {
          return false;
        }
        await registryUrl.fill(options.registryUrl);
        const cron = this.cronExpressionInput(modal);
        await cron
          .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE })
          .catch(() => undefined);
        if (!(await cron.isVisible().catch(() => false))) {
          return false;
        }
        await cron.fill(options.cronExpression);
        const nameInput = this.volumeNameInput(this.addVolumeModal());
        await nameInput
          .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE })
          .catch(() => undefined);
        if (!(await nameInput.isVisible().catch(() => false))) {
          return false;
        }
        await nameInput.fill(options.volumeName);
        return (await nameInput.inputValue().catch(() => '')) === options.volumeName;
      },
      {
        message: 'Add volume registry form fields should accept values',
        timeout: TestTimeouts.LONG_OPERATION,
      },
    );

    await this.selectPreferenceInModal(options.preferenceName);
    const saveBtn = this.addVolumeModal().getByRole('button', { name: /^Save$/i });
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
    return this.page
      .getByRole('heading', { name: /Create bootable volume|Create DataVolume/i })
      .first();
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
        if (await this.isAddVolumeModalReady()) {
          return true;
        }
        // Do not Escape — it closes an in-flight Add volume dialog on PF6. Dismiss menus via toggle.
        if (
          await this.addVolumeModalHeading()
            .isVisible()
            .catch(() => false)
        ) {
          await this.closeOpenSelectMenus(this.addVolumeModal());
          return this.isAddVolumeModalReady();
        }
        const openMenu = this.page
          .getByRole('menuitem', { name: /With form/i })
          .or(this.page.locator('[role="menu"], .pf-v6-c-menu').filter({ visible: true }))
          .first();
        if (await openMenu.isVisible().catch(() => false)) {
          const withForm = this.page.getByRole('menuitem', { name: /With form/i });
          if (await withForm.isVisible().catch(() => false)) {
            await withForm.click();
            return this.isAddVolumeModalReady();
          }
        }
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
    const yamlUrl = `${ConsoleRoutes.bootableVolumesInNamespace(namespace)}/~new/yaml`;
    const add = this.addVolumeButton();
    if (await add.isVisible().catch(() => false)) {
      await this.robustClick(add);
      const withYaml = this.page
        .getByRole('menuitem', { name: /With YAML/i })
        .or(this.page.locator('.pf-v6-c-menu__item', { hasText: /With YAML/i }))
        .first();
      try {
        await withYaml.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
        await this.robustClick(withYaml);
      } catch {
        // Empty-state Add volume menu can detach under load — go straight to YAML create.
        await this.page.goto(yamlUrl, { waitUntil: 'domcontentloaded' });
      }
    } else {
      await this.page.goto(yamlUrl, { waitUntil: 'domcontentloaded' });
    }
    await pollUntil(
      async () => {
        if (
          /DataVolume.*~new|bootablevolumes.*~new|cdi\.kubevirt\.io.*~new/i.test(this.page.url())
        ) {
          return true;
        }
        return this.page
          .locator('.monaco-editor')
          .first()
          .isVisible()
          .catch(() => false);
      },
      {
        message: 'DataVolume YAML create URL or editor should load',
        timeout: TestTimeouts.LONG_OPERATION,
      },
    );
  }

  async openNamespaceListReady(nav: NavigationPage, namespace: string): Promise<void> {
    await nav.goToBootableVolumes(namespace);
    await this.goToNamespaceList(namespace);
  }
}
