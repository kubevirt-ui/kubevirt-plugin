/**
 * Recommended capabilities — auto and additional tables.
 */

import {
  ADMIN_ONLY_TAG,
  RECOMMENDED_CAPABILITIES_TAG,
  T2,
  T2_TAG,
} from '@/data-models/allure-constants';
import {
  AUTO_CAPABILITY_IDS,
  AUTO_CAPABILITY_TITLES,
  CAPABILITY_STATUS,
  HIGH_AVAILABILITY_OPERATORS,
  LOAD_BALANCING_OPERATORS,
  MANUAL_CAPABILITY_TITLES,
} from '@/data-models/recommended-capabilities-constants';
import { expect, test } from '@/fixtures/recommended-capabilities-fixture';

const SUITE = 'Recommended capabilities';
const TAGS = [T2_TAG, RECOMMENDED_CAPABILITIES_TAG];

test.describe(
  'Recommended capabilities tables',
  { tag: [T2_TAG, ADMIN_ONLY_TAG, RECOMMENDED_CAPABILITIES_TAG] },
  () => {
    test.beforeEach(async ({ recommendedCapabilitiesPage, utils }) => {
      utils.withAllure({ suite: SUITE, feature: T2, tags: TAGS });
      await recommendedCapabilitiesPage.navigateViaSidebar();
    });

    test('Auto table lists Load balancing, Migrate VMs, and Virtualization dashboards', async ({
      recommendedCapabilitiesPage,
    }) => {
      const { capabilities } = recommendedCapabilitiesPage;
      for (const title of AUTO_CAPABILITY_TITLES) {
        await expect(
          capabilities.contentLocator.getByText(title, { exact: true }),
          `Auto table should list "${title}"`,
        ).toBeVisible();
      }
    });

    test('Expanding Load balancing shows Descheduler and MetalLB', async ({
      recommendedCapabilitiesPage,
    }) => {
      const { capabilities } = recommendedCapabilitiesPage;
      await capabilities.expandCapability('load-balancing');

      for (const operator of LOAD_BALANCING_OPERATORS) {
        await expect(
          capabilities.operatorLocator(operator.packageName),
          `Load balancing should include operator "${operator.displayName}"`,
        ).toBeVisible();
      }
    });

    test('Searching Migrate filters the auto table and clearing restores rows', async ({
      recommendedCapabilitiesPage,
    }) => {
      const { capabilities } = recommendedCapabilitiesPage;
      await capabilities.searchCapabilities('Migrate');

      await expect(
        capabilities.capabilityLocator('migrate-vms'),
        'Migrate VMs should remain visible when searching "Migrate"',
      ).toBeVisible();
      await expect(
        capabilities.capabilityLocator('load-balancing'),
        'Load balancing should be hidden when searching "Migrate"',
      ).toBeHidden();

      await capabilities.clearSearch();
      await expect(
        capabilities.capabilityLocator('load-balancing'),
        'Load balancing should return after clearing search',
      ).toBeVisible();
    });

    test('Status filter updates the capabilities count text', async ({
      recommendedCapabilitiesPage,
    }) => {
      const { capabilities } = recommendedCapabilitiesPage;
      const countBefore = (await capabilities.countLocator.textContent()) ?? '';
      expect(countBefore, 'Count text should be populated before filtering').toMatch(/out of/);

      await capabilities.filterByStatus(CAPABILITY_STATUS.NOT_INSTALLED);
      await expect(
        capabilities.countLocator,
        'Count text should reflect the Not installed status filter',
      ).toContainText(/not installed/i);
    });

    test('Install selected stays disabled until a not-installed capability is checked', async ({
      recommendedCapabilitiesPage,
    }) => {
      const { capabilities } = recommendedCapabilitiesPage;
      await expect(
        capabilities.installSelectedLocator,
        'Install selected should be aria-disabled with no selection',
      ).toHaveAttribute('aria-disabled', 'true');

      await capabilities.hoverInstallSelected();
      await expect(
        recommendedCapabilitiesPage.page.getByText('Select capabilities to install'),
        'Disabled Install selected should show the select-capabilities tooltip',
      ).toBeVisible();

      const notInstalledId = await capabilities.findCapabilityIdByStatus(
        AUTO_CAPABILITY_IDS,
        CAPABILITY_STATUS.NOT_INSTALLED,
      );
      if (!notInstalledId) {
        test.skip(
          true,
          'No not-installed autopilot capability on this cluster to enable Install selected',
        );
        return;
      }

      await capabilities.selectCapability(notInstalledId);
      await expect(
        capabilities.installSelectedLocator,
        'Install selected should enable after checking a not-installed capability',
      ).not.toHaveAttribute('aria-disabled', 'true');
    });

    test('Additional table lists the eight manual capabilities', async ({
      recommendedCapabilitiesPage,
    }) => {
      const { capabilities } = recommendedCapabilitiesPage;
      for (const title of MANUAL_CAPABILITY_TITLES) {
        await expect(
          capabilities.contentLocator.getByText(title, { exact: true }),
          `Additional table should list "${title}"`,
        ).toBeVisible();
      }
    });

    test('Expanding High availability shows health, fence, and maintenance operators', async ({
      recommendedCapabilitiesPage,
    }) => {
      const { capabilities } = recommendedCapabilitiesPage;
      await capabilities.expandCapability('high-availability');

      for (const operator of HIGH_AVAILABILITY_OPERATORS) {
        await expect(
          capabilities.operatorLocator(operator.packageName),
          `High availability should include operator "${operator.displayName}"`,
        ).toBeVisible();
      }
    });

    test('Operator name link opens Software Catalog', async ({ recommendedCapabilitiesPage }) => {
      const { capabilities } = recommendedCapabilitiesPage;
      await capabilities.expandCapability('high-availability');
      await capabilities.clickOperatorLink('node-healthcheck-operator');

      await expect(
        recommendedCapabilitiesPage.page,
        'Operator name link should open Software Catalog',
      ).toHaveURL(/\/catalog\/.*selectedId=node-healthcheck-operator/);
    });
  },
);
