/**
 * Virtualization landing (overview) route fixture.
 *
 * ```typescript
 * import { test, expect } from '@/fixtures/virtualization-landing-fixture';
 * ```
 */

import { test as baseTest, expect } from '@/fixtures/scenario-test-fixture';
import { CatalogPage } from '@/page-objects/catalog-page';
import { OverviewPage } from '@/page-objects/overview-page';

interface VirtualizationLandingFixtures {
  catalogPage: CatalogPage;
  overviewPage: OverviewPage;
}

const test = baseTest.extend<VirtualizationLandingFixtures>({
  catalogPage: async ({ page }, use) => {
    await use(new CatalogPage(page));
  },
  overviewPage: async ({ page }, use) => {
    await use(new OverviewPage(page));
  },
});

export { expect, test };
