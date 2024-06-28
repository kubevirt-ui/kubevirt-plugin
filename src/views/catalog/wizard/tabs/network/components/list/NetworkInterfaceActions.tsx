import React, { FC, useCallback, useState } from 'react';

import { produceVMNetworks, useWizardVMContext } from '@catalog/utils/WizardVMContext';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ConfirmActionMessage from '@kubevirt-utils/components/ConfirmActionMessage/ConfirmActionMessage';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import KebabToggle from '@kubevirt-utils/components/toggles/KebabToggle';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getInterfaces, getNetworks } from '@kubevirt-utils/resources/vm';
import { NetworkPresentation } from '@kubevirt-utils/resources/vm/utils/network/constants';
import { vmSignal } from '@kubevirt-utils/store/customizeInstanceType';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { ButtonVariant, Dropdown, DropdownItem, DropdownList } from '@patternfly/react-core';

import WizardEditNetworkInterfaceModal from '../modal/WizardEditNetworkInterfaceModal';

type NetworkInterfaceActionsProps = {
  nicName: string;
  nicPresentation: NetworkPresentation;
  onUpdateVM?: (updateVM: V1VirtualMachine) => Promise<void>;
};

const NetworkInterfaceActions: FC<NetworkInterfaceActionsProps> = ({
  nicName,
  nicPresentation,
  onUpdateVM,
}) => {
  const { t } = useKubevirtTranslation();
  const { updateVM, vm: vmContext } = useWizardVMContext();
  const { createModal } = useModal();
  const vm = vmSignal.value || vmContext;
  const onUpdate = onUpdateVM || updateVM;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const label = t('Delete NIC?');
  const editBtnText = t('Edit');
  const submitBtnText = t('Delete');

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
      if (isEmpty(vmInterfaces)) {
        draftVM.spec.template.spec.domain.devices.autoattachPodInterface = false;
        return;
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
      onOpenChange={(open: boolean) => setIsDropdownOpen(open)}
      onSelect={() => setIsDropdownOpen(false)}
      toggle={KebabToggle({ id: 'toggle-id-network', onClick: onToggle })}
    >
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
