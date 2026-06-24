/**
 * Gating test: Console SDK toast notification rendering.
 *
 * Validates that the OpenShift Console's toast system (used by the kubevirt-plugin
 * for checkup rerun/delete feedback) renders all PatternFly alert variants correctly.
 *
 * Strategy: navigates to the Checkups page, then injects toasts via the Console SDK's
 * ToastContext (React fiber traversal). No checkup operations are executed — this is a
 * pure rendering validation.
 *
 * Covers: CNV-74440 (toast notification support for checkups)
 */

import { GATING_TAG } from '@/data-models/test-tags';
import { expect, test } from '@/fixtures/gating-fixture';
import type { ToastVariant } from '@/utils/toast-test-helper';
import { ToastTestHelper } from '@/utils/toast-test-helper';

interface ToastCase {
  content: string;
  title: string;
  variant: ToastVariant;
}

const TOAST_CASES: ToastCase[] = [
  {
    content: 'Network error: connection refused',
    title: 'Failed to rerun checkup',
    variant: 'danger',
  },
  {
    content: 'Storage checkup is being rerun',
    title: 'Checkup rerun started',
    variant: 'info',
  },
  {
    content: '',
    title: 'Checkup deleted successfully',
    variant: 'success',
  },
  {
    content: 'Some nodes did not respond within the timeout',
    title: 'Checkup completed with warnings',
    variant: 'warning',
  },
];

test.describe('Checkups toast notifications (gating)', { tag: [GATING_TAG] }, () => {
  let toastHelper: ToastTestHelper;

  test.beforeEach(async ({ checkupsPage }) => {
    await checkupsPage.navigateToCheckupsViaUI();
    toastHelper = checkupsPage.createToastHelper();
    await toastHelper.cacheToastContext();
  });

  test.afterEach(async () => {
    await toastHelper.clearAllToasts();
  });

  for (const tc of TOAST_CASES) {
    test(`Toast renders correctly for ${tc.variant} variant`, async () => {
      await test.step(`Fire ${tc.variant} toast via Console SDK context`, async () => {
        await toastHelper.addToast({
          content: tc.content || undefined,
          dismissible: true,
          timeout: false,
          title: tc.title,
          variant: tc.variant,
        });
      });

      await test.step(`Verify ${tc.variant} toast is visible with correct text`, async () => {
        const result = await toastHelper.getVisibleToast(tc.variant, tc.title);
        expect.soft(result.found, `${tc.variant} toast should be visible in the DOM`).toBe(true);
        expect.soft(result.title, `Toast title should contain "${tc.title}"`).toContain(tc.title);
        if (tc.content) {
          expect
            .soft(result.content, `Toast content should contain "${tc.content}"`)
            .toContain(tc.content);
        }
      });

      await test.step(`Dismiss ${tc.variant} toast and verify removal`, async () => {
        await toastHelper.clearAllToasts();

        const dismissed = await toastHelper.waitForToastDismissed(tc.variant, tc.title);
        expect.soft(dismissed, `${tc.variant} toast should be removed after dismissal`).toBe(true);
      });
    });
  }

  test('Multiple toasts render simultaneously without overlap', async () => {
    await test.step('Fire all four toast variants at once', async () => {
      for (const tc of TOAST_CASES) {
        await toastHelper.addToast({
          content: tc.content || undefined,
          dismissible: true,
          timeout: false,
          title: tc.title,
          variant: tc.variant,
        });
      }
    });

    await test.step('Verify all four toasts are visible simultaneously', async () => {
      for (const tc of TOAST_CASES) {
        const result = await toastHelper.getVisibleToast(tc.variant, tc.title);
        expect
          .soft(result.found, `${tc.variant} toast ("${tc.title}") should be visible`)
          .toBe(true);
      }
    });

    await test.step('Clear all toasts and verify none remain', async () => {
      await toastHelper.clearAllToasts();

      for (const tc of TOAST_CASES) {
        const result = await toastHelper.getVisibleToast(tc.variant, tc.title);
        expect.soft(result.found, `${tc.variant} toast should be cleared`).toBe(false);
      }
    });
  });
});
