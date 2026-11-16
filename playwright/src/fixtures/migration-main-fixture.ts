/**
 * VM migration specs (compute + storage).
 */

import { test as baseTest, expect } from '@/fixtures/vm-list-fixture';
import { VmStorageMigrationPage } from '@/page-objects/vm-storage-migration-page';

interface MigrationFixtures {
  vmStorageMigrationPage: VmStorageMigrationPage;
}

const test = baseTest.extend<MigrationFixtures>({
  vmStorageMigrationPage: async ({ page }, use) => {
    await use(new VmStorageMigrationPage(page));
  },
});

export { expect, test };
