import type { KubernetesResource } from '@/data-models/kubernetes-types';
import { expect, test } from '@/fixtures/api-test-fixture';

test.describe('Bootable Volume — DataVolume CRUD API', { tag: ['@api'] }, () => {
  let dvName: string;

  test.beforeAll(async ({ testNamespace, apiClient, utils }) => {
    dvName = utils.generateRandomDataVolumeName('bv-dv');

    const spec = utils.DataVolumeFactory.createResourceObject({
      name: dvName,
      namespace: testNamespace,
      defaultInstanceType: 'u1.medium',
      defaultPreference: 'fedora',
      source: { registry: { url: 'docker://quay.io/containerdisks/fedora:latest' } },
      storage: { requests: { storage: '5Gi' } },
    });

    await test.step('CREATE DataVolume via console proxy', async () => {
      const created = await apiClient.createDataVolume(testNamespace, spec);
      expect(created.kind).toBe('DataVolume');
      expect(created.metadata.name).toBe(dvName);
    });
  });

  test.afterAll(async ({ testNamespace, apiClient }) => {
    if (dvName) {
      await apiClient.deleteDataVolume(testNamespace, dvName).catch(() => undefined);
    }
  });

  test('READ: GET DataVolume returns correct metadata and instancetype labels', async ({
    testNamespace,
    apiClient,
  }) => {
    const dv = await apiClient.getDataVolume(testNamespace, dvName);
    expect(dv.kind).toBe('DataVolume');
    expect(dv.metadata.name).toBe(dvName);
    expect(dv.metadata.labels?.['instancetype.kubevirt.io/default-instancetype']).toBe('u1.medium');
    expect(dv.metadata.labels?.['instancetype.kubevirt.io/default-preference']).toBe('fedora');
    expect(
      (dv.spec?.['source'] as { registry?: { url?: string } } | undefined)?.registry?.url,
    ).toBe('docker://quay.io/containerdisks/fedora:latest');
  });

  test('READ: DataVolume appears in namespace list', async ({ testNamespace, apiClient }) => {
    const list = await apiClient.getDataVolumes(testNamespace);
    expect(list.kind).toBe('DataVolumeList');
    const found = list.items.find((dv: KubernetesResource) => dv.metadata?.name === dvName);
    expect(found, `DataVolume ${dvName} must appear in namespace list`).toBeDefined();
  });

  test('PATCH: add label to DataVolume', async ({ testNamespace, apiClient }) => {
    await apiClient.patchDataVolume(testNamespace, dvName, [
      { op: 'add', path: '/metadata/labels/api-test', value: 'bv-crud' },
    ]);
    const updated = await apiClient.getDataVolume(testNamespace, dvName);
    expect(updated.metadata.labels?.['api-test']).toBe('bv-crud');
  });

  test('DELETE: remove DataVolume and verify response', async ({ testNamespace, apiClient }) => {
    const result = await apiClient.deleteDataVolume(testNamespace, dvName);
    expect(['DataVolume', 'Status']).toContain(result.kind);
    dvName = '';
  });
});

test.describe('Bootable Volume — DataSource CRUD API', { tag: ['@api'] }, () => {
  let dsName: string;

  test.beforeAll(async ({ testNamespace, apiClient, utils }) => {
    dsName = utils.generateRandomName('bv-ds');

    const spec = {
      apiVersion: 'cdi.kubevirt.io/v1beta1',
      kind: 'DataSource',
      metadata: {
        name: dsName,
        namespace: testNamespace,
        labels: {
          'instancetype.kubevirt.io/default-preference': 'fedora',
          'instancetype.kubevirt.io/default-instancetype': 'u1.medium',
        },
        annotations: {
          'cdi.kubevirt.io/architecture': 'amd64',
          description: 'API test DataSource for bootable volume CRUD',
        },
      },
      spec: {
        source: {
          pvc: { name: dsName, namespace: testNamespace },
        },
      },
    };

    await test.step('CREATE DataSource via console proxy', async () => {
      const created = await apiClient.createDataSource(testNamespace, spec);
      expect(created.kind).toBe('DataSource');
      expect(created.metadata.name).toBe(dsName);
    });
  });

  test.afterAll(async ({ testNamespace, apiClient }) => {
    if (dsName) {
      await apiClient.deleteDataSource(testNamespace, dsName).catch(() => undefined);
    }
  });

  test('READ: GET DataSource returns correct metadata and instancetype labels', async ({
    testNamespace,
    apiClient,
  }) => {
    const ds = await apiClient.getDataSource(testNamespace, dsName);
    expect(ds.kind).toBe('DataSource');
    expect(ds.metadata.name).toBe(dsName);
    expect(ds.metadata.labels?.['instancetype.kubevirt.io/default-preference']).toBe('fedora');
    expect(ds.metadata.labels?.['instancetype.kubevirt.io/default-instancetype']).toBe('u1.medium');
    expect(ds.metadata.annotations?.['cdi.kubevirt.io/architecture']).toBe('amd64');
  });

  test('READ: DataSource appears in namespace list', async ({ testNamespace, apiClient }) => {
    const list = await apiClient.getDataSources(testNamespace);
    expect(list.kind).toBe('DataSourceList');
    const found = list.items.find((ds: KubernetesResource) => ds.metadata?.name === dsName);
    expect(found, `DataSource ${dsName} must appear in namespace list`).toBeDefined();
  });

  test('READ: DataSource returned by default-preference label filter', async ({
    testNamespace,
    apiClient,
  }) => {
    const list = await apiClient.getDataSources(
      testNamespace,
      'instancetype.kubevirt.io/default-preference',
    );
    const found = list.items.find((ds: KubernetesResource) => ds.metadata?.name === dsName);
    expect(
      found,
      `DataSource ${dsName} must appear when filtering by default-preference label`,
    ).toBeDefined();
  });

  test('PATCH: update DataSource description annotation', async ({ testNamespace, apiClient }) => {
    await apiClient.patchDataSource(testNamespace, dsName, [
      {
        op: 'replace',
        path: '/metadata/annotations/description',
        value: 'patched-by-api-test',
      },
    ]);
    const updated = await apiClient.getDataSource(testNamespace, dsName);
    expect(updated.metadata.annotations?.description).toBe('patched-by-api-test');
  });

  test('DELETE: remove DataSource and verify response', async ({ testNamespace, apiClient }) => {
    const result = await apiClient.deleteDataSource(testNamespace, dsName);
    expect(['DataSource', 'Status']).toContain(result.kind);
    dsName = '';
  });
});
