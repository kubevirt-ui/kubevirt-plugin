/**
 * Create VM test fixture.
 *
 * Provides page objects shared across create-vm specs.
 *
 * Usage:
 *   import { test, expect } from '@/fixtures/create-vm-fixture';
 */

import { withSafeActions } from '@/page-objects/base-page';
import CreateVmInstanceTypesPage from '@/page-objects/create-vm/create-vm-instance-types-page';
import VirtualMachinesPage from '@/page-objects/vm/virtual-machines-page';
import VmTreePage from '@/page-objects/vm/vm-tree-page';
import VmWizardBootSourcePage from '@/page-objects/vm-wizard/vm-wizard-boot-source-page';
import VmWizardComputeCustomizationPage from '@/page-objects/vm-wizard/vm-wizard-compute-customization-page';
import VmWizardNavigationPage from '@/page-objects/vm-wizard/vm-wizard-navigation-page';

import { baseTest, expect } from './scenario-test-fixture';

interface CreateVmFixtures {
  vmTreePage: VmTreePage;
  vmListPage: VirtualMachinesPage;
  vmWizardNavigationPage: VmWizardNavigationPage;
  vmWizardBootSourcePage: VmWizardBootSourcePage;
  vmWizardComputePage: VmWizardComputeCustomizationPage;
  createVmInstanceTypesPage: CreateVmInstanceTypesPage;
}

const test = baseTest.extend<CreateVmFixtures>({
  vmTreePage: async ({ page }, use) => {
    await use(withSafeActions(new VmTreePage(page)));
  },
  vmListPage: async ({ page }, use) => {
    await use(withSafeActions(new VirtualMachinesPage(page)));
  },
  vmWizardNavigationPage: async ({ page }, use) => {
    await use(withSafeActions(new VmWizardNavigationPage(page)));
  },
  vmWizardBootSourcePage: async ({ page }, use) => {
    await use(withSafeActions(new VmWizardBootSourcePage(page)));
  },
  vmWizardComputePage: async ({ page }, use) => {
    await use(withSafeActions(new VmWizardComputeCustomizationPage(page)));
  },
  createVmInstanceTypesPage: async ({ page }, use) => {
    await use(withSafeActions(new CreateVmInstanceTypesPage(page)));
  },
});

export { expect, test };
