/**
 * Gating test fixture.
 *
 * Provides page objects shared across all gating specs.
 *
 * Usage:
 *   import { test, expect } from '@/fixtures/gating-fixture';
 */

import CheckupsPage from '@/page-objects/cluster/checkups-page';
import MigrationPoliciesPage from '@/page-objects/cluster/migration-policies-page';
import QuotasPage from '@/page-objects/cluster/quotas-page';
import StorageClassPage from '@/page-objects/cluster/storage-class-page';
import VirtualizationOverviewPage from '@/page-objects/cluster/virtualization-overview-page';
import BootableVolumeDetailPage from '@/page-objects/create-vm/bootable-volume-detail-page';
import BootableVolumesPage from '@/page-objects/create-vm/bootable-volumes-page';
import CreateVmPage from '@/page-objects/create-vm/create-vm-page';
import InstanceTypesPage from '@/page-objects/create-vm/instance-types-page';
import TemplateDetailPage from '@/page-objects/create-vm/template-detail-page';
import TemplatesPage from '@/page-objects/create-vm/templates-page';
import OverviewPage from '@/page-objects/overview/overview-page';
import PageCommons from '@/page-objects/page-commons';
import SettingsPage from '@/page-objects/settings/settings-page';
import VirtualMachineDetailPage from '@/page-objects/vm/virtual-machine-detail-page';
import VirtualMachinesPage from '@/page-objects/vm/virtual-machines-page';
import VmOverviewTabPage from '@/page-objects/vm/vm-overview-tab-page';
import VmTreePage from '@/page-objects/vm/vm-tree-page';
import VmCreationWizardPage from '@/page-objects/vm-wizard/vm-creation-wizard-page';
import VmWizardBootSourcePage from '@/page-objects/vm-wizard/vm-wizard-boot-source-page';
import VmWizardNavigationPage from '@/page-objects/vm-wizard/vm-wizard-navigation-page';

import { baseTest, expect } from './scenario-test-fixture';

interface GatingFixtures {
  checkupsPage: CheckupsPage;
  overviewPage: OverviewPage;
  pageCommons: PageCommons;
  storageClassPage: StorageClassPage;
  vmTreePage: VmTreePage;
  vmDetailPage: VirtualMachineDetailPage;
  vmListPage: VirtualMachinesPage;
  vmOverviewTabPage: VmOverviewTabPage;
  templatesPage: TemplatesPage;
  templateDetailPage: TemplateDetailPage;
  createVmPage: CreateVmPage;
  bootableVolumesPage: BootableVolumesPage;
  bootableVolumeDetailPage: BootableVolumeDetailPage;
  instanceTypesPage: InstanceTypesPage;
  migrationPoliciesPage: MigrationPoliciesPage;
  quotasPage: QuotasPage;
  settingsPage: SettingsPage;
  virtualizationOverviewPage: VirtualizationOverviewPage;
  vmCreationWizardPage: VmCreationWizardPage;
  vmWizardBootSourcePage: VmWizardBootSourcePage;
  vmWizardNavigationPage: VmWizardNavigationPage;
}

const test = baseTest.extend<GatingFixtures>({
  checkupsPage: async ({ page }, use) => {
    await use(new CheckupsPage(page));
  },
  overviewPage: async ({ page }, use) => {
    await use(new OverviewPage(page));
  },
  pageCommons: async ({ page }, use) => {
    await use(new PageCommons(page));
  },
  vmTreePage: async ({ page }, use) => {
    await use(new VmTreePage(page));
  },
  vmDetailPage: async ({ page }, use) => {
    await use(new VirtualMachineDetailPage(page));
  },
  vmListPage: async ({ page }, use) => {
    await use(new VirtualMachinesPage(page));
  },
  vmOverviewTabPage: async ({ page }, use) => {
    await use(new VmOverviewTabPage(page));
  },
  templatesPage: async ({ page }, use) => {
    await use(new TemplatesPage(page));
  },
  templateDetailPage: async ({ page }, use) => {
    await use(new TemplateDetailPage(page));
  },
  createVmPage: async ({ page }, use) => {
    await use(new CreateVmPage(page));
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
  migrationPoliciesPage: async ({ page }, use) => {
    await use(new MigrationPoliciesPage(page));
  },
  quotasPage: async ({ page }, use) => {
    await use(new QuotasPage(page));
  },
  settingsPage: async ({ page }, use) => {
    await use(new SettingsPage(page));
  },
  storageClassPage: async ({ page }, use) => {
    await use(new StorageClassPage(page));
  },
  virtualizationOverviewPage: async ({ page }, use) => {
    await use(new VirtualizationOverviewPage(page));
  },
  vmCreationWizardPage: async ({ page }, use) => {
    await use(new VmCreationWizardPage(page));
  },
  vmWizardBootSourcePage: async ({ page }, use) => {
    await use(new VmWizardBootSourcePage(page));
  },
  vmWizardNavigationPage: async ({ page }, use) => {
    await use(new VmWizardNavigationPage(page));
  },
});

export { expect, test };
