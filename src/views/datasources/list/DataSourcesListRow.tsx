import * as React from 'react';

import { modelToGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import Timestamp from '@kubevirt-utils/components/Timestamp/Timestamp';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ResourceLink, RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';

import DataSourceActions from '../actions/DataSourceActions';
import { getDataSourceCronJob, getDataSourceLastUpdated } from '../utils';

export const DataSourcesListRow: React.FC<RowProps<V1beta1DataSource>> = ({
  activeColumnIDs,
  obj,
}) => {
  const { t } = useKubevirtTranslation();
  const importCron = getDataSourceCronJob(obj);
  const lastUpdated = getDataSourceLastUpdated(obj);

  return (
    <>
      <TableData activeColumnIDs={activeColumnIDs} className="pf-m-width-15" id="name">
        <ResourceLink
          groupVersionKind={modelToGroupVersionKind(DataSourceModel)}
          name={obj.metadata.name}
          namespace={obj.metadata.namespace}
        />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="pf-m-width-10" id="namespace">
        <ResourceLink kind="Namespace" name={obj.metadata.namespace} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="pf-m-width-15" id="created">
        <Timestamp timestamp={obj?.metadata?.creationTimestamp} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="pf-m-width-15" id="updated">
        <Timestamp timestamp={lastUpdated} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="pf-m-width-10" id="import-cron">
        {importCron ? t('Yes') : t('No')}
      </TableData>
      <TableData
        activeColumnIDs={activeColumnIDs}
        className="dropdown-kebab-pf pf-c-table__action"
        id=""
      >
        <DataSourceActions dataSource={obj} isKebabToggle />
      </TableData>
    </>
  );
};
