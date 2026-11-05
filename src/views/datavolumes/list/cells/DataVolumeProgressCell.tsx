import type { FC } from 'react';

import type { V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';

import { getDataVolumeProgress } from '../../utils';

type DataVolumeProgressCellProps = {
  row: V1beta1DataVolume;
};

const DataVolumeProgressCell: FC<DataVolumeProgressCellProps> = ({ row }) => (
  <>{getDataVolumeProgress(row) || NO_DATA_DASH}</>
);

export default DataVolumeProgressCell;
