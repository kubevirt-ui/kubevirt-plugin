import type RequestContextClient from '@/clients/request-context-client';
import FilterToolbarComponent from '@/components/shared/filter-toolbar-component';
import BasePage from '@/page-objects/base-page';
import { dismissConsoleObstructions } from '@/utils/console-modals';
import { ConsoleRoutes } from '@/utils/console-routes';
import { CatalogReviewTabTestId } from '@/utils/constants';
import { EnvVariables } from '@/utils/env-variables';
import { waitForConsoleRouteReady } from '@/utils/instance-types-policy';
import { pollUntil } from '@/utils/poll-until';
import { SECOND, TestTimeouts } from '@/utils/test-config';
import type { Locator, Page } from '@playwright/test';

/** VM creation wizard — template catalog step (`/k8s/ns/<ns>/vm-wizard`). */
export class CatalogPage extends BasePage {
  private readonly catalogFilterToolbar: FilterToolbarComponent;

  readonly filterTextSelector =
    '#filter-text-input, [data-test="search-catalog"] input, [placeholder*="Filter by keyword"]';

  readonly gridSelector = '#vm-catalog-grid, .vm-catalog-grid, .co-catalog-page__grid';
  constructor(page: Page) {
    super(page);
    this.catalogFilterToolbar = new FilterToolbarComponent(page);
  }

  /** Create stays disabled until volume, series/size, and name validate — dismiss preview modals while waiting. */
  private async clickInstanceTypeCreateWhenReady(): Promise<void> {
    const create = this.instanceTypeCreateVirtualMachineButton();
    await pollUntil(
      async () => {
        await this.acceptInstanceTypesDeveloperPreviewIfPrompted();
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
    await this.page.waitForURL(/kubevirt\.io~v1~VirtualMachine\/[^/]+/, {
      timeout: TestTimeouts.LONG_OPERATION,
    });
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

  private async isQuickCreateNameInputVisible(): Promise<boolean> {
    return this.quickCreateVmNameInputCandidates()
      .first()
      .isVisible()
      .catch(() => false);
  }

  private async isVmWizardRouteUnavailable(): Promise<boolean> {
    const missing = this.vmWizardRouteMissingHeading();
    const notFound = this.page.getByRole('heading', { name: /404: Page Not Found/i });
    const deadline = Date.now() + 20 * SECOND;
    while (Date.now() < deadline) {
      for (const frame of this.page.frames()) {
        if (await missing.isVisible().catch(() => false)) {
          return true;
        }
        if (
          await frame
            .getByText(/doesn't have a resource type "vm-wizard"/i)
            .isVisible()
            .catch(() => false)
        ) {
          return true;
        }
        if (
          await frame
            .getByRole('heading', { name: /404: Page Not Found/i })
            .isVisible()
            .catch(() => false)
        ) {
          return true;
        }
      }
      if (await notFound.isVisible().catch(() => false)) {
        return true;
      }
      await this.page.waitForTimeout(500);
    }
    return false;
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

  private templateDrawer(): Locator {
    return this.page.getByRole('dialog', { name: /Template drawer/i });
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
      '#vm-catalog-grid a, .vm-catalog-grid a, .vm-catalog-grid-tile a, .templates-catalog-tile a, [role="tabpanel"][aria-label*="Template catalog"] a',
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

  private async tryQuickCreateInTemplateDrawer(vmName: string): Promise<boolean> {
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
    if (!(await this.waitForDrawerQuickCreateEnabled())) {
      return false;
    }
    await this.robustClick(this.drawerQuickCreateSubmitButton());
    await this.confirmQuickCreateBootSourceAndWaitForVm();
    return true;
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
    return this.page.getByRole('row').filter({ hasText: volumeName }).first();
  }

  catalogEntryUrlPattern(namespace: string): RegExp {
    return new RegExp(`/ns/${namespace}/(vm-wizard|templatescatalog)`);
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

  async completeLegacyQuickCreateModal(vmName: string): Promise<void> {
    await this.openLegacyQuickCreateModal();
    await this.fillCustomizeVmName(vmName);
    await this.clickQuickCreateSubmit(this.quickCreateSubmitScope());
    await this.confirmQuickCreateBootSourceAndWaitForVm();
  }

  createVirtualMachineButton(): Locator {
    return this.page.getByRole('button', { name: /Create VirtualMachine/i });
  }

  async createVirtualMachineFromInstanceTypesCatalog(options: {
    bootVolumeName: string;
    series: RegExp | string;
    vmName: string;
  }): Promise<void> {
    if (!/\/instanceTypes/i.test(this.page.url())) {
      await this.prepareInstanceTypesCatalogTab();
    } else {
      await this.acceptInstanceTypesDeveloperPreviewIfPrompted();
      await this.instanceTypesGrid().waitFor({
        state: 'visible',
        timeout: TestTimeouts.LONG_OPERATION,
      });
    }
    const volumePattern = new RegExp(options.bootVolumeName, 'i');
    const volumeSelected = await this.selectBootableVolumeForInstanceTypesIfPresent(volumePattern);
    if (!volumeSelected) {
      await this.selectBootableVolumeForInstanceTypes(options.bootVolumeName);
    }
    await this.selectInstanceTypeSeriesAndSize(options.series);
    await this.instanceTypeVmNameInput().fill(options.vmName);
    await this.clickInstanceTypeCreateWhenReady();
    await this.page
      .waitForURL(/kubevirt\.io~v1~VirtualMachine\/[^/]+/, {
        timeout: TestTimeouts.TEST_VM_CREATION,
      })
      .catch(() => undefined);
  }

  async createVirtualMachineFromReview(): Promise<void> {
    const createBtn = this.page
      .locator('[data-test-id="create-virtual-machine"]')
      .getByRole('button', { name: /Create VirtualMachine/i });
    await createBtn.waitFor({ state: 'visible', timeout: TestTimeouts.LONG_OPERATION });
    await createBtn.click();
    const noBs = this.page.getByRole('button', { name: 'Create with no available boot source' });
    if (await noBs.isVisible({ timeout: 3 * SECOND }).catch(() => false)) {
      await noBs.click();
    }
    await this.page.waitForURL(/kubevirt\.io~v1~VirtualMachine\/[^/]+$/, {
      timeout: TestTimeouts.LONG_OPERATION,
    });
  }

  async createWindowsVmCustomizeFlow(
    vmName: string,
    configureDiskSource: () => Promise<void>,
    review: { rootDiskSizeGiB?: number } = {},
  ): Promise<void> {
    await this.openCustomizeWizard();
    await this.customizePageHeading().waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
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

  async ensureDiskSourcePvcCloneSelected(): Promise<void> {
    const menu = this.diskBootSourceSection().getByRole('button', { name: 'Options menu' }).first();
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
    const storageClassName =
      process.env.E2E_STORAGE_CLASS ||
      process.env.TEST_STORAGE_CLASS ||
      (await apiClient.fetchDefaultStorageClassName());
    await apiClient.applyPersistentVolumeClaim(namespace, name, sizeGiB, storageClassName);
    await apiClient.waitForPersistentVolumeClaimBound(name, namespace, TestTimeouts.LONG_OPERATION);
  }

  /** Legacy `templatescatalog` tab UI — stay on template tiles, not InstanceTypes. */
  async ensureTemplateCatalogTabSelected(): Promise<void> {
    const tab = this.templateCatalogTab();
    if (!(await tab.isVisible().catch(() => false))) {
      return;
    }
    if ((await tab.getAttribute('aria-selected')) !== 'true') {
      await tab.click();
    }
  }

  /**
   * VM wizard deployment step — pick Template catalog.
   * Default wizard creation method is **instance-type**; InstanceTypes is developer preview
   * (`kubevirt-ui-features` / `instanceTypesEnabled`). Catalog CRUD specs stay on templates.
   */
  async ensureTemplateCreationMethodSelected(): Promise<void> {
    const instanceTile = this.creationMethodInstanceTypeTile();
    const templateTile = this.creationMethodTemplateTile();
    if (!(await templateTile.isVisible().catch(() => false))) {
      return;
    }
    const templateSelected = await templateTile.evaluate(
      (el) => el.classList.contains('pf-m-selected') || el.getAttribute('aria-checked') === 'true',
    );
    if (!templateSelected) {
      await templateTile.click();
    }
    if (await instanceTile.isVisible().catch(() => false)) {
      const instanceSelected = await instanceTile.evaluate(
        (el) =>
          el.classList.contains('pf-m-selected') || el.getAttribute('aria-checked') === 'true',
      );
      if (instanceSelected) {
        await templateTile.click();
      }
    }
  }

  async fillCustomizeVmName(name: string): Promise<void> {
    await pollUntil(
      async () => {
        try {
          if (!(await this.isQuickCreateNameInputVisible())) {
            if (
              !(await this.customizePageHeading()
                .isVisible()
                .catch(() => false))
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

  async filterByOsCheckbox(testId: string, checked: boolean): Promise<void> {
    await this.catalogFilterToolbar.setCatalogCheckboxFilter(testId, checked);
  }

  async filterByText(text: string): Promise<void> {
    await this.catalogFilterToolbar.filterCatalogByText(text);
  }

  async filterInstanceTypesBootVolumesByText(text: string): Promise<void> {
    const search = this.instanceTypesBootVolumeSearchInput();
    await search.waitFor({ state: 'visible', timeout: TestTimeouts.LONG_OPERATION });
    await search.fill(text);
  }

  filterTextInput(): Locator {
    return this.page
      .locator('#filter-text-input input, [data-test="search-catalog"] input')
      .or(this.page.getByRole('textbox', { name: /Filter by keyword/i }))
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
    await this.page.goto(ConsoleRoutes.legacyInstanceTypesCatalog(namespace), {
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
    return this.page
      .getByRole('listitem')
      .filter({ hasText: /VirtualMachine details/i })
      .getByRole('textbox')
      .first();
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

  isLegacyTemplatesCatalogRoute(): boolean {
    return /templatescatalog/.test(this.page.url());
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

  async openCatalogInNamespace(namespace: string): Promise<void> {
    await this.page.goto(ConsoleRoutes.catalog(namespace), {
      waitUntil: 'domcontentloaded',
    });
    await dismissConsoleObstructions(this.page);
    if (this.isLegacyTemplatesCatalogRoute() || (await this.shouldUseLegacyCatalogRoute())) {
      await this.ensureTemplateCatalogTabSelected();
      await this.waitForTemplateCatalogReady();
      return;
    }
    await this.prepareTemplateCatalogGrid();
  }

  async openCatalogPrepared(namespace: string): Promise<void> {
    await this.openCatalogInNamespace(namespace);
    await dismissConsoleObstructions(this.page);
  }

  async openCustomizeNetworkInterfacesTab(
    projectNamespace: string,
    templateMetadataName: string,
    _options: { templateNamespace?: string; vmName?: string } = {},
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
    if (
      await this.templateDrawer()
        .isVisible()
        .catch(() => false)
    ) {
      await this.robustClick(this.templateDrawerCustomizeButton());
      await this.page
        .waitForURL(/templatescatalog\/customize/, {
          timeout: TestTimeouts.LONG_OPERATION,
        })
        .catch(() => undefined);
      await this.customizePageHeading().waitFor({
        state: 'visible',
        timeout: TestTimeouts.LONG_OPERATION,
      });
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
    await this.diskBootSourceSection().getByRole('button', { name: 'Options menu' }).click();
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
   * Reach boot-volume selection in the InstanceTypes create flow (legacy catalog tab or vm-wizard boot source step).
   */
  async openInstanceTypesBootVolumeCreationStep(namespace: string): Promise<void> {
    if ((await this.shouldUseLegacyCatalogRoute()) || EnvVariables.useLegacyCatalogEntry) {
      await this.goToInstanceTypesCatalog(namespace);
      await this.acceptInstanceTypesDeveloperPreviewIfPrompted();
      return;
    }
    await this.openCatalogInNamespace(namespace);
    await this.ensureInstanceTypeCreationMethodSelected();
    await this.clickWizardNextIfEnabled();
    const guestOsTile = this.guestOsTile('RHEL');
    if (await guestOsTile.isVisible({ timeout: TestTimeouts.ELEMENT_WAIT }).catch(() => false)) {
      await this.selectGuestOsTile('RHEL');
    }
  }

  async openInstanceTypesCatalogTab(): Promise<void> {
    const namespace = this.namespaceFromCurrentUrl();
    if (this.isLegacyTemplatesCatalogRoute() || (await this.shouldUseLegacyCatalogRoute())) {
      await this.page.goto(ConsoleRoutes.legacyInstanceTypesCatalog(namespace), {
        waitUntil: 'domcontentloaded',
      });
      await dismissConsoleObstructions(this.page);
      await this.page.waitForURL(/instanceTypes/i, { timeout: TestTimeouts.LONG_OPERATION });
      await pollUntil(
        async () => (await this.instanceTypesCatalogTab().getAttribute('aria-selected')) === 'true',
        {
          message: 'InstanceTypes catalog tab should be selected',
          timeout: TestTimeouts.LONG_OPERATION,
        },
      );
      return;
    }
    const tab = this.instanceTypesCatalogTab();
    await tab.waitFor({ state: 'visible', timeout: TestTimeouts.LONG_OPERATION });
    await tab.click();
    await this.page.waitForURL(/instanceTypes/i, { timeout: TestTimeouts.LONG_OPERATION });
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

  osNameFilterGroup(): Locator {
    return this.page
      .locator('fieldset[aria-labelledby="osName"]')
      .or(this.page.getByText('Operating system', { exact: true }));
  }

  pickCatalogPvcCloneName(pvcNames: string[], preferredNamePrefix: string): string {
    return (
      pvcNames.find((name) => /win10|windows|^win/i.test(name)) ??
      pvcNames.find((name) => name.startsWith(preferredNamePrefix)) ??
      pvcNames[0]
    );
  }

  /** VM wizard instance-type flow (skipped on legacy `templatescatalog` clusters). */
  async prepareInstanceTypeWizardEntry(namespace: string): Promise<boolean> {
    await this.page.goto(ConsoleRoutes.catalog(namespace), { waitUntil: 'domcontentloaded' });
    await dismissConsoleObstructions(this.page);
    if (this.isLegacyTemplatesCatalogRoute() || (await this.shouldUseLegacyCatalogRoute())) {
      return false;
    }
    await this.ensureInstanceTypeCreationMethodSelected();
    await this.clickWizardNextIfEnabled();
    return true;
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
      await this.page
        .locator('#vm-catalog-grid, .vm-catalog-grid')
        .first()
        .isVisible()
        .catch(() => false)
    ) {
      return;
    }

    await this.ensureTemplateCreationMethodSelected();
    const next = this.wizardNextButton();
    if (await next.isEnabled().catch(() => false)) {
      await next.click();
    }

    await this.waitForTemplateCatalogReady();
  }

  pvcCloneNameDropdown(): Locator {
    return this.page.locator(
      '[data-test-id="disk-boot-source-pvc-select-pvc-name-select-dropdown"]',
    );
  }

  pvcCloneProjectDropdown(): Locator {
    return this.page.locator(
      '[data-test-id="disk-boot-source-pvc-select-project-select-dropdown"]',
    );
  }

  quickCreateButton(): Locator {
    return this.consoleTestId('quick-create-vm-btn');
  }

  async quickCreateVm(vmName: string): Promise<void> {
    if (await this.tryQuickCreateInTemplateDrawer(vmName)) {
      return;
    }

    if (await this.tryCreateVmFromTemplateDrawerCustomize(vmName)) {
      return;
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
      return;
    }

    if (
      this.isLegacyTemplatesCatalogRoute() &&
      (await this.legacyQuickCreateToolbarButton()
        .isVisible()
        .catch(() => false))
    ) {
      await this.completeLegacyQuickCreateModal(vmName);
      return;
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
        return;
      }
      await this.fillCustomizeVmName(vmName);
      await this.submitCustomizeToReview();
      await this.createVirtualMachineFromReview();
      return;
    }

    if (
      await this.customizeButton()
        .isVisible()
        .catch(() => false)
    ) {
      await this.openCustomizeWizard();
      await this.fillCustomizeVmName(vmName);
      await this.submitCustomizeToReview();
      await this.createVirtualMachineFromReview();
      return;
    }

    await this.clickWizardNextIfEnabled();
    await this.waitForCustomizeStepReady();
    await this.fillCustomizeVmName(vmName);
    await this.submitCustomizeToReview();
    await this.createVirtualMachineFromReview();
  }

  reviewRootdiskAnySizeLabel(): Locator {
    return this.page.getByText(/\d+\s*GiB/i).first();
  }

  reviewRootdiskLabel(): Locator {
    return this.page.getByText('rootdisk', { exact: false }).first();
  }

  reviewRootdiskSizeLabel(sizeGiB: number): Locator {
    return this.page.getByText(new RegExp(`${sizeGiB}\\s*GiB`, 'i')).first();
  }

  reviewVisibleText(text: RegExp | string): Locator {
    return this.page.getByText(text, { exact: false }).first();
  }

  reviewWizardHeading(): Locator {
    return this.page.getByRole('heading', {
      name: /Review and create VirtualMachine|Review and create/i,
    });
  }

  reviewWizardReady(): Locator {
    return this.reviewWizardHeading()
      .or(this.consoleTestId('horizontal-link-Overview'))
      .or(this.consoleTestId('horizontal-link-Network interfaces'))
      .first();
  }

  reviewWizardTab(testId: string): Locator {
    return this.consoleTestId(testId);
  }

  async selectBootableVolumeForInstanceTypes(volumeName: string): Promise<void> {
    await this.acceptInstanceTypesDeveloperPreviewIfPrompted();
    const row = this.bootableVolumeRowForInstanceTypes(volumeName);
    await row.scrollIntoViewIfNeeded();
    await this.robustClick(row);
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
    await this.openDiskSourceOptionsMenu();
    await this.page.getByRole('option', { name: /URL \(creates PVC\)/ }).click();
    await this.page.locator('[data-test-id="disk-boot-source-http-source-input"]').fill(imageUrl);
  }

  async selectDiskSourcePvcClone(pvcNamespace: string, pvcNamePrefix: string): Promise<void> {
    await this.ensureDiskSourcePvcCloneSelected();
    await this.selectPvcCloneProject(pvcNamespace);
    await this.pvcCloneNameDropdown().waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await this.selectPvcCloneNameByPrefix(pvcNamePrefix);
  }

  async selectDiskSourceRegistry(containerImage: string): Promise<void> {
    await this.openDiskSourceOptionsMenu();
    await this.page.getByRole('option', { name: /Registry \(creates PVC\)/ }).click();
    await this.page
      .locator('[data-test-id="disk-boot-source-container-source-input"]')
      .fill(containerImage);
  }

  async selectFirstBootableVolumeInWizard(): Promise<void> {
    const row = this.page.getByRole('row').nth(1);
    await row.waitFor({ state: 'visible', timeout: TestTimeouts.LONG_OPERATION });
    await row.click();
    await this.clickWizardNextIfEnabled();
  }

  async selectFirstInstanceTypeRow(): Promise<void> {
    const row = this.page.getByRole('row').nth(1);
    await row.waitFor({ state: 'visible', timeout: TestTimeouts.LONG_OPERATION });
    await row.click();
  }

  async selectGuestOsTile(os: 'OTHER_LINUX' | 'RHEL' | 'WINDOWS'): Promise<void> {
    const tile = this.guestOsTile(os);
    await tile.waitFor({ state: 'visible', timeout: TestTimeouts.LONG_OPERATION });
    await tile.click();
    await this.clickWizardNextIfEnabled();
  }

  async selectInstanceTypeSeriesAndSize(series: RegExp | string): Promise<void> {
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

  async selectPvcCloneNameByPrefix(pvcNamePrefix: string): Promise<void> {
    const toggle = this.pvcCloneNameDropdown().getByRole('button', { name: /PVC name/i });
    await toggle.click();
    const listbox = this.page.getByRole('listbox', { name: /PVC name/i });
    await pollUntil(
      async () => {
        if (
          await listbox
            .getByText(/No results found/i)
            .isVisible()
            .catch(() => false)
        ) {
          return true;
        }
        return (await listbox.getByRole('option').count()) > 0;
      },
      {
        message: 'PVC name dropdown should finish loading',
        timeout: TestTimeouts.LONG_OPERATION,
      },
    );
    if (
      await listbox
        .getByText(/No results found/i)
        .isVisible()
        .catch(() => false)
    ) {
      throw new Error('No PVCs available for clone in the selected project');
    }
    const pattern = new RegExp(pvcNamePrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const preferred = listbox.getByRole('option').filter({ hasText: pattern }).first();
    const option = (await preferred.isVisible().catch(() => false))
      ? preferred
      : listbox.getByRole('option').first();
    await option.click();
  }

  async selectPvcCloneProject(pvcNamespace: string): Promise<void> {
    await this.pvcCloneProjectDropdown().getByRole('button').click();
    await this.page.getByRole('option', { name: pvcNamespace }).click();
  }

  async selectRedHatInstanceTypeSeries(seriesTestId: string): Promise<void> {
    const card = this.page.locator(`[data-test="instance-type-series-${seriesTestId}"]`);
    await card.waitFor({ state: 'visible', timeout: TestTimeouts.LONG_OPERATION });
    await card.click();
    const size = this.page.locator('[data-test^="instance-type-size-"]').first();
    if (await size.isVisible({ timeout: TestTimeouts.ELEMENT_WAIT }).catch(() => false)) {
      await size.click();
    }
    await this.clickWizardNextIfEnabled();
  }

  async selectTemplateByMetadataName(metadataName: string): Promise<void> {
    const drawer = this.templateDrawer();
    const closeDrawer = drawer.getByRole('button', { name: /^Close$/i });
    if (await closeDrawer.isVisible().catch(() => false)) {
      await closeDrawer.click();
      await drawer
        .waitFor({ state: 'hidden', timeout: TestTimeouts.ELEMENT_WAIT })
        .catch(() => undefined);
    }
    const tile = this.templateTileByMetadataName(metadataName);
    await tile.first().waitFor({ state: 'visible', timeout: TestTimeouts.LONG_OPERATION });
    await this.robustClick(tile.first());
  }

  /** Narrow the grid to Windows templates, then select the Win10 tile by metadata name. */
  async selectWindowsTemplate(metadataName = 'windows10-desktop-medium'): Promise<void> {
    await this.openCatalogFilterToolbar();
    await this.filterByOsCheckbox('osName-Windows', true);
    await this.selectTemplateByMetadataName(metadataName);
  }

  async setCustomizeDiskSizeGiB(giB: number): Promise<void> {
    const spin = this.page
      .locator('.customize-vm')
      .getByRole('spinbutton', { name: 'Input' })
      .first();
    await spin.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    const current = await spin.inputValue();
    if (current === String(giB)) {
      return;
    }
    await spin.click({ clickCount: 3 });
    await spin.pressSequentially(String(giB));
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
    await this.selectTemplateByMetadataName(templateMetadataName);
    await this.openCustomizeWizard();
    if (
      await this.reviewWizardHeading()
        .isVisible()
        .catch(() => false)
    ) {
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
    } else {
      await this.clickWizardNextIfEnabled();
    }
    await this.waitForReviewWizardReady();
  }

  templateCatalogTab(): Locator {
    return this.page.getByRole('tab', { name: /Template catalog/i });
  }

  templateTileByMetadataName(metadataName: string): Locator {
    return this.page
      .locator(`[data-test="${metadataName}"]`)
      .or(this.consoleTestId(metadataName))
      .or(
        this.page.locator('.vm-catalog-grid-tile, .templates-catalog-tile').filter({
          hasText: metadataName,
        }),
      );
  }

  virtualMachineDetailUrlPattern(vmName: string): RegExp {
    return new RegExp(`VirtualMachine/${vmName}`);
  }

  async waitForCatalogInNamespace(namespace: string): Promise<void> {
    await this.page.waitForURL(new RegExp(`/ns/${namespace}/(vm-wizard|templatescatalog)`), {
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
    await waitForConsoleRouteReady(
      this.page,
      ConsoleRoutes.legacyInstanceTypesCatalog(namespace),
      this.instanceTypesTabPanel(),
      'InstanceTypes catalog',
    );
  }

  async waitForReviewRootdiskOnDisksTab(sizeGiB?: number): Promise<void> {
    await this.goToReviewWizardTab(CatalogReviewTabTestId.Disks);
    await this.reviewRootdiskLabel().waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    const sizeLocator =
      sizeGiB !== undefined
        ? this.reviewRootdiskSizeLabel(sizeGiB)
        : this.reviewRootdiskAnySizeLabel();
    await sizeLocator.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
  }

  async waitForReviewWizardReady(): Promise<void> {
    await this.reviewWizardReady().waitFor({
      state: 'visible',
      timeout: TestTimeouts.LONG_OPERATION,
    });
  }

  /** Template list is ready (wizard grid, legacy tab panel, or at least one template tile). */
  async waitForTemplateCatalogReady(): Promise<void> {
    const deadline = Date.now() + 90 * SECOND;
    while (Date.now() < deadline) {
      if (
        await this.page
          .locator('#vm-catalog-grid, .vm-catalog-grid')
          .first()
          .isVisible()
          .catch(() => false)
      ) {
        return;
      }
      if (
        await this.templateGridLinks()
          .first()
          .isVisible()
          .catch(() => false)
      ) {
        return;
      }
      if (
        await this.filterTextInput()
          .isVisible()
          .catch(() => false)
      ) {
        return;
      }
      await this.page.waitForTimeout(500);
    }
    throw new Error('Template catalog did not become ready (grid, tiles, or filter)');
  }

  wizardNextButton(): Locator {
    return this.page
      .getByTestId('wizard-next-button')
      .or(this.page.locator('[data-test="wizard-next-button"]'));
  }

  workloadFilterGroup(): Locator {
    return this.page
      .locator('fieldset[aria-labelledby="workload"]')
      .or(this.page.getByText('Workload', { exact: true }));
  }
}
