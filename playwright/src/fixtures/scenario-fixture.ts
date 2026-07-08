import { KubernetesClient } from '@/clients/kubernetes-client';
import { CheckupsPage } from '@/page-objects/checkups-page';
import { OverviewPage } from '@/page-objects/overview-page';
import { VirtualMachinesPage } from '@/page-objects/virtual-machines-page';
import { EnvVariables } from '@/utils/env-variables';
import { getStorageStatePath } from '@/utils/file-utils';
import { logger } from '@/utils/logger';
import { TestConfigManager } from '@/utils/test-config';
import { test as base, expect } from '@playwright/test';

interface ScenarioFixtures {
  checkupsPage: CheckupsPage;
  k8sClient: KubernetesClient;
  overviewPage: OverviewPage;
  virtualMachinesPage: VirtualMachinesPage;
}

interface AutoFixtures {
  _autoVirtNavigation: void;
}

export const scenarioTest = base.extend<ScenarioFixtures & AutoFixtures>({
  storageState: async ({}, use) => {
    const kubeConfigPath = process.env.KUBECONFIG || '.kubeconfigs/test-config';
    await use(getStorageStatePath(kubeConfigPath, true) ?? undefined);
  },

  // ── Auto-fixture: navigate to Virtualization perspective ────────────
  _autoVirtNavigation: [
    async ({ page }, use) => {
      if (EnvVariables.shouldSkipVirtNavigation) {
        await use();
        return;
      }

      const baseURL = EnvVariables.webConsoleUrl;
      const NAV_TIMEOUT = 60_000;
      const POLL_INTERVAL = 2_000;

      try {
        await page.goto(baseURL, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
      } catch {
        logger.warn('Initial navigation timed out — retrying...');
        await page.goto(baseURL, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
      }

      // Dismiss OpenShift guided-tour modal
      const guidedTourSkip = page.locator('[data-test="guided-tour-skip"]');
      if (await guidedTourSkip.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await guidedTourSkip.click();
      }

      // Dismiss Virtualization welcome modal
      const welcomeClose = page.locator('[data-test="close-welcome-modal"]');
      if (await welcomeClose.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await welcomeClose.click();
      }

      // Wait for PatternFly backdrop to clear
      const backdrop = page.locator('.pf-v6-c-backdrop, .pf-v5-c-backdrop');
      await backdrop.waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});

      // Switch to Virtualization perspective if needed
      const currentPerspective = page.locator('[data-test-id="perspective-switcher-toggle"]');
      const perspectiveText = await currentPerspective.textContent().catch(() => '');
      if (perspectiveText && !perspectiveText.includes('Virtualization')) {
        const virtOption = page
          .locator('[data-test-id="perspective-switcher-menu-option"]')
          .filter({ hasText: 'Virtualization' });

        const deadline = Date.now() + NAV_TIMEOUT;
        let switched = false;
        while (Date.now() < deadline) {
          await currentPerspective.click();
          const visible = await virtOption.isVisible().catch(() => false);
          if (visible) {
            await virtOption.click();
            switched = true;
            break;
          }
          await page.keyboard.press('Escape');
          await page.waitForTimeout(POLL_INTERVAL);
        }
        if (!switched) {
          logger.warn('Could not switch to Virtualization perspective — proceeding anyway');
        }
      }

      await use();
    },
    { auto: true },
  ],

  // ── Page objects ────────────────────────────────────────────────────

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

  virtualMachinesPage: async ({ page }, use) => {
    await use(new VirtualMachinesPage(page));
  },
});

export { expect };
