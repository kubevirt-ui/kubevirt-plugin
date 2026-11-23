import { DISK_NAMES } from '@/data-models';
import { T1, T1_TAG, VM_TABS_TAG } from '@/data-models/allure-constants';
import { ROUTE_VIRTUAL_MACHINES_DETAIL_DISKS_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/vm-tabs-fixture';
import { createVmWithEmptyDisk, setupTestNamespace } from '@/utils/test-setup-helpers';

const SUITE = 'Tier1 VM Use as ISO';

test.describe(
  'Tier1 VM Use as ISO — Configuration Storage',
  { tag: [ROUTE_VIRTUAL_MACHINES_DETAIL_DISKS_TAG, T1_TAG, '@nonpriv'] },
  () => {
    test('Stopped RHEL9: Use as ISO on extra disk converts it to CD-ROM without blank size', async ({
      apiClient,
      vmListPage,
      vmDetailPage,
      utils,
    }) => {
      await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG, VM_TABS_TAG] });
      test.setTimeout(utils.TestTimeouts.TEST_VM_CREATION);

      const ns = utils.generateTestNamespace('vm-use-as-iso');
      await apiClient.createNamespace(ns);
      await apiClient.waitForNamespaceReady(ns);
      apiClient.trackResource('Namespace', ns);

      const vmName = utils.generateRandomVmName('vm-use-as-iso');
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

      const diskName = utils.generateRandomDiskName('iso-media');
      await test.step('Attach a blank disk to convert', async () => {
        await apiClient.createBlankDataVolume(diskName, ns, '1Gi');
        apiClient.trackResource('DataVolume', diskName, ns);

        await expect
          .poll(async () => Boolean(await apiClient.getDataVolume(ns, diskName)), {
            message: `DataVolume '${diskName}' should exist before attaching`,
            timeout: utils.TestTimeouts.VM_BOOTUP,
          })
          .toBe(true);

        await apiClient.attachDataVolumeToVm(vmName, ns, diskName, diskName);
        const attached = await apiClient.waitForVmDiskPresent(vmName, ns, diskName);
        expect(attached, `Blank disk ${diskName} should be attached`).toBe(true);
      });

      await vmListPage.navigateToVmViaTreeView(ns, vmName);
      await vmDetailPage.navigateToConfigurationStorage();

      await test.step('Use as ISO converts the disk to CD-ROM without system disk size', async () => {
        const converted = await vmDetailPage.useDiskAsIso(diskName, {
          expectSystemDiskSize: false,
        });
        expect(converted, `Use as ISO should succeed for ${diskName}`).toBe(true);

        await vmDetailPage.navigateToConfigurationStorage();
        const drive = await vmDetailPage.getDiskDriveValue(diskName);
        expect(drive, `Disk ${diskName} should show CD-ROM drive type`).toBe('CD-ROM');

        const rootVisible = await vmDetailPage.verifyDiskNameExists(DISK_NAMES.ROOT);
        expect(rootVisible, 'Existing rootdisk should remain after converting another disk').toBe(
          true,
        );
      });

      await test.step('Use as ISO is hidden for the converted CD-ROM row', async () => {
        const visible = await vmDetailPage.isUseAsIsoActionVisible(diskName);
        expect(visible, 'Use as ISO should not appear on CD-ROM disks').toBe(false);
      });
    });

    test('Empty-disk VM: Use as ISO shows system disk size and adds a blank install disk', async ({
      apiClient,
      vmListPage,
      vmDetailPage,
      utils,
    }) => {
      await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG, VM_TABS_TAG] });
      test.setTimeout(utils.TestTimeouts.TEST_VM_CREATION);

      const namespace = await setupTestNamespace(apiClient, 'use-as-iso-blank');
      const vmName = utils.generateRandomVmName('use-as-iso-blank');
      await createVmWithEmptyDisk(apiClient, vmName, namespace, false);

      await vmListPage.navigateToVmViaTreeView(namespace, vmName);
      await vmDetailPage.navigateToConfigurationStorage();

      await test.step('Convert emptydisk to ISO and require blank system disk', async () => {
        const converted = await vmDetailPage.useDiskAsIso(DISK_NAMES.EMPTY, {
          expectSystemDiskSize: true,
        });
        expect(converted, 'Use as ISO should show system disk size and succeed').toBe(true);

        await vmDetailPage.navigateToConfigurationStorage();
        const drive = await vmDetailPage.getDiskDriveValue(DISK_NAMES.EMPTY);
        expect(drive, 'emptydisk should become CD-ROM').toBe('CD-ROM');

        const blankVisible = await vmDetailPage.verifyDiskNameExists(DISK_NAMES.ROOT);
        expect(blankVisible, 'Blank rootdisk install target should be added').toBe(true);
      });

      await test.step('Boot orders: blank disk 1, ISO CD-ROM 2', async () => {
        const vm = (await apiClient.getVirtualMachine(namespace, vmName)) as {
          spec?: {
            template?: {
              spec?: {
                domain?: {
                  devices?: { disks?: Array<{ bootOrder?: number; name?: string }> };
                };
              };
            };
          };
        };
        const disks = vm.spec?.template?.spec?.domain?.devices?.disks ?? [];
        const blank = disks.find((d) => d.name === DISK_NAMES.ROOT);
        const iso = disks.find((d) => d.name === DISK_NAMES.EMPTY);
        expect(blank?.bootOrder, 'Blank install disk should have bootOrder 1').toBe(1);
        expect(iso?.bootOrder, 'ISO CD-ROM should have bootOrder 2').toBe(2);
      });
    });

    test('Running VM: Use as ISO is disabled on disk kebab', async ({
      apiClient,
      vmListPage,
      vmDetailPage,
      utils,
    }) => {
      await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG, VM_TABS_TAG] });
      test.setTimeout(utils.TestTimeouts.TEST_VM_CREATION);

      const ns = utils.generateTestNamespace('vm-use-as-iso-run');
      await apiClient.createNamespace(ns);
      await apiClient.waitForNamespaceReady(ns);
      apiClient.trackResource('Namespace', ns);

      const vmName = utils.generateRandomVmName('vm-use-as-iso-run');
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

      await apiClient.startVm(ns, vmName);
      await apiClient.waitForVmRunning(vmName, ns, utils.TestTimeouts.VM_BOOTUP);

      await vmListPage.navigateToVmViaTreeView(ns, vmName);
      await vmDetailPage.navigateToConfigurationStorage();

      await test.step('Use as ISO is disabled while the VM is running', async () => {
        await expect
          .poll(() => vmDetailPage.isUseAsIsoActionDisabled(DISK_NAMES.ROOT), {
            message: 'Use as ISO should be disabled on a running VM',
            timeout: utils.TestTimeouts.UI_ELEMENT_VISIBILITY,
          })
          .toBe(true);
      });
    });
  },
);
