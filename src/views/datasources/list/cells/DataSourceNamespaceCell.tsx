import React, { FC } from 'react';

import { V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';

type DataSourceNamespaceCellProps = {
  row: V1beta1DataSource;
};

const DataSourceNamespaceCell: FC<DataSourceNamespaceCellProps> = ({ row }) => (
  <ResourceLink kind="Namespace" name={getNamespace(row)} />
);

export default DataSourceNamespaceCell;
