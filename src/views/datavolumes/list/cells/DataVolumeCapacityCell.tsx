import type { FC } from 'react';

import type { V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';

import { getDataVolumeCapacity } from '../../utils';

type DataVolumeCapacityCellProps = {
  row: V1beta1DataVolume;
};

const DataVolumeCapacityCell: FC<DataVolumeCapacityCellProps> = ({ row }) => (
  <>{getDataVolumeCapacity(row) || NO_DATA_DASH}</>
);

export default DataVolumeCapacityCell;
