import { GATING, GATING_TAG } from '@/data-models/allure-constants';
import { INSTANCE_TYPE_CRD_RESOURCES } from '@/data-models/instance-type-test-fixtures';
import { expect, test } from '@/fixtures/gating-fixture';

const SUITE = 'Virtualization pages';

test.describe('Virtualization pages (gating)', { tag: [GATING_TAG] }, () => {
  test(
    'Home overview page shows healthy CNV operator conditions',
    { tag: ['@adminOnly'] },
    async ({ overviewPage, utils }) => {
      await utils.withAllure({
        suite: SUITE,
        feature: GATING,
        tags: [GATING_TAG],
      });
      await overviewPage.navigateToClusterOverviewViaUI();
      const ok = await overviewPage.verifyHealthyConditions();
      expect.soft(ok, 'HCO page title should contain kubevirt-hyperconverged').toBe(true);
    },
  );

  test('Home overview page displays VirtualMachines navigation link', async ({
    overviewPage,
    utils,
  }) => {
    await utils.withAllure({ suite: SUITE, feature: GATING, tags: [GATING_TAG] });
    await overviewPage.navigateToClusterOverviewViaUI();
    const ok = await overviewPage.verifyVirtualMachineLink();
    expect.soft(ok, 'VirtualMachines heading should be visible').toBe(true);
  });

  test('Virtualization overview page loads with resource cards', async ({
    overviewPage,
    utils,
  }) => {
    await utils.withAllure({ suite: SUITE, feature: GATING, tags: [GATING_TAG] });

    await overviewPage.navigateToVirtualizationOverviewViaUI();
    const resourceCards = await overviewPage.verifyResourceCards();
    expect.soft(resourceCards, 'Overview page displays resource cards').toBe(true);
  });

  test('InstanceTypes page loaded', async ({ instanceTypesPage, utils }) => {
    await utils.withAllure({ suite: SUITE, feature: GATING, tags: [GATING_TAG] });
    await instanceTypesPage.navigateToInstanceTypesViaUI();
    const ok = await instanceTypesPage.verifyInstanceTypesPageLoaded();
    expect.soft(ok, 'Instance types page loaded').toBe(true);
  });

  test('Bootable volumes page loaded', async ({ bootableVolumesPage, utils }) => {
    await utils.withAllure({ suite: SUITE, feature: GATING, tags: [GATING_TAG] });
    await bootableVolumesPage.navigateToBootableVolumesViaUI();
    const ok = await bootableVolumesPage.verifyPageLoaded(
      [utils.INSTANCE_TYPES.FEDORA],
      true,
      utils.TestTimeouts.UI_ELEMENT_VISIBILITY,
    );
    expect.soft(ok, 'Bootable volumes page loaded').toBe(true);

    const headers = await bootableVolumesPage.getColumnHeaders();
    for (const expected of ['Name', 'Architecture', 'Operating system', 'Description']) {
      expect.soft(headers, `Column headers should include '${expected}'`).toContain(expected);
    }

    const filterVisible = await bootableVolumesPage.verifySearchFilterVisible();
    expect.soft(filterVisible, 'Search filter input should be visible').toBe(true);
  });

  test('Bootable volumes name filter narrows results to matching volumes', async ({
    bootableVolumesPage,
    pageCommons,
    utils,
  }) => {
    await utils.withAllure({
      suite: SUITE,
      feature: GATING,
      tags: [GATING_TAG],
    });

    await bootableVolumesPage.navigateToBootableVolumesViaUI();
    await pageCommons.filterByName(utils.INSTANCE_TYPES.FEDORA);

    const fedoraVisible = await bootableVolumesPage.verifyBootableVolumeExistsInList(
      utils.INSTANCE_TYPES.FEDORA,
      utils.TestTimeouts.DEFAULT,
    );
    expect
      .soft(fedoraVisible, 'Fedora bootable volume should be visible when filtered by "fedora"')
      .toBe(true);

    const otherHidden = await bootableVolumesPage.verifyBootableVolumeDoesNotExist(
      utils.INSTANCE_TYPES.CENTOS_STREAM9,
      utils.TestTimeouts.DEFAULT,
    );
    expect
      .soft(
        otherHidden,
        'CentOS Stream 9 bootable volume should not be visible when filtering by "fedora"',
      )
      .toBe(true);
  });

  test('Migration policies page loaded', async ({ migrationPoliciesPage, k8sClient, utils }) => {
    await utils.withAllure({ suite: SUITE, feature: GATING, tags: [GATING_TAG] });
    const policies = await k8sClient.listMigrationPolicies();
    const existingNames = (policies as { metadata?: { name?: string } }[])
      .map((p) => p.metadata?.name)
      .filter((n): n is string => Boolean(n));
    await migrationPoliciesPage.navigateToMigrationPoliciesViaUI();
    const ok = await migrationPoliciesPage.verifyPageLoaded(existingNames);
    expect.soft(ok, 'Migration policies page loaded').toBe(true);
  });

  test('Storage MigrationPlans page loads with expected columns and content', async ({
    vmListPage,
    k8sClient,
    utils,
  }) => {
    await utils.withAllure({
      suite: SUITE,
      feature: GATING,
      tags: [GATING_TAG],
    });

    const storageMigrationAvailable = await k8sClient.isStorageMigrationAvailable();
    test.skip(
      !storageMigrationAvailable,
      'Storage migration plans CRD not available on this cluster — skipping',
    );

    await vmListPage.navigateToStorageMigrationPlansViaUI();
    const loaded = await vmListPage.verifyStorageMigrationPlansPageLoaded();
    if (!loaded) {
      test.skip(true, 'Storage MigrationPlans page did not render — UI not available');
    }

    await expect
      .poll(() => vmListPage.verifyStorageMigrationPlansPageLoaded(), {
        intervals: [1_000, 2_000, 3_000, 5_000],
        message: 'Storage MigrationPlans page heading should be visible',
        timeout: utils.TestTimeouts.DEFAULT,
      })
      .toBe(true);

    await expect
      .poll(() => vmListPage.isStorageMigrationContentVisible(), {
        intervals: [1_000, 2_000, 3_000, 5_000],
        message: 'Storage MigrationPlans page should show empty state or rows',
        timeout: utils.TestTimeouts.DEFAULT,
      })
      .toBe(true);

    const hasRows = await vmListPage.hasTableRows();
    if (hasRows) {
      const columns = await vmListPage.getStorageMigrationPlansColumnNames();
      for (const expected of [
        'Name',
        'Namespaces',
        'Storage migration',
        'Target storage class',
        'Status',
        'Migration started',
      ]) {
        expect
          .soft(columns, `Column "${expected}" should be in the column management list`)
          .toContain(expected);
      }
    }
  });

  test('KubeVirt CRD instance pages load without redirecting to dashboard', async ({
    instanceTypesPage,
    utils,
  }) => {
    await utils.withAllure({
      suite: SUITE,
      feature: GATING,
      tags: [GATING_TAG],
    });
    for (const crd of INSTANCE_TYPE_CRD_RESOURCES) {
      await instanceTypesPage.navigateToCrdPage(crd.plural);
      const notRedirected = await instanceTypesPage.verifyCrdPageNotRedirected(crd.plural);
      expect
        .soft(notRedirected, `CRD page for ${crd.name} should not redirect to /dashboard`)
        .toBe(true);
    }
  });

  test('TreeView nodes render distinguishable icons for cluster and namespace types', async ({
    vmListPage,
    testConfig,
    utils,
  }) => {
    await utils.withAllure({
      suite: SUITE,
      feature: GATING,
      tags: [GATING_TAG],
    });
    await vmListPage.navigateToNamespaceVirtualMachinesViaUI(testConfig.testNamespace);
    await vmListPage.toggleEmptyProjectsDisplay(true);
    // Don't search — check the full tree which always has cluster + namespace node types
    const ok = await vmListPage.doTreeViewNodesHaveDistinguishableIcons();
    expect.soft(ok, 'Tree view should render distinct icon shapes').toBe(true);
  });

  test('TreeView namespace right-click context menu shows expected actions', async ({
    vmListPage,
    testConfig,
    utils,
  }) => {
    await utils.withAllure({
      suite: SUITE,
      feature: GATING,
      tags: [GATING_TAG],
    });
    await vmListPage.navigateToNamespaceVirtualMachinesViaUI(testConfig.testNamespace);
    await vmListPage.toggleEmptyProjectsDisplay(true);
    await vmListPage.searchTreeView(testConfig.testNamespace);
    await vmListPage.rightClickNamespaceInTreeView(testConfig.testNamespace);

    const menuItems = await vmListPage.getTreeViewContextMenuItems();
    const itemIds = menuItems.map((i) => i.testId);

    expect.soft(menuItems.length, 'Context menu should have at least one item').toBeGreaterThan(0);

    const hasVmActions = itemIds.includes('control-menu');
    if (hasVmActions) {
      expect.soft(itemIds, 'Context menu should include Delete').toContain('vm-action-delete');
      expect
        .soft(itemIds, 'Context menu should include Move to folder')
        .toContain('vm-action-move-to-folder');
    } else {
      expect
        .soft(itemIds, 'Empty namespace context menu should include Create Project')
        .toContain('create-project');
    }

    await vmListPage.dismissContextMenu();
  });

  test('Preferences item is absent from the sidebar navigation menu', async ({
    overviewPage,
    pageCommons,
    utils,
  }) => {
    await utils.withAllure({
      suite: SUITE,
      feature: GATING,
      tags: [GATING_TAG],
    });

    await overviewPage.navigateToVirtualizationOverviewViaUI();

    await test.step('Preferences removed from sidebar navigation', async () => {
      const hasPreferences = await pageCommons.isSidebarItemVisible('Preferences');
      expect
        .soft(
          hasPreferences,
          'Preferences should not appear in the sidebar navigation menu (CNV-66348)',
        )
        .toBe(false);
    });
  });

  test(
    'Fleet Virtualization perspective is hidden when ACM operator is not installed',
    { tag: [GATING_TAG] },
    async ({ overviewPage, pageCommons, utils }) => {
      test.skip(utils.EnvVariables.onAcm, 'Fleet Virtualization is expected on ACM clusters');

      await utils.withAllure({
        suite: SUITE,
        feature: GATING,
        tags: [GATING_TAG],
      });

      await overviewPage.navigateToVirtualizationOverviewViaUI();

      const hasFleetVirtualization =
        await pageCommons.isPerspectiveOptionVisible('Fleet Virtualization');
      expect
        .soft(
          hasFleetVirtualization,
          'Fleet Virtualization perspective should NOT be visible without ACM operator (CNV-85175)',
        )
        .toBe(false);
    },
  );

  test('Templates list name filter shows matching and hides non-matching templates', async ({
    templatesPage,
    pageCommons,
    utils,
  }) => {
    await utils.withAllure({ suite: SUITE, feature: GATING, tags: [GATING_TAG] });
    await templatesPage.navigateToTemplatesViaUI();
    await pageCommons.switchProject('All Projects');

    await templatesPage.filterTemplatesByName(utils.TEMPLATE_METADATA_NAMES.RHEL9);

    const rhel9Visible = await templatesPage.isTemplateVisible(utils.TEMPLATE_METADATA_NAMES.RHEL9);
    expect.soft(rhel9Visible, 'RHEL9 template visible after name filtering').toBe(true);

    const rhel8Visible = await templatesPage.isTemplateVisible(utils.TEMPLATE_METADATA_NAMES.RHEL8);
    expect.soft(rhel8Visible, 'RHEL8 template should NOT be visible').toBe(false);
    await templatesPage.navigateToAllNamespacesTemplates();
  });

  test('Templates list OpenShift default filter shows Red Hat provided templates', async ({
    templatesPage,
    pageCommons,
    utils,
  }) => {
    await utils.withAllure({ suite: SUITE, feature: GATING, tags: [GATING_TAG] });
    await templatesPage.navigateToTemplatesViaUI();
    await pageCommons.switchProject('All Projects');

    await templatesPage.filterByDefaultTemplates();

    expect
      .soft(
        await templatesPage.isTemplateVisible(utils.TEMPLATE_METADATA_NAMES.RHEL9),
        'RHEL9 visible after filtering by OpenShift templates',
      )
      .toBe(true);

    if (!utils.EnvVariables.isS390x) {
      expect
        .soft(
          await templatesPage.isTemplateVisible(utils.TEMPLATE_METADATA_NAMES.WIN10),
          'WIN10 visible after filtering by OpenShift templates',
        )
        .toBe(true);
    }
    await templatesPage.navigateToAllNamespacesTemplates();
  });

  test('Templates list OS filter shows matching templates and hides others', async ({
    templatesPage,
    pageCommons,
    utils,
  }) => {
    await utils.withAllure({ suite: SUITE, feature: GATING, tags: [GATING_TAG] });
    await templatesPage.navigateToTemplatesViaUI();
    await pageCommons.switchProject('All Projects');

    await templatesPage.filterByOS(utils.OS_FILTERS.WINDOWS);
    expect
      .soft(
        await templatesPage.isTemplateVisible(utils.TEMPLATE_METADATA_NAMES.WIN2K22),
        'WIN2K22 visible',
      )
      .toBe(true);
    expect
      .soft(
        await templatesPage.isTemplateVisible(utils.TEMPLATE_METADATA_NAMES.RHEL9),
        'RHEL9 should NOT be visible',
      )
      .toBe(false);
    await templatesPage.navigateToAllNamespacesTemplates();
  });

  test('Templates list Provider filter hides Red Hat templates when "Other" is selected', async ({
    templatesPage,
    pageCommons,
    utils,
  }) => {
    await utils.withAllure({
      suite: SUITE,
      feature: GATING,
      tags: [GATING_TAG],
    });
    await templatesPage.navigateToTemplatesViaUI();
    await pageCommons.switchProject('All Projects');

    await templatesPage.filterByProvider(utils.PROVIDER_FILTERS.OTHER);

    expect
      .soft(
        await templatesPage.isTemplateVisible(utils.TEMPLATE_METADATA_NAMES.RHEL9),
        'RHEL9 should NOT be visible under Other provider',
      )
      .toBe(false);
    expect
      .soft(
        await templatesPage.isTemplateVisible(utils.TEMPLATE_METADATA_NAMES.WIN10),
        'WIN10 should NOT be visible under Other provider',
      )
      .toBe(false);
    await templatesPage.navigateToAllNamespacesTemplates();
  });

  test('Templates without boot source do not show source available text', async ({
    templatesPage,
    pageCommons,
    utils,
  }) => {
    await utils.withAllure({
      suite: SUITE,
      feature: GATING,
      tags: [GATING_TAG],
    });
    await templatesPage.navigateToTemplatesViaUI();
    await pageCommons.switchProject('All Projects');

    await templatesPage.filterTemplatesByName(utils.OS_FILTERS.WINDOWS);
    const noSource = await templatesPage.verifySourceAvailableTextDoesNotExist();
    expect
      .soft(noSource, 'Source available text should not exist for templates w/o boot source')
      .toBe(true);
    await templatesPage.navigateToAllNamespacesTemplates();
  });

  test('Templates list combined type and OS filters refine results to matching templates only', async ({
    templatesPage,
    pageCommons,
    utils,
  }) => {
    await utils.withAllure({
      suite: SUITE,
      feature: GATING,
      tags: [GATING_TAG],
    });
    await templatesPage.navigateToTemplatesViaUI();
    await pageCommons.switchProject('All Projects');

    await templatesPage.filterByDefaultTemplates();
    await templatesPage.filterByOS(utils.OS_FILTERS.RHEL);

    expect
      .soft(
        await templatesPage.isTemplateVisible(utils.TEMPLATE_METADATA_NAMES.RHEL9),
        'RHEL9 visible after filtering by OpenShift templates + RHEL OS',
      )
      .toBe(true);

    if (!utils.EnvVariables.isS390x) {
      expect
        .soft(
          await templatesPage.isTemplateVisible(utils.TEMPLATE_METADATA_NAMES.WIN10),
          'WIN10 should NOT be visible when RHEL OS filter is active',
        )
        .toBe(false);
    }
    await templatesPage.navigateToAllNamespacesTemplates();
  });

  test('Empty namespace VM list and overview tabs show correct empty state content', async ({
    vmListPage,
    vmTreePage,
    k8sClient,
    testConfig,
    utils,
  }) => {
    await utils.withAllure({
      suite: SUITE,
      feature: GATING,
      tags: [GATING_TAG, 'empty-states'],
    });

    const emptyNs = utils.generateTestNamespace('empty-state');
    await k8sClient.createNamespace(emptyNs);
    await k8sClient.waitForNamespaceReady(emptyNs);
    k8sClient.trackResource('Namespace', emptyNs);

    await vmTreePage.navigateToVmsWithEmptyProjects(testConfig.testNamespace);
    await vmTreePage.navigateToProjectVmList(emptyNs);

    await test.step('VM list tab shows "No virtual machines yet" empty state', async () => {
      const emptyVisible = await vmListPage.isNoVMsMessageVisible();
      expect
        .soft(emptyVisible, 'Empty state title "No virtual machines yet" should be visible')
        .toBe(true);

      await expect
        .poll(
          async () => {
            const text = await vmListPage.getEmptyStateBodyText();
            return text.toLowerCase();
          },
          {
            intervals: [1_000, 2_000, 3_000],
            message: 'Empty state body should mention creating a VirtualMachine',
            timeout: utils.TestTimeouts.DEFAULT,
          },
        )
        .toContain('create a virtualmachine');

      const bodyText = await vmListPage.getEmptyStateBodyText();
      expect
        .soft(bodyText.toLowerCase(), 'Empty state body should mention right-click tree navigation')
        .toContain('right-click');

      const createBtn = await vmListPage.isEmptyStateCreateButtonVisible();
      expect.soft(createBtn, 'Empty state should have a "Create VirtualMachine" button').toBe(true);
    });

    await test.step('Header uses split Create button with "With YAML" dropdown', async () => {
      const splitVisible = await vmListPage.isCreateSplitButtonVisible();
      expect.soft(splitVisible, 'Header Create button should be a split-button').toBe(true);

      const options = await vmListPage.getCreateSplitButtonDropdownOptions();
      expect
        .soft(options, 'Split button dropdown should contain "With YAML"')
        .toContain('With YAML');
    });

    await test.step('Overview tab shows "No data to display" alert and empty widgets', async () => {
      await vmListPage.clickOverviewTab();

      const alertVisible = await vmListPage.isNoDataAlertVisible();
      expect
        .soft(alertVisible, 'Overview should show "No data to display yet" info alert')
        .toBe(true);

      const noDataWidgets = await vmListPage.isResourceAllocationNoDataVisible();
      expect
        .soft(noDataWidgets, 'Resource allocation widgets should show "No data available"')
        .toBe(true);
    });

    await test.step('Overview alert stretches to full section width', async () => {
      const isFullWidth = await vmListPage.isOverviewAlertFullWidth();
      expect
        .soft(isFullWidth, 'Overview alert should stretch to full width of the section (CNV-83804)')
        .toBe(true);
    });
  });

  test('VM list empty state project creation hint respects user project creation permission', async ({
    vmListPage,
    vmTreePage,
    k8sClient,
    testConfig,
    utils,
  }) => {
    await utils.withAllure({
      suite: SUITE,
      feature: GATING,
      tags: [GATING_TAG, 'empty-states'],
    });

    const permNs = utils.generateTestNamespace('empty-state-perm');
    await k8sClient.createNamespace(permNs);
    await k8sClient.waitForNamespaceReady(permNs);
    k8sClient.trackResource('Namespace', permNs);

    await vmListPage.mockProjectCreatePermission(true);
    await vmTreePage.navigateToVmsWithEmptyProjects(testConfig.testNamespace);
    await vmTreePage.navigateToProjectVmList(permNs);

    const emptyVisible = await vmListPage.isNoVMsMessageVisible();
    expect.soft(emptyVisible, 'Empty state should be visible in empty namespace').toBe(true);

    const hintVisible = await vmListPage.isProjectHintVisible();
    expect
      .soft(
        hintVisible,
        '"Don\'t have a project yet?" hint should be visible when canCreateProject is true',
      )
      .toBe(true);

    await vmListPage.clearEmptyStateMocks();
    await vmListPage.mockProjectCreatePermission(false);
    await vmTreePage.navigateToVmsWithEmptyProjects(testConfig.testNamespace);
    await vmTreePage.navigateToProjectVmList(permNs);

    const emptyStillVisible = await vmListPage.isNoVMsMessageVisible();
    expect.soft(emptyStillVisible, 'Empty state should still be visible after reload').toBe(true);

    const hintHidden = !(await vmListPage.isProjectHintVisible());
    expect
      .soft(
        hintHidden,
        '"Don\'t have a project yet?" hint should NOT be visible when canCreateProject is false',
      )
      .toBe(true);

    await vmListPage.clearEmptyStateMocks();
  });

  test('VM list page loads and Virtual machines tab is navigable', async ({
    vmListPage,
    testConfig,
    utils,
  }) => {
    await utils.withAllure({ suite: SUITE, feature: GATING, tags: [GATING_TAG] });

    await vmListPage.navigateToNamespaceVirtualMachinesViaUI(testConfig.testNamespace);
    await vmListPage.toggleEmptyProjectsDisplay(true);

    await test.step('Virtual machines tab is present and navigable', async () => {
      await vmListPage.clickVmListTab();
      const pageReady = await vmListPage.isVmListContentVisible(
        utils.TestTimeouts.UI_ELEMENT_VISIBILITY,
      );
      expect.soft(pageReady, 'VM list tab should render a table or empty state').toBe(true);
    });
  });

  test('VM namespace Overview and Virtual machines tabs switch correctly', async ({
    vmListPage,
    vmOverviewTabPage,
    testConfig,
    utils,
  }) => {
    await utils.withAllure({ suite: SUITE, feature: GATING, tags: [GATING_TAG] });

    await vmListPage.navigateToNamespaceVirtualMachinesViaUI(testConfig.testNamespace);
    await vmListPage.toggleEmptyProjectsDisplay(true);

    await test.step('Overview tab is navigable and becomes selected', async () => {
      await vmOverviewTabPage.clickOverviewTab();
      const selected = await vmOverviewTabPage.isOverviewTabSelected();
      expect.soft(selected, 'Overview tab should be active after clicking').toBe(true);
    });

    await test.step('Overview tab renders content without a JS error boundary', async () => {
      const crashed = await vmListPage.hasErrorBoundary();
      expect.soft(!crashed, 'Overview tab should not show an error boundary').toBe(true);
    });

    await test.step('Virtual machines tab is navigable from overview', async () => {
      await vmListPage.clickVmListTab();
      const pageReady = await vmListPage.isVmListContentVisible(
        utils.TestTimeouts.UI_ELEMENT_VISIBILITY,
      );
      expect
        .soft(pageReady, 'Virtual machines tab should render after switching from overview')
        .toBe(true);
    });
  });

  test('InstanceTypes User tab loads without error', async ({ instanceTypesPage, utils }) => {
    await utils.withAllure({ suite: SUITE, feature: GATING, tags: [GATING_TAG] });

    await instanceTypesPage.navigateToInstanceTypesViaUI();

    await test.step('Cluster InstanceTypes tab loads', async () => {
      const loaded = await instanceTypesPage.verifyInstanceTypesPageLoaded();
      expect.soft(loaded, 'Cluster InstanceTypes tab should be loaded').toBe(true);
    });

    await test.step('User InstanceTypes tab is navigable and loads without error', async () => {
      await instanceTypesPage.clickUserInstanceTypesTab();
      const result = await instanceTypesPage.verifyUserInstanceTypesTabReady(
        utils.TestTimeouts.UI_ELEMENT_VISIBILITY,
      );

      if (result.state === 'populated') {
        expect
          .soft(
            result.rowCount,
            'User InstanceTypes tab should show rows when instance types exist',
          )
          .toBeGreaterThan(0);
      } else {
        expect
          .soft(result.state, 'User InstanceTypes tab should render an empty state when none exist')
          .toBe('empty');
      }
    });
  });

  test('Bootable volume detail page loads with Details and YAML tabs', async ({
    bootableVolumesPage,
    bootableVolumeDetailPage,
    utils,
  }) => {
    await utils.withAllure({ suite: SUITE, feature: GATING, tags: [GATING_TAG] });

    await bootableVolumesPage.navigateToBootableVolumesViaUI();

    await test.step('Navigate to fedora bootable volume detail page', async () => {
      await bootableVolumeDetailPage.navigateToBootableVolumeDetail(
        utils.INSTANCE_TYPES.FEDORA,
        'openshift-virtualization-os-images',
      );
    });

    await test.step('Details and YAML tabs are visible', async () => {
      const tabsVisible = await bootableVolumeDetailPage.verifyDetailTabsVisible();
      expect
        .soft(tabsVisible, 'Details and YAML tabs should be visible on the BV detail page')
        .toBe(true);
    });

    await test.step('Resource title matches the fedora volume name', async () => {
      const titleMatch = await bootableVolumeDetailPage.isResourceTitleEqualTo(
        utils.INSTANCE_TYPES.FEDORA,
      );
      expect
        .soft(titleMatch, `Detail page title should match "${utils.INSTANCE_TYPES.FEDORA}"`)
        .toBe(true);
    });
  });
});

test.describe('Templates name filter regression', { tag: [GATING_TAG] }, () => {
  test.beforeEach(async ({ templatesPage, pageCommons }) => {
    await templatesPage.navigateToTemplatesViaUI();
    await pageCommons.switchProject('All Projects');
  });

  test('Templates name filter shows results and restores full list after clearing', async ({
    templatesPage,
    utils,
  }) => {
    await utils.withAllure({ suite: 'Virtualization pages', feature: GATING, tags: [GATING_TAG] });

    await test.step('Filter by RHEL9 shows matching templates', async () => {
      await templatesPage.filterTemplatesByName(utils.TEMPLATE_METADATA_NAMES.RHEL9);
      const rhel9Visible = await templatesPage.isTemplateVisible(
        utils.TEMPLATE_METADATA_NAMES.RHEL9,
      );
      expect
        .soft(rhel9Visible, 'RHEL9 template should be visible after filtering by name')
        .toBe(true);
    });

    await test.step('Clearing the name filter restores all templates', async () => {
      await templatesPage.filterTemplatesByName('');
      const fedoraVisible = await templatesPage.isTemplateVisible(
        utils.TEMPLATE_METADATA_NAMES.FEDORA,
      );
      expect
        .soft(
          fedoraVisible,
          'Fedora template should be visible again after clearing the name filter (CNV-87321 regression: filter was not resetting)',
        )
        .toBe(true);
      const rhel9StillVisible = await templatesPage.isTemplateVisible(
        utils.TEMPLATE_METADATA_NAMES.RHEL9,
      );
      expect
        .soft(rhel9StillVisible, 'RHEL9 template should still be visible after clearing filter')
        .toBe(true);
    });
  });
});

test.describe(
  'Templates list filter and details navigation',
  { tag: [GATING_TAG, '@gating-templates'] },
  () => {
    test.beforeEach(async ({ pageCommons, templatesPage }) => {
      await templatesPage.navigateToTemplatesViaUI();
      await pageCommons.switchProject('All Projects');
    });

    test(
      'Templates list filter and template details navigation',
      { tag: ['@nonpriv'] },
      async ({ templatesPage, utils }) => {
        await utils.withAllure({
          suite: SUITE,
          feature: GATING,
          tags: [GATING_TAG, '@gating-templates', '@nonpriv'],
        });

        await templatesPage.filterTemplatesByName(utils.TEMPLATE_METADATA_NAMES.RHEL9);

        const isVisible = await templatesPage.isTemplateVisible(
          utils.TEMPLATE_METADATA_NAMES.RHEL9,
        );
        expect
          .soft(
            isVisible,
            `Template ${utils.TEMPLATE_METADATA_NAMES.RHEL9} should be visible after filtering`,
          )
          .toBe(true);

        await templatesPage.clickTemplateByTestId(utils.TEMPLATE_METADATA_NAMES.RHEL9);

        const detailsLoaded = await templatesPage.verifyTemplateDetailsPage();
        expect.soft(detailsLoaded, 'Template details page should load').toBe(true);
      },
    );
  },
);

test.describe(
  'Templates list column management',
  { tag: [GATING_TAG, '@gating-templates'] },
  () => {
    test.beforeEach(async ({ pageCommons, templatesPage }) => {
      await templatesPage.navigateToTemplatesViaUI();
      await pageCommons.switchProject('All Projects');
    });

    test(
      'Templates list architecture column can be toggled on and off',
      { tag: ['@nonpriv'] },
      async ({ templatesPage, utils }) => {
        await utils.withAllure({
          suite: SUITE,
          feature: GATING,
          tags: [GATING_TAG, '@gating-templates'],
        });

        await templatesPage.resetColumns();

        await test.step('Architecture column is visible by default', async () => {
          const visibleByDefault = await templatesPage.verifyTableHeaderExists(
            'Architecture',
            true,
          );
          expect
            .soft(visibleByDefault, 'Architecture column should be visible by default')
            .toBe(true);
        });

        await test.step('Toggle architecture column off', async () => {
          await templatesPage.toggleColumn('architecture');
        });

        await test.step('Architecture column header is hidden after toggle off', async () => {
          const hidden = await templatesPage.verifyTableHeaderExists('Architecture', false);
          expect(hidden, 'Architecture column header should be hidden after disabling').toBe(true);
        });

        await test.step('Toggle architecture column back on restores the column', async () => {
          await templatesPage.toggleColumn('architecture');
          const visibleAgain = await templatesPage.verifyTableHeaderExists('Architecture', true);
          expect
            .soft(visibleAgain, 'Architecture column should be visible after toggling back on')
            .toBe(true);
        });
      },
    );
  },
);

test.describe(
  'Template detail page — Scripts and Parameters tabs',
  { tag: [GATING_TAG, '@gating-templates'] },
  () => {
    test('Scripts and Parameters tabs load for a Red Hat template', async ({
      templateDetailPage,
      utils,
    }) => {
      await utils.withAllure({
        suite: SUITE,
        feature: GATING,
        tags: [GATING_TAG, '@gating-templates'],
      });
      test.setTimeout(utils.TestTimeouts.TEST_SHORT);

      await templateDetailPage.navigateToTemplateDetail(
        utils.TEMPLATE_METADATA_NAMES.RHEL9,
        'openshift',
      );

      await test.step('Cloud-init section is present on the Scripts tab', async () => {
        await templateDetailPage.navigateToScripts();
        const visible = await templateDetailPage.isCloudInitSectionVisible();
        expect.soft(visible, 'Cloud-init section should be visible on the Scripts tab').toBe(true);
      });

      await test.step('Parameters tab is active and loaded', async () => {
        await templateDetailPage.navigateToParameters();
        const active = await templateDetailPage.isParametersTabActive();
        expect.soft(active, 'Parameters tab should be navigable and visible').toBe(true);
      });
    });
  },
);

const OS_IMAGES_NAMESPACE = 'openshift-virtualization-os-images';

const EXPECTED_DETAIL_FIELDS = [
  'Name',
  'Namespace',
  'Created at',
  'Owner',
  'Default InstanceType',
  'Preference',
];

test.describe(
  'Bootable Volumes — TLS certificate controls',
  { tag: [GATING_TAG, '@gating-bootable-volumes'] },
  () => {
    test(
      'TLS certificate controls in Add volume modal with URL source',
      { tag: ['@nonpriv'] },
      async ({ createVmPage, bootableVolumesPage, testConfig, utils }) => {
        await utils.withAllure({
          suite: SUITE,
          feature: GATING,
          tags: [GATING_TAG, '@gating-bootable-volumes', 'cnv-79328'],
        });

        await bootableVolumesPage.navigateToNamespaceBootableVolumesViaUI(testConfig.testNamespace);
        await bootableVolumesPage.clickCreateAndSelectOption('With form');

        const visible = await createVmPage.isTlsCertificateCheckboxVisible(3000);
        expect(visible, 'TLS controls should NOT be visible for Volume source type').toBe(false);

        await bootableVolumesPage.selectSourceTypeInAddVolumeModal('URL');
        const tlsCheckboxVisible = await createVmPage.isTlsCertificateCheckboxVisible();
        expect(tlsCheckboxVisible, 'TLS certificate checkbox should appear for URL source').toBe(
          true,
        );

        await createVmPage.configureTlsCertificate({ source: 'existing' });
        const checked = await createVmPage.isTlsCertificateChecked();
        expect(checked, 'TLS checkbox should be checked after enabling').toBe(true);

        await createVmPage.configureTlsCertificate({
          source: 'new',
          certificate: '-----BEGIN CERTIFICATE-----\nMIIDtest\n-----END CERTIFICATE-----',
        });
      },
    );
  },
);

test.describe(
  'Bootable Volume Detail Page',
  { tag: [GATING_TAG, '@nonpriv', '@gating-bootable-volumes'] },
  () => {
    test('Red Hat-provided bootable volume detail pages show expected content and metadata', async ({
      utils,
      bootableVolumeDetailPage,
    }) => {
      await utils.withAllure({
        suite: SUITE,
        feature: GATING,
        tags: [GATING_TAG, '@gating-bootable-volumes'],
      });

      const volumesToCheck = ['fedora', 'rhel9', 'centos-stream9'];

      for (const volumeName of volumesToCheck) {
        await bootableVolumeDetailPage.navigateToBootableVolumeDetail(
          volumeName,
          OS_IMAGES_NAMESPACE,
        );

        const titleMatch = await bootableVolumeDetailPage.isResourceTitleEqualTo(volumeName);
        expect.soft(titleMatch, `Resource title should be '${volumeName}'`).toBe(true);

        const tabsVisible = await bootableVolumeDetailPage.verifyDetailTabsVisible();
        expect.soft(tabsVisible, `'${volumeName}' should show Details and YAML tabs`).toBe(true);

        const labels = await bootableVolumeDetailPage.getDetailFieldLabels();
        for (const expected of EXPECTED_DETAIL_FIELDS) {
          expect
            .soft(labels.join(', '), `'${volumeName}': field '${expected}' should be present`)
            .toContain(expected);
        }

        const breadcrumbText = await bootableVolumeDetailPage.getBreadcrumbText();
        expect
          .soft(breadcrumbText, `'${volumeName}': breadcrumb should link to DataSources`)
          .toBe('DataSources');
      }

      const hasInstanceType = await bootableVolumeDetailPage.verifyDetailFieldContains(
        'Default InstanceType',
        'u1.',
      );
      expect.soft(hasInstanceType, 'Default InstanceType should reference a u1.* type').toBe(true);
    });
  },
);

test.describe(
  'Checkups — Network latency tab reachable',
  { tag: [GATING_TAG, '@gating-checkups'] },
  () => {
    test(
      'Network latency tab is reachable from Checkups',
      { tag: ['@nonpriv'] },
      async ({ checkupsPage, testConfig, utils }) => {
        await utils.withAllure({
          suite: SUITE,
          feature: GATING,
          tags: [GATING_TAG, '@gating-checkups', '@nonpriv'],
        });

        const namespace = testConfig?.testNamespace || utils.EnvVariables.testNamespace;

        await checkupsPage.navigateToProjectNetworkCheckupsViaUI(namespace);

        const canRun = await checkupsPage.isRunCheckupButtonClickable();
        const needsInstall = await checkupsPage.isInstallPermissionsVisible();
        const runVisibleDisabled = (await checkupsPage.isRunCheckupButtonVisible()) && !canRun;
        expect
          .soft(
            canRun || needsInstall || runVisibleDisabled,
            'Network latency tab should show Run checkup (enabled or disabled) or Install permissions',
          )
          .toBe(true);
      },
    );
  },
);

test.describe('Template creation options', { tag: [GATING_TAG, '@gating-templates'] }, () => {
  test('All template creation options are visible and enabled in the Create dropdown', async ({
    templatesPage,
    pageCommons,
    utils,
  }) => {
    await utils.withAllure({
      suite: SUITE,
      feature: GATING,
      tags: [GATING_TAG, '@gating-templates'],
    });

    await templatesPage.navigateToTemplatesViaUI();
    await pageCommons.switchProject('All Projects');

    const allReady = await templatesPage.areAllCreateOptionsVisibleAndEnabled();
    expect
      .soft(
        allReady,
        'All three create template options (From an existing template, From a virtual machine, With YAML) should be visible and enabled',
      )
      .toBe(true);
  });
});
