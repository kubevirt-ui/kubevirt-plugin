/**
 * Upload progress toast — shared component for the CDI upload-experience toasts
 * (see `useUploadProgressToast` in product code). Covers the "uploading" toast
 * (with abort action and context links), the terminal success toast (with links),
 * and the terminal aborted/error toasts.
 *
 * Console renders each toast as a PatternFly Alert: the filename is in the Alert
 * title, while `data-test="upload-progress-*"` marks only the Alert description
 * (progress bar / links). Match by title + body, not `hasText` on the body.
 */

import { TestTimeouts } from '@/utils/test-config';
import type { Locator, Page } from '@playwright/test';

import BaseComponent from './base-component';

const TOAST_ALERT = '.pf-v6-c-alert, .pf-v5-c-alert, .pf-c-alert';
const TOAST_ALERT_TITLE = '.pf-v6-c-alert__title, .pf-v5-c-alert__title, .pf-c-alert__title';

export default class UploadProgressToastComponent extends BaseComponent {
  private readonly _abortButton = this.testId('upload-progress-abort');
  private readonly _abortedToast = this.testId('upload-progress-aborted-toast');
  private readonly _errorToast = this.testId('upload-progress-error-toast');
  private readonly _successToast = this.testId('upload-progress-success-toast');
  private readonly _uploadingToast = this.testId('upload-progress-toast');

  constructor(page: Page) {
    super(page);
  }

  /**
   * Clicks the abort ("Cancel upload") button. When `fileName` is provided, scopes
   * to the uploading toast that contains that file name.
   */
  async clickAbortUpload(fileName?: string): Promise<void> {
    const abortButton = fileName
      ? this.toastContaining(this._uploadingToast, fileName).getByTestId('upload-progress-abort')
      : this._abortButton;

    await abortButton.first().waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(abortButton.first());
  }

  /** Waits until the aborted toast is visible (optionally matching `fileName`). */
  async expectAbortedToastVisible(
    fileName?: string,
    timeout = TestTimeouts.UI_ELEMENT_VISIBILITY,
  ): Promise<void> {
    await this.waitForToastVisible(this._abortedToast, fileName, timeout, 'aborted');
  }

  /** Waits until the error toast is visible (optionally matching `fileName`). */
  async expectErrorToastVisible(
    fileName?: string,
    timeout = TestTimeouts.UI_ELEMENT_VISIBILITY,
  ): Promise<void> {
    await this.waitForToastVisible(this._errorToast, fileName, timeout, 'error');
  }

  /**
   * Waits until either the uploading toast or a terminal (success/error/aborted)
   * toast is visible. Useful when auth may fail before an abortable upload starts.
   */
  async expectUploadingOrTerminalToastVisible(
    fileName?: string,
    timeout = TestTimeouts.UI_ELEMENT_VISIBILITY,
  ): Promise<'uploading' | 'success' | 'error' | 'aborted'> {
    const uploading = this.toastContaining(this._uploadingToast, fileName);
    const success = this.toastContaining(this._successToast, fileName);
    const error = this.toastContaining(this._errorToast, fileName);
    const aborted = this.toastContaining(this._abortedToast, fileName);

    const start = Date.now();
    try {
      await uploading
        .or(success)
        .or(error)
        .or(aborted)
        .first()
        .waitFor({ state: 'visible', timeout });
    } catch {
      throw new Error(
        `Expected an upload toast${fileName ? ` for "${fileName}"` : ''} within ${timeout}ms. ${await this.toastDebugSuffix()}`,
      );
    }

    // The toast that triggered the wait above may have already transitioned to another
    // state by the time we classify it (e.g. a fast upload moving from "uploading" to
    // "success"), so keep polling for the remaining time budget instead of checking once.
    while (Date.now() - start < timeout) {
      if (await uploading.first().isVisible().catch(() => false)) return 'uploading';
      if (await success.first().isVisible().catch(() => false)) return 'success';
      if (await error.first().isVisible().catch(() => false)) return 'error';
      if (await aborted.first().isVisible().catch(() => false)) return 'aborted';
      await this.page.waitForTimeout(100);
    }

    throw new Error(
      `Upload toast became visible but could not classify state${fileName ? ` for "${fileName}"` : ''}. ${await this.toastDebugSuffix()}`,
    );
  }

  /**
   * Waits until the success toast is visible, and (if given) contains a link
   * with the expected label (e.g. "View volume", "View pod logs").
   */
  async expectSuccessToastWithLink(
    linkLabel?: string,
    timeout = TestTimeouts.UI_ELEMENT_VISIBILITY,
  ): Promise<void> {
    await this._successToast.first().waitFor({ state: 'visible', timeout });

    if (!linkLabel) {
      return;
    }

    await this._successToast
      .locator('[data-test="upload-progress-link"]')
      .filter({ hasText: linkLabel })
      .first()
      .waitFor({ state: 'visible', timeout });
  }

  /** Waits until the uploading toast for the given file (if provided) is visible. */
  async expectUploadingToastVisible(
    fileName?: string,
    timeout = TestTimeouts.UI_ELEMENT_VISIBILITY,
  ): Promise<void> {
    await this.waitForToastVisible(this._uploadingToast, fileName, timeout, 'uploading');
  }

  /** Whether the abort button is currently visible (optionally scoped to `fileName`). */
  async isAbortButtonVisible(
    timeout = TestTimeouts.UI_DELAY_MEDIUM,
    fileName?: string,
  ): Promise<boolean> {
    const abortButton = fileName
      ? this.toastContaining(this._uploadingToast, fileName).getByTestId('upload-progress-abort')
      : this._abortButton;

    return abortButton
      .first()
      .isVisible({ timeout })
      .catch(() => false);
  }

  /** Whether any upload toast (uploading or success) is currently visible. */
  async isAnyUploadToastVisible(timeout = TestTimeouts.UI_DELAY_MEDIUM): Promise<boolean> {
    return this._uploadingToast
      .or(this._successToast)
      .or(this._abortedToast)
      .or(this._errorToast)
      .first()
      .isVisible({ timeout })
      .catch(() => false);
  }

  /**
   * Toast Alert whose title includes `fileName` and whose description is `root`
   * (`data-test="upload-progress-*"`). The filename is the Alert title, not body text.
   */
  private toastContaining(root: Locator, fileName?: string): Locator {
    if (!fileName) {
      return root;
    }

    return this.page
      .locator(TOAST_ALERT)
      .filter({ has: this.page.locator(TOAST_ALERT_TITLE).filter({ hasText: fileName }) })
      .filter({ has: root });
  }

  private async toastDebugSuffix(): Promise<string> {
    const titles = (await this.page.locator(TOAST_ALERT_TITLE).allTextContents())
      .map((title) => title.trim())
      .filter(Boolean);

    return `Visible toast titles: ${titles.length ? titles.join('; ') : '(none)'}`;
  }

  private async waitForToastVisible(
    root: Locator,
    fileName: string | undefined,
    timeout: number,
    kind: string,
  ): Promise<void> {
    try {
      await this.toastContaining(root, fileName)
        .first()
        .waitFor({ state: 'visible', timeout });
    } catch {
      const suffix = fileName ? ` for "${fileName}"` : '';
      throw new Error(
        `Expected ${kind} upload toast to be visible${suffix} within ${timeout}ms. ${await this.toastDebugSuffix()}`,
      );
    }
  }
}
