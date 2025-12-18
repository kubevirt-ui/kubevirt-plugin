import * as React from 'react';

import { V1GPU, V1HostDevice } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';
import { Button, ButtonVariant } from '@patternfly/react-core';
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
      <TableData activeColumnIDs={activeColumnIDs} className="pf-v6-c-table__action" id="">
        <Button
          icon={<MinusCircleIcon />}
          onClick={() => handleRemoveDevice(device)}
          variant={ButtonVariant.plain}
        />
      </TableData>
    </>
  );
};

export default HardwareDeviceRow;
