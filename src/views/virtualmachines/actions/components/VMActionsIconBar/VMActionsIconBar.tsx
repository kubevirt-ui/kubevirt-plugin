import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { CONFIRM_VM_ACTIONS } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { Split } from '@patternfly/react-core';
import ActionIconButton from '@virtualmachines/actions/components/VMActionsIconBar/components/ActionIconButton';
import { getVMActionIconsDetails } from '@virtualmachines/actions/components/VMActionsIconBar/utils/utils';

type VMActionsIconBarProps = {
  vm: V1VirtualMachine;
};

const VMActionsIconBar: FC<VMActionsIconBarProps> = ({ vm }) => {
  const { createModal } = useModal();
  const { featureEnabled: confirmVMActionsEnabled } = useFeatures(CONFIRM_VM_ACTIONS);

  return (
    <Split className="vm-actions-icon-bar">
      {getVMActionIconsDetails(vm, confirmVMActionsEnabled, createModal).map((actionDetails) => (
        <ActionIconButton {...actionDetails} key={actionDetails?.action?.id} />
      ))}
    </Split>
  );
};

export default VMActionsIconBar;
