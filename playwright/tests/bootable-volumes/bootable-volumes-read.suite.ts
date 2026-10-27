import { ROUTE_BOOTABLE_VOLUMES_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/bootable-volumes-fixture';
import { registerForGatingAndNonPrivTiers } from '@/test-scenarios/tier-registration';
import { TestTimeouts } from '@/utils/test-config';

registerForGatingAndNonPrivTiers((tags) => {
  test.describe(`Bootable volumes read ${ROUTE_BOOTABLE_VOLUMES_TAG} ${tags}`, () => {
    test('Bootable volumes list loads in project', async ({
      bootableVolumesPage,
      nav,
      testNamespace,
    }) => {
      await bootableVolumesPage.openNamespaceListReady(nav, testNamespace);
      await expect(bootableVolumesPage.listTitle()).toBeVisible({
        timeout: TestTimeouts.LONG_OPERATION,
      });
      await expect(bootableVolumesPage.addVolumeButton()).toBeVisible();
    });
  });
});
