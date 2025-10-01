import React, { FC, useMemo } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import BootableDevicesList from '@kubevirt-utils/components/BootOrder/BootableDevicesList';
import { getSortedBootableDevices } from '@kubevirt-utils/resources/vm/utils/boot-order/bootOrder';

type BootOrderSummaryProps = {
  instanceTypeVM: V1VirtualMachine;
  vm: V1VirtualMachine;
};

const BootOrderSummary: FC<BootOrderSummaryProps> = ({ instanceTypeVM, vm }) => {
  const transformedDevices = useMemo(
    () => getSortedBootableDevices({ instanceTypeVM, vm }),
    [vm, instanceTypeVM],
  );

  return <BootableDevicesList devices={transformedDevices} />;
};

export default BootOrderSummary;
