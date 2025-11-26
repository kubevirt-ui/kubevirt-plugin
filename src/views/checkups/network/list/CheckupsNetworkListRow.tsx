import React from 'react';
import { Link } from 'react-router-dom-v5-compat';

import { modelToGroupVersionKind, NamespaceModel } from '@kubevirt-ui/kubevirt-api/console';
import { getNetworkCheckupURL } from '@kubevirt-utils/resources/checkups/urls';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';
import { ManagedClusterModel } from '@multicluster/constants';
import { getCluster } from '@multicluster/helpers/selectors';
import { TableData, Timestamp } from '@openshift-console/dynamic-plugin-sdk';

import CheckupsNetworkStatusIcon from '../../CheckupsNetworkStatusIcon';
import { STATUS_COMPILATION_TIME_STAMP, STATUS_START_TIME_STAMP } from '../../utils/utils';
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

const CheckupsNetworkListRow = ({
  activeColumnIDs,
  obj: configMap,
  rowData: { getJobByName },
}: {
  activeColumnIDs: any;
  obj: any;
  rowData: { getJobByName?: any };
}) => {
  const cluster = getCluster(configMap);
  const namespace = getNamespace(configMap);
  const name = getName(configMap);
  const job = getJobByName(name)?.[0];

  return (
    <>
      <TableData activeColumnIDs={activeColumnIDs} id="name">
        <Link to={getNetworkCheckupURL(name, namespace, cluster)}>{name}</Link>
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
        <CheckupsNetworkStatusIcon configMap={configMap} job={job} />
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
        <Timestamp timestamp={configMap?.data?.[STATUS_COMPILATION_TIME_STAMP]} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="pf-v6-c-table__action" id="">
        <CheckupsNetworkActions configMap={configMap} isKebab jobs={getJobByName(name)} />
      </TableData>
    </>
  );
};

export default CheckupsNetworkListRow;
