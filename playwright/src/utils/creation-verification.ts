import type RequestContextClient from '@/clients/request-context-client';
import type { DataSourcesPage } from '@/page-objects/datasources-page';
import type { MigrationPoliciesPage } from '@/page-objects/migration-policies-page';
import type { TemplatesPage } from '@/page-objects/templates-page';
import type { VmDetailPage } from '@/page-objects/vm-detail-page';
import type { VmListPage } from '@/page-objects/vm-list-page';
import { pollUntil } from '@/utils/poll-until';
import { TestTimeouts } from '@/utils/test-config';

async function waitForCrdOnApi(
  description: string,
  exists: () => Promise<boolean>,
  timeout = TestTimeouts.RESOURCE_CREATION,
): Promise<void> {
  await pollUntil(exists, {
    message: `Kubernetes API: ${description} should exist`,
    timeout,
  });
}

function isOnVirtualMachineDetail(vmList: VmListPage, namespace: string, name: string): boolean {
  const url = vmList.currentUrl();
  return vmList.virtualMachineDetailUrlPattern(name).test(url) && url.includes(`/ns/${namespace}/`);
}

/** List row visible in the namespace VM list + VirtualMachine CR present on the API. */
export async function verifyVirtualMachineCreated(
  apiClient: RequestContextClient,
  vmList: VmListPage,
  namespace: string,
  name: string,
): Promise<void> {
  await waitForCrdOnApi(
    `VirtualMachine ${namespace}/${name}`,
    () => apiClient.virtualMachineExists(name, namespace),
    TestTimeouts.VM_CREATION,
  );
  // Import YAML lands on detail; skip list round-trip (flaky under parallel CI load).
  if (isOnVirtualMachineDetail(vmList, namespace, name)) {
    await vmList.resourceDetailHeading(name).waitFor({
      state: 'visible',
      timeout: TestTimeouts.LONG_OPERATION,
    });
    return;
  }
  await vmList.goToNamespaceList(namespace);
  await vmList.waitForVmRowInList(name, namespace);
}

/** VM list + API verification, then open the VM detail page. */
export async function verifyVirtualMachineCreatedAndOpenDetail(
  apiClient: RequestContextClient,
  vmList: VmListPage,
  vmDetail: VmDetailPage,
  namespace: string,
  name: string,
): Promise<void> {
  await verifyVirtualMachineCreated(apiClient, vmList, namespace, name);
  await vmDetail.openVm(namespace, name);
  await vmDetail.detailHeading().waitFor({
    state: 'visible',
    timeout: TestTimeouts.LONG_OPERATION,
  });
}

/** DataSource row on list + CR present on the API. */
export async function verifyDataSourceCreated(
  apiClient: RequestContextClient,
  ds: DataSourcesPage,
  namespace: string,
  name: string,
): Promise<void> {
  await waitForCrdOnApi(`DataSource ${namespace}/${name}`, () =>
    apiClient.dataSourceExists(name, namespace),
  );
  await ds.goToNamespaceList(namespace);
  await ds.filterByName(name);
  await pollUntil(async () => ds.nameLink(name).isVisible(), {
    message: `DataSource list should show ${namespace}/${name}`,
    timeout: TestTimeouts.LONG_OPERATION,
  });
}

/** Template row on list + Template CR present on the API. */
export async function verifyOpenshiftTemplateCreated(
  apiClient: RequestContextClient,
  templates: TemplatesPage,
  namespace: string,
  name: string,
): Promise<void> {
  await waitForCrdOnApi(`Template ${namespace}/${name}`, () =>
    apiClient.openshiftTemplateExists(name, namespace),
  );
  await templates.openPluginTemplate(namespace, name);
  await templates.pluginTemplateHeading(name).waitFor({
    state: 'visible',
    timeout: TestTimeouts.RESOURCE_CREATION,
  });
}

/** MigrationPolicy list row, detail title, and cluster-scoped CR on the API. */
export async function verifyMigrationPolicyCreated(
  apiClient: RequestContextClient,
  mp: MigrationPoliciesPage,
  name: string,
): Promise<void> {
  await waitForCrdOnApi(`MigrationPolicy ${name}`, () => apiClient.migrationPolicyExists(name));
  if (mp.isOnMigrationPolicyDetail(name)) {
    await mp.migrationPolicyDetailName(name).waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
  }
  await mp.goToList();
  await mp.filterByName(name);
  await pollUntil(async () => mp.row(name).isVisible(), {
    message: `MigrationPolicy list should show ${name}`,
    timeout: TestTimeouts.LONG_OPERATION,
  });
  await mp.openDetail(name);
  await mp.migrationPolicyDetailName(name).waitFor({
    state: 'visible',
    timeout: TestTimeouts.ELEMENT_WAIT,
  });
}
