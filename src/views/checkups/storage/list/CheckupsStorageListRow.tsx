import React, { FC } from 'react';
import { Link } from 'react-router-dom-v5-compat';

import { modelToGroupVersionKind, NamespaceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  IoK8sApiBatchV1Job,
  IoK8sApiCoreV1ConfigMap,
} from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { getStorageCheckupURL } from '@kubevirt-utils/resources/checkups/urls';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';
import { ManagedClusterModel } from '@multicluster/constants';
import { getCluster } from '@multicluster/helpers/selectors';
import useIsACMPage from '@multicluster/useIsACMPage';
import { RowProps, TableData, Timestamp } from '@openshift-console/dynamic-plugin-sdk';
import { useHubClusterName } from '@stolostron/multicluster-sdk';

import CheckupsStatusIcon from '../../CheckupsStatusIcon';
import {
  STATUS_COMPLETION_TIME_STAMP,
  STATUS_FAILURE_REASON,
  STATUS_START_TIME_STAMP,
} from '../../utils/utils';
import CheckupsStorageActions from '../components/CheckupsStorageActions';

type CheckupsStorageRowData = {
  getJobByName: (configMapName: string) => IoK8sApiBatchV1Job[];
};

type CheckupsStorageListRowProps = RowProps<IoK8sApiCoreV1ConfigMap, CheckupsStorageRowData>;

const CheckupsStorageListRow: FC<CheckupsStorageListRowProps> = ({
  activeColumnIDs,
  obj: configMap,
  rowData: { getJobByName },
}) => {
  const [hubClusterName] = useHubClusterName();
  const cluster = getCluster(configMap) || hubClusterName;
  const isACMPage = useIsACMPage();
  const namespace = getNamespace(configMap);
  const name = getName(configMap);
  const jobs = getJobByName(configMap?.metadata?.name);
  const job = jobs?.[0];

  return (
    <>
      <TableData activeColumnIDs={activeColumnIDs} id="name">
        <Link to={getStorageCheckupURL(name, namespace, isACMPage ? cluster : undefined)}>
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
      <TableData activeColumnIDs={activeColumnIDs} id="status">
        <CheckupsStatusIcon configMap={configMap} job={job} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="failure">
        {configMap?.data?.[STATUS_FAILURE_REASON] || NO_DATA_DASH}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="start-time">
        <Timestamp timestamp={configMap?.data?.[STATUS_START_TIME_STAMP]} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="complete-time">
        <Timestamp timestamp={configMap?.data?.[STATUS_COMPLETION_TIME_STAMP]} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="pf-v6-c-table__action" id="">
        <CheckupsStorageActions configMap={configMap} isKebab jobs={jobs} />
      </TableData>
    </>
  );
};

export default CheckupsStorageListRow;
