/** K8s and navigation helpers for VM action specs. */

import type RequestContextClient from '@/clients/request-context-client';
import type CreateVmCreatePage from '@/page-objects/create-vm/create-vm-create-page';
import type CreateVmTemplatesPage from '@/page-objects/create-vm/create-vm-templates-page';
import type PageCommons from '@/page-objects/page-commons';
import type VmTreePage from '@/page-objects/vm/vm-tree-page';
import { EnvVariables } from '@/utils/env-variables';
import { generateRandomString } from '@/utils/random-data-generator';
import { TestConfigManager, TestTimeouts } from '@/utils/test-config';
import type { TestResourceTracker } from '@/utils/test-resource-tracker';
import { waitForVirtualMachineReady } from '@/utils/vm-k8s-waits';

/**
 * Returns required StorageClass names that are not present in the cluster.
 */
export async function getMissingStorageClasses(
  client: RequestContextClient,
  requiredNames: string[],
): Promise<string[]> {
  const scList = await client.getStorageClasses();
  const existing = new Set(
    (scList.items ?? []).map((sc) => sc.metadata?.name).filter(Boolean) as string[],
  );
  return requiredNames.filter((name) => !existing.has(name));
}

/**
 * Deletes storage migration plans in configured + optional namespaces.
 * Targets both the namespaced VirtualMachineStorageMigrationPlan CRD and
 * the multi-namespace variant used by the kubevirt-plugin UI.
 */
export async function cleanupMigrationPlans(
  client: RequestContextClient,
  additionalNamespaces?: string[],
): Promise<boolean> {
  const testConfig = TestConfigManager.getConfig();
  const testNamespace = testConfig?.testNamespace || 'pw-test-ns';
  const namespacesToClean = [testNamespace, ...(additionalNamespaces ?? [])];

  if (!testConfig?.authToken) {
    return false;
  }

  const migrationKinds = [
    'MultiNamespaceVirtualMachineStorageMigrationPlan',
    'VirtualMachineStorageMigrationPlan',
  ];

  const cleanupResults = await Promise.allSettled(
    namespacesToClean.flatMap((namespace) =>
      migrationKinds.map(async (kind) => {
        try {
          const result = await client.listResourcesByKind(kind, namespace);
          const plans = result.items || [];

          if (plans.length === 0) {
            return true;
          }

          const deletionPromises = plans.map((plan: { metadata?: { name?: string } }) => {
            const name = plan.metadata?.name;
            if (!name) return Promise.resolve();
            return client.deleteResourceByKind(kind, name, namespace).catch(() => undefined);
          });

          await Promise.allSettled(deletionPromises);
          return true;
        } catch (error: unknown) {
          const err = error as { response?: { status?: number; data?: { reason?: string } } };
          if (err.response?.status === 404 && err.response?.data?.reason === 'NotFound') {
            return true;
          }
          const msg = error instanceof Error ? error.message : String(error);
          if (msg.includes('404') || msg.includes('NotFound')) {
            return true;
          }
          return false;
        }
      }),
    ),
  );

  return cleanupResults.some((result) => result.status === 'fulfilled' && result.value === true);
}

/**
 * Poll for a VirtualMachineStorageMigrationPlan CR in the given namespace.
 * Returns plan metadata once found, or null on timeout.
 */
export async function waitForMigrationPlanCreated(
  client: RequestContextClient,
  namespace: string,
  timeout = TestTimeouts.VM_RUNNING,
): Promise<{ name: string; retentionPolicy?: string } | null> {
  const migrationKinds = [
    'MultiNamespaceVirtualMachineStorageMigrationPlan',
    'VirtualMachineStorageMigrationPlan',
  ];

  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    for (const kind of migrationKinds) {
      try {
        const result = await client.listResourcesByKind(kind, namespace);
        const plans = result.items || [];
        if (plans.length > 0) {
          const plan = plans[0] as {
            metadata?: { name?: string };
            spec?: { namespaces?: Array<{ retentionPolicy?: string }> };
          };
          const name = plan.metadata?.name ?? 'unknown';
          const retentionPolicy = plan.spec?.namespaces?.[0]?.retentionPolicy ?? undefined;
          return { name, retentionPolicy };
        }
      } catch {
        // CRD not installed — try next
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  return null;
}

/** Poll VM spec for a disk name containing `diskPattern`. */
export async function waitForVmDiskAndGetName(
  client: RequestContextClient,
  vmName: string,
  namespace: string,
  diskPattern: string,
  timeout = TestTimeouts.NAMESPACE_READY,
): Promise<string | null> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    try {
      const vm = (await client.getVirtualMachine(namespace, vmName)) as Record<
        string,
        unknown
      > | null;
      const vmSpec = vm?.spec as Record<string, unknown> | undefined;
      const vmTemplate = vmSpec?.template as Record<string, unknown> | undefined;
      const vmTemplateSpec = vmTemplate?.spec as Record<string, unknown> | undefined;
      const vmDomain = vmTemplateSpec?.domain as Record<string, unknown> | undefined;
      const vmDevices = vmDomain?.devices as Record<string, unknown> | undefined;
      const disks = (vmDevices?.disks as Array<Record<string, unknown>>) || [];
      for (const disk of disks) {
        if (disk.name && String(disk.name).includes(diskPattern)) {
          return String(disk.name);
        }
      }
    } catch {
      /* poll */
    }
    await new Promise((resolve) => setTimeout(resolve, TestTimeouts.POLLING_INTERVAL));
  }
  return null;
}

export async function getMigrationPlanRetentionPolicy(
  client: RequestContextClient,
  namespace: string,
  planNamePrefix?: string,
): Promise<string | null> {
  try {
    const result = await client.listResourcesByKind(
      'MultiNamespaceVirtualMachineStorageMigrationPlan',
      namespace,
    );
    const plans = result.items || [];
    const matching = planNamePrefix
      ? plans.filter((p: { metadata?: { name?: string } }) =>
          p.metadata?.name?.startsWith(planNamePrefix),
        )
      : plans;
    if (matching.length === 0) return null;
    const namespaces =
      (matching[0] as { spec?: { namespaces?: Array<{ retentionPolicy?: string }> } })?.spec
        ?.namespaces || [];
    return namespaces[0]?.retentionPolicy || null;
  } catch {
    return null;
  }
}

export async function getMigrationPlanCount(
  client: RequestContextClient,
  namespace: string,
): Promise<number> {
  try {
    const result = await client.listResourcesByKind(
      'MultiNamespaceVirtualMachineStorageMigrationPlan',
      namespace,
    );
    return (result.items || []).length;
  } catch {
    return 0;
  }
}

/**
 * Wait until DataVolume phase is Succeeded (or same-name-as-VM DV pattern from step driver).
 */
export async function waitForDataVolumeReady(
  client: RequestContextClient,
  dataVolumeName: string,
  namespace: string,
  timeoutMs: number = TestTimeouts.DATA_VOLUME_STATUS,
): Promise<boolean> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeoutMs) {
    try {
      const dv = (await client.getDataVolume(namespace, dataVolumeName)) as {
        status?: { phase?: string };
      };
      if (dv?.status?.phase === 'Succeeded') {
        return true;
      }
    } catch {
      /* poll */
    }
    await new Promise((resolve) => setTimeout(resolve, TestTimeouts.SHORT_WAIT));
  }
  throw new Error(`DataVolume ${dataVolumeName} did not become ready within ${timeoutMs}ms`);
}

/**
 * Namespace `pw-${prefix}-<random>` plus RBAC-free create; tracks cleanup.
 */
export async function setupPwTestNamespace(
  client: RequestContextClient,
  cleanup: Pick<TestResourceTracker, 'trackNamespace'>,
  prefix: string,
): Promise<{ namespace: string }> {
  const namespace = `pw-${prefix}-${generateRandomString(6, 'alphanumeric').toLowerCase()}`;
  await client.ensureNamespace(namespace);
  await client.waitForNamespaceReady(namespace);
  cleanup.trackNamespace(namespace);
  return { namespace };
}

export function createPwPrefixedName(prefix: string): { name: string } {
  return { name: `pw-${prefix}-${generateRandomString(8, 'alphanumeric').toLowerCase()}` };
}

export async function navigateToVirtualMachinesWithEmptyProjectsInTree(
  vmTreePage: VmTreePage,
  defaultNamespace: string,
): Promise<void> {
  await vmTreePage.navigateToNamespaceVirtualMachinesViaUI(defaultNamespace);
  await vmTreePage.toggleEmptyProjectsDisplay(true);
}

/** Opens the VM list tab for a project in the tree view. */
export async function navigateToProjectVmListForNamespace(
  vmTreePage: VmTreePage,
  namespace: string,
): Promise<void> {
  try {
    await vmTreePage.searchTreeView(namespace);
    await vmTreePage.clickProjectNode(namespace);
    await vmTreePage.clickVmListTab();
  } catch {
    await vmTreePage.navigateToNamespaceVirtualMachines(namespace);
    await vmTreePage.clickVmListTab();
  }
}

export async function navigateToProjectVmListViaUI(
  vmTreePage: VmTreePage,
  defaultNamespace: string,
  projectNamespace: string,
): Promise<void> {
  await navigateToVirtualMachinesWithEmptyProjectsInTree(vmTreePage, defaultNamespace);
  await navigateToProjectVmListForNamespace(vmTreePage, projectNamespace);
}

/** Creates a VM via the catalog template UI flow. */
export async function createVmFromTemplateCatalogFlow(
  pageCommons: PageCommons,
  catalogTemplates: CreateVmTemplatesPage,
  createSection: CreateVmCreatePage,
  cleanup: Pick<TestResourceTracker, 'trackVirtualMachine'>,
  namespace: string,
  templateMetadataName: string,
  vmName: string,
  userTemplate: boolean,
  startAfterCreation: boolean,
): Promise<void> {
  if (!EnvVariables.onAcm) {
    await pageCommons.switchProject(namespace);
  }

  await catalogTemplates.clickTemplatesTab();

  if (userTemplate) {
    await catalogTemplates.clickUserProvidedTab();
  }

  await catalogTemplates.searchTemplate(templateMetadataName);
  await catalogTemplates.clickTemplateByMetadataName(templateMetadataName);
  await catalogTemplates.waitForTemplateForm();
  await createSection.fillTemplateCatalogVmName(vmName);

  if (startAfterCreation) {
    await createSection.clickStartAfterCreationCheckbox();
  } else {
    await createSection.uncheckStartAfterCreationCheckbox();
  }

  await createSection.clickQuickCreateVmButton();
  cleanup.trackVirtualMachine(vmName, namespace);
}

export function createStagedVmName(prefix: string): { vmName: string } {
  return { vmName: `pw-${prefix}-${generateRandomString(6, 'alphanumeric').toLowerCase()}` };
}

/** Creates a VM from a template via API in an existing namespace. */
export async function createVmFromTemplateInNamespace(
  client: RequestContextClient,
  cleanup: Pick<TestResourceTracker, 'trackVirtualMachine'>,
  namespace: string,
  prefix: string,
  templateMetadataName: string,
  options: {
    start?: boolean;
    waitTimeout?: number;
  } = {},
): Promise<{ vmName: string }> {
  const vmName = `pw-${prefix}-${generateRandomString(6, 'alphanumeric').toLowerCase()}`;
  const start = options.start !== false;
  await client.createVmFromTemplate(templateMetadataName, vmName, namespace, 'openshift', start);
  if (start && options.waitTimeout != null) {
    await waitForVirtualMachineReady(client, vmName, namespace, options.waitTimeout);
  }
  cleanup.trackVirtualMachine(vmName, namespace);
  return { vmName };
}
