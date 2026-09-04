/**
 * Create VM test fixture.
 *
 * Provides page objects shared across create-vm specs.
 *
 * Usage:
 *   import { test, expect } from '@/fixtures/create-vm-fixture';
 */

import CreateVmInstanceTypesPage from '@/page-objects/create-vm/create-vm-instance-types-page';
import VirtualMachinesPage from '@/page-objects/vm/virtual-machines-page';
import VmWizardBootSourcePage from '@/page-objects/vm-wizard/vm-wizard-boot-source-page';
import VmWizardComputeCustomizationPage from '@/page-objects/vm-wizard/vm-wizard-compute-customization-page';
import VmWizardNavigationPage from '@/page-objects/vm-wizard/vm-wizard-navigation-page';

import { baseTest, expect } from './scenario-test-fixture';

interface CreateVmFixtures {
  vmListPage: VirtualMachinesPage;
  vmWizardNavigationPage: VmWizardNavigationPage;
  vmWizardBootSourcePage: VmWizardBootSourcePage;
  vmWizardComputePage: VmWizardComputeCustomizationPage;
  createVmInstanceTypesPage: CreateVmInstanceTypesPage;
}

const test = baseTest.extend<CreateVmFixtures>({
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
  createVmInstanceTypesPage: async ({ page }, use) => {
    await use(new CreateVmInstanceTypesPage(page));
  },
});

export { expect, test };
