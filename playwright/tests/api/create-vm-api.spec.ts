import { expect, test } from '@/fixtures/api-test-fixture';
import { assertList } from '@/utils/api-assertions';

const OS_IMAGES_NS = 'openshift-virtualization-os-images';

const WELL_KNOWN_OS_DATASOURCES = ['fedora', 'rhel9', 'rhel8', 'centos-stream9'] as const;

test.describe('VM Creation — API endpoints', { tag: ['@api'] }, () => {
  test('GET VirtualMachineClusterInstanceTypes returns list', async ({ apiClient }) => {
    const body = await apiClient.getVirtualMachineClusterInstanceTypes();
    assertList(body, 'VirtualMachineClusterInstancetypeList');
    expect(body.items.length, 'at least one cluster instance type must exist').toBeGreaterThan(0);
  });

  test('GET VirtualMachineClusterPreferences returns list', async ({ apiClient }) => {
    const body = await apiClient.getVirtualMachineClusterPreferences();
    assertList(body, 'VirtualMachineClusterPreferenceList');
    expect(body.items.length, 'at least one cluster preference must exist').toBeGreaterThan(0);
  });

  test('GET VirtualMachineInstanceTypes (ns-scoped) returns list', async ({
    apiClient,
    testNamespace,
  }) => {
    const body = await apiClient.getVirtualMachineInstanceTypes(testNamespace);
    assertList(body, 'VirtualMachineInstancetypeList');
  });

  test('GET VirtualMachinePreferences (ns-scoped) returns list', async ({
    apiClient,
    testNamespace,
  }) => {
    const body = await apiClient.getVirtualMachinePreferences(testNamespace);
    assertList(body, 'VirtualMachinePreferenceList');
  });

  test('GET templates with catalog label selector returns TemplateList', async ({ apiClient }) => {
    const body = await apiClient.getTemplates(undefined, 'template.kubevirt.io/type in (base,vm)');
    assertList(body, 'TemplateList');
  });

  test('GET DataSources filtered by default-preference label returns list', async ({
    apiClient,
  }) => {
    const body = await apiClient.getDataSources(
      undefined,
      'instancetype.kubevirt.io/default-preference',
    );
    assertList(body, 'DataSourceList');
  });

  test('GET DataImportCrons (cluster-wide) returns list', async ({ apiClient }) => {
    const body = await apiClient.getDataImportCrons();
    assertList(body, 'DataImportCronList');
  });

  test('GET DataVolumes (cluster-wide) returns list', async ({ apiClient }) => {
    const body = await apiClient.getDataVolumes();
    assertList(body, 'DataVolumeList');
  });

  test('GET StorageProfiles returns list', async ({ apiClient }) => {
    const body = await apiClient.getStorageProfiles();
    assertList(body, 'StorageProfileList');
  });

  for (const osName of WELL_KNOWN_OS_DATASOURCES) {
    test(`GET DataSource ${osName} from os-images namespace is readable`, async ({ apiClient }) => {
      const body = await apiClient.getDataSource(OS_IMAGES_NS, osName);
      expect(body.kind, 'kind must be DataSource').toBe('DataSource');
      expect(body.metadata?.name, `name must be ${osName}`).toBe(osName);
    });
  }
});
