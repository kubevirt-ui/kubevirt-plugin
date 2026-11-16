/**
 * Upload progress toast — shared component for the CDI upload-experience toasts
 * (see `useUploadProgressToast` in product code). Covers the "uploading" toast
 * (with abort action and context links), the terminal success toast (with links),
 * and the terminal aborted/error toasts.
 */

import { TestTimeouts } from '@/utils/test-config';
import type { Locator, Page } from '@playwright/test';

import BaseComponent from './base-component';

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
      ? this.toastContaining('upload-progress-toast', fileName).getByTestId('upload-progress-abort')
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
    await this.waitForToastVisible('upload-progress-aborted-toast', fileName, timeout, 'aborted');
  }

  /** Waits until the error toast is visible (optionally matching `fileName`). */
  async expectErrorToastVisible(
    fileName?: string,
    timeout = TestTimeouts.UI_ELEMENT_VISIBILITY,
  ): Promise<void> {
    await this.waitForToastVisible('upload-progress-error-toast', fileName, timeout, 'error');
  }

  /**
   * Waits until either the uploading toast or a terminal (success/error/aborted)
   * toast is visible. Useful when auth may fail before an abortable upload starts.
   *
   * File names live on the PF Alert title outside the ToastLayout `data-test` Flex,
   * so matching scopes through the parent alert when `fileName` is provided.
   */
  async expectUploadingOrTerminalToastVisible(
    fileName?: string,
    timeout = TestTimeouts.UI_ELEMENT_VISIBILITY,
  ): Promise<'uploading' | 'success' | 'error' | 'aborted'> {
    const uploading = this.toastContaining('upload-progress-toast', fileName);
    const success = this.toastContaining('upload-progress-success-toast', fileName);
    const error = this.toastContaining('upload-progress-error-toast', fileName);
    const aborted = this.toastContaining('upload-progress-aborted-toast', fileName);

    const start = Date.now();
    await uploading
      .or(success)
      .or(error)
      .or(aborted)
      .first()
      .waitFor({ state: 'visible', timeout });

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
      `Upload toast became visible but could not classify state${fileName ? ` for "${fileName}"` : ''}`,
    );
  }

  /**
   * Waits until the upload toast reaches a terminal state (success/error/aborted).
   * The uploading toast stays visible during the whole browser upload, so callers must
   * not treat "uploading" as an outcome when the DataVolume never leaves UploadReady.
   */
  async waitForTerminalUploadState(
    fileName?: string,
    timeout = TestTimeouts.LONG_OPERATION,
  ): Promise<'success' | 'error' | 'aborted'> {
    const success = this.toastContaining('upload-progress-success-toast', fileName);
    const error = this.toastContaining('upload-progress-error-toast', fileName);
    const aborted = this.toastContaining('upload-progress-aborted-toast', fileName);

    await success.or(error).or(aborted).first().waitFor({ state: 'visible', timeout });
    if (await error.first().isVisible().catch(() => false)) return 'error';
    if (await aborted.first().isVisible().catch(() => false)) return 'aborted';
    return 'success';
  }

  /** Closes any upload toast so a retried upload cannot read the previous attempt's state. */
  async dismissUploadToasts(): Promise<void> {
    const closeButtons = this.page.locator('.pf-v6-c-alert-group button[aria-label*="Close"]');
    for (let attempt = 0; attempt < 5; attempt += 1) {
      if (!(await this.isAnyUploadToastVisible(TestTimeouts.UI_DELAY_MEDIUM))) {
        return;
      }
      await closeButtons
        .filter({ visible: true })
        .first()
        .click({ force: true })
        .catch(() => undefined);
      await this.page.waitForTimeout(TestTimeouts.NETWORK_DELAY);
    }
  }

  /** Message rendered by the upload error toast (CDI/proxy/certificate failure). */
  async getUploadErrorToastText(fileName?: string): Promise<string> {
    const errorToast = this.toastContaining('upload-progress-error-toast', fileName).first();
    const alert = this.page
      .locator('.pf-v6-c-alert, .pf-v5-c-alert, .pf-c-alert')
      .filter({ has: errorToast })
      .first();
    return ((await alert.textContent().catch(() => null)) ?? (await errorToast.textContent()) ?? '')
      .trim()
      .replace(/\s+/g, ' ');
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
    await this.waitForToastVisible('upload-progress-toast', fileName, timeout, 'uploading');
  }

  /** Whether the abort button is currently visible (optionally scoped to `fileName`). */
  async isAbortButtonVisible(
    timeout = TestTimeouts.UI_DELAY_MEDIUM,
    fileName?: string,
  ): Promise<boolean> {
    const abortButton = fileName
      ? this.toastContaining('upload-progress-toast', fileName).getByTestId('upload-progress-abort')
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
   * Toast body `data-test` Flex often omits the file name — it lives on the Alert title.
   * Prefer body text match, then parent alert/li that contains the file name.
   */
  private toastContaining(dataTest: string, fileName?: string): Locator {
    const root = this.testId(dataTest);
    if (!fileName) {
      return root;
    }
    return root.filter({ hasText: fileName }).or(
      this.page
        .locator(
          '.pf-v6-c-alert, .pf-v5-c-alert, .pf-c-alert, li.pf-v6-c-alert-group__item, li.pf-v5-c-alert-group__item, li',
        )
        .filter({ hasText: fileName })
        .getByTestId(dataTest),
    );
  }

  private async waitForToastVisible(
    dataTest: string,
    fileName: string | undefined,
    timeout: number,
    kind: string,
  ): Promise<void> {
    try {
      await this.toastContaining(dataTest, fileName)
        .first()
        .waitFor({ state: 'visible', timeout });
    } catch {
      const suffix = fileName ? ` for "${fileName}"` : '';
      throw new Error(`Expected ${kind} upload toast to be visible${suffix} within ${timeout}ms`);
    }
  }
}
