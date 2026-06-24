/**
 * VM tree view — "Show only projects with VirtualMachines" filter.
 *
 * Gating test. Run locally with:
 *   npx playwright test playwright/tests/gating/vm-tree-filter.spec.ts
 */
import { GATING_TAG } from '@/data-models/test-tags';
import { expect, test } from '@/fixtures/gating-fixture';
import { TestTimeouts } from '@/utils/test-config';
import { setupTestNamespace } from '@/utils/test-setup-helpers';

const EMPTY_NS_PREFIX = 'pw-tree-empty';

test.describe(
  'VM tree view — show only projects with VirtualMachines',
  { tag: [GATING_TAG] },
  () => {
    let emptyNamespace: string;

    test.beforeAll(async ({ k8sClient }) => {
      emptyNamespace = await setupTestNamespace(k8sClient, EMPTY_NS_PREFIX);
    });

    test.afterAll(async ({ k8sClient }) => {
      if (emptyNamespace) {
        await k8sClient.deleteNamespace(emptyNamespace).catch(() => undefined);
      }
    });

    test('empty namespace is hidden when the filter is ON and visible when OFF', async ({
      vmListPage,
    }) => {
      await vmListPage.navigateToVirtualMachinesViaUI();
      await vmListPage.tree.toggleEmptyProjectsDisplay(false);
      await vmListPage.tree.searchTreeView(emptyNamespace);

      await expect
        .poll(() => vmListPage.tree.isTreeNodeVisible(emptyNamespace), {
          message: 'Empty namespace should be hidden when filter is ON',
          timeout: TestTimeouts.DEFAULT,
        })
        .toBeFalsy();

      await vmListPage.tree.toggleEmptyProjectsDisplay(true);
      await vmListPage.tree.searchTreeView(emptyNamespace);

      await expect
        .poll(() => vmListPage.tree.isTreeNodeVisible(emptyNamespace), {
          message: 'Empty namespace should be visible when filter is OFF',
          timeout: TestTimeouts.DEFAULT,
        })
        .toBeTruthy();

      await vmListPage.tree.toggleEmptyProjectsDisplay(false);
      await vmListPage.tree.searchTreeView(emptyNamespace);

      await expect
        .poll(() => vmListPage.tree.isTreeNodeVisible(emptyNamespace), {
          message: 'Empty namespace should be hidden again when filter is re-enabled',
          timeout: TestTimeouts.DEFAULT,
        })
        .toBeFalsy();
    });
  },
);
