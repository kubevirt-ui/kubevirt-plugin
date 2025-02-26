import React, { FC, useState } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ConfirmActionMessage from '@kubevirt-utils/components/ConfirmActionMessage/ConfirmActionMessage';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { deleteNetworkInterface } from '@kubevirt-utils/components/NetworkInterfaceModal/utils/helpers';
import { NetworkInterfaceState } from '@kubevirt-utils/components/NetworkInterfaceModal/utils/types';
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
import {
  getInterfaceState,
  isSRIOVInterface,
  setNetworkInterfaceState,
} from '@virtualmachines/details/tabs/configuration/network/utils/utils';
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
  const deleteBtnText = t('Delete');

  const isHotPlugNIC = Boolean(nicPresentation?.iface?.bridge);

  const interfaceState = getInterfaceState(vm, nicName);
  const isSRIOVIface = isSRIOVInterface(vm, nicName);

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
        headerText={t('Delete NIC?')}
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
        isDisabled: interfaceState === NetworkInterfaceState.ABSENT,
        isExpanded: isDropdownOpen,
        onClick: onToggle,
      })}
      isOpen={isDropdownOpen}
      onOpenChange={setIsDropdownOpen}
      onSelect={() => setIsDropdownOpen(false)}
      popperProps={{ position: 'right' }}
    >
      <DropdownList>
        {interfaceState === NetworkInterfaceState.DOWN ? (
          <DropdownItem
            isDisabled={isSRIOVIface}
            key="network-interface-state-up"
            onClick={() => setNetworkInterfaceState(vm, nicName, NetworkInterfaceState.UP)}
          >
            {t('Set link up')}
          </DropdownItem>
        ) : (
          <DropdownItem
            description={isSRIOVIface && t('Not available for SR-IOV interfaces')}
            isDisabled={isSRIOVIface}
            key="network-interface-state-down"
            onClick={() => setNetworkInterfaceState(vm, nicName, NetworkInterfaceState.DOWN)}
          >
            {t('Set link down')}
          </DropdownItem>
        )}
        <DropdownItem key="network-interface-edit" onClick={onEditModalOpen}>
          {t('Edit')}
        </DropdownItem>
        <DropdownItem key="network-interface-delete" onClick={onDeleteModalOpen}>
          {deleteBtnText}
        </DropdownItem>
      </DropdownList>
    </Dropdown>
  );
};

export default NetworkInterfaceActions;
