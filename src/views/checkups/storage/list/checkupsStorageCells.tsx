import React, { FC } from 'react';
import { Link } from 'react-router';

import { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { getStorageCheckupURL } from '@kubevirt-utils/resources/checkups/urls';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { getCluster } from '@multicluster/helpers/selectors';
import useIsACMPage from '@multicluster/useIsACMPage';
import { Timestamp } from '@openshift-console/dynamic-plugin-sdk';
import { useHubClusterName } from '@stolostron/multicluster-sdk';

import CheckupsStatusIcon from '../../CheckupsStatusIcon';
import { ClusterCell, NamespaceCell } from '../../components/cells/CheckupsSharedCells';
import {
  STATUS_COMPLETION_TIME_STAMP,
  STATUS_FAILURE_REASON,
  STATUS_START_TIME_STAMP,
} from '../../utils/utils';
import CheckupsStorageActions from '../components/CheckupsStorageActions';

import { CheckupsStorageCallbacks } from './checkupsStorageListDefinition';

export { ClusterCell, NamespaceCell };

export const NameCell: FC<{ row: IoK8sApiCoreV1ConfigMap }> = ({ row }) => {
  const [hubClusterName] = useHubClusterName();
  const isACMPage = useIsACMPage();
  const cluster = getCluster(row) || hubClusterName;
  const name = getName(row);
  const namespace = getNamespace(row);

  if (!name || !namespace) {
    return <>{name || NO_DATA_DASH}</>;
  }

  return (
    <Link to={getStorageCheckupURL(name, namespace, isACMPage ? cluster : undefined)}>{name}</Link>
  );
};

export const StatusCell: FC<{
  callbacks: CheckupsStorageCallbacks;
  row: IoK8sApiCoreV1ConfigMap;
}> = ({ callbacks, row }) => {
  const jobs = callbacks.getJobByName(row?.metadata?.name);
  const job = jobs?.[0];

  return <CheckupsStatusIcon configMap={row} job={job} />;
};

export const FailureCell: FC<{ row: IoK8sApiCoreV1ConfigMap }> = ({ row }) => (
  <span data-test={`checkup-failure-${getName(row) || row?.metadata?.uid || 'unknown'}`}>
    {row?.data?.[STATUS_FAILURE_REASON] || NO_DATA_DASH}
  </span>
);

export const StartTimeCell: FC<{ row: IoK8sApiCoreV1ConfigMap }> = ({ row }) => (
  <Timestamp timestamp={row?.data?.[STATUS_START_TIME_STAMP]} />
);

export const CompleteTimeCell: FC<{ row: IoK8sApiCoreV1ConfigMap }> = ({ row }) => (
  <Timestamp timestamp={row?.data?.[STATUS_COMPLETION_TIME_STAMP]} />
);

export const ActionsCell: FC<{
  callbacks: CheckupsStorageCallbacks;
  row: IoK8sApiCoreV1ConfigMap;
}> = ({ callbacks, row }) => {
  const jobs = callbacks.getJobByName(row?.metadata?.name);

  return <CheckupsStorageActions configMap={row} isKebab jobs={jobs} />;
};
