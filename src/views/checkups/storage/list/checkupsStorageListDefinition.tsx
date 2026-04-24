import React from 'react';
import { TFunction } from 'i18next';

import {
  IoK8sApiBatchV1Job,
  IoK8sApiCoreV1ConfigMap,
} from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { ACTIONS } from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/const';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';

import { CHECKUPS_COLUMN_KEYS } from '../../utils/constants';
import {
  columnsSorting,
  STATUS_COMPLETION_TIME_STAMP,
  STATUS_FAILURE_REASON,
  STATUS_START_TIME_STAMP,
  STATUS_SUCCEEDED,
} from '../../utils/utils';

import {
  ActionsCell,
  ClusterCell,
  CompleteTimeCell,
  FailureCell,
  NameCell,
  NamespaceCell,
  StartTimeCell,
  StatusCell,
} from './checkupsStorageCells';

export type CheckupsStorageCallbacks = {
  getJobByName: (configMapName: string) => IoK8sApiBatchV1Job[];
};

export const getCheckupsStorageColumns = (
  t: TFunction,
  isACMPage: boolean,
  showNamespace: boolean,
  hubClusterName?: string,
): ColumnConfig<IoK8sApiCoreV1ConfigMap, CheckupsStorageCallbacks>[] => [
  {
    getValue: (row) => getName(row) ?? '',
    key: 'name',
    label: t('Name'),
    renderCell: (row) => <NameCell row={row} />,
    sortable: true,
  },
  ...(isACMPage
    ? [
        {
          getValue: (row: IoK8sApiCoreV1ConfigMap) => getCluster(row) || hubClusterName || '',
          key: 'cluster',
          label: t('Cluster'),
          renderCell: (row: IoK8sApiCoreV1ConfigMap) => <ClusterCell row={row} />,
          sortable: true,
        },
      ]
    : []),
  ...(showNamespace
    ? [
        {
          getValue: (row: IoK8sApiCoreV1ConfigMap) => getNamespace(row) ?? '',
          key: 'namespace',
          label: t('Namespace'),
          renderCell: (row: IoK8sApiCoreV1ConfigMap) => <NamespaceCell row={row} />,
          sortable: true,
        },
      ]
    : []),
  {
    key: 'status',
    label: t('Status'),
    renderCell: (row, callbacks) => <StatusCell callbacks={callbacks} row={row} />,
    sort: (data, direction) => columnsSorting(data, direction, STATUS_SUCCEEDED),
    sortable: true,
  },
  {
    key: 'failure',
    label: t('Failure reason'),
    renderCell: (row) => <FailureCell row={row} />,
    sort: (data, direction) => columnsSorting(data, direction, STATUS_FAILURE_REASON),
    sortable: true,
  },
  {
    key: CHECKUPS_COLUMN_KEYS.START_TIME,
    label: t('Start time'),
    renderCell: (row) => <StartTimeCell row={row} />,
    sort: (data, direction) => columnsSorting(data, direction, STATUS_START_TIME_STAMP),
    sortable: true,
  },
  {
    key: CHECKUPS_COLUMN_KEYS.COMPLETE_TIME,
    label: t('Completion time'),
    renderCell: (row) => <CompleteTimeCell row={row} />,
    sort: (data, direction) => columnsSorting(data, direction, STATUS_COMPLETION_TIME_STAMP),
    sortable: true,
  },
  {
    key: ACTIONS,
    label: '',
    props: { className: 'pf-v6-c-table__action' },
    renderCell: (row, callbacks) => <ActionsCell callbacks={callbacks} row={row} />,
    sortable: false,
  },
];

export const getCheckupsStorageRowId = (
  configMap: IoK8sApiCoreV1ConfigMap,
  index: number,
): string => {
  if (configMap?.metadata?.uid) {
    return configMap.metadata.uid;
  }
  const cluster = getCluster(configMap) || 'local';
  const namespace = configMap?.metadata?.namespace;
  const name = configMap?.metadata?.name;
  if (namespace && name) {
    return `${cluster}-${namespace}-${name}`;
  }
  return `configmap-${index}`;
};
