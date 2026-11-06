import { GATING_TAG, NON_PRIV_TAG, T1_TAG, T2_TAG } from '@/data-models/allure-constants';
import { ROUTE_VIRTUAL_MACHINES_DETAIL_NETWORK_ROUTE_TAGS } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/vm-detail-fixture';
import { CRUD_NAMES } from '@/utils/constants';
import {
  generateMultusNicTestResources,
  provisionMigratableVmWithNad,
  teardownMigratableVmWithNad,
} from '@/utils/network-test-data';
import { isOpenShiftMajorMinor } from '@/utils/openshift-version';

/**
 * Configuration → Network React-crashes under OC/console skew (HC OCP 4.18 +
 * origin-console:4.18 with a release-4.13 plugin: "Oh no! Something went wrong.").
 * Run only when live ClusterVersion major.minor is 4.13 (matching downstream).
 */
const skipNetworkUiUnlessOcp413 = () => {
  test.skip(
    !isOpenShiftMajorMinor('4.13'),
    'VM Network/Configuration UI requires matching OCP 4.13 (skipped under OC/console skew)',
  );
};

test.describe(`VM network interfaces read ${ROUTE_VIRTUAL_MACHINES_DETAIL_NETWORK_ROUTE_TAGS} ${GATING_TAG}`, () => {
  test.beforeEach(skipNetworkUiUnlessOcp413);

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
  test.beforeEach(skipNetworkUiUnlessOcp413);

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
  test.beforeEach(skipNetworkUiUnlessOcp413);

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
