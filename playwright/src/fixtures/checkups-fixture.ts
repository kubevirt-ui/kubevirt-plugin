/**
 * Checkups test fixture.
 *
 * Provides page objects shared across checkups specs.
 *
 * Usage:
 *   import { test, expect } from '@/fixtures/checkups-fixture';
 */

import { withSafeActions } from '@/page-objects/base-page';
import CheckupsPage from '@/page-objects/cluster/checkups-page';
import OverviewPage from '@/page-objects/overview/overview-page';
import PageCommons from '@/page-objects/page-commons';

import { baseTest, expect } from './scenario-test-fixture';

interface CheckupsFixtures {
  checkupsPage: CheckupsPage;
  overviewPage: OverviewPage;
  pageCommons: PageCommons;
}

const test = baseTest.extend<CheckupsFixtures>({
  checkupsPage: async ({ page }, use) => {
    await use(withSafeActions(new CheckupsPage(page)));
  },
  overviewPage: async ({ page }, use) => {
    await use(withSafeActions(new OverviewPage(page)));
  },
  pageCommons: async ({ page }, use) => {
    await use(withSafeActions(new PageCommons(page)));
  },
});

export { expect, test };
