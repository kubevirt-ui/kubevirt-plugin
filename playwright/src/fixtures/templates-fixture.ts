/**
 * Templates test fixture.
 *
 * Provides page objects shared across templates specs.
 *
 * Usage:
 *   import { test, expect } from '@/fixtures/templates-fixture';
 */

import CreateVmPage from '@/page-objects/create-vm/create-vm-page';
import TemplateDetailPage from '@/page-objects/create-vm/template-detail-page';
import TemplatesPage from '@/page-objects/create-vm/templates-page';
import OverviewPage from '@/page-objects/overview/overview-page';
import PageCommons from '@/page-objects/page-commons';
import VirtualMachineDetailPage from '@/page-objects/vm/virtual-machine-detail-page';
import VirtualMachinesPage from '@/page-objects/vm/virtual-machines-page';
import VmTreePage from '@/page-objects/vm/vm-tree-page';
import VmWizardComputeCustomizationPage from '@/page-objects/vm-wizard/vm-wizard-compute-customization-page';
import VmWizardNavigationPage from '@/page-objects/vm-wizard/vm-wizard-navigation-page';

import { baseTest, expect } from './scenario-test-fixture';

interface TemplatesFixtures {
  createVmPage: CreateVmPage;
  overviewPage: OverviewPage;
  templatesPage: TemplatesPage;
  templateDetailPage: TemplateDetailPage;
  vmTreePage: VmTreePage;
  vmDetailPage: VirtualMachineDetailPage;
  vmListPage: VirtualMachinesPage;
  pageCommons: PageCommons;
  vmWizardNavigationPage: VmWizardNavigationPage;
  vmWizardComputePage: VmWizardComputeCustomizationPage;
}

const test = baseTest.extend<TemplatesFixtures>({
  createVmPage: async ({ page }, use) => {
    await use(new CreateVmPage(page));
  },
  overviewPage: async ({ page }, use) => {
    await use(new OverviewPage(page));
  },
  templatesPage: async ({ page }, use) => {
    await use(new TemplatesPage(page));
  },
  templateDetailPage: async ({ page }, use) => {
    await use(new TemplateDetailPage(page));
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
  pageCommons: async ({ page }, use) => {
    await use(new PageCommons(page));
  },
  vmWizardNavigationPage: async ({ page }, use) => {
    await use(new VmWizardNavigationPage(page));
  },
  vmWizardComputePage: async ({ page }, use) => {
    await use(new VmWizardComputeCustomizationPage(page));
  },
});

export { expect, test };
