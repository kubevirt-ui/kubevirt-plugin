import { VmSidebarYamlEditorComponent } from '@/components/vm/vm-sidebar-yaml-editor-component';
import BasePage from '@/page-objects/base-page';
import type { VmNetworkInterfacesPage } from '@/page-objects/vm-network-interfaces-page';
import { VmTabTestId } from '@/utils/constants';
import { pollUntil } from '@/utils/poll-until';
import { fillLabelsModalInput, openResourceLabelsEditor } from '@/utils/resource-summary';
import { SECOND, TestTimeouts } from '@/utils/test-config';
import type { Locator, Page } from '@playwright/test';

export class VmDetailPage extends BasePage {
  private readonly sidebarYaml: VmSidebarYamlEditorComponent;

  constructor(page: Page) {
    super(page);
    this.sidebarYaml = new VmSidebarYamlEditorComponent(page);
  }

  overviewStatus(): Locator {
    return this.consoleTestId('virtual-machine-overview-details-status');
  }

  overviewStatusWithText(status: string): Locator {
    return this.overviewStatus().filter({ hasText: status });
  }

  migrateAction(): Locator {
    return this.consoleTestId('vm-action-migrate');
  }

  migrationPopover(): Locator {
    return this.page.locator('.pf-v6-c-popover, .pf-c-popover').filter({
      hasText: /VirtualMachine migration|Migration metrics/i,
    });
  }

  hostnameLabel(): Locator {
    return this.page.getByText('Hostname').first();
  }

  labelsEditButton(name: string): Locator {
    return this.consoleTestId(`${name}-labels-edit`)
      .or(
        this.page
          .locator('dt')
          .filter({ hasText: /^Labels$/ })
          .getByRole('link', { name: 'Edit' }),
      )
      .or(this.page.getByRole('button', { name: /edit labels/i }));
  }

  editLabelsModalHeading(): Locator {
    return this.page.getByRole('heading', { name: /edit labels/i });
  }

  tagsInput(): Locator {
    return this.page.locator('#tags-input, [data-test="tags-input"]');
  }

  tabPanelText(match: string | RegExp): Locator {
    return this.page.getByText(match).first();
  }

  eventsTabContent(): Locator {
    return this.page
      .locator('.co-resource-event-list, .co-m-resource-event, [data-test="event-list"]')
      .or(this.page.getByRole('grid'))
      .or(this.page.getByText(/No events found|Reason|Message/i))
      .first();
  }

  consoleTabContent(): Locator {
    return this.page
      .getByRole('button', { name: /Send key|Disconnect/i })
      .or(this.page.getByText(/VNC console|VirtualMachine is down|Connected/i))
      .first();
  }

  detailHeading(): Locator {
    return this.page.getByRole('heading', { level: 1 });
  }

  scriptsConfigurationPanel(): Locator {
    return this.page
      .locator('[data-test="vm-configuration-initial"]')
      .or(this.page.getByRole('tabpanel', { name: /^Scripts$/i }));
  }

  scriptsTabHeading(): Locator {
    return this.scriptsConfigurationPanel().getByRole('heading', { name: /Scripts/i });
  }

  scriptsCloudInitText(): Locator {
    return this.scriptsConfigurationPanel()
      .getByText(/cloud-init/i)
      .first();
  }

  async openVm(namespace: string, name: string): Promise<void> {
    await this.page.goto(`/k8s/ns/${namespace}/kubevirt.io~v1~VirtualMachine/${name}`, {
      waitUntil: 'domcontentloaded',
    });
  }

  vmDetailUrlPattern(namespace: string, name: string): RegExp {
    return new RegExp(`/ns/${namespace}/kubevirt\\.io~v1~VirtualMachine/${name}`);
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

  async waitForDetailHeadingVmName(name: string): Promise<void> {
    await pollUntil(async () => ((await this.detailHeading().textContent()) ?? '').includes(name), {
      message: `VM detail heading should include ${name}`,
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
  }

  async openVmAndWaitForDetail(namespace: string, name: string): Promise<void> {
    await this.openVm(namespace, name);
    await this.waitForVmDetailUrl(namespace, name);
    await this.waitForDetailHeadingVmName(name);
  }

  /** Inner `VirtualMachineConfigurationTab` keys (`data-test="vm-configuration-*"`). */
  private configurationInnerTabKey(tabId: VmTabTestId): string | undefined {
    const inner: Partial<Record<VmTabTestId, string>> = {
      [VmTabTestId.Details]: 'details',
      [VmTabTestId.Metadata]: 'metadata',
      [VmTabTestId.Scheduling]: 'scheduling',
      [VmTabTestId.Networks]: 'network',
      [VmTabTestId.Disks]: 'storage',
      [VmTabTestId.Scripts]: 'initial',
    };
    return inner[tabId];
  }

  private legacyConfigurationSubTab(innerKey: string): Locator | undefined {
    const labels: Record<string, RegExp> = {
      scheduling: /Scheduling/i,
      network: /Network interfaces/i,
      storage: /Disks/i,
      initial: /Scripts/i,
      environment: /^Environment$/i,
      metadata: /Labels and annotations|Metadata/i,
    };
    const pattern = labels[innerKey];
    return pattern ? this.page.getByRole('tab', { name: pattern }) : undefined;
  }

  private configurationLocationMatches(innerKey: string, url: string): boolean {
    const path = url.split('?')[0] ?? url;
    if (path.includes(`/configurations/${innerKey}`)) {
      return true;
    }
    const hash = path.includes('#') ? path.slice(path.indexOf('#') + 1).split('/')[0] : '';
    const hashAliases: Record<string, string[]> = {
      network: ['network', 'network-interfaces'],
      storage: ['storage', 'disks'],
      initial: ['initial', 'scripts'],
      scheduling: ['scheduling'],
      environment: ['environment'],
      details: ['details'],
    };
    const fragments = hashAliases[innerKey] ?? [innerKey];
    return fragments.includes(hash);
  }

  private vmDetailBasePath(): string | undefined {
    const match = this.page.url().match(/(.*\/kubevirt\.io~v1~VirtualMachine\/[^/]+)(?:\/|$)/);
    return match?.[1];
  }

  private configurationTabLink(): Locator {
    return this.consoleTestId(VmTabTestId.Configuration)
      .or(this.consoleTestId('horizontal-link-configuration'))
      .or(this.page.getByRole('link', { name: /^Configuration$/i }));
  }

  private configurationInnerTab(innerKey: string): Locator {
    return this.page.locator(`[data-test="vm-configuration-${innerKey}"]`);
  }

  private async openConfigurationParent(): Promise<void> {
    const base = this.vmDetailBasePath();
    if (!base) {
      throw new Error(
        `Cannot open configuration tab — not on a VM detail URL (${this.page.url()})`,
      );
    }
    if (this.page.url().includes('/configurations')) {
      return;
    }
    const configTab = this.configurationTabLink();
    if (
      await configTab
        .first()
        .isVisible()
        .catch(() => false)
    ) {
      await this.navigateToTab(configTab.first());
      return;
    }
    await this.page.goto(`${base}/configurations`, { waitUntil: 'domcontentloaded' });
  }

  private async openConfigurationInnerTab(innerKey: string): Promise<void> {
    const base = this.vmDetailBasePath();
    if (!base) {
      throw new Error(
        `Cannot open configuration tab — not on a VM detail URL (${this.page.url()})`,
      );
    }

    if (!this.configurationLocationMatches(innerKey, this.page.url())) {
      await this.openConfigurationParent();
    }

    const legacyTab = this.legacyConfigurationSubTab(innerKey);
    const innerTab = this.configurationInnerTab(innerKey);
    if (await innerTab.isVisible().catch(() => false)) {
      await this.navigateToTab(innerTab);
    } else if (legacyTab && (await legacyTab.isVisible().catch(() => false))) {
      await this.navigateToTab(legacyTab);
    } else {
      await this.page.goto(`${base}/configurations/${innerKey}`, {
        waitUntil: 'domcontentloaded',
      });
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

  async goToTab(tabId: VmTabTestId): Promise<void> {
    if (tabId === VmTabTestId.Environment) {
      await this.goToEnvironmentTab();
      return;
    }

    const direct = this.consoleTestId(tabId);
    if (await direct.isVisible().catch(() => false)) {
      await this.navigateToTab(direct);
      return;
    }

    const innerKey = this.configurationInnerTabKey(tabId);
    if (innerKey) {
      await this.openConfigurationInnerTab(innerKey);
      return;
    }

    const byLabel = this.page.getByRole('link', { name: this.tabLinkLabel(tabId) });
    if (await byLabel.isVisible().catch(() => false)) {
      await this.navigateToTab(byLabel);
      return;
    }

    await this.navigateToTab(direct);
  }

  environmentSectionHeading(): Locator {
    return this.page
      .getByRole('tabpanel', { name: /^Environment$/i })
      .getByText(/Include all values|Environment variables/i)
      .or(
        this.page
          .locator('.VirtualMachineConfigurationTab__body')
          .getByText(/Include all values|Environment variables/i),
      )
      .first();
  }

  async goToEnvironmentTab(): Promise<void> {
    const envLink = this.consoleTestId(VmTabTestId.Environment);
    if (await envLink.isVisible().catch(() => false)) {
      await this.navigateToTab(envLink);
      return;
    }
    await this.openConfigurationInnerTab('environment');
  }

  private tabLinkLabel(tabId: VmTabTestId): RegExp {
    const labels: Partial<Record<VmTabTestId, RegExp>> = {
      [VmTabTestId.Scheduling]: /Scheduling/i,
      [VmTabTestId.Networks]: /Network/i,
      [VmTabTestId.Disks]: /Disks|Storage/i,
      [VmTabTestId.Details]: /^Details$/i,
      [VmTabTestId.Environment]: /Environment/i,
      [VmTabTestId.Configuration]: /Configuration/i,
    };
    return labels[tabId] ?? new RegExp(tabId.replace('horizontal-link-', ''), 'i');
  }

  async openNetworkInterfacesTab(networks: VmNetworkInterfacesPage): Promise<void> {
    await this.goToTab(VmTabTestId.Networks);
    await networks.waitForNetworkTabReady();
  }

  async openActionsMenu(): Promise<void> {
    await this.robustClick(
      this.consoleTestId('virtual-machine-actions').getByRole('button', { name: 'Actions' }),
    );
  }

  async dismissActionsMenu(): Promise<void> {
    await this.page.keyboard.press('Escape');
  }

  async startVmFromActions(): Promise<void> {
    await this.openActionsMenu();
    await this.robustClick(this.consoleTestId('vm-action-start'));
  }

  async migrateFromActions(): Promise<void> {
    await this.openActionsMenu();
    await pollUntil(async () => await this.migrateAction().isEnabled(), {
      message: 'Migrate action should be enabled',
      timeout: 30 * SECOND,
    });
    await this.migrateAction().click();
    const confirm = this.page.getByRole('button', { name: /^Migrate$/ });
    if (await confirm.isVisible({ timeout: 8 * SECOND }).catch(() => false)) {
      await confirm.click();
    }
  }

  async isMigrateActionEnabledInMenu(): Promise<boolean> {
    await this.openActionsMenu();
    const enabled = await this.migrateAction()
      .isEnabled()
      .catch(() => false);
    await this.dismissActionsMenu();
    return enabled;
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
      if (await this.isMigrateActionEnabledInMenu()) {
        return;
      }

      if (refreshDetail && Date.now() - lastReload >= reloadIntervalMs) {
        await refreshDetail();
        await this.overviewStatusWithText('Running')
          .waitFor({ state: 'visible', timeout: TestTimeouts.VM_RUNNING })
          .catch(() => undefined);
        lastReload = Date.now();
      }

      await this.page.waitForTimeout(2 * SECOND);
    }

    throw new Error(
      `Migrate action did not become enabled within ${
        timeout / SECOND
      }s (console may still show LiveMigratable=False or stale status)`,
    );
  }

  async getOverviewStatusText(): Promise<string> {
    return (await this.overviewStatus().textContent()) ?? '';
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

  async getMigrationPopoverText(popover = this.migrationPopover()): Promise<string> {
    return await popover.innerText({ timeout: 2 * SECOND });
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

  async openMigrationProgressPopover(): Promise<void> {
    await this.overviewStatus().locator('button').click();
  }

  async editLabels(name: string, label: string): Promise<void> {
    await this.waitForDetailHeadingVmName(name);

    const actionsEdit = this.page.getByRole('menuitem', { name: /^Edit labels$/i });
    if (
      await this.consoleTestId('virtual-machine-actions')
        .isVisible()
        .catch(() => false)
    ) {
      await this.openActionsMenu();
      if (await actionsEdit.isVisible().catch(() => false)) {
        await actionsEdit.click();
        await fillLabelsModalInput(this.page, label);
        return;
      }
      await this.dismissActionsMenu();
    }

    if (
      await this.configurationTabLink()
        .first()
        .isVisible()
        .catch(() => false)
    ) {
      await this.goToTab(VmTabTestId.Metadata);
    } else {
      const base = this.vmDetailBasePath();
      if (base) {
        await this.page.goto(`${base}/configurations/metadata`, { waitUntil: 'domcontentloaded' });
      } else {
        await this.goToTab(VmTabTestId.Details);
      }
    }
    const metadataLabelsAdd = this.page.locator('[data-test="labels-add-btn"]');
    await metadataLabelsAdd
      .waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT })
      .catch(() => undefined);
    if (await metadataLabelsAdd.isVisible().catch(() => false)) {
      await this.robustClick(metadataLabelsAdd);
      await fillLabelsModalInput(this.page, label);
      return;
    }

    const editBtn = this.labelsEditButton(name);
    if (
      await editBtn
        .first()
        .isVisible()
        .catch(() => false)
    ) {
      await this.robustClick(editBtn.first());
    } else {
      await openResourceLabelsEditor(this.page);
    }
    await fillLabelsModalInput(this.page, label);
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

  async waitForSidebarYamlEditorReady(): Promise<void> {
    await this.sidebarYaml.waitForReady();
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

  /** Turn sidebar YAML on (assert content), then off. */
  async toggleYamlSidebarEditor(
    content: 'virtualMachine' | 'networkSpec' = 'virtualMachine',
  ): Promise<void> {
    await this.sidebarYaml.toggle(content);
  }
}
