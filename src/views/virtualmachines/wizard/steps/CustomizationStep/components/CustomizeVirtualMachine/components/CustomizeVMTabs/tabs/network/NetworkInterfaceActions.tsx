import React, { FC, useCallback, useState } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import ConfirmActionMessage from '@kubevirt-utils/components/ConfirmActionMessage/ConfirmActionMessage';
import { produceVMNetworks } from '@kubevirt-utils/components/DiskModal/utils/helpers';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import KebabToggle from '@kubevirt-utils/components/toggles/KebabToggle';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getInterfaces, getNetworks } from '@kubevirt-utils/resources/vm';
import { NetworkPresentation } from '@kubevirt-utils/resources/vm/utils/network/constants';
import {
  getConfigInterfaceStateFromVM,
  isSRIOVNetworkByVM,
} from '@kubevirt-utils/resources/vm/utils/network/selectors';
import { NetworkInterfaceState } from '@kubevirt-utils/resources/vm/utils/network/types';
import { ButtonVariant, Dropdown, DropdownItem, DropdownList } from '@patternfly/react-core';

import { setInterfaceLinkState } from './utils';
import WizardEditNetworkInterfaceModal from './WizardEditNetworkInterfaceModal';

type NetworkInterfaceActionsProps = {
  nicName: string;
  nicPresentation: NetworkPresentation;
  onUpdateVM?: (updateVM: V1VirtualMachine) => Promise<void>;
  vm: V1VirtualMachine;
};

const NetworkInterfaceActions: FC<NetworkInterfaceActionsProps> = ({
  nicName,
  nicPresentation,
  onUpdateVM,
  vm,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const interfaceState = getConfigInterfaceStateFromVM(vm, nicName);
  const isSRIOVIface = isSRIOVNetworkByVM(vm, nicName);

  const onEditModalOpen = () => {
    createModal(({ isOpen, onClose }) => (
      <WizardEditNetworkInterfaceModal
        isOpen={isOpen}
        nicPresentation={nicPresentation}
        onClose={onClose}
        updateVM={onUpdateVM}
        vm={vm}
      />
    ));
    setIsDropdownOpen(false);
  };

  const onDelete = useCallback(() => {
    const updatedVM = produceVMNetworks(vm, (draftVM) => {
      draftVM.spec.template.spec.networks = getNetworks(draftVM)?.filter(
        ({ name }) => name !== nicName,
      );
      draftVM.spec.template.spec.domain.devices.interfaces = getInterfaces(draftVM)?.filter(
        ({ name }) => name !== nicName,
      );
    });
    return onUpdateVM(updatedVM);
  }, [nicName, onUpdateVM, vm]);

  const onDeleteModalToggle = () => {
    createModal(({ isOpen, onClose }) => (
      <TabModal<V1VirtualMachine>
        headerText={t('Delete NIC?')}
        isOpen={isOpen}
        obj={vm}
        onClose={onClose}
        onSubmit={onDelete}
        submitBtnText={t('Delete')}
        submitBtnVariant={ButtonVariant.danger}
      >
        <ConfirmActionMessage
          obj={{ metadata: { name: nicName, namespace: vm?.metadata?.namespace } }}
        />
      </TabModal>
    ));
    setIsDropdownOpen(false);
  };

  const onToggle = () => setIsDropdownOpen((prev) => !prev);

  return (
    <Dropdown
      isOpen={isDropdownOpen}
      onOpenChange={setIsDropdownOpen}
      onSelect={() => setIsDropdownOpen(false)}
      popperProps={{ position: 'right' }}
      toggle={KebabToggle({ id: 'toggle-id-network', onClick: onToggle })}
    >
      <DropdownList>
        {interfaceState === NetworkInterfaceState.DOWN && (
          <DropdownItem
            isDisabled={isSRIOVIface}
            key="network-interface-state-up"
            onClick={() => onUpdateVM(setInterfaceLinkState(vm, nicName, NetworkInterfaceState.UP))}
          >
            {t('Set link up')}
          </DropdownItem>
        )}
        {interfaceState === NetworkInterfaceState.UP && (
          <DropdownItem
            onClick={() =>
              onUpdateVM(setInterfaceLinkState(vm, nicName, NetworkInterfaceState.DOWN))
            }
            description={isSRIOVIface && t('Not available for SR-IOV interfaces')}
            isDisabled={isSRIOVIface}
            key="network-interface-state-down"
          >
            {t('Set link down')}
          </DropdownItem>
        )}
        <DropdownItem key="network-interface-edit" onClick={onEditModalOpen}>
          {t('Edit')}
        </DropdownItem>
        <DropdownItem key="network-interface-delete" onClick={onDeleteModalToggle}>
          {t('Delete')}
        </DropdownItem>
      </DropdownList>
    </Dropdown>
  );
};

export default NetworkInterfaceActions;
