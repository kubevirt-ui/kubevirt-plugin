import type { KubernetesResource } from '@/data-models/kubernetes-types';
import { T1, T1_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/vm-actions-fixture';
import { TestTimeouts } from '@/utils/test-config';

const SUITE = 'VM Single Delete';

type ListedDeleteResource = { kind: string; name: string };

const getVmDataVolumeNames = (vm: KubernetesResource): string[] => {
  const spec = vm.spec as Record<string, unknown> | undefined;
  const templateSpec =
    ((spec?.template as Record<string, unknown>)?.spec as Record<string, unknown>) ?? {};
  const volumes = (templateSpec.volumes as Array<Record<string, unknown>>) ?? [];

  return volumes
    .filter((volume) => Boolean(volume.dataVolume))
    .map((volume) => (volume.dataVolume as { name: string }).name);
};

const sortListedResources = (resources: ListedDeleteResource[]): ListedDeleteResource[] =>
  [...resources].sort((left, right) =>
    `${left.kind}/${left.name}`.localeCompare(`${right.kind}/${right.name}`),
  );

test.describe('Tier1 VM Single Delete', { tag: [T1_TAG, '@tier1-vm-actions'] }, () => {
  test(
    'Delete a single VM via list kebab action removes it from the list and cluster',
    { tag: ['@nonpriv', '@CNV-97104'] },
    async ({ vmListPage, apiClient, utils }) => {
      await utils.withAllure({
        suite: SUITE,
        feature: T1,
        tags: [T1_TAG, '@tier1-vm-actions', '@CNV-97104'],
      });
      test.setTimeout(utils.TestTimeouts.TEST_VM_CREATION);

      const ns = utils.generateTestNamespace('del');
      await apiClient.createNamespace(ns);
      await apiClient.waitForNamespaceReady(ns);
      apiClient.trackResource('Namespace', ns);

      const vmName = utils.generateRandomVmName('del');
      await apiClient.createVmFromTemplate(
        utils.TEMPLATE_METADATA_NAMES.RHEL9,
        vmName,
        ns,
        'openshift',
        false,
      );
      apiClient.trackResource('VirtualMachine', vmName, ns);

      await apiClient.waitForVmExists(vmName, ns);

      const pvcName = utils.generateRandomDiskName('precreated');
      await apiClient.createResource(
        '',
        'v1',
        'persistentvolumeclaims',
        {
          apiVersion: 'v1',
          kind: 'PersistentVolumeClaim',
          metadata: { name: pvcName, namespace: ns },
          spec: {
            accessModes: ['ReadWriteOnce'],
            resources: { requests: { storage: '1Gi' } },
          },
        },
        ns,
      );
      apiClient.trackResource('PersistentVolumeClaim', pvcName, ns);

      const pvc = await apiClient.waitForPersistentVolumeClaim(
        pvcName,
        ns,
        utils.TestTimeouts.RESOURCE_CREATION,
      );
      expect(pvc, `PVC '${pvcName}' should exist before attaching to VM`).toBeTruthy();

      await apiClient.hotplugVolumeToVm(vmName, ns, pvcName, pvcName);
      const diskPresent = await apiClient.waitForVmDiskPresent(vmName, ns, pvcName);
      expect(diskPresent, `Disk '${pvcName}' should be attached to VM`).toBe(true);

      const vm = await apiClient.getResourceByKind('virtualmachine', vmName, ns);
      expect(vm, 'VM should exist for volume inspection').toBeTruthy();
      const dataVolumeNames = getVmDataVolumeNames(vm as KubernetesResource);
      expect(
        dataVolumeNames.length,
        'VM should have at least one DataVolume-backed disk',
      ).toBeGreaterThan(0);

      const snapshotName = utils.generateRandomSnapshotName('del-snap');
      const snapshot = await apiClient.createVmSnapshot(snapshotName, vmName, ns);
      expect(snapshot, `Snapshot '${snapshotName}' should be created`).toBeTruthy();
      apiClient.trackResource('VirtualMachineSnapshot', snapshotName, ns);

      const snapshotReady = await apiClient.waitForSnapshotReady(
        snapshotName,
        ns,
        utils.TestTimeouts.TEST_VM_CREATION,
      );
      expect(snapshotReady, `Snapshot '${snapshotName}' should become ready`).toBe(true);

      const expectedListedResources: ListedDeleteResource[] = [
        ...dataVolumeNames.map((name) => ({ kind: 'DataVolume', name })),
        { kind: 'VirtualMachineSnapshot', name: snapshotName },
      ];

      await test.step('Navigate to VM list via UI and locate the VM', async () => {
        await vmListPage.navigateToVirtualMachinesViaUI();
        await vmListPage.toggleEmptyProjectsDisplay(true);
        await vmListPage.searchTreeView(ns);
        await vmListPage.clickProjectNode(ns);
        await vmListPage.clickVmListTab();
        await vmListPage.waitForVmRowVisible(vmName);
      });

      await test.step('Verify delete modal lists VM DataVolumes and snapshot only', async () => {
        await vmListPage.clickVmRowAction(vmName, 'delete');
        await vmListPage.waitForDeleteModalLoaded();

        const listedResources = await vmListPage.getDeleteModalListedResources();
        expect(
          sortListedResources(listedResources),
          'Delete modal should list VM DataVolumes and snapshots only',
        ).toEqual(sortListedResources(expectedListedResources));

        await vmListPage.clickDeleteConfirmationButton();
      });

      await test.step('Verify VM is removed from the list', async () => {
        await vmListPage.waitForVmRowDetached(vmName, TestTimeouts.VM_CREATION);
        const stillVisible = await vmListPage.isVmVisibleByDataTest(
          vmName,
          TestTimeouts.UI_DELAY_SHORT,
        );
        expect.soft(stillVisible, 'VM row should be gone after single delete').toBe(false);
      });

      await test.step('Verify VM no longer exists in the cluster', async () => {
        const exists = await apiClient
          .waitForVmExists(vmName, ns, TestTimeouts.SHORT_WAIT)
          .catch(() => false);
        expect.soft(exists, 'VM should no longer exist in the cluster').toBeFalsy();
      });
    },
  );
});
