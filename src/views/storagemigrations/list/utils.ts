import { MultiNamespaceVirtualMachineStorageMigrationPlan } from '@kubevirt-utils/resources/migrations/constants';
import { getMigrationStartTimestamp } from '@kubevirt-utils/resources/migrations/utils';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import { getMigrationPercentage } from './components/utils';

export const getStorageClassesFromMigPlan = (
  migrationPlan: MultiNamespaceVirtualMachineStorageMigrationPlan,
): string[] =>
  Array.from(
    new Set(
      migrationPlan?.spec?.namespaces?.flatMap((namespace) =>
        namespace.virtualMachines.flatMap((vm) =>
          vm.targetMigrationPVCs.map((pvc) => pvc.destinationPVC?.storageClassName),
        ),
      ),
    ),
  ).flat();

export const compareMigrationVolumes = (
  a: MultiNamespaceVirtualMachineStorageMigrationPlan,
  b: MultiNamespaceVirtualMachineStorageMigrationPlan,
) => {
  const aVolumes = (a?.spec?.namespaces || [])
    .flatMap(
      (namespace) =>
        namespace.virtualMachines.flatMap((vm) =>
          vm.targetMigrationPVCs.map((pvc) => !isEmpty(pvc.destinationPVC)),
        ).length,
    )
    .reduce((acc, curr) => acc + curr, 0);

  const bVolumes = (b?.spec?.namespaces || [])
    .flatMap(
      (namespace) =>
        namespace.virtualMachines.flatMap((vm) =>
          vm.targetMigrationPVCs.map((pvc) => !isEmpty(pvc.destinationPVC)),
        ).length,
    )
    .reduce((acc, curr) => acc + curr, 0);

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
  const aStarted = getMigrationPercentage(a);
  const bStarted = getMigrationPercentage(b);
  return aStarted - bStarted;
};
