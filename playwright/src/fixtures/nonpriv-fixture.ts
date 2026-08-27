/**
 * Non-privileged user test fixture.
 *
 * Provides page objects for the dedicated non-priv test group
 * (`playwright/tests/nonpriv/`). All specs in that folder must import
 * `test` from this fixture and guard themselves with:
 *
 *   test.skip(!utils.EnvVariables.isNonPrivUser, 'Requires NON_PRIV=1');
 *
 * Run with: `./playwright-runner.sh test-nonpriv`
 */

import BootableVolumeDetailPage from '@/page-objects/create-vm/bootable-volume-detail-page';
import BootableVolumesPage from '@/page-objects/create-vm/bootable-volumes-page';
import InstanceTypesPage from '@/page-objects/create-vm/instance-types-page';
import TemplatesPage from '@/page-objects/create-vm/templates-page';
import OverviewPage from '@/page-objects/overview/overview-page';
import VirtualMachineDetailPage from '@/page-objects/vm/virtual-machine-detail-page';
import VirtualMachinesPage from '@/page-objects/vm/virtual-machines-page';
import VmListPage from '@/page-objects/vm/vm-list-page';
import VmTreePage from '@/page-objects/vm/vm-tree-page';
import VmWizardBootSourcePage from '@/page-objects/vm-wizard/vm-wizard-boot-source-page';
import VmWizardComputeCustomizationPage from '@/page-objects/vm-wizard/vm-wizard-compute-customization-page';
import VmWizardNavigationPage from '@/page-objects/vm-wizard/vm-wizard-navigation-page';

import { baseTest, expect } from './scenario-test-fixture';

interface NonPrivFixtures {
  vmTreePage: VmTreePage;
  vmListPage: VirtualMachinesPage;
  vmListTabPage: VmListPage;
  vmDetailPage: VirtualMachineDetailPage;
  bootableVolumesPage: BootableVolumesPage;
  bootableVolumeDetailPage: BootableVolumeDetailPage;
  instanceTypesPage: InstanceTypesPage;
  templatesPage: TemplatesPage;
  overviewPage: OverviewPage;
  vmWizardNavigationPage: VmWizardNavigationPage;
  vmWizardBootSourcePage: VmWizardBootSourcePage;
  vmWizardComputePage: VmWizardComputeCustomizationPage;
}

const test = baseTest.extend<NonPrivFixtures>({
  vmTreePage: async ({ page }, use) => {
    await use(new VmTreePage(page));
  },
  vmListPage: async ({ page }, use) => {
    await use(new VirtualMachinesPage(page));
  },
  vmListTabPage: async ({ page }, use) => {
    await use(new VmListPage(page));
  },
  vmDetailPage: async ({ page }, use) => {
    await use(new VirtualMachineDetailPage(page));
  },
  bootableVolumesPage: async ({ page }, use) => {
    await use(new BootableVolumesPage(page));
  },
  bootableVolumeDetailPage: async ({ page }, use) => {
    await use(new BootableVolumeDetailPage(page));
  },
  instanceTypesPage: async ({ page }, use) => {
    await use(new InstanceTypesPage(page));
  },
  templatesPage: async ({ page }, use) => {
    await use(new TemplatesPage(page));
  },
  overviewPage: async ({ page }, use) => {
    await use(new OverviewPage(page));
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
