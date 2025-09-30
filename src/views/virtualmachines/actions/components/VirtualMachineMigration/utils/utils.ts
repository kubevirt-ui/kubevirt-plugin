import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import {
  V1VirtualMachine,
  V1VirtualMachineInstanceMigration,
  V1Volume,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { MigMigrationStatuses, MigPlan } from '@kubevirt-utils/resources/migrations/constants';
import { getLabel, getName } from '@kubevirt-utils/resources/shared';
import { getVolumes } from '@kubevirt-utils/resources/vm';
import { vmimStatuses } from '@kubevirt-utils/resources/vmim/statuses';
import { isEmpty, removeDuplicates } from '@kubevirt-utils/utils/utils';
import { ProgressVariant } from '@patternfly/react-core';

import { ALREADY_MIGRATED_PVC_LALBEL } from './constants';

export const entireVMSelected = (selectedPVCs: IoK8sApiCoreV1PersistentVolumeClaim[]) =>
  selectedPVCs === null;

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

export const getMigMigrationStatusLabel = (migMigrationStatus: string): string => {
  if (migMigrationStatus === MigMigrationStatuses.Failed) return t('Failed');
  if (MigMigrationStatuses.Completed === migMigrationStatus)
    return t('Migration completed successfully');

  return t('In progress');
};

export const getProgressVariantByMigMigrationStatus = (
  migMigrationStatus: string,
): ProgressVariant => {
  if (migMigrationStatus === MigMigrationStatuses.Failed) return ProgressVariant.danger;
  if (migMigrationStatus === MigMigrationStatuses.Completed) return ProgressVariant.success;

  return null;
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
  return getVolumes(vm)?.reduce((acc, volume) => {
    const pvc = getVolumePVC(volume, pvcs);

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

export const getExistingMigPlanNamespaces = (migPlans: MigPlan[]) => {
  const namespaces = !isEmpty(migPlans)
    ? migPlans?.reduce((acc, migPlan) => {
        const migPlanNamespaces = migPlan.spec?.namespaces || [];
        acc = [...acc, ...migPlanNamespaces];
        return acc;
      }, [])
    : [];

  return removeDuplicates(namespaces);
};
