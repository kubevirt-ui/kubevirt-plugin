import type KubernetesClient from '@/clients/kubernetes-client';
import { INSTANCE_TYPES, OS_FILTERS, PROVIDER_FILTERS } from '@/data-models/constants';
import { GATING_TAG } from '@/data-models/test-tags';
import { expect, test } from '@/fixtures/gating-fixture';
import { EnvVariables } from '@/utils/env-variables';
import { TEMPLATE_METADATA_NAMES } from '@/utils/template-constants';
/** Checks if MTV operator is installed via CRD list reachability. */
async function isMtvOperatorInstalledOnCluster(k8sClient: KubernetesClient): Promise<boolean> {
  try {
    await (
      k8sClient as unknown as { listCustomResources: (...a: unknown[]) => Promise<unknown> }
    ).listCustomResources(
      'migrations.kubevirt.io',
      'v1alpha1',
      undefined as unknown as string,
      'multinamespacevirtualmachinestoragemigrationplans',
    );
    return true;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    if (
      msg.includes('404') ||
      msg.includes('403') ||
      msg.includes('not found') ||
      msg.includes('no kind is registered')
    ) {
      return false;
    }
    throw error;
  }
}

const crdResources = [
  {
    name: 'VirtualMachineClusterInstancetype',
    plural: 'instancetype.kubevirt.io~v1beta1~VirtualMachineClusterInstancetype',
  },
  {
    name: 'VirtualMachineInstancetype',
    plural: 'instancetype.kubevirt.io~v1beta1~VirtualMachineInstancetype',
  },
  {
    name: 'VirtualMachineClusterPreference',
    plural: 'instancetype.kubevirt.io~v1beta1~VirtualMachineClusterPreference',
  },
  {
    name: 'VirtualMachinePreference',
    plural: 'instancetype.kubevirt.io~v1beta1~VirtualMachinePreference',
  },
];

test.describe('Virtualization pages (gating)', { tag: [GATING_TAG] }, () => {
  test(
    'Home overview page shows healthy CNV operator conditions',
    { tag: ['@adminOnly'] },
    async ({ overviewPage }) => {
      await overviewPage.navigateToClusterOverview();
      const ok = await overviewPage.verifyHealthyConditions();
      expect.soft(ok, 'HCO page title should contain kubevirt-hyperconverged').toBe(true);
    },
  );

  test('Home overview page displays VirtualMachines navigation link', async ({ overviewPage }) => {
    await overviewPage.navigateToClusterOverviewViaUI();
    const ok = await overviewPage.verifyVirtualMachineLink();
    expect.soft(ok, 'VirtualMachines heading should be visible').toBe(true);
  });

  test('Virtualization overview page loads with resource cards', async ({ overviewPage }) => {
    await overviewPage.navigateToVirtualizationOverviewViaUI();
    const resourceCards = await overviewPage.verifyResourceCards();
    expect.soft(resourceCards, 'Overview page displays resource cards').toBe(true);
  });

  test('InstanceTypes page loaded', async ({ instanceTypesPage }) => {
    await instanceTypesPage.navigateToInstanceTypesViaUI();
    const ok = await instanceTypesPage.verifyInstanceTypesPageLoaded();
    expect.soft(ok, 'Instance types page loaded').toBe(true);
  });

  test('Bootable volumes page loaded', async ({ bootableVolumesPage }) => {
    await bootableVolumesPage.navigateToBootableVolumesViaUI();
    const ok = await bootableVolumesPage.verifyPageLoaded([INSTANCE_TYPES.FEDORA]);
    expect.soft(ok, 'Bootable volumes page loaded').toBe(true);

    const headers = await bootableVolumesPage.getColumnHeaders();
    for (const expected of ['Name', 'Architecture', 'Operating system', 'Description']) {
      expect.soft(headers, `Column headers should include '${expected}'`).toContain(expected);
    }

    const filterVisible = await bootableVolumesPage.verifySearchFilterVisible();
    expect.soft(filterVisible, 'Search filter input should be visible').toBe(true);
  });

  test('Migration policies page loaded', async ({ k8sClient, migrationPoliciesPage }) => {
    const policies = await k8sClient.listMigrationPolicies();
    const existingNames = (policies as { metadata?: { name?: string } }[])
      .map((p) => p.metadata?.name)
      .filter((n): n is string => Boolean(n));
    await migrationPoliciesPage.navigateToMigrationPoliciesViaUI();
    const ok = await migrationPoliciesPage.verifyPageLoaded(existingNames);
    expect.soft(ok, 'Migration policies page loaded').toBe(true);
  });

  test('Storage MigrationPlans page loads with expected columns and content', async ({
    k8sClient,
    timeouts,
    vmListPage,
  }) => {
    const mtvInstalled = await isMtvOperatorInstalledOnCluster(k8sClient);
    test.skip(
      !mtvInstalled,
      'MTV operator is not installed on this cluster — skipping Storage MigrationPlans test',
    );

    await vmListPage.overviewWidgets.navigateToStorageMigrationPlans(EnvVariables.testNamespace);

    await expect
      .poll(() => vmListPage.overviewWidgets.verifyStorageMigrationPlansPageLoaded(), {
        intervals: [1_000, 2_000, 3_000, 5_000],
        message: 'Storage MigrationPlans page heading should be visible',
        timeout: timeouts.NAVIGATION,
      })
      .toBe(true);

    await expect
      .poll(() => vmListPage.overviewWidgets.isStorageMigrationContentVisible(), {
        intervals: [1_000, 2_000, 3_000, 5_000],
        message: 'Storage MigrationPlans page should show empty state or rows',
        timeout: timeouts.NAVIGATION,
      })
      .toBe(true);

    const hasRows = await vmListPage.hasTableRows();
    if (hasRows) {
      const columns = await vmListPage.overviewWidgets.getStorageMigrationPlansColumnNames();
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
  }) => {
    for (const crd of crdResources) {
      await instanceTypesPage.navigateToCrdPage(crd.plural);
      const notRedirected = await instanceTypesPage.verifyCrdPageNotRedirected(crd.plural);
      expect
        .soft(notRedirected, `CRD page for ${crd.name} should not redirect to /dashboard`)
        .toBe(true);
    }
  });

  test('TreeView nodes render distinguishable icons for cluster and namespace types', async ({
    page,
    testConfig,
    vmListPage,
  }) => {
    test.setTimeout(120_000);
    await page.goto(`/k8s/ns/${testConfig.testNamespace}/kubevirt.io~v1~VirtualMachine`, {
      waitUntil: 'domcontentloaded',
    });
    await vmListPage.tree.toggleEmptyProjectsDisplay(true);
    const ok = await vmListPage.tree.doTreeViewNodesHaveDistinguishableIcons();
    expect.soft(ok, 'Tree view should render distinct icon shapes').toBe(true);
  });

  test('TreeView namespace right-click context menu shows expected actions', async ({
    page,
    testConfig,
    vmListPage,
  }) => {
    test.setTimeout(120_000);
    await page.goto(`/k8s/ns/${testConfig.testNamespace}/kubevirt.io~v1~VirtualMachine`, {
      waitUntil: 'domcontentloaded',
    });
    await vmListPage.tree.toggleEmptyProjectsDisplay(true);
    await vmListPage.tree.searchTreeView(testConfig.testNamespace);
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
  }) => {
    await overviewPage.navigateToVirtualizationOverviewViaUI();

    await test.step('Preferences removed from sidebar navigation', async () => {
      const hasPreferences = await pageCommons.navigation.isSidebarItemVisible('Preferences');
      expect
        .soft(hasPreferences, 'Preferences should not appear in the sidebar navigation menu')
        .toBe(false);
    });
  });

  test(
    'Fleet Virtualization perspective is hidden when ACM operator is not installed',
    { tag: [GATING_TAG] },
    async ({ overviewPage, pageCommons }) => {
      test.skip(EnvVariables.onAcm, 'Fleet Virtualization is expected on ACM clusters');

      await overviewPage.navigateToVirtualizationOverviewViaUI();

      const hasFleetVirtualization = await pageCommons.perspective.isPerspectiveOptionVisible(
        'Fleet Virtualization',
      );
      expect
        .soft(
          hasFleetVirtualization,
          'Fleet Virtualization perspective should NOT be visible without ACM operator',
        )
        .toBe(false);
    },
  );

  test('Templates list name filter shows matching and hides non-matching templates', async ({
    pageCommons,
    templatesPage,
  }) => {
    await templatesPage.navigateToTemplatesViaUI();
    await pageCommons.projectDropdown.switchProject('All Projects');

    await templatesPage.filterTemplatesByName(TEMPLATE_METADATA_NAMES.RHEL9);

    const rhel9Visible = await templatesPage.isTemplateVisible(TEMPLATE_METADATA_NAMES.RHEL9);
    expect.soft(rhel9Visible, 'RHEL9 template visible after name filtering').toBe(true);

    const rhel8Visible = await templatesPage.isTemplateVisible(TEMPLATE_METADATA_NAMES.RHEL8);
    expect.soft(rhel8Visible, 'RHEL8 template should NOT be visible').toBe(false);
    await templatesPage.navigateToAllNamespacesTemplates();
  });

  test('Templates list OpenShift default filter shows Red Hat provided templates', async ({
    pageCommons,
    templatesPage,
  }) => {
    await templatesPage.navigateToTemplatesViaUI();
    await pageCommons.projectDropdown.switchProject('All Projects');

    await templatesPage.filterByDefaultTemplates();

    expect
      .soft(
        await templatesPage.isTemplateVisible(TEMPLATE_METADATA_NAMES.RHEL9),
        'RHEL9 visible after filtering by OpenShift templates',
      )
      .toBe(true);

    if (!EnvVariables.isS390x) {
      expect
        .soft(
          await templatesPage.isTemplateVisible(TEMPLATE_METADATA_NAMES.WIN10),
          'WIN10 visible after filtering by OpenShift templates',
        )
        .toBe(true);
    }
    await templatesPage.navigateToAllNamespacesTemplates();
  });

  test('Templates list OS filter shows matching templates and hides others', async ({
    pageCommons,
    templatesPage,
  }) => {
    await templatesPage.navigateToTemplatesViaUI();
    await pageCommons.projectDropdown.switchProject('All Projects');

    await templatesPage.filterByOS(OS_FILTERS.WINDOWS);
    expect
      .soft(
        await templatesPage.isTemplateVisible(TEMPLATE_METADATA_NAMES.WIN2K22),
        'WIN2K22 visible',
      )
      .toBe(true);
    expect
      .soft(
        await templatesPage.isTemplateVisible(TEMPLATE_METADATA_NAMES.RHEL9),
        'RHEL9 should NOT be visible',
      )
      .toBe(false);
    await templatesPage.navigateToAllNamespacesTemplates();
  });

  test('Templates list Provider filter hides Red Hat templates when "Other" is selected', async ({
    pageCommons,
    templatesPage,
  }) => {
    await templatesPage.navigateToTemplatesViaUI();
    await pageCommons.projectDropdown.switchProject('All Projects');

    await templatesPage.filterByProvider(PROVIDER_FILTERS.OTHER);

    expect
      .soft(
        await templatesPage.isTemplateVisible(TEMPLATE_METADATA_NAMES.RHEL9),
        'RHEL9 should NOT be visible under Other provider',
      )
      .toBe(false);
    expect
      .soft(
        await templatesPage.isTemplateVisible(TEMPLATE_METADATA_NAMES.WIN10),
        'WIN10 should NOT be visible under Other provider',
      )
      .toBe(false);
    await templatesPage.navigateToAllNamespacesTemplates();
  });

  test('Templates without boot source do not show source available text', async ({
    pageCommons,
    templatesPage,
  }) => {
    await templatesPage.navigateToTemplatesViaUI();
    await pageCommons.projectDropdown.switchProject('All Projects');

    await templatesPage.filterTemplatesByName(OS_FILTERS.WINDOWS);
    const noSource = await templatesPage.verifySourceAvailableTextDoesNotExist();
    expect
      .soft(noSource, 'Source available text should not exist for templates w/o boot source')
      .toBe(true);
    await templatesPage.navigateToAllNamespacesTemplates();
  });

  test('Templates list combined type and OS filters refine results to matching templates only', async ({
    pageCommons,
    templatesPage,
  }) => {
    await templatesPage.navigateToTemplatesViaUI();
    await pageCommons.projectDropdown.switchProject('All Projects');

    await templatesPage.filterByDefaultTemplates();
    await templatesPage.filterByOS(OS_FILTERS.RHEL);

    expect
      .soft(
        await templatesPage.isTemplateVisible(TEMPLATE_METADATA_NAMES.RHEL9),
        'RHEL9 visible after filtering by OpenShift templates + RHEL OS',
      )
      .toBe(true);

    if (!EnvVariables.isS390x) {
      expect
        .soft(
          await templatesPage.isTemplateVisible(TEMPLATE_METADATA_NAMES.WIN10),
          'WIN10 should NOT be visible when RHEL OS filter is active',
        )
        .toBe(false);
    }
    await templatesPage.navigateToAllNamespacesTemplates();
  });

  test('VM list page loads and Virtual machines tab is navigable', async ({
    testConfig,
    timeouts,
    vmListPage,
  }) => {
    await vmListPage.tree.toggleEmptyProjectsDisplay(true);
    await vmListPage.navigateToNamespaceVirtualMachinesViaUI(testConfig.testNamespace);
    await test.step('Virtual machines tab is present and navigable', async () => {
      await vmListPage.overviewWidgets.clickVmListTab();
      await expect
        .poll(() => vmListPage.isVmListOrEmptyStateVisible(), {
          message: 'VM list tab should render a table or empty state',
          timeout: timeouts.UI_ELEMENT_VISIBILITY,
        })
        .toBe(true);
    });
  });

  test('VM namespace Overview and Virtual machines tabs switch correctly', async ({
    testConfig,
    timeouts,
    vmListPage,
    vmOverviewTabPage,
  }) => {
    await vmListPage.tree.toggleEmptyProjectsDisplay(true);
    await vmListPage.navigateToNamespaceVirtualMachinesViaUI(testConfig.testNamespace);
    await test.step('Overview tab is navigable and becomes selected', async () => {
      await vmOverviewTabPage.clickOverviewTab();
      const selected = await vmOverviewTabPage.isOverviewTabSelected();
      expect.soft(selected, 'Overview tab should be active after clicking').toBe(true);
    });

    await test.step('Overview tab renders content without a JS error boundary', async () => {
      const hasCrash = await vmListPage.isErrorBoundaryVisible();
      expect.soft(!hasCrash, 'Overview tab should not show an error boundary').toBe(true);
    });

    await test.step('Virtual machines tab is navigable from overview', async () => {
      await vmListPage.overviewWidgets.clickVmListTab();
      await expect
        .poll(() => vmListPage.isVmListOrEmptyStateVisible(), {
          message: 'Virtual machines tab should render after switching from overview',
          timeout: timeouts.UI_ELEMENT_VISIBILITY,
        })
        .toBe(true);
    });
  });

  test('InstanceTypes User tab loads without error', async ({ instanceTypesPage, timeouts }) => {
    await instanceTypesPage.navigateToInstanceTypesViaUI();

    await test.step('Cluster InstanceTypes tab loads', async () => {
      const loaded = await instanceTypesPage.verifyInstanceTypesPageLoaded();
      expect.soft(loaded, 'Cluster InstanceTypes tab should be loaded').toBe(true);
    });

    await test.step('User InstanceTypes tab is navigable and loads without error', async () => {
      await instanceTypesPage.clickUserInstanceTypesTab();
      const result = await instanceTypesPage.verifyUserInstanceTypesTabReady(
        timeouts.UI_ELEMENT_VISIBILITY,
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
    bootableVolumeDetailPage,
    bootableVolumesPage,
  }) => {
    await bootableVolumesPage.navigateToBootableVolumesViaUI();

    await test.step('Navigate to fedora bootable volume detail page', async () => {
      await bootableVolumeDetailPage.navigateToBootableVolumeDetail(
        INSTANCE_TYPES.FEDORA,
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
        INSTANCE_TYPES.FEDORA,
      );
      expect
        .soft(titleMatch, `Detail page title should match "${INSTANCE_TYPES.FEDORA}"`)
        .toBe(true);
    });
  });
});

test.describe('Templates name filter regression', { tag: [GATING_TAG] }, () => {
  test.beforeEach(async ({ pageCommons, templatesPage }) => {
    await templatesPage.navigateToTemplatesViaUI();
    await pageCommons.projectDropdown.switchProject('All Projects');
  });

  test('Templates name filter shows results and restores full list after clearing', async ({
    templatesPage,
  }) => {
    await test.step('Filter by RHEL9 shows matching templates', async () => {
      await templatesPage.filterTemplatesByName(TEMPLATE_METADATA_NAMES.RHEL9);
      const rhel9Visible = await templatesPage.isTemplateVisible(TEMPLATE_METADATA_NAMES.RHEL9);
      expect
        .soft(rhel9Visible, 'RHEL9 template should be visible after filtering by name')
        .toBe(true);
    });

    await test.step('Clearing the name filter restores all templates', async () => {
      await templatesPage.filterTemplatesByName('');
      const fedoraVisible = await templatesPage.isTemplateVisible(TEMPLATE_METADATA_NAMES.FEDORA);
      expect
        .soft(
          fedoraVisible,
          'Fedora template should be visible again after clearing the name filter',
        )
        .toBe(true);
      const rhel9StillVisible = await templatesPage.isTemplateVisible(
        TEMPLATE_METADATA_NAMES.RHEL9,
      );
      expect
        .soft(rhel9StillVisible, 'RHEL9 template should still be visible after clearing filter')
        .toBe(true);
    });
  });
});
