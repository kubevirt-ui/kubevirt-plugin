import { test as baseTest, expect } from '@/fixtures/main-scenario-test-fixture';
import { PreferencesPage } from '@/page-objects/preferences-page';

interface PreferencesFixtures {
  preferencesPage: PreferencesPage;
}

const test = baseTest.extend<PreferencesFixtures>({
  preferencesPage: async ({ page }, use) => {
    await use(new PreferencesPage(page));
  },
});

export { expect, test };
