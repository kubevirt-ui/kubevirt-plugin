import type { NavigationPage } from '@/page-objects/navigation-page';
import { dismissConsoleObstructions } from '@/utils/console-modals';
import { ConsoleRoutes } from '@/utils/console-routes';
import { DATASOURCE_FORM } from '@/utils/constants';
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
      .getByRole('button', { name: 'Options menu' })
      .filter({ hasText: /Select preference/i });
  }

  private async selectPreferenceInModal(preferenceName: string): Promise<void> {
    const modal = this.addVolumeModal();
    const option = modal
      .getByTestId(`preference-select-option-${preferenceName}`)
      .or(modal.getByRole('option', { name: new RegExp(preferenceName, 'i') }));

    if (!(await option.isVisible().catch(() => false))) {
      await this.closeOpenSelectMenus(modal);
      await this.robustClick(this.preferenceSelectToggle(modal));
      const filterInput = modal.locator('input[aria-label*="Filter" i]').last();
      if (await filterInput.isVisible().catch(() => false)) {
        await filterInput.fill(preferenceName);
      }
    }
    await option.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(option);
  }

  private async selectSourceTypeDownloadFromRegistry(): Promise<void> {
    const modal = this.addVolumeModal();
    const registryUrl = modal.locator('[data-test-id="volume-registry-url"]');
    const sourceToggle = this.sourceTypeSelectToggle(modal);

    await modal.getByText(/^Source type$/i).waitFor({
      state: 'visible',
      timeout: TestTimeouts.LONG_OPERATION,
    });

    if (await registryUrl.isVisible().catch(() => false)) {
      return;
    }

    const sourceLabel = (await sourceToggle.textContent()) ?? '';
    if (!/Download from registry/i.test(sourceLabel)) {
      await this.robustClick(sourceToggle);
      await this.robustClick(modal.getByRole('option', { name: /Download from registry/i }));
    }
    await registryUrl.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.closeOpenSelectMenus(modal);
  }

  private sourceTypeSelectToggle(modal: Locator): Locator {
    return modal.getByRole('button', { name: 'Options menu' }).first();
  }

  addVolumeButton(): Locator {
    return this.page.getByRole('button', { name: /^Add volume$/i });
  }

  addVolumeModal(): Locator {
    return this.page
      .getByRole('dialog')
      .filter({ has: this.page.getByRole('heading', { name: /^Add volume$/i }) })
      .last();
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
    await modal.locator('[data-test-id="volume-registry-url"]').fill(options.registryUrl);
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
    return this.page
      .locator('[data-test-id="resource-title"]')
      .filter({ hasText: /Bootable volumes/i });
  }

  async openCreateWithForm(): Promise<void> {
    await dismissConsoleObstructions(this.page);
    await this.robustClick(this.addVolumeButton());
    const withForm = this.page.getByRole('menuitem', { name: /With form/i });
    await withForm.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await withForm.click();
    await this.addVolumeModalHeading().waitFor({
      state: 'visible',
      timeout: TestTimeouts.LONG_OPERATION,
    });
    await this.addVolumeModal()
      .getByText(/^Source type$/i)
      .waitFor({
        state: 'visible',
        timeout: TestTimeouts.LONG_OPERATION,
      });
  }

  async openCreateWithYaml(namespace: string): Promise<void> {
    await this.robustClick(this.addVolumeButton());
    await this.page.getByRole('menuitem', { name: /With YAML/i }).click();
    await this.page.waitForURL(new RegExp(`/ns/${namespace}/.*DataVolume.*~new`), {
      timeout: TestTimeouts.LONG_OPERATION,
    });
  }

  async openNamespaceListReady(nav: NavigationPage, namespace: string): Promise<void> {
    await nav.goToBootableVolumes(namespace);
    await this.goToNamespaceList(namespace);
  }
}
