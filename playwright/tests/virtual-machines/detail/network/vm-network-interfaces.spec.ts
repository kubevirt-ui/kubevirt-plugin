import { GATING_TAG, NON_PRIV_TAG, T1_TAG, T2_TAG } from '@/data-models/allure-constants';
import { ROUTE_VIRTUAL_MACHINES_DETAIL_NETWORK_ROUTE_TAGS } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/vm-detail-fixture';
import { CRUD_NAMES } from '@/utils/constants';
import {
  generateMultusNicTestResources,
  provisionMigratableVmWithNad,
  teardownMigratableVmWithNad,
} from '@/utils/network-test-data';

test.describe(`VM network interfaces read ${ROUTE_VIRTUAL_MACHINES_DETAIL_NETWORK_ROUTE_TAGS} ${GATING_TAG}`, () => {
  test('Network interfaces tab lists pod NIC and add action', async ({
    vmDetailPage: vmDetail,
    vmNetworkInterfacesPage: networks,
    testNamespace,
    apiClient,
  }) => {
    const name = CRUD_NAMES.vmExample;

    await apiClient.deleteVirtualMachine(name, testNamespace);
    await apiClient.applyVirtualMachineExample(testNamespace, name);

    try {
      await vmDetail.openVm(testNamespace, name);
      await vmDetail.openNetworkInterfacesTab(networks);
      await expect(networks.addNetworkInterfaceButton()).toBeVisible();
      await expect(networks.nicNameCell('default')).toBeVisible();
      await expect(networks.podNetworkingCell()).toBeVisible();
    } finally {
      await apiClient.deleteVirtualMachine(name, testNamespace);
    }
  });
});

test.describe(`VM network interfaces Multus CRUD ${ROUTE_VIRTUAL_MACHINES_DETAIL_NETWORK_ROUTE_TAGS} ${T1_TAG} ${NON_PRIV_TAG}`, () => {
  test('Add a network interface and delete the created NIC', async ({
    vmDetailPage: vmDetail,
    vmNetworkInterfacesPage: networks,
    testNamespace,
    apiClient,
  }) => {
    const name = CRUD_NAMES.vmExample;
    const { nadName, secondaryNicName } = generateMultusNicTestResources();

    await provisionMigratableVmWithNad(apiClient, testNamespace, name, nadName);

    try {
      await vmDetail.openVm(testNamespace, name);
      await vmDetail.openNetworkInterfacesTab(networks);
      await networks.addAndDeleteNetworkInterface(secondaryNicName, nadName);
    } finally {
      await teardownMigratableVmWithNad(apiClient, testNamespace, name, nadName);
    }
  });
});

test.describe(`VM network interfaces Multus ${ROUTE_VIRTUAL_MACHINES_DETAIL_NETWORK_ROUTE_TAGS} ${T2_TAG}`, () => {
  test('Add a network interface and delete the created NIC', async ({
    vmDetailPage: vmDetail,
    vmNetworkInterfacesPage: networks,
    testNamespace,
    apiClient,
  }) => {
    const name = CRUD_NAMES.vmExample;
    const { nadName, secondaryNicName } = generateMultusNicTestResources();

    await provisionMigratableVmWithNad(apiClient, testNamespace, name, nadName);

    try {
      await vmDetail.openVm(testNamespace, name);
      await vmDetail.openNetworkInterfacesTab(networks);
      await networks.addAndDeleteNetworkInterface(secondaryNicName, nadName);
    } finally {
      await teardownMigratableVmWithNad(apiClient, testNamespace, name, nadName);
    }
  });
});
