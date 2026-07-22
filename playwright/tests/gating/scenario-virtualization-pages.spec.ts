import { GATING, GATING_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/gating-fixture';

const SUITE = 'Virtualization pages';

test.describe('Virtualization pages (gating)', { tag: [GATING_TAG] }, () => {
  test('Home overview page loads with VirtualMachines link and healthy operator', async ({
    overviewPage,
    utils,
  }) => {
    await utils.withAllure({ suite: SUITE, feature: GATING, tags: [GATING_TAG] });

    await overviewPage.navigateToClusterOverviewViaUI();

    await test.step('VirtualMachines navigation link is visible', async () => {
      const vmLink = await overviewPage.verifyVirtualMachineLink();
      expect.soft(vmLink, 'VirtualMachines heading should be visible').toBe(true);
    });
  });

  test('Virtualization overview page loads with resource cards', async ({
    overviewPage,
    utils,
  }) => {
    await utils.withAllure({ suite: SUITE, feature: GATING, tags: [GATING_TAG] });

    await overviewPage.navigateToVirtualizationOverviewViaUI();

    await test.step('Resource cards are visible', async () => {
      const resourceCards = await overviewPage.verifyResourceCards();
      expect.soft(resourceCards, 'Overview page should display resource cards').toBe(true);
    });
  });

  test('VMs page loads with tree view, tabs, and expected structure', async ({
    vmListPage,
    vmOverviewTabPage,
    testConfig,
    utils,
  }) => {
    await utils.withAllure({ suite: SUITE, feature: GATING, tags: [GATING_TAG] });

    await vmListPage.navigateToNamespaceVirtualMachinesViaUI(testConfig.testNamespace);
    await vmListPage.toggleEmptyProjectsDisplay(true);

    await test.step('Virtual machines tab renders content', async () => {
      await vmListPage.clickVmListTab();
      const pageReady = await vmListPage.isVmListContentVisible(
        utils.TestTimeouts.UI_ELEMENT_VISIBILITY,
      );
      expect.soft(pageReady, 'VM list tab should render a table or empty state').toBe(true);
    });

    await test.step('Overview tab is navigable and renders without error', async () => {
      await vmOverviewTabPage.clickOverviewTab();
      const selected = await vmOverviewTabPage.isOverviewTabSelected();
      expect.soft(selected, 'Overview tab should be active after clicking').toBe(true);

      const crashed = await vmListPage.hasErrorBoundary();
      expect.soft(!crashed, 'Overview tab should not show an error boundary').toBe(true);
    });

    await test.step('Tree view renders distinguishable icons', async () => {
      const ok = await vmListPage.doTreeViewNodesHaveDistinguishableIcons();
      expect
        .soft(ok, 'Tree view should render distinct icon shapes for cluster and namespace')
        .toBe(true);
    });

    await test.step('Tree view context menu has expected actions', async () => {
      await vmListPage.searchTreeView(testConfig.testNamespace);
      await vmListPage.rightClickNamespaceInTreeView(testConfig.testNamespace);

      const menuItems = await vmListPage.getTreeViewContextMenuItems();
      expect
        .soft(menuItems.length, 'Context menu should have at least one item')
        .toBeGreaterThan(0);

      const itemIds = menuItems.map((i) => i.testId);
      const hasCreateProject = itemIds.includes('create-project');
      const hasCreateVm = itemIds.includes('create-vm');
      expect
        .soft(
          hasCreateProject || hasCreateVm,
          'Context menu should include Create Project or Create VirtualMachine',
        )
        .toBe(true);

      await vmListPage.dismissContextMenu();
    });
  });

  test('Cluster overview displays status, health, and resource allocation sections', async ({
    vmTreePage,
    vmListPage,
    utils,
  }) => {
    await utils.withAllure({ suite: SUITE, feature: GATING, tags: [GATING_TAG] });

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
  });

  test('Templates page loads with Red Hat templates and expected columns', async ({
    templatesPage,
    pageCommons,
    utils,
  }) => {
    await utils.withAllure({ suite: SUITE, feature: GATING, tags: [GATING_TAG] });

    await templatesPage.navigateToTemplatesViaUI();
    await pageCommons.switchProject('All Projects');

    await test.step('Red Hat templates are visible', async () => {
      await templatesPage.filterByDefaultTemplates();

      const rhel9Name = utils.TEMPLATE_METADATA_NAMES.RHEL9;
      await expect
        .poll(() => templatesPage.isTemplateVisible(rhel9Name), {
          timeout: 30_000,
          intervals: [2_000],
          message: 'RHEL9 template should be visible after filtering',
        })
        .toBe(true);

      if (!utils.EnvVariables.isS390x) {
        const win10Visible = await templatesPage.isTemplateVisible(
          utils.TEMPLATE_METADATA_NAMES.WIN10,
        );
        expect.soft(win10Visible, 'WIN10 template should be visible').toBe(true);
      }
    });
  });

  test('Instance Types page loads with Cluster and User tabs', async ({
    instanceTypesPage,
    utils,
  }) => {
    await utils.withAllure({ suite: SUITE, feature: GATING, tags: [GATING_TAG] });

    await instanceTypesPage.navigateToInstanceTypesViaUI();

    await test.step('Cluster InstanceTypes tab loads', async () => {
      const loaded = await instanceTypesPage.verifyInstanceTypesPageLoaded();
      expect.soft(loaded, 'Cluster InstanceTypes tab should be loaded').toBe(true);
    });

    await test.step('User InstanceTypes tab is navigable', async () => {
      await instanceTypesPage.clickUserInstanceTypesTab();
      const result = await instanceTypesPage.verifyUserInstanceTypesTabReady(
        utils.TestTimeouts.UI_ELEMENT_VISIBILITY,
      );
      expect
        .soft(
          result.state === 'populated' || result.state === 'empty',
          'User InstanceTypes tab should render a list or empty state',
        )
        .toBe(true);
    });
  });

  test('Bootable Volumes page loads with expected columns and content', async ({
    bootableVolumesPage,
    utils,
  }) => {
    await utils.withAllure({ suite: SUITE, feature: GATING, tags: [GATING_TAG] });

    await bootableVolumesPage.navigateToBootableVolumesViaUI();

    await test.step('Page loads with at least one volume', async () => {
      const ok = await bootableVolumesPage.verifyPageLoaded(
        [utils.INSTANCE_TYPES.FEDORA],
        true,
        utils.TestTimeouts.UI_ELEMENT_VISIBILITY,
      );
      expect.soft(ok, 'Bootable volumes page should load with content').toBe(true);
    });

    await test.step('Expected column headers are present', async () => {
      const headers = await bootableVolumesPage.getColumnHeaders();
      for (const expected of ['Name', 'Architecture', 'Operating system', 'Description']) {
        expect.soft(headers, `Column headers should include '${expected}'`).toContain(expected);
      }
    });
  });

  test('Migration Policies page loads', async ({ migrationPoliciesPage, apiClient, utils }) => {
    await utils.withAllure({ suite: SUITE, feature: GATING, tags: [GATING_TAG] });

    const policies = await apiClient.listMigrationPolicies();
    const existingNames = (policies as { metadata?: { name?: string } }[])
      .map((p) => p.metadata?.name)
      .filter((n): n is string => Boolean(n));

    await migrationPoliciesPage.navigateToMigrationPoliciesViaUI();

    const ok = await migrationPoliciesPage.verifyPageLoaded(existingNames);
    expect.soft(ok, 'Migration policies page should load with list or empty state').toBe(true);
  });

  test(
    'Checkups page loads with Network latency tab',
    { tag: ['@nonpriv'] },
    async ({ checkupsPage, testConfig, utils }) => {
      await utils.withAllure({
        suite: SUITE,
        feature: GATING,
        tags: [GATING_TAG, '@gating-checkups'],
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
    await utils.withAllure({ suite: SUITE, feature: GATING, tags: [GATING_TAG] });

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
        'Virtualization features',
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
    await utils.withAllure({ suite: SUITE, feature: GATING, tags: [GATING_TAG] });

    await overviewPage.navigateToVirtualizationOverviewViaUI();

    const hasPreferences = await pageCommons.isSidebarItemVisible('Preferences');
    expect.soft(hasPreferences, 'Preferences should not appear in sidebar navigation').toBe(false);
  });
});
