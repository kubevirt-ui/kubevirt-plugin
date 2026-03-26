import React from 'react';
import { TFunction } from 'react-i18next';

import { V1alpha1MigrationPolicy } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { ACTIONS } from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/const';
import { getName, getUID } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';

import { MIGRATION_POLICY_COLUMN_KEYS } from '../utils/constants';

import {
  ActionsCell,
  AutoConvergeCell,
  BandwidthCell,
  ClusterCell,
  CompletionTimeoutCell,
  NameCell,
  PostCopyCell,
  ProjectLabelsCell,
  VMLabelsCell,
} from './MigrationPoliciesCells';

export const getMigrationPoliciesColumns = (
  t: TFunction,
  showClusterColumn: boolean,
): ColumnConfig<V1alpha1MigrationPolicy>[] => {
  const columns: ColumnConfig<V1alpha1MigrationPolicy>[] = [
    {
      getValue: (row) => getName(row) ?? '',
      key: MIGRATION_POLICY_COLUMN_KEYS.NAME,
      label: t('Name'),
      props: { className: 'pf-m-width-15' },
      renderCell: (row) => <NameCell row={row} />,
      sortable: true,
    },
  ];

  if (showClusterColumn) {
    columns.push({
      getValue: (row) => getCluster(row) ?? '',
      key: MIGRATION_POLICY_COLUMN_KEYS.CLUSTER,
      label: t('Cluster'),
      props: { className: 'pf-m-width-10' },
      renderCell: (row) => <ClusterCell row={row} />,
      sortable: true,
    });
  }

  columns.push(
    {
      getValue: (row) => row?.spec?.bandwidthPerMigration ?? '',
      key: MIGRATION_POLICY_COLUMN_KEYS.BANDWIDTH,
      label: t('Bandwidth'),
      props: { className: 'pf-m-width-10' },
      renderCell: (row) => <BandwidthCell row={row} />,
      sortable: true,
    },
    {
      getValue: (row) => (row?.spec?.allowAutoConverge ? 1 : 0),
      key: MIGRATION_POLICY_COLUMN_KEYS.AUTO_CONVERGE,
      label: t('Auto converge'),
      props: { className: 'pf-m-width-10' },
      renderCell: (row) => <AutoConvergeCell row={row} />,
      sortable: true,
    },
    {
      getValue: (row) => (row?.spec?.allowPostCopy ? 1 : 0),
      key: MIGRATION_POLICY_COLUMN_KEYS.POST_COPY,
      label: t('Post copy'),
      props: { className: 'pf-m-width-10' },
      renderCell: (row) => <PostCopyCell row={row} />,
      sortable: true,
    },
    {
      getValue: (row) => row?.spec?.completionTimeoutPerGiB ?? 0,
      key: MIGRATION_POLICY_COLUMN_KEYS.COMPLETION_TIMEOUT,
      label: t('Completion timeout'),
      props: { className: 'pf-m-width-10' },
      renderCell: (row) => <CompletionTimeoutCell row={row} />,
      sortable: true,
    },
    {
      additional: true,
      key: MIGRATION_POLICY_COLUMN_KEYS.PROJECT_LABELS,
      label: t('Project labels'),
      renderCell: (row) => <ProjectLabelsCell row={row} />,
      sortable: false,
    },
    {
      additional: true,
      key: MIGRATION_POLICY_COLUMN_KEYS.VM_LABELS,
      label: t('VirtualMachineInstance labels'),
      renderCell: (row) => <VMLabelsCell row={row} />,
      sortable: false,
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

export const getMigrationPoliciesRowId = (row: V1alpha1MigrationPolicy, index: number): string => {
  const uid = getUID(row);
  if (uid) return uid;

  const cluster = getCluster(row) || 'local';
  const name = getName(row);

  if (name) {
    return `${cluster}-${name}`;
  }

  return `migration-policy-${index}`;
};
