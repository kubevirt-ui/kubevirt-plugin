import { T1, T1_TAG, VM_TABS_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/vm-tabs-fixture';

const SUITE = 'VM Disk Operations';

test.describe('Tier1 VM Disk Operations — stopped RHEL9', { tag: [T1_TAG, '@nonpriv'] }, () => {
  test('Pod networking visible, add blank disk with storage class, detach disk', async ({
    apiClient,
    vmTreePage,
    vmDetailPage,
    utils,
  }) => {
    await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG, VM_TABS_TAG] });
    test.setTimeout(utils.TestTimeouts.TEST_VM_CREATION);

    const ns = utils.generateTestNamespace('vm-disk-ops');
    await apiClient.createNamespace(ns);
    await apiClient.waitForNamespaceReady(ns);
    apiClient.trackResource('Namespace', ns);

    const vmName = utils.generateRandomVmName('vm-disk-ops');
    await apiClient.createVmFromTemplate(
      utils.TEMPLATE_METADATA_NAMES.RHEL9,
      vmName,
      ns,
      'openshift',
      false,
    );
    apiClient.trackResource('VirtualMachine', vmName, ns);

    const result = await apiClient.verifyVmCreated(vmName, ns, utils.TestTimeouts.VM_BOOTUP);
    if (!result.exists) throw new Error(`VM ${vmName} was not created`);

    await vmTreePage.navigateToVmViaTreeView(ns, vmName);

    await vmDetailPage.navigateToConfigurationNetwork();
    const podNetVisible = await vmDetailPage.verifyPodNetworking();
    expect.soft(podNetVisible, 'Network tab should show pod networking section').toBe(true);

    await vmDetailPage.navigateToConfigurationStorage();

    const diskName = utils.generateRandomDiskName('blank');
    const added = await vmDetailPage.addBlankDisk(
      diskName,
      '1',
      utils.STORAGE_CLASSES.OCS_STORAGECLUSTER_CEPH_RBD_VIRTUALIZATION,
    );
    expect.soft(added, `Blank disk ${diskName} should be added from UI`).toBe(true);

    const diskVisible = await vmDetailPage.verifyDiskNameExists(diskName);
    expect.soft(diskVisible, `Disk row for ${diskName} should be visible`).toBe(true);

    const scMatches = await vmDetailPage.verifyDiskStorageClass(
      diskName,
      utils.STORAGE_CLASSES.OCS_STORAGECLUSTER_CEPH_RBD_VIRTUALIZATION,
    );
    expect
      .soft(scMatches, `Disk ${diskName} should use the selected virtualization storage class`)
      .toBe(true);

    const detachOk = await vmDetailPage.detachDisk(diskName);
    expect.soft(detachOk, `Disk ${diskName} should be detached from UI`).toBe(true);

    const gone = await vmDetailPage.verifyDiskDoesNotExist(diskName);
    expect.soft(gone, `Disk ${diskName} should no longer appear in the table`).toBe(true);
  });
});
