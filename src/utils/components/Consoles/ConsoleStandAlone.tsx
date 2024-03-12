import React, { FC } from 'react';
import { useLocation } from 'react-router-dom';

import { VirtualMachineModelRef } from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { useVMIAndPodsForVM } from '@kubevirt-utils/resources/vm/hooks';

import Consoles from './Consoles';

const ConsoleStandAlone: FC = () => {
  const location = useLocation();
  const pathArray = location.pathname.split('/');
  const ns = pathArray[pathArray.indexOf('ns') + 1];
  const name = pathArray[pathArray.indexOf(VirtualMachineModelRef) + 1];

  const { vmi } = useVMIAndPodsForVM(name, ns);

  return <Consoles vmi={vmi} />;
};

export default ConsoleStandAlone;
