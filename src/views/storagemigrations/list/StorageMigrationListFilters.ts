import { TFunction } from 'i18next';

import { MultiNamespaceVirtualMachineStorageMigrationPlan } from '@kubevirt-utils/resources/migrations/constants';
import {
  getStorageMigrationStatus,
  StorageMigrationStatusFilterValue,
} from '@kubevirt-utils/resources/migrations/storageMigrationLifecycle';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';

export const STORAGE_MIGRATION_STATUS_FILTER_TYPE = 'storage-migration-status';

export { getStorageMigrationStatus, StorageMigrationStatusFilterValue };

export const getStorageMigrationStatusFilters = (
  t: TFunction,
): RowFilter<MultiNamespaceVirtualMachineStorageMigrationPlan>[] => [
  {
    filter: ({ selected }, obj) =>
      selected?.length === 0 || selected.includes(getStorageMigrationStatus(obj)),
    filterGroupName: t('Status'),
    items: [
      { id: StorageMigrationStatusFilterValue.Running, title: t('Running') },
      { id: StorageMigrationStatusFilterValue.Pending, title: t('Pending') },
      { id: StorageMigrationStatusFilterValue.Failed, title: t('Failed') },
      { id: StorageMigrationStatusFilterValue.Completed, title: t('Completed') },
    ],
    reducer: (obj) => getStorageMigrationStatus(obj),
    type: STORAGE_MIGRATION_STATUS_FILTER_TYPE,
  },
];
