/**
 * s390x test fixture (kubevirt-ui parity, adapted to kvp page objects).
 *
 * | Mode | Condition | Behaviour |
 * |------|-----------|-----------|
 * | Real s390x | `EnvVariables.isS390x` | Tests run against live cluster |
 * | Mock mode | `S390X_MOCK_ENABLED=1` on non-s390x | HCO/template routes + SERVER_FLAGS mocked |
 * | Skipped | neither | Specs guard themselves with `test.skip()` |
 */

import { test as baseTest, expect } from '@/fixtures/scenario-test-fixture';
import { BootableVolumesPage } from '@/page-objects/bootable-volumes-page';
import { CatalogPage } from '@/page-objects/catalog-page';
import { TemplatesPage } from '@/page-objects/templates-page';
import { VmListPage } from '@/page-objects/vm-list-page';
import { EnvVariables } from '@/utils/env-variables';
import { applyS390xMocks, cleanupS390xMocks, injectServerFlagsS390x } from '@/utils/s390x-mock';

interface S390xFixtures {
  bootableVolumesPage: BootableVolumesPage;
  catalogPage: CatalogPage;
  /** True when mock mode is active (non-s390x cluster + S390X_MOCK_ENABLED=1). */
  isS390xMocked: boolean;
  /** True when the test is running against a real s390x cluster. */
  isRealS390x: boolean;
  templatesPage: TemplatesPage;
  vmListPage: VmListPage;
}

const test = baseTest.extend<S390xFixtures>({
  isRealS390x: async ({}, use) => {
    await use(EnvVariables.isS390x);
  },

  isS390xMocked: async ({}, use) => {
    await use(!EnvVariables.isS390x && EnvVariables.s390xMockEnabled);
  },

  bootableVolumesPage: async ({ page }, use) => {
    await use(new BootableVolumesPage(page));
  },

  catalogPage: async ({ page, isS390xMocked }, use) => {
    if (isS390xMocked) {
      await applyS390xMocks(page);
      page.on('load', () => {
        void injectServerFlagsS390x(page);
      });
    }
    await use(new CatalogPage(page));
    if (isS390xMocked) {
      await cleanupS390xMocks(page);
    }
  },

  templatesPage: async ({ page }, use) => {
    await use(new TemplatesPage(page));
  },

  vmListPage: async ({ page, isS390xMocked }, use) => {
    if (isS390xMocked) {
      await applyS390xMocks(page);
      page.on('load', () => {
        void injectServerFlagsS390x(page);
      });
    }
    await use(new VmListPage(page));
    if (isS390xMocked) {
      await cleanupS390xMocks(page);
    }
  },
});

export { expect, test };
export type { S390xFixtures };
