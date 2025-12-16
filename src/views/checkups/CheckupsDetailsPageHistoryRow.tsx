import React, { FC, ReactNode } from 'react';

import { JobModel, modelToGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiBatchV1Job } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';
import { getCluster } from '@multicluster/helpers/selectors';
import useIsACMPage from '@multicluster/useIsACMPage';
import { RowProps, TableData, Timestamp } from '@openshift-console/dynamic-plugin-sdk';
import { useHubClusterName } from '@stolostron/multicluster-sdk';

import CheckupsStatusIcon from './CheckupsStatusIcon';

export type CheckupsDetailsPageHistoryRowData = {
  customActions?: (job: IoK8sApiBatchV1Job) => ReactNode;
};

const CheckupsDetailsPageHistoryRow: FC<
  RowProps<IoK8sApiBatchV1Job, CheckupsDetailsPageHistoryRowData>
> = ({ activeColumnIDs, obj: job, rowData }) => {
  const [hubClusterName] = useHubClusterName();
  const isACMPage = useIsACMPage();
  const cluster = getCluster(job) || hubClusterName;

  return (
    <>
      <TableData activeColumnIDs={activeColumnIDs} id="job">
        <MulticlusterResourceLink
          cluster={isACMPage ? cluster : undefined}
          groupVersionKind={modelToGroupVersionKind(JobModel)}
          name={getName(job)}
          namespace={getNamespace(job)}
        />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="status">
        <CheckupsStatusIcon job={job} onlyJob={true} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="start-time">
        <Timestamp timestamp={job?.status?.startTime} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="complete-time">
        <Timestamp timestamp={job?.status?.completionTime} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="pf-v6-c-table__action" id="">
        {rowData?.customActions?.(job) || null}
      </TableData>
    </>
  );
};

export default CheckupsDetailsPageHistoryRow;
