import { TFunction } from 'i18next';

import { KubevirtFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { MultiNamespaceVirtualMachineStorageMigrationPlan } from '@kubevirt-utils/resources/migrations/constants';
import {
  getStorageMigrationStatus,
  StorageMigrationStatusFilterValue,
} from '@kubevirt-utils/resources/migrations/storageMigrationLifecycle';

export const STORAGE_MIGRATION_STATUS_FILTER_TYPE = 'storage-migration-status';

export const getStorageMigrationStatusFilters = (
  t: TFunction,
): KubevirtFilter<MultiNamespaceVirtualMachineStorageMigrationPlan>[] => [
  {
    categoryLabel: t('Status'),
    id: STORAGE_MIGRATION_STATUS_FILTER_TYPE,
    match: (obj, selected) => selected.includes(getStorageMigrationStatus(obj)),
    options: [
      { label: t('Running'), value: StorageMigrationStatusFilterValue.Running },
      { label: t('Pending'), value: StorageMigrationStatusFilterValue.Pending },
      { label: t('Failed'), value: StorageMigrationStatusFilterValue.Failed },
      { label: t('Completed'), value: StorageMigrationStatusFilterValue.Completed },
    ],
  },
];
