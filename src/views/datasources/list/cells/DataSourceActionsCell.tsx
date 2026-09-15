import type { FC } from 'react';

import type { V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';

import DataSourceActions from '../../actions/DataSourceActions';

type DataSourceActionsCellProps = {
  row: V1beta1DataSource;
};

const DataSourceActionsCell: FC<DataSourceActionsCellProps> = ({ row }) => (
  <DataSourceActions dataSource={row} isKebabToggle />
);

export default DataSourceActionsCell;
