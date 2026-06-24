/** K8s and navigation helpers for VM action specs. */

import type KubernetesClient from '@/clients/kubernetes-client';
import type { V1VirtualMachine } from '@/data-models/kubevirt-types';
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
  k8sClient: KubernetesClient,
  requiredNames: string[],
): Promise<string[]> {
  const existing = new Set(await k8sClient.getStorageClassNames());
  return requiredNames.filter((name) => !existing.has(name));
}

/**
 * Deletes storage migration plan CRs in configured namespaces.
 * Handles both the single-namespace (storagemigration.kubevirt.io) and
 * the multi-namespace variant (migrations.kubevirt.io) used by the kubevirt-plugin UI.
 */
export async function cleanupMigrationPlans(
  k8sClient: KubernetesClient,
  additionalNamespaces?: string[],
): Promise<boolean> {
  const testConfig = TestConfigManager.getConfig();
  const testNamespace = testConfig?.testNamespace || 'pw-test-ns';
  const namespacesToClean = [testNamespace, ...(additionalNamespaces ?? [])];

  if (!testConfig?.authToken) {
    return false;
  }

  const migrationCrds = [
    {
      group: 'migrations.kubevirt.io',
      version: 'v1alpha1',
      plural: 'multinamespacevirtualmachinestoragemigrationplans',
    },
    {
      group: 'storagemigration.kubevirt.io',
      version: 'v1alpha1',
      plural: 'virtualmachinestoragemigrationplans',
    },
  ];

  const cleanupResults = await Promise.allSettled(
    namespacesToClean.flatMap((namespace) =>
      migrationCrds.map(async ({ group, version, plural }) => {
        try {
          const plans = await k8sClient.listCustomResources(group, version, namespace, plural);

          if (plans.length === 0) {
            return true;
          }

          const deletionPromises = plans.map((plan: { metadata?: { name?: string } }) => {
            const name = plan.metadata?.name;
            if (!name) return Promise.resolve();
            return k8sClient
              .deleteCustomResource(group, version, namespace, plural, name)
              .catch(() => undefined);
          });

          await Promise.allSettled(deletionPromises);
          return true;
        } catch (error: unknown) {
          const err = error as { response?: { status?: number; data?: { reason?: string } } };
          if (err.response?.status === 404 && err.response?.data?.reason === 'NotFound') {
            return true;
          }
          return false;
        }
      }),
    ),
  );

  return cleanupResults.some((result) => result.status === 'fulfilled' && result.value === true);
}

/** Poll VM spec for a disk name containing `diskPattern`. */
export async function waitForVmDiskAndGetName(
  k8sClient: KubernetesClient,
  vmName: string,
  namespace: string,
  diskPattern: string,
  timeout = TestTimeouts.NAMESPACE_READY,
): Promise<null | string> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    try {
      const vm = await k8sClient.getVirtualMachine(vmName, namespace);
      const disks = (vm as V1VirtualMachine)?.spec?.template?.spec?.domain?.devices?.disks ?? [];
      for (const disk of disks) {
        if (disk.name && disk.name.includes(diskPattern)) {
          return disk.name;
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
  k8sClient: KubernetesClient,
  namespace: string,
  planNamePrefix?: string,
): Promise<null | string> {
  try {
    const plans = await k8sClient.listCustomResources(
      'migrations.kubevirt.io',
      'v1alpha1',
      namespace,
      'multinamespacevirtualmachinestoragemigrationplans',
    );
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
  k8sClient: KubernetesClient,
  namespace: string,
): Promise<number> {
  try {
    const plans = await k8sClient.listCustomResources(
      'migrations.kubevirt.io',
      'v1alpha1',
      namespace,
      'multinamespacevirtualmachinestoragemigrationplans',
    );
    return plans.length;
  } catch {
    return 0;
  }
}

/**
 * Wait until DataVolume phase is Succeeded (or same-name-as-VM DV pattern from step driver).
 */
export async function waitForDataVolumeReady(
  k8sClient: KubernetesClient,
  dataVolumeName: string,
  namespace: string,
  timeoutMs: number = TestTimeouts.DATA_VOLUME_STATUS,
): Promise<boolean> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeoutMs) {
    try {
      const dv = (await k8sClient.getCustomResource(
        'cdi.kubevirt.io',
        'v1beta1',
        namespace,
        'datavolumes',
        dataVolumeName,
      )) as { status?: { phase?: string } };
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
  k8sClient: KubernetesClient,
  cleanup: Pick<TestResourceTracker, 'trackNamespace'>,
  prefix: string,
): Promise<{ namespace: string }> {
  const namespace = `pw-${prefix}-${generateRandomString(6, 'alphanumeric').toLowerCase()}`;
  await k8sClient.createNamespace(namespace);
  await k8sClient.waitForNamespaceReady(namespace);
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
  await vmTreePage.searchTreeView(namespace);
  await vmTreePage.clickProjectNode(namespace);
  await vmTreePage.clickVmListTab();
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
    await pageCommons.projectDropdown.switchProject(namespace);
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
  k8sClient: KubernetesClient,
  cleanup: Pick<TestResourceTracker, 'trackVirtualMachine'>,
  namespace: string,
  prefix: string,
  templateMetadataName: string,
  options: {
    start?: boolean;
    waitTimeout?: number;
    storageClassName?: string;
  } = {},
): Promise<{ vmName: string }> {
  const vmName = `pw-${prefix}-${generateRandomString(6, 'alphanumeric').toLowerCase()}`;
  const start = options.start !== false;
  await k8sClient.createVmFromTemplate(
    templateMetadataName,
    vmName,
    namespace,
    'openshift',
    start,
    undefined,
    undefined,
    undefined,
    options.storageClassName,
  );
  if (start && options.waitTimeout != null) {
    await waitForVirtualMachineReady(k8sClient, vmName, namespace, options.waitTimeout);
  }
  cleanup.trackVirtualMachine(vmName, namespace);
  return { vmName };
}
