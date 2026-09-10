import type { FC } from 'react';
import React from 'react';
import classNames from 'classnames';

import type {
  V1Disk,
  V1Interface,
  V1Network,
  V1VirtualMachine,
  V1VirtualMachineInstance,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ListPageCreateButton } from '@openshift-console/dynamic-plugin-sdk';

import VirtualMachinesNetworkInterfaceModal from './modal/VirtualMachinesNetworkInterfaceModal';

type AddNetworkInterfaceButtonProps = {
  onAddNetworkInterface?: (
    updatedNetworks: V1Network[],
    updatedInterfaces: V1Interface[],
    updatedDisks?: V1Disk[],
  ) => Promise<V1VirtualMachine>;
  vm: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

const AddNetworkInterfaceButton: FC<AddNetworkInterfaceButtonProps> = ({
  onAddNetworkInterface,
  vm,
  vmi,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const actionText = t('Add network interface');

  return (
    <ListPageCreateButton
      className={classNames('add-network-interface-button pf-v6-u-mb-md')}
      onClick={() =>
        createModal(({ isOpen, onClose }) => (
          <VirtualMachinesNetworkInterfaceModal
            headerText={actionText}
            isOpen={isOpen}
            onAddNetworkInterface={onAddNetworkInterface}
            onClose={onClose}
            vm={vm}
            vmi={vmi}
          />
        ))
      }
    >
      {actionText}
    </ListPageCreateButton>
  );
};

export default AddNetworkInterfaceButton;
