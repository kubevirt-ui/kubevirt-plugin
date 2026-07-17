import { load as yamlLoad } from 'js-yaml';

import type { KubernetesResource } from '@/data-models/kubernetes-types';
import { expect, test } from '@/fixtures/api-test-fixture';

test.describe('MigrationPolicy CRUD — API', { tag: ['@api'] }, () => {
  let policyName: string;
  let fullPolicyName: string;

  test.beforeAll(async ({ apiClient, utils }) => {
    policyName = utils.generateRandomMigrationPolicyName('test');
    fullPolicyName = utils.generateRandomMigrationPolicyName('test-full');

    await test.step('CREATE minimal MigrationPolicy via API', async () => {
      const yaml = utils.MigrationPolicyFactory.createMinimal(policyName);
      const created = await apiClient.createMigrationPolicy(yamlLoad(yaml) as KubernetesResource);
      expect(created.kind).toBe('MigrationPolicy');
      expect(created.metadata.name).toBe(policyName);
    });

    await test.step('CREATE full-config MigrationPolicy via API', async () => {
      const yaml = utils.MigrationPolicyFactory.createFullConfig(
        fullPolicyName,
        true,
        false,
        '1Gi',
        1,
      );
      const created = await apiClient.createMigrationPolicy(yamlLoad(yaml) as KubernetesResource);
      expect(created.kind).toBe('MigrationPolicy');
      expect(created.spec.allowAutoConverge).toBe(true);
      expect(created.spec.bandwidthPerMigration).toBe('1Gi');
    });
  });

  test.afterAll(async ({ apiClient }) => {
    for (const name of [policyName, fullPolicyName]) {
      if (name) await apiClient.deleteMigrationPolicy(name).catch(() => undefined);
    }
  });

  test('READ: GET migration policies list includes created policies', async ({ apiClient }) => {
    const list = await apiClient.getMigrationPolicies();
    expect(list.kind).toBe('MigrationPolicyList');

    const foundMinimal = list.items.find(
      (p: KubernetesResource) => p.metadata?.name === policyName,
    );
    expect(foundMinimal, `policy ${policyName} must appear in list`).toBeDefined();

    const foundFull = list.items.find(
      (p: KubernetesResource) => p.metadata?.name === fullPolicyName,
    );
    expect(foundFull, `policy ${fullPolicyName} must appear in list`).toBeDefined();
    expect(
      ((foundFull as KubernetesResource)?.spec as { allowAutoConverge?: boolean } | undefined)
        ?.allowAutoConverge,
    ).toBe(true);
  });

  test('PATCH: update bandwidthPerMigration via JSON Patch', async ({ apiClient }) => {
    await apiClient.patchMigrationPolicy(fullPolicyName, [
      { op: 'replace', path: '/spec/bandwidthPerMigration', value: '2Gi' },
    ]);

    const list = await apiClient.getMigrationPolicies();
    const updated = list.items.find((p: KubernetesResource) => p.metadata?.name === fullPolicyName);
    expect(
      (updated?.spec as { bandwidthPerMigration?: string } | undefined)?.bandwidthPerMigration,
    ).toBe('2Gi');
  });

  test('CREATE: policy with namespace selector using factory', async ({ apiClient, utils }) => {
    const selectorPolicyName = utils.generateRandomMigrationPolicyName('test-ns');
    const yaml = utils.MigrationPolicyFactory.createWithNamespaceSelector(selectorPolicyName, {
      'kubernetes.io/metadata.name': 'default',
    });

    try {
      const created = await apiClient.createMigrationPolicy(yamlLoad(yaml) as KubernetesResource);
      expect(created.kind).toBe('MigrationPolicy');
      expect(
        (created.spec as { selectors?: { namespaceSelector?: unknown } } | undefined)?.selectors
          ?.namespaceSelector,
      ).toBeDefined();
    } finally {
      await apiClient.deleteMigrationPolicy(selectorPolicyName).catch(() => undefined);
    }
  });

  test('DELETE: remove both policies via API', async ({ apiClient }) => {
    for (const [name, label] of [
      [policyName, 'minimal'],
      [fullPolicyName, 'full-config'],
    ] as const) {
      await apiClient.deleteMigrationPolicy(name);
      const list = await apiClient.getMigrationPolicies();
      const found = list.items.find((p: KubernetesResource) => p.metadata?.name === name);
      expect(found, `${label} policy must not appear after deletion`).toBeUndefined();
    }

    policyName = '';
    fullPolicyName = '';
  });
});
