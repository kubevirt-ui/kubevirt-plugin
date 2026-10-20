/**
 * Virtualization settings route fixture.
 */
import { expect, test as baseTest } from '@/fixtures/scenario-test-fixture';
import { VirtualizationSettingsPage } from '@/page-objects/virtualization-settings-page';

interface VirtualizationSettingsFixtures {
  settingsPage: VirtualizationSettingsPage;
}

const test = baseTest.extend<VirtualizationSettingsFixtures>({
  settingsPage: async ({ page }, use) => {
    await use(new VirtualizationSettingsPage(page));
  },
});

export { expect, test };
