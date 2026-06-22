/**
 * VM tree view — "Show only projects with VirtualMachines" filter.
 *
 * Standard gating test (not a preview feature). Run locally with:
 *   npx playwright test playwright/tests/gating/vm-tree-filter.spec.ts --config=playwright.config.ts --project=gating
 */
import { BrowserContext, Page } from '@playwright/test';

import { test } from '../../fixtures';
import { VMTreeViewPage } from '../../pages/vm-tree';
import { VMListPage } from '../../pages/VMListPage';
import { env } from '../../utils/env';
import { clusterHasVMs, createEmptyNamespace, deleteNamespace } from '../../utils/oc';

const EMPTY_NS = 'pw-tree-empty';

test.describe.serial('VM tree view — show only projects with VirtualMachines', () => {
  let context: BrowserContext;
  let page: Page;
  let vmList: VMListPage;
  let treeView: VMTreeViewPage;

  test.beforeAll(async ({ browser }) => {
    createEmptyNamespace(EMPTY_NS);

    context = await browser.newContext({
      storageState: 'playwright/.auth/session.json',
    });
    page = await context.newPage();
    vmList = new VMListPage(page);
    treeView = vmList.treeView;
    await treeView.seedDefaultState();
  });

  test.afterAll(async () => {
    deleteNamespace(EMPTY_NS);
    await page?.close();
    await context?.close();
  });

  test('switch is ON by default when the cluster has VirtualMachines', async () => {
    test.skip(!clusterHasVMs(), 'Requires at least one VirtualMachine in the cluster');

    await vmList.navigateToVMList();
    await treeView.expectLoaded();
    await treeView.expectShowOnlyVMProjectsSwitch(true, false);
  });

  test('empty namespace is hidden when the filter is ON', async () => {
    test.skip(!clusterHasVMs(), 'Requires at least one VirtualMachine in the cluster');

    await treeView.expectProjectVisible(EMPTY_NS, false);
  });

  test('empty namespace is visible when the filter is OFF', async () => {
    test.skip(!clusterHasVMs(), 'Requires at least one VirtualMachine in the cluster');

    await treeView.setShowOnlyVMProjectsFilter(false);
    await treeView.expectShowOnlyVMProjectsSwitch(false, false);
    await treeView.expectProjectVisible(EMPTY_NS, true);
  });

  test('empty namespace is hidden again when the filter is re-enabled', async () => {
    test.skip(!clusterHasVMs(), 'Requires at least one VirtualMachine in the cluster');

    await treeView.setShowOnlyVMProjectsFilter(true);
    await treeView.expectShowOnlyVMProjectsSwitch(true, false);
    await treeView.expectProjectVisible(EMPTY_NS, false);
  });
});

test('switch is disabled when the cluster has no VirtualMachines', async ({ browser }) => {
  test.skip(clusterHasVMs(), 'Requires cluster with zero VirtualMachines');

  const context = await browser.newContext({
    storageState: 'playwright/.auth/session.json',
  });
  const page = await context.newPage();
  const vmList = new VMListPage(page);
  const treeView = vmList.treeView;

  await treeView.seedDefaultState();
  await vmList.navigateToVMList();
  await treeView.expectLoaded();
  await treeView.expectShowOnlyVMProjectsSwitch(false, true);

  await treeView.hoverShowOnlyVMProjectsSwitch();
  await treeView.expectDisabledFilterTooltip();

  await treeView.expectEmptyState(false);

  const projectToExpect = env.testNamespace || 'default';
  await treeView.expectProjectVisible(projectToExpect, true);

  await page.close();
  await context.close();
});
