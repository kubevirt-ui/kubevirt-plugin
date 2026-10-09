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
  createVmWithEmptyDisk,
  getVmMultusNetworkName,
  setupTestNamespace,
} from '@/utils/test-setup-helpers';
import { ROUTE_VIRTUAL_MACHINES_DETAIL_NETWORK_TAG } from '@/data-models/route-tags';

const BROKEN_LINK_SUITE = 'VM NAD broken link';
const BROKEN_NIC_NAME = 'nic-nad-broken';
const MISSING_NAD_TOOLTIP = 'This network resource has been deleted or cannot be found.';

test.describe(
  BROKEN_LINK_SUITE,
  { tag: [ROUTE_VIRTUAL_MACHINES_DETAIL_NETWORK_TAG, T1_TAG, ADMIN_ONLY_TAG] },
  () => {
    test.beforeEach(async ({ utils }): Promise<void> => {
      await utils.withAllure({
        suite: BROKEN_LINK_SUITE,
        feature: T1,
        tags: [T1_TAG, VM_TABS_TAG, NETWORKING_TAG_LABEL, ADMIN_ONLY_TAG],
      });
    });

    test('shows a broken NAD link after the referenced NAD is deleted', async ({
      apiClient,
      vmListPage,
      vmDetailPage,
      utils,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_EXTENDED);

      const namespace = await setupTestNamespace(apiClient, 'nad-broken');
      const nadName = utils.generateRandomNadName('broken');
      const vmName = utils.generateRandomVmName('nad-broken');

      await test.step('Create NAD, running VM, and attach a bridge NIC', async () => {
        await createBridgeNetworkAttachmentDefinition(apiClient, nadName, namespace);
        await createVmWithEmptyDisk(apiClient, vmName, namespace);
        await utils.waitForVirtualMachineReady(
          apiClient,
          vmName,
          namespace,
          utils.TestTimeouts.VM_BOOTUP,
        );
        await attachBridgeNetworkInterface(apiClient, vmName, namespace, BROKEN_NIC_NAME, nadName);
      });

      await test.step('Configuration Network shows a clickable NAD link', async () => {
        await vmListPage.navigateToVmViaTreeView(namespace, vmName);
        await vmDetailPage.navigateToConfigurationNetwork();

        await expect
          .poll(async () => vmDetailPage.getConfigurationNetworkNicName(BROKEN_NIC_NAME), {
            message: `NIC ${BROKEN_NIC_NAME} should show NAD ${nadName} before deletion`,
            timeout: utils.TestTimeouts.ELEMENT_WAIT,
          })
          .toContain(nadName);

        expect(
          await vmDetailPage.isConfigurationNetworkNicResourceLinkVisible(BROKEN_NIC_NAME),
          'NAD should render as a resource link before deletion',
        ).toBe(true);
      });

      await test.step('Delete the NAD and show the disconnect state', async () => {
        await apiClient.deleteResourceByKind('NetworkAttachmentDefinition', nadName, namespace);

        await expect
          .poll(
            async () => {
              try {
                await vmDetailPage.waitForConfigurationNetworkNicBrokenLink(
                  BROKEN_NIC_NAME,
                  nadName,
                  utils.TestTimeouts.UI_DELAY_SHORT,
                );
                return true;
              } catch {
                return false;
              }
            },
            {
              message: `NIC ${BROKEN_NIC_NAME} should show a broken NAD link for ${nadName} after deletion`,
              timeout: utils.TestTimeouts.ELEMENT_WAIT,
            },
          )
          .toBe(true);

        expect(
          await vmDetailPage.isConfigurationNetworkNicResourceLinkVisible(BROKEN_NIC_NAME),
          'Deleted NAD should no longer render as a clickable link',
        ).toBe(false);
      });

      await test.step('Broken NAD link shows the missing-resource tooltip', async () => {
        const tooltipText =
          await vmDetailPage.getConfigurationNetworkNicBrokenLinkTooltip(BROKEN_NIC_NAME);
        expect(tooltipText, 'Broken NAD link tooltip should explain the missing resource').toBe(
          MISSING_NAD_TOOLTIP,
        );
      });
    });
  },
);

const NAD_SWAP_SUITE = 'VM NAD hot-swap';
const SWAP_NIC_NAME = 'nic-nad-swap';

test.describe(
  NAD_SWAP_SUITE,
  { tag: [ROUTE_VIRTUAL_MACHINES_DETAIL_NETWORK_TAG, T1_TAG, ADMIN_ONLY_TAG] },
  () => {
    test.beforeEach(async ({ utils }): Promise<void> => {
      await utils.withAllure({
        suite: NAD_SWAP_SUITE,
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

        await createVmWithEmptyDisk(apiClient, vmName, namespace);
        await utils.waitForVirtualMachineReady(
          apiClient,
          vmName,
          namespace,
          utils.TestTimeouts.VM_BOOTUP,
        );

        await attachBridgeNetworkInterface(apiClient, vmName, namespace, SWAP_NIC_NAME, sourceNad);
      });

      await test.step('Edit the NIC network to the second NAD', async () => {
        await vmTreePage.navigateToVmViaTreeView(namespace, vmName);
        await vmDetailPage.navigateToConfigurationNetwork();

        await expect
          .poll(async () => vmDetailPage.getConfigurationNetworkNicName(SWAP_NIC_NAME), {
            message: `NIC ${SWAP_NIC_NAME} should show source NAD ${sourceNad} before swap`,
            timeout: utils.TestTimeouts.ELEMENT_WAIT,
          })
          .toContain(sourceNad);

        await vmDetailPage.changeConfigurationNetworkNicNad(SWAP_NIC_NAME, targetNad);
      });

      await test.step('Pending changes alert and updated VM spec are visible', async () => {
        const pendingVisible = await vmDetailPage.waitForPendingChanges(
          utils.TestTimeouts.PENDING_CHANGES,
        );
        expect(
          pendingVisible,
          'Configuration Network should show a pending-changes or migration-required alert after NAD swap',
        ).toBe(true);

        // Network column shows the runtime NAD until migration applies the spec change.
        await expect
          .poll(async () => vmDetailPage.getConfigurationNetworkNicName(SWAP_NIC_NAME), {
            message: `NIC ${SWAP_NIC_NAME} should still show runtime NAD ${sourceNad} until migration`,
            timeout: utils.TestTimeouts.ELEMENT_WAIT,
          })
          .toContain(sourceNad);

        await expect
          .poll(
            async () => {
              const vm = await apiClient.getVirtualMachine(namespace, vmName);
              return getVmMultusNetworkName(vm, SWAP_NIC_NAME) ?? '';
            },
            {
              message: `VM spec for ${SWAP_NIC_NAME} should reference target NAD ${targetNad}`,
              timeout: utils.TestTimeouts.ELEMENT_WAIT,
            },
          )
          .toContain(targetNad);
      });
    });
  },
);
