/**
 * Set default StorageClass.
 * Mirrors: cypress/tests/gating/set-default-sc.cy.ts
 */
import { execSync } from 'child_process';

import { expect, test } from '../../fixtures';
import { env } from '../../utils/env';

const NS = env.testNamespace;
const CLUSTER_DEFAULT_SC = 'ocs-storagecluster-ceph-rbd-virtualization';
const DOWNSTREAM = !!process.env.DOWNSTREAM;

test.describe.configure({ mode: 'serial' });

test.describe('Set default StorageClass', () => {
  test.beforeEach(async ({ storageClassesPage }) => {
    if (!NS) test.skip();
    await storageClassesPage.navigate();
  });

  test('set a non-default StorageClass as default', async ({ storageClassesPage }) => {
    const raw = execSync('oc get sc -o json', { stdio: 'pipe' }).toString();
    const items = JSON.parse(raw).items as Array<{
      metadata: { annotations?: Record<string, string>; name: string };
    }>;
    const nonDefault = items.find(
      (sc) => sc.metadata?.annotations?.['storageclass.kubernetes.io/is-default-class'] !== 'true',
    );
    expect(nonDefault, 'Expected at least one non-default StorageClass').toBeDefined();

    const scName = nonDefault.metadata.name;

    await storageClassesPage.openRowMenu(scName);
    await storageClassesPage.clickAction('Set as default');
    await storageClassesPage.expectDefaultLabel(scName);
  });

  test('restore cluster default StorageClass', async ({ storageClassesPage }) => {
    if (!DOWNSTREAM) test.skip();

    await storageClassesPage.openRowMenu(CLUSTER_DEFAULT_SC);
    await storageClassesPage.clickAction('Set as default');
    await storageClassesPage.expectDefaultLabel(CLUSTER_DEFAULT_SC);
  });
});
