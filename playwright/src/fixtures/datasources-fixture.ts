/**
 * DataSources route fixture.
 *
 * ```typescript
 * import { test, expect } from '@/fixtures/datasources-fixture';
 * ```
 */

import { test as baseTest, expect } from '@/fixtures/scenario-test-fixture';
import { DataSourcesPage } from '@/page-objects/datasources-page';

interface DataSourcesFixtures {
  dataSourcesPage: DataSourcesPage;
}

const test = baseTest.extend<DataSourcesFixtures>({
  dataSourcesPage: async ({ page }, use) => {
    await use(new DataSourcesPage(page));
  },
});

export { expect, test };
