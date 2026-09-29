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
  setupTestNamespace,
} from '@/utils/test-setup-helpers';

const SUITE = 'VM NAD broken link';
const NIC_NAME = 'nic-nad-broken';
const MISSING_NAD_TOOLTIP = 'This network resource has been deleted or cannot be found.';

test.describe(SUITE, { tag: [T1_TAG, ADMIN_ONLY_TAG] }, () => {
  test.beforeEach(async ({ utils }): Promise<void> => {
    await utils.withAllure({
      suite: SUITE,
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
      await attachBridgeNetworkInterface(apiClient, vmName, namespace, NIC_NAME, nadName);
    });

    await test.step('Configuration Network shows a clickable NAD link', async () => {
      await vmListPage.navigateToVmViaTreeView(namespace, vmName);
      await vmDetailPage.navigateToConfigurationNetwork();

      await expect
        .poll(async () => vmDetailPage.getConfigurationNetworkNicName(NIC_NAME), {
          message: `NIC ${NIC_NAME} should show NAD ${nadName} before deletion`,
          timeout: utils.TestTimeouts.ELEMENT_WAIT,
        })
        .toContain(nadName);

      expect(
        await vmDetailPage.isConfigurationNetworkNicResourceLinkVisible(NIC_NAME),
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
                NIC_NAME,
                nadName,
                utils.TestTimeouts.UI_DELAY_SHORT,
              );
              return true;
            } catch {
              return false;
            }
          },
          {
            message: `NIC ${NIC_NAME} should show a broken NAD link for ${nadName} after deletion`,
            timeout: utils.TestTimeouts.ELEMENT_WAIT,
          },
        )
        .toBe(true);

      expect(
        await vmDetailPage.isConfigurationNetworkNicResourceLinkVisible(NIC_NAME),
        'Deleted NAD should no longer render as a clickable link',
      ).toBe(false);
    });

    await test.step('Broken NAD link shows the missing-resource tooltip', async () => {
      const tooltipText = await vmDetailPage.getConfigurationNetworkNicBrokenLinkTooltip(
        NIC_NAME,
      );
      expect(tooltipText, 'Broken NAD link tooltip should explain the missing resource').toBe(
        MISSING_NAD_TOOLTIP,
      );
    });
  });
});
