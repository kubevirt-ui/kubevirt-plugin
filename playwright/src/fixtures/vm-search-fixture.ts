/**
 * VM Search Language test fixture.
 *
 * Provides page objects for VM search language E2E tests.
 *
 * Usage:
 *   import { test, expect } from '@/fixtures/vm-search-fixture';
 */

import PageCommons from '@/page-objects/page-commons';
import VirtualMachinesPage from '@/page-objects/vm/virtual-machines-page';
import VmTreePage from '@/page-objects/vm/vm-tree-page';

import { baseTest, expect } from './scenario-test-fixture';

interface VmSearchFixtures {
  vmListPage: VirtualMachinesPage;
  vmTreePage: VmTreePage;
  pageCommons: PageCommons;
}

const test = baseTest.extend<VmSearchFixtures>({
  vmListPage: async ({ page }, use) => {
    await use(new VirtualMachinesPage(page));
  },
  vmTreePage: async ({ page }, use) => {
    await use(new VmTreePage(page));
  },
  pageCommons: async ({ page }, use) => {
    await use(new PageCommons(page));
  },
});

export { expect, test };
