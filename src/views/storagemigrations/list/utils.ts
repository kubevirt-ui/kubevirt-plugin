import { getStorageMigrationPlanModelForKind } from '@kubevirt-utils/resources/migrations/backends';
import { type MultiNamespaceVirtualMachineStorageMigrationPlan } from '@kubevirt-utils/resources/migrations/constants';
import { getStorageMigrationPlanSpecNamespaces } from '@kubevirt-utils/resources/migrations/selectors';
import {
  getMigrationStartTimestamp,
  getVolumeCountFromMigPlan,
} from '@kubevirt-utils/resources/migrations/utils';
import { type K8sModel } from '@openshift-console/dynamic-plugin-sdk';

import { getMigrationPercentage } from './components/utils';

export const getStorageClassesFromMigPlan = (
  migrationPlan: MultiNamespaceVirtualMachineStorageMigrationPlan,
): string[] =>
  Array.from(
    new Set(
      getStorageMigrationPlanSpecNamespaces(migrationPlan).flatMap((namespace) =>
        (namespace?.virtualMachines ?? []).flatMap((vm) =>
          (vm?.targetMigrationPVCs ?? [])
            .map((pvc) => pvc.destinationPVC?.storageClassName)
            .filter(Boolean),
        ),
      ),
    ),
  );

export const getStorageMigrationRowModel = (
  row: MultiNamespaceVirtualMachineStorageMigrationPlan,
): K8sModel => getStorageMigrationPlanModelForKind(row?.kind);

export const compareMigrationVolumes = (
  a: MultiNamespaceVirtualMachineStorageMigrationPlan,
  b: MultiNamespaceVirtualMachineStorageMigrationPlan,
): number => {
  const aVolumes = getVolumeCountFromMigPlan(a);
  const bVolumes = getVolumeCountFromMigPlan(b);

  return aVolumes - bVolumes;
};

export const compareMigrationNamespaces = (
  a: MultiNamespaceVirtualMachineStorageMigrationPlan,
  b: MultiNamespaceVirtualMachineStorageMigrationPlan,
): number => {
  return (
    getStorageMigrationPlanSpecNamespaces(a).length -
    getStorageMigrationPlanSpecNamespaces(b).length
  );
};

export const compareMigrationStorageClasses = (
  a: MultiNamespaceVirtualMachineStorageMigrationPlan,
  b: MultiNamespaceVirtualMachineStorageMigrationPlan,
): number => {
  const aStorageClasses = getStorageClassesFromMigPlan(a)?.[0] ?? '';
  const bStorageClasses = getStorageClassesFromMigPlan(b)?.[0] ?? '';

  return aStorageClasses.localeCompare(bStorageClasses);
};

export const compareMigrationStarted = (
  a: MultiNamespaceVirtualMachineStorageMigrationPlan,
  b: MultiNamespaceVirtualMachineStorageMigrationPlan,
): number => {
  const aStarted = getMigrationStartTimestamp(a) ?? '';
  const bStarted = getMigrationStartTimestamp(b) ?? '';
  return aStarted.localeCompare(bStarted);
};

export const compareMigrationStatus = (
  a: MultiNamespaceVirtualMachineStorageMigrationPlan,
  b: MultiNamespaceVirtualMachineStorageMigrationPlan,
): number => {
  const aPercentage = getMigrationPercentage(a);
  const bPercentage = getMigrationPercentage(b);
  return aPercentage - bPercentage;
};
