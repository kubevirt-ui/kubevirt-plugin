import React, { FC } from 'react';
import { Link } from 'react-router-dom-v5-compat';

import { modelToGroupVersionKind, NamespaceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  IoK8sApiBatchV1Job,
  IoK8sApiCoreV1ConfigMap,
} from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { getNetworkCheckupURL } from '@kubevirt-utils/resources/checkups/urls';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';
import { ManagedClusterModel } from '@multicluster/constants';
import { getCluster } from '@multicluster/helpers/selectors';
import useIsACMPage from '@multicluster/useIsACMPage';
import { RowProps, TableData, Timestamp } from '@openshift-console/dynamic-plugin-sdk';
import { useHubClusterName } from '@stolostron/multicluster-sdk';

import CheckupsStatusIcon from '../../CheckupsStatusIcon';
import { STATUS_COMPLETION_TIME_STAMP, STATUS_START_TIME_STAMP } from '../../utils/utils';
import CheckupsNetworkActions from '../components/CheckupsNetworkActions';
import {
  CONFIG_PARAM_NAD_NAME,
  CONFIG_PARAM_SAMPLE_DURATION,
  CONFIG_PARAM_SOURCE_NODE,
  CONFIG_PARAM_TARGET_NODE,
  STATUS_MAX_LATENCY_NANO,
  STATUS_MIN_LATENCY_NANO,
  STATUS_SOURCE_NODE,
  STATUS_TARGET_NODE,
} from '../utils/utils';

type CheckupsNetworkRowData = {
  getJobByName: (configMapName: string) => IoK8sApiBatchV1Job[];
};

type CheckupsNetworkListRowProps = RowProps<IoK8sApiCoreV1ConfigMap, CheckupsNetworkRowData>;

const CheckupsNetworkListRow: FC<CheckupsNetworkListRowProps> = ({
  activeColumnIDs,
  obj: configMap,
  rowData: { getJobByName },
}) => {
  const isACMPage = useIsACMPage();
  const [hubClusterName] = useHubClusterName();
  const cluster = getCluster(configMap) || hubClusterName;
  const namespace = getNamespace(configMap);
  const name = getName(configMap);
  const jobs = getJobByName(configMap?.metadata?.name);
  const job = jobs?.[0];

  return (
    <>
      <TableData activeColumnIDs={activeColumnIDs} id="name">
        <Link to={getNetworkCheckupURL(name, namespace, isACMPage ? cluster : undefined)}>
          {name}
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
          name={namespace}
        />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="nad">
        {configMap?.data?.[CONFIG_PARAM_NAD_NAME] || NO_DATA_DASH}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="status">
        <CheckupsStatusIcon configMap={configMap} job={job} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="latency">
        {configMap?.data?.[STATUS_MAX_LATENCY_NANO] || NO_DATA_DASH}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="duration">
        {configMap?.data?.[CONFIG_PARAM_SAMPLE_DURATION] || NO_DATA_DASH}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="min-latency">
        {configMap?.data?.[STATUS_MIN_LATENCY_NANO]}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="max-latency">
        {configMap?.data?.[STATUS_MAX_LATENCY_NANO]}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="source-node">
        {configMap?.data?.[STATUS_SOURCE_NODE] ||
          configMap?.data?.[CONFIG_PARAM_SOURCE_NODE] ||
          NO_DATA_DASH}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="target-node">
        {configMap?.data?.[STATUS_TARGET_NODE] ||
          configMap?.data?.[CONFIG_PARAM_TARGET_NODE] ||
          NO_DATA_DASH}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="start-time">
        <Timestamp timestamp={configMap?.data?.[STATUS_START_TIME_STAMP]} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="complete-time">
        <Timestamp timestamp={configMap?.data?.[STATUS_COMPLETION_TIME_STAMP]} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="pf-v6-c-table__action" id="">
        <CheckupsNetworkActions configMap={configMap} isKebab jobs={jobs} />
      </TableData>
    </>
  );
};

export default CheckupsNetworkListRow;
