import * as React from 'react';
import { Trans } from 'react-i18next';

import { produceVMNetworks, useWizardVMContext } from '@catalog/utils/WizardVMContext';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NetworkPresentation } from '@kubevirt-utils/resources/vm/utils/network/constants';
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
  const { vm, updateVM } = useWizardVMContext();

  const { t } = useKubevirtTranslation();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const label = t('Delete {{nicName}} NIC', { nicName });
  const editBtnText = t('Edit');
  const submitBtnText = t('Delete');

  const onEditModalOpen = () => {
    setIsEditModalOpen(true);
    setIsDropdownOpen(false);
  };

  const onDeleteModalToggle = () => {
    setIsDeleteModalOpen(true);
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

  return (
    <>
      <Dropdown
        onSelect={() => setIsDropdownOpen(false)}
        toggle={<KebabToggle onToggle={setIsDropdownOpen} id="toggle-id-6" />}
        isOpen={isDropdownOpen}
        isPlain
        dropdownItems={items}
        position={DropdownPosition.right}
      />
      {isDeleteModalOpen && (
        <TabModal<V1VirtualMachine>
          onClose={() => setIsDeleteModalOpen(false)}
          isOpen={isDeleteModalOpen}
          obj={vm}
          onSubmit={onDelete}
          headerText={label}
          submitBtnText={submitBtnText}
          submitBtnVariant={ButtonVariant.danger}
        >
          <Trans t={t}>
            Are you sure you want to delete <strong>{nicName} </strong>
          </Trans>
        </TabModal>
      )}
      {isEditModalOpen && (
        <EditNetworkInterfaceModal
          vm={vm}
          updateVM={updateVM}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          nicPresentation={nicPresentation}
        />
      )}
    </>
  );
};

export default NetworkInterfaceActions;
