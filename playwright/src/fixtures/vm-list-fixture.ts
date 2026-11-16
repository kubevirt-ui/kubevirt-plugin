/**
 * VirtualMachines list route fixture.
 *
 * ```typescript
 * import { test, expect } from '@/fixtures/vm-list-fixture';
 * ```
 */

import { test as baseTest, expect } from '@/fixtures/main-scenario-test-fixture';
import { VmCreationWizardPage } from '@/page-objects/vm-creation-wizard-page';
import { VmDetailPage } from '@/page-objects/vm-detail-page';
import { VmListPage } from '@/page-objects/vm-list-page';

interface VmListFixtures {
  vmCreationWizardPage: VmCreationWizardPage;
  vmDetailPage: VmDetailPage;
  vmListPage: VmListPage;
}

const test = baseTest.extend<VmListFixtures>({
  vmCreationWizardPage: async ({ page }, use) => {
    await use(new VmCreationWizardPage(page));
  },
  vmDetailPage: async ({ page }, use) => {
    await use(new VmDetailPage(page));
  },
  vmListPage: async ({ page }, use) => {
    await use(new VmListPage(page));
  },
});

export { expect, test };
