import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  MultiNamespaceVirtualMachineStorageMigrationPlan,
  STORAGE_MIGRATION_PHASE,
} from '@kubevirt-utils/resources/migrations/constants';
import {
  getCompletedVolumeCountFromMigPlan,
  getVolumeCountFromMigPlan,
  isMigrationCompleted,
} from '@kubevirt-utils/resources/migrations/utils';
import { ProgressVariant } from '@patternfly/react-core';

export const getStatusMigration = (
  storageMigrationPlan: MultiNamespaceVirtualMachineStorageMigrationPlan,
): { title: string; variant?: ProgressVariant } => {
  if (
    storageMigrationPlan?.status?.namespaces?.some(
      (namespace) => namespace?.[STORAGE_MIGRATION_PHASE.FAILED]?.length > 0,
    )
  )
    return { title: t('Failed'), variant: ProgressVariant.danger };

  if (isMigrationCompleted(storageMigrationPlan)) {
    return { title: t('Completed'), variant: ProgressVariant.success };
  }

  if (
    storageMigrationPlan?.status?.namespaces?.some(
      (namespace) => namespace?.[STORAGE_MIGRATION_PHASE.IN_PROGRESS]?.length > 0,
    )
  )
    return { title: t('Running'), variant: null };

  return { title: t('Pending'), variant: null };
};

export const getMigrationPercentage = (
  storageMigrationPlan: MultiNamespaceVirtualMachineStorageMigrationPlan,
) => {
  if (isMigrationCompleted(storageMigrationPlan)) return 100;

  const totalVolumeCount = getVolumeCountFromMigPlan(storageMigrationPlan);

  if (totalVolumeCount === 0) return 0;

  const completedVolumeCount = getCompletedVolumeCountFromMigPlan(storageMigrationPlan);

  return Math.min(100, (completedVolumeCount / totalVolumeCount) * 100);
};
