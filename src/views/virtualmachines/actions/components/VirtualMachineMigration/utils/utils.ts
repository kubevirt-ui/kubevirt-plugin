import { TFunction } from 'i18next';

import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import {
  V1VirtualMachine,
  V1VirtualMachineInstanceMigration,
  V1Volume,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  MigrationStatus,
  MultiNamespaceVirtualMachineStorageMigrationPlan,
  STORAGE_MIGRATION_PHASE,
} from '@kubevirt-utils/resources/migrations/constants';
import { getLabel, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getVolumes } from '@kubevirt-utils/resources/vm';
import { vmimStatuses } from '@kubevirt-utils/resources/vmim/statuses';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { EmptyStateStatus } from '@patternfly/react-core';
import { CheckCircleIcon, CogIcon, ExclamationCircleIcon } from '@patternfly/react-icons';

import { ALREADY_MIGRATED_PVC_LALBEL, SelectedMigration } from './constants';
import { createSelectedMigration, getTableDiskData } from './diskData';

export const getVolumeFromPVC = (
  volumes: V1Volume[],
  pvcs: IoK8sApiCoreV1PersistentVolumeClaim[],
): V1Volume[] => {
  const pvcNames = pvcs.map((pvc) => getName(pvc));

  return volumes.filter(
    (volume) =>
      pvcNames.includes(volume?.persistentVolumeClaim?.claimName) ||
      pvcNames.includes(volume?.dataVolume?.name),
  );
};

export const getMigrationSuccessTimestamp = (vmim: V1VirtualMachineInstanceMigration): string =>
  vmim?.status?.phaseTransitionTimestamps?.find(
    (phaseTransition) => phaseTransition.phase === vmimStatuses.Succeeded,
  )?.phaseTransitionTimestamp;

export const getVolumePVC = (volume: V1Volume, pvcs: IoK8sApiCoreV1PersistentVolumeClaim[]) =>
  pvcs?.find(
    (pvc) =>
      getName(pvc) === volume.dataVolume?.name ||
      getName(pvc) === volume.persistentVolumeClaim?.claimName,
  );

export const getMigratableVMPVCs = (
  vm: V1VirtualMachine,
  pvcs: IoK8sApiCoreV1PersistentVolumeClaim[],
): IoK8sApiCoreV1PersistentVolumeClaim[] => {
  const namespacePVCs = pvcs.filter((pvc) => getNamespace(pvc) === getNamespace(vm));
  return getVolumes(vm)?.reduce((acc, volume) => {
    const pvc = getVolumePVC(volume, namespacePVCs);

    if (!isEmpty(getLabel(pvc, ALREADY_MIGRATED_PVC_LALBEL))) return acc;

    if (!isEmpty(pvc)) {
      acc.push(pvc);
    }

    return acc;
  }, []);
};

export const getAllVolumesCount = (vms: V1VirtualMachine[]) =>
  vms.reduce((acc, vm) => {
    acc = acc + getVolumes(vm).length;
    return acc;
  }, 0);

export const getAllSelectedMigrations = (
  vms: V1VirtualMachine[],
  pvcs: IoK8sApiCoreV1PersistentVolumeClaim[],
): SelectedMigration[] => {
  return (getTableDiskData(vms, pvcs) || [])
    .filter((diskData) => diskData.isSelectable)
    .map((diskData) => createSelectedMigration(diskData));
};

export const getFailedMigrations = (
  plan: MultiNamespaceVirtualMachineStorageMigrationPlan,
): MigrationStatus[] =>
  plan?.status?.namespaces?.flatMap((ns) => ns?.[STORAGE_MIGRATION_PHASE.FAILED] ?? []) ?? [];

export const getMigrationStateConfig = (
  migrationCompleted: boolean,
  hasFailed: boolean,
  t: TFunction,
): {
  migrationHeading: string;
  migrationIcon: typeof CheckCircleIcon;
  migrationStatus: EmptyStateStatus;
} => {
  if (migrationCompleted)
    return {
      migrationHeading: t('Storage migration completed'),
      migrationIcon: CheckCircleIcon,
      migrationStatus: EmptyStateStatus.success,
    };
  if (hasFailed)
    return {
      migrationHeading: t('Storage migration failed'),
      migrationIcon: ExclamationCircleIcon,
      migrationStatus: EmptyStateStatus.danger,
    };
  return {
    migrationHeading: t('Storage migration in progress...'),
    migrationIcon: CogIcon,
    migrationStatus: EmptyStateStatus.info,
  };
};
