import * as React from 'react';
import { printableVMStatus } from 'src/views/virtualmachines/utils';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';

import { getStoppedVMRightGridPresentation } from '../../../utils/gridHelper';

import RunningVirtualMachineDetailsRightGrid from './RunningVirtualMachineDetailsRightGrid';
import VirtualMachineDetailsRightGridLayout from './VirtualMachineDetailsRightGridLayout';
type VirtualMachineDetailsRightGridProps = {
  obj?: V1VirtualMachine;
};

const VirtualMachineDetailsRightGrid: React.FC<VirtualMachineDetailsRightGridProps> = ({ obj }) => {
  const isVMRunning = obj?.status?.printableStatus === printableVMStatus.Running;
  return isVMRunning ? (
    <RunningVirtualMachineDetailsRightGrid vm={obj} />
  ) : (
    <VirtualMachineDetailsRightGridLayout vm={obj} obj={getStoppedVMRightGridPresentation()} />
  );
};

export default VirtualMachineDetailsRightGrid;
