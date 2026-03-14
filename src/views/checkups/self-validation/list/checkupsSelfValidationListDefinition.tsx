import React from 'react';
import { TFunction } from 'react-i18next';

import {
  IoK8sApiBatchV1Job,
  IoK8sApiCoreV1ConfigMap,
} from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { getCluster } from '@multicluster/helpers/selectors';
import { SortByDirection } from '@patternfly/react-table';

import {
  CheckupsStatus,
  columnsSorting,
  getConfigMapStatus,
  getJobStatus,
  STATUS_START_TIME_STAMP,
} from '../../utils/utils';
import { groupJobsByConfigMapName } from '../utils';

import {
  ActionsCell,
  ClusterCell,
  NameCell,
  NamespaceCell,
  StatusCell,
  SummaryCell,
  TimeCell,
} from './checkupsSelfValidationCells';

export type CheckupsSelfValidationCallbacks = {
  getJobByName: (configMapName: string, exactMatch: boolean) => IoK8sApiBatchV1Job[];
};

export const getCheckupsSelfValidationColumns = (
  t: TFunction,
  isACMPage: boolean,
  jobs: IoK8sApiBatchV1Job[],
): ColumnConfig<IoK8sApiCoreV1ConfigMap, CheckupsSelfValidationCallbacks>[] => {
  const jobsByConfigMapName = groupJobsByConfigMapName(jobs);

  return [
    {
      getValue: (row) => row?.metadata?.name ?? '',
      key: 'name',
      label: t('Name'),
      renderCell: (row) => <NameCell row={row} />,
      sortable: true,
    },
    ...(isACMPage
      ? [
          {
            getValue: (row: IoK8sApiCoreV1ConfigMap) => getCluster(row) ?? '',
            key: 'cluster',
            label: t('Cluster'),
            renderCell: (row: IoK8sApiCoreV1ConfigMap) => <ClusterCell row={row} />,
            sortable: true,
          },
        ]
      : []),
    {
      getValue: (row) => row?.metadata?.namespace ?? '',
      key: 'namespace',
      label: t('Namespace'),
      renderCell: (row) => <NamespaceCell row={row} />,
      sortable: true,
    },
    {
      key: 'status',
      label: t('Status'),
      renderCell: (row, callbacks) => <StatusCell callbacks={callbacks} row={row} />,
      sort: (data, sortDirection) => {
        const statusOrder = {
          [CheckupsStatus.Deleting]: 5,
          [CheckupsStatus.Done]: 2,
          [CheckupsStatus.Failed]: 3,
          [CheckupsStatus.Pending]: 4,
          [CheckupsStatus.Running]: 1,
        };

        return data.toSorted((a, b) => {
          const jobA = jobsByConfigMapName.get(a?.metadata?.name)?.[0];
          const jobB = jobsByConfigMapName.get(b?.metadata?.name)?.[0];
          const statusA = getConfigMapStatus(a, getJobStatus(jobA));
          const statusB = getConfigMapStatus(b, getJobStatus(jobB));

          const orderA = statusOrder[statusA] || 999;
          const orderB = statusOrder[statusB] || 999;

          return sortDirection === SortByDirection.asc ? orderA - orderB : orderB - orderA;
        });
      },
      sortable: true,
    },
    {
      key: 'startTime',
      label: t('Start time'),
      renderCell: (row, callbacks) => <TimeCell callbacks={callbacks} row={row} type="start" />,
      sort: (data, direction) => columnsSorting(data, direction, STATUS_START_TIME_STAMP),
      sortable: true,
    },
    {
      key: 'completionTime',
      label: t('Completion time'),
      renderCell: (row, callbacks) => (
        <TimeCell callbacks={callbacks} row={row} type="completion" />
      ),
      sort: (data, sortDirection) => {
        return data.toSorted((a, b) => {
          const jobA = jobsByConfigMapName.get(a?.metadata?.name)?.[0];
          const jobB = jobsByConfigMapName.get(b?.metadata?.name)?.[0];
          const completionTimeA = jobA?.status?.completionTime;
          const completionTimeB = jobB?.status?.completionTime;

          if (!completionTimeA && !completionTimeB) return 0;
          if (!completionTimeA) return sortDirection === SortByDirection.asc ? 1 : -1;
          if (!completionTimeB) return sortDirection === SortByDirection.asc ? -1 : 1;

          const timeA = new Date(completionTimeA).getTime();
          const timeB = new Date(completionTimeB).getTime();

          return sortDirection === SortByDirection.asc ? timeA - timeB : timeB - timeA;
        });
      },
      sortable: true,
    },
    {
      key: 'summary',
      label: t('Summary'),
      renderCell: (row, callbacks) => <SummaryCell callbacks={callbacks} row={row} />,
      sortable: false,
    },
    {
      key: 'actions',
      label: '',
      props: { className: 'pf-v6-c-table__action' },
      renderCell: (row, callbacks) => <ActionsCell callbacks={callbacks} row={row} />,
      sortable: false,
    },
  ];
};

export const getCheckupsSelfValidationRowId = (
  configMap: IoK8sApiCoreV1ConfigMap,
  index: number,
): string =>
  configMap?.metadata?.uid ||
  (configMap?.metadata?.namespace && configMap?.metadata?.name
    ? `${configMap.metadata.namespace}-${configMap.metadata.name}`
    : `configmap-${index}`);
