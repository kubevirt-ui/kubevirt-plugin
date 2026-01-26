import { isEmpty } from '@kubevirt-utils/utils/utils';

import { MultiNamespaceVirtualMachineStorageMigrationPlan, STATUS_READY } from './constants';

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
  return (migrationPlan?.spec?.namespaces || [])
    .flatMap(
      (namespaceMigration) =>
        namespaceMigration?.virtualMachines?.flatMap((vm) =>
          vm?.targetMigrationPVCs?.filter((pvc) => !isEmpty(pvc.destinationPVC)),
        ).length,
    )
    .reduce((acc, curr) => acc + curr, 0);
};

export const isMigrationCompleted = (
  migrationPlan: MultiNamespaceVirtualMachineStorageMigrationPlan,
) => {
  return migrationPlan?.status?.namespaces?.every(
    (namespaceStatus, index) =>
      namespaceStatus?.completedMigrations?.length ===
      migrationPlan?.spec?.namespaces?.[index]?.virtualMachines?.length,
  );
};
