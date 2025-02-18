import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { Button, ButtonVariant } from '@patternfly/react-core';
import { Modal } from '@patternfly/react-core/deprecated';

type ConfirmVMActionModalProps = {
  action: (vm: V1VirtualMachine) => Promise<string>;
  actionType: string;
  isOpen: boolean;
  onClose: () => void;
  vm: V1VirtualMachine;
};

const ConfirmVMActionModal: FC<ConfirmVMActionModalProps> = ({
  action,
  actionType,
  isOpen,
  onClose,
  vm,
}) => {
  const { t } = useKubevirtTranslation();

  const submitHandler = () => {
    action(vm);
    onClose();
  };

  return (
    <Modal
      actions={[
        <Button key="confirm" onClick={submitHandler} variant={ButtonVariant.primary}>
          {t(actionType)}
        </Button>,
        <Button key="cancel" onClick={onClose} variant="link">
          {t('Cancel')}
        </Button>,
      ]}
      className="confirm-multiple-vm-actions-modal"
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={submitHandler}
      title={t('{{actionType}} VirtualMachine?', { actionType })}
      variant={'small'}
    >
      {t(
        `Are you sure you want to ${actionType?.toLowerCase()} ${getName(
          vm,
        )} in namespace ${getNamespace(vm)}?`,
      )}
    </Modal>
  );
};

export default ConfirmVMActionModal;
