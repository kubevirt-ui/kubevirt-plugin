import type RequestContextClient from '@/clients/request-context-client';
import FilterToolbarComponent from '@/components/shared/filter-toolbar-component';
import BasePage from '@/page-objects/base-page';
import type { VmListPage } from '@/page-objects/vm-list-page';
import { dismissConsoleObstructions } from '@/utils/console-modals';
import { ConsoleRoutes } from '@/utils/console-routes';
import { CatalogReviewTabTestId, DEFAULT_RED_HAT_INSTANCE_TYPE_SERIES } from '@/utils/constants';
import { EnvVariables } from '@/utils/env-variables';
import { waitForConsoleRouteReady } from '@/utils/instance-types-policy';
import { pollUntil } from '@/utils/poll-until';
import { SECOND, TestTimeouts } from '@/utils/test-config';
import type { Download, Frame, Locator, Page } from '@playwright/test';

/** VM creation wizard (`/vm-wizard` on 4.22+) — template step, customize/review, instance-type flows. */
export class VmWizardPage extends BasePage {
  private readonly catalogFilterToolbar: FilterToolbarComponent;

  readonly filterTextSelector =
    '#filter-text-input, [data-test="search-catalog"] input, [placeholder*="Filter by keyword"]';

  readonly gridSelector = '#vm-catalog-grid, .vm-catalog-grid, .co-catalog-page__grid';
  constructor(page: Page) {
    super(page);
    this.catalogFilterToolbar = new FilterToolbarComponent(page);
  }

  private async activateUserProvidedInstanceTypeTab(): Promise<void> {
    const tab = this.instanceTypesUserProvidedTab();
    await this.robustClick(tab);
    await pollUntil(async () => (await tab.getAttribute('aria-selected')) === 'true', {
      message: 'User provided InstanceType tab should be selected',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
  }

  private bootableVolumeSection(): Locator {
    return this.page.getByRole('listitem').filter({ hasText: /Select volume to boot from/i });
  }

  /** Drawer storage customize (disk size + PVC clone live outside `disk-boot-source` test id). */
  private catalogDiskCustomizeScope(): Locator {
    return this.templateDrawer().or(
      this.page.locator('.storage-section__customize-source, .customize-vm'),
    );
  }

  /** Create stays disabled until volume, series/size, and name validate — dismiss preview modals while waiting. */
  private async clickInstanceTypeCreateWhenReady(bootVolumeName?: string): Promise<void> {
    const create = this.instanceTypeCreateVirtualMachineButton();
    await pollUntil(
      async () => {
        await this.acceptInstanceTypesDeveloperPreviewIfPrompted();
        if (bootVolumeName && !(await create.isEnabled())) {
          await this.ensureBootableVolumeSelectedForInstanceTypes(bootVolumeName).catch(
            () => undefined,
          );
        }
        if (!(await create.isEnabled())) {
          return false;
        }
        try {
          await create.click({ timeout: TestTimeouts.ELEMENT_WAIT });
          return true;
        } catch {
          return false;
        }
      },
      {
        intervalMs: 750,
        message: 'Create VirtualMachine should be enabled and clickable',
        timeout: TestTimeouts.LONG_OPERATION,
      },
    );
  }

  private async clickQuickCreateSubmit(scope: Locator): Promise<void> {
    await pollUntil(async () => (await this.findEnabledQuickCreateSubmit(scope)) !== undefined, {
      message: 'Quick create VirtualMachine submit button did not become enabled',
      timeout: TestTimeouts.LONG_OPERATION,
    });
    const submit = await this.findEnabledQuickCreateSubmit(scope);
    if (!submit) {
      throw new Error('Quick create VirtualMachine submit button did not become enabled');
    }
    await this.robustClick(submit);
  }

  private async confirmQuickCreateBootSourceAndWaitForVm(): Promise<void> {
    const noBs = this.page.getByRole('button', { name: 'Create with no available boot source' });
    if (await noBs.isVisible({ timeout: 3 * SECOND }).catch(() => false)) {
      await noBs.click();
    }
    await this.waitForVirtualMachineDetailUrl();
  }

  private async createVmFromTemplateDrawerCustomize(vmName: string): Promise<void> {
    await this.ensureQuickCreateNameInputVisible();
    await this.fillCustomizeVmName(vmName);
    await this.openCustomizeWizard();
    if (
      !(await this.reviewWizardHeading()
        .isVisible()
        .catch(() => false))
    ) {
      await this.fillCustomizeVmName(vmName);
      await this.submitCustomizeToReview();
    }
    await this.createVirtualMachineFromReview();
  }

  private customizeStepReady(): Locator {
    return this.customizePageHeading()
      .or(this.page.locator('.customize-vm'))
      .or(this.reviewWizardHeading())
      .first();
  }

  private drawerQuickCreateSubmitButton(): Locator {
    return this.templateDrawer().getByTestId('quick-create-vm-btn');
  }

  /** Quick-create heading can render before the name field; wait or re-open the modal. */
  private async ensureQuickCreateNameInputVisible(): Promise<void> {
    if (await this.isQuickCreateNameInputVisible()) {
      return;
    }
    if (
      await this.customizePageHeading()
        .isVisible()
        .catch(() => false)
    ) {
      return;
    }
    await this.openLegacyQuickCreateModal();
    await pollUntil(() => this.isQuickCreateNameInputVisible(), {
      intervalMs: 500,
      message: 'Quick create VM name input did not become visible',
      timeout: TestTimeouts.LONG_OPERATION,
    });
  }

  private async ensureTemplateDrawerStorageExpanded(): Promise<void> {
    const drawer = this.templateDrawer();
    if (!(await drawer.isVisible().catch(() => false))) {
      return;
    }
    const storage = drawer.getByRole('button', { name: /^Storage$/i });
    if ((await storage.getAttribute('aria-expanded').catch(() => null)) === 'false') {
      await this.robustClick(storage);
    }
  }

  private async findEnabledQuickCreateSubmit(scope: Locator): Promise<Locator | undefined> {
    const drawerSubmit = this.drawerQuickCreateSubmitButton();
    if (
      (await drawerSubmit.isVisible().catch(() => false)) &&
      (await drawerSubmit.isEnabled().catch(() => false))
    ) {
      return drawerSubmit;
    }
    const submits = this.quickCreateSubmitButtons(scope);
    const count = await submits.count();
    for (let i = count - 1; i >= 0; i--) {
      const candidate = submits.nth(i);
      if (
        (await candidate.isVisible().catch(() => false)) &&
        (await candidate.isEnabled().catch(() => false))
      ) {
        return candidate;
      }
    }
    return undefined;
  }

  private async findReviewWizardCreateButton(): Promise<Locator | undefined> {
    for (const frame of this.page.frames()) {
      const footer = this.reviewWizardFooterInFrame(frame);
      if ((await footer.count()) === 0) {
        continue;
      }
      const scopedFooter = footer.first();
      const inWrapper = scopedFooter
        .locator('[data-test-id="create-virtual-machine"] button')
        .filter({ hasText: /^Create VirtualMachine$/i });
      if ((await inWrapper.count()) > 0) {
        return inWrapper.first();
      }
      const inFooter = scopedFooter
        .locator('button')
        .filter({ hasText: /^Create VirtualMachine$/i });
      if ((await inFooter.count()) > 0) {
        return inFooter.first();
      }
    }
    // 4.23 `/vm-wizard` Review: Create lives in the PF wizard footer action list.
    const wizardCreate = this.page
      .locator('.vm-creation-wizard .pf-v6-c-wizard__footer, .vm-creation-wizard')
      .getByRole('button', { name: /^Create VirtualMachine$/i })
      .first();
    if (await wizardCreate.isVisible().catch(() => false)) {
      return wizardCreate;
    }
    return undefined;
  }

  private instanceTypeDetailsSection(): Locator {
    return this.page.getByRole('listitem').filter({ hasText: /VirtualMachine details/i });
  }

  private async instanceTypesCatalogOperatingSystemVisible(): Promise<boolean> {
    const details = this.instanceTypeDetailsSection();
    const osDefinition = details
      .locator('dt')
      .filter({ hasText: /^Operating system$/i })
      .locator('xpath=following-sibling::dd[1]');
    const text = (await osDefinition.textContent().catch(() => ''))?.trim() ?? '';
    return text.length > 0 && text !== '-';
  }

  private async isBootVolumeSelectedForInstanceTypes(volumeName: string): Promise<boolean> {
    if (await this.instanceTypesCatalogOperatingSystemVisible()) {
      return true;
    }
    const row = this.bootableVolumeRowForInstanceTypes(volumeName);
    if (!(await row.isVisible().catch(() => false))) {
      return false;
    }
    if ((await row.getAttribute('aria-selected')) === 'true') {
      return true;
    }
    return await row.evaluate((el) => el.classList.contains('pf-m-selected')).catch(() => false);
  }

  private async isQuickCreateNameInputVisible(): Promise<boolean> {
    return this.quickCreateVmNameInputCandidates()
      .first()
      .isVisible()
      .catch(() => false);
  }

  private async isVmWizardRouteUnavailable(): Promise<boolean> {
    const wizardShell = this.page.locator(
      '.vm-creation-wizard, .pf-v6-c-wizard.vm-creation-wizard',
    );
    const missing = this.vmWizardRouteMissingHeading();
    const notFound = this.page.getByRole('heading', { name: /404: Page Not Found/i });
    const deadline = Date.now() + 15 * SECOND;
    while (Date.now() < deadline) {
      if (await wizardShell.first().isVisible().catch(() => false)) {
        return false;
      }
      if (await missing.isVisible().catch(() => false)) {
        return true;
      }
      if (
        await this.page
          .getByText(/doesn't have a resource type "vm-wizard"/i)
          .isVisible()
          .catch(() => false)
      ) {
        return true;
      }
      if (await notFound.isVisible().catch(() => false)) {
        return true;
      }
      await this.page.waitForTimeout(250);
    }
    // Still on `/vm-wizard` without a 404 — treat as loading, not unavailable (avoids
    // bouncing to `/catalog` which 404s on this console).
    if (this.isVmWizardCatalogRoute() && !(await notFound.isVisible().catch(() => false))) {
      return false;
    }
    return true;
  }

  private legacyQuickCreateDialog(): Locator {
    return this.page.getByRole('dialog').filter({ has: this.legacyQuickCreateModalHeading() });
  }

  /** Footer/modal submit — not the toolbar opener (`quick-create-vm-btn`). */
  private quickCreateSubmitButtons(scope: Locator): Locator {
    return scope
      .getByRole('button', { name: /^Quick create VirtualMachine$/i })
      .filter({ hasNot: this.quickCreateButton() });
  }

  private quickCreateSubmitScope(): Locator {
    return this.legacyQuickCreateDialog().or(this.templateDrawer()).or(this.page.locator('main'));
  }

  private quickCreateVmNameInputCandidates(): Locator {
    return this.page
      .locator('[data-test-id="template-catalog-vm-name-input"]')
      .or(
        this.legacyQuickCreateDialog().getByRole('textbox', {
          name: /virtualmachine name/i,
        }),
      )
      .or(this.templateDrawer().getByRole('textbox', { name: /virtualmachine name/i }))
      .or(this.page.getByRole('textbox', { name: /virtualmachine name/i }))
      .or(this.locator('#vm-customize-NAME'))
      .or(this.consoleTestId('vm-name-input'));
  }

  private async resolveQuickCreateVmNameInput(): Promise<Locator> {
    const input = this.quickCreateVmNameInputCandidates().first();
    await input.waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    return input;
  }

  private async resolveVmNameInputForFill(): Promise<Locator> {
    if (
      (await this.customizePageHeading()
        .isVisible()
        .catch(() => false)) ||
      /templatescatalog\/customize/.test(this.page.url())
    ) {
      const input = this.customizeNameInput();
      await input.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      return input;
    }
    return this.resolveQuickCreateVmNameInput();
  }

  private async reviewWizardFooterAttached(): Promise<boolean> {
    for (const frame of this.page.frames()) {
      // Legacy template review uses `.vm-wizard-footer`; 4.23 `/vm-wizard` uses PF wizard footer.
      if ((await this.reviewWizardFooterInFrame(frame).count()) > 0) {
        return true;
      }
    }
    return await this.page
      .locator('.vm-creation-wizard .pf-v6-c-wizard__footer')
      .getByRole('button', { name: /^Create VirtualMachine$/i })
      .isVisible()
      .catch(() => false);
  }

  private reviewWizardFooterInFrame(frame: Frame): Locator {
    return frame
      .locator('.vm-wizard-footer')
      .or(frame.locator('.vm-creation-wizard .pf-v6-c-wizard__footer'))
      .or(frame.locator('.pf-v6-c-wizard.vm-creation-wizard .pf-v6-c-wizard__footer'));
  }

  private templateDrawer(): Locator {
    // Wizard Template step uses PatternFly DrawerPanelContent (no dialog name).
    return this.page
      .locator('.template-catalog-drawer')
      .or(this.page.getByRole('dialog', { name: /Template drawer/i }));
  }

  private templateDrawerCustomizeButton(): Locator {
    return this.templateDrawer()
      .getByTestId('customize-vm-btn')
      .or(this.templateDrawer().getByRole('button', { name: /^Customize VirtualMachine$/i }));
  }

  private templateDrawerQuickCreateButton(): Locator {
    return this.templateDrawer().getByRole('button', { name: /^Quick create VirtualMachine$/i });
  }

  private templateGridLinks(): Locator {
    return this.page.locator(
      [
        '#vm-catalog-grid a',
        '.vm-catalog-grid a',
        '.vm-catalog-grid-tile',
        '.vm-catalog-grid .templates-catalog-tile',
        '.templates-catalog-tile',
        '.templates-catalog-tile a',
        '[role="tabpanel"][aria-label*="Template catalog"] a',
        '[role="tabpanel"][aria-label*="Template catalog"] .vm-catalog-grid-tile',
      ].join(', '),
    );
  }

  private async tryCreateVmFromTemplateDrawerCustomize(vmName: string): Promise<boolean> {
    if (
      !(await this.templateDrawer()
        .isVisible()
        .catch(() => false))
    ) {
      return false;
    }
    if (await this.waitForDrawerQuickCreateEnabled(5 * SECOND)) {
      return false;
    }
    if (
      !(await this.templateDrawerCustomizeButton()
        .isVisible()
        .catch(() => false))
    ) {
      return false;
    }
    await this.createVmFromTemplateDrawerCustomize(vmName);
    return true;
  }

  private async tryQuickCreateInTemplateDrawer(
    vmName: string,
    folderName?: string,
  ): Promise<boolean> {
    const drawer = this.templateDrawer();
    await drawer
      .waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT })
      .catch(() => undefined);
    if (!(await drawer.isVisible().catch(() => false))) {
      return false;
    }
    const hasQuickCreateUi =
      (await this.legacyQuickCreateModalHeading()
        .isVisible()
        .catch(() => false)) ||
      (await this.templateDrawerQuickCreateButton()
        .isVisible()
        .catch(() => false));
    if (!hasQuickCreateUi) {
      return false;
    }
    await this.ensureQuickCreateNameInputVisible();
    await this.fillCustomizeVmName(vmName);
    if (folderName) {
      await this.selectOrCreateFolderInScope(drawer, folderName);
    }
    if (!(await this.waitForDrawerQuickCreateEnabled())) {
      return false;
    }
    await this.robustClick(this.drawerQuickCreateSubmitButton());
    await this.confirmQuickCreateBootSourceAndWaitForVm();
    return true;
  }

  /**
   * Guest OS tiles filter boot volumes: RHEL → rhel*, Other Linux → fedora/centos.
   * Confirmed via playwright-cli on uit-423 (RHEL shows only rhel10; Other Linux only fedora).
   */
  private guestOsTileForBootVolume(volumeName: string): 'OTHER_LINUX' | 'RHEL' | 'WINDOWS' {
    if (/win|windows/i.test(volumeName)) {
      return 'WINDOWS';
    }
    if (/fedora|centos|ubuntu|debian|other.?linux/i.test(volumeName)) {
      return 'OTHER_LINUX';
    }
    return 'RHEL';
  }

  private async trySelectBootableVolumeForInstanceTypes(volumeName: string): Promise<boolean> {
    await this.acceptInstanceTypesDeveloperPreviewIfPrompted();
    const guestOs = this.guestOsTileForBootVolume(volumeName);
    const guestTile = this.guestOsTile(guestOs);
    if (await guestTile.isVisible().catch(() => false)) {
      const current = (
        await this.page.locator('.pf-v6-c-wizard__nav-link.pf-m-current').allTextContents()
      ).join(' ');
      const inlineProbe = this.bootableVolumeRowForInstanceTypes(volumeName);
      if (!(await inlineProbe.isVisible().catch(() => false))) {
        if (/Boot source/i.test(current)) {
          await this.page.getByRole('button', { name: /^Guest OS$/i }).click().catch(() => undefined);
          await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
        }
        if (await guestTile.isVisible().catch(() => false)) {
          await guestTile.click();
          const next = this.wizardNextButton();
          if (!(await next.isDisabled().catch(() => true))) {
            await next.click({ force: true }).catch(() => undefined);
            await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
          } else {
            await this.page
              .getByRole('button', { name: /^Boot source$/i })
              .click()
              .catch(() => undefined);
            await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
          }
        }
      }
    }
    await this.bootableVolumeSection().scrollIntoViewIfNeeded().catch(() => undefined);
    const pattern = new RegExp(volumeName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const inlineRow = this.bootableVolumeRowForInstanceTypes(volumeName);
    if (await inlineRow.isVisible().catch(() => false)) {
      await this.robustClick(inlineRow);
      if (await this.isBootVolumeSelectedForInstanceTypes(volumeName)) {
        return true;
      }
    }
    const showAll = this.bootableVolumeSection().getByRole('button', { name: /^Show all$/i });
    if (!(await showAll.isVisible().catch(() => false))) {
      return false;
    }
    await this.robustClick(showAll);
    const modal = this.page.getByRole('dialog').filter({ hasText: /Available volumes/i });
    await modal.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    const modalRow = modal.getByRole('row').filter({ hasText: pattern }).first();
    if (!(await modalRow.isVisible().catch(() => false))) {
      await this.page.keyboard.press('Escape').catch(() => undefined);
      return false;
    }
    await this.robustClick(modalRow);
    const select = modal.getByRole('button', { name: /^Select$/i });
    await pollUntil(async () => await select.isEnabled(), {
      message: 'Available volumes Select should enable after choosing a row',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await this.robustClick(select);
    await modal
      .waitFor({ state: 'hidden', timeout: TestTimeouts.LONG_OPERATION })
      .catch(() => undefined);
    return await this.isBootVolumeSelectedForInstanceTypes(volumeName);
  }

  private vmNameFromCurrentUrl(): string {
    return this.page.url().match(/VirtualMachine\/([^/?#]+)/)?.[1] ?? '';
  }

  private vmWizardRouteMissingHeading(): Locator {
    return this.page.getByText(/doesn't have a resource type "vm-wizard"/i);
  }

  /** Drawer quick-create stays disabled until console `useK8sModels()` resolves (often slow/missing for non-priv). */
  private async waitForDrawerQuickCreateEnabled(timeoutMs = 90 * SECOND): Promise<boolean> {
    const submit = this.drawerQuickCreateSubmitButton();
    try {
      await pollUntil(async () => await submit.isEnabled().catch(() => false), {
        message: 'Template drawer quick create submit is not enabled',
        timeout: timeoutMs,
      });
      return true;
    } catch {
      return false;
    }
  }

  /** SPA create often updates the URL without a navigation `load` event — poll the URL. */
  private async waitForVirtualMachineDetailUrl(
    timeout = TestTimeouts.LONG_OPERATION,
  ): Promise<string> {
    let vmName = '';
    await pollUntil(
      async () => {
        const match = this.page.url().match(/kubevirt\.io~v1~VirtualMachine\/([^/?#]+)/);
        if (!match?.[1]) {
          return false;
        }
        vmName = match[1];
        return true;
      },
      {
        message: 'Console should navigate to VirtualMachine detail after create',
        timeout,
      },
    );
    return vmName;
  }

  private async waitForVmNameFieldToSettle(input: Locator): Promise<void> {
    let lastValue = '';
    let stableReads = 0;
    try {
      await pollUntil(
        async () => {
          const value = await input.inputValue().catch(() => '');
          if (value === lastValue && value.length > 0) {
            stableReads += 1;
            return stableReads >= 2;
          }
          lastValue = value;
          stableReads = 0;
          return false;
        },
        {
          intervalMs: 150,
          message: 'Quick create VM name field did not settle after auto-generated name',
          timeout: TestTimeouts.ELEMENT_WAIT,
        },
      );
    } catch {
      // Auto-name may still be updating; fill() retries handle detached fields.
    }
  }

  private yamlAndCliModalEditorToolbarButtons(): Locator {
    return this.yamlAndCliViewerModal()
      .locator('[role="tabpanel"]:visible')
      .getByRole('button')
      .filter({ hasNotText: /View shortcuts/i });
  }

  /** Legacy tech-preview gate modal (when `instanceTypesEnabled` is false); e2e setup keeps the flag on. */
  async acceptInstanceTypesDeveloperPreviewIfPrompted(): Promise<void> {
    const dialog = this.instanceTypesDeveloperPreviewDialog();
    if (!(await dialog.isVisible({ timeout: 1_000 }).catch(() => false))) {
      return;
    }
    const enable = dialog.getByRole('button', { name: /^Enable$/ });
    if (await enable.isVisible().catch(() => false)) {
      await this.robustClick(enable);
      await dialog.waitFor({ state: 'hidden', timeout: TestTimeouts.LONG_OPERATION });
      return;
    }
    await this.page.reload({ waitUntil: 'domcontentloaded' });
    await dismissConsoleObstructions(this.page);
    if (await dialog.isVisible({ timeout: 2_000 }).catch(() => false)) {
      throw new Error(
        'InstanceTypes enable modal is blocking the catalog. Ensure kubevirt-ui-features has instanceTypesEnabled=true.',
      );
    }
  }

  bootableVolumeRowForInstanceTypes(volumeName: string): Locator {
    return this.bootableVolumeSection().getByRole('row').filter({ hasText: volumeName }).first();
  }

  catalogEntryUrlPattern(namespace: string): RegExp {
    // 4.22+ Create action uses bare `/vm-wizard` (no /ns/… prefix).
    return new RegExp(
      `(?:/ns/${namespace}/(catalog|vm-wizard|templatescatalog)(/template)?|/vm-wizard(?:\\?|$))`,
    );
  }

  catalogFilterOsNameOption(): Locator {
    return this.page.locator('[data-test-id^="osName-"]').first();
  }

  catalogFilterPanel(): Locator {
    return this.page
      .locator('#filter-toolbar, .co-catalog-page__filters, [data-test="catalog-filters"]')
      .or(this.osNameFilterGroup());
  }

  catalogFilterWorkloadOption(): Locator {
    return this.page.locator('[data-test-id^="workload-"]').first();
  }

  catalogGrid(): Locator {
    return this.page
      .locator(this.gridSelector)
      .or(this.page.getByRole('tabpanel', { name: /Template catalog/i }))
      .first();
  }

  async clickWizardNextIfEnabled(): Promise<void> {
    const next = this.wizardNextButton();
    if (await next.isEnabled().catch(() => false)) {
      await next.click();
    }
  }

  async clickYamlAndCliModalCopy(): Promise<void> {
    await this.robustClick(this.yamlAndCliModalCopyButton());
  }

  async clickYamlAndCliModalDownload(): Promise<void> {
    await this.robustClick(this.yamlAndCliModalDownloadButton());
  }

  async clickYamlAndCliModalDownloadAndWait(): Promise<Download> {
    const [download] = await Promise.all([
      this.page.waitForEvent('download', { timeout: TestTimeouts.LONG_OPERATION }),
      this.clickYamlAndCliModalDownload(),
    ]);
    return download;
  }

  async completeLegacyQuickCreateModal(vmName: string): Promise<void> {
    await this.openLegacyQuickCreateModal();
    await this.fillCustomizeVmName(vmName);
    await this.clickQuickCreateSubmit(this.quickCreateSubmitScope());
    await this.confirmQuickCreateBootSourceAndWaitForVm();
  }

  async configureInstanceTypePublicSshKey(options: {
    publicKey: string;
    secretName: string;
  }): Promise<void> {
    await this.robustClick(this.instanceTypePublicSshKeyGroup().getByRole('button').first());
    const modal = this.publicSshKeyModal();
    await modal.waitFor({ state: 'visible', timeout: TestTimeouts.LONG_OPERATION });
    await this.robustClick(modal.getByRole('radio', { name: /Add new/i }));
    const keyField = modal
      .getByRole('textbox', { name: /File upload/i })
      .or(modal.locator('#ssh-key-upload textarea, #ssh-key-upload input'))
      .first();
    await keyField.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await keyField.fill(options.publicKey);
    await modal.getByRole('textbox', { name: /Secret name/i }).fill(options.secretName);
    const save = modal.getByRole('button', { name: /^Save$/i });
    await pollUntil(async () => await save.isEnabled(), {
      message: 'Public SSH key modal Save should be enabled',
      timeout: TestTimeouts.LONG_OPERATION,
    });
    await this.robustClick(save);
    await modal.waitFor({ state: 'hidden', timeout: TestTimeouts.LONG_OPERATION });
    await pollUntil(
      async () =>
        (await this.instanceTypePublicSshKeyGroup().getByText(options.secretName).count()) > 0,
      {
        message: 'InstanceTypes form should show configured SSH secret name',
        timeout: TestTimeouts.ELEMENT_WAIT,
      },
    );
  }

  createVirtualMachineButton(): Locator {
    return this.page.getByRole('button', { name: /Create VirtualMachine/i });
  }

  async createVirtualMachineFromInstanceTypesCatalog(options: {
    bootVolumeName: string;
    folderName?: string;
    publicSshKey?: { publicKey: string; secretName: string };
    series?: RegExp | string;
    userInstanceTypeName?: string;
    vmName: string;
  }): Promise<void> {
    // 4.22+: no InstanceTypes catalog tab — Custom configuration path on `/vm-wizard` only.
    if (EnvVariables.useVmWizardCatalogEntry || this.isVmWizardCatalogRoute()) {
      throw new Error(
        'createVirtualMachineFromInstanceTypesCatalog is not available on 4.22+; use the /vm-wizard Custom configuration flow',
      );
    }
    if (!/\/instanceTypes/i.test(this.page.url())) {
      await this.prepareInstanceTypesCatalogTab();
    } else {
      await this.acceptInstanceTypesDeveloperPreviewIfPrompted();
      await this.instanceTypesGrid().waitFor({
        state: 'visible',
        timeout: TestTimeouts.LONG_OPERATION,
      });
    }
    if (options.folderName) {
      await this.instanceTypesFolderLabel().waitFor({
        state: 'visible',
        timeout: TestTimeouts.ELEMENT_WAIT,
      });
    }
    const resyncInstanceTypesCatalog = async (): Promise<void> => {
      await this.page.reload({ waitUntil: 'domcontentloaded' });
      await dismissConsoleObstructions(this.page);
      await this.prepareInstanceTypesCatalogTab();
    };

    let bootVolumeName = options.bootVolumeName;
    if (options.userInstanceTypeName) {
      bootVolumeName = await this.pickBootableVolumeForInstanceTypes(options.bootVolumeName);
      await this.selectUserProvidedInstanceType(
        options.userInstanceTypeName,
        resyncInstanceTypesCatalog,
      );
    } else {
      bootVolumeName = await this.pickBootableVolumeForInstanceTypes(options.bootVolumeName);
      await this.selectInstanceTypeSeriesAndSize(
        options.series ?? DEFAULT_RED_HAT_INSTANCE_TYPE_SERIES,
      );
    }
    await this.instanceTypeVmNameInput().fill(options.vmName);
    if (options.folderName) {
      await this.selectOrCreateFolderInScope(this.instanceTypesTabPanel(), options.folderName);
    }
    if (options.publicSshKey) {
      await this.configureInstanceTypePublicSshKey(options.publicSshKey);
    }
    await this.clickInstanceTypeCreateWhenReady(bootVolumeName);
    await this.waitForVirtualMachineDetailUrl(TestTimeouts.TEST_VM_CREATION).catch(() => undefined);
  }

  async createVirtualMachineFromReview(): Promise<string> {
    await dismissConsoleObstructions(this.page);
    const templateDrawerModal = this.page
      .locator('.template-catalog-drawer')
      .or(this.page.getByRole('dialog', { name: 'Template drawer' }));
    if (
      await templateDrawerModal
        .first()
        .isVisible()
        .catch(() => false)
    ) {
      const drawer = templateDrawerModal.first();
      await drawer
        .getByRole('button', { name: /^Close$/i })
        .click()
        .catch(() => drawer.locator('button.pf-v5-c-modal__close').click());
      await drawer
        .waitFor({ state: 'hidden', timeout: TestTimeouts.ELEMENT_WAIT })
        .catch(() => undefined);
    }
    await this.waitForReviewWizardReady();
    let createBtn: Locator | undefined;
    await pollUntil(
      async () => {
        createBtn = await this.findReviewWizardCreateButton();
        if (!createBtn) {
          return false;
        }
        return await createBtn.isEnabled().catch(() => false);
      },
      {
        message: 'Create VirtualMachine on catalog review should be enabled',
        timeout: TestTimeouts.LONG_OPERATION,
      },
    );
    const submit = createBtn ?? (await this.findReviewWizardCreateButton());
    if (!submit) {
      throw new Error('Create VirtualMachine on catalog review should be present');
    }
    await submit.scrollIntoViewIfNeeded();
    await this.robustClick(submit);
    const noBs = this.page.getByRole('button', { name: 'Create with no available boot source' });
    if (await noBs.isVisible({ timeout: 3 * SECOND }).catch(() => false)) {
      await noBs.click();
    }
    try {
      return await this.waitForVirtualMachineDetailUrl();
    } catch (error) {
      const createError = this.page.getByText(/Create VirtualMachine error/i);
      if (await createError.isVisible().catch(() => false)) {
        const detail = await this.page
          .locator('.pf-v6-c-alert__title, .pf-c-alert__title')
          .filter({ hasText: /error/i })
          .first()
          .textContent()
          .catch(() => '');
        throw new Error(
          `Catalog review create failed: ${detail ?? 'see Create VirtualMachine error alert'}`,
        );
      }
      throw error;
    }
  }

  async createWindowsVmCustomizeFlow(
    vmName: string,
    configureDiskSource: () => Promise<void>,
    review: { rootDiskSizeGiB?: number } = {},
  ): Promise<void> {
    // Wizard Template step: advance via Next (drawer may render details without Quick create).
    if (this.isVmWizardCatalogRoute()) {
      await this.openCustomizeWizard();
      await this.waitForCustomizeStepReady();
      await this.fillCustomizeVmName(vmName);
      await configureDiskSource();
      if (review.rootDiskSizeGiB !== undefined) {
        await this.setCustomizeDiskSizeGiB(review.rootDiskSizeGiB);
      }
      await this.submitCustomizeToReview();
      await this.waitForReviewRootdiskOnDisksTab(review.rootDiskSizeGiB);
      await this.createVirtualMachineFromReview();
      return;
    }

    if (
      await this.templateDrawer()
        .isVisible()
        .catch(() => false)
    ) {
      await this.ensureQuickCreateNameInputVisible();
      await this.fillCustomizeVmName(vmName);
      await configureDiskSource();
      if (review.rootDiskSizeGiB !== undefined) {
        await this.setCustomizeDiskSizeGiB(review.rootDiskSizeGiB);
      }
      await this.openCustomizeWizard();
      await this.waitForCustomizeStepReady();
      await this.fillReviewWizardVmName(vmName);
      await this.waitForReviewRootdiskOnDisksTab(review.rootDiskSizeGiB);
      await this.createVirtualMachineFromReview();
      return;
    }
    await this.openCustomizeWizard();
    await this.waitForCustomizeStepReady();
    await this.fillCustomizeVmName(vmName);
    await configureDiskSource();
    if (review.rootDiskSizeGiB !== undefined) {
      await this.setCustomizeDiskSizeGiB(review.rootDiskSizeGiB);
    }
    await this.submitCustomizeToReview();
    await this.waitForReviewRootdiskOnDisksTab(review.rootDiskSizeGiB);
    await this.createVirtualMachineFromReview();
  }

  /** Blank PVC disk source (no cluster boot source). */
  async createWindowsVmFromBlankCustomizeFlow(
    vmName: string,
    rootDiskSizeGiB: number,
  ): Promise<void> {
    await this.createWindowsVmCustomizeFlow(vmName, () => this.selectDiskSourceBlank(), {
      rootDiskSizeGiB,
    });
  }

  /** HTTP / URL disk source (CNV-8925). */
  async createWindowsVmFromIsoCustomizeFlow(
    vmName: string,
    imageUrl: string,
    rootDiskSizeGiB: number,
  ): Promise<void> {
    await this.createWindowsVmCustomizeFlow(vmName, () => this.selectDiskSourceHttp(imageUrl), {
      rootDiskSizeGiB,
    });
  }

  async createWindowsVmFromIsoInCatalog(
    namespace: string,
    vmName: string,
    imageUrl: string,
    rootDiskSizeGiB: number,
  ): Promise<void> {
    await this.createWindowsVmWithDiskSourceInCatalog(
      namespace,
      vmName,
      () => this.selectDiskSourceHttp(imageUrl),
      { rootDiskSizeGiB },
    );
  }

  /** Registry disk source. */
  async createWindowsVmFromRegistryCustomizeFlow(
    vmName: string,
    containerImage: string,
    rootDiskSizeGiB: number,
  ): Promise<void> {
    await this.createWindowsVmCustomizeFlow(
      vmName,
      () => this.selectDiskSourceRegistry(containerImage),
      { rootDiskSizeGiB },
    );
  }

  async createWindowsVmWithDiskSourceInCatalog(
    namespace: string,
    vmName: string,
    configureDiskSource: () => Promise<void>,
    review: { rootDiskSizeGiB?: number } = {},
  ): Promise<void> {
    await this.openCatalogInNamespace(namespace);
    await this.selectWindowsTemplate();
    // Legacy `templatescatalog` still uses customize + disk source (not quick create).
    await this.createWindowsVmCustomizeFlow(vmName, configureDiskSource, review);
  }

  creationMethodInstanceTypeTile(): Locator {
    return this.page.locator('[data-test="creation-method-instance-type"]');
  }

  creationMethodTemplateTile(): Locator {
    return this.page.locator('[data-test="creation-method-template"]');
  }

  customizeButton(): Locator {
    return this.consoleTestId('customize-vm-btn');
  }

  customizeNameInput(): Locator {
    return this.page
      .locator('.customize-vm')
      .getByRole('textbox', { name: /virtualmachine name/i })
      .or(this.locator('#vm-customize-NAME'))
      .or(this.consoleTestId('vm-name-input'))
      .first();
  }

  customizeNextButton(): Locator {
    return this.page
      .locator('[data-test-id="customize-vm-submit-button"]')
      .or(this.wizardNextButton());
  }

  customizePageHeading(): Locator {
    return this.page
      .locator('.customize-vm')
      .getByRole('heading', {
        name: /Customize template parameters|Customize Template parameters|Customization|Customize VirtualMachine/i,
      })
      .or(
        this.page.getByRole('heading', {
          name: /Customize template parameters|Customize Template parameters|Customization/i,
        }),
      );
  }

  customizeVirtualMachineButton(): Locator {
    return this.page.getByRole('button', { name: /^Customize VirtualMachine$/i });
  }

  diskBootSourceSection(): Locator {
    return this.page.locator('[data-test-id="disk-boot-source"]');
  }

  async ensureBootableVolumeSelectedForInstanceTypes(volumeName: string): Promise<void> {
    await this.pickBootableVolumeForInstanceTypes(volumeName);
  }

  async ensureDiskSourcePvcCloneSelected(): Promise<void> {
    const drawer = this.templateDrawer();
    if (await drawer.isVisible().catch(() => false)) {
      const menu = drawer
        .getByRole('button', {
          name: /Template default|Disk source|Options menu|PVC \(clone PVC\)/i,
        })
        .first();
      await menu.waitFor({ state: 'visible', timeout: TestTimeouts.LONG_OPERATION });
      const label = (await menu.textContent()) ?? '';
      if (/PVC \(clone PVC\)/i.test(label)) {
        return;
      }
      await this.openDiskSourceOptionsMenu();
      await this.page.locator('[data-test-id="pvc-clone"]').click();
      return;
    }
    const menu = this.diskBootSourceSection()
      .getByRole('button', { name: /Options menu|Template default|Disk source/i })
      .first();
    await menu.waitFor({ state: 'visible', timeout: TestTimeouts.LONG_OPERATION });
    const label = (await menu.textContent()) ?? '';
    if (/PVC \(clone PVC\)/i.test(label)) {
      return;
    }
    await this.openDiskSourceOptionsMenu();
    await this.page.locator('[data-test-id="pvc-clone"]').click();
  }

  async ensureInstanceTypeCreationMethodSelected(): Promise<void> {
    const tile = this.creationMethodInstanceTypeTile();
    if (!(await tile.isVisible().catch(() => false))) {
      return;
    }
    const selected = await tile.evaluate(
      (el) => el.classList.contains('pf-m-selected') || el.getAttribute('aria-checked') === 'true',
    );
    if (!selected) {
      await tile.click();
    }
    await this.acceptInstanceTypesDeveloperPreviewIfPrompted();
  }

  /** Provision a bound PVC in the test namespace for catalog PVC-clone disk source. */
  async ensurePvcCloneSource(
    apiClient: RequestContextClient,
    namespace: string,
    name: string,
    sizeGiB: number,
  ): Promise<void> {
    const pvc = {
      apiVersion: 'v1',
      kind: 'PersistentVolumeClaim',
      metadata: { name, namespace },
    };
    await apiClient.deletePersistentVolumeClaim(name, namespace);
    await pollUntil(async () => !(await apiClient.resourceExists(pvc)), {
      message: `PVC ${namespace}/${name} should be absent before create`,
      timeout: TestTimeouts.RESOURCE_CREATION,
    });
    const storageClassName = await apiClient.resolveStorageClassName();
    await apiClient.applyPersistentVolumeClaim(namespace, name, sizeGiB, storageClassName);
    await apiClient.waitForPersistentVolumeClaimBound(name, namespace, TestTimeouts.LONG_OPERATION);
  }

  /**
   * Tabbed catalog defaults to InstanceTypes — select Template catalog (or deep-link)
   * before asserting template filters/tiles.
   */
  async ensureTemplateCatalogTabSelected(): Promise<void> {
    if (await this.isTemplateCatalogPath()) {
      return;
    }
    // VM wizard Template step has no "Template catalog" tab — selection is via creation method.
    if (this.isVmWizardCatalogRoute()) {
      return;
    }

    const tab = this.templateCatalogTab();
    const tabVisible = await tab.isVisible().catch(() => false);
    if (!tabVisible) {
      if (this.isTabbedCatalogRoute()) {
        const ns = this.namespaceFromCurrentUrl();
        await this.page.goto(ConsoleRoutes.catalog(ns), {
          waitUntil: 'domcontentloaded',
        });
        await dismissConsoleObstructions(this.page);
      }
      return;
    }

    if ((await tab.getAttribute('aria-selected')) === 'true') {
      return;
    }

    await this.robustClick(tab);
    await pollUntil(
      async () =>
        (await tab.getAttribute('aria-selected')) === 'true' ||
        (await this.isTemplateCatalogPath()),
      {
        message: 'Template catalog tab should be selected',
        timeout: TestTimeouts.ELEMENT_WAIT,
      },
    );
  }

  /**
   * VM wizard deployment step — pick Template catalog.
   * Default wizard creation method is **instance-type**; InstanceTypes is developer preview
   * (`kubevirt-ui-features` / `instanceTypesEnabled`). Catalog CRUD specs stay on templates.
   */
  async ensureTemplateCreationMethodSelected(): Promise<void> {
    const templateTile = this.creationMethodTemplateTile();
    // Cold `/vm-wizard` mounts creation-method cards after the shell — wait, don't no-op.
    try {
      await templateTile.waitFor({ state: 'visible', timeout: TestTimeouts.LONG_OPERATION });
    } catch {
      return;
    }
    const isSelected = async (): Promise<boolean> => {
      const radio = this.page.getByRole('radio', { name: /Create from Template/i }).first();
      if (await radio.isChecked().catch(() => false)) {
        return true;
      }
      return templateTile
        .evaluate(
          (el) =>
            el.classList.contains('pf-m-selected') ||
            el.classList.contains('pf-m-current') ||
            el.getAttribute('aria-checked') === 'true',
        )
        .catch(() => false);
    };
    if (await isSelected()) {
      return;
    }
    // PatternFly v6 selectable cards: center-card mouse clicks often miss the hidden radio.
    // Force-click the standalone radio input (verified on uit-423); fall back to card click.
    await pollUntil(
      async () => {
        if (await isSelected()) {
          return true;
        }
        const radioInput = templateTile.locator('input[type="radio"]').first();
        if (await radioInput.count()) {
          await radioInput.click({ force: true });
        } else {
          const namedRadio = this.page.getByRole('radio', { name: /Create from Template/i }).first();
          if (await namedRadio.isVisible().catch(() => false)) {
            await namedRadio.check({ force: true });
          } else {
            await this.robustClick(templateTile);
          }
        }
        await this.page.waitForTimeout(300);
        return isSelected();
      },
      {
        message: 'Create from Template creation method should become selected',
        timeout: TestTimeouts.LONG_OPERATION,
      },
    );
    // Wizard nav must switch to the Template flow (not Guest OS).
    await pollUntil(
      async () => {
        const steps = await this.page.locator('.pf-v6-c-wizard__nav-link').allTextContents();
        return steps.some((s) => /Template/i.test(s));
      },
      {
        message: 'Wizard nav should expose Template step after selecting Create from Template',
        timeout: TestTimeouts.ELEMENT_WAIT,
      },
    );
  }

  /**
   * Set the wizard Deployment-details VM name (`#vm-name`). On 4.22+ Customization
   * has no name textbox — name is owned by the deployment step (and editable on Review).
   */
  async setWizardDeploymentVmName(name: string): Promise<void> {
    const deploymentNav = this.page.getByRole('button', { name: /^Deployment details$/i });
    if (await deploymentNav.isVisible().catch(() => false)) {
      const current = (
        await this.page.locator('.pf-v6-c-wizard__nav-link.pf-m-current').allTextContents()
      ).join(' ');
      if (!/Deployment details/i.test(current)) {
        await deploymentNav.click();
      }
    }
    const nameInput = this.page.locator('.vm-creation-wizard #vm-name, #vm-name').first();
    await nameInput.waitFor({ state: 'visible', timeout: TestTimeouts.LONG_OPERATION });
    await nameInput.click();
    await nameInput.press('ControlOrMeta+A').catch(() => undefined);
    await nameInput.pressSequentially(name, { delay: 15 });
    await nameInput.press('Tab').catch(() => undefined);
    await pollUntil(
      async () => ((await nameInput.inputValue().catch(() => '')) || '').trim() === name,
      {
        message: `Wizard deployment VM name should accept "${name}"`,
        timeout: TestTimeouts.ELEMENT_WAIT,
      },
    );
  }

  /** Deployment details → Location: select the target project for the new VM. */
  async selectLocationProject(projectName: string): Promise<void> {
    if (!projectName || !this.isVmWizardCatalogRoute()) {
      return;
    }
    await dismissConsoleObstructions(this.page);
    const deploymentNav = this.page.getByRole('button', { name: /^Deployment details$/i });
    if (await deploymentNav.isVisible().catch(() => false)) {
      const current = (
        await this.page.locator('.pf-v6-c-wizard__nav-link.pf-m-current').allTextContents()
      ).join(' ');
      if (!/Deployment details/i.test(current)) {
        await deploymentNav.click().catch(() => undefined);
      }
    }

    const locationDisplay = this.page.locator('.vm-creation-location-display').first();
    const projectSelected = async (): Promise<boolean> => {
      const display = ((await locationDisplay.textContent().catch(() => '')) || '').includes(
        projectName,
      );
      const toggle = this.page
        .locator('.pf-v6-c-wizard, .vm-creation-location-form')
        .getByTestId('namespace-dropdown-menu-toggle')
        .first();
      const toggleText = ((await toggle.textContent().catch(() => '')) || '').includes(projectName);
      return display || toggleText;
    };
    if (await projectSelected()) {
      return;
    }

    const editLocation = this.page
      .getByTestId('vm-creation-location-edit-btn')
      .or(this.page.locator('button[aria-label="Edit VM creation location"]'))
      .first();
    const escaped = projectName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    await pollUntil(
      async () => {
        if (await projectSelected()) {
          return true;
        }

        const nsToggle = this.page
          .locator('.pf-v6-c-wizard, .vm-creation-location-form')
          .getByTestId('namespace-dropdown-menu-toggle')
          .first();
        if (!(await nsToggle.isVisible().catch(() => false))) {
          if (await editLocation.isVisible().catch(() => false)) {
            await editLocation.click({ force: true }).catch(() => undefined);
          }
          return false;
        }
        if (((await nsToggle.textContent().catch(() => '')) || '').includes(projectName)) {
          return true;
        }

        const search = this.page
          .locator('.co-namespace-dropdown [data-test="dropdown-text-filter"]')
          .or(this.page.getByTestId('dropdown-text-filter'))
          .or(this.page.getByPlaceholder(/Select project/i))
          .first();
        if (!(await search.isVisible().catch(() => false))) {
          await nsToggle.click({ force: true }).catch(() => undefined);
          return false;
        }
        await search.fill(projectName);
        const option = this.page
          .getByRole('menuitem', { name: new RegExp(`^${escaped}$`) })
          .or(
            this.page
              .locator('.co-namespace-dropdown__menu [role="menuitem"]')
              .filter({ hasText: new RegExp(`^\\s*${escaped}\\s*$`) }),
          )
          .or(this.page.getByRole('option', { name: new RegExp(`^${escaped}$`) }))
          .filter({ hasNotText: /All projects/i })
          .first();
        if (!(await option.isVisible().catch(() => false))) {
          return false;
        }
        await option.click({ force: true });
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
        return projectSelected();
      },
      {
        message: `Location project should be ${projectName}`,
        timeout: TestTimeouts.LONG_OPERATION,
      },
    );
  }

  async fillCustomizeVmName(name: string): Promise<void> {
    // Wizard Customization step: no quick-create name field — set deployment name instead.
    if (
      this.isVmWizardCatalogRoute() &&
      (await this.customizePageHeading()
        .isVisible()
        .catch(() => false))
    ) {
      await this.setWizardDeploymentVmName(name);
      const customizeNav = this.page.getByRole('button', { name: /^Customization$/i });
      if (await customizeNav.isVisible().catch(() => false)) {
        await customizeNav.click();
        await this.waitForCustomizeStepReady();
      }
      return;
    }

    await pollUntil(
      async () => {
        try {
          if (!(await this.isQuickCreateNameInputVisible())) {
            if (
              !(await this.customizePageHeading()
                .isVisible()
                .catch(() => false)) &&
              !this.isCatalogTemplateReviewRoute()
            ) {
              await this.ensureQuickCreateNameInputVisible();
            }
          }
          const input = await this.resolveVmNameInputForFill();
          await this.waitForVmNameFieldToSettle(input);
          await input.fill(name, { timeout: TestTimeouts.ELEMENT_WAIT });
          await input.blur();
          return (await input.inputValue()) === name;
        } catch {
          return false;
        }
      },
      {
        message: `Quick create VM name field did not accept value "${name}"`,
        timeout: TestTimeouts.LONG_OPERATION,
      },
    );
  }

  /** release-4.20 catalog review (`/catalog/template/review`) — VMNameModal. */
  async fillReviewWizardVmName(name: string): Promise<void> {
    const main = this.page.locator('main');
    const testIdEdit = this.page.getByTestId('wizard-overview-name-edit');
    if (await testIdEdit.isVisible().catch(() => false)) {
      await testIdEdit.click();
    } else {
      const nameValue = main.getByRole('definition').first().getByRole('button').first();
      await nameValue.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      await nameValue.click();
    }
    const dialog = this.page.getByRole('dialog').filter({
      has: this.page.getByRole('heading', { name: /Edit VirtualMachine name/i }),
    });
    await dialog.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await dialog.locator('#vm-name').fill(name);
    await this.robustClick(dialog.getByRole('button', { name: /^Save$/i }));
    await dialog.waitFor({ state: 'hidden', timeout: TestTimeouts.ELEMENT_WAIT });
  }

  templateDrawerFolderLabel(): Locator {
    return this.templateDrawer().getByText(/^Folder$/i);
  }

  instanceTypesFolderLabel(): Locator {
    return this.instanceTypesTabPanel().getByText(/^Folder$/i);
  }

  reviewWizardFolderRow(): Locator {
    return this.page.locator('[data-test-id="wizard-overview-folder"]');
  }

  /** Typeahead folder field — search and create when the folder does not exist yet. */
  async selectOrCreateFolderInScope(scope: Locator, folderName: string): Promise<void> {
    const combobox = scope.getByRole('combobox').first();
    await combobox.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await combobox.click();
    await combobox.fill(folderName);
    const escaped = folderName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const createRow = this.page.getByText(new RegExp(`Create folder.*${escaped}`, 'i'));
    await pollUntil(async () => await createRow.isVisible().catch(() => false), {
      message: `Folder typeahead should offer Create folder for ${folderName}`,
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await this.robustClick(createRow);
  }

  /** VM wizard / template review overview — `MoveVMToFolderModal`. */
  async setReviewWizardFolder(folderName: string): Promise<void> {
    const edit = this.page.locator('[data-test-id="wizard-overview-folder-edit"]');
    await edit.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(edit);
    const modal = this.page
      .locator('#tab-modal')
      .filter({ visible: true })
      .filter({
        has: this.page.getByRole('heading', { name: /^(Move to group|Move to folder)$/i }),
      })
      .or(
        this.page.getByRole('dialog').filter({
          has: this.page.getByRole('heading', { name: /^(Move to group|Move to folder)$/i }),
        }),
      )
      .first();
    await modal.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    const searchInput = modal.getByRole('combobox').first();
    await searchInput.fill(folderName);
    const escaped = folderName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const createRow = this.page.getByText(new RegExp(`Create folder.*${escaped}`, 'i'));
    await pollUntil(async () => await createRow.isVisible().catch(() => false), {
      message: `Review wizard folder modal should offer Create folder for ${folderName}`,
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await this.robustClick(createRow);
    await this.robustClick(modal.getByRole('button', { name: /^Save$/i }));
    await modal.waitFor({ state: 'hidden', timeout: TestTimeouts.LONG_OPERATION });
  }

  async filterByOsCheckbox(testId: string, checked: boolean): Promise<void> {
    await this.ensureTemplateCatalogTabSelected();
    await this.openCatalogFilterToolbar();
    await this.catalogFilterToolbar.setCatalogCheckboxFilter(testId, checked);
  }

  async filterByText(text: string): Promise<void> {
    await this.ensureTemplateCatalogTabSelected();
    await this.catalogFilterToolbar.filterCatalogByText(text);
  }

  async filterInstanceTypesBootVolumesByText(text: string): Promise<void> {
    const search = this.instanceTypesBootVolumeSearchInput();
    await search.waitFor({ state: 'visible', timeout: TestTimeouts.LONG_OPERATION });
    await search.fill(text);
  }

  filterTextInput(): Locator {
    const panel = this.page.getByRole('tabpanel', { name: /Template catalog/i });
    return panel
      .getByRole('textbox', { name: /Filter by keyword/i })
      .or(panel.locator('#filter-text-input input, [data-test="search-catalog"] input'))
      .or(this.page.getByRole('textbox', { name: /Filter by keyword/i }))
      .or(this.page.locator('#filter-text-input input, [data-test="search-catalog"] input'))
      .first();
  }

  async getGridLinkCount(): Promise<number> {
    return await this.gridLinks().count();
  }

  async goToCustomizeWizardTab(testId: string): Promise<void> {
    await this.reviewWizardTab(testId).click();
    await this.customizePageHeading().waitFor({
      state: 'visible',
      timeout: TestTimeouts.LONG_OPERATION,
    });
  }

  async goToInstanceTypesCatalog(namespace: string): Promise<void> {
    const path = EnvVariables.useLegacyCatalogEntry
      ? ConsoleRoutes.legacyInstanceTypesCatalog(namespace)
      : ConsoleRoutes.instanceTypesCatalog(namespace);
    await this.page.goto(path, {
      waitUntil: 'domcontentloaded',
    });
    await dismissConsoleObstructions(this.page);
    await this.page.waitForURL(/instanceTypes/i, { timeout: TestTimeouts.LONG_OPERATION });
  }

  async goToReviewWizardTab(testId: string): Promise<void> {
    await this.reviewWizardTab(testId).click();
    await this.waitForReviewWizardReady();
  }

  gridLinkWithText(text: RegExp | string): Locator {
    return this.templateGridLinks().filter({ hasText: text }).first();
  }

  gridLinks(): Locator {
    return this.templateGridLinks();
  }

  guestOsTile(os: 'OTHER_LINUX' | 'RHEL' | 'WINDOWS'): Locator {
    return this.page.locator(`[data-test="os-tile-${os}"]`);
  }

  instanceTypeCreateVirtualMachineButton(): Locator {
    return this.page.getByRole('button', { name: /^Create VirtualMachine$/ });
  }

  instanceTypeCustomizationTab(
    tab: 'details' | 'network' | 'scheduling' | 'ssh' | 'storage',
  ): Locator {
    return this.page.locator(`[data-test="vm-configuration-${tab}"]`);
  }

  instanceTypePublicSshKeyGroup(): Locator {
    return this.instanceTypesTabPanel()
      .locator(
        '.pf-v6-c-description-list__group, .pf-v5-c-description-list__group, .pf-c-description-list__group',
      )
      .filter({ has: this.page.getByText('Public SSH key', { exact: true }) });
  }

  instanceTypeRowMatching(name: RegExp | string): Locator {
    return this.page.getByRole('row').filter({ hasText: name }).first();
  }

  instanceTypeSeriesLabel(series: RegExp | string): Locator {
    return this.page.getByText(series).first();
  }

  instanceTypeSizeMenuItem(name: RegExp): Locator {
    return this.page.getByRole('menuitem', { name });
  }

  instanceTypeVmNameInput(): Locator {
    return this.page.getByTestId('instancetypes-vm-name-input').or(
      this.page
        .getByRole('listitem')
        .filter({ hasText: /VirtualMachine details/i })
        .getByRole('textbox')
        .first(),
    );
  }

  instanceTypesBootVolumeSearchInput(): Locator {
    return this.instanceTypesTabPanel().getByRole('textbox', { name: /Search by name/i });
  }

  instanceTypesCatalogTab(): Locator {
    return this.page.getByRole('tab', { name: /InstanceTypes/i });
  }

  instanceTypesDeveloperPreviewDialog(): Locator {
    return this.page
      .getByRole('dialog')
      .filter({ hasText: /Creating a VirtualMachine from an InstanceType/i });
  }

  instanceTypesDeveloperPreviewFeaturePopover(): Locator {
    return this.page
      .locator('.pf-v6-c-popover, .pf-c-popover')
      .filter({ hasText: /not intended to use in production/i });
  }

  /** Compact label with info icon (`DeveloperPreviewLabel` — InstanceTypes / boot-volume creation). */
  instanceTypesDeveloperPreviewTooltipTrigger(): Locator {
    return this.page
      .locator('.dev-preview-label')
      .or(
        this.page
          .getByText(/^Developer preview$/i)
          .locator(
            'xpath=ancestor::*[contains(@class,"pf-v6-c-label") or contains(@class,"pf-c-label")][1]',
          ),
      )
      .first();
  }

  instanceTypesGrid(): Locator {
    return this.page.getByRole('grid').or(this.page.locator('table')).first();
  }

  instanceTypesTabPanel(): Locator {
    return this.page.getByRole('tabpanel', { name: /InstanceTypes/i });
  }

  instanceTypesUserProvidedTab(): Locator {
    return this.page.getByRole('tab', { name: /User provided/i });
  }

  isCatalogTemplateReviewRoute(): boolean {
    return /\/catalog\/template\/review/.test(this.page.url());
  }

  isLegacyTemplatesCatalogRoute(): boolean {
    return /templatescatalog/.test(this.page.url());
  }

  isTabbedCatalogRoute(): boolean {
    return /\/catalog(\/|$|\?)/.test(this.page.url()) && !this.isVmWizardCatalogRoute();
  }

  isTemplateCatalogPath(): boolean {
    const url = this.page.url();
    if (/\/catalog\/template(\/|$|\?)/.test(url)) {
      return true;
    }
    return /templatescatalog/.test(url) && !/instanceTypes/i.test(url);
  }

  isVmWizardCatalogRoute(): boolean {
    return /vm-wizard/.test(this.page.url());
  }

  legacyQuickCreateModalHeading(): Locator {
    return this.page.getByRole('heading', { name: /^Quick create VirtualMachine$/i });
  }

  legacyQuickCreateToolbarButton(): Locator {
    return this.page
      .locator('main')
      .getByRole('button', { name: /^Quick create VirtualMachine$/i })
      .first();
  }

  legacyVmNameTextbox(): Locator {
    return this.page.getByRole('textbox', { name: /VirtualMachine name/i });
  }

  /** Clone PVC from another namespace. */
  async listPvcCloneSourceNames(
    apiClient: RequestContextClient,
    pvcNamespace: string,
  ): Promise<string[]> {
    return apiClient.listPersistentVolumeClaimNames(pvcNamespace);
  }

  namespaceFromCurrentUrl(): string {
    const match = this.page.url().match(/\/ns\/([^/]+)\//);
    return match?.[1] ?? 'default';
  }

  async openCatalogFilterToolbar(): Promise<void> {
    await this.catalogFilterToolbar.openCatalogFilterPanelIfClosed(this.osNameFilterGroup());
  }

  /** VM list tour Create → wizard template step (release-4.22+). */
  async openVmWizardFromVirtualMachinesList(
    vmListPage: VmListPage,
    namespace: string,
  ): Promise<void> {
    await vmListPage.openVmCreationWizard(namespace);
    await dismissConsoleObstructions(this.page);
    await this.ensureTemplateCreationMethodSelected();
    await this.waitForTemplateCatalogReady();
  }

  async openVmWizardInNamespace(namespace: string): Promise<void> {
    const wizardShell = this.page.locator(
      '.vm-creation-wizard, .pf-v6-c-wizard.vm-creation-wizard',
    );

    // 4.22+: there is no catalog — only bare `/vm-wizard` (matches kubevirt-ui).
    if (EnvVariables.useVmWizardCatalogEntry && !EnvVariables.useLegacyCatalogEntry) {
      await this.page.goto(ConsoleRoutes.virtualMachinesInNamespace(namespace), {
        waitUntil: 'domcontentloaded',
      });
      await dismissConsoleObstructions(this.page);
      await this.page.goto(ConsoleRoutes.vmWizard(namespace), {
        waitUntil: 'domcontentloaded',
      });
      await dismissConsoleObstructions(this.page);
      await wizardShell.first().waitFor({
        state: 'visible',
        timeout: TestTimeouts.LONG_OPERATION,
      });
      if (await this.isVmWizardRouteUnavailable()) {
        throw new Error('VM wizard at /vm-wizard is unavailable (4.22+ has no catalog fallback)');
      }
      await this.prepareTemplateCatalogGrid();
      return;
    }

    const entryPath = EnvVariables.useLegacyCatalogEntry
      ? ConsoleRoutes.catalog(namespace)
      : ConsoleRoutes.templateCatalog(namespace);
    await this.page.goto(entryPath, {
      waitUntil: 'domcontentloaded',
    });
    await dismissConsoleObstructions(this.page);

    await wizardShell
      .first()
      .waitFor({ state: 'visible', timeout: TestTimeouts.LONG_OPERATION })
      .catch(() => undefined);

    if (
      this.isLegacyTemplatesCatalogRoute() ||
      this.isTabbedCatalogRoute() ||
      (await this.shouldUseLegacyCatalogRoute())
    ) {
      await this.ensureTemplateCatalogTabSelected();
      await this.waitForTemplateCatalogReady();
      return;
    }

    await this.prepareTemplateCatalogGrid();
  }

  /** @deprecated Use {@link openVmWizardInNamespace} */
  async openCatalogInNamespace(namespace: string): Promise<void> {
    return this.openVmWizardInNamespace(namespace);
  }

  async openCatalogPrepared(namespace: string): Promise<void> {
    await this.openCatalogInNamespace(namespace);
    await dismissConsoleObstructions(this.page);
  }

  async openCustomizeNetworkInterfacesTab(
    projectNamespace: string,
    templateMetadataName: string,
  ): Promise<void> {
    await this.openCatalogInNamespace(projectNamespace);
    await this.selectTemplateByMetadataName(templateMetadataName);
    await this.openCustomizeWizard();
    await this.goToCustomizeWizardTab(CatalogReviewTabTestId.Networks);
    await this.page
      .getByRole('button', { name: /Add network interface/i })
      .waitFor({ state: 'visible', timeout: TestTimeouts.LONG_OPERATION });
  }

  async openCustomizeWizard(): Promise<void> {
    // 4.22+ /vm-wizard: Template selection enables Next → Customization (no drawer Customize).
    if (this.isVmWizardCatalogRoute() && !this.isCatalogTemplateReviewRoute()) {
      await this.clickWizardNextIfEnabled();
      await this.waitForCustomizeStepReady();
      return;
    }

    if (
      await this.templateDrawer()
        .isVisible()
        .catch(() => false)
    ) {
      await this.robustClick(this.templateDrawerCustomizeButton());
      await this.page
        .waitForURL(/templatescatalog\/customize|\/catalog\/template\/review/, {
          timeout: TestTimeouts.LONG_OPERATION,
        })
        .catch(() => undefined);
      await this.waitForCustomizeStepReady();
      return;
    }

    const legacyCustomize = this.page
      .locator('main, [role="contentinfo"]')
      .getByRole('button', { name: /^Customize VirtualMachine$/i })
      .first();
    if (await legacyCustomize.isVisible().catch(() => false)) {
      await legacyCustomize.click();
    } else if (
      await this.templateDrawerCustomizeButton()
        .isVisible()
        .catch(() => false)
    ) {
      await this.robustClick(this.templateDrawerCustomizeButton());
    } else if (
      await this.legacyQuickCreateModalHeading()
        .isVisible()
        .catch(() => false)
    ) {
      await this.robustClick(
        this.page.getByRole('button', { name: /^Customize VirtualMachine$/i }).first(),
      );
    } else if (
      await this.customizeButton()
        .isEnabled()
        .catch(() => false)
    ) {
      await this.customizeButton().click();
    } else {
      await this.clickWizardNextIfEnabled();
    }

    const ready = this.customizeStepReady();
    const deadline = Date.now() + TestTimeouts.LONG_OPERATION;
    while (Date.now() < deadline) {
      if (await ready.isVisible().catch(() => false)) {
        return;
      }
      if (await legacyCustomize.isVisible().catch(() => false)) {
        await legacyCustomize.scrollIntoViewIfNeeded();
        await legacyCustomize.click();
      } else if (
        await this.templateDrawerCustomizeButton()
          .isVisible()
          .catch(() => false)
      ) {
        await this.robustClick(this.templateDrawerCustomizeButton());
      }
      await this.page.waitForTimeout(750);
    }
    await ready.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
  }

  async openDiskSourceOptionsMenu(): Promise<void> {
    const drawer = this.templateDrawer();
    if (await drawer.isVisible().catch(() => false)) {
      await drawer
        .getByRole('button', { name: /Template default|Disk source|Options menu/i })
        .first()
        .click();
      return;
    }
    const section = this.diskBootSourceSection();
    await section.getByRole('button', { name: 'Options menu' }).click();
  }

  async openInstanceTypeCustomizationStep(): Promise<void> {
    await this.page
      .getByRole('heading', { name: /^Customization$/ })
      .waitFor({ state: 'visible', timeout: TestTimeouts.LONG_OPERATION });
  }

  async openInstanceTypeCustomizationSubTab(
    tab: 'details' | 'network' | 'scheduling' | 'ssh' | 'storage',
  ): Promise<void> {
    await this.instanceTypeCustomizationTab(tab).click();
  }

  /**
   * Reach boot-volume selection via `/vm-wizard` Custom configuration (4.22+) or legacy InstanceTypes tab.
   */
  async openInstanceTypesBootVolumeCreationStep(namespace: string): Promise<void> {
    if (EnvVariables.useVmWizardCatalogEntry && !EnvVariables.useLegacyCatalogEntry) {
      const ready = await this.prepareInstanceTypeWizardEntry(namespace);
      if (!ready) {
        throw new Error(
          'Guest OS / Boot source step did not open on /vm-wizard (no catalog fallback on 4.22+)',
        );
      }
      await this.selectGuestOsTile('RHEL');
      return;
    }

    await this.goToInstanceTypesCatalog(namespace);
    await this.acceptInstanceTypesDeveloperPreviewIfPrompted();
    await this.bootableVolumeSection()
      .or(this.instanceTypesGrid())
      .first()
      .waitFor({ state: 'visible', timeout: TestTimeouts.LONG_OPERATION });
  }

  async openInstanceTypesCatalogTab(): Promise<void> {
    const namespace = this.namespaceFromCurrentUrl();
    const tab = this.instanceTypesCatalogTab();
    if (await tab.isVisible().catch(() => false)) {
      await this.robustClick(tab);
      await pollUntil(async () => (await tab.getAttribute('aria-selected')) === 'true', {
        message: 'InstanceTypes catalog tab should be selected',
        timeout: TestTimeouts.LONG_OPERATION,
      });
      return;
    }

    if (this.isLegacyTemplatesCatalogRoute() || (await this.shouldUseLegacyCatalogRoute())) {
      await this.page.goto(ConsoleRoutes.legacyInstanceTypesCatalog(namespace), {
        waitUntil: 'domcontentloaded',
      });
    } else {
      await this.page.goto(ConsoleRoutes.instanceTypesCatalog(namespace), {
        waitUntil: 'domcontentloaded',
      });
    }
    await dismissConsoleObstructions(this.page);
    await this.page.waitForURL(/instanceTypes/i, { timeout: TestTimeouts.LONG_OPERATION });
    await pollUntil(
      async () => (await this.instanceTypesCatalogTab().getAttribute('aria-selected')) === 'true',
      {
        message: 'InstanceTypes catalog tab should be selected',
        timeout: TestTimeouts.LONG_OPERATION,
      },
    );
  }

  /** Opens the developer-preview tooltip; specs assert on the returned popover. */
  async openInstanceTypesDeveloperPreviewTooltip(): Promise<Locator> {
    const trigger = this.instanceTypesDeveloperPreviewTooltipTrigger();
    await trigger.waitFor({ state: 'visible', timeout: TestTimeouts.LONG_OPERATION });
    await this.robustClick(trigger);
    const popover = this.instanceTypesDeveloperPreviewFeaturePopover();
    await popover.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    return popover;
  }

  async openLegacyCatalogInNamespace(namespace: string): Promise<void> {
    await this.page.goto(ConsoleRoutes.legacyCatalog(namespace), {
      waitUntil: 'domcontentloaded',
    });
    await dismissConsoleObstructions(this.page);
    await this.prepareTemplateCatalogGrid();
  }

  async openLegacyQuickCreateModal(): Promise<void> {
    if (this.isCatalogTemplateReviewRoute()) {
      return;
    }
    if (await this.isQuickCreateNameInputVisible()) {
      return;
    }
    if (
      await this.templateDrawer()
        .isVisible()
        .catch(() => false)
    ) {
      await this.ensureQuickCreateNameInputVisible();
      return;
    }
    if (
      (await this.legacyQuickCreateModalHeading()
        .isVisible()
        .catch(() => false)) &&
      (await this.isQuickCreateNameInputVisible())
    ) {
      return;
    }
    const toolbar = this.legacyQuickCreateToolbarButton();
    if (await toolbar.isVisible().catch(() => false)) {
      await toolbar.click();
    } else if (
      await this.quickCreateButton()
        .isVisible()
        .catch(() => false)
    ) {
      await this.quickCreateButton().click();
    }
    await this.legacyQuickCreateModalHeading().waitFor({
      state: 'visible',
      timeout: TestTimeouts.LONG_OPERATION,
    });
    await this.quickCreateVmNameInputCandidates().first().waitFor({
      state: 'visible',
      timeout: TestTimeouts.LONG_OPERATION,
    });
  }

  async openViewYamlAndCliModal(vmName: string): Promise<void> {
    const button = this.viewYamlAndCliButton();
    await button.waitFor({ state: 'visible', timeout: TestTimeouts.LONG_OPERATION });
    await this.robustClick(button);
    const modal = this.yamlAndCliViewerModal();
    await modal.waitFor({ state: 'visible', timeout: TestTimeouts.LONG_OPERATION });
    await modal.getByText(new RegExp(`YAML for ${vmName}`, 'i')).waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
  }

  osNameFilterGroup(): Locator {
    return this.page
      .locator('fieldset[aria-labelledby="osName"]')
      .or(this.page.getByText('Operating system', { exact: true }));
  }

  /** Prefer `preferred`; fall back to common OS images clusters expose in openshift-virtualization-os-images. */
  async pickBootableVolumeForInstanceTypes(preferred: string): Promise<string> {
    // rhel10 is the volume exposed under Guest OS → RHEL on current clusters; fedora needs Other Linux.
    const candidates = [preferred, 'rhel10', 'rhel9', 'fedora', 'rhel8', 'centos-stream9'];
    const tried = new Set<string>();
    for (const name of candidates) {
      if (tried.has(name)) {
        continue;
      }
      tried.add(name);
      const selected = await this.trySelectBootableVolumeForInstanceTypes(name);
      if (selected) {
        await pollUntil(async () => await this.isBootVolumeSelectedForInstanceTypes(name), {
          message: `Boot volume ${name} should be selected in InstanceTypes catalog`,
          timeout: TestTimeouts.LONG_OPERATION,
        });
        return name;
      }
    }
    throw new Error(
      `No bootable volume found in InstanceTypes catalog (tried: ${[...tried].join(', ')})`,
    );
  }

  pickCatalogPvcCloneName(pvcNames: string[], preferredNamePrefix: string): string {
    return (
      pvcNames.find((name) => /win10|windows|^win/i.test(name)) ??
      pvcNames.find((name) => name.startsWith(preferredNamePrefix)) ??
      pvcNames[0]
    );
  }

  /** Boot volume + series + VM name — enables View YAML & CLI (does not create VM). */
  async prepareInstanceTypeVmCreationForm(options: {
    bootVolumeName: string;
    series: RegExp | string;
    vmName: string;
  }): Promise<void> {
    await this.pickBootableVolumeForInstanceTypes(options.bootVolumeName);
    await this.selectInstanceTypeSeriesAndSize(options.series);
    await this.instanceTypeVmNameInput().fill(options.vmName);
    await this.viewYamlAndCliButton().waitFor({
      state: 'visible',
      timeout: TestTimeouts.LONG_OPERATION,
    });
  }

  /** VM wizard instance-type flow (skipped on legacy `templatescatalog` clusters). */
  async prepareInstanceTypeWizardEntry(namespace: string): Promise<boolean> {
    // 4.22+ Create action is bare `/vm-wizard` — prime active ns so Location defaults correctly.
    await this.page.goto(ConsoleRoutes.virtualMachinesInNamespace(namespace), {
      waitUntil: 'domcontentloaded',
    });
    await dismissConsoleObstructions(this.page);
    await this.page.goto(ConsoleRoutes.vmWizard(namespace), { waitUntil: 'domcontentloaded' });
    await dismissConsoleObstructions(this.page);
    if (this.isLegacyTemplatesCatalogRoute() || (await this.shouldUseLegacyCatalogRoute())) {
      return false;
    }
    if (await this.isVmWizardRouteUnavailable()) {
      return false;
    }
    await this.ensureInstanceTypeCreationMethodSelected();
    await this.selectLocationProject(namespace);
    await this.ensureWizardVmNameFilled();
    await this.ensureInstanceTypeCreationMethodSelected();
    await this.selectLocationProject(namespace);

    const next = this.wizardNextButton();
    await pollUntil(
      async () => {
        const current = (
          await this.page.locator('.pf-v6-c-wizard__nav-link.pf-m-current').allTextContents()
        ).join(' ');
        if (/Guest OS|Boot source/i.test(current)) {
          return true;
        }
        await this.ensureInstanceTypeCreationMethodSelected();
        await this.ensureWizardVmNameFilled();
        if (await next.isDisabled().catch(() => true)) {
          return false;
        }
        await next.click({ force: true });
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
        return /Guest OS|Boot source/i.test(
          (
            await this.page.locator('.pf-v6-c-wizard__nav-link.pf-m-current').allTextContents()
          ).join(' '),
        );
      },
      {
        message: 'Guest OS step should open after Custom configuration Next',
        timeout: TestTimeouts.LONG_OPERATION,
      },
    ).catch(() => undefined);

    const onVmWizard = this.isVmWizardCatalogRoute();
    if (!onVmWizard) {
      return false;
    }
    const currentStep = (
      await this.page.locator('.pf-v6-c-wizard__nav-link.pf-m-current').allTextContents()
    ).join(' ');
    if (/Guest OS|Boot source/i.test(currentStep)) {
      return true;
    }
    // Check locators one-at-a-time — `.or().isVisible()` throws strict-mode when both match.
    const guestOsMarkers = [
      this.guestOsTile('RHEL'),
      this.page.getByRole('heading', { name: /^Guest operating system$/i }),
      this.page.getByRole('heading', { name: /^RHEL$/i }),
      this.page.locator('.operating-system-tile').first(),
    ];
    for (const marker of guestOsMarkers) {
      if (
        await marker
          .first()
          .isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM })
          .catch(() => false)
      ) {
        return true;
      }
    }
    return false;
  }

  async prepareInstanceTypesCatalogTab(): Promise<void> {
    await this.openInstanceTypesCatalogTab();
    await this.acceptInstanceTypesDeveloperPreviewIfPrompted();
    await this.instanceTypesGrid().waitFor({
      state: 'visible',
      timeout: TestTimeouts.LONG_OPERATION,
    });
  }

  /**
   * Reach the template catalog grid from either the VM wizard (deployment step → template step)
   * or the legacy catalog tabs (Template catalog vs InstanceTypes).
   */
  async prepareTemplateCatalogGrid(): Promise<void> {
    await this.ensureTemplateCatalogTabSelected();

    if (
      (await this.page
        .locator('#vm-catalog-grid, .vm-catalog-grid, .templates-catalog-tile')
        .first()
        .isVisible()
        .catch(() => false)) &&
      (await this.templateGridLinks().count()) > 0
    ) {
      return;
    }

    // Order matters: selecting Template after a pre-filled name can clear the field and
    // revert creation method during re-render. Select Template first, then set the name.
    await this.ensureTemplateCreationMethodSelected();
    await this.ensureWizardVmNameFilled();
    await this.ensureTemplateCreationMethodSelected();

    const next = this.wizardNextButton();
    await pollUntil(async () => !(await next.isDisabled().catch(() => true)), {
      message: 'Wizard Next should enable after VM name is set',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });

    await pollUntil(
      async () => {
        const current = (
          await this.page.locator('.pf-v6-c-wizard__nav-link.pf-m-current').allTextContents()
        ).join(' ');
        if (/Template/i.test(current) && (await this.templateGridLinks().count()) > 0) {
          return true;
        }
        await this.ensureTemplateCreationMethodSelected();
        await this.ensureWizardVmNameFilled();
        if (await next.isDisabled().catch(() => true)) {
          return false;
        }
        // Force: Next remounts as aria-disabled mid-click when creation method flips.
        await next.click({ force: true });
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
        const after = (
          await this.page.locator('.pf-v6-c-wizard__nav-link.pf-m-current').allTextContents()
        ).join(' ');
        return /Template/i.test(after) && (await this.templateGridLinks().count()) > 0;
      },
      {
        message: 'Template step should show catalog tiles after Next',
        timeout: TestTimeouts.LONG_OPERATION,
      },
    );

    await this.waitForTemplateCatalogReady();
  }

  /** Fill or generate the deployment-step VM name so wizard Next can advance. */
  async ensureWizardVmNameFilled(): Promise<void> {
    const nameInput = this.page.locator('.vm-creation-wizard #vm-name').first();
    await nameInput.waitFor({ state: 'visible', timeout: TestTimeouts.LONG_OPERATION });
    if (((await nameInput.inputValue().catch(() => '')) || '').trim()) {
      return;
    }
    const generate = this.page
      .locator('.vm-creation-wizard')
      .getByRole('button', { name: /Generate unique VM name/i })
      .or(this.page.locator('.vm-creation-wizard [data-test="generate-vm-name-button"]'))
      .first();
    if (await generate.isVisible().catch(() => false)) {
      await this.robustClick(generate);
      const generated = await pollUntil(
        async () => ((await nameInput.inputValue().catch(() => '')) || '').trim().length > 0,
        {
          message: 'Generate VM name button should populate #vm-name',
          timeout: TestTimeouts.ELEMENT_WAIT,
        },
      )
        .then(() => true)
        .catch(() => false);
      if (generated) {
        return;
      }
    }
    // Keyboard entry — fill() is unreliable with this controlled input.
    const value = `pw-catalog-${Date.now().toString(36)}`;
    await nameInput.click();
    await nameInput.press('ControlOrMeta+A').catch(() => undefined);
    await nameInput.pressSequentially(value, { delay: 15 });
    await nameInput.press('Tab').catch(() => undefined);
    await pollUntil(
      async () => ((await nameInput.inputValue().catch(() => '')) || '').trim().length > 0,
      {
        message: `VM name field should accept a value (tried "${value}")`,
        timeout: TestTimeouts.ELEMENT_WAIT,
      },
    );
  }

  publicSshKeyModal(): Locator {
    return this.page
      .getByRole('dialog')
      .filter({ has: this.page.getByRole('heading', { name: /Public SSH key/i }) });
  }

  pvcCloneNameDropdown(): Locator {
    return this.catalogDiskCustomizeScope().getByRole('button', { name: /PVC name/i });
  }

  pvcCloneProjectDropdown(): Locator {
    return this.catalogDiskCustomizeScope().getByRole('button', { name: /PVC project/i });
  }

  quickCreateButton(): Locator {
    return this.consoleTestId('quick-create-vm-btn');
  }

  /** Returns the created VM name (from the console URL when the UI renames it). */
  async quickCreateVm(vmName: string, options?: { folderName?: string }): Promise<string> {
    // 4.22+ wizard has no Quick create — Template → Customization → Review → Create.
    // VM name lives on Deployment details (#vm-name), not on the Customization step.
    if (this.isVmWizardCatalogRoute() && !this.isCatalogTemplateReviewRoute()) {
      await this.setWizardDeploymentVmName(vmName);
      await this.clickWizardNextIfEnabled();
      await this.waitForCustomizeStepReady();
      await this.submitCustomizeToReview();
      await this.fillReviewWizardVmName(vmName).catch(() => undefined);
      if (options?.folderName) {
        await this.setReviewWizardFolder(options.folderName);
      }
      return await this.createVirtualMachineFromReview();
    }

    if (await this.tryQuickCreateInTemplateDrawer(vmName, options?.folderName)) {
      return this.vmNameFromCurrentUrl() || vmName;
    }

    if (
      await this.legacyQuickCreateModalHeading()
        .isVisible()
        .catch(() => false)
    ) {
      await this.ensureQuickCreateNameInputVisible();
      await this.fillCustomizeVmName(vmName);
      await this.clickQuickCreateSubmit(this.quickCreateSubmitScope());
      await this.confirmQuickCreateBootSourceAndWaitForVm();
      return this.vmNameFromCurrentUrl() || vmName;
    }

    if (
      (await this.templateDrawer()
        .isVisible()
        .catch(() => false)) &&
      !this.isCatalogTemplateReviewRoute()
    ) {
      await this.robustClick(this.templateDrawerCustomizeButton());
      await this.page.waitForURL(/\/catalog\/template\/review/, {
        timeout: TestTimeouts.LONG_OPERATION,
      });
      await this.waitForReviewWizardReady();
      await this.fillReviewWizardVmName(vmName).catch(() => undefined);
      return await this.createVirtualMachineFromReview();
    }

    if (this.isCatalogTemplateReviewRoute()) {
      await dismissConsoleObstructions(this.page);
      await this.waitForReviewWizardReady();
      await this.fillReviewWizardVmName(vmName).catch(() => undefined);
      return await this.createVirtualMachineFromReview();
    }

    if (await this.tryCreateVmFromTemplateDrawerCustomize(vmName)) {
      return this.vmNameFromCurrentUrl() || vmName;
    }

    if (
      await this.legacyQuickCreateModalHeading()
        .isVisible()
        .catch(() => false)
    ) {
      await this.ensureQuickCreateNameInputVisible();
      await this.fillCustomizeVmName(vmName);
      await this.clickQuickCreateSubmit(this.quickCreateSubmitScope());
      await this.confirmQuickCreateBootSourceAndWaitForVm();
      return this.vmNameFromCurrentUrl() || vmName;
    }

    if (
      this.isLegacyTemplatesCatalogRoute() &&
      (await this.legacyQuickCreateToolbarButton()
        .isVisible()
        .catch(() => false))
    ) {
      await this.completeLegacyQuickCreateModal(vmName);
      return this.vmNameFromCurrentUrl() || vmName;
    }

    if (
      await this.quickCreateButton()
        .isVisible()
        .catch(() => false)
    ) {
      if (
        !(await this.legacyQuickCreateModalHeading()
          .isVisible()
          .catch(() => false))
      ) {
        await this.openLegacyQuickCreateModal();
      }
      const toolbarQuick = this.quickCreateButton();
      if (
        !(await this.legacyQuickCreateModalHeading()
          .isVisible()
          .catch(() => false)) &&
        (await toolbarQuick.isEnabled().catch(() => false))
      ) {
        await toolbarQuick.click();
      }
      if (
        await this.legacyQuickCreateModalHeading()
          .isVisible()
          .catch(() => false)
      ) {
        await this.fillCustomizeVmName(vmName);
        await this.clickQuickCreateSubmit(this.quickCreateSubmitScope());
        await this.confirmQuickCreateBootSourceAndWaitForVm();
        return this.vmNameFromCurrentUrl() || vmName;
      }
      await this.fillCustomizeVmName(vmName);
      await this.submitCustomizeToReview();
      return await this.createVirtualMachineFromReview();
    }

    if (
      await this.customizeButton()
        .isVisible()
        .catch(() => false)
    ) {
      await this.openCustomizeWizard();
      await this.fillCustomizeVmName(vmName);
      await this.submitCustomizeToReview();
      return await this.createVirtualMachineFromReview();
    }

    await this.clickWizardNextIfEnabled();
    await this.waitForCustomizeStepReady();
    await this.fillCustomizeVmName(vmName);
    await this.submitCustomizeToReview();
    return await this.createVirtualMachineFromReview();
  }

  async readYamlAndCliModalEditorText(): Promise<string> {
    const panel = this.yamlAndCliViewerModal().locator('[role="tabpanel"]:visible');
    const textarea = panel.locator('textarea').first();
    if (await textarea.isVisible().catch(() => false)) {
      return (await textarea.inputValue()) || '';
    }
    const raw =
      (await panel
        .locator('.monaco-scrollable-element .view-lines, .view-lines')
        .first()
        .innerText()
        .catch(() => '')) || '';
    return raw.replace(/\u00a0/g, ' ');
  }

  reviewRootdiskAnySizeLabel(): Locator {
    return this.page.getByText(/\d+\s*GiB/i).first();
  }

  reviewRootdiskLabel(): Locator {
    return this.page.getByText('rootdisk', { exact: false }).first();
  }

  reviewRootdiskSizeLabel(sizeGiB: number): Locator {
    return this.page
      .getByRole('row')
      .filter({ hasText: /rootdisk/i })
      .getByText(new RegExp(`${sizeGiB}\\s*GiB`, 'i'));
  }

  reviewVisibleText(text: RegExp | string): Locator {
    return this.page.getByText(text, { exact: false }).first();
  }

  reviewWizardHeading(): Locator {
    return this.page.getByRole('heading', {
      name: /Review and create VirtualMachine|Review and create|Customize and create VirtualMachine/i,
    });
  }

  reviewWizardReady(): Locator {
    return this.reviewWizardHeading()
      .or(this.page.locator('.vm-wizard-footer'))
      .or(
        this.page
          .locator('.vm-creation-wizard .pf-v6-c-wizard__footer')
          .getByRole('button', { name: /^Create VirtualMachine$/i }),
      )
      .first();
  }

  reviewWizardTab(testId: string): Locator {
    return this.consoleTestId(testId);
  }

  async selectBootableVolumeForInstanceTypes(volumeName: string): Promise<void> {
    const selected = await this.trySelectBootableVolumeForInstanceTypes(volumeName);
    if (!selected) {
      throw new Error(`Boot volume ${volumeName} is not available in InstanceTypes catalog`);
    }
  }

  /**
   * Legacy catalog tab: pick first boot volume matching pattern, or skip when absent.
   */
  async selectBootableVolumeForInstanceTypesIfPresent(volumePattern: RegExp): Promise<boolean> {
    const row = this.instanceTypeRowMatching(volumePattern);
    if (!(await row.isVisible({ timeout: TestTimeouts.ELEMENT_WAIT }).catch(() => false))) {
      return false;
    }
    await this.acceptInstanceTypesDeveloperPreviewIfPrompted();
    await this.robustClick(row);
    return true;
  }

  async selectDiskSourceBlank(): Promise<void> {
    await this.openDiskSourceOptionsMenu();
    await this.page.getByRole('option', { name: /Blank Create a new blank PVC/ }).click();
  }

  async selectDiskSourceHttp(imageUrl: string): Promise<void> {
    const drawer = this.templateDrawer();
    const inputScope = (await drawer.isVisible().catch(() => false)) ? drawer : this.page;
    await this.openDiskSourceOptionsMenu();
    const urlOption = this.page
      .getByRole('menuitem', { name: /URL \(creates PVC\)/i })
      .or(this.page.getByRole('option', { name: /URL \(creates PVC\)/i }))
      .or(this.page.getByText(/^URL \(creates PVC\)$/i));
    await urlOption.first().click();
    await inputScope.locator('[data-test-id$="-http-source-input"]').first().fill(imageUrl);
  }

  async selectDiskSourcePvcClone(pvcNamespace: string, pvcName: string): Promise<void> {
    await this.ensureDiskSourcePvcCloneSelected();
    await this.selectPvcCloneProject(pvcNamespace);
    await this.pvcCloneNameDropdown().waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    const pvcPattern = new RegExp(pvcName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    await pollUntil(
      async () => {
        await this.selectPvcCloneProject(pvcNamespace).catch(() => undefined);
        await this.robustClick(this.pvcCloneNameDropdown());
        const option = this.page.getByRole('option', { name: pvcPattern });
        if (await option.isVisible().catch(() => false)) {
          await option.click();
          return true;
        }
        await this.page.keyboard.press('Escape').catch(() => undefined);
        return false;
      },
      {
        message: `Select PVC ${pvcName} in project ${pvcNamespace}`,
        timeout: TestTimeouts.LONG_OPERATION,
      },
    );
  }

  async selectDiskSourceRegistry(containerImage: string): Promise<void> {
    await this.openDiskSourceOptionsMenu();
    await this.page.getByRole('option', { name: /Registry \(creates PVC\)/ }).click();
    await this.page
      .locator('[data-test-id="disk-boot-source-container-source-input"]')
      .fill(containerImage);
  }

  async selectFirstBootableVolumeInWizard(): Promise<void> {
    await this.acceptInstanceTypesDeveloperPreviewIfPrompted();
    const volumeGrid = this.page.getByRole('grid').filter({
      has: this.page.getByRole('columnheader', { name: /Volume name/i }),
    });
    const dataRow = volumeGrid
      .getByRole('row')
      .filter({ has: this.page.getByRole('gridcell') })
      .filter({ hasNot: this.page.getByRole('columnheader') })
      .first()
      .or(
        this.page
          .getByRole('row')
          .filter({ hasText: /rhel|fedora|centos|windows/i })
          .filter({ has: this.page.getByRole('gridcell') })
          .first(),
      );
    await dataRow.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT }).catch(async () => {
      await dataRow.waitFor({ state: 'visible', timeout: TestTimeouts.LONG_OPERATION });
    });
    await dataRow.click();
    await this.clickWizardNextIfEnabled();
  }

  async selectFirstInstanceTypeRow(): Promise<void> {
    const row = this.page.getByRole('row').nth(1);
    await row.waitFor({ state: 'visible', timeout: TestTimeouts.LONG_OPERATION });
    await row.click();
  }

  async selectGuestOsTile(os: 'OTHER_LINUX' | 'RHEL' | 'WINDOWS'): Promise<void> {
    const next = this.wizardNextButton();
    await pollUntil(
      async () => {
        const current = (
          await this.page.locator('.pf-v6-c-wizard__nav-link.pf-m-current').allTextContents()
        ).join(' ');
        if (!/Guest OS/i.test(current)) {
          return true;
        }
        const tile = this.guestOsTile(os);
        if (!(await tile.isVisible().catch(() => false))) {
          return false;
        }
        await tile
          .click({ force: true })
          .catch(async () => tile.evaluate((el) => (el as HTMLElement).click()));
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
        if (await next.isDisabled().catch(() => true)) {
          const bootSourceNav = this.page.getByRole('button', { name: /^Boot source$/i });
          if (
            (await bootSourceNav.isVisible().catch(() => false)) &&
            !(await bootSourceNav.isDisabled().catch(() => true))
          ) {
            await bootSourceNav.click({ force: true }).catch(() => undefined);
            return !/Guest OS/i.test(
              (
                await this.page.locator('.pf-v6-c-wizard__nav-link.pf-m-current').allTextContents()
              ).join(' '),
            );
          }
          return false;
        }
        await next.click({ force: true });
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
        return !/Guest OS/i.test(
          (
            await this.page.locator('.pf-v6-c-wizard__nav-link.pf-m-current').allTextContents()
          ).join(' '),
        );
      },
      {
        message: `Guest OS (${os}) selection should enable Next and advance the wizard`,
        timeout: TestTimeouts.LONG_OPERATION,
      },
    );
  }

  async selectInstanceTypeSeriesAndSize(series: RegExp | string): Promise<void> {
    // 4.23 `/vm-wizard` Compute resources: data-test cards (instance-type-series-u1/n1/…).
    const seriesId =
      typeof series === 'string'
        ? series.replace(/series$/i, '').trim() || 'u'
        : /n\s*series|network/i.test(String(series))
          ? 'n'
          : /m\s*series|memory/i.test(String(series))
            ? 'm'
            : 'u';
    const seriesCard = this.page
      .locator(`[data-test="instance-type-series-${seriesId}"]`)
      .or(this.page.locator(`[data-test^="instance-type-series-${seriesId}"]`))
      .or(
        this.page.locator('.instance-type-series-menu-card__toggle-card').filter({
          hasText:
            seriesId === 'u'
              ? /General Purpose|U series/i
              : seriesId === 'n'
                ? /Network|N series/i
                : seriesId === 'm'
                  ? /Memory Intensive|M series/i
                  : new RegExp(`${seriesId}\\s*series`, 'i'),
        }),
      )
      .first();
    if (this.isVmWizardCatalogRoute() || EnvVariables.useVmWizardCatalogEntry) {
      await seriesCard.waitFor({ state: 'visible', timeout: TestTimeouts.LONG_OPERATION });
      await seriesCard.click({ force: true });
      const size = this.page
        .locator('[data-test^="instance-type-size-"]')
        .or(this.page.getByRole('button', { name: /medium:|small:|large:/i }))
        .first();
      if (await size.isVisible({ timeout: TestTimeouts.ELEMENT_WAIT }).catch(() => false)) {
        await size.click({ force: true });
      }
      await this.clickWizardNextIfEnabled();
      return;
    }
    if (await seriesCard.isVisible({ timeout: TestTimeouts.ELEMENT_WAIT }).catch(() => false)) {
      await seriesCard.click({ force: true });
      await this.clickWizardNextIfEnabled();
      return;
    }
    await this.instanceTypeSeriesLabel(series).click();
    const sizeOption = this.page
      .getByRole('menuitem')
      .filter({ hasNot: this.page.locator('[aria-current="true"]') })
      .first()
      .or(this.page.getByRole('menuitem').nth(1));
    if (await sizeOption.isVisible({ timeout: TestTimeouts.ELEMENT_WAIT }).catch(() => false)) {
      await this.robustClick(sizeOption);
      await this.page
        .getByRole('menu')
        .waitFor({ state: 'hidden', timeout: TestTimeouts.ELEMENT_WAIT })
        .catch(() => undefined);
    }
  }

  async selectPvcCloneProject(pvcNamespace: string): Promise<void> {
    await this.robustClick(this.pvcCloneProjectDropdown());
    const option = this.page.getByRole('option').filter({ hasText: pvcNamespace }).first();
    await option.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await option.click();
  }

  async selectRedHatInstanceTypeSeries(seriesTestId: string): Promise<void> {
    // 4.23 data-test ids are series+generation (u1/n1/…); older builds used bare "u"/"n".
    const id = (seriesTestId.replace(/series$/i, '').trim().charAt(0) || 'u');
    const seriesLabel =
      id === 'u'
        ? /General Purpose/i
        : id === 'n'
          ? /Network/i
          : id === 'm'
            ? /Memory Intensive/i
            : new RegExp(`\\b${id}\\s*series\\b`, 'i');
    const card = this.page
      .locator(
        `[data-test="instance-type-series-${id}1"], [data-test="instance-type-series-${id}"], [data-test^="instance-type-series-${id}"]`,
      )
      .or(
        this.page
          .locator('.instance-type-series-menu-card__toggle-card')
          .filter({ hasText: seriesLabel }),
      )
      .first();
    await card.waitFor({ state: 'visible', timeout: TestTimeouts.LONG_OPERATION });
    await card.click({ force: true });
    await pollUntil(
      async () =>
        (await card.getAttribute('aria-pressed').catch(() => null)) === 'true' ||
        (await card.evaluate((el) => el.classList.contains('selected')).catch(() => false)),
      {
        message: `Instance-type series ${id} card should be selected`,
        timeout: TestTimeouts.ELEMENT_WAIT,
      },
    );

    // Scope to size dropdown only — never match series cards (role=button name includes "Memory").
    // Always pick a size menu item: some builds set SELECTED_SIZE from the card but leave
    // SELECTED_INSTANCE_TYPE as series-only (memory 0 on create).
    const sizeToggle = this.page
      .locator(
        '.instance-type-series-menu-card__size-dropdown button, .instance-type-series-menu-card__size-dropdown .pf-v6-c-menu-toggle',
      )
      .first();
    await sizeToggle.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    const toggleText = ((await sizeToggle.textContent()) || '').trim();
    const preferredSize = (toggleText.split(':')[0] || '').trim() || 'medium';
    await sizeToggle.click({ force: true });
    const sizeOption = this.page
      .locator(`.instance-type-size-dropdown__menu [data-test="instance-type-size-${preferredSize}"]`)
      .or(this.page.locator(`[data-test="instance-type-size-${preferredSize}"]`))
      .or(this.page.locator('.instance-type-size-dropdown__menu [data-test^="instance-type-size-"]'))
      .or(this.page.locator('[data-test^="instance-type-size-"]'))
      .or(this.page.getByRole('menuitem', { name: /medium:|large:|small:/i }))
      .first();
    await sizeOption.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await sizeOption.click({ force: true });
    await this.page
      .locator('.instance-type-size-dropdown__menu')
      .waitFor({ state: 'hidden', timeout: TestTimeouts.UI_DELAY_MEDIUM })
      .catch(() => undefined);
    await this.clickWizardNextIfEnabled();
  }

  async selectTemplateByMetadataName(metadataName: string): Promise<void> {
    await this.ensureTemplateCatalogTabSelected();

    const drawer = this.templateDrawer();
    const closeDrawer = drawer.getByRole('button', { name: /^Close$/i });
    if (await closeDrawer.isVisible().catch(() => false)) {
      await closeDrawer.click();
      await drawer
        .waitFor({ state: 'hidden', timeout: TestTimeouts.ELEMENT_WAIT })
        .catch(() => undefined);
    }

    const filterHint = metadataName.replace(/-s390x$/i, '').split('-')[0];
    if (filterHint.length >= 3) {
      await this.filterByText(filterHint).catch(() => undefined);
    }

    const templateSelected = async (): Promise<boolean> => {
      if (
        (await this.templateDrawer()
          .isVisible()
          .catch(() => false)) ||
        (await this.legacyQuickCreateModalHeading()
          .isVisible()
          .catch(() => false)) ||
        (await this.customizeVirtualMachineButton()
          .isVisible()
          .catch(() => false))
      ) {
        return true;
      }
      const tile = this.templateTileByMetadataName(metadataName).first();
      const selected = await tile
        .evaluate(
          (el) =>
            el.classList.contains('pf-m-selected') ||
            el.classList.contains('pf-m-current') ||
            el.getAttribute('aria-checked') === 'true',
        )
        .catch(() => false);
      if (!selected) {
        return false;
      }
      return !(await this.wizardNextButton().isDisabled().catch(() => true));
    };

    await pollUntil(
      async () => {
        if (await templateSelected()) {
          return true;
        }
        const tile = this.templateTileByMetadataName(metadataName).first();
        if (!(await tile.isVisible().catch(() => false))) {
          return false;
        }
        if (!/\/vm-wizard|templatescatalog|\/catalog/i.test(this.page.url())) {
          return false;
        }
        await dismissConsoleObstructions(this.page);
        await tile.evaluate((el) => el.scrollIntoView({ block: 'center', inline: 'nearest' }));
        await tile.click({ force: true });
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
        return templateSelected();
      },
      {
        message: `Template tile ${metadataName} should open Quick create / Customize drawer`,
        timeout: TestTimeouts.LONG_OPERATION,
      },
    );
  }

  async selectUserProvidedInstanceType(name: string, resync?: () => Promise<void>): Promise<void> {
    let resyncCount = 0;
    const userTab = this.instanceTypesUserProvidedTab();
    const userPanel = this.userProvidedInstanceTypePanel();
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const namePattern = new RegExp(escaped, 'i');

    await pollUntil(
      async () => {
        if ((await userTab.getAttribute('aria-selected')) !== 'true') {
          await userTab.click();
        }
        if (!(await userPanel.isVisible().catch(() => false))) {
          return false;
        }

        const search = userPanel.getByPlaceholder(/Search by name/i);
        if (await search.isVisible().catch(() => false)) {
          if ((await search.inputValue()) !== name) {
            await search.fill(name);
          }
        }

        const row = userPanel
          .locator('table tbody tr, [role="grid"] [role="row"]')
          .filter({ hasText: namePattern })
          .first()
          .or(userPanel.getByRole('row', { name: namePattern }).first())
          .or(userPanel.getByRole('link', { name: namePattern }).first());

        if (await row.isVisible().catch(() => false)) {
          await row.click();
          return true;
        }

        if (
          await userPanel
            .getByText(/No InstanceTypes found/i)
            .isVisible()
            .catch(() => false)
        ) {
          if (resync && resyncCount < 5) {
            resyncCount += 1;
            await resync();
          }
          return false;
        }

        return false;
      },
      {
        intervalMs: 150,
        message: `User provided InstanceType ${name} should appear in catalog`,
        timeout: TestTimeouts.LONG_OPERATION,
      },
    );
  }

  /** Narrow the grid to Windows templates, then select the Win10 tile by metadata name. */
  async selectWindowsTemplate(metadataName = 'windows10-desktop-medium'): Promise<void> {
    await this.openCatalogFilterToolbar();
    await this.filterByOsCheckbox('osName-Windows', true);
    await this.selectTemplateByMetadataName(metadataName);
  }

  async selectYamlAndCliModalTab(tab: 'CLI' | 'YAML'): Promise<void> {
    await this.robustClick(this.yamlAndCliViewerModal().getByRole('tab', { name: tab }));
  }

  async setCustomizeDiskSizeGiB(giB: number): Promise<void> {
    const drawerOpen = await this.templateDrawer()
      .isVisible()
      .catch(() => false);
    if (drawerOpen) {
      await this.ensureTemplateDrawerStorageExpanded();
    }
    let scope = this.catalogDiskCustomizeScope();
    if (drawerOpen) {
      scope = this.templateDrawer();
    } else if (this.isCatalogTemplateReviewRoute()) {
      scope = this.page.locator('main');
    }
    const spin = scope.getByRole('spinbutton', { name: 'Input' }).first();
    await spin.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    const current = await spin.inputValue();
    if (current === String(giB)) {
      return;
    }
    await spin.click({ clickCount: 3 });
    await spin.fill(String(giB));
    await spin.press('Tab').catch(() => undefined);
  }

  async shouldUseLegacyCatalogRoute(): Promise<boolean> {
    if (this.isLegacyTemplatesCatalogRoute()) {
      return true;
    }
    if (!this.isVmWizardCatalogRoute()) {
      return false;
    }
    return await this.isVmWizardRouteUnavailable();
  }

  /**
   * Catalog tile → customize parameters → review wizard (does not create the VM).
   */
  async startCustomizeFlow(templateMetadataName: string, vmName: string): Promise<void> {
    if (this.isVmWizardCatalogRoute()) {
      await this.setWizardDeploymentVmName(vmName);
      const templateNav = this.page.getByRole('button', { name: /^Template$/i });
      if (await templateNav.isVisible().catch(() => false)) {
        const current = (
          await this.page.locator('.pf-v6-c-wizard__nav-link.pf-m-current').allTextContents()
        ).join(' ');
        if (!/Template/i.test(current)) {
          await templateNav.click();
        }
      }
    }
    await this.selectTemplateByMetadataName(templateMetadataName);
    if (
      await this.legacyQuickCreateModalHeading()
        .isVisible()
        .catch(() => false)
    ) {
      await this.robustClick(this.customizeVirtualMachineButton().first());
      await this.waitForCustomizeStepReady();
      if (
        await this.reviewWizardHeading()
          .isVisible()
          .catch(() => false)
      ) {
        await this.fillReviewWizardVmName(vmName);
        return;
      }
      await this.fillCustomizeVmName(vmName);
      await this.submitCustomizeToReview();
      return;
    }
    await this.openCustomizeWizard();
    if (
      await this.reviewWizardHeading()
        .isVisible()
        .catch(() => false)
    ) {
      await this.fillReviewWizardVmName(vmName);
      return;
    }
    if (this.isVmWizardCatalogRoute()) {
      await this.submitCustomizeToReview();
      await this.fillReviewWizardVmName(vmName).catch(() => undefined);
      return;
    }
    await this.fillCustomizeVmName(vmName);
    await this.submitCustomizeToReview();
  }

  async startCustomizeFlowOnReviewNetworksTab(
    templateMetadataName: string,
    vmName: string,
  ): Promise<void> {
    await this.startCustomizeFlow(templateMetadataName, vmName);
    await this.goToReviewWizardTab(CatalogReviewTabTestId.Networks);
  }

  async submitCustomizeToReview(): Promise<void> {
    const legacySubmit = this.page.locator('[data-test-id="customize-vm-submit-button"]');
    if (await legacySubmit.isVisible().catch(() => false)) {
      await legacySubmit.click();
      await this.waitForReviewWizardReady();
      return;
    }
    // `/vm-wizard`: Customization → Review may need a forced Next; poll until Create appears.
    await pollUntil(
      async () => {
        if (await this.reviewWizardFooterAttached()) {
          return true;
        }
        const next = this.wizardNextButton();
        if (!(await next.isDisabled().catch(() => true))) {
          await next.click({ force: true });
          await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
        }
        const reviewNav = this.page.getByRole('button', { name: /^Review and create$/i });
        if (
          (await reviewNav.isVisible().catch(() => false)) &&
          !(await reviewNav.isDisabled().catch(() => true))
        ) {
          await reviewNav.click({ force: true }).catch(() => undefined);
        }
        return this.reviewWizardFooterAttached();
      },
      {
        message: 'Catalog template review wizard should be ready',
        timeout: TestTimeouts.LONG_OPERATION,
      },
    );
  }

  templateCatalogTab(): Locator {
    return this.page.getByRole('tab', { name: /Template catalog/i });
  }

  templateTileByMetadataName(metadataName: string): Locator {
    // 4.23 TemplatesCatalogTile: Card onClick + data-test={name} (hidden radio is a11y-only).
    return this.page
      .locator(`.templates-catalog-tile[data-test="${metadataName}"]`)
      .or(
        this.page.locator(
          `[data-test="${metadataName}"].pf-v6-c-card, [data-test="${metadataName}"].pf-c-card`,
        ),
      )
      .or(this.page.locator(`[data-test="${metadataName}"]`))
      .or(this.page.locator(`[data-test-id="${metadataName}"]`))
      .or(this.consoleTestId(metadataName))
      .or(
        this.page.locator('.vm-catalog-grid-tile, .templates-catalog-tile, .pf-v6-c-card').filter({
          hasText: metadataName,
        }),
      )
      .filter({ visible: true });
  }

  userProvidedInstanceTypePanel(): Locator {
    return this.page.getByRole('tabpanel', { name: /^User provided$/i });
  }

  userProvidedInstanceTypeRow(name: string): Locator {
    const panel = this.userProvidedInstanceTypePanel();
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const namePattern = new RegExp(escaped, 'i');
    return panel
      .locator('table tbody tr, [role="grid"] [role="row"]')
      .filter({ hasText: namePattern })
      .first()
      .or(panel.getByRole('row', { name: namePattern }).first())
      .or(panel.getByRole('link', { name: namePattern }).first());
  }

  viewYamlAndCliButton(): Locator {
    return this.page
      .locator('.create-vm-instance-type-footer')
      .getByRole('button', { name: /View YAML & CLI/i })
      .or(this.page.getByRole('button', { name: /View YAML & CLI/i }));
  }

  virtualMachineDetailUrlPattern(vmName: string): RegExp {
    return new RegExp(`VirtualMachine/${vmName}`);
  }

  async waitForCatalogInNamespace(namespace: string): Promise<void> {
    await this.page.waitForURL(this.catalogEntryUrlPattern(namespace), {
      timeout: TestTimeouts.LONG_OPERATION,
    });
    await this.waitForTemplateCatalogReady();
  }

  async waitForCustomizeStepReady(): Promise<void> {
    await this.customizeStepReady().waitFor({
      state: 'visible',
      timeout: TestTimeouts.LONG_OPERATION,
    });
  }

  async waitForInstanceTypesCatalogRouteReady(namespace: string): Promise<void> {
    if (EnvVariables.useLegacyCatalogEntry) {
      await waitForConsoleRouteReady(
        this.page,
        ConsoleRoutes.legacyInstanceTypesCatalog(namespace),
        this.instanceTypesTabPanel(),
        'InstanceTypes catalog',
      );
      return;
    }
    // 4.22+: InstanceTypes catalog tab is gone — Custom configuration on `/vm-wizard`.
    if (EnvVariables.useVmWizardCatalogEntry) {
      const ready = await this.prepareInstanceTypeWizardEntry(namespace);
      if (!ready) {
        throw new Error('Instance-type wizard did not open on /vm-wizard');
      }
      return;
    }
    await this.openCatalogInNamespace(namespace);
    await this.prepareInstanceTypesCatalogTab();
  }

  async waitForReviewRootdiskOnDisksTab(sizeGiB?: number): Promise<void> {
    await this.goToReviewWizardTab(CatalogReviewTabTestId.Disks);
    await this.reviewRootdiskLabel().waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    if (sizeGiB === undefined) {
      await this.reviewRootdiskAnySizeLabel().waitFor({
        state: 'visible',
        timeout: TestTimeouts.ELEMENT_WAIT,
      });
      return;
    }
    await pollUntil(
      async () => {
        if (
          await this.reviewRootdiskSizeLabel(sizeGiB)
            .isVisible()
            .catch(() => false)
        ) {
          return true;
        }
        if (
          await this.templateDrawer()
            .isVisible()
            .catch(() => false)
        ) {
          await this.setCustomizeDiskSizeGiB(sizeGiB).catch(() => undefined);
          return false;
        }
        if (this.isCatalogTemplateReviewRoute()) {
          await this.setCustomizeDiskSizeGiB(sizeGiB).catch(() => undefined);
        }
        return false;
      },
      {
        message: `Review disks tab should show rootdisk size ${sizeGiB} GiB`,
        timeout: TestTimeouts.ELEMENT_WAIT,
      },
    );
  }

  async waitForReviewWizardReady(): Promise<void> {
    await pollUntil(async () => await this.reviewWizardFooterAttached(), {
      message: 'Catalog template review wizard should be ready',
      timeout: TestTimeouts.LONG_OPERATION,
    });
  }

  /** Template list is ready when at least one *visible* template tile is shown. */
  async waitForTemplateCatalogReady(): Promise<void> {
    await this.ensureTemplateCatalogTabSelected();
    await pollUntil(
      async () => {
        const tiles = this.templateGridLinks();
        const count = await tiles.count();
        for (let i = 0; i < Math.min(count, 8); i += 1) {
          if (
            await tiles
              .nth(i)
              .isVisible()
              .catch(() => false)
          ) {
            return true;
          }
        }
        return false;
      },
      {
        message: 'Template catalog grid should list at least one visible template',
        timeout: TestTimeouts.LONG_OPERATION,
      },
    );
    await dismissConsoleObstructions(this.page);
  }

  async waitForYamlAndCliModalManifest(vmName: string): Promise<void> {
    await pollUntil(
      async () => {
        const text = await this.readYamlAndCliModalEditorText();
        return text.includes(vmName) && /kind:\s*VirtualMachine/i.test(text);
      },
      {
        message: `View YAML & CLI modal should show VirtualMachine manifest for ${vmName}`,
        timeout: TestTimeouts.LONG_OPERATION,
      },
    );
  }

  /** Open PVC list once so the console watch has names before catalog clone picker. */
  async warmNamespacePvcInformer(namespace: string): Promise<void> {
    await this.page.goto(`/k8s/ns/${namespace}/persistentvolumeclaims`, {
      waitUntil: 'domcontentloaded',
    });
    await dismissConsoleObstructions(this.page);
    await this.page
      .getByRole('grid', { name: /PersistentVolumeClaims/i })
      .or(this.page.locator('[data-test="resource-list"]'))
      .first()
      .waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT })
      .catch(() => undefined);
  }

  wizardNextButton(): Locator {
    return this.page
      .locator('.vm-creation-wizard')
      .getByRole('button', { name: /^Next$/i })
      .or(this.page.getByTestId('wizard-next-button'))
      .or(this.page.locator('[data-test="wizard-next-button"]'))
      .first();
  }

  workloadFilterGroup(): Locator {
    return this.page
      .locator('fieldset[aria-labelledby="workload"]')
      .or(this.page.getByText('Workload', { exact: true }));
  }

  yamlAndCliModalCopyButton(): Locator {
    return this.yamlAndCliModalEditorToolbarButtons().nth(1);
  }

  yamlAndCliModalDownloadButton(): Locator {
    return this.yamlAndCliModalEditorToolbarButtons().nth(0);
  }

  yamlAndCliViewerModal(): Locator {
    return this.page.getByRole('dialog').filter({ hasText: /YAML for|CLI for/i });
  }
}
