import BasePage from '@/page-objects/base-page';
import { VmWizardPage } from '@/page-objects/vm-wizard-page';
import { dismissConsoleObstructions } from '@/utils/console-modals';
import { ensureNonPrivAdministratorPerspective } from '@/utils/console-perspective';
import { ConsoleRoutes, DEFAULT_CATALOG_NAMESPACE } from '@/utils/console-routes';
import { EnvVariables } from '@/utils/env-variables';
import { pollUntil } from '@/utils/poll-until';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

export class NavigationPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private async expandVirtualizationNavSection(): Promise<void> {
    const overview = this.consoleTestId('virtualization-overview-nav-item');
    if (await overview.isVisible().catch(() => false)) {
      return;
    }
    const virt = this.consoleTestId('virtualization-nav-item').first();
    if (!(await virt.isVisible().catch(() => false))) {
      return;
    }
    await virt.click();
    await overview
      .waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT })
      .catch(() => undefined);
  }

  /** Direct console navigation (stable on 4.13); avoids fragile sidebar expand/collapse. */
  private async gotoConsolePath(path: string): Promise<void> {
    await dismissConsoleObstructions(this.page);
    await this.page.goto(path, {
      timeout: TestTimeouts.CONSOLE_PAGE_LOAD,
      waitUntil: 'domcontentloaded',
    });
    await dismissConsoleObstructions(this.page);
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

  bootableVolumesConsoleUrlPattern(): RegExp {
    return /bootablevolumes/;
  }

  catalogConsoleUrlPattern(): RegExp {
    return /\/(catalog|templatescatalog|vm-wizard)(\/|$)/;
  }

  checkupsConsoleUrlPattern(): RegExp {
    return /checkups/;
  }

  /** Sidebar navigation smoke — expand Virtualization section and click a nav link. */
  async clickVirtNav(testId: string): Promise<void> {
    await this.switchToAdministratorPerspective();
    await this.expandVirtualizationNavSection();
    const link = this.consoleTestId(testId);
    await link.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(link);
  }

  clusterPreferencesConsoleUrlPattern(): RegExp {
    return /VirtualMachineClusterPreference/;
  }

  dataSourcesConsoleUrlPattern(): RegExp {
    return /DataSource/;
  }

  /** Console list pages: 4.19+ often use `h1` only; older builds use `data-test-id="resource-title"`. */
  private listPageTitle(titlePattern: RegExp) {
    return this.listPageHeading(titlePattern);
  }

  private async waitForListPageTitle(titlePattern: RegExp): Promise<void> {
    await this.listPageTitle(titlePattern).waitFor({ timeout: TestTimeouts.CONSOLE_PAGE_LOAD });
  }

  async goToBootableVolumes(namespace: string): Promise<void> {
    await this.gotoConsolePath(ConsoleRoutes.bootableVolumesInNamespace(namespace));
    await this.waitForListPageTitle(/Bootable volumes/i);
  }

  async goToCatalog(namespace = DEFAULT_CATALOG_NAMESPACE): Promise<void> {
    // Prefer bare `/vm-wizard` (matches Create VirtualMachine); namespaced path 404s on some consoles.
    await this.gotoConsolePath(ConsoleRoutes.vmWizard(namespace));
    const vmWizardPage = new VmWizardPage(this.page);
    const wizardShell = this.page.locator(
      '.vm-creation-wizard, .pf-v6-c-wizard.vm-creation-wizard',
    );
    if (
      await wizardShell
        .first()
        .isVisible()
        .catch(() => false)
    ) {
      await this.page.waitForURL(/vm-wizard/, {
        timeout: TestTimeouts.CONSOLE_PAGE_LOAD,
      });
      return;
    }
    if (await vmWizardPage.shouldUseLegacyCatalogRoute()) {
      await this.gotoConsolePath(ConsoleRoutes.legacyCatalog(namespace));
      if (
        await this.page
          .getByRole('heading', { name: /404: Page Not Found/i })
          .isVisible()
          .catch(() => false)
      ) {
        throw new Error(
          `Neither vm-wizard nor legacy catalog is available in namespace ${namespace} on this cluster`,
        );
      }
      await vmWizardPage.prepareTemplateCatalogGrid();
      return;
    }
    await wizardShell
      .first()
      .waitFor({ state: 'visible', timeout: TestTimeouts.CONSOLE_PAGE_LOAD });
  }

  async goToVmWizard(namespace = DEFAULT_CATALOG_NAMESPACE): Promise<void> {
    return this.goToCatalog(namespace);
  }

  async goToCheckups(namespace: string): Promise<void> {
    await this.gotoConsolePath(ConsoleRoutes.checkupsInNamespace(namespace));
    await this.page.waitForURL(/\/checkups(\/|$)/, { timeout: TestTimeouts.CONSOLE_PAGE_LOAD });
    await this.page
      .getByRole('heading', { name: /^Checkups$/i })
      .first()
      .waitFor({ timeout: TestTimeouts.CONSOLE_PAGE_LOAD });
  }

  async goToClusterPreferences(): Promise<void> {
    await this.gotoConsolePath(ConsoleRoutes.clusterPreferences());
    await this.waitForListPageTitle(/VirtualMachineClusterPreferences|Preferences/i);
  }

  async goToDataSources(): Promise<void> {
    await this.gotoConsolePath(ConsoleRoutes.dataSources());
    await this.waitForListPageTitle(/DataSources/i);
  }

  async goToInstanceTypes(): Promise<void> {
    await this.gotoConsolePath(ConsoleRoutes.clusterInstanceTypes());
    await this.waitForListPageTitle(/InstanceTypes/i);
  }

  async goToMigrationPolicies(): Promise<void> {
    await this.gotoConsolePath(ConsoleRoutes.migrationPolicies());
    await this.page.waitForURL(/MigrationPolicy/, { timeout: TestTimeouts.CONSOLE_PAGE_LOAD });
    await this.page
      .getByRole('button', { name: /Create MigrationPolicy/i })
      .first()
      .waitFor({ timeout: TestTimeouts.CONSOLE_PAGE_LOAD });
  }

  async goToOverviewMigrations(namespace = 'openshift'): Promise<void> {
    await this.switchToAdministratorPerspective();
    await this.gotoConsolePath(ConsoleRoutes.virtualizationMigrationsInNamespace(namespace));
    await this.page.waitForURL(/virtualization-migrations/, {
      timeout: TestTimeouts.CONSOLE_PAGE_LOAD,
    });
    await dismissConsoleObstructions(this.page);
    await this.page
      .locator('main')
      .getByRole('heading', { name: /Compute migrations|Migrations/i })
      .or(this.page.locator('main').getByText(/VirtualMachineInstanceMigrations/i))
      .first()
      .waitFor({ state: 'visible', timeout: TestTimeouts.LONG_OPERATION })
      .catch(() => undefined);
  }

  async goToOverviewSettings(): Promise<void> {
    await this.switchToAdministratorPerspective();
    await this.gotoConsolePath(ConsoleRoutes.virtualizationSettings());
    await this.page.waitForURL(/virtualization-settings/, {
      timeout: TestTimeouts.CONSOLE_PAGE_LOAD,
    });
    await dismissConsoleObstructions(this.page);
    await this.page
      .locator('main')
      .getByText(
        /Preview features|General settings|Installed version|Manage SSH keys|Resource management/i,
      )
      .first()
      .waitFor({ state: 'visible', timeout: TestTimeouts.LONG_OPERATION });
  }

  async goToOverview(): Promise<void> {
    await this.switchToAdministratorPerspective();

    const tryOpenOverviewPath = async (path: string): Promise<boolean> => {
      await this.gotoConsolePath(path);
      if (this.page.url().includes('/auth/login')) {
        throw new Error('Console session expired while opening Virtualization overview');
      }
      if (
        await this.page
          .getByRole('heading', { name: /404: Page Not Found/i })
          .isVisible()
          .catch(() => false)
      ) {
        return false;
      }
      const ready = this.overviewReadyLocator();
      if (await ready.isVisible().catch(() => false)) {
        await dismissConsoleObstructions(this.page);
        await this.waitForLoadingComplete(TestTimeouts.ELEMENT_WAIT);
        return true;
      }
      try {
        await ready.waitFor({
          state: 'visible',
          timeout: TestTimeouts.ELEMENT_WAIT,
        });
        await dismissConsoleObstructions(this.page);
        await this.waitForLoadingComplete(TestTimeouts.ELEMENT_WAIT);
        return true;
      } catch {
        return false;
      }
    };

    for (const path of [
      ConsoleRoutes.virtualizationOverview(),
      '/k8s/ns/openshift/virtualization-overview',
    ]) {
      if (await tryOpenOverviewPath(path)) {
        return;
      }
    }

    await this.gotoConsolePath(ConsoleRoutes.virtualizationSettings());
    await this.page
      .getByRole('heading', { name: /^Settings$/i })
      .first()
      .waitFor({ state: 'visible', timeout: TestTimeouts.LONG_OPERATION });
    await dismissConsoleObstructions(this.page);
    return;
  }

  async goToTemplates(): Promise<void> {
    await this.gotoConsolePath(ConsoleRoutes.templates());
    await this.page
      .getByRole('heading', { level: 1, name: /^Templates$/i })
      .or(this.page.getByRole('heading', { name: /VirtualMachine Templates/i }))
      .or(
        this.page
          .locator('[data-test-id="resource-title"]')
          .filter({ hasText: /VirtualMachine Templates|Templates/i }),
      )
      .first()
      .waitFor({ timeout: TestTimeouts.CONSOLE_PAGE_LOAD });
  }

  async goToVirtualMachines(): Promise<void> {
    await this.gotoConsolePath(ConsoleRoutes.virtualMachines());
    // Accept Overview or list tab — both use the VirtualMachines h1; Create is always present.
    await pollUntil(
      async () => {
        await dismissConsoleObstructions(this.page);
        if (
          await this.page
            .getByRole('heading', { level: 1, name: /VirtualMachines/i })
            .first()
            .isVisible()
            .catch(() => false)
        ) {
          return true;
        }
        return this.page
          .getByRole('button', { name: /^Create$/i })
          .first()
          .isVisible()
          .catch(() => false);
      },
      {
        message: 'VirtualMachines page should be ready',
        timeout: TestTimeouts.CONSOLE_PAGE_LOAD,
      },
    );
  }

  async goToVirtualizationSettings(): Promise<void> {
    return this.goToOverviewSettings();
  }

  instanceTypesConsoleUrlPattern(): RegExp {
    return /VirtualMachineClusterInstancetype/;
  }

  migrationPoliciesConsoleUrlPattern(): RegExp {
    return /MigrationPolicy/;
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

  async switchToAdministratorPerspective(): Promise<void> {
    if (EnvVariables.isNonPrivUser) {
      await ensureNonPrivAdministratorPerspective(this.page);
      return;
    }
    await dismissConsoleObstructions(this.page);
    const toggle = this.consoleTestId('perspective-switcher-toggle');
    if (await toggle.isVisible().catch(() => false)) {
      const label = (await toggle.textContent())?.trim() ?? '';
      // 4.21+: “Core platform”; older: “Administrator”.
      if (/administrator|core platform/i.test(label)) {
        return;
      }
      await toggle.click({ force: true });
      const admin = this.consoleTestId('perspective-switcher-menu-option')
        .filter({ hasText: /Administrator|Core platform/i })
        .first();
      if (await admin.isVisible().catch(() => false)) {
        await admin.click();
        await toggle
          .filter({ hasText: /Administrator|Core platform/i })
          .waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT })
          .catch(() => undefined);
      }
      await this.page.keyboard.press('Escape').catch(() => undefined);
    }
  }

  templatesConsoleUrlPattern(): RegExp {
    return /template\.openshift\.io~v1~Template/;
  }

  virtualMachinesConsoleUrlPattern(): RegExp {
    return /kubevirt\.io~v1~VirtualMachine/;
  }
}
