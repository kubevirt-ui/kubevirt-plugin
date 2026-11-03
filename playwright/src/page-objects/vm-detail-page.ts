import type RequestContextClient from '@/clients/request-context-client';
import { VmSidebarYamlEditorComponent } from '@/components/vm/vm-sidebar-yaml-editor-component';
import BasePage from '@/page-objects/base-page';
import type { VmNetworkInterfacesPage } from '@/page-objects/vm-network-interfaces-page';
import { dismissConsoleObstructions } from '@/utils/console-modals';
import { VmTabTestId } from '@/utils/constants';
import { pollUntil } from '@/utils/poll-until';
import { fillLabelsModalInput, openResourceLabelsEditor } from '@/utils/resource-summary';
import { MINUTE, SECOND, TestTimeouts } from '@/utils/test-config';
import type { Locator, Page } from '@playwright/test';

export class VmDetailPage extends BasePage {
  private readonly sidebarYaml: VmSidebarYamlEditorComponent;

  constructor(page: Page) {
    super(page);
    this.sidebarYaml = new VmSidebarYamlEditorComponent(page);
  }

  private configurationInnerTab(innerKey: string): Locator {
    return this.page.locator(`[data-test="vm-configuration-${innerKey}"]`);
  }

  /** Inner `VirtualMachineConfigurationTab` keys (`data-test="vm-configuration-*"`). */
  private configurationInnerTabKey(tabId: VmTabTestId): string | undefined {
    const inner: Partial<Record<VmTabTestId, string>> = {
      [VmTabTestId.Details]: 'details',
      [VmTabTestId.Disks]: 'storage',
      [VmTabTestId.Metadata]: 'metadata',
      [VmTabTestId.Networks]: 'network',
      [VmTabTestId.Scheduling]: 'scheduling',
      [VmTabTestId.Scripts]: 'initial',
    };
    return inner[tabId];
  }

  private configurationLocationMatches(innerKey: string, url: string): boolean {
    const path = this.vmDetailUrlPath(url);
    if (
      path.includes(`/configuration/${innerKey}`) ||
      path.includes(`/configurations/${innerKey}`)
    ) {
      return true;
    }
    const hash = path.includes('#') ? path.slice(path.indexOf('#') + 1).split('/')[0] : '';
    const hashAliases: Record<string, string[]> = {
      details: ['details'],
      environment: ['environment'],
      initial: ['initial', 'scripts'],
      network: ['network', 'network-interfaces'],
      scheduling: ['scheduling'],
      scripts: ['scripts', 'initial'],
      ssh: ['ssh'],
      storage: ['storage', 'disks'],
    };
    const fragments = hashAliases[innerKey] ?? [innerKey];
    return fragments.includes(hash);
  }

  private async gotoConfigurationSection(section: string): Promise<void> {
    const base = this.vmDetailBasePath();
    if (!base) {
      throw new Error(
        `Cannot open configuration/${section} — not on VM detail (${this.page.url()})`,
      );
    }
    await this.page.goto(`${base}/configuration/${section}`, { waitUntil: 'domcontentloaded' });
  }

  private legacyConfigurationSubTab(innerKey: string): Locator | undefined {
    const labels: Record<string, RegExp> = {
      environment: /^Environment$/i,
      initial: /Initial run|Scripts/i,
      metadata: /Labels and annotations|Metadata/i,
      network: /Network interfaces/i,
      scheduling: /Scheduling/i,
      scripts: /Scripts/i,
      ssh: /^SSH$/i,
      storage: /Disks/i,
    };
    const pattern = labels[innerKey];
    return pattern ? this.page.getByRole('tab', { name: pattern }) : undefined;
  }

  private async openConfigurationInnerTab(innerKey: string): Promise<void> {
    const base = this.vmDetailBasePath();
    if (!base) {
      throw new Error(
        `Cannot open configuration tab — not on a VM detail URL (${this.page.url()})`,
      );
    }

    if (!this.configurationLocationMatches(innerKey, this.page.url())) {
      await this.page.goto(`${base}/configuration/${innerKey}`, {
        waitUntil: 'domcontentloaded',
      });
    }

    const legacyTab = this.legacyConfigurationSubTab(innerKey);
    const innerTab = this.configurationInnerTab(innerKey);
    if (!this.configurationLocationMatches(innerKey, this.page.url())) {
      if (await innerTab.isVisible().catch(() => false)) {
        await this.navigateToTab(innerTab);
      } else if (legacyTab && (await legacyTab.isVisible().catch(() => false))) {
        await this.navigateToTab(legacyTab);
      } else {
        await this.page.goto(`${base}/configuration/${innerKey}`, {
          waitUntil: 'domcontentloaded',
        });
      }
    }

    await pollUntil(
      async () => {
        if (legacyTab && (await legacyTab.isVisible().catch(() => false))) {
          return (await legacyTab.getAttribute('aria-selected')) === 'true';
        }
        return this.configurationLocationMatches(innerKey, this.page.url());
      },
      {
        message: `Configuration inner tab ${innerKey} should be active`,
        timeout: TestTimeouts.LONG_OPERATION,
      },
    );

    if (legacyTab && (await legacyTab.isVisible().catch(() => false))) {
      const label = (await legacyTab.textContent())?.trim();
      if (label) {
        await this.page
          .getByRole('tabpanel', { name: new RegExp(label, 'i') })
          .waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      }
    }
  }

  private tabLinkLabel(tabId: VmTabTestId): RegExp {
    const labels: Partial<Record<VmTabTestId, RegExp>> = {
      [VmTabTestId.Configuration]: /Configuration/i,
      [VmTabTestId.Details]: /^Details$/i,
      [VmTabTestId.Disks]: /Disks|Storage/i,
      [VmTabTestId.Environment]: /Environment/i,
      [VmTabTestId.Networks]: /Network/i,
      [VmTabTestId.Scheduling]: /Scheduling/i,
    };
    return labels[tabId] ?? new RegExp(tabId.replace('horizontal-link-', ''), 'i');
  }

  private vmAction(actionId: string, label: RegExp): Locator {
    return this.vmActionsMenu()
      .locator(`[data-test-id="${actionId}"]`)
      .or(this.page.locator(`[data-test-id="${actionId}"]`))
      .or(this.page.getByRole('menuitem', { name: label }));
  }

  private vmActionsButton(): Locator {
    return this.vmActionsMenu()
      .getByRole('button', { name: /^Actions$/i })
      .or(
        this.page
          .locator('main')
          .getByRole('button', { name: /^Actions$/i })
          .first(),
      );
  }

  private vmActionsMenu(): Locator {
    return this.page
      .locator('[data-test-id="virtual-machine-actions"], #virtual-machine-actions')
      .first();
  }

  private vmDetailBasePath(): string | undefined {
    const match = this.vmDetailUrlPath(this.page.url()).match(
      /(.*\/kubevirt\.io~v1~VirtualMachine\/[^/]+)(?:\/|$)/,
    );
    return match?.[1];
  }

  private vmDetailUrlPath(url: string): string {
    return (url.split('?')[0] ?? url).split('#')[0] ?? url;
  }

  private onVmDetailTab(tabId: VmTabTestId, url: string): boolean {
    const segment = this.vmDetailTabPath(tabId);
    if (segment === undefined) {
      return false;
    }
    const path = this.vmDetailUrlPath(url);
    if (segment === '') {
      return (
        /VirtualMachine\/[^/]+\/?$/.test(path) &&
        !new RegExp(
          `VirtualMachine/[^/]+/(metrics|yaml|configuration|events|console|snapshots|diagnostics)(/|$)`,
        ).test(path)
      );
    }
    return new RegExp(`VirtualMachine/[^/]+/${segment}(?:/|$)`).test(path);
  }

  /** Top-level VM detail routes (not under `/configuration/…`). */
  private vmDetailTabPath(tabId: VmTabTestId): string | undefined {
    const paths: Partial<Record<VmTabTestId, string>> = {
      [VmTabTestId.Console]: 'console',
      [VmTabTestId.Diagnostics]: 'diagnostics',
      [VmTabTestId.Events]: 'events',
      [VmTabTestId.Metrics]: 'metrics',
      [VmTabTestId.Overview]: '',
      [VmTabTestId.Snapshots]: 'snapshots',
      [VmTabTestId.YAML]: 'yaml',
    };
    return paths[tabId];
  }

  authorizedSshSecretName(secretName: string): Locator {
    return this.sshTabPanel().getByText(secretName, { exact: true });
  }

  async cloudInitUserDataFromCluster(
    apiClient: RequestContextClient,
    namespace: string,
    vmName: string,
  ): Promise<string> {
    return apiClient.getVirtualMachineCloudInitUserData(namespace, vmName);
  }

  consoleTabContent(): Locator {
    return this.page
      .getByRole('button', { name: /Send key|Disconnect|^Connect$/i })
      .or(
        this.page.getByText(
          /VNC console|VirtualMachine is down|Connected|serial console|Click Connect/i,
        ),
      )
      .first();
  }

  deleteAction(): Locator {
    return this.vmAction('vm-action-delete', /^Delete$/i).or(
      this.page.getByRole('menuitem', { name: /Delete VirtualMachine/i }),
    );
  }

  detailHeading(): Locator {
    return this.page.locator('h1[data-ouia-component-id="OUIA-Generated-Title-1"]').or(
      this.page
        .getByRole('heading', { level: 1 })
        .filter({ hasNotText: /^VirtualMachines$/i })
        .last(),
    );
  }

  diagnosticsTabContent(): Locator {
    return this.page.getByRole('columnheader', { name: /^Message$/i }).first();
  }

  async dismissActionsMenu(): Promise<void> {
    await this.page.keyboard.press('Escape');
  }

  async editLabels(name: string, label: string): Promise<void> {
    await dismissConsoleObstructions(this.page);
    await this.waitForDetailHeadingVmName(name);

    const actionsEdit = this.page
      .locator('[data-test-id="vm-action-edit-labels"]')
      .or(this.page.getByRole('menuitem', { name: /^Edit labels$/i }));
    let edited = false;
    if (
      await this.vmActionsButton()
        .isVisible()
        .catch(() => false)
    ) {
      await this.openActionsMenu();
      try {
        await actionsEdit.first().waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
        await this.robustClick(actionsEdit.first());
        await fillLabelsModalInput(this.page, label);
        edited = true;
      } catch {
        await this.dismissActionsMenu();
      }
    }

    if (!edited) {
      await this.navigateToMetadataTab();

      const metadataLabelsEdit = this.consoleTestId(`${name}-labels-edit`).or(
        this.labelsEditButton(name),
      );
      try {
        await pollUntil(
          async () =>
            await metadataLabelsEdit
              .first()
              .isVisible()
              .catch(() => false),
          {
            message: `Labels edit control for ${name} should be visible on metadata tab`,
            timeout: TestTimeouts.LONG_OPERATION,
          },
        );
        await this.robustClick(metadataLabelsEdit.first());
      } catch {
        await openResourceLabelsEditor(this.page);
      }
      await fillLabelsModalInput(this.page, label);
    }

    await this.navigateToMetadataTab();
    await pollUntil(
      async () =>
        await this.page
          .getByText(label)
          .first()
          .isVisible()
          .catch(() => false),
      {
        message: `Label ${label} should appear after save`,
        timeout: TestTimeouts.ELEMENT_WAIT,
      },
    );
  }

  editLabelsModalHeading(): Locator {
    return this.page.getByRole('heading', { name: /edit labels/i });
  }

  environmentSectionHeading(): Locator {
    return this.page
      .getByRole('tabpanel', { name: /^Environment$/i })
      .getByText(/Include all values|Environment variables/i)
      .or(
        this.page
          .locator('.VirtualMachineConfigurationTab--body, .VirtualMachineConfigurationTab__body')
          .getByText(/Include all values|Environment variables/i),
      )
      .first();
  }

  eventsMigrationText(): Locator {
    const eventList = this.page.locator(
      '.co-resource-event-list, .co-m-resource-event, [data-test="event-list"]',
    );
    return eventList
      .getByText(/[Mm]igrat/i)
      .first()
      .or(
        this.page
          .locator('main [role="tabpanel"], main .co-m-pane__body')
          .getByText(/[Mm]igrat/i)
          .first(),
      );
  }

  eventsTabContent(): Locator {
    return this.page
      .locator('.co-resource-event-list, .co-m-resource-event, [data-test="event-list"]')
      .or(this.page.getByRole('grid'))
      .or(this.page.getByText(/No events found|Reason|Message/i))
      .first();
  }

  async expandSshAuthorizedKeySectionIfNeeded(): Promise<void> {
    await dismissConsoleObstructions(this.page);
    const panel = this.sshTabPanel();
    await panel
      .locator('[data-test-id="public-ssh-key"]')
      .waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT })
      .catch(() => undefined);
    const toggle = panel.getByRole('button', { name: /Public SSH key/i }).first();
    if (!(await toggle.isVisible().catch(() => false))) {
      return;
    }
    await this.robustClick(toggle);
  }

  async getMigrationPopoverText(popover = this.migrationPopover()): Promise<string> {
    return await popover.innerText({ timeout: 2 * SECOND });
  }

  async getOverviewStatusText(): Promise<string> {
    return (await this.overviewStatus().textContent()) ?? '';
  }

  async goToEnvironmentTab(): Promise<void> {
    const envLink = this.consoleTestId(VmTabTestId.Environment);
    if (await envLink.isVisible().catch(() => false)) {
      await this.navigateToTab(envLink);
      return;
    }
    // release-4.19: Environment editor lives under Configuration → Storage.
    await this.openConfigurationInnerTab('storage');
    await pollUntil(
      async () =>
        await this.page
          .getByRole('button', { name: /Add Config Map, Secret,? or Service Account/i })
          .first()
          .isVisible()
          .catch(() => false),
      {
        message: 'Environment form should load on configuration storage tab',
        timeout: TestTimeouts.LONG_OPERATION,
      },
    );
  }

  async goToInitialRunTab(): Promise<void> {
    await this.openConfigurationInnerTab('initial');
    await this.initialRunCloudInitLabel().waitFor({
      state: 'visible',
      timeout: TestTimeouts.LONG_OPERATION,
    });
  }

  async goToSshTab(): Promise<void> {
    await this.openConfigurationInnerTab('ssh');
  }

  async goToTab(tabId: VmTabTestId): Promise<void> {
    if (tabId === VmTabTestId.Environment) {
      await this.goToEnvironmentTab();
      return;
    }

    const innerKey = this.configurationInnerTabKey(tabId);
    if (innerKey) {
      await this.openConfigurationInnerTab(innerKey);
      return;
    }

    const base = this.vmDetailBasePath();
    const segment = this.vmDetailTabPath(tabId);
    if (base && segment !== undefined) {
      if (!this.onVmDetailTab(tabId, this.page.url())) {
        await this.page.goto(segment ? `${base}/${segment}` : `${base}/`, {
          waitUntil: 'domcontentloaded',
        });
        await pollUntil(async () => this.onVmDetailTab(tabId, this.page.url()), {
          message: `VM detail tab route ${segment || 'overview'}`,
          timeout: TestTimeouts.ELEMENT_WAIT,
        });
      }
      return;
    }

    const tabLink = this.consoleTestId(tabId)
      .or(this.page.getByRole('link', { name: this.tabLinkLabel(tabId) }))
      .first();
    await this.navigateToTab(tabLink);
  }

  /** Opens standalone serial console — popup or same-tab depending on browser policy. */
  async openWebConsoleStandalonePage(): Promise<Page> {
    const button = this.openWebConsoleButton();
    await button.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    const popupPromise = this.page
      .context()
      .waitForEvent('page', { timeout: TestTimeouts.LONG_OPERATION })
      .catch(() => null);
    await button.click({ force: true });
    const popup = await popupPromise;
    if (popup) {
      await popup.waitForLoadState('domcontentloaded').catch(() => undefined);
      return popup;
    }
    await this.page.waitForURL(/\/console\/standalone/, {
      timeout: TestTimeouts.LONG_OPERATION,
    });
    return this.page;
  }

  /** Returns false when this console build has no sidebar YAML on the tab (e.g. legacy top-level Details). */
  async goToTabWithSidebarYamlEditor(tabId: VmTabTestId): Promise<boolean> {
    await this.goToTab(tabId);
    const yamlSwitch = this.page.locator('#sidebar-editor-switch >> visible=true').first();
    if (!(await yamlSwitch.isVisible().catch(() => false))) {
      const innerKey = this.configurationInnerTabKey(tabId);
      if (innerKey) {
        await this.openConfigurationInnerTab(innerKey);
      }
    }
    if (!(await yamlSwitch.isVisible().catch(() => false))) {
      return false;
    }
    await this.waitForSidebarYamlEditorReady();
    return true;
  }

  hostnameLabel(): Locator {
    return this.page.getByText('Hostname').first();
  }

  initialRunCloudInitLabel(): Locator {
    return this.initialRunTabPanel().getByText('Cloud-init', { exact: true });
  }

  initialRunHeading(): Locator {
    return this.initialRunTabPanel().getByRole('heading', { name: /Initial run/i });
  }

  initialRunSysprepLabel(): Locator {
    return this.initialRunTabPanel().getByText('Sysprep', { exact: true });
  }

  initialRunTabPanel(): Locator {
    return this.page.getByRole('tabpanel', { name: /Initial run/i }).filter({ visible: true });
  }

  private migrationMenuItem(): Locator {
    return this.vmActionsMenu()
      .getByRole('menuitem', { name: /^Migration$/i })
      .first();
  }

  /** Actions → Migration flyout (Compute live migrate). */
  private async revealMigrationComputeAction(): Promise<void> {
    const compute = this.page.locator('[data-test-id="vm-action-migrate"]').first();
    if (await compute.isVisible().catch(() => false)) {
      return;
    }
    const migrationItem = this.migrationMenuItem();
    if (!(await migrationItem.isVisible().catch(() => false))) {
      return;
    }
    await migrationItem.hover({ timeout: TestTimeouts.ELEMENT_WAIT }).catch(() => undefined);
    if (!(await compute.isVisible().catch(() => false))) {
      await migrationItem.click({ force: true });
    }
    await this.page.waitForTimeout(300);
    await compute
      .waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT })
      .catch(() => undefined);
  }

  async isMigrateActionEnabledInMenu(): Promise<boolean> {
    await this.openActionsMenu();
    await this.revealMigrationComputeAction();
    const migrate = this.migrateAction().first();
    const enabled =
      (await migrate.isVisible().catch(() => false)) &&
      (await migrate.isEnabled().catch(() => false)) &&
      (await migrate.getAttribute('aria-disabled').catch(() => null)) !== 'true';
    await this.dismissActionsMenu();
    return enabled;
  }

  labelsEditButton(name: string): Locator {
    return this.consoleTestId(`${name}-labels`)
      .getByRole('button', { name: /^Edit$/i })
      .or(this.consoleTestId(`${name}-labels-edit`))
      .or(
        this.page
          .getByRole('tabpanel', { name: /Metadata|Labels and annotations/i })
          .getByRole('button', { name: /^Edit$/i })
          .first(),
      )
      .or(
        this.page
          .locator('dt')
          .filter({ hasText: /^Labels$/ })
          .getByRole('link', { name: 'Edit' }),
      )
      .or(this.page.getByRole('button', { name: /edit labels/i }));
  }

  metadataLabelValue(label: string): Locator {
    return this.page
      .getByRole('tabpanel', { name: /Metadata|Labels and annotations/i })
      .getByText(label)
      .or(this.page.getByText(label))
      .first();
  }

  migrateAction(): Locator {
    return this.vmAction('vm-action-migrate', /^Compute$/i);
  }

  /**
   * Wait until the detail header no longer shows the "Not migratable" label (same signal as Actions → Migration → Compute).
   */
  async waitForConsoleLiveMigratable(
    timeout = TestTimeouts.MIGRATION_VM_READY,
    refreshDetail?: () => Promise<void>,
  ): Promise<void> {
    const reloadIntervalMs = 20 * SECOND;
    let lastReload = Date.now();
    await pollUntil(
      async () => {
        if (refreshDetail && Date.now() - lastReload >= reloadIntervalMs) {
          await refreshDetail();
          lastReload = Date.now();
        }
        if (
          !(await this.overviewStatusWithText('Running')
            .isVisible()
            .catch(() => false))
        ) {
          return false;
        }
        const notMigratable = this.page
          .locator('.migratable-label')
          .or(this.page.getByText('Not migratable'));
        return !(await notMigratable.isVisible().catch(() => false));
      },
      {
        message: 'Console VM detail should show live migratable status',
        timeout,
      },
    );
  }

  async migrateFromActions(options?: {
    refreshDetail?: () => Promise<void>;
    timeout?: number;
  }): Promise<void> {
    const reloadIntervalMs = 20 * SECOND;
    let lastReload = Date.now();
    await pollUntil(
      async () => {
        if (options?.refreshDetail && Date.now() - lastReload >= reloadIntervalMs) {
          await options.refreshDetail();
          lastReload = Date.now();
        }
        await this.openActionsMenu();
        await this.revealMigrationComputeAction();
        const migrate = this.page.locator('[data-test-id="vm-action-migrate"]').first();
        if (!(await migrate.isVisible().catch(() => false))) {
          await this.dismissActionsMenu();
          return false;
        }
        if (!(await migrate.isEnabled().catch(() => false))) {
          await this.dismissActionsMenu();
          return false;
        }
        await migrate.click();
        return true;
      },
      {
        message: 'Migrate action should be enabled in Actions menu',
        timeout: options?.timeout ?? TestTimeouts.MIGRATION_VM_READY,
      },
    );
    const confirm = this.page.getByRole('button', { name: /^Migrate$/ });
    if (await confirm.isVisible({ timeout: 8 * SECOND }).catch(() => false)) {
      await confirm.click();
    }
  }

  /** Prefer Actions → Migration → Compute; fall back to VMIM create when the flyout stays disabled. */
  async startLiveMigrationFromOverview(
    namespace: string,
    name: string,
    api: RequestContextClient,
  ): Promise<void> {
    const refresh = async () => this.reloadVmDetail(namespace, name);
    await this.waitForConsoleLiveMigratable(TestTimeouts.MIGRATION_VM_READY, refresh);
    try {
      await this.migrateFromActions({ timeout: 2 * MINUTE });
    } catch {
      await api.createLiveMigration(namespace, name);
    }
  }

  migrationPopover(): Locator {
    return this.page.locator('.pf-v6-c-popover, .pf-c-popover').filter({
      hasText: /VirtualMachine migration|Migration metrics/i,
    });
  }

  async navigateToDisksTab(): Promise<void> {
    await this.openConfigurationInnerTab('storage');
  }

  async navigateToMetadataTab(): Promise<void> {
    await this.goToTab(VmTabTestId.Metadata);
  }

  async navigateToSchedulingTab(): Promise<void> {
    await this.gotoConfigurationSection('scheduling');
  }

  async navigateToScriptsTab(): Promise<void> {
    await this.goToInitialRunTab();
  }

  async navigateToSnapshotsTab(): Promise<void> {
    await this.goToTab(VmTabTestId.Snapshots);
  }

  /**
   * While migration runs, watch overview for Migrating status and open the progress popover.
   * Returns true when popover content is visible (false if migration finishes before UI updates).
   */
  async observeMigrationPopoverDuringMigration(
    maxWaitMs = TestTimeouts.MIGRATION_COMPLETION,
  ): Promise<boolean> {
    const deadline = Date.now() + maxWaitMs;
    while (Date.now() < deadline) {
      const text = await this.getOverviewStatusText();
      if (/Migrating/i.test(text)) {
        const btn = this.overviewStatus().locator('button');
        if (await btn.isVisible().catch(() => false)) {
          await btn.click();
        }
        const popover = this.migrationPopover();
        if (await popover.isVisible({ timeout: 2 * SECOND }).catch(() => false)) {
          try {
            await this.waitForMigrationPopoverContent(popover);
            return true;
          } catch {
            if (!/Migrating/i.test(await this.getOverviewStatusText())) {
              return false;
            }
          }
        }
      }
      await this.page.waitForTimeout(250);
    }
    return false;
  }

  async openActionsMenu(): Promise<void> {
    await dismissConsoleObstructions(this.page);
    const toggle = this.vmActionsButton();
    await pollUntil(async () => await toggle.isVisible().catch(() => false), {
      message: 'VM detail Actions control should render',
      timeout: TestTimeouts.LONG_OPERATION,
    });
    await toggle.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    if ((await toggle.getAttribute('aria-expanded')) !== 'true') {
      await this.robustClick(toggle);
    }
    await pollUntil(async () => (await toggle.getAttribute('aria-expanded')) === 'true', {
      message: 'VM Actions menu should expand',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
  }

  /** Detail Actions → Delete (avoids flaky namespace list row menus under non-priv / parallel CI). */
  async openDeleteDialogFromActions(): Promise<void> {
    await dismissConsoleObstructions(this.page);
    await this.openActionsMenu();
    const deleteAction = this.deleteAction().first();
    await deleteAction.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await deleteAction.click();
  }

  async openMigrationProgressPopover(): Promise<void> {
    await this.overviewStatus().locator('button').click();
  }

  async openNetworkInterfacesTab(networks: VmNetworkInterfacesPage): Promise<void> {
    await this.goToTab(VmTabTestId.Networks);
    await networks.waitForNetworkTabReady();
  }

  async openVm(namespace: string, name: string): Promise<void> {
    await this.page.goto(`/k8s/ns/${namespace}/kubevirt.io~v1~VirtualMachine/${name}`, {
      waitUntil: 'domcontentloaded',
    });
  }

  /** Reload detail after API status changes so Actions menu picks up LiveMigratable. */
  async reloadVmDetail(namespace: string, name: string): Promise<void> {
    await this.page.goto(`/k8s/ns/${namespace}/kubevirt.io~v1~VirtualMachine/${name}/yaml`, {
      waitUntil: 'domcontentloaded',
    });
    await dismissConsoleObstructions(this.page);
    await this.page.goto(`/k8s/ns/${namespace}/kubevirt.io~v1~VirtualMachine/${name}`, {
      waitUntil: 'domcontentloaded',
    });
    await this.waitForDetailHeadingVmName(name);
    await this.overviewStatusWithText('Running')
      .waitFor({ state: 'visible', timeout: TestTimeouts.VM_RUNNING })
      .catch(() => undefined);
  }

  async openVmAndWaitForDetail(namespace: string, name: string): Promise<void> {
    await this.openVm(namespace, name);
    await this.waitForVmDetailUrl(namespace, name);
    await this.waitForDetailHeadingVmName(name);
  }

  openWebConsoleButton(): Locator {
    return this.page.getByRole('button', { name: /Open web console/i });
  }

  overviewStatus(): Locator {
    return this.consoleTestId('virtual-machine-overview-details-status');
  }

  overviewStatusWithText(status: string): Locator {
    return this.overviewStatus().filter({ hasText: status });
  }

  overviewVncCanvas(): Locator {
    return this.page.locator('.vnc-container canvas').first();
  }

  overviewVncConsoleTitle(): Locator {
    return this.page.getByText('VNC console', { exact: true });
  }

  scriptsCloudInitText(): Locator {
    return this.scriptsConfigurationPanel()
      .getByText(/cloud-init/i)
      .first();
  }

  scriptsConfigurationPanel(): Locator {
    return this.initialRunTabPanel().or(
      this.page.getByRole('tabpanel', { name: /^Scripts$/i }).filter({ visible: true }),
    );
  }

  scriptsTabHeading(): Locator {
    return this.scriptsConfigurationPanel().getByText('Cloud-init', { exact: true });
  }

  snapshotsTabContent(): Locator {
    return this.page.getByText('Take snapshot', { exact: false }).first();
  }

  sshTabPanel(): Locator {
    return this.page.getByRole('tabpanel', { name: /^SSH$/i });
  }

  startAction(): Locator {
    return this.vmAction('vm-action-start', /^Start$/i);
  }

  async startVmFromActions(): Promise<void> {
    const iconStop = this.page.locator('[data-test-id="vm-action-stop-button"]');
    if (
      (await iconStop.isVisible().catch(() => false)) &&
      (await iconStop.isEnabled().catch(() => false))
    ) {
      return;
    }

    const iconStart = this.page.locator('[data-test-id="vm-action-start-button"]');
    if (
      (await iconStart.isVisible().catch(() => false)) &&
      (await iconStart.isEnabled().catch(() => false))
    ) {
      await this.robustClick(iconStart);
      return;
    }

    const start = this.startAction();
    await pollUntil(
      async () => {
        await this.openActionsMenu();
        const startItem = this.page.locator('[data-test-id="vm-action-start"]').first();
        const target = (await startItem.isVisible().catch(() => false)) ? startItem : start;
        if (!(await target.isVisible().catch(() => false))) {
          await this.dismissActionsMenu();
          return false;
        }
        if (!(await target.isEnabled().catch(() => false))) {
          await this.dismissActionsMenu();
          return false;
        }
        await target.click();
        return true;
      },
      {
        message: 'VM Start action should be visible and enabled in Actions menu',
        timeout: TestTimeouts.LONG_OPERATION,
      },
    );
  }

  tabPanelText(match: RegExp | string): Locator {
    return this.page.getByText(match).first();
  }

  tagsInput(): Locator {
    return this.page.locator('#tags-input, [data-test="tags-input"]');
  }

  /** Turn sidebar YAML on (assert content), then off. */
  async toggleYamlSidebarEditor(
    content: 'networkSpec' | 'virtualMachine' = 'virtualMachine',
  ): Promise<void> {
    await this.sidebarYaml.toggle(content);
  }

  virtualMachineDetailsHeading(): Locator {
    return this.tabPanelText('VirtualMachine Details');
  }

  vmDetailUrlPattern(namespace: string, name: string): RegExp {
    return new RegExp(`/ns/${namespace}/kubevirt\\.io~v1~VirtualMachine/${name}`);
  }

  async waitForDetailHeadingVmName(name: string): Promise<void> {
    await pollUntil(async () => ((await this.detailHeading().textContent()) ?? '').includes(name), {
      message: `VM detail heading should include ${name}`,
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
  }

  /**
   * Poll Actions → Migrate until enabled. On congested CI the console watch can lag the API;
   * optionally re-open the VM detail page periodically to refresh status.
   */
  async waitForMigrateActionEnabled(
    timeout = TestTimeouts.MIGRATION_VM_READY,
    refreshDetail?: () => Promise<void>,
  ): Promise<void> {
    const reloadIntervalMs = 20 * SECOND;
    const started = Date.now();
    let lastReload = started;

    while (Date.now() - started < timeout) {
      if (refreshDetail && Date.now() - lastReload >= reloadIntervalMs) {
        await refreshDetail();
        await this.overviewStatusWithText('Running')
          .waitFor({ state: 'visible', timeout: TestTimeouts.VM_RUNNING })
          .catch(() => undefined);
        lastReload = Date.now();
      }

      if (await this.isMigrateActionEnabledInMenu()) {
        return;
      }

      await this.page.waitForTimeout(2 * SECOND);
    }

    throw new Error(
      `Migrate action did not become enabled within ${
        timeout / SECOND
      }s (console may still show LiveMigratable=False or stale status)`,
    );
  }

  async waitForMigrationPopoverContent(popover = this.migrationPopover()): Promise<void> {
    const content = await this.getMigrationPopoverText(popover);
    const required = [/VirtualMachine migration/i, /Phase/i, /Migration metrics/i];
    for (const pattern of required) {
      if (!pattern.test(content)) {
        throw new Error(`Migration popover missing ${pattern}: ${content}`);
      }
    }
  }

  async waitForSidebarYamlEditorReady(): Promise<void> {
    await this.sidebarYaml.waitForReady();
  }

  async waitForVmDetailUrl(namespace: string, name: string): Promise<void> {
    await pollUntil(
      () => Promise.resolve(this.vmDetailUrlPattern(namespace, name).test(this.page.url())),
      {
        message: `VM detail URL should match ${namespace}/${name}`,
        timeout: TestTimeouts.LONG_OPERATION,
      },
    );
  }

  yamlDownloadAction(): Locator {
    return this.tabPanelText('Download');
  }
}
