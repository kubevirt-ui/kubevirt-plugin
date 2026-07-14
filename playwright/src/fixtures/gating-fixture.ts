/**
 * Gating test fixture.
 *
 * Provides page objects shared across all gating specs.
 *
 * Usage:
 *   import { test, expect } from '@/fixtures/gating-fixture';
 */

import { withSafeActions } from '@/page-objects/base-page';
import CheckupsPage from '@/page-objects/cluster/checkups-page';
import MigrationPoliciesPage from '@/page-objects/cluster/migration-policies-page';
import QuotasPage from '@/page-objects/cluster/quotas-page';
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
import { EnvVariables } from '@/utils/env-variables';
import { TestTimeouts } from '@/utils/test-config';

import { baseTest, expect } from './scenario-test-fixture';

interface GatingFixtures {
  checkupsPage: CheckupsPage;
  overviewPage: OverviewPage;
  pageCommons: PageCommons;
  settingsPage: SettingsPage;
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
  virtualizationOverviewPage: VirtualizationOverviewPage;
  vmCreationWizardPage: VmCreationWizardPage;
  vmWizardBootSourcePage: VmWizardBootSourcePage;
  vmWizardNavigationPage: VmWizardNavigationPage;
}

const test = baseTest.extend<GatingFixtures>({
  // Gating specs navigate explicitly in beforeEach — replace the heavy
  // per-test auto-navigation (networkidle + perspective switch + modal
  // dismissal + stabilisation waits) with a lightweight goto so the page
  // is not on about:blank. Without this, page objects that try sidebar nav
  // clicks first would pay a ~30s timeout penalty before falling back to
  // direct page.goto(). Skip resource readiness polling entirely.
  _autoVirtNavigation: async ({ page }, use) => {
    await page.goto(EnvVariables.webConsoleUrl, {
      waitUntil: 'domcontentloaded',
      timeout: TestTimeouts.NAVIGATION,
    });
    await use();
  },
  // eslint-disable-next-line no-empty-pattern
  _autoResourceCheck: async ({}, use) => use(),

  checkupsPage: async ({ page }, use) => {
    await use(withSafeActions(new CheckupsPage(page)));
  },
  overviewPage: async ({ page }, use) => {
    await use(withSafeActions(new OverviewPage(page)));
  },
  pageCommons: async ({ page }, use) => {
    await use(withSafeActions(new PageCommons(page)));
  },
  settingsPage: async ({ page }, use) => {
    await use(withSafeActions(new SettingsPage(page)));
  },
  vmTreePage: async ({ page }, use) => {
    await use(withSafeActions(new VmTreePage(page)));
  },
  vmDetailPage: async ({ page }, use) => {
    await use(withSafeActions(new VirtualMachineDetailPage(page)));
  },
  vmListPage: async ({ page }, use) => {
    await use(withSafeActions(new VirtualMachinesPage(page)));
  },
  vmOverviewTabPage: async ({ page }, use) => {
    await use(withSafeActions(new VmOverviewTabPage(page)));
  },
  templatesPage: async ({ page }, use) => {
    await use(withSafeActions(new TemplatesPage(page)));
  },
  templateDetailPage: async ({ page }, use) => {
    await use(withSafeActions(new TemplateDetailPage(page)));
  },
  createVmPage: async ({ page }, use) => {
    await use(withSafeActions(new CreateVmPage(page)));
  },
  bootableVolumesPage: async ({ page }, use) => {
    await use(withSafeActions(new BootableVolumesPage(page)));
  },
  bootableVolumeDetailPage: async ({ page }, use) => {
    await use(withSafeActions(new BootableVolumeDetailPage(page)));
  },
  instanceTypesPage: async ({ page }, use) => {
    await use(withSafeActions(new InstanceTypesPage(page)));
  },
  migrationPoliciesPage: async ({ page }, use) => {
    await use(withSafeActions(new MigrationPoliciesPage(page)));
  },
  quotasPage: async ({ page }, use) => {
    await use(withSafeActions(new QuotasPage(page)));
  },
  virtualizationOverviewPage: async ({ page }, use) => {
    await use(withSafeActions(new VirtualizationOverviewPage(page)));
  },
  vmCreationWizardPage: async ({ page }, use) => {
    await use(withSafeActions(new VmCreationWizardPage(page)));
  },
  vmWizardBootSourcePage: async ({ page }, use) => {
    await use(withSafeActions(new VmWizardBootSourcePage(page)));
  },
  vmWizardNavigationPage: async ({ page }, use) => {
    await use(withSafeActions(new VmWizardNavigationPage(page)));
  },
});

export { expect, test };
