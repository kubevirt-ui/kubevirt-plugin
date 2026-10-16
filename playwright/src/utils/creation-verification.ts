import type RequestContextClient from '@/clients/request-context-client';
import type { DataSourcesPage } from '@/page-objects/datasources-page';
import type { MigrationPoliciesPage } from '@/page-objects/migration-policies-page';
import type { TemplatesPage } from '@/page-objects/templates-page';
import type { VmDetailPage } from '@/page-objects/vm-detail-page';
import type { VmListPage } from '@/page-objects/vm-list-page';
import { TestTimeouts } from '@/utils/test-config';
import { expect } from '@playwright/test';

async function expectCrdOnApi(
  description: string,
  exists: () => Promise<boolean>,
  timeout = TestTimeouts.RESOURCE_CREATION,
): Promise<void> {
  await expect
    .poll(exists, { message: `Kubernetes API: ${description} should exist`, timeout })
    .toBe(true);
}

/** List row visible in the namespace VM list + VirtualMachine CR present on the API. */
export async function verifyVirtualMachineCreated(
  apiClient: RequestContextClient,
  vmList: VmListPage,
  namespace: string,
  name: string,
): Promise<void> {
  await expectCrdOnApi(
    `VirtualMachine ${namespace}/${name}`,
    () => apiClient.virtualMachineExists(name, namespace),
    TestTimeouts.VM_CREATION,
  );
  await vmList.goToNamespaceList(namespace);
  await vmList.filterByName(name);
  await expect
    .poll(async () => vmList.vmRow(name, namespace).isVisible(), {
      message: `VM list should show ${namespace}/${name}`,
      timeout: TestTimeouts.LONG_OPERATION,
    })
    .toBe(true);
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
  await vmDetail.openVmAndExpectDetail(namespace, name);
}

/** DataSource row on list + CR present on the API. */
export async function verifyDataSourceCreated(
  apiClient: RequestContextClient,
  ds: DataSourcesPage,
  namespace: string,
  name: string,
): Promise<void> {
  await expectCrdOnApi(`DataSource ${namespace}/${name}`, () =>
    apiClient.dataSourceExists(name, namespace),
  );
  await ds.goToNamespaceList(namespace);
  await ds.filterByName(name);
  await expect
    .poll(async () => ds.nameLink(name).isVisible(), {
      message: `DataSource list should show ${namespace}/${name}`,
      timeout: TestTimeouts.LONG_OPERATION,
    })
    .toBe(true);
}

/** Template row on list + Template CR present on the API. */
export async function verifyOpenshiftTemplateCreated(
  apiClient: RequestContextClient,
  templates: TemplatesPage,
  namespace: string,
  name: string,
): Promise<void> {
  await expectCrdOnApi(`Template ${namespace}/${name}`, () =>
    apiClient.openshiftTemplateExists(name, namespace),
  );
  // 4.12 plugin lands on `/templates/<name>`; OpenShift Template list may have no name filter.
  await templates.openPluginTemplate(namespace, name);
  await expect(templates.pluginTemplateHeading(name)).toBeVisible({
    timeout: TestTimeouts.RESOURCE_CREATION,
  });
}

/** MigrationPolicy list row, detail title, and cluster-scoped CR on the API. */
export async function verifyMigrationPolicyCreated(
  apiClient: RequestContextClient,
  mp: MigrationPoliciesPage,
  name: string,
): Promise<void> {
  await expectCrdOnApi(`MigrationPolicy ${name}`, () => apiClient.migrationPolicyExists(name));
  if (mp.isOnMigrationPolicyDetail(name)) {
    await expect(mp.migrationPolicyDetailName(name)).toBeVisible({
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
  }
  await mp.goToList();
  await mp.filterByName(name);
  await expect
    .poll(async () => mp.row(name).isVisible(), {
      message: `MigrationPolicy list should show ${name}`,
      timeout: TestTimeouts.LONG_OPERATION,
    })
    .toBe(true);
  await mp.openDetail(name);
  await expect(mp.migrationPolicyDetailName(name)).toBeVisible({
    timeout: TestTimeouts.ELEMENT_WAIT,
  });
}
