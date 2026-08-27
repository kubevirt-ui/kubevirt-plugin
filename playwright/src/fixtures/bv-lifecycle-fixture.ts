/**
 * Bootable Volume Lifecycle test fixture.
 *
 * Provides bootable-volumes page objects for cross-module lifecycle tests.
 *
 * Usage:
 *   import { test, expect } from '@/fixtures/bv-lifecycle-fixture';
 */

import BootableVolumesPage from '@/page-objects/create-vm/bootable-volumes-page';
import VmTreePage from '@/page-objects/vm/vm-tree-page';

import { baseTest, expect } from './scenario-test-fixture';

interface BvLifecycleFixtures {
  bootableVolumesPage: BootableVolumesPage;
  vmTreePage: VmTreePage;
}

const test = baseTest.extend<BvLifecycleFixtures>({
  bootableVolumesPage: async ({ page }, use) => {
    await use(new BootableVolumesPage(page));
  },
  vmTreePage: async ({ page }, use) => {
    await use(new VmTreePage(page));
  },
});

export { expect, test };
