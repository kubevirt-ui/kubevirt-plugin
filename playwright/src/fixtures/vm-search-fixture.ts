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

import { baseTest, expect } from './scenario-test-fixture';

interface VmSearchFixtures {
  vmListPage: VirtualMachinesPage;
  pageCommons: PageCommons;
}

const test = baseTest.extend<VmSearchFixtures>({
  vmListPage: async ({ page }, use) => {
    await use(new VirtualMachinesPage(page));
  },
  pageCommons: async ({ page }, use) => {
    await use(new PageCommons(page));
  },
});

export { expect, test };
