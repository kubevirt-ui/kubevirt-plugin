import React, { FCC } from 'react';

import { DataSourceModel, modelToGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';

type DataSourceNameCellProps = {
  row: V1beta1DataSource;
};

const DataSourceNameCell: FCC<DataSourceNameCellProps> = ({ row }) => (
  <ResourceLink
    groupVersionKind={modelToGroupVersionKind(DataSourceModel)}
    name={getName(row)}
    namespace={getNamespace(row)}
  />
);

export default DataSourceNameCell;
