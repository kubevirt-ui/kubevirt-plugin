/**
 * VM detail route fixture (main-style `vm-tabs-fixture`, scoped to 4.12 detail + network POs).
 *
 * ```typescript
 * import { test, expect } from '@/fixtures/vm-detail-fixture';
 * ```
 */

import { expect, test as baseTest } from '@/fixtures/scenario-test-fixture';
import { VmDetailPage } from '@/page-objects/vm-detail-page';
import { VmDetailTabsPage } from '@/page-objects/vm-detail-tabs-page';
import { VmNetworkInterfacesPage } from '@/page-objects/vm-network-interfaces-page';

interface VmDetailFixtures {
  vmDetailPage: VmDetailPage;
  vmDetailTabsPage: VmDetailTabsPage;
  vmNetworkInterfacesPage: VmNetworkInterfacesPage;
}

const test = baseTest.extend<VmDetailFixtures>({
  vmDetailPage: async ({ page }, use) => {
    await use(new VmDetailPage(page));
  },
  vmDetailTabsPage: async ({ page }, use) => {
    await use(new VmDetailTabsPage(page));
  },
  vmNetworkInterfacesPage: async ({ page }, use) => {
    await use(new VmNetworkInterfacesPage(page));
  },
});

export { expect, test };
