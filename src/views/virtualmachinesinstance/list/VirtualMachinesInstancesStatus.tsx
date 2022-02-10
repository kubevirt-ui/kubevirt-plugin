import * as React from 'react';

import { icon } from './utils';

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
