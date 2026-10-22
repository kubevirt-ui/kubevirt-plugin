import { expect, test as baseTest } from '@/fixtures/scenario-test-fixture';
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
