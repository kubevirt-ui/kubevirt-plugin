import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import useSingleNodeCluster from '@kubevirt-utils/hooks/useSingleNodeCluster';
import VirtualMachineActions from '@virtualmachines/actions/components/VirtualMachineActions/VirtualMachineActions';
import useVirtualMachineActionsProvider from '@virtualmachines/actions/hooks/useVirtualMachineActionsProvider';
import { vmimMapperSignal } from '@virtualmachines/utils';
import { getVMIMFromMapper } from '@virtualmachines/utils/mappers';

type VirtualMachineActionButtonProps = {
  obj: V1VirtualMachine;
};

const VirtualMachineActionButton: FC<VirtualMachineActionButtonProps> = ({ obj }) => {
  const [isSingleNodeCluster] = useSingleNodeCluster();
  const vmimMapper = vmimMapperSignal.value;

  const vmim = getVMIMFromMapper(vmimMapper, obj);

  const [actions] = useVirtualMachineActionsProvider(obj, vmim, isSingleNodeCluster);

  return <VirtualMachineActions actions={actions} isKebabToggle />;
};

export default VirtualMachineActionButton;
