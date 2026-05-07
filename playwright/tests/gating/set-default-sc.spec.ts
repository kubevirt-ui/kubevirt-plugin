/**
 * Set default StorageClass.
 * Mirrors: cypress/tests/gating/set-default-sc.cy.ts
 */
import { execSync } from 'child_process';

import { SECOND } from 'utils/constants';

import { expect, test } from '../../fixtures';

const CLUSTER_DEFAULT_SC = 'ocs-storagecluster-ceph-rbd-virtualization';

test.describe.configure({ mode: 'serial' });

test.describe('Set default StorageClass', () => {
  test('set a non-default StorageClass as default and restore cluster default', async ({
    storageClassesPage,
  }) => {
    await storageClassesPage.navigate();
    const raw = execSync('oc get sc -o json', { stdio: 'pipe' }).toString();
    const items = JSON.parse(raw).items as Array<{
      metadata: { annotations?: Record<string, string>; name: string };
    }>;
    const nonDefault = items.find(
      (sc) => sc.metadata?.annotations?.['storageclass.kubernetes.io/is-default-class'] !== 'true',
    );
    expect(nonDefault, 'Expected at least one non-default StorageClass').toBeDefined();

    const scName = nonDefault.metadata.name;

    await storageClassesPage.setAsDefault(scName);
    await storageClassesPage.expectDefaultLabel(scName);
    await storageClassesPage.setAsDefault(CLUSTER_DEFAULT_SC);
    await storageClassesPage.expectDefaultLabel(CLUSTER_DEFAULT_SC);
  });
});
