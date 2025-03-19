import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import {
  Button,
  ButtonVariant,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from '@patternfly/react-core';

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
      className="confirm-multiple-vm-actions-modal"
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={submitHandler}
      variant={'small'}
    >
      <ModalHeader title={t('{{actionType}} VirtualMachine?', { actionType })} />
      <ModalBody>
        {t(
          `Are you sure you want to ${actionType?.toLowerCase()} ${getName(
            vm,
          )} in namespace ${getNamespace(vm)}?`,
        )}
      </ModalBody>
      <ModalFooter>
        <Button key="confirm" onClick={submitHandler}>
          {t(actionType)}
        </Button>
        <Button key="cancel" onClick={onClose} variant={ButtonVariant.link}>
          {t('Cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ConfirmVMActionModal;
