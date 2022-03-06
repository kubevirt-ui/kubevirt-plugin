import * as React from 'react';

// import { printableVMStatus } from 'src/views/virtualmachines/utils';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';

import useFilesystemTableGuestOS from '../../../../disk/hooks/useFilesystemListGuestOS';
import useSSHService from '../../../hooks/useSSHService';
import useVMIPod from '../../../hooks/useVMIPod';
import { getRunningVMRightGridPresentation } from '../../../utils/gridHelper';

import VirtualMachineDetailsRightGridLayout from './VirtualMachineDetailsRightGridLayout';
type VirtualMachineDetailsRightGridProps = {
  vm?: V1VirtualMachine;
};

const RunningVirtualMachineDetailsRightGrid: React.FC<VirtualMachineDetailsRightGridProps> = ({
  vm,
}) => {
  const { vmi, pods } = useVMIPod(vm?.metadata?.name, vm?.metadata?.namespace);
  const [guestAgentData] = useFilesystemTableGuestOS(vmi);
  const { sshService } = useSSHService(vmi);
  return (
    <VirtualMachineDetailsRightGridLayout
      vm={vm}
      obj={getRunningVMRightGridPresentation(vmi, pods, guestAgentData, sshService)}
    />
  );
};

export default RunningVirtualMachineDetailsRightGrid;
