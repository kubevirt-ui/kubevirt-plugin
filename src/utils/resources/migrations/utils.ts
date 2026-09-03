import { getStatusNamespaces } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import {
  type MultiNamespaceVirtualMachineStorageMigrationPlan,
  STATUS_READY,
  STORAGE_MIGRATION_PHASE,
} from './constants';
import { getStorageMigrationPlanSpecNamespaces } from './selectors';

const getMigrationConditionTimestamp = (
  migration: MultiNamespaceVirtualMachineStorageMigrationPlan,
  conditionType: string,
): string | undefined => {
  for (const namespaceStatus of migration?.status?.namespaces ?? []) {
    const condition = namespaceStatus?.conditions?.find((cond) => cond?.type === conditionType);
    if (condition) {
      return condition.lastTransitionTime;
    }
  }
  return undefined;
};

export const getMigrationStartTimestamp = (
  migration: MultiNamespaceVirtualMachineStorageMigrationPlan,
): string | undefined => getMigrationConditionTimestamp(migration, STATUS_READY);

export const getMigrationCompletedTimestamp = (
  migration: MultiNamespaceVirtualMachineStorageMigrationPlan,
): string | undefined => {
  if (!isMigrationCompleted(migration)) {
    return undefined;
  }
  return getMigrationConditionTimestamp(migration, STATUS_READY);
};

export const getVolumeCountFromMigPlan = (
  migrationPlan: MultiNamespaceVirtualMachineStorageMigrationPlan,
): number => {
  return getStorageMigrationPlanSpecNamespaces(migrationPlan).flatMap((namespaceMigration) =>
    (namespaceMigration?.virtualMachines ?? []).flatMap((vm) =>
      (vm?.targetMigrationPVCs ?? []).filter((pvc) => !isEmpty(pvc.destinationPVC)),
    ),
  ).length;
};

export const getCompletedVolumeCountFromMigPlan = (
  migrationPlan: MultiNamespaceVirtualMachineStorageMigrationPlan,
): number =>
  (migrationPlan?.status?.namespaces ?? []).flatMap((namespace) =>
    (namespace?.[STORAGE_MIGRATION_PHASE.COMPLETED] ?? []).flatMap(
      (migration) => migration?.sourcePVCs ?? [],
    ),
  ).length;

export const isMigrationCompleted = (
  migrationPlan: MultiNamespaceVirtualMachineStorageMigrationPlan,
): boolean => {
  const statusNamespaces = getStatusNamespaces(migrationPlan);
  const specNamespaces = getStorageMigrationPlanSpecNamespaces(migrationPlan);

  if (!statusNamespaces?.length || statusNamespaces.length !== specNamespaces.length) return false;

  return statusNamespaces.every(
    (namespaceStatus, index) =>
      namespaceStatus?.[STORAGE_MIGRATION_PHASE.COMPLETED]?.length ===
      specNamespaces[index]?.virtualMachines?.length,
  );
};
