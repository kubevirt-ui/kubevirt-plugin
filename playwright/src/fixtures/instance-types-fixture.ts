/**
 * Instance Types test fixture.
 *
 * Provides page objects shared across instanceTypes specs.
 *
 * Usage:
 *   import { test, expect } from '@/fixtures/instance-types-fixture';
 */

import { withSafeActions } from '@/page-objects/base-page';
import InstanceTypesPage from '@/page-objects/create-vm/instance-types-page';
import PageCommons from '@/page-objects/page-commons';

import { baseTest, expect } from './scenario-test-fixture';

interface InstanceTypesFixtures {
  instanceTypesPage: InstanceTypesPage;
  pageCommons: PageCommons;
}

const test = baseTest.extend<InstanceTypesFixtures>({
  instanceTypesPage: async ({ page }, use) => {
    await use(withSafeActions(new InstanceTypesPage(page)));
  },
  pageCommons: async ({ page }, use) => {
    await use(withSafeActions(new PageCommons(page)));
  },
});

export { expect, test };
