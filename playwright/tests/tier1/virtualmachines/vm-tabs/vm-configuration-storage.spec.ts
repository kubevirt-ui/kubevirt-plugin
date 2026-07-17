import { T1, T1_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/vm-tabs-fixture';

const SUITE = 'VM disks tab';

test.describe.serial(
  'VM Storage — shared running Fedora VM',
  { tag: [T1_TAG, '@tier1-storage', '@nonpriv'] },
  () => {
    let ns: string;
    let vmName: string;

    test.beforeAll(async ({ apiClient, utils, testConfig }) => {
      if (utils.EnvVariables.isNonPrivUser) {
        ns = testConfig.testNamespace;
      } else {
        ns = utils.generateTestNamespace('vm-storage-shared');
        await apiClient.createNamespace(ns);
        await apiClient.waitForNamespaceReady(ns);
        apiClient.trackResource('Namespace', ns);
      }

      vmName = utils.generateRandomVmName('vm-storage');
      await apiClient.createVmFromInstanceType('fedora', vmName, ns, undefined, undefined, true);
      apiClient.trackResource('VirtualMachine', vmName, ns);

      const created = await apiClient.verifyVmCreated(vmName, ns, utils.TestTimeouts.VM_CREATION);
      if (!created.exists) throw new Error(`VM ${vmName} was not created`);

      const running = await apiClient.waitForVmRunning(vmName, ns, utils.TestTimeouts.VM_BOOTUP);
      if (!running) throw new Error(`VM ${vmName} did not reach Running state`);
    });

    test.beforeEach(async ({ utils }) => {
      await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG] });
    });

    test('Disk driver/bus is reflected in UI for running VM', async ({
      apiClient,
      vmTreePage,
      vmDetailPage,
    }) => {
      const vmiBus = await apiClient.getVmiDiskBus(vmName, ns, 'rootdisk');
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

      // TODO: replace with UI navigation
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
      apiClient,
      vmTreePage,
      vmDetailPage,
      utils,
    }) => {
      const dvDiskName = utils.generateRandomDiskName('dv-disk');

      await apiClient.createBlankDataVolume(dvDiskName, ns, '1Gi');
      apiClient.trackResource('DataVolume', dvDiskName, ns);
      await apiClient.waitForDataVolumeSucceeded(dvDiskName, ns);
      await apiClient.hotplugVolumeToVm(vmName, ns, dvDiskName, dvDiskName);
      await apiClient.waitForVmDiskPresent(vmName, ns, dvDiskName);

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

      // TODO: replace with UI navigation
      await vmDetailPage.navigateToVmiDisksTab(vmName, ns);

      const vmiRootdiskSize = await vmDetailPage.getVmiDiskColumnValue('rootdisk', 'size');
      expect.soft(vmiRootdiskSize, 'VMI rootdisk size column should have a value').not.toBeNull();
    });

    test('Hotplug disk shows Make persistent action', async ({
      apiClient,
      vmTreePage,
      vmDetailPage,
      utils,
    }) => {
      const diskName = utils.generateRandomDiskName('hp-disk');

      await apiClient.createBlankDataVolume(diskName, ns, '1Gi');
      apiClient.trackResource('DataVolume', diskName, ns);
      await apiClient.waitForDataVolumeSucceeded(diskName, ns);
      await apiClient.hotplugVolumeToVm(vmName, ns, diskName, diskName);
      await apiClient.waitForVmDiskPresent(vmName, ns, diskName);

      await vmTreePage.navigateToVmViaTreeView(ns, vmName);
      await vmDetailPage.navigateToConfigurationStorage();

      const diskVisible = await vmDetailPage.verifyDiskExists(diskName);
      expect(diskVisible, 'Hotplugged disk should be visible on Configuration > Storage').toBe(
        true,
      );
    });
  },
);
