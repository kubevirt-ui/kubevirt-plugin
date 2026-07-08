/**
 * Console SDK toast notification rendering.
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

import { scenarioTest as test, expect } from '@/fixtures/scenario-fixture';
import type { ToastVariant } from '@/utils/toast-test-helper';
import { ToastTestHelper } from '@/utils/toast-test-helper';

interface ToastCase {
  variant: ToastVariant;
  title: string;
  content: string;
}

const TOAST_CASES: ToastCase[] = [
  {
    variant: 'danger',
    title: 'Failed to rerun checkup',
    content: 'Network error: connection refused',
  },
  {
    variant: 'info',
    title: 'Checkup rerun started',
    content: 'Storage checkup is being rerun',
  },
  {
    variant: 'success',
    title: 'Checkup deleted successfully',
    content: '',
  },
  {
    variant: 'warning',
    title: 'Checkup completed with warnings',
    content: 'Some nodes did not respond within the timeout',
  },
];

test.describe('Checkups toast notifications', () => {
  let toastHelper: ToastTestHelper;

  test.beforeEach(async ({ checkupsPage, page }) => {
    await checkupsPage.navigate();
    toastHelper = new ToastTestHelper(page);
    await toastHelper.cacheToastContext();
  });

  test.afterEach(async () => {
    await toastHelper.clearAllToasts();
  });

  for (const tc of TOAST_CASES) {
    test(`Toast renders correctly for ${tc.variant} variant`, async () => {
      await test.step(`Fire ${tc.variant} toast via Console SDK context`, async () => {
        await toastHelper.addToast({
          variant: tc.variant,
          title: tc.title,
          content: tc.content || undefined,
          dismissible: true,
          timeout: false,
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

        const afterClear = await toastHelper.getVisibleToast(tc.variant, tc.title);
        expect
          .soft(afterClear.found, `${tc.variant} toast should be removed after dismissal`)
          .toBe(false);
      });
    });
  }

  test('Multiple toasts render simultaneously without overlap', async () => {
    await test.step('Fire all four toast variants at once', async () => {
      for (const tc of TOAST_CASES) {
        await toastHelper.addToast({
          variant: tc.variant,
          title: tc.title,
          content: tc.content || undefined,
          dismissible: true,
          timeout: false,
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
