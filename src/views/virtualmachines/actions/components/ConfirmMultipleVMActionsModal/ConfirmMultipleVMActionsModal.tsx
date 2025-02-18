import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, ButtonVariant, Popover, PopoverPosition } from '@patternfly/react-core';
import { Modal } from '@patternfly/react-core/deprecated';
import VMsByNamespacePopover from '@virtualmachines/actions/components/ConfirmMultipleVMActionsModal/components/VMsByNamespacePopover';
import { getVMNamesByNamespace } from '@virtualmachines/actions/components/ConfirmMultipleVMActionsModal/utils/utils';

import './ConfirmMultipleVMActionsModal.scss';

type ConfirmMultipleVMActionsModalProps = {
  action: (vm: V1VirtualMachine) => Promise<string>;
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
      onSubmit={() => submitHandler()}
      title={t(`${actionType} ${numVMs} VirtualMachines?`)}
      variant={'small'}
    >
      {t('Are you sure you want to stop ')}
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
    </Modal>
  );
};

export default ConfirmMultipleVMActionsModal;
