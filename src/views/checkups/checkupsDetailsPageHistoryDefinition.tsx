import React, { FC, ReactNode } from 'react';
import { TFunction } from 'react-i18next';

import { JobModel, modelToGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { IoK8sApiBatchV1Job } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';
import { getCluster } from '@multicluster/helpers/selectors';
import useIsACMPage from '@multicluster/useIsACMPage';
import { Timestamp } from '@openshift-console/dynamic-plugin-sdk';
import { useHubClusterName } from '@stolostron/multicluster-sdk';

import CheckupsStatusIcon from './CheckupsStatusIcon';

export type CheckupsHistoryCallbacks = {
  customActions?: (job: IoK8sApiBatchV1Job) => ReactNode;
};

const JobCell: FC<{ row: IoK8sApiBatchV1Job }> = ({ row }) => {
  const [hubClusterName] = useHubClusterName();
  const isACMPage = useIsACMPage();
  const cluster = getCluster(row) || hubClusterName;

  return (
    <MulticlusterResourceLink
      cluster={isACMPage ? cluster : undefined}
      groupVersionKind={modelToGroupVersionKind(JobModel)}
      name={getName(row)}
      namespace={getNamespace(row)}
    />
  );
};

const StatusCell: FC<{ row: IoK8sApiBatchV1Job }> = ({ row }) => (
  <CheckupsStatusIcon job={row} onlyJob={true} />
);

const StartTimeCell: FC<{ row: IoK8sApiBatchV1Job }> = ({ row }) => (
  <Timestamp timestamp={row?.status?.startTime} />
);

const CompleteTimeCell: FC<{ row: IoK8sApiBatchV1Job }> = ({ row }) => (
  <Timestamp timestamp={row?.status?.completionTime} />
);

const ActionsCell: FC<{ callbacks: CheckupsHistoryCallbacks; row: IoK8sApiBatchV1Job }> = ({
  callbacks,
  row,
}) => <>{callbacks?.customActions?.(row) || null}</>;

export const getCheckupsHistoryColumns = (
  t: TFunction,
): ColumnConfig<IoK8sApiBatchV1Job, CheckupsHistoryCallbacks>[] => [
  {
    getValue: (row) => getName(row) ?? '',
    key: 'job',
    label: t('Job'),
    renderCell: (row) => <JobCell row={row} />,
    sortable: true,
  },
  {
    getValue: (row) => (row?.status?.succeeded ? 1 : 0),
    key: 'status',
    label: t('Status'),
    renderCell: (row) => <StatusCell row={row} />,
    sortable: true,
  },
  {
    getValue: (row) => row?.status?.startTime ?? '',
    key: 'start-time',
    label: t('Start time'),
    renderCell: (row) => <StartTimeCell row={row} />,
    sortable: true,
  },
  {
    getValue: (row) => row?.status?.completionTime ?? '',
    key: 'complete-time',
    label: t('Complete time'),
    renderCell: (row) => <CompleteTimeCell row={row} />,
    sortable: true,
  },
  {
    key: 'actions',
    label: '',
    props: { className: 'pf-v6-c-table__action' },
    renderCell: (row, callbacks) => <ActionsCell callbacks={callbacks} row={row} />,
    sortable: false,
  },
];

export const getCheckupsHistoryRowId = (job: IoK8sApiBatchV1Job, index: number): string =>
  job?.metadata?.uid ||
  (job?.metadata?.namespace && job?.metadata?.name
    ? `${job.metadata.namespace}-${job.metadata.name}`
    : `job-${index}`);
