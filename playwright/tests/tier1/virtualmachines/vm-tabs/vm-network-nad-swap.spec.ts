import {
  ADMIN_ONLY_TAG,
  NETWORKING_TAG_LABEL,
  T1,
  T1_TAG,
  VM_TABS_TAG,
} from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/vm-tabs-fixture';
import {
  attachBridgeNetworkInterface,
  createBridgeNetworkAttachmentDefinition,
  getVmMultusNetworkName,
  setupTestNamespace,
} from '@/utils/test-setup-helpers';

const SUITE = 'VM NAD hot-swap';
const NIC_NAME = 'nic-nad-swap';

test.describe(SUITE, { tag: [T1_TAG, ADMIN_ONLY_TAG] }, () => {
  test.beforeEach(async ({ utils }) => {
    await utils.withAllure({
      suite: SUITE,
      feature: T1,
      tags: [T1_TAG, VM_TABS_TAG, NETWORKING_TAG_LABEL, ADMIN_ONLY_TAG],
    });
  });

  test('swaps a running VM NIC NAD and shows pending changes', async ({
    apiClient,
    vmTreePage,
    vmDetailPage,
    utils,
  }) => {
    test.setTimeout(utils.TestTimeouts.TEST_PENDING_CHANGES);

    const namespace = await setupTestNamespace(apiClient, 'nad-swap');
    const sourceNad = utils.generateRandomNadName('src');
    const targetNad = utils.generateRandomNadName('dst');
    const vmName = utils.generateRandomVmName('nad-swap');

    await test.step('Create NADs and a running VM', async () => {
      await createBridgeNetworkAttachmentDefinition(apiClient, sourceNad, namespace);
      await createBridgeNetworkAttachmentDefinition(apiClient, targetNad, namespace);

      await apiClient.createVmFromTemplate(
        utils.TEMPLATE_METADATA_NAMES.RHEL9,
        vmName,
        namespace,
        'openshift',
        false,
      );
      apiClient.trackResource('VirtualMachine', vmName, namespace);

      const created = await apiClient.verifyVmCreated(
        vmName,
        namespace,
        utils.TestTimeouts.VM_BOOTUP,
      );
      expect(created.exists, 'VM should exist before start').toBe(true);

      await apiClient.startVm(namespace, vmName);
      await utils.waitForVirtualMachineReady(
        apiClient,
        vmName,
        namespace,
        utils.TestTimeouts.VM_BOOTUP,
      );

      await attachBridgeNetworkInterface(apiClient, vmName, namespace, NIC_NAME, sourceNad);
    });

    await test.step('Edit the NIC network to the second NAD', async () => {
      await vmTreePage.navigateToVmViaTreeView(namespace, vmName);
      await vmDetailPage.navigateToConfigurationNetwork();

      await expect
        .poll(async () => vmDetailPage.getConfigurationNetworkNicName(NIC_NAME), {
          message: `NIC ${NIC_NAME} should show source NAD ${sourceNad} before swap`,
          timeout: utils.TestTimeouts.ELEMENT_WAIT,
        })
        .toContain(sourceNad);

      await vmDetailPage.changeConfigurationNetworkNicNad(NIC_NAME, targetNad);
    });

    await test.step('Pending changes alert and new NAD are visible', async () => {
      await expect
        .poll(async () => vmDetailPage.getConfigurationNetworkNicName(NIC_NAME), {
          message: `NIC ${NIC_NAME} should show target NAD ${targetNad} after swap`,
          timeout: utils.TestTimeouts.ELEMENT_WAIT,
        })
        .toContain(targetNad);

      const pendingVisible = await vmDetailPage.waitForPendingChanges(
        utils.TestTimeouts.PENDING_CHANGES,
      );
      expect(
        pendingVisible,
        'Configuration Network should show a pending-changes or migration-required alert after NAD swap',
      ).toBe(true);

      await expect
        .poll(
          async () => {
            const vm = await apiClient.getVirtualMachine(namespace, vmName);
            return getVmMultusNetworkName(vm, NIC_NAME) ?? '';
          },
          {
            message: `VM spec for ${NIC_NAME} should reference target NAD ${targetNad}`,
            timeout: utils.TestTimeouts.ELEMENT_WAIT,
          },
        )
        .toContain(targetNad);
    });
  });
});
