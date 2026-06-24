import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  MultiNamespaceVirtualMachineStorageMigrationPlan,
  STORAGE_MIGRATION_PHASE,
} from '@kubevirt-utils/resources/migrations/constants';
import { getStatusNamespaces } from '@kubevirt-utils/resources/migrations/selectors';
import {
  getCompletedVolumeCountFromMigPlan,
  getVolumeCountFromMigPlan,
  isMigrationCompleted,
} from '@kubevirt-utils/resources/migrations/utils';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { ProgressVariant } from '@patternfly/react-core';

export const getStatusMigration = (
  storageMigrationPlan: MultiNamespaceVirtualMachineStorageMigrationPlan,
): { title: string; variant?: ProgressVariant } => {
  const namespaces = getStatusNamespaces(storageMigrationPlan);

  if (
    namespaces?.some(
      (namespace) =>
        !isEmpty(namespace?.[STORAGE_MIGRATION_PHASE.FAILED]) ||
        !isEmpty(namespace?.[STORAGE_MIGRATION_PHASE.INVALID]),
    )
  ) {
    return { title: t('Failed'), variant: ProgressVariant.danger };
  }

  if (isMigrationCompleted(storageMigrationPlan)) {
    return { title: t('Completed'), variant: ProgressVariant.success };
  }

  if (namespaces?.some((namespace) => !isEmpty(namespace?.[STORAGE_MIGRATION_PHASE.IN_PROGRESS]))) {
    return { title: t('Running'), variant: null };
  }

  return { title: t('Pending'), variant: null };
};

export const getMigrationPercentage = (
  storageMigrationPlan: MultiNamespaceVirtualMachineStorageMigrationPlan,
) => {
  const successfulLiveMigration = getCompletedVolumeCountFromMigPlan(storageMigrationPlan);
  const totalMigrations = getVolumeCountFromMigPlan(storageMigrationPlan);

  if (totalMigrations === 0) return 0;

  return (successfulLiveMigration / totalMigrations) * 100;
};
