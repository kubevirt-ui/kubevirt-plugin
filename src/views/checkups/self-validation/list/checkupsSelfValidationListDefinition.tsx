import React from 'react';
import { TFunction } from 'i18next';

import {
  IoK8sApiBatchV1Job,
  IoK8sApiCoreV1ConfigMap,
} from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { type TableExportColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { ACTIONS } from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/const';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { getCluster } from '@multicluster/helpers/selectors';
import { SortByDirection } from '@patternfly/react-table';

import { CHECKUPS_COLUMN_KEYS } from '../../utils/constants';
import {
  columnsSorting,
  getCSVExportStatusLabel,
  getJobStatus,
  getJobStatusRank,
  STATUS_START_TIME_STAMP,
} from '../../utils/utils';
import { formatStatusTimestamp, groupJobsByConfigMapName } from '../utils/selfValidationResults';

import {
  ActionsCell,
  ClusterCell,
  NameCell,
  NamespaceCell,
  StatusCell,
  TimeCell,
} from './checkupsSelfValidationCells';

export type CheckupsSelfValidationCallbacks = {
  getJobByName: (configMapName: string, exactMatch: boolean) => IoK8sApiBatchV1Job[];
};

export const getCheckupsSelfValidationColumns = (
  t: TFunction,
  isACMPage: boolean,
  jobs: IoK8sApiBatchV1Job[],
  hubClusterName?: string,
): TableExportColumnConfig<IoK8sApiCoreV1ConfigMap, CheckupsSelfValidationCallbacks>[] => {
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
            getValue: (row: IoK8sApiCoreV1ConfigMap) => getCluster(row) || hubClusterName || '',
            key: 'cluster',
            label: t('Cluster'),
            renderCell: (row: IoK8sApiCoreV1ConfigMap) => <ClusterCell row={row} />,
            sortable: true,
          },
        ]
      : []),
    {
      getValue: (row) => getNamespace(row) ?? '',
      key: 'namespace',
      label: t('Namespace'),
      renderCell: (row) => <NamespaceCell row={row} />,
      sortable: true,
    },
    {
      getValue: (row, callbacks) => {
        const latestJob = callbacks?.getJobByName(getName(row), false)?.[0];
        return getCSVExportStatusLabel(getJobStatus(latestJob), t);
      },
      key: 'status',
      label: t('Status'),
      renderCell: (row, callbacks) => <StatusCell callbacks={callbacks} row={row} />,
      sort: (data, sortDirection) =>
        data.toSorted((a, b) => {
          const rankA = getJobStatusRank(jobsByConfigMapName.get(a?.metadata?.name)?.[0]);
          const rankB = getJobStatusRank(jobsByConfigMapName.get(b?.metadata?.name)?.[0]);
          return sortDirection === SortByDirection.asc ? rankA - rankB : rankB - rankA;
        }),
      sortable: true,
    },
    {
      getValue: (row, callbacks) => {
        const latestJob = callbacks?.getJobByName(row?.metadata?.name, false)?.[0];
        return formatStatusTimestamp(
          latestJob?.status?.startTime || row?.data?.[STATUS_START_TIME_STAMP],
          t,
          NO_DATA_DASH,
        );
      },
      key: CHECKUPS_COLUMN_KEYS.START_TIME_CAMEL,
      label: t('Start time'),
      renderCell: (row, callbacks) => <TimeCell callbacks={callbacks} row={row} type="start" />,
      sort: (data, direction) => columnsSorting(data, direction, STATUS_START_TIME_STAMP),
      sortable: true,
    },
    {
      getValue: (row, callbacks) => {
        const latestJob = callbacks?.getJobByName(row?.metadata?.name, false)?.[0];
        return formatStatusTimestamp(latestJob?.status?.completionTime, t, NO_DATA_DASH);
      },
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
      key: ACTIONS,
      label: '',
      props: { className: 'pf-v6-c-table__action' },
      renderCell: (row, callbacks) => <ActionsCell callbacks={callbacks} row={row} />,
      sortable: false,
    },
  ];
};
