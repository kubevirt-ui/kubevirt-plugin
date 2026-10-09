/**
 * Recommended capabilities test fixture.
 *
 * Provides RecommendedCapabilitiesPage for Settings → Recommended capabilities specs.
 */

import RecommendedCapabilitiesPage from '@/page-objects/settings/recommended-capabilities-page';

import { baseTest, expect } from './scenario-test-fixture';

interface RecommendedCapabilitiesFixtures {
  recommendedCapabilitiesPage: RecommendedCapabilitiesPage;
}

const test = baseTest.extend<RecommendedCapabilitiesFixtures>({
  recommendedCapabilitiesPage: async ({ page }, use) => {
    await use(new RecommendedCapabilitiesPage(page));
  },
});

export { expect, test };
