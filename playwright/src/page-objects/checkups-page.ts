import BasePage from '@/page-objects/base-page';
import { ConsoleRoutes } from '@/utils/console-routes';
import { pollUntil } from '@/utils/poll-until';
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
    const run = this.page.locator('main').getByRole('button', { exact: true, name: 'Run' });
    await pollUntil(
      async () => {
        if (!(await run.isVisible().catch(() => false))) {
          return false;
        }
        return !(await run.isDisabled().catch(() => true));
      },
      {
        message: 'Run button should be enabled on checkup form',
        timeout: TestTimeouts.ELEMENT_WAIT,
      },
    );
    await this.robustClick(run);
  }

  async clickStorageCheckupBreadcrumb(): Promise<void> {
    await this.robustClick(this.page.getByRole('button', { name: 'Storage checkup' }));
  }

  async clickStorageTab(): Promise<void> {
    await this.robustClick(this.page.getByRole('tab', { name: /^Storage$/i }));
  }

  async deleteFromActionsMenu(): Promise<void> {
    const main = this.page.locator('main');
    const actionsBtn = main.getByRole('button', { name: /^Actions$/i }).first();
    const titleRowToggle = main
      .getByRole('heading', { level: 1 })
      .first()
      .locator('xpath=..')
      .getByRole('button')
      .first();
    await pollUntil(
      async () =>
        (await actionsBtn.isVisible().catch(() => false)) ||
        (await titleRowToggle.isVisible().catch(() => false)),
      {
        message: 'Checkup detail actions control should be visible',
        timeout: TestTimeouts.ELEMENT_WAIT,
      },
    );
    const toggle = (await actionsBtn.isVisible().catch(() => false)) ? actionsBtn : titleRowToggle;
    await this.robustClick(toggle);
    const menu = this.page.getByRole('menu').filter({ visible: true }).last();
    await this.robustClick(
      menu
        .getByRole('menuitem', { name: 'Delete' })
        .or(menu.getByText('Delete', { exact: true }))
        .first(),
    );
    const deleteModal = this.page.getByRole('dialog', { name: /Delete checkup/i });
    await pollUntil(async () => deleteModal.isVisible().catch(() => false), {
      message: 'Delete checkup confirmation modal should be visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await this.robustClick(deleteModal.getByRole('button', { name: /^Delete$/i }).first());
    await deleteModal.waitFor({ state: 'hidden', timeout: TestTimeouts.LONG_OPERATION });
    await this.page
      .waitForURL(
        (url) => {
          const path = url.pathname;
          return (
            path.includes('/checkups') && !path.match(/\/checkups\/(?:network|storage)\/[^/]+$/)
          );
        },
        { timeout: TestTimeouts.LONG_OPERATION },
      )
      .catch(() => undefined);
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
    const select = this.page
      .locator('#nad')
      .getByRole('button')
      .or(this.page.locator('[placeholder*="Netwrok"], [placeholder*="NetworkAttachment"]'));
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
