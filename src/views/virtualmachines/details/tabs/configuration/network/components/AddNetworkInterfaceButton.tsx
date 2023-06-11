import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useVMIAndPodsForVM } from '@kubevirt-utils/resources/vm';
import { ListPageCreateButton } from '@openshift-console/dynamic-plugin-sdk';

import VirtualMachinesNetworkInterfaceModal from './modal/VirtualMachinesNetworkInterfaceModal';

type AddNetworkInterfaceButtonProps = {
  vm: V1VirtualMachine;
};

const AddNetworkInterfaceButton: FC<AddNetworkInterfaceButtonProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const { vmi } = useVMIAndPodsForVM(vm?.metadata?.name, vm?.metadata?.namespace);
  const actionText = t('Add network interface');

  return (
    <ListPageCreateButton
      onClick={() =>
        createModal(({ isOpen, onClose }) => (
          <VirtualMachinesNetworkInterfaceModal
            headerText={actionText}
            isOpen={isOpen}
            onClose={onClose}
            vm={vm}
            vmi={vmi}
          />
        ))
      }
      className="add-network-interface-button"
    >
      {actionText}
    </ListPageCreateButton>
  );
};

export default AddNetworkInterfaceButton;
