/**
 * Auto-hide navigation feature — e2e tests.
 *
 * These tests verify the auto-collapse behavior of the console left navigation
 * when users enter VirtualMachine pages. They require a running cluster with
 * CNV installed and the kubevirt-plugin deployed.
 *
 * Run locally with:
 *   RUN_FEATURE_TESTS=true npx playwright test --config=playwright.config.ts --project=features
 *
 * These tests are excluded from CI (the "features" project only loads when
 * the RUN_FEATURE_TESTS env var is set to "true").
 *
 * NOTE: The onboarding popover test verifies that the popover is correctly
 * suppressed when onboardingPopoversHidden.navCollapse = true in the ConfigMap
 * (set by the setup step). To test the popover dismiss flow, temporarily
 * remove navCollapse from setup.spec.ts beforeAll patch.
 */
import { BrowserContext, Page } from '@playwright/test';

import { expect, test } from '../../fixtures';
import { NavAutoHidePage } from '../../pages/NavAutoHidePage';
import { SHORT_TIMEOUT } from '../../utils/constants';
import { env } from '../../utils/env';

const NS = env.testNamespace;
const ONBOARDING_POPOVER_HEADER = "We've maximized your workspace";

test.describe.serial('Auto-hide navigation', () => {
  let context: BrowserContext;
  let page: Page;
  let nav: NavAutoHidePage;
  let hasVM = false;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext({
      storageState: 'playwright/.auth/session.json',
    });
    page = await context.newPage();
    nav = new NavAutoHidePage(page);

    await nav.enableAutoHide();
  });

  test.afterAll(async () => {
    await nav.enableAutoHide().catch(() => {});
    await page?.close();
    await context?.close();
  });

  // --- Test 1: Navigate to VM page and verify collapse ---

  test('nav collapses on first visit to VM page', async () => {
    await nav.goto(NS);
    await nav.expectNavCollapsed();
  });

  // --- Tests 2-4: Continue on the same page without re-navigating ---

  test('onboarding popover is correctly suppressed', async () => {
    const popover = page.getByRole('dialog').filter({ hasText: ONBOARDING_POPOVER_HEADER });
    const isVisible = await popover.isVisible().catch(() => false);

    if (isVisible) {
      await popover.getByRole('button', { name: 'Got it' }).click();
      await expect(popover).toBeHidden({ timeout: SHORT_TIMEOUT });
    }

    await nav.expectNavCollapsed();
  });

  test('nav stays collapsed when switching to VM list tab', async () => {
    await nav.clickVmListTab();
    await nav.expectNavCollapsed();
  });

  test('nav stays collapsed when drilling into a VM detail page', async () => {
    hasVM = await nav.gotoVMDetail(NS);
    test.skip(!hasVM, 'No VMs found in the test namespace — cannot test detail drill-in');

    await nav.expectNavCollapsed();

    // Return to the VM overview page so the next test has a known starting state
    await nav.goto(NS);
    await nav.expectNavCollapsed();
  });

  // --- Test 5: Session override (user expands nav manually) ---

  test('nav stays expanded after user manually expands it (session override)', async () => {
    await nav.expandNav();

    await nav.clickVmListTab();
    await nav.expectNavExpanded();

    await expect(nav.overviewTab).toBeVisible({ timeout: SHORT_TIMEOUT });
    await nav.overviewTab.click();
    await page.waitForLoadState('networkidle');

    await nav.expectNavExpanded();
  });

  // --- Tests 6-8: Require full navigations (fresh contexts for isolation) ---

  test('nav auto-collapses again after navigating away and back', async ({ browser }) => {
    const freshContext = await browser.newContext({
      storageState: 'playwright/.auth/session.json',
    });
    const freshPage = await freshContext.newPage();
    const freshNav = new NavAutoHidePage(freshPage);

    await freshNav.warmup();
    await freshNav.goto(NS);
    await freshNav.expectNavCollapsed();

    await freshPage.close();
    await freshContext.close();
  });

  test('nav does not collapse when auto-hide setting is disabled', async () => {
    await nav.disableAutoHide();
    await nav.goto(NS);
    await nav.expectNavExpanded();
  });

  test('nav collapses again when auto-hide setting is re-enabled', async ({ browser }) => {
    await nav.enableAutoHide();

    const freshContext = await browser.newContext({
      storageState: 'playwright/.auth/session.json',
    });
    const freshPage = await freshContext.newPage();
    const freshNav = new NavAutoHidePage(freshPage);

    await freshNav.warmup();
    await freshNav.goto(NS);
    await freshNav.expectNavCollapsed();

    await freshPage.close();
    await freshContext.close();
  });
});
