import { ADMIN_ONLY_TAG, T1, T1_TAG, VM_LIST_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/vm-search-fixture';
import { TestTimeouts } from '@/utils/test-config';
import { setupTestNamespace } from '@/utils/test-setup-helpers';

const SUITE = 'VM tree view filter';

test.describe(SUITE, { tag: [T1_TAG] }, () => {
  let emptyNamespace: string;

  test.beforeAll(async ({ apiClient }) => {
    emptyNamespace = await setupTestNamespace(apiClient, 'tree-empty');
  });

  test('toggles empty project visibility when VirtualMachines exist', async ({
    vmTreePage,
    utils,
  }) => {
    await utils.withAllure({
      suite: SUITE,
      feature: T1,
      tags: [T1_TAG, VM_LIST_TAG, ADMIN_ONLY_TAG, 'CNV-90652'],
    });

    await test.step('Navigate to VirtualMachines and turn the filter on', async () => {
      await vmTreePage.navigateToVirtualMachinesViaUI();
      await vmTreePage.tryCloseWelcomeModal();
      await vmTreePage.toggleEmptyProjectsDisplay(false);
      await vmTreePage.searchTreeView(emptyNamespace);
    });

    await test.step('Switch is enabled and on, and the empty project is hidden', async () => {
      expect(
        await vmTreePage.isShowOnlyVMProjectsSwitchEnabled(),
        'Filter switch should be enabled when VirtualMachines exist',
      ).toBe(true);
      expect(
        await vmTreePage.isShowOnlyVMProjectsSwitchChecked(),
        'Filter switch should be on when hiding empty projects',
      ).toBe(true);

      await expect
        .poll(() => vmTreePage.isTreeNodeVisible(emptyNamespace), {
          message: `Empty project ${emptyNamespace} should be hidden when the filter is on`,
          timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
        })
        .toBe(false);
    });

    await test.step('Turning the filter off shows the empty project', async () => {
      await vmTreePage.toggleEmptyProjectsDisplay(true);
      await expect
        .poll(() => vmTreePage.isTreeNodeVisible(emptyNamespace), {
          message: `Empty project ${emptyNamespace} should be visible when the filter is off`,
          timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
        })
        .toBe(true);
    });

    await test.step('Turning the filter on hides the empty project again', async () => {
      await vmTreePage.toggleEmptyProjectsDisplay(false);
      await expect
        .poll(() => vmTreePage.isTreeNodeVisible(emptyNamespace), {
          message: `Empty project ${emptyNamespace} should be hidden when the filter is on`,
          timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
        })
        .toBe(false);
    });
  });
});
