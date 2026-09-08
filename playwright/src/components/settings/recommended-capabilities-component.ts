/**
 * Locators and interactions for the Recommended capabilities Settings tab.
 */

import BaseComponent from '@/components/shared/base-component';
import { CAPABILITY_STATUS } from '@/data-models/recommended-capabilities-constants';
import { TestTimeouts } from '@/utils/test-config';
import type { Locator, Page } from '@playwright/test';

export default class RecommendedCapabilitiesComponent extends BaseComponent {
  private readonly _additionalCardTitle = this.page.getByText(
    'Additional capabilities (manual setup required)',
    { exact: true },
  );

  private readonly _autoCardTitle = this.page.getByText('Install capabilities automatically', {
    exact: true,
  });

  private readonly _content = this.testId('recommended-capabilities');
  private readonly _count = this.testId('capabilities-count');
  private readonly _heading = this.page.getByRole('heading', {
    name: 'Manage Virtualization capabilities',
  });

  private readonly _installSelected = this.testId('install-selected-capabilities');
  private readonly _reviewModal = this.testId('review-recommendation-modal');
  private readonly _search = this.testId('search-capabilities');
  private readonly _statusFilter = this.testId('capability-status-filter');
  private readonly _tab = this.testId('settings-tab-recommended');

  constructor(page: Page) {
    super(page);
  }

  get additionalCardTitleLocator(): Locator {
    return this._additionalCardTitle;
  }

  get autoCardTitleLocator(): Locator {
    return this._autoCardTitle;
  }

  get contentLocator(): Locator {
    return this._content;
  }

  get countLocator(): Locator {
    return this._count;
  }

  get headingLocator(): Locator {
    return this._heading;
  }

  get installSelectedLocator(): Locator {
    return this._installSelected;
  }

  get reviewModalLocator(): Locator {
    return this._reviewModal;
  }

  get reviewRecommendationLocator(): Locator {
    return this.testId('review-recommendation');
  }

  get tabLocator(): Locator {
    return this._tab;
  }

  capabilityLocator(id: string): Locator {
    return this.testId(`capability-${id}`);
  }

  capabilityRow(id: string): Locator {
    return this.page.locator('tr, [role="row"]', { has: this.testId(`capability-${id}`) }).first();
  }

  operatorLocator(packageName: string): Locator {
    return this.testId(`operator-${packageName}`);
  }

  operatorRow(packageName: string): Locator {
    return this.page
      .locator('tr, [role="row"]', { has: this.testId(`operator-${packageName}`) })
      .first();
  }

  kebabInRow(row: Locator): Locator {
    return row.getByTestId('kebab-button');
  }

  configurationStatusInRow(row: Locator): Locator {
    return row.getByTestId('configuration-status');
  }

  async getOperatorConfigStatus(packageName: string): Promise<string> {
    const status = this.configurationStatusInRow(this.operatorRow(packageName));
    return ((await status.textContent()) ?? '').trim();
  }

  async findOperatorPackageByConfigStatus(
    packageNames: readonly string[],
    status: string,
  ): Promise<string | undefined> {
    for (const packageName of packageNames) {
      if (
        !(await this.operatorLocator(packageName)
          .isVisible()
          .catch(() => false))
      ) {
        continue;
      }
      if ((await this.getOperatorConfigStatus(packageName)) === status) {
        return packageName;
      }
    }
    return undefined;
  }

  async waitForLoaded(): Promise<void> {
    await this._content.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.capabilityLocator('load-balancing').waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
  }

  async searchCapabilities(term: string): Promise<void> {
    const input = this._search.locator('input');
    await input.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await input.fill(term);
  }

  async clearSearch(): Promise<void> {
    const clearButton = this._search.locator(
      'button[aria-label="Reset"], button[aria-label="Clear"]',
    );
    if (await clearButton.isVisible().catch(() => false)) {
      await this.robustClick(clearButton);
      return;
    }
    await this._search.locator('input').fill('');
  }

  async filterByStatus(statusLabel: string): Promise<void> {
    await this.robustClick(this._statusFilter.locator('button').first());
    const option = this.page
      .getByRole('menuitem', { name: statusLabel })
      .or(this.page.getByRole('checkbox', { name: statusLabel }))
      .or(this.page.locator('[role="option"]', { hasText: statusLabel }));
    await this.robustClick(option.first());
    await this.page.keyboard.press('Escape');
  }

  async expandCapability(id: string): Promise<void> {
    const row = this.capabilityRow(id);
    const toggle = row
      .locator('button[aria-expanded]')
      .or(row.locator('.pf-v6-c-table__toggle button'))
      .first();
    await toggle.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    if ((await toggle.getAttribute('aria-expanded')) !== 'true') {
      await this.robustClick(toggle);
    }
  }

  async selectCapability(id: string): Promise<void> {
    const checkbox = this.capabilityRow(id).getByRole('checkbox');
    await checkbox.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    if (!(await checkbox.isChecked())) {
      await this.robustClick(checkbox);
    }
  }

  async clickInstallSelected(): Promise<void> {
    await this.robustClick(this._installSelected);
  }

  async hoverInstallSelected(): Promise<void> {
    await this._installSelected.hover({ timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
  }

  async openCapabilityKebab(id: string): Promise<void> {
    await this.robustClick(this.kebabInRow(this.capabilityRow(id)));
  }

  async openOperatorKebab(packageName: string): Promise<void> {
    await this.robustClick(this.kebabInRow(this.operatorRow(packageName)));
  }

  kebabActionLocator(actionId: string): Locator {
    return this.testId(actionId);
  }

  async clickKebabAction(actionId: string): Promise<void> {
    await this.robustClick(this.kebabActionLocator(actionId));
  }

  async closeKebab(): Promise<void> {
    await this.page.keyboard.press('Escape');
  }

  async clickOperatorLink(packageName: string): Promise<void> {
    await this.robustClick(this.operatorLocator(packageName));
  }

  async clickReviewRecommendation(): Promise<void> {
    await this.robustClick(this.reviewRecommendationLocator.first());
  }

  async cancelReviewModal(): Promise<void> {
    await this.robustClick(this.testId('cancel-button'));
  }

  async getCapabilityStatus(id: string): Promise<string> {
    const row = this.capabilityRow(id);
    if (
      await row
        .getByLabel(CAPABILITY_STATUS.INSTALLING)
        .isVisible()
        .catch(() => false)
    ) {
      return CAPABILITY_STATUS.INSTALLING;
    }
    const status = row.locator('.pf-v6-c-label').first();
    return ((await status.textContent()) ?? '').trim();
  }

  async findCapabilityIdByStatus(
    ids: readonly string[],
    status: string,
  ): Promise<string | undefined> {
    for (const id of ids) {
      if (
        !(await this.capabilityLocator(id)
          .isVisible()
          .catch(() => false))
      ) {
        continue;
      }
      if ((await this.getCapabilityStatus(id)) === status) {
        return id;
      }
    }
    return undefined;
  }

  installationToastLocator(capabilityTitle?: string): Locator {
    const toast = this.page.locator('[role="alert"], .pf-v6-c-alert').filter({
      hasText: 'Installation started',
    });
    return capabilityTitle ? toast.filter({ hasText: capabilityTitle }) : toast;
  }
}
