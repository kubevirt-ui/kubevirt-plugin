/**
 * @deprecated Legacy scenario fixture — kept only for migration-gating compat.
 * New tests should use gating-fixture.ts or scenario-test-fixture.ts.
 */

import { CheckupsPage } from '@/page-objects/checkups-page';
import { OverviewPage } from '@/page-objects/overview-page';
import { VirtualMachinesPage } from '@/page-objects/virtual-machines-page';
import { getStorageStatePath } from '@/utils/file-utils';
import { test as base, expect } from '@playwright/test';

interface ScenarioFixtures {
  checkupsPage: CheckupsPage;
  overviewPage: OverviewPage;
  virtualMachinesPage: VirtualMachinesPage;
}

export const scenarioTest = base.extend<ScenarioFixtures>({
  storageState: async ({}, use) => {
    const kubeConfigPath = process.env.KUBECONFIG || '.kubeconfigs/test-config';
    await use(getStorageStatePath(kubeConfigPath, true) ?? undefined);
  },

  checkupsPage: async ({ page }, use) => {
    await use(new CheckupsPage(page));
  },

  overviewPage: async ({ page }, use) => {
    await use(new OverviewPage(page));
  },

  virtualMachinesPage: async ({ page }, use) => {
    await use(new VirtualMachinesPage(page));
  },
});

export { expect };
