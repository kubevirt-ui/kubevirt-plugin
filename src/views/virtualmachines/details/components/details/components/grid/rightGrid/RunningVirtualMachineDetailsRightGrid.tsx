import * as React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import useFilesystemTableGuestOS from '../../../../disk/hooks/useFilesystemListGuestOS';
import useSSHService from '../../../hooks/useSSHService';
import useVMIAndPodsForVM from '../../../hooks/useVMIAndPodsForVM';
import { getRunningVMRightGridPresentation } from '../../../utils/gridHelper';

import VirtualMachineDetailsRightGridLayout from './VirtualMachineDetailsRightGridLayout';
type VirtualMachineDetailsRightGridProps = {
  vm?: V1VirtualMachine;
};

const RunningVirtualMachineDetailsRightGrid: React.FC<VirtualMachineDetailsRightGridProps> = ({
  vm,
}) => {
  const { t } = useKubevirtTranslation();
  const { vmi, pods } = useVMIAndPodsForVM(vm?.metadata?.name, vm?.metadata?.namespace);
  const [guestAgentData] = useFilesystemTableGuestOS(vmi);
  const { sshService } = useSSHService(vmi);
  return (
    <VirtualMachineDetailsRightGridLayout
      vm={vm}
      vmDetailsRightGridObj={getRunningVMRightGridPresentation(
        t,
        vmi,
        pods,
        guestAgentData,
        sshService,
      )}
    />
  );
};

export default RunningVirtualMachineDetailsRightGrid;
