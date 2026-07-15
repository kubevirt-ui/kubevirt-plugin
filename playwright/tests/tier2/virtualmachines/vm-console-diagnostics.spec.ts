import { T2, T2_TAG, VM_TABS_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/vm-tabs-fixture';

test.describe(
  'Tier2 VM Storage and Network operations — shared stopped RHEL9',
  { tag: [T2_TAG, '@nonpriv'] },
  () => {
    let stoppedVm: string;
    let ns: string;

    test.beforeAll(async ({ k8sClient, utils, testConfig }) => {
      if (utils.EnvVariables.isNonPrivUser) {
        ns = testConfig.testNamespace;
      } else {
        ns = utils.generateTestNamespace('vm-diag-shared');
        await k8sClient.createNamespace(ns);
        await k8sClient.waitForNamespaceReady(ns);
        k8sClient.trackResource('Namespace', ns);
      }

      stoppedVm = utils.generateRandomVmName('vm-shared-stop');
      await k8sClient.createVmFromTemplate(
        utils.TEMPLATE_METADATA_NAMES.RHEL9,
        stoppedVm,
        ns,
        'openshift',
        false,
      );
      k8sClient.trackResource('VirtualMachine', stoppedVm, ns);
      const stopVerify = await k8sClient.verifyVmCreated(
        stoppedVm,
        ns,
        utils.TestTimeouts.VM_BOOTUP,
      );
      if (!stopVerify.exists) throw new Error(`Stopped VM ${stoppedVm} was not created`);
    });

    test.beforeEach(async ({ utils }) => {
      await utils.withAllure({
        suite: 'VM Storage and Network operations',
        feature: T2,
        tags: [T2_TAG, VM_TABS_TAG],
      });
    });

    test('Pod networking visible, add blank disk with storage class, detach disk', async ({
      vmTreePage,
      vmDetailPage,
      utils,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_VM_CREATION);

      await vmTreePage.navigateToVmViaTreeView(ns, stoppedVm);

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
  },
);
