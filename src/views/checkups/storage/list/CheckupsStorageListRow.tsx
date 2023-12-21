import React from 'react';
import { Link } from 'react-router-dom';

import { modelToGroupVersionKind, NamespaceModel } from '@kubevirt-ui/kubevirt-api/console';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { ResourceLink, TableData, Timestamp } from '@openshift-console/dynamic-plugin-sdk';
import { createURL } from '@virtualmachines/details/tabs/overview/utils/utils';

import CheckupsNetworkStatusIcon from '../../CheckupsNetworkStatusIcon';
import {
  STATUS_COMPILATION_TIME_STAMP,
  STATUS_FAILURE_REASON,
  STATUS_START_TIME_STAMP,
} from '../../utils/utils';
import CheckupsStorageActions from '../components/CheckupsStorageActions';

const CheckupsStorageListRow = ({ activeColumnIDs, obj: configMap, rowData: { getJobByName } }) => {
  return (
    <>
      <TableData activeColumnIDs={activeColumnIDs} id="name">
        <Link
          to={createURL(
            `storage/${configMap?.metadata?.name}`,
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
      <TableData activeColumnIDs={activeColumnIDs} id="status">
        <CheckupsNetworkStatusIcon
          configMap={configMap}
          job={getJobByName(configMap?.metadata?.name)?.[0]}
        />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="failure">
        {configMap?.data?.[STATUS_FAILURE_REASON] || NO_DATA_DASH}
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
        <CheckupsStorageActions
          configMap={configMap}
          isKebab
          jobs={getJobByName(configMap?.metadata?.name)}
        />
      </TableData>
    </>
  );
};

export default CheckupsStorageListRow;
