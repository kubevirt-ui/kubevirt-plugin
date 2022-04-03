import * as React from 'react';

import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { TableData } from '@openshift-console/dynamic-plugin-sdk';

const VirtualMachinesOverviewTabHardwareDevicesRow = ({ obj, activeColumnIDs }) => {
  return (
    <>
      <TableData id="resourceName" activeColumnIDs={activeColumnIDs}>
        {obj?.name || NO_DATA_DASH}
      </TableData>
      <TableData id="hardwareName" activeColumnIDs={activeColumnIDs}>
        {obj?.deviceName || NO_DATA_DASH}
      </TableData>
    </>
  );
};

export default VirtualMachinesOverviewTabHardwareDevicesRow;
