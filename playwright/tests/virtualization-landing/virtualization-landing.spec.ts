import NavigationComponent from '@/components/shared/navigation-component';
import { GATING, GATING_TAG, T2, T2_TAG } from '@/data-models/allure-constants';
import { expect, test as gatingTest } from '@/fixtures/gating-fixture';
import { test as scenarioTest } from '@/fixtures/scenario-test-fixture';
import { TestTimeouts } from '@/utils/test-config';
import { ROUTE_VIRTUALIZATION_LANDING_TAG } from '@/data-models/route-tags';
import {
  assertVirtualMachinesUsableDuringTour,
  checkIfModalIsVisibleAfterCheckboxClick,
  CLOSE_BUTTON_LOCATOR,
  enterVirtualMachinesPage,
  expendSidebarIfCollapsed,
  ONBOARDING_POPOVER_LOCATOR,
  resetUserSettings,
  SUITE,
  tourStepsTest,
  verifyWelcomeModalVisibility,
} from './utils/utils';

const GATING_SUITE = 'Virtualization pages';

gatingTest.describe(
  'Cluster home overview',
  { tag: [ROUTE_VIRTUALIZATION_LANDING_TAG, GATING_TAG] },
  () => {
    gatingTest(
      'Home overview page loads with VirtualMachines link and healthy operator',
      async ({ overviewPage, utils }) => {
        await utils.withAllure({ suite: GATING_SUITE, feature: GATING, tags: [GATING_TAG] });

        await overviewPage.navigateToClusterOverviewViaUI();

        await gatingTest.step('VirtualMachines navigation link is visible', async () => {
          const vmLink = await overviewPage.verifyVirtualMachineLink();
          expect.soft(vmLink, 'VirtualMachines heading should be visible').toBe(true);
        });
      },
    );
  },
);

scenarioTest.describe(
  'Welcome Modal',
  { tag: [ROUTE_VIRTUALIZATION_LANDING_TAG, T2_TAG, '@tier2-welcome-modal'] },
  () => {
    scenarioTest('WelcomeModal - checkbox dismiss flow', async ({ apiClient, page, utils }) => {
      await resetUserSettings(apiClient);
      await utils.withAllure({
        suite: SUITE,
        feature: T2,
        tags: [T2_TAG, '@tier2-welcome-modal'],
      });

      const nav = new NavigationComponent(page);

      await scenarioTest.step('Verify welcome modal is visible', async () => {
        await nav.clickNavVirtualMachines();
        await page.waitForLoadState('load');

        await verifyWelcomeModalVisibility(page, true, TestTimeouts.SHORT_WAIT);
      });

      await scenarioTest.step(
        'Click "Start tour" and verify all steps display in order',
        async () => {
          await page.reload({ waitUntil: 'load' });
          await page.waitForLoadState('load');

          await page.getByTestId('start-tour-btn').click();

          await assertVirtualMachinesUsableDuringTour(page);
          await tourStepsTest(page);

          const onboardingDismiss = page.locator('[data-test="onboarding-dismiss-btn"]');
          if (await onboardingDismiss.isVisible().catch(() => false)) {
            await onboardingDismiss.click();
            await page.waitForTimeout(500);
          }

          await expendSidebarIfCollapsed(page);
        },
      );

      await scenarioTest.step(
        'Click "Do not show again" checkbox, verify settings updated and modal stays open',
        async () => {
          await enterVirtualMachinesPage(page, nav);
          await checkIfModalIsVisibleAfterCheckboxClick(page);
        },
      );

      await scenarioTest.step(
        'Close modal and verify no modal or onboarding popovers are visible',
        async () => {
          await page.locator(CLOSE_BUTTON_LOCATOR).click();

          const popoverVisible = await page.locator(ONBOARDING_POPOVER_LOCATOR).first().isVisible();
          expect(
            popoverVisible,
            'Onboarding popovers should not be displayed after closing modal with checkbox checked',
          ).toBe(false);

          await page.reload({ waitUntil: 'load' });
          await page.waitForLoadState('load');

          await verifyWelcomeModalVisibility(page, false, TestTimeouts.RETRY_DELAY);
        },
      );
    });
  },
);
