import { ADMIN_ONLY_TAG, T2, T2_TAG, VM_SEARCH_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/gating-fixture';
import { createHaltedVm } from '@/utils/vm-search-test-helpers';

const SUITE = 'Virtualization pages';

test.describe('Virtualization pages (tier2)', { tag: [T2_TAG] }, () => {
  test('VM search bar accepts key:value syntax and produces filter chips', async ({
    apiClient,
    vmListPage,
    testConfig,
    utils,
  }) => {
    await utils.withAllure({
      suite: SUITE,
      feature: T2,
      tags: [T2_TAG, VM_SEARCH_TAG],
    });

    // SearchBar is only rendered when the namespace has at least one VM; otherwise
    // VirtualMachineEmptyState is shown and getByTestId('vm-search-input') never appears.
    const vmName = utils.generateRandomVmName('search-vm');
    await createHaltedVm(apiClient, {
      cpuCores: 1,
      memory: '256Mi',
      name: vmName,
      namespace: testConfig.testNamespace,
    });

    await vmListPage.navigateToNamespaceVirtualMachinesViaUI(testConfig.testNamespace);
    await vmListPage.clickVmListTab();
    await vmListPage.waitForVmRowVisible(vmName);

    await test.step('Search bar is visible and accepts key:value input', async () => {
      await vmListPage.typeInVmSearchInput('status:');
      const dropdownVisible = await vmListPage.isSearchDropdownVisible();
      expect
        .soft(dropdownVisible, 'Search dropdown should appear after typing a search key')
        .toBe(true);
    });

    await test.step('Submitting key:value search produces a filter chip', async () => {
      await vmListPage.fillVmSearchInput('status:Running');
      const chips = await vmListPage.getFilterChipTexts();
      const hasRunningChip = chips.some((chip) => chip.includes('Running'));
      expect
        .soft(hasRunningChip, `Filter chip "Running" should appear (got: ${chips.join(', ')})`)
        .toBe(true);
    });

    await test.step('Clearing search resets input and filters', async () => {
      await vmListPage.clickClearSearchButton();
      const isEmpty = await vmListPage.verifyVmSearchInputEmpty();
      expect.soft(isEmpty, 'Search input should be empty after clearing').toBe(true);
    });
  });

  // Cluster metrics / node list / HCO status require elevated access — Forbidden for non-priv.
  test(
    'Cluster overview displays status, health, and resource allocation sections',
    { tag: [ADMIN_ONLY_TAG, '@tier2-virt-pages-admin'] },
    async ({ vmTreePage, vmListPage, utils }) => {
      await utils.withAllure({
        suite: SUITE,
        feature: T2,
        tags: [T2_TAG, ADMIN_ONLY_TAG, '@tier2-virt-pages-admin'],
      });

      await vmTreePage.navigateToVirtualMachinesViaUI();
      await vmListPage.clickLocalClusterInTree();

      await test.step('Status section widgets are visible', async () => {
        const statusResult = await vmListPage.verifyClusterStatusSectionWidgetsVisible(
          utils.TestTimeouts.DEFAULT,
          utils.TestTimeouts.DEFAULT,
        );
        expect
          .soft(
            statusResult.allVisible,
            statusResult.missing.length
              ? `Missing widgets: ${statusResult.missing.join(', ')}`
              : 'All cluster status widgets visible',
          )
          .toBe(true);
      });

      await test.step('Health section widgets are visible', async () => {
        const healthResult = await vmListPage.getHealthSectionWidgetsVisibility(
          utils.TestTimeouts.DEFAULT,
        );
        expect
          .soft(
            healthResult.allVisible,
            healthResult.missing.length
              ? `Missing health widgets: ${healthResult.missing.join(', ')}`
              : 'All health widgets visible',
          )
          .toBe(true);
      });

      await test.step('Resource allocation charts are visible', async () => {
        const { count, allVisible } = await vmListPage.getResourceAllocationChartsVisibility(
          utils.TestTimeouts.DEFAULT,
        );
        expect.soft(count, 'Resource allocation should have 4 charts').toBe(4);
        expect.soft(allVisible, 'All 4 charts should be visible').toBe(true);
      });
    },
  );

  test(
    'Checkups page loads with Network latency tab',
    { tag: ['@nonpriv'] },
    async ({ checkupsPage, testConfig, utils }) => {
      await utils.withAllure({
        suite: SUITE,
        feature: T2,
        tags: [T2_TAG, '@gating-checkups'],
      });

      const namespace = testConfig?.testNamespace || utils.EnvVariables.testNamespace;
      await checkupsPage.navigateToProjectNetworkCheckupsViaUI(namespace);

      const canRun = await checkupsPage.isRunCheckupButtonClickable();
      const needsInstall = await checkupsPage.isInstallPermissionsVisible();
      const runVisibleDisabled = (await checkupsPage.isRunCheckupButtonVisible()) && !canRun;
      expect
        .soft(
          canRun || needsInstall || runVisibleDisabled,
          'Network latency tab should show Run checkup or Install permissions',
        )
        .toBe(true);
    },
  );

  test('Settings page loads with all tabs and expected cluster sections', async ({
    settingsPage,
    utils,
  }) => {
    await utils.withAllure({ suite: SUITE, feature: T2, tags: [T2_TAG] });

    await settingsPage.navigateToSettingsViaSidebar();

    await test.step('Settings page renders four tabs: Cluster, User, Recommended capabilities, Preview features', async () => {
      const tabs = await settingsPage.getSettingsTabNames();
      for (const expected of ['Cluster', 'User', 'Recommended capabilities', 'Preview features']) {
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

  test('Preferences item is absent from sidebar navigation', async ({
    overviewPage,
    pageCommons,
    utils,
  }) => {
    await utils.withAllure({ suite: SUITE, feature: T2, tags: [T2_TAG] });

    await overviewPage.navigateToVirtualizationOverviewViaUI();

    const hasPreferences = await pageCommons.isSidebarItemVisible('Preferences');
    expect.soft(hasPreferences, 'Preferences should not appear in sidebar navigation').toBe(false);
  });
});
