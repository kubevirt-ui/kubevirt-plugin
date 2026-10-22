/**
 * InstanceTypes route fixture.
 */

import { expect, test as baseTest } from '@/fixtures/scenario-test-fixture';
import { CatalogPage } from '@/page-objects/catalog-page';
import { InstanceTypesPage } from '@/page-objects/instance-types-page';

interface InstanceTypesFixtures {
  catalogPage: CatalogPage;
  instanceTypesPage: InstanceTypesPage;
}

const test = baseTest.extend<InstanceTypesFixtures>({
  catalogPage: async ({ page }, use) => {
    await use(new CatalogPage(page));
  },
  instanceTypesPage: async ({ page }, use) => {
    await use(new InstanceTypesPage(page));
  },
});

export { expect, test };
