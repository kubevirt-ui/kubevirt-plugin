import { T1, T1_TAG, VM_TABS_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/vm-tabs-fixture';
import { ROUTE_VIRTUAL_MACHINES_DETAIL_TAG } from '@/data-models/route-tags';

const SUITE = 'VM and VMI detail tabs';

test.describe(SUITE, { tag: [ROUTE_VIRTUAL_MACHINES_DETAIL_TAG, T1_TAG] }, () => {
  test('VM and VMI detail tabs show expected content', async ({
    apiClient,
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

    await vmListPage.navigateToVirtualMachinesViaUI();
    await vmListPage.toggleEmptyProjectsDisplay(true);
    await vmListPage.searchTreeView(namespace);
    await vmListPage.clickProjectNode(namespace);
    await vmListPage.clickVmListTab();

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

    await vmListPage.navigateToVirtualMachinesViaUI();
    await vmListPage.toggleEmptyProjectsDisplay(true);
    await vmListPage.searchTreeView(namespace);
    await vmListPage.clickProjectNode(namespace);
    await vmListPage.clickVmListTab();
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

const MODAL_SUITE = 'VM modal success and error';

test.describe.serial(
  'Tier1 VM modal success and error — stopped RHEL9',
  { tag: [ROUTE_VIRTUAL_MACHINES_DETAIL_TAG, T1_TAG, '@nonpriv'] },
  () => {
    let ns: string;
    let vmName: string;
    let diskName: string;

    test.beforeAll(async ({ apiClient, utils }) => {
      test.setTimeout(utils.TestTimeouts.TEST_VM_CREATION);

      ns = utils.generateTestNamespace('vm-modal-err');
      await apiClient.createNamespace(ns);
      await apiClient.waitForNamespaceReady(ns);
      apiClient.trackResource('Namespace', ns);

      vmName = utils.generateRandomVmName('vm-modal-err');
      await apiClient.createVmFromTemplate(
        utils.TEMPLATE_METADATA_NAMES.RHEL9,
        vmName,
        ns,
        'openshift',
        false,
      );
      apiClient.trackResource('VirtualMachine', vmName, ns);

      const created = await apiClient.verifyVmCreated(vmName, ns, utils.TestTimeouts.VM_BOOTUP);
      if (!created.exists) throw new Error(`VM ${vmName} was not created`);

      diskName = utils.generateRandomDiskName('blank');
      const createdDv = await apiClient.createBlankDataVolume(diskName, ns, '1Gi');
      if (!createdDv) {
        throw new Error(`Failed to create DataVolume ${diskName} in ${ns}`);
      }
      apiClient.trackResource('DataVolume', diskName, ns);
      apiClient.trackResource('PersistentVolumeClaim', diskName, ns);

      // Edit Disk reads pvc.spec.resources.requests.storage; the claim does not need
      // to be Bound (HPP CSI stays Pending until a consumer pod exists).
      const pvc = await apiClient.waitForPersistentVolumeClaim(
        diskName,
        ns,
        utils.TestTimeouts.RESOURCE_CREATION,
      );
      if (!pvc) {
        throw new Error(`PVC ${diskName} was not created in ${ns}; cannot open Edit Disk`);
      }

      await apiClient.hotplugVolumeToVm(vmName, ns, diskName, diskName);
      const diskPresent = await apiClient.waitForVmDiskPresent(vmName, ns, diskName);
      if (!diskPresent) {
        throw new Error(`Disk ${diskName} was not present on VM ${vmName} after attach`);
      }
    });

    test.afterEach(async ({ vmDetailPage }) => {
      await vmDetailPage.unroutePvcPatchForbidden();
    });

    test('PVC resize API error stays in the Edit Disk modal', async ({
      vmTreePage,
      vmDetailPage,
      utils,
    }) => {
      await utils.withAllure({ suite: MODAL_SUITE, feature: T1, tags: [T1_TAG, VM_TABS_TAG] });
      test.setTimeout(utils.TestTimeouts.TEST_VM_CREATION);

      await vmTreePage.navigateToVmViaTreeView(ns, vmName);
      await vmDetailPage.mockPvcPatchForbidden();

      const forbiddenPatch = vmDetailPage.waitForForbiddenPvcPatch(utils.TestTimeouts.VM_CREATION);

      await test.step('Submit a larger PVC size against a forbidden PATCH', async () => {
        await vmDetailPage.submitEditDiskResizeKeepingModalOpen(diskName, '2');
      });

      await test.step('Intercepted PATCH returns 403 and the modal stays open', async () => {
        const response = await forbiddenPatch;
        expect(response.status(), 'PVC PATCH must be the intercepted 403').toBe(403);
        await vmDetailPage.waitForEditDiskModalVisible();
        await vmDetailPage.waitForModalErrorAlert();
        await vmDetailPage.expectModalErrorAlertToContain(/forbidden|could not be completed/i);
        await vmDetailPage.waitForModalSaveButtonEnabled();
      });
    });

    test('Cancel after a PVC resize error dismisses the modal', async ({
      vmTreePage,
      vmDetailPage,
      utils,
    }) => {
      await utils.withAllure({ suite: MODAL_SUITE, feature: T1, tags: [T1_TAG, VM_TABS_TAG] });
      test.setTimeout(utils.TestTimeouts.TEST_VM_CREATION);

      await vmTreePage.navigateToVmViaTreeView(ns, vmName);
      await vmDetailPage.mockPvcPatchForbidden();

      const forbiddenPatch = vmDetailPage.waitForForbiddenPvcPatch(utils.TestTimeouts.VM_CREATION);

      await test.step('Submit a PVC resize that fails and show the error', async () => {
        await vmDetailPage.submitEditDiskResizeKeepingModalOpen(diskName, '2');
        const response = await forbiddenPatch;
        expect(response.status(), 'PVC PATCH must be the intercepted 403').toBe(403);
        await vmDetailPage.waitForEditDiskModalVisible();
        await vmDetailPage.waitForModalErrorAlert();
        await vmDetailPage.expectModalErrorAlertToContain(/forbidden|could not be completed/i);
      });

      await test.step('Cancel closes the modal', async () => {
        await vmDetailPage.clickCancelInModal();
        await vmDetailPage.waitForEditDiskModalHidden();
      });
    });
  },
);
