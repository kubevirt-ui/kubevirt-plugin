import BasePage from '@/page-objects/base-page';
import { NavigationPage } from '@/page-objects/navigation-page';
import { dismissConsoleObstructions } from '@/utils/console-modals';
import { ConsoleRoutes } from '@/utils/console-routes';
import { pollUntil } from '@/utils/poll-until';
import { TestTimeouts } from '@/utils/test-config';
import { expect, type Locator, type Page } from '@playwright/test';

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export type VirtualizationSettingsTabId =
  | 'cluster'
  | 'downloads'
  | 'features'
  | 'recommended'
  | 'user';

/**
 * Virtualization Settings (`/k8s/all-namespaces/virtualization-settings/*`).
 * Read-heavy helpers for gating; mutation helpers kept minimal.
 */
export class VirtualizationSettingsPage extends BasePage {
  private readonly generalSettingsButton = this.locator('button:has-text("General settings")');
  private readonly configurationSearchInput = this.page
    .getByPlaceholder(/Find settings/i)
    .or(this.locator('#ConfigurationSearch-autocomplete-search input'));

  private readonly settingsReady = this.page
    .getByRole('tab', { name: /^Cluster$/i })
    .or(this.page.getByRole('button', { name: /^General settings$/i }))
    .or(this.page.locator('[data-test="settings-tab-cluster"]'))
    .first();

  constructor(page: Page) {
    super(page);
  }

  async goToSettings(): Promise<void> {
    const nav = new NavigationPage(this.page);
    await nav.switchToAdministratorPerspective();
    await dismissConsoleObstructions(this.page);

    for (let attempt = 0; attempt < 2; attempt += 1) {
      await this.page.goto(ConsoleRoutes.virtualizationSettingsCluster(), {
        timeout: TestTimeouts.CONSOLE_PAGE_LOAD,
        waitUntil: 'domcontentloaded',
      });
      await dismissConsoleObstructions(this.page);
      if (await this.settingsReady.isVisible().catch(() => false)) {
        return;
      }
      await this.page.reload({ waitUntil: 'domcontentloaded' }).catch(() => undefined);
    }

    await this.settingsReady.waitFor({ state: 'visible', timeout: TestTimeouts.LONG_OPERATION });
  }

  async openTab(tab: VirtualizationSettingsTabId): Promise<void> {
    const link = this.settingsTab(tab).first();
    await link.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await link.click();
    await pollUntil(
      async () => {
        const selected = await link.getAttribute('aria-selected').catch(() => null);
        if (selected === 'true') {
          return true;
        }
        return this.tabPanel(tab)
          .isVisible()
          .catch(() => false);
      },
      {
        message: `Settings tab "${tab}" panel should become active`,
        timeout: TestTimeouts.LONG_OPERATION,
      },
    );
  }

  settingsTab(tab: VirtualizationSettingsTabId): Locator {
    const label: Record<VirtualizationSettingsTabId, RegExp | string> = {
      cluster: /^Cluster$/i,
      downloads: /^Downloads$/i,
      features: /Preview features/i,
      recommended: /Recommended capabilities/i,
      user: /^User$/i,
    };
    return this.page
      .getByRole('tab', { name: label[tab] })
      .or(this.page.locator(`[data-test="settings-tab-${tab}"]`));
  }

  tabPanel(tab: VirtualizationSettingsTabId): Locator {
    const panelTestId: Record<VirtualizationSettingsTabId, string> = {
      cluster: 'cluster-settings',
      downloads: 'downloads',
      features: 'preview-features',
      recommended: 'recommended-capabilities',
      user: 'user-settings',
    };
    // Prefer data-test panel only — never `.or(main)` (strict-mode dual match on 4.22).
    return this.page.locator(`[data-test="${panelTestId[tab]}"]`).first();
  }

  async getSettingsTabNames(): Promise<string[]> {
    try {
      const tablist = this.page
        .getByRole('tablist')
        .filter({ has: this.page.getByRole('tab', { name: /Preview features/i }) });
      await tablist.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      const names = await tablist.getByRole('tab').allTextContents();
      if (names.length >= 2) {
        return names;
      }
    } catch {
      /* fall through */
    }
    const fallback: string[] = [];
    const expected: Array<[VirtualizationSettingsTabId, string]> = [
      ['cluster', 'Cluster'],
      ['user', 'User'],
      ['features', 'Preview features'],
    ];
    for (const [id, label] of expected) {
      if (
        await this.settingsTab(id)
          .isVisible()
          .catch(() => false)
      ) {
        fallback.push(label);
      }
    }
    return fallback;
  }

  async fillConfigurationSearchInput(searchTerm: string): Promise<void> {
    await this.configurationSearchInput.waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await this.configurationSearchInput.clear();
    await this.configurationSearchInput.fill(searchTerm);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async verifyHighlightedSearchResultsVisible(): Promise<{ count: number; isVisible: boolean }> {
    const searchMenuItems = this.locator('[role="menuitem"]');
    let count = 0;
    let visible = false;
    try {
      await pollUntil(
        async () => {
          count = await searchMenuItems.count().catch(() => 0);
          if (count === 0) {
            return false;
          }
          return searchMenuItems
            .first()
            .isVisible()
            .catch(() => false);
        },
        {
          intervalMs: 400,
          message: 'Settings search should show autocomplete menuitems',
          timeout: TestTimeouts.ELEMENT_WAIT,
        },
      );
      visible = count > 0;
    } catch {
      visible = false;
    }
    return { count, isVisible: visible && count > 0 };
  }

  private installedVersionValue(): Locator {
    return this.page
      .locator('[data-test-id="general-information-installed-version"]')
      .or(
        this.page
          .locator('dt')
          .filter({ hasText: /^Installed version$/i })
          .locator('xpath=following-sibling::dd[1]'),
      )
      .first();
  }

  private updateStatusValue(): Locator {
    return this.page
      .locator('[data-test-id="general-information-update-status"]')
      .or(
        this.page
          .locator('dt')
          .filter({ hasText: /^Update status$/i })
          .locator('xpath=following-sibling::dd[1]'),
      )
      .first();
  }

  async verifyInstalledVersion(
    expectedVersionPrefix = '4',
    expectedStatusFragment = /Up to date|Update|available|Channel|Error|Progressing|Unknown/i,
  ): Promise<boolean> {
    const versionEl = this.installedVersionValue();
    const statusEl = this.updateStatusValue();
    try {
      await versionEl.waitFor({ state: 'visible', timeout: TestTimeouts.LONG_OPERATION });
      await statusEl.waitFor({ state: 'visible', timeout: TestTimeouts.LONG_OPERATION });
      // Values hydrate after HCO/CSV load — empty definitions are visible but not ready.
      await pollUntil(
        async () => {
          const v = ((await versionEl.textContent()) ?? '').trim();
          const s = ((await statusEl.textContent()) ?? '').trim();
          return v.length > 0 && s.length > 0;
        },
        {
          message: 'Installed version and update status text should populate',
          timeout: TestTimeouts.LONG_OPERATION,
        },
      );
      const versionText = ((await versionEl.textContent()) ?? '').trim();
      const statusText = ((await statusEl.textContent()) ?? '').trim();
      return versionText.includes(expectedVersionPrefix) && expectedStatusFragment.test(statusText);
    } catch {
      return false;
    }
  }

  async getClusterSettingsSectionNames(): Promise<string[]> {
    const known = [
      'Virtualization features',
      'General settings',
      'Guest management',
      'Resource management',
      'SCSI persistent reservation',
    ];
    return this.collectVisibleButtons(known);
  }

  async expandSection(sectionName: string): Promise<void> {
    // Parallel settings tests remount the Cluster panel — re-query before each action.
    await pollUntil(
      async () => {
        const btn = this.page.getByRole('button', { name: sectionName, exact: true }).first();
        if (!(await btn.isVisible().catch(() => false))) {
          return false;
        }
        await btn.scrollIntoViewIfNeeded().catch(() => undefined);
        await this.robustClick(btn);
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
        return true;
      },
      {
        message: `Settings section "${sectionName}" should be clickable`,
        timeout: TestTimeouts.ELEMENT_WAIT,
      },
    );
  }

  async navigateToVirtualizationFeatures(): Promise<void> {
    await this.expandSection('Virtualization features');
  }

  async navigateToResourceManagement(): Promise<void> {
    const marker = this.ksmSwitch()
      .or(this.aaqSwitch())
      .or(this.page.getByText(/Kernel same-page merging|Application Aware Quota/i))
      .first();
    await pollUntil(
      async () => {
        if (await marker.isVisible().catch(() => false)) {
          return true;
        }
        await this.expandSection('Resource management');
        return marker.isVisible().catch(() => false);
      },
      {
        message: 'Resource management should show KSM / AAQ controls',
        timeout: TestTimeouts.ELEMENT_WAIT,
      },
    );
  }

  async navigateToGeneralSettings(): Promise<void> {
    const marker = this.page.getByRole('button', { name: 'Live migration', exact: true });
    await pollUntil(
      async () => {
        if (await marker.isVisible().catch(() => false)) {
          return true;
        }
        await this.expandSection('General settings');
        return marker.isVisible().catch(() => false);
      },
      {
        message: 'General settings should show Live migration sub-section',
        timeout: TestTimeouts.ELEMENT_WAIT,
      },
    );
  }

  async navigateToGuestManagement(): Promise<void> {
    const marker = this.guestSystemLogSwitch()
      .or(this.hideCredentialsSwitch())
      .or(this.page.getByText(/Guest system log|Hide guest credentials/i))
      .first();
    await pollUntil(
      async () => {
        if (await marker.isVisible().catch(() => false)) {
          return true;
        }
        await this.expandSection('Guest management');
        return marker.isVisible().catch(() => false);
      },
      {
        message: 'Guest management should show guest log / credentials controls',
        timeout: TestTimeouts.ELEMENT_WAIT,
      },
    );
  }

  async navigateToScsiPersistentReservation(): Promise<void> {
    await this.expandSection('SCSI persistent reservation');
  }

  async getVirtualizationFeatureItems(): Promise<string[]> {
    const known = [
      'Cluster observability',
      'Network observability',
      'Host network management',
      'High availability',
      'Load balance',
    ];
    return this.collectVisibleText(known);
  }

  configureFeaturesButton(): Locator {
    return this.locator('button:has-text("Configure features")');
  }

  async getGeneralSettingsSubSections(): Promise<string[]> {
    await this.navigateToGeneralSettings();
    const known = [
      'Live migration',
      'Memory density',
      'SSH configurations',
      'Templates and images management',
      'VirtualMachine actions confirmation',
      'YAML tab visibility',
      'Advanced CD-ROM features',
    ];
    return this.collectVisibleButtons(known);
  }

  async openGeneralSubSection(name: string): Promise<void> {
    const subSection = this.page.getByRole('button', { name, exact: true }).first();
    await pollUntil(
      async () => {
        if (await subSection.isVisible().catch(() => false)) {
          return true;
        }
        // General settings is a drill-in; remounts / parallel tests may leave it collapsed.
        await this.navigateToGeneralSettings();
        return subSection.isVisible().catch(() => false);
      },
      {
        message: `General settings sub-section "${name}" should be visible`,
        timeout: TestTimeouts.ELEMENT_WAIT,
      },
    );
    await subSection.scrollIntoViewIfNeeded().catch(() => undefined);
    await this.robustClick(subSection);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  }

  liveMigrationParallelClusterInput(): Locator {
    return this.locator('input[name="parallelMigrationsPerCluster"]');
  }

  liveMigrationParallelNodeInput(): Locator {
    return this.locator('input[name="parallelOutboundMigrationsPerNode"]');
  }

  memoryDensityToggle(): Locator {
    return this.locator('#memory-density-feature input');
  }

  vmActionsConfirmationSwitch(): Locator {
    return this.locator('[id="confirm-vm-actions"] [role="switch"]');
  }

  hideYamlTabSwitch(): Locator {
    return this.locator('[data-test-id="hide-yaml-tab"]');
  }

  advancedCdromFeaturesToggle(): Locator {
    return this.locator('input[data-test-id="advanced-cdrom-features"]');
  }

  guestSystemLogSwitch(): Locator {
    return this.page
      .locator('[data-test-id="guest-system-log"]')
      .or(this.page.getByRole('switch', { name: /Guest system log/i }))
      .first();
  }

  hideCredentialsSwitch(): Locator {
    return this.locator('[data-test-id="hide-credentials"]');
  }

  centosStream9AutoDownloadSwitch(): Locator {
    return this.locator('[data-test-id="centos-stream9-image-cron-auto-image-download-switch"]');
  }

  ksmSwitch(): Locator {
    return this.page
      .locator('[data-test-id="kernel-samepage-merging"]')
      .or(this.page.getByRole('switch', { name: /Kernel same-page merging|KSM/i }))
      .first();
  }

  aaqSwitch(): Locator {
    return this.locator(
      '.section-with-switch:has-text("Application Aware Quota") .pf-v6-c-switch input',
    );
  }

  persistentReservationSwitch(): Locator {
    return this.locator('[data-test-id="persistent-reservation"]');
  }

  autoComputeCpuLimitsSwitch(): Locator {
    return this.page.locator('#auto-compute-cpu-limits').or(
      this.page
        .locator('.section-with-switch')
        .filter({ hasText: /Auto-compute CPU and memory limits/i })
        .getByRole('switch'),
    );
  }

  manageQuotasLink(): Locator {
    return this.locator('a:has-text("Manage quotas")').first();
  }

  previewFeaturesPanel(): Locator {
    return this.page
      .locator('[data-test="preview-features"]')
      .or(this.page.getByRole('tabpanel').filter({ hasText: /Preview features are for testing/i }))
      .first();
  }

  previewFeatureSwitch(featureTestId: string): Locator {
    return this.previewFeaturesPanel()
      .locator(`[data-test-id="${featureTestId}"]`)
      .or(this.previewFeaturesPanel().locator(`label:has([data-test-id="${featureTestId}"])`));
  }

  /**
   * Opens AAQ quotas list when the CRD/route exists.
   * Returns false when AAQ is not installed (404) so gating can assert the control alone.
   */
  async expectQuotasListPage(): Promise<boolean> {
    const manage = this.manageQuotasLink();
    if (await manage.isVisible().catch(() => false)) {
      await this.robustClick(manage);
    } else {
      await this.navigateToQuotasList();
    }
    const notFound = this.page.getByRole('heading', { name: /404|Page Not Found/i });
    const heading = this.page.getByRole('heading', { name: /Application-aware quotas/i });
    const empty = this.page.getByText(/No application-aware quotas found/i);
    try {
      await pollUntil(
        async () => {
          if (await notFound.isVisible().catch(() => false)) {
            return true;
          }
          return (
            (await heading.isVisible().catch(() => false)) ||
            (await empty.isVisible().catch(() => false))
          );
        },
        {
          message: 'Application-aware quotas list, empty state, or missing-CRD page should load',
          timeout: TestTimeouts.LONG_OPERATION,
        },
      );
    } catch {
      return false;
    }
    if (await notFound.isVisible().catch(() => false)) {
      return false;
    }
    return true;
  }

  async getPreviewFeatureLabels(): Promise<string[]> {
    await this.openTab('features');
    const featureContainers = this.previewFeaturesPanel().locator(
      '.section-with-switch .section-with-switch__text span',
    );
    await featureContainers.first().waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_VISIBILITY_QUICK,
    });
    const texts = await featureContainers.allTextContents();
    return texts.map((t) => t.trim()).filter(Boolean);
  }

  async openUserTab(): Promise<void> {
    await this.openTab('user');
  }

  async openManageSshKeysSection(): Promise<void> {
    await this.openUserTab();
    await this.robustClick(this.locator('button:has-text("Manage SSH keys")'));
    await this.page.waitForTimeout(TestTimeouts.UI_STABILIZE);
  }

  sshKeyEditorVisible(): Locator {
    return this.page.getByText(/Public SSH key|SSH key/i).first();
  }

  async openPermissionsSection(): Promise<void> {
    await this.openUserTab();
    await this.robustClick(this.locator('button:has-text("Permissions")'));
  }

  async openGettingStartedResourcesSection(): Promise<void> {
    await this.openUserTab();
    const sectionBtn = this.locator('button:has-text("Getting started resources")').first();
    await sectionBtn.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await pollUntil(
      async () => {
        if (
          await this.welcomeInformationSwitch()
            .isVisible()
            .catch(() => false)
        ) {
          return true;
        }
        if (
          await this.page
            .getByText(/^Welcome information$/i)
            .isVisible()
            .catch(() => false)
        ) {
          return true;
        }
        await sectionBtn.scrollIntoViewIfNeeded().catch(() => undefined);
        await this.robustClick(sectionBtn);
        await this.page.waitForTimeout(TestTimeouts.UI_STABILIZE);
        return (
          (await this.welcomeInformationSwitch()
            .isVisible()
            .catch(() => false)) ||
          (await this.page
            .getByText(/^Welcome information$/i)
            .isVisible()
            .catch(() => false))
        );
      },
      {
        message: 'Getting started resources should show Welcome information',
        timeout: TestTimeouts.LONG_OPERATION,
      },
    );
  }

  async openTemplatesAndImagesManagement(): Promise<void> {
    await this.openGeneralSubSection('Templates and images management');
  }

  automaticImagesDownloadButton(): Locator {
    return this.locator('button:has-text("Automatic images download")');
  }

  welcomeInformationSwitch(): Locator {
    return this.page
      .getByRole('switch', { name: /Welcome information/i })
      .or(this.locator('label:has-text("Welcome information") input[type="checkbox"]'))
      .or(this.locator('label:has-text("Welcome information") [role="switch"]'))
      .first();
  }

  guidedTourSwitch(): Locator {
    return this.page
      .getByRole('switch', { name: /Guided tour/i })
      .or(this.locator('label:has-text("Guided tour") input[type="checkbox"]'))
      .or(this.locator('label:has-text("Guided tour") [role="switch"]'))
      .first();
  }

  automaticSubscriptionSectionButton(): Locator {
    return this.locator('button:has-text("Automatic subscription")');
  }

  async openAutomaticSubscriptionSection(): Promise<void> {
    await this.navigateToGuestManagement();
    await this.robustClick(this.automaticSubscriptionSectionButton());
  }

  async isAaqEnabled(): Promise<boolean> {
    return this.aaqSwitch()
      .first()
      .isChecked()
      .catch(() => false);
  }

  async navigateToQuotasList(): Promise<void> {
    await this.page.goto('/k8s/all-namespaces/quotas', { waitUntil: 'domcontentloaded' });
  }

  /** Visible control that is not disabled (PF switches may use visually hidden inputs). */
  async isControlInteractive(control: Locator): Promise<boolean> {
    const target = (await control.count()) > 0 ? control.first() : control;
    if (
      !(await target.isVisible({ timeout: TestTimeouts.UI_VISIBILITY_QUICK }).catch(() => false))
    ) {
      const label = target.locator('xpath=ancestor::label[1]');
      if (
        !(await label.isVisible({ timeout: TestTimeouts.UI_VISIBILITY_QUICK }).catch(() => false))
      ) {
        return false;
      }
      const className = (await label.getAttribute('class')) ?? '';
      return !className.includes('pf-m-disabled');
    }
    if (await target.isDisabled().catch(() => false)) {
      return false;
    }
    const ariaDisabled = await target.getAttribute('aria-disabled');
    return ariaDisabled !== 'true';
  }

  private async collectVisibleButtons(labels: string[]): Promise<string[]> {
    const found: string[] = [];
    for (const label of labels) {
      const btn = this.locator(`button:has-text("${label}")`).first();
      if (
        await btn
          .waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT })
          .then(() => true)
          .catch(() => false)
      ) {
        found.push(label);
      }
    }
    return found;
  }

  private async collectVisibleText(labels: string[]): Promise<string[]> {
    const found: string[] = [];
    for (const label of labels) {
      const item = this.locator(`text=${label}`).first();
      if (
        await item
          .waitFor({ state: 'visible', timeout: TestTimeouts.UI_VISIBILITY_QUICK })
          .then(() => true)
          .catch(() => false)
      ) {
        found.push(label);
      }
    }
    return found;
  }

  // ── Recommended capabilities tab ─────────────────────────────────────────────

  async goToRecommendedCapabilities(): Promise<void> {
    await dismissConsoleObstructions(this.page);
    await this.page.goto(ConsoleRoutes.virtualizationSettingsRecommended(), {
      timeout: TestTimeouts.CONSOLE_PAGE_LOAD,
      waitUntil: 'domcontentloaded',
    });
    await dismissConsoleObstructions(this.page);
    await this.settingsTab('recommended')
      .first()
      .waitFor({ state: 'visible', timeout: TestTimeouts.LONG_OPERATION });
    await pollUntil(
      async () =>
        (await this.installAutomaticallyCardTitle()
          .isVisible()
          .catch(() => false)) ||
        (await this.additionalCapabilitiesCardTitle()
          .isVisible()
          .catch(() => false)),
      {
        message: 'Recommended capabilities tab content should load',
        timeout: TestTimeouts.LONG_OPERATION,
      },
    );
  }

  manageCapabilitiesHeading(): Locator {
    return this.page.getByRole('heading', {
      level: 2,
      name: /Manage Virtualization capabilities/i,
    });
  }

  installAutomaticallyCardTitle(): Locator {
    return this.page.getByText('Install capabilities automatically', { exact: true });
  }

  additionalCapabilitiesCardTitle(): Locator {
    return this.page.getByText('Additional capabilities (manual setup required)', {
      exact: true,
    });
  }

  autoCapabilitiesTable(): Locator {
    return this.page.getByRole('treegrid', { name: /Custom selection capabilities table/i });
  }

  manualCapabilitiesTable(): Locator {
    return this.page.getByRole('treegrid', {
      name: /Additional recommended capabilities table/i,
    });
  }

  installSelectedButton(): Locator {
    return this.page.getByRole('button', { name: /^Install selected$/i });
  }

  capabilitiesSearchInput(): Locator {
    // Unique placeholder (global settings search uses "Find settings").
    return this.page.getByPlaceholder(/Search capabilities/i);
  }

  /** Status filter toggle in the automatic capabilities toolbar (not the column header). */
  capabilitiesStatusFilterToggle(): Locator {
    return this.page
      .locator('[data-ouia-component-id="DataViewCheckboxFilter-toggle"]')
      .filter({ hasText: /^Status$/i });
  }

  async waitForAutoCapabilitiesReady(): Promise<void> {
    await expect(this.page.getByText(/\d+\s+out of\s+\d+\s+capabilities installed/i)).toBeVisible({
      timeout: TestTimeouts.LONG_OPERATION,
    });
    await expect(this.autoCapabilitiesTable().getByRole('row').nth(1)).toBeVisible({
      timeout: TestTimeouts.LONG_OPERATION,
    });
  }

  selectedCapabilitiesCount(): Locator {
    return this.page.getByText(/\d+\s+selected/i);
  }

  capabilityRow(table: Locator, name: string | RegExp): Locator {
    const pattern = typeof name === 'string' ? new RegExp(escapeRegExp(name), 'i') : name;
    return table.getByRole('row').filter({ hasText: pattern }).first();
  }

  async expandCapabilityRow(table: Locator, name: string | RegExp): Promise<void> {
    const row = this.capabilityRow(table, name);
    await row.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    if ((await row.getAttribute('aria-expanded')) === 'true') {
      return;
    }
    const expand = row.getByRole('button', { name: /Expand row/i }).first();
    if (await expand.isVisible().catch(() => false)) {
      await this.robustClick(expand);
      await pollUntil(async () => (await row.getAttribute('aria-expanded')) === 'true', {
        message: `Capability row ${String(name)} should expand`,
        timeout: TestTimeouts.ELEMENT_WAIT,
      });
    }
  }

  /**
   * Check a top-level automatic capability row. Returns false when the row has no
   * enabled checkbox (already installed / not selectable).
   */
  async selectAutoCapability(name: string | RegExp): Promise<boolean> {
    const row = this.capabilityRow(this.autoCapabilitiesTable(), name);
    await row.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    const checkbox = row.getByRole('checkbox').first();
    if (!(await checkbox.isVisible().catch(() => false))) {
      return false;
    }
    if (await checkbox.isDisabled().catch(() => false)) {
      return false;
    }
    if (await checkbox.isChecked().catch(() => false)) {
      return true;
    }
    await checkbox.check({ force: true });
    return true;
  }

  async clearAutoCapabilitySelection(): Promise<void> {
    const table = this.autoCapabilitiesTable();
    const checked = table.getByRole('checkbox', { checked: true });
    const count = await checked.count().catch(() => 0);
    for (let i = count - 1; i >= 0; i -= 1) {
      const box = checked.nth(i);
      if (await box.isEnabled().catch(() => false)) {
        await box.uncheck({ force: true }).catch(() => undefined);
      }
    }
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  }

  async searchAutoCapabilities(query: string): Promise<void> {
    await this.waitForAutoCapabilitiesReady();
    const input = this.capabilitiesSearchInput();
    const table = this.autoCapabilitiesTable();
    await input.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });

    // Toolbar/filter state can reset while operator status loads — retry until filtering sticks.
    await pollUntil(
      async () => {
        try {
          await input.click({ timeout: 5_000 });
          await input.fill(query, { timeout: 5_000 });
        } catch {
          return false;
        }
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
        if ((await input.inputValue().catch(() => '')) !== query) {
          return false;
        }
        // For a selective query, wait until non-matching top-level rows are gone.
        if (/migrate/i.test(query)) {
          const loadBalancingVisible = await this.capabilityRow(table, /Load balancing/i)
            .isVisible()
            .catch(() => false);
          return !loadBalancingVisible;
        }
        return true;
      },
      {
        message: `Capabilities search "${query}" should filter the automatic table`,
        timeout: TestTimeouts.DEFAULT,
      },
    );
  }

  async clearAutoCapabilitiesSearch(): Promise<void> {
    const input = this.capabilitiesSearchInput();
    if (!(await input.isVisible().catch(() => false))) {
      return;
    }
    await input.click();
    const clear = input
      .locator('xpath=ancestor::*[contains(@class,"pf-v6-c-search-input")][1]')
      .getByRole('button', { name: /Clear|Reset/i });
    if (await clear.isVisible().catch(() => false)) {
      await clear.click();
    } else {
      await input.fill('');
    }
    await pollUntil(async () => (await input.inputValue()) === '', {
      message: 'Capabilities search should clear',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
  }

  async listTopLevelCapabilityNames(table: Locator): Promise<string[]> {
    await table.waitFor({ state: 'visible', timeout: TestTimeouts.LONG_OPERATION });
    const rows = table.getByRole('row');
    const count = await rows.count();
    const names: string[] = [];
    for (let i = 0; i < count; i += 1) {
      const row = rows.nth(i);
      const level = await row.getAttribute('aria-level');
      if (level && level !== '1') {
        continue;
      }
      const header = row.getByRole('rowheader').or(row.locator('[role="rowheader"]'));
      const text = (
        (await header
          .first()
          .innerText()
          .catch(() => '')) || ''
      )
        .replace(/Expand row \d+/gi, '')
        .replace(/Collapse row \d+/gi, '')
        .replace(/Row \d+ checkbox/gi, '')
        .replace(/\bHelp\b/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
      if (text && !/^Name$/i.test(text)) {
        names.push(text);
      }
    }
    return names;
  }

  async isInstallSelectedEnabled(): Promise<boolean> {
    const btn = this.installSelectedButton();
    await btn.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    const ariaDisabled = await btn.getAttribute('aria-disabled');
    if (ariaDisabled === 'true') {
      return false;
    }
    return !(await btn.isDisabled().catch(() => true));
  }
}
