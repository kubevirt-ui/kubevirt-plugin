import type { FC } from 'react';

import type { V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';

import { getDataVolumeStorageClass } from '../../utils';

type DataVolumeStorageClassCellProps = {
  row: V1beta1DataVolume;
};

const DataVolumeStorageClassCell: FC<DataVolumeStorageClassCellProps> = ({ row }) => (
  <>{getDataVolumeStorageClass(row) || NO_DATA_DASH}</>
);

export default DataVolumeStorageClassCell;
