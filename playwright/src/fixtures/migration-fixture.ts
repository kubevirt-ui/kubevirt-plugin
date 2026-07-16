/**
 * Migration test fixture.
 *
 * Provides page objects for VM migration E2E tests (compute + storage).
 * All tests in this fixture require cluster-admin privileges.
 *
 * Usage:
 *   import { test, expect } from '@/fixtures/migration-fixture';
 */

import RequestContextClient from '@/clients/request-context-client';
import { withSafeActions } from '@/page-objects/base-page';
import CreateVmCreatePage from '@/page-objects/create-vm/create-vm-create-page';
import CreateVmTemplatesPage from '@/page-objects/create-vm/create-vm-templates-page';
import PageCommons from '@/page-objects/page-commons';
import VirtualMachineDetailPage from '@/page-objects/vm/virtual-machine-detail-page';
import VirtualMachinesPage from '@/page-objects/vm/virtual-machines-page';
import VmTreePage from '@/page-objects/vm/vm-tree-page';
import { EnvVariables } from '@/utils/env-variables';
import { TestConfigManager } from '@/utils/test-config';

import { baseTest, expect } from './scenario-test-fixture';

interface MigrationFixtures {
  vmTreePage: VmTreePage;
  vmDetailPage: VirtualMachineDetailPage;
  vmListPage: VirtualMachinesPage;
  pageCommons: PageCommons;
  createVmTemplatesPage: CreateVmTemplatesPage;
  createVmCreatePage: CreateVmCreatePage;
  requestContextClient: RequestContextClient;
}

const test = baseTest.extend<MigrationFixtures>({
  vmTreePage: async ({ page }, use) => {
    await use(withSafeActions(new VmTreePage(page)));
  },
  vmDetailPage: async ({ page }, use) => {
    await use(withSafeActions(new VirtualMachineDetailPage(page)));
  },
  vmListPage: async ({ page }, use) => {
    await use(withSafeActions(new VirtualMachinesPage(page)));
  },
  pageCommons: async ({ page }, use) => {
    await use(withSafeActions(new PageCommons(page)));
  },
  createVmTemplatesPage: async ({ page }, use) => {
    await use(withSafeActions(new CreateVmTemplatesPage(page)));
  },
  createVmCreatePage: async ({ page }, use) => {
    await use(withSafeActions(new CreateVmCreatePage(page)));
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
