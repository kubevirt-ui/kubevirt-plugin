import React, { FC, useState } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ConfirmActionMessage from '@kubevirt-utils/components/ConfirmActionMessage/ConfirmActionMessage';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { deleteNetworkInterface } from '@kubevirt-utils/components/NetworkInterfaceModal/utils/helpers';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import KebabToggle from '@kubevirt-utils/components/toggles/KebabToggle';
import useFQDN from '@kubevirt-utils/hooks/useFQDN/useFQDN';
import useIsFQDNEnabled from '@kubevirt-utils/hooks/useFQDN/useIsFQDNEnabled';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NetworkPresentation } from '@kubevirt-utils/resources/vm/utils/network/constants';
import { getNetworkInterface } from '@kubevirt-utils/resources/vm/utils/network/selectors';
import { NetworkInterfaceState } from '@kubevirt-utils/resources/vm/utils/network/types';
import {
  Alert,
  AlertVariant,
  ButtonVariant,
  Dropdown,
  DropdownItem,
  DropdownList,
} from '@patternfly/react-core';
import { CopyIcon } from '@patternfly/react-icons';
import {
  getConfigInterfaceStateFromVM,
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

  const interfaceState = getConfigInterfaceStateFromVM(vm, nicName);

  const isInterfaceMissing = !getNetworkInterface(vm, nicName);

  const fqdn = useFQDN(nicName, vm);
  const isFQDNEnabled = useIsFQDNEnabled();

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
        isDisabled: interfaceState === NetworkInterfaceState.ABSENT || isInterfaceMissing,
        isExpanded: isDropdownOpen,
        onClick: onToggle,
      })}
      isOpen={isDropdownOpen}
      onOpenChange={setIsDropdownOpen}
      onSelect={() => setIsDropdownOpen(false)}
      popperProps={{ position: 'right' }}
    >
      <DropdownList>
        {interfaceState === NetworkInterfaceState.DOWN && (
          <DropdownItem
            data-test-id="set-link-up"
            key="network-interface-state-up"
            onClick={() => setNetworkInterfaceState(vm, nicName, NetworkInterfaceState.UP)}
          >
            {t('Set link up')}
          </DropdownItem>
        )}
        {interfaceState === NetworkInterfaceState.UP && (
          <DropdownItem
            data-test-id="set-link-down"
            key="network-interface-state-down"
            onClick={() => setNetworkInterfaceState(vm, nicName, NetworkInterfaceState.DOWN)}
          >
            {t('Set link down')}
          </DropdownItem>
        )}
        {isFQDNEnabled && fqdn && (
          <DropdownItem
            icon={<CopyIcon />}
            key="network-interface-copy-fqdn"
            onClick={() => navigator.clipboard.writeText(fqdn)}
          >
            {t('Copy FQDN')}
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
