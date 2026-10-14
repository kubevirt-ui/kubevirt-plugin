/**
 * VM templates route fixture.
 *
 * ```typescript
 * import { test, expect } from '@/fixtures/templates-fixture';
 * ```
 */

import { expect, test as baseTest } from '@/fixtures/scenario-test-fixture';
import { TemplatesPage } from '@/page-objects/templates-page';

interface TemplatesFixtures {
  templatesPage: TemplatesPage;
}

const test = baseTest.extend<TemplatesFixtures>({
  templatesPage: async ({ page }, use) => {
    await use(new TemplatesPage(page));
  },
});

export { expect, test };
