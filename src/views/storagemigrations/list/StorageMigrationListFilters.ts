import { TFunction } from 'react-i18next';

import {
  MultiNamespaceVirtualMachineStorageMigrationPlan,
  STORAGE_MIGRATION_PHASE,
} from '@kubevirt-utils/resources/migrations/constants';
import { isMigrationCompleted } from '@kubevirt-utils/resources/migrations/utils';
import { getStatusNamespaces } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';

export const STORAGE_MIGRATION_STATUS_FILTER_TYPE = 'storage-migration-status';

export enum StorageMigrationStatusFilterValue {
  Completed = 'Completed',
  Failed = 'Failed',
  Pending = 'Pending',
  Running = 'Running',
}

export const getStorageMigrationStatus = (
  plan: MultiNamespaceVirtualMachineStorageMigrationPlan,
): StorageMigrationStatusFilterValue => {
  const namespaces = getStatusNamespaces(plan);
  const hasFailed = namespaces?.some((ns) => !isEmpty(ns?.[STORAGE_MIGRATION_PHASE.FAILED]));
  const hasInvalid = namespaces?.some((ns) => !isEmpty(ns?.[STORAGE_MIGRATION_PHASE.INVALID]));
  const hasInProgress = namespaces?.some(
    (ns) => !isEmpty(ns?.[STORAGE_MIGRATION_PHASE.IN_PROGRESS]),
  );
  const completed = isMigrationCompleted(plan);

  if (hasFailed || hasInvalid) return StorageMigrationStatusFilterValue.Failed;
  if (hasInProgress) return StorageMigrationStatusFilterValue.Running;
  if (completed) return StorageMigrationStatusFilterValue.Completed;
  return StorageMigrationStatusFilterValue.Pending;
};

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
