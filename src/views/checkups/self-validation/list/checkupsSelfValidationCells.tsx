import React, { FC, useMemo } from 'react';
import { Link } from 'react-router-dom-v5-compat';

import { ConfigMapModel, modelToGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getSelfValidationCheckupURL } from '@kubevirt-utils/resources/checkups/urls';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { getCluster } from '@multicluster/helpers/selectors';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import useIsACMPage from '@multicluster/useIsACMPage';
import { useHubClusterName } from '@stolostron/multicluster-sdk';

import CheckupsStatusIcon from '../../CheckupsStatusIcon';
import { ClusterCell, NamespaceCell } from '../../components/cells/CheckupsSharedCells';
import { STATUS_START_TIME_STAMP } from '../../utils/utils';
import CheckupsSelfValidationActions from '../components/actions/CheckupsSelfValidationActions';
import {
  formatStatusTimestamp,
  getCompletedSummaryText,
  getInProgressSummaryText,
  getResultsConfigMapName,
} from '../utils';

import { CheckupsSelfValidationCallbacks } from './checkupsSelfValidationListDefinition';

export { ClusterCell, NamespaceCell };

export const NameCell: FC<{ row: IoK8sApiCoreV1ConfigMap }> = ({ row }) => {
  const [hubClusterName] = useHubClusterName();
  const isACMPage = useIsACMPage();
  const cluster = getCluster(row) || hubClusterName;
  const name = row?.metadata?.name;
  const namespace = row?.metadata?.namespace;

  if (!name || !namespace) {
    return <>{name || NO_DATA_DASH}</>;
  }

  return (
    <Link to={getSelfValidationCheckupURL(name, namespace, isACMPage ? cluster : undefined)}>
      {name}
    </Link>
  );
};

export const StatusCell: FC<{
  callbacks: CheckupsSelfValidationCallbacks;
  row: IoK8sApiCoreV1ConfigMap;
}> = ({ callbacks, row }) => {
  const jobs = callbacks.getJobByName(row?.metadata?.name, false);
  const latestJob = jobs?.[0];

  return <CheckupsStatusIcon configMap={row} job={latestJob} onlyJob={true} />;
};

type TimeCellProps = {
  callbacks: CheckupsSelfValidationCallbacks;
  row: IoK8sApiCoreV1ConfigMap;
  type: 'completion' | 'start';
};

export const TimeCell: FC<TimeCellProps> = ({ callbacks, row, type }) => {
  const { t } = useKubevirtTranslation();
  const jobs = callbacks.getJobByName(row?.metadata?.name, false);
  const latestJob = jobs?.[0];

  const timestamp =
    type === 'start'
      ? latestJob?.status?.startTime || row?.data?.[STATUS_START_TIME_STAMP]
      : latestJob?.status?.completionTime;

  return <>{formatStatusTimestamp(timestamp, t, NO_DATA_DASH)}</>;
};

export const SummaryCell: FC<{
  callbacks: CheckupsSelfValidationCallbacks;
  row: IoK8sApiCoreV1ConfigMap;
}> = ({ callbacks, row }) => {
  const { t } = useKubevirtTranslation();
  const [hubClusterName] = useHubClusterName();
  const cluster = getCluster(row) || hubClusterName;
  const jobs = callbacks.getJobByName(row?.metadata?.name, false);
  const latestJob = jobs?.[0];

  const isJobCompleted =
    (latestJob?.status?.succeeded ?? 0) > 0 || (latestJob?.status?.failed ?? 0) > 0;

  const resultsConfigMapName = useMemo(
    () => (latestJob?.metadata?.name ? getResultsConfigMapName(latestJob.metadata.name) : null),
    [latestJob?.metadata?.name],
  );

  const resultsConfigMapWatchConfig = useMemo(
    () =>
      isJobCompleted && resultsConfigMapName && latestJob?.metadata?.namespace
        ? {
            cluster,
            groupVersionKind: modelToGroupVersionKind(ConfigMapModel),
            isList: false,
            name: resultsConfigMapName,
            namespace: latestJob.metadata.namespace,
          }
        : null,
    [isJobCompleted, resultsConfigMapName, latestJob?.metadata?.namespace, cluster],
  );

  const [resultsConfigMap] = useK8sWatchData<IoK8sApiCoreV1ConfigMap>(resultsConfigMapWatchConfig);

  const summaryText = useMemo(() => {
    if (isJobCompleted && resultsConfigMap) {
      return getCompletedSummaryText(resultsConfigMap, NO_DATA_DASH, t);
    }
    return getInProgressSummaryText(latestJob, NO_DATA_DASH, t);
  }, [isJobCompleted, resultsConfigMap, latestJob, t]);

  return <>{summaryText}</>;
};

export const ActionsCell: FC<{
  callbacks: CheckupsSelfValidationCallbacks;
  row: IoK8sApiCoreV1ConfigMap;
}> = ({ callbacks, row }) => {
  const jobs = callbacks.getJobByName(row?.metadata?.name, false);

  return <CheckupsSelfValidationActions configMap={row} isKebab jobs={jobs} />;
};
