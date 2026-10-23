import type RequestContextClient from '@/clients/request-context-client';
import { ADMIN_ONLY_TAG, NON_PRIV_TAG, T1_TAG, T2_TAG } from '@/data-models/allure-constants';
import { ROUTE_VIRTUAL_MACHINES_DETAIL_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/vm-detail-fixture';
import { CRUD_NAMES, VmTabTestId } from '@/utils/constants';
import {
  generateNameWithBase,
  generateRandomLabel,
  generateRandomSnapshotName,
} from '@/utils/random-data-generator';
import { TestTimeouts } from '@/utils/test-config';

const CONTAINER_DISK_IMAGE = 'quay.io/kubevirt/cirros-container-disk-demo';

async function withExampleVm(
  apiClient: RequestContextClient,
  testNamespace: string,
  run: (name: string) => Promise<void>,
): Promise<void> {
  const name = CRUD_NAMES.vmExample;
  await apiClient.deleteVirtualMachine(name, testNamespace);
  await apiClient.applyVirtualMachineExample(testNamespace, name);
  try {
    await run(name);
  } finally {
    await apiClient.deleteVirtualMachine(name, testNamespace);
  }
}

function registerVmDetailTabCrudTier1(userTag: string): void {
  test.describe(`VM detail tab CRUD ${ROUTE_VIRTUAL_MACHINES_DETAIL_TAG} ${T1_TAG} ${userTag}`, () => {
    test('Metadata tab updates VM labels', async ({
      apiClient,
      testNamespace,
      vmDetailPage: vmDetail,
      vmDetailTabsPage: tabs,
    }) => {
      const label = generateRandomLabel('tab-meta');
      await withExampleVm(apiClient, testNamespace, async (name) => {
        await vmDetail.openVm(testNamespace, name);
        await vmDetail.goToTab(VmTabTestId.Details);
        await vmDetail.editLabels(name, label);
        await expect(vmDetail.metadataLabelValue(label)).toBeVisible({
          timeout: TestTimeouts.ELEMENT_WAIT,
        });
      });
    });

    test('Disks tab opens Add disk modal', async ({
      apiClient,
      testNamespace,
      vmDetailPage: vmDetail,
      vmDetailTabsPage: tabs,
    }) => {
      await withExampleVm(apiClient, testNamespace, async (name) => {
        await vmDetail.openVm(testNamespace, name);
        await tabs.openDisksTab(vmDetail);
        await tabs.openAddDiskModal();
        await expect(tabs.addDiskModalHeading()).toBeVisible();
        await tabs.cancelAddDiskModal();
      });
    });

    test('Snapshots tab creates and deletes a snapshot', async ({
      apiClient,
      testNamespace,
      vmDetailPage: vmDetail,
      vmDetailTabsPage: tabs,
    }) => {
      const snapshotName = generateRandomSnapshotName('pw-snap');
      await withExampleVm(apiClient, testNamespace, async (name) => {
        await vmDetail.openVm(testNamespace, name);
        await tabs.openSnapshotsTab(vmDetail);
        const created = await tabs.createSnapshot(snapshotName);
        test.skip(!created, 'Cluster storage does not support VM snapshots for this VM');
        await expect
          .poll(() => apiClient.virtualMachineSnapshotExists(snapshotName, testNamespace), {
            message: `Snapshot ${testNamespace}/${snapshotName} should exist`,
            timeout: TestTimeouts.LONG_OPERATION,
          })
          .toBe(true);
        await apiClient.deleteVirtualMachineSnapshot(snapshotName, testNamespace);
        await expect
          .poll(() => apiClient.virtualMachineSnapshotExists(snapshotName, testNamespace), {
            message: `Snapshot ${testNamespace}/${snapshotName} should be deleted`,
            timeout: TestTimeouts.LONG_OPERATION,
          })
          .toBe(false);
      });
    });
  });
}

function registerVmDetailTabCrudTier2(userTag: string): void {
  test.describe(`VM detail tab CRUD ${ROUTE_VIRTUAL_MACHINES_DETAIL_TAG} ${T2_TAG} ${userTag}`, () => {
    test('Disks tab adds container disk and detaches it', async ({
      apiClient,
      testNamespace,
      vmDetailPage: vmDetail,
      vmDetailTabsPage: tabs,
    }) => {
      const diskName = generateNameWithBase('pw-ephemeral', 20);

      await withExampleVm(apiClient, testNamespace, async (vmName) => {
        await vmDetail.openVm(testNamespace, vmName);
        await tabs.openDisksTab(vmDetail);
        await expect(tabs.rootDiskRow()).toBeVisible({
          timeout: TestTimeouts.ELEMENT_WAIT,
        });
        await tabs.addContainerEphemeralDisk(diskName, CONTAINER_DISK_IMAGE);
        await expect(tabs.diskRow(diskName)).toBeVisible({
          timeout: TestTimeouts.LONG_OPERATION,
        });
        await tabs.detachDisk(diskName);
        await expect(tabs.diskRow(diskName)).toBeHidden({
          timeout: TestTimeouts.LONG_OPERATION,
        });
      });
    });

    test('Scripts tab updates cloud-init user', async ({
      apiClient,
      testNamespace,
      vmDetailPage: vmDetail,
      vmDetailTabsPage: tabs,
    }) => {
      const user = generateNameWithBase('pw-ci-user', 20);
      await withExampleVm(apiClient, testNamespace, async (name) => {
        await vmDetail.openVm(testNamespace, name);
        await tabs.openScriptsTab(vmDetail);
        await tabs.updateCloudInitUser(user);
        await expect
          .poll(() => vmDetail.cloudInitUserDataFromCluster(apiClient, testNamespace, name), {
            message: 'VM cloud-init userData should include the updated username',
            timeout: TestTimeouts.LONG_OPERATION,
          })
          .toContain(user);
      });
    });

    test('Scheduling tab opens and saves node selector modal', async ({
      apiClient,
      testNamespace,
      vmDetailPage: vmDetail,
      vmDetailTabsPage: tabs,
    }) => {
      await withExampleVm(apiClient, testNamespace, async (name) => {
        await vmDetail.openVm(testNamespace, name);
        await tabs.openSchedulingTab(vmDetail);
        await tabs.openNodeSelectorModal();
        await tabs.saveNodeSelectorModal();
        await expect(tabs.schedulingRequirementsHeading()).toBeVisible();
      });
    });

    test('Environment tab adds and removes ConfigMap reference', async ({
      apiClient,
      testNamespace,
      vmDetailPage: vmDetail,
      vmDetailTabsPage: tabs,
    }) => {
      const cmName = generateNameWithBase(`${CRUD_NAMES.dataSourceExample}-env`, 50);
      await apiClient.deleteConfigMap(cmName, testNamespace);
      await apiClient.applyConfigMapExample(testNamespace, cmName);

      await withExampleVm(apiClient, testNamespace, async (name) => {
        try {
          await vmDetail.openVm(testNamespace, name);
          await tabs.openEnvironmentTab(vmDetail);
          await tabs.addEnvironmentConfigMap(cmName);
          await expect(tabs.environmentConfigMapReference(cmName)).toBeVisible({
            timeout: TestTimeouts.ELEMENT_WAIT,
          });
        } finally {
          await apiClient.deleteConfigMap(cmName, testNamespace);
        }
      });
    });

    test('Read-only detail tabs show expected content', async ({
      apiClient,
      testNamespace,
      vmDetailPage: vmDetail,
    }) => {
      await withExampleVm(apiClient, testNamespace, async (name) => {
        await vmDetail.openVm(testNamespace, name);
        await vmDetail.goToTab(VmTabTestId.Details);
        await expect(vmDetail.virtualMachineDetailsHeading()).toBeVisible();
        await vmDetail.goToTab(VmTabTestId.YAML);
        await expect(vmDetail.yamlDownloadAction()).toBeVisible();
        await vmDetail.goToTab(VmTabTestId.Events);
        await expect(vmDetail.eventsTabContent()).toBeVisible();
        await vmDetail.goToTab(VmTabTestId.Console);
        await expect(vmDetail.consoleTabContent()).toBeVisible();
        await vmDetail.goToTab(VmTabTestId.Diagnostics);
        await expect(vmDetail.diagnosticsTabContent()).toBeVisible();
      });
    });
  });
}

registerVmDetailTabCrudTier1(ADMIN_ONLY_TAG);
registerVmDetailTabCrudTier1(NON_PRIV_TAG);
registerVmDetailTabCrudTier2(ADMIN_ONLY_TAG);
registerVmDetailTabCrudTier2(NON_PRIV_TAG);
