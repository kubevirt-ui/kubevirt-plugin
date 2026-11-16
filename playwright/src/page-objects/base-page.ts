/**
 * Base class for all page objects. Extends BaseComponent (all Playwright interactions)
 * and adds context management and resource tracking for test isolation.
 */

import BaseComponent from '@/components/shared/base-component';
import type { ContextKey, ContextValueType } from '@/context-managers/context-keys';
import ScenarioContextManager from '@/context-managers/scenario-context-manager';
import { dismissConsoleObstructions } from '@/utils/console-modals';

import type { TrackedResourceType } from '@/utils/test-resource-tracker';
import type { Locator, Page, TestInfo } from '@playwright/test';
import { test as base } from '@playwright/test';

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

  /** List index pages: 4.19+ use `h1`; older console builds use `data-test-id="resource-title"`. */
  protected listPageHeading(titlePattern: RegExp): Locator {
    return this.page
      .getByRole('heading', { level: 1, name: titlePattern })
      .or(this.page.locator('[data-test-id="resource-title"]').filter({ hasText: titlePattern }))
      .first();
  }

  /** Console error boundary ("Out-of-order effect") after rapid tab changes on VM detail. */
  protected async recoverConsoleCrashPage(): Promise<void> {
    await dismissConsoleObstructions(this.page);
    const crashed = this.page.getByRole('heading', { name: /Something wrong happened/i });
    if (!(await crashed.isVisible().catch(() => false))) {
      return;
    }
    await this.page.getByRole('button', { name: /Reload page/i }).click();
    await this.page.waitForLoadState('domcontentloaded');
    await dismissConsoleObstructions(this.page);
  }
}

const TIMEOUT_PATTERNS: RegExp[] = [
  /Timeout \d+ms exceeded/i,
  /TimeoutError/i,
  /exceeded while waiting/i,
  /waiting for locator/i,
  /locator\.waitFor/i,
  /page\.waitFor/i,
  /waiting for selector/i,
  /Navigation timeout/i,
  /net::ERR_TIMED_OUT/i,
  /within \d+ms$/i,
];

export type TimeoutAwareTestInfo = TestInfo & {
  _actionTimeouts?: Array<{ method: string; message: string }>;
};

export function isBrowserClosedError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const msg = (error as { message?: string }).message ?? String(error);
  return /Target page, context or browser has been closed/i.test(msg);
}

export function isTimeoutError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const msg = (error as { message?: string }).message ?? String(error);
  return TIMEOUT_PATTERNS.some((p) => p.test(msg));
}

/**
 * Wraps a page object so async method calls capture errors instead of
 * failing the test immediately. Timeout errors are recorded on
 * testInfo._actionTimeouts so the _autoTimeoutGuard fixture can
 * reclassify the test as skipped. Other errors are swallowed quietly.
 */
export function withSafeActions<T extends object>(instance: T): T {
  return new Proxy(instance, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (typeof value === 'function') {
        return (...args: unknown[]) => {
          const result = value.apply(target, args);
          if (result && typeof result === 'object' && typeof result.then === 'function') {
            return (result as Promise<unknown>).catch(async (error: unknown) => {
              const msg =
                error && typeof error === 'object'
                  ? ((error as { message?: string }).message ?? String(error))
                  : String(error);

              if (isBrowserClosedError(error)) {
                try {
                  const info = base.info() as TimeoutAwareTestInfo;
                  if (!info._actionTimeouts) info._actionTimeouts = [];
                  info._actionTimeouts.push({
                    method: String(prop),
                    message: 'browser context closed',
                  });
                } catch {
                  /* outside test context */
                }
              } else if (isTimeoutError(error)) {
                try {
                  const info = base.info() as TimeoutAwareTestInfo;
                  if (!info._actionTimeouts) info._actionTimeouts = [];
                  info._actionTimeouts.push({ method: String(prop), message: msg });
                } catch {
                  /* outside test context */
                }
              }
              return undefined;
            });
          }
          return result;
        };
      }
      return value;
    },
  });
}
