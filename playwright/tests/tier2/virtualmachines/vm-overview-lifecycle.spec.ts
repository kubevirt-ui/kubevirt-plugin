import { T2, T2_TAG, VM_TABS_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/vm-tabs-fixture';

const SUITE = 'Test VM Snapshot';

test.describe('VM Overview - namespace level', { tag: [T2_TAG, '@tier2-vm-overview'] }, () => {
  test('Namespace VM overview health and resource charts', async ({
    k8sClient,
    vmTreePage,
    vmListPage,
    utils,
  }) => {
    await utils.withAllure({
      suite: 'VM Overview - namespace level',
      feature: T2,
      tags: [T2_TAG, '@tier2-vm-overview'],
    });

    const namespace = utils.generateTestNamespace('vm-overview-ns');
    await k8sClient.createNamespace(namespace);
    await k8sClient.waitForNamespaceReady(namespace);
    k8sClient.trackResource('Namespace', namespace);

    const vmName1 = utils.generateRandomVmName('vm-overview-ns-1');
    await k8sClient.createVmFromTemplate(
      'rhel9-server-small',
      vmName1,
      namespace,
      'openshift',
      true,
    );
    k8sClient.trackResource('VirtualMachine', vmName1, namespace);
    await k8sClient.verifyVmCreated(vmName1, namespace, utils.TestTimeouts.VM_BOOTUP);
    await k8sClient.waitForVmRunning(vmName1, namespace, utils.TestTimeouts.VM_BOOTUP);

    const vmName2 = utils.generateRandomVmName('vm-overview-ns-2');
    await k8sClient.createVmFromTemplate(
      'rhel9-server-small',
      vmName2,
      namespace,
      'openshift',
      true,
    );
    k8sClient.trackResource('VirtualMachine', vmName2, namespace);
    await k8sClient.verifyVmCreated(vmName2, namespace, utils.TestTimeouts.VM_BOOTUP);
    await k8sClient.waitForVmRunning(vmName2, namespace, utils.TestTimeouts.VM_BOOTUP);

    await vmTreePage.navigateToProjectViaTreeView(namespace);

    const result = await vmListPage.getHealthSectionWidgetsVisibility(utils.TestTimeouts.VM_BOOTUP);
    expect
      .soft(
        result.allVisible,
        result.missing.length
          ? `Missing widgets: ${result.missing.join(', ')}`
          : 'All health widgets visible',
      )
      .toBe(true);

    const runningResult = await vmListPage.verifyRunningVmsCountInHealthSection(namespace, 2);
    expect
      .soft(runningResult.matches, runningResult.message ?? 'Running VMs count should match 2')
      .toBe(true);

    const { count, allVisible } = await vmListPage.getResourceAllocationChartsVisibility(
      utils.TestTimeouts.VM_BOOTUP,
    );
    expect.soft(count, 'Resource allocation should have 4 chart elements').toBe(4);
    expect.soft(allVisible, 'All 4 resource allocation charts should be visible').toBe(true);
  });
});

test.describe.serial(
  'VM Snapshots — shared stopped RHEL9 VM',
  { tag: [T2_TAG, '@tier2-snapshots', '@nonpriv'] },
  () => {
    let ns: string;
    let vmName: string;

    test.beforeAll(async ({ k8sClient, utils, testConfig }) => {
      if (utils.EnvVariables.isNonPrivUser) {
        ns = testConfig.testNamespace;
      } else {
        ns = utils.generateTestNamespace('vm-snap-shared');
        await k8sClient.createNamespace(ns);
        await k8sClient.waitForNamespaceReady(ns);
        k8sClient.trackResource('Namespace', ns);
      }

      vmName = utils.generateRandomVmName('vm-snapshot');
      await k8sClient.createVmFromTemplate(
        utils.TEMPLATE_METADATA_NAMES.RHEL9,
        vmName,
        ns,
        'openshift',
        false,
        undefined,
        undefined,
        undefined,
        utils.STORAGE_CLASSES.OCS_STORAGECLUSTER_CEPH_RBD_VIRTUALIZATION,
      );
      k8sClient.trackResource('VirtualMachine', vmName, ns);

      const result = await k8sClient.verifyVmCreated(vmName, ns, utils.TestTimeouts.VM_BOOTUP);
      if (!result.exists) throw new Error(`VM ${vmName} was not created`);
    });

    test.beforeEach(async ({ utils }) => {
      await utils.withAllure({ suite: SUITE, feature: T2, tags: [T2_TAG, VM_TABS_TAG] });
    });

    test('VM snapshot lifecycle: take, restore, create VM from snapshot', async ({
      k8sClient,
      vmTreePage,
      vmDetailPage,
      utils,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_EXTENDED);

      await vmTreePage.navigateToVmViaTreeView(ns, vmName);
      await vmDetailPage.navigateToSnapshots();

      let snapshotName: string;

      await test.step('take Snapshot in tab snapshots', async () => {
        snapshotName = utils.generateRandomSnapshotName('snapshot');
        const snapshotTaken = await vmDetailPage.takeSnapshot(snapshotName);
        expect.soft(snapshotTaken, `Snapshot ${snapshotName} should be taken`).toBe(true);

        await k8sClient.waitForSnapshotReady(snapshotName, ns);
        k8sClient.trackResource('VirtualMachineSnapshot', snapshotName, ns);

        const snapshotExists = await vmDetailPage.verifySnapshotExists(snapshotName);
        expect.soft(snapshotExists, `Snapshot ${snapshotName} should exist`).toBe(true);
      });

      await test.step('restore vm from snapshot', async () => {
        const { success: restoreSuccess } = await vmDetailPage.restoreVmFromSnapshot(snapshotName);
        expect.soft(restoreSuccess, 'VM should be restored from snapshot').toBe(true);
      });

      await test.step('create VM from snapshot', async () => {
        const clonedVm = utils.generateRandomVmName('snap-clone');
        const created = await vmDetailPage.createVmFromSnapshot(snapshotName, clonedVm);
        expect.soft(created, `VM ${clonedVm} should be created from snapshot`).toBe(true);

        k8sClient.trackResource('VirtualMachine', clonedVm, ns);
        const exists = await k8sClient.verifyVmCreated(clonedVm, ns, utils.TestTimeouts.VM_BOOTUP);
        expect.soft(exists.exists, `Cloned VM ${clonedVm} should exist`).toBe(true);
      });
    });

    test('Restore VM from snapshot', async ({ k8sClient, vmTreePage, vmDetailPage, utils }) => {
      const snapshotName = utils.generateRandomSnapshotName('snapshot');
      await k8sClient.createVmSnapshot(snapshotName, vmName, ns);
      k8sClient.trackResource('VirtualMachineSnapshot', snapshotName, ns);
      await k8sClient.waitForSnapshotReady(snapshotName, ns);

      await vmTreePage.navigateToVmViaTreeView(ns, vmName);
      await vmDetailPage.navigateToSnapshots();

      const { success: restoreSuccess } = await vmDetailPage.restoreVmFromSnapshot(snapshotName);
      expect(restoreSuccess, `VM ${vmName} should be restored from snapshot`).toBe(true);
    });

    test('Restore modal uses fixed InPlace policy without selector', async ({
      k8sClient,
      vmTreePage,
      vmDetailPage,
      utils,
    }) => {
      const snapshotName = utils.generateRandomSnapshotName('snapshot');
      await k8sClient.createVmSnapshot(snapshotName, vmName, ns);
      k8sClient.trackResource('VirtualMachineSnapshot', snapshotName, ns);
      await k8sClient.waitForSnapshotReady(snapshotName, ns);

      await vmTreePage.navigateToVmViaTreeView(ns, vmName);
      await vmDetailPage.navigateToSnapshots();

      await vmDetailPage.openRestoreModalForSnapshot(snapshotName);
      const policyAbsent = await vmDetailPage.isVolumeRestorePolicyAbsent();
      expect
        .soft(policyAbsent, 'Volume restore policy radio group should not be present')
        .toBe(true);
      await vmDetailPage.cancelRestoreModal();
    });
  },
);

test.describe(
  'VM Clone workflow — clone stopped VM, start clone, verify both exist',
  { tag: [T2_TAG, '@tier2-vm-clone'] },
  () => {
    test('Clone a stopped VM with start-on-clone and verify the cloned VM runs', async ({
      k8sClient,
      vmTreePage,
      vmListPage,
      utils,
    }) => {
      await utils.withAllure({
        suite: 'VM Clone workflow',
        feature: T2,
        tags: [T2_TAG, VM_TABS_TAG],
      });
      test.setTimeout(utils.TestTimeouts.TEST_EXTENDED);

      const ns = utils.generateTestNamespace('vm-clone');
      await k8sClient.createNamespace(ns);
      await k8sClient.waitForNamespaceReady(ns);
      k8sClient.trackResource('Namespace', ns);

      const sourceVm = utils.generateRandomVmName('clone-source');
      await k8sClient.createVmFromTemplate(
        utils.TEMPLATE_METADATA_NAMES.RHEL9,
        sourceVm,
        ns,
        'openshift',
        false,
      );
      k8sClient.trackResource('VirtualMachine', sourceVm, ns);
      const sourceCreated = await k8sClient.verifyVmCreated(
        sourceVm,
        ns,
        utils.TestTimeouts.VM_BOOTUP,
      );
      expect.soft(sourceCreated.exists, `Source VM ${sourceVm} should exist`).toBe(true);

      await vmTreePage.navigateToProjectViaTreeView(ns);
      await vmListPage.clickVmListTab();

      const clonedVm = utils.generateRandomVmName('clone-target');
      await vmListPage.cloneVm(sourceVm, clonedVm, true);
      k8sClient.trackResource('VirtualMachine', clonedVm, ns);

      const cloneCreated = await k8sClient.verifyVmCreated(
        clonedVm,
        ns,
        utils.TestTimeouts.VM_BOOTUP,
      );
      expect
        .soft(cloneCreated.exists, `Cloned VM ${clonedVm} should exist after clone operation`)
        .toBe(true);

      const cloneRunning = await k8sClient.waitForVmRunning(
        clonedVm,
        ns,
        utils.TestTimeouts.VM_BOOTUP,
      );
      expect
        .soft(cloneRunning, `Cloned VM ${clonedVm} should reach Running state (start-on-clone)`)
        .toBe(true);

      const sourceStillExists = await k8sClient.verifyVmCreated(
        sourceVm,
        ns,
        utils.TestTimeouts.DEFAULT,
      );
      expect
        .soft(sourceStillExists.exists, `Source VM ${sourceVm} should still exist after cloning`)
        .toBe(true);
    });
  },
);

test.describe('Running VM snapshot operations', { tag: [T2_TAG, '@tier2-snapshots'] }, () => {
  test(
    'Take snapshot on running Fedora VM',
    { tag: ['@nonpriv'] },
    async ({ k8sClient, vmTreePage, vmDetailPage, utils, testConfig }) => {
      await utils.withAllure({
        suite: 'VM snapshots tab',
        feature: T2,
        tags: [T2_TAG, VM_TABS_TAG],
      });

      const namespace = utils.EnvVariables.isNonPrivUser
        ? testConfig.testNamespace
        : utils.generateTestNamespace('vm-snapshots-running');
      if (!utils.EnvVariables.isNonPrivUser) {
        await k8sClient.createNamespace(namespace);
        await k8sClient.waitForNamespaceReady(namespace);
        k8sClient.trackResource('Namespace', namespace);
      }

      const fedoraVm = utils.generateRandomVmName('vm-snapshots-running');
      await k8sClient.createVmFromTemplate(
        'fedora-server-small',
        fedoraVm,
        namespace,
        'openshift',
        true,
      );
      k8sClient.trackResource('VirtualMachine', fedoraVm, namespace);
      await utils.waitForVirtualMachineReady(
        k8sClient,
        fedoraVm,
        namespace,
        utils.TestTimeouts.VM_BOOTUP,
      );

      await vmTreePage.navigateToVmViaTreeView(namespace, fedoraVm);
      await vmDetailPage.navigateToSnapshots();

      await test.step('take snapshot and verify visible', async () => {
        const snapshotName = utils.generateRandomSnapshotName('snapshot');
        const takeResult = await vmDetailPage.takeSnapshot(snapshotName);
        expect
          .soft(takeResult, `Snapshot ${snapshotName} should be created successfully`)
          .toBe(true);

        await k8sClient.waitForSnapshotReady(snapshotName, namespace);
        k8sClient.trackResource('VirtualMachineSnapshot', snapshotName, namespace);

        const snapshotVisible = await vmDetailPage.verifySnapshotExists(snapshotName);
        expect.soft(snapshotVisible, `Snapshot ${snapshotName} should be visible`).toBe(true);
      });
    },
  );
});
