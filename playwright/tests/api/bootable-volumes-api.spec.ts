import { expect, test } from '@/fixtures/api-test-fixture';
import { assertList } from '@/utils/api-assertions';

test.describe('Bootable volumes page — API endpoints', { tag: ['@api'] }, () => {
  test('GET DataSources (ns-scoped) with default-preference label returns list', async ({
    apiClient,
    testNamespace,
  }) => {
    const body = await apiClient.getDataSources(
      testNamespace,
      'instancetype.kubevirt.io/default-preference',
    );
    assertList(body, 'DataSourceList');
  });

  test('GET DataImportCrons (ns-scoped) returns list', async ({ apiClient, testNamespace }) => {
    const body = await apiClient.getDataImportCrons(testNamespace);
    assertList(body, 'DataImportCronList');
  });

  test('GET DataVolumes (ns-scoped) returns list', async ({ apiClient, testNamespace }) => {
    const body = await apiClient.getDataVolumes(testNamespace);
    assertList(body, 'DataVolumeList');
  });

  test('GET PersistentVolumeClaims (ns-scoped) returns list', async ({
    apiClient,
    testNamespace,
  }) => {
    const body = await apiClient.getPersistentVolumeClaims(testNamespace);
    assertList(body, 'PersistentVolumeClaimList');
  });

  test('GET VolumeSnapshots (ns-scoped) returns list', async ({ apiClient, testNamespace }) => {
    const body = await apiClient.getVolumeSnapshots(testNamespace);
    assertList(body, 'VolumeSnapshotList');
  });

  test('GET VirtualMachineClusterPreferences returns list', async ({ apiClient }) => {
    const body = await apiClient.getVirtualMachineClusterPreferences();
    assertList(body, 'VirtualMachineClusterPreferenceList');
  });

  test('GET CDI config singleton is readable', async ({ apiClient }) => {
    const body = await apiClient.getCdiConfig();
    expect(body.kind, 'kind must be CDIConfig').toBe('CDIConfig');
    expect(body.metadata?.name, 'name must be config').toBe('config');
  });
});
