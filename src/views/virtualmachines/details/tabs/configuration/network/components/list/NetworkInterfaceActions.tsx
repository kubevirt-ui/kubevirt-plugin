import React from 'react';
import { FC, useState } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ConfirmActionMessage from '@kubevirt-utils/components/ConfirmActionMessage/ConfirmActionMessage';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { deleteNetworkInterface } from '@kubevirt-utils/components/NetworkInterfaceModal/utils/helpers';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import KebabToggle from '@kubevirt-utils/components/toggles/KebabToggle';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NetworkPresentation } from '@kubevirt-utils/resources/vm/utils/network/constants';
import {
  Alert,
  AlertVariant,
  ButtonVariant,
  Dropdown,
  DropdownItem,
  DropdownList,
} from '@patternfly/react-core';
import { isRunning } from '@virtualmachines/utils';

import VirtualMachinesEditNetworkInterfaceModal from '../modal/VirtualMachinesEditNetworkInterfaceModal';

type NetworkInterfaceActionsProps = {
  nicName: string;
  nicPresentation: NetworkPresentation;
  vm: V1VirtualMachine;
};

const NetworkInterfaceActions: FC<NetworkInterfaceActionsProps> = ({
  nicName,
  nicPresentation,
  vm,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const deleteModalHeader = t('Delete NIC?');
  const editBtnText = t('Edit');
  const deleteBtnText = t('Delete');

  const isHotPlugNIC = Boolean(nicPresentation?.iface?.bridge);

  const onEditModalOpen = () => {
    createModal(({ isOpen, onClose }) => (
      <VirtualMachinesEditNetworkInterfaceModal
        isOpen={isOpen}
        nicPresentation={nicPresentation}
        onClose={onClose}
        vm={vm}
      />
    ));
    setIsDropdownOpen(false);
  };

  const onDeleteModalOpen = () => {
    createModal(({ isOpen, onClose }) => (
      <TabModal<V1VirtualMachine>
        headerText={deleteModalHeader}
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={() => deleteNetworkInterface(vm, nicName, nicPresentation)}
        submitBtnText={deleteBtnText}
        submitBtnVariant={ButtonVariant.danger}
      >
        <span>
          {isRunning(vm) && isHotPlugNIC && (
            <Alert
              title={t(
                'Deleting a network interface is supported only on VirtualMachines that were created in versions greater than 4.13.',
              )}
              component={'h6'}
              isInline
              variant={AlertVariant.warning}
            />
          )}
          <br />
          <ConfirmActionMessage
            obj={{ metadata: { name: nicName, namespace: vm?.metadata?.namespace } }}
          />
        </span>
      </TabModal>
    ));
    setIsDropdownOpen(false);
  };

  const onToggle = () => setIsDropdownOpen((prevIsOpen) => !prevIsOpen);
  return (
    <Dropdown
      toggle={KebabToggle({
        id: 'toggle-id-6',
        isExpanded: isDropdownOpen,
        onClick: onToggle,
      })}
      isOpen={isDropdownOpen}
      onOpenChange={(open: boolean) => setIsDropdownOpen(open)}
      onSelect={() => setIsDropdownOpen(false)}
      popperProps={{ position: 'right' }}
    >
      <DropdownList>
        <DropdownItem key="network-interface-edit" onClick={onEditModalOpen}>
          {editBtnText}
        </DropdownItem>
        <DropdownItem key="network-interface-delete" onClick={onDeleteModalOpen}>
          {deleteBtnText}
        </DropdownItem>
      </DropdownList>
    </Dropdown>
  );
};

export default NetworkInterfaceActions;
