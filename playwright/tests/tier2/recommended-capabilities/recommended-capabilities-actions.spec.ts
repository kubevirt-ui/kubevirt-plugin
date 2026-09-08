/**
 * Recommended capabilities — kebab actions and review recommendation modal.
 */

import {
  ADMIN_ONLY_TAG,
  RECOMMENDED_CAPABILITIES_TAG,
  T2,
  T2_TAG,
} from '@/data-models/allure-constants';
import {
  AUTO_CAPABILITY_IDS,
  AUTOPILOT_PACKAGE_NAMES,
  CAPABILITY_STATUS,
  CONFIGURATION_STATUS,
} from '@/data-models/recommended-capabilities-constants';
import { expect, test } from '@/fixtures/recommended-capabilities-fixture';

const SUITE = 'Recommended capabilities';
const TAGS = [T2_TAG, RECOMMENDED_CAPABILITIES_TAG];

test.describe(
  'Recommended capabilities actions',
  { tag: [T2_TAG, ADMIN_ONLY_TAG, RECOMMENDED_CAPABILITIES_TAG] },
  () => {
    test.beforeEach(async ({ recommendedCapabilitiesPage, utils }) => {
      utils.withAllure({ suite: SUITE, feature: T2, tags: TAGS });
      await recommendedCapabilitiesPage.navigateViaSidebar();
    });

    test('Not-installed capability kebab shows Install all operators', async ({
      recommendedCapabilitiesPage,
    }) => {
      const { capabilities } = recommendedCapabilitiesPage;
      const notInstalledId = await capabilities.findCapabilityIdByStatus(
        AUTO_CAPABILITY_IDS,
        CAPABILITY_STATUS.NOT_INSTALLED,
      );
      if (!notInstalledId) {
        test.skip(
          true,
          'No not-installed autopilot capability on this cluster to assert Install all operators',
        );
        return;
      }

      await capabilities.openCapabilityKebab(notInstalledId);
      await expect(
        capabilities.kebabActionLocator(`install-all-${notInstalledId}`),
        `Kebab for "${notInstalledId}" should offer Install all operators`,
      ).toBeVisible();
      await capabilities.closeKebab();
    });

    test('View operator details opens Software Catalog and back returns to the tab', async ({
      recommendedCapabilitiesPage,
    }) => {
      const { capabilities } = recommendedCapabilitiesPage;
      await capabilities.expandCapability('load-balancing');
      await capabilities.openOperatorKebab('cluster-kube-descheduler-operator');
      await capabilities.clickKebabAction('view-details-cluster-kube-descheduler-operator');

      await expect(
        recommendedCapabilitiesPage.page,
        'View operator details should open Software Catalog',
      ).toHaveURL(/\/catalog\/.*selectedId=cluster-kube-descheduler-operator/);

      await recommendedCapabilitiesPage.navigateBackToTab();
      await expect(
        capabilities.headingLocator,
        'Browser back should return to Recommended capabilities',
      ).toBeVisible();
    });

    test('Installed Autopilot operator shows Recommended or Manual configuration', async ({
      recommendedCapabilitiesPage,
    }) => {
      const { capabilities } = recommendedCapabilitiesPage;
      for (const id of AUTO_CAPABILITY_IDS) {
        await capabilities.expandCapability(id);
      }

      const recommendedPackage = await capabilities.findOperatorPackageByConfigStatus(
        AUTOPILOT_PACKAGE_NAMES,
        CONFIGURATION_STATUS.RECOMMENDED,
      );
      if (recommendedPackage) {
        await expect(
          capabilities.configurationStatusInRow(capabilities.operatorRow(recommendedPackage)),
          `Operator "${recommendedPackage}" should show Recommended configuration`,
        ).toHaveText(CONFIGURATION_STATUS.RECOMMENDED);
        return;
      }

      const manualPackage = await capabilities.findOperatorPackageByConfigStatus(
        AUTOPILOT_PACKAGE_NAMES,
        CONFIGURATION_STATUS.MANUAL,
      );
      if (manualPackage) {
        const row = capabilities.operatorRow(manualPackage);
        await expect(
          capabilities.configurationStatusInRow(row),
          `Operator "${manualPackage}" should show Manual configuration`,
        ).toHaveText(CONFIGURATION_STATUS.MANUAL);
        await expect(
          row.getByTestId('review-recommendation'),
          `Manual operator "${manualPackage}" should offer Review recommendation`,
        ).toBeVisible();
        return;
      }

      test.skip(true, 'No installed Autopilot operator with Recommended or Manual configuration');
    });

    test('Manual operator kebab shows Use recommended configuration', async ({
      recommendedCapabilitiesPage,
    }) => {
      const { capabilities } = recommendedCapabilitiesPage;
      for (const id of AUTO_CAPABILITY_IDS) {
        await capabilities.expandCapability(id);
      }

      const manualPackage = await capabilities.findOperatorPackageByConfigStatus(
        AUTOPILOT_PACKAGE_NAMES,
        CONFIGURATION_STATUS.MANUAL,
      );
      if (!manualPackage) {
        test.skip(true, 'No Manual Autopilot operator on this cluster');
        return;
      }

      await capabilities.openOperatorKebab(manualPackage);
      await expect(
        capabilities.kebabActionLocator(`use-recommended-${manualPackage}`),
        `Kebab for "${manualPackage}" should offer Use recommended configuration`,
      ).toBeVisible();
      await capabilities.closeKebab();
    });

    test('Review recommendation modal shows both YAML panes and Cancel closes it', async ({
      recommendedCapabilitiesPage,
    }) => {
      const { capabilities } = recommendedCapabilitiesPage;
      for (const id of AUTO_CAPABILITY_IDS) {
        await capabilities.expandCapability(id);
      }

      const reviewButton = capabilities.reviewRecommendationLocator.first();
      if (!(await reviewButton.isVisible().catch(() => false))) {
        test.skip(true, 'No Manual configuration with Review recommendation on this cluster');
        return;
      }

      await capabilities.clickReviewRecommendation();
      await expect(
        capabilities.reviewModalLocator,
        'Review recommendation modal content should be visible',
      ).toBeVisible();
      await expect(
        recommendedCapabilitiesPage.page.getByText('Recommended settings for', { exact: false }),
        'Modal title should describe recommended settings for the operator',
      ).toBeVisible();
      await expect(
        capabilities.reviewModalLocator.getByText('Current configuration'),
        'Current configuration YAML pane should be visible',
      ).toBeVisible();
      await expect(
        capabilities.reviewModalLocator.getByText('Recommended configuration'),
        'Recommended configuration YAML pane should be visible',
      ).toBeVisible();
      await expect(
        recommendedCapabilitiesPage.page.getByTestId('save-button'),
        'Apply should be present in the review modal footer',
      ).toBeVisible();
      await expect(
        recommendedCapabilitiesPage.page.getByTestId('cancel-button'),
        'Cancel should be present in the review modal footer',
      ).toBeVisible();

      await capabilities.cancelReviewModal();
      await expect(
        capabilities.reviewModalLocator,
        'Cancel should close the review recommendation modal without applying',
      ).toBeHidden();
    });
  },
);
