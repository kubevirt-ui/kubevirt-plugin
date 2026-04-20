import React, { FCC } from 'react';

import { V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import Timestamp from '@kubevirt-utils/components/Timestamp/Timestamp';

import { getDataSourceLastUpdated } from '../../utils';

type DataSourceUpdatedCellProps = {
  row: V1beta1DataSource;
};

const DataSourceUpdatedCell: FCC<DataSourceUpdatedCellProps> = ({ row }) => (
  <Timestamp timestamp={getDataSourceLastUpdated(row)} />
);

export default DataSourceUpdatedCell;
