/**
 * Instance Types test fixture.
 *
 * Provides page objects shared across instanceTypes specs, including VM wizard
 * page objects used by instance-types E2E coverage.
 *
 * Usage:
 *   import { test, expect } from '@/fixtures/instance-types-fixture';
 */

import InstanceTypesPage from '@/page-objects/create-vm/instance-types-page';
import PageCommons from '@/page-objects/page-commons';
import VirtualMachinesPage from '@/page-objects/vm/virtual-machines-page';
import VmWizardBootSourcePage from '@/page-objects/vm-wizard/vm-wizard-boot-source-page';
import VmWizardComputeCustomizationPage from '@/page-objects/vm-wizard/vm-wizard-compute-customization-page';
import VmWizardNavigationPage from '@/page-objects/vm-wizard/vm-wizard-navigation-page';

import { baseTest, expect } from './scenario-test-fixture';

interface InstanceTypesFixtures {
  instanceTypesPage: InstanceTypesPage;
  pageCommons: PageCommons;
  vmListPage: VirtualMachinesPage;
  vmWizardBootSourcePage: VmWizardBootSourcePage;
  vmWizardComputePage: VmWizardComputeCustomizationPage;
  vmWizardNavigationPage: VmWizardNavigationPage;
}

const test = baseTest.extend<InstanceTypesFixtures>({
  instanceTypesPage: async ({ page }, use) => {
    await use(new InstanceTypesPage(page));
  },
  pageCommons: async ({ page }, use) => {
    await use(new PageCommons(page));
  },
  vmListPage: async ({ page }, use) => {
    await use(new VirtualMachinesPage(page));
  },
  vmWizardNavigationPage: async ({ page }, use) => {
    await use(new VmWizardNavigationPage(page));
  },
  vmWizardBootSourcePage: async ({ page }, use) => {
    await use(new VmWizardBootSourcePage(page));
  },
  vmWizardComputePage: async ({ page }, use) => {
    await use(new VmWizardComputeCustomizationPage(page));
  },
});

export { expect, test };
