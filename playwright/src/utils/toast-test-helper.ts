/**
 * Toast test helper — fires Console SDK toast notifications by walking the
 * React fiber tree to locate the ToastContext provider.
 *
 * The OpenShift Console exposes `{ addToast, removeToast }` via a React
 * context at the app root. The kubevirt-plugin's `useKubevirtToast` hook
 * wraps this context. By calling `addToast` directly we can validate toast
 * rendering without triggering real checkup operations.
 *
 * This helper is intentionally low-level: it uses `page.evaluate()` to
 * interact with React internals. Keep all such calls here — never in specs.
 */

import type { Page } from '@playwright/test';

export type ToastVariant = 'danger' | 'info' | 'success' | 'warning';

interface ToastOptions {
  variant: ToastVariant;
  title: string;
  content?: string;
  dismissible?: boolean;
  timeout?: boolean;
}

export class ToastTestHelper {
  private contextCached = false;

  constructor(private page: Page) {}

  /**
   * Walks the React fiber tree from `#app` to find the Console SDK's
   * ToastContext provider and caches `addToast` / `removeToast` on `window`.
   *
   * Must be called once after a full page load, before any `addToast` call.
   * Throws if the context is not found (Console version too old or structure changed).
   */
  async cacheToastContext(): Promise<void> {
    const found = await this.page.evaluate(() => {
      const MAX_DEPTH = 40;
      const rootEl = document.getElementById('app');
      if (!rootEl) return false;

      const rootFiberKey = Object.keys(rootEl).find((k) => k.startsWith('__reactContainer'));
      if (!rootFiberKey) return false;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fiber = (rootEl as any)[rootFiberKey];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      function findToastProvider(f: any, depth: number): any {
        if (!f || depth > MAX_DEPTH) return null;
        if (f.tag === 10 && f.memoizedProps?.value) {
          const val = f.memoizedProps.value;
          if (typeof val === 'object' && val !== null && typeof val.addToast === 'function') {
            return val;
          }
        }
        return findToastProvider(f.child, depth + 1) || findToastProvider(f.sibling, depth + 1);
      }

      const ctx = findToastProvider(fiber, 0);
      if (!ctx) return false;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__toastHelper = {
        addToast: ctx.addToast,
        removeToast: ctx.removeToast,
      };
      return true;
    });

    if (!found) {
      throw new Error(
        'ToastTestHelper: Console SDK ToastContext not found in React fiber tree. ' +
          'Ensure the page is fully loaded before calling cacheToastContext().',
      );
    }
    this.contextCached = true;
  }

  /**
   * Fire a toast notification via the Console SDK's `addToast`.
   * Returns the toast ID (e.g. "toast-1") for later removal.
   */
  async addToast(options: ToastOptions): Promise<string> {
    this.ensureCached();
    return this.page.evaluate((opts) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const helper = (window as any).__toastHelper;
      return helper.addToast({
        variant: opts.variant,
        title: opts.title,
        content: opts.content,
        dismissible: opts.dismissible ?? true,
        timeout: opts.timeout ?? false,
      }) as string;
    }, options);
  }

  /** Remove a toast by ID. */
  async removeToast(toastId: string): Promise<void> {
    this.ensureCached();
    await this.page.evaluate((id) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__toastHelper.removeToast(id);
    }, toastId);
  }

  /** Remove all toasts fired during this session (IDs toast-1 through toast-50). */
  async clearAllToasts(): Promise<void> {
    if (!this.contextCached) return;
    await this.page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const helper = (window as any).__toastHelper;
      if (!helper) return;
      for (let i = 1; i <= 50; i++) {
        try {
          helper.removeToast(`toast-${i}`);
        } catch {
          // already removed or never existed
        }
      }
    });
  }

  /**
   * Assert that a toast with the given variant and title text is visible in the DOM.
   * Polls up to 5 seconds for the toast to appear (React rendering is async).
   */
  async getVisibleToast(
    variant: ToastVariant,
    titleSubstring: string,
  ): Promise<{ found: boolean; title: string; content: string }> {
    const maxWait = 5000;
    const pollInterval = 250;
    const deadline = Date.now() + maxWait;

    while (Date.now() < deadline) {
      const result = await this.page.evaluate(
        ({ v, t }) => {
          const alerts = Array.from(
            document.querySelectorAll(`.pf-v6-c-alert.pf-m-${v}, .pf-v5-c-alert.pf-m-${v}`),
          );
          for (const alert of alerts) {
            const titleEl = alert.querySelector('.pf-v6-c-alert__title, .pf-v5-c-alert__title');
            const titleText = titleEl?.textContent?.trim() ?? '';
            if (titleText.includes(t)) {
              const contentEl = alert.querySelector(
                '.pf-v6-c-alert__description, .pf-v5-c-alert__description',
              );
              return {
                found: true,
                title: titleText,
                content: contentEl?.textContent?.trim() ?? '',
              };
            }
          }
          return { found: false, title: '', content: '' };
        },
        { v: variant, t: titleSubstring },
      );
      if (result.found) return result;
      await this.page.waitForTimeout(pollInterval);
    }

    return { found: false, title: '', content: '' };
  }

  /**
   * Poll until a toast with the given variant/title is no longer visible.
   * Returns true if the toast disappears within the timeout, false if still present.
   */
  async waitForToastDismissed(
    variant: ToastVariant,
    titleSubstring: string,
    timeout = 5000,
  ): Promise<boolean> {
    const pollInterval = 250;
    const deadline = Date.now() + timeout;

    while (Date.now() < deadline) {
      const result = await this.getVisibleToast(variant, titleSubstring);
      if (!result.found) return true;
      await this.page.waitForTimeout(pollInterval);
    }
    return false;
  }

  private ensureCached(): void {
    if (!this.contextCached) {
      throw new Error('ToastTestHelper: call cacheToastContext() before using toast methods.');
    }
  }
}
