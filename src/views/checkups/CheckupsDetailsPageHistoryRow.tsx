import React, { FC, ReactNode } from 'react';

import { JobModel, modelToGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiBatchV1Job } from '@kubevirt-ui/kubevirt-api/kubernetes';
import {
  ResourceLink,
  RowProps,
  TableData,
  Timestamp,
} from '@openshift-console/dynamic-plugin-sdk';

import CheckupsStatusIcon from './CheckupsStatusIcon';

export type CheckupsDetailsPageHistoryRowData = {
  customActions?: (job: IoK8sApiBatchV1Job) => ReactNode;
};

const CheckupsDetailsPageHistoryRow: FC<
  RowProps<IoK8sApiBatchV1Job, CheckupsDetailsPageHistoryRowData>
> = ({ activeColumnIDs, obj: job, rowData }) => {
  return (
    <>
      <TableData activeColumnIDs={activeColumnIDs} id="job">
        <ResourceLink
          groupVersionKind={modelToGroupVersionKind(JobModel)}
          name={job?.metadata?.name}
          namespace={job?.metadata?.namespace}
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
