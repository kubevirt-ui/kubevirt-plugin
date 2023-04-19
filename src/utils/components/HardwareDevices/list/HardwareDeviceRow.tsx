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
> = ({ obj: device, activeColumnIDs, rowData: { handleRemoveDevice } }) => {
  return (
    <>
      <TableData id="name" activeColumnIDs={activeColumnIDs} className="pf-m-width-20">
        {device.name}
      </TableData>
      <TableData id="deviceName" activeColumnIDs={activeColumnIDs} className="pf-m-width-30">
        {device.deviceName}
      </TableData>
      <TableData id="" activeColumnIDs={activeColumnIDs} className="pf-c-table__action">
        <Button variant="plain" onClick={() => handleRemoveDevice(device)}>
          <MinusCircleIcon />
        </Button>
      </TableData>
    </>
  );
};

export default HardwareDeviceRow;
