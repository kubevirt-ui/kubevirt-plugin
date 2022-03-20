import * as React from 'react';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import TabModal, { DeleteResourceMessege } from '@kubevirt-utils/components/TabModal/TabModal';
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

import EditNetworkInterfaceModal from '../modal/EditNetworkInterfaceModal';
import { updateVMNetworkInterface } from '../modal/utils/helpers';

type NetworkInterfaceActionsProps = {
  vm: V1VirtualMachine;
  nicName: string;
  nicPresentation: NetworkPresentation;
};

const NetworkInterfaceActions: React.FC<NetworkInterfaceActionsProps> = ({
  vm,
  nicName,
  nicPresentation,
}) => {
  const { t } = useKubevirtTranslation();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const deleteModalHeader = t('Delete {{nicName}} NIC', { nicName });
  const editBtnText = t('Edit');
  const deleteBtnText = t('Delete');

  const onEditModalOpen = () => {
    setIsEditModalOpen(true);
    setIsDropdownOpen(false);
  };

  const onDeleteModalOpen = () => {
    setIsDeleteModalOpen(true);
    setIsDropdownOpen(false);
  };

  const items = [
    <DropdownItem onClick={onEditModalOpen} key="network-interface-edit">
      {editBtnText}
    </DropdownItem>,
    <DropdownItem onClick={onDeleteModalOpen} key="network-interface-delete">
      {deleteBtnText}
    </DropdownItem>,
  ];

  const resultVirtualMachine = React.useMemo(() => {
    const networks = getNetworks(vm)?.filter(({ name }) => name !== nicName);
    const interfaces = getInterfaces(vm)?.filter(({ name }) => name !== nicName);

    return updateVMNetworkInterface(vm, networks, interfaces);
  }, [nicName, vm]);
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
          obj={resultVirtualMachine}
          onSubmit={(obj) =>
            k8sUpdate({
              model: VirtualMachineModel,
              data: obj,
              ns: obj?.metadata?.namespace,
              name: obj?.metadata?.name,
            })
          }
          headerText={deleteModalHeader}
          submitBtnText={deleteBtnText}
          submitBtnVariant={ButtonVariant.danger}
        >
          <DeleteResourceMessege obj={{ metadata: { name: nicName } }} />
        </TabModal>
      )}
      {isEditModalOpen && (
        <EditNetworkInterfaceModal
          vm={vm}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          nicPresentation={nicPresentation}
        />
      )}
    </>
  );
};

export default NetworkInterfaceActions;
