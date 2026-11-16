/**
 * Virtualization landing (overview) route fixture.
 *
 * ```typescript
 * import { test, expect } from '@/fixtures/virtualization-landing-fixture';
 * ```
 */

import { test as baseTest, expect } from '@/fixtures/main-scenario-test-fixture';
import { VmCreationWizardPage } from '@/page-objects/vm-creation-wizard-page';
import { VmWizardPage } from '@/page-objects/vm-wizard-page';
import { OverviewPage } from '@/page-objects/overview-page';
import { VmListPage } from '@/page-objects/vm-list-page';

interface VirtualizationLandingFixtures {
  vmCreationWizardPage: VmCreationWizardPage;
  vmWizardPage: VmWizardPage;
  overviewPage: OverviewPage;
  vmListPage: VmListPage;
}

const test = baseTest.extend<VirtualizationLandingFixtures>({
  vmCreationWizardPage: async ({ page }, use) => {
    await use(new VmCreationWizardPage(page));
  },
  vmWizardPage: async ({ page }, use) => {
    await use(new VmWizardPage(page));
  },
  overviewPage: async ({ page }, use) => {
    await use(new OverviewPage(page));
  },
  vmListPage: async ({ page }, use) => {
    await use(new VmListPage(page));
  },
});

export { expect, test };
