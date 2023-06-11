import * as React from 'react';

import { V1GPU, V1HostDevice } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';
import { Button } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';

export type HardwareDeviceRowProps = {
  obj: V1GPU | V1HostDevice;
};

const HardwareDeviceRow: React.FC<
  RowProps<V1GPU | V1HostDevice, { handleRemoveDevice: (device: V1GPU | V1HostDevice) => void }>
> = ({ activeColumnIDs, obj: device, rowData: { handleRemoveDevice } }) => {
  return (
    <>
      <TableData activeColumnIDs={activeColumnIDs} className="pf-m-width-20" id="name">
        {device.name}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="pf-m-width-30" id="deviceName">
        {device.deviceName}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="pf-c-table__action" id="">
        <Button onClick={() => handleRemoveDevice(device)} variant="plain">
          <MinusCircleIcon />
        </Button>
      </TableData>
    </>
  );
};

export default HardwareDeviceRow;
