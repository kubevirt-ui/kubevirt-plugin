import React from 'react';
import { TFunction } from 'i18next';

import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { ACTIONS } from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/const';
import { MultiNamespaceVirtualMachineStorageMigrationPlan } from '@kubevirt-utils/resources/migrations/constants';
import {
  getMigrationStartTimestamp,
  getVolumeCountFromMigPlan,
} from '@kubevirt-utils/resources/migrations/utils';
import { getName, getUID } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';

import { getMigrationPercentage } from './components/utils';
import { STORAGE_MIGRATION_COLUMN_KEYS } from './constants';
import {
  ActionsCell,
  NameCell,
  NamespacesCell,
  StartedCell,
  StatusCell,
  StorageMigrationCell,
  TargetStorageClassCell,
} from './StorageMigrationCells';
import { getStorageClassesFromMigPlan } from './utils';

export const getStorageMigrationColumns = (
  t: TFunction,
): ColumnConfig<MultiNamespaceVirtualMachineStorageMigrationPlan>[] => [
  {
    getValue: (row) => getName(row) ?? '',
    key: STORAGE_MIGRATION_COLUMN_KEYS.NAME,
    label: t('Name'),
    props: { className: 'pf-m-width-15' },
    renderCell: (row) => <NameCell row={row} />,
    sortable: true,
  },
  {
    getValue: (row) => row?.spec?.namespaces?.map((ns) => ns.name).join(', ') ?? '',
    key: STORAGE_MIGRATION_COLUMN_KEYS.NAMESPACES,
    label: t('Namespaces'),
    props: { className: 'pf-m-width-15' },
    renderCell: (row) => <NamespacesCell row={row} />,
    sortable: true,
  },
  {
    getValue: (row) => getVolumeCountFromMigPlan(row) ?? 0,
    key: STORAGE_MIGRATION_COLUMN_KEYS.STORAGE_MIGRATION,
    label: t('Storage migration'),
    props: { className: 'pf-m-width-10' },
    renderCell: (row) => <StorageMigrationCell row={row} />,
    sortable: true,
  },
  {
    getValue: (row) => getStorageClassesFromMigPlan(row)?.join(', ') ?? '',
    key: STORAGE_MIGRATION_COLUMN_KEYS.TARGET_SC,
    label: t('Target storage class'),
    props: { className: 'pf-m-width-15' },
    renderCell: (row) => <TargetStorageClassCell row={row} />,
    sortable: true,
  },
  {
    getValue: (row) => getMigrationPercentage(row),
    key: STORAGE_MIGRATION_COLUMN_KEYS.STATUS,
    label: t('Status'),
    props: { className: 'pf-m-width-15' },
    renderCell: (row) => <StatusCell row={row} />,
    sortable: true,
  },
  {
    getValue: (row) => getMigrationStartTimestamp(row) ?? '',
    key: STORAGE_MIGRATION_COLUMN_KEYS.STARTED,
    label: t('Migration started'),
    props: { className: 'pf-m-width-15' },
    renderCell: (row) => <StartedCell row={row} />,
    sortable: true,
  },
  {
    key: ACTIONS,
    label: '',
    props: { className: 'pf-v6-c-table__action' },
    renderCell: (row) => <ActionsCell row={row} />,
    sortable: false,
  },
];

export const getStorageMigrationRowId = (
  row: MultiNamespaceVirtualMachineStorageMigrationPlan,
  index: number,
): string => {
  const uid = getUID(row);
  if (uid) return uid;

  const cluster = getCluster(row) || 'local';
  const name = getName(row);

  if (name) {
    return `${cluster}-${name}`;
  }

  return `storage-migration-${index}`;
};
