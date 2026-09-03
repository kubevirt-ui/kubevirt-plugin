/**
 * Settings test fixture.
 *
 * Provides SettingsPage — the standalone page object covering all three
 * Virtualization Settings tabs (Cluster, User, Preview features).
 *
 * All settings specs must use this fixture and be tagged @cnv-settings.
 */

import SettingsAutoLabelsComponent from '@/components/settings/settings-auto-labels-component';
import QuotasPage from '@/page-objects/cluster/quotas-page';
import PageCommons from '@/page-objects/page-commons';
import SettingsPage from '@/page-objects/settings/settings-page';

import { baseTest, expect } from './scenario-test-fixture';

interface SettingsFixtures {
  autoLabelsComponent: SettingsAutoLabelsComponent;
  settingsPage: SettingsPage;
  pageCommons: PageCommons;
  quotasPage: QuotasPage;
}

const test = baseTest.extend<SettingsFixtures>({
  autoLabelsComponent: async ({ page }, use) => {
    await use(new SettingsAutoLabelsComponent(page));
  },
  settingsPage: async ({ page }, use) => {
    await use(new SettingsPage(page));
  },
  pageCommons: async ({ page }, use) => {
    await use(new PageCommons(page));
  },
  quotasPage: async ({ page }, use) => {
    await use(new QuotasPage(page));
  },
});

export { expect, test };
