/**
 * Set default StorageClass.
 * Mirrors: cypress/tests/gating/set-default-sc.cy.ts
 */
import { execSync } from 'child_process';

import { SECOND } from 'utils/constants';

import { expect, test } from '../../fixtures';

test.describe.configure({ mode: 'serial' });

test.describe('Set default StorageClass', () => {
  test('set a non-default StorageClass as default and restore cluster default', async ({
    page,
    storageClassesPage,
  }) => {
    await storageClassesPage.navigate();
    const raw = execSync('oc get sc -o json', { stdio: 'pipe' }).toString();
    const items = JSON.parse(raw).items as Array<{
      metadata: { annotations?: Record<string, string>; name: string };
    }>;

    const currentDefault = items.find(
      (sc) => sc.metadata?.annotations?.['storageclass.kubernetes.io/is-default-class'] === 'true',
    );
    expect(currentDefault, 'Expected a default StorageClass to exist in the cluster').toBeDefined();
    const defaultScName = currentDefault.metadata.name;

    const nonDefault = items.find(
      (sc) => sc.metadata?.annotations?.['storageclass.kubernetes.io/is-default-class'] !== 'true',
    );
    expect(nonDefault, 'Expected at least one non-default StorageClass').toBeDefined();
    const nonDefaultScName = nonDefault.metadata.name;

    // wait as the page reloads
    await page.waitForTimeout(10 * SECOND);

    await storageClassesPage.setAsDefault(nonDefaultScName);
    await storageClassesPage.expectDefaultLabel(nonDefaultScName);
    await storageClassesPage.setAsDefault(defaultScName);
    await storageClassesPage.expectDefaultLabel(defaultScName);
  });
});
