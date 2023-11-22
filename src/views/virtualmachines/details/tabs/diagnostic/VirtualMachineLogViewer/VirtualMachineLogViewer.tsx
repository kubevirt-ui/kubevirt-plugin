import React from 'react';

import { useVMIAndPodsForVM } from '@kubevirt-utils/resources/vm';
import { getVMIPod } from '@kubevirt-utils/resources/vmi';

import useVirtualMachineLogData from './hooks/useVirtualMachineLogData';
import VirtualMachineBasicLogViewer from './VirtualMachineBasicLogViewer/VirtualMachineBasicLogViewer';

const VirtualMachineLogViewer = ({ connect, vm }) => {
  const { pods, vmi } = useVMIAndPodsForVM(vm?.metadata?.name, vm?.metadata?.namespace);
  const pod = getVMIPod(vmi, pods);

  const { data } = useVirtualMachineLogData({ connect, pod });

  return <VirtualMachineBasicLogViewer data={data} vmi={vmi} />;
};

export default VirtualMachineLogViewer;
