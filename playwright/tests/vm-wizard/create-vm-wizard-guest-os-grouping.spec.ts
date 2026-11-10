import { ADMIN_ONLY_TAG, T1, T1_TAG } from '@/data-models/allure-constants';
import { PREFERENCE_VARIANT_OPTION_PATTERN } from '@/data-models/constants';
import { ROUTE_VM_WIZARD_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/create-vm-fixture';
import { setupTestNamespace } from '@/utils/test-setup-helpers';

const SUITE = 'VM Creation Wizard';

test.describe(
  'VM Creation Wizard — Guest OS preference grouping (CNV-97314)',
  { tag: [ROUTE_VM_WIZARD_TAG, T1_TAG, '@catalog-wizard', ADMIN_ONLY_TAG] },
  () => {
    test('Guest OS dropdown lists version groups instead of preference variants', async ({
      apiClient,
      vmListPage,
      vmWizardNavigationPage,
      utils,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_MEDIUM);
      await utils.withAllure({
        suite: SUITE,
        feature: T1,
        tags: [T1_TAG, '@catalog-wizard', ADMIN_ONLY_TAG],
      });

      const wizardNs = await setupTestNamespace(apiClient, 'wizard-gos-group');

      await vmListPage.switchToVirtualizationPerspective();
      await vmListPage.navigateToProjectVmListViaUI(wizardNs);
      await vmWizardNavigationPage.openWizardFromCreateDropdown();

      await test.step('Step 1: Deployment details', async () => {
        await vmWizardNavigationPage.selectLocationProject(wizardNs);
        await vmWizardNavigationPage.generateVmName();
        await vmWizardNavigationPage.clickNext();
      });

      await test.step('Step 2: Guest OS — options are grouped by version', async () => {
        const osTilesVisible = await vmWizardNavigationPage.verifyOsTilesVisible();
        expect.soft(osTilesVisible, 'OS tiles should be visible').toBe(true);

        await vmWizardNavigationPage.selectOperatingSystem('rhel');
        await expect
          .poll(() => vmWizardNavigationPage.isNextButtonDisabled(), {
            message: 'Next should enable once Guest OS options finish loading',
            timeout: utils.TestTimeouts.UI_ACTION_COMPLETE,
          })
          .toBe(false);

        const options = await vmWizardNavigationPage.getGuestOsDropdownOptions();
        expect(options.length, 'Guest OS dropdown should list at least one option').toBeGreaterThan(
          0,
        );

        const variantLikeOptions = options.reduce<string[]>((acc, label) => {
          if (PREFERENCE_VARIANT_OPTION_PATTERN.test(label)) acc.push(label);
          return acc;
        }, []);
        expect(
          variantLikeOptions,
          `Guest OS options should be version groups, not preference variants. Got: ${options.join(', ')}`,
        ).toEqual([]);

        const selectedOs = await vmWizardNavigationPage.getSelectedOsType();
        expect(selectedOs.length, 'A Guest OS type should be selected').toBeGreaterThan(0);
        expect(
          PREFERENCE_VARIANT_OPTION_PATTERN.test(selectedOs),
          `Selected Guest OS should be a version group, got: ${selectedOs}`,
        ).toBe(false);
      });
    });

    test('Switching OS tile replaces the previous Guest OS selection', async ({
      apiClient,
      vmListPage,
      vmWizardNavigationPage,
      utils,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_MEDIUM);
      await utils.withAllure({
        suite: SUITE,
        feature: T1,
        tags: [T1_TAG, '@catalog-wizard', ADMIN_ONLY_TAG],
      });

      const wizardNs = await setupTestNamespace(apiClient, 'wizard-gos-switch');

      await vmListPage.switchToVirtualizationPerspective();
      await vmListPage.navigateToProjectVmListViaUI(wizardNs);
      await vmWizardNavigationPage.openWizardFromCreateDropdown();

      await test.step('Step 1: Deployment details', async () => {
        await vmWizardNavigationPage.selectLocationProject(wizardNs);
        await vmWizardNavigationPage.generateVmName();
        await vmWizardNavigationPage.clickNext();
      });

      await test.step('Step 2: Guest OS — RHEL then Windows selection', async () => {
        await vmWizardNavigationPage.selectOperatingSystem('rhel');
        await expect
          .poll(() => vmWizardNavigationPage.isNextButtonDisabled(), {
            message: 'Next should enable for RHEL Guest OS',
            timeout: utils.TestTimeouts.UI_ACTION_COMPLETE,
          })
          .toBe(false);

        const rhelSelection = await vmWizardNavigationPage.getSelectedOsType();
        expect(rhelSelection.length, 'RHEL Guest OS should be selected').toBeGreaterThan(0);

        await vmWizardNavigationPage.selectOperatingSystem('windows');
        await expect
          .poll(() => vmWizardNavigationPage.isNextButtonDisabled(), {
            message: 'Next should enable for Windows Guest OS',
            timeout: utils.TestTimeouts.UI_ACTION_COMPLETE,
          })
          .toBe(false);

        const windowsSelection = await vmWizardNavigationPage.getSelectedOsType();
        expect(windowsSelection.length, 'Windows Guest OS should be selected').toBeGreaterThan(0);
        expect(
          windowsSelection,
          'Switching OS tile should replace the previous Guest OS selection',
        ).not.toBe(rhelSelection);
      });
    });
  },
);
