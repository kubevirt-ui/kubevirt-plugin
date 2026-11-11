import BasePage from '@/page-objects/base-page';
import type { VmListPage } from '@/page-objects/vm-list-page';
import { dismissConsoleObstructions } from '@/utils/console-modals';
import { pollUntil } from '@/utils/poll-until';
import { SECOND, TestTimeouts } from '@/utils/test-config';
import type { Locator, Page } from '@playwright/test';

export type VmCreationWizardMethod = 'cloneVm' | 'fromTemplate' | 'newVm';

/** OpenShift 4.22+ PF wizard at `/vm-wizard` (Custom configuration / Template / Clone). */
export class VmCreationWizardPage extends BasePage {
  private readonly wizard = this.page
    .locator('.pf-v6-c-wizard.vm-creation-wizard, .vm-creation-wizard')
    .or(
      this.page.locator('.pf-v6-c-wizard').filter({
        hasText: /Create VirtualMachine|Select a creation method/i,
      }),
    );

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

  private readonly nextButton = this.page
    .locator('.pf-v6-c-wizard')
    .getByRole('button', { name: /^(Next|Create VirtualMachine|Create)$/i })
    .or(this.page.locator('.pf-v6-c-wizard button.pf-v6-c-button.pf-m-primary'));

  constructor(page: Page) {
    super(page);
  }

  async openFromVirtualMachinesList(vmListPage: VmListPage, namespace: string): Promise<void> {
    await vmListPage.openVmCreationWizard(namespace);
    await this.waitForWizardReady();
  }

  async openFromTreeNamespace(vmListPage: VmListPage, namespace: string): Promise<void> {
    await vmListPage.openVmCreationWizardFromTreeNamespace(namespace);
    await this.waitForWizardReady();
  }

  async waitForWizardReady(): Promise<void> {
    await dismissConsoleObstructions(this.page);
    await this.page
      .waitForURL(/\/vm-wizard/, { timeout: TestTimeouts.LONG_OPERATION })
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
    await this.robustClick(radio.first());
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
    await next.waitFor({ state: 'attached', timeout: TestTimeouts.ELEMENT_WAIT });
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
    const card = this.page.locator(`[data-test-id="${metadataName}"]`).first();
    await card.waitFor({ state: 'visible', timeout: TestTimeouts.LONG_OPERATION });
    await this.robustClick(card);
    await pollUntil(
      async () =>
        card.evaluate(
          (el) =>
            el.classList.contains('pf-m-selected') || el.getAttribute('aria-selected') === 'true',
        ),
      {
        message: `Template ${metadataName} should be selected`,
        timeout: TestTimeouts.LONG_OPERATION,
      },
    ).catch(() => undefined);
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
    await this.clickNext();
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
}
