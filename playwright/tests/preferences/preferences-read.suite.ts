import { ROUTE_PREFERENCES_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/preferences-fixture';
import { registerForGatingAndNonPrivTiers } from '@/test-scenarios/tier-registration';
import { TestTimeouts } from '@/utils/test-config';

registerForGatingAndNonPrivTiers((tags) => {
  test.describe(`Cluster preferences read ${ROUTE_PREFERENCES_TAG} ${tags}`, () => {
    test('Cluster preferences list includes common OS preferences', async ({
      nav,
      preferencesPage,
    }) => {
      await nav.goToClusterPreferences();
      await preferencesPage.waitForClusterListReady();
      await expect(preferencesPage.commonOsPreferenceRow()).toBeVisible({
        timeout: TestTimeouts.LONG_OPERATION,
      });
    });
  });
});
