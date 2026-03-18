import { getStatusNamespaces } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import {
  MultiNamespaceVirtualMachineStorageMigrationPlan,
  STATUS_READY,
  STORAGE_MIGRATION_PHASE,
} from './constants';

const getMigrationConditionTimestamp = (
  migration: MultiNamespaceVirtualMachineStorageMigrationPlan,
  conditionType: string,
) => {
  for (const namespaceStatus of migration?.status?.namespaces || []) {
    const condition = namespaceStatus?.conditions?.find((c) => c?.type === conditionType);
    if (condition) {
      return condition.lastTransitionTime;
    }
  }
  return undefined;
};

export const getMigrationStartTimestamp = (
  migration: MultiNamespaceVirtualMachineStorageMigrationPlan,
) => getMigrationConditionTimestamp(migration, STATUS_READY);

export const getMigrationCompletedTimestamp = (
  migration: MultiNamespaceVirtualMachineStorageMigrationPlan,
) => {
  if (!isMigrationCompleted(migration)) {
    return undefined;
  }
  return getMigrationConditionTimestamp(migration, STATUS_READY);
};

export const getVolumeCountFromMigPlan = (
  migrationPlan: MultiNamespaceVirtualMachineStorageMigrationPlan,
) => {
  return (migrationPlan?.spec?.namespaces ?? []).flatMap((namespaceMigration) =>
    (namespaceMigration?.virtualMachines ?? []).flatMap((vm) =>
      (vm?.targetMigrationPVCs ?? []).filter((pvc) => !isEmpty(pvc.destinationPVC)),
    ),
  ).length;
};

export const isMigrationCompleted = (
  migrationPlan: MultiNamespaceVirtualMachineStorageMigrationPlan,
) => {
  const statusNamespaces = getStatusNamespaces(migrationPlan);
  const specNamespaces = migrationPlan?.spec?.namespaces;

  if (!statusNamespaces?.length || statusNamespaces.length !== specNamespaces?.length) return false;

  return statusNamespaces.every(
    (namespaceStatus, index) =>
      namespaceStatus?.[STORAGE_MIGRATION_PHASE.COMPLETED]?.length ===
      specNamespaces[index]?.virtualMachines?.length,
  );
};
