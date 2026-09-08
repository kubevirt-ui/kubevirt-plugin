/**
 * Recommended capabilities — navigation and admin-only visibility.
 */

import {
  ADMIN_ONLY_TAG,
  NONPRIV_TAG,
  RECOMMENDED_CAPABILITIES_TAG,
  T2,
  T2_TAG,
} from '@/data-models/allure-constants';
import {
  AUTO_CAPABILITY_IDS,
  AUTO_CAPABILITY_OPERATORS,
  CAPABILITY_STATUS,
} from '@/data-models/recommended-capabilities-constants';
import { expect, test } from '@/fixtures/recommended-capabilities-fixture';

const SUITE = 'Recommended capabilities';
const TAGS = [T2_TAG, RECOMMENDED_CAPABILITIES_TAG];

test.describe(
  'Recommended capabilities navigation',
  { tag: [T2_TAG, ADMIN_ONLY_TAG, RECOMMENDED_CAPABILITIES_TAG] },
  () => {
    test.beforeEach(async ({ utils }) => {
      utils.withAllure({ suite: SUITE, feature: T2, tags: TAGS });
    });

    test('Sidebar Settings tab shows heading and both capability cards', async ({
      recommendedCapabilitiesPage,
    }) => {
      await recommendedCapabilitiesPage.navigateViaSidebar();
      const { capabilities } = recommendedCapabilitiesPage;

      await expect(
        capabilities.headingLocator,
        'Page heading "Manage Virtualization capabilities" should be visible',
      ).toBeVisible();
      await expect(
        capabilities.autoCardTitleLocator,
        'Install capabilities automatically card should be visible',
      ).toBeVisible();
      await expect(
        capabilities.additionalCardTitleLocator,
        'Additional capabilities card should be visible',
      ).toBeVisible();
    });

    test('Settings search for Recommended capabilities opens the tab', async ({
      recommendedCapabilitiesPage,
    }) => {
      await recommendedCapabilitiesPage.navigateViaSearch();

      await expect(
        recommendedCapabilitiesPage.capabilities.contentLocator,
        'Recommended capabilities tab content should be visible after selecting the search suggestion',
      ).toBeVisible();
      expect(
        recommendedCapabilitiesPage.page.url(),
        'URL should include the recommended settings tab path',
      ).toContain('/virtualization-settings/recommended');
    });

    test('Installed auto-table capability has no kebab and still expands operators', async ({
      recommendedCapabilitiesPage,
    }) => {
      await recommendedCapabilitiesPage.navigateViaSidebar();
      const { capabilities } = recommendedCapabilitiesPage;

      const installedId = await capabilities.findCapabilityIdByStatus(
        AUTO_CAPABILITY_IDS,
        CAPABILITY_STATUS.INSTALLED,
      );
      if (!installedId) {
        test.skip(
          true,
          'No installed autopilot capability on this cluster to assert view-only kebab',
        );
        return;
      }

      const row = capabilities.capabilityRow(installedId);
      await expect(
        capabilities.kebabInRow(row),
        `Installed capability "${installedId}" should not render a kebab menu`,
      ).toHaveCount(0);

      await capabilities.expandCapability(installedId);
      const operatorPackage = AUTO_CAPABILITY_OPERATORS[installedId]?.[0];
      if (!operatorPackage) {
        throw new Error(`Known operator mapping missing for "${installedId}"`);
      }
      await expect(
        capabilities.operatorLocator(operatorPackage),
        `Expanded installed capability "${installedId}" should list operator rows`,
      ).toBeVisible();

      await capabilities.openOperatorKebab(operatorPackage);
      await expect(
        capabilities.kebabActionLocator(`view-details-${operatorPackage}`),
        `Operator kebab for "${operatorPackage}" should offer View operator details`,
      ).toBeVisible();
      await capabilities.closeKebab();
    });
  },
);

test.describe(
  'Recommended capabilities is hidden from non-privileged users',
  { tag: [T2_TAG, NONPRIV_TAG, RECOMMENDED_CAPABILITIES_TAG] },
  () => {
    test('Non-privileged user does not see admin-only Settings tabs', async ({
      recommendedCapabilitiesPage,
      utils,
    }) => {
      test.skip(!utils.EnvVariables.isNonPrivUser, 'Requires NON_PRIV=1');
      utils.withAllure({ suite: SUITE, feature: T2, tags: [...TAGS, NONPRIV_TAG] });

      await recommendedCapabilitiesPage.navigateToSettingsViaSidebar();
      const tabIds = await recommendedCapabilitiesPage.getVisibleSettingsTabTestIds();

      expect(
        tabIds,
        'Recommended capabilities tab should be hidden from non-privileged users',
      ).not.toContain('settings-tab-recommended');
      expect(tabIds, 'Cluster tab should be hidden from non-privileged users').not.toContain(
        'settings-tab-cluster',
      );
      expect(
        tabIds,
        'Preview features tab should be hidden from non-privileged users',
      ).not.toContain('settings-tab-features');
      expect(tabIds, 'User tab should remain visible for non-privileged users').toContain(
        'settings-tab-user',
      );
    });
  },
);
