import { NONPRIV_TAG, T1, T1_TAG, VM_LIST_TAG } from '@/data-models/allure-constants';
import { ROUTE_VIRTUAL_MACHINES_LIST_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/vm-search-fixture';
import SettingsPage from '@/page-objects/settings/settings-page';
import type VirtualMachinesPage from '@/page-objects/vm/virtual-machines-page';
import { TestTimeouts } from '@/utils/test-config';
import { setupTestNamespace } from '@/utils/test-setup-helpers';
import { cleanupVmFixtures, createHaltedVm } from '@/utils/vm-search-test-helpers';

const SUITE = 'VirtIO drivers alert';

const openNamespaceVmList = async (
  vmListPage: VirtualMachinesPage,
  namespace: string,
  vmName: string,
): Promise<void> => {
  await vmListPage.navigateToNamespaceVirtualMachinesViaUI(namespace);
  await vmListPage.clickVmListTab();
  await vmListPage.waitForVmRowVisible(vmName);
};

test.describe(SUITE, { tag: [ROUTE_VIRTUAL_MACHINES_LIST_TAG, T1_TAG, NONPRIV_TAG] }, () => {
  let linuxNs: string;
  let windowsNs: string;
  let linuxVm: string;
  let windowsVm: string;

  test.beforeAll(async ({ apiClient, utils }) => {
    linuxNs = await setupTestNamespace(apiClient, 'virtio-linux');
    windowsNs = await setupTestNamespace(apiClient, 'virtio-win');

    linuxVm = utils.generateRandomVmName('linux');
    windowsVm = utils.generateRandomVmName('win');

    await createHaltedVm(apiClient, {
      cpuCores: 1,
      memory: '256Mi',
      name: linuxVm,
      namespace: linuxNs,
    });
    await createHaltedVm(apiClient, {
      cpuCores: 1,
      memory: '256Mi',
      name: windowsVm,
      namespace: windowsNs,
      os: 'windows',
      osLabel: 'windows',
    });
  });

  test.afterAll(async ({ apiClient }) => {
    if (linuxNs) {
      await cleanupVmFixtures(apiClient, linuxNs, [linuxVm]);
    }
    if (windowsNs) {
      await cleanupVmFixtures(apiClient, windowsNs, [windowsVm]);
    }
  });

  test.beforeEach(async ({ vmListPage }) => {
    // Alert is driven by Prometheus recording rule series, not VM OS labels.
    await vmListPage.virtioAlert.mockOutdatedVirtioDrivers([
      { name: windowsVm, namespace: windowsNs },
    ]);
  });

  test('Count-based alert is shown only when Prometheus reports outdated VirtIO drivers', async ({
    vmListPage,
    utils,
  }) => {
    await utils.withAllure({
      suite: SUITE,
      feature: T1,
      tags: [T1_TAG, VM_LIST_TAG, NONPRIV_TAG],
    });

    await test.step('Namespace without outdated-driver series does not show the alert', async () => {
      await openNamespaceVmList(vmListPage, linuxNs, linuxVm);
      const alertVisible = await vmListPage.virtioAlert.isVisible(TestTimeouts.SHORT_WAIT);
      expect.soft(alertVisible, 'Alert should be hidden when no outdated series match').toBe(false);
    });

    await test.step('Namespace with outdated-driver series shows the main alert', async () => {
      await openNamespaceVmList(vmListPage, windowsNs, windowsVm);
      const mainVariantVisible = await vmListPage.virtioAlert.isMainVariantVisible();
      expect
        .soft(mainVariantVisible, 'Count-based alert should be visible when outdated series match')
        .toBe(true);
    });
  });

  test('Backup alert is shown for a Windows VM when the Prometheus count is unavailable', async ({
    vmListPage,
    utils,
  }) => {
    await utils.withAllure({
      suite: SUITE,
      feature: T1,
      tags: [T1_TAG, VM_LIST_TAG, NONPRIV_TAG],
    });

    await vmListPage.virtioAlert.mockPrometheusQueryError();

    await test.step('Namespace without a Windows VM does not show the backup alert', async () => {
      await openNamespaceVmList(vmListPage, linuxNs, linuxVm);
      const alertVisible = await vmListPage.virtioAlert.isVisible(TestTimeouts.SHORT_WAIT);
      expect
        .soft(alertVisible, 'Backup alert should be hidden when the list has no Windows VM')
        .toBe(false);
    });

    await test.step('Namespace with a Windows VM shows the backup alert', async () => {
      await openNamespaceVmList(vmListPage, windowsNs, windowsVm);
      const backupVariantVisible = await vmListPage.virtioAlert.isBackupVariantVisible();
      expect
        .soft(backupVariantVisible, 'Backup alert should be visible for a Windows VM')
        .toBe(true);
    });
  });

  test('"Get updated drivers" button opens the Downloads tab with the Download ISO button', async ({
    page,
    vmListPage,
    utils,
  }) => {
    await utils.withAllure({
      suite: SUITE,
      feature: T1,
      tags: [T1_TAG, VM_LIST_TAG, NONPRIV_TAG],
    });

    const settingsPage = new SettingsPage(page);

    await test.step('Open the VM list for the Windows namespace', async () => {
      await openNamespaceVmList(vmListPage, windowsNs, windowsVm);
      const alertVisible = await vmListPage.virtioAlert.isVisible();
      expect(alertVisible, 'Alert should be visible before navigating to Downloads').toBe(true);
    });

    await test.step('Click "Get updated drivers" and land on the Downloads tab', async () => {
      await vmListPage.virtioAlert.clickGetUpdatedDrivers();
      await expect
        .poll(() => page.url(), {
          timeout: TestTimeouts.NAVIGATION,
          message: 'URL should include virtualization-settings/downloads',
        })
        .toContain('virtualization-settings/downloads');
      expect
        .soft(page.url(), 'URL hash should highlight Windows drivers')
        .toContain('#virtio-drivers-windows');
    });

    await test.step('Download ISO button is visible', async () => {
      const tabVisible = await settingsPage.isDownloadsTabContentVisible();
      expect.soft(tabVisible, 'Downloads tab content should be visible').toBe(true);

      const isoVisible = await settingsPage.isDownloadIsoButtonVisible();
      expect.soft(isoVisible, 'Download ISO button should be visible').toBe(true);
    });
  });

  test('Checking "Do not show again" and closing the alert hides it after remount', async ({
    vmListPage,
    utils,
  }) => {
    await utils.withAllure({
      suite: SUITE,
      feature: T1,
      tags: [T1_TAG, VM_LIST_TAG, NONPRIV_TAG],
    });

    await test.step('Open the VM list and dismiss the alert permanently', async () => {
      await openNamespaceVmList(vmListPage, windowsNs, windowsVm);
      const alertVisible = await vmListPage.virtioAlert.isVisible();
      expect(alertVisible, 'Alert should be visible before dismiss').toBe(true);

      await vmListPage.virtioAlert.checkDontShowAgain();
      await vmListPage.virtioAlert.close();
    });

    await test.step('localStorage records the permanent dismiss', async () => {
      await expect
        .poll(() => vmListPage.virtioAlert.getDismissedFromLocalStorage(), {
          timeout: TestTimeouts.ELEMENT_WAIT,
          message: 'Dismiss key should be JSON true after close',
        })
        .toBe('true');
    });

    await test.step('Navigate away and back to remount the VM list', async () => {
      await vmListPage.clickOverviewTab();
      await vmListPage.clickVmListTab();
      await vmListPage.waitForVmRowVisible(windowsVm);

      const storedAfterRemount = await vmListPage.virtioAlert.getDismissedFromLocalStorage();
      expect(storedAfterRemount, 'Dismiss key should persist after navigation').toBe('true');

      const alertVisible = await vmListPage.virtioAlert.isVisible(TestTimeouts.SHORT_WAIT);
      expect.soft(alertVisible, 'Alert should stay hidden after remount').toBe(false);
    });
  });
});
