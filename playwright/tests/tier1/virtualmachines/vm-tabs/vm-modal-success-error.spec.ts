import { T1, T1_TAG, VM_TABS_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/vm-tabs-fixture';

const SUITE = 'VM modal success and error';

test.describe.serial(
  'Tier1 VM modal success and error — stopped RHEL9',
  { tag: [T1_TAG, '@nonpriv'] },
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
      await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG, VM_TABS_TAG] });
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
      await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG, VM_TABS_TAG] });
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
