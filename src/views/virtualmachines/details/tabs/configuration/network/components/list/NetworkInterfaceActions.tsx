import * as React from 'react';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ConfirmActionMessage from '@kubevirt-utils/components/ConfirmActionMessage/ConfirmActionMessage';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { updateVMNetworkInterface } from '@kubevirt-utils/components/NetworkInterfaceModal/utils/helpers';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getInterfaces, getNetworks } from '@kubevirt-utils/resources/vm';
import { NetworkPresentation } from '@kubevirt-utils/resources/vm/utils/network/constants';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import {
  ButtonVariant,
  Dropdown,
  DropdownItem,
  DropdownPosition,
  KebabToggle,
} from '@patternfly/react-core';

import VirtualMachinesEditNetworkInterfaceModal from '../modal/VirtualMachinesEditNetworkInterfaceModal';

type NetworkInterfaceActionsProps = {
  nicName: string;
  nicPresentation: NetworkPresentation;
  vm: V1VirtualMachine;
};

const NetworkInterfaceActions: React.FC<NetworkInterfaceActionsProps> = ({
  nicName,
  nicPresentation,
  vm,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const deleteModalHeader = t('Delete NIC?');
  const editBtnText = t('Edit');
  const deleteBtnText = t('Delete');

  const resultVirtualMachine = React.useMemo(() => {
    const networks = getNetworks(vm)?.filter(({ name }) => name !== nicName);
    const interfaces = getInterfaces(vm)?.filter(({ name }) => name !== nicName);

    return updateVMNetworkInterface(vm, networks, interfaces);
  }, [nicName, vm]);

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
        onSubmit={(obj) =>
          k8sUpdate({
            data: obj,
            model: VirtualMachineModel,
            name: obj?.metadata?.name,
            ns: obj?.metadata?.namespace,
          })
        }
        headerText={deleteModalHeader}
        isOpen={isOpen}
        obj={resultVirtualMachine}
        onClose={onClose}
        submitBtnText={deleteBtnText}
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
    <DropdownItem key="network-interface-edit" onClick={onEditModalOpen}>
      {editBtnText}
    </DropdownItem>,
    <DropdownItem key="network-interface-delete" onClick={onDeleteModalOpen}>
      {deleteBtnText}
    </DropdownItem>,
  ];

  return (
    <>
      <Dropdown
        dropdownItems={items}
        isOpen={isDropdownOpen}
        isPlain
        onSelect={() => setIsDropdownOpen(false)}
        position={DropdownPosition.right}
        toggle={<KebabToggle id="toggle-id-6" onToggle={setIsDropdownOpen} />}
      />
    </>
  );
};

export default NetworkInterfaceActions;
