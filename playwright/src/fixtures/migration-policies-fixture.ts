/**
 * Migration Policies test fixture.
 *
 * Provides page objects shared across migrationpolicies specs.
 *
 * Usage:
 *   import { test, expect } from '@/fixtures/migration-policies-fixture';
 */

import { withSafeActions } from '@/page-objects/base-page';
import MigrationPoliciesPage from '@/page-objects/cluster/migration-policies-page';
import PageCommons from '@/page-objects/page-commons';

import { baseTest, expect } from './scenario-test-fixture';

interface MigrationPoliciesFixtures {
  migrationPoliciesPage: MigrationPoliciesPage;
  pageCommons: PageCommons;
}

const test = baseTest.extend<MigrationPoliciesFixtures>({
  migrationPoliciesPage: async ({ page }, use) => {
    await use(withSafeActions(new MigrationPoliciesPage(page)));
  },
  pageCommons: async ({ page }, use) => {
    await use(withSafeActions(new PageCommons(page)));
  },
});

export { expect, test };
