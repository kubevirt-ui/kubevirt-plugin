import React from 'react';
import { TFunction } from 'react-i18next';

import { V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { getK8sRowId } from '@kubevirt-utils/components/KubevirtTable/utils';
import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { ACTIONS } from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/const';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';

import { getDataSourceCronJob, getDataSourceLastUpdated } from '../utils';

import DataSourceActionsCell from './cells/DataSourceActionsCell';
import DataSourceCreatedCell from './cells/DataSourceCreatedCell';
import DataSourceImportCronCell from './cells/DataSourceImportCronCell';
import DataSourceNameCell from './cells/DataSourceNameCell';
import DataSourceNamespaceCell from './cells/DataSourceNamespaceCell';
import DataSourceUpdatedCell from './cells/DataSourceUpdatedCell';

export const DATASOURCE_COLUMN_KEYS = {
  created: 'created',
  importCron: 'import-cron',
  name: 'name',
  namespace: 'namespace',
  updated: 'updated',
} as const;

export const getDataSourceColumns = (
  t: TFunction,
  namespace: string,
): ColumnConfig<V1beta1DataSource>[] => {
  const columns: ColumnConfig<V1beta1DataSource>[] = [
    {
      getValue: (row) => getName(row) ?? '',
      key: DATASOURCE_COLUMN_KEYS.name,
      label: t('Name'),
      props: { className: 'pf-m-width-15' },
      renderCell: (row) => <DataSourceNameCell row={row} />,
      sortable: true,
    },
  ];

  if (!namespace) {
    columns.push({
      getValue: (row) => getNamespace(row) ?? '',
      key: DATASOURCE_COLUMN_KEYS.namespace,
      label: t('Namespace'),
      props: { className: 'pf-m-width-10' },
      renderCell: (row) => <DataSourceNamespaceCell row={row} />,
      sortable: true,
    });
  }

  columns.push(
    {
      getValue: (row) => row?.metadata?.creationTimestamp ?? '',
      key: DATASOURCE_COLUMN_KEYS.created,
      label: t('Created'),
      props: { className: 'pf-m-width-15' },
      renderCell: (row) => <DataSourceCreatedCell row={row} />,
      sortable: true,
    },
    {
      getValue: (row) => getDataSourceLastUpdated(row) ?? '',
      key: DATASOURCE_COLUMN_KEYS.updated,
      label: t('Updated'),
      props: { className: 'pf-m-width-15' },
      renderCell: (row) => <DataSourceUpdatedCell row={row} />,
      sortable: true,
    },
    {
      additional: true,
      getValue: (row) => (getDataSourceCronJob(row) ? '1' : '0'),
      key: DATASOURCE_COLUMN_KEYS.importCron,
      label: t('Auto update'),
      props: { className: 'pf-m-width-10' },
      renderCell: (row) => <DataSourceImportCronCell row={row} t={t} />,
      sortable: true,
    },
    {
      key: ACTIONS,
      label: '',
      props: { className: 'pf-v6-c-table__action' },
      renderCell: (row) => <DataSourceActionsCell row={row} />,
    },
  );

  return columns;
};

export const getDataSourceRowId = (dataSource: V1beta1DataSource, index: number): string =>
  getK8sRowId(dataSource, index, 'datasource');
