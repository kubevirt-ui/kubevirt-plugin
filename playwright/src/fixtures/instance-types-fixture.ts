/**
 * InstanceTypes route fixture.
 */

import { test as baseTest, expect } from '@/fixtures/scenario-test-fixture';
import { VmWizardPage } from '@/page-objects/vm-wizard-page';
import { InstanceTypesPage } from '@/page-objects/instance-types-page';

interface InstanceTypesFixtures {
  vmWizardPage: VmWizardPage;
  instanceTypesPage: InstanceTypesPage;
}

const test = baseTest.extend<InstanceTypesFixtures>({
  vmWizardPage: async ({ page }, use) => {
    await use(new VmWizardPage(page));
  },
  instanceTypesPage: async ({ page }, use) => {
    await use(new InstanceTypesPage(page));
  },
});

export { expect, test };
