import React from 'react';
import { TFunction } from 'react-i18next';

import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { ACTIONS } from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/const';
import { getName, getNamespace, getUID } from '@kubevirt-utils/resources/shared';
import {
  getMigrationPhase,
  getMigrationSourceNode,
  getMigrationTargetNode,
} from '@kubevirt-utils/resources/vmim/selectors';
import { getCluster } from '@multicluster/helpers/selectors';

import { MIGRATION_COLUMN_KEYS } from './utils/constants';
import { MigrationTableDataLayout } from './utils/utils';
import {
  ActionsCell,
  CreatedCell,
  MigrationPolicyCell,
  NamespaceCell,
  ProgressCell,
  SourceNodeCell,
  StatusCell,
  TargetNodeCell,
  VMIMNameCell,
  VMNameCell,
} from './MigrationsCells';

export const getMigrationsTableColumns = (
  t: TFunction,
  showNamespaceColumn: boolean,
  canGetNode: boolean,
): ColumnConfig<MigrationTableDataLayout>[] => {
  const columns: ColumnConfig<MigrationTableDataLayout>[] = [
    {
      getValue: (row) => getName(row.vmiObj) ?? row.vmim?.spec?.vmiName ?? '',
      key: MIGRATION_COLUMN_KEYS.VM_NAME,
      label: t('VirtualMachine name'),
      renderCell: (row) => <VMNameCell row={row} />,
      sortable: true,
    },
  ];

  if (showNamespaceColumn) {
    columns.push({
      getValue: (row) => getNamespace(row.vmiObj) ?? getNamespace(row.vmim) ?? '',
      key: MIGRATION_COLUMN_KEYS.NAMESPACE,
      label: t('Namespace'),
      props: { className: 'pf-m-width-10' },
      renderCell: (row) => <NamespaceCell row={row} />,
      sortable: true,
    });
  }

  columns.push(
    {
      getValue: (row) => getMigrationPhase(row.vmim) ?? '',
      key: MIGRATION_COLUMN_KEYS.STATUS,
      label: t('Status'),
      renderCell: (row) => <StatusCell row={row} />,
      sortable: true,
    },
    {
      key: MIGRATION_COLUMN_KEYS.PROGRESS,
      label: t('Progress'),
      renderCell: (row) => <ProgressCell row={row} />,
      sortable: false,
    },
  );

  if (canGetNode) {
    columns.push(
      {
        getValue: (row) => getMigrationSourceNode(row.vmim) ?? '',
        key: MIGRATION_COLUMN_KEYS.SOURCE,
        label: t('Source'),
        renderCell: (row) => <SourceNodeCell row={row} />,
        sortable: true,
      },
      {
        getValue: (row) => getMigrationTargetNode(row.vmim) ?? '',
        key: MIGRATION_COLUMN_KEYS.TARGET,
        label: t('Target'),
        renderCell: (row) => <TargetNodeCell row={row} />,
        sortable: true,
      },
    );
  }

  columns.push(
    {
      getValue: (row) => row.vmiObj?.status?.migrationState?.migrationPolicyName ?? '',
      key: MIGRATION_COLUMN_KEYS.MIGRATION_POLICY,
      label: t('MigrationPolicy'),
      renderCell: (row) => <MigrationPolicyCell row={row} />,
      sortable: true,
    },
    {
      getValue: (row) => getName(row.vmim) ?? '',
      key: MIGRATION_COLUMN_KEYS.VMIM_NAME,
      label: t('VirtualMachineInstanceMigration name'),
      renderCell: (row) => <VMIMNameCell row={row} />,
      sortable: true,
    },
    {
      additional: true,
      getValue: (row) => row.vmim?.metadata?.creationTimestamp ?? '',
      key: MIGRATION_COLUMN_KEYS.CREATED,
      label: t('Created'),
      renderCell: (row) => <CreatedCell row={row} />,
      sortable: true,
    },
    {
      key: ACTIONS,
      label: '',
      props: { className: 'pf-v6-c-table__action' },
      renderCell: (row) => <ActionsCell row={row} />,
      sortable: false,
    },
  );

  return columns;
};

export const getMigrationsTableRowId = (row: MigrationTableDataLayout, index: number): string => {
  const uid = getUID(row.vmim);
  if (uid) return uid;

  const cluster = getCluster(row.vmim) ?? getCluster(row.vmiObj) ?? 'local';
  const namespace = getNamespace(row.vmim) ?? getNamespace(row.vmiObj) ?? 'unknown-ns';
  const name = getName(row.vmim) ?? getName(row.vmiObj);

  if (name) {
    return `${cluster}-${namespace}-${name}`;
  }

  return `${cluster}-${namespace}-migration-${index}`;
};
