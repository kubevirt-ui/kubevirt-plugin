import { MultiNamespaceVirtualMachineStorageMigrationPlan } from '@kubevirt-utils/resources/migrations/constants';
import {
  getMigrationStartTimestamp,
  getVolumeCountFromMigPlan,
} from '@kubevirt-utils/resources/migrations/utils';

import { getMigrationPercentage } from './components/utils';

export const getStorageClassesFromMigPlan = (
  migrationPlan: MultiNamespaceVirtualMachineStorageMigrationPlan,
): string[] =>
  Array.from(
    new Set(
      migrationPlan?.spec?.namespaces?.flatMap((namespace) =>
        namespace.virtualMachines.flatMap((vm) =>
          vm.targetMigrationPVCs
            .map((pvc) => pvc.destinationPVC?.storageClassName)
            ?.filter(Boolean),
        ),
      ),
    ),
  );

export const compareMigrationVolumes = (
  a: MultiNamespaceVirtualMachineStorageMigrationPlan,
  b: MultiNamespaceVirtualMachineStorageMigrationPlan,
) => {
  const aVolumes = getVolumeCountFromMigPlan(a);
  const bVolumes = getVolumeCountFromMigPlan(b);

  return aVolumes - bVolumes;
};

export const compareMigrationNamespaces = (
  a: MultiNamespaceVirtualMachineStorageMigrationPlan,
  b: MultiNamespaceVirtualMachineStorageMigrationPlan,
) => {
  return (a?.spec?.namespaces?.length || 0) - (b?.spec?.namespaces?.length || 0);
};

export const compareMigrationStorageClasses = (
  a: MultiNamespaceVirtualMachineStorageMigrationPlan,
  b: MultiNamespaceVirtualMachineStorageMigrationPlan,
) => {
  const aStorageClasses = getStorageClassesFromMigPlan(a)?.[0];
  const bStorageClasses = getStorageClassesFromMigPlan(b)?.[0];

  return aStorageClasses?.localeCompare(bStorageClasses);
};

export const compareMigrationStarted = (
  a: MultiNamespaceVirtualMachineStorageMigrationPlan,
  b: MultiNamespaceVirtualMachineStorageMigrationPlan,
) => {
  const aStarted = getMigrationStartTimestamp(a);
  const bStarted = getMigrationStartTimestamp(b);
  return aStarted?.localeCompare(bStarted);
};

export const compareMigrationStatus = (
  a: MultiNamespaceVirtualMachineStorageMigrationPlan,
  b: MultiNamespaceVirtualMachineStorageMigrationPlan,
) => {
  const aPercentage = getMigrationPercentage(a);
  const bPercentage = getMigrationPercentage(b);
  return aPercentage - bPercentage;
};
