import { test as baseTest, expect } from '@/fixtures/scenario-test-fixture';
import { BootableVolumesPage } from '@/page-objects/bootable-volumes-page';
import { DataSourcesPage } from '@/page-objects/datasources-page';

interface BootableVolumesFixtures {
  bootableVolumesPage: BootableVolumesPage;
  dataSourcesPage: DataSourcesPage;
}

const test = baseTest.extend<BootableVolumesFixtures>({
  bootableVolumesPage: async ({ page }, use) => {
    await use(new BootableVolumesPage(page));
  },
  dataSourcesPage: async ({ page }, use) => {
    await use(new DataSourcesPage(page));
  },
});

export { expect, test };
