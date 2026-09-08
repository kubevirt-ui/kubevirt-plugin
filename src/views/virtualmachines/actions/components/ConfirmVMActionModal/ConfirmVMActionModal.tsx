import React, { type FC } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import AckConfirmationModal from '@kubevirt-utils/components/AckConfirmationModal/AckConfirmationModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';

import {
  getVmActionLabels,
  getVmActionMessages,
  getVmActionTitles,
  type VMAction,
} from './constants';

type ConfirmVMActionModalProps = {
  action: (vm: V1VirtualMachine) => Promise<string>;
  actionType: VMAction;
  checkToConfirmMessage?: string;
  isOpen: boolean;
  onClose: () => void;
  severityVariant?: 'danger' | 'warning';
  vm: V1VirtualMachine;
};

const ConfirmVMActionModal: FC<ConfirmVMActionModalProps> = ({
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
  const actionOnVm = async (): Promise<string> => action(vm);

  return (
    <AckConfirmationModal
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
    </AckConfirmationModal>
  );
};

export default ConfirmVMActionModal;
