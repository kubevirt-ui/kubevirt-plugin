import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { MultiNamespaceVirtualMachineStorageMigrationPlan } from '@kubevirt-utils/resources/migrations/constants';
import {
  getVolumeCountFromMigPlan,
  isMigrationCompleted,
} from '@kubevirt-utils/resources/migrations/utils';
import { ProgressVariant } from '@patternfly/react-core';

export const getStatusMigration = (
  storageMigrationPlan: MultiNamespaceVirtualMachineStorageMigrationPlan,
): { title: string; variant?: ProgressVariant } => {
  if (
    storageMigrationPlan?.status?.namespaces?.some(
      (namespace) => namespace?.failedMigrations?.length > 0,
    )
  )
    return { title: t('Failed'), variant: ProgressVariant.danger };

  if (isMigrationCompleted(storageMigrationPlan)) {
    return { title: t('Completed'), variant: ProgressVariant.success };
  }

  if (
    storageMigrationPlan?.status?.namespaces?.some(
      (namespace) => namespace?.inProgressMigrations?.length > 0,
    )
  )
    return { title: t('Running'), variant: null };

  return { title: t('Pending'), variant: null };
};

export const getMigrationPercentage = (
  storageMigrationPlan: MultiNamespaceVirtualMachineStorageMigrationPlan,
) => {
  const successfulLiveMigration =
    storageMigrationPlan?.status?.namespaces?.reduce(
      (acc, namespace) => acc + namespace?.completedMigrations?.length,
      0,
    ) || 0;

  const totalMigrations = getVolumeCountFromMigPlan(storageMigrationPlan);

  if (totalMigrations === 0) return 0;

  return (successfulLiveMigration / totalMigrations) * 100;
};
