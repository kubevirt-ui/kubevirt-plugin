import type { FC } from 'react';

import type { V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import Timestamp from '@kubevirt-utils/components/Timestamp/Timestamp';

type DataVolumeCreatedCellProps = {
  row: V1beta1DataVolume;
};

const DataVolumeCreatedCell: FC<DataVolumeCreatedCellProps> = ({ row }) => (
  <Timestamp timestamp={row?.metadata?.creationTimestamp} />
);

export default DataVolumeCreatedCell;
