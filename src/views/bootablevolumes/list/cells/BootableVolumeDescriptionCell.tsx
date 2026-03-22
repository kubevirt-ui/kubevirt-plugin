import React, { FC } from 'react';

import { ANNOTATIONS } from '@kubevirt-utils/resources/template';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { TableText, WrapModifier } from '@patternfly/react-table';

import { BootableResource } from '../../utils/types';

type BootableVolumeDescriptionCellProps = {
  row: BootableResource;
};

const BootableVolumeDescriptionCell: FC<BootableVolumeDescriptionCellProps> = ({ row }) => (
  <TableText wrapModifier={WrapModifier.truncate}>
    {row?.metadata?.annotations?.[ANNOTATIONS.description] || NO_DATA_DASH}
  </TableText>
);

export default BootableVolumeDescriptionCell;
