import * as React from 'react';
import { printableVMStatus } from 'src/views/virtualmachines/utils';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import { getStoppedVMRightGridPresentation } from '../../../utils/gridHelper';

import RunningVirtualMachineDetailsRightGrid from './RunningVirtualMachineDetailsRightGrid';
import VirtualMachineDetailsRightGridLayout from './VirtualMachineDetailsRightGridLayout';
type VirtualMachineDetailsRightGridProps = {
  vm?: V1VirtualMachine;
};

const VirtualMachineDetailsRightGrid: React.FC<VirtualMachineDetailsRightGridProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();
  const isVMRunning = vm?.status?.printableStatus === printableVMStatus.Running;

  return isVMRunning ? (
    <RunningVirtualMachineDetailsRightGrid vm={vm} />
  ) : (
    <VirtualMachineDetailsRightGridLayout
      vm={vm}
      vmDetailsRightGridObj={getStoppedVMRightGridPresentation(t)}
    />
  );
};

export default VirtualMachineDetailsRightGrid;
