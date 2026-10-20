/**
 * Virtualization landing (overview) route fixture.
 *
 * ```typescript
 * import { test, expect } from '@/fixtures/virtualization-landing-fixture';
 * ```
 */

import { expect, test as baseTest } from '@/fixtures/scenario-test-fixture';
import { CatalogPage } from '@/page-objects/catalog-page';
import { OverviewPage } from '@/page-objects/overview-page';

interface VirtualizationLandingFixtures {
  overviewPage: OverviewPage;
  catalogPage: CatalogPage;
}

const test = baseTest.extend<VirtualizationLandingFixtures>({
  overviewPage: async ({ page }, use) => {
    await use(new OverviewPage(page));
  },
  catalogPage: async ({ page }, use) => {
    await use(new CatalogPage(page));
  },
});

export { expect, test };
