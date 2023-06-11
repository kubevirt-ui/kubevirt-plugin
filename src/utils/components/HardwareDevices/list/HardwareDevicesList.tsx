import * as React from 'react';

import { V1GPU, V1HostDevice } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { VirtualizedTable } from '@openshift-console/dynamic-plugin-sdk';

import useHardwareDevicesColumns from './hooks/useHardwareDevicesColumns';
import HardwareDeviceRow from './HardwareDeviceRow';

type HardwareDevicesListProps = {
  devices: V1GPU[] | V1HostDevice[];
  handleRemoveDevice: (device: V1GPU | V1HostDevice) => void;
};

const HardwareDevicesList: React.FC<HardwareDevicesListProps> = ({
  devices,
  handleRemoveDevice,
}) => {
  const columns = useHardwareDevicesColumns();
  return (
    <VirtualizedTable
      columns={columns}
      data={devices || []}
      loaded
      loadError={false}
      Row={HardwareDeviceRow}
      rowData={{ handleRemoveDevice }}
      unfilteredData={devices || []}
    />
  );
};

export default HardwareDevicesList;
