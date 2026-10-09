/**
 * VM list page fixture.
 *
 * Provides the Virtual Machines list page object for list-level E2E tests.
 *
 * Usage:
 *   import { test, expect } from '@/fixtures/vm-list-fixture';
 */

import VirtualMachinesPage from '@/page-objects/vm/virtual-machines-page';

import { baseTest, expect } from './scenario-test-fixture';

interface VmListFixtures {
  vmListPage: VirtualMachinesPage;
}

const test = baseTest.extend<VmListFixtures>({
  vmListPage: async ({ page }, use) => {
    await use(new VirtualMachinesPage(page));
  },
});

export { expect, test };
