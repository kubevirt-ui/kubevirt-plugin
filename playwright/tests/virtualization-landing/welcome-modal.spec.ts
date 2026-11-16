import NavigationComponent from '@/components/shared/navigation-component';
import { T2 } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/scenario-test-fixture';
import { TestTimeouts } from '@/utils/test-config';
import {
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

// Untagged: re-enables the welcome modal via resetUserSettings, which fights
// global setup (disable-welcome-modals) and flakes parallel Tier2 runs.
test.describe('Welcome Modal', () => {
  test('WelcomeModal - checkbox dismiss flow', async ({ apiClient, page, utils }) => {
    await resetUserSettings(apiClient);
    await utils.withAllure({
      suite: SUITE,
      feature: T2,
    });

    const nav = new NavigationComponent(page);

    await test.step('Verify welcome modal is visible', async () => {
      await nav.clickNavVirtualMachines();
      await page.waitForLoadState('load');

      await verifyWelcomeModalVisibility(page, true, TestTimeouts.SHORT_WAIT);
    });

    await test.step('Click "Start tour" and verify all steps display in order', async () => {
      await page.reload({ waitUntil: 'load' });
      await page.waitForLoadState('load');

      await page.getByTestId('start-tour-btn').click();

      await tourStepsTest(page);

      // Dismiss onboarding popover if it appeared after tour ended
      const onboardingDismiss = page.locator('[data-test="onboarding-dismiss-btn"]');
      if (await onboardingDismiss.isVisible().catch(() => false)) {
        await onboardingDismiss.click();
        await page.waitForTimeout(500);
      }

      await expendSidebarIfCollapsed(page);
    });

    await test.step('Click "Do not show again" checkbox, verify settings updated and modal stays open', async () => {
      await enterVirtualMachinesPage(page, nav);
      await checkIfModalIsVisibleAfterCheckboxClick(page);
    });

    await test.step('Close modal and verify no modal or onboarding popovers are visible', async () => {
      await page.locator(CLOSE_BUTTON_LOCATOR).click();

      const popoverVisible = await page.locator(ONBOARDING_POPOVER_LOCATOR).first().isVisible();
      expect(
        popoverVisible,
        'Onboarding popovers should not be displayed after closing modal with checkbox checked',
      ).toBe(false);

      await page.reload({ waitUntil: 'load' });
      await page.waitForLoadState('load');

      await verifyWelcomeModalVisibility(page, false, TestTimeouts.RETRY_DELAY);
    });
  });
});
