import React, { FC } from 'react';

import { JobModel, modelToGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiBatchV1Job } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import {
  ResourceLink,
  RowProps,
  TableData,
  Timestamp,
} from '@openshift-console/dynamic-plugin-sdk';

import CheckupsNetworkStatusIcon from './CheckupsNetworkStatusIcon';

const CheckupsNetworkDetailsPageHistoryRow: FC<
  RowProps<IoK8sApiBatchV1Job, { job: IoK8sApiBatchV1Job }>
> = ({ activeColumnIDs, obj: job }) => {
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
        <CheckupsNetworkStatusIcon job={job} onlyJob={true} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="complete-time">
        <Timestamp timestamp={job?.status?.completionTime || NO_DATA_DASH} />
      </TableData>
    </>
  );
};

export default CheckupsNetworkDetailsPageHistoryRow;
