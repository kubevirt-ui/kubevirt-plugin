import { GATING, GATING_TAG, VM_SEARCH_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/gating-fixture';
import { ROUTE_VIRTUAL_MACHINES_LIST_TAG } from '@/data-models/route-tags';

const SUITE = 'Virtualization pages';

test.describe('VirtualMachines list and overview', { tag: [ROUTE_VIRTUAL_MACHINES_LIST_TAG, GATING_TAG] }, () => {
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

  test('VM search bar accepts key:value syntax and produces filter chips', async ({
    vmListPage,
    testConfig,
    utils,
  }) => {
    await utils.withAllure({
      suite: SUITE,
      feature: GATING,
      tags: [GATING_TAG, VM_SEARCH_TAG],
    });

    await vmListPage.navigateToNamespaceVirtualMachinesViaUI(testConfig.testNamespace);
    await vmListPage.clickVmListTab();

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

  test('Cluster overview displays status, health, and resource allocation sections', async ({
    vmListPage,
    utils,
  }) => {
    await utils.withAllure({ suite: SUITE, feature: GATING, tags: [GATING_TAG] });

    await vmListPage.navigateToVirtualMachinesViaUI();
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
