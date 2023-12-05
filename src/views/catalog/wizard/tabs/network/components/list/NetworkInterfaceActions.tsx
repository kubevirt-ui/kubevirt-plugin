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
  Alert,
  AlertVariant,
  ButtonVariant,
  Dropdown,
  DropdownItem,
  DropdownPosition,
  KebabToggle,
} from '@patternfly/react-core';

import WizardEditNetworkInterfaceModal from '../modal/WizardEditNetworkInterfaceModal';

type NetworkInterfaceActionsProps = {
  nicName: string;
  nicPresentation: NetworkPresentation;
};

const NetworkInterfaceActions: React.FC<NetworkInterfaceActionsProps> = ({
  nicName,
  nicPresentation,
}) => {
  const { t } = useKubevirtTranslation();
  const { updateVM, vm } = useWizardVMContext();
  const { createModal } = useModal();

  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const label = t('Delete NIC?');
  const editBtnText = t('Edit');
  const submitBtnText = t('Delete');

  const onEditModalOpen = () => {
    createModal(({ isOpen, onClose }) => (
      <WizardEditNetworkInterfaceModal
        isOpen={isOpen}
        nicPresentation={nicPresentation}
        onClose={onClose}
        updateVM={updateVM}
        vm={vm}
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
        headerText={label}
        isOpen={isOpen}
        obj={vm}
        onClose={onClose}
        onSubmit={onDelete}
        submitBtnText={submitBtnText}
        submitBtnVariant={ButtonVariant.danger}
      >
        <span>
          <Alert
            title={t(
              'Deleting a network interface is supported only on VirtualMachines that were created in versions greater than 4.13 or for network interfaces that were added to the VirtualMachine in these versions.',
            )}
            component={'h6'}
            isInline
            variant={AlertVariant.warning}
          />
          <br />
          <ConfirmActionMessage
            obj={{ metadata: { name: nicName, namespace: vm?.metadata?.namespace } }}
          />
        </span>
      </TabModal>
    ));
    setIsDropdownOpen(false);
  };

  const items = [
    <DropdownItem key="network-interface-edit" onClick={onEditModalOpen}>
      {editBtnText}
    </DropdownItem>,
    <DropdownItem key="network-interface-delete" onClick={onDeleteModalToggle}>
      {submitBtnText}
    </DropdownItem>,
  ];

  return (
    <>
      <Dropdown
        dropdownItems={items}
        isOpen={isDropdownOpen}
        isPlain
        menuAppendTo={getContentScrollableElement}
        onSelect={() => setIsDropdownOpen(false)}
        position={DropdownPosition.right}
        toggle={<KebabToggle id="toggle-id-6" onToggle={setIsDropdownOpen} />}
      />
    </>
  );
};

export default NetworkInterfaceActions;
