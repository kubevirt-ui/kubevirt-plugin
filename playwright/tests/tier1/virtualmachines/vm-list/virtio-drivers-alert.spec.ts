import { NONPRIV_TAG, T1, T1_TAG, VM_LIST_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/vm-search-fixture';
import { withSafeActions } from '@/page-objects/base-page';
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

test.describe(SUITE, { tag: [T1_TAG, NONPRIV_TAG] }, () => {
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

  test('Alert is shown only when a Windows VM is in the list', async ({ vmListPage, utils }) => {
    await utils.withAllure({
      suite: SUITE,
      feature: T1,
      tags: [T1_TAG, VM_LIST_TAG, NONPRIV_TAG],
    });

    await test.step('Linux-only namespace does not show the VirtIO drivers alert', async () => {
      await openNamespaceVmList(vmListPage, linuxNs, linuxVm);
      const alertVisible = await vmListPage.virtioAlert.isVisible(TestTimeouts.SHORT_WAIT);
      expect.soft(alertVisible, 'Alert should be hidden when no Windows VM is listed').toBe(false);
    });

    await test.step('Windows namespace shows the VirtIO drivers alert', async () => {
      await openNamespaceVmList(vmListPage, windowsNs, windowsVm);
      const alertVisible = await vmListPage.virtioAlert.isVisible();
      expect.soft(alertVisible, 'Alert should be visible when a Windows VM is listed').toBe(true);
    });
  });

  test('Go to Downloads opens the Downloads tab with the Download ISO button', async ({
    page,
    vmListPage,
    utils,
  }) => {
    await utils.withAllure({
      suite: SUITE,
      feature: T1,
      tags: [T1_TAG, VM_LIST_TAG, NONPRIV_TAG],
    });

    const settingsPage = withSafeActions(new SettingsPage(page));

    await test.step('Open the VM list for the Windows namespace', async () => {
      await openNamespaceVmList(vmListPage, windowsNs, windowsVm);
      const alertVisible = await vmListPage.virtioAlert.isVisible();
      expect(alertVisible, 'Alert should be visible before navigating to Downloads').toBe(true);
    });

    await test.step('Click Go to Downloads and land on the Downloads tab', async () => {
      await vmListPage.virtioAlert.clickGoToDownloads();
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
