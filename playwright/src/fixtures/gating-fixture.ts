/**
 * Gating test fixture.
 *
 * Provides page objects shared across all gating specs.
 *
 * Usage:
 *   import { test, expect } from '@/fixtures/gating-fixture';
 */

import { detectAuthExpired, healBrowserAuth } from '@/utils/auth-healer';
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
    const baseUrl = EnvVariables.webConsoleUrl;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        await page.goto(baseUrl, {
          waitUntil: 'domcontentloaded',
          timeout: TestTimeouts.NAVIGATION,
        });

        if (await detectAuthExpired(page)) {
          const healed = await healBrowserAuth(page, page.context());
          if (healed) {
            await page.goto(baseUrl, {
              waitUntil: 'domcontentloaded',
              timeout: TestTimeouts.NAVIGATION,
            });
          }
        }
        break;
      } catch {
        if (attempt === 2) throw new Error(`Gating fixture: page.goto failed after 2 attempts`);
      }
    }

    // Dismiss onboarding popover ("We've maximized your workspace") if present.
    const onboardingDismiss = page.locator('[data-test="onboarding-dismiss-btn"]');
    if (
      await onboardingDismiss.isVisible({ timeout: TestTimeouts.RETRY_DELAY }).catch(() => false)
    ) {
      await onboardingDismiss.click({ force: true }).catch(() => undefined);
      await page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    }

    // Expand sidebar if collapsed after popover dismissal.
    const navToggle = page.getByRole('button', { name: 'Side navigation toggle' });
    const perspToggle = page
      .getByTestId('perspective-switcher-toggle')
      .or(page.locator('[data-test-id="perspective-switcher-toggle"]'));
    if (!(await perspToggle.isVisible({ timeout: TestTimeouts.RETRY_DELAY }).catch(() => false))) {
      if (await navToggle.isVisible({ timeout: TestTimeouts.RETRY_DELAY }).catch(() => false)) {
        await navToggle.click().catch(() => undefined);
        await page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      }
    }

    // Dismiss guided tour modal if present.
    const tourSkipBtn = page.getByTestId('tour-step-footer-secondary');
    if (await tourSkipBtn.isVisible({ timeout: TestTimeouts.RETRY_DELAY }).catch(() => false)) {
      await tourSkipBtn.click({ force: true }).catch(() => undefined);
      await page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    }

    await use();
  },
  // eslint-disable-next-line no-empty-pattern
  _autoResourceCheck: async ({}, use) => use(),

  checkupsPage: async ({ page }, use) => {
    await use(new CheckupsPage(page));
  },
  overviewPage: async ({ page }, use) => {
    await use(new OverviewPage(page));
  },
  pageCommons: async ({ page }, use) => {
    await use(new PageCommons(page));
  },
  settingsPage: async ({ page }, use) => {
    await use(new SettingsPage(page));
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
