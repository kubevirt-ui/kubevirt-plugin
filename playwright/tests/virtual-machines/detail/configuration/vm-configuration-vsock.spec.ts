import { T1, T1_TAG, VM_TABS_TAG } from '@/data-models/allure-constants';
import { ROUTE_VIRTUAL_MACHINES_DETAIL_CONFIGURATION_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/vm-tabs-fixture';

const SUITE = 'VM Configuration — VSOCK';

function getAutoattachVsockFromVm(vm: unknown): boolean | undefined {
  const devices = (
    vm as {
      spec?: { template?: { spec?: { domain?: { devices?: { autoattachVSOCK?: boolean } } } } };
    }
  )?.spec?.template?.spec?.domain?.devices;
  return devices?.autoattachVSOCK;
}

async function openVmConfigurationDetails(
  vmListPage: { navigateToVmViaTreeView: (ns: string, vmName: string) => Promise<void> },
  vmDetailPage: { navigateToConfigurationDetails: () => Promise<void> },
  vmNamespace: string,
  vmName: string,
): Promise<void> {
  await vmListPage.navigateToVmViaTreeView(vmNamespace, vmName);
  await vmDetailPage.navigateToConfigurationDetails();
}

async function expectAutoattachVsockOnVm(
  apiClient: { getVirtualMachine: (namespace: string, name: string) => Promise<unknown> },
  vmNamespace: string,
  vmName: string,
  expected: boolean,
): Promise<void> {
  await expect
    .poll(
      async () => {
        const vm = await apiClient.getVirtualMachine(vmNamespace, vmName);
        return getAutoattachVsockFromVm(vm);
      },
      {
        intervals: [1_000, 2_000, 3_000],
        message: `VM ${vmName} should have autoattachVSOCK=${expected}`,
        timeout: 30_000,
      },
    )
    .toBe(expected);
}

/** Requires VSOCK in HyperConverged `spec.configuration.developerConfiguration.featureGates`. */
test.describe.serial(
  'VM Configuration — VSOCK',
  { tag: [ROUTE_VIRTUAL_MACHINES_DETAIL_CONFIGURATION_TAG, T1_TAG] },
  () => {
    let namespace: string;

    test.beforeAll(async ({ apiClient, utils }) => {
      namespace = utils.generateTestNamespace('vm-vsock');
      await apiClient.createNamespace(namespace);
      await apiClient.waitForNamespaceReady(namespace);
      apiClient.trackResource('Namespace', namespace);
    });

    test.beforeEach(async ({ utils }) => {
      await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG, VM_TABS_TAG] });
    });

    test('custom VM created with VSOCK enabled has autoattachVSOCK in the spec', async ({
      apiClient,
      utils,
      vmDetailPage,
      vmListPage,
      vmWizardBootSourcePage,
      vmWizardComputePage,
      vmWizardNavigationPage,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_VM_CREATION);

      let customVmName = '';

      await test.step('Open custom VM wizard (Custom configuration)', async () => {
        await vmListPage.switchToVirtualizationPerspective();
        await vmListPage.navigateToProjectVmListViaUI(namespace);
        await vmWizardNavigationPage.openWizardFromCreateDropdown();

        expect(await vmWizardNavigationPage.verifyWizardVisible()).toBe(true);
        await vmWizardNavigationPage.generateVmName();
        await vmWizardNavigationPage.clickNext();
      });

      await test.step('Guest OS — continue with default selection', async () => {
        await vmWizardNavigationPage.clickNext();
      });

      await test.step('Boot source — no boot source', async () => {
        await vmWizardBootSourcePage.selectNoBootSource();
        await vmWizardNavigationPage.clickNext();
      });

      await test.step('Compute resources — General Purpose medium', async () => {
        await vmWizardComputePage.selectInstanceTypeSeries('u');
        await vmWizardComputePage.selectComputeSize('medium');
        await vmWizardNavigationPage.clickNext();
      });

      await test.step('Customization — enable VSOCK on Details', async () => {
        await vmWizardComputePage.selectCustomizationTab('Details');
        await vmWizardComputePage.setVsockEnabled(true);
        expect(await vmWizardComputePage.isVsockEnabled()).toBe(true);
        await vmWizardNavigationPage.clickNext();
      });

      await test.step('Review and create custom VM', async () => {
        await vmWizardNavigationPage.clickCreateVm();
        expect(await vmWizardNavigationPage.verifyRedirectedToVmDetails()).toBe(true);

        customVmName = await vmWizardNavigationPage.getCreatedVmNameFromUrl();
        expect(customVmName.length).toBeGreaterThan(0);
        apiClient.trackResource('VirtualMachine', customVmName, namespace);
      });

      await test.step('Configuration Details — turn off VSOCK and verify spec', async () => {
        await openVmConfigurationDetails(vmListPage, vmDetailPage, namespace, customVmName);
        await expectAutoattachVsockOnVm(apiClient, namespace, customVmName, true);
        await vmDetailPage.setVsockEnabled(false);
        await expectAutoattachVsockOnVm(apiClient, namespace, customVmName, false);
      });
    });
  },
);
