import React, { FC } from 'react';

import { V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import Timestamp from '@kubevirt-utils/components/Timestamp/Timestamp';

type DataSourceCreatedCellProps = {
  row: V1beta1DataSource;
};

const DataSourceCreatedCell: FC<DataSourceCreatedCellProps> = ({ row }) => (
  <Timestamp timestamp={row?.metadata?.creationTimestamp} />
);

export default DataSourceCreatedCell;
