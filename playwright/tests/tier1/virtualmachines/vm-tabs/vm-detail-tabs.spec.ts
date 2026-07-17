import { T1, T1_TAG, VM_TABS_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/vm-tabs-fixture';

const SUITE = 'VM and VMI detail tabs';

test.describe(SUITE, { tag: [T1_TAG] }, () => {
  test('VM and VMI detail tabs show expected content', async ({
    apiClient,
    vmTreePage,
    vmListPage,
    vmDetailPage,
    utils,
  }) => {
    test.setTimeout(utils.TestTimeouts.TEST_EXTENDED);
    await utils.withAllure({
      suite: SUITE,
      feature: T1,
      tags: [T1_TAG, VM_TABS_TAG, 'vmi-tabs'],
    });

    const namespace = utils.generateTestNamespace('t1-vm-tabs');
    const vmName = utils.generateRandomVmName('t1-vm-tabs');

    await apiClient.createNamespace(namespace);
    await apiClient.waitForNamespaceReady(namespace);
    apiClient.trackResource('Namespace', namespace);
    await apiClient.createVmFromTemplate(
      utils.TEMPLATE_METADATA_NAMES.RHEL9,
      vmName,
      namespace,
      'openshift',
      true,
    );
    apiClient.trackResource('VirtualMachine', vmName, namespace);
    await apiClient.waitForVmRunning(vmName, namespace, utils.TestTimeouts.VM_RUNNING);

    await vmTreePage.navigateToVirtualMachinesViaUI();
    await vmTreePage.toggleEmptyProjectsDisplay(true);
    await vmTreePage.searchTreeView(namespace);
    await vmTreePage.clickProjectNode(namespace);
    await vmTreePage.clickVmListTab();

    const pageLoaded = await vmListPage.verifyPageLoaded();
    expect.soft(pageLoaded, 'VM list page should load').toBe(true);

    await vmListPage.clickVmByTestId(vmName);

    const vmNameVisible = await vmDetailPage.isVmNameVisible(
      vmName,
      utils.TestTimeouts.UI_ELEMENT_VISIBILITY,
    );
    expect.soft(vmNameVisible, 'VM name visible on detail page').toBe(true);

    const osVisible = await vmDetailPage.verifyOperatingSystem();
    expect.soft(osVisible, 'Operating system visible in Overview tab').toBe(true);

    await vmDetailPage.navigateToYAML();
    const downloadYaml = await vmDetailPage.verifyDownload();
    expect.soft(downloadYaml, 'Download visible in YAML tab').toBe(true);

    const hasDiagnosticsTab = await vmDetailPage.isDiagnosticsTabVisible();
    if (hasDiagnosticsTab) {
      await vmDetailPage.navigateToDiagnostics();
      const diagnosticsLoaded = await vmDetailPage.verifyNoErrorBoundary();
      expect.soft(diagnosticsLoaded, 'Diagnostics tab loads without error boundary').toBe(true);
    }

    await vmDetailPage.navigateToConfigurationDetails();
    const headless = await vmDetailPage.verifyHeadlessMode();
    expect.soft(headless, 'Headless mode visible in Configuration > Details').toBe(true);

    await vmDetailPage.navigateToEvents();
    const eventVisible = await vmDetailPage.verifyVmStartEvent(utils.TestTimeouts.DEFAULT);
    expect.soft(eventVisible, 'VM start event visible in Events tab').toBe(true);

    await vmDetailPage.navigateToConsole();
    await vmDetailPage.tryDismissVncTryLaterDialog();
    const guestLogin = await vmDetailPage.verifyGuestLogin();
    expect.soft(guestLogin, 'Guest login visible in Console tab').toBe(true);

    await vmDetailPage.navigateToSnapshots();
    const noSnapshots = await vmDetailPage.verifyNoSnapshots();
    expect.soft(noSnapshots, 'No snapshots found visible in Snapshots tab').toBe(true);

    await vmDetailPage.navigateToMetrics();
    const utilization = await vmDetailPage.verifyUtilization();
    expect.soft(utilization, 'Utilization visible in Metrics tab').toBe(true);

    await vmTreePage.navigateToVirtualMachinesViaUI();
    await vmTreePage.toggleEmptyProjectsDisplay(true);
    await vmTreePage.searchTreeView(namespace);
    await vmTreePage.clickProjectNode(namespace);
    await vmTreePage.clickVmListTab();
    await vmListPage.clickVmByTestId(vmName);
    await vmDetailPage.navigateToOverview();
    await vmDetailPage.clickVmiByTestId(vmName);

    const annotations = await vmDetailPage.verifyAnnotationsInOverview();
    expect.soft(annotations, 'Annotations visible on VMI detail').toBe(true);

    await vmDetailPage.navigateToYAML();
    const download = await vmDetailPage.verifyDownload();
    expect.soft(download, 'Download visible in VMI YAML tab').toBe(true);

    await vmDetailPage.navigateToScheduling();
    const tolerations = await vmDetailPage.verifyTolerations();
    expect.soft(tolerations, 'Tolerations visible in VMI Scheduling tab').toBe(true);

    await vmDetailPage.navigateToEvents();
    const event = await vmDetailPage.verifyVmStartEvent(utils.TestTimeouts.DEFAULT);
    expect.soft(event, 'VM start event visible in VMI Events tab').toBe(true);

    await vmDetailPage.navigateToConsole();
    await vmDetailPage.tryDismissVncTryLaterDialog();
    const guestLoginVmi = await vmDetailPage.verifyGuestLogin();
    expect.soft(guestLoginVmi, 'Guest login visible in VMI Console tab').toBe(true);

    await vmDetailPage.navigateToNetworks();
    const podNetworking = await vmDetailPage.verifyPodNetworking();
    expect.soft(podNetworking, 'Pod networking visible in VMI Networks tab').toBe(true);
  });
});
