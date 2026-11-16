/**
 * VM templates route fixture.
 *
 * ```typescript
 * import { test, expect } from '@/fixtures/templates-fixture';
 * ```
 */

import { test as baseTest, expect } from '@/fixtures/main-scenario-test-fixture';
import { TemplatesPage } from '@/page-objects/templates-page';
import { VmDetailPage } from '@/page-objects/vm-detail-page';

interface TemplatesFixtures {
  templatesPage: TemplatesPage;
  vmDetailPage: VmDetailPage;
}

const test = baseTest.extend<TemplatesFixtures>({
  templatesPage: async ({ page }, use) => {
    await use(new TemplatesPage(page));
  },
  vmDetailPage: async ({ page }, use) => {
    await use(new VmDetailPage(page));
  },
});

export { expect, test };
