import BasePage from '@/page-objects/base-page';
import { CatalogPage } from '@/page-objects/catalog-page';
import { dismissConsoleObstructions } from '@/utils/console-modals';
import { ConsoleRoutes, DEFAULT_CATALOG_NAMESPACE } from '@/utils/console-routes';
import { SECOND, TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

export class NavigationPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /** Direct console navigation (stable on 4.13); avoids fragile sidebar expand/collapse. */
  private async gotoConsolePath(path: string): Promise<void> {
    await dismissConsoleObstructions(this.page);
    await this.page.goto(path, {
      waitUntil: 'domcontentloaded',
      timeout: TestTimeouts.CONSOLE_PAGE_LOAD,
    });
    await dismissConsoleObstructions(this.page);
  }

  async switchToAdministratorPerspective(): Promise<void> {
    await dismissConsoleObstructions(this.page);
    const toggle = this.consoleTestId('perspective-switcher-toggle');
    if (await toggle.isVisible().catch(() => false)) {
      const label = (await toggle.textContent())?.trim() ?? '';
      if (/administrator/i.test(label)) {
        return;
      }
      await toggle.click({ force: true });
      const admin = this.consoleTestId('perspective-switcher-menu-option').filter({
        hasText: 'Administrator',
      });
      if (await admin.isVisible().catch(() => false)) {
        await admin.click();
        await toggle
          .filter({ hasText: /Administrator/i })
          .waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT })
          .catch(() => undefined);
      }
      await this.page.keyboard.press('Escape').catch(() => undefined);
    }
  }

  /** Sidebar navigation smoke — expand Virtualization section and click a nav link. */
  async clickVirtNav(testId: string): Promise<void> {
    await this.switchToAdministratorPerspective();
    await this.expandVirtualizationNavSection();
    const link = this.consoleTestId(testId);
    await link.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(link);
  }

  private async expandVirtualizationNavSection(): Promise<void> {
    const overview = this.consoleTestId('virtualization-overview-nav-item');
    if (await overview.isVisible().catch(() => false)) {
      return;
    }
    const virt = this.consoleTestId('virtualization-nav-item').first();
    await virt.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await virt.click();
    await overview.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
  }

  private overviewReadyLocator() {
    return this.page
      .locator('[data-test-id="kv-overview-status-card"], [data-test="getting-started"]')
      .or(this.page.getByText('Feature highlights'))
      .or(this.page.getByText('Related operators'))
      .or(
        this.page.locator('[data-test-id="resource-title"]').filter({ hasText: /Virtualization/i }),
      )
      .first();
  }

  async goToOverview(): Promise<void> {
    await this.switchToAdministratorPerspective();
    try {
      await this.clickVirtNav('virtualization-overview-nav-item');
      await this.overviewReadyLocator().waitFor({
        state: 'visible',
        timeout: TestTimeouts.CONSOLE_PAGE_LOAD,
      });
      await dismissConsoleObstructions(this.page);
      await this.waitForLoadingComplete(TestTimeouts.ELEMENT_WAIT);
      return;
    } catch {
      // Fall back to direct route when sidebar nav is unavailable.
    }
    const path = ConsoleRoutes.virtualizationOverview();
    const deadline = Date.now() + TestTimeouts.CONSOLE_PAGE_LOAD;
    let lastError: Error | undefined;

    while (Date.now() < deadline) {
      try {
        await this.gotoConsolePath(path);
        if (this.page.url().includes('/auth/login')) {
          throw new Error('Console session expired while opening Virtualization overview');
        }
        await this.page.waitForURL(/virtualization-overview/, {
          timeout: Math.min(30 * SECOND, deadline - Date.now()),
        });
        await this.overviewReadyLocator().waitFor({
          state: 'visible',
          timeout: Math.min(90 * SECOND, deadline - Date.now()),
        });
        await dismissConsoleObstructions(this.page);
        await this.waitForLoadingComplete(TestTimeouts.ELEMENT_WAIT);
        return;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (Date.now() >= deadline) {
          break;
        }
        await this.page.waitForTimeout(2 * SECOND);
      }
    }

    throw lastError ?? new Error('Timed out opening Virtualization overview');
  }

  async goToCatalog(namespace = DEFAULT_CATALOG_NAMESPACE): Promise<void> {
    await this.gotoConsolePath(ConsoleRoutes.catalog(namespace));
    const catalogPage = new CatalogPage(this.page);
    if (await catalogPage.shouldUseLegacyCatalogRoute()) {
      await this.gotoConsolePath(ConsoleRoutes.legacyCatalog(namespace));
    }
    await this.page
      .getByRole('heading', {
        name: /Create (new )?VirtualMachine|Select a creation method|Templates/i,
      })
      .first()
      .waitFor({ timeout: TestTimeouts.CONSOLE_PAGE_LOAD });
    await catalogPage.prepareTemplateCatalogGrid();
  }

  async goToVirtualMachines(): Promise<void> {
    await this.gotoConsolePath(ConsoleRoutes.virtualMachines());
    await this.page
      .locator('[data-test-id="resource-title"]')
      .filter({ hasText: 'VirtualMachines' })
      .waitFor({ timeout: TestTimeouts.CONSOLE_PAGE_LOAD });
  }

  async goToTemplates(): Promise<void> {
    await this.gotoConsolePath(ConsoleRoutes.templates());
    await this.page
      .getByRole('heading', { name: /VirtualMachine Templates/i })
      .or(
        this.page
          .locator('[data-test-id="resource-title"]')
          .filter({ hasText: /VirtualMachine Templates|Templates/i }),
      )
      .first()
      .waitFor({ timeout: TestTimeouts.CONSOLE_PAGE_LOAD });
  }

  async goToDataSources(): Promise<void> {
    await this.gotoConsolePath(ConsoleRoutes.dataSources());
    await this.page
      .locator('[data-test-id="resource-title"]')
      .filter({ hasText: 'DataSources' })
      .waitFor({ timeout: TestTimeouts.CONSOLE_PAGE_LOAD });
  }

  async goToMigrationPolicies(): Promise<void> {
    await this.gotoConsolePath(ConsoleRoutes.migrationPolicies());
    await this.page
      .locator('[data-test-id="resource-title"]')
      .filter({ hasText: /Migration\s*Policies/i })
      .waitFor({ timeout: TestTimeouts.CONSOLE_PAGE_LOAD });
  }

  async goToInstanceTypes(): Promise<void> {
    await this.gotoConsolePath(ConsoleRoutes.clusterInstanceTypes());
    await this.page
      .locator('[data-test-id="resource-title"]')
      .filter({ hasText: /InstanceTypes/i })
      .waitFor({ timeout: TestTimeouts.CONSOLE_PAGE_LOAD });
  }

  async goToBootableVolumes(namespace: string): Promise<void> {
    await this.gotoConsolePath(ConsoleRoutes.bootableVolumesInNamespace(namespace));
    await this.page
      .locator('[data-test-id="resource-title"]')
      .filter({ hasText: /Bootable volumes/i })
      .waitFor({ timeout: TestTimeouts.CONSOLE_PAGE_LOAD });
  }

  async goToVirtualizationSettings(): Promise<void> {
    await this.gotoConsolePath(ConsoleRoutes.virtualizationSettings());
    const missing = this.page.getByRole('heading', { name: /404: Page Not Found/i });
    if (await missing.isVisible({ timeout: 15 * SECOND }).catch(() => false)) {
      await this.goToOverview();
      await this.page.getByRole('link', { name: 'Settings', exact: true }).click();
      await this.page
        .getByText(
          /Installed version|OpenShift Virtualization|InstanceTypes catalog developer preview/i,
        )
        .first()
        .waitFor({ timeout: TestTimeouts.CONSOLE_PAGE_LOAD });
      return;
    }
    await this.page
      .locator('[data-test="settings-tab-user"], [data-test="settings-tab-cluster"]')
      .first()
      .waitFor({ timeout: TestTimeouts.CONSOLE_PAGE_LOAD });
  }

  async switchProject(projectName: string): Promise<void> {
    await dismissConsoleObstructions(this.page);
    await this.page.locator('[data-test-id="namespace-bar-dropdown"]').click();

    const showDefault = this.page.locator(
      '[data-test-id="showSystemSwitch"], [data-test="show-default-projects-switch"]',
    );
    if (await showDefault.isVisible().catch(() => false)) {
      await showDefault.check();
    }

    const filter = this.page.locator(
      'input[placeholder="Select project..."], [data-test="namespace-dropdown-filter"] input, [data-test="namespace-dropdown-filter"]',
    );
    const filterText = projectName.length > 36 ? projectName.slice(0, 36) : projectName;
    if (
      await filter
        .first()
        .isVisible()
        .catch(() => false)
    ) {
      await filter.first().fill(filterText);
    }

    const namePattern = new RegExp(projectName.slice(0, 24));
    const projectEntry = this.page
      .locator('[data-test-id="dropdown-menu-item-link"]')
      .filter({ hasText: namePattern })
      .or(this.page.getByRole('menuitem', { name: namePattern }))
      .or(this.page.getByRole('link', { name: namePattern }));

    await projectEntry.first().waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await projectEntry.first().click();
    await this.page.keyboard.press('Escape').catch(() => undefined);
  }
}
