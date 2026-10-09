import { GATING, GATING_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/gating-fixture';
import { ROUTE_VIRTUALIZATION_SETTINGS_TAG } from '@/data-models/route-tags';

const SUITE = 'Virtualization pages';

test.describe(
  'Virtualization settings page load',
  { tag: [ROUTE_VIRTUALIZATION_SETTINGS_TAG, GATING_TAG] },
  () => {
    test('Settings page loads with all tabs and expected cluster sections', async ({
      settingsPage,
      utils,
    }) => {
      await utils.withAllure({ suite: SUITE, feature: GATING, tags: [GATING_TAG] });

      await settingsPage.navigateToSettingsViaSidebar();

      await test.step('Settings page renders four tabs: Cluster, User, Recommended capabilities, Preview features', async () => {
        const tabs = await settingsPage.getSettingsTabNames();
        for (const expected of [
          'Cluster',
          'User',
          'Recommended capabilities',
          'Preview features',
        ]) {
          expect
            .soft(
              tabs.some((t) => t.includes(expected)),
              `Tab "${expected}" should be present (found: ${tabs.join(', ')})`,
            )
            .toBe(true);
        }
      });

      await test.step('Cluster tab lists all expected sections', async () => {
        const sections = await settingsPage.getClusterSettingsSectionNames();
        for (const expected of [
          'General settings',
          'Guest management',
          'Resource management',
          'SCSI persistent reservation',
        ]) {
          expect
            .soft(
              sections.some((s) => s.includes(expected)),
              `Cluster section "${expected}" should be visible (found: ${sections.join(', ')})`,
            )
            .toBe(true);
        }
      });

      await test.step('General settings section lists expected sub-sections', async () => {
        await settingsPage.navigateToGeneralSettings();
        const subSections = await settingsPage.getGeneralSettingsSubSections();
        for (const expected of [
          'Live migration',
          'SSH configurations',
          'Templates and images management',
        ]) {
          expect
            .soft(
              subSections.some((s) => s.includes(expected)),
              `Sub-section "${expected}" should be visible (found: ${subSections.join(', ')})`,
            )
            .toBe(true);
        }
      });

      await test.step('User tab loads with expected sections', async () => {
        await settingsPage.navigateToSettingsViaSidebar();
        const loaded = await settingsPage.navigateToGettingStartedResources();
        expect.soft(loaded, 'User tab "Getting started resources" section should load').toBe(true);
      });

      await test.step('Preview features tab loads with feature flags', async () => {
        const loaded = await settingsPage.navigateToPreviewFeatures();
        expect.soft(loaded, 'Preview features tab should load').toBe(true);
        const labels = await settingsPage.getPreviewFeatureLabels();
        expect
          .soft(labels.length, 'Preview features should list at least one flag')
          .toBeGreaterThan(0);
      });

      await test.step('Search filter surfaces setting suggestions', async () => {
        await settingsPage.navigateToSettingsViaSidebar();
        await settingsPage.fillConfigurationSearchInput('migration');
        const result = await settingsPage.verifyHighlightedSearchResultsVisible();
        expect
          .soft(result.isVisible, 'Search should show at least one suggestion for "migration"')
          .toBe(true);
        expect
          .soft(result.count, 'At least one suggestion should appear for "migration"')
          .toBeGreaterThan(0);
      });
    });
  },
);
