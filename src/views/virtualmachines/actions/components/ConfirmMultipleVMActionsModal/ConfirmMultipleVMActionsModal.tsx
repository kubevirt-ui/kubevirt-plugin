import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Button,
  ButtonVariant,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Popover,
  PopoverPosition,
} from '@patternfly/react-core';
import VMsByNamespacePopover from '@virtualmachines/actions/components/ConfirmMultipleVMActionsModal/components/VMsByNamespacePopover';
import { getVMNamesByNamespace } from '@virtualmachines/actions/components/ConfirmMultipleVMActionsModal/utils/utils';

import './ConfirmMultipleVMActionsModal.scss';

type ConfirmMultipleVMActionsModalProps = {
  action: (vm: V1VirtualMachine) => Promise<string | void>;
  actionType: string;
  isOpen: boolean;
  onClose: () => void;
  vms: V1VirtualMachine[];
};

const ConfirmMultipleVMActionsModal: FC<ConfirmMultipleVMActionsModalProps> = ({
  action,
  actionType,
  isOpen,
  onClose,
  vms,
}) => {
  const { t } = useKubevirtTranslation();
  const vmsByNamespace = getVMNamesByNamespace(vms);
  const numVMs = vms?.length;
  const numVMNamespaces = Object.keys(vmsByNamespace)?.length;

  const submitHandler = () => {
    vms?.forEach((vm) => {
      action(vm);
    });
    onClose();
  };

  return (
    <Modal
      className="confirm-multiple-vm-actions-modal"
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={() => submitHandler()}
      variant={'small'}
    >
      <ModalHeader
        title={t('{{actionType}} {{numVMs}} VirtualMachines?', { actionType, numVMs })}
      />
      <ModalBody>
        {
          <>
            {t('Are you sure you want to')} {t(actionType.toLowerCase())}
          </>
        }
        <Popover
          bodyContent={<VMsByNamespacePopover vmsByNamespace={vmsByNamespace} />}
          className="confirm-multiple-vm-actions-modal__popover"
          position={PopoverPosition.right}
        >
          <a>
            {t('{{numVMs}} VirtualMachines in {{numVMNamespaces}} namespaces?', {
              numVMNamespaces,
              numVMs,
            })}
          </a>
        </Popover>
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

export default ConfirmMultipleVMActionsModal;
