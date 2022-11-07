import * as React from 'react';

import { produceVMNetworks, useWizardVMContext } from '@catalog/utils/WizardVMContext';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ConfirmActionMessage from '@kubevirt-utils/components/ConfirmActionMessage/ConfirmActionMessage';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NetworkPresentation } from '@kubevirt-utils/resources/vm/utils/network/constants';
import { getContentScrollableElement } from '@kubevirt-utils/utils/utils';
import {
  ButtonVariant,
  Dropdown,
  DropdownItem,
  DropdownPosition,
  KebabToggle,
} from '@patternfly/react-core';

import EditNetworkInterfaceModal from '../modal/EditNetworkInterfaceModal';

type NetworkInterfaceActionsProps = {
  nicName: string;
  nicPresentation: NetworkPresentation;
};

const NetworkInterfaceActions: React.FC<NetworkInterfaceActionsProps> = ({
  nicName,
  nicPresentation,
}) => {
  const { t } = useKubevirtTranslation();
  const { vm, updateVM } = useWizardVMContext();
  const { createModal } = useModal();

  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const label = t('Delete NIC?');
  const editBtnText = t('Edit');
  const submitBtnText = t('Delete');

  const onEditModalOpen = () => {
    createModal(({ isOpen, onClose }) => (
      <EditNetworkInterfaceModal
        vm={vm}
        updateVM={updateVM}
        isOpen={isOpen}
        onClose={onClose}
        nicPresentation={nicPresentation}
      />
    ));

    setIsDropdownOpen(false);
  };

  const onDelete = React.useCallback(() => {
    const updatedVM = produceVMNetworks(vm, (draftVM) => {
      draftVM.spec.template.spec.networks = draftVM.spec.template.spec.networks.filter(
        ({ name }) => name !== nicName,
      );
      draftVM.spec.template.spec.domain.devices.interfaces =
        draftVM.spec.template.spec.domain.devices.interfaces.filter(({ name }) => name !== nicName);
    });
    return updateVM(updatedVM);
  }, [nicName, updateVM, vm]);

  const onDeleteModalToggle = () => {
    createModal(({ isOpen, onClose }) => (
      <TabModal<V1VirtualMachine>
        isOpen={isOpen}
        onClose={onClose}
        obj={vm}
        onSubmit={onDelete}
        headerText={label}
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

  const items = [
    <DropdownItem onClick={onEditModalOpen} key="network-interface-edit">
      {editBtnText}
    </DropdownItem>,
    <DropdownItem onClick={onDeleteModalToggle} key="network-interface-delete">
      {submitBtnText}
    </DropdownItem>,
  ];

  return (
    <>
      <Dropdown
        menuAppendTo={getContentScrollableElement}
        onSelect={() => setIsDropdownOpen(false)}
        toggle={<KebabToggle onToggle={setIsDropdownOpen} id="toggle-id-6" />}
        isOpen={isDropdownOpen}
        isPlain
        dropdownItems={items}
        position={DropdownPosition.right}
      />
    </>
  );
};

export default NetworkInterfaceActions;
