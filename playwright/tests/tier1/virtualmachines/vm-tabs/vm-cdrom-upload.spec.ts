import { T1, T1_TAG, VM_TABS_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/vm-tabs-fixture';

const SUITE = 'Tier1 VM CD-ROM upload';

test.describe('Tier1 VM CD-ROM upload — stopped RHEL9', { tag: [T1_TAG, '@nonpriv'] }, () => {
  test('Add CD-ROM with upload starts a background upload with a toast', async ({
    apiClient,
    vmTreePage,
    vmDetailPage,
    utils,
  }) => {
    await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG, VM_TABS_TAG] });
    test.setTimeout(utils.TestTimeouts.TEST_VM_CREATION);

    const ns = utils.generateTestNamespace('vm-cdrom-upload');
    await apiClient.createNamespace(ns);
    await apiClient.waitForNamespaceReady(ns);
    apiClient.trackResource('Namespace', ns);

    const vmName = utils.generateRandomVmName('vm-cdrom-upload');
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

    const isoFileName = 'vm-cdrom-upload-test.iso';
    // Non-empty fixture so the upload stays abortable long enough for toast assertions.
    const isoPath = utils.TestFileFactory.createSizedIsoFile(isoFileName);
    const diskName = utils.generateRandomDiskName('cdrom-upload');
    apiClient.trackResource('DataVolume', diskName, ns);

    await test.step('Add a CD-ROM with "Upload new ISO"', async () => {
      const added = await vmDetailPage.addCDROMDisk(diskName, 'Upload new ISO', isoPath);
      expect(added, `CD-ROM disk ${diskName} should be added from UI`).toBe(true);
    });

    await test.step('Uploading toast is visible after the modal closes', async () => {
      const state = await vmDetailPage.expectUploadingOrTerminalToastVisible(
        isoFileName,
        utils.TestTimeouts.UI_ELEMENT_VISIBILITY,
      );
      expect(
        state === 'uploading' || state === 'success',
        `Expected uploading or success toast, got ${state}`,
      ).toBe(true);
    });

    await test.step('Abort the upload to clean up when still in progress', async () => {
      const abortVisible = await vmDetailPage.isAbortUploadButtonVisible(
        utils.TestTimeouts.UI_DELAY_MEDIUM,
        isoFileName,
      );
      if (!abortVisible) {
        return;
      }
      await vmDetailPage.clickAbortUpload(isoFileName);
      await vmDetailPage.expectAbortedUploadToastVisible(
        isoFileName,
        utils.TestTimeouts.UI_ELEMENT_VISIBILITY,
      );
    });
  });

  test('Aborting an in-progress CD-ROM upload from the toast cancels it', async ({
    apiClient,
    vmTreePage,
    vmDetailPage,
    utils,
  }) => {
    await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG, VM_TABS_TAG] });
    test.setTimeout(utils.TestTimeouts.TEST_VM_CREATION);

    const ns = utils.generateTestNamespace('vm-cdrom-abort');
    await apiClient.createNamespace(ns);
    await apiClient.waitForNamespaceReady(ns);
    apiClient.trackResource('Namespace', ns);

    const vmName = utils.generateRandomVmName('vm-cdrom-abort');
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

    const isoFileName = 'vm-cdrom-abort-test.iso';
    const isoPath = utils.TestFileFactory.createSizedIsoFile(isoFileName);
    const diskName = utils.generateRandomDiskName('cdrom-abort');
    apiClient.trackResource('DataVolume', diskName, ns);

    await test.step('Start the CD-ROM upload', async () => {
      const added = await vmDetailPage.addCDROMDisk(diskName, 'Upload new ISO', isoPath);
      expect(added, `CD-ROM disk ${diskName} should be added from UI`).toBe(true);
      await vmDetailPage.expectUploadingToastVisible(
        isoFileName,
        utils.TestTimeouts.UI_ELEMENT_VISIBILITY,
      );
    });

    await test.step('Click "Cancel upload" in the toast', async () => {
      const abortVisible = await vmDetailPage.isAbortUploadButtonVisible(
        utils.TestTimeouts.UI_ELEMENT_VISIBILITY,
        isoFileName,
      );
      expect(abortVisible, 'Abort button should be visible while uploading').toBe(true);
      await vmDetailPage.clickAbortUpload(isoFileName);
    });

    await test.step('Aborted toast is shown', async () => {
      await vmDetailPage.expectAbortedUploadToastVisible(
        isoFileName,
        utils.TestTimeouts.UI_ELEMENT_VISIBILITY,
      );

      const dvGone = await apiClient.waitForDataVolumeGone(
        diskName,
        ns,
        utils.TestTimeouts.ELEMENT_WAIT,
      );
      expect(dvGone, 'DataVolume should be deleted after abort').toBe(true);
    });
  });
});
