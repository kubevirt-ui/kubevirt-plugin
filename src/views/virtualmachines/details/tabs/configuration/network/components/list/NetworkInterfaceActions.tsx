/* eslint-disable */
import React, { FC, useState } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import KebabToggle from '@kubevirt-utils/components/toggles/KebabToggle';
import useFQDN from '@kubevirt-utils/hooks/useFQDN/useFQDN';
import useIsFQDNEnabled from '@kubevirt-utils/hooks/useFQDN/useIsFQDNEnabled';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { type NetworkPresentation } from '@kubevirt-utils/resources/vm/utils/network/constants';
import { getNetworkInterface } from '@kubevirt-utils/resources/vm/utils/network/selectors';
import { NetworkInterfaceState } from '@kubevirt-utils/resources/vm/utils/network/types';
import { getContentScrollableElement } from '@kubevirt-utils/utils/utils';
import { Dropdown, DropdownItem, DropdownList, Tooltip } from '@patternfly/react-core';
import { CopyIcon } from '@patternfly/react-icons';
import {
  getConfigInterfaceStateFromVM,
  setNetworkInterfaceState,
} from '@virtualmachines/details/tabs/configuration/network/utils/utils';

import VirtualMachinesEditNetworkInterfaceModal from '../modal/VirtualMachinesEditNetworkInterfaceModal';
import NetworkInterfaceDeleteModal from './NetworkInterfaceDeleteModal';

type NetworkInterfaceActionsProps = {
  isAutoAttached?: boolean;
  nicName: string;
  nicPresentation: NetworkPresentation;
  vm: V1VirtualMachine;
};

const NetworkInterfaceActions: FC<NetworkInterfaceActionsProps> = ({
  isAutoAttached,
  nicName,
  nicPresentation,
  vm,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const interfaceState = getConfigInterfaceStateFromVM(vm, nicName);
  const isInterfaceMissing = !getNetworkInterface(vm, nicName);
  const fqdn = useFQDN(nicName, vm);
  const isFQDNEnabled = useIsFQDNEnabled();

  const onEditModalOpen = (): void => {
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

  const onDeleteModalOpen = (): void => {
    createModal(({ isOpen, onClose }) => (
      <NetworkInterfaceDeleteModal
        isHotPlugNIC={Boolean(nicPresentation?.iface?.bridge)}
        isOpen={isOpen}
        nicName={nicName}
        nicPresentation={nicPresentation}
        onClose={onClose}
        vm={vm}
      />
    ));
    setIsDropdownOpen(false);
  };

  const dropdown = (
    <Dropdown
      isOpen={isDropdownOpen}
      onOpenChange={setIsDropdownOpen}
      onSelect={() => setIsDropdownOpen(false)}
      popperProps={{ appendTo: getContentScrollableElement, position: 'right' }}
      toggle={KebabToggle({
        'data-test': `nic-actions-${nicName}`,
        id: `nic-actions-${nicName}`,
        isDisabled: interfaceState === NetworkInterfaceState.ABSENT || isInterfaceMissing,
        isExpanded: isDropdownOpen,
        onClick: () => setIsDropdownOpen((prevIsOpen) => !prevIsOpen),
      })}
    >
      <DropdownList>
        {interfaceState === NetworkInterfaceState.DOWN && (
          <DropdownItem
            key="network-interface-state-up"
            onClick={() => setNetworkInterfaceState(vm, nicName, NetworkInterfaceState.UP)}
          >
            {t('Set link up')}
          </DropdownItem>
        )}
        {interfaceState === NetworkInterfaceState.UP && (
          <DropdownItem
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
        <DropdownItem data-test="network-interface-edit" onClick={onEditModalOpen}>
          {t('Edit')}
        </DropdownItem>
        <DropdownItem onClick={onDeleteModalOpen}>{t('Delete')}</DropdownItem>
      </DropdownList>
    </Dropdown>
  );

  return isAutoAttached ? (
    <Tooltip
      content={t(
        'This interface is auto-attached and cannot be edited. Stop the virtual machine to detach it.',
      )}
    >
      <span>{dropdown}</span>
    </Tooltip>
  ) : (
    dropdown
  );
};

export default NetworkInterfaceActions;
