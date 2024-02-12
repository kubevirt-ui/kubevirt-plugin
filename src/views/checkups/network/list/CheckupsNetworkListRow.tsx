import React from 'react';
import { Link } from 'react-router-dom-v5-compat';

import { modelToGroupVersionKind, NamespaceModel } from '@kubevirt-ui/kubevirt-api/console';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { ResourceLink, TableData, Timestamp } from '@openshift-console/dynamic-plugin-sdk';
import { createURL } from '@virtualmachines/details/tabs/overview/utils/utils';

import CheckupsNetworkStatusIcon from '../../CheckupsNetworkStatusIcon';
import { STATUS_COMPILATION_TIME_STAMP, STATUS_START_TIME_STAMP } from '../../utils/utils';
import CheckupsNetworkActions from '../components/CheckupsNetworkActions';
import {
  STATUS_MAX_LATENCY_NANO,
  STATUS_MIN_LATENCY_NANO,
  STATUS_NAD_NAME,
  STATUS_SAMPLE_DURATION,
  STATUS_SOURCE_NODE,
  STATUS_TARGET_NODE,
} from '../utils/utils';

const CheckupsNetworkListRow = ({ activeColumnIDs, obj: configMap, rowData: { getJobByName } }) => {
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
        {configMap?.data?.[STATUS_NAD_NAME] || NO_DATA_DASH}
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
        {configMap?.data?.[STATUS_SAMPLE_DURATION] || NO_DATA_DASH}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="min-latency">
        {configMap?.data?.[STATUS_MIN_LATENCY_NANO]}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="max-latency">
        {configMap?.data?.[STATUS_MAX_LATENCY_NANO]}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="source-node">
        {configMap?.data?.[STATUS_SOURCE_NODE] || NO_DATA_DASH}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="target-node">
        {configMap?.data?.[STATUS_TARGET_NODE] || NO_DATA_DASH}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="start-time">
        <Timestamp timestamp={configMap?.data?.[STATUS_START_TIME_STAMP]} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="complete-time">
        <Timestamp timestamp={configMap?.data?.[STATUS_COMPILATION_TIME_STAMP]} />
      </TableData>
      <TableData
        activeColumnIDs={activeColumnIDs}
        className="dropdown-kebab-pf pf-v5-c-table__action"
        id=""
      >
        <CheckupsNetworkActions configMap={configMap} isKebab />
      </TableData>
    </>
  );
};

export default CheckupsNetworkListRow;
