/**
 * VirtualMachines list route fixture.
 *
 * ```typescript
 * import { test, expect } from '@/fixtures/vm-list-fixture';
 * ```
 */

import { expect, test as baseTest } from '@/fixtures/scenario-test-fixture';
import { CatalogPage } from '@/page-objects/catalog-page';
import { VmDetailPage } from '@/page-objects/vm-detail-page';
import { VmListPage } from '@/page-objects/vm-list-page';

interface VmListFixtures {
  vmListPage: VmListPage;
  vmDetailPage: VmDetailPage;
  catalogPage: CatalogPage;
}

const test = baseTest.extend<VmListFixtures>({
  vmListPage: async ({ page }, use) => {
    await use(new VmListPage(page));
  },
  vmDetailPage: async ({ page }, use) => {
    await use(new VmDetailPage(page));
  },
  catalogPage: async ({ page }, use) => {
    await use(new CatalogPage(page));
  },
});

export { expect, test };
