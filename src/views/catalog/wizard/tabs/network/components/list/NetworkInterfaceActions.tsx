import React, { FC, useCallback, useState } from 'react';

import { produceVMNetworks, useWizardVMContext } from '@catalog/utils/WizardVMContext';
import { setInterfaceLinkState } from '@catalog/wizard/tabs/network/utils/utils';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ConfirmActionMessage from '@kubevirt-utils/components/ConfirmActionMessage/ConfirmActionMessage';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import KebabToggle from '@kubevirt-utils/components/toggles/KebabToggle';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getInterfaces, getNetworks } from '@kubevirt-utils/resources/vm';
import { NetworkPresentation } from '@kubevirt-utils/resources/vm/utils/network/constants';
import { hasAutoAttachedPodNetwork } from '@kubevirt-utils/resources/vm/utils/network/selectors';
import { NetworkInterfaceState } from '@kubevirt-utils/resources/vm/utils/network/types';
import { ButtonVariant, Dropdown, DropdownItem, DropdownList } from '@patternfly/react-core';
import {
  getConfigInterfaceStateFromVM,
  isSRIOVNetworkByVM,
} from '@virtualmachines/details/tabs/configuration/network/utils/utils';

import WizardEditNetworkInterfaceModal from '../modal/WizardEditNetworkInterfaceModal';

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
  const { updateVM } = useWizardVMContext();
  const { createModal } = useModal();
  const onUpdate = onUpdateVM || updateVM;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const label = t('Delete NIC?');
  const editBtnText = t('Edit');
  const submitBtnText = t('Delete');
  const interfaceState = getConfigInterfaceStateFromVM(vm, nicName);
  const isSRIOVIface = isSRIOVNetworkByVM(vm, nicName);

  const onEditModalOpen = () => {
    createModal(({ isOpen, onClose }) => (
      <WizardEditNetworkInterfaceModal
        isOpen={isOpen}
        nicPresentation={nicPresentation}
        onClose={onClose}
        updateVM={onUpdate}
        vm={vm}
      />
    ));

    setIsDropdownOpen(false);
  };

  const onDelete = useCallback(() => {
    const updatedVM = produceVMNetworks(vm, (draftVM) => {
      const vmInterfaces = getInterfaces(draftVM);

      const isExistingNetwork = getNetworks(draftVM)?.find(({ name }) => name === nicName);
      const isPodNetwork = nicPresentation?.network?.pod;
      if (!isExistingNetwork && hasAutoAttachedPodNetwork(draftVM) && isPodNetwork) {
        // artificial pod network added only to the table but missing in the vm
        draftVM.spec.template.spec.domain.devices.autoattachPodInterface = false;
      }

      draftVM.spec.template.spec.networks = getNetworks(draftVM)?.filter(
        ({ name }) => name !== nicName,
      );
      draftVM.spec.template.spec.domain.devices.interfaces = vmInterfaces?.filter(
        ({ name }) => name !== nicName,
      );
    });
    return onUpdate(updatedVM);
  }, [nicName, onUpdate, vm]);

  const onDeleteModalToggle = () => {
    createModal(({ isOpen, onClose }) => (
      <TabModal<V1VirtualMachine>
        headerText={label}
        isOpen={isOpen}
        obj={vm}
        onClose={onClose}
        onSubmit={onDelete}
        submitBtnText={submitBtnText}
        submitBtnVariant={ButtonVariant.danger}
      >
        <ConfirmActionMessage
          obj={{ metadata: { name: nicName, namespace: vm?.metadata?.namespace } }}
        />
      </TabModal>
    ));
    setIsDropdownOpen(false);
  };

  const onToggle = () => setIsDropdownOpen((prevIsOpen) => !prevIsOpen);
  return (
    <Dropdown
      isOpen={isDropdownOpen}
      onOpenChange={setIsDropdownOpen}
      onSelect={() => setIsDropdownOpen(false)}
      popperProps={{ position: 'right' }}
      toggle={KebabToggle({ id: 'toggle-id-network', onClick: onToggle })}
    >
      {interfaceState === NetworkInterfaceState.DOWN && (
        <DropdownItem
          isDisabled={isSRIOVIface}
          key="network-interface-state-up"
          onClick={() => onUpdate(setInterfaceLinkState(vm, nicName, NetworkInterfaceState.UP))}
        >
          {t('Set link up')}
        </DropdownItem>
      )}
      {interfaceState === NetworkInterfaceState.UP && (
        <DropdownItem
          description={isSRIOVIface && t('Not available for SR-IOV interfaces')}
          isDisabled={isSRIOVIface}
          key="network-interface-state-down"
          onClick={() => onUpdate(setInterfaceLinkState(vm, nicName, NetworkInterfaceState.DOWN))}
        >
          {t('Set link down')}
        </DropdownItem>
      )}
      <DropdownList>
        <DropdownItem key="network-interface-edit" onClick={onEditModalOpen}>
          {editBtnText}
        </DropdownItem>
        <DropdownItem key="network-interface-delete" onClick={onDeleteModalToggle}>
          {submitBtnText}
        </DropdownItem>
      </DropdownList>
    </Dropdown>
  );
};

export default NetworkInterfaceActions;
