import { KubernetesClient } from '@/clients/kubernetes-client';
import { OverviewPage } from '@/page-objects/overview-page';
import { VirtualMachinesPage } from '@/page-objects/virtual-machines-page';
import { getStorageStatePath } from '@/utils/file-utils';
import { TestConfigManager } from '@/utils/test-config';
import { test as base, expect } from '@playwright/test';

interface ScenarioFixtures {
  k8sClient: KubernetesClient;
  overviewPage: OverviewPage;
  virtualMachinesPage: VirtualMachinesPage;
}

export const scenarioTest = base.extend<ScenarioFixtures>({
  storageState: async ({}, use) => {
    const kubeConfigPath = process.env.KUBECONFIG || '.kubeconfigs/test-config';
    await use(getStorageStatePath(kubeConfigPath, true) ?? undefined);
  },

  k8sClient: async ({}, use) => {
    const config = TestConfigManager.getConfig();
    const kubeConfigPath =
      config.kubeConfigPath || process.env.KUBECONFIG || '.kubeconfigs/test-config';
    const client = new KubernetesClient(kubeConfigPath);
    await use(client);
  },

  overviewPage: async ({ page }, use) => {
    await use(new OverviewPage(page));
  },

  virtualMachinesPage: async ({ page }, use) => {
    await use(new VirtualMachinesPage(page));
  },
});

export { expect };
