import React, { FC, useMemo } from 'react';
import { Link } from 'react-router-dom-v5-compat';

import {
  ConfigMapModel,
  modelToGroupVersionKind,
  NamespaceModel,
} from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiBatchV1Job, IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getSelfValidationCheckupURL } from '@kubevirt-utils/resources/checkups/urls';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';
import { ManagedClusterModel } from '@multicluster/constants';
import { getCluster } from '@multicluster/helpers/selectors';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import useIsACMPage from '@multicluster/useIsACMPage';
import { RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';
import { useHubClusterName } from '@stolostron/multicluster-sdk';

import CheckupsStatusIcon from '../../CheckupsStatusIcon';
import { STATUS_START_TIME_STAMP } from '../../utils/utils';
import CheckupsSelfValidationActions from '../components/actions/CheckupsSelfValidationActions';
import {
  formatStatusTimestamp,
  getCompletedSummaryText,
  getInProgressSummaryText,
  getResultsConfigMapName,
} from '../utils';

type CheckupsSelfValidationRowData = {
  getJobByName: (configMapName: string, exactMatch: boolean) => IoK8sApiBatchV1Job[];
};

type CheckupsSelfValidationListRowProps = RowProps<
  IoK8sApiCoreV1ConfigMap,
  CheckupsSelfValidationRowData
>;

const CheckupsSelfValidationListRow: FC<CheckupsSelfValidationListRowProps> = ({
  activeColumnIDs,
  obj: configMap,
  rowData: { getJobByName },
}) => {
  const { t } = useKubevirtTranslation();
  const isACMPage = useIsACMPage();
  const [hubClusterName] = useHubClusterName();
  const cluster = getCluster(configMap) || hubClusterName;
  const jobs = getJobByName(configMap?.metadata?.name, false);
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

  const formattedStartTime = useMemo(
    () =>
      formatStatusTimestamp(
        latestJob?.status?.startTime || configMap?.data?.[STATUS_START_TIME_STAMP],
        t,
        NO_DATA_DASH,
      ),
    [latestJob?.status?.startTime, configMap?.data, t],
  );

  const formattedCompletionTime = useMemo(
    () => formatStatusTimestamp(latestJob?.status?.completionTime, t, NO_DATA_DASH),
    [latestJob?.status?.completionTime, t],
  );

  const summaryText = useMemo(() => {
    // If job is completed, get summary from results ConfigMap
    if (isJobCompleted && resultsConfigMap) {
      return getCompletedSummaryText(resultsConfigMap, NO_DATA_DASH, t);
    }

    // Otherwise, get summary from job annotations (for running jobs)
    return getInProgressSummaryText(latestJob, NO_DATA_DASH, t);
  }, [isJobCompleted, resultsConfigMap, latestJob, t]);

  return (
    <>
      <TableData activeColumnIDs={activeColumnIDs} id="name">
        <Link
          to={getSelfValidationCheckupURL(
            configMap?.metadata?.name,
            configMap?.metadata?.namespace,
            isACMPage ? cluster : undefined,
          )}
        >
          {configMap?.metadata?.name}
        </Link>
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="cluster">
        <MulticlusterResourceLink
          groupVersionKind={modelToGroupVersionKind(ManagedClusterModel)}
          name={cluster}
        />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="namespace">
        <MulticlusterResourceLink
          cluster={cluster}
          groupVersionKind={modelToGroupVersionKind(NamespaceModel)}
          name={configMap?.metadata?.namespace}
        />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="status">
        <CheckupsStatusIcon configMap={configMap} job={latestJob} onlyJob={true} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="startTime">
        {formattedStartTime}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="completionTime">
        {formattedCompletionTime}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="summary">
        {summaryText}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="pf-v6-c-table__action" id="">
        <CheckupsSelfValidationActions configMap={configMap} isKebab jobs={jobs} />
      </TableData>
    </>
  );
};

export default CheckupsSelfValidationListRow;
