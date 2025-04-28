import React, { FC } from 'react';

import {
  V1VirtualMachine,
  V1VirtualMachineInstanceMigration,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import VirtualMachineActions from '@virtualmachines/actions/components/VirtualMachineActions/VirtualMachineActions';
import useVirtualMachineActionsProvider from '@virtualmachines/actions/hooks/useVirtualMachineActionsProvider';

type VirtualMachineRowActionsProps = {
  isSingleNodeCluster: boolean;
  vm: V1VirtualMachine;
  vmim: V1VirtualMachineInstanceMigration;
};

const VirtualMachineRowActions: FC<VirtualMachineRowActionsProps> = ({
  isSingleNodeCluster,
  vm,
  vmim,
}) => {
  const [actions] = useVirtualMachineActionsProvider(vm, vmim, isSingleNodeCluster);

  return <VirtualMachineActions actions={actions} isKebabToggle />;
};

export default VirtualMachineRowActions;
