import type { FC } from 'react';

import { icon } from '@kubevirt-utils/resources/vmi';

type VirtualMachinesInstancesStatusProps = {
  status: string;
};

const VirtualMachinesInstancesStatus: FC<VirtualMachinesInstancesStatusProps> = ({ status }) => {
  const IconComponent = icon[status as keyof typeof icon] ?? icon['unknown'];
  return (
    <>
      <IconComponent /> {status}
    </>
  );
};

export default VirtualMachinesInstancesStatus;
