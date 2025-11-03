import React, { FC, useMemo } from 'react';

import { V1Disk, V1Interface } from '@kubevirt-ui/kubevirt-api/kubevirt';
import BootableDevicesList from '@kubevirt-utils/components/BootOrder/BootableDevicesList';
import {
  sortBootOrder,
  transformDevices,
} from '@kubevirt-utils/resources/vm/utils/boot-order/bootOrder';

type BootOrderProps = {
  disks: V1Disk[];
  interfaces: V1Interface[];
};

const BootOrder: FC<BootOrderProps> = ({ disks, interfaces }) => {
  const transformedDevices = useMemo(
    () => transformDevices(disks, interfaces)?.toSorted(sortBootOrder),
    [disks, interfaces],
  );

  return <BootableDevicesList devices={transformedDevices} />;
};

export default BootOrder;
