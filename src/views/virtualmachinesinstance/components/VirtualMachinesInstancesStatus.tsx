import * as React from 'react';

import { icon } from '@kubevirt-utils/resources/vmi';

type VirtualMachinesInstancesStatusProps = {
  status: string;
};

const VirtualMachinesInstancesStatus: React.FC<VirtualMachinesInstancesStatusProps> = ({
  status,
}) => {
  const IconComponent = icon?.[status];
  return (
    <>
      <IconComponent /> {status}
    </>
  );
};

export default VirtualMachinesInstancesStatus;
