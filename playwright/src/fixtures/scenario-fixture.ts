import { KubernetesClient } from '@/clients/kubernetes-client';
import { CheckupsPage } from '@/page-objects/checkups-page';
import { OverviewPage } from '@/page-objects/overview-page';
import { PreviewFeaturesSettingsPage } from '@/page-objects/settings/preview-features-settings-page';
import { VirtualMachinesPage } from '@/page-objects/virtual-machines-page';
import { getStorageStatePath } from '@/utils/file-utils';
import { TestConfigManager } from '@/utils/test-config';
import { test as base, expect } from '@playwright/test';

interface ScenarioFixtures {
  checkupsPage: CheckupsPage;
  k8sClient: KubernetesClient;
  overviewPage: OverviewPage;
  previewFeaturesSettingsPage: PreviewFeaturesSettingsPage;
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

  previewFeaturesSettingsPage: async ({ page }, use) => {
    await use(new PreviewFeaturesSettingsPage(page));
  },

  virtualMachinesPage: async ({ page }, use) => {
    await use(new VirtualMachinesPage(page));
  },
});

export { expect };
