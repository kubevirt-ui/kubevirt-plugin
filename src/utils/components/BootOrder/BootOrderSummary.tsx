import React, { useMemo } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import BootableDevicesList from '@kubevirt-utils/components/BootOrder/BootableDevicesList';
import { getDisks, getInterfaces } from '@kubevirt-utils/resources/vm';
import { transformDevices } from '@kubevirt-utils/resources/vm/utils/boot-order/bootOrder';

type BootOrderSummaryProps = {
  vm: V1VirtualMachine;
};

const BootOrderSummary: React.FC<BootOrderSummaryProps> = ({ vm }) => {
  const disks = getDisks(vm);
  const interfaces = getInterfaces(vm);

  const transformedDevices = useMemo(
    () =>
      transformDevices(disks, interfaces)?.sort((a, b) => {
        if (a.value.bootOrder && b.value.bootOrder) {
          return a.value.bootOrder - b.value.bootOrder;
        }

        if (a.value.bootOrder) {
          return -1;
        }

        if (b.value.bootOrder) {
          return 1;
        }

        return 0;
      }),
    [disks, interfaces],
  );

  return <BootableDevicesList devices={transformedDevices} />;
};

export default BootOrderSummary;
