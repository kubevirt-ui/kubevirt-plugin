/**
 * Quotas test fixture.
 *
 * Provides page objects shared across quotas specs.
 *
 * Usage:
 *   import { test, expect } from '@/fixtures/quotas-fixture';
 */

import QuotasPage from '@/page-objects/cluster/quotas-page';

import { baseTest, expect } from './scenario-test-fixture';

interface QuotasFixtures {
  quotasPage: QuotasPage;
}

const test = baseTest.extend<QuotasFixtures>({
  quotasPage: async ({ page }, use) => {
    await use(new QuotasPage(page));
  },
});

export { expect, test };
