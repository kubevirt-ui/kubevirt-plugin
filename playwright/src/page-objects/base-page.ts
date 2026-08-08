/**
 * Base class for all page objects. Extends BaseComponent (all Playwright interactions)
 * and adds context management and resource tracking for test isolation.
 */

import BaseComponent from '@/components/shared/base-component';
import type { ContextKey, ContextValueType } from '@/context-managers/context-keys';
import ScenarioContextManager from '@/context-managers/scenario-context-manager';
import type { TrackedResourceType } from '@/utils/test-resource-tracker';
import type { Page } from '@playwright/test';

export default abstract class BasePage extends BaseComponent {
  constructor(page: Page) {
    super(page);
  }

  protected get ctx(): ScenarioContextManager {
    return ScenarioContextManager.getInstance();
  }

  protected getCtxVal<K extends ContextKey>(key: K): ContextValueType<K> | undefined {
    return this.ctx.get(key);
  }

  protected setCtxVal<K extends ContextKey>(key: K, value: ContextValueType<K>): void {
    this.ctx.set(key, value);
  }

  protected trackResource(type: TrackedResourceType, name: string, namespace?: string): void {
    this.ctx.trackResource(type, name, namespace);
  }
}
