import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import {
  V1VirtualMachine,
  V1VirtualMachineInstanceMigration,
  V1Volume,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { MultiNamespaceVirtualMachineStorageMigrationPlan } from '@kubevirt-utils/resources/migrations/constants';
import { isMigrationCompleted } from '@kubevirt-utils/resources/migrations/utils';
import { getLabel, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getVolumes } from '@kubevirt-utils/resources/vm';
import { vmimStatuses } from '@kubevirt-utils/resources/vmim/statuses';
import { isEmpty } from '@kubevirt-utils/utils/utils';

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

export const getMigrationStatusLabel = (vmim: V1VirtualMachineInstanceMigration): string => {
  if (vmim?.status?.phase === vmimStatuses.Failed) return t('Failed');
  if (vmimStatuses.Succeeded === vmim?.status?.phase) return t('Migration completed successfully');

  return t('In progress');
};

export const getStorageMigrationStatusLabel = (
  storageMigrationPlan: MultiNamespaceVirtualMachineStorageMigrationPlan,
): string => {
  if (
    storageMigrationPlan?.status?.namespaces?.some(
      (namespaceStatus) => namespaceStatus?.failedMigrations?.length > 0,
    )
  )
    return t('Failed');

  if (isMigrationCompleted(storageMigrationPlan)) return t('Migration completed successfully');

  return t('In progress');
};

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
