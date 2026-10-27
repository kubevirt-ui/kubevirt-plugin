import BasePage from '@/page-objects/base-page';
import { ConsoleRoutes } from '@/utils/console-routes';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

export class CheckupsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async clickCheckupLink(name: string): Promise<void> {
    await this.robustClick(this.page.getByRole('link', { name }).first());
  }

  async clickFormRun(): Promise<void> {
    const run = this.page.getByRole('button', { exact: true, name: 'Run' });
    await run.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    if (await run.isDisabled()) {
      throw new Error('Run button is disabled on checkup form');
    }
    await this.robustClick(run);
  }

  async clickStorageCheckupBreadcrumb(): Promise<void> {
    await this.robustClick(this.page.getByRole('button', { name: 'Storage checkup' }));
  }

  async clickStorageTab(): Promise<void> {
    await this.robustClick(this.page.getByRole('tab', { name: /^Storage$/i }));
  }

  async deleteFromActionsMenu(): Promise<void> {
    await this.robustClick(this.page.getByRole('button', { name: 'Actions' }).first());
    await this.robustClick(this.page.getByRole('menuitem', { name: 'Delete' }));
  }

  async goToNetworkForm(namespace: string): Promise<void> {
    await this.goTo(ConsoleRoutes.checkupsNetworkForm(namespace));
    await this.page
      .getByRole('heading', { name: /Run network latency checkup/i })
      .waitFor({ state: 'visible', timeout: TestTimeouts.CONSOLE_PAGE_LOAD });
  }

  async goToNetworkList(namespace: string): Promise<void> {
    await this.goTo(ConsoleRoutes.checkupsInNamespace(namespace));
    await this.page.getByRole('tab', { name: /Network latency/i }).waitFor({
      state: 'visible',
      timeout: TestTimeouts.CONSOLE_PAGE_LOAD,
    });
  }

  async goToStorageForm(namespace: string): Promise<void> {
    await this.goTo(ConsoleRoutes.checkupsStorageForm(namespace));
    await this.page
      .getByRole('heading', { name: /Run storage checkup/i })
      .waitFor({ state: 'visible', timeout: TestTimeouts.CONSOLE_PAGE_LOAD });
  }

  async goToStorageList(namespace: string): Promise<void> {
    await this.goTo(ConsoleRoutes.checkupsStorage(namespace));
    await this.page.getByRole('tab', { name: /^Storage$/i }).waitFor({
      state: 'visible',
      timeout: TestTimeouts.CONSOLE_PAGE_LOAD,
    });
  }

  async installPermissionsIfNeeded(): Promise<void> {
    const install = this.page.getByRole('button', { name: 'Install permissions' });
    if (!(await install.isVisible().catch(() => false))) {
      return;
    }
    try {
      await this.robustClick(install);
      await install
        .waitFor({ state: 'hidden', timeout: TestTimeouts.LONG_OPERATION })
        .catch(() => undefined);
      await this.tabPanelRunCheckupButton()
        .waitFor({ state: 'visible', timeout: TestTimeouts.LONG_OPERATION })
        .catch(() => undefined);
    } catch {
      // UI may settle to "already installed" between visibility check and click.
    }
  }

  async isInstallPermissionsVisible(): Promise<boolean> {
    return this.page
      .getByRole('button', { name: 'Install permissions' })
      .isVisible()
      .catch(() => false);
  }

  async isTabPanelRunCheckupEnabled(): Promise<boolean> {
    const run = this.tabPanelRunCheckupButton();
    if (!(await run.isVisible().catch(() => false))) {
      return !(await this.isInstallPermissionsVisible());
    }
    return run.isEnabled();
  }

  async openNetworkCheckupFormFromList(namespace: string): Promise<void> {
    const run = this.tabPanelRunCheckupButton();
    if (await run.isVisible().catch(() => false)) {
      if (await run.isEnabled()) {
        await this.robustClick(run);
        return;
      }
      await this.goToNetworkForm(namespace);
      return;
    }
    await this.robustClick(this.page.getByRole('button', { name: 'Run checkup' }).first());
    await this.robustClick(this.page.getByRole('menuitem', { name: /Network latency/i }).first());
  }

  async openStorageCheckupFormFromList(namespace: string): Promise<void> {
    const run = this.tabPanelRunCheckupButton();
    if (await run.isVisible().catch(() => false)) {
      if (await run.isEnabled()) {
        await this.robustClick(run);
        return;
      }
      await this.goToStorageForm(namespace);
      return;
    }
    await this.robustClick(this.page.getByRole('button', { name: 'Run checkup' }).first());
    await this.robustClick(this.page.getByRole('menuitem', { name: /^Storage$/i }).first());
  }

  async selectNetworkAttachmentDefinition(nadName: string): Promise<void> {
    const select = this.page.locator(
      '[placeholder*="Netwrok"], [placeholder*="NetworkAttachment"]',
    );
    await this.robustClick(select.first());
    const option = this.page
      .locator(
        `[role="listbox"] button:has-text("${nadName}"), [role="option"]:has-text("${nadName}")`,
      )
      .first();
    await option.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(option);
  }

  async setCheckupName(name: string): Promise<void> {
    const nameInput = this.page.locator('input#name');
    await nameInput.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await nameInput.clear();
    await nameInput.fill(name);
  }

  async setStorageTimeoutMinutes(minutes: string): Promise<void> {
    await this.page.locator('input#timeout').fill(minutes);
  }

  /** Empty-state / tab-panel Run checkup (header dropdown stays enabled without permissions). */
  tabPanelRunCheckupButton() {
    return this.page.getByRole('tabpanel').getByRole('button', { name: 'Run checkup' });
  }

  async verifyCheckupAbsent(name: string): Promise<boolean> {
    try {
      await this.page
        .locator(`tr:has-text("${name}"), [data-test-rows="resource-row"]:has-text("${name}")`)
        .first()
        .waitFor({ state: 'hidden', timeout: TestTimeouts.LONG_OPERATION });
      return true;
    } catch {
      return false;
    }
  }

  async verifyCheckupInList(name: string): Promise<boolean> {
    try {
      await this.page
        .getByRole('link', { name })
        .first()
        .waitFor({ state: 'visible', timeout: TestTimeouts.LONG_OPERATION });
      return true;
    } catch {
      return false;
    }
  }

  async verifyNamespaceLink(namespace: string): Promise<boolean> {
    return this.page
      .getByRole('link', { name: namespace })
      .first()
      .isVisible()
      .catch(() => false);
  }

  async verifySubtitleVisible(text: string): Promise<boolean> {
    return this.page
      .getByText(text, { exact: true })
      .first()
      .isVisible()
      .catch(() => false);
  }
}
