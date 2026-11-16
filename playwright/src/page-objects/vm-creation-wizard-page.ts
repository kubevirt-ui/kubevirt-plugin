import FilterToolbarComponent from '@/components/shared/filter-toolbar-component';
import BasePage from '@/page-objects/base-page';
import type { VmListPage } from '@/page-objects/vm-list-page';
import { dismissConsoleObstructions } from '@/utils/console-modals';
import { pollUntil } from '@/utils/poll-until';
import { SECOND, TestTimeouts } from '@/utils/test-config';
import type { Locator, Page } from '@playwright/test';

export type VmCreationWizardMethod = 'cloneVm' | 'fromTemplate' | 'newVm';

/** OpenShift 4.22+ PF wizard at `/vm-wizard` (Custom configuration / Template / Clone). */
export class VmCreationWizardPage extends BasePage {
  private readonly catalogFilterToolbar: FilterToolbarComponent;

  private readonly wizard = this.page
    .locator('.pf-v6-c-wizard.vm-creation-wizard, .vm-creation-wizard')
    .or(
      this.page.locator('.pf-v6-c-wizard').filter({
        hasText: /Create VirtualMachine|Select a creation method/i,
      }),
    );

  private readonly wizardMain = this.page.locator('.pf-v6-c-wizard__main');
  private readonly templateTiles = this.page.locator('.pf-v6-c-wizard .templates-catalog-tile');

  private readonly newVmRadio = this.page.getByRole('radio', { name: /Custom configuration/i });
  private readonly fromTemplateRadio = this.page.getByRole('radio', {
    name: /Create from Template/i,
  });
  private readonly cloneVmRadio = this.page.getByRole('radio', {
    name: /Clone existing VirtualMachine/i,
  });

  private readonly vmNameInput = this.page.locator('.vm-creation-wizard #vm-name');
  private readonly generateVmNameButton = this.page.locator(
    '.vm-creation-wizard [data-test="generate-vm-name-button"]',
  );

  // Scope to wizard footer — bare `.pf-v6-c-wizard … .pf-m-primary` can resolve to the
  // hidden list-page `item-create` (yaml-create) and hang on visibility.
  private readonly nextButton = this.page
    .locator('.pf-v6-c-wizard__footer')
    .getByRole('button', { name: /^(Next|Create VirtualMachine|Create)$/i })
    .or(this.page.locator('.pf-v6-c-wizard__footer button.pf-v6-c-button.pf-m-primary'));

  constructor(page: Page) {
    super(page);
    this.catalogFilterToolbar = new FilterToolbarComponent(page);
  }

  async openFromVirtualMachinesList(vmListPage: VmListPage, namespace: string): Promise<void> {
    await vmListPage.openVmCreationWizard(namespace);
    await this.waitForWizardReady();
    // Bare `/vm-wizard` does not bind Location to the list namespace — set it explicitly.
    await this.selectLocationProject(namespace);
  }

  /** Deployment details → Location: select the target project for the new VM. */
  async selectLocationProject(projectName: string): Promise<void> {
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      const selected = await this.trySelectLocationProject(projectName)
        .then(() => true)
        .catch(() => false);
      if (selected) {
        return;
      }
      // The location list comes from a console-side access review cached at page load. For a
      // namespace whose RBAC was bound seconds ago the review can be stale, and the dropdown
      // shows "No results match the filter criteria." — a fresh load recomputes it.
      await this.page
        .reload({ timeout: TestTimeouts.CONSOLE_PAGE_LOAD, waitUntil: 'domcontentloaded' })
        .catch(() => undefined);
      await dismissConsoleObstructions(this.page);
      await this.waitForWizardReady();
    }
    throw new Error(`Location project should be ${projectName}`);
  }

  private async trySelectLocationProject(projectName: string): Promise<void> {
    await dismissConsoleObstructions(this.page);
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
        timeout: TestTimeouts.VM_OPERATION,
      },
    );
  }

  async openFromTreeNamespace(vmListPage: VmListPage, namespace: string): Promise<void> {
    await vmListPage.openVmCreationWizardFromTreeNamespace(namespace);
    await this.waitForWizardReady();
  }

  async waitForWizardReady(): Promise<void> {
    await dismissConsoleObstructions(this.page);
    await this.page
      .waitForURL(/\/vm-wizard/, { timeout: TestTimeouts.ELEMENT_WAIT })
      .catch(() => undefined);
    await this.wizard.first().waitFor({
      state: 'visible',
      timeout: TestTimeouts.LONG_OPERATION,
    });
  }

  /** Fail fast when parallel navigation left /vm-wizard (e.g. namespace details). */
  async expectWizardVisible(): Promise<void> {
    if (!/\/vm-wizard/.test(this.page.url())) {
      throw new Error(`Expected VM creation wizard URL, got ${this.page.url()}`);
    }
    await this.wizard.first().waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
  }

  async verifyCreationMethodTilesVisible(): Promise<boolean> {
    const checks = await Promise.all([
      this.newVmRadio
        .first()
        .isVisible()
        .catch(() => false),
      this.fromTemplateRadio
        .first()
        .isVisible()
        .catch(() => false),
      this.cloneVmRadio
        .first()
        .isVisible()
        .catch(() => false),
    ]);
    return checks.every(Boolean);
  }

  async selectCreationMethod(method: VmCreationWizardMethod): Promise<void> {
    const radio = {
      cloneVm: this.cloneVmRadio,
      fromTemplate: this.fromTemplateRadio,
      newVm: this.newVmRadio,
    }[method];
    const card = this.creationMethodCard(method);
    // Clone step nav label is "Source" (not "Select source") on current wizard builds.
    const expectedNav =
      method === 'fromTemplate'
        ? /Template/i
        : method === 'newVm'
          ? /Guest OS|Boot source/i
          : /Source|Clone/i;

    await pollUntil(
      async () => {
        if (
          await radio
            .first()
            .isChecked()
            .catch(() => false)
        ) {
          const steps = await this.page.locator('.pf-v6-c-wizard__nav-link').allTextContents();
          if (steps.some((s) => expectedNav.test(s))) {
            return true;
          }
        }
        const radioInput = card.locator('input[type="radio"]').first();
        if (await radioInput.count()) {
          await radioInput.click({ force: true });
        } else {
          await radio
            .first()
            .check({ force: true })
            .catch(() => this.robustClick(radio.first()));
        }
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
        const steps = await this.page.locator('.pf-v6-c-wizard__nav-link').allTextContents();
        return (
          (await radio
            .first()
            .isChecked()
            .catch(() => false)) && steps.some((s) => expectedNav.test(s))
        );
      },
      {
        message: `Creation method ${method} should be selected`,
        timeout: TestTimeouts.ELEMENT_WAIT,
      },
    );
  }

  creationMethodCard(method: VmCreationWizardMethod): Locator {
    const id = { cloneVm: 'clone', fromTemplate: 'template', newVm: 'instance-type' }[method];
    return this.page.locator(`#${id}.pf-m-selectable`);
  }

  async isCreationMethodSelected(method: VmCreationWizardMethod): Promise<boolean> {
    const card = this.creationMethodCard(method);
    return card.evaluate(
      (el) => el.classList.contains('pf-m-current') || el.classList.contains('pf-m-selected'),
    );
  }

  async clearVmName(): Promise<void> {
    await this.vmNameInput
      .first()
      .waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.vmNameInput.first().clear();
  }

  async generateVmName(): Promise<void> {
    await this.robustClick(this.generateVmNameButton.first());
  }

  async ensureVmNameFilled(): Promise<void> {
    if (
      !(await this.vmNameInput
        .first()
        .isVisible()
        .catch(() => false))
    ) {
      return;
    }
    const value = (await this.vmNameInput.first().inputValue()).trim();
    if (!value) {
      await this.generateVmName();
    }
  }

  async getDeploymentVmName(): Promise<string> {
    return (await this.vmNameInput.first().inputValue()) || '';
  }

  async isNextButtonDisabled(): Promise<boolean> {
    await this.expectWizardVisible();
    const next = this.nextButton.first();
    await pollUntil(async () => (await next.count()) > 0, {
      message: 'Wizard Next/Create button should be present',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    // Disabled PF buttons may not pass Playwright "visible" (opacity/pointer-events).
    if (await next.isDisabled().catch(() => false)) {
      return true;
    }
    if ((await next.getAttribute('aria-disabled').catch(() => null)) === 'true') {
      return true;
    }
    const className = (await next.getAttribute('class').catch(() => null)) ?? '';
    if (className.includes('pf-m-disabled')) {
      return true;
    }
    return false;
  }

  async clickNext(): Promise<void> {
    const next = this.nextButton.first();
    await this.wizard.first().waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    // Instance-type info tooltips can sit over the footer and intercept the click.
    await this.page.keyboard.press('Escape');
    await this.page
      .locator('.pf-v6-c-tooltip, [role="tooltip"]')
      .first()
      .waitFor({ state: 'hidden', timeout: TestTimeouts.SHORT_WAIT })
      .catch(() => undefined);
    await next.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    if (await this.isNextButtonDisabled()) {
      throw new Error('Wizard Next is disabled — fill required fields before advancing');
    }
    await this.robustClick(next);
    await this.page.waitForTimeout(500);
  }

  async clickCancel(): Promise<void> {
    await this.robustClick(
      this.page
        .locator('.pf-v6-c-wizard button.pf-v6-c-button.pf-m-link:has-text("Cancel")')
        .first(),
    );
  }

  async verifyStepActive(stepId: string): Promise<boolean> {
    const step = this.page.locator(`#${stepId}`);
    return (await step.getAttribute('aria-current')) === 'step';
  }

  async selectOperatingSystem(os: 'otherLinux' | 'rhel' | 'windows'): Promise<void> {
    const label = { otherLinux: 'Other Linux', rhel: 'RHEL', windows: 'Microsoft Windows' }[os];
    await this.robustClick(
      this.page.locator(`.operating-system-tile:has-text("${label}")`).first(),
    );
  }

  async selectOsType(osType: string): Promise<void> {
    const toggle = this.page
      .locator('.pf-v6-c-form__group')
      .filter({ has: this.page.locator('label:has-text("Guest operating system type")') })
      .locator('.pf-v6-c-menu-toggle')
      .first();
    await this.robustClick(toggle);
    const option = this.page.getByRole('option', { name: new RegExp(osType, 'i') }).first();
    if (await option.isVisible().catch(() => false)) {
      await this.robustClick(option);
      return;
    }
    await this.robustClick(this.page.getByRole('option').first());
  }

  async selectNoBootSource(): Promise<void> {
    await this.robustClick(this.page.getByText('No boot source', { exact: false }).first());
  }

  async selectInstanceTypeSeries(series: 'u'): Promise<void> {
    void series;
    await this.robustClick(
      this.page
        .locator('.instance-type-series-menu-card__toggle-card:has-text("General Purpose")')
        .first(),
    );
  }

  async clickNextWhenEnabled(timeoutMs = TestTimeouts.ELEMENT_WAIT): Promise<void> {
    await pollUntil(async () => !(await this.isNextButtonDisabled()), {
      message: 'Wizard Next should become enabled',
      timeout: timeoutMs,
    });
    await this.clickNext();
  }

  async selectComputeSize(sizeName: string): Promise<void> {
    const sizeToggle = this.page.locator('button.pf-v6-c-menu-toggle').filter({
      hasText: /Select size|CPUs.*Memory/,
    });
    await this.robustClick(sizeToggle.first());
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    const byName = this.page.getByRole('menuitem').filter({ hasText: new RegExp(sizeName, 'i') });
    if (
      await byName
        .first()
        .isVisible()
        .catch(() => false)
    ) {
      await this.robustClick(byName.first());
      return;
    }
    const firstSize = this.page.getByRole('menuitem').first();
    await firstSize.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(firstSize);
  }

  async verifyTemplateCatalogStepVisible(): Promise<boolean> {
    return this.page
      .locator('.pf-v6-c-wizard h1:has-text("Templates")')
      .first()
      .isVisible({ timeout: TestTimeouts.LONG_OPERATION })
      .catch(() => false);
  }

  async selectTemplateByMetadataName(metadataName: string): Promise<void> {
    const filter = this.page.locator('.pf-v6-c-wizard__main input[placeholder*="Filter"]');
    if (
      await filter
        .first()
        .isVisible()
        .catch(() => false)
    ) {
      const keyword = metadataName.split('-')[0] ?? metadataName;
      await filter.first().fill(keyword);
      await this.page.waitForTimeout(2 * SECOND);
    }
    // 4.23 TemplatesCatalogTile: Card[data-test=name] owns onClick (radio is hidden a11y control).
    const card = this.page
      .locator(`.templates-catalog-tile[data-test="${metadataName}"]`)
      .or(this.page.locator(`[data-test="${metadataName}"].pf-v6-c-card`))
      .or(this.page.locator(`[data-test="${metadataName}"]`))
      .or(this.page.locator(`[data-test-id="${metadataName}"]`))
      .or(
        this.page
          .locator('.vm-catalog-grid-tile, .templates-catalog-tile, .pf-v6-c-card')
          .filter({ hasText: new RegExp(`^${metadataName}$|\\b${metadataName}\\b`) }),
      )
      .first();
    await card.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT }).catch(async () => {
      throw new Error(
        `Template "${metadataName}" should be visible in the catalog ` +
          `(tiles: ${await this.getTemplateCatalogCount()})`,
      );
    });
    await pollUntil(
      async () => {
        if (!/\/vm-wizard/i.test(this.page.url())) {
          return false;
        }
        const selected = await card
          .evaluate(
            (el) =>
              el.classList.contains('pf-m-selected') ||
              el.classList.contains('pf-m-current') ||
              el.getAttribute('aria-selected') === 'true' ||
              el.getAttribute('aria-checked') === 'true',
          )
          .catch(() => false);
        if (selected && !(await this.isNextButtonDisabled())) {
          return true;
        }
        await dismissConsoleObstructions(this.page);
        await card
          .evaluate((el) => el.scrollIntoView({ block: 'center', inline: 'nearest' }))
          .catch(() => undefined);
        await card.click({ force: true }).catch(() => undefined);
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
        return !(await this.isNextButtonDisabled());
      },
      {
        message: `Template ${metadataName} should be selected`,
        timeout: TestTimeouts.ELEMENT_WAIT,
      },
    );
    const closeDrawer = this.page
      .locator(
        'button[aria-label="Close drawer panel"], .pf-v6-c-modal-box__close button[aria-label="Close"]',
      )
      .first();
    if (await closeDrawer.isVisible().catch(() => false)) {
      await this.robustClick(closeDrawer);
      await this.page.waitForTimeout(500);
    }
  }

  async verifyCloneSourceStepVisible(): Promise<boolean> {
    return this.page
      .locator('.pf-v6-c-wizard h1:has-text("Source")')
      .first()
      .isVisible({ timeout: TestTimeouts.LONG_OPERATION })
      .catch(() => false);
  }

  async selectCloneSourceVm(vmName: string, namespace: string): Promise<void> {
    const wizardMain = this.page.locator('.pf-v6-c-wizard__main');
    const chipCloseButtons = wizardMain.locator(
      '.pf-v6-c-label .pf-v6-c-label__actions button, .pf-v6-c-chip button',
    );
    const chipCount = await chipCloseButtons.count();
    for (let i = chipCount - 1; i >= 0; i -= 1) {
      await chipCloseButtons
        .nth(i)
        .click()
        .catch(() => undefined);
    }
    if (chipCount > 0) {
      await this.page.waitForTimeout(SECOND);
    }

    const projectBtn = this.page
      .locator('.pf-v6-c-wizard [data-ouia-component-type="PF6/MenuToggle"]')
      .filter({ hasText: 'Project' })
      .first();
    if (await projectBtn.isVisible().catch(() => false)) {
      await this.robustClick(projectBtn);
      await this.page.getByRole('menuitem', { name: namespace, exact: true }).click();
      await this.page.waitForTimeout(2 * SECOND);
    }
    const search = this.page
      .locator('.pf-v6-c-wizard input[placeholder*="Search by name"]')
      .first();
    await search.fill(vmName);
    await this.page.waitForTimeout(2 * SECOND);
    const row = this.page.locator('.pf-v6-c-wizard tr, .pf-v6-c-wizard [role="row"]').filter({
      hasText: vmName,
    });
    await row.first().waitFor({ state: 'visible', timeout: TestTimeouts.LONG_OPERATION });
    await this.robustClick(row.first());
  }

  async verifyReviewStepVisible(): Promise<boolean> {
    return this.page
      .locator('.pf-v6-c-wizard h1:has-text("Review and create")')
      .first()
      .isVisible({ timeout: TestTimeouts.LONG_OPERATION })
      .catch(() => false);
  }

  async clickCreateVirtualMachine(): Promise<void> {
    await this.robustClick(this.nextButton.first());
    await this.page
      .waitForURL(/kubevirt\.io~v1~VirtualMachine\/(?!~new)[^/?#]+/, {
        timeout: TestTimeouts.VM_CREATION,
      })
      .catch(() => undefined);
  }

  async getCreatedVmNameFromUrl(): Promise<string> {
    const url = this.page.url();
    const pathMatch = url.match(/VirtualMachine\/([^/?#]+)/);
    if (pathMatch?.[1] && pathMatch[1] !== '~new') {
      return pathMatch[1];
    }
    return new URL(url).searchParams.get('name') ?? '';
  }

  async advanceFromTemplateToReview(templateMetadataName: string): Promise<void> {
    await this.selectCreationMethod('fromTemplate');
    await this.ensureVmNameFilled();
    await this.selectCreationMethod('fromTemplate');
    await this.clickNext();
    // If Custom configuration won the race, nav shows Guest OS — force Template method and retry.
    await pollUntil(
      async () => {
        const current = (
          await this.page.locator('.pf-v6-c-wizard__nav-link.pf-m-current').allTextContents()
        ).join(' ');
        if (/Template/i.test(current)) {
          return true;
        }
        if (/Guest OS|Boot source/i.test(current)) {
          await this.page.getByRole('button', { name: /^Deployment details$/i }).click();
          await this.selectCreationMethod('fromTemplate');
          await this.ensureVmNameFilled();
          await this.clickNext();
          return false;
        }
        if (!(await this.isNextButtonDisabled())) {
          await this.clickNext();
        }
        return false;
      },
      {
        message: 'Wizard should be on Template step for From Template flow',
        timeout: TestTimeouts.LONG_OPERATION,
      },
    );
    await this.selectTemplateByMetadataName(templateMetadataName);
    await pollUntil(
      async () => {
        if (await this.verifyReviewStepVisible()) {
          return true;
        }
        if (await this.isNextButtonDisabled()) {
          return false;
        }
        await this.clickNext();
        return await this.verifyReviewStepVisible();
      },
      {
        message: 'Template flow should reach Review and create',
        timeout: TestTimeouts.LONG_OPERATION,
      },
    );
  }

  /** Custom configuration: Guest OS → no boot source → compute → customization → review. */
  async advanceCustomConfigurationToReview(): Promise<void> {
    const stepWait = TestTimeouts.LONG_OPERATION;
    await this.selectCreationMethod('newVm');
    await this.ensureVmNameFilled();
    await this.clickNextWhenEnabled(stepWait);
    await this.selectOperatingSystem('otherLinux');
    await this.selectOsType('fedora');
    await this.clickNextWhenEnabled(stepWait);
    await this.selectNoBootSource();
    await this.clickNextWhenEnabled(stepWait);
    await this.selectInstanceTypeSeries('u');
    await this.selectComputeSize('small');
    await this.clickNextWhenEnabled(stepWait);
    await pollUntil(
      async () => {
        if (await this.verifyReviewStepVisible()) {
          return true;
        }
        if (await this.isNextButtonDisabled()) {
          return false;
        }
        await this.clickNext();
        return await this.verifyReviewStepVisible();
      },
      {
        message: 'Custom configuration should reach Review and create',
        timeout: TestTimeouts.LONG_OPERATION,
      },
    );
  }

  async advanceCloneSourceToReview(sourceVmName: string, namespace: string): Promise<void> {
    await this.selectCreationMethod('cloneVm');
    await this.ensureVmNameFilled();
    await this.clickNext();
    await this.selectCloneSourceVm(sourceVmName, namespace);
    await this.clickNext();
  }

  /** Deployment details → Create from Template → Templates catalog step. */
  async openFromTemplateCatalogStep(): Promise<void> {
    await this.selectCreationMethod('fromTemplate');
    await this.ensureVmNameFilled();
    await this.selectCreationMethod('fromTemplate');
    await this.clickNext();
    await pollUntil(() => this.verifyTemplateCatalogStepVisible(), {
      message: 'Template catalog step should be visible after Create from Template → Next',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await this.waitForTemplateCatalogLoaded();
  }

  /**
   * Best-effort: the step heading renders before the catalog data hydrates. Never blocks for long —
   * on a loaded cluster the boot-source watch can keep the catalog in its loading state for minutes,
   * and waiting that out in `beforeEach` eats the whole per-test budget. Callers assert tiles.
   */
  async waitForTemplateCatalogLoaded(): Promise<void> {
    const loadingState = this.page
      .locator('.loading-skeleton--catalog')
      .or(
        this.page.locator(
          '.pf-v6-c-wizard h4:has-text("Loading templates with available boot source")',
        ),
      )
      .first();
    await pollUntil(
      async () => {
        if ((await this.getTemplateCatalogCount()) > 0) {
          return true;
        }
        return !(await loadingState.isVisible().catch(() => false));
      },
      {
        message: 'Template catalog should finish loading',
        timeout: TestTimeouts.SHORT_WAIT,
      },
    ).catch(() => undefined);
  }

  async filterTemplateCatalog(keyword: string): Promise<void> {
    const input = this.page.locator('.pf-v6-c-wizard__main input[placeholder*="Filter"]').first();
    await input.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await input.fill(keyword);
    // Catalog filtering is client-side; wait for the tile count to settle instead of a fixed delay.
    let previousCount = -1;
    await pollUntil(
      async () => {
        const count = await this.getTemplateCatalogCount();
        const settled = count === previousCount;
        previousCount = count;
        return settled;
      },
      {
        intervalMs: 250,
        message: `Template catalog should settle after filtering by "${keyword}"`,
        timeout: TestTimeouts.ELEMENT_WAIT,
      },
    );
  }

  async openTemplateCatalogFilterToolbar(): Promise<void> {
    const osGroup = this.wizardMain
      .getByText(/^Operating system$/i)
      .or(this.page.locator('[data-test-id="filter-category-osName"], [data-test="filter-osName"]'))
      .first();
    await this.catalogFilterToolbar.openCatalogFilterPanelIfClosed(osGroup);
  }

  /** Template catalog OS / workload facet checkbox (e.g. `osName-RHEL`, `workload-Server`). */
  async filterTemplateCatalogByOsCheckbox(testId: string, checked: boolean): Promise<void> {
    await this.openTemplateCatalogFilterToolbar();
    await this.catalogFilterToolbar.setCatalogCheckboxFilter(testId, checked);
  }

  /**
   * True when the wizard Template catalog filter panel exposes an Architecture group
   * with at least one checkbox (s390x / multi-arch clusters and s390x mock mode).
   */
  async verifyArchitectureFilterExists(): Promise<boolean> {
    await this.openTemplateCatalogFilterToolbar();
    const archGroup = this.page.locator('[data-test-id="filter-category-Architecture"]').first();
    if (!(await archGroup.isVisible().catch(() => false))) {
      return false;
    }
    const checkboxes = archGroup.locator('input[type="checkbox"], [data-test-id^="architecture-"]');
    return (await checkboxes.count()) > 0;
  }

  templateCatalogTileMatching(text: RegExp | string): Locator {
    return this.templateTiles.filter({ hasText: text }).first();
  }

  templateCatalogTiles(): Locator {
    return this.templateTiles;
  }

  async getTemplateCatalogCount(): Promise<number> {
    const gridCount = await this.templateTiles.count();
    if (gridCount > 0) {
      return gridCount;
    }
    return this.page.locator('.pf-v6-c-wizard tr.pf-m-clickable').count();
  }

  async advanceToBootSourceStep(): Promise<void> {
    await this.selectCreationMethod('newVm');
    await this.ensureVmNameFilled();
    await this.clickNextWhenEnabled();
    await this.selectOperatingSystem('otherLinux');
    await this.selectOsType('fedora');
    await this.clickNextWhenEnabled();
  }

  async verifyBootSourceStepVisible(): Promise<boolean> {
    return this.page
      .locator('.pf-v6-c-wizard h1:has-text("Boot source")')
      .first()
      .isVisible({ timeout: TestTimeouts.LONG_OPERATION })
      .catch(() => false);
  }

  /** Compact "Developer preview" labels must not appear on the boot-source step. */
  developerPreviewLabel(): Locator {
    return this.page
      .locator('.pf-v6-c-wizard')
      .locator('.dev-preview-label')
      .or(
        this.page
          .locator('.pf-v6-c-wizard')
          .getByText(/^Developer preview$/i)
          .locator(
            'xpath=ancestor::*[contains(@class,"pf-v6-c-label") or contains(@class,"pf-c-label")][1]',
          ),
      );
  }

  bootVolumeRowMatching(text: RegExp | string): Locator {
    return this.page.locator('.pf-v6-c-wizard table tbody tr').filter({ hasText: text }).first();
  }

  async getBootVolumeCount(): Promise<number> {
    const paginationText = this.page.locator('button').filter({ hasText: /of \d+/ });
    try {
      const text = await paginationText.first().textContent({ timeout: TestTimeouts.ELEMENT_WAIT });
      const match = text?.match(/of (\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    } catch {
      return 0;
    }
  }
}
