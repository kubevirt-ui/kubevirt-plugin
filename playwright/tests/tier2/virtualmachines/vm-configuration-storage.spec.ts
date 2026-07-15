import { T2, T2_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/vm-tabs-fixture';

const SUITE = 'VM disks tab';

test.describe.serial(
  'VM Storage — shared running Fedora VM',
  { tag: [T2_TAG, '@tier2-storage', '@nonpriv'] },
  () => {
    let ns: string;
    let vmName: string;

    test.beforeAll(async ({ k8sClient, utils, testConfig }) => {
      if (utils.EnvVariables.isNonPrivUser) {
        ns = testConfig.testNamespace;
      } else {
        ns = utils.generateTestNamespace('vm-storage-shared');
        await k8sClient.createNamespace(ns);
        await k8sClient.waitForNamespaceReady(ns);
        k8sClient.trackResource('Namespace', ns);
      }

      vmName = utils.generateRandomVmName('vm-storage');
      await k8sClient.createVmFromInstanceType('fedora', vmName, ns, undefined, undefined, true);
      k8sClient.trackResource('VirtualMachine', vmName, ns);

      const created = await k8sClient.verifyVmCreated(vmName, ns, utils.TestTimeouts.VM_CREATION);
      if (!created.exists) throw new Error(`VM ${vmName} was not created`);

      const running = await k8sClient.waitForVmRunning(vmName, ns, utils.TestTimeouts.VM_BOOTUP);
      if (!running) throw new Error(`VM ${vmName} did not reach Running state`);
    });

    test.beforeEach(async ({ utils }) => {
      await utils.withAllure({ suite: SUITE, feature: T2, tags: [T2_TAG] });
    });

    test('Disk driver/bus is reflected in UI for running VM', async ({
      k8sClient,
      vmTreePage,
      vmDetailPage,
    }) => {
      const vmiBus = await k8sClient.getVmiDiskBus(vmName, ns, 'rootdisk');
      expect.soft(vmiBus, 'VMI should have bus type resolved at runtime').not.toBeNull();
      expect
        .soft(vmiBus?.toLowerCase(), 'VMI bus should be a known type (virtio/scsi/sata)')
        .toMatch(/virtio|scsi|sata/);

      await vmTreePage.navigateToVmViaTreeView(ns, vmName);
      await vmDetailPage.navigateToConfigurationStorage();

      const driveValue = await vmDetailPage.getDiskDriveValue('rootdisk');
      expect.soft(driveValue, 'Drive column should not be null').not.toBeNull();
      expect.soft(driveValue, 'Drive column should not show NO_DATA_DASH').not.toBe('—');

      const interfaceValue = await vmDetailPage.getDiskInterfaceValue('rootdisk');
      expect.soft(interfaceValue, 'Interface column should not be null or empty').toBeTruthy();
      expect.soft(interfaceValue, 'Interface column should not show NO_DATA_DASH').not.toBe('—');
      expect
        .soft(
          interfaceValue?.toLowerCase(),
          'Interface should show a known bus type (virtio/scsi/sata)',
        )
        .toMatch(/virtio|scsi|sata/);

      await vmDetailPage.navigateToVmiDisksTab(vmName, ns);

      const vmiDiskName = await vmDetailPage.getVmiDiskColumnValue('rootdisk', 'name');
      expect.soft(vmiDiskName, 'VMI Disks tab should show rootdisk').toBe('rootdisk');

      const vmiDrive = await vmDetailPage.getVmiDiskColumnValue('rootdisk', 'drive');
      expect.soft(vmiDrive, 'VMI Drive column should not be null').not.toBeNull();
      expect.soft(vmiDrive, 'VMI Drive column should not show NO_DATA_DASH').not.toBe('—');

      const vmiInterface = await vmDetailPage.getVmiDiskColumnValue('rootdisk', 'interface');
      expect.soft(vmiInterface, 'VMI Interface column should not be null or empty').toBeTruthy();
      expect.soft(vmiInterface, 'VMI Interface column should not show NO_DATA_DASH').not.toBe('—');
      expect
        .soft(
          vmiInterface?.toLowerCase(),
          'VMI Interface should show a known bus type (virtio/scsi/sata)',
        )
        .toMatch(/virtio|scsi|sata/);
    });

    test('Disk size displayed on Configuration Storage and VMI Disks tabs, edit modal loads PVC size', async ({
      k8sClient,
      vmTreePage,
      vmDetailPage,
      utils,
    }) => {
      const dvDiskName = utils.generateRandomDiskName('dv-disk');

      await k8sClient.createBlankDataVolume(dvDiskName, ns, '1Gi');
      k8sClient.trackResource('DataVolume', dvDiskName, ns);
      await k8sClient.waitForDataVolumeSucceeded(dvDiskName, ns);
      await k8sClient.hotplugVolumeToVm(vmName, ns, dvDiskName, dvDiskName);
      await k8sClient.waitForVmDiskPresent(vmName, ns, dvDiskName);

      await vmTreePage.navigateToVmViaTreeView(ns, vmName);
      await vmDetailPage.navigateToConfigurationStorage();

      const rootdiskSize = await vmDetailPage.getDiskSizeValue('rootdisk');
      expect
        .soft(rootdiskSize, 'rootdisk size should be shown (e.g. "Dynamic" or a value)')
        .not.toBeNull();

      const dvDiskSize = await vmDetailPage.getDiskSizeValue(dvDiskName);
      expect.soft(dvDiskSize, 'DataVolume disk size should show a numeric value').not.toBeNull();
      expect.soft(dvDiskSize, 'DataVolume disk size should not be "—"').not.toBe('—');

      const sizeInfo = await vmDetailPage.getEditDiskModalSizeInfo(dvDiskName);
      expect.soft(sizeInfo.value, 'Edit modal should load the PVC size value').not.toBeNull();
      expect
        .soft(Number(sizeInfo.value), 'PVC size should be a positive number')
        .toBeGreaterThan(0);
      expect.soft(sizeInfo.unit, 'Size unit should be populated').not.toBeNull();
      expect
        .soft(
          sizeInfo.decrementDisabled,
          'PVC size decrement should be disabled (PVCs can only grow)',
        )
        .toBe(true);

      await vmDetailPage.navigateToVmiDisksTab(vmName, ns);

      const vmiRootdiskSize = await vmDetailPage.getVmiDiskColumnValue('rootdisk', 'size');
      expect.soft(vmiRootdiskSize, 'VMI rootdisk size column should have a value').not.toBeNull();
    });

    test('Hotplug disk shows Make persistent action', async ({
      k8sClient,
      vmTreePage,
      vmDetailPage,
      utils,
    }) => {
      const diskName = utils.generateRandomDiskName('hp-disk');

      await k8sClient.createBlankDataVolume(diskName, ns, '1Gi');
      k8sClient.trackResource('DataVolume', diskName, ns);
      await k8sClient.waitForDataVolumeSucceeded(diskName, ns);
      await k8sClient.hotplugVolumeToVm(vmName, ns, diskName, diskName);
      await k8sClient.waitForVmDiskPresent(vmName, ns, diskName);

      await vmTreePage.navigateToVmViaTreeView(ns, vmName);
      await vmDetailPage.navigateToConfigurationStorage();

      const diskVisible = await vmDetailPage.verifyDiskExists(diskName);
      expect.soft(diskVisible, 'Hotplugged disk should be visible').toBe(true);

      const hasPersistentLabel = await vmDetailPage.verifyDiskHasPersistentHotplugLabel(diskName);
      expect
        .soft(hasPersistentLabel, 'Disk should show Persistent Hotplug label (CNV-81278 fix)')
        .toBe(true);

      const isPersistent = await k8sClient.isVmDiskPersistent(vmName, ns, diskName);
      expect.soft(isPersistent, 'k8s API should confirm disk is persistent').toBe(true);
    });
  },
);
