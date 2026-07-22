import { TestTimeouts } from '@/utils/test-config';
import { waitForCondition, waitForElementText } from '@/utils/wait-helpers';
import type { Page } from '@playwright/test';

import BaseComponent from './base-component';

export default class PageContentComponent extends BaseComponent {
  private readonly _statusElements = this.testId('virtual-machine-overview-details-status');
  readonly _createButton = this.testId('item-create');
  readonly _saveChangesButton = this.testId('save-changes');

  constructor(page: Page) {
    super(page);
  }

  private pageHeadingLocator(
    text: string,
    level: 'title' | 'subtitle',
  ): ReturnType<PageContentComponent['locator']> {
    const selectors =
      level === 'title'
        ? 'h1, .pf-v5-c-title, .pf-v6-c-title, .pf-c-title'
        : 'h2, .pf-v5-c-title, .pf-v6-c-title, .pf-c-title';
    return this.locator(selectors).filter({ hasText: text }).first();
  }

  async alreadyExists(name?: string): Promise<boolean> {
    const pfV6CAlertpfMDanger = this.locator('.pf-v6-c-alert.pf-m-danger');
    const errorElement = name
      ? pfV6CAlertpfMDanger.filter({ hasText: `"${name}" already exists` })
      : pfV6CAlertpfMDanger.filter({ hasText: 'already exists' });
    try {
      await errorElement.waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_SHORT });
      return true;
    } catch {
      return false;
    }
  }

  async clickBreadcrumbItem(text: string): Promise<void> {
    const breadcrumb = this.locator('[aria-label="Breadcrumb"]').filter({ hasText: text });
    const link = breadcrumb.locator('a').first();
    await this.robustClick(link);
  }

  async clickCreate(): Promise<void> {
    await this.robustClick(this._createButton);
  }

  async clickDeleteButton(): Promise<void> {
    const deleteButton = this.locator('button:has-text("Delete")');
    await this.robustClick(deleteButton);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async clickMinusButton(): Promise<void> {
    await this.robustClick(
      this.testId('minus-button')
        .or(this.locator('button[aria-label*="minus" i], button[aria-label*="decrease" i]'))
        .first(),
    );
  }

  async clickNext(): Promise<void> {
    const nextButton = this.locator('button[type="submit"]:has-text("Next")');
    await this.robustClick(nextButton);
  }

  async clickPlusButton(): Promise<void> {
    await this.robustClick(
      this.testId('plus-button')
        .or(this.locator('button[aria-label*="plus" i], button[aria-label*="increase" i]'))
        .first(),
    );
  }

  override async clickSaveChanges(): Promise<void> {
    await this.robustClick(this._saveChangesButton);
  }

  async delayMs(ms: number): Promise<void> {
    await this.page.waitForTimeout(ms);
  }

  async getAllStatusTexts(): Promise<string[]> {
    const count = await this._statusElements.count();
    const statusTexts: string[] = [];

    for (let i = 0; i < count; i++) {
      const text = await this._statusElements.nth(i).textContent();
      if (text) {
        statusTexts.push(text.trim());
      }
    }

    return statusTexts;
  }

  getCurrentUrl(): string {
    return this.page.url();
  }

  async getMainHeadingH1Text(): Promise<string | null> {
    const raw = await this.page.locator('h1').textContent();
    return raw?.trim() ?? null;
  }

  async isButtonByTextVisible(buttonText: string): Promise<boolean> {
    const button = this.locator('button', { hasText: buttonText });
    return await button.isVisible();
  }

  async isElementVisible(selector: string): Promise<boolean> {
    const element = this.locator(selector);
    return await element.isVisible();
  }

  async navigateToRoot(): Promise<void> {
    await this.goTo('/');
    await this.waitForPageLoad();
    await this.waitForDomContentLoaded();
  }

  async reloadPage(timeout = 60000): Promise<void> {
    try {
      await this.page.reload({ waitUntil: 'load', timeout });
    } catch {
      // reload may time out on slow clusters; continue
    }
    await this.page.waitForLoadState('networkidle', { timeout }).catch(() => {
      // networkidle may not be reached with persistent connections; continue
    });
  }

  async selectFromFormOption(): Promise<void> {
    const formOption = this.locator('button[role="menuitem"]:has-text("From form")');
    await this.robustClick(formOption);
  }

  async selectWithFormOption(): Promise<void> {
    const formOption = this.locator('button[role="menuitem"]:has-text("With form")');
    await this.robustClick(formOption);
  }

  async selectYAMLOption(): Promise<void> {
    const yamlOption = this.locator('button:has-text("YAML")');
    await this.robustClick(yamlOption);
  }

  async verifySubtitle(subtitleText: string): Promise<boolean> {
    try {
      const subtitleLocator = this.pageHeadingLocator(subtitleText, 'subtitle');
      await subtitleLocator.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      return await subtitleLocator.isVisible();
    } catch {
      return false;
    }
  }

  async verifyTitle(titleText: string): Promise<boolean> {
    try {
      const titleLocator = this.pageHeadingLocator(titleText, 'title');
      await titleLocator.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      return await titleLocator.isVisible();
    } catch {
      return false;
    }
  }

  async waitForDataPropagation(ms = TestTimeouts.UI_DELAY_EXTRA): Promise<void> {
    await this.page.waitForTimeout(ms);
  }

  async waitForDomContentLoaded(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  async waitForLoadStateNetworkIdle(timeoutMs = 30_000): Promise<void> {
    await this.page.waitForLoadState('networkidle', { timeout: timeoutMs }).catch(() => undefined);
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  async waitForStatusText(expectedStatus: string): Promise<boolean> {
    return await waitForElementText(
      this._statusElements,
      expectedStatus,
      TestTimeouts.STATUS_VALIDATION,
    );
  }

  async waitForSubtitle(subtitle: string, timeout: number = TestTimeouts.VM_BOOTUP): Promise<void> {
    await this.pageHeadingLocator(subtitle, 'subtitle').waitFor({ state: 'visible', timeout });
  }

  async waitForTitle(title: string, timeout: number = TestTimeouts.VM_BOOTUP): Promise<void> {
    await this.pageHeadingLocator(title, 'title').waitFor({ state: 'visible', timeout });
  }

  async waitForUrlContains(
    urlString: string,
    timeout: number = TestTimeouts.NAVIGATION,
  ): Promise<boolean> {
    return await waitForCondition(
      async () => {
        const currentUrl = this.page.url();
        return currentUrl.includes(urlString);
      },
      timeout,
      TestTimeouts.POLLING_INTERVAL,
    );
  }
}
