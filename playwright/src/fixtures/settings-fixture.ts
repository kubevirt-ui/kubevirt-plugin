/**
 * Settings test fixture.
 *
 * Provides SettingsPage — the standalone page object covering Virtualization
 * Settings tabs (Cluster, User, Preview features, Recommended capabilities).
 *
 * All settings specs must use this fixture and be tagged @cnv-settings.
 */

import { withSafeActions } from '@/page-objects/base-page';
import QuotasPage from '@/page-objects/cluster/quotas-page';
import PageCommons from '@/page-objects/page-commons';
import SettingsPage from '@/page-objects/settings/settings-page';
import { VirtualizationSettingsPage } from '@/page-objects/virtualization-settings-page';

import { baseTest, expect } from './scenario-test-fixture';

interface SettingsFixtures {
  settingsPage: SettingsPage;
  virtualizationSettingsPage: VirtualizationSettingsPage;
  pageCommons: PageCommons;
  quotasPage: QuotasPage;
}

const test = baseTest.extend<SettingsFixtures>({
  settingsPage: async ({ page }, use) => {
    await use(withSafeActions(new SettingsPage(page)));
  },
  virtualizationSettingsPage: async ({ page }, use) => {
    await use(withSafeActions(new VirtualizationSettingsPage(page)));
  },
  pageCommons: async ({ page }, use) => {
    await use(withSafeActions(new PageCommons(page)));
  },
  quotasPage: async ({ page }, use) => {
    await use(withSafeActions(new QuotasPage(page)));
  },
});

export { expect, test };
