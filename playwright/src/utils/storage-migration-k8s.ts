import type RequestContextClient from '@/clients/request-context-client';
import { assertValidStorageClassName } from '@/utils/k8s-resource-names';
import { pollUntil } from '@/utils/poll-until';
import { SECOND, TestTimeouts } from '@/utils/test-config';

const MIGRATIONS_GROUP = 'migrations.kubevirt.io';
const MIGRATIONS_VERSION = 'v1alpha1';

export async function getStorageClassNames(apiClient: RequestContextClient): Promise<string[]> {
  return apiClient.listStorageClassNames();
}

export async function getMissingStorageClassNames(
  apiClient: RequestContextClient,
  requiredNames: string[],
): Promise<string[]> {
  const existing = new Set(await getStorageClassNames(apiClient));
  return requiredNames.filter((name) => !existing.has(name));
}

/** `E2E_STORAGE_MIGRATION_DEST` or first StorageClass different from the VM default. */
export async function resolveStorageMigrationDestinationClass(
  apiClient: RequestContextClient,
): Promise<string | undefined> {
  const fromEnv =
    process.env.E2E_STORAGE_MIGRATION_DEST?.trim() ||
    process.env.E2E_VOL_DESTINATION_STORAGE_CLASS?.trim();
  if (fromEnv) {
    return assertValidStorageClassName(fromEnv);
  }
  const names = await getStorageClassNames(apiClient);
  if (names.length < 2) {
    return undefined;
  }
  const defaultSc = await apiClient.resolveStorageClassName();
  const alternate = names.find((name) => name !== defaultSc);
  return alternate ? assertValidStorageClassName(alternate) : undefined;
}

export async function cleanupTestStorageMigrationPlans(
  apiClient: RequestContextClient,
  namespace: string,
): Promise<void> {
  const plurals = [
    'multinamespacevirtualmachinestoragemigrationplans',
    'virtualmachinestoragemigrationplans',
  ];
  for (const plural of plurals) {
    const plans = await apiClient.listNamespacedCustomResources(
      MIGRATIONS_GROUP,
      MIGRATIONS_VERSION,
      namespace,
      plural,
    );
    await Promise.allSettled(
      plans
        .map((plan) => plan.metadata?.name)
        .filter((name): name is string => Boolean(name))
        .map((name) =>
          apiClient
            .deleteNamespacedCustomResource(
              MIGRATIONS_GROUP,
              MIGRATIONS_VERSION,
              namespace,
              plural,
              name,
            )
            .catch(() => undefined),
        ),
    );
  }
}

export async function getStorageMigrationPlanRetentionPolicy(
  apiClient: RequestContextClient,
  namespace: string,
): Promise<string | null> {
  try {
    const plans = await apiClient.listNamespacedCustomResources(
      MIGRATIONS_GROUP,
      MIGRATIONS_VERSION,
      namespace,
      'multinamespacevirtualmachinestoragemigrationplans',
    );
    if (plans.length === 0) {
      return null;
    }
    const namespaces =
      (plans[0] as { spec?: { namespaces?: Array<{ retentionPolicy?: string }> } })?.spec
        ?.namespaces ?? [];
    return namespaces[0]?.retentionPolicy ?? null;
  } catch {
    return null;
  }
}

export async function getStorageMigrationPlanCount(
  apiClient: RequestContextClient,
  namespace: string,
): Promise<number> {
  const plurals = [
    'multinamespacevirtualmachinestoragemigrationplans',
    'virtualmachinestoragemigrationplans',
  ];
  let total = 0;
  for (const plural of plurals) {
    const plans = await apiClient.listNamespacedCustomResources(
      MIGRATIONS_GROUP,
      MIGRATIONS_VERSION,
      namespace,
      plural,
    );
    total += plans.filter(
      (plan) =>
        !(plan as { metadata?: { deletionTimestamp?: string } }).metadata?.deletionTimestamp,
    ).length;
  }
  return total;
}

export async function waitForStorageMigrationPlanCount(
  apiClient: RequestContextClient,
  namespace: string,
  expectedCount: number,
  timeoutMs = TestTimeouts.BULK_VM_OPERATION,
): Promise<void> {
  await pollUntil(
    async () => (await getStorageMigrationPlanCount(apiClient, namespace)) === expectedCount,
    {
      message: `Storage migration plan count in ${namespace} should be ${expectedCount}`,
      timeout: timeoutMs,
    },
  );
}

export async function waitForVirtualMachineStopped(
  apiClient: RequestContextClient,
  namespace: string,
  name: string,
  timeoutMs = TestTimeouts.VM_CREATION,
): Promise<void> {
  await pollUntil(
    async () => {
      const vm = await apiClient.getVirtualMachine(namespace, name);
      return vm?.status?.printableStatus === 'Stopped';
    },
    { message: `VM ${namespace}/${name} should be Stopped`, timeout: timeoutMs },
  );
}

/** Root DataVolume PVC name matches VM name in `virtualMachineManifest`. */
export async function getRootDiskPvcStorageClass(
  apiClient: RequestContextClient,
  namespace: string,
  vmName: string,
): Promise<string | undefined> {
  return apiClient.getPersistentVolumeClaimStorageClass(namespace, vmName);
}

export async function waitForDataVolumeVmReady(
  apiClient: RequestContextClient,
  namespace: string,
  name: string,
  timeoutMs = TestTimeouts.VM_BOOTUP,
): Promise<void> {
  await apiClient.waitForPersistentVolumeClaimBound(name, namespace, timeoutMs);
  await pollUntil(
    async () => {
      const vm = await apiClient.getVirtualMachine(namespace, name);
      const status = vm?.status?.printableStatus;
      return status === 'Stopped' || status === 'Running' || status === 'Starting';
    },
    {
      message: `DataVolume VM ${namespace}/${name} should leave Provisioning`,
      timeout: timeoutMs,
    },
  );
}

export const STORAGE_MIGRATION_POLL_MS = 2 * SECOND;
