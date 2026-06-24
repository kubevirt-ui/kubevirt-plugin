// PageCommons — Page object for commons interactions.

import ColumnManagementComponent from '@/components/shared/column-management-component';
import FilterToolbarComponent from '@/components/shared/filter-toolbar-component';
import ModalComponent from '@/components/shared/modal-component';
import NavigationComponent from '@/components/shared/navigation-component';
import PageContentComponent from '@/components/shared/page-content-component';
import PerspectiveComponent from '@/components/shared/perspective-component';
import ProjectDropdownComponent from '@/components/shared/project-dropdown-component';
import VmActionsComponent from '@/components/shared/vm-actions-component';
import YamlEditorComponent from '@/components/shared/yaml-editor-component';
import { getErrorMessage } from '@/data-models/kubernetes-types';
import { TestTimeouts } from '@/utils/test-config';
import { waitForElementText } from '@/utils/wait-helpers';
import type { Page } from '@playwright/test';

import BasePage from './base-page';

export default class PageCommons extends BasePage {
  readonly navigation = new NavigationComponent(this.page);
  readonly modal = new ModalComponent(this.page);
  readonly perspective = new PerspectiveComponent(this.page);
  readonly projectDropdown = new ProjectDropdownComponent(this.page);
  readonly vmActions = new VmActionsComponent(this.page);
  readonly yamlEditor = new YamlEditorComponent(this.page);
  readonly columns = new ColumnManagementComponent(this.page);
  readonly pageContent = new PageContentComponent(this.page);
  readonly filterToolbar = new FilterToolbarComponent(this.page);

  readonly _createButton = this.locator('[data-test="item-create"]');
  protected readonly _confirmActionButton = this.locator('[data-test="confirm-action"]');
  readonly _saveChangesButton = this.locator('[data-test="save-changes"]');
  protected readonly _clusterDropdownToggle = this.locator(
    '[data-test="cluster-dropdown-menu-toggle"]',
  );
  protected readonly _namespaceDropdownToggle = this.locator(
    '[data-test="namespace-dropdown-menu-toggle"]',
  );
  protected readonly _dropdownTextFilter = this.locator('[data-test="dropdown-text-filter"]');
  protected readonly _rawRow = this.locator('tr.pf-v6-c-table__tr');

  private readonly _statusElements = this.locator(
    '[data-test-id="virtual-machine-overview-details-status"]',
  );

  constructor(page: Page) {
    super(page);
  }

  // ── Page utilities ─────────────────────────────────────────────────

  getCurrentUrl(): string {
    return this.page.url();
  }

  async waitForLoadStateNetworkIdle(timeoutMs = 30_000): Promise<void> {
    await this.page.waitForLoadState('networkidle', { timeout: timeoutMs }).catch(() => undefined);
  }

  async getMainHeadingH1Text(): Promise<null | string> {
    const raw = await this.page.locator('h1').textContent();
    return raw?.trim() ?? null;
  }

  async clickVirtualMachinesNavItem(): Promise<void> {
    const navItem = this.page.locator('[data-test-id="virtualmachines-nav-item"]');
    await navItem.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
    await navItem.click();
    await this.page.waitForLoadState('load');
  }

  async delayMs(ms: number): Promise<void> {
    await this.page.waitForTimeout(ms);
  }

  async waitForDataPropagation(ms = TestTimeouts.UI_DELAY_EXTRA): Promise<void> {
    await this.page.waitForTimeout(ms);
  }

  async waitForDomContentLoaded() {
    await this.page.waitForLoadState('domcontentloaded');
  }
  async waitForPageLoad() {
    await this.page.waitForLoadState('domcontentloaded');
  }

  async reloadPage(timeout = 60000): Promise<void> {
    try {
      await this.page.reload({ waitUntil: 'load', timeout });
    } catch {
      // reload may time out on slow clusters; continue
    }
    await this.page.waitForLoadState('networkidle');
  }

  // ── Enhanced text verification with fallback strategies ────────────

  override async verifyTextVisible(
    text: string,
    useFirst = false,
    timeout: number = TestTimeouts.RESOURCE_CREATION,
  ): Promise<boolean> {
    const maxRetries = 3;
    const retryDelay = TestTimeouts.UI_DELAY_SHORT;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.waitForLoadingComplete(Math.min(timeout / 4, 3000));

        let textLocator = this.page.getByText(text, { exact: false });
        if (useFirst) {
          textLocator = textLocator.first();
        }

        await textLocator.waitFor({ state: 'visible', timeout: timeout / maxRetries });

        const isVisible = await textLocator.isVisible().catch(() => false);
        if (isVisible) return true;

        const altLocator = this.locator(`text=${text}`);
        const altVisible = await (useFirst ? altLocator.first() : altLocator)
          .isVisible({ timeout: TestTimeouts.POLLING_INTERVAL })
          .catch(() => false);
        if (altVisible) return true;

        const containerLocator = this.page.locator(
          `[data-test]:has-text("${text}"), [data-test-id]:has-text("${text}"), ` +
            `[role="cell"]:has-text("${text}"), [role="row"]:has-text("${text}"), ` +
            `dd:has-text("${text}"), dt:has-text("${text}"), ` +
            `h1:has-text("${text}"), h2:has-text("${text}"), h3:has-text("${text}"), ` +
            `p:has-text("${text}"), span:has-text("${text}"), div:has-text("${text}")`,
        );

        const containerVisible = await containerLocator
          .first()
          .isVisible({ timeout: TestTimeouts.UI_DELAY_SHORT })
          .catch(() => false);
        if (containerVisible) return true;
      } catch (error: unknown) {
        const errorMessage = getErrorMessage(error);
        if (
          attempt < maxRetries &&
          (errorMessage.includes('detached') ||
            errorMessage.includes('stale') ||
            errorMessage.includes('timeout') ||
            errorMessage.includes('Timeout'))
        ) {
          await this.page.waitForTimeout(retryDelay);
          continue;
        }
      }
    }

    return false;
  }

  // ── Common buttons ─────────────────────────────────────────────────

  async clickDeleteButton() {
    await this.robustClick(this.locator('button:has-text("Delete")'));
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async clickNext() {
    await this.robustClick(this.locator('button[type="submit"]:has-text("Next")'));
  }

  override async clickSaveByTestId() {
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);
    await this.robustClick(this.locator('footer').locator('button[data-test="save-button"]'));
  }

  override async clickSaveChanges() {
    await this._saveChangesButton.click();
  }
  async clickCreate() {
    await this.robustClick(this._createButton);
  }

  async isCreateButtonVisible(): Promise<boolean> {
    return (
      (await this._createButton.count()) > 0 &&
      (await this._createButton
        .first()
        .isVisible()
        .catch(() => false))
    );
  }

  async clickMinusButton() {
    await this.robustClick(
      this.locator(
        '[data-test="minus-button"], button[aria-label*="minus" i], button[aria-label*="decrease" i]',
      ).first(),
    );
  }

  async clickPlusButton() {
    await this.robustClick(
      this.locator(
        '[data-test="plus-button"], button[aria-label*="plus" i], button[aria-label*="increase" i]',
      ).first(),
    );
  }

  async clickDropdownButton() {
    await this.robustClick(
      this.locator('[data-test-id="filter-dropdown-toggle"]').locator('button'),
    );
  }

  async selectYAMLOption() {
    await this.robustClick(this.locator('button:has-text("YAML")'));
  }
  async selectFromFormOption() {
    await this.robustClick(this.locator('button[role="menuitem"]:has-text("From form")'));
  }
  async selectWithFormOption() {
    await this.robustClick(this.locator('button[role="menuitem"]:has-text("With form")'));
  }

  async isButtonByTextVisible(buttonText: string): Promise<boolean> {
    return await this.locator('button', { hasText: buttonText }).isVisible();
  }

  async isElementVisible(selector: string): Promise<boolean> {
    return await this.locator(selector).isVisible();
  }

  // ── Status helpers ─────────────────────────────────────────────────

  async getAllStatusTexts(): Promise<string[]> {
    const count = await this._statusElements.count();
    const texts: string[] = [];
    for (let i = 0; i < count; i++) {
      const t = await this._statusElements.nth(i).textContent();
      if (t) texts.push(t.trim());
    }
    return texts;
  }

  async waitForStatusText(expectedStatus: string): Promise<boolean> {
    return await waitForElementText(
      this._statusElements,
      expectedStatus,
      TestTimeouts.STATUS_VALIDATION,
    );
  }
}
