/**
 * Checkups route fixture.
 *
 * ```typescript
 * import { test, expect } from '@/fixtures/checkups-fixture';
 * ```
 */

import { test as baseTest, expect } from '@/fixtures/scenario-test-fixture';
import { CheckupsPage } from '@/page-objects/checkups-page';

interface CheckupsFixtures {
  checkupsPage: CheckupsPage;
}

const test = baseTest.extend<CheckupsFixtures>({
  checkupsPage: async ({ page }, use) => {
    await use(new CheckupsPage(page));
  },
});

export { expect, test };
