/**
 * Base class for ALL UI components providing robust element interaction with retry logic.
 * Owns all Playwright page interactions: locators, clicks, waits, navigation.
 * PageObjects extend this via BasePage which adds context management and resource tracking.
 */

import { getErrorMessage } from '@/data-models/kubernetes-types';
import { TestTimeouts } from '@/utils/test-config';
import { waitForCondition } from '@/utils/wait-helpers';
import type { Locator, Page } from '@playwright/test';

export default class BaseComponent {
  private readonly defaultRobustClickConfig = {
    timeout: TestTimeouts.CLUSTER_OPERATION,
    retries: 3,
    retryDelay: 1000,
    force: false,
    waitForState: 'visible' as const,
  };

  private readonly loadingIndicators = [
    '.pf-v6-c-spinner',
    '.pf-c-spinner',
    '.pf-v5-c-spinner',
    '[data-test="loading"]',
    '[data-test-id="loading-indicator"]',
    '.co-m-loader',
    '.loading-skeleton',
    '[class*="skeleton"]',
  ];

  protected readonly _deleteConfirmationButton = this.locator(
    '[role="dialog"] button.pf-m-danger:has-text("Delete")',
  );

  constructor(public readonly page: Page) {}

  private async performRobustClick(
    locator: Locator,
    config: {
      timeout: number;
      retries: number;
      retryDelay: number;
      force: boolean;
      waitForState: 'visible' | 'attached' | 'detached' | 'hidden';
    },
  ): Promise<void> {
    let lastError: Error | null = null;
    const attemptTimeout = config.timeout / config.retries;

    for (let attempt = 1; attempt <= config.retries; attempt++) {
      try {
        await this.waitForLoadingComplete(Math.min(attemptTimeout / 4, 3000));

        await locator.waitFor({
          state: config.waitForState,
          timeout: attemptTimeout,
        });

        await locator.waitFor({
          state: 'attached',
          timeout: attemptTimeout / 3,
        });

        await locator.scrollIntoViewIfNeeded({ timeout: attemptTimeout / 3 });

        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MICRO);

        try {
          await locator.click({
            force: config.force,
            timeout: attemptTimeout,
          });
          return;
        } catch (clickError: unknown) {
          const errorMessage = getErrorMessage(clickError);

          if (
            attempt < config.retries &&
            (errorMessage.includes('intercept') ||
              errorMessage.includes('not visible') ||
              errorMessage.includes('outside of the viewport') ||
              errorMessage.includes('detached') ||
              errorMessage.includes('hidden'))
          ) {
            await locator.click({
              force: true,
              timeout: attemptTimeout,
            });
            return;
          }
          throw clickError;
        }
      } catch (error: unknown) {
        lastError = error instanceof Error ? error : new Error(getErrorMessage(error));
        const errorMessage = getErrorMessage(error);

        if (errorMessage.includes('detached') || errorMessage.includes('stale')) {
          await this.page.waitForTimeout(config.retryDelay);
          continue;
        }

        if (attempt < config.retries && config.retryDelay > 100) {
          await this.page.waitForTimeout(config.retryDelay);
        }
      }
    }

    throw new Error(`Robust click failed after ${config.retries} attempts: ${lastError?.message}`);
  }

  async clickButtonByText(buttonText: string): Promise<void> {
    const button = this.locator('button', { hasText: buttonText });
    await button.click();
  }

  async clickCreateAndSelectOption(
    createButtonSelector = '[data-test="item-create"]',
    optionSelector: string,
    waitForDropdown = true,
  ): Promise<void> {
    const createButton = this.locator(createButtonSelector);
    await this.robustClick(createButton);

    if (waitForDropdown) {
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    }

    const option = this.locator(optionSelector);
    await option.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ACTION_COMPLETE,
    });
    await this.robustClick(option);
  }

  protected async clickDeleteConfirmationButton(): Promise<void> {
    await this.robustClick(this._deleteConfirmationButton);
  }

  async clickDialogSaveButton(): Promise<void> {
    const dialogSaveButton = this.locator('[role="dialog"] [data-test="save-button"]');
    await dialogSaveButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
    await this.robustClick(dialogSaveButton);
  }

  async clickElementByExactText(elementSelector: string, exactText: string): Promise<void> {
    const allElements = this.locator(elementSelector);
    const count = await allElements.count();

    for (let i = 0; i < count; i++) {
      const element = allElements.nth(i);
      const text = await element.textContent();
      if (text?.trim() === exactText) {
        await element.click();
        return;
      }
    }

    throw new Error(`Element "${elementSelector}" with exact text "${exactText}" not found`);
  }

  async clickListboxButtonByText(buttonText: string): Promise<void> {
    const listbox = this.locator('[role="listbox"]');
    await listbox.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    const button = listbox.locator('button', { hasText: buttonText });
    await button.click();
  }

  async clickSave(): Promise<void> {
    const saveButton = this.locator('button').filter({ hasText: 'Save' });
    await this.robustClick(saveButton);
  }

  async clickSaveBtn(): Promise<void> {
    const saveButton = this.locator('button#save-changes');
    await this.robustClick(saveButton);
  }

  async clickSaveByTestId(): Promise<void> {
    const saveButton = this.locator('[data-test="save-button"]');
    await this.robustClick(saveButton);
  }

  async clickSaveChanges(): Promise<void> {
    const saveChangesButton = this.locator('[data-test="save-changes"]');
    await this.robustClick(saveChangesButton);
  }

  async clickTemplateByTestId(templateTestId: string, templateSelector?: string): Promise<void> {
    const selector = templateSelector ?? `[data-test-id="${templateTestId}"]`;
    const templateCard = this.locator(selector);
    await this.robustClick(templateCard, { waitForState: 'attached' });
  }

  protected async goTo(url: string) {
    await this.page.goto(url, { timeout: TestTimeouts.NAVIGATION });
    await this.waitForLoadingComplete(TestTimeouts.UI_DELAY_MEDIUM);
  }

  protected async isPageStable(): Promise<boolean> {
    try {
      const loadingSelector = this.loadingIndicators.join(', ');
      const hasLoading = await this.page
        .locator(loadingSelector)
        .first()
        .isVisible({ timeout: TestTimeouts.UI_DELAY_SHORT })
        .catch(() => false);

      return !hasLoading;
    } catch {
      return true;
    }
  }

  protected locator(
    selectorText: string,
    options?: {
      has?: Locator;
      hasNot?: Locator;
      hasNotText?: RegExp | string;
      hasText?: RegExp | string;
    },
  ) {
    return this.page.locator(selectorText, options);
  }

  async navigateToTab(
    tabLocator: Locator,
    timeout: number = TestTimeouts.RESOURCE_CREATION,
  ): Promise<void> {
    await this.waitForLoadingComplete(Math.min(timeout / 4, 3000));

    await tabLocator.waitFor({ state: 'visible', timeout });
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    await this.robustClick(tabLocator);

    await this.waitForLoadingComplete(Math.min(timeout / 2, TestTimeouts.UI_DELAY_MEDIUM));
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  protected async robustClick(
    locator: Locator,
    options: {
      timeout?: number;
      retries?: number;
      retryDelay?: number;
      force?: boolean;
      waitForState?: 'visible' | 'attached' | 'detached' | 'hidden';
    } = {},
  ): Promise<void> {
    const config = { ...this.defaultRobustClickConfig, ...options };
    await this.performRobustClick(locator, config);
  }

  protected async robustClickWithVerification(
    locator: Locator,
    expectedState: 'checked' | 'unchecked' | 'enabled' | 'disabled',
    options: {
      timeout?: number;
      retries?: number;
      retryDelay?: number;
      force?: boolean;
      waitForState?: 'visible' | 'attached' | 'detached' | 'hidden';
      verificationDelay?: number;
    } = {},
  ): Promise<void> {
    const config = { ...this.defaultRobustClickConfig, ...options };
    const { verificationDelay = TestTimeouts.UI_DELAY_SHORT } = options;
    const attemptTimeout = config.timeout / config.retries;

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= config.retries; attempt++) {
      try {
        await this.waitForLoadingComplete(Math.min(attemptTimeout / 4, 3000));

        await locator.waitFor({
          state: config.waitForState,
          timeout: attemptTimeout,
        });

        await locator.waitFor({
          state: 'attached',
          timeout: attemptTimeout / 3,
        });

        await locator.scrollIntoViewIfNeeded({ timeout: attemptTimeout / 3 });

        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MICRO);

        await locator.click({
          force: config.force,
          timeout: attemptTimeout,
        });

        await this.page.waitForTimeout(verificationDelay);

        let isInExpectedState = false;
        switch (expectedState) {
          case 'checked':
            isInExpectedState = await locator.isChecked();
            break;
          case 'unchecked':
            isInExpectedState = !(await locator.isChecked());
            break;
          case 'enabled':
            isInExpectedState = await locator.isEnabled();
            break;
          case 'disabled':
            isInExpectedState = !(await locator.isEnabled());
            break;
        }

        if (isInExpectedState) {
          return;
        } else if (attempt < config.retries) {
          if (config.retryDelay > 100) {
            await this.page.waitForTimeout(config.retryDelay);
          }
          continue;
        } else {
          throw new Error(`Click succeeded but element is not in expected state: ${expectedState}`);
        }
      } catch (error: unknown) {
        lastError = error instanceof Error ? error : new Error(getErrorMessage(error));
        const errorMessage = getErrorMessage(error);

        if (errorMessage.includes('detached') || errorMessage.includes('stale')) {
          await this.page.waitForTimeout(config.retryDelay);
          continue;
        }

        if (attempt < config.retries && config.retryDelay > 100) {
          await this.page.waitForTimeout(config.retryDelay);
        }
      }
    }

    throw new Error(
      `Robust click with verification failed after ${config.retries} attempts: ${lastError?.message}`,
    );
  }

  async verifyPageLoaded(
    indicatorSelectors: string[] = [],
    includeCreateButton = true,
    timeout = TestTimeouts.UI_VISIBILITY_QUICK,
  ): Promise<boolean> {
    try {
      await this.waitForLoadingComplete(Math.min(timeout / 2, TestTimeouts.UI_DELAY_MEDIUM));

      const createButton = this.locator('[data-test="item-create"]');
      let pageLoaded = includeCreateButton ? createButton : null;

      if (indicatorSelectors.length > 0) {
        const indicatorLocators = indicatorSelectors.map((selector) => this.locator(selector));
        if (pageLoaded) {
          pageLoaded = pageLoaded.or(indicatorLocators[0]);
          for (let i = 1; i < indicatorLocators.length; i++) {
            pageLoaded = pageLoaded.or(indicatorLocators[i]);
          }
        } else {
          pageLoaded = indicatorLocators[0];
          for (let i = 1; i < indicatorLocators.length; i++) {
            pageLoaded = pageLoaded.or(indicatorLocators[i]);
          }
        }
      }

      if (!pageLoaded) {
        pageLoaded = createButton;
      }

      await pageLoaded.first().waitFor({ state: 'visible', timeout });
      return await pageLoaded
        .first()
        .isVisible()
        .catch(() => false);
    } catch {
      return false;
    }
  }

  async verifyTextVisible(
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
        if (isVisible) {
          return true;
        }

        const altLocator = this.locator(`text=${text}`);
        const altVisible = await (useFirst ? altLocator.first() : altLocator)
          .isVisible({ timeout: TestTimeouts.POLLING_INTERVAL })
          .catch(() => false);

        if (altVisible) {
          return true;
        }

        const containerLocator = this.page.getByText(text);

        const containerVisible = await containerLocator
          .first()
          .isVisible({ timeout: TestTimeouts.UI_DELAY_SHORT })
          .catch(() => false);
        if (containerVisible) {
          return true;
        }
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

  protected async waitForChildElements(
    parentLocator: Locator,
    childSelector: string,
    options: {
      minCount?: number;
      timeout?: number;
      pollInterval?: number;
    } = {},
  ): Promise<boolean> {
    const {
      minCount = 1,
      timeout = TestTimeouts.UI_ELEMENT_VISIBILITY,
      pollInterval = TestTimeouts.UI_DELAY_SHORT,
    } = options;

    const childLocator = parentLocator.locator(childSelector);

    return await waitForCondition(
      async () => {
        const count = await childLocator.count();
        return count >= minCount;
      },
      timeout,
      pollInterval,
    );
  }

  protected async waitForCondition(
    condition: () => Promise<boolean>,
    timeout: number = TestTimeouts.DEFAULT,
    pollInterval: number = TestTimeouts.UI_DELAY_SHORT,
  ): Promise<boolean> {
    return await waitForCondition(condition, timeout, pollInterval);
  }

  protected async waitForLoadingComplete(timeout = TestTimeouts.UI_DELAY_MEDIUM): Promise<void> {
    const loadingSelector = this.loadingIndicators.join(', ');
    const loadingElements = this.page.locator(loadingSelector);

    try {
      const count = await loadingElements.count().catch(() => 0);
      if (count > 0) {
        await loadingElements.first().waitFor({ state: 'hidden', timeout });
      }
    } catch {
      // No loading indicators found or timeout - continue
    }
  }

  async waitForTemplateForm(
    formInputSelector = '[data-test-id="template-catalog-vm-name-input"]',
    timeout = TestTimeouts.UI_VISIBILITY_QUICK,
  ): Promise<void> {
    const formInput = this.locator(formInputSelector);
    await formInput.waitFor({ state: 'visible', timeout });
  }
}
