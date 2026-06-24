// Base class for page objects. Extends BaseComponent with page-level concerns:
// navigation (goTo), context management, resource tracking, and page verification.

import BaseComponent from '@/components/shared/base-component';
import type { ContextKey, ContextValueType } from '@/context-managers/context-keys';
import ScenarioContextManager from '@/context-managers/scenario-context-manager';
import { TestTimeouts } from '@/utils/test-config';
import type { TrackedResourceType } from '@/utils/test-resource-tracker';
import { waitForCondition } from '@/utils/wait-helpers';
import type { Locator, Page } from '@playwright/test';

export default abstract class BasePage extends BaseComponent {
  constructor(page: Page) {
    super(page);
  }

  protected get ctx(): ScenarioContextManager {
    return ScenarioContextManager.getInstance();
  }

  protected trackResource(type: TrackedResourceType, name: string, namespace?: string): void {
    this.ctx.trackResource(type, name, namespace);
  }

  protected getCtxVal<K extends ContextKey>(key: K): ContextValueType<K> | undefined {
    return this.ctx.get(key);
  }

  protected setCtxVal<K extends ContextKey>(key: K, value: ContextValueType<K>): void {
    this.ctx.set(key, value);
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

  override async waitForCondition(
    condition: () => Promise<boolean>,
    timeout: number = TestTimeouts.DEFAULT,
    pollInterval: number = TestTimeouts.UI_DELAY_SHORT,
  ): Promise<boolean> {
    return await waitForCondition(condition, timeout, pollInterval);
  }

  async clickSaveBtn(): Promise<void> {
    const saveButton = this.locator('button#save-changes');
    await this.robustClick(saveButton);
  }

  async clickSaveChanges(): Promise<void> {
    const saveChangesButton = this.locator('[data-test="save-changes"]');
    await saveChangesButton.click();
  }
}
