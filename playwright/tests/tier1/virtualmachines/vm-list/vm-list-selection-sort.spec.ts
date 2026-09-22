import { ADMIN_ONLY_TAG, T1, T1_TAG, VM_LIST_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/vm-list-fixture';
import type VirtualMachinesPage from '@/page-objects/vm/virtual-machines-page';
import { TestTimeouts } from '@/utils/test-config';
import { setupTestNamespace } from '@/utils/test-setup-helpers';
import { cleanupVmFixtures, createHaltedVm } from '@/utils/vm-search-test-helpers';

const SUITE = 'VM List Selection and Sort';

const openNamespaceVmList = async (
  vmListPage: VirtualMachinesPage,
  namespace: string,
  vmNames: string[],
): Promise<void> => {
  await vmListPage.navigateToNamespaceVirtualMachinesViaUI(namespace);
  await vmListPage.clickVmListTab();
  for (const vmName of vmNames) {
    await vmListPage.waitForVmRowVisible(vmName);
  }
};

const expectListedVmOrder = async (
  vmListPage: VirtualMachinesPage,
  expectedNames: string[],
  message: string,
): Promise<void> => {
  await expect(async () => {
    expect(await vmListPage.getListedVmNames(), message).toEqual(expectedNames);
  }).toPass({ timeout: TestTimeouts.ELEMENT_WAIT });
};

test.describe(SUITE, { tag: [T1_TAG, ADMIN_ONLY_TAG] }, () => {
  let namespace: string;
  let earlyVm: string;
  let lateVm: string;

  test.beforeAll(async ({ apiClient, utils }) => {
    namespace = await setupTestNamespace(apiClient, 'vm-sort');
    earlyVm = utils.generateRandomVmName('aaa');
    lateVm = utils.generateRandomVmName('zzz');

    await createHaltedVm(apiClient, {
      cpuCores: 1,
      memory: '256Mi',
      name: earlyVm,
      namespace,
    });
    await createHaltedVm(apiClient, {
      cpuCores: 1,
      memory: '256Mi',
      name: lateVm,
      namespace,
    });
  });

  test.afterAll(async ({ apiClient }) => {
    if (namespace) {
      await cleanupVmFixtures(apiClient, namespace, [earlyVm, lateVm]);
    }
  });

  test.beforeEach(async ({ vmListPage }) => {
    await openNamespaceVmList(vmListPage, namespace, [earlyVm, lateVm]);
  });

  test('sorts the Name column and reverses VM row order', async ({ vmListPage, utils }) => {
    await utils.withAllure({
      suite: SUITE,
      feature: T1,
      tags: [T1_TAG, VM_LIST_TAG, ADMIN_ONLY_TAG],
    });

    await test.step('Default Name sort lists VMs alphabetically', async () => {
      await vmListPage.sortTableByColumn('Name', 'ascending');
      await expectListedVmOrder(
        vmListPage,
        [earlyVm, lateVm],
        'Name ascending should list the earlier VM before the later VM',
      );
    });

    await test.step('Name descending reverses the listed VM order', async () => {
      await vmListPage.sortTableByColumn('Name', 'descending');
      await expectListedVmOrder(
        vmListPage,
        [lateVm, earlyVm],
        'Name descending should list the later VM before the earlier VM',
      );
    });
  });

  test('keeps the same VM selected after sorting by Name', async ({ vmListPage, utils }) => {
    await utils.withAllure({
      suite: SUITE,
      feature: T1,
      tags: [T1_TAG, VM_LIST_TAG, ADMIN_ONLY_TAG],
    });

    await test.step('Select the first VM in Name ascending order', async () => {
      await vmListPage.sortTableByColumn('Name', 'ascending');
      await expectListedVmOrder(
        vmListPage,
        [earlyVm, lateVm],
        'Name ascending should list the earlier VM before the later VM',
      );
      await vmListPage.selectVmByCheckbox(earlyVm);
      const earlySelected = await vmListPage.isVmCheckboxChecked(earlyVm);
      const lateSelected = await vmListPage.isVmCheckboxChecked(lateVm);
      expect(earlySelected, `${earlyVm} should be selected`).toBe(true);
      expect(lateSelected, `${lateVm} should not be selected`).toBe(false);
    });

    await test.step('Sorting by Name does not move selection to another VM', async () => {
      await vmListPage.sortTableByColumn('Name', 'descending');
      await expectListedVmOrder(
        vmListPage,
        [lateVm, earlyVm],
        'Rows should reverse so the selected VM is no longer first',
      );

      const earlySelected = await vmListPage.isVmCheckboxChecked(earlyVm);
      const lateSelected = await vmListPage.isVmCheckboxChecked(lateVm);
      expect(earlySelected, `${earlyVm} should stay selected after sort`).toBe(true);
      expect(lateSelected, `${lateVm} should stay unselected after sort`).toBe(false);
    });
  });
});
