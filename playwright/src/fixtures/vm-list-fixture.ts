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
  catalogPage: CatalogPage;
  vmDetailPage: VmDetailPage;
  vmListPage: VmListPage;
}

const test = baseTest.extend<VmListFixtures>({
  catalogPage: async ({ page }, use) => {
    await use(new CatalogPage(page));
  },
  vmDetailPage: async ({ page }, use) => {
    await use(new VmDetailPage(page));
  },
  vmListPage: async ({ page }, use) => {
    await use(new VmListPage(page));
  },
});

export { expect, test };
