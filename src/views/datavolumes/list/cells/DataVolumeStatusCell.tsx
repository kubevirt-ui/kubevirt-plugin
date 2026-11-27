import type { FC } from 'react';

import type { V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { Label } from '@patternfly/react-core';

import { getDataVolumePhase, getDataVolumePhaseLabel } from '../../utils';

type DataVolumeStatusCellProps = {
  row: V1beta1DataVolume;
};

const DataVolumeStatusCell: FC<DataVolumeStatusCellProps> = ({ row }) => {
  const phase = getDataVolumePhase(row);

  if (!phase) {
    return <>{NO_DATA_DASH}</>;
  }

  const { color, text } = getDataVolumePhaseLabel(phase);

  return <Label color={color}>{text}</Label>;
};

export default DataVolumeStatusCell;
