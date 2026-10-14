import { VmSidebarYamlEditorComponent } from '@/components/vm/vm-sidebar-yaml-editor-component';
import BasePage from '@/page-objects/base-page';
import type { VmNetworkInterfacesPage } from '@/page-objects/vm-network-interfaces-page';
import { VmTabTestId } from '@/utils/constants';
import { fillLabelsModalInput, openResourceLabelsEditor } from '@/utils/resource-summary';
import { SECOND, TestTimeouts } from '@/utils/test-config';
import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

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
    return this.page
      .locator('.pf-v6-c-popover, .pf-c-popover')
      .filter({ hasText: /VirtualMachine migration/i });
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

  async openVm(namespace: string, name: string): Promise<void> {
    await this.page.goto(`/k8s/ns/${namespace}/kubevirt.io~v1~VirtualMachine/${name}`, {
      waitUntil: 'domcontentloaded',
    });
  }

  async expectOnVmDetail(namespace: string, name: string): Promise<void> {
    await expect(this.page).toHaveURL(
      new RegExp(`/ns/${namespace}/kubevirt\\.io~v1~VirtualMachine/${name}`),
      { timeout: TestTimeouts.LONG_OPERATION },
    );
  }

  async expectDetailHeadingContainsVmName(name: string): Promise<void> {
    await expect(this.detailHeading()).toContainText(name, {
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
  }

  async openVmAndExpectDetail(namespace: string, name: string): Promise<void> {
    await this.openVm(namespace, name);
    await this.expectOnVmDetail(namespace, name);
    await this.expectDetailHeadingContainsVmName(name);
  }

  async goToTab(tabId: VmTabTestId): Promise<void> {
    await this.navigateToTab(this.consoleTestId(tabId));
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
    await expect(this.migrateAction()).toBeEnabled({ timeout: 30 * SECOND });
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
        await expect(this.overviewStatusWithText('Running'))
          .toBeVisible({
            timeout: TestTimeouts.VM_RUNNING,
          })
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
            await this.assertMigrationPopoverContent(popover);
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

  async assertMigrationPopoverContent(popover = this.migrationPopover()): Promise<void> {
    const content = await popover.innerText({ timeout: 2 * SECOND });
    expect(content).toMatch(/VirtualMachine migration/i);
    expect(content).toMatch(/Phase/i);
    expect(content).toMatch(/Migration metrics/i);
  }

  async openMigrationProgressPopover(): Promise<void> {
    await this.overviewStatus().locator('button').click();
  }

  async editLabels(_name: string, label: string): Promise<void> {
    await openResourceLabelsEditor(this.page);
    await fillLabelsModalInput(this.page, label);
  }

  eventsMigrationText(): Locator {
    return this.page.getByText(/[Mm]igration/).first();
  }

  async waitForSidebarYamlEditorReady(): Promise<void> {
    await this.sidebarYaml.waitForReady();
  }

  async goToTabWithSidebarYamlEditor(tabId: VmTabTestId): Promise<void> {
    await this.goToTab(tabId);
    await this.waitForSidebarYamlEditorReady();
  }

  /** Turn sidebar YAML on (assert content), then off. */
  async toggleYamlSidebarEditor(
    content: 'virtualMachine' | 'networkSpec' = 'virtualMachine',
  ): Promise<void> {
    await this.sidebarYaml.toggle(content);
  }
}
