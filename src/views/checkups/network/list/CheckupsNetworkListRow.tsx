import React from 'react';
import { Link } from 'react-router-dom-v5-compat';

import { modelToGroupVersionKind, NamespaceModel } from '@kubevirt-ui/kubevirt-api/console';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { ResourceLink, TableData, Timestamp } from '@openshift-console/dynamic-plugin-sdk';
import { createURL } from '@virtualmachines/details/tabs/overview/utils/utils';

import CheckupsNetworkStatusIcon from '../../CheckupsStatusIcon';
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

const CheckupsNetworkListRow = ({
  activeColumnIDs,
  obj: configMap,
  rowData: { getJobByName },
}: {
  activeColumnIDs: any;
  obj: any;
  rowData: { getJobByName?: any };
}) => {
  return (
    <>
      <TableData activeColumnIDs={activeColumnIDs} id="name">
        <Link
          to={createURL(
            `network/${configMap?.metadata?.name}`,
            `/k8s/ns/${configMap?.metadata?.namespace}/checkups`,
          )}
        >
          {configMap?.metadata?.name}
        </Link>
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="namespace">
        <ResourceLink
          groupVersionKind={modelToGroupVersionKind(NamespaceModel)}
          name={configMap?.metadata?.namespace}
        />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="nad">
        {configMap?.data?.[CONFIG_PARAM_NAD_NAME] || NO_DATA_DASH}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="status">
        <CheckupsNetworkStatusIcon
          configMap={configMap}
          job={getJobByName(configMap?.metadata?.name)?.[0]}
        />
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
        <CheckupsNetworkActions
          configMap={configMap}
          isKebab
          jobs={getJobByName(configMap?.metadata?.name)}
        />
      </TableData>
    </>
  );
};

export default CheckupsNetworkListRow;
