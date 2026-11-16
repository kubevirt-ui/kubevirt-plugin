/**
 * VM wizard route fixture — template selection, customize/review, wizard create helpers.
 *
 * ```typescript
 * import { test, expect } from '@/fixtures/vm-wizard-fixture';
 * ```
 */

import { test as baseTest, expect } from '@/fixtures/main-scenario-test-fixture';
import { VmCreationWizardPage } from '@/page-objects/vm-creation-wizard-page';
import { InstanceTypesPage } from '@/page-objects/instance-types-page';
import { VmDetailPage } from '@/page-objects/vm-detail-page';
import { VmListPage } from '@/page-objects/vm-list-page';
import { VmNetworkInterfacesPage } from '@/page-objects/vm-network-interfaces-page';
import { VmWizardPage } from '@/page-objects/vm-wizard-page';

interface VmWizardFixtures {
  instanceTypesPage: InstanceTypesPage;
  vmCreationWizardPage: VmCreationWizardPage;
  vmDetailPage: VmDetailPage;
  vmListPage: VmListPage;
  vmNetworkInterfacesPage: VmNetworkInterfacesPage;
  vmWizardPage: VmWizardPage;
}

const test = baseTest.extend<VmWizardFixtures>({
  instanceTypesPage: async ({ page }, use) => {
    await use(new InstanceTypesPage(page));
  },
  vmCreationWizardPage: async ({ page }, use) => {
    await use(new VmCreationWizardPage(page));
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
  vmWizardPage: async ({ page }, use) => {
    await use(new VmWizardPage(page));
  },
});

export { expect, test };
