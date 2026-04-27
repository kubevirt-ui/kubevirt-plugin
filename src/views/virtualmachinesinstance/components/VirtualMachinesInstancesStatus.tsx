import React, { FC } from 'react';

import { icon } from '@kubevirt-utils/resources/vmi';

type VirtualMachinesInstancesStatusProps = {
  status: string;
};

const VirtualMachinesInstancesStatus: FC<VirtualMachinesInstancesStatusProps> = ({ status }) => {
  const IconComponent = icon?.[status];
  return (
    <>
      <IconComponent /> {status}
    </>
  );
};

export default VirtualMachinesInstancesStatus;
