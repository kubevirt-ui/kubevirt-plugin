/**
 * Migration policies route fixture.
 *
 * ```typescript
 * import { test, expect } from '@/fixtures/migration-policies-fixture';
 * ```
 */

import { test as baseTest, expect } from '@/fixtures/scenario-test-fixture';
import { MigrationPoliciesPage } from '@/page-objects/migration-policies-page';

interface MigrationPoliciesFixtures {
  migrationPoliciesPage: MigrationPoliciesPage;
}

const test = baseTest.extend<MigrationPoliciesFixtures>({
  migrationPoliciesPage: async ({ page }, use) => {
    await use(new MigrationPoliciesPage(page));
  },
});

export { expect, test };
