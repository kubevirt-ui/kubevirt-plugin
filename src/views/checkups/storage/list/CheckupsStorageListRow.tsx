import React from 'react';
import { Link } from 'react-router-dom-v5-compat';

import { modelToGroupVersionKind, NamespaceModel } from '@kubevirt-ui/kubevirt-api/console';
import { getStorageCheckupURL } from '@kubevirt-utils/resources/checkups/urls';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { getName } from '@kubevirt-utils/resources/shared';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';
import { ManagedClusterModel } from '@multicluster/constants';
import { getCluster } from '@multicluster/helpers/selectors';
import { TableData, Timestamp } from '@openshift-console/dynamic-plugin-sdk';

import CheckupsNetworkStatusIcon from '../../CheckupsNetworkStatusIcon';
import {
  STATUS_COMPILATION_TIME_STAMP,
  STATUS_FAILURE_REASON,
  STATUS_START_TIME_STAMP,
} from '../../utils/utils';
import CheckupsStorageActions from '../components/CheckupsStorageActions';

const CheckupsStorageListRow = ({
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
        <Link to={getStorageCheckupURL(name, namespace, cluster)}>{name}</Link>
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
      <TableData activeColumnIDs={activeColumnIDs} id="status">
        <CheckupsNetworkStatusIcon configMap={configMap} job={job} />
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
      <TableData activeColumnIDs={activeColumnIDs} className="pf-v6-c-table__action" id="">
        <CheckupsStorageActions configMap={configMap} isKebab jobs={getJobByName(name)} />
      </TableData>
    </>
  );
};

export default CheckupsStorageListRow;
