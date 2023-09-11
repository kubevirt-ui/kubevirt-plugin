import React, { FC } from 'react';

import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';

import { HardwareDevicePageRow } from './utils/constants';

const HardwareDevicesPageRow: FC<RowProps<HardwareDevicePageRow>> = ({
  activeColumnIDs,
  obj: device,
}) => {
  return (
    <>
      <TableData activeColumnIDs={activeColumnIDs} id="resourceName">
        {device?.resourceName || NO_DATA_DASH}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="selector">
        {device?.selector || NO_DATA_DASH}
      </TableData>
    </>
  );
};

export default HardwareDevicesPageRow;
