import type { FC } from 'react';

import type { V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';

import DataVolumeActions from '../../actions/DataVolumeActions';

type DataVolumeActionsCellProps = {
  row: V1beta1DataVolume;
};

const DataVolumeActionsCell: FC<DataVolumeActionsCellProps> = ({ row }) => (
  <DataVolumeActions dataVolume={row} isKebabToggle />
);

export default DataVolumeActionsCell;
