/**
 * VM Actions test fixture.
 *
 * Provides page objects shared across vm-actions, vm-lightspeed, vm-overview-redesign specs.
 *
 * Usage:
 *   import { test, expect } from '@/fixtures/vm-actions-fixture';
 */

import RequestContextClient from '@/clients/request-context-client';
import CreateVmCreatePage from '@/page-objects/create-vm/create-vm-create-page';
import CreateVmTemplatesPage from '@/page-objects/create-vm/create-vm-templates-page';
import TemplatesPage from '@/page-objects/create-vm/templates-page';
import OverviewPage from '@/page-objects/overview/overview-page';
import PageCommons from '@/page-objects/page-commons';
import VirtualMachineDetailPage from '@/page-objects/vm/virtual-machine-detail-page';
import VirtualMachinesPage from '@/page-objects/vm/virtual-machines-page';
import VmOverviewTabPage from '@/page-objects/vm/vm-overview-tab-page';
import VmTreePage from '@/page-objects/vm/vm-tree-page';
import { EnvVariables } from '@/utils/env-variables';
import { TestConfigManager } from '@/utils/test-config';

import { baseTest, expect } from './scenario-test-fixture';

interface VmActionsFixtures {
  vmTreePage: VmTreePage;
  vmDetailPage: VirtualMachineDetailPage;
  vmListPage: VirtualMachinesPage;
  vmOverviewTabPage: VmOverviewTabPage;
  pageCommons: PageCommons;
  overviewPage: OverviewPage;
  templatesPage: TemplatesPage;
  createVmTemplatesPage: CreateVmTemplatesPage;
  createVmCreatePage: CreateVmCreatePage;
  requestContextClient: RequestContextClient;
}

const test = baseTest.extend<VmActionsFixtures>({
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
  pageCommons: async ({ page }, use) => {
    await use(new PageCommons(page));
  },
  overviewPage: async ({ page }, use) => {
    await use(new OverviewPage(page));
  },
  templatesPage: async ({ page }, use) => {
    await use(new TemplatesPage(page));
  },
  createVmTemplatesPage: async ({ page }, use) => {
    await use(new CreateVmTemplatesPage(page));
  },
  createVmCreatePage: async ({ page }, use) => {
    await use(new CreateVmCreatePage(page));
  },
  requestContextClient: async ({ page }, use) => {
    const testConfig = TestConfigManager.getConfig();
    await use(
      new RequestContextClient(page, {
        baseUrl: EnvVariables.clusterUrl,
        username: EnvVariables.username,
        password: EnvVariables.password,
        ...(testConfig?.authToken ? { token: testConfig.authToken } : {}),
      }),
    );
  },
});

export { expect, test };
