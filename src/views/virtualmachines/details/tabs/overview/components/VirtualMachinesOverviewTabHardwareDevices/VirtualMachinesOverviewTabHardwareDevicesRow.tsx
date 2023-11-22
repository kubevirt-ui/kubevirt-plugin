import * as React from 'react';

import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { TableData } from '@openshift-console/dynamic-plugin-sdk';

const VirtualMachinesOverviewTabHardwareDevicesRow = ({ activeColumnIDs, obj }) => {
  return (
    <>
      <TableData activeColumnIDs={activeColumnIDs} id="resourceName">
        {obj?.name || NO_DATA_DASH}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="hardwareName">
        {obj?.deviceName || NO_DATA_DASH}
      </TableData>
    </>
  );
};

export default VirtualMachinesOverviewTabHardwareDevicesRow;
