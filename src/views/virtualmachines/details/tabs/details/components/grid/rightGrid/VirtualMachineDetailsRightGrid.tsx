import React, { FC } from 'react';
import { isRunning } from 'src/views/virtualmachines/utils';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import { getStoppedVMRightGridPresentation } from '../../../utils/gridHelper';

import RunningVirtualMachineDetailsRightGrid from './RunningVirtualMachineDetailsRightGrid';
import VirtualMachineDetailsRightGridLayout from './VirtualMachineDetailsRightGridLayout';
type VirtualMachineDetailsRightGridProps = {
  vm?: V1VirtualMachine;
};

const VirtualMachineDetailsRightGrid: FC<VirtualMachineDetailsRightGridProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();

  return isRunning(vm) ? (
    <RunningVirtualMachineDetailsRightGrid vm={vm} />
  ) : (
    <VirtualMachineDetailsRightGridLayout
      vm={vm}
      vmDetailsRightGridObj={getStoppedVMRightGridPresentation(t)}
    />
  );
};

export default VirtualMachineDetailsRightGrid;
