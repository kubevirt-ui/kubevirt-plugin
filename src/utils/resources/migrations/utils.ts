import { isEmpty } from '@kubevirt-utils/utils/utils';

import { MultiNamespaceVirtualMachineStorageMigrationPlan } from './constants';

export const getMigrationStartTimestamp = (
  migration: MultiNamespaceVirtualMachineStorageMigrationPlan,
) => {
  for (const namespaceStatus of migration?.status?.namespaces || []) {
    const readyCondition = namespaceStatus?.conditions?.find(
      (condition) => condition?.type === 'Ready',
    );
    if (readyCondition) {
      return readyCondition.lastTransitionTime;
    }
  }
  return undefined;
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
