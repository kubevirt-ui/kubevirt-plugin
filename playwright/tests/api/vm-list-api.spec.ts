import { expect, test } from '@/fixtures/api-test-fixture';
import { assertList } from '@/utils/api-assertions';

test.describe('VirtualMachines list page — API endpoints', { tag: ['@api'] }, () => {
  test('GET virtualmachines (cluster-wide) returns VirtualMachineList', async ({ apiClient }) => {
    const body = await apiClient.getVirtualMachines();
    assertList(body, 'VirtualMachineList');
  });

  test('GET virtualmachineinstances (cluster-wide) returns VirtualMachineInstanceList', async ({
    apiClient,
  }) => {
    const body = await apiClient.getVirtualMachineInstances();
    assertList(body, 'VirtualMachineInstanceList');
  });

  test('GET virtualmachineinstancemigrations (cluster-wide) returns VirtualMachineInstanceMigrationList', async ({
    apiClient,
  }) => {
    const body = await apiClient.getVirtualMachineInstanceMigrations();
    assertList(body, 'VirtualMachineInstanceMigrationList');
  });

  test('GET hyperconvergeds returns HyperConvergedList with at least one item', async ({
    apiClient,
  }) => {
    const body = await apiClient.getHyperConvergeds();
    assertList(body, 'HyperConvergedList');
    expect(body.items.length, 'at least one HyperConverged CR must exist').toBeGreaterThan(0);
  });

  test('GET kubevirt CR returns KubeVirt object', async ({ apiClient }) => {
    const body = await apiClient.getKubeVirt();
    expect(body.kind, 'kind must be KubeVirt').toBe('KubeVirt');
    expect(body.metadata?.name, 'name must be kubevirt-kubevirt-hyperconverged').toBe(
      'kubevirt-kubevirt-hyperconverged',
    );
    expect(body.status?.phase, 'phase must be Deployed').toBe('Deployed');
  });

  test('GET kubevirt-ui-features configmap is readable', async ({ apiClient }) => {
    const body = await apiClient.getKubeVirtUiFeatures();
    expect(body.kind, 'kind must be ConfigMap').toBe('ConfigMap');
    expect(body.metadata?.name, 'name must match').toBe('kubevirt-ui-features');
  });

  test('GET kubevirt-user-settings configmap is readable', async ({ apiClient }) => {
    const body = await apiClient.getKubeVirtUserSettings();
    expect(body.kind, 'kind must be ConfigMap').toBe('ConfigMap');
    expect(body.metadata?.name, 'name must match').toBe('kubevirt-user-settings');
  });

  test('GET migration policies returns MigrationPolicyList', async ({ apiClient }) => {
    const body = await apiClient.getMigrationPolicies();
    assertList(body, 'MigrationPolicyList');
  });

  test('GET storage migration plans (cluster-wide) returns MultiNamespaceVirtualMachineStorageMigrationPlanList', async ({
    apiClient,
  }) => {
    const body = await apiClient.getStorageMigrationPlans();
    assertList(body, 'MultiNamespaceVirtualMachineStorageMigrationPlanList');
  });

  test('GET templates with kubevirt label selector returns TemplateList', async ({ apiClient }) => {
    const body = await apiClient.getTemplates(undefined, 'template.kubevirt.io/type');
    assertList(body, 'TemplateList');
  });

  test('GET plugin health endpoint returns 200', async ({ apiClient }) => {
    const healthy = await apiClient.checkPluginHealth();
    expect(healthy, 'kubevirt-plugin apiserver proxy must be healthy').toBe(true);
  });
});
