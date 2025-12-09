import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Popover, PopoverPosition } from '@patternfly/react-core';
import VMsByNamespacePopover from '@virtualmachines/actions/components/ConfirmMultipleVMActionsModal/components/VMsByNamespacePopover';
import { getVMNamesByNamespace } from '@virtualmachines/actions/components/ConfirmMultipleVMActionsModal/utils/utils';

import ConfirmVMActionBaseModal from './components/ConfirmVMActionBaseModal';

import './ConfirmMultipleVMActionsModal.scss';

type ConfirmMultipleVMActionsModalProps = {
  action: (vm: V1VirtualMachine) => Promise<string | void>;
  actionType: string;
  checkToConfirmMessage?: string;
  isOpen: boolean;
  onClose: () => void;
  severityVariant?: 'danger' | 'warning' | undefined;
  vms: V1VirtualMachine[];
};

const ConfirmMultipleVMActionsModal: FC<ConfirmMultipleVMActionsModalProps> = ({
  action,
  actionType,
  checkToConfirmMessage,
  isOpen,
  onClose,
  severityVariant,
  vms,
}) => {
  const { t } = useKubevirtTranslation();
  const vmsByNamespace = getVMNamesByNamespace(vms);
  const numVMs = vms?.length;
  const numVMNamespaces = Object.keys(vmsByNamespace)?.length;

  const actionOnVms = async () =>
    Promise.any(
      vms?.map((vm) => {
        action(vm);
      }),
    );

  const body = (
    <>
      {
        <>
          {t('Are you sure you want to')} {t(actionType.toLowerCase())}{' '}
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
    </>
  );

  return (
    <ConfirmVMActionBaseModal
      {...{
        action: actionOnVms,
        actionType,
        checkToConfirmMessage,
        isOpen,
        onClose,
        severityVariant,
        title: t('{{actionType}} {{count}} VirtualMachines?', { actionType, count: numVMs }),
      }}
    >
      {body}
    </ConfirmVMActionBaseModal>
  );
};

export default ConfirmMultipleVMActionsModal;
