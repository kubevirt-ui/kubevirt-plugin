import React, { FCC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';

import ConfirmVMActionBaseModal from '../ConfirmMultipleVMActionsModal/components/ConfirmVMActionBaseModal';

import { getVmActionLabels, getVmActionMessages, getVmActionTitles, VMAction } from './constants';

type ConfirmVMActionModalProps = {
  action: (vm: V1VirtualMachine) => Promise<string>;
  actionType: VMAction;
  checkToConfirmMessage?: string;
  isOpen: boolean;
  onClose: () => void;
  severityVariant?: 'danger' | 'warning' | undefined;
  vm: V1VirtualMachine;
};

const ConfirmVMActionModal: FCC<ConfirmVMActionModalProps> = ({
  action,
  actionType,
  checkToConfirmMessage,
  isOpen,
  onClose,
  severityVariant,
  vm,
}) => {
  const { t } = useKubevirtTranslation();

  const body = getVmActionMessages[actionType](t, getName(vm), getNamespace(vm));
  const actionOnVm = async () => action(vm);

  return (
    <ConfirmVMActionBaseModal
      action={actionOnVm}
      actionLabel={getVmActionLabels[actionType](t)}
      actionType={actionType}
      checkToConfirmMessage={checkToConfirmMessage}
      isOpen={isOpen}
      onClose={onClose}
      severityVariant={severityVariant}
      title={getVmActionTitles[actionType](t)}
    >
      {body}
    </ConfirmVMActionBaseModal>
  );
};

export default ConfirmVMActionModal;
