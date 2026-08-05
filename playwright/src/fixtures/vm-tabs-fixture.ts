/**
 * VM Tabs test fixture.
 *
 * Provides page objects shared across vm-tabs specs.
 *
 * Usage:
 *   import { test, expect } from '@/fixtures/vm-tabs-fixture';
 */

import ConsoleStandalonePage from '@/page-objects/cluster/console-standalone-page';
import CreateVmCreatePage from '@/page-objects/create-vm/create-vm-create-page';
import CreateVmPage from '@/page-objects/create-vm/create-vm-page';
import CreateVmTemplatesPage from '@/page-objects/create-vm/create-vm-templates-page';
import OverviewPage from '@/page-objects/overview/overview-page';
import PageCommons from '@/page-objects/page-commons';
import VirtualMachineDetailPage from '@/page-objects/vm/virtual-machine-detail-page';
import VirtualMachineSnapshotDetailPage from '@/page-objects/vm/virtual-machine-snapshot-detail-page';
import VirtualMachinesPage from '@/page-objects/vm/virtual-machines-page';
import VmTreePage from '@/page-objects/vm/vm-tree-page';

import { baseTest, expect } from './scenario-test-fixture';

interface VmTabsFixtures {
  vmTreePage: VmTreePage;
  vmDetailPage: VirtualMachineDetailPage;
  vmListPage: VirtualMachinesPage;
  pageCommons: PageCommons;
  overviewPage: OverviewPage;
  snapshotDetailPage: VirtualMachineSnapshotDetailPage;
  consoleStandalonePage: ConsoleStandalonePage;
  createVmPage: CreateVmPage;
  createVmCreatePage: CreateVmCreatePage;
  createVmTemplatesPage: CreateVmTemplatesPage;
}

const test = baseTest.extend<VmTabsFixtures>({
  vmTreePage: async ({ page }, use) => {
    await use(new VmTreePage(page));
  },
  vmDetailPage: async ({ page }, use) => {
    await use(new VirtualMachineDetailPage(page));
  },
  vmListPage: async ({ page }, use) => {
    await use(new VirtualMachinesPage(page));
  },
  pageCommons: async ({ page }, use) => {
    await use(new PageCommons(page));
  },
  overviewPage: async ({ page }, use) => {
    await use(new OverviewPage(page));
  },
  snapshotDetailPage: async ({ page }, use) => {
    await use(new VirtualMachineSnapshotDetailPage(page));
  },
  consoleStandalonePage: async ({ page }, use) => {
    await use(new ConsoleStandalonePage(page));
  },
  createVmPage: async ({ page }, use) => {
    await use(new CreateVmPage(page));
  },
  createVmCreatePage: async ({ page }, use) => {
    await use(new CreateVmCreatePage(page));
  },
  createVmTemplatesPage: async ({ page }, use) => {
    await use(new CreateVmTemplatesPage(page));
  },
});

export { expect, test };
