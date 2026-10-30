/**
 * Catalog route fixture — templates catalog + VM create helpers (main-style route fixtures).
 *
 * ```typescript
 * import { test, expect } from '@/fixtures/catalog-fixture';
 * ```
 */

import { test as baseTest, expect } from '@/fixtures/scenario-test-fixture';
import { CatalogPage } from '@/page-objects/catalog-page';
import { InstanceTypesPage } from '@/page-objects/instance-types-page';
import { VmDetailPage } from '@/page-objects/vm-detail-page';
import { VmListPage } from '@/page-objects/vm-list-page';
import { VmNetworkInterfacesPage } from '@/page-objects/vm-network-interfaces-page';

interface CatalogFixtures {
  catalogPage: CatalogPage;
  instanceTypesPage: InstanceTypesPage;
  vmDetailPage: VmDetailPage;
  vmListPage: VmListPage;
  vmNetworkInterfacesPage: VmNetworkInterfacesPage;
}

const test = baseTest.extend<CatalogFixtures>({
  catalogPage: async ({ page }, use) => {
    await use(new CatalogPage(page));
  },
  instanceTypesPage: async ({ page }, use) => {
    await use(new InstanceTypesPage(page));
  },
  vmDetailPage: async ({ page }, use) => {
    await use(new VmDetailPage(page));
  },
  vmListPage: async ({ page }, use) => {
    await use(new VmListPage(page));
  },
  vmNetworkInterfacesPage: async ({ page }, use) => {
    await use(new VmNetworkInterfacesPage(page));
  },
});

export { expect, test };
