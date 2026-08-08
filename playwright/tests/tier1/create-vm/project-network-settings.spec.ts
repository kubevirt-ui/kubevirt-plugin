import type RequestContextClient from '@/clients/request-context-client';
import {
  ADMIN_ONLY_TAG,
  NETWORKING_TAG_LABEL,
  T1,
  T1_TAG,
} from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/create-vm-fixture';
import type VmWizardBootSourcePage from '@/page-objects/vm-wizard/vm-wizard-boot-source-page';
import type VmWizardComputeCustomizationPage from '@/page-objects/vm-wizard/vm-wizard-compute-customization-page';
import type VmWizardNavigationPage from '@/page-objects/vm-wizard/vm-wizard-navigation-page';
import type VmTreePage from '@/page-objects/vm/vm-tree-page';
import { TestTimeouts } from '@/utils/test-config';
import {
  createBridgeNetworkAttachmentDefinition,
  setProjectNetworkSettings,
  setupTestNamespace,
  type ProjectNetworkSettingsAnnotations,
} from '@/utils/test-setup-helpers';

const SUITE = 'Project network settings';
const DEFAULT_NIC_NAME = 'default';

/**
 * API-only project setup. Must complete before any VirtualMachines UI navigation
 * so the wizard loads with the intended project network annotations applied.
 */
async function setupProjectNetworkNamespace(
  apiClient: RequestContextClient,
  prefix: string,
  options: {
    nadName?: string;
    settings?: ProjectNetworkSettingsAnnotations;
  } = {},
): Promise<string> {
  const namespace = await setupTestNamespace(apiClient, prefix);

  if (options.nadName) {
    await createBridgeNetworkAttachmentDefinition(apiClient, options.nadName, namespace);
  }

  if (options.settings) {
    await setProjectNetworkSettings(apiClient, namespace, options.settings);
  }

  return namespace;
}

async function navigateWizardToCustomizationNetwork(args: {
  vmTreePage: VmTreePage;
  vmWizardNavigationPage: VmWizardNavigationPage;
  vmWizardBootSourcePage: VmWizardBootSourcePage;
  vmWizardComputePage: VmWizardComputeCustomizationPage;
  namespace: string;
}): Promise<void> {
  const {
    vmTreePage,
    vmWizardNavigationPage,
    vmWizardBootSourcePage,
    vmWizardComputePage,
    namespace,
  } = args;

  // Namespace/NAD/annotations must already exist before this UI entry point.
  await vmTreePage.switchToVirtualizationPerspective();
  await vmTreePage.navigateToProjectVmListViaUI(namespace);
  await vmWizardNavigationPage.openWizardFromCreateDropdown();

  await vmWizardNavigationPage.generateVmName();
  await vmWizardNavigationPage.clickNext();
  await vmWizardNavigationPage.clickNext();

  await vmWizardBootSourcePage.verifyBootSourceStepVisible();
  const volumeCount = await vmWizardBootSourcePage.getBootVolumeCount();
  if (volumeCount > 0) {
    await vmWizardBootSourcePage.selectBootVolumeByName('rhel');
  } else {
    await vmWizardBootSourcePage.selectNoBootSource();
  }
  await vmWizardNavigationPage.clickNext();

  await vmWizardComputePage.verifyComputeResourcesStepVisible();
  await vmWizardComputePage.clickElementByExactText('div', 'Compute Exclusive');
  // Give namespace/NAD watches time to settle before Compute → Next snapshots the VM.
  await vmWizardNavigationPage.page.waitForTimeout(TestTimeouts.CLUSTER_STATE_PROPAGATION);
  await vmWizardNavigationPage.clickNext();

  const customizationVisible = await vmWizardComputePage.verifyCustomizationStepVisible();
  expect(customizationVisible, 'Customization step should be visible').toBe(true);
}

async function assertDefaultNicUsesNetwork(
  vmWizardComputePage: VmWizardComputeCustomizationPage,
  expectedNetwork: string,
  timeout: number,
): Promise<void> {
  await expect
    .poll(async () => vmWizardComputePage.getWizardNetworkInterfaceNetworkName(DEFAULT_NIC_NAME), {
      message: `Default NIC should use ${expectedNetwork}`,
      timeout,
    })
    .toContain(expectedNetwork);

  const networkName =
    await vmWizardComputePage.getWizardNetworkInterfaceNetworkName(DEFAULT_NIC_NAME);
  expect(networkName, 'Default NIC must not fall back to Pod networking').not.toBe(
    'Pod networking',
  );
}

async function assertAddNicModalHidesPodAndSelectsNad(
  vmWizardComputePage: VmWizardComputeCustomizationPage,
  timeout: number,
): Promise<void> {
  await vmWizardComputePage.openAddNetworkInterfaceModal();

  // When pod networking is disallowed, the modal preselects the first available NAD
  // option (sorted alphabetically) — not necessarily the project default-network.
  await expect
    .poll(async () => vmWizardComputePage.getAddNetworkInterfaceSelectedNetwork(), {
      message: 'Add NIC modal should auto-select a NAD when pod networking is disallowed',
      timeout,
    })
    .not.toBe('');

  const selectedNetwork = await vmWizardComputePage.getAddNetworkInterfaceSelectedNetwork();
  expect(selectedNetwork, 'Selected network must not be Pod networking').not.toContain(
    'Pod networking',
  );

  const podVisible = await vmWizardComputePage.isPodNetworkingOptionVisibleInAddNetworkModal();
  expect(podVisible, 'Pod networking option should be hidden when disallowed').toBe(false);

  await vmWizardComputePage.cancelNetworkInterfaceModal();
}

test.describe(SUITE, { tag: [T1_TAG, '@catalog-wizard', ADMIN_ONLY_TAG] }, () => {
  test.beforeEach(async ({ utils }) => {
    await utils.withAllure({
      suite: SUITE,
      feature: T1,
      tags: [T1_TAG, NETWORKING_TAG_LABEL, ADMIN_ONLY_TAG],
    });
  });

  test('uses Pod networking when project has no network annotations', async ({
    apiClient,
    vmTreePage,
    vmWizardNavigationPage,
    vmWizardBootSourcePage,
    vmWizardComputePage,
    utils,
  }) => {
    test.setTimeout(utils.TestTimeouts.TEST_VM_CREATION);

    const namespace = await setupProjectNetworkNamespace(apiClient, 'proj-net-baseline');

    await navigateWizardToCustomizationNetwork({
      vmTreePage,
      vmWizardNavigationPage,
      vmWizardBootSourcePage,
      vmWizardComputePage,
      namespace,
    });

    await expect
      .poll(
        async () => vmWizardComputePage.getWizardNetworkInterfaceNetworkName(DEFAULT_NIC_NAME),
        {
          message: 'Default NIC should use Pod networking without project annotations',
          timeout: utils.TestTimeouts.ELEMENT_WAIT,
        },
      )
      .toBe('Pod networking');
  });

  test('uses project default-network for default NIC while Pod networking stays allowed', async ({
    apiClient,
    vmTreePage,
    vmWizardNavigationPage,
    vmWizardBootSourcePage,
    vmWizardComputePage,
    utils,
  }) => {
    test.setTimeout(utils.TestTimeouts.TEST_VM_CREATION);

    const nadName = utils.generateRandomNadName('proj-nad');
    const namespace = await setupProjectNetworkNamespace(apiClient, 'proj-net-default-only', {
      nadName,
      settings: { defaultNetwork: nadName },
    });

    await navigateWizardToCustomizationNetwork({
      vmTreePage,
      vmWizardNavigationPage,
      vmWizardBootSourcePage,
      vmWizardComputePage,
      namespace,
    });

    await test.step('VM creation uses the project default NAD', async () => {
      await assertDefaultNicUsesNetwork(
        vmWizardComputePage,
        nadName,
        utils.TestTimeouts.TEST_MEDIUM,
      );
    });

    await test.step('Add NIC modal still offers Pod networking', async () => {
      await vmWizardComputePage.openAddNetworkInterfaceModal();

      const podVisible = await vmWizardComputePage.isPodNetworkingOptionVisibleInAddNetworkModal();
      expect(podVisible, 'Pod networking option should remain available').toBe(true);

      await vmWizardComputePage.cancelNetworkInterfaceModal();
    });
  });

  test('hides Pod networking and selects available NAD when pod network is disallowed', async ({
    apiClient,
    vmTreePage,
    vmWizardNavigationPage,
    vmWizardBootSourcePage,
    vmWizardComputePage,
    utils,
  }) => {
    test.setTimeout(utils.TestTimeouts.TEST_VM_CREATION);

    const nadName = utils.generateRandomNadName('proj-nad');
    const namespace = await setupProjectNetworkNamespace(apiClient, 'proj-net-no-pod', {
      nadName,
      settings: { allowPodNetwork: false },
    });

    await navigateWizardToCustomizationNetwork({
      vmTreePage,
      vmWizardNavigationPage,
      vmWizardBootSourcePage,
      vmWizardComputePage,
      namespace,
    });

    await test.step('VM creation falls back to the available project NAD', async () => {
      await assertDefaultNicUsesNetwork(
        vmWizardComputePage,
        nadName,
        utils.TestTimeouts.TEST_MEDIUM,
      );
    });

    await test.step('Add NIC modal hides Pod networking and auto-selects a NAD', async () => {
      await assertAddNicModalHidesPodAndSelectsNad(
        vmWizardComputePage,
        utils.TestTimeouts.ELEMENT_WAIT,
      );
    });
  });

  test('honors default-network and hides Pod networking when disallowed', async ({
    apiClient,
    vmTreePage,
    vmWizardNavigationPage,
    vmWizardBootSourcePage,
    vmWizardComputePage,
    utils,
  }) => {
    test.setTimeout(utils.TestTimeouts.TEST_VM_CREATION);

    const nadName = utils.generateRandomNadName('proj-nad');
    const namespace = await setupProjectNetworkNamespace(apiClient, 'proj-net-nad', {
      nadName,
      settings: {
        defaultNetwork: nadName,
        allowPodNetwork: false,
      },
    });

    await navigateWizardToCustomizationNetwork({
      vmTreePage,
      vmWizardNavigationPage,
      vmWizardBootSourcePage,
      vmWizardComputePage,
      namespace,
    });

    await test.step('VM creation uses the project default NAD', async () => {
      await assertDefaultNicUsesNetwork(
        vmWizardComputePage,
        nadName,
        utils.TestTimeouts.TEST_MEDIUM,
      );
    });

    await test.step('Add NIC modal hides Pod networking and auto-selects a NAD', async () => {
      await assertAddNicModalHidesPodAndSelectsNad(
        vmWizardComputePage,
        utils.TestTimeouts.ELEMENT_WAIT,
      );
    });
  });
});
