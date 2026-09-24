import { T1, T1_TAG, VM_TABS_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/vm-tabs-fixture';

const SUITE = 'VM Disk Serial Number';

test.describe(
  'Tier1 VM Disk Serial — add blank disk with serial and edit it',
  { tag: [T1_TAG, '@nonpriv'] },
  () => {
    test('add blank disk with serial, verify in table, then edit serial', async ({
      apiClient,
      vmDetailPage,
      utils,
    }) => {
      await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG, VM_TABS_TAG] });
      test.setTimeout(utils.TestTimeouts.TEST_VM_CREATION);

      const ns = utils.generateTestNamespace('vm-disk-serial');
      await apiClient.createNamespace(ns);
      await apiClient.waitForNamespaceReady(ns);
      apiClient.trackResource('Namespace', ns);

      const vmName = utils.generateRandomVmName('vm-disk-serial');
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

      await vmDetailPage.navigateToVirtualMachineDetail(vmName, ns);
      await vmDetailPage.navigateToConfigurationStorage();

      const diskName = utils.generateRandomDiskName('serial');
      const serial = 'TEST-SERIAL-01';

      const added = await vmDetailPage.addBlankDiskWithSerial(diskName, serial, '1');
      expect.soft(added, `Blank disk ${diskName} with serial should be added`).toBe(true);

      const diskVisible = await vmDetailPage.verifyDiskNameExists(diskName);
      expect.soft(diskVisible, `Disk row for ${diskName} should be visible`).toBe(true);

      await expect
        .poll(() => vmDetailPage.getDiskSerialValue(diskName), {
          message: `Serial column should show ${serial}`,
          timeout: utils.TestTimeouts.INSTANCE_TYPE_VERIFICATION,
        })
        .toBe(serial);

      const updatedSerial = 'UPDATED-SN-02';
      const edited = await vmDetailPage.editDiskSerial(diskName, updatedSerial);
      expect.soft(edited, `Disk ${diskName} serial should be edited`).toBe(true);

      await expect
        .poll(() => vmDetailPage.getDiskSerialValue(diskName), {
          message: `Serial column should show ${updatedSerial}`,
          timeout: utils.TestTimeouts.INSTANCE_TYPE_VERIFICATION,
        })
        .toBe(updatedSerial);
    });
  },
);
