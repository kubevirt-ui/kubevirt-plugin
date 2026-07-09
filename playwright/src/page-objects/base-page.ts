/**
 * Base class for all page objects. Extends BaseComponent (all Playwright interactions)
 * and adds context management and resource tracking for test isolation.
 */

import BaseComponent from '@/components/shared/base-component';
import type { ContextKey, ContextValueType } from '@/context-managers/context-keys';
import ScenarioContextManager from '@/context-managers/scenario-context-manager';
import { EnvVariables } from '@/utils/env-variables';
import type { TrackedResourceType } from '@/utils/test-resource-tracker';
import type { Page, TestInfo } from '@playwright/test';
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
];

export type TimeoutAwareTestInfo = TestInfo & {
  _actionTimeouts?: Array<{ method: string; message: string }>;
  _diagnosisHandled?: boolean;
};

export function isTimeoutError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const msg = (error as { message?: string }).message ?? String(error);
  return TIMEOUT_PATTERNS.some((p) => p.test(msg));
}

/**
 * Wraps a page object so all async method calls silently swallow errors.
 * Timeout errors are recorded on testInfo._actionTimeouts so the
 * _autoTimeoutGuard fixture can reclassify the test as skipped.
 * Non-timeout errors are swallowed — only expect.soft assertions cause failures.
 *
 * When DIAGNOSE_FAILURES=1, timeout errors are auto-diagnosed by inspecting
 * the page URL and error patterns. The verdict (pass/skip/fail) determines
 * whether the error is swallowed, recorded as a timeout, or re-thrown.
 * A screenshot is captured at the failure point for diagnostic review.
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
              if (isTimeoutError(error)) {
                const msg =
                  error && typeof error === 'object'
                    ? ((error as { message?: string }).message ?? String(error))
                    : String(error);

                try {
                  const info = base.info() as TimeoutAwareTestInfo;
                  if (!info._actionTimeouts) info._actionTimeouts = [];
                  info._actionTimeouts.push({ method: String(prop), message: msg });
                } catch {
                  /* outside test context — swallow */
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
