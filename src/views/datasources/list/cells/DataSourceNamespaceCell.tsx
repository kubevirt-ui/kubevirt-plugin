import { type FC } from 'react';

import { type V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { modelToGroupVersionKind, NamespaceModel } from '@kubevirt-utils/models';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';

type DataSourceNamespaceCellProps = {
  row: V1beta1DataSource;
};

const DataSourceNamespaceCell: FC<DataSourceNamespaceCellProps> = ({ row }) => (
  <ResourceLink
    groupVersionKind={modelToGroupVersionKind(NamespaceModel)}
    name={getNamespace(row)}
  />
);

export default DataSourceNamespaceCell;
