import * as React from 'react';

import { V1Disk, V1Interface } from '@kubevirt-ui/kubevirt-api/kubevirt';
import BootableDevicesList from '@kubevirt-utils/components/BootOrder/BootableDevicesList';
import EmptyBootOrderSummary from '@kubevirt-utils/components/BootOrder/EmptyBootSourceSummary';
import { transformDevices } from '@kubevirt-utils/resources/vm/utils/boot-order/bootOrder';

type BootOrderProps = {
  disks: V1Disk[];
  interfaces: V1Interface[];
};

const BootOrder: React.FC<BootOrderProps> = ({ disks, interfaces }) => {
  const transformedDevices = transformDevices(disks, interfaces)?.sort(
    (a, b) => a?.value?.bootOrder - b?.value?.bootOrder,
  );

  const filtered = [...transformedDevices]?.filter((device) => device?.value?.bootOrder);

  const noDevices = filtered?.length === 0;
  return noDevices ? (
    <EmptyBootOrderSummary devices={transformedDevices} />
  ) : (
    <BootableDevicesList devices={filtered} />
  );
};

export default BootOrder;
