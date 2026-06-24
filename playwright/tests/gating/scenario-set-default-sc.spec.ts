import { GATING_TAG } from '@/data-models/test-tags';
import { expect, test } from '@/fixtures/gating-fixture';

function isDefaultSc(sc: { metadata?: { annotations?: Record<string, string> } }): boolean {
  const annotations = sc.metadata?.annotations || {};
  return (
    annotations['storageclass.kubernetes.io/is-default-class'] === 'true' ||
    annotations['storageclass.kubevirt.io/is-default-virt-class'] === 'true'
  );
}

test.describe('Set default StorageClass (gating)', { tag: [GATING_TAG] }, () => {
  test('Switch default SC to non-default, verify label, then restore original', async ({
    k8sClient,
    storageClassPage,
    timeouts,
  }) => {
    test.setTimeout(timeouts.TEST_EXTENDED);
    const scList = await k8sClient.listClusterCustomResources(
      'storage.k8s.io',
      'v1',
      'storageclasses',
    );

    const defaultSc = scList.find(
      (sc) => sc.metadata?.annotations?.['storageclass.kubernetes.io/is-default-class'] === 'true',
    );
    expect(defaultSc, 'A default StorageClass should exist').toBeDefined();
    const defaultScName = defaultSc!.metadata!.name!;

    const nonDefaultCandidates = scList.filter((sc) => !isDefaultSc(sc));
    expect(
      nonDefaultCandidates.length,
      'At least one non-default StorageClass should exist',
    ).toBeGreaterThan(0);

    await storageClassPage.navigateToStorageClasses();

    let nonDefaultScName: string | undefined;
    for (const candidate of nonDefaultCandidates) {
      const name = candidate.metadata!.name!;
      try {
        await storageClassPage.setAsDefault(name);
        nonDefaultScName = name;
        break;
      } catch {
        await storageClassPage.navigateToStorageClasses();
      }
    }

    expect(nonDefaultScName, 'At least one SC should accept "Set as default" action').toBeDefined();

    await test.step(`Verify "${nonDefaultScName}" shows default label`, async () => {
      await expect
        .poll(
          async () => {
            await storageClassPage.navigateToStorageClasses();
            return storageClassPage.verifyDefaultLabel(nonDefaultScName!);
          },
          {
            intervals: [2_000, 3_000, 5_000],
            message: `"${nonDefaultScName}" should show the default label after being set`,
            timeout: timeouts.DEFAULT,
          },
        )
        .toBe(true);
    });

    await test.step(`Restore "${defaultScName}" as default`, async () => {
      await k8sClient.patchClusterCustomResourceWithJsonPatch(
        'storage.k8s.io',
        'v1',
        'storageclasses',
        nonDefaultScName!,
        [
          {
            op: 'replace',
            path: '/metadata/annotations/storageclass.kubernetes.io~1is-default-class',
            value: 'false',
          },
        ],
      );
      await k8sClient.patchClusterCustomResourceWithJsonPatch(
        'storage.k8s.io',
        'v1',
        'storageclasses',
        defaultScName,
        [
          {
            op: 'replace',
            path: '/metadata/annotations/storageclass.kubernetes.io~1is-default-class',
            value: 'true',
          },
        ],
      );
      await expect
        .poll(
          async () => {
            await storageClassPage.navigateToStorageClasses();
            return storageClassPage.verifyDefaultLabel(defaultScName);
          },
          {
            intervals: [2_000, 3_000, 5_000],
            message: `"${defaultScName}" should show the default label after being restored`,
            timeout: timeouts.DEFAULT,
          },
        )
        .toBe(true);
    });
  });
});
